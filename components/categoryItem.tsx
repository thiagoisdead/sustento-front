import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface CategoryItemProps {
    icon: any;
    name: string;
    onPress: () => void;
}

export const CategoryItem = ({ icon, name, onPress }: CategoryItemProps) => (
    <Pressable style={styles.categoryItem} onPress={onPress}>
        <View style={styles.categoryIconBox}>
            <MaterialCommunityIcons name={icon} size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.categoryText}>{name}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    categoryItem: {
        alignItems: 'center',
        marginBottom: 20,
        width: '18%',
    },
    categoryIconBox: {
        width: 55,
        height: 55,
        borderRadius: 16,
        backgroundColor: COLORS.iconBg,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    categoryText: {
        fontSize: 11,
        color: COLORS.textDark,
        textAlign: 'center',
        fontWeight: '600'
    },
});