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

export default function DieselUsageCalculator() {
  const [tankSize, setTankSize] = useState('40'); // ట్రాక్టర్ ట్యాంక్ కెపాసిటీ (Default 40L)
  const [startLevel, setStartLevel] = useState(100); // ప్రారంభంలో % (100% = Full)
  const [endLevel, setEndLevel] = useState(50);   // చివరలో % (50% = Half)
  const [workDone, setWorkDone] = useState('');   // ఎకరాలు లేదా గంటలు
  const [price, setPrice] = useState('98');       // డీజిల్ ధర
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const TS = parseFloat(tankSize);
    const SL = startLevel / 100;
    const EL = endLevel / 100;
    const WD = parseFloat(workDone);
    const P = parseFloat(price);

    if (TS && WD > 0 && startLevel > endLevel) {
      const consumed = (SL - EL) * TS; // వాడిన లీటర్లు
      const totalCost = consumed * P;
      const perUnit = (consumed / WD).toFixed(2); // ఎకరానికి లేదా గంటకు

      setResult({ consumed: consumed.toFixed(1), totalCost: totalCost.toFixed(0), perUnit });
      Keyboard.dismiss();
    }
  };

  const LevelBtn = ({ label, value, current, set }: any) => (
    <Pressable 
      onPress={() => {set(value); setResult(null);}} 
      style={[styles.levelBtn, current === value && styles.activeLevel]}
    >
      <Text style={[styles.levelText, current === value && {color: '#fff'}]}>{label}</Text>
    </Pressable>
  );
  const reset = () => {
   
    setWorkDone('');
    setStartLevel(100);
    setEndLevel(50);
    setResult(null);
    Keyboard.dismiss();
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="gas-station" size={24} color="#fff" />
        <Text style={styles.headerTitle}>డీజిల్ వినియోగం (Diesel Usage)</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          <View style={styles.card}>
            <Text style={styles.label}>ట్రాక్టర్ ట్యాంక్ సామర్థ్యం (Total Tank Ltrs)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={tankSize} onChangeText={setTankSize} placeholder="e.g. 40 or 50" />

            {/* START LEVEL */}
            <Text style={[styles.label, {marginTop: 10}]}>పని మొదట్లో ట్యాంక్ ఎంత ఉంది? (Start)</Text>
            <View style={styles.levelRow}>
              <LevelBtn label="Full" value={100} current={startLevel} set={setStartLevel} />
              <LevelBtn label="3/4" value={75} current={startLevel} set={setStartLevel} />
              <LevelBtn label="1/2" value={50} current={startLevel} set={setStartLevel} />
              <LevelBtn label="1/4" value={25} current={startLevel} set={setStartLevel} />
            </View>

            {/* END LEVEL */}
            <Text style={[styles.label, {marginTop: 10}]}>పని ముగిశాక ట్యాంక్ ఎంత ఉంది? (End)</Text>
            <View style={styles.levelRow}>
              <LevelBtn label="3/4" value={75} current={endLevel} set={setEndLevel} />
              <LevelBtn label="1/2" value={50} current={endLevel} set={setEndLevel} />
              <LevelBtn label="1/4" value={25} current={endLevel} set={setEndLevel} />
              <LevelBtn label="Empty" value={5} current={endLevel} set={setEndLevel} />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>ఎన్ని ఎకరాలు/గంటలు?</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={workDone} onChangeText={setWorkDone} placeholder="0" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>డీజిల్ ధర (1L)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
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
            <View style={styles.resCard}>
              <View style={styles.resLine}>
                <Text style={styles.resLabel}>వాడిన డీజిల్:</Text>
                <Text style={styles.resVal}>{result.consumed} లీటర్లు</Text>
              </View>
              <View style={styles.resLine}>
                <Text style={styles.resLabel}>ఎకరానికి/గంటకు:</Text>
                <Text style={styles.resVal}>{result.perUnit} లీటర్లు</Text>
              </View>
              <View style={styles.costBox}>
                <Text style={styles.costText}>మొత్తం ఖర్చు: ₹{result.totalCost}</Text>
              </View>
            </View>
          )}

          {/* GUIDELINE CARD */}
          <View style={styles.guideCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
              <MaterialCommunityIcons name="lightbulb-on" size={20} color="#f57c00" />
              <Text style={styles.guideTitle}>డీజిల్ ఆదా చిట్కాలు:</Text>
            </View>
            <Text style={styles.guideText}>• మెషీన్ ఎయిర్ ఫిల్టర్ ని ఎప్పటికప్పుడు శుభ్రం చేయండి.</Text>
            <Text style={styles.guideText}>• టైర్లలో గాలి తక్కువ ఉంటే డీజిల్ ఎక్కువ ఖర్చవుతుంది.</Text>
            <Text style={styles.guideText}>• ఇంజిన్ ఆయిల్ సకాలంలో మార్పిడి చేయించండి.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: Platform.OS === 'android' ? 40 : 10, marginBottom: 10, elevation: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 8 },
  scrollContainer: { padding: 20, paddingBottom: 50 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, elevation: 4 },
  label: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  levelBtn: { flex: 1, padding: 8, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, marginHorizontal: 2, borderWidth: 1, borderColor: '#ccc' },
  activeLevel: { backgroundColor: '#1b5e20', borderColor: '#1b5e20' },
  levelText: { fontSize: 11, fontWeight: 'bold', color: '#555' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  row: { flexDirection: 'row' },
   btnRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 15 
  },
  calcBtn: { 
    flex: 2, 
    backgroundColor: '#1b5e20', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
   resetBtn: { backgroundColor: '#eee', padding: 15, borderRadius: 12, flex: 1, alignItems: 'center' },
  calcBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resetBtnText: { color: '#555454', fontWeight: 'bold', fontSize: 16 },
 
  resCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginTop: 20, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#1b5e20' },
  resLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resLabel: { color: '#555', fontSize: 14 },
  resVal: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  costBox: { backgroundColor: '#1b5e20', padding: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  costText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  guideCard: { marginTop: 20, padding: 15, backgroundColor: '#fff8e1', borderRadius: 12, borderWidth: 1, borderColor: '#ffe082' },
  guideTitle: { fontSize: 15, fontWeight: 'bold', color: '#f57c00', marginLeft: 5 },
  guideText: { fontSize: 12, color: '#5d4037', marginTop: 4, lineHeight: 18 }
});
