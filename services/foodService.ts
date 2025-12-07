import { basePost, baseUniqueGet, baseDelete, baseFetch } from './baseCall';
import { getUserMealPlans } from './mealPlanService';
import { getItem } from './secureStore';

// --- Helpers de Formatação de Data ---
const getFormattedDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const getFormattedTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// --- FUNÇÕES DE BUSCA E CRIAÇÃO BÁSICA ---

// Busca Configurações de Refeição do Plano Ativo (para montar a UI)
export const getPlanMealsConfig = async () => {
    const plans = await getUserMealPlans();
    const activePlan = plans.find(p => p.active);

    if (!activePlan) return [];

    const response = await baseFetch(`meals?plan_id=${activePlan.plan_id}`);
    const allMeals = Array.isArray(response?.data) ? response.data : [];

    // Filtra no frontend, caso o backend não filtre
    return allMeals.filter((meal: any) => meal.plan_id === activePlan.plan_id);
};

// Busca Registros de Consumo do Usuário
export const getDailyMeals = async () => {
    const response = await baseUniqueGet('mealRecords/user');
    return response?.data || [];
};

export const searchAliments = async (query: string) => {
    if (!query) return [];
    const response = await baseFetch(`aliments?name=${query}`);
    return response?.data || [];
};

export const createAliment = async (name: string, calories100g: number) => {
    const payload = {
        name,
        calories_100g: calories100g,
        protein_100g: 0, carbs_100g: 0, fat_100g: 0, saturated_fat_100g: 0,
        fiber_100g: 0, sugar_100g: 0, sodium_100g: 0
    };
    return await basePost('aliments', payload);
};

// --- FUNÇÃO MESTRA DE REGISTRO ---
export const registerConsumedFood = async (userId: number, alimentId: number, amount: number, mealCategoryName: string) => {

    const plans = await getUserMealPlans();
    const activePlan = plans.find(p => p.active) || plans[plans.length - 1];

    if (!activePlan) {
        throw new Error("Você precisa criar um Plano Alimentar no Dashboard antes de registrar refeições.");
    }

    // Tenta achar ou criar a Categoria (Meal)
    const mealsRes = await baseFetch(`meals?plan_id=${activePlan.plan_id}`);
    const planMeals = Array.isArray(mealsRes?.data) ? mealsRes?.data : [];

    let targetMeal = planMeals.find((m: any) => m.meal_name.toLowerCase() === mealCategoryName.toLowerCase());
    let mealId = targetMeal?.meal_id;

    if (!mealId) {
        const newMealRes = await basePost('meals', {
            meal_name: mealCategoryName,
            meal_type: "FREE",
            plan_id: activePlan.plan_id
        });

        mealId = newMealRes?.data?.meal_id || newMealRes?.data?.id;

        if (!mealId) throw new Error("Falha ao criar categoria de refeição.");
    }

    // Cria o Registro (MealRecord)
    const now = new Date();
    const payload = {
        user_id: userId,
        meal_id: mealId,
        aliment_id: alimentId,
        amount: amount,
        unit: 'G',
        meal_date: getFormattedDate(now),
        meal_moment: getFormattedTime(now)
    };

    return await basePost('mealRecords', payload);
};

// --- FUNÇÕES DE DELETE ---

// Delete de Item de Comida (Registro)
export const deleteMealRecord = async (recordId: number) => {
    // Usando URL param /:id
    return await baseDelete(`mealRecords/${recordId}`);
};

// Delete de Categoria de Refeição (Meal)
export const deleteMealCategory = async (mealId: number) => {
    return await baseDelete(`meals/${mealId}`);
};

// Força o Delete da Categoria (Lógica Faxineira)
export const forceDeleteMealCategory = async (mealId: number) => {
    try {
        console.log(`🧹 Iniciando faxina da categoria ${mealId}...`);

        // 1. Busca TODOS os registros do sistema (sem filtro de user/data)
        const response = await baseFetch('mealRecords');
        const allRecords = Array.isArray(response?.data) ? response.data : [];

        // 2. Acha os culpados (registros com este mealId)
        const recordsToDelete = allRecords.filter((r: any) => r.meal_id == mealId);

        console.log(`🗑️ Encontrados ${recordsToDelete.length} registros filhos para apagar.`);

        // 3. Apaga filhos (usando a função que já temos)
        const deletePromises = recordsToDelete.map((r: any) =>
            deleteMealRecord(r.record_id)
        );
        await Promise.all(deletePromises);

        // 4. Apaga o Pai
        console.log("✅ Filhos apagados. Deletando categoria...");
        return await deleteMealCategory(mealId);

    } catch (error: any) {
        console.error("Erro na faxina:", error.message);
        throw error;
    }
};