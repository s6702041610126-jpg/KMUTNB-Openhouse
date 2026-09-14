import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function CertificateModal({ visible, onClose }) {
  const { userProfile, completedActivities, visitedFaculties, earnedXP } = useApp();

  const isEligible = completedActivities.length >= 3;

  const handleDownload = () => {
    Alert.alert('🎉 สำเร็จ!', 'ดาวน์โหลดเกียรติบัตร KMUTNB Open House (PDF) เรียบร้อยแล้ว!');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📜 เกียรติบัตรเข้าร่วมกิจกรรม</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isEligible ? (
              <View style={styles.certFrame}>
                {/* Decorative Borders */}
                <View style={styles.innerBorder}>
                  <Text style={styles.kmutnbLogo}>🎓</Text>
                  <Text style={styles.certTitle}>CERTIFICATE OF PARTICIPATION</Text>
                  <Text style={styles.certSubTitle}>เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า</Text>

                  <Text style={styles.userName}>{userProfile.name}</Text>
                  <Text style={styles.userSchool}>{userProfile.school}</Text>

                  <Text style={styles.certDescription}>
                    ได้เข้าร่วมกิจกรรมและพิชิตภารกิจในงาน KMUTNB OPEN HOUSE 2026{'\n'}
                    สะสมกิจกรรมรวม {completedActivities.length} กิจกรรม | {visitedFaculties.length} คณะ ({earnedXP} XP)
                  </Text>

                  {/* Stamp Badge */}
                  <View style={styles.badgeSeal}>
                    <Text style={styles.badgeSealText}>KMUTNB OFFICIAL SEAL</Text>
                    <Text style={styles.badgeSealIcon}>⭐ 2026 ⭐</Text>
                  </View>

                  <View style={styles.issueRow}>
                    <View style={styles.issueCol}>
                      <Text style={styles.signLine}>___________________</Text>
                      <Text style={styles.signTitle}>ประธานจัดงาน Open House</Text>
                    </View>
                    <View style={styles.issueCol}>
                      <Text style={styles.signLine}>___________________</Text>
                      <Text style={styles.signTitle}>คณบดี/ผู้อำนวยการ</Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.lockedCard}>
                <Text style={styles.lockedIcon}>🔒</Text>
                <Text style={styles.lockedTitle}>ยังไม่ผ่านเงื่อนไขรับเกียรติบัตร</Text>
                <Text style={styles.lockedSub}>
                  ต้องเข้าร่วมกิจกรรมอย่างน้อย 3 กิจกรรม{'\n'}
                  (ปัจจุบันทำได้ {completedActivities.length}/3 กิจกรรม)
                </Text>
              </View>
            )}
          </ScrollView>

          {isEligible && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
                <Text style={styles.downloadBtnText}>📥 ดาวน์โหลด PDF เกียรติบัตร</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  certFrame: {
    backgroundColor: '#FFFDF5',
    borderRadius: 16,
    padding: 8,
    borderWidth: 4,
    borderColor: '#D97706',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  innerBorder: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
  },
  kmutnbLogo: {
    fontSize: 42,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 8,
    letterSpacing: 1,
  },
  certSubTitle: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 14,
    textAlign: 'center',
  },
  userSchool: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  certDescription: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
  badgeSeal: {
    backgroundColor: '#F59E0B',
    borderRadius: 50,
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  badgeSealText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  badgeSealIcon: {
    fontSize: 10,
    marginTop: 2,
    color: '#FFFFFF',
  },
  issueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  issueCol: {
    alignItems: 'center',
  },
  signLine: {
    color: '#94A3B8',
    fontSize: 12,
  },
  signTitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  lockedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 48,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 12,
  },
  lockedSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  downloadBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
