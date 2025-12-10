import { z } from 'zod';

const StatItemSchema = z.object({
    current: z.number(),
    target: z.number(),
});

export const ActivityDataSchema = z.object({
    day: z.string(),
    date: z.string(),
    current: z.number(),
    target: z.number(),
});

export const DashboardDataSchema = z.object({
    stats: z.object({
        calories: StatItemSchema,
        macros: z.object({
            protein: StatItemSchema,
            carbs: StatItemSchema,
            fats: StatItemSchema,
        }),
    }),
    weeklyActivity: z.array(ActivityDataSchema),
    todayMealsSummary: z.array(z.object({
        meal_name: z.string(),
        foods: z.array(z.object({
            name: z.string(),
            amount: z.number(),
            unit: z.string().optional(),
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fat: z.number(),
        }))
    })),
});

export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
export type ViewState = 'LOADING' | 'EMPTY' | 'SELECTION' | 'DASHBOARD';