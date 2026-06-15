import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Weapon } from './types';
import { Colors, Fonts } from '../../../constants/theme';

interface Props {
  weapons: Weapon[];
  selectedWeaponId: string;
  onSelect: (weapon: Weapon) => void;
}

export default function WeaponSelector({ weapons, selectedWeaponId, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {weapons.map((w) => {
        const isSelected = w.id === selectedWeaponId;
        return (
          <TouchableOpacity
            key={w.id}
            style={[styles.weaponBox, isSelected && styles.selectedBox]}
            onPress={() => onSelect(w)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{w.emoji}</Text>
            <Text style={[styles.name, isSelected && styles.selectedName]}>{w.name}</Text>
            <Text style={styles.damage}>Dmg: {w.damage}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  weaponBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedBox: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(123, 47, 247, 0.2)', // tinted accent
  },
  emoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  name: {
    fontFamily: Fonts.heading,
    color: '#ccc',
    fontSize: 14,
  },
  selectedName: {
    color: Colors.accent,
  },
  damage: {
    fontFamily: Fonts.pixel,
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
});
