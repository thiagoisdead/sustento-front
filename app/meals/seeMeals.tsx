import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// --- Constants ---
const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F5F5DC',
  cardBg: '#FFFFFF',
  primary: '#A8D5BA',
  textDark: '#3D3D3D',
  textLight: '#8D99AE',
  accentOrange: '#E29578',
  accentBlue: '#83C5BE',
};

// --- 1. DATA TYPES (Matches your C# DTO ideally) ---
interface DashboardData {
  stats: {
    calories: { current: number; target: number };
    water: { current: number; target: number };
    steps: { current: number; target: number };
  };
  weeklyActivity: { day: string; val: number }[];
  mealPlan: {
    morning: string;
    lunch: string;
    dinner: string;
  };
  workout: {
    title: string;
    duration: string;
    status: 'PENDENTE' | 'CONCLUÍDO';
  };
}

// --- 2. SERVICE SIMULATION ---
// In the future, replace this with: await baseUniqueGet('/dashboard/summary');
const fetchDashboardData = async (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          calories: { current: 1250, target: 2000 },
          water: { current: 2.1, target: 3.0 },
          steps: { current: 5400, target: 10000 },
        },
        weeklyActivity: [
          { day: 'SEG', val: 45 },
          { day: 'TER', val: 80 },
          { day: 'QUA', val: 60 },
          { day: 'QUI', val: 110 },
          { day: 'SEX', val: 90 },
          { day: 'SÁB', val: 30 },
          { day: 'DOM', val: 15 },
        ],
        mealPlan: {
          morning: 'Ovos Mexidos & Café',
          lunch: 'Frango com Batata Doce',
          dinner: 'Sopa de Legumes',
        },
        workout: {
          title: 'Treino de Pernas',
          duration: '50 min',
          status: 'PENDENTE',
        },
      });
    }, 1500); // Fakes a 1.5s network delay
  });
};

// --- COMPONENT: Linear Stat Card ---
const StatCard = ({ label, value, subValue, unit, percentage, color, icon }: any) => {
  // Safe guard: ensure percentage is between 0 and 1
  const safePercent = Math.min(Math.max(percentage || 0, 0), 1);
  const barWidth = safePercent * 100;

  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>

      <Text style={styles.statSubValue}>
        Meta: {subValue || '--'}
      </Text>

      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${barWidth}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
  );
};

// --- COMPONENT: Activity Chart (Dynamic) ---
const ActivityChart = ({ data }: { data: { day: string; val: number }[] }) => {
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

// --- COMPONENT: Icon Pill ---
const IconPill = ({ icon }: any) => (
  <View style={styles.iconPill}>
    {icon}
  </View>
);

// --- MAIN APP COMPONENT ---
export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to load data
  const loadData = useCallback(async () => {
    try {
      // If using refresh control, don't show the full screen loader, just the spinner
      if (!refreshing) setLoading(true);

      const result = await fetchDashboardData(); // Call your service here
      setData(result);
    } catch (error) {
      console.error("Error loading dashboard", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  // Refresh Handler
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

        {/* 1. STATS SECTION (Connected to State) */}
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

        {/* 2. CHART SECTION (Connected to State) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.decorativeBar} />
            <Text style={styles.cardTitle}>ATIVIDADE SEMANAL</Text>
          </View>
          {data && <ActivityChart data={data.weeklyActivity} />}
        </View>

        {/* 3. PLANS SECTION (Connected to State) */}
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
  safeArea: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 0.5,
  },

  // --- Stat Card Styles ---
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 3,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
    marginLeft: 2,
  },
  statSubValue: {
    fontSize: 9,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // --- General Card Styles ---
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  decorativeBar: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // --- Chart Styles ---
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 140,
    alignItems: 'flex-end',
    paddingHorizontal: 5,
  },
  barColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1,
  },
  barTrack: {
    width: 10,
    height: 110,
    justifyContent: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 8,
    fontWeight: '600',
  },
  barLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // --- List/Plan Styles ---
  splitRow: { flexDirection: 'row' },
  splitColLeft: { flex: 1.5 },
  splitColRight: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 15,
  },
  subHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listTextWrapper: { flex: 1 },
  listLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  listValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // --- Workout Box ---
  workoutBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FDFDFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    width: '100%',
  },
  workoutTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#FFF0F0',
    borderRadius: 20,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#E57373',
  },
});