import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants'
import { getItem } from '../../services/secureStore';
import { Avatar, IconButton, TextInput } from 'react-native-paper';
import HealthyPNG from "../../assets/rodrigo.jpg"
import { usePath } from '../../hooks/usePath';
import { Picker } from '@react-native-picker/picker';
import { User, userSchema } from '../../types/data';
import { ActivityLvl, ActivityLvlLabels, Gender, GenderLabels, Objective, ObjectiveLabels } from '../enum/profileEnum';
import { baseUniqueGet } from '../../services/baseCall';

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
        restrictions: null,
    });
    const handlePath = usePath();

    const enumToArray = (enumObject: any, labelsObject: any) => {
        // Itera sobre os VALORES do Enum (ex: 'MALE', 'FEMALE')
        return Object.values(enumObject).map((value) => ({
            // Usa o valor do Enum para buscar o label em português no objeto de Labels
            label: labelsObject[value as keyof typeof labelsObject] || value,
            value: value,
        }));
    };

    const restrictionOptions = [
        { label: "Vegano", value: "VEGAN" },
        { label: "Vegetariano", value: "VEGETARIAN" },
        { label: "Sem Glúten", value: "GLUTEN_FREE" },
        { label: "Sem Lactose", value: "LACTOSE_FREE" },
    ];

    const fieldsSurface = [
        { key: "name", label: "Nome", type: "text", large: false },
        { key: "age", label: "Idade", type: "number", large: false },
        { key: "email", label: "Email", type: "text", large: false },
        { key: "weight", label: "Peso", type: "number", large: false },
        { key: "height", label: "Altura", type: "number", large: false },
        { key: "gender", label: "Gênero", type: "dropdown", options: enumToArray(Gender, GenderLabels), large: false },
        { key: "activity_lvl", label: "Atividade Física", type: "dropdown", options: enumToArray(ActivityLvl, ActivityLvlLabels), large: false },
        { key: "objective", label: "Objetivo", type: "dropdown", options: enumToArray(Objective, ObjectiveLabels), large: false },
        { key: "restrictions", label: "Restrições", type: "multi-select", options: restrictionOptions, large: true },
    ];

    const fetchData = async () => {
        try {
            const response = await baseUniqueGet('users');
            if (response) {
                const rawData = { ...response.data };
                rawData.age = rawData.age !== null && rawData.age !== undefined ? String(rawData.age) : "";
                setUserData(rawData);
                const validatedUser = userSchema.parse(rawData);
                console.log("Validated user (backend-friendly):", validatedUser);
                console.log("Frontend-ready user:", rawData);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const saveProfile = async () => {
        const id = await getItem('id');
        const token = await getItem('token');
        try {
            console.log(userData);
            const fetchUser = await axios.put(`${back_url}/users/${id}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(fetchUser.data);
        } catch (e) {
            console.error(e);
        }
        handlePath("/profile/seeProfile");
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
                <Text style={styles.title}>Dados de Perfil</Text>
            </View>
            <View style={styles.firstRow}>
                <View style={styles.icon}>
                    <Avatar.Image size={100} source={HealthyPNG}></Avatar.Image>
                </View>
                <View style={styles.textsFirstRow}>
                    <Text>{userData?.name ? userData.name : "Não informado"}</Text>
                    <Text>{userData?.age ? userData.age : "Não informado"} Anos</Text>
                </View>
            </View>
            <View style={styles.surfaceTexts}>
                {fieldsSurface.map((field) => {
                    const value = userData[field.key];

                    if (field.type === "dropdown") {
                        // Não é mais necessário verificar o field.key para o gender,
                        // pois a função enumToArray já aplica o label em português para todos.
                        return (
                            <View key={field.key} style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}>
                                <Text style={styles.surfaceLabel}>{field.label}</Text>
                                <Picker
                                    selectedValue={value}
                                    onValueChange={(val) => setUserData((prev) => ({ ...prev, [field.key]: val }))}
                                    style={{ height: 35, width: '95%', borderWidth: 0, marginLeft: 6 }} // match TextInput height
                                >
                                    <Picker.Item label="Selecione..." value={null} />
                                    {field.options.map((opt) => (
                                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                                    ))}
                                </Picker>

                            </View>
                        );
                    }

                    if (field.type === "multi-select") {
                        const selectedValues = userData[field.key] || []; // assuming array for multi-select
                        return (
                            <View key={field.key} style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}>
                                <Text style={styles.surfaceLabel}>{field.label}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginLeft: 10, marginTop: 5 }}>
                                    {field.options.map((opt) => {
                                        const isSelected = selectedValues.includes(opt.value);
                                        return (
                                            <Pressable
                                                key={opt.value}
                                                onPress={() => {
                                                    setUserData((prev) => {
                                                        const current = prev[field.key] || [];
                                                        if (isSelected) {
                                                            // remove
                                                            return { ...prev, [field.key]: current.filter((v: string) => v !== opt.value) };
                                                        } else {
                                                            // add
                                                            return { ...prev, [field.key]: [...current, opt.value] };
                                                        }
                                                    });
                                                }}
                                                style={{
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 5,
                                                    borderRadius: 20,
                                                    backgroundColor: isSelected ? '#2E7D32' : '#E0E0E0',
                                                }}
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
                                key={field.key}
                                label={field.label}
                                style={{ backgroundColor: "transparent", borderWidth: 0, width: "95%", marginLeft: 10 }}
                                value={value !== null && value !== undefined ? String(value) : ""}
                                keyboardType={field.type === "number" ? (Platform.OS === "web" ? "default" : "decimal-pad") : "default"}
                                onChangeText={(text) => {
                                    setUserData((prev) => {
                                        if (field.type === "number") {
                                            if (/^\d*\.?\d*$/.test(text)) {
                                                const parsed = text === "" ? null : parseFloat(text);
                                                return { ...prev, [field.key]: parsed };
                                            }
                                            return prev;
                                        }
                                        return { ...prev, [field.key]: text };
                                    });
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

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: "F5F5DC",
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
    },
    firstRow: {
        width: '100%',
        padding: 5,
        flexDirection: 'row',
        marginVertical: 30,
        alignItems: 'center',
    },
    icon: {
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textsFirstRow: {
        width: '65%',
        justifyContent: 'center',
        paddingLeft: 10,
    },
    surfaceTexts: {
        width: '90%',
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    surfaceLabel: {
        margin: 5,
        marginLeft: 10
    },
    surfaceItem: {
        width: '48%',
        height: 90,
        paddingTop: 9,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderStartColor: '#2E7D32',
        borderStartWidth: 6,
    },
    surfaceItemLarge: {
        width: '100%',
        height: 90,
        paddingTop: 9,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderStartColor: '#2E7D32',
        borderStartWidth: 6,
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
