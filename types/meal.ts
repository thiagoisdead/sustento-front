import { z } from "zod";

// --- Schema Definitions ---
export const mealSchema = z.object({
    id: z.number(),
    category: z.string(),
    name: z.string(),
    calories: z.number(),
    // Uncomment and use these if you need macros later:
    // protein: z.number(),
    // carbs: z.number(),
    // fats: z.number(),
});

// --- Type Inferences ---
export type Meal = z.infer<typeof mealSchema>;