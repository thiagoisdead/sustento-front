import { z } from "zod";

// --- Schema Definitions ---
export const mealSchema = z.object({
    id: z.number(),
    name: z.string(),
    calories: z.number(),
    category: z.string().nullable().optional(),
    proteins: z.number().nullable().optional(),
    carbs: z.number().nullable().optional(),
    fats: z.number().nullable().optional(),
});

export const mealPlanSchema = z.object({
    active: z.boolean(),
    plan_name: z.string(),
    target_calories: z.number().optional(),
    target_fat: z.number().optional(),
    target_protein: z.number().optional(),
    target_carbs: z.number().optional(),
    target_water: z.number(),
    source: z.enum(['MANUAL', 'AUTOMATIC']),
    user_id: z.number(),
    plan_id: z.number().optional(),
})

export type MealPlan = z.infer<typeof mealPlanSchema>;
export type Meal = z.infer<typeof mealSchema>;