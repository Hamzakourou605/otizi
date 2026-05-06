// src/screens/DashboardScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API, { downloadGlobalPDF } from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../store/authStore';
import StatCard from '../components/StatCard';
import { DashboardSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push Token:', token);
      await API.post('/users/push-token', { push_token: token });
    } catch (err) {
      console.error('Push registration error:', err);
    }
  };

  // Route différente selon le rôle
  const fetchData = useCallback(async () => {
    try {
      let res;
      if (user?.role === 'admin') {
        res = await API.get('/admin/stats');
        // Adapter le format pour l'admin
        setSummary({
          balance: res.data.global_credit,
          total_credit: res.data.this_month_credit,
          total_paid: res.data.total_revenue,
          monthly_evolution: (res.data.recent_transactions || []).slice(0, 6).map((t, i) => ({
            month: t.date || `T${i + 1}`,
            balance: t.montant || 0,
          })),
          extra: {
            clients: res.data.total_clients,
            prev_month: res.data.prev_month_credit,
            top_debtors: res.data.top_debtors || [],
          }
        });
      } else {
        res = await API.get('/client/summary');
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      Alert.alert('Erreur', 'Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    registerForPushNotifications();

    // Socket : mises à jour temps réel
    if (!socket.connected) socket.connect();
    socket.emit('join', { client_id: user?.id });

    socket.on('credit_update', (data) => {
      Alert.alert(
        'Mise à jour de solde',
        `Votre nouveau solde : ${(data.new_balance || 0).toLocaleString()} MAD`,
        [{ text: 'OK', onPress: fetchData }]
      );
    });

    socket.on('admin_update', (data) => {
      if (user?.role === 'admin') {
        fetchData();
      }
    });

    return () => {
      socket.off('credit_update');
      socket.off('admin_update');
    };
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getChartData = () => {
    const evolution = summary?.monthly_evolution || [];
    if (evolution.length === 0) {
      return { labels: ['--'], datasets: [{ data: [0] }] };
    }
    return {
      labels: evolution.slice(-6).map(e => {
        const parts = (e.month || '').split('-');
        return parts.length >= 2 ? parts[1] : e.month || '--';
      }),
      datasets: [{ data: evolution.slice(-6).map(e => Math.max(0, e.balance || 0)) }],
    };
  };

  const isAdmin = user?.role === 'admin';

  if (loading) return <DashboardSkeleton />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {user?.nom?.split(' ')[0]}</Text>
            <Text style={styles.subgreeting}>
              {isAdmin ? 'Vue Administrateur' : 'Client Vérifié'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>DÉCONNEXION</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <LinearGradient colors={['#a16207', '#ca8a04']} style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(user?.nom || 'U').substring(0, 2).toUpperCase()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card */}
        <LinearGradient
          colors={['#854d0e', '#a16207', '#ca8a04']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>
            {isAdmin ? 'Dette Totale Globale' : 'Mon Solde Actuel'}
          </Text>
          <Text style={styles.balanceAmount}>
            {(summary?.balance || 0).toLocaleString()}
          </Text>
          <Text style={styles.balanceCurrency}>MAD</Text>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceSubLabel}>{isAdmin ? 'Ce mois' : 'Total Crédit'}</Text>
              <Text style={styles.balanceSubAmount}>
                {(summary?.total_credit || 0).toLocaleString()} MAD
              </Text>
            </View>
            <View style={styles.verticalLine} />
            <View>
              <Text style={styles.balanceSubLabel}>{isAdmin ? 'Revenus' : 'Remboursé'}</Text>
              <Text style={[styles.balanceSubAmount, { color: '#86efac' }]}>
                {(summary?.total_paid || 0).toLocaleString()} MAD
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        {isAdmin && (
          <View style={styles.statsRow}>
            <StatCard
              label="Clients"
              value={summary?.extra?.clients}
              unit="total"
              color="#6366f1"
              icon="P"
            />
            <View style={{ width: 10 }} />
            <StatCard
              label="Mois préc."
              value={summary?.extra?.prev_month}
              unit="MAD"
              color="#f59e0b"
              icon="C"
            />
          </View>
        )}

        {/* Chart */}
        {(summary?.monthly_evolution?.length > 0) && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              {isAdmin ? 'Transactions récentes' : 'Évolution de ma dette'}
            </Text>
            <LineChart
              data={getChartData()}
              width={width - 80}
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: () => '#94a3b8',
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#4f46e5' },
              }}
              bezier
              style={{ borderRadius: 12 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        )}

        {/* Top Debtors (Admin only) */}
        {isAdmin && summary?.extra?.top_debtors?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plus gros débiteurs</Text>
            {summary.extra.top_debtors.map((c, i) => (
              <View key={i} style={styles.debtorItem}>
                <View style={styles.debtorAvatar}>
                  <Text style={styles.debtorAvatarText}>
                    {(c.nom || '??').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.debtorName}>{c.nom}</Text>
                <Text style={styles.debtorAmount}>
                  {(c.credit_total || 0).toLocaleString()} MAD
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#ede9fe' }]}
              onPress={() => navigation.navigate('AdminClients')}
            >
              <Text style={styles.actionLabel, { color: '#7c3aed', fontSize: 16 }}>Clients</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#eff6ff' }]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.actionLabel, { color: '#3b82f6', fontSize: 16 }}>Historique</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subgreeting: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  logoutBtn: {
    marginRight: 12,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ef4444',
  },
  balanceCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  balanceCurrency: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -4,
    marginBottom: 16,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalLine: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  balanceSubLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  balanceSubAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 14,
  },
  debtorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  debtorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debtorAvatarText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  debtorName: { flex: 1, fontWeight: '700', color: '#1e293b', fontSize: 14 },
  debtorAmount: { fontWeight: '800', color: '#ef4444', fontSize: 13 },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontWeight: '800', fontSize: 13 },
});
