import { z } from "zod";

// --- Schema Definitions ---
export const dashboardDataSchema = z.object({
    stats: z.object({
        calories: z.object({
            current: z.number(),
            target: z.number(),
        }),
        water: z.object({
            current: z.number(),
            target: z.number(),
        }),
        steps: z.object({
            current: z.number(),
            target: z.number(),
        }),
    }),
    weeklyActivity: z.array(
        z.object({
            day: z.string(),
            val: z.number(),
        })
    ),
    mealPlan: z.object({
        morning: z.string(),
        lunch: z.string(),
        dinner: z.string(),
    }),
    workout: z.object({
        title: z.string(),
        duration: z.string(),
        status: z.enum(["PENDENTE", "CONCLUÍDO"]),
    }),
});

// --- Type Inferences ---
export type DashboardData = z.infer<typeof dashboardDataSchema>;