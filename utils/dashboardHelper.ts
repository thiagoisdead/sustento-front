import { ActivityData } from '../types/dashboard';

// --- HELPER DE DATAS ---
export const getSundayOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
};

export const formatDateISO = (date: Date) => date.toISOString().split('T')[0];

// --- HELPER: Normalizar Dados da Semana ---
// AQUI ESTAVA O ERRO: Precisamos dizer que retorna ActivityData[]
export const normalizeWeeklyData = (backendData: any[], referenceDate: Date): ActivityData[] => {    // Segurança: Se não for array, retorna vazio
    if (!Array.isArray(backendData)) return [];

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Achar o Domingo da semana REFERÊNCIA
    const startOfWeek = getSundayOfWeek(referenceDate);
    startOfWeek.setHours(0, 0, 0, 0);

    // Cria um array de 7 dias vazio baseado na semana selecionada
    const fullWeek = Array.from({ length: 7 }).map((_, index) => {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + index);

        const dateStr = formatDateISO(currentDay);

        // Tenta achar o dado no backendData com SEGURANÇA
        const found = backendData?.find((d: any) => { // use o ? para segurança
            return d && typeof d.date === 'string' && d.date.startsWith(dateStr);
        });

        return {
            day: daysOfWeek[index],
            date: dateStr,
            // Força conversão para garantir que é number
            current: found ? Number(found.current) || 0 : 0,
            target: found ? Number(found.target) || 0 : 0,
        };
    });

    return fullWeek;
};