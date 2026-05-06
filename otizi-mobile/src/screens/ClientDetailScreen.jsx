import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Alert, Dimensions, ActivityIndicator,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import API, { downloadClientPDF } from '../services/api';
import TransactionItem from '../components/TransactionItem';
import { DashboardSkeleton } from '../components/Skeleton';
import { useAuth } from '../store/authStore';

const { width } = Dimensions.get('window');

export default function ClientDetailScreen({ route, navigation }) {
  const { clientId, clientName } = route.params;
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [clientRes, transRes] = await Promise.all([
        API.get(`/clients/${clientId}`),
        API.get(`/transactions/client/${clientId}`)
      ]);
      setClient(clientRes.data);
      setTransactions(transRes.data || []);
    } catch (err) {
      console.error('Fetch client detail error:', err);
      Alert.alert('Erreur', 'Impossible de charger les détails du client.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePayMonth = (month, currentDebt) => {
    if (currentDebt <= 0) {
        Alert.alert('Info', 'Ce mois est déjà soldé ou créditeur.');
        return;
    }

    Alert.alert(
      'Solder le mois',
      `Voulez-vous marquer le mois ${month} comme entièrement payé ? Un paiement de ${currentDebt} MAD sera enregistré.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            setActionLoading(month);
            try {
              await API.post('/admin/pay-month', { client_id: clientId, mois: month, montant: currentDebt });
              fetchData();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de solder le mois.');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleClearMonth = (month) => {
    Alert.alert(
      'Nettoyer le mois',
      `Attention ! Cela va SUPPRIMER toutes les transactions du mois ${month}. Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer tout', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(month);
            try {
              await API.delete(`/admin/clear-month?client_id=${clientId}&mois=${month}`);
              fetchData();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de nettoyer le mois.');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleDeleteClient = () => {
    Alert.alert(
      'Supprimer le client',
      `Êtes-vous ABSOLUMENT sûr de vouloir supprimer ${client?.nom} ? Toutes ses données et transactions seront perdues à jamais.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'SUPPRIMER DÉFINITIVEMENT', 
          style: 'destructive',
          onPress: async () => {
            try {
              await API.delete(`/admin/clients/${clientId}`);
              Alert.alert('Succès', 'Client supprimé.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer le client.');
            }
          }
        }
      ]
    );
  };

  // Grouper les transactions par mois pour le résumé
  const getMonthlyGroups = () => {
    const groups = {};
    transactions.forEach(t => {
      const m = t.mois || (t.date ? t.date.substring(0, 7) : 'Inconnu');
      if (!groups[m]) groups[m] = 0;
      
      const amt = t.montant || 0;
      if (['achat', 'correction'].includes(t.type)) {
        groups[m] += amt;
      } else {
        groups[m] -= amt;
      }
    });
    return Object.keys(groups).sort().reverse().map(m => ({
      month: m,
      debt: groups[m],
      isPaid: client?.monthly_status?.[m] || false
    }));
  };

  if (loading) return <DashboardSkeleton />;

  const monthlyData = getMonthlyGroups();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails Client</Text>
        <TouchableOpacity 
          onPress={() => downloadClientPDF(clientId)} 
          style={styles.exportBtn}
        >
          <Text style={styles.exportIcon}>📄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{(client?.nom || '??').substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.clientName}>{client?.nom}</Text>
                <Text style={styles.clientMeta}>{client?.email}</Text>
                <Text style={styles.clientMeta}>{client?.telephone || 'Pas de téléphone'}</Text>
            </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
            <LinearGradient colors={['#a16207', '#854d0e']} style={styles.statBox}>
                <Text style={styles.statLabel}>SOLDE GLOBAL</Text>
                <Text style={styles.statValue}>{(client?.current_balance || 0).toLocaleString()} MAD</Text>
            </LinearGradient>
        </View>

        {/* Histogram / Bar Chart */}
        {monthlyData.length > 0 && (
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Historique des dettes (Histogramme)</Text>
                <BarChart
                    data={{
                        labels: monthlyData.slice(0, 6).reverse().map(m => m.month.split('-')[1]),
                        datasets: [{
                            data: monthlyData.slice(0, 6).reverse().map(m => m.isPaid ? 0 : m.debt)
                        }]
                    }}
                    width={width - 40}
                    height={200}
                    yAxisLabel=""
                    yAxisSuffix=" MAD"
                    chartConfig={{
                        backgroundColor: '#fff',
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Rouge pour la dette
                        labelColor: () => '#94a3b8',
                        style: { borderRadius: 16 },
                        barPercentage: 0.6,
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        marginLeft: -10
                    }}
                    fromZero={true}
                    showValuesOnTopOfBars={true}
                />
            </View>
        )}

        {/* Action Button */}
        {isAdmin && (
            <View style={styles.actions}>
                <TouchableOpacity 
                    style={styles.mainAction}
                    onPress={() => navigation.navigate('AddTransaction', { client: {...client, _id: clientId} })}
                >
                    <Text style={styles.mainActionText}>+ Ajouter un achat/paiement</Text>
                </TouchableOpacity>

                {/* DELETE CLIENT BUTTON */}
                <TouchableOpacity 
                    style={styles.deleteClientBtn}
                    onPress={handleDeleteClient}
                >
                    <Text style={styles.deleteClientText}>Supprimer le compte client</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transactions Récentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('History', { clientId, clientName: client?.nom })}>
                    <Text style={styles.seeAll}>Voir tout</Text>
                </TouchableOpacity>
            </View>
            {transactions.slice(0, 5).map((item) => (
                <TransactionItem key={item._id} item={item} />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  backIcon: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  exportBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  exportIcon: { fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  avatarLarge: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarLargeText: { fontSize: 24, fontWeight: '900', color: '#3b82f6' },
  profileInfo: { flex: 1 },
  clientName: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  clientMeta: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  statsContainer: { marginBottom: 20 },
  statBox: { padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
  monthCard: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  monthCardPaid: { borderColor: '#16a34a', borderWidth: 1, backgroundColor: '#f0fdf4' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' },
  monthDebt: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  checkIcon: { fontSize: 20 },
  monthActions: { flexDirection: 'row', gap: 10 },
  payBtn: { flex: 1, backgroundColor: '#16a34a', height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  clearBtn: { 
    paddingHorizontal: 16, 
    backgroundColor: '#fee2e2', 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    minWidth: 80,
  },
  clearBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '800' },
  actions: { marginBottom: 24 },
  mainAction: { backgroundColor: '#1e1b4b', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  deleteClientBtn: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteClientText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { color: '#6366f1', fontWeight: '700', fontSize: 13 },
});
