import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { REWARDS } from '../constants/missions';
import { useApp } from '../context/AppContext';

export default function RewardsScreen() {
  const { earnedXP, visitedFaculties, redeemedRewards, redeemReward } = useApp();
  const handleRedeem = (reward) => {
    Alert.alert(
      'Confirm Redemption',
      `Use ${reward.costXP} XP to redeem "${reward.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const res = redeemReward(reward.id);
            if (res.success) {
              Alert.alert('🎉 Success!', `You have successfully redeemed "${reward.title}". Please claim your souvenir at the main booth.`);
            } else {
              Alert.alert('Unable to Redeem', res.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Metric Card */}
      <View style={styles.headerCard}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>✨ Your XP Balance</Text>
          <Text style={styles.metricValue}>{earnedXP} XP</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>🏫 Faculties Visited</Text>
          <Text style={styles.metricValue}>{visitedFaculties.length}/9</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>🎁 Reward Center</Text>
        <Text style={styles.sectionSub}>Redeem your XP and stamps for souvenirs at the main booth</Text>

        {REWARDS.map((item) => {
          const hasXP = earnedXP >= item.costXP;
          const hasFaculties = visitedFaculties.length >= item.requiredFaculties;
          const isEligible = hasXP && hasFaculties;

          return (
            <View key={item.id} style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>{item.icon}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.rewardTitle}>{item.title}</Text>
                <Text style={styles.rewardDesc}>{item.description}</Text>

                <View style={styles.reqRow}>
                  <Text style={[styles.reqTag, hasXP ? styles.reqMet : styles.reqNotMet]}>
                    ⚡ {item.costXP} XP
                  </Text>
                  {item.requiredFaculties > 0 && (
                    <Text style={[styles.reqTag, hasFaculties ? styles.reqMet : styles.reqNotMet]}>
                      🏫 {item.requiredFaculties} Faculties
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.redeemBtn, !isEligible && styles.redeemBtnDisabled]}
                onPress={() => isEligible && handleRedeem(item)}
                disabled={!isEligible}
                activeOpacity={0.8}
              >
                <Text style={styles.redeemBtnText}>{isEligible ? 'Redeem' : 'Not Ready'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Redeemed Items Section */}
        {redeemedRewards.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionHeader}>🎫 Redeemed Rewards ({redeemedRewards.length})</Text>
            {redeemedRewards.map((r, idx) => (
              <View
                key={idx}
                style={styles.redeemedItem}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.redeemedTitle}>{r.rewardTitle}</Text>
                  <Text style={styles.redeemedCode}>Status: Claimed</Text>
                </View>
                <View style={styles.claimedBadge}>
                  <Text style={styles.claimedBadgeText}>✓</Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F15A24',
    marginTop: 4,
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
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardIcon: {
    fontSize: 34,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  rewardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  reqRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  reqTag: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reqMet: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  reqNotMet: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  redeemBtn: {
    backgroundColor: '#F15A24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  redeemBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  redeemedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 8,
  },
  redeemedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  redeemedCode: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  claimedBadge: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
