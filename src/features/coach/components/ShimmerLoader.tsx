/**
 * ShimmerLoader Component
 * ChatGPT-style loading indicator with rotating phrases and shimmer effect
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, View } from 'react-native';

interface ShimmerLoaderProps {
  isVisible: boolean;
}

const LOADING_PHRASES_KEYS = [
  'coach.loading.analyzing',
  'coach.loading.findingBest',
  'coach.loading.craftingReply',
  'coach.loading.thinkingTone',
  'coach.loading.almostReady',
];

const FALLBACK_PHRASES = [
  'Analyse en cours...',
  'Je trouve la meilleure réponse...',
  'Je peaufine les suggestions...',
  'Je réfléchis au bon ton...',
  'Presque prêt...',
];

export function ShimmerLoader({ isVisible }: ShimmerLoaderProps) {
  const { t } = useTranslation();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Shimmer animation loop
  useEffect(() => {
    if (!isVisible) return;

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [isVisible, shimmerAnim]);

  // Phrase rotation
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Change phrase
        setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES_KEYS.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, fadeAnim]);

  // Reset on hide
  useEffect(() => {
    if (!isVisible) {
      setPhraseIndex(0);
      shimmerAnim.setValue(0);
      fadeAnim.setValue(1);
    }
  }, [isVisible, shimmerAnim, fadeAnim]);

  if (!isVisible) return null;

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const currentPhrase = t(LOADING_PHRASES_KEYS[phraseIndex], FALLBACK_PHRASES[phraseIndex]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Text with shimmer */}
      <View style={styles.textWrapper}>
        <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
          {currentPhrase}
        </Animated.Text>

        {/* Shimmer overlay */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX }] },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
    gap: 12,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 24,
    height: 24,
  },
  textWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  text: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '500',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
});
