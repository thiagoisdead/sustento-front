import React, { useMemo, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, useWindowDimensions, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from "../../constants/theme";
import { BREAKPOINTS } from "../../constants/breakpoints";
import { setupCalendarLocale } from "../../config/calendarConfig";
import { formatDisplayDate } from "../../utils/dateHelpers";
import { useSeeCalendar } from "../../hooks/useSeeCalendar";

export default function SeeCalendar() {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINTS.MOBILE;

  useEffect(() => {
    setupCalendarLocale();
  }, []);

  const { selectedDate, setSelectedDate, groupedMeals, isLoading } = useSeeCalendar();

  const markedDates = useMemo(() => {
    return {
      [selectedDate]: { selected: true, selectedColor: COLORS.primary, selectedTextColor: '#FFF' }
    };
  }, [selectedDate]);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={[styles.scrollView, !isMobile && styles.scrollViewDesktop]}
        contentContainerStyle={styles.container}
      >

        <View style={styles.calendarCard}>
          <Text style={styles.headerTitle}>Planejamento Alimentar</Text>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day?.dateString)}
            markedDates={markedDates}
            theme={{
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "bold",
              arrowColor: COLORS.primary,
              todayTextColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
            }}
          />
        </View>

        <Text style={styles.dateLabel}>
          {formatDisplayDate(selectedDate)}
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : groupedMeals?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nada planejado para este dia.</Text>
          </View>
        ) : (
          groupedMeals?.map((mealGroup) => (
            <View key={mealGroup?.meal_id} style={styles.mealSection}>

              {/* HEADER DA REFEIÇÃO */}
              <View style={styles.mealHeaderRow}>
                <View style={styles.leftHeader}>
                  <MaterialCommunityIcons name="food-variant" size={20} color={COLORS.primary} />
                  <View>
                    <Text style={styles.mealTitle}>{mealGroup?.meal_name}</Text>
                    {mealGroup?.displayTime && mealGroup?.displayTime !== "00:00" ? (
                      <Text style={styles.mealTimeLabel}>{mealGroup?.displayTime}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.rightHeader}>
                  <Text style={styles.mealCalories}>{mealGroup?.totalCalories} kcal</Text>
                </View>
              </View>

              <View style={styles.foodList}>
                {mealGroup?.foods?.length === 0 ? (
                  <Text style={styles.emptyFoodText}>—</Text>
                ) : (
                  mealGroup?.foods?.map((food, index) => (
                    <View key={`${food?.id}-${index}`} style={styles.foodItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodName}>{food?.name}</Text>
                        <Text style={styles.foodDetail}>
                          {food?.quantity}{food?.unit} • {food?.calories} kcal
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollViewDesktop: { maxWidth: 800, alignSelf: "center", width: "100%" },
  container: { padding: 16, paddingTop: 40 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 15 },
  calendarCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 10, marginBottom: 20, marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dateLabel: { fontSize: 18, fontWeight: '600', color: COLORS.textDark, marginBottom: 15, textTransform: 'capitalize', marginLeft: 4 },

  mealSection: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F5F5F5' },
  mealHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  leftHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  mealTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, textTransform: 'uppercase' },
  mealTimeLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  mealCalories: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },

  foodList: { marginBottom: 0 },
  foodItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9F9F9' },
  foodName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  foodDetail: { fontSize: 12, color: COLORS.textLight },
  emptyFoodText: { fontSize: 13, color: '#DDD', fontStyle: 'italic', marginVertical: 5 },

  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { color: COLORS.textLight },
});