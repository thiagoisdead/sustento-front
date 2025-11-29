import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export const ActivityChart = ({ data }: { data: { day: string; val: number }[] }) => {
    // Find the highest value in the week to scale the bars correctly
    const maxVal = Math.max(...data.map(d => d.val), 100);

    return (
        <View style={styles.chartContainer}>
            {data.map((item, index) => {
                const heightPercentage = (item.val / maxVal) * 100;
                // Highlight logic: Assume today is the last item, or highlight high activity
                const isHighlight = item.val >= maxVal * 0.9;

                return (
                    <View key={index} style={styles.barColumn}>
                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.barFill,
                                    {
                                        height: `${heightPercentage}%`,
                                        backgroundColor: isHighlight ? COLORS.primary : '#E0E0E0'
                                    }
                                ]}
                            />
                        </View>
                        <Text style={[styles.barLabel, isHighlight && styles.barLabelActive]}>
                            {item.day}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 140, alignItems: 'flex-end', paddingHorizontal: 5 },
    barColumn: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', flex: 1 },
    barTrack: { width: 10, height: 110, justifyContent: 'flex-end', backgroundColor: '#F8F9FA', borderRadius: 10, overflow: 'hidden' },
    barFill: { width: '100%', borderRadius: 10 },
    barLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 8, fontWeight: '600' },
    barLabelActive: { color: COLORS.primary, fontWeight: '800' },
});