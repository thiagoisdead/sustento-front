import { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Avatar, IconButton, Surface, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

import HealthyPNG from '../../assets/rodrigo.jpg';
import { usePath } from '../../hooks/usePath';
import { basePutUnique, baseUniqueGet } from '../../services/baseCall';
import { User } from '../../types/data';
import {
    ActivityLvl,
    ActivityLvlLabels,
    Gender,
    GenderLabels,
    Objective,
    ObjectiveLabels,
} from '../../enum/profileEnum';

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

    const [userData, setUserData] = useState<User>({
        active_plan_id: null, activity_lvl: null, age: null, created_at: '',
        email: '', gender: null, height: null, bmi: null, name: '', objective: null,
        updated_at: '', user_id: 0, weight: null, restrictions: null,
    });
    const [initialUserData, setInitialUserData] = useState<User | null>(null);

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

    const saveProfile = async () => {
        if (!initialUserData) return;
        const changedData: Partial<User> = {};
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
        if (Object.keys(changedData).length === 0) {
            handlePath('/profile/seeProfile');
            return;
        }
        const payload = { ...changedData };
        if (payload.age !== undefined) payload.age = payload.age === null || String(payload.age).trim() === '' ? null : Number(payload.age);
        if (payload.weight !== undefined) payload.weight = payload.weight === null || String(payload.weight).trim() === '' ? null : Number(payload.weight);
        if (payload.height !== undefined) payload.height = payload.height === null || String(payload.height).trim() === '' ? null : Number(payload.height);
        try {
            const putData = await basePutUnique(`/users/${userData.user_id}`, payload);
            if (putData && (putData.status === 200 || putData.status === 201)) {
                handlePath('/profile/seeProfile');
            }
        } catch (e) { console.error('Erro ao salvar perfil:', e); }
    };

    const fetchData = async () => {
        try {
            const response = await baseUniqueGet('users');
            if (response) {
                const rawData = { ...response.data };
                rawData.age = rawData.age !== null ? String(rawData.age) : null;
                rawData.weight = rawData.weight !== null ? String(rawData.weight) : null;
                rawData.height = rawData.height !== null ? String(rawData.height) : null;
                setUserData(rawData);
                setInitialUserData(rawData);
            }
        } catch (err) { console.log(err); }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F5F5DC' }} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={{ width: 32 }} />
                <Text style={styles.title}>Editar Perfil</Text>
                <IconButton icon="close" size={28} onPress={() => handlePath('/profile/seeProfile')} />
            </View>

            <View style={styles.firstRow}>
                <View style={styles.icon}><Avatar.Image size={100} source={HealthyPNG} /></View>
                <View style={styles.textsFirstRow}>
                    <Text style={styles.name}>{userData?.name || 'Carregando...'}</Text>
                    <Text style={styles.age}>{userData?.age ? `${userData.age} Anos` : ''}</Text>
                </View>
            </View>

            <View style={styles.surfaceTexts}>
                {fieldsSurface.map((field) => {
                    const value = userData[field.key];
                    if (field.type === 'dropdown') {
                        return (
                            <Surface key={String(field.key)} style={field.large ? styles.surfaceItemLarge : [styles.surfaceItem, { width: isSmallScreen ? '100%' : '48%' }]}>
                                <Text style={styles.surfaceLabel}>{field.label}</Text>
                                {/* O View wrapper é a chave para o layout correto do Picker */}
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
                    return (
                        <Surface key={String(field.key)} style={field.large ? styles.surfaceItemLarge : [styles.surfaceItem, { width: isSmallScreen ? '100%' : '48%' }]}>
                            {/* TextInput não precisa de label separado, pois ele já tem um */}
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
    );
}

// Estilos corrigidos e otimizados
const styles = StyleSheet.create({
    container: { paddingTop: 50, paddingBottom: 30, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: "#F5F5DC" },
    header: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#212121' },
    firstRow: { width: '100%', padding: 10, flexDirection: 'row', marginVertical: 20, alignItems: 'center' },
    icon: { width: '35%', alignItems: 'center', justifyContent: 'center' },
    textsFirstRow: { width: '65%', justifyContent: 'center', paddingLeft: 10 },
    name: { fontSize: 18, fontWeight: '600', color: '#212121' },
    age: { fontSize: 16, color: '#616161', marginTop: 4 },
    surfaceTexts: { width: '90%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    // Estilos de Surface ajustados para todos os componentes
    surfaceItem: { borderRadius: 12, backgroundColor: '#FFFFFF', borderStartColor: '#2E7D32', borderStartWidth: 6, height: 75, justifyContent: 'center', paddingHorizontal: 10 },
    surfaceItemLarge: { width: '100%', borderRadius: 12, backgroundColor: '#FFFFFF', borderStartColor: '#2E7D32', borderStartWidth: 6, minHeight: 75, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 8 },
    // Label específico para dropdown e multi-select
    surfaceLabel: { fontSize: 14, fontWeight: '600', color: '#2E7D32', marginBottom: 4, paddingHorizontal: 4 },
    // TextInput agora ocupa todo o espaço da Surface
    textInput: { backgroundColor: 'transparent', height: 55 },
    // Wrapper para o Picker garantir o alinhamento
    pickerWrapper: { height: 50, justifyContent: 'center', marginHorizontal: -4 },
    picker: { width: '100%', transform: Platform.OS === 'ios' ? [{ scaleX: 0.9 }, { scaleY: 0.9 }] : [] }, // Ajuste opcional para iOS
    multiSelectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    chipBase: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
    chipSelected: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    chipUnselected: { backgroundColor: '#E0E0E0', borderColor: '#BDBDBD' },
    chipTextSelected: { color: '#FFFFFF' },
    chipTextUnselected: { color: '#000000' },
    btnBase: { backgroundColor: '#4CAF50', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10, marginVertical: 32, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});