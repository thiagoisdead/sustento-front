import { StyleSheet, Text, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function NavBar() {

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
      <View style={styles.child}><Ionicons name="person" size={35} color="black" />
        {/* <Text>Perfil</Text> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '12%',
    width: '100%',
    backgroundColor: '#1a2323',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  child: {
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
});
