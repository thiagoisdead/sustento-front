import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";

import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Meal, MealPlan } from "../../types/meal";
import { ProgressCard } from "../../components/ProgressCard";
import { MealItem } from "../../components/meal/mealItem";
import { AddMealModal } from "../../components/meal/addMealModal";
import { baseFetch } from "../../services/baseCall";
import { AnimatedButton } from "../../components/animatedButton";
import { usePath } from "../../hooks/usePath";
import { useLocalSearchParams } from "expo-router";
import { Header } from "../../components/profile/profileHeader";

// Importe APENAS UMA VEZ o componente híbrido
import MealPlanModal from "../../components/mealPlan/createMealPlanModal";

export default function SeeFoodTracker() {
  const { width } = useWindowDimensions();
  const { planId } = useLocalSearchParams();

  console.log('params plan id', planId)
  const isMobile = width < BREAKPOINTS.MOBILE;

  const [modalAddMealVisible, setModalAddMealVisible] = useState(false); // Modal de adicionar comida
  const [createDialogVisible, setCreateDialogVisible] = useState(false); // Modal de criar plano (se não tiver)
  const [editDialogVisible, setEditDialogVisible] = useState(false);   // Modal de editar plano (engrenagem)

  const handlePath = usePath()

  const [haveMealPlans, setMealPlans] = useState(false);
  const [mealPlanData, setMealPlanData] = useState<MealPlan>();
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, category: "Café da manhã", name: "Café com leite", calories: 80 },
    { id: 2, category: "Café da manhã", name: "Torrada integral", calories: 60 },
    { id: 3, category: "Almoço", name: "Peito de frango grelhado", calories: 250 },
    { id: 4, category: "Almoço", name: "Arroz integral", calories: 150 },
    { id: 6, category: "Lanche", name: "Maçã", calories: 90 },
    { id: 7, category: "Jantar", name: "Salmão assado", calories: 300 },
  ]);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  const groupedMeals = meals.reduce((acc: Record<string, Meal[]>, meal) => {
    if (!acc[meal.category]) acc[meal.category] = [];
    acc[meal.category].push(meal);
    return acc;
  }, {});

  const handleAddMeal = (name: string, calories: number, category: string) => {
    const newMeal: Meal = { id: Date.now(), name, calories, category };
    setMeals([...meals, newMeal]);
  };

  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  // --- Função de buscar dados (Extraída para poder recarregar ao editar) ---
  const fetchMealPlan = useCallback(async () => {
    if (!planId) return;
    const response = await baseFetch(`mealplans/${planId}`);
    
    console.log('response meal plan', response?.data)
    
    if (!response?.data) { // Verificação mais segura
         setMealPlans(false)
    } else {
        // Se vier array ou objeto, ajusta aqui. Assumindo que vem objeto direto pelo ID
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setMealPlanData(data)
        setMealPlans(true)
    }
  }, [planId]);

  useEffect(() => {
    fetchMealPlan()
  }, [fetchMealPlan])


  // --- TELA: SEM PLANO ---
  if (!haveMealPlans) {
    return (
      <View style={styles.noMealPlans}>
        <Text style={styles.topTitleText}>Nenhum plano alimentar encontrado</Text>

        <View style={styles.centerActionContainer}>
          <Text style={styles.actionLabel}>Criar plano:</Text>

          <View style={styles.buttonRow}>
            <AnimatedButton
              onPress={() => setCreateDialogVisible(true)}
              style={styles.btnBase}
              scaleTo={0.9}
            >
              <Text style={styles.btnText}>Criar Agora</Text>
            </AnimatedButton>
          </View>
        </View>

        {createDialogVisible && (
          <MealPlanModal
            onDismiss={() => {
                setCreateDialogVisible(false);
                fetchMealPlan(); // Tenta buscar de novo após criar
            }}
          />
        )}
      </View>
    );
  }

  // --- TELA PRINCIPAL (COM PLANO) ---
  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, !isMobile && styles.containerDesktop]}
      >
        <View style={{ marginTop: 30, gap: 10 }} />
        
        {/* HEADER COM AÇÃO DE EDITAR */}
        <Header 
            text={mealPlanData?.plan_name || "Detalhes"} 
            onFunction={() => handlePath('foodTracker/seeAllMealPlans')} 
            onEdit={() => setEditDialogVisible(true)} // <--- AQUI VOCÊ SETA TRUE
            iconName="arrow-back" 
        />
        
        <ProgressCard totalCalories={totalCalories} dailyGoal={mealPlanData?.target_calories || 0} />

        <View style={styles.mealGrid}>
          {Object.keys(groupedMeals).map((category) => (
            <View key={category} style={styles.mealSection}>
              <Text style={styles.mealCategory}>{category}</Text>
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
      />

      {/* --- FALTAVA ISSO AQUI --- */}
      {/* O Modal de Edição precisa estar renderizado no fluxo principal também */}
      {editDialogVisible && (
          <MealPlanModal
            planToEdit={mealPlanData} // Passa os dados atuais para preencher o form
            onDismiss={() => {
                setEditDialogVisible(false);
                fetchMealPlan(); // Recarrega os dados (ex: mudou nome ou calorias)
            }}
          />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  headerActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  headerButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  headerBtn: {
    backgroundColor: COLORS.greatGreen,
    width: 170,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnTextSmall: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerInput: {
    width: '100%',
    backgroundColor: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  noMealPlans: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  topTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  centerActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 80,
  },
  actionLabel: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  btnBase: {
    width: 140,
    maxWidth: 200,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  scrollView: { flex: 1 },
  container: { paddingVertical: 20, paddingHorizontal: 16 },
  containerDesktop: { maxWidth: 800, alignSelf: "center", width: "100%" },

  mealGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 5,
  },
  mealSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealCategory: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: COLORS.greatGreen,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
    alignSelf: "stretch",
  },
  addButtonDesktop: { alignSelf: "center", width: 280 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 5,
  },
  dialogContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  input: {
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 5,
  },
  flexInput: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 2,
  },
  dialogActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
    gap: 10,
  },
  btnCancel: {
    backgroundColor: '#E0E0E0',
    flex: 1,
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  planName: {
    fontSize: 20
  }
});