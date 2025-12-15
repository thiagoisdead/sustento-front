import { useState, useEffect, useCallback } from "react";
import { getItem } from "../services/secureStore"; // Ajuste o caminho se necessário
import { baseFetch, baseGetById } from "../services/baseCall"; // Ajuste o caminho se necessário
import { getTodaysDate } from "../utils/dateHelpers";
import { FoodItem, MealGroup } from "../types/calendar";

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

export const useSeeCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(getTodaysDate());

    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [activePlanId, setActivePlanId] = useState<number | null>(null);
    const [groupedMeals, setGroupedMeals] = useState<MealGroup[]>([]);

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

    const fetchDailyPlan = useCallback(async () => {
        if (!activePlanId || !selectedDate || !userId) return;

        setIsLoading(true);
        try {
            const mealsRes = await baseFetch(`meals?plan_id=${activePlanId}`);
            let allPlanMeals = Array.isArray(mealsRes?.data) ? mealsRes?.data : [];

            allPlanMeals = allPlanMeals?.filter((m: any) => String(m?.plan_id) === String(activePlanId));

            const mealsWithFoods = await Promise.all(allPlanMeals?.map(async (meal: any) => {
                try {
                    const maRes = await baseFetch(`mealAliments?user_id=${userId}&meal_id=${meal?.meal_id}`);
                    let allMa = Array.isArray(maRes?.data) ? maRes?.data : [];

                    const mealAliments = allMa?.filter((ma: any) =>
                        String(ma?.user_id) === String(userId) &&
                        String(ma?.meal_id) === String(meal?.meal_id) &&
                        normalizeDate(ma?.meal_date) === selectedDate
                    );

                    const foodsDetails = await Promise.all(mealAliments?.map(async (ma: any) => {
                        try {
                            const alimRes = await baseGetById('aliments', ma?.aliment_id);
                            const alim = alimRes?.data || {};

                            const qty = safeNum(ma?.amount);
                            const ratio = qty / 100;
                            const cals = safeNum(alim?.calories_100g) * ratio;

                            return {
                                id: ma?.aliment_id,
                                mealAlimentId: ma?.record_id,
                                name: alim?.name || "Carregando...",
                                quantity: qty,
                                unit: ma?.unit || 'g',
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