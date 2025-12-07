import {
    DimensionValue
} from "react-native";
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface ProgressCardProps {
    totalCalories: number;
    dailyGoal: number;
}

export const ProgressCard = ({ totalCalories, dailyGoal }: ProgressCardProps) => {
    const progress = Math.min(totalCalories / dailyGoal, 1);
    const progressPct = `${Math.round(progress * 100)}%`;

    return (
        <View style={styles.card}>
            <Text style={styles.goalText}>Meta Diária de Calorias: {dailyGoal} kcal</Text>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: progressPct as DimensionValue }]} />
            </View>

            <Text style={styles.progressText}>
                {totalCalories} / {dailyGoal} kcal
            </Text>

            <View style={styles.macros}>
                <MacroItem label="Proteínas" value="60%" />
                <MacroItem label="Carboidratos" value="40%" />
                <MacroItem label="Gorduras" value="30%" />
            </View>
        </View>
    );
};

// Sub-component for internal use
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
        marginTop: 32,
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
        color: COLORS.textDark,
        textAlign: "center",
    },
    progressBar: {
        height: 16,
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: COLORS.primary },
    progressText: {
        marginTop: 8,
        marginBottom: 12,
        color: COLORS.textDark,
        textAlign: "center",
        fontWeight: "600",
    },
    macros: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    macroItem: {
        flex: 1,
        backgroundColor: COLORS.iconBg,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.borderColor,
    },
    macroLabel: {
        color: COLORS.textDark,
        fontSize: 12, // Adjusted for space
        fontWeight: "600",
        marginBottom: 4,
    },
    macroValue: {
        color: COLORS.textDark,
        fontSize: 14,
        fontWeight: "700",
    },
});