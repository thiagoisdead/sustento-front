import { DashboardData } from "../types/dashboard";

export const fetchDashboardData = async (): Promise<DashboardData> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                stats: {
                    calories: { current: 1250, target: 2000 },
                    water: { current: 2.1, target: 3.0 },
                    steps: { current: 5400, target: 10000 },
                },
                weeklyActivity: [
                    { day: 'SEG', val: 45 },
                    { day: 'TER', val: 80 },
                    { day: 'QUA', val: 60 },
                    { day: 'QUI', val: 110 },
                    { day: 'SEX', val: 90 },
                    { day: 'SÁB', val: 30 },
                    { day: 'DOM', val: 15 },
                ],
                mealPlan: {
                    morning: 'Ovos Mexidos & Café',
                    lunch: 'Frango com Batata Doce',
                    dinner: 'Sopa de Legumes',
                },
                workout: {
                    title: 'Treino de Pernas',
                    duration: '50 min',
                    status: 'PENDENTE',
                },
            });
        }, 1500);
    });
};