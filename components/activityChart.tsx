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
                // Garante valores numéricos seguros
                const safeTarget = item.target || 0;
                const safeCurrent = item.current || 0;

                const isPast = item.date < todayStr;
                const isFuture = item.date > todayStr;

                // LÓGICA DE VISIBILIDADE:
                // O Service manda target=0 se o plano não existia no dia.
                // Então, só escondemos se for Futuro OU se não tinha meta (target=0).
                // Se target > 0 e current == 0, a barra PRECISA aparecer (como falha).
                if (isFuture || safeTarget === 0) {
                    return (
                        <View key={index} style={styles.column}>
                            {/* Barra invisível apenas para manter o espaçamento */}
                            <View style={[styles.barTrack, { backgroundColor: 'transparent' }]} />
                            <Text style={styles.dayLabel}>{item.day}</Text>
                        </View>
                    );
                }

                // Cálculo de porcentagem seguro
                const percentValue = safeTarget > 0 ? (safeCurrent / safeTarget) * 100 : 0;
                const visualPercent = Math.min(percentValue, 100);

                // LÓGICA DE FALHA (VERMELHO):
                // Se é dia passado E a porcentagem é menor que 99% (isso inclui 0%).
                const isMissed = isPast && percentValue < 99;

                // CORES:
                // O preenchimento (o que comeu) é sempre a cor padrão (Verde/Azul).
                const activeColor = COLORS.primary;
                // O fundo (o que faltou) fica vermelho transparente se falhou.
                const trackColor = isMissed ? 'rgba(255, 0, 0, 0.15)' : '#F0F0F0';

                return (
                    <View key={index} style={styles.column}>

                        {/* Ícone de Alerta se falhou */}
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

                        {/* Texto vermelho se falhou */}
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
        top: -18, // Posição acima da barra
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