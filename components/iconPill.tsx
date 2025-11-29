import { View, StyleSheet } from 'react-native';

export const IconPill = ({ icon }: any) => (
    <View style={styles.iconPill}>
        {icon}
    </View>
);
const styles = StyleSheet.create({
    iconPill: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
});