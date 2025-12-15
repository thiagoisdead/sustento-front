import { baseFetch, baseGetById } from './baseCall';
import { getItem } from './secureStore';

const getLocalTodayStr = (): string => {
    const today = new Date();
    const year = today?.getFullYear();
    const month = String(today?.getMonth() + 1).padStart(2, '0');
    const day = String(today?.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

const safeNum = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : Math.abs(n);
};

const fetchAndEnrichMeals = async (planId: number, userId: number, targetDate: string) => {
    const mealsConfigRes = await baseFetch(`meals?plan_id=${planId}`);
    let allPlanMeals = Array.isArray(mealsConfigRes?.data) ? mealsConfigRes?.data : [];

    allPlanMeals = allPlanMeals?.filter((m: any) => String(m?.plan_id) === String(planId));

    return await Promise.all(allPlanMeals?.map(async (meal: any) => {
        let stats = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        let foodsList: any[] = [];

        try {
            const recordsRes = await baseFetch(`mealAliments?user_id=${userId}&meal_id=${meal?.meal_id}`);
            let records = Array.isArray(recordsRes?.data) ? recordsRes?.data : [];

            records = records?.filter((r: any) =>
                String(r?.user_id) === String(userId) &&
                String(r?.meal_id) === String(meal?.meal_id) &&
                normalizeDate(r?.meal_date) === targetDate
            );

            foodsList = await Promise.all(records?.map(async (record: any) => {
                try {
                    const alimRes = await baseGetById('aliments', record?.aliment_id);
                    const alim = alimRes?.data || {};
                    const qty = safeNum(record?.amount);
                    const ratio = qty / 100;

                    const itemStats = {
                        calories: Math.round(safeNum(alim?.calories_100g) * ratio),
                        protein: Math.round(safeNum(alim?.protein_100g) * ratio),
                        carbs: Math.round(safeNum(alim?.carbs_100g) * ratio),
                        fat: Math.round(safeNum(alim?.fat_100g) * ratio),
                    };

                    stats.calories += itemStats?.calories;
                    stats.protein += itemStats?.protein;
                    stats.carbs += itemStats?.carbs;
                    stats.fat += itemStats?.fat;

                    return {
                        record_id: record?.record_id,
                        name: alim?.name || "Carregando...",
                        amount: qty,
                        unit: record?.unit || 'g',
                        ...itemStats
                    };
                } catch { return null; }
            }) || []);
            foodsList = foodsList?.filter(f => f !== null);
        } catch (e) { }

        return {
            ...meal,
            created_at_normalized: targetDate,
            is_recurring: false,
            stats,
            foods: foodsList
        };
    }) || []);
};

const calculateWeeklyActivity = (enrichedMeals: any[], startDateStr: string, todayIso: string, targetCalories: number) => {
    const weeklyActivity = [];
    let loopDate = new Date();

    if (startDateStr) {
        const parts = startDateStr?.split('-');
        loopDate = new Date(Number(parts?.[0]), Number(parts?.[1]) - 1, Number(parts?.[2]));
    }
    loopDate?.setHours(0, 0, 0, 0);

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(loopDate);
        d?.setDate(loopDate?.getDate() + i);

        const y = d?.getFullYear();
        const m = String(d?.getMonth() + 1).padStart(2, '0');
        const day = String(d?.getDate()).padStart(2, '0');
        const isoDate = `${y}-${m}-${day}`;

        let dayTotalCals = 0;

        if (isoDate > todayIso) {
            dayTotalCals = 0;
        } else {
            const mealsOfDay = enrichedMeals?.filter(meal => {
                return meal?.created_at_normalized === isoDate;
            });
            dayTotalCals = mealsOfDay?.reduce((acc, meal) => acc + (meal?.stats?.calories || 0), 0);
        }

        weeklyActivity?.push({
            day: weekDays?.[d?.getDay()],
            date: isoDate,
            current: Math.round(dayTotalCals),
            target: targetCalories
        });
    }
    return weeklyActivity;
};

const calculateDailyData = (enrichedMeals: any[]) => {
    const selectedMeals = [...(enrichedMeals || [])];

    selectedMeals?.sort((a: any, b: any) => {
        const tA = a?.time || "23:59";
        const tB = b?.time || "23:59";
        return tA?.localeCompare(tB);
    });

    const dayTotalStats = selectedMeals?.reduce((acc: any, meal: any) => {
        return {
            calories: (acc?.calories || 0) + (meal?.stats?.calories || 0),
            protein: (acc?.protein || 0) + (meal?.stats?.protein || 0),
            carbs: (acc?.carbs || 0) + (meal?.stats?.carbs || 0),
            fat: (acc?.fat || 0) + (meal?.stats?.fat || 0),
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const todayMealsSummary = selectedMeals?.map((meal: any) => ({
        meal_name: meal?.meal_name,
        foods: meal?.foods,
        stats: meal?.stats
    }));

    return { dayTotalStats, todayMealsSummary };
};

export const getDashboardData = async (startDate?: string, endDate?: string, targetDateStr?: string) => {
    try {
        const userIdStr = await getItem('id');
        if (!userIdStr) return null;
        const userId = Number(userIdStr);

        const realTodayIso = getLocalTodayStr();
        const processingDate = targetDateStr || realTodayIso;

        const plansRes = await baseFetch(`mealPlans?user_id=${userId}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];

        const activePlan = userPlans?.find((p: any) => p?.active === true || p?.active === 1);

        if (!activePlan) {
            return null;
        }

        const targets = {
            calories: safeNum(activePlan?.target_calories) || 2000,
            protein: safeNum(activePlan?.target_protein) || 150,
            carbs: safeNum(activePlan?.target_carbs) || 250,
            fat: safeNum(activePlan?.target_fat) || safeNum(activePlan?.target_fats) || 70,
            water: safeNum(activePlan?.target_water) || 2500,
        };

        const enrichedMeals = await fetchAndEnrichMeals(activePlan?.plan_id, userId, processingDate);

        const weeklyActivity = calculateWeeklyActivity(
            enrichedMeals,
            startDate || realTodayIso,
            realTodayIso,
            targets?.calories
        );

        const { dayTotalStats, todayMealsSummary } = calculateDailyData(enrichedMeals);

        return {
            stats: {
                calories: { current: Math.round(dayTotalStats?.calories || 0), target: targets?.calories },
                water: { current: 0, target: targets?.water },
                macros: {
                    protein: { current: Math.round(dayTotalStats?.protein || 0), target: targets?.protein },
                    carbs: { current: Math.round(dayTotalStats?.carbs || 0), target: targets?.carbs },
                    fats: { current: Math.round(dayTotalStats?.fat || 0), target: targets?.fat },
                }
            },
            weeklyActivity,
            todayMealsSummary
        };

    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return null;
    }
};