import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onExit: () => void;
}

export default function PauseModal({ visible, onResume, onExit }: PauseModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>PAUSED</Text>
          
          <TouchableOpacity style={styles.button} onPress={onResume}>
            <Text style={styles.buttonText}>RESUME</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.exitButton]} onPress={onExit}>
            <Text style={styles.buttonText}>EXIT GAME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.bgDark,
    padding: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    width: '80%',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: Fonts.pixel,
    fontSize: 32,
    color: '#fff',
    marginBottom: 40,
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  exitButton: {
    backgroundColor: Colors.danger,
    marginBottom: 0,
  },
  buttonText: {
    fontFamily: Fonts.pixel,
    fontSize: 18,
    color: '#fff',
  },
});
