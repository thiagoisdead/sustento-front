import { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Alert
} from 'react-native';
import { Avatar, IconButton, Surface, TextInput, Modal, Portal, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

// Imports de Assets e Hooks
import HealthyPNG from '../../assets/rodrigo.jpg';
import { usePath } from '../../hooks/usePath';

// Imports de Serviços (Certifique-se de que basePutMultidata está exportado no seu arquivo baseCall)
import { basePutUnique, baseUniqueGet, basePutMultidata } from '../../services/baseCall';
import { User } from '../../types/data';

// Imports de Enums
import {
    ActivityLvl,
    ActivityLvlLabels,
    Gender,
    GenderLabels,
    Objective,
    ObjectiveLabels,
} from '../../enum/profileEnum';

// --- Tipos ---
type Option = { label: string; value: string };
type Field = {
    key: keyof User;
    label: string;
    type: 'text' | 'number' | 'dropdown' | 'multi-select';
    options?: Option[];
    large: boolean;
};

export default function EditProfile() {
    const handlePath = usePath();
    const screenWidth = Dimensions.get('window').width;
    const isSmallScreen = screenWidth < 400;

    // --- States ---
    const [modalVisible, setModalVisible] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [userData, setUserData] = useState<User>({
        active_plan_id: null, activity_lvl: null, age: null, created_at: '',
        email: '', gender: null, height: null, bmi: null, name: '', objective: null,
        updated_at: '', user_id: 0, weight: null, restrictions: null,
        profile_picture_url: null,
    });
    const [initialUserData, setInitialUserData] = useState<User | null>(null);

    // --- Helpers de Enum ---
    const enumToArray = <
        T extends Record<string, string>,
        L extends Record<T[keyof T], string>
    >(
        enumObject: T,
        labelsObject: L
    ): Option[] => {
        return (Object.values(enumObject) as Array<T[keyof T]>).map((value) => ({
            label: labelsObject[value],
            value,
        }));
    };

    const restrictionOptions: Option[] = [
        { label: 'Vegano', value: 'VEGAN' }, { label: 'Vegetariano', value: 'VEGETARIAN' },
        { label: 'Sem Glúten', value: 'GLUTEN_FREE' }, { label: 'Sem Lactose', value: 'LACTOSE_FREE' },
    ];

    const fieldsSurface: Field[] = [
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

    // --- Funções de Imagem ---
    const showModal = () => setModalVisible(true);
    const hideModal = () => setModalVisible(false);

    const pickImage = async (mode: 'camera' | 'gallery') => {
        try {
            let result;
            const options: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            };

            if (mode === 'camera') {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
                    return;
                }
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
                hideModal();
            }
        } catch (error) {
            console.error("Erro ao selecionar imagem:", error);
            hideModal();
        }
    };

    // --- Função Principal: Salvar Perfil ---
    const saveProfile = async () => {
        // 1. Identifica mudanças nos campos de TEXTO
        const changedData: Partial<User> = {};
        if (initialUserData) {
            const editableKeys: Array<keyof User> = fieldsSurface.map((f) => f.key);
            editableKeys.forEach((key) => {
                const currentValue = userData[key];
                const initialValue = initialUserData[key];

                if (Array.isArray(currentValue) || Array.isArray(initialValue)) {
                    const currentStr = JSON.stringify((currentValue || []).sort());
                    const initialStr = JSON.stringify((initialValue || []).sort());
                    if (currentStr !== initialStr) changedData[key] = currentValue;
                } else if (currentValue !== initialValue) {
                    changedData[key] = currentValue;
                }
            });
        }

        // Se nada mudou (nem texto, nem imagem), sai.
        if (Object.keys(changedData).length === 0 && !profileImage) {
            handlePath('/profile/seeProfile');
            return;
        }

        try {
            // A) Salva dados de TEXTO (JSON)
            if (Object.keys(changedData).length > 0) {
                const payload = { ...changedData };
                // Limpeza de campos vazios para null
                if (payload.age !== undefined) payload.age = payload.age === null || String(payload.age).trim() === '' ? null : String(payload.age);
                if (payload.weight !== undefined) payload.weight = payload.weight === null || String(payload.weight).trim() === '' ? null : String(payload.weight);
                if (payload.height !== undefined) payload.height = payload.height === null || String(payload.height).trim() === '' ? null : String(payload.height);

                await basePutUnique(`/users`, payload);
            }

            // B) Salva IMAGEM (FormData/Multipart)
            if (profileImage) {
                await basePutMultidata(`/users/profile-picture`, profileImage);
            }

            // Sucesso
            handlePath('/profile/seeProfile');

        } catch (e) {
            console.error('Erro ao salvar perfil:', e);
            Alert.alert("Erro", "Não foi possível salvar as alterações.");
        }
    };

    const fetchData = async () => {
        try {
            const response = await baseUniqueGet('users');
            if (response) {
                const rawData = { ...response.data };
                setUserData(rawData);
                setInitialUserData(rawData);
            }
        } catch (err) { console.log(err); }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <>
            <ScrollView style={{ flex: 1, backgroundColor: '#F5F5DC' }} contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={{ width: 32 }} />
                    <Text style={styles.title}>Editar Perfil</Text>
                    <IconButton icon="close" size={28} onPress={() => handlePath('/profile/seeProfile')} />
                </View>

                {/* --- Área do Avatar --- */}
                <View style={styles.firstRow}>
                    <View style={styles.icon}>
                        <Pressable onPress={showModal} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>

                            {/* LÓGICA DE EXIBIÇÃO DA IMAGEM */}
                            <Avatar.Image
                                size={100}
                                source={(() => {
                                    // 1. Se o usuário acabou de escolher uma foto nova na galeria/câmera
                                    if (profileImage) {
                                        return { uri: profileImage };
                                    }

                                    // 2. Se o usuário já tem uma foto salva no banco de dados
                                    // IMPORTANTE: Verifique se userData.profile_picture é a URL completa.
                                    // Se for só o nome do arquivo, faça: { uri: `http://SEU_IP:3000/uploads/${userData.profile_picture}` }
                                    if (userData?.profile_picture_url) {
                                        return { uri: "http://192.168.1.105:3000/" + userData.profile_picture_url };
                                    }

                                    // 3. Imagem padrão (Bonequinho)
                                    return HealthyPNG;
                                })()}
                            />

                            {/* Badge de Edição */}
                            <View style={styles.editIconBadge}>
                                <IconButton icon="camera" iconColor="#fff" size={14} style={{ margin: 0 }} />
                            </View>
                        </Pressable>
                    </View>
                    <View style={styles.textsFirstRow}>
                        <Text style={styles.name}>{userData?.name || 'Carregando...'}</Text>
                        <Text style={styles.age}>{userData?.age ? `${userData.age} Anos` : ''}</Text>
                        <Pressable onPress={showModal}>
                            <Text style={{ color: '#2E7D32', fontWeight: 'bold', marginTop: 8 }}>Alterar foto</Text>
                        </Pressable>
                    </View>
                </View>

                {/* --- Formulário --- */}
                <View style={styles.surfaceTexts}>
                    {fieldsSurface.map((field) => {
                        const value = userData[field.key];

                        if (field.type === 'dropdown') {
                            return (
                                <Surface key={String(field.key)} style={field.large ? styles.surfaceItemLarge : [styles.surfaceItem, { width: isSmallScreen ? '100%' : '48%' }]}>
                                    <Text style={styles.surfaceLabel}>{field.label}</Text>
                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={value}
                                            onValueChange={(val) => setUserData((prev) => ({ ...prev, [field.key]: val }))}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Selecione..." value={null} />
                                            {field.options?.map((opt) => (<Picker.Item key={opt.value} label={opt.label} value={opt.value} />))}
                                        </Picker>
                                    </View>
                                </Surface>
                            );
                        }

                        if (field.type === 'multi-select') {
                            const selectedValues: string[] = Array.isArray(value) ? value : [];
                            return (
                                <Surface key={String(field.key)} style={styles.surfaceItemLarge}>
                                    <Text style={styles.surfaceLabel}>{field.label}</Text>
                                    <View style={styles.multiSelectContainer}>
                                        {field.options?.map((opt) => {
                                            const isSelected = selectedValues.includes(opt.value);
                                            return (
                                                <Pressable key={opt.value} onPress={() => { setUserData((prev) => { const current = Array.isArray(prev[field.key]) ? prev[field.key] as string[] : []; return isSelected ? { ...prev, [field.key]: current.filter((v) => v !== opt.value) } : { ...prev, [field.key]: [...current, opt.value] }; }); }} style={[styles.chipBase, isSelected ? styles.chipSelected : styles.chipUnselected]}>
                                                    <Text style={isSelected ? styles.chipTextSelected : styles.chipTextUnselected}>{opt.label}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </Surface>
                            );
                        }

                        // Inputs Normais
                        return (
                            <Surface key={String(field.key)} style={field.large ? styles.surfaceItemLarge : [styles.surfaceItem, { width: isSmallScreen ? '100%' : '48%' }]}>
                                <TextInput
                                    label={field.label}
                                    value={value !== null && value !== undefined ? String(value) : ''}
                                    onChangeText={(text) => { setUserData((prev) => ({ ...prev, [field.key]: text })); }}
                                    keyboardType={field.type === 'number' ? 'decimal-pad' : 'default'}
                                    style={styles.textInput}
                                    underlineColor="transparent"
                                    activeUnderlineColor="#2E7D32"
                                />
                            </Surface>
                        );
                    })}
                </View>

                <Pressable style={styles.btnBase} onPress={saveProfile}>
                    <Text style={styles.btnText}>Salvar perfil</Text>
                </Pressable>
            </ScrollView>

            {/* --- Modal Popup --- */}
            <Portal>
                <Modal visible={modalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Alterar Foto de Perfil</Text>

                    <Button
                        icon="camera"
                        mode="contained"
                        onPress={() => pickImage('camera')}
                        style={styles.modalBtn}
                        buttonColor="#2E7D32"
                    >
                        Tirar Foto
                    </Button>

                    <Button
                        icon="image"
                        mode="outlined"
                        onPress={() => pickImage('gallery')}
                        style={styles.modalBtn}
                        textColor="#2E7D32"
                        theme={{ colors: { outline: '#2E7D32' } }}
                    >
                        Escolher da Galeria
                    </Button>

                    <Button onPress={hideModal} textColor="#666" style={{ marginTop: 10 }}>
                        Cancelar
                    </Button>
                </Modal>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: "#F5F5DC" },
    header: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#212121' },
    firstRow: { width: '100%', padding: 10, flexDirection: 'row', marginVertical: 20, alignItems: 'center' },

    // Icon Container
    icon: { width: '35%', alignItems: 'center', justifyContent: 'center', position: 'relative' },

    textsFirstRow: { width: '65%', justifyContent: 'center', paddingLeft: 10 },
    name: { fontSize: 18, fontWeight: '600', color: '#212121' },
    age: { fontSize: 16, color: '#616161', marginTop: 4 },
    surfaceTexts: { width: '90%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },

    surfaceItem: { borderRadius: 12, backgroundColor: '#FFFFFF', borderStartColor: '#2E7D32', borderStartWidth: 6, height: 75, justifyContent: 'center', paddingHorizontal: 10 },
    surfaceItemLarge: { width: '100%', borderRadius: 12, backgroundColor: '#FFFFFF', borderStartColor: '#2E7D32', borderStartWidth: 6, minHeight: 75, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 8 },
    surfaceLabel: { fontSize: 14, fontWeight: '600', color: '#2E7D32', marginBottom: 4, paddingHorizontal: 4 },
    textInput: { backgroundColor: 'transparent', height: 55 },
    pickerWrapper: { height: 50, justifyContent: 'center', marginHorizontal: -4 },
    picker: { width: '100%', transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [] },
    multiSelectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    chipBase: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
    chipSelected: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    chipUnselected: { backgroundColor: '#E0E0E0', borderColor: '#BDBDBD' },
    chipTextSelected: { color: '#FFFFFF' },
    chipTextUnselected: { color: '#000000' },
    btnBase: { backgroundColor: '#4CAF50', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10, marginVertical: 32, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

    // --- Estilos do Modal e Badge ---
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2E7D32',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F5F5DC',
        elevation: 2
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        margin: 20,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 5
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#212121'
    },
    modalBtn: {
        width: '100%',
        marginVertical: 6,
    }
});