import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function CalculatorHub() {
  const router = useRouter();
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD LANGUAGE ---------- */
  useEffect(() => {
    const loadLang = async () => {
      const saved = await AsyncStorage.getItem('APP_LANG');
      if (saved === 'te' || saved === 'en') {
        setLanguage(saved);
      }
      setLoading(false);
    };
    loadLang();
  }, []);

  /* ---------- TEXT ---------- */
  const T = {
    title: language === 'te' ? 'స్మార్ట్ కాల్కులేటర్' : 'Smart Calculator',
    wage: language === 'te' ? 'కూలి లెక్క' : 'Wage Calculator',
    fertilizer:
      language === 'te' ? 'ఎరువు లెక్క' : 'Fertilizer Calculator',
    profit:
      language === 'te' ? 'లాభ నష్టం లెక్క' : 'Profit Calculator',
    emi: language === 'te' ? 'లోన్ EMI లెక్క' : 'Loan EMI Calculator',
    seed: language === 'te' ? 'విత్తనాల లెక్క' : 'Seed Calculator',
    pesticide:
      language === 'te' ? 'మందుల లెక్క' : 'Pesticide Calculator',
    bhoomi:
      language === 'te' ? 'భూమి లెక్కలు' : 'Land Area Calculator',
  };

  /* ---------- NAVIGATION ---------- */
  const goTo = (path: string) => {
    setLoading(true);
    setTimeout(() => {
      router.push(path as any);
      setLoading(false);
    }, 400);
  };

  /* ---------- LOADER ---------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
        <Text style={styles.loaderText}>
          {language === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  /* ---------- CARD COMPONENT ---------- */
  const Card = ({
    icon,
    title,
    path,
  }: {
    icon: any;
    title: string;
    path: string;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
      onPress={() => goTo(path)}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color="#1b5e20" />
        </View>

        <Text style={styles.cardTitle}>{title}</Text>

        <Ionicons name="chevron-forward" size={18} color="#aaa" />
      </View>
    </Pressable>
  );

  /* ---------- UI ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{T.title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card icon="cash-outline" title={T.wage} path="/farmer/calculators/wage" />
        <Card icon="flask-outline" title={T.fertilizer} path="/farmer/calculators/fertilizer" />
        <Card icon="trending-up-outline" title={T.profit} path="/farmer/calculators/profit" />
        <Card icon="card-outline" title={T.emi} path="/farmer/calculators/emi" />
        <Card icon="leaf-outline" title={T.seed} path="/farmer/calculators/SeedCalculator" />
        <Card icon="water-outline" title={T.pesticide} path="/farmer/calculators/pesticide" />
<Card 
  icon="speedometer-outline" // gas-station-outline లేకపోతే ఇది డీజిల్/మైలేజ్ కి బాగుంటుంది
  title={language === 'te' ? "డీజిల్ లెక్క" : "Diesel Cal"} 
  path="/farmer/calculators/diesel" 
/>
       <Card 
  icon="settings-outline"  // tractor-outline బదులు ఇది వాడండి (మెషీన్ కి సెట్ అవుతుంది)
  title={language === 'te' ? "యంత్రాల లెక్క" : "Machinery Calculator"} 
  path="/farmer/calculators/machine" 
/>



<Card icon="resize-outline" title={T.bhoomi} path="/farmer/calculators/bhoomi" />
      </ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 18,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#225b27',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconBox: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1b5e20',
    marginLeft: 10,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderText: {
    marginTop: 10,
    fontWeight: '600',
    color: '#1b5e20',
  },
});
