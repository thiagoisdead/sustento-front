import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { MealPlan } from '../../types/meals';

interface MealPlanItemProps {
    plan: MealPlan;
    onPress: () => void;
    onDelete: () => void; // <--- NOVA PROP
}

export const MealPlanItem = ({ plan, onPress, onDelete }: MealPlanItemProps) => {
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
                    {plan.active ? (
                        <Ionicons name="radio-button-on" size={22} color={COLORS.primary} />
                    ) : (
                        <Ionicons name="radio-button-off" size={22} color={COLORS.textLight} />
                    )}

                    <Text style={[styles.planName, plan.active && { color: COLORS.primary }]}>
                        {plan.plan_name}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    {plan.active && (
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeText}>EM USO</Text>
                        </View>
                    )}

                    {/* BOTÃO DE DELETAR */}
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation(); // Impede de ativar o plano ao deletar
                            onDelete();
                        }}
                        style={styles.deleteBtn}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <FontAwesome5 name="fire" size={12} color={COLORS.accentOrange} />
                    <Text style={styles.statValue}>{formatVal(plan.target_calories)} kcal</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.macroText}>P: {formatVal(plan.target_protein)}g</Text>
                    <Text style={styles.macroText}>C: {formatVal(plan.target_carbs)}g</Text>
                    <Text style={styles.macroText}>G: {formatVal(plan.target_fat)}g</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1,
    },
    activeCard: {
        borderColor: COLORS.primary,
        backgroundColor: '#F5FAF5',
        borderWidth: 2,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1, // Para o texto não empurrar o botão de delete
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flexShrink: 1,
    },
    activeBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    activeText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: 'bold',
    },
    deleteBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginBottom: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    macroText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '500',
        marginLeft: 8,
    }
});