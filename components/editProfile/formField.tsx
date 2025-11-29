import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../constants/theme';

interface Option {
    label: string;
    value: string;
}

interface FormFieldProps {
    label: string;
    value: any;
    onChange: (val: any) => void;
    type: 'text' | 'number' | 'dropdown' | 'multi-select';
    options?: Option[];
    large?: boolean;
}

export const FormField = ({ label, value, onChange, type, options, large }: FormFieldProps) => {

    const containerStyle = large ? styles.containerLarge : styles.containerSmall;

    // 1. Dropdown Field
    if (type === 'dropdown') {
        return (
            <View style={containerStyle}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputBox}>
                    <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione..." value={null} color="#999" />
                        {options?.map((opt) => (
                            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                        ))}
                    </Picker>
                </View>
            </View>
        );
    }

    // 2. Multi-Select Field (Chips)
    if (type === 'multi-select') {
        const selectedValues: string[] = Array.isArray(value) ? value : [];

        const toggleSelection = (val: string) => {
            if (selectedValues.includes(val)) {
                onChange(selectedValues.filter(v => v !== val));
            } else {
                onChange([...selectedValues, val]);
            }
        };

        return (
            <View style={styles.containerLarge}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.chipContainer}>
                    {options?.map((opt) => {
                        const isSelected = selectedValues.includes(opt.value);
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => toggleSelection(opt.value)}
                                style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                            >
                                <Text style={isSelected ? styles.chipTextSelected : styles.chipTextUnselected}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    }

    // 3. Standard Text Input
    return (
        <View style={containerStyle}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value !== null && value !== undefined ? String(value) : ''}
                onChangeText={onChange}
                keyboardType={type === 'number' ? 'decimal-pad' : 'default'}
                style={styles.textInput}
                placeholder={`Digite ${label.toLowerCase()}`}
                placeholderTextColor="#CCC"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    containerSmall: {
        width: '48%',
        marginBottom: 16,
    },
    containerLarge: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2E7D32', // Green label
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    // Improved Input Box Look
    textInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    inputBox: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden', // For picker border
    },
    picker: {
        height: 50,
        width: '100%',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    chipUnselected: {
        backgroundColor: '#F5F5F5',
        borderColor: '#DDD',
    },
    chipTextSelected: { color: '#FFF', fontWeight: '600' },
    chipTextUnselected: { color: '#666' },
});