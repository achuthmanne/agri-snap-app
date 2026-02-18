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

export default function WageCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  const [full, setFull] = useState('');
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [fullRate, setFullRate] = useState('');
const [morningRate, setMorningRate] = useState('');
const [eveningRate, setEveningRate] = useState('');

  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    loadLang();
  }, []);

  const loadLang = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') {
      setLanguage(lang);
    }
    setLoading(false);
  };

 const calculate = () => {
  const f = Number(full || 0);
  const m = Number(morning || 0);
  const e = Number(evening || 0);

  const fr = Number(fullRate || 0);
  const mr = Number(morningRate || 0);
  const er = Number(eveningRate || 0);

  const total =
    (f * fr) +
    (m * mr) +
    (e * er);

  setResult(total);
};


  const reset = () => {
    setFull('');
    setMorning('');
    setEvening('');
    setFullRate('');
    setEveningRate('');
    setMorningRate('');
    setResult(null);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="calculator-outline" size={22} color="#fff" />
          <Text style={styles.headerTitle}>
            {language === 'te' ? 'కూలి లెక్కల కాలిక్యులేటర్' : 'Wage Calculator'}
          </Text>
        </View>

        {/* INPUT CARD */}
        <View style={styles.card}>

         {/* FULL ROW */}
<View style={styles.row}>
  <View style={styles.halfInput}>
    <Text style={styles.label}>
      {language === 'te' ? 'పూర్తిగా వచ్చిన కూలీలు' : 'Full Workers'}
    </Text>
    <TextInput
      keyboardType="number-pad"
      value={full}
      onChangeText={setFull}
      style={styles.input}
      placeholder="0"
    />
  </View>

  <View style={styles.halfInput}>
    <Text style={styles.label}>
      {language === 'te' ? 'పూర్తి రేటు ₹' : 'Full Rate ₹'}
    </Text>
    <TextInput
      keyboardType="number-pad"
      value={fullRate}
      onChangeText={setFullRate}
      style={styles.input}
      placeholder="0"
    />
  </View>
</View>
{/* MORNING ROW */}
<View style={styles.row}>
  <View style={styles.halfInput}>
    <Text style={styles.label}>
      {language === 'te' ? 'ఉదయం కూలీలు' : 'Morning (Half)'}
    </Text>
    <TextInput
      keyboardType="number-pad"
      value={morning}
      onChangeText={setMorning}
      style={styles.input}
      placeholder="0"
    />
  </View>

  <View style={styles.halfInput}>
    <Text style={styles.label}>
      {language === 'te' ? 'ఉదయం రేటు ₹' : 'Morning Rate ₹'}
    </Text>
    <TextInput
      keyboardType="number-pad"
      value={morningRate}
      onChangeText={setMorningRate}
      style={styles.input}
      placeholder="0"
    />
  </View>
</View>
{/* EVENING ROW */}
<View style={styles.row}>
  <View style={styles.halfInput}>
    <Text style={styles.label}>
      {language === 'te' ? 'సాయంత్రం కూలీలు' : 'Evening (Half)'}
    </Text>
    <TextInput
      keyboardType="number-pad"
      value={evening}
      onChangeText={setEvening}
      style={styles.input}
      placeholder="0"
    />
  </View>

  <View style={styles.halfInput}>
    <Text style={styles.label}>
      {language === 'te' ? 'సాయంత్రం రేటు ₹' : 'Evening Rate ₹'}
    </Text>
    <TextInput
      keyboardType="number-pad"
      value={eveningRate}
      onChangeText={setEveningRate}
      style={styles.input}
      placeholder="0"
    />
  </View>
</View>


          {/* BUTTONS */}
          <View style={styles.btnRow}>
            <Pressable style={styles.calcBtn} onPress={calculate}>
              <Text style={styles.btnText}>
                {language === 'te' ? 'లెక్కించు' : 'Calculate'}
              </Text>
            </Pressable>

            <Pressable style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetText}>
                {language === 'te' ? 'రిసెట్' : 'Reset'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* RESULT */}
        {result !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {language === 'te' ? 'మొత్తం చెల్లించవలసినది' : 'Total Payable'}
            </Text>
            <Text style={styles.resultValue}>
              ₹ {result.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------- REUSABLE INPUT ---------- */

function InputField({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="number-pad"
        value={value}
        onChangeText={setValue}
        style={styles.input}
        placeholder="0"
      />
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
    backgroundColor: '#f4f6f5',
    flexGrow: 1,
  },

  header: {
    backgroundColor: '#1b5e20',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
halfInput: {
  flex: 1,
  marginHorizontal: 4,
},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 4,
  },

  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 14,
},



input: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 10,
  backgroundColor: '#fafafa',
},


  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  calcBtn: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },

  resetBtn: {
    backgroundColor: '#eeeeee',
    padding: 14,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },

  resetText: {
    color: '#333',
    fontWeight: '600',
  },

  resultCard: {
    marginTop: 25,
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1b5e20',
  },

  resultValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b5e20',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
