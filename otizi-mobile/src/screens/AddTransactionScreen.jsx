// src/screens/AddTransactionScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API, { downloadClientPDF } from '../services/api';

const TYPES = [
  { id: 'achat', label: 'Achat', color: '#ef4444' },
  { id: 'paiement', label: 'Paiement', color: '#22c55e' },
  { id: 'correction', label: 'Correction', color: '#f59e0b' },
  { id: 'bonus', label: 'Bonus', color: '#8b5cf6' },
  { id: 'remise', label: 'Remise', color: '#3b82f6' },
];

export default function AddTransactionScreen({ route, navigation }) {
  const { client } = route.params;
  const [type, setType] = useState('achat');
  const [montant, setMontant] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!montant || isNaN(montant)) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (!description) {
      Alert.alert('Erreur', 'Veuillez entrer une description');
      return;
    }

    setLoading(true);
    try {
      await API.post('/transactions', {
        client_id: client._id,
        type,
        montant: parseFloat(montant),
        description: description.trim()
      });
      Alert.alert('Succès', 'Transaction enregistrée !');
      navigation.goBack();
    } catch (err) {
      console.error('Add transaction error:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter la transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Opération</Text>
        <TouchableOpacity 
          onPress={() => downloadClientPDF(client._id)} 
          style={styles.exportBtn}
        >
          <Text style={styles.exportIcon}>📄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Client Info */}
        <View style={styles.clientCard}>
          <Text style={styles.clientLabel}>Client</Text>
          <Text style={styles.clientName}>{client.nom}</Text>
          <Text style={styles.clientBalance}>
            Solde actuel: {client.credit_total?.toLocaleString()} MAD
          </Text>
        </View>

        {/* Type Selector */}
        <Text style={styles.label}>Type d'opération</Text>
        <View style={styles.typesRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setType(t.id)}
              style={[
                styles.typeBtn,
                type === t.id && { backgroundColor: t.color, borderColor: t.color }
              ]}
            >
              <Text style={[styles.typeBtnText, type === t.id && { color: '#fff' }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
        <Text style={styles.label}>Montant (MAD)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          value={montant}
          onChangeText={setMontant}
          keyboardType="numeric"
        />

        {/* Description Input */}
        <Text style={styles.label}>Description / Note</Text>
        <TextInput
          style={styles.descInput}
          placeholder="Ex: Facture #123, Avance..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.disabledBtn]}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Enregistrer la transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  backIcon: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  exportBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  exportIcon: { fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  clientCard: {
    backgroundColor: '#854d0e', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  clientLabel: { color: '#fef3c7', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  clientName: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  clientBalance: { color: '#fde68a', fontSize: 13, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '800', color: '#64748b', marginBottom: 12, marginTop: 12 },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  typeBtnText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
  amountInput: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 24,
    fontWeight: '900', color: '#1e293b', borderWidth: 1.5, borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  descInput: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 14,
    fontWeight: '600', color: '#1e293b', borderWidth: 1.5, borderColor: '#e2e8f0',
    minHeight: 100, textAlignVertical: 'top', marginBottom: 32,
  },
  submitBtn: {
    backgroundColor: '#ca8a04', height: 56, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#ca8a04', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  disabledBtn: { opacity: 0.6 },
});
