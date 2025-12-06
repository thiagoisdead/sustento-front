import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types/calendar';

const getStorageKey = (userId: number) => `calendar_events_${userId}`;

export const loadEvents = async (userId: number): Promise<Event[]> => {
    try {
        const key = getStorageKey(userId);
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Failed to load events", e);
        return [];
    }
};

const saveEvents = async (userId: number, events: Event[]) => {
    try {
        const key = getStorageKey(userId);
        const jsonValue = JSON.stringify(events);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error("Failed to save events", e);
        throw e;
    }
};

export const addEvent = async (userId: number, newEvent: Event) => {
    const currentEvents = await loadEvents(userId);
    const updatedEvents = [...currentEvents, newEvent];
    await saveEvents(userId, updatedEvents);
    return updatedEvents;
};

export const removeEvent = async (userId: number, eventId: number) => {
    const currentEvents = await loadEvents(userId);
    const updatedEvents = currentEvents.filter(e => e.id !== eventId);
    await saveEvents(userId, updatedEvents);
    return updatedEvents;
};