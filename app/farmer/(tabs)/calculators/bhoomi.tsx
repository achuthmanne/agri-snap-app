import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function LandCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  // Main Inputs
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [result, setResult] = useState<any>(null);

  // Modal States for Steps Logic
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSteps, setTempSteps] = useState('');
  const [activeType, setActiveType] = useState<'L' | 'W' | null>(null);

  useEffect(() => {
    loadLang();
  }, []);

  const loadLang = async () => {
    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);
    setLoading(false);
  };

  // --- Step Modal Logic ---
  const openStepModal = (type: 'L' | 'W') => {
    setActiveType(type);
    setTempSteps('');
    setModalVisible(true);
  };

  const handleStepSubmit = () => {
    const steps = Number(tempSteps);
    if (!isNaN(steps) && steps > 0) {
      const feet = (steps * 2.5).toString(); // 1 step = 2.5 feet approx
      if (activeType === 'L') setLength(feet);
      else setWidth(feet);
    }
    setModalVisible(false);
    setTempSteps('');
  };

  const calculateLand = () => {
    Keyboard.dismiss();
    const L = Number(length || 0);
    const W = Number(width || 0);

    if (L > 0 && W > 0) {
      const totalSqFt = L * W;
      setResult({
        sqFt: totalSqFt.toLocaleString('en-IN'),
        acres: (totalSqFt / 43560).toFixed(3),
        guntas: (totalSqFt / 1089).toFixed(2),
        cents: (totalSqFt / 435.6).toFixed(2),
      });
    }
  };

  const reset = () => {
    setLength('');
    setWidth('');
    setResult(null);
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#1b5e20" /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="map-outline" size={22} color="#fff" />
          <Text style={styles.headerTitle}>{language === 'te' ? 'భూమి కొలతలు' : 'Land Calculator'}</Text>
        </View>

        {/* INFO BOX */}
       <View style={styles.infoBox}>
  <Ionicons name="information-circle-outline" size={24} color="#1b5e20" />
  <View style={{ flex: 1, marginLeft: 10 }}>
    <Text style={[styles.infoText, { fontWeight: '700', marginBottom: 2 }]}>
      {language === 'te' ? 'అడుగుల బటన్ ఎలా వాడాలి?' : 'How to use Steps button?'}
    </Text>
    <Text style={styles.infoText}>
      {language === 'te' 
        ? "మీ దగ్గర కొలత టేపు లేకపోయినా లేదా పొలం పొడవు, వెడల్పు ఎంతో తెలియకపోయినా కంగారు పడకండి. పక్కన ఉన్న 'అడుగులు' బటన్ నొక్కి, మీరు నడిచిన అడుగుల సంఖ్యను ఎంటర్ చేయండి. (1 అడుగు = 2.5 ఫీట్లుగా లెక్కించబడుతుంది)." 
        : "If you don't have a measuring tape or don't know the exact length and width, don't worry. Just click the 'Steps' button and enter the number of steps you walked. (1 step is calculated as 2.5 feet)."}
    </Text>
  </View>
</View>


        {/* INPUT CARD */}
        <View style={styles.card}>
          {/* LENGTH */}
          <Text style={styles.label}>{language === 'te' ? 'పొడవు (అడుగులలో)' : 'Length (in Feet)'}</Text>
          <View style={styles.inputWrapper}>
            <TextInput keyboardType="numeric" value={length} onChangeText={setLength} style={styles.inputField} placeholder="Feet" />
            <Pressable style={styles.stepBtn} onPress={() => openStepModal('L')}>
              <MaterialCommunityIcons name="walk" size={18} color="#fff" />
              <Text style={styles.stepBtnText}>{language === 'te' ? 'అడుగులు' : 'Steps'}</Text>
            </Pressable>
          </View>

          {/* WIDTH */}
          <Text style={styles.label}>{language === 'te' ? 'వెడల్పు (అడుగులలో)' : 'Width (in Feet)'}</Text>
          <View style={styles.inputWrapper}>
            <TextInput keyboardType="numeric" value={width} onChangeText={setWidth} style={styles.inputField} placeholder="Feet" />
            <Pressable style={styles.stepBtn} onPress={() => openStepModal('W')}>
              <MaterialCommunityIcons name="walk" size={18} color="#fff" />
              <Text style={styles.stepBtnText}>{language === 'te' ? 'అడుగులు' : 'Steps'}</Text>
            </Pressable>
          </View>

          <View style={styles.btnRow}>
            <Pressable style={styles.calcBtn} onPress={calculateLand}>
              <Text style={styles.btnText}>{language === 'te' ? 'లెక్కించు' : 'Calculate'}</Text>
            </Pressable>
            <Pressable style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetText}>{language === 'te' ? 'రిసెట్' : 'Reset'}</Text>
            </Pressable>
          </View>
        </View>

        {/* RESULT CARD */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resTitle}>{language === 'te' ? 'భూమి వివరాలు' : 'Land Details'}</Text>
            <ResultRow label={language === 'te' ? 'ఎకరాలు (Acres)' : 'Acres'} value={result.acres} />
            <ResultRow label={language === 'te' ? 'గుంటలు (Guntas)' : 'Guntas'} value={result.guntas} />
            <ResultRow label={language === 'te' ? 'సెంట్లు (Cents)' : 'Cents'} value={result.cents} />
            <View style={styles.divider} />
            <ResultRow label={language === 'te' ? 'చదరపు అడుగులు' : 'Total Area'} value={`${result.sqFt} Sq.Ft`} isSmall />
          </View>
        )}

        {/* STEP MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {language === 'te' ? 'అడుగులు ఎంటర్ చేయండి' : 'Enter Number of Steps'}
              </Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="0"
                value={tempSteps}
                onChangeText={setTempSteps}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>{language === 'te' ? 'వద్దు' : 'Cancel'}</Text>
                </Pressable>
                <Pressable style={styles.confirmBtn} onPress={handleStepSubmit}>
                  <Text style={styles.confirmText}>{language === 'te' ? 'సరే' : 'OK'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResultRow({ label, value, isSmall }: any) {
  return (
    <View style={styles.resRow}>
      <Text style={[styles.resLab, isSmall && { fontSize: 14, color: '#666' }]}>{label}:</Text>
      <Text style={[styles.resVal, isSmall && { fontSize: 16, color: '#666' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 20, flexGrow: 1, backgroundColor: '#f4f6f5' , paddingBottom: 50},
  header: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 10 },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#e8f5e9', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#c8e6c9',
    elevation: 2 
},
infoText: { 
    fontSize: 13, 
    color: '#1b5e20', 
    lineHeight: 18 // లైన్ల మధ్య గ్యాప్ ఉంటే చదవడానికి సులభంగా ఉంటుంది
},

  card: { backgroundColor: '#fff', padding: 20, borderRadius: 18, elevation: 5 },
  label: { fontWeight: '600', marginBottom: 5, color: '#444' },
  inputWrapper: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  inputField: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#fafafa', fontSize: 16 },
  stepBtn: { backgroundColor: '#2e7d32', padding: 12, borderRadius: 10, marginLeft: 8, flexDirection: 'row', alignItems: 'center', minWidth: 85, justifyContent: 'center' },
  stepBtnText: { color: '#fff', fontWeight: '700', marginLeft: 4, fontSize: 12 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  calcBtn: { backgroundColor: '#1b5e20', padding: 15, borderRadius: 12, flex: 2, marginRight: 10, alignItems: 'center' },
  resetBtn: { backgroundColor: '#eee', padding: 15, borderRadius: 12, flex: 1, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  resetText: { color: '#333', fontWeight: '600' },
  resultCard: { marginTop: 25, backgroundColor: '#fff', padding: 20, borderRadius: 20, borderLeftWidth: 8, borderLeftColor: '#1b5e20', elevation: 5 },
  resTitle: { fontSize: 14, color: '#666', fontWeight: '700', marginBottom: 15, textAlign: 'center', textTransform: 'uppercase' },
  resRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  resLab: { fontSize: 16, color: '#2e7d32', fontWeight: '600' },
  resVal: { fontSize: 20, fontWeight: '800', color: '#1b5e20' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20, width: '85%', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  modalInput: { borderWidth: 1, borderColor: '#1b5e20', borderRadius: 12, padding: 15, textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#1b5e20' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { padding: 15, flex: 1, alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600', fontSize: 16 },
  confirmBtn: { backgroundColor: '#1b5e20', padding: 15, flex: 1.5, alignItems: 'center', borderRadius: 12 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
