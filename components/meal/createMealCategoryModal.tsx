import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
    visible: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}

export const CreateMealCategoryModal = ({ visible, onClose, onCreate }: Props) => {
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (!name.trim()) return Alert.alert("Erro", "Digite um nome.");
        onCreate(name);
        setName('');
        onClose();
    };

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>Nova Refeição</Text>
                    <Text style={styles.sub}>Crie um novo horário (ex: "Lanche 2")</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nome da Refeição"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <View style={styles.actions}>
                        <Pressable onPress={onClose} style={styles.cancel}><Text>Cancelar</Text></Pressable>
                        <Pressable onPress={handleCreate} style={styles.save}><Text style={{ color: '#FFF' }}>Criar</Text></Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    content: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center', color: COLORS.textDark },
    sub: { fontSize: 14, color: '#777', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginBottom: 20 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    cancel: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#EEE', borderRadius: 8 },
    save: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: COLORS.primary, borderRadius: 8 },
});