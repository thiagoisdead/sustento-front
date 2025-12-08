import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";

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

// Interface para Alimento dentro da Refeição (ajuste conforme API)
interface FoodItem {
  id: number;
  name: string;
  calories: number;
  quantity: number;
  unit: string;
}

// Extender a interface Meal para incluir foods
interface MealWithFoods extends Meal {
  foods?: FoodItem[];
}

export default function SeeFoodTracker() {
  const { width } = useWindowDimensions();
  const { planId } = useLocalSearchParams();
  const isMobile = width < BREAKPOINTS.MOBILE;

  const [modalAddMealVisible, setModalAddMealVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  const handlePath = usePath();

  const [haveMealPlans, setMealPlans] = useState(false);
  const [mealPlanData, setMealPlanData] = useState<MealPlan>();
  const [meals, setMeals] = useState<MealWithFoods[]>([]); // Use a nova interface

  const handleAddMeal = async (meal: any) => {
    try {
      const req = await basePost('meals', meal);
      console.log('Meal created:', req?.data);
      fetchMealsFromMealPlan();
    } catch (error) {
      console.error("Erro ao criar refeição", error);
    }
  };

  const handleDeleteMeal = async (id: number) => {


    console.log('Deleting meal with id:', id, typeof (id));
    const req = await baseDeleteById(`meals/${Number(id)}`);
    console.log('req de delete de meal', req?.data)
    // setMeals(prev => prev.filter((meal) => meal.id !== id));
  };

  const fetchMealPlan = useCallback(async () => {
    if (!planId) return;
    const response = await baseFetch(`mealplans/${planId}`);

    if (!response?.data) {
      setMealPlans(false);
    } else {
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setMealPlanData(data);
      setMealPlans(true);
    }
  }, [planId]);

  // --- Função Principal de Carga de Refeições e Alimentos ---
  const fetchMealsFromMealPlan = useCallback(async () => {
    if (!planId) return;
    const response = await baseFetch(`mealplans/${planId}/meals`);

    if (!response?.data) {
      setMeals([]);
      return;
    }

    const rawMeals = Array.isArray(response.data) ? response.data : [response.data];

    // Mapeia estrutura básica das refeições
    const mappedMeals: MealWithFoods[] = rawMeals.map((item: any) => ({
      id: item.meal_id,
      name: item.meal_name,
      category: item.meal_name,
      calories: 0,
      foods: []
    }));

    // Busca alimentos de cada refeição em paralelo
    const mealsWithFoods = await Promise.all(mappedMeals.map(async (meal) => {
      try {
        const foodRes = await baseFetch(`meals/${meal.id}/aliments`);
        const data = foodRes?.data;

        console.log('data de aliments da meal', data?.MealAliments);

        // VERIFICAÇÃO CRUCIAL BASEADA NO SEU LOG:
        // O array real está dentro de data.MealAliments
        const rawFoods = data?.MealAliments || [];

        console.log('rawFoods da meal', rawFoods);

        const foods: FoodItem[] = rawFoods.map((item: any) => {
          // O objeto 'aliment' está aninhado dentro de cada item do MealAliments
          const alimentData = item.aliment || {};
          console.log('item INTEIRO dentro de meal', item);

          console.log('alimentData dentro da meal', alimentData);

          return {
            id: alimentData.id || alimentData.aliment_id || Math.random(), // Fallback de ID
            name: alimentData.name || "Alimento sem nome",
            // Tenta pegar calorias do objeto aninhado 'nutrients' ou direto
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

        console.log(foods, 'foods da meal');

        console.log(totalCals, 'total cals da measl');


        return {
          ...meal,
          foods,
          calories: Number(totalCals.toFixed(2)),
          fats: Number(totalFats.toFixed(2)),
          carbs: Number(totalCarbs.toFixed(2)),
          proteins: Number(totalProteins.toFixed(2)),
        };
      } catch (error) {
        console.log(`Erro ao buscar alimentos para refeição ${meal.id}`, error);
        return meal;
      }
    }));
    console.log('mealsWithFoods', mealsWithFoods);


    setMeals(mealsWithFoods);
  }, [planId]);

  useEffect(() => {
    fetchMealPlan();
    fetchMealsFromMealPlan();
  }, [fetchMealPlan, fetchMealsFromMealPlan]);

  const groupedMeals = meals.reduce((acc: Record<string, MealWithFoods[]>, meal) => {


    console.log('meal for grouping', meal, meals);
    const cat = meal.category || "Outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(meal);
    return acc;
  }, {});

  useEffect(() => {
    console.log('groupedMeals', groupedMeals);

  }, [groupedMeals]);

  if (!haveMealPlans) {
    return (
      <View style={styles.noMealPlans}>
        {/* ... (código sem plano igual) */}
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
          data={{ ...mealPlanData, current_calories: meals.reduce((acc, m) => acc + (m.calories || 0), 0), current_fats: meals.reduce((acc, m) => acc + (m?.fat || 0), 0), current_carbs: meals.reduce((acc, m) => acc + (m?.carbs || 0), 0), current_protein: meals.reduce((acc, m) => acc + (m?.proteins || 0), 0) }}
        />

        <View style={styles.mealGrid}>
          {Object.keys(groupedMeals).map((category) => (
            <View key={category} style={styles.mealSection}>
              {groupedMeals[category].map((meal) => (
                <MealItem
                  key={meal.id}
                  meal={meal}
                  onDelete={handleDeleteMeal}
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