import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, width } from '../constants/theme';

interface StatCardProps {
    label: string;
    value: string | number;
    subValue: string | number;
    unit: string;
    percentage: number;
    color: string;
    icon: React.ReactNode;
}

export const StatCard = ({ label, value, subValue, unit, percentage, color, icon }: StatCardProps) => {
    const safePercent = Math.min(Math.max(percentage || 0, 0), 1);
    const barWidth = safePercent * 100;

    return (
        <View style={styles.statCard}>
            <View style={styles.statHeader}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    {icon}
                </View>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
            <View style={styles.valueContainer}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statUnit}>{unit}</Text>
            </View>
            <Text style={styles.statSubValue}>Meta: {subValue || '--'}</Text>
            <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${barWidth}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statCard: {
        width: (width - 48) / 3,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconBox: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    statLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textLight },
    valueContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
    statValue: { fontSize: 16, fontWeight: '900', color: COLORS.textDark },
    statUnit: { fontSize: 10, fontWeight: '600', color: COLORS.textLight, marginLeft: 2 },
    statSubValue: { fontSize: 9, color: COLORS.textLight, marginBottom: 8 },
    progressBarTrack: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
});