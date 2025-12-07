import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../../constants/theme';
import { Meal } from '../../types/meal';

interface MealItemProps {
    meal: Meal;
    onDelete: (id: number) => void;
}

export const MealItem = ({ meal, onDelete }: MealItemProps) => {

    const handleDeletePress = () => {
        Alert.alert(
            "Excluir Refeição",
            "Tem certeza que deseja excluir esta refeição?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", style: "destructive", onPress: () => onDelete(meal.id) },
            ]
        );
    };

    return (
        <View style={styles.mealRow}>
            <Text style={styles.mealName}>{meal?.name}</Text>
            <View style={styles.mealDetails}>
                <Text style={styles.mealCalories}>{meal?.calories} kcal</Text>
                <Pressable onPress={handleDeletePress} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>×</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mealRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    mealName: {
        fontSize: 14,
        color: COLORS.textDark,
        flex: 1,
        flexShrink: 1,
        paddingRight: 8,
    },
    mealDetails: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    mealCalories: {
        fontSize: 14,
        color: COLORS.textDark,
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: "#FFCDD2", // Light Red
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#D32F2F", // Dark Red
        fontWeight: "bold",
        fontSize: 16,
        lineHeight: 20, // Centers the X better
    },
});