import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// --- Imports Locais ---
import { usePath } from '../../hooks/usePath';
import { basePutUnique, baseUniqueGet, basePutMultidata } from '../../services/baseCall';
import { syncUserRestrictions } from '../../utils/profileHelper';

// --- Imports de Constantes e Tipos (Ajuste os caminhos conforme seu projeto) ---
import { SERVER_URL } from '../../constants/config';
import { Gender, ActivityLvl, Objective, GenderLabels, ActivityLvlLabels, ObjectiveLabels } from '../../enum/profileEnum';
import { User } from '../../types/data';
// Assumindo que os labels estão em um arquivo de constantes:

// --- Imports de Componentes ---
import { EditableAvatar } from '../../components/editProfile/editableAvatar';
import { EditProfileHeader } from '../../components/editProfile/editProfileHeader';
import { FormField } from '../../components/editProfile/formField';
import { ImagePickerModal } from '../../components/editProfile/imagePickerModal';


// --- Configuration & Types ---
type Option = { label: string; value: string };
type FieldConfig = {
    key: keyof User;
    label: string;
    type: 'text' | 'number' | 'dropdown' | 'multi-select';
    options?: Option[];
    large: boolean;
};

// Função auxiliar para converter Enums em array de opções para dropdown
const enumToArray = (enumObj: any, labelsObj: any): Option[] => {
    return Object.values(enumObj).map((val: any) => ({
        label: labelsObj[val],
        value: val,
    }));
};

const restrictionOptions: Option[] = [
    { label: 'Vegano', value: 'VEGAN' },
    { label: 'Vegetariano', value: 'VEGETARIAN' },
    { label: 'Sem Glúten', value: 'GLUTEN_FREE' },
    { label: 'Sem Lactose', value: 'LACTOSE_FREE' },
];

const FIELDS: FieldConfig[] = [
    { key: 'name', label: 'Nome', type: 'text', large: false },
    { key: 'age', label: 'Idade', type: 'number', large: false },
    { key: 'email', label: 'Email', type: 'text', large: true },
    { key: 'weight', label: 'Peso (kg)', type: 'number', large: false },
    { key: 'height', label: 'Altura (cm)', type: 'number', large: false },
    { key: 'gender', label: 'Gênero', type: 'dropdown', options: enumToArray(Gender, GenderLabels), large: true },
    { key: 'activity_lvl', label: 'Atividade Física', type: 'dropdown', options: enumToArray(ActivityLvl, ActivityLvlLabels), large: true },
    { key: 'objective', label: 'Objetivo', type: 'dropdown', options: enumToArray(Objective, ObjectiveLabels), large: true },
    { key: 'restrictions', label: 'Restrições', type: 'multi-select', options: restrictionOptions, large: true },
];

