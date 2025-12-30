import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator } from "react-native" // Adicionado ActivityIndicator
import { Text, Dialog, Portal, Button } from "react-native-paper"
import { useRouter } from "expo-router"

// Services & Components
import { baseUniqueGet, baseDelete } from "../../services/baseCall"
import { COLORS } from "../../constants/theme"
import { MealPlanCard } from "../../components/mealPlan/mealPlan"
import { MealPlan } from "../../types/meal"
import { BaseButton } from "../../components/baseButton"
import CreateMealPlanModal from "../../components/mealPlan/createMealPlanModal"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export default function SeeAllMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [isLoading, setIsLoading] = useState(true); // Começa true para evitar o susto

  // States para Criar Plano
  const [createDialogVisible, setCreateDialogVisible] = useState(false);

  // States para Deletar Plano
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  const router = useRouter()

  const fetchMealPlans = async () => {
    try {
      setIsLoading(true); // Garante que carrega ao atualizar
      const req = await baseUniqueGet('users/mealplans');
      setMealPlans(req?.data || []);
    } catch (error) {
      console.error("Erro ao buscar planos", error);
    } finally {
      setIsLoading(false); // Para o loading independente de erro ou sucesso
    }
  }

  useEffect(() => {
    fetchMealPlans()
  }, [])

  // 1. Abre o modal e salva o ID
  const handleAskDelete = (id: number) => {
    setPlanToDelete(id);
    setDeleteDialogVisible(true);
  }

  // 2. Executa a exclusão
  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      const res = await baseDelete(`mealplans/${planToDelete}`);
      setMealPlans(prev => prev.filter(plan => plan.plan_id !== planToDelete));

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível excluir o plano.");
    } finally {
      setDeleteDialogVisible(false);
      setPlanToDelete(null);
    }
  }

  const handlePushToMealPlan = async (planId: number) => {
    router.push({ pathname: '/foodTracker/seeFoodTracker', params: { planId } })
  }

  return (
    <View style={styles.mainView}>
      <View style={styles.mainTitle}>
        <Text style={styles.mainText}>
          Todos os planos alimentares
        </Text>
      </View>

      {/* LÓGICA DE RENDERIZAÇÃO: Carregando -> Lista -> Vazio */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textLight }}>Buscando planos...</Text>
        </View>
      ) : mealPlans.length > 0 ? (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.cardsContainer} contentContainerStyle={styles.contentContainer}>
            {mealPlans?.map((plan: MealPlan) => (
              <MealPlanCard
                key={plan?.plan_id}
                mealData={plan}
                onPress={() => handlePushToMealPlan(plan.plan_id!)}
                onDelete={() => handleAskDelete(plan.plan_id!)}
              />
            ))}
            <View style={{ height: 80 }} />
          </ScrollView>
        </View>
      ) : (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.8 }}>
          <MaterialCommunityIcons name="food-variant" size={80} color={COLORS.primary} style={{ opacity: 0.5, marginBottom: 20 }} />
          <Text style={styles.headerTitle}>Bem-vindo!</Text>
          <Text style={styles.emptyText}>
            Você ainda não possui nenhum plano alimentar. Crie um agora para começar a acompanhar sua dieta.
          </Text>
        </View>
      )}

      <View style={styles.createMealPlan}>
        <BaseButton onPress={() => setCreateDialogVisible(true)} text="Criar novo plano alimentar" />
      </View>

      {
        createDialogVisible && (
          <CreateMealPlanModal
            onDismiss={() => {
              setCreateDialogVisible(false);
              fetchMealPlans();
            }}
          />
        )
      }

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Excluir Plano</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Tem certeza que deseja excluir este plano alimentar? Essa ação é irreversível.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setDeleteDialogVisible(false)}
              style={styles.btnCancel}
              labelStyle={{ color: COLORS.textDark }}
            >
              Cancelar
            </Button>
            <Button
              onPress={confirmDelete}
              style={styles.btnConfirm}
              labelStyle={{ color: '#FFF' }}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View >
  )
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainTitle: {
    marginVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 5, marginTop: 10 },
  
  // Novo estilo para o container de loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardsContainer: {
    paddingHorizontal: 16,
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  createMealPlan: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dialog: {
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  dialogText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
    gap: 10
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  btnConfirm: {
    flex: 1,
    backgroundColor: '#FF5252', // Vermelho para ação destrutiva
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    letterSpacing: 0.5
  },
})