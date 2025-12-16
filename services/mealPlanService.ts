import { baseDelete, baseFetch, basePost, basePutById } from './baseCall';
import { MealPlan } from '../types/meals';
import { getItem } from './secureStore';

const ROUTE = 'mealPlans';

export const getUserMealPlans = async (): Promise<MealPlan[]> => {
    try {
        // 1. Pega o ID do usuário logado
        const userIdStr = await getItem('id');
        if (!userIdStr) return [];

        const userId = Number(userIdStr);

        // 2. Faz a chamada (enviamos ?user_id=X caso o backend suporte filtro na query)
        const response = await baseFetch(`${ROUTE}?user_id=${userId}`);

        const allPlans = Array.isArray(response?.data) ? response.data : [];

        // 3. FILTRO DE SEGURANÇA NO FRONTEND
        // Isso garante que, mesmo que o backend devolva tudo, nós só mostramos o do usuário.
        const myPlans = allPlans.filter((plan: MealPlan) => plan.user_id === userId);

        return myPlans;

    } catch (error) {
        console.error("Erro ao buscar planos:", error);
        return [];
    }
};

export const activateMealPlan = async (planId: number) => {
    return await basePutById(ROUTE, planId, { active: true });
};

export const deactivateMealPlan = async (planId: number) => {
    return await basePutById(ROUTE, planId, { active: false });
};

// Desativa o antigo (se houver) e ativa o novo
export const switchActivePlan = async (newPlanId: number, currentActiveId?: number) => {
    try {
        // Se tiver um plano rodando, desativa ele primeiro
        if (currentActiveId) {
            await basePutById(ROUTE, currentActiveId, { active: false });
        }

        // Ativa o novo
        await basePutById(ROUTE, newPlanId, { active: true });
        return true;
    } catch (error) {
        console.error("Erro ao trocar plano:", error);
        return false;
    }
};

export const createNewMealPlan = async (name: string, source: 'AUTOMATIC' | 'MANUAL' = 'AUTOMATIC') => {
    const userIdStr = await getItem('id');
    if (!userIdStr) throw new Error("Usuário não logado");

    const payload = {
        plan_name: name,
        source: source,
        active: true,
        user_id: Number(userIdStr)
    };

    return await basePost(ROUTE, payload);
};

export const deleteMealPlan = async (planId: number) => {
    return await baseDelete(`${ROUTE}/${planId}`);
};