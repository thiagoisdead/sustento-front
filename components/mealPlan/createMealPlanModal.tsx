import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Dialog, Portal, TextInput, Switch, Button, IconButton } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";

import { COLORS } from "../../constants/theme";
import { mealPlanSchema, MealPlan } from "../../types/meal";
import { basePost, baseUniqueGet, basePutById } from "../../services/baseCall";
import { getItem } from "../../services/secureStore";

interface MealPlanModalProps {
  onDismiss: () => void;
  planToEdit?: MealPlan | null; 
}

export default function MealPlanModal({ onDismiss, planToEdit }: MealPlanModalProps) {
  const [dialogVisible, setDialogVisible] = useState(true);
  const [conflictVisible, setConflictVisible] = useState(false);
  const [activePlanInfo, setActivePlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Novo estado de loading

  const [useAI, setUseAI] = useState(false);

  const router = useRouter();
  const isEditing = !!planToEdit; 

  const [planForm, setPlanForm] = useState({
    plan_name: '',
    target_calories: '',
    target_water: '',
    target_protein: '',
    target_carbs: '',
    target_fats: '',
    active: false,
  });

  useEffect(() => {
    if (planToEdit) {
      setPlanForm({
        plan_name: planToEdit.plan_name || '',
        target_calories: planToEdit.target_calories ? String(planToEdit.target_calories) : '',
        target_water: planToEdit.target_water ? String(planToEdit.target_water) : '',
        target_protein: planToEdit.target_protein ? String(planToEdit.target_protein) : '',
        target_carbs: planToEdit.target_carbs ? String(planToEdit.target_carbs) : '',
        target_fats: planToEdit.target_fat ? String(planToEdit.target_fat) : '', 
        active: !!planToEdit.active,
      });
    }
  }, [planToEdit]);

  const handleClose = () => {
    if (loading) return; // Impede fechar durante o salvamento
    setDialogVisible(false);
    onDismiss();
  };

  const handleChange = (key: string, value: string | boolean) => {
    setPlanForm(prev => ({ ...prev, [key]: value }));
  };

  const convertToNumberOrUndefined = (value: string): number | undefined => {
    if (!value) return undefined;
    const normalizedValue = value.replace(',', '.');
    const num = parseFloat(normalizedValue);
    return isNaN(num) ? undefined : num;
  };

  const executeSave = async (isOverrideActive: boolean) => {
    setLoading(true);
    try {
      const id = await getItem('id');

      const dataPayload = {
        ...planForm,
        active: isOverrideActive,
        target_calories: convertToNumberOrUndefined(planForm?.target_calories),
        target_water: convertToNumberOrUndefined(planForm?.target_water),
        target_protein: convertToNumberOrUndefined(planForm?.target_protein),
        target_carbs: convertToNumberOrUndefined(planForm?.target_carbs),
        target_fats: convertToNumberOrUndefined(planForm?.target_fats),
        source: planToEdit?.source || 'MANUAL',
        user_id: Number(id),
      };

      const validatedPlan = mealPlanSchema.parse(dataPayload);

      if (isOverrideActive && activePlanInfo) {
        await basePutById(`mealplans`, activePlanInfo.plan_id, { active: false });
      }

      let req;
      if (isEditing && planToEdit?.plan_id) {
        req = await basePutById('mealplans', planToEdit.plan_id, validatedPlan);
      } else {
        req = await basePost('mealplans', validatedPlan);
      }

      setConflictVisible(false);
      setDialogVisible(false);

      if (req?.data?.plan_id) {
        router.push({ pathname: '/foodTracker/seeFoodTracker', params: { planId: req.data.plan_id } });
      }

      onDismiss();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar o plano.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidationAndCheck = async () => {
    if (!planForm?.plan_name) return Alert.alert("Erro", "Insira um nome para o plano.");

    setLoading(true);
    try {
        if (planForm?.active) {
          if (isEditing && planToEdit?.active) {
            await executeSave(true);
            return;
          }

          const reqActiveValidate = await baseUniqueGet('users/mealplans');
          const currentActive = reqActiveValidate?.data?.find((plan: any) => plan.active === true);

          if (currentActive && currentActive.plan_id !== planToEdit?.plan_id) {
            setActivePlanInfo(currentActive);
            setLoading(false); // Pausa o loading para mostrar o diálogo de conflito
            setDialogVisible(false);
            setTimeout(() => setConflictVisible(true), 150);
            return;
          }
        }
        await executeSave(planForm?.active);
    } catch (error) {
        setLoading(false);
        Alert.alert("Erro", "Erro ao validar planos ativos.");
    }
  };

  const handleSubmit = async () => {
    if (useAI && !isEditing) {
      setLoading(true);
      try {
        const userId = await getItem('id');
        const payload = { user_id: Number(userId)};
        const req = await basePost('mealPlans/suggestMealPlan', payload);
        
        if (req?.status === 200 || req?.status === 201) {
            setDialogVisible(false);
            onDismiss();
        }
      } catch (error) {
          Alert.alert("Erro", "A IA falhou ao gerar seu plano.");
      } finally {
          setLoading(false);
      }
    } else {
      handleValidationAndCheck();
    }
  };

  const handleBackToForm = () => {
    setConflictVisible(false);
    setTimeout(() => setDialogVisible(true), 150);
  };

  const modalTitle = isEditing ? "Editar Plano" : (useAI ? "Gerar com IA" : "Criar Plano");
  const saveButtonText = isEditing ? "Atualizar" : "Salvar";

  return (
    <Portal>
      <Dialog visible={conflictVisible} onDismiss={handleBackToForm} style={styles.conflictDialog}>
        <View style={styles.headerRow}>
          <Text style={styles.conflictTitle}>Conflito de Plano</Text>
          <IconButton icon="close" size={20} onPress={handleBackToForm} disabled={loading} />
        </View>
        <Dialog.Content>
          <Text style={styles.conflictText}>
            O plano <Text style={{ fontWeight: 'bold' }}>"{activePlanInfo?.plan_name}"</Text> já está ativo.
          </Text>
          <Text style={styles.conflictSubText}>Deseja substituir?</Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.conflictActions}>
          <Button
            mode="outlined"
            onPress={() => executeSave(false)}
            style={styles.conflictBtn}
            labelStyle={{ color: COLORS.textDark }}
            disabled={loading}
          >
            Salvar como Inativo
          </Button>
          <Button
            mode="contained"
            onPress={() => executeSave(true)}
            style={[styles.conflictBtn, { backgroundColor: COLORS.greatGreen }]}
            loading={loading}
            disabled={loading}
          >
            Substituir e Ativar
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={dialogVisible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {modalTitle}
        </Dialog.Title>

        <Dialog.Content style={styles.dialogContent}>
          <KeyboardAwareScrollView enableOnAndroid={true} showsVerticalScrollIndicator={false}>
            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>Processando...</Text>
                </View>
            )}

            <View style={[styles.formContainer, loading && { opacity: 0.4 }]}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Definir como Plano Ativo?</Text>
                  <Switch
                    value={planForm.active}
                    onValueChange={(val) => handleChange('active', val)}
                    color={COLORS.primary}
                    disabled={loading}
                  />
                </View>

                {!isEditing && (
                  <View style={[styles.switchRow, { marginTop: 8, borderColor: useAI ? COLORS.primary : '#EEEEEE' }]}>
                    <Text style={[styles.switchLabel, { color: useAI ? COLORS.primary : COLORS.textDark }]}>
                      Usar Inteligência Artificial?
                    </Text>
                    <Switch value={useAI} onValueChange={setUseAI} color={COLORS.primary} disabled={loading} />
                  </View>
                )}

                {(!useAI || isEditing) && (
                  <View style={{ marginTop: 10 }}>
                    <TextInput
                      label="Nome do Plano"
                      value={planForm?.plan_name}
                      onChangeText={(text) => handleChange('plan_name', text)}
                      mode="outlined"
                      style={styles.input}
                      activeOutlineColor={COLORS.primary}
                      disabled={loading}
                    />
                    <View style={styles.row}>
                      <TextInput
                        label="Kcal (Opcional)"
                        value={planForm?.target_calories}
                        onChangeText={(text) => handleChange('target_calories', text)}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.flexInput}
                        activeOutlineColor={COLORS.primary}
                        disabled={loading}
                      />
                      <TextInput
                        label="Meta Água (ml)"
                        value={planForm?.target_water}
                        onChangeText={(text) => handleChange('target_water', text)}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.flexInput}
                        activeOutlineColor={COLORS.primary}
                        disabled={loading}
                      />
                    </View>
                    <Text style={styles.sectionLabel}>Macros (g) - (Opcionais)</Text>
                    <View style={styles.row}>
                      <TextInput label="Prot" value={planForm?.target_protein} onChangeText={t => handleChange('target_protein', t)} keyboardType="numeric" mode="outlined" style={styles.flexInput} activeOutlineColor={COLORS.primary} disabled={loading} />
                      <TextInput label="Carb" value={planForm?.target_carbs} onChangeText={t => handleChange('target_carbs', t)} keyboardType="numeric" mode="outlined" style={styles.flexInput} activeOutlineColor={COLORS.primary} disabled={loading} />
                      <TextInput label="Gord" value={planForm?.target_fats} onChangeText={t => handleChange('target_fats', t)} keyboardType="numeric" mode="outlined" style={styles.flexInput} activeOutlineColor={COLORS.primary} disabled={loading} />
                    </View>
                  </View>
                )}
            </View>
          </KeyboardAwareScrollView>
        </Dialog.Content>

        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={handleClose} style={styles.btnCancel} disabled={loading}>
            <Text style={{ color: COLORS.textDark }}>Cancelar</Text>
          </Button>

          <Button 
            onPress={handleSubmit} 
            style={styles.btnSave} 
            loading={loading} 
            disabled={loading}
          >
            <Text style={{ color: '#fff' }}>{saveButtonText}</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { backgroundColor: '#fff', borderRadius: 16, maxHeight: '85%' },
  dialogTitle: { textAlign: 'center', fontWeight: 'bold' },
  dialogContent: { paddingHorizontal: 20 },
  formContainer: { flex: 1 },
  input: { backgroundColor: '#FAFAFA', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  flexInput: { flex: 1, backgroundColor: '#FAFAFA' },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', marginVertical: 8, color: COLORS.textDark },
  dialogActions: { padding: 15, justifyContent: 'space-between', gap: 10 },
  btnCancel: { flex: 1, backgroundColor: '#E0E0E0', borderRadius: 10 },
  btnSave: { flex: 1, backgroundColor: COLORS.greatGreen, borderRadius: 10 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 10, backgroundColor: '#FAFAFA', borderRadius: 8, borderWidth: 1, borderColor: '#EEE'
  },
  switchLabel: { fontSize: 14, fontWeight: '600' },
  conflictDialog: { backgroundColor: '#fff', borderRadius: 16, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 5, paddingTop: 5 },
  conflictTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.accentOrange, paddingLeft: 20 },
  conflictText: { fontSize: 15, color: COLORS.textDark, lineHeight: 22 },
  conflictSubText: { fontSize: 13, color: '#666', marginTop: 10 },
  conflictActions: { flexDirection: 'column', gap: 10, paddingHorizontal: 20 },
  conflictBtn: { width: '100%', borderRadius: 10, marginVertical: 2, },
  loaderOverlay: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderText: {
      marginTop: 10,
      color: COLORS.primary,
      fontWeight: 'bold'
  }
});