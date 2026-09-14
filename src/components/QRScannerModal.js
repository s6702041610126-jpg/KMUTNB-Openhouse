import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, Modal, TouchableOpacity,
  SafeAreaView, ScrollView, Animated, Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FACULTIES } from '../constants/faculties';
import { REWARDS } from '../constants/missions';
import { validateFacultyQR } from '../constants/staffCodes';
import { useApp } from '../context/AppContext';

export default function QRScannerModal({ visible, onClose }) {
  const {
    userProfile,
    checkInActivity,
    checkInFacultyStamp,
    confirmStaffAction,
    redeemedRewards,
    targetScanFacultyId,
    setTargetScanFacultyId,
  } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [staffScanData, setStaffScanData] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Animate the scan line
  useEffect(() => {
    if (visible && permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible, permission?.granted]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setScanned(false);
      setStaffScanData(null);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [visible]);

  // Success pop animation
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    Vibration.vibrate([0, 80, 60, 80]);
    Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 100 }).start();
  };

  const handleReset = () => {
    setScanned(false);
    setStaffScanData(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    successAnim.setValue(0);
    setTargetScanFacultyId(null); // Clear any navigation-enforced target
    onClose();
  };

  // ── Handle real camera scan result ───────────────────────────────────────
  const handleBarcodeScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(60);

    if (userProfile.role === 'staff') {
      // Staff mode: scan student reward QR (JSON token)
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'REWARD_TOKEN') {
          setStaffScanData({ type: 'REWARD_TOKEN', ...parsed });
          return;
        }
      } catch {}
      setErrorMessage('Invalid QR Code for Staff Scanner');
      return;
    }

    // Student mode: scan Faculty QR from Staff device
    const result = validateFacultyQR(data);
    if (result.valid) {
      // Check if we are enforcing a specific faculty (via Navigation)
      if (targetScanFacultyId && targetScanFacultyId !== result.facultyId) {
        const expectedFac = FACULTIES.find((f) => f.id === targetScanFacultyId);
        setErrorMessage(`Please scan the QR code for ${expectedFac?.nameEn || 'the correct faculty'}!`);
        setTimeout(() => { setScanned(false); setErrorMessage(null); }, 3000);
        return;
      }

      const fac = FACULTIES.find((f) => f.id === result.facultyId);
      if (fac) {
        checkInFacultyStamp(fac.id);
        // Also check-in first activity for XP
        if (fac.activities && fac.activities.length > 0) {
          checkInActivity(fac.id, fac.activities[0].id, fac.activities[0].xp);
        }
        showSuccess({
          icon: '🎉',
          title: 'Check-in Successful!',
          sub: fac.name,
          detail: `📍 ${fac.building}\n✨ +${fac.activities[0]?.xp || 10} XP & Stamp ✓`,
          color: fac.color,
        });
      } else {
        setErrorMessage('Faculty data not found');
      }
    } else {
      setErrorMessage(result.reason || 'Invalid QR Code');
      setTimeout(() => { setScanned(false); setErrorMessage(null); }, 2500);
    }
  };



  const handleStaffConfirm = () => {
    if (!staffScanData) return;
    const res = confirmStaffAction(staffScanData);
    if (res.success) {
      showSuccess({
        icon: '🟢',
        title: 'Confirmed by Staff successfully!',
        sub: res.message,
        detail: `Confirmed by: ${userProfile.name} (Staff)`,
        color: '#10B981',
      });
      setStaffScanData(null);
    }
  };

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 190],
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {userProfile.role === 'staff' ? '📱 Staff Scanner' : '📷 Scan QR Code Check-in'}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleReset}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* ── SUCCESS VIEW ── */}
            {successMessage ? (
              <Animated.View style={[styles.resultCard, { transform: [{ scale: successAnim }] }]}>
                <Text style={styles.successIcon}>{successMessage.icon}</Text>
                <Text style={[styles.successTitle, { color: successMessage.color || '#10B981' }]}>
                  {successMessage.title}
                </Text>
                <Text style={styles.successSub}>{successMessage.sub}</Text>
                <Text style={styles.successDetail}>{successMessage.detail}</Text>
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: successMessage.color || '#F15A24' }]} onPress={handleReset}>
                  <Text style={styles.confirmBtnText}>✓ OK / Close</Text>
                </TouchableOpacity>
              </Animated.View>

            ) : staffScanData ? (
              /* ── STAFF CONFIRM VIEW ── */
              <View style={styles.inspectCard}>
                <Text style={styles.inspectHeader}>📋 Scan Data</Text>
                <View style={styles.infoBox}>
                  {staffScanData.type === 'STUDENT_ACTIVITY' ? (
                    <>
                      <InfoRow label="👤 Student" value={staffScanData.studentName} />
                      <InfoRow label="🏫 Faculty" value={`${staffScanData.facultyName} (${staffScanData.facultyCode})`} />
                      <InfoRow label="🎮 Activity" value={staffScanData.activityTitle} />
                      <InfoRow label="📍 Location" value={staffScanData.room} />
                      <InfoRow label="✨ Reward" value={`+${staffScanData.xp} XP & Stamp`} highlight />
                    </>
                  ) : (
                    <>
                      <InfoRow label="🎁 Reward Item" value={staffScanData.rewardTitle} />
                      <InfoRow label="🔑 Token" value={staffScanData.token} highlight />
                      <InfoRow label="Status" value={staffScanData.status === 'redeemed' ? '🟢 Redeemed' : '🟡 Pending'} />
                    </>
                  )}
                </View>
                <TouchableOpacity style={styles.confirmStaffBtn} onPress={handleStaffConfirm}>
                  <Text style={styles.confirmStaffBtnText}>🟢 Confirm Instantly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setStaffScanData(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>

            ) : (
              /* ── SCANNER VIEW ── */
              <View style={styles.scannerBody}>

                {/* Real Camera Viewfinder */}
                {permission?.granted ? (
                  <View style={styles.cameraContainer}>
                    <CameraView
                      style={styles.camera}
                      facing="back"
                      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                      onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
                    />
                    {/* Scan line animation */}
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
                    {/* Corner brackets */}
                    <View style={[styles.corner, styles.cTL]} /><View style={[styles.corner, styles.cTR]} />
                    <View style={[styles.corner, styles.cBL]} /><View style={[styles.corner, styles.cBR]} />
                    <Text style={styles.cameraHint}>
                      {userProfile.role === 'staff' ? 'Scan Student QR Code' : 'Scan QR Code from Staff Booth'}
                    </Text>
                    {scanned && !successMessage && !errorMessage && (
                      <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
                        <Text style={styles.rescanBtnText}>🔄 Scan Again</Text>
                      </TouchableOpacity>
                    )}
                    {errorMessage && (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>❌ {errorMessage}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.permissionBox}>
                    <Text style={styles.permissionText}>Camera permission required</Text>
                    <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                      <Text style={styles.permissionBtnText}>Allow Camera Access</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// Helper component for info rows
function InfoRow({ label, value, highlight }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: '#D97706', fontWeight: '900' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.88)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: '#FFFFFF', borderRadius: 28, maxHeight: '92%', overflow: 'hidden' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  closeBtn: { padding: 6 },
  closeBtnText: { fontSize: 18, color: '#64748B', fontWeight: 'bold' },
  content: { padding: 20 },

  // ── Camera ─────────────────────────────────────────────────────────────────
  cameraContainer: {
    width: '100%', height: 240, borderRadius: 20, overflow: 'hidden',
    position: 'relative', backgroundColor: '#0F172A',
  },
  camera: { flex: 1 },
  scanLine: {
    position: 'absolute', left: 10, right: 10, height: 2,
    backgroundColor: '#F15A24', shadowColor: '#F15A24',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },
  cameraHint: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12,
  },
  rescanBtn: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: '#F15A24', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
  },
  rescanBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  errorBanner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(239,68,68,0.9)', padding: 10, alignItems: 'center',
  },
  errorBannerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  permissionBox: { alignItems: 'center', paddingVertical: 40 },
  permissionText: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  permissionBtn: { backgroundColor: '#F15A24', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  permissionBtnText: { color: '#FFFFFF', fontWeight: '800' },

  scannerBody: { alignItems: 'center' },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: '#F15A24' },
  cTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  cTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  cBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  cBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },


  // ── Inspect/Confirm card ───────────────────────────────────────────────────
  inspectCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  inspectHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  infoBox: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 12, color: '#1E293B', fontWeight: '700', flex: 1.5, textAlign: 'right' },
  confirmStaffBtn: {
    backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', marginTop: 16,
  },
  confirmStaffBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  cancelBtnText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  // ── Success card ───────────────────────────────────────────────────────────
  resultCard: { alignItems: 'center', paddingVertical: 12 },
  successIcon: { fontSize: 54 },
  successTitle: { fontSize: 22, fontWeight: '900', marginTop: 10 },
  successSub: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 4, textAlign: 'center' },
  successDetail: { fontSize: 13, color: '#64748B', marginTop: 8, textAlign: 'center', lineHeight: 20 },
  confirmBtn: {
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});
