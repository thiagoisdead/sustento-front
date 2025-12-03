import { useRef } from "react";
import { Animated, Pressable } from 'react-native';
import { AnimatedButtonProp } from "../types/interfaces";

export function AnimatedButton(props: AnimatedButtonProp) {

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: props.scaleTo || 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 5,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={props.onPress}>
      <Animated.View style={[{ transform: [{ scale }] }, props.style]}>
        {props.children}
      </Animated.View>
    </Pressable>
  )

}