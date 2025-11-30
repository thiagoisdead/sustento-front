import axios from "axios";
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { baseSearch } from "../../services/baseCall";

// --- MODIFICADO: Tipo Foods agora inclui Categoria ---
type Foods = {
  title: string;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
  serving: "portion" | "g" | "ml";
  category: string; // NOVO
};
const recentes: Foods[] = [
  {
    title: 'Frango Grelhado',
    serving: 'g',
    protein: 40,
    carbs: 5,
    fats: 9,
    kcal: 250,
    category: 'Proteínas'
  },
  {
    title: 'Arroz Integral',
    serving: 'g',
    protein: 4,
    carbs: 35,
    fats: 2,
    kcal: 180,
    category: 'Grãos'
  },
  {
    title: 'Arroz Integral',
    serving: 'g',
    protein: 4,
    carbs: 35,
    fats: 2,
    kcal: 180,
    category: 'Grãos'
  },
];

const categorias = [
  { id: 1, name: 'Frutas', icon: 'apple' },
  { id: 2, name: 'Vegetais', icon: 'carrot' },
  { id: 3, name: 'Proteínas', icon: 'food-drumstick' },
  { id: 4, name: 'Grãos', icon: 'barley' },
  { id: 5, name: 'Laticínios', icon: 'cow' },
];

const servingRecord: Record<"portion" | "g" | "ml", string> = {
  portion: "Por porção",
  g: "Por 100 gramas",
  ml: "Por 100 ML"
}

const CategoryItem = ({ icon, name, onPress }: { icon: string, name: string, onPress: () => void }) => (
  <Pressable style={styles.categoryItem} onPress={onPress}>
    <View style={styles.categoryIconBox}>
      <MaterialCommunityIcons name={icon} size={30} color="#A8D5BA" />
    </View>
    <Text style={styles.categoryText}>{name}</Text>
  </Pressable>
);

const RecentItem = ({ item, onPress }: { item: Foods, onPress: () => void }) => (
  <Pressable style={styles.recentItemCard} onPress={onPress}>
    {/* <View style={styles.recentItemIconBox} /> */}
    <View style={styles.recentItemDetails}>
      <Text style={styles.recentItemTitle}>{item.title}</Text>
      {/* MODIFICADO: A lógica de 'serving' agora vem do 'servingRecord' */}
      <Text style={styles.recentItemServing}>{servingRecord[item.serving]}</Text>
      <View style={styles.recentItemMacros}>
        <View style={styles.macroItem}>
          <MaterialCommunityIcons name="leaf" size={14} color="#A8D5BA" />
          {/* MODIFICADO: Usando os campos corretos do tipo Foods */}
          <Text style={styles.macroText}>{item.protein}g Prot</Text>
        </View>
        <View style={styles.macroItem}>
          <MaterialCommunityIcons name="barley" size={14} color="#A8D5BA" />
          <Text style={styles.macroText}>{item.carbs}g Carb</Text>
        </View>
        <View style={styles.macroItem}>
          <MaterialCommunityIcons name="water-outline" size={14} color="#A8D5BA" />
          <Text style={styles.macroText}>{item.fats}g Gord</Text>
        </View>
      </View>
    </View>
    <Text style={styles.recentItemKcal}>
      {item.kcal} <Text style={styles.kcalLabel}>kcal</Text>
    </Text>
  </Pressable>
);

