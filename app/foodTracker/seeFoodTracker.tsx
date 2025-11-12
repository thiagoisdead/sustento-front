import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    useWindowDimensions,
    Modal, // NOVO
    TextInput, // NOVO
    Alert, // NOVO
} from "react-native";
import { Meal } from "../../types/meal";
import { BREAKPOINTS } from "../../constants/breakpoints";


// NOVO: Estado inicial para o formulário do modal
const initialState = {
    name: "",
    calories: "",
    category: "Café da manhã", // Valor padrão
};

export default function SeeFoodTracker() {
    const { width } = useWindowDimensions();
    const isMobile = width < BREAKPOINTS.MOBILE;

    const [meals, setMeals] = useState<Meal[]>([
        { id: 1, category: "Café da manhã", name: "Café com leite", calories: 80 },
        { id: 2, category: "Café da manhã", name: "Torrada integral", calories: 60 },
        { id: 3, category: "Almoço", name: "Peito de frango grelhado", calories: 250 },
        { id: 4, category: "Almoço", name: "Arroz integral", calories: 150 },
        { id: 5, category: "Almoço", name: "Salada mista", calories: 50 },
        { id: 6, category: "Lanche", name: "Maçã", calories: 90 },
        { id: 7, category: "Jantar", name: "Salmão assado", calories: 300 },
        { id: 8, category: "Jantar", name: "Brócolis cozido", calories: 40 },
    ]);

    // --- NOVOS ESTADOS ---
    const [modalVisible, setModalVisible] = useState(false);
    const [newMeal, setNewMeal] = useState(initialState);

    // --- LÓGICA DE CÁLCULO (semelhante ao anterior) ---
    const dailyGoal = 1800;
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const progress = Math.min(totalCalories / dailyGoal, 1);
    const progressPct = `${Math.round(progress * 100)}%`;

    const groupedMeals = meals.reduce((acc: Record<string, Meal[]>, meal) => {
        if (!acc[meal.category]) acc[meal.category] = [];
        acc[meal.category].push(meal);
        return acc;
    }, {});

    // --- NOVAS FUNÇÕES ---

    const handleAddMeal = () => {
        const calories = parseInt(newMeal.calories, 10);
        if (!newMeal.name || isNaN(calories) || calories <= 0) {
            Alert.alert("Erro", "Por favor, preencha o nome e um valor válido de calorias.");
            return;
        }

        const mealToAdd: Meal = {
            id: Date.now(), // ID único simples
            name: newMeal.name,
            calories: calories,
            category: newMeal.category,
        };

        setMeals([...meals, mealToAdd]);
        setNewMeal(initialState); // Reseta o formulário
        setModalVisible(false); // Fecha o modal
    };

    const handleDeleteMeal = (id: number) => {
        Alert.alert(
            "Excluir Refeição",
            "Tem certeza que deseja excluir esta refeição?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                        setMeals(meals.filter((meal) => meal.id !== id));
                    },
                },
            ]
        );
    };

    // Função para atualizar o formulário
    const handleFormChange = (field: string, value: string) => {
        setNewMeal(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.container,
                    !isMobile && styles.containerDesktop,
                ]}
            >
                {/* ... Card de Progresso (idêntico) ... */}
                <View style={styles.card}>
                    <Text style={styles.goalText}>Meta Diária de Calorias: {dailyGoal} kcal</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: progressPct }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {totalCalories} / {dailyGoal} kcal
                    </Text>
                    {/* Macros ainda fixos - veja melhorias */}
                    <View style={styles.macros}>
                        <View style={styles.macroItem}><Text style={styles.macroLabel}>Proteínas</Text><Text style={styles.macroValue}>60%</Text></View>
                        <View style={styles.macroItem}><Text style={styles.macroLabel}>Carboidratos</Text><Text style={styles.macroValue}>40%</Text></View>
                        <View style={styles.macroItem}><Text style={styles.macroLabel}>Gorduras</Text><Text style={styles.macroValue}>30%</Text></View>
                    </View>
                </View>

                {/* --- GRID DE REFEIÇÕES (MODIFICADO) --- */}
                <View style={styles.mealGrid}>
                    {Object.keys(groupedMeals).map((category) => (
                        <View key={category} style={styles.mealSection}>
                            <Text style={styles.mealCategory}>{category}</Text>
                            {groupedMeals[category].map((meal) => (
                                <View key={meal.id} style={styles.mealRow}>
                                    <Text style={styles.mealName}>{meal.name}</Text>
                                    <View style={styles.mealDetails}>
                                        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                                        {/* NOVO: Botão de excluir */}
                                        <Pressable onPress={() => handleDeleteMeal(meal.id)} style={styles.deleteButton}>
                                            <Text style={styles.deleteButtonText}>×</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* --- BOTÃO ADICIONAR (MODIFICADO) --- */}
                <Pressable
                    style={[styles.addButton, !isMobile && styles.addButtonDesktop]}
                    onPress={() => setModalVisible(true)} // MODIFICADO
                >
                    <Text style={styles.addButtonText}>Adicionar Refeição</Text>
                </Pressable>
            </ScrollView>

            {/* --- NOVO: MODAL DE ADICIONAR REFEIÇÃO --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Adicionar Refeição</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nome da Refeição (ex: Maçã)"
                            value={newMeal.name}
                            onChangeText={(text) => handleFormChange("name", text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Calorias (ex: 90)"
                            keyboardType="number-pad"
                            value={newMeal.calories}
                            onChangeText={(text) => handleFormChange("calories", text)}
                        />

                        {/* TODO: Implementar um Picker/Select para categoria */}
                        <TextInput
                            style={styles.input}
                            placeholder="Categoria (ex: Lanche)"
                            value={newMeal.category}
                            onChangeText={(text) => handleFormChange("category", text)}
                        />

                        <View style={styles.modalActions}>
                            <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={[styles.modalButton, styles.modalButtonAdd]} onPress={handleAddMeal}>
                                <Text style={styles.modalButtonText}>Adicionar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// --- ESTILOS (Adicionando estilos do Modal e Delete) ---
const styles = StyleSheet.create({
    // ... (Estilos anteriores)
    safeArea: { flex: 1, backgroundColor: "#F5F5DC" },
    scrollView: { flex: 1 },
    container: { paddingVertical: 20, paddingHorizontal: 16 },
    containerDesktop: { maxWidth: 800, alignSelf: "center" },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        marginTop: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    goalText: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#3D3D3D",
        textAlign: "center",
    },
    progressBar: {
        height: 16,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
        overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: "#A8D5BA" },
    progressText: {
        marginTop: 8,
        marginBottom: 12,
        color: "#3D3D3D",
        textAlign: "center",
        fontWeight: "600",
    },
    macros: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    macroItem: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EEE",
    },
    macroLabel: {
        color: "#3D3D3D",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
    },
    macroValue: {
        color: "#3D3D3D",
        fontSize: 14,
        fontWeight: "700",
    },
    mealGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 12,
    },
    mealSection: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: "48%", // ✅ two per row
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    mealCategory: {
        fontSize: 16,
        fontWeight: "700",
        color: "#3D3D3D",
        marginBottom: 8,
    },
    mealRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // MODIFICADO
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    mealName: {
        fontSize: 14,
        color: "#3D3D3D",
        flex: 1, // MODIFICADO
        flexShrink: 1,
        paddingRight: 8,
    },
    // NOVO: Container para calorias e botão de excluir
    mealDetails: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    mealCalories: {
        fontSize: 14,
        color: "#3D3D3D",
        fontWeight: "600",
    },
    // NOVO: Botão de excluir
    deleteButton: {
        backgroundColor: "#FFCDD2",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#D32F2F",
        fontWeight: "bold",
        fontSize: 16,
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: "#A8D5BA",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 16,
        alignSelf: "stretch",
    },
    addButtonDesktop: { alignSelf: "center", width: 280 },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // --- NOVOS ESTILOS DO MODAL ---
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        width: "90%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "#3D3D3D",
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 16,
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
    modalButtonCancel: {
        backgroundColor: "#E0E0E0",
    },
    modalButtonAdd: {
        backgroundColor: "#A8D5BA",
    },
    modalButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});