import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// --- Imports ---
import { usePath } from '../../hooks/usePath';
import { basePutUnique, baseUniqueGet, basePutMultidata } from '../../services/baseCall';
import { User } from '../../types/data';
import { ActivityLvl, ActivityLvlLabels, Gender, GenderLabels, Objective, ObjectiveLabels } from '../../enum/profileEnum';
import { SERVER_URL } from '../../constants/config';

import { EditableAvatar } from '../../components/editProfile/editableAvatar';
import { EditProfileHeader } from '../../components/editProfile/editProfileHeader';
import { FormField } from '../../components/editProfile/formField';
import { syncUserRestrictions } from '../../utils/profileHelper';
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

    // --- State ---
    const [modalVisible, setModalVisible] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Full object initialization to avoid undefined errors
    const [userData, setUserData] = useState<User>({
        active_plan_id: null, activity_lvl: null, age: null, created_at: '',
        email: '', gender: null, height: null, bmi: null, name: '', objective: null,
        updated_at: '', user_id: 0, weight: null, restrictions: null,
        profile_picture_url: null,
    });
    const [initialUserData, setInitialUserData] = useState<User | null>(null);

    // --- 1. Image Picker Logic ---
    const handlePickImage = async (mode: 'camera' | 'gallery') => {
        try {
            const permissionMethod = mode === 'camera'
                ? ImagePicker.requestCameraPermissionsAsync
                : ImagePicker.requestMediaLibraryPermissionsAsync;

            const { granted } = await permissionMethod();
            if (!granted) {
                Alert.alert("Permissão necessária", "Precisamos de permissão para acessar a câmera/galeria.");
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

    // --- 2. Save Logic ---
    const saveProfile = async () => {
        const changedData: Partial<User> = {};
        let restrictionsChanged = false;

        // Diffing Logic
        if (initialUserData) {
            FIELDS.forEach((f) => {
                const current = userData[f.key];
                const initial = initialUserData[f.key];

                // Handle Arrays (Restrictions)
                if (f.key === 'restrictions' && Array.isArray(current) && Array.isArray(initial)) {
                    const currentStr = JSON.stringify((current || []).sort());
                    const initialStr = JSON.stringify((initial || []).sort());

                    if (currentStr !== initialStr) {
                        restrictionsChanged = true;
                        // We DO NOT add 'restrictions' to changedData for the PUT /users call,
                        // because we handle it via the helper below.
                    }
                }
                // Handle Primitives
                else if (current !== initial) {
                    changedData[f.key] = current;
                }
            });
        }

        // Validation: if nothing changed, exit
        if (Object.keys(changedData).length === 0 && !profileImage && !restrictionsChanged) {
            handlePath('/profile/seeProfile');
            return;
        }

        try {
            // A) Save Text Data (PUT /users)
            if (Object.keys(changedData).length > 0) {
                const payload = { ...changedData };

                // Clean empty strings for numeric fields
                if (payload.age !== undefined) payload.age = payload.age === null || String(payload.age).trim() === '' ? null : String(payload.age);
                if (payload.weight !== undefined) payload.weight = payload.weight === null || String(payload.weight).trim() === '' ? null : String(payload.weight);
                if (payload.height !== undefined) payload.height = payload.height === null || String(payload.height).trim() === '' ? null : String(payload.height);

                await basePutUnique(`/users`, payload);
            }

            // B) Save Restrictions (Helper Logic: Add/Remove IDs)
            if (restrictionsChanged && userData.restrictions) {
                await syncUserRestrictions(
                    userData.user_id,
                    userData.restrictions,       // Current
                    initialUserData?.restrictions || [] // Initial
                );
            }

            // C) Save Image (PUT /profile-picture)
            if (profileImage) {
                await basePutMultidata(`/users/profile-picture`, profileImage);
            }

            handlePath('/profile/seeProfile');
        } catch (e) {
            console.error('Erro ao salvar perfil:', e);
            Alert.alert("Erro", "Não foi possível salvar as alterações.");
        }
    };

    // --- 3. Fetch Logic ---
    useEffect(() => {
        const load = async () => {
            try {
                const res = await baseUniqueGet('users');
                if (res?.data) {
                    const loadedData = { ...res.data };
                    // Convert numbers to strings for inputs
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
                    imageUri={
                        profileImage
                        || (userData.profile_picture_url ? `${SERVER_URL}/${userData.profile_picture_url}` : null)
                    }
                    onPress={() => setModalVisible(true)}
                />

                <View style={styles.formContainer}>
                    {FIELDS.map((field) => (
                        <FormField
                            key={field.key}
                            label={field.label}
                            value={userData[field.key]}
                            type={field.type}
                            large={field.large}
                            options={field.options}
                            onChange={(val) => setUserData(prev => ({ ...prev, [field.key]: val }))}
                        />
                    ))}
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
    container: {
        paddingTop: 50,
        paddingBottom: 30,
        alignItems: 'center',
        backgroundColor: "#F5F5DC",
    },
    formContainer: {
        width: '90%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        marginVertical: 32,
        width: '90%',
        alignItems: 'center',
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});