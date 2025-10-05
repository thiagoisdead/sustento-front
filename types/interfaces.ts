import { StyleProp, ViewStyle } from "react-native";

export interface AnimatedButtonProp {
  onPress: () => void;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}