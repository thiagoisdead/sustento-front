import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { MealPlan } from '../../types/meals';

interface MealPlanItemProps {
    plan: MealPlan;
    onPress: () => void;
    onDelete?: () => void; // Opcional, caso queira reativar no futuro
}

export const MealPlanItem = ({ plan, onPress, onDelete }: MealPlanItemProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconBox}>
                <MaterialCommunityIcons
                    name={plan.active ? "check-circle" : "circle-outline"}
                    size={24}
                    color={plan.active ? COLORS.primary : COLORS.textLight}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{plan.plan_name}</Text>
                <Text style={styles.subtitle}>
                    {plan.target_calories} kcal • {plan.target_protein}g Prot
                </Text>
            </View>

            {plan.active && (
                <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>ATIVO</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 1,
    },
    iconBox: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textDark,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    activeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
    }
});