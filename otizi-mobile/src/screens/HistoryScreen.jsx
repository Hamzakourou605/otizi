// src/screens/HistoryScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API, { downloadClientPDF } from '../services/api';
import { useAuth } from '../store/authStore';
import TransactionItem from '../components/TransactionItem';
import { ListSkeleton } from '../components/Skeleton';

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

const getMonthChips = () => {
  const chips = [{ label: 'Tout', value: null }];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    chips.push({ label, value });
  }
  return chips;
};

export default function HistoryScreen({ navigation, route }) {
  const { user } = useAuth();
  const targetUserId = route.params?.clientId || user?.id;
  const targetUserName = route.params?.clientName || 'Mon Historique';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const chips = getMonthChips();

  const fetchTransactions = useCallback(async (mois = selectedMonth) => {
    try {
      let url = user?.role === 'admin' && route.params?.clientId 
        ? `/transactions/client/${targetUserId}` 
        : '/transactions/my';
        
      if (mois) url += `?mois=${mois}`;
      const res = await API.get(url);
      setTransactions(res.data || []);
    } catch (err) {
      console.error('History error:', err);
      Alert.alert('Erreur', 'Impossible de charger les transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, targetUserId]);

  useEffect(() => {
    fetchTransactions(selectedMonth);
  }, [selectedMonth]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(selectedMonth);
  };

  const totalAchats = transactions
    .filter(t => ['achat', 'correction'].includes(t.type))
    .reduce((s, t) => s + (t.montant || 0), 0);

  const totalPaiements = transactions
    .filter(t => ['paiement', 'bonus', 'remise'].includes(t.type))
    .reduce((s, t) => s + (t.montant || 0), 0);

  const solde = totalAchats - totalPaiements;

  if (loading) return <ListSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{targetUserName}</Text>
        <TouchableOpacity 
          onPress={() => downloadClientPDF(targetUserId, selectedMonth)} 
          style={styles.exportBtn}
        >
          <Text style={styles.exportIcon}>📄</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Achats</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            +{totalAchats.toLocaleString()} MAD
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Paiements</Text>
          <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
            -{totalPaiements.toLocaleString()} MAD
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Solde</Text>
          <Text style={[styles.summaryValue, { color: solde > 0 ? '#ef4444' : '#22c55e' }]}>
            {solde.toLocaleString()} MAD
          </Text>
        </View>
      </View>

      {/* Month Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {chips.map((chip) => (
            <TouchableOpacity
              key={chip.value || 'all'}
              onPress={() => setSelectedMonth(chip.value)}
              style={[
                styles.chip,
                selectedMonth === chip.value && styles.chipActive,
              ]}
            >
              <Text style={[
                styles.chipText,
                selectedMonth === chip.value && styles.chipTextActive,
              ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ca8a04" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aucune transaction</Text>
            <Text style={styles.emptySubtitle}>
              {selectedMonth ? `Aucun enregistrement pour cette période.` : 'Aucune transaction trouvée.'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  backArrow: { fontSize: 20, color: '#0f172a' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
  },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportIcon: { fontSize: 18 },
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: '#f1f5f9' },
  chipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#ca8a04',
    borderColor: '#ca8a04',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  chipTextActive: { color: '#fff' },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', fontWeight: '600', textAlign: 'center' },
});
