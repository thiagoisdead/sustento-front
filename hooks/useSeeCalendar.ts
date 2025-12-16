import { useState, useEffect, useCallback } from "react";
import { getItem } from "../services/secureStore";
import { baseFetch, baseGetById } from "../services/baseCall";
import { getTodaysDate } from "../utils/dateHelpers"; // Verifique se o nome do arquivo é dateHelper ou dateHelpers

// --- Tipos Locais ---
export interface FoodItem {
    id: number;
    name: string;
    calories: number;
    quantity: number;
    unit: string;
    mealRecordId: number; // Alterado de mealAlimentId para mealRecordId para clareza
}

export interface MealGroup {
    meal_id: number;
    meal_name: string;
    timeRaw: string;
    displayTime: string;
    foods: FoodItem[];
    totalCalories: number;
}

// --- Helpers Internos ---
const normalizeDate = (dateInput: any): string => {
    if (!dateInput) return "";
    const s = String(dateInput);
    if (s?.includes('T')) return s?.split('T')?.[0];
    if (s?.includes('/')) {
        const parts = s?.split('/');
        return `${parts?.[2]}-${parts?.[1]}-${parts?.[0]}`;
    }
    return s;
};

const extractTime = (isoTime: string | null) => {
    if (!isoTime) return "";
    try {
        const date = new Date(isoTime);
        const hours = String(date?.getUTCHours()).padStart(2, '0');
        const minutes = String(date?.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (e) { return ""; }
};

const safeNum = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : Math.abs(n);
};

// --- HOOK PRINCIPAL ---
export const useSeeCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(getTodaysDate());

    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [activePlanId, setActivePlanId] = useState<number | null>(null);
    const [groupedMeals, setGroupedMeals] = useState<MealGroup[]>([]);

    // 1. Carrega dados iniciais do usuário
    const fetchInitialData = async () => {
        const idStr = await getItem('id');
        if (!idStr) return;
        const uid = Number(idStr);
        setUserId(uid);

        const plansRes = await baseFetch(`mealPlans?user_id=${uid}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];
        const active = userPlans?.find((p: any) => p?.active === true || p?.active === 1) || userPlans?.[0];

        if (active) {
            setActivePlanId(active?.plan_id);
        }
    };

    // 2. Busca o plano do dia
    const fetchDailyPlan = useCallback(async () => {
        if (!activePlanId || !selectedDate || !userId) return;

        setIsLoading(true);
        try {
            // A. Busca as definições de refeição (Café, Almoço, Janta...) do plano
            const mealsRes = await baseFetch(`meals?plan_id=${activePlanId}`);
            let allPlanMeals = Array.isArray(mealsRes?.data) ? mealsRes?.data : [];

            allPlanMeals = allPlanMeals?.filter((m: any) => String(m?.plan_id) === String(activePlanId));

            // B. Para cada refeição, busca os REGISTROS DE COMIDA (mealRecords) naquela data
            const mealsWithFoods = await Promise.all(allPlanMeals?.map(async (meal: any) => {
                try {
                    // AQUI: Mudança para endpoint mealRecords
                    const recordsRes = await baseFetch(`mealRecords?user_id=${userId}&meal_id=${meal?.meal_id}`);
                    let allRecords = Array.isArray(recordsRes?.data) ? recordsRes?.data : [];

                    // Filtra: É deste usuário? É desta refeição? É DESTA DATA?
                    const dailyRecords = allRecords?.filter((rec: any) =>
                        String(rec?.user_id) === String(userId) &&
                        String(rec?.meal_id) === String(meal?.meal_id) &&
                        normalizeDate(rec?.meal_date) === selectedDate
                    );

                    // C. Hidrata com detalhes do Alimento (Nome, Calorias)
                    const foodsDetails = await Promise.all(dailyRecords?.map(async (rec: any) => {
                        try {
                            const alimRes = await baseGetById('aliments', rec?.aliment_id);
                            const alim = alimRes?.data || {};

                            const qty = safeNum(rec?.amount);
                            const ratio = qty / 100;
                            const cals = safeNum(alim?.calories_100g) * ratio;

                            return {
                                id: rec?.aliment_id,
                                mealRecordId: rec?.record_id, // ID único do registro
                                name: alim?.name || "Carregando...",
                                quantity: qty,
                                unit: rec?.unit || 'g',
                                calories: Math.round(cals)
                            } as FoodItem;
                        } catch (e) { return null; }
                    }) || []);

                    const validFoods = foodsDetails?.filter(f => f !== null) as FoodItem[];

                    return {
                        meal_id: meal?.meal_id,
                        meal_name: meal?.meal_name,
                        timeRaw: meal?.time || "23:59:59",
                        displayTime: extractTime(meal?.time),
                        foods: validFoods,
                        totalCalories: validFoods?.reduce((acc, f) => acc + (f?.calories || 0), 0)
                    };

                } catch (e) {
                    return null;
                }
            }) || []);

            const finalGroups = mealsWithFoods?.filter(g => g !== null) as MealGroup[];

            // Ordena refeições por horário
            finalGroups?.sort((a, b) => {
                if (a?.timeRaw < b?.timeRaw) return -1;
                if (a?.timeRaw > b?.timeRaw) return 1;
                return 0;
            });

            setGroupedMeals(finalGroups);

        } catch (error) {
            console.error("Erro no calendário:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activePlanId, selectedDate, userId]);

    useEffect(() => { fetchInitialData(); }, []);

    useEffect(() => {
        if (activePlanId && userId) {
            fetchDailyPlan();
        }
    }, [selectedDate, activePlanId, userId, fetchDailyPlan]);

    return {
        selectedDate,
        setSelectedDate,
        groupedMeals,
        isLoading
    };
};