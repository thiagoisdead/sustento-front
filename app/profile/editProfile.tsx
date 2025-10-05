import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants'
import { getItem } from '../../services/secureStore';
import { User, userSchema } from '../../types/data';
import { Avatar, IconButton, TextInput } from 'react-native-paper';
import HealthyPNG from "../../assets/rodrigo.jpg"
import { usePath } from '../../hooks/usePath';


export default function editProfile() {
    const back_url = Constants.expoConfig?.extra?.backUrl;
    const [userData, setUserData] = useState<User | null>(null)
    const handlePath = usePath();

    const fieldsSurface = [
        { label: 'Peso', value: userData?.weight, large: false },
        { label: 'Altura', value: userData?.height, large: false },
        { label: 'Gênero', value: userData?.gender, large: false },
        { label: 'Imc', value: userData?.bmi, large: false },
        { label: 'Atividade Física', value: userData?.activity_lvl, large: true },
        { label: 'Objetivo', value: userData?.objective, large: true },
        { label: 'Restrições', value: userData?.restrictions, large: true },
        { label: 'Email', value: userData?.email, large: true },
    ]

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
                setUserData(validatedUser)
                console.log(validatedUser)
            }
            catch (err) {
                console.log(err)
            }
        }
        fetchData()
    }, [])

    const saveProfile = () => {
        handlePath("/profile/seeProfile");
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#F5F5DC' }}
            contentContainerStyle={styles.container}
        >
            <IconButton
                icon="close"
                size={28}
                style={styles.closeButton}
                onPress={() => handlePath('/profile/seeProfile')}
            />
            <View>
                <Text style={styles.title}>Editar dados de perfil</Text>
            </View>
            <View style={styles.firstRow}>
                <View style={styles.icon}>
                    <Avatar.Image size={100} source={HealthyPNG}></Avatar.Image>
                </View>
                <View style={styles.textsFirstRow}>
                    <Text>{userData?.name ? userData.name : "Não informado"}</Text>
                    <Text>{userData?.age ? userData.name : "Não informado"} Anos</Text>
                </View>
            </View>



            <View style={styles.surfaceTexts}>
                {fieldsSurface.map((field, index) => (
                    <TextInput
                        key={index}
                        style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}
                        label={field.label}
                        value={field.value ? String(field.value) : ""}
                        placeholderTextColor="#2E7D32"
                        onChangeText={(text) => {
                            setUserData((prev) =>
                                prev ? { ...prev, [field.label.toLowerCase()]: text } : prev
                            );
                        }}
                    />
                ))}

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
        backgroundColor: "#F5F5DC",
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
    surfaceItem: {
        width: '48%',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderStartColor: '#2E7D32',
        borderStartWidth: 6,
    },
    surfaceItemLarge: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderStartColor: '#2E7D32',
        borderStartWidth: 6,
    },
    input: {
        fontSize: 14,
        height: 45,
        backgroundColor: '#FFFFFF',
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


