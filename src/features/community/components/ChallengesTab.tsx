import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

// Calculate time remaining until end of week (Sunday 23:59:59)
function getTimeUntilEndOfWeek(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const endOfWeek = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const diff = endOfWeek.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds };
}

export function ChallengesTab() {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilEndOfWeek());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilEndOfWeek());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChallengePress = (challengeName: string) => {
    Alert.alert(challengeName, "Détails du défi à venir...");
  };

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0F0F1A" }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Timer Section */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MaterialCommunityIcons name="timer-outline" size={18} color="#8B5CF6" />
          <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>
            Temps Restant
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {/* Days */}
          <View style={{ flex: 1 }}>
            <View style={{
              height: 64,
              backgroundColor: 'rgba(26, 26, 46, 0.8)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>{formatNumber(timeRemaining.days)}</Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', fontWeight: '500' }}>Jours</Text>
          </View>

          <Text style={{ color: '#4B5563', fontSize: 24, fontWeight: '600', marginBottom: 20 }}>:</Text>

          {/* Hours */}
          <View style={{ flex: 1 }}>
            <View style={{
              height: 64,
              backgroundColor: 'rgba(26, 26, 46, 0.8)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>{formatNumber(timeRemaining.hours)}</Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', fontWeight: '500' }}>Heures</Text>
          </View>

          <Text style={{ color: '#4B5563', fontSize: 24, fontWeight: '600', marginBottom: 20 }}>:</Text>

          {/* Minutes */}
          <View style={{ flex: 1 }}>
            <View style={{
              height: 64,
              backgroundColor: 'rgba(26, 26, 46, 0.8)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>{formatNumber(timeRemaining.minutes)}</Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', fontWeight: '500' }}>Min</Text>
          </View>

          <Text style={{ color: '#4B5563', fontSize: 24, fontWeight: '600', marginBottom: 20 }}>:</Text>

          {/* Seconds */}
          <View style={{ flex: 1 }}>
            <View style={{
              height: 64,
              backgroundColor: 'rgba(26, 26, 46, 0.8)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>{formatNumber(timeRemaining.seconds)}</Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', fontWeight: '500' }}>Sec</Text>
          </View>
        </View>
      </View>

      {/* Level Progress Card */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <LinearGradient
          colors={["#2A1B3D", "#1E1429"]}
          style={{
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.2)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glow */}
          <View style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            borderRadius: 50,
          }} />

          <View style={{ flex: 1, zIndex: 10 }}>
            <View style={{ marginBottom: 12, paddingRight: 8 }}>
              <Text style={{ color: 'white', fontSize: 17, fontWeight: '700', marginBottom: 4 }} numberOfLines={1}>
                Niveau 4: Casanova en herbe
              </Text>
              <Text style={{ color: '#A78BFA', fontSize: 14, fontWeight: '600' }}>
                450 / 1000 XP
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={{
              height: 8,
              backgroundColor: 'rgba(54, 34, 73, 0.8)',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 12,
            }}>
              <LinearGradient
                colors={["#8B5CF6", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: "45%", height: "100%", borderRadius: 4 }}
              />
            </View>

            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500' }}>Voir les rangs</Text>
              <MaterialCommunityIcons name="arrow-right" size={14} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Badge */}
          <View style={{
            width: 64,
            height: 64,
            backgroundColor: 'rgba(54, 34, 73, 0.9)',
            borderRadius: 32,
            borderWidth: 2,
            borderColor: 'rgba(139, 92, 246, 0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}>
            <MaterialCommunityIcons name="shield-star" size={32} color="#FBBF24" />
          </View>
        </LinearGradient>
      </View>

      {/* Filter Chips */}
      <View style={{ paddingLeft: 20, marginBottom: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
          <Pressable style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#8B5CF6',
            height: 40,
            paddingHorizontal: 18,
            borderRadius: 20,
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}>
            <MaterialCommunityIcons name="calendar-today" size={16} color="white" />
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Hebdo</Text>
          </Pressable>

          <Pressable style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(45, 27, 62, 0.8)',
            height: 40,
            paddingHorizontal: 18,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}>
            <MaterialCommunityIcons name="weather-sunny" size={16} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '500' }}>Quotidien</Text>
          </Pressable>

          <Pressable style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(45, 27, 62, 0.8)',
            height: 40,
            paddingHorizontal: 18,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}>
            <MaterialCommunityIcons name="infinity" size={16} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '500' }}>Total</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Challenges List */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {/* Challenge 1 - In Progress */}
        <Pressable
          onPress={() => handleChallengePress('Relance Propre')}
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(26, 26, 46, 1)' : 'rgba(26, 26, 46, 0.9)',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.15)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          })}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.25)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialCommunityIcons name="broom" size={24} color="#8B5CF6" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Relance Propre</Text>
              <View style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}>
                <Text style={{ color: '#A78BFA', fontSize: 10, fontWeight: '700' }}>+50 PTS</Text>
              </View>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 13 }} numberOfLines={1}>
              Relancer après 3 jours de silence
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>1 / 3</Text>
            <View style={{
              width: 56,
              height: 5,
              backgroundColor: 'rgba(54, 34, 73, 0.8)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <View style={{ height: '100%', width: '33%', backgroundColor: '#8B5CF6', borderRadius: 3 }} />
            </View>
          </View>
        </Pressable>

        {/* Challenge 2 - Not Started */}
        <View style={{
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.25)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#8B5CF6" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Date Proposée</Text>
              <View style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}>
                <Text style={{ color: '#A78BFA', fontSize: 10, fontWeight: '700' }}>+100 PTS</Text>
              </View>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 13 }} numberOfLines={1}>
              Proposer un rendez-vous avec confiance
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>0 / 1</Text>
            <View style={{
              width: 56,
              height: 5,
              backgroundColor: 'rgba(54, 34, 73, 0.8)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <View style={{ height: '100%', width: '0%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }} />
            </View>
          </View>
        </View>

        {/* Challenge 3 - Completed */}
        <View style={{
          backgroundColor: 'rgba(26, 26, 46, 0.5)',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(52, 211, 153, 0.15)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          opacity: 0.85,
        }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(52, 211, 153, 0.25)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#34D399" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 15, fontWeight: '600', textDecorationLine: 'line-through' }}>
                Première Impression
              </Text>
            </View>
            <Text style={{ color: '#6B7280', fontSize: 13 }}>Complété</Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(52, 211, 153, 0.25)',
          }}>
            <Text style={{ color: '#34D399', fontSize: 12, fontWeight: '700' }}>Réclamé</Text>
          </View>
        </View>
      </View>

      {/* Privacy Footer */}
      <View style={{ paddingHorizontal: 32, paddingVertical: 24, alignItems: 'center' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(45, 27, 62, 0.6)',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}>
          <MaterialCommunityIcons name="lock" size={12} color="#64748B" />
          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '500' }}>
            Confidentialité absolue : vos données ne sont pas partagées.
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}
