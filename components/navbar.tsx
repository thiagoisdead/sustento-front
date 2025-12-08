import { StyleSheet, View, LayoutAnimation, Platform, UIManager } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname } from 'expo-router'; 
import { NavButtonsArray, navButtonsSchemaArray } from '../types/ui';
import { usePath } from '../hooks/usePath';
import { AnimatedButton } from './animatedButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NavBar() {
  const handlePath = usePath();
  const pathname = usePathname();

  const navButtons: NavButtonsArray = navButtonsSchemaArray.parse([
    { Icon: Entypo, name: 'calendar', path: '/calendar/seeCalendar' },
    { Icon: Feather, name: 'clipboard', path: '/dashboard/dashboard' },
    { Icon: MaterialCommunityIcons, name: 'food-apple-outline', path: '/foodTracker/seeAllMealPlans' },
    { Icon: MaterialCommunityIcons, name: 'food-turkey', path: '/foods/editFoods' },
    { Icon: Ionicons, name: 'person', path: '/profile/seeProfile' },
  ]);

  const onNavigate = (path: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    handlePath(path);
  };

  return (
    <View style={styles.container}>
      {navButtons.map((btn, index) => {
        const { Icon, name, path } = btn;
        
        // Verifica se a rota atual começa com o path do botão ou é igual
        // O .includes ajuda caso tenha sub-rotas, mas para navbar exata use ===
        const isActive = pathname === path || (pathname.includes(path) && path !== '/'); 

        return (
          <View key={index} style={styles.buttonWrapper}>
            <AnimatedButton
              onPress={() => onNavigate(path)}
              style={[styles.child, isActive && styles.childActive]} 
              scaleTo={0.8}
            >
              <Icon 
                name={name as any} 
                size={28} 
                color={"#FFFFFF"} 
              />
            </AnimatedButton>            
            {isActive && <View style={styles.activeIndicator} />}
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start', 
    paddingTop: 10,
    paddingBottom: 10, 
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, 
  },
  child: {
    backgroundColor: '#388E3C', 
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childActive: {
    backgroundColor: '#388E3C', 
    elevation: 2,
  },
  activeIndicator: {
    width: 50, 
    height: 3, 
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginTop: 10, 
  }
});