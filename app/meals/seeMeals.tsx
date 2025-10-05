import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function seeMeals() {
  return (
    <View style={styles.container}>
      <View style={styles.upperButtons}>
        <Button style={styles.btnBase}>
          <Text style={styles.btnText}>
            Registrar refeição
          </Text>
        </Button>
        <Button style={styles.btnBase}>
          <Text style={styles.btnText}>
            Editar plano alimentar
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5DC",
  },
  upperButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnBase: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    marginVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

})