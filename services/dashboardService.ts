import { baseFetch, baseGetById } from './baseCall';
import { getItem } from './secureStore';

// --- HELPERS DE DATA ---

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
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return s;
};

const safeNum = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : Math.abs(n);
};

export const getDashboardData = async (startDate?: string, endDate?: string, targetDateStr?: string) => {
    try {
        const userIdStr = await getItem('id');
        if (!userIdStr) return null;
        const userId = Number(userIdStr);

        const filterDateIso = targetDateStr || getLocalTodayStr();
        console.log(`📊 Dashboard (Plano) | Data: ${filterDateIso}`);

        // 1. BUSCAR PLANO ATIVO
        const plansRes = await baseFetch(`mealPlans?user_id=${userId}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];

        const activePlan = userPlans.filter((p: any) => p.active)
            .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
            || userPlans[0];

        if (!activePlan) return null;

        // Metas do Plano (Target)
        const targets = {
            calories: safeNum(activePlan.target_calories) || 2000,
            protein: safeNum(activePlan.target_protein) || 150,
            carbs: safeNum(activePlan.target_carbs) || 250,
            fat: safeNum(activePlan.target_fat) || safeNum(activePlan.target_fats) || 70,
            water: safeNum(activePlan.target_water) || 2500,
        };

        // 2. BUSCAR TODAS AS REFEIÇÕES DO PLANO
        const mealsConfigRes = await baseFetch(`meals?plan_id=${activePlan.plan_id}`);
        const allPlanMeals = Array.isArray(mealsConfigRes?.data) ? mealsConfigRes?.data : [];

        // 3. FILTRAR REFEIÇÕES PELA DATA SELECIONADA
        const todaysPlanMeals = allPlanMeals.filter((cat: any) => {
            const isRecurring = cat.time && String(cat.time).includes('1970');
            if (isRecurring) return true;
            return normalizeDate(cat.created_at) === filterDateIso;
        });

        // Ordenar por horário
        todaysPlanMeals.sort((a: any, b: any) => {
            const timeA = a.time || "23:59";
            const timeB = b.time || "23:59";
            return timeA.localeCompare(timeB);
        });

        // Variáveis para somar os totais do dia (Para os Cards)
        let totalStats = { calories: 0, protein: 0, carbs: 0, fat: 0 };

        // 4. PROCESSAR CADA REFEIÇÃO E SEUS ALIMENTOS
        const todayMealsSummary = await Promise.all(todaysPlanMeals.map(async (meal: any) => {
            try {
                // Busca os alimentos configurados (mealAliments)
                const maRes = await baseFetch(`mealAliments?meal_id=${meal.meal_id}`);
                let mealAliments = Array.isArray(maRes?.data) ? maRes?.data : [];

                // Filtro de Segurança por ID
                mealAliments = mealAliments.filter((ma: any) => String(ma.meal_id) === String(meal.meal_id));

                // Hidrata os alimentos com dados nutricionais
                const foods = await Promise.all(mealAliments.map(async (ma: any) => {
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

                        // SOMA NO TOTAL DO DIA (AQUI ESTÁ A MÁGICA DOS CARDS)
                        totalStats.calories += itemStats.calories;
                        totalStats.protein += itemStats.protein;
                        totalStats.carbs += itemStats.carbs;
                        totalStats.fat += itemStats.fat;

                        return {
                            name: alim.name || "Carregando...",
                            amount: qty,
                            unit: ma.measurement_unit || 'g',
                            ...itemStats
                        };
                    } catch (e) { return null; }
                }));

                return {
                    meal_name: meal.meal_name,
                    foods: foods.filter(f => f !== null)
                };

            } catch (e) {
                return { meal_name: meal.meal_name, foods: [] };
            }
        }));

        // --- 5. RETORNO ---
        // Agora 'current' nos stats reflete a soma dos alimentos PLANEJADOS para o dia
        return {
            stats: {
                calories: { current: Math.round(totalStats.calories), target: targets.calories },
                water: { current: 0, target: targets.water }, // mealAliments não tem água por padrão
                macros: {
                    protein: { current: Math.round(totalStats.protein), target: targets.protein },
                    carbs: { current: Math.round(totalStats.carbs), target: targets.carbs },
                    fats: { current: Math.round(totalStats.fat), target: targets.fat },
                }
            },
            weeklyActivity: [], // Gráfico desativado pois requer lógica complexa de histórico vs plano
            todayMealsSummary
        };

    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return null;
    }
};