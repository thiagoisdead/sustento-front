import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { MealPlan } from '../../types/meals';

interface MealPlanItemProps {
    plan: MealPlan;
    onPress: () => void;
}

export const MealPlanItem = ({ plan, onPress }: MealPlanItemProps) => {
    // Helper para limpar os números (remover sinal de negativo se vier do back)
    const formatVal = (val: string | number | null) => {
        if (val === null || val === undefined) return '0';
        return Math.abs(Number(val)).toString();
    };

    return (
        <Pressable
            style={[styles.card, plan.active && styles.activeCard]}
            onPress={onPress}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MaterialCommunityIcons
                        name={plan.source === 'AUTOMATIC' ? 'robot' : 'notebook-edit'}
                        size={20}
                        color={plan.active ? COLORS.primary : COLORS.textLight}
                    />
                    <Text style={styles.planName}>{plan.plan_name}</Text>
                </View>

                {plan.active && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>ATIVO</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <FontAwesome5 name="fire" size={12} color={COLORS.accentOrange} />
                    <Text style={styles.statValue}>{formatVal(plan.target_calories)} kcal</Text>
                </View>
                <View style={styles.statItem}>
                    <MaterialCommunityIcons name="water" size={14} color={COLORS.accentBlue} />
                    <Text style={styles.statValue}>
                        {plan.target_water ? formatVal(plan.target_water) + 'ml' : '-'}
                    </Text>
                </View>
            </View>

            <View style={styles.macrosRow}>
                <Text style={styles.macroText}>Prot: {formatVal(plan.target_protein)}g</Text>
                <Text style={styles.macroText}>Carb: {formatVal(plan.target_carbs)}g</Text>
                <Text style={styles.macroText}>Gord: {formatVal(plan.target_fat)}g</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#F9FFF9', // Levemente verde se ativo
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    activeBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    activeText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 10,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        padding: 8,
        borderRadius: 8,
    },
    macroText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '500',
    }
});