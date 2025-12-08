import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { COLORS } from '../../constants/theme';
import {
    ActivityLvl, ActivityLvlLabels,
    Gender, GenderLabels,
    Objective, ObjectiveLabels
} from '../../enum/profileEnum';

interface ProfileFieldProps {
    label: string;
    value: any;
    large?: boolean;
}

export const ProfileField = ({ label, value, large = false }: ProfileFieldProps) => {
    const getDisplayValue = () => {
        if (!value) return "Não informado";

        if (label === "Objetivo") return ObjectiveLabels[value as Objective] || value;
        if (label === "Atividade Física") return ActivityLvlLabels[value as ActivityLvl] || value;
        if (label === "Gênero") return GenderLabels[value as Gender] || value;

        return value;
    };

    return (
        <View style={large ? { width: '100%' } : { width: '48%' }}>
            <Surface style={large ? styles.surfaceLarge : styles.surfaceSmall}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{getDisplayValue()}</Text>
            </Surface>
        </View>
    );
};

const commonSurface = {
    padding: 6.5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderStartColor: '#2E7D32',
    borderStartWidth: 6,
    elevation: 8, 
};

const styles = StyleSheet.create({
    surfaceSmall: {
        ...commonSurface,
        width: '100%',
    },
    surfaceLarge: {
        ...commonSurface,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    value: {
        fontSize: 16,
        color: COLORS.textDark,
    },
});