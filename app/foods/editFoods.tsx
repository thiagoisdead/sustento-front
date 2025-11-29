import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable
} from "react-native";
import {
  Button,
  Card,
  Dialog,
  Portal,
  Searchbar
} from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Foods } from "../../types/data";
import { COLORS } from "../../constants/theme";
import { RecentItem } from "../../components/recentItem";
import { CategoryItem } from "../../components/categoryItem";

// Imports

// Static Data (Could also move to a services/data file)
const recentes: Foods[] = [
  { title: 'Frango Grelhado', serving: 'g', protein: 40, carbs: 5, fats: 9, kcal: 250, category: 'Proteínas' },
  { title: 'Arroz Integral', serving: 'g', protein: 4, carbs: 35, fats: 2, kcal: 180, category: 'Grãos' },
  { title: 'Brócolis Cozido', serving: 'g', protein: 3, carbs: 7, fats: 0.5, kcal: 35, category: 'Vegetais' },
];

const categorias = [
  { id: 1, name: 'Frutas', icon: 'apple' },
  { id: 2, name: 'Vegetais', icon: 'carrot' },
  { id: 3, name: 'Proteínas', icon: 'food-drumstick' },
  { id: 4, name: 'Grãos', icon: 'barley' },
  { id: 5, name: 'Laticínios', icon: 'cow' },
];

const products: Foods[] = [
  { title: 'Banana', protein: 1.1, carbs: 23, fats: 0.3, kcal: 89, serving: "g", category: "Frutas" },
  { title: 'Maçã', protein: 0.3, carbs: 14, fats: 0.2, kcal: 52, serving: "g", category: "Frutas" },
  { title: 'Pera', protein: 0.4, carbs: 15, fats: 0.1, kcal: 57, serving: "g", category: "Frutas" },
  { title: 'Iogurte Grego', protein: 10, carbs: 3.6, fats: 5, kcal: 97, serving: "g", category: "Laticínios" },
  { title: 'Leite Integral', protein: 3.3, carbs: 4.8, fats: 3.5, kcal: 61, serving: "ml", category: "Laticínios" },
  { title: 'Peito de Frango', protein: 31, carbs: 0, fats: 3.6, kcal: 165, serving: "g", category: "Proteínas" },
  { title: 'Ovo Cozido', protein: 13, carbs: 1.1, fats: 11, kcal: 155, serving: "g", category: "Proteínas" },
  { title: 'Cenoura', protein: 0.9, carbs: 10, fats: 0.2, kcal: 41, serving: "g", category: "Vegetais" },
];

export default function MealsHome() {
  const [searchParams, setSearchParams] = useState<string>('');
  const [searchData, setSearchData] = useState<Foods[]>([])
  const [selectedMeal, setSelectedMeal] = useState<Foods | null>(null)

  const handleSearch = (text: string) => {
    setSearchParams(text)
    if (!text.length) return setSearchData([])
    setSearchData(products.filter(p => p.title.toLowerCase().includes(text.toLowerCase())));
  }

  const handleSelectMeal = (foodData: Foods) => {
    setSelectedMeal(foodData)
  }

  const handleCategoryPress = (categoryName: string) => {
    const results = products.filter(p => p.category === categoryName);
    setSearchData(results);
    setSearchParams(categoryName);
  };

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
          <Text style={styles.sectionTitle}>Recentes</Text>
          {recentes.map((item, index) => (
            <RecentItem
              key={`${item.title}-${index}`}
              item={item}
              onPress={() => handleSelectMeal(item)}
            />
          ))}

          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoryGrid}>
            {categorias.map(cat => (
              <CategoryItem
                key={cat.id}
                icon={cat.icon}
                name={cat.name}
                onPress={() => handleCategoryPress(cat.name)}
              />
            ))}
          </View>

          <Pressable style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Registrar Refeição</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          <FlatList
            style={styles.searchResults}
            data={searchData}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            contentContainerStyle={{ alignItems: 'center', gap: 10, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Card style={styles.itemCard} onPress={() => handleSelectMeal(item)} mode="elevated">
                <Card.Title
                  title={item.title}
                  subtitle={`${item.kcal} kcal`}
                  titleStyle={{ color: COLORS.textDark, fontWeight: 'bold' }}
                  subtitleStyle={{ color: COLORS.textLight }}
                  right={(props) => <MaterialCommunityIcons {...props} name="chevron-right" color={COLORS.primary} />}
                />
              </Card>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>
                  Nenhum alimento encontrado para "{searchParams}".
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Detail Dialog */}
      <Portal>
        <Dialog visible={!!selectedMeal} onDismiss={() => setSelectedMeal(null)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{selectedMeal?.title}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.dialogMacroRow}>
              <View style={styles.dialogMacroItem}>
                <Text style={styles.dialogMacroLabel}>Calorias</Text>
                <Text style={styles.dialogMacroValue}>{selectedMeal?.kcal}</Text>
              </View>
              <View style={styles.dialogMacroItem}>
                <Text style={styles.dialogMacroLabel}>Proteínas</Text>
                <Text style={styles.dialogMacroValue}>{selectedMeal?.protein}g</Text>
              </View>
              <View style={styles.dialogMacroItem}>
                <Text style={styles.dialogMacroLabel}>Carbos</Text>
                <Text style={styles.dialogMacroValue}>{selectedMeal?.carbs}g</Text>
              </View>
              <View style={styles.dialogMacroItem}>
                <Text style={styles.dialogMacroLabel}>Gorduras</Text>
                <Text style={styles.dialogMacroValue}>{selectedMeal?.fats}g</Text>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedMeal(null)} textColor={COLORS.textLight}>Cancelar</Button>
            <Button onPress={() => { console.log("Added"); setSelectedMeal(null); }} textColor={COLORS.primary}>Adicionar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  )
}

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
    fontSize: 24,
    fontWeight: 'bold',
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
    borderColor: COLORS.borderColor,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    width: '100%',
  },
  itemCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    width: '90%',
    marginBottom: 5
  },
  emptyList: {
    paddingTop: 50,
    alignItems: 'center'
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.textLight
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center'
  },
  dialogMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10
  },
  dialogMacroItem: {
    alignItems: 'center'
  },
  dialogMacroLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase'
  },
  dialogMacroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark
  }
});