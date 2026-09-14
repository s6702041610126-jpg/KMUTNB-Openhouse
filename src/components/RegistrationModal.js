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
  const [selectedAvatarId, setSelectedAvatarId] = useState(userProfile.avatarId || 'gear-bot');

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
              <Text style={styles.headerTitle}>KMUTNB OPEN HOUSE 2026</Text>
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

            {/* Avatar Selector */}
            <Text style={styles.sectionHeader}>🤖 Choose Your Avatar</Text>
            <Text style={styles.sectionSub}>This avatar will follow your GPS on the live map!</Text>

            <View style={styles.avatarGrid}>
              {AVATARS.map((item) => {
                const isSelected = selectedAvatarId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.avatarCard,
                      { backgroundColor: item.bgColor },
                      isSelected && [styles.avatarCardSelected, { borderColor: item.color }],
                    ]}
                    onPress={() => setSelectedAvatarId(item.id)}
                    activeOpacity={0.8}
                  >
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    <Text style={styles.avatarIcon}>{item.icon}</Text>
                    <Text style={[styles.avatarName, { color: item.color }]}>{item.name}</Text>
                    <Text style={styles.avatarTitle}>{item.title}</Text>
                  </TouchableOpacity>
                );
              })}
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
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarCard: {
    width: '47.5%',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarCardSelected: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 10,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  avatarIcon: {
    fontSize: 40,
  },
  avatarName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  avatarTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
