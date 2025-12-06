import { baseUniqueGet, baseFetch } from './baseCall';
import { DashboardData, dashboardDataSchema } from '../types/dashboard';
import { getItem } from './secureStore';

// Helper to check if a date is today
const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export const getDashboardData = async (): Promise<DashboardData | null> => {
    try {
        const userId = await getItem('id');
        if (!userId) return null;

        // 1. Fetch Meal Records (History) - GET /api/mealRecords/user/:id
        const recordsRes = await baseUniqueGet('api/mealPlans');
        const allRecords = Array.isArray(recordsRes?.data) ? recordsRes?.data : [];

        // 2. Fetch Meal Plans (Targets) - GET /api/mealPlans?user_id=:id
        // We try to find the active plan for targets
        const plansRes = await baseFetch(`mealPlans?user_id=${userId}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];
        // Find active plan or fallback to first one
        const activePlan = userPlans.find((p: any) => p.active) || userPlans[0];

        // --- DEFAULTS (Targets) ---
        // If no plan exists, we use safe defaults
        const targets = {
            calories: Number(activePlan?.target_calories) || 2000,
            protein: Number(activePlan?.target_protein) || 150,
            carbs: Number(activePlan?.target_carbs) || 250,
            fat: Number(activePlan?.target_fat) || 70,
            water: Number(activePlan?.target_water) || 2500, // ml
        };

        // --- CALCULATE TODAY'S CONSUMPTION ---
        const today = new Date();
        const todayRecords = allRecords.filter((rec: any) => isSameDay(new Date(rec.meal_date), today));

        // Sum up macros from today's records
        const currentStats = todayRecords.reduce((acc: any, rec: any) => {
            if (!rec.aliment) return acc;

            // Calculation: (Value per 100g * Amount consumed) / 100
            const ratio = Number(rec.amount) / 100;

            return {
                calories: acc.calories + (Number(rec.aliment.calories_100g) * ratio),
                protein: acc.protein + (Number(rec.aliment.protein_100g) * ratio),
                carbs: acc.carbs + (Number(rec.aliment.carbs_100g) * ratio),
                fat: acc.fat + (Number(rec.aliment.fat_100g) * ratio),
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // --- CALCULATE WEEKLY CHART (Last 7 Days) ---
        const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        const weeklyActivity = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);

            const dayRecords = allRecords.filter((rec: any) => isSameDay(new Date(rec.meal_date), d));
            const dayCals = dayRecords.reduce((sum: number, rec: any) => {
                if (!rec.aliment) return sum;
                return sum + (Number(rec.aliment.calories_100g) * (Number(rec.amount) / 100));
            }, 0);

            weeklyActivity.push({
                day: weekDays[d.getDay()],
                val: Math.round(dayCals)
            });
        }

        // --- MEAL NAMES FOR UI ---
        // Helper to find a food name for a specific meal ID (1=Breakfast, 2=Lunch, 3=Dinner)
        const getMealName = (id: number) => {
            const rec = todayRecords.find((r: any) => r.meal_id === id);
            return rec ? rec.aliment.name : "Não registrado";
        };

        // --- CONSTRUCT RAW DATA ---
        const rawData = {
            stats: {
                calories: { current: Math.round(currentStats.calories), target: targets.calories },
                water: { current: 0, target: targets.water / 1000 }, // Placeholder until waterRecords connected
                steps: { current: 0, target: 10000 },
                macros: {
                    protein: { current: Math.round(currentStats.protein), target: targets.protein },
                    carbs: { current: Math.round(currentStats.carbs), target: targets.carbs },
                    fats: { current: Math.round(currentStats.fat), target: targets.fat },
                }
            },
            weeklyActivity,
            todayMealsSummary: {
                breakfast: getMealName(1),
                lunch: getMealName(2),
                dinner: getMealName(3),
            },
            workout: {
                title: "Treino Livre",
                duration: "0 min",
                status: 'PENDENTE',
            },
        };

        return dashboardDataSchema.parse(rawData);

    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return null;
    }
};