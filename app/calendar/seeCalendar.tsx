import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { AnimatedButton } from "../../components/animatedButton";

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
                <View style={styles.eventCard}>
                    <View style={styles.eventIndicator} />
                    <Text style={styles.eventText}>18:00 - Sessão de Treino</Text>
                </View>
                <View style={styles.eventCard}>
                    <View style={styles.eventIndicator} />
                    <Text style={styles.eventText}>19:30 - Plano de Refeição</Text>
                </View>
                <AnimatedButton
                    style={styles.addButton}
                    onPress={() => console.log("Pressed")}
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
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    eventIndicator: {
        width: 6,
        height: '100%',
        backgroundColor: '#A8D5BA',
        borderRadius: 3,
        marginRight: 15,
    },
    eventText: {
        fontSize: 16,
        color: '#3D3D3D',
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