import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const TypingIndicator = () => {
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const animate = (index) => {
    return Animated.sequence([
      Animated.delay(index * 200),
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index], {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel(animations.map((_, index) => animate(index)))
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const animatedStyles = animations.map((animation) => ({
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, animatedStyles[0]]} />
      <Animated.View style={[styles.dot, animatedStyles[1]]} />
      <Animated.View style={[styles.dot, animatedStyles[2]]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c9b6f2',
    marginHorizontal: 3,
  },
});

export default TypingIndicator;
