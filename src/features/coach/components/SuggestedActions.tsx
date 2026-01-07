import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface SuggestedActionsProps {
  onPressAnalyze: () => void;
  onPressRoleplay?: () => void; // Future support
  onPressTips?: () => void;     // Future support
}

export function SuggestedActions({ onPressAnalyze, onPressRoleplay, onPressTips }: SuggestedActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggestions pour démarrer</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable style={styles.card} onPress={onPressAnalyze}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Ionicons name="images" size={24} color="#A78BFA" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Analyser</Text>
            <Text style={styles.cardSubtitle}>Envoie une capture</Text>
          </View>
          <View style={styles.arrow}>
             <Ionicons name="arrow-forward" size={16} color="#6B7280" />
          </View>
        </Pressable>

        {/* Placeholder for future features */}
        {onPressRoleplay && (
           <Pressable style={styles.card} onPress={onPressRoleplay}>
             <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
               <Ionicons name="chatbubbles" size={24} color="#34D399" />
             </View>
             <View style={styles.textContainer}>
               <Text style={styles.cardTitle}>Roleplay</Text>
               <Text style={styles.cardSubtitle}>Simule une discussion</Text>
             </View>
           </Pressable>
        )}

        {/* Static generic tip card */}
        <Pressable style={[styles.card, styles.disabledCard]}>
             <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
               <Ionicons name="bulb" size={24} color="#FBBF24" />
             </View>
             <View style={styles.textContainer}>
               <Text style={[styles.cardTitle, styles.disabledText]}>Conseils</Text>
               <Text style={[styles.cardSubtitle, styles.disabledText]}>Bientôt disponible</Text>
             </View>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 16,
  },
  title: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 12,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  disabledCard: {
     opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  disabledText: {
     color: '#6B7280',
  },
  arrow: {
     marginLeft: 4,
  }
});
