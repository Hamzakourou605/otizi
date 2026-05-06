// src/components/StatCard.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatCard = ({ label, value, unit = 'MAD', color = '#4f46e5', icon }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>
        {(value || 0).toLocaleString()}
      </Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '900',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 10,
    color: '#cbd5e1',
    fontWeight: '700',
    marginTop: 1,
  },
});

export default StatCard;
