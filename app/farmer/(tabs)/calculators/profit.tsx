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

export default function ProfitCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadLang();
  }, []);

  const loadLang = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);
    setLoading(false);
  };

  const calculate = () => {
    const i = Number(income || 0);
    const e = Number(expense || 0);

    if (!i && !e) return;

    const difference = i - e;
    const percentage = e > 0 ? (difference / e) * 100 : 0;

    setResult({
      difference,
      percentage,
    });
  };

  const reset = () => {
    setIncome('');
    setExpense('');
    setResult(null);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  const isProfit = result?.difference >= 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="trending-up-outline" size={22} color="#fff" />
          <Text style={styles.headerTitle}>
            {language === 'te'
              ? 'లాభం / నష్టం కాలిక్యులేటర్'
              : 'Profit / Loss Calculator'}
          </Text>
        </View>

        {/* INPUT CARD */}
        <View style={styles.card}>

          <Input
            icon="cash-outline"
            label={language === 'te' ? 'మొత్తం ఆదాయం ₹' : 'Total Income ₹'}
            value={income}
            setValue={setIncome}
          />

          <Input
            icon="card-outline"
            label={language === 'te' ? 'మొత్తం ఖర్చు ₹' : 'Total Expense ₹'}
            value={expense}
            setValue={setExpense}
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
        {result && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: isProfit ? '#e8f5e9' : '#ffebee',
              },
            ]}
          >
            <Ionicons
              name={isProfit ? 'trending-up' : 'trending-down'}
              size={28}
              color={isProfit ? '#1b5e20' : '#c62828'}
            />

            <Text style={styles.resultTitle}>
              {isProfit
                ? language === 'te'
                  ? 'లాభం'
                  : 'Profit'
                : language === 'te'
                ? 'నష్టం'
                : 'Loss'}
            </Text>

            <Text
              style={[
                styles.resultValue,
                { color: isProfit ? '#1b5e20' : '#c62828' },
              ]}
            >
              ₹ {Math.abs(result.difference).toLocaleString('en-IN')}
            </Text>

            <Text style={styles.percentText}>
              {language === 'te' ? 'శాతం:' : 'Percentage:'}{' '}
              {result.percentage.toFixed(2)}%
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------- INPUT COMPONENT ---------- */

function Input({ icon, label, value, setValue }: any) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color="#1b5e20" />
        <TextInput
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          style={styles.input}
          placeholder="0"
        />
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    padding: 10,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
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
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  percentText: {
    marginTop: 6,
    fontWeight: '600',
    color: '#555',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
