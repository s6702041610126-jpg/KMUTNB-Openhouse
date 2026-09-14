import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, Alert, Animated,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FACULTIES } from '../constants/faculties';
import { STAFF_CODES, generateFacultyQRPayload } from '../constants/staffCodes';
import { useApp } from '../context/AppContext';

export default function StaffScreen() {
  const { staffSession, setStaffSession } = useApp();
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qrPayload, setQrPayload] = useState(null);
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Refresh QR payload ทุก 60 วินาที (rotate ts)
  useEffect(() => {
    if (!staffSession) return;
    const update = () => {
      setQrPayload(generateFacultyQRPayload(staffSession.facultyId, staffSession.facultyCode));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [staffSession]);

  // Fade in QR when session starts
  useEffect(() => {
    if (staffSession) {
      Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [staffSession]);

  const selectedFaculty = FACULTIES.find((f) => f.id === selectedFacultyId);

  const handleLogin = () => {
    if (!selectedFacultyId) {
      setErrorMsg('Please select your faculty first');
      return;
    }
    const correctCode = STAFF_CODES[selectedFacultyId];
    if (inputCode.trim().toUpperCase() === correctCode.toUpperCase()) {
      setErrorMsg('');
      setStaffSession({
        facultyId: selectedFacultyId,
        facultyCode: selectedFaculty.code,
        facultyName: selectedFaculty.nameEn,
        facultyColor: selectedFaculty.color,
        facultyBadge: selectedFaculty.badgeIcon,
      });
    } else {
      setErrorMsg('❌ Incorrect staff code. Please try again.');
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      setInputCode('');
    }
  };

  const handleLogout = () => {
    Alert.alert('Staff Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          setStaffSession(null);
          setInputCode('');
          setSelectedFacultyId('');
          setErrorMsg('');
        },
      },
    ]);
  };

  // ── STAFF DASHBOARD (after login) ─────────────────────────────────────────
  if (staffSession && qrPayload) {
    const fac = FACULTIES.find((f) => f.id === staffSession.facultyId);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.dashboardHeader, { backgroundColor: staffSession.facultyColor }]}>
          <Text style={styles.dashBadge}>{staffSession.facultyBadge}</Text>
          <Text style={styles.dashFacultyName}>{staffSession.facultyName}</Text>
          <Text style={styles.dashSubtitle}>Staff Dashboard — Open House 2026</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Staff Logout</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Display */}
        <Animated.View style={[styles.qrCard, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
          <Text style={styles.qrTitle}>📲 Faculty QR Code</Text>
          <Text style={styles.qrSubtitle}>Let visitors scan to receive Stamp + XP</Text>

          <View style={[styles.qrWrapper, { borderColor: staffSession.facultyColor }]}>
            <QRCode
              value={qrPayload}
              size={220}
              backgroundColor="#FFFFFF"
              color="#1E293B"
              logoSize={40}
              logoBackgroundColor="white"
            />
            {/* Corner decorations */}
            <View style={[styles.qrCorner, styles.qrTL, { borderColor: staffSession.facultyColor }]} />
            <View style={[styles.qrCorner, styles.qrTR, { borderColor: staffSession.facultyColor }]} />
            <View style={[styles.qrCorner, styles.qrBL, { borderColor: staffSession.facultyColor }]} />
            <View style={[styles.qrCorner, styles.qrBR, { borderColor: staffSession.facultyColor }]} />
          </View>

          <View style={[styles.facultyBadgePill, { backgroundColor: staffSession.facultyColor + '22', borderColor: staffSession.facultyColor }]}>
            <Text style={[styles.facultyBadgePillText, { color: staffSession.facultyColor }]}>
              {staffSession.facultyBadge} {staffSession.facultyCode} — {staffSession.facultyName}
            </Text>
          </View>

          <Text style={styles.qrNote}>⏱️ QR Code refreshes every minute for security</Text>
        </Animated.View>

        {/* Activity list */}
        {fac && (
          <View style={styles.activitiesCard}>
            <Text style={styles.activitiesTitle}>🎯 Activities available for check-in</Text>
            {fac.activities.map((act) => (
              <View key={act.id} style={styles.activityRow}>
                <View style={[styles.xpBadge, { backgroundColor: staffSession.facultyColor }]}>
                  <Text style={styles.xpBadgeText}>+{act.xp}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actRoom}>📍 {act.room}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📋 How to Use</Text>
          <Text style={styles.instructionStep}>1️⃣  Show this screen to visitors at the booth</Text>
          <Text style={styles.instructionStep}>2️⃣  Visitor opens the app and taps 📷 "Scan QR"</Text>
          <Text style={styles.instructionStep}>3️⃣  Visitor points camera at the QR Code above</Text>
          <Text style={styles.instructionStep}>4️⃣  System verifies visit and awards Stamp + XP instantly</Text>
        </View>
      </ScrollView>
    );
  }

  // ── LOGIN FORM ─────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.loginContent} keyboardShouldPersistTaps="handled">
      {/* Hero */}
      <View style={styles.loginHero}>
        <Text style={styles.loginHeroEmoji}>👔</Text>
        <Text style={styles.loginHeroTitle}>Staff Portal</Text>
        <Text style={styles.loginHeroSub}>Login with your Faculty Staff Code{'\n'}to display the QR Code for visitors to scan</Text>
      </View>

      {/* Login Card */}
      <Animated.View style={[styles.loginCard, { transform: [{ translateX: shakeAnim }] }]}>
        {/* Faculty Picker */}
        <Text style={styles.fieldLabel}>Select your faculty</Text>
        <TouchableOpacity
          style={[styles.facultyPickerBtn, selectedFaculty && { borderColor: selectedFaculty.color }]}
          onPress={() => setShowFacultyPicker(!showFacultyPicker)}
          activeOpacity={0.8}
        >
          <Text style={[styles.facultyPickerText, !selectedFaculty && { color: '#94A3B8' }]}>
            {selectedFaculty ? `${selectedFaculty.badgeIcon} ${selectedFaculty.nameEn}` : 'Tap to select faculty...'}
          </Text>
          <Text style={styles.pickerArrow}>{showFacultyPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showFacultyPicker && (
          <View style={styles.facultyDropdown}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 280 }}>
              {FACULTIES.map((fac) => (
                <TouchableOpacity
                  key={fac.id}
                  style={[styles.dropdownItem, selectedFacultyId === fac.id && { backgroundColor: fac.color + '22' }]}
                  onPress={() => {
                    setSelectedFacultyId(fac.id);
                    setShowFacultyPicker(false);
                    setErrorMsg('');
                  }}
                >
                  <Text style={styles.dropdownIcon}>{fac.badgeIcon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dropdownName, selectedFacultyId === fac.id && { color: fac.color }]}>{fac.nameEn}</Text>
                    <Text style={styles.dropdownCode}>{fac.code} — {fac.building}</Text>
                  </View>
                  {selectedFacultyId === fac.id && (
                    <View style={[styles.checkDot, { backgroundColor: fac.color }]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Staff Code Input */}
        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Staff Code</Text>
        <TextInput
          style={[styles.codeInput, selectedFaculty && { borderColor: selectedFaculty.color }]}
          value={inputCode}
          onChangeText={(t) => { setInputCode(t); setErrorMsg(''); }}
          placeholder="Enter Staff Code e.g. FTE2024"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          autoCorrect={false}
          secureTextEntry={true}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity
          style={[styles.loginBtn, !selectedFacultyId && styles.loginBtnDisabled, selectedFaculty && { backgroundColor: selectedFaculty.color }]}
          onPress={handleLogin}
          disabled={!selectedFacultyId}
          activeOpacity={0.85}
        >
          <Text style={styles.loginBtnText}>🔐 Staff Login</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ For staff and senior students at booths</Text>
        <Text style={styles.infoText}>
          Staff Codes will be provided on the event day by the KMUTNB team.{'\n'}
          Visitors scanning this QR Code will automatically receive a faculty stamp and XP.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Login ──────────────────────────────────────────────────────────────────
  loginContent: { padding: 20, paddingBottom: 40 },
  loginHero: { alignItems: 'center', paddingVertical: 32 },
  loginHeroEmoji: { fontSize: 56 },
  loginHeroTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B', marginTop: 8 },
  loginHeroSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  loginCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  facultyPickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#F8FAFC',
  },
  facultyPickerText: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1 },
  pickerArrow: { fontSize: 12, color: '#64748B', marginLeft: 8 },
  facultyDropdown: {
    marginTop: 4, borderRadius: 16, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  dropdownIcon: { fontSize: 20, marginRight: 10 },
  dropdownName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  dropdownCode: { fontSize: 11, color: '#64748B', marginTop: 2 },
  checkDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  codeInput: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontWeight: '700', color: '#1E293B',
    backgroundColor: '#F8FAFC', letterSpacing: 2,
  },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '600', marginTop: 8 },
  loginBtn: {
    backgroundColor: '#F15A24', paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', marginTop: 20,
    shadowColor: '#F15A24', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  loginBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  infoBox: {
    backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF', marginBottom: 6 },
  infoText: { fontSize: 12, color: '#3B82F6', lineHeight: 18 },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboardContent: { paddingBottom: 40 },
  dashboardHeader: {
    paddingTop: 32, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  dashBadge: { fontSize: 48 },
  dashFacultyName: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
  dashSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  logoutBtn: {
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  logoutBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  qrCard: {
    margin: 20, backgroundColor: '#FFFFFF', borderRadius: 28,
    padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 10,
  },
  qrTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  qrSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' },
  qrWrapper: {
    marginTop: 20, padding: 16, borderRadius: 20,
    borderWidth: 3, backgroundColor: '#FFFFFF', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  qrCorner: { position: 'absolute', width: 20, height: 20, borderWidth: 3 },
  qrTL: { top: -1, left: -1, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  qrTR: { top: -1, right: -1, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  qrBL: { bottom: -1, left: -1, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  qrBR: { bottom: -1, right: -1, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  facultyBadgePill: {
    marginTop: 16, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  facultyBadgePillText: { fontSize: 13, fontWeight: '800' },
  qrNote: { fontSize: 11, color: '#94A3B8', marginTop: 12 },

  activitiesCard: {
    marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  activitiesTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 14 },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  xpBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, minWidth: 36, alignItems: 'center' },
  xpBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  actTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  actRoom: { fontSize: 11, color: '#64748B', marginTop: 2 },

  instructionCard: {
    margin: 20, marginTop: 16, backgroundColor: '#F0FDF4', borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: '#BBF7D0',
  },
  instructionTitle: { fontSize: 14, fontWeight: '800', color: '#15803D', marginBottom: 12 },
  instructionStep: { fontSize: 13, color: '#166534', marginBottom: 8, lineHeight: 20 },
});
