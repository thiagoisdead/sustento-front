import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface RemoveButtonProps {
    onPress: () => void;
}

export const RemoveButton = ({ onPress }: RemoveButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.removeButtonPressed
            ]}
        >
            <Text style={styles.removeButtonText}>×</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    removeButton: {
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    removeButtonPressed: {
        backgroundColor: '#D32F2F',
        borderColor: '#D32F2F',
    },
    removeButtonText: {
        color: '#D32F2F',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: -2,
    },
});