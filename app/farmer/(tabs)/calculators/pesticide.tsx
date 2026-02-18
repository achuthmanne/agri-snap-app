import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView, StyleSheet,
  Text, TextInput,
  View
} from 'react-native';

type SprayMode = 'manual' | 'drone' | 'tractor';

export default function PesticideCalculator() {
  const [mode, setMode] = useState<SprayMode>('manual');
  const [acres, setAcres] = useState('');
  const [dosage, setDosage] = useState(''); 
  const [tankCap, setTankCap] = useState('16');
  const [perAcreInput, setPerAcreInput] = useState('10'); 
  const [bottleSize, setBottleSize] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<any>(null);
const [showSOP, setShowSOP] = useState(false);

  // మోడ్ మారినప్పుడు రైతుకి కావాల్సిన డీఫాల్ట్ వాల్యూస్
  useEffect(() => {
  if (mode === 'manual') {
    setPerAcreInput('10'); // 10 ట్యాంకులు
    setTankCap('16');
  } else if (mode === 'drone') {
    setPerAcreInput('1'); // 1 ట్రిప్
    setTankCap('10');
  } else {
    // మెషీన్ కోసం: ఒక ట్యాంకు సుమారు 3.5 ఎకరాలు వస్తుంది అని డీఫాల్ట్ ఇద్దాం
    setPerAcreInput('3.5'); 
    setTankCap('500'); // సాధారణ మెషీన్ ట్యాంక్ సైజు
  }
  setResult(null);
}, [mode]);


  const calculate = () => {
    const A = parseFloat(acres);
    const D = parseFloat(dosage);
    const TC = parseFloat(tankCap);
    const PI = parseFloat(perAcreInput);
    const BS = parseFloat(bottleSize);
    const P = parseFloat(price);

    if (A && D && PI && TC) {
      let totalTanks = 0;
      let totalPesticide = 0;
      let dosePerTank = 0;
      let totalWater = 0;

      if (mode === 'manual') {
        // రైతుకి ట్యాంకు మందు తెలుసు (D = ml per tank)
        totalTanks = Math.ceil(A * PI);
        totalPesticide = totalTanks * D;
        dosePerTank = D;
        totalWater = totalTanks * TC;
      } else if (mode === 'drone') {
        // డ్రోన్ కి ఎకరం మందు తెలుసు (D = ml per acre)
        totalPesticide = A * D;
        totalTanks = Math.ceil(A * PI); // ఎకరానికి ఎన్ని సార్లు ఎగురుతాడు
        dosePerTank = D / PI; // ప్రతి ట్రిప్పుకు ఎంత మందు పోయాలి
        totalWater = totalTanks * TC;
      } else {
  // మెషీన్ కి ఎకరం మందు (D) తెలుసు. 
  // PI అంటే ఇక్కడ "ఒక ట్యాంక్ ఎన్ని ఎకరాలు వస్తుంది" (e.g. 3.5 or 4)
  totalPesticide = A * D; 
  
  // మొత్తం ఎన్ని ట్యాంకులు పడతాయో లెక్క
  totalTanks = Math.ceil(A / PI); 
  
  // ఒక ట్యాంకులో పోయాల్సిన మందు = మొత్తం మందు / మొత్తం ట్యాంకులు
  dosePerTank = totalPesticide / totalTanks; 
  
  // మొత్తం నీరు = మొత్తం ట్యాంకులు * ట్యాంక్ కెపాసిటీ
  totalWater = totalTanks * TC;
}


      let bottlesToBuy = BS ? Math.ceil(totalPesticide / BS) : 0;
      let totalCost = P ? bottlesToBuy * P : 0;

      setResult({ 
        totalPesticide: totalPesticide.toFixed(2), 
        totalTanks, 
        dosePerTank: dosePerTank.toFixed(2), 
        totalWater: totalWater.toFixed(1), 
        bottlesToBuy, 
        totalCost,
         note: `స్పీడ్ ని బట్టి ట్యాంకుల సంఖ్య మారవచ్చు. ప్రస్తుతానికి ${totalTanks} ట్యాంకులకి లెక్కించబడింది.` 
      });
      Keyboard.dismiss();
    }
  };
const reset = () => {
  setAcres('');
  setDosage('');
  setBottleSize(''); // బాటిల్ సైజ్ రీసెట్
  setPrice('');      // ధర రీసెట్
  setResult(null);
  
  // మోడ్ ని బట్టి డీఫాల్ట్ వాల్యూస్ మళ్ళీ సెట్ అవ్వడానికి
  if (mode === 'manual') {
    setPerAcreInput('10');
    setTankCap('16');
  } else if (mode === 'drone') {
    setPerAcreInput('1');
    setTankCap('10');
  } else {
    setPerAcreInput('3.5');
    setTankCap('500');
  }
  
  Keyboard.dismiss();
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="spray" size={24} color="#fff" />
        <Text style={styles.headerTitle}>మందుల లెక్క (Pesticide Cal)</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.modeRow}>
            <ModeBtn label="చేతి పంప్" active={mode === 'manual'} onPress={() => setMode('manual')} icon="hand-back-left" />
            <ModeBtn label="డ్రోన్" active={mode === 'drone'} onPress={() => setMode('drone')} icon="drone" />
            <ModeBtn label="మెషీన్/ట్రాక్టర్" active={mode === 'tractor'} onPress={() => setMode('tractor')} icon="tractor" />
          </View>

          <View style={styles.card}>
            <InputField label="ఎన్ని ఎకరాలు? (Acres)" value={acres} onChange={setAcres} placeholder="0" />
            <InputField 
              label={mode === 'manual' ? "ఒక ట్యాంకుకు మందు (ML/Gm)" : "ఎకరాకు మందు (ML/Gm)"} 
              value={dosage} onChange={setDosage} placeholder="e.g. 25 or 250" 
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField label="ట్యాంక్ సైజు (Ltrs)" value={tankCap} onChange={setTankCap} />
              </View>
              <View style={{ flex: 1 }}>
                <InputField 
  label={
    mode === 'manual' ? "ఎకరాకు ఎన్ని ట్యాంకులు?" : 
    mode === 'drone' ? "ఎకరాకు ఎన్ని ట్రిప్పులు?" : 
    "ఒక ట్యాంకు ఎన్ని ఎకరాలకు వస్తుంది?" 
  }
  value={perAcreInput} 
  onChange={setPerAcreInput} 
  placeholder={mode === 'tractor' ? "ఉదా: 3.5 లేదా 4" : "10"}
/>

              </View>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}><InputField label="డబ్బా సైజు" value={bottleSize} onChange={setBottleSize} placeholder="250" /></View>
              <View style={{ flex: 1 }}><InputField label="ధర ₹" value={price} onChange={setPrice} placeholder="₹" /></View>
            </View>
            <View style={styles.btnRow}>
              <Pressable style={styles.calcBtn} onPress={calculate}><Text style={styles.btnText}>లెక్కించు</Text></Pressable>
              <Pressable style={styles.resetBtn} onPress={() => {setAcres(''); setDosage(''); setResult(null);}}><Text style={styles.resetText}>రిసెట్</Text></Pressable>
            </View>
          </View>

          {result && (
            <View style={[styles.resCard, { borderTopColor: mode === 'drone' ? '#0288d1' :  mode === 'tractor' ? '#f57c00' : '#1b5e20' }]}>
              <Text style={styles.resHeading}>{mode === 'drone' ? 'డ్రోన్ స్ప్రే వివరాలు:' : 'స్ప్రే వివరాలు:'}</Text>
              
              <View style={[styles.mainHighlight, { backgroundColor: mode === 'drone' ? '#0288d1' :  mode === 'tractor' ? '#f57c00' :   '#1b5e20' }]}>
                <Text style={styles.highLabel}>మొత్తం ఖర్చు:</Text>
                <Text style={styles.highVal}>₹{result.totalCost.toLocaleString('en-IN')}</Text>
                <Text style={styles.highSub}>కావాల్సిన డబ్బాలు: {result.bottlesToBuy} ({bottleSize}ml)</Text>
              </View>

              <View style={styles.resGrid}>
                <ResultItem label="మొత్తం మందు" value={`${result.totalPesticide} ML`} />
                <ResultItem label={mode === 'drone' ? "ట్రిప్పుకు మందు" : "ట్యాంకుకు మందు"} value={`${result.dosePerTank} ML`} />
                <ResultItem label={mode === 'drone' ? "మొత్తం ట్రిప్పులు" : "మొత్తం ట్యాంకులు"} value={result.totalTanks} />
                <ResultItem label="మొత్తం నీరు" value={`${result.totalWater} లీటర్లు`} />
                <ResultLine label='గమనిక: ' value={result.note}/>
              </View>
              
{/* BUTTON TO OPEN MODAL */}
<Pressable style={[styles.sopBtn , {backgroundColor: mode === 'drone' ? '#0288d1' :  mode === 'tractor' ? '#f57c00' : '#1b5e20' }]} onPress={() => setShowSOP(true)}>
  <MaterialCommunityIcons name="clipboard-text-search-outline" size={20} color="#fff" />
  <Text style={styles.sopBtnText }>స్ప్రేయింగ్ పరామితులు (SOP Guide)</Text>
</Pressable>

{/* FULL DETAILS MODAL */}
<Modal visible={showSOP} animationType="fade" transparent={true}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>SOP - స్ప్రేయింగ్ గైడ్ (Table 4.1)</Text>
        <Pressable onPress={() => setShowSOP(false)}>
          <MaterialCommunityIcons name="close-box" size={30} color="#d32f2f" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* DRONE DETAILS CARD */}
        <View style={[styles.detailCard, { borderLeftColor: '#0288d1' }]}>
          <Text style={styles.typeTitle}>🚁 డ్రోన్ (Drone)</Text>
          <DetailRow label="నీటి పరిమాణం" value="15 – 40 L/ha" />
          <DetailRow label="నోజిల్ రకం" value="Flat fan (4 Nozzles)" />
          <DetailRow label="ట్యాంక్ కెపాసిటీ" value="5 – 20 Liters" />
          <DetailRow label="ఎత్తు (Height)" value="1.5 – 3.0 మీటర్లు" highlight />
          <DetailRow label="వేగం (Speed)" value="3 – 5 m/s" highlight />
          <DetailRow label="స్ప్రే వెడల్పు" value="3 – 5 మీటర్లు" />
          <DetailRow label="సామర్థ్యం" value="2.0 ha/hour" />
          <Text style={styles.suitText}>• ఉపయోగాలు: చిన్న మరియు పెద్ద పొలాలు, పండ్ల తోటలు, కూరగాయలు, టీ మరియు కాఫీ తోటలకు అనుకూలం.</Text>
        </View>

        {/* KNAPSACK (HAND PUMP) DETAILS */}
        <View style={[styles.detailCard, { borderLeftColor: '#1b5e20' }]}>
          <Text style={styles.typeTitle}>🎒 చేతి పంప్ (Knapsack)</Text>
          <DetailRow label="నీటి పరిమాణం" value="300 – 500 L/ha" />
          <DetailRow label="ఎత్తు (Height)" value="0.6 – 1.0 మీటర్లు" />
          <DetailRow label="వేగం (Speed)" value="0.5 – 1.5 m/s" />
          <DetailRow label="సామర్థ్యం" value="0.12 ha/hour" />
        </View>

        {/* TRACTOR MOUNTED DETAILS */}
        <View style={[styles.detailCard, { borderLeftColor: '#f57c00' }]}>
          <Text style={styles.typeTitle}>🚜 ట్రాక్టర్ (Tractor Mounted)</Text>
          <DetailRow label="నీటి పరిమాణం" value="300 – 500 L/ha" />
          <DetailRow label="నోజిల్స్ సంఖ్య" value="24 Nozzles" />
          <DetailRow label="ట్యాంక్ కెపాసిటీ" value="400 Liters" />
          <DetailRow label="వేగం (Speed)" value="0.83 m/s" />
          <DetailRow label="స్ప్రే వెడల్పు" value="12 మీటర్లు" />
          <Text style={styles.suitText}>• ఉపయోగాలు: పత్తి, మొక్కజొన్న, సోయాబీన్ వంటి వరుసలలో వేసే పంటలకు అనుకూలం.</Text>
        </View>

        <Text style={styles.sourceText}>Source: [Standard Operating Procedure (SOP) for Drone Application](https://ppqs.gov.in)</Text>
      </ScrollView>
    </View>
  </View>
</Modal>
            </View>
          )}

          {/* SAFETY GUIDELINES CARD */}
