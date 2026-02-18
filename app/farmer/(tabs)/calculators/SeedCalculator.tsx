import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function SeedCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'kg' | 'grams' | 'packets' | 'plants'>('kg');

  const [acres, setAcres] = useState('');
  const [qtyPerAcre, setQtyPerAcre] = useState('');
  const [price, setPrice] = useState('');
  const [packetSize, setPacketSize] = useState('');
  const [rowSpace, setRowSpace] = useState('');
  const [plantSpace, setPlantSpace] = useState('');

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem('APP_LANG');
      if (lang === 'te' || lang === 'en') setLanguage(lang);
      setLoading(false);
    };
    loadLang();
  }, []);

 const calculate = () => {
  const A = Number(acres || 0);
  const Q = Number(qtyPerAcre || 0);
  const P = Number(price || 0);
  const packet = Number(packetSize || 0);

  let totalQty = 0;
  let totalCost = 0;
  let packets = 0;

  if (mode === 'plants' && rowSpace && plantSpace) {
    const row = Number(rowSpace);
    const plant = Number(plantSpace);

    // 1 acre = 43560 sq ft
    totalQty = Math.floor((43560 / (row * plant)) * A);
  } else {
    totalQty = Math.ceil(A * Q);
  }

  totalCost = Math.round(totalQty * P);

  if (packet > 0) {
    packets = Math.ceil(totalQty / packet);
  }

  setResult({
    totalQty,
    totalCost,
    packets,
  });
};

const reset = () => {
  setAcres('');
  setQtyPerAcre('');
  setPrice('');
  setPacketSize('');
  setRowSpace('');
  setPlantSpace('');
  setResult(null);
};

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  const unitLabel =
  mode === 'kg'
    ? language === 'te' ? 'కిలోలు' : 'Kg'
    : mode === 'grams'
    ? language === 'te' ? 'గ్రాములు' : 'Grams'
    : mode === 'packets'
    ? language === 'te' ? 'ప్యాకెట్లు' : 'Packets'
    : language === 'te' ? 'మొక్కలు' : 'Plants';
return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: '#f4f6f5' }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    {/* 1. FIXED HEADER - Idi scroll avvadu */}
    <View style={styles.header}>
      <Ionicons name="leaf-outline" size={22} color="#fff" />
      <Text style={styles.headerTitle}>
        {language === 'te' ? 'విత్తనాల లెక్కలు' : 'Seed Calculator'}
      </Text>
    </View>

    {/* 2. SCROLLABLE CONTENT */}
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false} // Scroll bar kanapadakunda neat ga untundi
    >
      {/* MODE SELECT TOGGLES */}
      <View style={styles.toggleRow}>
        {['kg', 'grams', 'packets', 'plants'].map((m: any) => (
          <Pressable
            key={m}
            style={[styles.toggleBtn, mode === m && styles.activeToggle]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.toggleText, mode === m && { color: '#fff' }]}>
              {language === 'te'
                ? m === 'kg' ? 'కిలోలు' : m === 'grams' ? 'గ్రాములు' : m === 'packets' ? 'ప్యాకెట్లు' : 'మొక్కలు'
                : m.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* INPUT CARD */}
      <View style={styles.card}>
        <Input label={language === 'te' ? 'ఎకరాలు' : 'Acres'} value={acres} setValue={setAcres} />

        {mode !== 'plants' && (
          <Input
            label={language === 'te' ? `ఎకరానికి అవసరం (${unitLabel})` : `Quantity per Acre (${unitLabel})`}
            value={qtyPerAcre}
            setValue={setQtyPerAcre}
          />
        )}

        {mode === 'plants' && (
          <>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#1b5e20" />
              <Text style={styles.infoText}>
                {language === 'te'
                  ? '🌱 మొక్కల లెక్కలు రెండు విధాలుగా వేయవచ్చు:\n\n1️⃣ వరుస & మొక్క దూరం అడుగుల్లో ఇవ్వండి.\n2️⃣ లేదా నేరుగా మొక్కల సంఖ్య ఇవ్వండి.'
                  : '🌱 Calculate plants in two ways:\n\n1️⃣ Enter spacing in feet.\n2️⃣ Or enter plants count directly.'}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label={language === 'te' ? 'వరుసల దూరం' : 'Row Spacing'} setValue={setRowSpace} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label={language === 'te' ? 'మొక్కల దూరం' : 'Plant Spacing'} setValue={setPlantSpace} />
              </View>
            </View>
            <Input label={language === 'te' ? 'ఎకరానికి మొక్కలు (Optional)' : 'Plants per Acre (Optional)'} setValue={setQtyPerAcre} />
          </>
        )}

        <Input label={language === 'te' ? `ఒక్క ${unitLabel} ధర ₹` : `Price per ${unitLabel} ₹`} value={price} setValue={setPrice} />

        {(mode === 'kg' || mode === 'grams') && (
          <Input label={language === 'te' ? 'ప్యాకెట్ సైజు (Optional)' : 'Packet Size (Optional)'} value={packetSize} setValue={setPacketSize} />
        )}

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.calcBtn} onPress={calculate}>
            <Text style={styles.calcText}>{language === 'te' ? 'లెక్కించు' : 'Calculate'}</Text>
          </Pressable>
          <Pressable style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>{language === 'te' ? 'రిసెట్' : 'Reset'}</Text>
          </Pressable>
        </View>
      </View>

      {/* RESULT CARD */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{language === 'te' ? 'మొత్తం అవసరం' : 'Total Required'}</Text>
          <Text style={styles.resultValue}>{result.totalQty.toLocaleString('en-IN')} {unitLabel}</Text>
          {result.packets > 0 && (
            <Text style={styles.subResult}>
              {language === 'te' ? `సుమారు ${result.packets.toLocaleString('en-IN')} ప్యాకెట్లు` : `Approx ${result.packets.toLocaleString('en-IN')} Packets`}
            </Text>
          )}
          <Text style={styles.costValue}>₹ {result.totalCost.toLocaleString('en-IN')}</Text>
        </View>
      )}
    </ScrollView>
  </KeyboardAvoidingView>
);

}

