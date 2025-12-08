import React, { useState } from 'react';
import { View, Text, StyleSheet, DimensionValue, Pressable } from 'react-native';
import { COLORS } from '../constants/theme';

export const ProgressCard = ({ data }) => {
    const [showExact, setShowExact] = useState(false);

    const current = data?.current_calories || 0;
    const target = data?.target_calories || 1; 

    const realRatio = current / target;
    const realPercent = Math.round(realRatio * 100);
    const isOverflowing = realPercent > 100;

    const visualPercent = Math.min(realPercent, 100);
    const progressPctStyle = `${visualPercent}%` as DimensionValue;
    const displayPercentText = (isOverflowing && !showExact) ? ">100%" : `${realPercent}%`;
    const barColor = isOverflowing ? '#FF5252' : COLORS.primary;

    const fmt = (curr: number, total: number) =>
        `${Math.round(curr || 0)}/${Math.round(total || 0)}g`;

    return (
        <Pressable 
            onPress={() => setShowExact(!showExact)} 
            style={styles.card}
            // Feedback tátil ao clicar
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }} 
        >
            <Text style={styles.goalText}>
                Meta Diária: {target} kcal
            </Text>

            <View style={styles.progressBar}>
                <View style={[
                    styles.progressFill, 
                    { width: progressPctStyle, backgroundColor: barColor }
                ]} />
            </View>

            <Text style={styles.progressText}>
                {Math.round(current)} / {Math.round(target)} kcal ({displayPercentText})
            </Text>
            
            {isOverflowing && !showExact && (
                <Text style={styles.tooltipHint}>(Toque para ver detalhes)</Text>
            )}

            <View style={styles.macros}>
                <MacroItem label="Proteínas" value={fmt(data?.current_protein, data?.target_protein)} />
                <MacroItem label="Carbos" value={fmt(data?.current_carbs, data?.target_carbs)} />
                <MacroItem label="Gorduras" value={fmt(data?.current_fats || data?.current_fat, data?.target_fat || data?.target_fats)} />
            </View>
        </Pressable>
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
    },
    progressText: {
        marginTop: 8,
        marginBottom: 4, 
        color: COLORS.textDark,
        textAlign: "center",
        fontWeight: "600",
        fontSize: 14,
    },
    tooltipHint: {
        fontSize: 10,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 12,
        fontStyle: 'italic'
    },
    macros: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        marginTop: 8 
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