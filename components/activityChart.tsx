import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { ActivityData } from '../types/dashboard';
import { Ionicons } from '@expo/vector-icons';

interface ActivityChartProps {
    data: ActivityData[];
}

const isPastDate = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    // Comparação simples de data (UTC x UTC ou Local x Local, assumindo string ISO YYYY-MM-DD)
    return dateString < today.toISOString().split('T')[0];
};

export const ActivityChart = ({ data }: ActivityChartProps) => {
    return (
        <View style={styles.container}>
            {data.map((item, index) => {
                const safeTarget = item.target || 1;
                const percent = Math.min((item.current / safeTarget) * 100, 100);

                const isPast = isPastDate(item.date);
                const isCompleted = percent >= 100;
                // Excedeu 5% da meta
                const isExceeded = item.current > item.target * 1.05;

                const trackColor = (isPast && !isCompleted) ? '#FFCDD2' : '#F0F0F0';
                const alertVisible = isPast && isExceeded;

                return (
                    <View key={index} style={styles.column}>
                        {alertVisible && (
                            <View style={styles.alertIcon}>
                                <Ionicons name="alert-circle" size={16} color="#E57373" />
                            </View>
                        )}
                        <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        height: `${percent}%`,
                                        backgroundColor: COLORS.primary
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.dayLabel}>{item.day}</Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        paddingHorizontal: 10,
    },
    column: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        gap: 8
    },
    alertIcon: {
        position: 'absolute',
        top: -18,
        zIndex: 10,
    },
    barTrack: {
        width: 12,
        height: '80%',
        borderRadius: 6,
        backgroundColor: '#F0F0F0',
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    barFill: {
        width: '100%',
        borderRadius: 6,
    },
    dayLabel: {
        fontSize: 10,
        color: COLORS.textLight,
        fontWeight: '600',
    }
});