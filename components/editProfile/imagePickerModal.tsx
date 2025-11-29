import React from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Portal, Button, Text } from 'react-native-paper';

interface ImagePickerModalProps {
    visible: boolean;
    onDismiss: () => void;
    onPickImage: (mode: 'camera' | 'gallery') => void;
}

export const ImagePickerModal = ({ visible, onDismiss, onPickImage }: ImagePickerModalProps) => {
    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <Text style={styles.title}>Alterar Foto de Perfil</Text>

                <Button
                    icon="camera"
                    mode="contained"
                    onPress={() => onPickImage('camera')}
                    style={styles.btn}
                    buttonColor="#2E7D32"
                >
                    Tirar Foto
                </Button>

                <Button
                    icon="image"
                    mode="outlined"
                    onPress={() => onPickImage('gallery')}
                    style={styles.btn}
                    textColor="#2E7D32"
                    theme={{ colors: { outline: '#2E7D32' } }}
                >
                    Escolher da Galeria
                </Button>

                <Button onPress={onDismiss} textColor="#666" style={{ marginTop: 10 }}>
                    Cancelar
                </Button>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        margin: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#212121',
    },
    btn: {
        width: '100%',
        marginVertical: 6,
    }
});