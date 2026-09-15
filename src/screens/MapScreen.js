import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import InAppMapView from '../components/InAppMapView';
import FacultyDetailModal from '../components/FacultyDetailModal';
import TurnByTurnNavigator from '../components/TurnByTurnNavigator';
import { FACULTIES } from '../constants/faculties';
import { useApp } from '../context/AppContext';

export default function MapScreen() {
  const {
    activeNavigator,
    visitedFaculties,
    selectedAvatar,
    setIsQRScannerOpen,
    startNavigation,
  } = useApp();

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredFaculties = FACULTIES.filter((fac) => {
    if (activeFilter === 'VISITED') return visitedFaculties.includes(fac.id);
    if (activeFilter === 'LOCKED') return !visitedFaculties.includes(fac.id);
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Header - Hidden during active navigation to reduce clutter */}
      {!activeNavigator && (
        <View style={styles.topHeader}>
          <View style={styles.avatarHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIconText}>{selectedAvatar.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>KMUTNB Live Navigator</Text>
              <Text style={styles.headerSub}>
                Stamps collected: <Text style={styles.boldText}>{visitedFaculties.length}/9 Faculties</Text>
              </Text>
            </View>
          </View>

          {/* Quick Filter Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterPill, activeFilter === 'ALL' && styles.filterPillActive]}
              onPress={() => setActiveFilter('ALL')}
            >
              <Text style={[styles.filterText, activeFilter === 'ALL' && styles.filterTextActive]}>
                All ({FACULTIES.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, activeFilter === 'VISITED' && styles.filterPillActive]}
              onPress={() => setActiveFilter('VISITED')}
            >
              <Text style={[styles.filterText, activeFilter === 'VISITED' && styles.filterTextActive]}>
                ✓ Visited ({visitedFaculties.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, activeFilter === 'LOCKED' && styles.filterPillActive]}
              onPress={() => setActiveFilter('LOCKED')}
            >
              <Text style={[styles.filterText, activeFilter === 'LOCKED' && styles.filterTextActive]}>
                🔒 Not Visited ({FACULTIES.length - visitedFaculties.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Main WebView Leaflet Map Engine */}
      <View style={styles.mapWrapper}>
        <InAppMapView onSelectFaculty={(fac) => setSelectedFaculty(fac)} />
      </View>

      {/* Turn-by-Turn Navigator Active Overlay */}
      {activeNavigator && <TurnByTurnNavigator />}



      {/* Detail Modal */}
      <FacultyDetailModal
        faculty={selectedFaculty}
        visible={!!selectedFaculty}
        onClose={() => setSelectedFaculty(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  avatarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F15A24',
  },
  avatarIconText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#F15A24',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F15A24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  scanBtnIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterScroll: {
    marginTop: 10,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#F15A24',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  mapWrapper: {
    flex: 1,
  },
  facultyBar: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  facultyScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  facultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 140,
    position: 'relative',
  },
  facultyChipVisited: {
    backgroundColor: '#F0FDF4',
  },
  chipMainArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 6,
  },
  chipCheck: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    width: 16,
    height: 16,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
    zIndex: 5,
  },
  chipIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  chipCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  chipName: {
    fontSize: 10,
    color: '#64748B',
    maxWidth: 80,
  },
  quickNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  quickNavBtnText: {
    fontSize: 14,
  },
});
