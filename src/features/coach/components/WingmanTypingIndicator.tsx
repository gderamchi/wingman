/**
 * WingmanTypingIndicator Component
 * Typing indicator styled as a chat message with animated Wingman logo
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, View } from 'react-native';

import type { LoadingPhase } from '../types';

interface WingmanTypingIndicatorProps {
  isVisible: boolean;
  phase?: LoadingPhase | null;
}

const PHASE_MESSAGES: Record<LoadingPhase, string> = {
  connecting: 'coach.loading.connecting',
  analyzing: 'coach.loading.analyzing',
  thinking: 'coach.loading.thinking',
  generating: 'coach.loading.generating',
  finalizing: 'coach.loading.finalizing',
};

const PHASE_FALLBACKS: Record<LoadingPhase, string> = {
  connecting: 'Connexion en cours',
  analyzing: 'Analyse de ta conversation',
  thinking: 'Wingman réfléchit',
  generating: 'Création des suggestions',
  finalizing: 'Presque prêt',
};

export function WingmanTypingIndicator({ isVisible, phase }: WingmanTypingIndicatorProps) {
  const { t } = useTranslation();

  // Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // State
  const [displayPhase, setDisplayPhase] = useState<LoadingPhase | null>(phase || null);

  // Pulse animation for logo
  useEffect(() => {
    if (!isVisible) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [isVisible, pulseAnim]);

  // Dots bounce animation (ChatGPT-style)
  useEffect(() => {
    if (!isVisible) return;

    const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotAnim, {
            toValue: -6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay), // Sync loop duration
        ])
      );
    };

    const anim1 = createDotAnimation(dot1Anim, 0);
    const anim2 = createDotAnimation(dot2Anim, 150);
    const anim3 = createDotAnimation(dot3Anim, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [isVisible, dot1Anim, dot2Anim, dot3Anim]);

  // Fade in/out on visibility change
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  // Smooth phase transition
  useEffect(() => {
    if (phase === displayPhase) return;

    Animated.timing(textFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setDisplayPhase(phase || null);
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [phase, displayPhase, textFadeAnim]);

  // Reset on hide
  useEffect(() => {
    if (!isVisible) {
      pulseAnim.setValue(1);
      textFadeAnim.setValue(1);
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [isVisible, pulseAnim, textFadeAnim, dot1Anim, dot2Anim, dot3Anim]);

  if (!isVisible) return null;

  const currentPhase = displayPhase || 'thinking';
  const statusText = t(PHASE_MESSAGES[currentPhase], PHASE_FALLBACKS[currentPhase]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Avatar (same style as MessageBubble coach avatar) */}
      <Animated.View
        style={[
          styles.avatar,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Image
          source={require("@/assets/logo.png")}
          style={styles.avatarLogo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Message Bubble */}
      <View style={styles.bubble}>
        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot1Anim }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot2Anim }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot3Anim }] }]}
          />
        </View>

        {/* Status text */}
        <Animated.Text style={[styles.statusText, { opacity: textFadeAnim }]}>
          {statusText}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarLogo: {
    width: 24,
    height: 24,
  },
  bubble: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

