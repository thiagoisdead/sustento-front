import { useEffect, useState } from 'react';
import { Button, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants'
import { getItem } from '../../services/secureStore';
import { User, userSchema } from '../../types/data';
import { Avatar, IconButton, Surface, TextInput } from 'react-native-paper';
import HealthyPNG from "../../assets/rodrigo.jpg"
import { usePath } from '../../hooks/usePath';
import { Picker } from '@react-native-picker/picker';


export default function editProfile() {
    const back_url = Constants.expoConfig?.extra?.backUrl;
    const [userData, setUserData] = useState<User>({
        active_plan_id: null,
        activity_lvl: null,
        age: "",
        created_at: "",
        email: "",
        gender: null,
        height: null,
        bmi: null,
        name: "",
        objective: null,
        updated_at: "",
        user_id: 0,
        weight: "",
        restrictions: [],
    });
    const handlePath = usePath();

    const genderOptions = [
        { label: "Masculino", value: "M" },
        { label: "Feminino", value: "F" },
    ];
    const objectiveOptions = [
        { label: "Perder Peso", value: "LOSE_WEIGHT" },
        { label: "Ganhar Massa", value: "GAIN_MUSCLE" },
        { label: "Manutenção", value: "MAINTENANCE" },
    ];
    const activityOptions = [
        { label: "Sedentário", value: "SEDENTARY" },
        { label: "Levemente Ativo", value: "LIGHTLY_ACTIVE" },
        { label: "Moderadamente Ativo", value: "MODERATELY_ACTIVE" },
        { label: "Ativo", value: "ACTIVE" },
        { label: "Muito Ativo", value: "VERY_ACTIVE" },
    ];
    const restrictionOptions = [
        { label: "Vegano", value: "VEGAN" },
        { label: "Vegetariano", value: "VEGETARIAN" },
        { label: "Sem Glúten", value: "GLUTEN_FREE" },
        { label: "Sem Lactose", value: "LACTOSE_FREE" },
    ];

    // Corrigi aqui para usar a chave correta 'restrictions' para o multi-select
    const fieldsSurface = [
        { key: "name", label: "Nome", type: "text", large: false },
        { key: "age", label: "Idade", type: "number", large: false },
        { key: "email", label: "Email", type: "text", large: false },
        { key: "weight", label: "Peso (kg)", type: "number", large: false },
        { key: "height", label: "Altura (cm)", type: "number", large: false },
        { key: "gender", label: "Gênero", type: "dropdown", options: genderOptions, large: false },
        { key: "activity_lvl", label: "Atividade Física", type: "dropdown", options: activityOptions, large: true },
        { key: "objective", label: "Objetivo", type: "dropdown", options: objectiveOptions, large: true },
        { key: "restrictions", label: "Restrições", type: "multi-select", options: restrictionOptions, large: true },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const id = await getItem('id');
            const token = await getItem('token');
            try {
                const fetchUser = await axios.get(`${back_url}/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const validatedUser = userSchema.parse(fetchUser.data);
                // Garante que 'restrictions' nunca seja null para evitar erros no multi-select
                setUserData({ ...validatedUser, restrictions: validatedUser.restrictions || null });
            }
            catch (err) {
                console.error("Erro ao buscar dados do usuário:", err)
            }
        }
        fetchData()
    }, [])

    const saveProfile = async () => {
        const id = await getItem('id');
        const token = await getItem('token');
        try {
            console.log("Enviando dados para salvar:", userData);
            await axios.put(`${back_url}/users/${id}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            handlePath("/profile/seeProfile");
        } catch (e) {
            console.error("Erro ao salvar perfil:", e);
        }
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#ece1c3' }}
            contentContainerStyle={styles.container}
        >
            <IconButton
                icon="close"
                size={28}
                style={styles.closeButton}
                onPress={() => handlePath('/profile/seeProfile')}
            />
            <View>
                {/* Título melhorado, vindo da ideia do Juninho */}
                <Text style={styles.title}>Editar Dados de Perfil</Text>
            </View>
            <View style={styles.firstRow}>
                <View style={styles.icon}>
                    <Avatar.Image size={100} source={HealthyPNG}></Avatar.Image>
                </View>
                <View style={styles.textsFirstRow}>
                    <Text style={styles.profileText}>{userData?.name ? userData.name : "Não informado"}</Text>
                    {/* Código corrigido para exibir a idade corretamente */}
                    <Text style={styles.profileText}>{userData?.age ? `${userData.age} Anos` : "Idade não informada"}</Text>
                </View>
            </View>

            <View style={styles.surfaceTexts}>
                {fieldsSurface.map((field) => {
                    // Usando 'keyof User' para garantir que a chave existe no objeto
                    const value = userData[field.key as keyof User];

                    if (field.type === "dropdown") {
                        return (
                            <View key={field.key} style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}>
                                <Text style={styles.surfaceLabel}>{field.label}</Text>
                                <Picker
                                    selectedValue={value as string | null}
                                    onValueChange={(val) => setUserData((prev) => ({ ...prev, [field.key]: val }))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Selecione..." value={null} />
                                    {field.options!.map((opt) => (
                                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                                    ))}
                                </Picker>
                            </View>
                        );
                    }

                    if (field.type === "multi-select") {
                        const selectedValues = (userData.restrictions || []) as string[];
                        return (
                            <View key={field.key} style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}>
                                <Text style={styles.surfaceLabel}>{field.label}</Text>
                                <View style={styles.multiSelectContainer}>
                                    {field.options!.map((opt) => {
                                        const isSelected = selectedValues.includes(opt.value);
                                        return (
                                            <Pressable
                                                key={opt.value}
                                                onPress={() => {
                                                    setUserData((prev) => {
                                                        const current = prev.restrictions || [];
                                                        const newRestrictions = isSelected
                                                            ? current.filter((v: string) => v !== opt.value)
                                                            : [...current, opt.value];
                                                        return { ...prev, restrictions: newRestrictions };
                                                    });
                                                }}
                                                style={[styles.multiSelectItem, { backgroundColor: isSelected ? '#2E7D32' : '#E0E0E0' }]}
                                            >
                                                <Text style={{ color: isSelected ? '#fff' : '#000' }}>{opt.label}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    }

                    // numeric or text
                    return (
                        <View key={field.key} style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}>
                            <TextInput
                                label={field.label}
                                style={styles.textInput}
                                value={value !== null && value !== undefined ? String(value) : ""}
                                keyboardType={field.type === "number" ? "numeric" : "default"}
                                onChangeText={(text) => {
                                    setUserData((prev) => ({ ...prev, [field.key]: text }));
                                }}
                            />
                        </View>
                    );
                })}
            </View>

            <View>
                <Pressable
                    style={(state: any) => [
                        styles.btnBase,
                        state.hovered && styles.btnHover,
                        state.pressed && styles.btnPressed,
                    ]}
                    onPress={saveProfile}
                >
                    <Text style={styles.btnText}>Salvar perfil</Text>
                </Pressable>
            </View>
        </ScrollView >
    );
}

// Estilos melhorados e centralizados
const styles = StyleSheet.create({
    container: {
        paddingVertical: 50,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: "#F5F5DC",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
    },
    firstRow: {
        width: '95%',
        flexDirection: 'row',
        marginBottom: 30,
        alignItems: 'center',
    },
    icon: {
        marginRight: 20,
    },
    textsFirstRow: {
        justifyContent: 'center',
    },
    profileText: {
        fontSize: 16,
        color: '#333',
    },
    surfaceTexts: {
        width: '95%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    surfaceLabel: {
        fontSize: 12,
        color: '#666',
        marginLeft: 15,
        marginBottom: -5
    },
    surfaceItemShared: {
        paddingTop: 9,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderLeftColor: '#2E7D32',
        borderLeftWidth: 6,
        justifyContent: 'center',
        height: 70, // Altura padronizada
    },
    surfaceItem: {
        width: '48%',
    },
    surfaceItemLarge: {
        width: '100%',
    },
    textInput: {
        backgroundColor: "transparent",
        height: 50,
    },
    picker: {
        width: '100%',
        height: 50,
        // Reset de estilo para se parecer com o TextInput
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    multiSelectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 10,
        paddingTop: 5,
    },
    multiSelectItem: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    btnBase: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        marginVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    btnHover: {
        backgroundColor: '#66BB6A',
    },
    btnPressed: {
        backgroundColor: '#1B5E20',
    },
    btnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
