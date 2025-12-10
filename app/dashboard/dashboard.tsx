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
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { DashboardData, ViewState } from '../../types/dashboard';
import { MealPlan } from '../../types/meals';
import { COLORS } from '../../constants/theme';

import { getDashboardData } from '../../services/dashboardService';
import {
  getUserMealPlans,
  switchActivePlan,
  createNewMealPlan,
} from '../../services/mealPlanService';

import { StatCard } from '../../components/statCard';
import { ActivityChart } from '../../components/activityChart';
import { IconPill } from '../../components/iconPill';
import { AnimatedButton } from '../../components/animatedButton';
import { MealPlanItem } from '../../components/dashboard/mealPlanItem';
import { CreatePlanModal } from '../../components/dashboard/createPlanModal';
import { usePath } from '../../hooks/usePath';

const getSundayOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const normalizeWeeklyData = (backendData: any[], referenceDate: Date): DashboardData['weeklyActivity'] => {
  if (!Array.isArray(backendData)) return [];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const startOfWeek = getSundayOfWeek(referenceDate);
  startOfWeek.setHours(0, 0, 0, 0);

  const fullWeek = Array.from({ length: 7 }).map((_, index) => {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + index);
    const dateStr = formatDateISO(currentDay);

    const found = backendData.find(d => {
      return d && typeof d.date === 'string' && d.date.startsWith(dateStr);
    });

    return {
      day: daysOfWeek[index],
      date: dateStr,
      current: found ? Number(found.current) || 0 : 0,
      target: found ? Number(found.target) || 0 : 0,
    };
  });

  return fullWeek as DashboardData['weeklyActivity'];
};

