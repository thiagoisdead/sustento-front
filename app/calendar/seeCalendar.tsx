import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, View, Text, useWindowDimensions, Alert, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from '@react-navigation/native';

import { AnimatedButton } from "../../components/animatedButton";
import { CalendarEventCard } from "../../components/calendarEventCard";
import { AddEventModal } from "../../components/addEventModal";
import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { Event } from "../../types/calendar";
import { setupCalendarLocale } from "../../config/calendarConfig";
import { getTodaysDate, formatDisplayDate } from "../../utils/dateHelpers";

import { getItem } from "../../services/secureStore";
import { loadEvents, addEvent, removeEvent } from "../../services/calendarService";

setupCalendarLocale();

export default function SeeCalendar() {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINTS.MOBILE;
  const [selectedDate, setSelectedDate] = useState(getTodaysDate());
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      const idString = await getItem('id');
      if (idString) {
        const userId = Number(idString);
        setCurrentUserId(userId);
        const userEvents = await loadEvents(userId);
        setEvents(userEvents);
      }
    } catch (error) {
      console.error("Erro ao carregar calendário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  const markedDates = useMemo(() => {
    const marks: any = {
      [selectedDate]: { selected: true, selectedColor: COLORS.primary, selectedTextColor: COLORS.textDark },
    };
    events.forEach(event => {
      if (event.calendarDate) {
        marks[event.calendarDate] = { ...marks[event.calendarDate], marked: true, dotColor: COLORS.primary };
      }
    });
    return marks;
  }, [selectedDate, events]);

  const eventsForSelectedDate = useMemo(() => {
    return events.filter((e) => e.calendarDate === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDate]);

  const handleAddButtonPress = () => {
    if (!currentUserId) return Alert.alert("Aviso", "Faça login para usar o calendário.");
    if (new Date(selectedDate) < new Date(getTodaysDate())) return Alert.alert("Aviso", "Data passada.");
    setIsModalVisible(true);
  };

  const handleSaveEvent = async (description: string, time: string) => {
    if (!currentUserId) return;
    const newEvent: Event = { id: Date.now(), calendarDate: selectedDate, time, description };
    try {
      const updatedList = await addEvent(currentUserId, newEvent);
      setEvents(updatedList);
    } catch (error) { Alert.alert("Erro", "Falha ao salvar."); }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!currentUserId) return;
    try {
      const updatedList = await removeEvent(currentUserId, eventId);
      setEvents(updatedList);
    } catch (error) { Alert.alert("Erro", "Falha ao remover."); }
  };

  if (isLoading && events.length === 0) {
    return <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView style={[styles.scrollView, !isMobile && styles.scrollViewDesktop]} contentContainerStyle={styles.container}>
        <View style={[styles.calendarContainer, !isMobile && styles.calendarContainerDesktop]}>
          <Text style={styles.headerTitle}>Calendário</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              textMonthFontWeight: "bold", textDayFontWeight: "bold", textDayHeaderFontWeight: "bold",
              monthTextColor: COLORS.textDark, dayTextColor: COLORS.textDark,
              textSectionTitleColor: COLORS.textDark, todayTextColor: COLORS.textDark,
              backgroundColor: "transparent", calendarBackground: "transparent",
              textDisabledColor: "#D3D3D3", arrowColor: COLORS.primary, dotColor: COLORS.primary,
            }}
          />
        </View>
        <Text style={styles.todayTitle}>{selectedDate === getTodaysDate() ? "Hoje" : formatDisplayDate(selectedDate)}</Text>
        {eventsForSelectedDate.length === 0 ? (
          <>
            <Text style={styles.emptyText}>Nenhum evento para este dia.</Text>
          </>
        ) : (
          eventsForSelectedDate.map((event) => (
            <CalendarEventCard key={event.id} event={event} onDelete={() => handleDeleteEvent(event.id)} />
          ))
        )}
        <AnimatedButton style={[styles.addButton, !isMobile && styles.addButtonDesktop, selectedDate < getTodaysDate() && { opacity: 0.8 }]} onPress={handleAddButtonPress}>
          <Text style={styles.addButtonText}>Adicionar Evento</Text>
        </AnimatedButton>
      </ScrollView>
      <AddEventModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} onSave={handleSaveEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1, width: "100%" },
  scrollViewDesktop: { width: "70%", alignSelf: "center" },
  container: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 40 },
  calendarContainer: { width: "100%", backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 10, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  calendarContainerDesktop: { padding: 20 },
  todayTitle: { fontSize: 18, fontWeight: "600", color: COLORS.textDark, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textDark, fontStyle: 'italic', opacity: 0.7, marginBottom: 20 },
  addButton: { backgroundColor: COLORS.cardBg, borderColor: COLORS.primary, borderWidth: 2, borderRadius: 30, paddingVertical: 12, paddingHorizontal: 20, alignSelf: "stretch", alignItems: "center", marginTop: 10 },
  addButtonDesktop: { alignSelf: "center", width: 250 },
  addButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: "bold" },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 5, marginTop: 10 },

});