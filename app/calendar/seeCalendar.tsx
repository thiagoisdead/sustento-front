import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View, Text, useWindowDimensions, ActivityIndicator, TouchableOpacity } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { AnimatedButton } from "../../components/animatedButton";

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

// --- HELPERS DE DATA CORRIGIDOS (SEM CONVERSÃO DE FUSO) ---

// 1. Pega a data selecionada no calendário (String YYYY-MM-DD)
const getIsoDateStr = (dateInput: any): string => {
  if (!dateInput) return "";
  try {
    if (dateInput instanceof Date) {
      // Aqui usamos métodos locais para o "Hoje" funcionar no fuso do usuário
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(dateInput).split('T')[0];
  } catch (e) { return ""; }
};

// 2. CORREÇÃO CRÍTICA: Pega a data LITERAL do banco
// Antes: new Date(...) -> convertia 01:00 UTC para 22:00 BRT (dia anterior)
// Agora: split('T')[0] -> Pega "2025-12-10" literalmente, ignorando fuso.
const formatIsoToLocalDate = (isoDate: string | null) => {
  if (!isoDate) return "";
  return isoDate.split('T')[0];
};

// 3. Extrai apenas a hora visualmente (UTC para manter consistência com o banco 1970)
const extractTime = (isoTime: string | null) => {
  if (!isoTime) return "";
  try {
    const date = new Date(isoTime);
    const hours = String(date.getUTCHours()).padStart(2, '0');
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
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [mealCategories, setMealCategories] = useState<any[]>([]);
  const [groupedMeals, setGroupedMeals] = useState<MealGroup[]>([]);

  // --- CARREGAMENTO ---
  const fetchInitialData = async () => {
    const idStr = await getItem('id');
    if (!idStr) return;
    const uid = Number(idStr);
    setUserId(uid);

    const plansRes = await baseFetch(`mealPlans?user_id=${uid}`);
    const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];
    const active = userPlans.find((p: any) => p.active) || userPlans[0];

    if (active) {
      setActivePlanId(active.plan_id);
      fetchCategories(active.plan_id);
    }
  };

  const fetchCategories = async (planId: number) => {
    const res = await baseFetch(`meals?plan_id=${planId}`);
    if (res?.data) {
      setMealCategories(res.data);
    }
  };

  const fetchDailyRecords = useCallback(async () => {
    if (!userId || !selectedDate) return;

    setIsLoading(true);
    try {
      const recordsRes = await baseFetch(`mealRecords?user_id=${userId}`);
      const allRecords = Array.isArray(recordsRes?.data) ? recordsRes?.data : [];

      // 1. Filtra registros de comida pela data selecionada no calendário
      // Usa split('T')[0] para garantir match exato de string
      const dayRecords = allRecords.filter((rec: any) => formatIsoToLocalDate(rec.meal_date) === selectedDate);

      // 2. Hidrata os alimentos
      const mealsWithDetails = await Promise.all(dayRecords.map(async (rec: any) => {
        try {
          const alimRes = await baseGetById('aliments', rec.aliment_id);
          const alim = alimRes?.data || {};
          const ratio = (Number(rec.amount) || 0) / 100;
          const cals = (Number(alim.calories_100g) || 0) * ratio;

          return {
            id: rec.aliment_id,
            meal_id: rec.meal_id,
            name: alim.name || "Item sem nome",
            calories: Math.round(cals),
            quantity: Number(rec.amount),
            unit: rec.unit || 'g'
          };
        } catch (e) { return null; }
      }));

      const validFoods = mealsWithDetails.filter(f => f !== null);

      // 3. FILTRO DE CATEGORIAS (RIGOROSO)
      // Ignora o 'time' e foca 100% no 'created_at' como String Literal
      const filteredCategories = mealCategories.filter(cat => {
        // "2025-12-10T01:07:33..." vira "2025-12-10"
        const createdYmd = formatIsoToLocalDate(cat.created_at);

        // Compara string com string. 
        // Se created_at for 2025-12-10, só aparece se selectedDate for 2025-12-10
        return createdYmd === selectedDate;
      });

      // 4. Agrupa
      const grouped = filteredCategories.map(cat => {
        const catFoods = validFoods.filter((f: any) => String(f.meal_id) === String(cat.meal_id));
        return {
          meal_id: cat.meal_id,
          meal_name: cat.meal_name,
          timeRaw: cat.time || "23:59:59",
          displayTime: extractTime(cat.time),
          foods: catFoods,
          totalCalories: catFoods.reduce((acc: number, f: any) => acc + f.calories, 0)
        };
      });

      // 5. Ordena por horário
      grouped.sort((a, b) => {
        if (a.timeRaw < b.timeRaw) return -1;
        if (a.timeRaw > b.timeRaw) return 1;
        return 0;
      });

      setGroupedMeals(grouped);

    } catch (error) {
      console.error("Erro ao carregar dia:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDate, mealCategories]);

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (mealCategories.length > 0) {
      fetchDailyRecords();
    }
  }, [selectedDate, mealCategories, fetchDailyRecords]);

  useFocusEffect(useCallback(() => {
    if (userId && activePlanId) fetchDailyRecords();
  }, [userId, activePlanId]));

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
          <Text style={styles.headerTitle}>Histórico Alimentar</Text>
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
          {/* Adicionamos T12:00:00 para garantir que a exibição visual não volte 1 dia */}
          {new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {/* LISTA DE REFEIÇÕES DO DIA */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : groupedMeals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum registro para este dia.</Text>
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
  container: { padding: 16, paddingTop: 40 },
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