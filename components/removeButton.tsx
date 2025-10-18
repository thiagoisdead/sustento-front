import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { RemoveButtonProps } from "../../../types/calendar";



export default function RemoveButton({ id, setEvents }: RemoveButtonProps) {
    const [hovered, setHovered] = useState(false);

    const deleteEvent = (id: number) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    };

    return (
        <Pressable
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            style={[styles.removeButton, hovered && styles.removeButtonHovered]}
            onPress={() => deleteEvent(id)}
        >
            <Text
                style={[
                    styles.removeButtonText,
                    hovered && styles.removeButtonTextHovered,
                ]}
            >
                Remover Evento
            </Text>
        </Pressable>
    );
}


const styles = StyleSheet.create({
    removeButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#A8D5BA',
        borderWidth: 1,
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    removeButtonHovered: {
        backgroundColor: '#A8D5BA',
    },
    removeButtonText: {
        color: '#A8D5BA',
        fontSize: 16,
        fontWeight: 'bold',
    },
    removeButtonTextHovered: {
        color: "#FFFFFF",
    },
});