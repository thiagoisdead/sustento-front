import { baseFetch, baseGetById, baseUniqueGet } from './baseCall';
import { getItem } from './secureStore';

// --- HELPER DE DATAS (LOCAL TIME) ---
// Garante que a data seja a do celular do usuário, ignorando UTC
const getIsoDateStr = (dateInput: any): string => {
    if (!dateInput) return "";
    try {
        if (dateInput instanceof Date) {
            const year = dateInput.getFullYear();
            const month = String(dateInput.getMonth() + 1).padStart(2, '0');
            const day = String(dateInput.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        if (typeof dateInput === 'string') {
            return dateInput.split('T')[0];
        }
    } catch (e) { return ""; }
    return String(dateInput);
};

export const getDashboardData = async (startDate?: string, endDate?: string) => {
    try {
        const userIdStr = await getItem('id');
        if (!userIdStr) return null;
        const userId = Number(userIdStr);

        // 1. BUSCAR PLANOS
        const plansRes = await baseFetch(`mealPlans?user_id=${userId}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];

        const activePlans = userPlans.filter((p: any) => p.active);
        const activePlan = activePlans.sort((a: any, b: any) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0] || userPlans[userPlans.length - 1];

        if (!activePlan) return null;

        const cleanNum = (val: any) => Math.abs(Number(val) || 0);
        const targets = {
            calories: cleanNum(activePlan?.target_calories) || 2000,
            protein: cleanNum(activePlan?.target_protein) || 150,
            carbs: cleanNum(activePlan?.target_carbs) || 250,
            fat: cleanNum(activePlan?.target_fat) || cleanNum(activePlan?.target_fats) || 70,
            water: cleanNum(activePlan?.target_water) || 2500,
        };

        // 2. BUSCAR REGISTROS (Com fallback de rota)
        let allRecords = [];
        const recordsRes = await baseFetch(`mealRecords?user_id=${userId}`);
        allRecords = Array.isArray(recordsRes?.data) ? recordsRes?.data : [];

        // 3. BUSCAR ÁGUA
        let allWater = [];
        const waterRes = await baseFetch(`waterRecords?user_id=${userId}`);
        allWater = Array.isArray(waterRes?.data) ? waterRes?.data : [];

        // 4. CONFIGURAÇÃO DE REFEIÇÕES DO PLANO
        const mealsConfigRes = await baseFetch(`meals?plan_id=${activePlan.plan_id}`);
        const planMeals = Array.isArray(mealsConfigRes?.data) ? mealsConfigRes?.data : [];

        // --- HOJE ---
        const today = new Date();
        const todayIso = getIsoDateStr(today);

        const todayRecords = allRecords.filter((rec: any) => getIsoDateStr(rec.meal_date) === todayIso);
        const todayWater = allWater.filter((rec: any) => getIsoDateStr(rec.water_record_date) === todayIso);

        const currentWater = todayWater.reduce((acc: number, rec: any) => acc + Number(rec?.water_consumption || 0), 0);

        // --- CACHE DE ALIMENTOS (JOIN MANUAL) ---
        const alimentCache: Record<number, any> = {};
        const uniqueAlimentIds = [...new Set(todayRecords.map((r: any) => r.aliment_id))];

        if (uniqueAlimentIds.length > 0) {
            await Promise.all(uniqueAlimentIds.map(async (id: unknown) => {
                if (typeof id === 'number') {
                    try {
                        const res = await baseGetById('aliments', id);
                        if (res && res.data) alimentCache[id] = res.data;
                    } catch (e) { }
                }
            }));
        }

        // --- CÁLCULO DE MACROS ---
        const currentStats = todayRecords.reduce((acc: any, rec: any) => {
            const alimentData = alimentCache[rec.aliment_id];
            if (!alimentData) return acc;

            const ratio = (Number(rec.amount) || 0) / 100;
            return {
                calories: acc.calories + (Number(alimentData.calories_100g) * ratio),
                protein: acc.protein + (Number(alimentData.protein_100g) * ratio),
                carbs: acc.carbs + (Number(alimentData.carbs_100g) * ratio),
                fat: acc.fat + (Number(alimentData.fat_100g) * ratio),
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // --- SEMANA ---
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weeklyActivity = [];
        let loopDate = new Date();

        if (startDate) {
            const parts = startDate.split('-');
            loopDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
            const day = loopDate.getDay();
            const diff = loopDate.getDate() - day;
            loopDate.setDate(diff);
        }
        loopDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const d = new Date(loopDate);
            d.setDate(loopDate.getDate() + i);
            const isoDate = getIsoDateStr(d);

            const dayRecords = allRecords.filter((rec: any) => getIsoDateStr(rec.meal_date) === isoDate);

            const dayCals = dayRecords.reduce((sum: number, rec: any) => {
                const alim = alimentCache[rec.aliment_id] || rec.aliment || {};
                return sum + (Number(alim.calories_100g || 0) * (Number(rec.amount || 0) / 100));
            }, 0);

            weeklyActivity.push({
                day: weekDays[d.getDay()],
                date: isoDate,
                current: Math.round(dayCals),
                target: targets.calories
            });
        }

        // --- RESUMO DO DIA (DETALHADO) ---
        const todayMealsSummary = planMeals.map((meal: any) => {
            const items = todayRecords
                .filter((r: any) => String(r.meal_id) === String(meal.meal_id))
                .map((r: any) => {
                    const alim = alimentCache[r.aliment_id];
                    const amount = Number(r.amount) || 0;
                    const ratio = amount / 100;

                    if (!alim) {
                        return {
                            name: `Item #${r.aliment_id}`,
                            amount: amount,
                            unit: r.unit || 'g',
                            calories: 0, protein: 0, carbs: 0, fat: 0
                        };
                    }

                    return {
                        name: alim.name,
                        amount: amount,
                        unit: r.unit || 'g',
                        calories: Math.round(Number(alim.calories_100g) * ratio),
                        protein: Math.round(Number(alim.protein_100g) * ratio),
                        carbs: Math.round(Number(alim.carbs_100g) * ratio),
                        fat: Math.round(Number(alim.fat_100g) * ratio),
                    };
                });

            return {
                meal_name: meal.meal_name,
                foods: items
            };
        });

        return {
            stats: {
                calories: { current: Math.round(currentStats.calories), target: targets.calories },
                water: { current: currentWater / 1000, target: targets.water / 1000 },
                macros: {
                    protein: { current: Math.round(currentStats.protein), target: targets.protein },
                    carbs: { current: Math.round(currentStats.carbs), target: targets.carbs },
                    fats: { current: Math.round(currentStats.fat), target: targets.fat },
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