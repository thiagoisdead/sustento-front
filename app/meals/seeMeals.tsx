import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DashboardData } from '../../types/dashboard';
import { fetchDashboardData } from '../../services/dashboardApiCall';
import { COLORS } from '../../constants/theme';
import { StatCard } from '../../components/statCard';
import { ActivityChart } from '../../components/activityChart';
import { IconPill } from '../../components/iconPill';


export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const result = await fetchDashboardData();
      setData(result);
    } catch (error) {
      console.error("Error loading dashboard", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textDark }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.headerTitle}>DASHBOARD</Text>

        {data && (
          <View style={styles.statsRow}>
            <StatCard
              label="CALORIAS"
              value={data.stats.calories.current}
              subValue={data.stats.calories.target}
              unit="kcal"
              percentage={data.stats.calories.current / data.stats.calories.target}
              color={COLORS.accentOrange}
              icon={<FontAwesome5 name="fire" size={12} color={COLORS.accentOrange} />}
            />
            <StatCard
              label="ÁGUA"
              value={data.stats.water.current}
              subValue={data.stats.water.target}
              unit="L"
              percentage={data.stats.water.current / data.stats.water.target}
              color={COLORS.accentBlue}
              icon={<Ionicons name="water" size={14} color={COLORS.accentBlue} />}
            />
            <StatCard
              label="PASSOS"
              value={(data.stats.steps.current / 1000).toFixed(1) + 'k'}
              subValue={(data.stats.steps.target / 1000) + 'k'}
              unit=""
              percentage={data.stats.steps.current / data.stats.steps.target}
              color={COLORS.primary}
              icon={<FontAwesome5 name="walking" size={12} color={COLORS.primary} />}
            />
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.decorativeBar} />
            <Text style={styles.cardTitle}>ATIVIDADE SEMANAL</Text>
          </View>
          {data && <ActivityChart data={data.weeklyActivity} />}
        </View>

        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.decorativeBar} />
              <Text style={styles.cardTitle}>RESUMO DO DIA</Text>
            </View>

            <View style={styles.splitRow}>
              {/* Left Column: Diet */}
              <View style={styles.splitColLeft}>
                <Text style={styles.subHeader}>PLANO ALIMENTAR</Text>

                <View style={styles.listItem}>
                  <IconPill icon={<FontAwesome5 name="apple-alt" size={14} color={COLORS.primary} />} />
                  <View style={styles.listTextWrapper}>
                    <Text style={styles.listLabel}>Manhã</Text>
                    <Text style={styles.listValue}>{data.mealPlan.morning}</Text>
                  </View>
                </View>

                <View style={styles.listItem}>
                  <IconPill icon={<MaterialCommunityIcons name="silverware-fork-knife" size={14} color={COLORS.primary} />} />
                  <View style={styles.listTextWrapper}>
                    <Text style={styles.listLabel}>Almoço</Text>
                    <Text style={styles.listValue}>{data.mealPlan.lunch}</Text>
                  </View>
                </View>
              </View>

              {/* Vertical Divider */}
              <View style={styles.verticalDivider} />

              {/* Right Column: Workout */}
              <View style={styles.splitColRight}>
                <Text style={styles.subHeader}>TREINO</Text>

                <View style={styles.workoutBox}>
                  <Ionicons name="barbell" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
                  <Text style={styles.workoutTitle}>{data.workout.title}</Text>
                  <Text style={styles.workoutDuration}>{data.workout.duration}</Text>
                  <View style={[styles.statusBadge, data.workout.status === 'CONCLUÍDO' ? { backgroundColor: '#E8F5E9' } : {}]}>
                    <Text style={[styles.statusText, data.workout.status === 'CONCLUÍDO' ? { color: COLORS.primary } : {}]}>
                      {data.workout.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingTop: 30, flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingVertical: 20, paddingHorizontal: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 25, letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  decorativeBar: { width: 4, height: 18, backgroundColor: COLORS.primary, borderRadius: 2, marginRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  splitRow: { flexDirection: 'row' },
  splitColLeft: { flex: 1.5 },
  splitColRight: { flex: 1, alignItems: 'center', paddingTop: 10 },
  verticalDivider: { width: 1, backgroundColor: '#F0F0F0', marginHorizontal: 15 },
  subHeader: { fontSize: 11, fontWeight: '800', color: COLORS.textLight, marginBottom: 15, textTransform: 'uppercase' },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  listTextWrapper: { flex: 1 },
  listLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 2, textTransform: 'uppercase' },
  listValue: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  workoutBox: { alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#FDFDFD', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', width: '100%' },
  workoutTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 4 },
  workoutDuration: { fontSize: 11, color: COLORS.textLight, marginBottom: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#FFF0F0', borderRadius: 20 },
  statusText: { fontSize: 8, fontWeight: '800', color: '#E57373' },
});