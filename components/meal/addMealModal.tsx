import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert, Keyboard } from 'react-native';
import { COLORS } from '../../constants/theme';
import { BaseButton } from '../../components/baseButton'; // Ajuste o caminho se necessário

interface AddMealModalProps {
    visible: boolean;
    onClose: () => void;
    // Atualizei a assinatura do onAdd para receber o objeto correto
    onAdd: (mealData: { meal_name: string; meal_type: string; time: string; plan_id: number }) => void;
    planId?: number;
}

export const AddMealModal = ({ visible, onClose, onAdd, planId }: AddMealModalProps) => {
    const [mealName, setMealName] = useState('');
    const [time, setTime] = useState('');

    const handleTimeChange = (text: string) => {
        let cleaned = text.replace(/[^0-9]/g, '');

        if (cleaned.length > 4) cleaned = cleaned.substring(0, 4);

        if (cleaned.length >= 3) {
            setTime(`${cleaned.substring(0, 2)}:${cleaned.substring(2)}`);
        } else {
            setTime(cleaned);
        }
    };

    const handleConfirm = () => {
        if (!mealName.trim()) {
            Alert.alert("Erro", "Por favor, insira um nome para a refeição.");
            return;
        }
        if (time.length < 5) { 
            Alert.alert("Erro", "Por favor, insira um horário válido (HH:mm).");
            return;
        }
        if (!planId) {
            Alert.alert("Erro", "ID do plano não encontrado.");
            return;
        }

        const payload = {
            meal_name: mealName,
            meal_type: 'FIXED',
            time: `${time}:00`, 
            plan_id: Number(planId)
        };

        onAdd(payload);

        setMealName('');
        setTime('');
        onClose();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalContent}>

                    <Text style={styles.title}>Nova Refeição</Text>

                    {/* Input Nome */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome (ex: Café da Manhã)</Text>
                        <TextInput
                            style={styles.input}
                            value={mealName}
                            onChangeText={setMealName}
                            placeholder="Digite o nome..."
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Input Horário */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Horário</Text>
                        <TextInput
                            style={styles.input}
                            value={time}
                            onChangeText={handleTimeChange}
                            placeholder="00:00"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={5} // HH:MM
                        />
                    </View>

                    {/* Botões Lado a Lado */}
                    <View style={styles.footerButtons}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </Pressable>

                        <View style={styles.confirmButtonContainer}>
                            <BaseButton
                                onPress={handleConfirm}
                                text="Criar Refeição"
                                width={140}
                            />
                        </View>
                    </View>

                </View>
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
        padding: 20
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 24
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 8,
        marginLeft: 4
    },
    input: {
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.textDark,
    },
    footerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    cancelButton: {
        padding: 12,
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF'
    },
    cancelText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16
    },
    confirmButtonContainer: {
        flex: 1,
        // O BaseButton geralmente tem sua própria altura/estilo, 
        // mas o container garante que ele ocupe o espaço do flex
    }
});