export default function Dashboard() {
  const handlePath = usePath();

  const [viewState, setViewState] = useState<ViewState>('LOADING');
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<MealPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [activePlanName, setActivePlanName] = useState<string>("");

  const changeWeek = (weeks: number) => {
    if (isLoadingData) return; 
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (weeks * 7));
    setSelectedDate(newDate);
  };

  const resetToCurrentWeek = () => {
    if (isLoadingData) return;
    setSelectedDate(new Date());
  };

  const getWeekRangeTitle = () => {
    const start = getSundayOfWeek(selectedDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `SEMANA DE ${fmt(start)} À ${fmt(end)}`;
  };

  const loadInitialData = useCallback(async () => {
    try {
      if (!refreshing) {
        setIsLoadingData(true);
      }

      const plans = await getUserMealPlans();
      setAvailablePlans(plans);

      if (!plans || plans.length === 0) {
        setViewState('EMPTY');
        return;
      }

      const active = plans.find(p => p.active);

      if (active) {
        setActivePlanId(active.plan_id);
        setActivePlanName(active.plan_name);

        const startOfWeek = getSundayOfWeek(selectedDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const dashData = await getDashboardData(formatDateISO(startOfWeek), formatDateISO(endOfWeek));

        if (dashData) {
          const normalizedActivity = normalizeWeeklyData(dashData.weeklyActivity, selectedDate);

          const finalData: DashboardData = {
            stats: dashData.stats as DashboardData['stats'],
            weeklyActivity: normalizedActivity,
            todayMealsSummary: dashData.todayMealsSummary as DashboardData['todayMealsSummary']
          };

          setDashboardData(finalData);
          setViewState('DASHBOARD');
        } else {
          setViewState('SELECTION');
        }
      } else {
        setActivePlanId(null);
        setViewState('SELECTION');
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      Alert.alert("Erro", "Falha ao carregar dados.");
    } finally {
      setRefreshing(false);
      setIsLoadingData(false); 
    }
  }, [selectedDate, refreshing]); 

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialData();
  };

  const handleSelectPlan = async (plan: MealPlan) => {
    if (plan.active || plan.plan_id === activePlanId) {
      setViewState('LOADING');
      await loadInitialData();
      return;
    }
    try {
      setViewState('LOADING');
      await switchActivePlan(plan.plan_id, activePlanId || undefined);
      await loadInitialData();
    } catch {
      Alert.alert("Erro", "Erro ao ativar plano.");
      setViewState('SELECTION');
    }
  };

  const handleCreatePlanSubmit = async (name: string, source: 'AUTOMATIC' | 'MANUAL') => {
    try {
      setViewState('LOADING');
      await createNewMealPlan(name, source);
      await loadInitialData();
    } catch {
      Alert.alert("Erro", "Falha ao criar plano.");
      setViewState('EMPTY');
    }
  };

  if (viewState === 'LOADING' && !dashboardData) return (<View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={COLORS.primary} /></View>);

  if (viewState === 'EMPTY') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={[styles.scrollContent, { flex: 1, justifyContent: 'center', alignItems: 'center' }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
          <MaterialCommunityIcons name="food-variant" size={80} color={COLORS.primary} style={{ opacity: 0.5, marginBottom: 20 }} />
          <Text style={styles.headerTitle}>Bem-vindo!</Text>
          <Text style={styles.emptyText}>Você ainda não possui nenhum plano alimentar.</Text>
          <AnimatedButton style={[styles.createButton, { marginTop: 30 }]} onPress={() => handlePath('/foodTracker/seeFoodTracker')}><Text style={styles.btnText}>Criar Primeiro Plano</Text></AnimatedButton>
        </ScrollView>
        <CreatePlanModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSubmit={handleCreatePlanSubmit} />
      </SafeAreaView>
    );
  }

  if (viewState === 'SELECTION') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
          <Text style={styles.headerTitle}>Ativar Plano</Text>
          <Text style={styles.subTitle}>Selecione um plano para começar:</Text>
          <View style={{ gap: 10 }}>
            {availablePlans.map((plan) => (
              <MealPlanItem key={plan.plan_id} plan={plan} onPress={() => handleSelectPlan(plan)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.dashboardHeader}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.activePlanBadge}>
            <Text style={styles.activePlanLabel}>{activePlanName}</Text>
          </View>
        </View>

        {dashboardData && (() => {
          const { stats } = dashboardData;
          const isCalorieOver = (stats.calories?.current ?? 0) > (stats.calories?.target ?? 0);
          const isProtOver = (stats.macros?.protein?.current ?? 0) > (stats.macros?.protein?.target ?? 0);
          const isCarbOver = (stats.macros?.carbs?.current ?? 0) > (stats.macros?.carbs?.target ?? 0);
          const isFatOver = (stats.macros?.fats?.current ?? 0) > (stats.macros?.fats?.target ?? 0);

          return (
            <View style={{ opacity: isLoadingData ? 0.5 : 1 }}>
              <View style={styles.heroSection}>
                <StatCard
                  label="CALORIAS DIÁRIAS"
                  value={stats?.calories?.current ?? 0}
                  subValue={stats?.calories?.target ?? 2000}
                  unit="kcal"
                  percentage={(stats?.calories?.target ?? 0) > 0 ? (stats?.calories?.current ?? 0) / (stats?.calories?.target ?? 1) : 0}
                  color={COLORS.accentOrange}
                  icon={<FontAwesome5 name="fire" size={18} color={COLORS.accentOrange} />}
                  style={{ width: '100%' }}
                  valueColor={isCalorieOver ? '#E57373' : COLORS.textDark}
                />
              </View>

              <View style={styles.statsRow}>
                <StatCard
                  label="PROT"
                  value={stats?.macros?.protein?.current ?? 0}
                  subValue={stats?.macros?.protein?.target ?? 0}
                  unit="g"
                  percentage={(stats?.macros?.protein?.target ?? 0) > 0 ? (stats?.macros?.protein?.current ?? 0) / (stats?.macros?.protein?.target ?? 1) : 0}
                  color={COLORS.primary}
                  icon={<MaterialCommunityIcons name="food-drumstick" size={14} color={COLORS.primary} />}
                  valueColor={isProtOver ? '#E57373' : COLORS.textDark}
                />
                <StatCard
                  label="CARB"
                  value={stats?.macros?.carbs?.current ?? 0}
                  subValue={stats?.macros?.carbs?.target ?? 0}
                  unit="g"
                  percentage={(stats?.macros?.carbs?.target ?? 0) > 0 ? (stats?.macros?.carbs?.current ?? 0) / (stats?.macros?.carbs?.target ?? 1) : 0}
                  color={COLORS.accentBlue}
                  icon={<MaterialCommunityIcons name="barley" size={14} color={COLORS.accentBlue} />}
                  valueColor={isCarbOver ? '#E57373' : COLORS.textDark}
                />
                <StatCard
                  label="GORD"
                  value={stats?.macros?.fats?.current ?? 0}
                  subValue={stats?.macros?.fats?.target ?? 0}
                  unit="g"
                  percentage={(stats?.macros?.fats?.target ?? 0) > 0 ? (stats?.macros?.fats?.current ?? 0) / (stats?.macros?.fats?.target ?? 1) : 0}
                  color="#E6B800"
                  icon={<MaterialCommunityIcons name="oil" size={14} color="#E6B800" />}
                  valueColor={isFatOver ? '#E57373' : COLORS.textDark}
                />
              </View>

              <View style={styles.card}>
                <View style={styles.chartHeaderContainer}>
                  <View style={styles.decorativeBar} />
                  <View style={styles.weekNavigation}>
                    <TouchableOpacity
                      onPress={() => changeWeek(-1)}
                      style={styles.navArrow}
                      disabled={isLoadingData} 
                    >
                      <Ionicons name="chevron-back" size={20} color={isLoadingData ? '#CCC' : COLORS.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={resetToCurrentWeek} disabled={isLoadingData}>
                      <Text style={styles.cardTitle}>
                        {isLoadingData ? "CARREGANDO..." : getWeekRangeTitle()}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => changeWeek(1)}
                      style={styles.navArrow}
                      disabled={isLoadingData}
                    >
                      <Ionicons name="chevron-forward" size={20} color={isLoadingData ? '#CCC' : COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                </View>
                <ActivityChart data={dashboardData.weeklyActivity || []} />
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.decorativeBar} />
                  <Text style={styles.cardTitle}>RESUMO DO DIA</Text>
                </View>
                <View style={styles.fullWidthList}>
                  {(!dashboardData.todayMealsSummary || dashboardData.todayMealsSummary.length === 0) ? (
                    <Text style={{ textAlign: 'center', color: '#999', padding: 10 }}>Nenhuma refeição configurada.</Text>
                  ) : (
                    dashboardData.todayMealsSummary.map((mealGroup, index) => (
                      <View key={index} style={styles.mealGroupContainer}>
                        <View style={styles.mealHeader}>
                          <IconPill icon={<MaterialCommunityIcons name="silverware-variant" size={14} color={COLORS.primary} />} />
                          <Text style={styles.listLabel}>{mealGroup.meal_name}</Text>
                        </View>
                        <View style={styles.foodListContainer}>
                          {mealGroup.foods.length === 0 ? (
                            <Text style={styles.emptyFoodText}>— Nada registrado —</Text>
                          ) : (
                            mealGroup.foods.map((food, fIndex) => (
                              <View key={fIndex} style={styles.foodRow}>
                                <Text style={styles.foodName}>• {food.name} <Text style={styles.foodAmount}>- {food.amount}{food.unit || 'g'}</Text></Text>
                                <Text style={styles.foodMacros}>({food.protein}P / {food.carbs}C / {food.fat}G)</Text>
                              </View>
                            ))
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          );
        })()}
      </ScrollView>
      <CreatePlanModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSubmit={handleCreatePlanSubmit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingTop: 40, paddingHorizontal: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 5, marginTop: 10 },
  subTitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: 20 },
  dashboardHeader: { alignItems: 'center', marginBottom: 15 },
  activePlanBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 5, marginTop: 5 },
  activePlanLabel: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  emptyText: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  createButton: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, elevation: 3, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  heroSection: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  chartHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  weekNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  navArrow: { padding: 5 },
  decorativeBar: { width: 4, height: 18, backgroundColor: COLORS.primary, borderRadius: 2, marginRight: 10 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, textTransform: 'uppercase' },
  fullWidthList: { width: '100%' },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  listTextWrapper: { flex: 1 },
  listLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 2, textTransform: 'uppercase' },
  listValue: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  // Novos Estilos
  mealGroupContainer: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  foodListContainer: { paddingLeft: 34 },
  foodRow: { marginBottom: 4 },
  foodName: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  foodAmount: { fontWeight: 'normal', color: COLORS.textLight },
  foodMacros: { fontSize: 12, color: '#888', marginTop: 2 },
  emptyFoodText: { fontSize: 13, color: '#CCC', fontStyle: 'italic' },
});