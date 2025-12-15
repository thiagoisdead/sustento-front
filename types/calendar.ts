import { z } from "zod";
import React from "react";

// --- Event Schema (Existente) ---
export const eventSchema = z.object({
    id: z.number(),
    calendarDate: z.string(),
    time: z.string(),
    description: z.string(),
});

// --- FoodItem Schema ---
export const foodItemSchema = z.object({
    id: z.number(),
    name: z.string(),
    calories: z.number(), // Se puder vir string da API, use z.coerce.number()
    quantity: z.number(),
    unit: z.string(),
    mealAlimentId: z.number(),
});

// --- MealGroup Schema ---
export const mealGroupSchema = z.object({
    meal_id: z.number(),
    meal_name: z.string(),
    timeRaw: z.string(),
    displayTime: z.string(),
    foods: z.array(foodItemSchema), // Array de FoodItem
    totalCalories: z.number(),
});

// --- Inferred Types (Gera os types automaticamente) ---
export type Event = z.infer<typeof eventSchema>;
export type FoodItem = z.infer<typeof foodItemSchema>;
export type MealGroup = z.infer<typeof mealGroupSchema>;

// --- React Specific Types ---
export type RemoveButtonProps = {
    id: number;
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
};