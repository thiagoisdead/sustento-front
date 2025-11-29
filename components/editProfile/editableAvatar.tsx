import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import HealthyPNG from '../../assets/rodrigo.jpg';
import { COLORS } from '../../constants/theme';

interface EditableAvatarProps {
    name: string;
    age: string;
    imageUri: string | null;
    onPress: () => void;
}

export const EditableAvatar = ({ name, age, imageUri, onPress }: EditableAvatarProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                    <Avatar.Image
                        size={100}
                        source={imageUri ? { uri: imageUri } : HealthyPNG}
                    />
                    <View style={styles.badge}>
                        <IconButton icon="camera" iconColor="#fff" size={14} style={{ margin: 0 }} />
                    </View>
                </Pressable>
            </View>
            <View style={styles.textWrapper}>
                <Text style={styles.name}>{name || 'Carregando...'}</Text>
                <Text style={styles.age}>{age ? `${age} Anos` : ''}</Text>
                <Pressable onPress={onPress}>
                    <Text style={styles.editLink}>Alterar foto</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        marginVertical: 20,
        alignItems: 'center',
    },
    iconWrapper: {
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2E7D32',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F5F5DC',
        elevation: 2,
    },
    textWrapper: {
        width: '65%',
        justifyContent: 'center',
        paddingLeft: 10,
    },
    name: { fontSize: 18, fontWeight: '600', color: '#212121' },
    age: { fontSize: 16, color: '#616161', marginTop: 4 },
    editLink: { color: '#2E7D32', fontWeight: 'bold', marginTop: 8 },
});