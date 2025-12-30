import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert
} from "react-native";
import {
  Button,
  Dialog,
  Portal,
  Searchbar,
  TextInput
} from "react-native-paper";

import { Foods } from "../../types/data";
import { COLORS } from "../../constants/theme";
import { RecentItem } from "../../components/recentItem";
import { baseFetch, basePost, baseUniqueGet } from "../../services/baseCall";

import { getItem, setItem } from "../../services/secureStore";

interface MealOption {
  meal_id: number;
  meal_name: string;
  meal_type: string;
  plan_id: number;
  time: string;
}

const RECENT_FOODS_KEY = "recent_foods";


export default function MealsHome() {
  const [searchParams, setSearchParams] = useState<string>('');
  const [searchData, setSearchData] = useState<Foods[]>([])
  const [selectedMeal, setSelectedMeal] = useState<Foods | null>(null)
  const [planId, setPlanId] = useState<number | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<'g' | 'ml' | 'un'>('g');
  const [mealOptions, setMealOptions] = useState<MealOption[]>([]);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);

  const [recentes, setRecentes] = useState<Foods[]>([]);

  useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = async () => {
    try {
      const jsonValue = await getItem(RECENT_FOODS_KEY);
      if (jsonValue) {
        setRecentes(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Erro ao carregar recentes", e);
    }
  };

  const addToRecents = async (food: Foods) => {
    try {
      let newRecents = [...recentes];

      newRecents = newRecents.filter(item => item.name !== food.name);

      newRecents.unshift(food);

      if (newRecents.length > 10) {
        newRecents = newRecents.slice(0, 10);
      }

      setRecentes(newRecents);
      await setItem(RECENT_FOODS_KEY, JSON.stringify(newRecents));
    } catch (e) {
      console.error("Erro ao salvar recente", e);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchParams(text);

    if (!text.length) {
      setSearchData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const productsFetched = await baseFetch(`/aliments/search/combined?query=${text}`);
      setSearchData(
        productsFetched?.data?.products?.filter((p: Foods) =>
          p.name.toLowerCase().includes(text.toLowerCase())
        ) || []
      );
    } catch (err) {
      console.log("Erro na busca:", err);
      setSearchData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = async () => {
    const quantityFood = Number(selectedMeal?.quantity?.toString().replace(/\D/g, ''));

    if (!selectedMeal) return Alert.alert('Erro', 'Selecione um alimento.');
    if (!quantityFood || quantityFood <= 0) return Alert.alert('Erro', 'Insira uma quantidade válida.');
    if (!planId) return Alert.alert('Erro', 'Plano alimentar não encontrado.');
    if (!selectedMealId) return Alert.alert('Erro', 'Selecione uma refeição.');

    setDialogVisible(false);
    setSelectedMeal(null);

    const innerPayload = {
      quantity: quantityFood,
      measurement_unit: selectedUnit?.toString().toUpperCase(),
      meal_id: Number(selectedMealId),
      aliment_id: Number(selectedMeal?.id)
    }

    const { nova_group, quantity, ...rest } = selectedMeal;

    const superPayload = {
      alimentData: { nova_group: 1, ...rest },
      ...innerPayload
    }

    try {
      const req = await basePost('mealAliments', superPayload)
      await addToRecents({ ...selectedMeal, quantity: null });
    } catch (error) {
      Alert.alert("Erro", "Falha ao registrar refeição");
    }
  }

  const fetchMealPlans = async () => {
    const req = await baseUniqueGet('users/mealplans')
    const planActive = req?.data.find((plan: any) => plan?.active);
    setPlanId(planActive?.plan_id || null)
    return planActive?.plan_id;
  }

  const handleSelectMeal = async (foodData: Foods) => {
    setSelectedUnit('g');
    setSelectedMeal(foodData);
    setDialogVisible(true)

    const planIdNow = await fetchMealPlans()

    if (planIdNow) {
      const req = await baseFetch(`/mealPlans/${planIdNow}/meals`);
      const mealsData = req?.data || [];
      setMealOptions(mealsData);

      if (mealsData.length > 0 && !selectedMealId) {
        setSelectedMealId(mealsData[0].meal_id);
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alimentação</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Buscar alimentos..."
          onChangeText={handleSearch}
          value={searchParams}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.textLight}
          inputStyle={{ color: COLORS.textDark }}
          onClearIconPress={() => handleSearch('')}
          elevation={0}
        />
      </View>

      {searchParams.length === 0 ? (
        <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent}>
          <Text style={styles.sectionTitle}>Recentes - {recentes?.length}</Text>

          {recentes.length > 0 ? (
            recentes.map((item, index) => (
              <RecentItem
                key={`${item?.name}-${index}`}
                item={item}
                onPress={() => handleSelectMeal(item)}
              />
            ))
          ) : (
            <Text style={{ color: '#999', fontStyle: 'italic', marginBottom: 20 }}>
              Seus alimentos recentes aparecerão aqui.
            </Text>
          )}
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <FlatList
            style={styles.searchResults}
            data={searchData}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <RecentItem
                key={`${item.name}`}
                item={item}
                onPress={() => handleSelectMeal(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>
                  {isLoading ? "Carregando..." : `Nenhum alimento encontrado.`}
                </Text>
              </View>
            }
          />
        </View>
      )}

      <Portal>
        <Dialog visible={!!dialogVisible} onDismiss={() => { setSelectedMeal(null); setDialogVisible(false); setSelectedMealId(null); }} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{selectedMeal?.name}</Dialog.Title>

          <Dialog.Content style={styles.dialogContent}>

            <TextInput
              label={`Quantidade (${selectedUnit})`}
              value={selectedMeal?.quantity?.toString() || ''}
              onChangeText={(text) => selectedMeal && setSelectedMeal({ ...selectedMeal, quantity: Number(text) })}
              keyboardType="numeric"  
              mode="outlined"
              style={styles.inputQuantity}
              activeOutlineColor={COLORS.primary}
              outlineColor="#E0E0E0"
              dense
            />

            {/* Radio Unit Selector */}
            <View style={styles.unitContainer}>
              {(['un', 'g', 'ml'] as const).map((unit) => (
                <Pressable
                  key={unit}
                  style={[
                    styles.unitBox,
                    selectedUnit === unit && styles.unitBoxSelected
                  ]}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <Text style={[
                    styles.unitText,
                    selectedUnit === unit && styles.unitTextSelected
                  ]}>
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.mealSelectContainer}>
              <Text style={styles.labelSection}>Adicionar em:</Text>
              {mealOptions.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealOptionsScroll}>
                  {mealOptions.map((option) => (
                    <Pressable
                      key={option.meal_id}
                      style={[
                        styles.mealChip,
                        selectedMealId === option.meal_id && styles.mealChipSelected
                      ]}
                      onPress={() => setSelectedMealId(option.meal_id)}
                    >
                      <Text style={[
                        styles.mealChipText,
                        selectedMealId === option.meal_id && styles.mealChipTextSelected
                      ]}>
                        {option.meal_name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ color: '#999', fontStyle: 'italic' }}>Nenhuma refeição encontrada no plano.</Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Macros */}
            <Text style={styles.macroHeader}>Informação Nutricional (por 100g)</Text>
            <View style={styles.dialogMacroRow}>
              <MacroStat label="Kcal" value={selectedMeal?.nutrients?.calories_100g || '~0'} />
              <MacroStat label="Prot" value={`${selectedMeal?.nutrients?.protein_100g || '~0'}g`} />
              <MacroStat label="Carb" value={`${selectedMeal?.nutrients?.carbs_100g || '~0'}g`} />
              <MacroStat label="Gord" value={`${selectedMeal?.nutrients?.fat_100g || '~0'}g`} />
            </View>

          </Dialog.Content>

          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="contained"
              buttonColor={COLORS.primary}
              onPress={() => { setSelectedMeal(null); setDialogVisible(false); setSelectedMealId(null); }}
              style={{ paddingHorizontal: 10, borderRadius: 8, marginTop: 10 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              buttonColor={COLORS.primary}
              onPress={() => handleAddFood()}
              style={{ paddingHorizontal: 10, borderRadius: 8, marginTop: 10 }}
            >
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  )
}

const MacroStat = ({ label, value }: { label: string, value: any }) => (
  <View style={styles.dialogMacroItem}>
    <Text style={styles.dialogMacroValue}>{value || '-'}</Text>
    <Text style={styles.dialogMacroLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50
  },
  header: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 20,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    marginTop: 10,
  },
  searchResults: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyList: {
    paddingTop: 50,
    alignItems: 'center'
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.textLight
  },
  // --- Dialog Styles ---
  dialog: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingBottom: 10,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 5,
  },
  dialogContent: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  inputQuantity: {
    backgroundColor: '#FAFAFA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  unitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  unitBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unitBoxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  unitTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  mealSelectContainer: {
    marginBottom: 15,
  },
  labelSection: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  mealOptionsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  mealChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mealChipSelected: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  mealChipText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  mealChipTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  macroHeader: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dialogMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
  },
  dialogMacroItem: {
    alignItems: 'center',
    flex: 1,
  },
  dialogMacroLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  dialogMacroValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark
  },
  dialogActions: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'space-between',
  }
});