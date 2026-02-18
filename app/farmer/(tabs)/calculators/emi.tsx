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

export default function VaddiCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'village' | 'bank'>('village');

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');

  const [interest, setInterest] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    loadLang();
  }, []);

  const loadLang = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);
    setLoading(false);
  };

  const calculate = () => {
    const P = Number(amount);
    const R = Number(rate);
    const T = Number(time);

    if (!P || !R || !T) return;

    const I = (P * R * T) / 100;

    setInterest(I);
    setTotal(P + I);
  };

  const reset = () => {
    setAmount('');
    setRate('');
    setTime('');
    setInterest(null);
    setTotal(null);
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
          <Ionicons name="cash-outline" size={22} color="#fff" />
          <Text style={styles.headerTitle}>
            {language === 'te'
              ? 'వడ్డీ కాలిక్యులేటర్'
              : 'Interest Calculator'}
          </Text>
        </View>

        {/* MODE TOGGLE */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, mode === 'village' && styles.activeToggle]}
            onPress={() => {
              setMode('village');
              reset();
            }}
          >
            <Text style={mode === 'village' && styles.activeText}>
              {language === 'te' ? 'ఊరి వడ్డీ' : 'Village Style'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, mode === 'bank' && styles.activeToggle]}
            onPress={() => {
              setMode('bank');
              reset();
            }}
          >
            <Text style={mode === 'bank' && styles.activeText}>
              {language === 'te' ? 'బ్యాంక్ వడ్డీ' : 'Bank Style'}
            </Text>
          </Pressable>
        </View>

        {/* INPUT CARD */}
        <View style={styles.card}>
          <InputField
            label={language === 'te' ? 'మొత్తం ₹' : 'Amount ₹'}
            value={amount}
            setValue={setAmount}
          />

          <InputField
            label={
              mode === 'village'
                ? language === 'te'
                  ? 'వడ్డీ (ఉదా: 2 రూపాయలు)'
                  : 'Vaddi (e.g. 2)'
                : language === 'te'
                ? 'వడ్డీ %'
                : 'Interest %'
            }
            value={rate}
            setValue={setRate}
          />

          <InputField
            label={
              mode === 'village'
                ? language === 'te'
                  ? 'నెలలు'
                  : 'Months'
                : language === 'te'
                ? 'సంవత్సరాలు'
                : 'Years'
            }
            value={time}
            setValue={setTime}
          />

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
        {interest !== null && (
          <View style={styles.resultCard}>
            <ResultRow
              label={language === 'te' ? 'వడ్డీ మొత్తం' : 'Interest Amount'}
              value={interest}
            />
            <ResultRow
              label={language === 'te' ? 'మొత్తం చెల్లింపు' : 'Total Payable'}
              value={total}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, value, setValue }: any) {
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

function ResultRow({ label, value }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>
        ₹ {value?.toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

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
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#eee',
    marginRight: 8,
  },
  activeToggle: {
    backgroundColor: '#2e7d32',
  },
  activeText: {
    color: '#fff',
    fontWeight: '600',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  btnRow: {
    flexDirection: 'row',
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
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 25,
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 18,
    elevation: 4,
  },
  resultLabel: {
    fontWeight: '600',
    color: '#1b5e20',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1b5e20',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
