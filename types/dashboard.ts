import { z } from 'zod';

// Sub-schemas for cleanliness
const statItemSchema = z.object({
    current: z.number(),
    target: z.number(),
});

const weeklyPointSchema = z.object({
    day: z.string(),
    val: z.number(),
});

const mealSummarySchema = z.object({
    breakfast: z.string(),
    lunch: z.string(),
    dinner: z.string(),
});

const workoutSchema = z.object({
    title: z.string(),
    duration: z.string(),
    status: z.enum(['PENDENTE', 'CONCLUÍDO']),
});

// Main Dashboard Schema
export const dashboardDataSchema = z.object({
    stats: z.object({
        calories: statItemSchema,
        water: statItemSchema,
        steps: statItemSchema,
        macros: z.object({
            protein: statItemSchema,
            carbs: statItemSchema,
            fats: statItemSchema,
        }),
    }),
    weeklyActivity: z.array(weeklyPointSchema),
    todayMealsSummary: mealSummarySchema,
    workout: workoutSchema,
});

// Infer TypeScript Type
export type DashboardData = z.infer<typeof dashboardDataSchema>;