export interface MealPlan {
    plan_id: number;
    plan_name: string;
    // O backend manda string (ex: "-126"), mas na UI tratamos como número
    target_calories: string | number;
    target_protein: string | number;
    target_carbs: string | number;
    target_fat: string | number;
    target_water: string | number | null;
    source: "AUTOMATIC" | "MANUAL";
    active: boolean;
    created_at: string;
    updated_at: string;
    user_id: number;
}