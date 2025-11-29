import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { COLORS } from '../../constants/theme';

interface EditProfileHeaderProps {
    onClose: () => void;
}

export const EditProfileHeader = ({ onClose }: EditProfileHeaderProps) => (
    <View style={styles.header}>
        {/* Empty View to balance the layout (center the title) */}
        <View style={{ width: 32 }} />

        <Text style={styles.title}>Editar Perfil</Text>

        <IconButton
            icon="close"
            size={28}
            onPress={onClose}
            iconColor={COLORS.textDark} // Using your theme color
        />
    </View>
);

const styles = StyleSheet.create({
    header: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
});