export default function EditProfile() {
    const handlePath = usePath();

    const [modalVisible, setModalVisible] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [userData, setUserData] = useState<User>({
        active_plan_id: null, activity_lvl: null, age: null, created_at: '',
        email: '', gender: null, height: null, bmi: null, name: '', objective: null,
        updated_at: '', user_id: 0, weight: null, restrictions: null,
        profile_picture_url: null,
    });
    const [initialUserData, setInitialUserData] = useState<User | null>(null);

    const handlePickImage = async (mode: 'camera' | 'gallery') => {
        try {
            const permissionMethod = mode === 'camera'
                ? ImagePicker.requestCameraPermissionsAsync
                : ImagePicker.requestMediaLibraryPermissionsAsync;

            const { granted } = await permissionMethod();
            if (!granted) {
                Alert.alert("Permissão necessária", "Precisamos de acesso à câmera/galeria.");
                return;
            }

            const launchMethod = mode === 'camera'
                ? ImagePicker.launchCameraAsync
                : ImagePicker.launchImageLibraryAsync;

            const result = await launchMethod({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
                setModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            setModalVisible(false);
        }
    };

    const saveProfile = async () => {
        const changedData: Partial<User> = {};
        let restrictionsChanged = false;

        if (initialUserData) {
            FIELDS.forEach((f) => {
                const key = f.key as keyof User;
                const current = userData[key];
                const initial = initialUserData[key];

                if (key === 'restrictions' && Array.isArray(current) && Array.isArray(initial)) {
                    const currentStr = JSON.stringify((current || []).sort());
                    const initialStr = JSON.stringify((initial || []).sort());
                    if (currentStr !== initialStr) restrictionsChanged = true;
                }
                else if (current !== initial) {
                    (changedData as any)[key] = current;
                }
            });
        }

        if (Object.keys(changedData).length === 0 && !profileImage && !restrictionsChanged) {
            handlePath('/profile/seeProfile');
            return;
        }

        try {
            const numberFields = ["age", "weight", "height"] as const;

            numberFields.forEach((key) => {
                const val = (changedData as any)[key];

                if (val === undefined) return; // não mudou
                if (val === null || val === '') {
                    (changedData as any)[key] = null;
                    return;
                }

                const num = Number(val);
                if (!isNaN(num)) {
                    (changedData as any)[key] = num;
                } else {
                    (changedData as any)[key] = null;
                }
            });

            console.log("➡️ Payload final:", changedData);

            if (Object.keys(changedData).length > 0) {
                console.log('changedData', changedData);

                if ((changedData.height && !changedData.weight) || changedData.weight && !changedData.height) {
                    return Alert.alert("Atenção", "Para calcular o IMC, altura e peso devem ser preenchidos juntos.");
                }
                const res = await basePutUnique(`/users`, changedData);
                console.log("update:", res?.data);
            }
            if (restrictionsChanged) {
                await syncUserRestrictions(
                    userData.user_id,
                    userData.restrictions || [],
                    initialUserData?.restrictions || []
                );
            }

            if (profileImage) {
                await basePutMultidata(`/users/profile-picture`, profileImage);
            }

            handlePath('/profile/seeProfile');

        } catch (e) {
            console.error("❌ Erro ao salvar perfil:", e);
            Alert.alert("Erro", "Não foi possível salvar as alterações.");
        }
    };


    useEffect(() => {
        const load = async () => {
            try {
                const res = await baseUniqueGet('users');
                if (res?.data) {
                    const loadedData = { ...res.data };
                    if (loadedData.id && !loadedData.user_id) loadedData.user_id = loadedData.id;

                    // Converte números para string para exibição em campos de texto
                    if (loadedData.age !== null) loadedData.age = String(loadedData.age);
                    if (loadedData.weight !== null) loadedData.weight = String(loadedData.weight);
                    if (loadedData.height !== null) loadedData.height = String(loadedData.height);

                    setUserData(loadedData);
                    setInitialUserData(loadedData);
                }
            } catch (err) {
                console.log(err);
            }
        };
        load();
    }, []);

    return (
        <>
            <ScrollView style={{ flex: 1, backgroundColor: '#F5F5DC' }} contentContainerStyle={styles.container}>
                <EditProfileHeader onClose={() => handlePath('/profile/seeProfile')} />
                <EditableAvatar
                    name={userData.name}
                    age={userData.age ? String(userData.age) : ''}
                    imageUri={profileImage || (userData.profile_picture_url ? `${SERVER_URL}/${userData.profile_picture_url}` : null)}
                    onPress={() => setModalVisible(true)}
                />
                <View style={styles.formContainer}>
                    {FIELDS.map((field) => {
                        const rawValue = userData[field.key as keyof User];
                        return (
                            <FormField
                                key={field.key}
                                label={field.label}
                                value={rawValue}
                                type={field.type}
                                large={field.large}
                                options={field.options}
                                onChange={(val) => setUserData(prev => ({ ...prev, [field.key]: val }))}
                            />
                        );
                    })}
                </View>
                <Pressable style={styles.saveButton} onPress={saveProfile}>
                    <Text style={styles.saveButtonText}>Salvar Perfil</Text>
                </Pressable>
            </ScrollView>
            <ImagePickerModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                onPickImage={handlePickImage}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 50, paddingBottom: 40, alignItems: 'center', backgroundColor: "#F5F5DC" },
    formContainer: { width: '90%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 32,
        marginBottom: 20,
        width: '90%',
        alignItems: 'center',
        elevation: 4,
    },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});