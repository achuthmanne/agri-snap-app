import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function FarmerLayout() {
    const [language, setLanguage] = useState<'te' | 'en'>('en');
const [tabLoading, setTabLoading] = useState(false);

useEffect(() => {
  const loadLang = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') {
      setLanguage(lang);
    }
  };
  loadLang();
}, []);
const T = {
  dashboard: language === 'te' ? 'డాష్‌బోర్డ్' : 'Dashboard',
  calculator: language === 'te' ? 'క్యాలిక్యులేటర్' : 'Calculator',
  attendance: language === 'te' ? 'హాజరు చరిత్ర' : 'History',
  payments: language === 'te' ? 'చెల్లింపుల చరిత్ర' : 'History',
  loading: language === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...',
};


 return (
  <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1b5e20',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,

        tabBarIcon: ({ color, focused }) => {
          let iconName: any;

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'attendance-history') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'history') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'calculator') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          }

          return (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: T.dashboard }}
        listeners={{
          tabPress: () => {
            setTabLoading(true);
            setTimeout(() => setTabLoading(false), 800);
          },
        }}
      />

      <Tabs.Screen
        name="calculator"
        options={{ title: T.calculator }}
        listeners={{
          tabPress: () => {
            setTabLoading(true);
            setTimeout(() => setTabLoading(false), 800);
          },
        }}
      />

      <Tabs.Screen
        name="attendance-history"
        options={{ title: T.attendance }}
        listeners={{
          tabPress: () => {
            setTabLoading(true);
            setTimeout(() => setTabLoading(false), 800);
          },
        }}
      />

      <Tabs.Screen
        name="history"
        options={{ title: T.payments }}
        listeners={{
          tabPress: () => {
            setTabLoading(true);
            setTimeout(() => setTabLoading(false), 800);
          },
        }}
      />

      <Tabs.Screen
  name="profile"
  options={{ title: language === 'te' ? 'ప్రొఫైల్' : 'Profile' }}
  listeners={{
    tabPress: () => {
      setTabLoading(true);
      setTimeout(() => setTabLoading(false), 800);
    },
  }}
/>


      {/* Hidden */}
     
      <Tabs.Screen name="calculators/wage" options={{ href: null }} />
<Tabs.Screen name="calculators/fertilizer" options={{ href: null }} />
<Tabs.Screen name="calculators/profit" options={{ href: null }} />
<Tabs.Screen name="calculators/emi" options={{ href: null }} />
<Tabs.Screen name="calculators/SeedCalculator" options={{ href: null }} />
<Tabs.Screen name="calculators/pesticide" options={{ href: null }} />
<Tabs.Screen name="calculators/bhoomi" options={{ href: null }} />
<Tabs.Screen name="calculators/machine" options={{ href: null }} />
<Tabs.Screen name="calculators/diesel" options={{ href: null }} />
    </Tabs>

  </View>
);

}

const styles = StyleSheet.create({
  tabBar: {
    height: 85,
    borderTopWidth: 0,
    elevation: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
   
  },
  activeIconBox: {
    backgroundColor: '#e8f5e9',
    padding: 6,
    borderRadius: 12,
  },
  iconContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
},

activeIndicator: {
  position: 'absolute',
  top: -8,
  width: 24,
  height: 3,
  borderRadius: 10,
  backgroundColor: '#1b5e20',
},


});
