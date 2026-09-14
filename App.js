import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import MapScreen from './src/screens/MapScreen';
import MissionsScreen from './src/screens/MissionsScreen';
import PassportScreen from './src/screens/PassportScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StaffScreen from './src/screens/StaffScreen';
import RegistrationModal from './src/components/RegistrationModal';
import QRScannerModal from './src/components/QRScannerModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState('map');
  const { userProfile, isQRScannerOpen, setIsQRScannerOpen, visitedFaculties, earnedXP } = useApp();
  const [isFirstLaunchModal, setIsFirstLaunchModal] = useState(!userProfile.isRegistered);

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={styles.topNav}>
        <Text style={styles.brandTitle}>KMUTNB OPEN HOUSE 2026</Text>
        <View style={styles.topRightRow}>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>
              {userProfile.role === 'staff' ? '👔 STAFF' : '🎓 STUDENT'}
            </Text>
          </View>
          <View style={styles.xpChip}>
            <Text style={styles.xpChipText}>✨ {earnedXP} XP</Text>
          </View>
        </View>
      </View>

      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {activeTab === 'map'      && <MapScreen />}
        {activeTab === 'missions' && <MissionsScreen />}
        {activeTab === 'passport' && <PassportScreen />}
        {activeTab === 'reward'   && <RewardsScreen />}
        {activeTab === 'profile'  && <ProfileScreen />}
        {activeTab === 'staff'    && <StaffScreen />}
      </View>

      {/* 5-Menu Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('map')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'map' && styles.navIconActive]}>🗺️</Text>
          <Text style={[styles.navLabel, activeTab === 'map' && styles.navLabelActive]}>Map</Text>
          {activeTab === 'map' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('missions')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'missions' && styles.navIconActive]}>🎯</Text>
          <Text style={[styles.navLabel, activeTab === 'missions' && styles.navLabelActive]}>
            Missions
          </Text>
          {activeTab === 'missions' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('passport')}
          activeOpacity={0.8}
        >
          <View style={{ position: 'relative' }}>
            <Text style={[styles.navIcon, activeTab === 'passport' && styles.navIconActive]}>🎫</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{visitedFaculties.length}</Text>
            </View>
          </View>
          <Text style={[styles.navLabel, activeTab === 'passport' && styles.navLabelActive]}>
            Passport
          </Text>
          {activeTab === 'passport' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('reward')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'reward' && styles.navIconActive]}>🏆</Text>
          <Text style={[styles.navLabel, activeTab === 'reward' && styles.navLabelActive]}>
            Reward
          </Text>
          {activeTab === 'reward' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
            Profile
          </Text>
          {activeTab === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('staff')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'staff' && styles.navIconActive]}>👔</Text>
          <Text style={[styles.navLabel, activeTab === 'staff' && styles.navLabelActive]}>
            Staff
          </Text>
          {activeTab === 'staff' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      {/* Global QR Scanner Modal */}
      <QRScannerModal visible={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />

      {/* First time registration modal */}
      <RegistrationModal visible={isFirstLaunchModal} onClose={() => setIsFirstLaunchModal(false)} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    height: 52,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F15A24',
    letterSpacing: 0.5,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  xpChip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  xpChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  bottomBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#F15A24',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F15A24',
    marginTop: 2,
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#F15A24',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
