import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useApp, getDistanceMeters } from '../context/AppContext';

export default function FacultyDetailModal({ faculty, visible, onClose }) {
  const {
    userLocation,
    startNavigation,
    completedActivities,
    visitedFaculties,
  } = useApp();

  if (!faculty) return null;

  const distanceMeters = getDistanceMeters(
    userLocation.latitude,
    userLocation.longitude,
    faculty.latitude,
    faculty.longitude
  );

  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 75));
  const isVisited = visitedFaculties.includes(faculty.id);

  const handleStartNav = (activity = null) => {
    startNavigation(faculty, activity);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: faculty.color }]}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.badgeIcon}>{faculty.badgeIcon}</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.facultyCode}>{faculty.code}</Text>
                <Text style={styles.facultyName} numberOfLines={1}>
                  {faculty.nameEn}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Metrics Bar */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>📍 Building</Text>
                <Text style={styles.metricValue}>{faculty.building}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>🚶 Distance</Text>
                <Text style={styles.metricValue}>{distanceMeters} m</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>⏱️ Walk Time</Text>
                <Text style={styles.metricValue}>{walkingMinutes} min</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Embedded Official Map Preview */}
            <View style={styles.mapCard}>
              <Text style={styles.sectionTitle}>📍 Faculty Building Map</Text>
              <View style={styles.webviewWrapper}>
                <WebView
                  originWhitelist={['*']}
                  source={{ 
                    html: `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                          <style>
                            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                            iframe { border: none; width: 100%; height: 100%; }
                          </style>
                        </head>
                        <body>
                          <iframe src="${faculty.embedUrl}" allowfullscreen></iframe>
                        </body>
                      </html>
                    ` 
                  }}
                  style={styles.mapWebview}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scrollEnabled={false}
                />
              </View>
            </View>

            {/* Faculty Description */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>ℹ️ About This Faculty</Text>
              <Text style={styles.descriptionText}>{faculty.description}</Text>

              <Text style={[styles.sectionTitle, { marginTop: 14 }]}>🎯 Highlights</Text>
              <View style={styles.tagContainer}>
                {faculty.highlights.map((item, idx) => (
                  <View key={idx} style={[styles.tagPill, { backgroundColor: faculty.color + '20' }]}>
                    <Text style={[styles.tagText, { color: faculty.color }]}>✨ {item}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 14 }]}>👥 Career Paths</Text>
              <View style={styles.tagContainer}>
                {faculty.careers.map((career, idx) => (
                  <View key={idx} style={styles.careerPill}>
                    <Text style={styles.careerText}>🎓 {career}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Activities List */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>🎮 XP Activities ({faculty.activities.length})</Text>
                {isVisited && (
                  <View style={styles.visitedBadge}>
                    <Text style={styles.visitedBadgeText}>✓ Stamp Collected</Text>
                  </View>
                )}
              </View>

              {faculty.activities.map((act) => {
                const isDone = completedActivities.includes(act.id);
                return (
                  <View key={act.id} style={[styles.actItem, isDone && styles.actItemDone]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.actTitle}>{act.title}</Text>
                        <View style={styles.xpTag}>
                          <Text style={styles.xpTagText}>+{act.xp} XP</Text>
                        </View>
                      </View>
                      <Text style={styles.actRoom}>📍 {act.room}</Text>

                      <View style={styles.actMetricsRow}>
                        <Text style={styles.actMetricText}>🚶 {distanceMeters} m</Text>
                        <Text style={styles.actMetricText}>⏱️ {walkingMinutes} min</Text>
                      </View>
                    </View>

                    {isDone ? (
                      <View style={styles.doneTag}>
                        <Text style={styles.doneTagText}>Done ✓</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.navActBtn, { backgroundColor: faculty.color }]}
                        onPress={() => handleStartNav(act)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.navActBtnText}>Navigate 🚶</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.mainNavBtn, { backgroundColor: faculty.color }]}
              onPress={() => handleStartNav(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.mainNavBtnText}>🧭 Navigate to {faculty.code}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '88%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
  },
  facultyCode: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  facultyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  webviewWrapper: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
  },
  mapWebview: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  careerPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  careerText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  visitedBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  actItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  xpTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  xpTagText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  actRoom: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  actMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actMetricText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  doneTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  doneTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  navActBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navActBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footerContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mainNavBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mainNavBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
