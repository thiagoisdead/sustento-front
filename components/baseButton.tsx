import { Text } from "react-native-paper"
import { AnimatedButton } from "./animatedButton"
import { StyleSheet } from "react-native"
import { COLORS } from "../constants/theme"

interface BaseButtonProps {
  onPress: () => void;
  text: string;
  width?: number;
}

export const BaseButton = ({ onPress, text, width = 250 }: BaseButtonProps) => {
  return (
    <AnimatedButton style={[styles.createMealPlanButton, { width }]}  onPress={onPress}>
      <Text style={styles.createMealPlanButtonText}>{text}</Text>
    </AnimatedButton>
  )
}
const styles = StyleSheet.create({
  createMealPlanButton: {
    backgroundColor: COLORS.greatGreen,
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