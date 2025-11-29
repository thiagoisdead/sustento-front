import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../../constants/theme';

interface AddMealModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, calories: number, category: string) => void;
}

const initialState = {
    name: "",
    calories: "",
    category: "Lanche", // Default
};

export const AddMealModal = ({ visible, onClose, onAdd }: AddMealModalProps) => {
    const [form, setForm] = useState(initialState);

    const handleAdd = () => {
        const caloriesNum = parseInt(form.calories, 10);

        if (!form.name || isNaN(caloriesNum) || caloriesNum <= 0) {
            Alert.alert("Erro", "Por favor, preencha o nome e um valor válido de calorias.");
            return;
        }

        onAdd(form.name, caloriesNum, form.category);
        setForm(initialState); // Reset form
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Adicionar Refeição</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nome (ex: Maçã)"
                        placeholderTextColor={COLORS.textLight}
                        value={form.name}
                        onChangeText={(t) => setForm(prev => ({ ...prev, name: t }))}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Calorias (ex: 90)"
                        placeholderTextColor={COLORS.textLight}
                        keyboardType="number-pad"
                        value={form.calories}
                        onChangeText={(t) => setForm(prev => ({ ...prev, calories: t }))}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Categoria (ex: Jantar)"
                        placeholderTextColor={COLORS.textLight}
                        value={form.category}
                        onChangeText={(t) => setForm(prev => ({ ...prev, category: t }))}
                    />

                    <View style={styles.modalActions}>
                        <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={onClose}>
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable style={[styles.modalButton, styles.modalButtonAdd]} onPress={handleAdd}>
                            <Text style={styles.modalButtonText}>Adicionar</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 12,
        padding: 20,
        width: "90%",
        maxWidth: 400,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: COLORS.textDark,
    },
    input: {
        backgroundColor: COLORS.iconBg,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 16,
        color: COLORS.textDark,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
    },
    modalButtonCancel: { backgroundColor: '#E0E0E0' },
    modalButtonAdd: { backgroundColor: COLORS.primary },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});