<View style={[styles.card, { marginTop: 20, backgroundColor: '#fff8e1', borderColor: '#ffc107', borderWidth: 1 }]}>
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
    <MaterialCommunityIcons name="alert-decagram" size={24} color="#f57c00" />
    <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#e65100' }}>
      ముఖ్యమైన సూచనలు (Guidelines)
    </Text>
  </View>

  {/* Common Tips */}
  <GuidelineText icon="wind-turbine" text="గాలికి ఎదురుగా నిలబడి మందు చల్లకండి." />
  <GuidelineText icon="face-mask" text="తప్పనిసరిగా మాస్క్ మరియు గ్లౌజులు ధరించండి." />

  {/* Mode Specific Tips */}
  {mode === 'drone' && (
    <>
      <GuidelineText icon="weather-windy" text="గాలి వేగం 10 kmph కంటే తక్కువ ఉన్నప్పుడు మాత్రమే డ్రోన్ వాడండి." />
      <GuidelineText icon="height" text="పంటకు 2-3 మీటర్ల ఎత్తులో డ్రోన్ ఎగిరేలా చూడండి." />
      <GuidelineText icon="battery-charging" text="బ్యాటరీ లో (Low) ఉన్నప్పుడు స్ప్రే ఆపండి." />
    </>
  )}

  {mode === 'manual' && (
    <GuidelineText icon="mower" text="నోజిల్ (Nozzle) అడ్డుపడకుండా ఎప్పటికప్పుడు శుభ్రం చేసుకోండి." />
  )}

  {mode === 'tractor' && (
    <GuidelineText icon="speedometer" text="మెషీన్ ప్రెజర్ సమానంగా ఉండేలా చూసుకోండి." />
  )}
  
  <Text style={{ fontSize: 11, color: '#777', marginTop: 10, fontStyle: 'italic' }}>
    * గమనిక: మందు డబ్బా మీద ఉన్న సూచనలను కూడా ఒకసారి చదవండి.
  </Text>
