import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    useWindowDimensions,
    Alert,
    ActivityIndicator
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Imports de Constantes e Tipos ---
import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Meal } from "../../types/meal";
import { getItem } from "../../services/secureStore";

// --- Serviços ---
import {
    getDailyMeals,
    getPlanMealsConfig,
    registerConsumedFood,
    deleteMealRecord,
    forceDeleteMealCategory // <--- IMPORTANTE: Função Faxineira
} from "../../services/foodService";
import { getDashboardData } from "../../services/dashboardService";
import { baseGetById, basePost } from "../../services/baseCall";
import { getUserMealPlans } from "../../services/mealPlanService";

// --- Componentes ---
import { ProgressCard } from "../../components/ProgressCard";
import { MealItem } from "../../components/meal/mealItem";
import { AddMealModal } from "../../components/meal/addMealModal"; // Modal de Busca
import { AddMealDialog } from "../../components/meal/addMealDialog"; // Dialog de Qtd
import { CreateMealCategoryModal } from "../../components/meal/createMealCategoryModal"; // Modal de Nova Categoria

// Tipo auxiliar para a configuração da refeição
type MealConfig = {
    meal_id: number;
    meal_name: string;
};

export default function SeeFoodTracker() {
    const { width } = useWindowDimensions();
    const isMobile = width < BREAKPOINTS.MOBILE;

    // --- Estados de Controle de Modais ---
    const [foodModalVisible, setFoodModalVisible] = useState(false);
    const [mealModalVisible, setMealModalVisible] = useState(false);
    const [selectedMealForDialog, setSelectedMealForDialog] = useState<any | null>(null);

    // --- Estados de Dados ---
    const [meals, setMeals] = useState<Meal[]>([]);
    const [planMeals, setPlanMeals] = useState<MealConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [targetMealCategory, setTargetMealCategory] = useState<string>("");

    // --- Estados do ProgressCard (Metas) ---
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [targets, setTargets] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 70 });

    // --- FUNÇÃO CENTRAL DE CARREGAMENTO ---
    const loadData = async () => {
        try {
            // 1. Busca Metas e Totais
            const dashData = await getDashboardData();
            if (dashData) {
                // CORREÇÃO: Preenche os Targets (Metas)
                setTargets({
                    calories: dashData.stats.calories.target,
                    protein: dashData.stats.macros.protein.target,
                    carbs: dashData.stats.macros.carbs.target,
                    fat: dashData.stats.macros.fats.target
                });
                // CORREÇÃO: Preenche os Totals (Consumidos)
                setTotals({
                    calories: dashData.stats.calories.current,
                    protein: dashData.stats.macros.protein.current,
                    carbs: dashData.stats.macros.carbs.current,
                    fat: dashData.stats.macros.fats.current
                });
            }

            // 2. Busca Configuração do Plano
            const configData = await getPlanMealsConfig();
            setPlanMeals(configData);

            const validMealIds = new Set(configData.map((c: any) => c.meal_id));

            // 3. Busca Registros de Comida
            const listData = await getDailyMeals();

            if (listData && Array.isArray(listData)) {
                const mappedMeals = await Promise.all(listData.map(async (record: any) => {
                    // Filtro de plano ativo
                    if (!validMealIds.has(record.meal_id)) return null;

                    let alimentData = record.aliment;
                    // REQUER baseGetById
                    if (!alimentData && record.aliment_id) {
                        try {
                            const alimRes = await baseGetById('aliments', record.aliment_id);
                            alimentData = alimRes?.data;
                        } catch (e) { }
                    }
                    if (!alimentData) return null;

                    const baseCalories = Number(alimentData.calories_100g) || 0;
                    const amountConsumed = Number(record.amount) || 0;
                    const realCalories = (baseCalories * amountConsumed) / 100;

                    const mealConfig = configData.find((c: any) => c.meal_id === record.meal_id);
                    const mealName = mealConfig ? mealConfig.meal_name : "Outros";

                    return {
                        id: record.record_id,
                        name: alimentData.name,
                        category: mealName,
                        calories: Math.round(realCalories),
                    };
                }));

                setMeals(mappedMeals.filter((item): item is Meal => item !== null));
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);
    useFocusEffect(useCallback(() => { loadData(); }, []));

    // --- AGRUPAMENTO ---
    const groupedMeals = meals.reduce((acc: Record<string, Meal[]>, meal) => {
        if (!acc[meal.category]) acc[meal.category] = [];
        acc[meal.category].push(meal);
        return acc;
    }, {});

    // --- HANDLERS ---

    const openAddFoodModal = (categoryName: string) => {
        setTargetMealCategory(categoryName);
        setFoodModalVisible(true);
    };

    const handleAddRecord = async (alimentId: number, amount: number, _ignoredCat: string) => {
        try {
            const userIdStr = await getItem('id');
            if (!userIdStr) return;

            await registerConsumedFood(Number(userIdStr), alimentId, amount, targetMealCategory);

            await loadData();
        } catch (e) { Alert.alert("Erro", "Falha ao salvar."); }
    };

    const handleCreateMealCategory = async (name: string) => {
        try {
            const plans = await getUserMealPlans();
            const activePlan = plans.find((p: any) => p.active) || plans[0];

            if (!activePlan) return Alert.alert("Aviso", "Crie um plano no Dashboard primeiro.");

            await basePost('meals', {
                meal_name: name,
                meal_type: "FREE",
                plan_id: activePlan.plan_id
            });

            await loadData();
        } catch (e) { Alert.alert("Erro", "Falha ao criar refeição."); }
    };

    // --- DELETAR CATEGORIA (COM LIMPEZA) ---
    const handleDeleteCategory = (mealId: number, mealName: string) => {
        Alert.alert(
            "Excluir Refeição",
            `Deseja excluir "${mealName}"? Isso apagará todos os alimentos históricos desta categoria.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            // CHAMADA DA FUNÇÃO FAXINEIRA (limpa registros antes de apagar a categoria)
                            await forceDeleteMealCategory(mealId);
                            await loadData();
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível excluir a categoria.");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // --- DELETAR ITEM ---
    const handleDeleteMeal = async (id: number) => {
        try {
            await deleteMealRecord(id);
            await loadData();
        } catch { Alert.alert("Erro", "Falha ao remover."); }
    };

    // --- ADICIONAR EXISTENTE (COMPLETA) ---
    const handleAddExisting = async (amount: number) => {
        if (!selectedMealForDialog) return;

        try {
            const userIdStr = await getItem('id');
            if (!userIdStr) return Alert.alert("Erro", "Login necessário");
            const userId = Number(userIdStr);
            const targetCat = targetMealCategory || (planMeals.length > 0 ? planMeals[0].meal_name : "Almoço");

            await registerConsumedFood(userId, selectedMealForDialog.id, amount, targetCat);

            setSelectedMealForDialog(null);
            await loadData();
            Alert.alert("Sucesso", "Registrado!");
        } catch (e: any) {
            Alert.alert("Erro", e.message || "Falha ao registrar.");
        }
    };


    return (
        <View style={styles.safeArea}>
            <ScrollView contentContainerStyle={[styles.container, !isMobile && styles.containerDesktop]}>

                <ProgressCard totals={totals} targets={targets} />

                {isLoading && planMeals.length === 0 ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.mealGrid}>

                        {planMeals.length === 0 && (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={styles.emptyText}>Nenhuma refeição configurada. Crie uma abaixo!</Text>
                            </View>
                        )}

                        {/* Renderiza APENAS as categorias do Plano Ativo */}
                        {planMeals.map((config) => {
                            const items = groupedMeals[config.meal_name] || [];

                            return (
                                <View key={config.meal_id} style={styles.mealSection}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.mealCategory}>{config.meal_name}</Text>

                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {/* Delete Categoria */}
                                            <Pressable onPress={() => handleDeleteCategory(config.meal_id, config.meal_name)} style={styles.miniButton}>
                                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF6B6B" />
                                            </Pressable>

                                            {/* Adicionar Comida */}
                                            <Pressable onPress={() => openAddFoodModal(config.meal_name)} style={styles.miniButton}>
                                                <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
                                            </Pressable>
                                        </View>
                                    </View>

                                    {items.length > 0 ? (
                                        items.map(meal => (
                                            <MealItem key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
                                        ))
                                    ) : (
                                        <Pressable style={styles.emptyItemPlaceholder} onPress={() => openAddFoodModal(config.meal_name)}>
                                            <Text style={styles.emptyItemText}>Toque para adicionar alimento</Text>
                                        </Pressable>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Botão Principal: CRIA NOVA CATEGORIA */}
                <Pressable
                    style={[styles.addButton, !isMobile && styles.addButtonDesktop]}
                    onPress={() => setMealModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>Criar Nova Refeição (Ex: Lanche)</Text>
                </Pressable>
            </ScrollView>

            <AddMealModal
                visible={foodModalVisible}
                onClose={() => setFoodModalVisible(false)}
                onAdd={handleAddRecord}
            />

            <CreateMealCategoryModal
                visible={mealModalVisible}
                onClose={() => setMealModalVisible(false)}
                onCreate={handleCreateMealCategory}
            />

            <AddMealDialog
                visible={!!selectedMealForDialog}
                selectedItem={selectedMealForDialog}
                onDismiss={() => setSelectedMealForDialog(null)}
                onConfirm={handleAddExisting}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    scrollView: { flex: 1 },
    container: { paddingVertical: 20, paddingHorizontal: 16 },
    containerDesktop: { maxWidth: 800, alignSelf: "center", width: "100%" },

    mealGrid: { marginTop: 12 },

    mealSection: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 4
    },
    mealCategory: { fontSize: 16, fontWeight: "700", color: COLORS.textDark },

    miniButton: {
        padding: 6,
        backgroundColor: '#FAFAFA',
        borderRadius: 20,
        marginLeft: 4
    },

    emptyItemPlaceholder: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        marginTop: 5
    },
    emptyItemText: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic' },
    emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 20, width: '100%', fontStyle: 'italic' },

    addButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 16,
        alignSelf: "stretch",
        marginBottom: 40
    },
    addButtonDesktop: { alignSelf: "center", width: 280 },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});