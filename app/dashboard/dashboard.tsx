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
  TouchableOpacity,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Tipos, Serviços e Constantes
import { DashboardData } from '../../types/dashboard';
import { MealPlan } from '../../types/meals';
import { getDashboardData } from '../../services/dashboardService';
import {
  getUserMealPlans,
  switchActivePlan,
  createNewMealPlan,
  deactivateMealPlan,
  deleteMealPlan
} from '../../services/mealPlanService';
import { COLORS } from '../../constants/theme';

// Componentes
import { StatCard } from '../../components/statCard';
import { ActivityChart } from '../../components/activityChart';
import { IconPill } from '../../components/iconPill';
import { AnimatedButton } from '../../components/animatedButton';
import { MealPlanItem } from '../../components/dashboard/mealPlanItem';
import { CreatePlanModal } from '../../components/dashboard/createPlanModal';
import { usePath } from '../../hooks/usePath';

type ViewState = 'LOADING' | 'EMPTY' | 'SELECTION' | 'DASHBOARD';

export default function Dashboard() {
  const [viewState, setViewState] = useState<ViewState>('LOADING');
  const handlePath = usePath();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<MealPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [activePlanName, setActivePlanName] = useState<string>("");

  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  // --- Loader Principal ---
  const loadInitialData = useCallback(async () => {
    try {
      if (!refreshing) setViewState('LOADING');

      const plans = await getUserMealPlans();
      setAvailablePlans(plans);

      if (plans.length === 0) {
        setViewState('EMPTY');
        return;
      }

      const active = plans.find(p => p.active);

      if (active) {
        setActivePlanId(active.plan_id);
        setActivePlanName(active.plan_name);

        const dashData = await getDashboardData();
        if (dashData) {
          setDashboardData(dashData);
          setViewState('DASHBOARD');
        } else {
          setViewState('SELECTION');
        }
      } else {
        setActivePlanId(null);
        setViewState('SELECTION');
      }

    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados.");
    } finally {
      setLoading(false);
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
  const handleSelectPlan = async (plan: MealPlan) => {
    if (plan.active) {
      const dashData = await getDashboardData();
      setDashboardData(dashData);
      setViewState('DASHBOARD');
      return;
    }
    try {
      setViewState('LOADING');
      await switchActivePlan(plan.plan_id, activePlanId || undefined);
      await loadInitialData();
    } catch {
      setViewState('SELECTION');
    }
  };

  const handleDeletePlan = async (plan: MealPlan) => {
    Alert.alert(
      "Excluir Plano",
      `Tem certeza que deseja excluir o plano "${plan.plan_name}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: 'destructive',
          onPress: async () => {
            try {
              setViewState('LOADING');

              // 1. Chama o serviço para deletar
              await deleteMealPlan(plan.plan_id);

              // 2. Se o plano deletado era o ativo, limpamos o estado do Dashboard
              if (plan.active) {
                setActivePlanId(null);
                setActivePlanName("");
                setDashboardData(null);
              }

              // 3. Recarrega a lista
              await loadInitialData();
            } catch (error) {
              console.error(error);
              Alert.alert("Erro", "Falha ao excluir plano.");
              setViewState('SELECTION'); // Garante que volta para a lista
            }
          }
        }
      ]
    );
  };

  const handleDeactivateCurrentPlan = async () => {
    if (!activePlanId) return;
    Alert.alert("Parar Plano", "Deseja parar de seguir este plano?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Parar", style: 'destructive', onPress: async () => {
          setViewState('LOADING');
          await deactivateMealPlan(activePlanId);
          await loadInitialData();
        }
      }
    ]);
  };

  const handleCreatePlanSubmit = async (name: string, source: 'AUTOMATIC' | 'MANUAL') => {
    try {
      setViewState('LOADING');
      if (activePlanId) await deactivateMealPlan(activePlanId);
      await createNewMealPlan(name, source);
      await loadInitialData();
    } catch {
      Alert.alert("Erro", "Falha ao criar.");
      setViewState('EMPTY');
    }
  };

  const handleChangePlanClick = () => {
    setViewState('SELECTION');
  };

  const [loading, setLoading] = useState(false);

  // --- RENDERIZADORES ---

  if (viewState === 'LOADING') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (viewState === 'EMPTY') {
    // ... (Código do estado Empty igual ao anterior)
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <MaterialCommunityIcons name="food-variant" size={80} color={COLORS.primary} style={{ opacity: 0.5, marginBottom: 20 }} />
          <Text style={styles.headerTitle}>Bem-vindo!</Text>
          <Text style={styles.emptyText}>
            Você ainda não possui nenhum plano alimentar. Crie um agora para começar.
          </Text>
          <AnimatedButton
            style={[styles.createButton, { marginTop: 30, borderWidth: 1, borderColor: COLORS.primary }]}
            onPress={() => handlePath('/foodTracker/seeFoodTracker')}
          >
            <Text style={[styles.btnText,]}>Criar Novo Plano</Text>
          </AnimatedButton>
        </ScrollView>
        <CreatePlanModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSubmit={handleCreatePlanSubmit} />
      </SafeAreaView>
    );
  }

  // 2. SELECTION STATE
  if (viewState === 'SELECTION') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <Text style={styles.headerTitle}>MEUS PLANOS</Text>
          <Text style={styles.subTitle}>Selecione um plano para ativar:</Text>

          <View style={{ gap: 10 }}>
            {availablePlans.map((plan) => (
              <MealPlanItem
                key={plan.plan_id}
                plan={plan}
                onPress={() => handleSelectPlan(plan)}
                // --- ADICIONE ESTA LINHA ---
                onDelete={() => handleDeletePlan(plan)}
              />
            ))}
          </View>

          <AnimatedButton
            style={[styles.createButton, { marginTop: 30, borderWidth: 1, borderColor: COLORS.primary }]}
            onPress={() => handlePath("/foodTracker/seeFoodTracker")}
          >
            <Text style={[styles.btnText]}>Criar Novo Plano</Text>
          </AnimatedButton>
        </ScrollView>
        <CreatePlanModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSubmit={handleCreatePlanSubmit} />
      </SafeAreaView>
    );
  }

  // 3. DASHBOARD STATE (ATIVO)
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
        {/* Header */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.headerTitle}>DASHBOARD</Text>

          <View style={styles.activePlanBadge}>
            <Text style={styles.activePlanLabel}>{activePlanName}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleChangePlanClick} style={styles.actionButton}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Trocar</Text>
            </TouchableOpacity>

            <View style={styles.dividerVertical} />

            <TouchableOpacity onPress={handleDeactivateCurrentPlan} style={styles.actionButton}>
              <MaterialCommunityIcons name="stop-circle-outline" size={20} color="#E57373" />
              <Text style={[styles.actionText, { color: '#E57373' }]}>Desativar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {dashboardData && (
          <>
            {/* --- 1. HERO: CALORIAS (LARGURA TOTAL) --- */}
            <View style={styles.heroSection}>
              <StatCard
                label="CALORIAS DIÁRIAS"
                value={dashboardData.stats.calories.current}
                subValue={dashboardData.stats.calories.target}
                unit="kcal"
                percentage={dashboardData.stats.calories.target > 0 ? dashboardData.stats.calories.current / dashboardData.stats.calories.target : 0}
                color={COLORS.accentOrange}
                icon={<FontAwesome5 name="fire" size={18} color={COLORS.accentOrange} />}
                style={{ width: '100%' }} // ESTILO OVERRIDE PARA SER "HERO"
              />
            </View>

            {/* --- 2. LINHA MACROS (3 COLUNAS) --- */}
            <View style={styles.statsRow}>
              {/* Proteína */}
              <StatCard
                label="PROTEÍNAS"
                value={dashboardData.stats.macros.protein.current}
                subValue={dashboardData.stats.macros.protein.target}
                unit="g"
                percentage={dashboardData.stats.macros.protein.target > 0 ? dashboardData.stats.macros.protein.current / dashboardData.stats.macros.protein.target : 0}
                color={COLORS.primary}
                icon={<MaterialCommunityIcons name="food-drumstick" size={14} color={COLORS.primary} />}
              />

              {/* Carbos */}
              <StatCard
                label="CARBOS"
                value={dashboardData.stats.macros.carbs.current}
                subValue={dashboardData.stats.macros.carbs.target}
                unit="g"
                percentage={dashboardData.stats.macros.carbs.target > 0 ? dashboardData.stats.macros.carbs.current / dashboardData.stats.macros.carbs.target : 0}
                color={COLORS.accentBlue}
                icon={<MaterialCommunityIcons name="barley" size={14} color={COLORS.accentBlue} />}
              />

              {/* Gorduras */}
              <StatCard
                label="GORDURAS"
                value={dashboardData.stats.macros.fats.current}
                subValue={dashboardData.stats.macros.fats.target}
                unit="g"
                percentage={dashboardData.stats.macros.fats.target > 0 ? dashboardData.stats.macros.fats.current / dashboardData.stats.macros.fats.target : 0}
                color="#E6B800" // Amarelo/Dourado para gordura
                icon={<MaterialCommunityIcons name="oil" size={14} color="#E6B800" />}
              />
            </View>

            {/* Gráfico */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.decorativeBar} />
                <Text style={styles.cardTitle}>ATIVIDADE SEMANAL</Text>
              </View>
              <ActivityChart data={dashboardData.weeklyActivity} />
            </View>

            {/* Resumo do Dia */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.decorativeBar} />
                <Text style={styles.cardTitle}>RESUMO DO DIA</Text>
              </View>

              <View style={styles.fullWidthList}>
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
            </View>
          </>
        )}
      </ScrollView>

      <CreatePlanModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreatePlanSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingVertical: 40, paddingHorizontal: 16 },

  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 5, marginTop: 10 },
  subTitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: 20 },

  dashboardHeader: { alignItems: 'center', marginBottom: 15 },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, elevation: 1 },
  actionButton: { padding: 8, flexDirection: 'row', alignItems: 'center' },
  actionText: { fontWeight: 'bold', marginLeft: 6, fontSize: 12, color: COLORS.primary },
  dividerVertical: { width: 1, height: 20, backgroundColor: '#EEE', marginHorizontal: 5 },

  activePlanBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 5 },
  activePlanLabel: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },

  emptyText: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  createButton: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, elevation: 3, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // Layout Novo
  heroSection: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 }, // gap ajuda no espaçamento

  card: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  decorativeBar: { width: 4, height: 18, backgroundColor: COLORS.primary, borderRadius: 2, marginRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },

  fullWidthList: { width: '100%' },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  listTextWrapper: { flex: 1 },
  listLabel: { fontSize: 10, color: COLORS.textLight, marginBottom: 2, textTransform: 'uppercase' },
  listValue: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
});