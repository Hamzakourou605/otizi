// src/components/TransactionItem.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TYPE_CONFIG = {
  achat:      { label: 'Achat',      bg: '#fef2f2', color: '#ef4444', sign: '+', icon: 'ACH' },
  paiement:   { label: 'Paiement',   bg: '#f0fdf4', color: '#22c55e', sign: '-', icon: 'PAI' },
  correction: { label: 'Correction', bg: '#fffbeb', color: '#f59e0b', sign: '+', icon: 'COR' },
  bonus:      { label: 'Bonus',      bg: '#f0fdf4', color: '#22c55e', sign: '-', icon: 'BON' },
  remise:     { label: 'Remise',     bg: '#eff6ff', color: '#3b82f6', sign: '-', icon: 'REM' },
};

const TransactionItem = ({ item }) => {
  const config = TYPE_CONFIG[item.type] || { label: item.type, bg: '#f8fafc', color: '#64748b', sign: '', icon: 'DOC' };
  const isDebit = ['achat', 'correction'].includes(item.type);

  return (
    <View style={styles.container}>
      {/* Icon Badge */}
      <View style={[styles.iconBadge, { backgroundColor: config.bg }]}>
        <Text style={styles.iconText}>{config.icon}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {item.description || config.label}
        </Text>
        <Text style={styles.date}>
          {item.date} {item.heure ? `à ${item.heure}` : ''} · {config.label}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: config.color }]}>
          {config.sign}{(item.montant || 0).toLocaleString()}
        </Text>
        <Text style={styles.currency}>MAD</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 10,
    fontWeight: '900',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  currency: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
  },
});

export default TransactionItem;
