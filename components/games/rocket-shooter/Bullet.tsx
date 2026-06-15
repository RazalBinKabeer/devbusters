import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RSBullet } from './types';
import { Colors } from '../../../constants/theme';

interface BulletProps {
  bullet: RSBullet;
}

export default function Bullet({ bullet }: BulletProps) {
  if (!bullet.active) return null;

  return (
    <View
      style={[
        styles.bullet,
        {
          left: bullet.x,
          top: bullet.y,
          width: bullet.width,
          height: bullet.height,
        },
      ]}
    >
      <View style={styles.glow} />
    </View>
  );
}

const styles = StyleSheet.create({
  bullet: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 4,
    zIndex: 10,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.accent,
    borderRadius: 4,
    shadowColor: Colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
