import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
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
        // Limpa os campos e fecha
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
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>Novo Evento</Text>

                            <Text style={styles.label}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Reunião de equipe"
                                value={description}
                                onChangeText={setDescription}
                                autoFocus
                            />

                            <Text style={styles.label}>Horário (HH:MM)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="09:00"
                                value={time}
                                onChangeText={setTime}
                                keyboardType="numbers-and-punctuation"
                                maxLength={5}
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                    <Text style={styles.cancelText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                                    <Text style={styles.saveText}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
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
        color: COLORS.textDark, // ou White dependendo do contraste
        fontWeight: 'bold',
    },
});