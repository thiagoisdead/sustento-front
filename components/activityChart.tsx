import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { ActivityData } from '../types/dashboard';
import { Ionicons } from '@expo/vector-icons';

interface ActivityChartProps {
    data: ActivityData[];
}

const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ActivityChart = ({ data }: ActivityChartProps) => {
    const todayStr = getLocalTodayStr();

    return (
        <View style={styles.container}>
            {data.map((item, index) => {
                const safeTarget = item.target || 0;
                const safeCurrent = item.current || 0;

                const isPast = item.date < todayStr;
                const isFuture = item.date > todayStr;

                // 1. FUTURO: Mostra o placeholder (trilho cinza vazio)
                if (isFuture) {
                    return (
                        <View key={index} style={styles.column}>
                            <View style={[styles.barTrack, { backgroundColor: '#F0F0F0' }]} />
                            <Text style={styles.dayLabel}>{item.day}</Text>
                        </View>
                    );
                }

                // 2. SEM META (Dias Fantasmas no Passado): Invisível
                // Se não tinha plano nesse dia passado, não mostra nem o trilho.
                if (safeTarget === 0) {
                    return (
                        <View key={index} style={styles.column}>
                            <View style={[styles.barTrack, { backgroundColor: 'transparent' }]} />
                            <Text style={styles.dayLabel}>{item.day}</Text>
                        </View>
                    );
                }

                // 3. LÓGICA NORMAL (Passado com Meta ou Hoje)
                const percentValue = (safeCurrent / safeTarget) * 100;
                const visualPercent = Math.min(percentValue, 100);

                const isMissed = isPast && percentValue < 99;

                const activeColor = COLORS.primary;
                // Vermelho transparente se perdeu, Cinza se ok
                const trackColor = isMissed ? 'rgba(255, 0, 0, 0.15)' : '#F0F0F0';

                return (
                    <View key={index} style={styles.column}>
                        {isMissed && (
                            <View style={styles.alertIcon}>
                                <Ionicons name="alert-circle" size={14} color="#E57373" />
                            </View>
                        )}

                        <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        height: `${visualPercent}%`,
                                        backgroundColor: activeColor
                                    }
                                ]}
                            />
                        </View>

                        <Text style={[styles.dayLabel, isMissed && { color: '#E57373' }]}>
                            {item.day}
                        </Text>
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