</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({ label, value, onChange, placeholder }: any) => (
  <View style={{ marginBottom: 12 }}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} placeholder={placeholder} /></View>
);

const ModeBtn = ({ label, active, onPress, icon }: any) => (
  <Pressable onPress={onPress} style={[styles.modeBtn, active && styles.activeMode]}><MaterialCommunityIcons name={icon} size={18} color={active ? '#fff' : '#1b5e20'} /><Text style={[styles.modeText, active && { color: '#fff' }]}>{label}</Text></Pressable>
);

const ResultItem = ({ label, value }: any) => (
  <View style={styles.gridItem}><Text style={styles.gridLabel}>{label}</Text><Text style={styles.gridVal}>{value}</Text></View>
);

const ResultLine = ({ label, value }: any) => (
  <View style={styles.resLine}><Text style={styles.resLabel}>{label}:</Text><Text style={styles.resValLine}>{value}</Text></View>
);
const GuidelineText = ({ text }: any) => (
  <Text style={styles.guideText}>• {text}</Text>
);
const DetailRow = ({ label, value, highlight }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailVal, highlight && { color: '#d32f2f' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 40, elevation: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 8 },
  scrollContainer: { padding: 20 },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modeBtn: { flex: 1, alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 3, borderWidth: 1, borderColor: '#1b5e20' },
  activeMode: { backgroundColor: '#1b5e20' },
  modeText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 16, elevation: 3 },
  row: { flexDirection: 'row' },
  label: { fontSize: 12, color: '#444', marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 15, color: '#000' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  calcBtn: { flex: 2, backgroundColor: '#1b5e20', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  resetBtn: { flex: 1, backgroundColor: '#eee', padding: 12, borderRadius: 8, alignItems: 'center' },
  resetText: { color: '#666', fontWeight: 'bold' },
  resCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginTop: 15, elevation: 4, borderTopWidth: 5 },
  resHeading: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  mainHighlight: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  highLabel: { color: '#fff', opacity: 0.8, fontSize: 12 },
  highVal: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  highSub: { color: '#fff', fontSize: 12, marginTop: 4 },
  resGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  gridLabel: { fontSize: 10, color: '#666' },
  gridVal: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  resLine: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  resLabel: { fontSize: 13, color: '#444' },
  resValLine: { fontWeight: 'bold' },
  guideCard: { marginTop: 20, padding: 15, backgroundColor: '#fff8e1', borderRadius: 10 },
  guideTitle: { fontWeight: 'bold', color: '#e65100', fontSize: 14 },
  sopBtn: { backgroundColor: '#0288d1', flexDirection: 'row', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginHorizontal: 20 },
  sopBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  detailCard: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 15, borderLeftWidth: 5 },
  typeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  detailLabel: { fontSize: 13, color: '#666' },
  detailVal: { fontSize: 13, fontWeight: 'bold', color: '#000' },
  suitText: { fontSize: 12, color: '#555', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
  sourceText: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 10 },
  guideText: { fontSize: 12, color: '#5d4037', marginTop: 5, lineHeight: 18 },
  
});
