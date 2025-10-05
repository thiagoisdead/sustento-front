import { useState } from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { Button, Card, Dialog, Portal, Searchbar } from "react-native-paper"
import { Foods } from "../../types/data";

export default function MealsHome() {

  const products: Foods[] = [
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500, serving: "g" },
    { title: 'Maçã', protein: 6, carbs: 10, fats: 90, kcal: 540.2, serving: "g" },
    { title: 'Pera', protein: 30, carbs: 1, fats: 20, kcal: 600.2, serving: "g" }
  ];

  const servingRecord: Record<"portion" | "g" | "ml", string> = {
    portion: "Por porção",
    g: "Por 100 gramas",
    ml: "Por 100 ML"
  }

  const [searchParams, setSearchParams] = useState<string>('');
  const [searchData, setSearchData] = useState<Foods[]>([])
  const [selectedMeal, setSelectedMeal] = useState<Foods | null>(null)

  const handleSearch = (text: string) => {
    setSearchParams(text)

    if (!text.length || text.length < 0) return setSearchData([])

    setSearchData(products.filter(p => p.title.toLowerCase().includes(text.toLowerCase())));
  }

  const handleSelectMeal = (foodData: object) => {
    setSelectedMeal(foodData as Foods)
    console.log(foodData)

  }

  return (
    <View style={styles.container}>
      <View style={{ display: 'flex', justifyContent: 'center', flexDirection: "row" }}>
        <Text style={styles.title}>Alimentação</Text>
      </View>
      <View style={styles.searchBar}>
        <Searchbar
          placeholder="Batata Doce"
          onChangeText={(text) => handleSearch(text)}
          value={searchParams}
          style={{ backgroundColor: '#ece1c3', borderColor: '#2E7D32', borderWidth: 2}}
        />
      </View>
      <View style={styles.resultsContainer}>
        <FlatList
          style={styles.searchResults}
          data={searchData}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ alignItems: 'center', gap: 10 }}
          renderItem={({ item }) => (
            <Card style={styles.item} onPress={() => handleSelectMeal(item)}>
              <Card.Title title={item.title} subtitle={servingRecord[item.serving]} titleStyle={{ color: '#578f1a', fontWeight: 'bold' }}
              />
              <Card.Content>
                <Text>Kcal: {item.kcal} Carbs: {item.carbs} Gord: {item.fats} Prot: {item.protein}</Text>
              </Card.Content>
            </Card>
          )}
        />
      </View>
      <Portal><Dialog visible={!!selectedMeal} dismissable={true}><Dialog.Title>Detalhes da Refeição</Dialog.Title>
        <Dialog.Content>
          <Text>Nome: {selectedMeal?.title}</Text>
          <Text>Kcal: {selectedMeal?.kcal}</Text>
          <Text>Carbs: {selectedMeal?.carbs}</Text>
          <Text>Gord: {selectedMeal?.fats}</Text>
          <Text>Prot: {selectedMeal?.protein}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setSelectedMeal(null)}>Fechar</Button>
        </Dialog.Actions>
      </Dialog></Portal>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    paddingTop: 50
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  item: {
    padding: 10,
    backgroundColor: '#eee',
    borderColor: '#ccc',
    width: 300,
    color: '#578f1a'
  },
  searchResults: {
    maxHeight: 360,
    minHeight: 200,
    width: '80%',
  },
  resultsContainer: {
    alignItems: "center",
    marginTop: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
  }
})