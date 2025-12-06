import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Event } from '../types/calendar';
import { COLORS } from '../constants/theme';
import { RemoveButton } from './removeButton';

interface CalendarEventCardProps {
    event: Event;
    onDelete: () => void;
}

export const CalendarEventCard = ({ event, onDelete }: CalendarEventCardProps) => {
    return (
        <View style={styles.eventCard}>
            <View style={styles.eventLeft}>
                <View style={styles.eventIndicator} />
                <Text style={styles.eventText}>
                    {event.time} - {event.description}
                </Text>
            </View>

            <RemoveButton onPress={onDelete} />
        </View>
    );
};

const styles = StyleSheet.create({
    eventCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    eventLeft: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
        marginRight: 10,
    },
    eventIndicator: {
        width: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
        marginRight: 12,
        height: '100%',
        minHeight: 20
    },
    eventText: {
        fontSize: 15,
        color: COLORS.textDark,
        flexShrink: 1,
    },
});