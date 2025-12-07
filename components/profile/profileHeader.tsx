import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { COLORS } from '../../constants/theme';

interface HeaderProps {
    text: string;
    iconName: string;
    onFunction: () => void;
    onEdit?: () => void;
}

export const Header = ({ text, iconName, onFunction, onEdit }: HeaderProps) => {
    return (
        <View style={styles.header}>
            <Octicons name="gear" size={24} color={COLORS.textDark} onPress={onEdit} />
            <Text style={styles.title}>{text}</Text>
            <MaterialIcons name={iconName} size={24} color={COLORS.textDark} onPress={onFunction} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 5, marginTop: 10 },
});