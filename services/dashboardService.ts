import { baseUniqueGet, baseFetch } from './baseCall';
import { DashboardData } from '../types/dashboard';
import { getItem } from './secureStore';
import { MealPlan } from '../types/meals'; // Certifique-se que o tipo está aqui

// Helper de Data
const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export const getDashboardData = async (): Promise<DashboardData | null> => {
    try {
        const userIdStr = await getItem('id');
        if (!userIdStr) return null;
        const userId = Number(userIdStr);

        // 1. Buscar Planos
        const plansRes = await baseFetch(`mealPlans?user_id=${userId}`);
        const userPlans = Array.isArray(plansRes?.data) ? plansRes?.data : [];

        // --- CORREÇÃO AQUI ---
        // Filtra todos que estão marcados como ativos
        const activePlans = userPlans.filter((p: any) => p.active);

        // Ordena pela data de atualização (updated_at) decrescente.
        // O primeiro item [0] será o plano que o usuário alterou/ativou mais recentemente.
        const activePlan = activePlans.sort((a: any, b: any) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0] || userPlans[userPlans.length - 1]; // Fallback: último da lista geral

        // Helper para limpar números e remover negativos
        const cleanNum = (val: any) => Math.abs(Number(val) || 0);

        // Valores do plano selecionado
        const targets = {
            calories: cleanNum(activePlan?.target_calories) || 2000,
            protein: cleanNum(activePlan?.target_protein) || 150,
            carbs: cleanNum(activePlan?.target_carbs) || 250,
            fat: cleanNum(activePlan?.target_fat) || 70,
            water: cleanNum(activePlan?.target_water) || 2500,
        };

        // 2. Buscar Consumo (Refeições)
        const recordsRes = await baseUniqueGet('mealRecords/user');
        const allRecords = Array.isArray(recordsRes?.data) ? recordsRes?.data : [];

        // 3. Buscar Consumo (Água)
        const waterRes = await baseUniqueGet('waterRecords/user');
        const allWater = Array.isArray(waterRes?.data) ? waterRes?.data : [];

        // --- HOJE ---
        const today = new Date();

        // Filtra registros do dia atual
        const todayRecords = allRecords.filter((rec: any) => isSameDay(new Date(rec?.meal_date), today));
        const todayWater = allWater.filter((rec: any) => isSameDay(new Date(rec?.water_record_date), today));

        // Soma Água
        const currentWater = todayWater.reduce((acc: number, rec: any) => acc + Number(rec?.water_consumption || 0), 0);

        // Soma Macros e Calorias
        const currentStats = todayRecords.reduce((acc: any, rec: any) => {
            if (!rec?.aliment) return acc;

            // O banco guarda por 100g. O registro tem a quantidade comida.
            const ratio = Number(rec?.amount) / 100;

            return {
                calories: acc.calories + (Number(rec?.aliment?.calories_100g) * ratio),
                protein: acc.protein + (Number(rec?.aliment?.protein_100g) * ratio),
                carbs: acc.carbs + (Number(rec?.aliment?.carbs_100g) * ratio),
                fat: acc.fat + (Number(rec?.aliment?.fat_100g) * ratio),
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        // --- SEMANA (Gráfico) ---
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

        // --- RESUMO DO DIA (Lista de Alimentos) ---
        // Junta os nomes dos alimentos de cada refeição (Ex: "Arroz, Frango")
        const getMealSummary = (mealId: number) => {
            const items = todayRecords
                .filter((r: any) => r.meal_id === mealId)
                .map((r: any) => r.aliment.name);

            if (items.length === 0) return "Não registrado";
            if (items.length <= 2) return items.join(", ");
            return `${items[0]}, ${items[1]} +${items.length - 2}`;
        };

        return {
            stats: {
                calories: { current: Math.round(currentStats?.calories), target: targets?.calories },
                water: { current: currentWater / 1000, target: targets?.water / 1000 }, // Litros
                steps: { current: 0, target: 0 }, // Não usado na UI, mas mantido no tipo
                macros: {
                    protein: { current: Math.round(currentStats?.protein), target: targets?.protein },
                    carbs: { current: Math.round(currentStats?.carbs), target: targets?.carbs },
                    fats: { current: Math.round(currentStats?.fat), target: targets?.fat },
                }
            },
            weeklyActivity,
            todayMealsSummary: {
                breakfast: getMealSummary(1),
                lunch: getMealSummary(2),
                dinner: getMealSummary(3),
            },
            workout: {
                title: "", duration: "", status: 'PENDENTE' // Não será exibido
            },
        };

    } catch (error) {
        console.error("Dashboard Service Error:", error);
        return null;
    }
};