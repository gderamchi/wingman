import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export function LeaderboardTab() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0F0F1A" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary */}
        <View style={{
          padding: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
        }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: 'white', letterSpacing: -0.5 }}>Classement</Text>
            <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '500', marginTop: 2 }}>Ligue Hebdomadaire</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.2)',
            }}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#8B5CF6" />
              <Text style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' }}>2j 14h 32m</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>Reset Dimanche</Text>
          </View>
        </View>

        {/* Tier Carousel */}
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8 }}>
            {/* Previous Tier - Silver */}
            <View style={{ width: 130, opacity: 0.5, transform: [{ scale: 0.92 }] }}>
              <LinearGradient
                colors={["#C0C0C0", "#9CA3AF"]}
                style={{
                  borderRadius: 20,
                  padding: 16,
                  height: 120,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MaterialCommunityIcons name="medal" size={36} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', marginTop: 6, fontSize: 15 }}>Argent</Text>
              </LinearGradient>
            </View>

            {/* Current Tier - Gold */}
            <View style={{ width: 150 }}>
              <LinearGradient
                colors={["#FACC15", "#EAB308", "#CA8A04"]}
                style={{
                  borderRadius: 20,
                  padding: 16,
                  height: 140,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  shadowColor: '#FACC15',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }}
              >
                <View style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>Actuel</Text>
                </View>
                <MaterialCommunityIcons name="trophy" size={44} color="white" style={{ marginBottom: 4 }} />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 }}>Or</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' }}>Top 20%</Text>
              </LinearGradient>
            </View>

            {/* Next Tier - Diamond */}
            <View style={{ width: 130, opacity: 0.6, transform: [{ scale: 0.92 }] }}>
              <LinearGradient
                colors={["#22D3EE", "#3B82F6"]}
                style={{
                  borderRadius: 20,
                  padding: 16,
                  height: 120,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <MaterialCommunityIcons name="diamond-stone" size={36} color="white" />
                <Text style={{ color: 'white', fontWeight: '700', marginTop: 6, fontSize: 15 }}>Diamant</Text>
                <View style={{
                  position: 'absolute',
                  bottom: 10,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  borderRadius: 12,
                  padding: 4
                }}>
                  <MaterialCommunityIcons name="lock" size={12} color="white" />
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>

        {/* Global / Friends Filter */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <View style={{
            flexDirection: 'row',
            height: 44,
            width: '100%',
            backgroundColor: 'rgba(26, 26, 46, 0.8)',
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Global</Text>
            </View>
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              opacity: 0.5
            }}>
              <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500' }}>Amis</Text>
              <MaterialCommunityIcons name="lock" size={12} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Podium */}
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 16,
          position: 'relative',
          alignItems: 'flex-end',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 12
        }}>
          {/* Background Glow */}
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 200,
            height: 200,
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            borderRadius: 100,
            transform: [{ translateX: -100 }, { translateY: -100 }],
          }} />

          {/* Rank 2 */}
          <View style={{ alignItems: 'center', width: '28%' }}>
            <View style={{ position: 'relative', marginBottom: 10 }}>
              <LinearGradient
                colors={["#C0C0C0", "#6B7280"]}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  padding: 3,
                  shadowColor: '#9CA3AF',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <View style={{ width: '100%', height: '100%', borderRadius: 33, backgroundColor: '#374151' }} />
              </LinearGradient>
              <View style={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                marginLeft: -12,
                backgroundColor: '#2d1b3e',
                borderWidth: 1,
                borderColor: '#6B7280',
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>2</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: 'white', textAlign: 'center' }} numberOfLines={1}>CyberPunk</Text>
            <Text style={{ fontSize: 11, color: '#8B5CF6', fontWeight: '600' }}>2,100 pts</Text>
          </View>

          {/* Rank 1 */}
          <View style={{ alignItems: 'center', width: '32%', marginTop: -32, zIndex: 10 }}>
            <View style={{ position: 'relative', marginBottom: 12 }}>
              <View style={{ position: 'absolute', top: -32, left: '50%', marginLeft: -16 }}>
                <MaterialCommunityIcons name="crown" size={32} color="#FACC15" />
              </View>
              <LinearGradient
                colors={["#FDE047", "#EAB308", "#CA8A04"]}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  padding: 3,
                  shadowColor: '#FACC15',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                }}
              >
                <View style={{ width: '100%', height: '100%', borderRadius: 41, backgroundColor: '#374151' }} />
              </LinearGradient>
              <View style={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                marginLeft: -14,
                backgroundColor: '#EAB308',
                borderRadius: 14,
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#FACC15',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>1</Text>
              </View>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: 'white', textAlign: 'center' }} numberOfLines={1}>NeoSoul</Text>
            <Text style={{ fontSize: 13, color: '#FACC15', fontWeight: '700' }}>2,450 pts</Text>
          </View>

          {/* Rank 3 */}
          <View style={{ alignItems: 'center', width: '28%' }}>
            <View style={{ position: 'relative', marginBottom: 10 }}>
              <LinearGradient
                colors={["#FB923C", "#EF4444"]}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  padding: 3,
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <View style={{ width: '100%', height: '100%', borderRadius: 33, backgroundColor: '#374151' }} />
              </LinearGradient>
              <View style={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                marginLeft: -12,
                backgroundColor: '#2d1b3e',
                borderWidth: 1,
                borderColor: 'rgba(251, 146, 60, 0.5)',
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#FB923C' }}>3</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: 'white', textAlign: 'center' }} numberOfLines={1}>Glitch</Text>
            <Text style={{ fontSize: 11, color: '#8B5CF6', fontWeight: '600' }}>1,950 pts</Text>
          </View>
        </View>

        {/* List Ranks 4-8 */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
          {[
            { rank: 4, name: "VaporWave", pts: "1,820" },
            { rank: 5, name: "PixelHeart", pts: "1,650" },
            { rank: 6, name: "SynthPop", pts: "1,410" },
            { rank: 7, name: "NightRider", pts: "1,300" },
            { rank: 8, name: "PastelGoth", pts: "1,250" },
          ].map((item) => (
            <View
              key={item.rank}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 14,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6B7280', width: 24, textAlign: 'center' }}>{item.rank}</Text>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#374151' }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>{item.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#8B5CF6' }}>{item.pts}</Text>
                <Text style={{ fontSize: 9, color: '#6B7280', textTransform: 'uppercase', fontWeight: '500' }}>pts</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Fixed User Row at bottom */}
      <View style={{
        backgroundColor: 'rgba(45, 27, 62, 0.95)',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        position: 'absolute',
        bottom: 0,
        width: '100%',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 14,
          borderRadius: 16,
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderWidth: 1,
          borderColor: 'rgba(139, 92, 246, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: 'white', width: 24, textAlign: 'center' }}>42</Text>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#4B5563',
            borderWidth: 2,
            borderColor: '#8B5CF6',
            padding: 2,
          }}>
            <View style={{ width: '100%', height: '100%', borderRadius: 18, backgroundColor: '#374151' }} />
          </View>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>Vous</Text>
              <View style={{ backgroundColor: '#7C3AED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, color: 'white', fontWeight: '700', textTransform: 'uppercase' }}>Argent</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: '#A78BFA' }}>Top 45% • Continuez !</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>450</Text>
            <Text style={{ fontSize: 9, color: '#6B7280', textTransform: 'uppercase', fontWeight: '500' }}>pts</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
