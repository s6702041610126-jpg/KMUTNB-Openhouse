import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { FACULTIES } from '../constants/faculties';
import { useApp } from '../context/AppContext';

export default function MissionsScreen() {
  const { visitedFaculties, completedActivities, setIsQRScannerOpen, setTargetScanFacultyId, setTargetScanActivityId } = useApp();
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  const handleScanQR = (facultyId, activityId) => {
    setTargetScanFacultyId(facultyId);
    setTargetScanActivityId(activityId);
    setIsQRScannerOpen(true);
  };

  const toggleExpand = (facultyId) => {
    setExpandedFaculty(prev => prev === facultyId ? null : facultyId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Stamp Collection Banner */}
        <View style={styles.stampBanner}>
          <Text style={styles.stampBannerTag}>MAP EXPLORER COLLECTION</Text>
          <Text style={styles.stampBannerTitle}>
            {visitedFaculties.length} / 9 Faculties Visited
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(visitedFaculties.length / 9) * 100}%` }]} />
          </View>
        </View>

        {/* 3×3 Faculty Stamp Grid */}
        <Text style={styles.sectionTitle}>🗺️ Faculty Stamps Collection</Text>
        <View style={styles.stampGrid}>
          {FACULTIES.map((fac, idx) => {
            const isVisited = visitedFaculties.includes(fac.id);
            return (
              <View
                key={fac.id}
                style={[
                  styles.stampCell,
                  isVisited ? { borderColor: fac.color, backgroundColor: '#fff' } : styles.stampCellLocked,
                ]}
              >
                <Text style={styles.stampCellNum}>{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</Text>
                <View style={[
                  styles.stampCellCircle,
                  isVisited ? { backgroundColor: fac.color } : styles.stampCellCircleLocked,
                ]}>
                  <Text style={styles.stampCellIcon}>{isVisited ? fac.badgeIcon : '🔒'}</Text>
                </View>
                <Text style={styles.stampCellCode}>{fac.code}</Text>
                {isVisited && <Text style={styles.stampCellDone}>✓</Text>}
              </View>
            );
          })}
        </View>

        {/* Faculty Missions List */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>🏫 Faculty Activities & Missions</Text>
        {FACULTIES.map((fac) => {
          const isStampClaimed = visitedFaculties.includes(fac.id);
          const isExpanded = expandedFaculty === fac.id;

          const doneActivities = fac.activities.filter(a =>
            completedActivities.some(ca => ca.activityId === a.id)
          );

          return (
            <View key={fac.id} style={[styles.missionCard, isStampClaimed && styles.missionCardDone]}>
              {/* Faculty Header Row — tap to expand */}
              <TouchableOpacity
                style={styles.missionHeaderRow}
                onPress={() => toggleExpand(fac.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.facIconCircle,
                  isStampClaimed ? { backgroundColor: fac.color } : styles.facIconCircleLocked,
                ]}>
                  <Text style={styles.facIcon}>{isStampClaimed ? fac.badgeIcon : '🔒'}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.facName}>{fac.nameEn}</Text>
                  <Text style={styles.facBuilding}>📍 {fac.building}</Text>
                  <Text style={styles.facProgress}>
                    {doneActivities.length}/{fac.activities.length} activities completed
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {isStampClaimed && (
                    <View style={styles.stampedBadge}>
                      <Text style={styles.stampedBadgeText}>✓ Stamped</Text>
                    </View>
                  )}
                  <Text style={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded Activity List */}
              {isExpanded && (
                <View style={styles.activitiesContainer}>
                  <View style={styles.divider} />
                  {fac.activities.map((act) => {
                    const isDone = completedActivities.some(ca => ca.activityId === act.id);
                    return (
                      <View key={act.id} style={[
                        styles.activityRow,
                        isDone && styles.activityRowDone,
                      ]}>
                        <View style={styles.activityLeft}>
                          <View style={styles.activityCategoryTag}>
                            <Text style={styles.activityCategoryText}>{act.category}</Text>
                          </View>
                          <Text style={styles.activityTitle}>{act.title}</Text>
                          <Text style={styles.activityRoom}>📍 {act.room}</Text>
                          <Text style={styles.activityXP}>✨ +{act.xp} XP</Text>
                        </View>

                        {isDone ? (
                          <View style={styles.doneTag}>
                            <Text style={styles.doneTagText}>Done ✓</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.scanBtn, { backgroundColor: fac.color }]}
                            onPress={() => handleScanQR(fac.id, act.id)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.scanBtnIcon}>📷</Text>
                            <Text style={styles.scanBtnText}>Scan QR</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL_SIZE = '30%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // ── Banner ────────────────────────────────────────────────────────────────
  stampBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    marginBottom: 18,
  },
  stampBannerTag: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stampBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 10,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },

  // ── Section Title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },

  // ── 3×3 Stamp Grid ────────────────────────────────────────────────────────
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  stampCell: {
    width: CELL_SIZE,
    aspectRatio: 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  stampCellLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  stampCellNum: {
    position: 'absolute',
    top: 6,
    left: 8,
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  stampCellCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampCellCircleLocked: {
    backgroundColor: '#CBD5E1',
  },
  stampCellIcon: {
    fontSize: 20,
  },
  stampCellCode: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    marginTop: 6,
  },
  stampCellDone: {
    position: 'absolute',
    top: 5,
    right: 7,
    fontSize: 11,
    color: '#10B981',
    fontWeight: '900',
  },

  // ── Mission Card ──────────────────────────────────────────────────────────
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  missionCardDone: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  missionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  facIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facIconCircleLocked: {
    backgroundColor: '#E2E8F0',
  },
  facIcon: {
    fontSize: 22,
  },
  facName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  facBuilding: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  facProgress: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  stampedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stampedBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  expandArrow: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },

  // ── Activity Rows ─────────────────────────────────────────────────────────
  activitiesContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  activityLeft: {
    flex: 1,
    marginRight: 10,
  },
  activityCategoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 5,
  },
  activityCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 17,
  },
  activityRoom: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  activityXP: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
    marginTop: 2,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 4,
    minWidth: 76,
    justifyContent: 'center',
  },
  scanBtnIcon: {
    fontSize: 14,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  doneTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    minWidth: 76,
    alignItems: 'center',
  },
  doneTagText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  activityRowLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.7,
  },
  lockedTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    minWidth: 76,
    alignItems: 'center',
  },
  lockedTagText: {
    fontSize: 18,
  },
});
