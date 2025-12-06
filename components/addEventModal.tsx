import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Keyboard,
    Alert
} from 'react-native';
import { COLORS } from '../constants/theme';
import { isValid24HourTime } from '../utils/dateHelpers';

interface AddEventModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (description: string, time: string) => void;
}

export const AddEventModal = ({ visible, onClose, onSave }: AddEventModalProps) => {
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');

    const handleSave = () => {
        if (!description.trim()) {
            Alert.alert('Erro', 'Por favor, insira uma descrição.');
            return;
        }

        if (!isValid24HourTime(time)) {
            Alert.alert('Erro', 'Horário inválido! Use o formato HH:MM.');
            return;
        }

        onSave(description, time);

        // Reset and close
        setDescription('');
        setTime('');
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={() => { Keyboard.dismiss(); onClose(); }}
            >
                <Pressable
                    style={styles.modalContainer}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>Novo Evento</Text>

                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Reunião de equipe"
                        placeholderTextColor={COLORS.textLight}
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={styles.label}>Horário (HH:MM)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="09:00"
                        placeholderTextColor={COLORS.textLight}
                        value={time}
                        onChangeText={setTime}
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                    />

                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveText}>Salvar</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: COLORS.textDark,
        backgroundColor: '#FAFAFA',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        color: COLORS.textLight,
        fontWeight: '600',
    },
    saveText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});