import { baseFetch, basePutById, basePost } from './baseCall'; // Assuming basePutById exists as discussed
import { MealPlan } from '../types/meals';
import { getItem } from './secureStore';

const ROUTE = 'api/mealPlans';

// 1. List all plans for the user
export const getUserMealPlans = async (): Promise<MealPlan[]> => {
    try {
        const userId = await getItem('id');
        if (!userId) return [];

        // Assuming backend filters by logged user or accepts query param
        const response = await baseFetch(`${ROUTE}?user_id=${userId}`);
        return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
};

// 2. Activate a Plan
export const activateMealPlan = async (planId: number) => {
    // Depending on backend logic, setting one to active might auto-deactivate others.
    // If not, the backend should handle that logic. We just send active: true.
    return await basePutById(ROUTE, planId, { active: true });
};

// 3. Create Plan (Placeholder for the button)
export const createMealPlan = async (data: any) => {
    // Logic to create plan would go here
    return await basePost(ROUTE, data);
}