import { useState } from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { Card, Searchbar } from "react-native-paper"
import { Foods } from "../../types/data";

export default function MealsHome() {

  const products: Foods[] = [
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Banana', protein: 6, carbs: 10, fats: 90, kcal: 500 },
    { title: 'Maçã', protein: 6, carbs: 10, fats: 90, kcal: 540.2 },
    { title: 'Pera', protein: 30, carbs: 1, fats: 20, kcal: 600.2 }
  ];

  const [searchParams, setSearchParams] = useState<string>('');
  const [searchData, setSearchData] = useState<Foods[]>([])

  const handleSearch = (text: string) => {
    setSearchParams(text)

    if (!text.length || text.length < 0) return setSearchData([])

    setSearchData(products.filter(p => p.title.toLowerCase().includes(text.toLowerCase())));
  }

  const handleSelectMeal = (foodData: object) => {
    console.log(foodData)

  }

  return (
    <View style={styles.container}>
      <View style={{ display: 'flex', justifyContent: 'center', flexDirection: "row" }}>
        <Text style={{ fontSize: 20 }}>Alimentação</Text>
      </View>
      <View style={styles.searchBar}>
        <Searchbar
          placeholder="Batata Doce"
          onChangeText={(text) => handleSearch(text)}
          value={searchParams}
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
              <Card.Title title={item.title} titleStyle={{ color: '#578f1a', fontWeight: 'bold' }}
              />
              <Card.Content>
                <Text>Kcal: {item.kcal} Carbs: {item.carbs} Gord: {item.fats} Prot: {item.protein}</Text>
              </Card.Content>
            </Card>
          )}
        />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece1c3',
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
    minWidth: '80%',
  },
  resultsContainer: {
    alignItems: "center",
    marginTop: 20
  },
  // cardTitle: {
  //   color: '#578f1a',
  // }


})