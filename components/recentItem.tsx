import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { Foods } from '../types/data';

interface RecentItemProps {
    item: Foods;
    onPress: () => void;
}

const servingRecord: Record<"portion" | "g" | "ml", string> = {
    portion: "Por porção",
    g: "Por 100g",
    ml: "Por 100ml"
};

export const RecentItem = ({ item, onPress }: RecentItemProps) => (
    <Pressable style={styles.recentItemCard} onPress={onPress}>
        <View style={styles.recentItemIconBox}>
            {/* You can add dynamic icons based on category here if you want */}
            <MaterialCommunityIcons name="food" size={24} color="#FFF" />
        </View>
        <View style={styles.recentItemDetails}>
            <Text style={styles.recentItemTitle}>{item.title}</Text>
            <Text style={styles.recentItemServing}>{servingRecord[item.serving]}</Text>
            <View style={styles.recentItemMacros}>
                <View style={styles.macroItem}>
                    <MaterialCommunityIcons name="leaf" size={12} color={COLORS.primary} />
                    <Text style={styles.macroText}>{item.protein}g P</Text>
                </View>
                <View style={styles.macroItem}>
                    <MaterialCommunityIcons name="barley" size={12} color={COLORS.primary} />
                    <Text style={styles.macroText}>{item.carbs}g C</Text>
                </View>
                <View style={styles.macroItem}>
                    <MaterialCommunityIcons name="water-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.macroText}>{item.fats}g G</Text>
                </View>
            </View>
        </View>
        <Text style={styles.recentItemKcal}>
            {item.kcal} <Text style={styles.kcalLabel}>kcal</Text>
        </Text>
    </Pressable>
);

const styles = StyleSheet.create({
    recentItemCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    recentItemIconBox: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentItemDetails: {
        flex: 1,
        marginLeft: 15,
    },
    recentItemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    recentItemServing: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    recentItemMacros: {
        flexDirection: 'row',
        gap: 10,
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    macroText: {
        fontSize: 11,
        color: COLORS.textLight,
        marginLeft: 2,
    },
    recentItemKcal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    kcalLabel: {
        fontSize: 10,
        fontWeight: 'normal',
        color: COLORS.textLight,
    },
});