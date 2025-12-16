import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { Foods } from '../types/data';

interface RecentItemProps {
    item: Foods;
    onPress: () => void;
}


export const RecentItem = ({ item, onPress }: RecentItemProps) => (
    <Pressable style={styles.recentItemCard} onPress={onPress}>
        <View style={styles.recentItemIconBox}>
            <MaterialCommunityIcons name="food" size={24} color="#FFF" />
        </View>
        <View style={styles.recentItemDetails}>
            <Text style={styles.recentItemTitle}>{item?.name}</Text>

            <Text style={styles.recentItemServing}>Por 100 Gramas</Text>

            <View style={styles.recentItemMacros}>
                <View style={styles.macroItem}>
                    <MaterialCommunityIcons name="leaf" size={12} color={COLORS.primary} />
                    <Text style={styles.macroText}>{item?.nutrients?.protein_100g}g P</Text>
                </View>
                <View style={styles.macroItem}>
                    <MaterialCommunityIcons name="barley" size={12} color={COLORS.primary} />
                    <Text style={styles.macroText}>{item?.nutrients?.carbs_100g}g C</Text>
                </View>
                <View style={styles.macroItem}>
                    <MaterialCommunityIcons name="water-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.macroText}>{item?.nutrients?.fat_100g}g G</Text>
                </View>
            </View>
        </View>
        <Text style={styles.recentItemKcal}>
            {item?.nutrients?.calories_100g ? item?.nutrients?.calories_100g : ''} {item?.nutrients?.calories_100g && (<Text style={styles.kcalLabel}>kcal</Text>)}
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