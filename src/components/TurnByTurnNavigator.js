import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function TurnByTurnNavigator() {
  const {
    activeNavigator,
    clearNavigation,
    checkInActivity,
    checkInFacultyStamp,
    userLocation,
    startNavigation,
  } = useApp();

  if (!activeNavigator) return null;

  const currentStep =
    activeNavigator.steps[activeNavigator.currentStepIndex] || activeNavigator.steps[0];

  const handleArrivalCheckIn = () => {
    if (activeNavigator.activityId) {
      checkInActivity(
        activeNavigator.facultyId,
        activeNavigator.activityId,
        activeNavigator.activityXp || 10
      );
      Alert.alert(
        '🎉 ยินดีด้วย!',
        `คุณเดินทางถึง ${activeNavigator.activityRoom || activeNavigator.building} และเช็คอินกิจกรรม "${activeNavigator.activityTitle}" สำเร็จแล้ว! (+${activeNavigator.activityXp || 10} XP)`
      );
    } else {
      checkInFacultyStamp(activeNavigator.facultyId);
      Alert.alert('🎉 ถึงจุดหมายแล้ว!', `คุณเดินทางถึง ${activeNavigator.facultyName} และรับ Stamp สำเร็จ!`);
    }
    clearNavigation();
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Turn-by-Turn Guidance Banner — Google Maps Style */}
      <View style={[styles.topBanner, { borderLeftColor: activeNavigator.color }]}>
        <View style={styles.stepIconBox}>
          <Text style={styles.stepIcon}>{currentStep.icon || '⬆️'}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.bannerTag}>NAVIGATOR • ขั้น {activeNavigator.currentStepIndex + 1}/{activeNavigator.steps.length}</Text>
            {currentStep.distance != null && (
              <Text style={styles.stepDistanceBadge}>
                {currentStep.distance < 1000
                  ? `${currentStep.distance} ม.`
                  : `${(currentStep.distance / 1000).toFixed(1)} กม.`}
              </Text>
            )}
          </View>
          <Text style={styles.instructionText}>{currentStep.instruction}</Text>
          {/* Next step preview */}
          {activeNavigator.steps[activeNavigator.currentStepIndex + 1] && (
            <Text style={styles.nextStepText} numberOfLines={1}>
              ต่อไป: {activeNavigator.steps[activeNavigator.currentStepIndex + 1].icon} {activeNavigator.steps[activeNavigator.currentStepIndex + 1].instruction}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom Route Status Card */}
      <View style={styles.bottomCard}>
        <View style={styles.targetHeaderRow}>
          <View style={[styles.targetBadge, { backgroundColor: activeNavigator.color }]}>
            <Text style={styles.targetBadgeText}>{activeNavigator.facultyName.slice(0, 4)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.targetTitle} numberOfLines={1}>
              {activeNavigator.facultyName}
            </Text>
            <Text style={styles.targetSub} numberOfLines={1}>
              📍 {activeNavigator.building} {activeNavigator.activityRoom ? `| ${activeNavigator.activityRoom}` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={clearNavigation}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {activeNavigator.activityTitle && (
          <View style={styles.activityHighlight}>
            <Text style={styles.actTagText}>
              🎯 กิจกรรม: {activeNavigator.activityTitle} (+{activeNavigator.activityXp || 10} XP)
            </Text>
          </View>
        )}

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>🚶 ระยะทางคงเหลือ</Text>
            <Text style={styles.metricValue}>
              {activeNavigator.totalDistance < 1000
                ? `${activeNavigator.totalDistance} m`
                : `${(activeNavigator.totalDistance / 1000).toFixed(1)} km`}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>⏱️ เวลาโดยประมาณ</Text>
            <Text style={styles.metricValue}>{activeNavigator.totalTimeMin} นาที</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>สถานะ</Text>
            <Text style={[styles.metricValue, activeNavigator.isArrived && { color: '#10B981' }]}>
              {activeNavigator.isArrived ? 'ถึงแล้ว! ✓' : 'กำลังนำทาง'}
            </Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.simBtn}
            onPress={() => {
              // Recalculate route from current GPS position
              const fac = {
                id: activeNavigator.facultyId,
                name: activeNavigator.facultyName,
                building: activeNavigator.building,
                color: activeNavigator.color,
                latitude: activeNavigator.latitude,
                longitude: activeNavigator.longitude,
                activities: [],
              };
              startNavigation(fac);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.simBtnText}>🔄 อัปเดตเส้นทาง</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.checkInNavBtn,
              activeNavigator.isArrived && styles.checkInNavBtnReady,
            ]}
            onPress={handleArrivalCheckIn}
            activeOpacity={0.85}
          >
            <Text style={styles.checkInNavBtnText}>
              {activeNavigator.isArrived ? '🎉 ถึงแล้ว! เช็คอิน' : '📍 ฉันถึงแล้ว!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    zIndex: 100,
    padding: 12,
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 14,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 8,
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 22,
  },
  bannerTag: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  stepCounter: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 8,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 18,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 60,
  },
  targetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  targetBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  targetSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  activityHighlight: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  actTagText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  simBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  simBtnActive: {
    backgroundColor: '#E0F2FE',
  },
  simBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  checkInNavBtn: {
    flex: 1,
    backgroundColor: '#F15A24',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  checkInNavBtnReady: {
    backgroundColor: '#10B981',
  },
  checkInNavBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDistanceBadge: {
    backgroundColor: '#F15A24',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextStepText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
