import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { searchAliments } from '../../services/foodService';

interface AddMealModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (alimentId: number, amount: number, mealCategory: string) => void;
}

const MEAL_OPTIONS = ['Café da Manhã', 'Almoço', 'Café da Tarde', 'Jantar', 'Ceia'];

export const AddMealModal = ({ visible, onClose, onAdd }: AddMealModalProps) => {
    const [step, setStep] = useState<'SEARCH' | 'DETAILS'>('SEARCH');
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedAliment, setSelectedAliment] = useState<any | null>(null);
    const [amount, setAmount] = useState('100');
    const [selectedCategory, setSelectedCategory] = useState<string>('Almoço');

    useEffect(() => {
        if (visible) {
            setStep('SEARCH');
            setSearchText('');
            setResults([]);
            setAmount('100');
            setSelectedCategory('Almoço');
        }
    }, [visible]);

    const handleSearch = async (text: string) => {
        setSearchText(text);
        if (text.length < 2) return;
        setLoading(true);
        try {
            const data = await searchAliments(text);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: any) => {
        setSelectedAliment(item);
        setStep('DETAILS');
    };

    const handleConfirm = () => {
        if (!selectedAliment) return;
        const qty = Number(amount);
        if (isNaN(qty) || qty <= 0) {
            Alert.alert("Erro", "Quantidade inválida");
            return;
        }

        onAdd(selectedAliment.aliment_id, qty, selectedCategory);
        onClose();
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalContent}>

                    {/* STEP 1: BUSCA */}
                    {step === 'SEARCH' && (
                        <>
                            <Text style={styles.title}>Adicionar Alimento</Text>
                            <View style={styles.searchBox}>
                                <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textLight} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar (ex: Arroz)"
                                    placeholderTextColor={COLORS.textLight}
                                    value={searchText}
                                    onChangeText={handleSearch}
                                    autoFocus
                                />
                            </View>
                            {loading ? (
                                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                            ) : (
                                <FlatList
                                    data={results}
                                    keyExtractor={(item) => String(item.aliment_id)}
                                    style={{ maxHeight: 300, marginTop: 10 }}
                                    renderItem={({ item }) => (
                                        <Pressable style={styles.resultItem} onPress={() => handleSelect(item)}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.resultName}>{item.name}</Text>
                                                <Text style={styles.resultCal}>{Number(item.calories_100g).toFixed(0)} kcal/100g</Text>
                                            </View>
                                            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={COLORS.primary} />
                                        </Pressable>
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>Nada encontrado.</Text>}
                                />
                            )}
                            <Pressable style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </Pressable>
                        </>
                    )}

                    {/* STEP 2: DETALHES */}
                    {step === 'DETAILS' && selectedAliment && (
                        <>
                            <Text style={styles.title}>{selectedAliment.name}</Text>

                            <Text style={styles.label}>Quantidade (g):</Text>
                            <TextInput
                                style={styles.amountInput}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="100"
                            />
                            <View style={styles.footerButtons}>
                                <Pressable style={styles.backButton} onPress={() => setStep('SEARCH')}>
                                    <Text style={styles.backText}>Voltar</Text>
                                </Pressable>
                                <Pressable style={styles.addButton} onPress={handleConfirm}>
                                    <Text style={styles.addText}>Confirmar</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '100%', maxHeight: '80%', elevation: 5 },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, textAlign: 'center', marginBottom: 15 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
    searchInput: { flex: 1, fontSize: 16, color: COLORS.textDark },
    resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    resultName: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
    resultCal: { fontSize: 12, color: COLORS.textLight },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },
    label: { fontSize: 14, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8, marginTop: 10 },
    mealOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    mealChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF' },
    mealChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    mealChipText: { fontSize: 12, color: COLORS.textLight },
    mealChipTextSelected: { color: '#FFF', fontWeight: 'bold' },
    amountInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 18, textAlign: 'center', marginBottom: 20, color: COLORS.textDark, fontWeight: 'bold' },
    footerButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
    backButton: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 8, backgroundColor: '#F0F0F0' },
    addButton: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.primary },
    backText: { fontWeight: 'bold', color: COLORS.textLight },
    addText: { fontWeight: 'bold', color: '#FFF' },
    cancelButton: { marginTop: 15, padding: 10, alignItems: 'center' },
    cancelText: { color: COLORS.textLight, fontWeight: '600' }
});