export default function MealsHome() {

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

  const [searchParams, setSearchParams] = useState<string>('');
  const [searchData, setSearchData] = useState<Foods[]>([])
  const [selectedMeal, setSelectedMeal] = useState<Foods | null>(null)

  const handleSearch = async (text: string) => {
    setSearchParams(text)
    const haha = await baseSearch(text)
    console.log(haha)

    // Se a busca estiver vazia, limpa os resultados e volta para a home
    if (!text.length) return setSearchData([])

    // Sua lógica original: busca apenas pelo título
    setSearchData(products.filter(p => p.title.toLowerCase().includes(text.toLowerCase())));
  }

  const handleSelectMeal = (foodData: Foods) => {
    setSelectedMeal(foodData)
    console.log(foodData)
  }

  // --- NOVA FUNÇÃO ---
  // Filtra os produtos pela categoria e exibe os resultados (reutilizando a tela de busca)
  const handleCategoryPress = (categoryName: string) => {
    // Filtra a lista principal de produtos
    const results = products.filter(p => p.category === categoryName);

    // Coloca os resultados no estado 'searchData'
    setSearchData(results);

    // Define o 'searchParams' com o nome da categoria
    // Isso faz a UI (searchParams.length === 0) esconder a tela "Home"
    // e mostrar a FlatList com os resultados da categoria.
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
          onChangeText={(text) => handleSearch(text)}
          value={searchParams}
          style={styles.searchBar}
          iconColor="#A8D5BA"
          placeholderTextColor="#888"
          inputStyle={{ color: '#3D3D3D' }}
          // NOVO: Permite ao usuário limpar a busca (e voltar para a home)
          onClearIconPress={() => handleSearch('')}
        />
      </View>

      {/* MODIFICADO: Lógica de renderização agora usa 'searchParams.length' */}
      {searchParams.length === 0 ? (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainContent}
        >
          <Text style={styles.sectionTitle}>Recentes</Text>
          {/* MODIFICADO: 'recentes' agora é funcional */}
          {recentes.map((item, index) => (
            <RecentItem
              key={`${item.title}-${index}`} // Chave mais segura
              item={item}
              onPress={() => handleSelectMeal(item)} // <-- AQUI
            />
          ))}

          {/* <Text style={styles.sectionTitle}>Categorias</Text> */}
        </ScrollView>
      ) : (
        // Esta é a sua tela de resultados (agora usada para Busca e Categoria)
        <View style={styles.resultsContainer}>
          <FlatList
            style={styles.searchResults}
            data={searchData}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            contentContainerStyle={{ alignItems: 'center', gap: 10, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Pressable style={styles.recentItemCard} onPress={() => handleSelectMeal(item)}>
                {/* <View style={styles.recentItemIconBox} /> */}
                <View style={styles.recentItemDetails}>
                  <Text style={styles.recentItemTitle}>{item.title}</Text>
                  <Text style={styles.recentItemServing}>{servingRecord[item.serving]}</Text>
                  <View style={styles.recentItemMacros}>
                    <View style={styles.macroItem}>
                      <MaterialCommunityIcons name="leaf" size={14} color="#A8D5BA" />
                      <Text style={styles.macroText}>{item.protein}g Prot</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <MaterialCommunityIcons name="barley" size={14} color="#A8D5BA" />
                      <Text style={styles.macroText}>{item.carbs}g Carb</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <MaterialCommunityIcons name="water-outline" size={14} color="#A8D5BA" />
                      <Text style={styles.macroText}>{item.fats}g Gord</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.recentItemKcal}>
                  {item.kcal} <Text style={styles.kcalLabel}>kcal</Text>
                </Text>
              </Pressable>
            )}
            // NOVO: Mostra uma mensagem se a busca/categoria não tiver resultados
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
      <View style={styles.bottomContent}>
        <View style={styles.categoryGrid}>
          {/* MODIFICADO: 'categorias' agora é funcional */}
          {categorias.map(cat => (
            <CategoryItem
              key={cat.id}
              icon={cat.icon}
              name={cat.name}
              onPress={() => handleCategoryPress(cat.name)} // <-- AQUI
            />
          ))}
        </View>

        <Pressable style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Registrar Refeição</Text>
        </Pressable>
      </View>

      {/* Seu Dialog (sem modificações, já funciona com o tipo Foods) */}
      <Portal>
        <Dialog visible={!!selectedMeal} onDismiss={() => setSelectedMeal(null)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Detalhes da Refeição</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Nome: {selectedMeal?.title}</Text>
            <Text style={styles.dialogText}>Kcal: {selectedMeal?.kcal}</Text>
            <Text style={styles.dialogText}>Proteínas: {selectedMeal?.protein}g</Text>
            <Text style={styles.dialogText}>Carboidratos: {selectedMeal?.carbs}g</Text>
            <Text style={styles.dialogText}>Gorduras: {selectedMeal?.fats}g</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedMeal(null)} color="#A8D5BA">Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  )
}

// --- ESTILOS (Os mesmos da sua paleta) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5DC",
    paddingTop: 50
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D3D3D',
    marginBottom: 5,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowOpacity: 0.05,
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
    color: '#3D3D3D',
    marginTop: 15,
    marginBottom: 10,
  },
  recentItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  recentItemIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#A8D5BA',
  },
  recentItemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D3D3D',
  },
  recentItemServing: {
    fontSize: 13,
    color: '#777',
    marginBottom: 8,
  },
  recentItemMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 3,
  },
  recentItemKcal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D3D3D',
  },
  kcalLabel: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#777',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginBottom: 5,
    width: '20%',
  },
  categoryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 13,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#A8D5BA',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'stretch',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
  },
  searchResults: {
    width: '100%',
  },
  emptyList: {
    paddingTop: 50,
    alignItems: 'center'
  },
  emptyListText: {
    fontSize: 16,
    color: '#555'
  },
  // Estilos do Dialog
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D3D3D',
  },
  dialogText: {
    color: '#3D3D3D',
    fontSize: 16,
    marginBottom: 5,
  }
});