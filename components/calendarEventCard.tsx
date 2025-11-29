import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RemoveButton from './removeButton'; // Mantendo seu componente existente
import { COLORS } from '../constants/theme';
import { Event } from '../types/calendar'; // Assumindo que você moveu a tipagem

interface CalendarEventCardProps {
    event: Event;
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

export const CalendarEventCard = ({ event, setEvents }: CalendarEventCardProps) => {
    return (
        <View style={styles.eventCard}>
            <View style={styles.eventLeft}>
                <View style={styles.eventIndicator} />
                <Text style={styles.eventText}>
                    {event.time} - {event.description}
                </Text>
            </View>
            <RemoveButton id={event.id} setEvents={setEvents} />
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
    },
    eventIndicator: {
        width: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
        marginRight: 10,
        alignSelf: "stretch",
    },
    eventText: {
        fontSize: 15,
        color: COLORS.textDark,
        flexShrink: 1,
    },
});