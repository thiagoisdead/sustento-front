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
  Alert,
  TouchableOpacity
} from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// --- Types & Services ---
import { DashboardData } from '../../types/dashboard';
import { MealPlan } from '../../types/meals';
import { getDashboardData } from '../../services/dashboardService';
import { getUserMealPlans, activateMealPlan } from '../../services/mealPlanService';
import { COLORS } from '../../constants/theme';

// --- Components ---
import { StatCard } from '../../components/statCard';
import { ActivityChart } from '../../components/activityChart';
import { IconPill } from '../../components/iconPill';
import { AnimatedButton } from '../../components/animatedButton';
import { MealPlanItem } from '../../components/dashboard/mealPlanItem'; // We created this earlier

// Define the 3 States of the screen
type ViewState = 'LOADING' | 'EMPTY' | 'SELECTION' | 'DASHBOARD';

export default function Dashboard() {
  const [viewState, setViewState] = useState<ViewState>('LOADING');

  // Data State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<MealPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // --- Main Data Loader ---
  const loadInitialData = useCallback(async () => {
    try {
      if (!refreshing) setViewState('LOADING');

      // 1. Fetch all plans to see where we stand
      const plans = await getUserMealPlans();
      setAvailablePlans(plans);

      if (plans.length === 0) {
        setViewState('EMPTY');
        return;
      }

      // 2. Check if there is an ACTIVE plan
      const activePlan = plans.find(p => p.active);

      if (activePlan) {
        // 3. If active, fetch the heavy dashboard data
        const dashData = await getDashboardData();
        if (dashData) {
          setDashboardData(dashData);
          setViewState('DASHBOARD');
        } else {
          // Fallback if data fetch fails but plan exists
          setViewState('SELECTION');
        }
      } else {
        // 4. Plans exist, but none active -> Go to Selection
        setViewState('SELECTION');
      }

    } catch (error) {
      console.error("Error loading dashboard flow", error);
      Alert.alert("Erro", "Falha ao carregar informações.");
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialData();
  };

  // --- Handlers ---

  const handleActivatePlan = async (plan: MealPlan) => {
    try {
      setViewState('LOADING');
      await activateMealPlan(plan.plan_id);
      // Reload everything to refresh data with new targets
      await loadInitialData();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível ativar o plano.");
      setViewState('SELECTION');
    }
  };

  const handleCreatePlan = () => {
    // Navigate to Create Plan Screen
    // router.push('/plans/create');
    Alert.alert("Navegação", "Ir para tela de criar plano...");
  };

  const handleChangePlan = () => {
    // Allow user to switch plans manually
    setViewState('SELECTION');
  };

  // --- RENDERERS ---

  // 1. State: Loading
  if (viewState === 'LOADING') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textDark }}>Carregando...</Text>
      </View>
    );
  }

  // 2. State: Empty (No Plans)
  if (viewState === 'EMPTY') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <MaterialCommunityIcons name="food-variant" size={80} color={COLORS.primary} style={{ opacity: 0.5, marginBottom: 20 }} />
          <Text style={styles.headerTitle}>Bem-vindo!</Text>
          <Text style={styles.emptyText}>
            Você ainda não possui nenhum plano alimentar. Crie um agora para começar a acompanhar sua dieta.
          </Text>
          <AnimatedButton style={styles.createButton} onPress={handleCreatePlan}>
            <Text style={styles.btnText}>Criar Meu Primeiro Plano</Text>
          </AnimatedButton>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. State: Selection (Choose a Plan)
  if (viewState === 'SELECTION') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <Text style={styles.headerTitle}>SELECIONAR PLANO</Text>
          <Text style={styles.subTitle}>Escolha qual plano você quer seguir hoje:</Text>

          <View style={{ gap: 10 }}>
            {availablePlans.map((plan) => (
              <MealPlanItem
                key={plan.plan_id}
                plan={plan}
                onPress={() => handleActivatePlan(plan)}
              />
            ))}
          </View>

          <AnimatedButton style={[styles.createButton, { marginTop: 30, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary }]} onPress={handleCreatePlan}>
            <Text style={[styles.btnText, { color: COLORS.primary }]}>Criar Novo Plano</Text>
          </AnimatedButton>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 4. State: Dashboard (Active)
  // (This is the logic we built previously)
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header with "Change Plan" option */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.headerTitle}>DASHBOARD</Text>
          <TouchableOpacity onPress={handleChangePlan} style={styles.changePlanButton}>
            <MaterialCommunityIcons name="swap-horizontal" size={20} color={COLORS.primary} />
            <Text style={styles.changePlanText}>Trocar Plano</Text>
          </TouchableOpacity>
        </View>

        {dashboardData && (
          <>
            <View style={styles.statsRow}>
              <StatCard
                label="CALORIAS"
                value={dashboardData.stats.calories.current}
                subValue={dashboardData.stats.calories.target}
                unit="kcal"
                percentage={dashboardData.stats.calories.target > 0 ? dashboardData.stats.calories.current / dashboardData.stats.calories.target : 0}
                color={COLORS.accentOrange}
                icon={<FontAwesome5 name="fire" size={12} color={COLORS.accentOrange} />}
              />
              <StatCard
                label="ÁGUA"
                value={dashboardData.stats.water.current}
                subValue={dashboardData.stats.water.target}
                unit="L"
                percentage={dashboardData.stats.water.target > 0 ? dashboardData.stats.water.current / dashboardData.stats.water.target : 0}
                color={COLORS.accentBlue}
                icon={<Ionicons name="water" size={14} color={COLORS.accentBlue} />}
              />
              <StatCard
                label="PASSOS"
                value={dashboardData.stats.steps.current}
                subValue={dashboardData.stats.steps.target}
                unit=""
                percentage={dashboardData.stats.steps.target > 0 ? dashboardData.stats.steps.current / dashboardData.stats.steps.target : 0}
                color={COLORS.primary}
                icon={<FontAwesome5 name="walking" size={12} color={COLORS.primary} />}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.decorativeBar} />
                <Text style={styles.cardTitle}>ATIVIDADE SEMANAL</Text>
              </View>
              <ActivityChart data={dashboardData.weeklyActivity} />
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.decorativeBar} />
                <Text style={styles.cardTitle}>RESUMO DO DIA</Text>
              </View>
              <View style={styles.splitRow}>
                <View style={styles.splitColLeft}>
                  <Text style={styles.subHeader}>PLANO ALIMENTAR</Text>
                  <View style={styles.listItem}>
                    <IconPill icon={<FontAwesome5 name="apple-alt" size={14} color={COLORS.primary} />} />
                    <View style={styles.listTextWrapper}>
                      <Text style={styles.listLabel}>Manhã</Text>
                      <Text style={styles.listValue}>{dashboardData.todayMealsSummary.breakfast}</Text>
                    </View>
                  </View>
                  <View style={styles.listItem}>
                    <IconPill icon={<MaterialCommunityIcons name="silverware-fork-knife" size={14} color={COLORS.primary} />} />
                    <View style={styles.listTextWrapper}>
                      <Text style={styles.listLabel}>Almoço</Text>
                      <Text style={styles.listValue}>{dashboardData.todayMealsSummary.lunch}</Text>
                    </View>
                  </View>
                  <View style={styles.listItem}>
                    <IconPill icon={<MaterialCommunityIcons name="silverware-spoon" size={14} color={COLORS.primary} />} />
                    <View style={styles.listTextWrapper}>
                      <Text style={styles.listLabel}>Jantar</Text>
                      <Text style={styles.listValue}>{dashboardData.todayMealsSummary.dinner}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.splitColRight}>
                  <Text style={styles.subHeader}>TREINO</Text>
                  <View style={styles.workoutBox}>
                    <Ionicons name="barbell" size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
                    <Text style={styles.workoutTitle}>{dashboardData.workout.title}</Text>
                    <Text style={styles.workoutDuration}>{dashboardData.workout.duration}</Text>
                    <View style={[styles.statusBadge, dashboardData.workout.status === 'CONCLUÍDO' ? { backgroundColor: '#E8F5E9' } : {}]}>
                      <Text style={[styles.statusText, dashboardData.workout.status === 'CONCLUÍDO' ? { color: COLORS.primary } : {}]}>
                        {dashboardData.workout.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingVertical: 40, paddingHorizontal: 16 },

  // Header
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  subTitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  changePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  changePlanText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Empty State
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Dashboard Layout
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