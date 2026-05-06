// src/screens/ProfileScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../store/authStore';

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Text style={styles.infoIconText}>{icon}</Text>
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#a16207', '#ca8a04']} style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(user?.nom || 'U').substring(0, 2).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.nom}</Text>
          <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.clientBadge]}>
            <Text style={[styles.roleText, isAdmin ? styles.adminRoleText : styles.clientRoleText]}>
              {isAdmin ? 'Administrateur' : 'Client Vérifié'}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations du compte</Text>
          <InfoRow label="Nom complet" value={user?.nom} icon="ID" />
          <View style={styles.separator} />
          <InfoRow label="Email" value={user?.email} icon="@" />
          <View style={styles.separator} />
          <InfoRow label="Téléphone" value={user?.telephone || 'Non renseigné'} icon="TEL" />
          <View style={styles.separator} />
          <InfoRow label="Identifiant" value={`#${(user?.id || '').substring(0, 8).toUpperCase()}`} icon="KEY" />
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sécurité</Text>
          <View style={styles.securityRow}>
            <Text style={styles.securityIcon}>SEC</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Token chiffré</Text>
              <Text style={styles.securitySubtitle}>Stocké de manière sécurisée avec SecureStore</Text>
            </View>
            <View style={styles.securityBadge}>
              <Text style={styles.securityBadgeText}>Actif</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.securityRow}>
            <Text style={styles.securityIcon}>NET</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Connexion API</Text>
              <Text style={styles.securitySubtitle}>otizi.onrender.com</Text>
            </View>
            <View style={[styles.securityBadge, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[styles.securityBadgeText, { color: '#22c55e' }]}>HTTPS</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>À propos</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Application</Text>
            <Text style={styles.aboutValue}>OtiZi Mobile</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Plateforme</Text>
            <Text style={styles.aboutValue}>React Native / Expo</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.actionBtn}>
            <Text style={styles.actionBtnIcon}>HIST</Text>
            <Text style={styles.actionBtnText}>Voir mon historique</Text>
            <Text style={styles.actionBtnArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={[styles.actionBtn, styles.logoutBtn]}>
            <Text style={styles.actionBtnIcon}>EXIT</Text>
            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Se déconnecter</Text>
            <Text style={[styles.actionBtnArrow, { color: '#ef4444' }]}>→</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>OtiZi · Gestion de Crédit Magasin · v1.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  backArrow: { fontSize: 20, color: '#0f172a' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#ca8a04', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  avatarLargeText: { color: '#fff', fontWeight: '900', fontSize: 28 },
  userName: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  adminBadge: { backgroundColor: '#fef3c7' },
  clientBadge: { backgroundColor: '#f0fdf4' },
  roleText: { fontSize: 13, fontWeight: '800' },
  adminRoleText: { color: '#854d0e' },
  clientRoleText: { color: '#22c55e' },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  cardTitle: {
    fontSize: 13, fontWeight: '800', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  infoIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8fafc',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  infoIconText: { fontSize: 16 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  securityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  securityIcon: { fontSize: 10, fontWeight: '900', color: '#94a3b8', marginRight: 12 },
  securityTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  securitySubtitle: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  securityBadge: {
    backgroundColor: '#ede9fe', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  securityBadgeText: { color: '#7c3aed', fontWeight: '800', fontSize: 11 },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  aboutLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  aboutValue: { fontSize: 13, color: '#0f172a', fontWeight: '800' },
  actionsSection: { gap: 10, marginBottom: 16 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  logoutBtn: { borderWidth: 1.5, borderColor: '#fee2e2', backgroundColor: '#fff5f5' },
  actionBtnIcon: { fontSize: 10, fontWeight: '900', color: '#64748b', marginRight: 12 },
  actionBtnText: { flex: 1, fontSize: 14, fontWeight: '800', color: '#1e293b' },
  actionBtnArrow: { fontSize: 16, color: '#94a3b8' },
  footer: {
    textAlign: 'center', color: '#94a3b8', fontSize: 11,
    fontWeight: '600', marginTop: 8,
  },
});
