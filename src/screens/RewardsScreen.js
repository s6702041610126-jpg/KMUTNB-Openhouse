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
  const [activeQRToken, setActiveQRToken] = useState(null);

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
              setActiveQRToken({
                title: reward.title,
                token: res.token,
              });
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

        {/* Redeemed Tokens Section */}
        {redeemedRewards.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionHeader}>🎫 Redeemed Rewards ({redeemedRewards.length})</Text>
            {redeemedRewards.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.redeemedItem}
                onPress={() => setActiveQRToken({ title: r.rewardTitle, token: r.token })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.redeemedTitle}>{r.rewardTitle}</Text>
                  <Text style={styles.redeemedCode}>TOKEN: {r.token}</Text>
                </View>
                <View style={styles.showQrBtn}>
                  <Text style={styles.showQrBtnText}>Show QR 📱</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Redemption QR Modal */}
      <Modal visible={!!activeQRToken} transparent animationType="fade" onRequestClose={() => setActiveQRToken(null)}>
        <View style={styles.qrOverlay}>
          <View style={styles.qrCard}>
            <Text style={styles.qrHeaderTitle}>📱 Reward QR Code</Text>
            <Text style={styles.qrRewardTitle}>{activeQRToken?.title}</Text>

            {/* Simulated QR Code Graphic */}
            <View style={styles.qrBox}>
              <Text style={styles.qrBoxText}>[ QR CODE SEAL ]</Text>
              <Text style={styles.qrTokenText}>{activeQRToken?.token}</Text>
            </View>

            <Text style={styles.qrInstruction}>
              Present this QR code to staff at the main reward booth to claim your prize
            </Text>

            <TouchableOpacity style={styles.closeQrBtn} onPress={() => setActiveQRToken(null)}>
              <Text style={styles.closeQrBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  showQrBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  showQrBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  qrHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  qrRewardTitle: {
    fontSize: 14,
    color: '#F15A24',
    fontWeight: '700',
    marginTop: 4,
  },
  qrBox: {
    width: 180,
    height: 180,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
  },
  qrBoxText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  qrTokenText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 10,
    letterSpacing: 1,
  },
  qrInstruction: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
  closeQrBtn: {
    backgroundColor: '#F15A24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 18,
  },
  closeQrBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
