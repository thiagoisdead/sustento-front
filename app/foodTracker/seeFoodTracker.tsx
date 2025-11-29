import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";

// Imports
import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Meal } from "../../types/meal";
import { ProgressCard } from "../../components/ProgressCard";
import { MealItem } from "../../components/meal/mealItem";
import { AddMealModal } from "../../components/meal/addMealModal";

export default function SeeFoodTracker() {
    const { width } = useWindowDimensions();
    const isMobile = width < BREAKPOINTS.MOBILE;

    // --- State ---
    const [modalVisible, setModalVisible] = useState(false);
    const [meals, setMeals] = useState<Meal[]>([
        { id: 1, category: "Café da manhã", name: "Café com leite", calories: 80 },
        { id: 2, category: "Café da manhã", name: "Torrada integral", calories: 60 },
        { id: 3, category: "Almoço", name: "Peito de frango grelhado", calories: 250 },
        { id: 4, category: "Almoço", name: "Arroz integral", calories: 150 },
        { id: 6, category: "Lanche", name: "Maçã", calories: 90 },
        { id: 7, category: "Jantar", name: "Salmão assado", calories: 300 },
    ]);

    // --- Logic ---
    const dailyGoal = 1800;
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

    // Group meals by category for rendering
    const groupedMeals = meals.reduce((acc: Record<string, Meal[]>, meal) => {
        if (!acc[meal.category]) acc[meal.category] = [];
        acc[meal.category].push(meal);
        return acc;
    }, {});

    // --- Handlers ---
    const handleAddMeal = (name: string, calories: number, category: string) => {
        const newMeal: Meal = {
            id: Date.now(),
            name,
            calories,
            category,
        };
        setMeals([...meals, newMeal]);
    };

    const handleDeleteMeal = (id: number) => {
        setMeals(meals.filter((meal) => meal.id !== id));
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.container,
                    !isMobile && styles.containerDesktop,
                ]}
            >
                <ProgressCard totalCalories={totalCalories} dailyGoal={dailyGoal} />

                <View style={styles.mealGrid}>
                    {Object.keys(groupedMeals).map((category) => (
                        <View key={category} style={styles.mealSection}>
                            <Text style={styles.mealCategory}>{category}</Text>
                            {groupedMeals[category].map((meal) => (
                                <MealItem
                                    key={meal.id}
                                    meal={meal}
                                    onDelete={handleDeleteMeal}
                                />
                            ))}
                        </View>
                    ))}
                </View>

                <Pressable
                    style={[styles.addButton, !isMobile && styles.addButtonDesktop]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>Adicionar Refeição</Text>
                </Pressable>
            </ScrollView>

            <AddMealModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={handleAddMeal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    scrollView: { flex: 1 },
    container: { paddingVertical: 20, paddingHorizontal: 16 },
    containerDesktop: { maxWidth: 800, alignSelf: "center", width: "100%" },

    mealGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 12,
    },
    mealSection: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: "100%", // Default mobile
        // Note: For desktop grid layout, you might want to use width: '48%' conditionally based on isMobile, 
        // but in this clean refactor I kept it simple 100% to ensure it looks good on mobile first.
        // If you want the grid back on desktop, pass 'isMobile' to props or styles.
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    mealCategory: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textDark,
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 16,
        alignSelf: "stretch",
    },
    addButtonDesktop: { alignSelf: "center", width: 280 },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});