import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import { Meal } from '../../types/meal';

interface FoodItem {
  id: number;
  name: string;
  meal_aliment_id: number;
  calories: number;
  quantity: number;
  unit: string;
}

interface MealWithFoods extends Meal {
  foods?: FoodItem[];
}

interface MealItemProps {
  meal: MealWithFoods;
  onDelete: (id: number) => void;
  onDeleteFood: (mealId: number, mealAlimentId: number) => void;
}

export const MealItem = ({ meal, onDelete, onDeleteFood }: MealItemProps) => {


  console.log('alimentos meal', meal);

  const handleDeletePress = () => {
    Alert.alert(
      "Excluir Refeição",
      "Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => onDelete(meal.id) },
      ]
    );
    console.log('a meal id que ta sendo deletada', meal.id)
  };

  const handleRemoveFood = (foodName: string, mealAlimentId: number) => {
    Alert.alert(
      "Remover Alimento",
      `Deseja remover ${foodName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => onDeleteFood(meal.id, mealAlimentId)
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Pressable onPress={handleDeletePress} hitSlop={10}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF5252" />
        </Pressable>
      </View>

      {meal.foods && meal.foods.length > 0 ? (
        <View style={styles.foodList}>
          {meal.foods.map((food, index) => (


            <View key={index} style={styles.foodRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Checkbox status="unchecked" color={COLORS.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodDetails}>
                    {food.quantity}{food.unit} - {Number(food.calories).toFixed(2)} kcal
                  </Text>
                </View>
              </View>

              {/* Botão de Deletar Alimento Específico */}
              <Pressable
                onPress={() => { handleRemoveFood(food.name, food.meal_aliment_id); console.log('alimento inteiro', food) }}
                hitSlop={10}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#CCC" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nenhum alimento adicionado.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: '#FFF', // Garante fundo branco se estiver num card
    borderRadius: 8,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  foodList: {
    paddingLeft: 4,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  foodName: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  foodDetails: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#AAA',
    fontSize: 12,
    paddingVertical: 4,
  }
});