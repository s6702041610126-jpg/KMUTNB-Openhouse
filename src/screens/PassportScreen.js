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

export default function PassportScreen() {
  const { visitedFaculties, completedActivities, setIsQRScannerOpen } = useApp();
  const [activeTab, setActiveTab] = useState('FACULTY'); // 'FACULTY' | 'ACTIVITY'

  const allActivities = FACULTIES.flatMap((f) =>
    f.activities.map((a) => ({ ...a, facultyName: f.name, facultyColor: f.color }))
  );

  const completedActList = allActivities.filter((a) => completedActivities.includes(a.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Switcher Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'FACULTY' && styles.tabBtnActive]}
          onPress={() => setActiveTab('FACULTY')}
        >
          <Text style={[styles.tabText, activeTab === 'FACULTY' && styles.tabTextActive]}>
            🏫 Faculty Passport ({visitedFaculties.length}/9)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ACTIVITY' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ACTIVITY')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVITY' && styles.tabTextActive]}>
            ☑️ Activity Passport ({completedActivities.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'FACULTY' ? (
          <View>
            {/* Stamp Progress Banner */}
            <View style={styles.stampBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stampBannerTag}>MAP EXPLORER COLLECTION</Text>
                <Text style={styles.stampBannerTitle}>
                  Collected {visitedFaculties.length} / 9 Faculty Stamps
                </Text>
                <Text style={styles.stampBannerSub}>
                  {visitedFaculties.length === 9
                    ? '🎉 Amazing! You collected all faculty stamps!'
                    : `${9 - visitedFaculties.length} more faculties to earn a KMUTNB Special Souvenir!`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.bannerScanBtn}
                onPress={() => setIsQRScannerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.bannerScanBtnText}>Scan for Stamp 📷</Text>
              </TouchableOpacity>
            </View>

            {/* 9 Faculty Stamp Grid */}
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
                        styles.stampCircle,
                        isVisited ? { backgroundColor: fac.color } : styles.stampCircleLocked,
                      ]}
                    >
                      <Text style={styles.stampIcon}>{isVisited ? fac.badgeIcon : '🔒'}</Text>
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
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>☑️ Activity History ({completedActList.length})</Text>

            {completedActList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🎯</Text>
                <Text style={styles.emptyTitle}>No activities completed yet</Text>
                <Text style={styles.emptySub}>Go to a faculty on the map and scan a QR code to get started!</Text>
              </View>
            ) : (
              completedActList.map((act) => (
                <View key={act.id} style={styles.actCard}>
                  <View style={[styles.actColorBar, { backgroundColor: act.facultyColor }]} />
                  <View style={{ flex: 1, padding: 12 }}>
                    <Text style={styles.actFacultyName}>{act.facultyName}</Text>
                    <Text style={styles.actTitle}>{act.title}</Text>
                    <Text style={styles.actRoom}>📍 {act.room}</Text>
                  </View>
                  <View style={styles.actXpBadge}>
                    <Text style={styles.actXpText}>+{act.xp} XP</Text>
                  </View>
                </View>
              ))
            )}
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
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    margin: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#F15A24',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stampBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stampBannerTag: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  stampBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  stampBannerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  bannerScanBtn: {
    backgroundColor: '#F15A24',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  bannerScanBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
  stampCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  stampCircleLocked: {
    backgroundColor: '#CBD5E1',
  },
  stampIcon: {
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
  actCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  actColorBar: {
    width: 6,
    height: '100%',
  },
  actFacultyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F15A24',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  actRoom: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actXpBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  actXpText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
