import { StyleSheet, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavButtonsArray, navButtonsSchemaArray } from '../types/ui';
import { usePath } from '../hooks/usePath';
import { AnimatedButton } from './animatedButton';

export default function NavBar() {
  const handlePath = usePath();

  const navButtons: NavButtonsArray = navButtonsSchemaArray.parse([
    { Icon: Entypo, name: 'calendar', path: '/calendar/seeCalendar' },
    { Icon: Feather, name: 'clipboard', path: '/meals/seeMeals' },
    { Icon: MaterialCommunityIcons, name: 'food-apple-outline', path: '' },
    { Icon: MaterialCommunityIcons, name: 'food-turkey', path: '/foods/editFoods' },
    { Icon: Ionicons, name: 'person', path: '/profile/seeProfile' },
  ]);

  return (
    <View style={styles.container}>
      {navButtons.map((btn, index) => {
        const { Icon, name, path } = btn;
        return (
          <AnimatedButton
            key={index}
            onPress={() => handlePath(path)}
            style={styles.child} // seu estilo base
            scaleTo={0.8}
          >
            <Icon name={name as any} size={28} color="#FFFFFF" />
          </AnimatedButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1a2323',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  child: {
    backgroundColor: '#2E7D32',
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childPressed: {
    backgroundColor: '#66BB6A',
  },
});
