import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Alert } from "react-native";

import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Meal, MealPlan } from "../../types/meal";
import { ProgressCard } from "../../components/ProgressCard";
import { MealItem } from "../../components/meal/mealItem";
import { AddMealModal } from "../../components/meal/addMealModal";
import { baseDelete, baseDeleteById, baseFetch, basePost } from "../../services/baseCall";
import { AnimatedButton } from "../../components/animatedButton";
import { usePath } from "../../hooks/usePath";
import { useLocalSearchParams } from "expo-router";
import { Header } from "../../components/profile/profileHeader";
import MealPlanModal from "../../components/mealPlan/createMealPlanModal";
import { getItem } from "../../services/secureStore";

// Interface para Alimento dentro da Refeição (ajuste conforme API)
interface FoodItem {
  id: number;
  name: string;
  meal_aliment_id: number;
  calories: number;
  quantity: number;
  unit: string;
  carbs?: number;
  proteins?: number;
  fats?: number;
}

interface MealWithFoods extends Meal {
  foods?: FoodItem[];
}

export default function SeeFoodTracker() {
  const { width } = useWindowDimensions();
  const { planId } = useLocalSearchParams();
  const isMobile = width < BREAKPOINTS.MOBILE;

  interface CheckedFoodRecord {
    mealId: number;
    foodId: number;        // meal_aliment_id
    recordId: number;      // vindo do backend
  }

  const [modalAddMealVisible, setModalAddMealVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [checkedFoodRecords, setCheckedFoodRecords] = useState<CheckedFoodRecord[]>([]);

  const handlePath = usePath();

  const [haveMealPlans, setHaveMealPlans] = useState(false);
  const [mealPlanData, setMealPlanData] = useState<MealPlan>();
  const [meals, setMeals] = useState<MealWithFoods[]>([]);

  const handleAddMeal = async (meal: any) => {
    try {
      const req = await basePost('meals', meal);
      if (req?.status !== 200 && req?.status !== 201) return Alert.alert("Erro", "Não foi possível criar a refeição.");
      fetchMealsFromMealPlan();
    } catch (error) {
      console.error("Erro ao criar refeição", error);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    const req = await baseDeleteById(`meals/${Number(id)}`);


    setMeals(prev => prev.filter((meal) => meal.id !== id));
  };

  const fetchMealPlan = useCallback(async () => {
    if (!planId) return;
    const response = await baseFetch(`mealplans/${planId}`);

    if (!response?.data) {
      setHaveMealPlans(false);
    } else {
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setMealPlanData(data);
      setHaveMealPlans(true);
    }
  }, [planId]);

  const handleDeleteFood = async (mealId: number, mealAlimentId: number) => {
    try {
      const res = await baseDeleteById(`mealAliments/${mealAlimentId}`);


      setMeals((prevMeals) =>
        prevMeals.map((meal) => {
          if (meal.id === mealId && meal.foods) {
            const updatedFoods = meal.foods.filter(f => f.meal_aliment_id !== mealAlimentId);

            const newCalories = updatedFoods.reduce((acc, f) => acc + (f.calories || 0), 0);

            const newCarbs = updatedFoods.reduce((acc, f) => acc + (f.carbs || 0), 0);
            const newProteins = updatedFoods.reduce((acc, f) => acc + (f.proteins || 0), 0);
            const newFats = updatedFoods.reduce((acc, f) => acc + (f.fats || 0), 0);

            return {
              ...meal,
              foods: updatedFoods,
              calories: newCalories,
              carbs: newCarbs,
              proteins: newProteins,
              fats: newFats
            };
          }
          return meal;
        })
      );
    } catch (error) {
      console.error("Erro ao deletar alimento:", error);
    }
  };

  const handleToggleFood = async (
    mealId: number,
    foodId: number,
    food: any
  ) => {
    const userId = await getItem('id');

    const existing = checkedFoodRecords.find(
      r => r.mealId === mealId && r.foodId === foodId
    );

    if (existing) {
      try {
        const res = await baseDeleteById(`mealRecords/${existing.recordId}`);
        if (res?.status !== 204) return Alert.alert("Erro", "Não foi possível remover o registro.");
        setCheckedFoodRecords(prev =>
          prev.filter(r => r.recordId !== existing.recordId)
        );
      } catch (err) {
        Alert.alert("Erro", "Não foi possível remover o registro.");
      }
      return;
    }

    const now = new Date();

    const formatMealDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatMealMoment = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    };

    try {
      const payload = {
        user_id: Number(userId),
        meal_id: mealId,
        aliment_id: food.id,
        amount: food.quantity,
        unit: food.unit,
        meal_date: formatMealDate(now),
        meal_moment: formatMealMoment(now),
      };

      const req = await basePost('mealRecords', payload);

      if (!req?.data?.record_id) {
        throw new Error("record_id não retornado");
      }

      setCheckedFoodRecords(prev => [
        ...prev,
        {
          mealId,
          foodId,
          recordId: req.data.record_id,
        },
      ]);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível registrar o alimento.");
    }
  };


  const fetchMealsFromMealPlan = useCallback(async () => {
    if (!planId) return;

    const response = await baseFetch(`mealplans/${planId}/meals`);

    if (!response?.data) {
      setMeals([]);
      return;
    }

    const rawMeals = Array.isArray(response.data) ? response.data : [response.data];
    const mappedMeals: MealWithFoods[] = rawMeals.map((item: any) => ({
      id: item.meal_id,
      name: item.meal_name,
      category: item.meal_name,
      calories: 0,
      foods: []
    }));

    let allRelations: any[] = [];
    try {
      const req = await baseFetch(`mealAliments`);

      allRelations = req?.data || [];
    } catch (err) {
      console.log('Erro ao buscar relações', err);
    }

    const mealsWithFoods = await Promise.all(mappedMeals.map(async (meal) => {
      try {
        const foodRes = await baseFetch(`meals/${meal.id}/aliments`);
        const data = foodRes?.data;

        const rawFoods = data?.MealAliments || [];

        const foods: FoodItem[] = rawFoods.map((item: any) => {
          const alimentData = item.aliment || {};

          // Tenta pegar o ID global
          const alimentId = alimentData.id || alimentData.aliment_id;

          // Tenta achar o match, mas NÃO DEPENDE DELE para renderizar
          const match = allRelations.find((rel: any) =>
            rel.meal_id === meal.id &&
            rel.aliment_id === alimentId
          );

          // Se tiver match, usa o ID da relação. Se não, tenta pegar do item. Se não, usa 0 (mas renderiza!).
          const finalMealAlimentId = match ? match.meal_aliment_id : (item.meal_aliment_id || 0);

          // REMOVA QUALQUER IF QUE IMPEÇA O RETORNO AQUI
          // if (!match) ... (apenas log, não return)

          return {
            id: alimentId, // ID GLOBAL (Importante para o checkbox!)
            meal_aliment_id: finalMealAlimentId, // ID DA RELAÇÃO (Importante para deletar do plano)
            name: alimentData.name || "Alimento sem nome",
            calories: alimentData?.calories_100g
              ? (item.quantity * alimentData.calories_100g) / 100
              : 0,
            fats: alimentData?.fat_100g
              ? (item.quantity * alimentData.fat_100g) / 100
              : 0,
            carbs: alimentData?.carbs_100g
              ? (item.quantity * alimentData.carbs_100g) / 100
              : 0,
            proteins: alimentData?.protein_100g
              ? (item.quantity * alimentData.protein_100g) / 100
              : 0,
            quantity: Number(item.quantity) || 0,
            unit: item.measurement_unit || 'g'
          };
        });

        const totalCals = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
        const totalFats = foods.reduce((acc, f) => acc + (f.fats || 0), 0);
        const totalCarbs = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
        const totalProteins = foods.reduce((acc, f) => acc + (f.proteins || 0), 0);

        return {
          ...meal,
          foods,
          calories: totalCals,
          fats: totalFats,
          carbs: totalCarbs,
          proteins: totalProteins,
        };
      } catch (error) {
        return meal;
      }
    }));

    setMeals(mealsWithFoods);
  }, [planId]);

  const fetchRecordsForMeals = useCallback(async (currentMeals: MealWithFoods[]) => {
    if (!currentMeals || currentMeals.length === 0) return;

    // 1. Pega apenas os IDs únicos das refeições para não repetir requisição
    const uniqueMealIds = Array.from(new Set(currentMeals.map(m => m.id)));

    try {
      const responses = await Promise.all(
        uniqueMealIds.map(id => baseFetch(`mealRecords/meal/${id}`))
      );

      const allRecords: CheckedFoodRecord[] = [];

      responses.forEach((res) => {
        if (res && Array.isArray(res.data)) {
          const mapped = res.data.map((rec: any) => ({
            mealId: rec.meal_id,
            foodId: rec.aliment_id,
            recordId: rec.record_id
          }));
          allRecords.push(...mapped);
        }
      });

      setCheckedFoodRecords(allRecords);

    } catch (error) {
      console.error("Erro ao buscar registros das refeições:", error);
    }
  }, []);

  useEffect(() => {
    fetchMealPlan();
    fetchMealsFromMealPlan();
  }, [fetchMealPlan, fetchMealsFromMealPlan]);

  useEffect(() => {
    if (meals.length > 0) {
      fetchRecordsForMeals(meals);
    }
  }, [meals, fetchRecordsForMeals]);

  const groupedMeals = meals.reduce((acc: Record<string, MealWithFoods[]>, meal) => {
    const cat = meal?.category || "Outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(meal);
    return acc;
  }, {});

  if (!haveMealPlans) {
    return (
      <View style={styles.noMealPlans}>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, !isMobile && styles.containerDesktop]}
      >
        <View style={{ marginTop: 30, gap: 10 }} />

        <Header
          text={mealPlanData?.plan_name || "Detalhes"}
          onFunction={() => handlePath('foodTracker/seeAllMealPlans')}
          onEdit={() => setEditDialogVisible(true)}
          iconName="arrow-back"
        />

        {/* Somando calorias totais reais */}
        <ProgressCard
          data={{ ...mealPlanData, current_calories: meals.reduce((acc, m) => acc + (m.calories || 0), 0), current_fats: meals.reduce((acc, m) => acc + (m?.fats || 0), 0), current_carbs: meals.reduce((acc, m) => acc + (m?.carbs || 0), 0), current_protein: meals.reduce((acc, m) => acc + (m?.proteins || 0), 0) }}
        />

        <View style={styles.mealGrid}>
          {Object.keys(groupedMeals).map((category) => (
            <View key={category} style={styles.mealSection}>
              {groupedMeals[category].map((meal) => (
                <MealItem
                  key={meal.id}
                  meal={meal}
                  onDelete={handleDeleteMeal}
                  onDeleteFood={handleDeleteFood}
                  checkedFoodRecords={checkedFoodRecords}
                  onToggleFood={handleToggleFood}
                />
              ))}
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.addButton, !isMobile && styles.addButtonDesktop]}
          onPress={() => setModalAddMealVisible(true)}
        >
          <Text style={styles.addButtonText}>Adicionar Refeição</Text>
        </Pressable>

      </ScrollView>

      <AddMealModal
        visible={modalAddMealVisible}
        onClose={() => setModalAddMealVisible(false)}
        onAdd={handleAddMeal}
        planId={Number(planId)}
      />

      {editDialogVisible && (
        <MealPlanModal
          planToEdit={mealPlanData}
          onDismiss={() => {
            setEditDialogVisible(false);
            fetchMealPlan();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  headerActions: { marginTop: 20, alignItems: 'center' },
  headerButtonsRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 12, marginBottom: 12 },
  headerBtn: { backgroundColor: COLORS.greatGreen, width: 170, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center' },
  btnTextSmall: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  headerInput: { width: '100%', backgroundColor: '#fff', fontSize: 14, textAlign: 'center' },
  noMealPlans: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', paddingHorizontal: 20, paddingTop: 80 },
  topTitleText: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  centerActionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: 80 },
  actionLabel: { fontSize: 16, color: COLORS.textDark, marginBottom: 16, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 20 },
  btnBase: { width: 140, maxWidth: 200, paddingVertical: 10, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  scrollView: { flex: 1 },
  container: { paddingVertical: 20, paddingHorizontal: 16 },
  containerDesktop: { maxWidth: 800, alignSelf: "center", width: "100%" },
  mealGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 5 },
  mealSection: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 12, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  mealCategory: { fontSize: 16, fontWeight: "700", color: COLORS.textDark, marginBottom: 8 },
  addButton: { backgroundColor: COLORS.greatGreen, paddingVertical: 14, borderRadius: 30, alignItems: "center", marginTop: 16, alignSelf: "stretch" },
  addButtonDesktop: { alignSelf: "center", width: 280 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dialog: { backgroundColor: '#FFFFFF', borderRadius: 16 },
  dialogTitle: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 5 },
  dialogContent: { paddingHorizontal: 20, paddingBottom: 0 },
  input: { backgroundColor: '#FAFAFA', marginBottom: 12, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  flexInput: { flex: 1 },
  sectionLabel: { fontSize: 14, color: COLORS.textDark, fontWeight: '600', marginTop: 8, marginBottom: 8, marginLeft: 2 },
  dialogActions: { paddingHorizontal: 20, paddingBottom: 20, justifyContent: 'space-between', gap: 10 },
  btnCancel: { backgroundColor: '#E0E0E0', flex: 1 },
  btnSave: { backgroundColor: COLORS.primary, flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4, backgroundColor: '#FAFAFA', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EEEEEE' },
  switchLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  planName: { fontSize: 20 }
});