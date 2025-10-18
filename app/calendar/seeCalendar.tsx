import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { AnimatedButton } from "../../components/animatedButton";
import RemoveButton from './removeButton/removeButton';
import { Event } from '../../types/calendar';

LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt-br';

const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0];
};

export default function SeeCalendar() {
    const [selectedDate, setSelectedDate] = useState(getTodaysDate());
    const [events, setEvents] = useState<Event[]>([]);
    const eventsForSelectedDate = events.filter(e => e.calendarDate === selectedDate);

    function isValid24HourTime(timeString: string) {
        // Regular expression to match HH:mm format (00-23 for hours, 00-59 for minutes)
        const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    const markedDates = useMemo(() => ({
        [selectedDate]: {
            selected: true,
            selectedColor: '#A8D5BA',
            selectedTextColor: '#3D3D3D',
        },
    }), [selectedDate]);

    const displayTitle = useMemo(() => {
        const todayString = getTodaysDate();
        if (selectedDate === todayString) {
            return "Hoje";
        }
        const [year, month, day] = selectedDate.split('-');
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
        const options = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
        return `Eventos para ${date.toLocaleDateString('pt-BR', options)}`;
    }, [selectedDate]);

    const insertEvent = () => {
        const today = getTodaysDate();
        if (selectedDate < today) {
            alert("Não é possível adicionar eventos em datas passadas.");
            return;
        }

        const description = prompt("Insira a descrição do evento:");
        if (!description) return;
        const time = prompt("Insira o horário do evento (HH:MM):");
        if (!time) return;
        if (!isValid24HourTime(time || "")) {
            alert("Horário inválido! Por favor, insira no formato HH:MM (24 horas).");
            return;
        }

        if (description && time) {
            const newEvent: Event = {
                id: events.length + 1,
                calendarDate: selectedDate,
                time,
                description,
            };

            setEvents(prevEvents => {
                const updated = [...prevEvents, newEvent];
                // Ordena por hora
                return updated.sort((a, b) => {
                    if (a.calendarDate !== b.calendarDate) return 0; // só ordena dentro do mesmo dia
                    const [ah, am] = a.time.split(":").map(Number);
                    const [bh, bm] = b.time.split(":").map(Number);
                    return ah * 60 + am - (bh * 60 + bm);
                });
            });
        }
    };


    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.container}
            >
                <View style={styles.calendarContainer}>
                    <Calendar
                        onDayPress={day => {
                            setSelectedDate(day.dateString);
                        }}
                        markedDates={markedDates}
                        theme={{
                            textMonthFontWeight: 'bold',
                            textDayFontWeight: 'bold',
                            textDayHeaderFontWeight: 'bold',
                            monthTextColor: '#3D3D3D',
                            dayTextColor: '#3D3D3D',
                            textSectionTitleColor: '#3D3D3D',
                            todayTextColor: '#3D3D3D',
                            backgroundColor: 'transparent',
                            calendarBackground: 'transparent',
                            textDisabledColor: '#D3D3D3',
                            arrowColor: '#A8D5BA',
                            dotColor: '#A8D5BA',
                        }}
                    />
                </View>

                <Text style={styles.todayTitle}>{displayTitle}</Text>
                {eventsForSelectedDate.length === 0 ? (
                    <Text style={styles.eventText}>Nenhum evento para este dia.</Text>
                ) : (
                    eventsForSelectedDate.map(event => (
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
                {/* <View style={styles.eventCard}>
                    <View style={styles.eventIndicator} />
                    <Text style={styles.eventText}>-</Text>
                </View> */}
                <AnimatedButton
                    style={[
                        styles.addButton,
                        selectedDate < getTodaysDate() && { opacity: 0.5 } // visual feedback
                    ]}
                    onPress={selectedDate < getTodaysDate() ? () => { } : insertEvent}
                >
                    <Text style={styles.addButtonText}>Adicionar Evento</Text>
                </AnimatedButton>
            </ScrollView >
        </View >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5DC",
    },
    scrollView: {
        flex: 1,
        width: "50%",
        alignSelf: "center",
    },
    container: {
        paddingTop: 50,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    calendarContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 10,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    todayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3D3D3D',
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    eventText: {
        color: '#3D3D3D',
        fontSize: 16,
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    eventLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    eventIndicator: {
        width: 6,
        backgroundColor: '#A8D5BA',
        borderRadius: 3,
        marginRight: 10,
        alignSelf: 'stretch',
    },
    removeButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#A8D5BA',
        borderWidth: 1,
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    removeButtonHovered: {
        backgroundColor: '#A8D5BA',
    },
    removeButtonText: {
        color: '#A8D5BA',
        fontSize: 16,
        fontWeight: 'bold',
    },
    removeButtonTextHovered: {
        color: "#FFFFFF",
    },
    addButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#A8D5BA',
        borderWidth: 2,
        borderRadius: 50,
        paddingVertical: 15,
        width: '300%',
        alignItems: 'center',
        marginTop: 20,
        marginLeft: -60
    },
    addButtonText: {
        color: '#A8D5BA',
        fontSize: 16,
        fontWeight: 'bold',
    },
});