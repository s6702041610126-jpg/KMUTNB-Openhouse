import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FACULTIES } from '../constants/faculties';
import { useApp } from '../context/AppContext';

export default function MissionsScreen() {
  const { visitedFaculties, earnedXP } = useApp();

  // Calculate Level based on XP
  const level = Math.floor(earnedXP / 50) + 1;
  const xpInCurrentLevel = earnedXP % 50;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top XP / Level Header */}
      <View style={styles.xpCard}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>LVL {level}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.userLevelTitle}>KMUTNB Campus Explorer</Text>
            <Text style={styles.xpAmountText}>{earnedXP} Total XP</Text>
          </View>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>

        {/* Level Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${(xpInCurrentLevel / 50) * 100}%` }]} />
        </View>
        <Text style={styles.progressSubText}>
          {50 - xpInCurrentLevel} XP until Level {level + 1}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stamp Progress Banner */}
        <View style={styles.stampBanner}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.stampBannerTag}>MAP EXPLORER COLLECTION</Text>
            <Text style={styles.stampBannerTitle}>
              Collected {visitedFaculties.length} / 9 Stamps
            </Text>
          </View>
        </View>

        {/* 9 Faculty Stamp Grid (Old Passport UI) */}
        <Text style={styles.sectionTitle}>🗺️ Faculty Stamps Collection</Text>
        <View style={styles.stampGrid}>
          {FACULTIES.map((fac, idx) => {
            const isVisited = visitedFaculties.includes(fac.id);
            return (
              <View
                key={fac.id}
                style={[
                  styles.stampCard,
                  isVisited ? { borderColor: fac.color } : styles.stampCardLocked,
                ]}
              >
                <View style={styles.stampNumberBadge}>
                  <Text style={styles.stampNumberText}>
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </Text>
                </View>

                <View
                  style={[
                    styles.oldStampCircle,
                    isVisited ? { backgroundColor: fac.color } : styles.oldStampCircleLocked,
                  ]}
                >
                  <Text style={styles.oldStampIcon}>{isVisited ? fac.badgeIcon : '🔒'}</Text>
                </View>

                <Text style={styles.stampCode}>{fac.code}</Text>
                <Text style={styles.stampName} numberOfLines={2}>
                  {fac.nameEn}
                </Text>

                <View
                  style={[
                    styles.statusPill,
                    isVisited ? styles.statusPillVisited : styles.statusPillLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isVisited ? styles.statusVisitedText : styles.statusLockedText,
                    ]}
                  >
                    {isVisited ? '✓ Visited' : 'Locked'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Faculty Missions List */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🏫 Faculty Stamp Missions</Text>
        {FACULTIES.map((fac) => {
          const isComplete = visitedFaculties.includes(fac.id);

          return (
            <View key={fac.id} style={[styles.missionCard, isComplete && styles.missionCardComplete]}>
              <View style={styles.missionHeaderRow}>
                <View style={[styles.stampCircle, isComplete ? { backgroundColor: fac.color } : styles.stampCircleLocked]}>
                  <Text style={styles.stampIcon}>{isComplete ? fac.badgeIcon : '🔒'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.missionTitle}>{fac.nameEn}</Text>
                  <Text style={styles.missionDesc}>📍 {fac.building}</Text>
                </View>
                {isComplete ? (
                  <View style={styles.claimedBtn}>
                    <Text style={styles.claimedBtnText}>Claimed ✓</Text>
                  </View>
                ) : (
                  <View style={styles.xpRewardTag}>
                    <Text style={styles.xpRewardTagText}>+50 XP</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  xpCard: {
    backgroundColor: '#F15A24',
    margin: 16,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#F15A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  levelBadgeText: {
    color: '#F15A24',
    fontSize: 14,
    fontWeight: '900',
  },
  userLevelTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  xpAmountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  trophyIcon: {
    fontSize: 32,
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressSubText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stampBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stampBannerTag: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  stampBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stampCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  stampCardLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  stampNumberBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stampNumberText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  oldStampCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  oldStampCircleLocked: {
    backgroundColor: '#CBD5E1',
  },
  oldStampIcon: {
    fontSize: 24,
  },
  stampCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  stampName: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    height: 28,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  statusPillVisited: {
    backgroundColor: '#D1FAE5',
  },
  statusPillLocked: {
    backgroundColor: '#E2E8F0',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusVisitedText: {
    color: '#059669',
  },
  statusLockedText: {
    color: '#64748B',
  },

  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  missionCardComplete: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  missionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  missionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  xpRewardTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpRewardTagText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '800',
  },
  claimedBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  claimedBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stampCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampCircleLocked: {
    backgroundColor: '#E2E8F0',
  },
  stampIcon: {
    fontSize: 22,
  },
});
