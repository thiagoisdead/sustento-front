import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    useWindowDimensions,
} from "react-native";

type Meal = {
    id: number;
    category: string; // "Café da manhã", "Almoço", etc.
    name: string;
    calories: number;
};

export default function SeeFoodTracker() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    const [meals, setMeals] = useState<Meal[]>([
        { id: 1, category: "Café da manhã", name: "Café com leite", calories: 80 },
        { id: 2, category: "Café da manhã", name: "Torrada integral", calories: 60 },
        { id: 3, category: "Almoço", name: "Peito de frango grelhado", calories: 250 },
        { id: 4, category: "Almoço", name: "Arroz integral", calories: 150 },
        { id: 5, category: "Almoço", name: "Salada mista", calories: 50 },
        { id: 6, category: "Lanche", name: "Maçã", calories: 90 },
        { id: 7, category: "Jantar", name: "Salmão assado", calories: 300 },
        { id: 8, category: "Jantar", name: "Brócolis cozido", calories: 40 },
    ]);

    const dailyGoal = 1800;
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const progress = Math.min(totalCalories / dailyGoal, 1);
    const progressPct = `${Math.round(progress * 100)}%`;

    const groupedMeals = meals.reduce((acc: Record<string, Meal[]>, meal) => {
        if (!acc[meal.category]) acc[meal.category] = [];
        acc[meal.category].push(meal);
        return acc;
    }, {});

    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.container,
                    !isMobile && styles.containerDesktop,
                ]}
            >
                <View style={styles.card}>
                    <Text style={styles.goalText}>Meta Diária de Calorias: {dailyGoal} kcal</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: progressPct }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {totalCalories} / {dailyGoal} kcal
                    </Text>

                    <View style={styles.macros}>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>Proteínas</Text>
                            <Text style={styles.macroValue}>60%</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>Carboidratos</Text>
                            <Text style={styles.macroValue}>40%</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>Gorduras</Text>
                            <Text style={styles.macroValue}>30%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mealGrid}>
                    {Object.keys(groupedMeals).map((category) => (
                        <View key={category} style={styles.mealSection}>
                            <Text style={styles.mealCategory}>{category}</Text>
                            {groupedMeals[category].map((meal) => (
                                <View key={meal.id} style={styles.mealRow}>
                                    <Text style={styles.mealName}>{meal.name}</Text>
                                    <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                <Pressable
                    style={[styles.addButton, !isMobile && styles.addButtonDesktop]}
                    onPress={() => alert("Adicionar Refeição")}
                >
                    <Text style={styles.addButtonText}>Adicionar Refeição</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5DC",
    },
    scrollView: {
        flex: 1,
    },
    container: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    containerDesktop: {
        maxWidth: 800,
        alignSelf: "center",
    },

    // Top card: goal + progress + macros
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    goalText: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#3D3D3D",
        textAlign: "center",
    },
    progressBar: {
        height: 16,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#A8D5BA",
    },
    progressText: {
        marginTop: 8,
        marginBottom: 12,
        color: "#3D3D3D",
        textAlign: "center",
        fontWeight: "600",
    },

    // Macros row
    macros: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    macroItem: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEE",
    },
    macroLabel: {
        color: "#3D3D3D",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
    },
    macroValue: {
        color: "#3D3D3D",
        fontSize: 14,
        fontWeight: "700",
    },

    // Grid of meal sections
    mealGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 12,
    },
    mealSection: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: "48%", // ✅ two per row
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    mealCategory: {
        fontSize: 16,
        fontWeight: "700",
        color: "#3D3D3D",
        marginBottom: 8,
    },
    mealRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    mealName: {
        fontSize: 14,
        color: "#3D3D3D",
        flexShrink: 1,
        paddingRight: 8,
    },
    mealCalories: {
        fontSize: 14,
        color: "#3D3D3D",
        fontWeight: "600",
    },

    // Add button
    addButton: {
        backgroundColor: "#A8D5BA",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 16,
        alignSelf: "stretch",
    },
    addButtonDesktop: {
        alignSelf: "center",
        width: 280,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
