import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import HealthyPNG from "../../assets/rodrigo.jpg";
import { SERVER_URL } from '../../constants/config';
import { COLORS } from '../../constants/theme';

interface ProfileAvatarProps {
    name: string | null;
    age: string | null;
    pictureUrl: string | null | undefined;
}

export const ProfileAvatar = ({ name, age, pictureUrl }: ProfileAvatarProps) => {
    const imageSource = pictureUrl
        ? { uri: `${SERVER_URL}/${pictureUrl}` }
        : HealthyPNG;

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
        marginVertical: 10,
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