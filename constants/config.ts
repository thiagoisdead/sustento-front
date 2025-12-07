import Constants from 'expo-constants'

const ipv4 = Constants.expoConfig?.hostUri?.split(':')[0];
export const SERVER_URL = `http://${ipv4}:3000`;