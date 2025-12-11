import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View, Text, useWindowDimensions, ActivityIndicator } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { getItem } from "../../services/secureStore";
import { baseFetch, baseGetById } from "../../services/baseCall";

// Configuração do Calendário
LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: "Hoje"
};
LocaleConfig.defaultLocale = 'br';

// --- HELPERS DE DATA ---

const getIsoDateStr = (dateInput: any): string => {
  if (!dateInput) return "";
  try {
    if (dateInput instanceof Date) {
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(dateInput).split('T')[0];
  } catch (e) { return ""; }
};

const formatIsoToLocalDate = (isoDate: string | null) => {
  if (!isoDate) return "";
  return isoDate.split('T')[0];
};

const extractTime = (isoTime: string | null) => {
  if (!isoTime) return "";
  try {
    const date = new Date(isoTime);
    const hours = String(date.getUTCHours()).padStart(2, '0'); // UTC para manter 1970 consistente
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (e) { return ""; }
};

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  quantity: number;
  unit: string;
  mealAlimentId: number; // ID da relação
}

interface MealGroup {
  meal_id: number;
  meal_name: string;
  timeRaw: string;
  displayTime: string;
  foods: FoodItem[];
  totalCalories: number;
}

export default function SeeCalendar() {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINTS.MOBILE;

  const [selectedDate, setSelectedDate] = useState(getIsoDateStr(new Date()));
  const [isLoading, setIsLoading] = useState(false);

  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [groupedMeals, setGroupedMeals] = useState<MealGroup[]>([]);

  // --- 1. CARREGAR PLANO ATIVO ---
  const fetchInitialData = async () => {
    const idStr = await getItem('id');
    if (!idStr) return;
    const uid = Number(idStr);

    const plansRes = await baseFetch(`mealPlans?user_id=${uid}`);
    const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];
    const active = userPlans.find((p: any) => p.active) || userPlans[0];

    if (active) {
      setActivePlanId(active.plan_id);
    }
  };

  // --- 2. BUSCAR REFEIÇÕES E ALIMENTOS PARA O DIA ---
  const fetchDailyPlan = useCallback(async () => {
    if (!activePlanId || !selectedDate) return;

    setIsLoading(true);
    try {
      // A. Busca todas as refeições (Meals) do plano
      const mealsRes = await baseFetch(`meals?plan_id=${activePlanId}`);
      const allMeals = Array.isArray(mealsRes?.data) ? mealsRes?.data : [];

      // B. Filtra quais refeições aparecem na data selecionada
      const filteredMeals = allMeals.filter((meal: any) => {
        const createdYmd = formatIsoToLocalDate(meal.created_at);
        const isRecurring = meal.time && String(meal.time).includes('1970');

        // Regra 1: Recorrente (1970) -> Aparece sempre
        if (isRecurring) return true;

        // Regra 2: Data Específica -> Compara created_at com selectedDate
        return createdYmd === selectedDate;
      });

      // C. Para cada refeição filtrada, busca os alimentos (MealAliments)
      const mealsWithFoods = await Promise.all(filteredMeals.map(async (meal: any) => {
        try {
          // Busca os itens desta refeição específica
          // Rota sugerida: mealAliments?meal_id=X
          // Se sua API não suportar filtro, precisará buscar tudo e filtrar aqui.
          // Vou assumir que suporta filtro ou retorna array para filtrar.
          const maRes = await baseFetch(`mealAliments?meal_id=${meal.meal_id}`);
          // Fallback: se a API retornar tudo sem filtrar, filtramos manualmente
          const allMa = Array.isArray(maRes?.data) ? maRes?.data : [];
          const mealAliments = allMa.filter((ma: any) => String(ma.meal_id) === String(meal.meal_id));

          // Hidrata com os dados do Alimento (Nome, Calorias)
          const foodsDetails = await Promise.all(mealAliments.map(async (ma: any) => {
            try {
              const alimRes = await baseGetById('aliments', ma.aliment_id);
              const alim = alimRes?.data || {};

              const qty = Number(ma.quantity) || 0;
              const ratio = qty / 100;
              const cals = (Number(alim.calories_100g) || 0) * ratio;

              return {
                id: ma.aliment_id,
                mealAlimentId: ma.meal_aliment_id,
                name: alim.name || "Item Carregando...",
                quantity: qty,
                unit: ma.measurement_unit || 'g',
                calories: Math.round(cals)
              } as FoodItem;
            } catch (e) { return null; }
          }));

          const validFoods = foodsDetails.filter(f => f !== null) as FoodItem[];

          return {
            meal_id: meal.meal_id,
            meal_name: meal.meal_name,
            timeRaw: meal.time || "23:59:59",
            displayTime: extractTime(meal.time),
            foods: validFoods,
            totalCalories: validFoods.reduce((acc, f) => acc + f.calories, 0)
          };

        } catch (e) {
          console.log("Erro ao buscar alimentos da refeição", meal.meal_id);
          return null;
        }
      }));

      const finalGroups = mealsWithFoods.filter(g => g !== null) as MealGroup[];

      // Ordena por horário
      finalGroups.sort((a, b) => {
        if (a.timeRaw < b.timeRaw) return -1;
        if (a.timeRaw > b.timeRaw) return 1;
        return 0;
      });

      setGroupedMeals(finalGroups);

    } catch (error) {
      console.error("Erro ao carregar plano do dia:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activePlanId, selectedDate]);

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (activePlanId) {
      fetchDailyPlan();
    }
  }, [selectedDate, activePlanId, fetchDailyPlan]);

  const markedDates = useMemo(() => {
    return {
      [selectedDate]: { selected: true, selectedColor: COLORS.primary, selectedTextColor: '#FFF' }
    };
  }, [selectedDate]);


  return (
    <View style={styles.safeArea}>
      <ScrollView style={[styles.scrollView, !isMobile && styles.scrollViewDesktop]} contentContainerStyle={styles.container}>

        {/* CALENDÁRIO */}
        <View style={styles.calendarCard}>
          <Text style={styles.headerTitle}>Planejamento Alimentar</Text>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "bold",
              arrowColor: COLORS.primary,
              todayTextColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
            }}
          />
        </View>

        {/* DATA SELECIONADA */}
        <Text style={styles.dateLabel}>
          {new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {/* LISTA DE REFEIÇÕES DO DIA */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : groupedMeals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nada planejado para este dia.</Text>
          </View>
        ) : (
          groupedMeals.map((mealGroup) => (
            <View key={mealGroup.meal_id} style={styles.mealSection}>

              {/* HEADER DA REFEIÇÃO */}
              <View style={styles.mealHeaderRow}>
                <View style={styles.leftHeader}>
                  <MaterialCommunityIcons name="food-variant" size={20} color={COLORS.primary} />
                  <View>
                    <Text style={styles.mealTitle}>{mealGroup.meal_name}</Text>
                    {mealGroup.displayTime && mealGroup.displayTime !== "00:00" ? (
                      <Text style={styles.mealTimeLabel}>{mealGroup.displayTime}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.rightHeader}>
                  <Text style={styles.mealCalories}>{mealGroup.totalCalories} kcal</Text>
                </View>
              </View>

              {/* LISTA DE ALIMENTOS */}
              <View style={styles.foodList}>
                {mealGroup.foods.length === 0 ? (
                  <Text style={styles.emptyFoodText}>—</Text>
                ) : (
                  mealGroup.foods.map((food, index) => (
                    <View key={`${food.id}-${index}`} style={styles.foodItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodDetail}>{food.quantity}{food.unit} • {food.calories} kcal</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollViewDesktop: { maxWidth: 800, alignSelf: "center", width: "100%" },
  container: { padding: 16, paddingTop: 50 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 15 },
  calendarCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 10, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dateLabel: { fontSize: 18, fontWeight: '600', color: COLORS.textDark, marginBottom: 15, textTransform: 'capitalize', marginLeft: 4 },

  mealSection: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F5F5F5' },
  mealHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  leftHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  mealTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, textTransform: 'uppercase' },
  mealTimeLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  mealCalories: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },

  foodList: { marginBottom: 0 },
  foodItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9F9F9' },
  foodName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  foodDetail: { fontSize: 12, color: COLORS.textLight },
  emptyFoodText: { fontSize: 13, color: '#DDD', fontStyle: 'italic', marginVertical: 5 },

  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { color: COLORS.textLight },
});