import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView, Platform,
  Pressable,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text, TextInput,
  View
} from 'react-native';

type RentMode = 'acre' | 'hour';

export default function MachineryRentalCalculator() {
  const [mode, setMode] = useState<RentMode>('acre');
  const [areaOrTime, setAreaOrTime] = useState(''); // Acres or Hours
  const [rate, setRate] = useState(''); // Rate per Acre or Hour
  const [dieselSpent, setDieselSpent] = useState(''); // Optional: Diesel cost
  const [otherExpenses, setOtherExpenses] = useState(''); // Driver beta, etc.
  const [result, setResult] = useState<any>(null);

 const calculate = () => {
  const AT = parseFloat(areaOrTime);
  const R = parseFloat(rate);
  const D = parseFloat(dieselSpent || '0');
  const OE = parseFloat(otherExpenses || '0');

  if (AT && R) {
    const totalAmount = AT * R;
    const totalExpenses = D + OE;
    const netProfit = totalAmount - totalExpenses;

    // గంటలు లేదా ఎకరాల అంచనా (Estimated Conversion)
    // సాధారణంగా 1 ఎకరం = 1.7 గంటలు (సగటు)
    let estimatedValue = "";
    if (mode === 'acre') {
      const hrs = (AT * 1.7).toFixed(1);
      estimatedValue = `${hrs} గంటలు (సుమారు)`;
    } else {
      const acr = (AT / 1.7).toFixed(1);
      estimatedValue = `${acr} ఎకరాలు (సుమారు)`;
    }

    setResult({ totalAmount, totalExpenses, netProfit, estimatedValue });
    Keyboard.dismiss();
  }
};

  const reset = () => {
    setAreaOrTime('');
    setRate('');
    setDieselSpent('');
    setOtherExpenses('');
    setResult(null);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* STICKY HEADER */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="tractor" size={24} color="#fff" />
        <Text style={styles.headerTitle}>యంత్రాల లెక్క (Machinery Cal)</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* MODE SELECTOR */}
          <View style={styles.toggleRow}>
            <Pressable 
              style={[styles.toggleBtn, mode === 'acre' && styles.activeToggle]} 
              onPress={() => {setMode('acre'); setResult(null);}}
            >
              <Text style={[styles.toggleText, mode === 'acre' && { color: '#fff' }]}>ఎకరాల లెక్క (Per Acre)</Text>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, mode === 'hour' && styles.activeToggle]} 
              onPress={() => {setMode('hour'); setResult(null);}}
            >
              <Text style={[styles.toggleText, mode === 'hour' && { color: '#fff' }]}>గంటల లెక్క (Per Hour)</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <InputField 
              label={mode === 'acre' ? "ఎన్ని ఎకరాలు? (Total Acres)" : "ఎన్ని గంటలు? (Total Hours)"} 
              value={areaOrTime} onChange={setAreaOrTime} placeholder="0" 
            />
            
            <InputField 
              label={mode === 'acre' ? "ఎకరాకు ₹ (Rate per Acre)" : "గంటకు ₹ (Rate per Hour)"} 
              value={rate} onChange={setRate} placeholder="₹" 
            />

            <View style={styles.divider} />
            <Text style={styles.subHeading}>ఖర్చులు (ఐచ్ఛికం - Optional)</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField label="డీజిల్ ఖర్చు ₹" value={dieselSpent} onChange={setDieselSpent} placeholder="0" />
              </View>
              <View style={{ flex: 1 }}>
                <InputField label="ఇతర ఖర్చులు ₹" value={otherExpenses} onChange={setOtherExpenses} placeholder="0" />
              </View>
            </View>

            <View style={styles.btnRow}>
              <Pressable style={styles.calcBtn} onPress={calculate}>
                <Text style={styles.calcBtnText}>లెక్కించు</Text>
              </Pressable>
              <Pressable style={styles.resetBtn} onPress={reset}>
                <Text style={styles.resetBtnText}>రిసెట్</Text>
              </Pressable>
            </View>
          </View>
          
          {/* RESULTS */}
          {result && (
  <View 
    style={[
      styles.resCard, 
      { borderTopColor: result.netProfit < 0 ? '#d32f2f' : '#1b5e20' }
    ]}
  >

    <View style={[styles.resLine, { backgroundColor: '#fff9c4', padding: 8, borderRadius: 5 }]}>
      <Text style={[styles.resLabel, { fontWeight: 'bold' }]}>
        {mode === 'acre' ? "మొత్తం పట్టే సమయం:" : "పూర్తయ్యే పొలం:"}
      </Text>
      <Text style={[styles.resVal, { color: '#f57c00' }]}>
        {result.estimatedValue}
      </Text>
    </View>

    <View style={styles.resLine}>
      <Text style={styles.resLabel}>మొత్తం అద్దె (Total Rent):</Text>
      <Text style={styles.resVal}>
        ₹{result.totalAmount.toLocaleString('en-IN')}
      </Text>
    </View>

    <View style={styles.resLine}>
      <Text style={styles.resLabel}>మొత్తం ఖర్చులు (Expenses):</Text>
      <Text style={[styles.resVal, {color: '#d32f2f'}]}>
        - ₹{result.totalExpenses.toLocaleString('en-IN')}
      </Text>
    </View>

    <View 
      style={[
        styles.profitBox,
        result.netProfit < 0 && {
          backgroundColor: '#ffebee',
          borderColor: '#ef9a9a'
        }
      ]}
    >
      <Text 
        style={[
          styles.profitLabel,
          { color: result.netProfit < 0 ? '#c62828' : '#2e7d32' }
        ]}
      >
        {result.netProfit < 0 ? "నష్టం (Loss)" : "నికర లాభం (Net Profit)"}
      </Text>

      <Text 
        style={[
          styles.profitVal,
          { color: result.netProfit < 0 ? '#b71c1c' : '#1b5e20' }
        ]}
      >
        ₹{Math.abs(result.netProfit).toLocaleString('en-IN')}
      </Text>
    </View>

  </View>
)}


          {/* INFO CARD */}
          <View style={styles.infoCard}>
             <Text style={styles.infoTitle}>💡 మీకు తెలుసా?</Text>
             <Text style={styles.infoText}>• ట్రాక్టర్ రోటవేటర్ సాధారణంగా ఎకరానికి 1.5 నుండి 2 గంటల సమయం తీసుకుంటుంది.</Text>
             <Text style={styles.infoText}>• డీజిల్ ధరలు పెరిగినప్పుడు గంటల లెక్కన అద్దె తీసుకోవడం ఓనర్లకు లాభదాయకం.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({ label, value, onChange, placeholder }: any) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} placeholder={placeholder} />
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: Platform.OS === 'android' ? 40 : 10, marginBottom: 10, elevation: 4 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  scrollContainer: { padding: 20, paddingBottom: 50 },
  toggleRow: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#ddd', borderRadius: 10, padding: 4 },
  toggleBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  activeToggle: { backgroundColor: '#1b5e20' },
  toggleText: { fontWeight: '700', color: '#555', fontSize: 13 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 4 },
  subHeading: { fontSize: 14, fontWeight: 'bold', color: '#1b5e20', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  row: { flexDirection: 'row' },
  label: { fontSize: 13, color: '#333', marginBottom: 5, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#000' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
  calcBtn: { flex: 2, backgroundColor: '#1b5e20', padding: 15, borderRadius: 10, alignItems: 'center' },
  calcBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
   resetBtn: { backgroundColor: '#eee', padding: 15, borderRadius: 12, flex: 1, alignItems: 'center' },
  resetBtnText: { color: '#565555', fontWeight: 'bold', fontSize: 16 },
  resCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginTop: 20, elevation: 3, borderTopWidth: 4, borderTopColor: '#1b5e20' },
  resLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resLabel: { color: '#555', fontSize: 14 },
  resVal: { fontWeight: 'bold', fontSize: 16 },
  profitBox: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#c8e6c9' },
  profitLabel: { color: '#2e7d32', fontWeight: '600' },
  profitVal: { color: '#1b5e20', fontSize: 24, fontWeight: '800' },
  infoCard: { marginTop: 25, padding: 15, backgroundColor: '#e3f2fd', borderRadius: 10 },
  infoTitle: { fontWeight: 'bold', color: '#0d47a1', marginBottom: 5 },
  infoText: { fontSize: 12, color: '#444', marginBottom: 4, lineHeight: 18 }
});
