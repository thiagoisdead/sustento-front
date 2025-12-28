import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import Default from '../../assets/default.png';
import { COLORS } from '../../constants/theme';

import Constants from 'expo-constants';

const API_URL: string = Constants.expoConfig?.extra?.backUrl;

interface ProfileAvatarProps {
    name: string | null;
    age: string | null;
    pictureUrl: string | null | undefined;
}

export const ProfileAvatar = ({ name, age, pictureUrl }: ProfileAvatarProps) => {
    const imageSource = pictureUrl
        ? { uri: `${API_URL}${pictureUrl}` }
        : Default;
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Avatar.Image size={100} source={imageSource} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.name}>{name || "Não informado"}</Text>
                <Text style={styles.age}>{age ? `${age} Anos` : "Idade não informada"}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        width: '65%',
        justifyContent: 'center',
        paddingLeft: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    age: {
        fontSize: 16,
        color: '#616161',
    },
});