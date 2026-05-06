// src/components/Skeleton.jsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const SkeletonBox = ({ width, height, borderRadius = 12, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#e2e8f0', opacity }, style]}
    />
  );
};

export const DashboardSkeleton = () => (
  <View style={styles.container}>
    <SkeletonBox width="100%" height={200} borderRadius={24} style={{ marginBottom: 16 }} />
    <SkeletonBox width="100%" height={120} borderRadius={24} style={{ marginBottom: 12 }} />
    <SkeletonBox width="60%" height={20} style={{ marginBottom: 8 }} />
    <SkeletonBox width="80%" height={20} style={{ marginBottom: 8 }} />
    <SkeletonBox width="70%" height={20} />
  </View>
);

export const ListSkeleton = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={styles.skeletonItem}>
        <SkeletonBox width={44} height={44} borderRadius={14} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox width="60%" height={14} style={{ marginBottom: 8 }} />
          <SkeletonBox width="40%" height={10} />
        </View>
        <SkeletonBox width={60} height={16} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
});

export default SkeletonBox;
