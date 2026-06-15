import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RSEnemy } from './types';
import { Colors } from '../../../constants/theme';

interface EnemyProps {
  enemy: RSEnemy;
}

export default function Enemy({ enemy }: EnemyProps) {
  if (!enemy.active) return null;

  const isPR = enemy.type === 'pr';
  const healthPercent = enemy.hp / enemy.maxHp;

  return (
    <View
      style={[
        styles.container,
        {
          left: enemy.x,
          top: enemy.y,
          width: enemy.width,
          height: enemy.height,
        },
      ]}
    >
      {/* Visual health indicator for multi-hit enemies */}
      {isPR && enemy.hp < enemy.maxHp && (
        <View style={styles.healthBarBg}>
          <View style={[styles.healthBarFill, { width: `${healthPercent * 100}%` }]} />
        </View>
      )}
      
      <Text style={[styles.emoji, { fontSize: enemy.width * 0.75 }]}>
        {enemy.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  emoji: {
    textAlign: 'center',
  },
  healthBarBg: {
    position: 'absolute',
    top: -6,
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: Colors.danger,
  },
});