function Input({ label, value, setValue }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={setValue}
        style={styles.input}
        placeholder="0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    backgroundColor: '#1b5e20', 
    padding: 16, 
    marginTop: Platform.OS === 'android' ? 40 : 10, // Device batti margin
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 15, 
    elevation: 4,
    zIndex: 10 // Header paina unde laa
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 10 },
  
  scrollContent: { 
    padding: 15, 
    paddingBottom: 100 // Scroll cheసినప్పుడు కింద బటన్స్ కట్ అవ్వకుండా గ్యాప్
  },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  toggleBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff', // Light bg for unselected
    alignItems: 'center',
    elevation: 2
  },
  activeToggle: { backgroundColor: '#1b5e20' },
  toggleText: { fontWeight: '600', color: '#1b5e20', fontSize: 12 },

  card: { backgroundColor: '#fff', padding: 20, borderRadius: 18, elevation: 4 },
  
  row: { flexDirection: 'row', gap: 10, marginBottom: 5 }, // Side-by-side inputs
  
  infoBox: { 
    backgroundColor: '#e8f5e9', 
    padding: 12, 
    borderRadius: 10, 
    flexDirection: 'row', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9'
  },
  infoText: { fontSize: 12, color: '#1b5e20', marginLeft: 8, flex: 1, lineHeight: 18 },

  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  calcBtn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 12, flex: 2, alignItems: 'center' },
  resetBtn: { backgroundColor: '#eeeeee', padding: 15, borderRadius: 12, flex: 1, alignItems: 'center' },
  calcText: { color: '#fff', fontWeight: '700' },
  resetText: { color: '#333', fontWeight: '600' },

  resultCard: { 
    marginTop: 20, 
    backgroundColor: '#e8f5e9', 
    padding: 20, 
    borderRadius: 18, 
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#1b5e20' 
  },
  resultTitle: { fontWeight: '700', fontSize: 15, color: '#444' },
  resultValue: { fontSize: 24, fontWeight: '800', color: '#1b5e20', marginVertical: 5 },
  subResult: { fontSize: 14, color: '#666' },
  costValue: { fontSize: 22, fontWeight: '800', color: '#1b5e20', marginTop: 10 },

  label: { fontWeight: '600', marginBottom: 6, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#fafafa' },
  loader: { flex:1, justifyContent:'center', alignItems:'center' },
});

  