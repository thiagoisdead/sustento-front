import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { COLORS } from '../../constants/theme';
import { Foods } from '../../types/data';

interface AddMealDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: (amount: number) => void;
    selectedItem: Foods | null;
}

export const AddMealDialog = ({ visible, onDismiss, onConfirm, selectedItem }: AddMealDialogProps) => {
    const [amount, setAmount] = useState('100');

    useEffect(() => {
        if (visible) setAmount('100');
    }, [visible, selectedItem]);

    if (!selectedItem) return null;

    const calc = (value: number | undefined) => {
        if (!value) return 0;
        const qty = parseFloat(amount) || 0;
        const base = selectedItem.serving === 'portion' ? 1 : 100;
        return ((value * qty) / base).toFixed(1);
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
                <Dialog.Title style={styles.title}>{selectedItem.title}</Dialog.Title>
                <Dialog.Content>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>
                            Quantidade ({selectedItem.serving === 'portion' ? 'unidades' : selectedItem.serving}):
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="100"
                            autoFocus
                        />
                    </View>

                    <View style={styles.macroRow}>
                        <MacroBox label="Kcal" value={`${calc(selectedItem.kcal)}`} />
                        <MacroBox label="Prot" value={`${calc(selectedItem.protein)}g`} />
                        <MacroBox label="Carb" value={`${calc(selectedItem.carbs)}g`} />
                        <MacroBox label="Gord" value={`${calc(selectedItem.fats)}g`} />
                    </View>

                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss} textColor={COLORS.textLight}>Cancelar</Button>
                    <Button onPress={() => onConfirm(Number(amount))} textColor={COLORS.primary}>Adicionar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const MacroBox = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.macroBox}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    dialog: { backgroundColor: 'white', borderRadius: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, textAlign: 'center' },
    inputContainer: { marginBottom: 20, alignItems: 'center' },
    label: { fontSize: 14, color: '#555', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 10,
        width: '50%',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    macroRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 5 },
    macroBox: { alignItems: 'center', minWidth: 50 },
    macroLabel: { fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase' },
    macroValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.textDark },
});