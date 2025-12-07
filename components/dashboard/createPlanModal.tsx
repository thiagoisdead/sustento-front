import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from '../../constants/theme';

interface CreatePlanModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string, source: 'AUTOMATIC' | 'MANUAL') => void;
}

export const CreatePlanModal = ({ visible, onClose, onSubmit }: CreatePlanModalProps) => {
    const [planName, setPlanName] = useState('');

    // Por enquanto fixo em AUTOMATIC, mas preparado para expansão
    const [source, setSource] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');

    const handleSave = () => {
        if (!planName.trim()) {
            Alert.alert("Aviso", "Dê um nome para o seu plano (ex: Cutting 2025)");
            return;
        }
        onSubmit(planName, source);
        setPlanName(''); // Limpa
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); onClose(); }}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>

                    <Text style={styles.title}>Novo Plano Alimentar</Text>
                    <Text style={styles.subtitle}>O sistema irá calcular suas metas baseadas no seu perfil.</Text>

                    <Text style={styles.label}>Nome do Plano</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Projeto Verão, Ganho de Massa..."
                        placeholderTextColor={COLORS.textLight}
                        value={planName}
                        onChangeText={setPlanName}
                        autoFocus
                    />

                    {/* Aqui poderia ter um seletor de SOURCE no futuro */}

                    <View style={styles.buttonRow}>
                        <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </Pressable>

                        <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.saveText}>Criar & Ativar</Text>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 24,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 6,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: COLORS.textDark,
        backgroundColor: '#FAFAFA',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    cancelText: {
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    saveText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});