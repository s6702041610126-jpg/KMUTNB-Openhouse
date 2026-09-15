import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AVATARS } from '../constants/avatars';
import { useApp } from '../context/AppContext';

export default function RegistrationModal({ visible, onClose }) {
  const { userProfile, registerUser } = useApp();
  const [name, setName] = useState(userProfile.name || '');
  const [school, setSchool] = useState(userProfile.school || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(userProfile.avatarId || 'male');

  const handleSubmit = () => {
    registerUser(name, school, selectedAvatarId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Logo / Header Banner */}
            <View style={styles.headerBanner}>
              <Text style={styles.headerIcon}>🎓</Text>
              <Text style={styles.headerTitle}>KMUTNB OPEN HOUSE</Text>
              <Text style={styles.headerSubtitle}>
                Fill in your info and choose your avatar to begin!
              </Text>
            </View>

            {/* Input Form */}
            <View style={styles.card}>
              <Text style={styles.label}>👤 Name / Nickname</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Thanpitcha"
                placeholderTextColor="#94A3B8"
              />

              <Text style={[styles.label, { marginTop: 14 }]}>🏫 School / Institution</Text>
              <TextInput
                style={styles.input}
                value={school}
                onChangeText={setSchool}
                placeholder="e.g. KMUTNB Demonstration School"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Gender Selector */}
            <Text style={styles.sectionHeader}>Choose Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  selectedAvatarId === 'male' && styles.genderCardSelectedMale,
                ]}
                onPress={() => setSelectedAvatarId('male')}
                activeOpacity={0.8}
              >
                <Text style={styles.genderIcon}>👦</Text>
                <Text style={[styles.genderLabel, selectedAvatarId === 'male' && { color: '#3B82F6' }]}>Male</Text>
                {selectedAvatarId === 'male' && <Text style={[styles.genderCheck, { backgroundColor: '#3B82F6' }]}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderCard,
                  selectedAvatarId === 'female' && styles.genderCardSelectedFemale,
                ]}
                onPress={() => setSelectedAvatarId('female')}
                activeOpacity={0.8}
              >
                <Text style={styles.genderIcon}>👧</Text>
                <Text style={[styles.genderLabel, selectedAvatarId === 'female' && { color: '#EC4899' }]}>Female</Text>
                {selectedAvatarId === 'female' && <Text style={[styles.genderCheck, { backgroundColor: '#EC4899' }]}>✓</Text>}
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Submit Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>🚀 Start Exploring!</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  headerBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F15A24',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
  },
  genderCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
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
  genderCardSelectedMale: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  genderCardSelectedFemale: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
    shadowColor: '#EC4899',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  genderIcon: {
    fontSize: 52,
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#94A3B8',
  },
  genderCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitBtn: {
    backgroundColor: '#F15A24',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#F15A24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
