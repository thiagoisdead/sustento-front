import { Text } from "react-native-paper"
import { AnimatedButton } from "./animatedButton"
import { StyleSheet } from "react-native"
import { COLORS } from "../constants/theme"

interface BaseButtonProps {
  onPress: () => void;
  text: string;
}

export const BaseButton = ({ onPress, text }: BaseButtonProps) => {
  return (
    <AnimatedButton style={styles.createMealPlanButton} onPress={onPress}>
      <Text style={styles.createMealPlanButtonText}>{text}</Text>
    </AnimatedButton>
  )
}
const styles = StyleSheet.create({
  createMealPlanButton: {
    backgroundColor: COLORS.greatGreen,
    width: 250,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  createMealPlanButtonText: {
    color: COLORS.grayLight,
    fontSize: 16,
    fontWeight: '600',
  },
})