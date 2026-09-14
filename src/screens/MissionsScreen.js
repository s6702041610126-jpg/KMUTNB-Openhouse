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
import { MISSIONS } from '../constants/missions';
import { useApp } from '../context/AppContext';

export default function MissionsScreen() {
  const { completedActivities, visitedFaculties, earnedXP } = useApp();

  // Calculate Level based on XP
  const level = Math.floor(earnedXP / 50) + 1;
  const xpInCurrentLevel = earnedXP % 50;

  const handleClaim = (mission) => {
    Alert.alert('🎉 Congratulations!', `You earned "${mission.rewardName}" (+${mission.xpReward} XP)`);
  };

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
        <Text style={styles.sectionHeader}>🎯 Missions & Quests</Text>
        <Text style={styles.sectionSub}>Complete missions to unlock special badges and limited rewards</Text>

        {MISSIONS.map((m) => {
          const currentCount =
            m.requirementType === 'activities' ? completedActivities.length : visitedFaculties.length;
          const isComplete = currentCount >= m.targetCount;
          const progressPct = Math.min(100, (currentCount / m.targetCount) * 100);

          return (
            <View key={m.id} style={[styles.missionCard, isComplete && styles.missionCardComplete]}>
              <View style={styles.missionHeaderRow}>
                <Text style={styles.missionIcon}>{m.rewardIcon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.missionTitle}>{m.title}</Text>
                  <Text style={styles.missionDesc}>{m.description}</Text>
                </View>
                {isComplete ? (
                  <TouchableOpacity
                    style={styles.claimBtn}
                    onPress={() => handleClaim(m)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.claimBtnText}>Claim ✓</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.xpRewardTag}>
                    <Text style={styles.xpRewardTagText}>+{m.xpReward} XP</Text>
                  </View>
                )}
              </View>

              {/* Progress Bar inside Mission Card */}
              <View style={styles.missionProgressWrapper}>
                <View style={styles.missionProgressBg}>
                  <View style={[styles.missionProgressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.missionProgressText}>
                  {currentCount} / {m.targetCount} ({Math.round(progressPct)}%)
                </Text>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
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
  missionIcon: {
    fontSize: 28,
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
  claimBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  missionProgressWrapper: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  missionProgressFill: {
    height: '100%',
    backgroundColor: '#F15A24',
    borderRadius: 3,
  },
  missionProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
});
