<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
=======
import React, { useState, useEffect, useCallback } from "react";
>>>>>>> Stashed changes
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";

import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
<<<<<<< Updated upstream
import { Meal, MealPlan, mealPlanSchema } from "../../types/meal";
import { ProgressCard } from "../../components/ProgressCard";
import { MealItem } from "../../components/meal/mealItem";
import { AddMealModal } from "../../components/meal/addMealModal";
import { baseFetch, basePost, baseUniqueGet } from "../../services/baseCall";
import { AnimatedButton } from "../../components/animatedButton";
import { Dialog, Portal, TextInput, Switch, Button } from "react-native-paper";
import { getItem } from "../../services/secureStore";
import { usePath } from "../../hooks/usePath";
import { useLocalSearchParams } from "expo-router";
import { useLogout } from "../../hooks/useLogout";
import { Header } from "../../components/profile/profileHeader";


export default function SeeFoodTracker() {
    const { width } = useWindowDimensions();
    const { planId } = useLocalSearchParams();

    console.log('params plan id', planId)
    const isMobile = width < BREAKPOINTS.MOBILE;

    const [modalVisible, setModalVisible] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handlePath = usePath()

    const [planForm, setPlanForm] = useState({
        plan_name: '',
        target_calories: '',
        target_water: '',
        target_protein: '',
        target_carbs: '',
        target_fats: '',
        active: true,
    });

    const handleChange = (key: string, value: string | boolean) => {
        console.log('morto', key, value)
        setPlanForm(prev => ({ ...prev, [key]: value }));
    };

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

    const dailyGoal = 1800;
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

    const groupedMeals = meals.reduce((acc: Record<string, Meal[]>, meal) => {
        if (!acc[meal.category]) acc[meal.category] = [];
        acc[meal.category].push(meal);
        return acc;
    }, {});

    const handleAddMeal = (name: string, calories: number, category: string) => {
        const newMeal: Meal = {
            id: Date.now(),
            name,
            calories,
            category,
        };
        setMeals([...meals, newMeal]);
    };
=======
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
>>>>>>> Stashed changes

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

<<<<<<< Updated upstream
    const convertToNumberOrUndefined = (value: string): number | undefined => {
        const normalizedValue = value.replace(',', '.');
        const num = parseFloat(normalizedValue);
        return isNaN(num) ? undefined : num;
    };

    useEffect(() => {
        const fetchMealPlan = async () => {
            const response = await baseFetch(`users/mealplans/${planId}`);
            console.log('mealplan response', response?.data)
            if (response?.data?.length === 0) return setMealPlans(false)
            else {
                setMealPlanData(response?.data[0])
                setMealPlans(true)
            }
        }
        fetchMealPlan()
    }, [])


    const handleCreateMealPlan = async (type: 'MANUAL' | 'AUTOMATIC') => {
        const id = await getItem('id');

        const dataForValidation = {
            active: planForm.active,
            plan_name: planForm.plan_name || undefined, // Garante undefined se vazio
            target_calories: convertToNumberOrUndefined(planForm.target_calories),
            target_water: convertToNumberOrUndefined(planForm.target_water),
            target_protein: convertToNumberOrUndefined(planForm.target_protein),
            target_carbs: convertToNumberOrUndefined(planForm.target_carbs),
            target_fats: convertToNumberOrUndefined(planForm.target_fats),
            source: type,
            user_id: Number(id),
        };

        try {
            const validatedPlan = mealPlanSchema.parse(dataForValidation);

            console.log('✅ Dados formatados e validados:', validatedPlan);

            const req = await basePost('mealplans', validatedPlan);
            console.log('resposta da req', req)
            console.log('Plano de refeição criado com sucesso!', req?.data);

            setDialogVisible(false); // Fecha o modal após sucesso

        } catch (error) {
            console.error('❌ Erro de validação Zod:', error);
        }
    }

    // --- Render Dialog Component ---
    const RenderPlanDialog = () => (
        <Portal>
            <Dialog visible={!!dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
                <Dialog.Title style={styles.dialogTitle}>Criar Plano Manual</Dialog.Title>

                <Dialog.Content style={styles.dialogContent}>

                    {/* Campo Obrigatório: ATIVO */}
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Definir como Plano Ativo?</Text>
                        <Switch
                            value={planForm.active}
                            onValueChange={(val) => handleChange('active', val)}
                            color={COLORS.primary}
                        />
                    </View>

                    {/* O Formulário inteiro (Inputs Opcionais) */}
                    <TextInput
                        label="Nome do Plano (Opcional)"
                        value={planForm.plan_name}
                        onChangeText={(text) => handleChange('plan_name', text)}
                        mode="outlined"
                        style={styles.input}
                        outlineColor={COLORS.grayLight}
                        activeOutlineColor={COLORS.primary}
                        dense
                    />

                    <View style={styles.row}>
                        <TextInput
                            label="Meta Kcal"
                            value={planForm.target_calories}
                            onChangeText={(text) => handleChange('target_calories', text)}
                            keyboardType="numeric"
                            mode="outlined"
                            style={[styles.input, styles.flexInput]}
                            outlineColor={COLORS.grayLight}
                            activeOutlineColor={COLORS.primary}
                            dense
                            right={<TextInput.Affix text="kcal" />}
                        />
                        <TextInput
                            label="Água"
                            value={planForm.target_water}
                            onChangeText={(text) => handleChange('target_water', text)}
                            keyboardType="numeric"
                            mode="outlined"
                            style={[styles.input, styles.flexInput]}
                            outlineColor={COLORS.grayLight}
                            activeOutlineColor={COLORS.primary}
                            dense
                            right={<TextInput.Affix text="ml" />}
                        />
                    </View>

                    <Text style={styles.sectionLabel}>Distribuição de Macros (g) - Opcional</Text>

                    <View style={styles.row}>
                        <TextInput
                            label="Prot"
                            value={planForm.target_protein}
                            onChangeText={(text) => handleChange('target_protein', text)}
                            keyboardType="numeric"
                            mode="outlined"
                            style={[styles.input, styles.flexInput]}
                            outlineColor={COLORS.grayLight}
                            activeOutlineColor={COLORS.primary}
                            dense
                        />
                        <TextInput
                            label="Carb"
                            value={planForm.target_carbs}
                            onChangeText={(text) => handleChange('target_carbs', text)}
                            keyboardType="numeric"
                            mode="outlined"
                            style={[styles.input, styles.flexInput]}
                            outlineColor={COLORS.grayLight}
                            activeOutlineColor={COLORS.primary}
                            dense
                        />
                        <TextInput
                            label="Gord"
                            value={planForm.target_fats}
                            onChangeText={(text) => handleChange('target_fats', text)}
                            keyboardType="numeric"
                            mode="outlined"
                            style={[styles.input, styles.flexInput]}
                            outlineColor={COLORS.grayLight}
                            activeOutlineColor={COLORS.primary}
                            dense
                        />
                    </View>
                </Dialog.Content>

                <Dialog.Actions style={styles.dialogActions}>
                    <Button
                        onPress={() => setDialogVisible(false)}
                        style={[styles.btnBase, styles.btnCancel]}
                    >
                        <Text style={[styles.btnText, { color: COLORS.textDark }]}>Cancelar</Text>
                    </Button>

                    <Button
                        onPress={() => handleCreateMealPlan('MANUAL')}
                        style={[styles.btnBase, styles.btnSave]}
                    >
                        <Text style={styles.btnText}>Criar Plano</Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );

    if (!haveMealPlans) {
        return (
            <View style={styles.noMealPlans}>
                <Text style={styles.topTitleText}>Nenhum plano alimentar encontrado</Text>

                <View style={styles.centerActionContainer}>
                    <Text style={styles.actionLabel}>Criar plano:</Text>

                    <View style={styles.buttonRow}>
                        <AnimatedButton
                            onPress={() => setDialogVisible(true)}
                            style={styles.btnBase}
                            scaleTo={0.9}
                        >
                            <Text style={styles.btnText}>Manual</Text>
                        </AnimatedButton>

                        <AnimatedButton
                            onPress={() => handleCreateMealPlan('AUTOMATIC')}
                            style={styles.btnBase}
                            scaleTo={0.9}
                        >
                            <Text style={styles.btnText}>Com IA</Text>
                        </AnimatedButton>
                    </View>
                </View>
                {RenderPlanDialog()}
            </View>
        );
    }

    // --- Tela Principal ---
    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.container, !isMobile && styles.containerDesktop]}
            >
                <View style={{ marginTop: 30, gap: 10 }}>
                </View>
                <Header text="Rastreador de Alimentos" onFunction={() => handlePath('foodTracker/seeAllMealPlans')} iconName="arrow-back" />
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
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>Adicionar Refeição</Text>
                </Pressable>


            </ScrollView>

            <AddMealModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={handleAddMeal}
            />
            {RenderPlanDialog()}
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
});