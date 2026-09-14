import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import RegistrationModal from '../components/RegistrationModal';
import CertificateModal from '../components/CertificateModal';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const {
    userProfile,
    selectedAvatar,
    earnedXP,
    visitedFaculties,
    completedActivities,
    toggleStaffMode,
    setIsQRScannerOpen,
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatarCircle, { backgroundColor: selectedAvatar.bgColor, borderColor: selectedAvatar.color }]}>
            <Text style={styles.avatarIcon}>{selectedAvatar.icon}</Text>
          </View>

          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userSchool}>🏫 {userProfile.school}</Text>


          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditModalOpen(true)}>
            <Text style={styles.editBtnText}>Edit Profile / Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{earnedXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{visitedFaculties.length}/9</Text>
            <Text style={styles.statLabel}>Faculty Stamps</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedActivities.length}</Text>
            <Text style={styles.statLabel}>Activities Done</Text>
          </View>
        </View>

        {/* Action List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Menu & Settings</Text>

          {/* Certificate Action */}
          <TouchableOpacity style={styles.menuRow} onPress={() => setIsCertModalOpen(true)}>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text style={styles.menuTitle}>KMUTNB Open House Certificate</Text>
              <Text style={styles.menuSub}>View and download your participation certificate</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>


        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Edit Registration Modal */}
      <RegistrationModal visible={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

      {/* Certificate Modal */}
      <CertificateModal visible={isCertModalOpen} onClose={() => setIsCertModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatarIcon: {
    fontSize: 44,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
  },
  userSchool: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 14,
  },
  editBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F15A24',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  menuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
});
