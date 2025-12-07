import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { COLORS } from '../constants/theme';
import { MealPlan } from '../types/meal';

export const ProgressCard = ({ data }: MealPlan) => {
    const safeTargetCal = data?.target_calories || 1;
    const progress = Math.min(data?.target_calories / safeTargetCal, 1);

    const rawPercent = Math.round(progress * 100);
    const progressPctStyle = `${rawPercent}%` as DimensionValue;
    const progressPctText = `${rawPercent}%`;

    const fmt = (curr: number, total: number) =>
        `${Math.round(curr)}/${Math.round(total || 1)}g`;

    return (
        <View style={styles.card}>
            <Text style={styles.goalText}>
                Meta Diária: {data?.target_calories} kcal
            </Text>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: progressPctStyle }]} />
            </View>

            <Text style={styles.progressText}>
                {Math.round(progress)} / {data?.target_calories} kcal ({progressPctText})
            </Text>

            <View style={styles.macros}>
                <MacroItem label="Proteínas" value={fmt(data?.protein, data?.target_protein)} />
                <MacroItem label="Carbos" value={fmt(data?.carbs, data?.target_carbs)} />
                <MacroItem label="Gorduras" value={fmt(data?.fat, data?.target_fat)} />
            </View>
        </View>
    );
};

const MacroItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    goalText: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
        color: COLORS.textDark,
        textAlign: "center",
    },
    progressBar: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: COLORS.primary,
    },
    progressText: {
        marginTop: 8,
        marginBottom: 12,
        color: COLORS.textDark,
        textAlign: "center",
        fontWeight: "600",
        fontSize: 14,
    },
    macros: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    macroItem: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#EEE',
    },
    macroLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "700",
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    macroValue: {
        color: COLORS.textDark,
        fontSize: 13,
        fontWeight: "700",
    },
});
