import React, { useState, useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    useWindowDimensions,
    Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";

// Imports
import { AnimatedButton } from "../../components/animatedButton";
import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Event } from "../../types/calendar";
import { setupCalendarLocale } from "../../config/calendarConfig";
import { getTodaysDate, formatDisplayDate } from "../../utils/dateHelpers";
import { CalendarEventCard } from "../../components/calendarEventCard";
import { AddEventModal } from "../../components/addEventModal";

setupCalendarLocale();

export default function seeCalendar() {
    const { width } = useWindowDimensions();
    const isMobile = width < BREAKPOINTS.MOBILE;

    const [selectedDate, setSelectedDate] = useState(getTodaysDate());
    const [events, setEvents] = useState<Event[]>([]);

    // Novo estado para controlar o modal
    const [isModalVisible, setIsModalVisible] = useState(false);

    const markedDates = useMemo(() => ({
        [selectedDate]: {
            selected: true,
            selectedColor: COLORS.primary,
            selectedTextColor: COLORS.textDark,
        },
    }), [selectedDate]);

    const displayTitle = useMemo(() => {
        if (selectedDate === getTodaysDate()) return "Hoje";
        return formatDisplayDate(selectedDate);
    }, [selectedDate]);

    const eventsForSelectedDate = useMemo(() => {
        return events.filter((e) => e.calendarDate === selectedDate);
    }, [events, selectedDate]);

    // Handler para abrir o modal
    const handleAddButtonPress = () => {
        if (new Date(selectedDate) < new Date(getTodaysDate())) {
            Alert.alert("Aviso", "Não é possível adicionar eventos em datas passadas.");
            return;
        }
        setIsModalVisible(true);
    };

    // Handler para salvar os dados vindos do Modal
    const handleSaveEvent = (description: string, time: string) => {
        const newEvent: Event = {
            id: Date.now(),
            calendarDate: selectedDate,
            time,
            description,
        };

        setEvents((prev) => [...prev, newEvent].sort((a, b) => {
            return a.time.localeCompare(b.time);
        }));
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={[styles.scrollView, !isMobile && styles.scrollViewDesktop]}
                contentContainerStyle={styles.container}
            >
                <View style={[styles.calendarContainer, !isMobile && styles.calendarContainerDesktop]}>
                    <Calendar
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={markedDates}
                        theme={{
                            textMonthFontWeight: "bold",
                            textDayFontWeight: "bold",
                            textDayHeaderFontWeight: "bold",
                            monthTextColor: COLORS.textDark,
                            dayTextColor: COLORS.textDark,
                            textSectionTitleColor: COLORS.textDark,
                            todayTextColor: COLORS.textDark,
                            backgroundColor: "transparent",
                            calendarBackground: "transparent",
                            textDisabledColor: "#D3D3D3",
                            arrowColor: COLORS.primary,
                            dotColor: COLORS.primary,
                        }}
                    />
                </View>

                <Text style={styles.todayTitle}>{displayTitle}</Text>

                {eventsForSelectedDate.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum evento para este dia.</Text>
                ) : (
                    eventsForSelectedDate.map((event) => (
                        <CalendarEventCard
                            key={event.id}
                            event={event}
                            setEvents={setEvents}
                        />
                    ))
                )}

                <AnimatedButton
                    style={[
                        styles.addButton,
                        !isMobile && styles.addButtonDesktop,
                        selectedDate < getTodaysDate() && { opacity: 0.5 },
                    ]}
                    onPress={handleAddButtonPress} // <--- Atualizado
                >
                    <Text style={styles.addButtonText}>Adicionar Evento</Text>
                </AnimatedButton>
            </ScrollView>

            {/* MODAL FICA AQUI */}
            <AddEventModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleSaveEvent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // ... Mantenha seus estilos existentes
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
        width: "100%",
    },
    scrollViewDesktop: {
        width: "70%",
        alignSelf: "center",
    },
    container: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    calendarContainer: {
        width: "100%",
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    calendarContainerDesktop: {
        padding: 20,
    },
    todayTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.textDark,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        color: COLORS.textDark,
        fontStyle: 'italic',
        opacity: 0.7,
    },
    addButton: {
        backgroundColor: COLORS.cardBg,
        borderColor: COLORS.primary,
        borderWidth: 2,
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignSelf: "stretch",
        alignItems: "center",
        marginTop: 20,
    },
    addButtonDesktop: {
        alignSelf: "center",
        width: 250,
    },
    addButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
});