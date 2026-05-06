// src/screens/AdminClientsScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TextInput,
  TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../services/api';

const ClientItem = ({ client, onPress }) => (
  <TouchableOpacity 
    style={[styles.clientItem, client.status === 'archive' && styles.clientItemArchive]} 
    onPress={onPress}
  >
    <View style={[styles.avatar, client.status === 'archive' && styles.avatarArchive]}>
      <Text style={[styles.avatarText, client.status === 'archive' && styles.avatarTextArchive]}>
        {(client.nom || 'U').substring(0, 2).toUpperCase()}
      </Text>
    </View>
    <View style={styles.info}>
      <Text style={[styles.name, client.status === 'archive' && styles.nameArchive]}>{client.nom}</Text>
      <Text style={styles.details}>{client.status === 'archive' ? 'Compte Archivé' : (client.telephone || 'Pas de téléphone')}</Text>
    </View>
    <View style={styles.balanceCol}>
      <Text style={[styles.balance, { color: client.credit_total > 0 ? '#ef4444' : '#22c55e' }, client.status === 'archive' && {opacity: 0.5}]}>
        {(client.credit_total || 0).toLocaleString()}
      </Text>
      <Text style={styles.currency}>MAD</Text>
    </View>
  </TouchableOpacity>
);

export default function AdminClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await API.get('/clients');
      setClients(res.data || []);
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const filtered = clients.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  );

  const activeClients = filtered.filter(c => c.status !== 'archive');
  const archivedClients = filtered.filter(c => c.status === 'archive');

  const sections = [
    { title: 'Clients Actifs', data: activeClients },
    { title: 'Anciens Clients', data: archivedClients },
  ].filter(s => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion Clients</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddClient')} style={styles.addBtn}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>S</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SectionList */}
      <SectionList
        sections={sections}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ClientItem 
            client={item} 
            onPress={() => navigation.navigate('ClientDetail', { clientId: item._id, clientName: item.nom })} 
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun client trouvé</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  backIcon: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  addIcon: { fontSize: 24, fontWeight: '400', color: '#fff', marginTop: -2 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  searchIcon: { fontSize: 16, fontWeight: '900', color: '#94a3b8', marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  clearIcon: { fontSize: 14, fontWeight: '900', color: '#cbd5e1', padding: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 12, marginLeft: 5 },
  clientItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  clientItemArchive: { opacity: 0.6, backgroundColor: '#f1f5f9' },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarArchive: { backgroundColor: '#cbd5e1' },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#3b82f6' },
  avatarTextArchive: { color: '#64748b' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  nameArchive: { color: '#64748b', textDecorationLine: 'line-through' },
  details: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  balanceCol: { alignItems: 'flex-end' },
  balance: { fontSize: 16, fontWeight: '900' },
  currency: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontWeight: '600' },
});
