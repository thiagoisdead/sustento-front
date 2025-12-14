import { baseFetch, baseGetById } from './baseCall';
import { getItem } from './secureStore';

// --- HELPERS ---
const getLocalTodayStr = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const normalizeDate = (dateInput: any): string => {
    if (!dateInput) return "";
    const s = String(dateInput);
    if (s.includes('T')) return s.split('T')[0];
    if (s.includes('/')) {
        const parts = s.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return s;
};

const safeNum = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : Math.abs(n);
};

// ====================================================================
// 1. CARREGAR DADOS BRUTOS (CACHE)
// ====================================================================
const fetchAndEnrichMeals = async (planId: number) => {
    const mealsConfigRes = await baseFetch(`meals?plan_id=${planId}`);
    const allPlanMeals = Array.isArray(mealsConfigRes?.data) ? mealsConfigRes?.data : [];

    return await Promise.all(allPlanMeals.map(async (meal: any) => {
        let stats = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        let foodsList: any[] = [];

        try {
            const maRes = await baseFetch(`mealAliments?meal_id=${meal.meal_id}`);
            let mealAliments = Array.isArray(maRes?.data) ? maRes?.data : [];
            mealAliments = mealAliments.filter((ma: any) => String(ma.meal_id) === String(meal.meal_id));

            foodsList = await Promise.all(mealAliments.map(async (ma: any) => {
                try {
                    const alimRes = await baseGetById('aliments', ma.aliment_id);
                    const alim = alimRes?.data || {};
                    const qty = safeNum(ma.quantity);
                    const ratio = qty / 100;

                    const itemStats = {
                        calories: Math.round(safeNum(alim.calories_100g) * ratio),
                        protein: Math.round(safeNum(alim.protein_100g) * ratio),
                        carbs: Math.round(safeNum(alim.carbs_100g) * ratio),
                        fat: Math.round(safeNum(alim.fat_100g) * ratio),
                    };

                    stats.calories += itemStats.calories;
                    stats.protein += itemStats.protein;
                    stats.carbs += itemStats.carbs;
                    stats.fat += itemStats.fat;

                    return {
                        name: alim.name || "Carregando...",
                        amount: qty,
                        unit: ma.measurement_unit || 'g',
                        ...itemStats
                    };
                } catch { return null; }
            }));
            foodsList = foodsList.filter(f => f !== null);
        } catch (e) { }

        return {
            ...meal,
            created_at_normalized: normalizeDate(meal.created_at),
            stats,
            foods: foodsList
        };
    }));
};

// ====================================================================
// 2. LÓGICA DO GRÁFICO SEMANAL
// ====================================================================
const calculateWeeklyActivity = (enrichedMeals: any[], startDateStr: string, todayIso: string, targetCalories: number) => {
    const weeklyActivity = [];
    let loopDate = new Date();

    if (startDateStr) {
        const parts = startDateStr.split('-');
        loopDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    loopDate.setHours(0, 0, 0, 0);

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(loopDate);
        d.setDate(loopDate.getDate() + i);

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const isoDate = `${y}-${m}-${day}`;

        let dayTotalCals = 0;

        // REGRA: Se a data do gráfico é futura (> hoje), valor é 0.
        if (isoDate > todayIso) {
            dayTotalCals = 0;
        } else {
            // REGRA: Passado ou Hoje
            const mealsOfDay = enrichedMeals.filter(meal => {

                // --- CORREÇÃO CRÍTICA ---
                // Se a data do gráfico é HOJE, ignoramos a checagem rigorosa de criação.
                // Isso resolve o problema de fuso horário onde 'created_at' (UTC) > 'todayIso' (Local).
                // Para dias PASSADOS, mantemos a checagem para evitar dados fantasmas.
                if (isoDate !== todayIso) {
                    if (isoDate < meal.created_at_normalized) return false;
                }

                if (meal.is_recurring) return true;
                return meal.created_at_normalized === isoDate;
            });

            dayTotalCals = mealsOfDay.reduce((acc, meal) => acc + meal.stats.calories, 0);
        }

        weeklyActivity.push({
            day: weekDays[d.getDay()],
            date: isoDate,
            current: Math.round(dayTotalCals),
            target: targetCalories
        });
    }
    return weeklyActivity;
};

// ====================================================================
// 3. LÓGICA DO DIA SELECIONADO (Cards + Lista)
// ====================================================================
const calculateDailyData = (enrichedMeals: any[], targetDateIso: string) => {
    const selectedMeals = enrichedMeals.filter(meal => {
        // Para os cards, somos permissivos com recorrentes para garantir
        // que apareçam sempre, independente de hora de criação.
        if (meal.is_recurring) return true;
        return meal.created_at_normalized === targetDateIso;
    });

    selectedMeals.sort((a: any, b: any) => {
        const tA = a.time || "23:59";
        const tB = b.time || "23:59";
        return tA.localeCompare(tB);
    });

    const dayTotalStats = selectedMeals.reduce((acc: any, meal: any) => {
        return {
            calories: acc.calories + meal.stats.calories,
            protein: acc.protein + meal.stats.protein,
            carbs: acc.carbs + meal.stats.carbs,
            fat: acc.fat + meal.stats.fat,
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const todayMealsSummary = selectedMeals.map((meal: any) => ({
        meal_name: meal.meal_name,
        foods: meal.foods
    }));

    return { dayTotalStats, todayMealsSummary };
};


// ====================================================================
// EXPORTAÇÃO PRINCIPAL
// ====================================================================
export const getDashboardData = async (startDate?: string, endDate?: string, targetDateStr?: string) => {
    try {
        const userIdStr = await getItem('id');
        if (!userIdStr) return null;
        const userId = Number(userIdStr);

        const filterDateIso = targetDateStr || getLocalTodayStr();
        const realTodayIso = getLocalTodayStr();

        // 1. BUSCAR PLANO
        const plansRes = await baseFetch(`mealPlans?user_id=${userId}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];
        const activePlan = userPlans.filter((p: any) => p.active)
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
            || userPlans[0];

        if (!activePlan) return null;

        const targets = {
            calories: safeNum(activePlan.target_calories) || 2000,
            protein: safeNum(activePlan.target_protein) || 150,
            carbs: safeNum(activePlan.target_carbs) || 250,
            fat: safeNum(activePlan.target_fat) || safeNum(activePlan.target_fats) || 70,
            water: safeNum(activePlan.target_water) || 2500,
        };

        // 2. BUSCA DADOS E PREPARA
        const enrichedMeals = await fetchAndEnrichMeals(activePlan.plan_id);

        // 3. CALCULA GRÁFICO (Sem futuros, sem fantasmas, COM HOJE)
        const weeklyActivity = calculateWeeklyActivity(
            enrichedMeals,
            startDate || realTodayIso,
            realTodayIso,
            targets.calories
        );

        // 4. CALCULA DADOS DO DIA SELECIONADO
        const { dayTotalStats, todayMealsSummary } = calculateDailyData(enrichedMeals, filterDateIso);

        return {
            stats: {
                calories: { current: Math.round(dayTotalStats.calories), target: targets.calories },
                water: { current: 0, target: targets.water },
                macros: {
                    protein: { current: Math.round(dayTotalStats.protein), target: targets.protein },
                    carbs: { current: Math.round(dayTotalStats.carbs), target: targets.carbs },
                    fats: { current: Math.round(dayTotalStats.fat), target: targets.fat },
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