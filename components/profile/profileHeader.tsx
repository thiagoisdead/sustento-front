import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { COLORS } from '../../constants/theme';

interface ProfileHeaderProps {
    onLogout: () => void;
}

export const ProfileHeader = ({ onLogout }: ProfileHeaderProps) => {
    return (
        <View style={styles.header}>
            <Octicons name="gear" size={24} color={COLORS.textDark} />
            <Text style={styles.title}>Dados de Perfil</Text>
            <MaterialIcons name="logout" size={24} color={COLORS.textDark} onPress={onLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '85%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
});