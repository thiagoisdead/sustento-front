import { StyleSheet, Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Button } from 'react-native-paper';


export default function NavBar() {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <View style={styles.child}><Entypo name="calendar" size={35} color="black" />
        {/* <Text>Calendário</Text> */}
      </View>
      <View style={styles.child}><Feather name="clipboard" size={35} color="black" />
        {/* <Text>Relatórios</Text> */}
      </View>
      <View style={styles.child}><MaterialCommunityIcons name="food-apple-outline" size={35} color="black" />
        {/* <Text>Dieta</Text> */}
      </View>
      <View style={styles.child}><MaterialCommunityIcons name="food-turkey" size={35} color="black" />
        {/* <Text>Alimentos</Text> */}
      </View>
      <View style={styles.child}><Ionicons name="person" size={35} color="black" onPress={() => { router.push('/profile/seeProfile') }} />
        {/* <Text>Perfil</Text> */}
      </View>
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
