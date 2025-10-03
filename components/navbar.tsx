import { StyleSheet, Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { NavigationButton } from '../types/type';


export default function NavBar() {
  const router = useRouter()

  const handlePath = (path: string): void => {
    router.push(path)
  }

  const navButtons: NavigationButton[] = [
    { Icon: Entypo, name: 'calendar', path: '' },
    { Icon: Feather, name: 'clipboard', path: '' },
    { Icon: MaterialCommunityIcons, name: 'food-apple-outline', path: '' },
    { Icon: MaterialCommunityIcons, name: 'food-turkey', path: '/meals/mealsHome' },
    { Icon: Ionicons, name: 'person', path: '/profile/seeProfile' },
  ]
  return (
    <View style={styles.container}>
      {navButtons.map((btn, index) => {
        const { Icon, name, path } = btn;
        return (
          <View key={index} style={styles.child}>
            <Icon
              name={name as any}
              size={35}
              color={'black'}
              onPress={() => handlePath(path)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1a2323',
    alignItems: 'center',
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  child: {
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderColor: '#578f1a',
    borderWidth: 2
  },
});
