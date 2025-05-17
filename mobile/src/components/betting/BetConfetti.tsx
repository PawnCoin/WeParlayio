import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface BetConfettiProps {
  duration?: number;
  onComplete?: () => void;
}

const BetConfetti = ({ duration = 3000, onComplete }: BetConfettiProps) => {
  // Handle completion
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);
  
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/confetti.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        speed={1.2}
      />
      <LottieView
        source={require('../../assets/animations/celebrate.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        speed={1}
      />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  animation: {
    width,
    height,
    position: 'absolute',
  },
});

export default BetConfetti;