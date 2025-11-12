import React, { useState, useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    useWindowDimensions,
    Alert,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { AnimatedButton } from "../../components/animatedButton";
import RemoveButton from "../../components/removeButton";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Event } from "../../types/calendar";

LocaleConfig.locales["pt-br"] = {
    monthNames: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ],
    monthNamesShort: [
        "Jan.", "Fev.", "Mar.", "Abr.", "Mai.", "Jun.",
        "Jul.", "Ago.", "Set.", "Out.", "Nov.", "Dez.",
    ],
    dayNames: [
        "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
    ],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

const getTodaysDate = () => new Date().toISOString().split("T")[0];

export default function SeeCalendar() {
    const { width } = useWindowDimensions();
    const isMobile = width < BREAKPOINTS.MOBILE;

    const [selectedDate, setSelectedDate] = useState(getTodaysDate());
    const [events, setEvents] = useState<Event[]>([]);

    function isValid24HourTime(timeString: string) {
        const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    const markedDates = useMemo(
        () => ({
            [selectedDate]: {
                selected: true,
                selectedColor: "#A8D5BA",
                selectedTextColor: "#3D3D3D",
            },
        }),
        [selectedDate]
    );

    const displayTitle = useMemo(() => {
        const todayString = getTodaysDate();
        if (selectedDate === todayString) return "Hoje";

        const [year, month, day] = selectedDate.split("-");
        const date = new Date(
            Date.UTC(Number(year), Number(month) - 1, Number(day))
        );
        return `Eventos para ${date.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        })}`;
    }, [selectedDate]);

    const insertEvent = () => {
        const today = getTodaysDate();
        if (new Date(selectedDate) < new Date(today)) {
            Alert.alert("Não é possível adicionar eventos em datas passadas.");
            return;
        }

        Alert.prompt(
            "Insira a descrição do evento:",
            "",
            (description) => {
                Alert.prompt(
                    "Insira o horário do evento (HH:MM):",
                    "",
                    (time) => {
                        if (!isValid24HourTime(time || "")) {
                            Alert.alert("Horário inválido! Por favor, insira no formato HH:MM (24 horas).");
                            return;
                        }

                        if (description && time) {
                            const newEvent: Event = {
                                id: Math.max(0, ...events.map(e => e.id)) + 1,
                                calendarDate: selectedDate,
                                time,
                                description,
                            };

                            setEvents((prevEvents) => {
                                const updated = [...prevEvents, newEvent];
                                return updated.sort((a, b) => {
                                    if (a.calendarDate !== b.calendarDate) return 0;
                                    const [ah, am] = a.time.split(":").map(Number);
                                    const [bh, bm] = b.time.split(":").map(Number);
                                    return ah * 60 + am - (bh * 60 + bm);
                                });
                            });
                        }
                    }
                );
            }
        );
    };

    const eventsForSelectedDate = events.filter(
        (e) => e.calendarDate === selectedDate
    );

    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={[styles.scrollView, !isMobile && styles.scrollViewDesktop]}
                contentContainerStyle={styles.container}
            >
                <View
                    style={[
                        styles.calendarContainer,
                        !isMobile && styles.calendarContainerDesktop,
                    ]}
                >
                    <Calendar
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={markedDates}
                        theme={{
                            textMonthFontWeight: "bold",
                            textDayFontWeight: "bold",
                            textDayHeaderFontWeight: "bold",
                            monthTextColor: "#3D3D3D",
                            dayTextColor: "#3D3D3D",
                            textSectionTitleColor: "#3D3D3D",
                            todayTextColor: "#3D3D3D",
                            backgroundColor: "transparent",
                            calendarBackground: "transparent",
                            textDisabledColor: "#D3D3D3",
                            arrowColor: "#A8D5BA",
                            dotColor: "#A8D5BA",
                        }}
                    />
                </View>

                <Text style={styles.todayTitle}>{displayTitle}</Text>
                {eventsForSelectedDate.length === 0 ? (
                    <Text style={styles.eventText}>Nenhum evento para este dia.</Text>
                ) : (
                    eventsForSelectedDate.map((event) => (
                        <View key={event.id} style={styles.eventCard}>
                            <View style={styles.eventLeft}>
                                <View style={styles.eventIndicator} />
                                <Text style={styles.eventText}>
                                    {event.time} - {event.description}
                                </Text>
                            </View>
                            <RemoveButton id={event.id} setEvents={setEvents} />
                        </View>
                    ))
                )}

                <AnimatedButton
                    style={[
                        styles.addButton,
                        !isMobile && styles.addButtonDesktop,
                        selectedDate < getTodaysDate() && { opacity: 0.5 },
                    ]}
                    onPress={insertEvent}
                >
                    <Text style={styles.addButtonText}>Adicionar Evento</Text>
                </AnimatedButton>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5DC",
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
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    calendarContainer: {
        width: "100%",
        backgroundColor: "#FFFFFF",
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
        color: "#3D3D3D",
        marginBottom: 12,
    },
    eventCard: {
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#A8D5BA",
        borderRadius: 3,
        marginRight: 10,
        alignSelf: "stretch",
    },
    eventText: {
        fontSize: 15,
        color: "#3D3D3D",
        flexShrink: 1,
    },
    addButton: {
        backgroundColor: "#FFFFFF",
        borderColor: "#A8D5BA",
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
        color: "#A8D5BA",
        fontSize: 16,
        fontWeight: "bold",
    },
});
