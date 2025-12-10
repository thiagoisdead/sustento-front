import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface StatCardProps {
    label: string;
    value: number;
    subValue: number;
    unit: string;
    percentage: number;
    color: string;
    icon: React.ReactNode;
    style?: ViewStyle;
    valueColor?: string;
}

export const StatCard = ({
    label,
    value,
    subValue,
    unit,
    percentage,
    color,
    icon,
    style,
    valueColor = COLORS.textDark
}: StatCardProps) => {

    // Detecta se estourou a meta
    const isOverLimit = subValue > 0 && value > subValue;
    const alertColor = '#FF7043'; // Vermelho Alaranjado

    // Define cores dinâmicas
    const activeColor = isOverLimit ? alertColor : color;
    const highlightTextColor = isOverLimit ? alertColor : '#999';

    const progress = Math.min(Math.max(percentage, 0), 1);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${activeColor}20` }]}>
                    {icon}
                </View>
                <Text style={[styles.label, { color: highlightTextColor }]}>
                    {label}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={[styles.value, { color: valueColor }]}>
                        {value}
                        <Text style={styles.unit}> {unit}</Text>
                    </Text>
                    <Text style={[styles.subValue, { color: highlightTextColor }]}>
                        Meta: {subValue}
                    </Text>
                </View>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${progress * 100}%`, backgroundColor: activeColor }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        minWidth: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    iconContainer: {
        padding: 6,
        borderRadius: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        flex: 1,
    },
    content: {
        marginBottom: 8,
    },
    textContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    value: {
        fontSize: 18,
        fontWeight: '800',
    },
    unit: {
        fontSize: 10,
        fontWeight: '600',
        color: '#999',
    },
    subValue: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    progressTrack: {
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
});