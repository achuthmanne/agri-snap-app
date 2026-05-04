import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import AppHeader from '@/components/AppHeader';
import AppText from '@/components/AppText';

export default function InterestCalculator() {
  const router = useRouter();
  const [language, setLanguage] = useState<'te' | 'en'>('te');

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'village' | 'bank' | 'emi'>('village');

  // Shared States
  const [principal, setPrincipal] = useState('');
  
  // Village State
  const [villageRate, setVillageRate] = useState('2');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Bank State
  const [bankRate, setBankRate] = useState('9'); 

  // EMI State
  const [emiRate, setEmiRate] = useState('11'); 
  const [emiMonths, setEmiMonths] = useState('24'); 

  // Modals
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // 🔥 Custom Alert State
  const [alertData, setAlertData] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: ''
  });

  // Result State
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('APP_LANG').then((saved) => {
      if (saved === 'te' || saved === 'en') setLanguage(saved);
    });
  }, []);

  useEffect(() => {
    setResult(null);
  }, [activeTab]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // 🔥 కస్టమ్ అలర్ట్ చూపించడానికి ఫంక్షన్
  const showAlert = (msg: string) => {
    setAlertData({ visible: true, message: msg });
  };

  const calculateVillage = (P: number) => {
    const R = parseFloat(villageRate);
    if (isNaN(R) || R <= 0) return showAlert(language === 'te' ? 'దయచేసి సరైన వడ్డీ రేటు ఇవ్వండి' : 'Please enter a valid rate');
    if (startDate > endDate) return showAlert(language === 'te' ? 'తిరిగి ఇచ్చే తేదీ, తీసుకున్న తేదీ కంటే ముందు ఉండకూడదు!' : 'Invalid dates selected');

    let d1 = startDate.getDate(), m1 = startDate.getMonth(), y1 = startDate.getFullYear();
    let d2 = endDate.getDate(), m2 = endDate.getMonth(), y2 = endDate.getFullYear();
    
    let days = d2 - d1;
    let months = m2 - m1;
    let years = y2 - y1;

    if (days < 0) { months -= 1; days += 30; }
    if (months < 0) { years -= 1; months += 12; }

    const totalMonths = (years * 12) + months;
    const interestPerMonth = (P * R) / 100;
    const interestPerDay = interestPerMonth / 30;

    const totalInterest = (interestPerMonth * totalMonths) + (interestPerDay * days);
    
    setResult({
      type: 'village',
      months: totalMonths,
      days: days,
      interest: totalInterest,
      total: P + totalInterest
    });
  };

  const calculateBank = (P: number) => {
    const R = parseFloat(bankRate);
    if (isNaN(R) || R <= 0) return showAlert(language === 'te' ? 'దయచేసి సరైన వడ్డీ రేటు ఇవ్వండి' : 'Please enter a valid rate');
    if (startDate > endDate) return showAlert(language === 'te' ? 'తిరిగి ఇచ్చే తేదీ, తీసుకున్న తేదీ కంటే ముందు ఉండకూడదు!' : 'Invalid dates selected');

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    const totalInterest = (P * R * (diffDays / 365)) / 100;

    setResult({
      type: 'bank',
      days: diffDays,
      interest: totalInterest,
      total: P + totalInterest
    });
  };

  const calculateEMI = (P: number) => {
    const R = parseFloat(emiRate);
    const N = parseInt(emiMonths);
    if (isNaN(R) || R <= 0) return showAlert(language === 'te' ? 'దయచేసి సరైన వడ్డీ రేటు ఇవ్వండి' : 'Please enter a valid rate');
    if (isNaN(N) || N <= 0) return showAlert(language === 'te' ? 'నెలల సంఖ్య సరైనది కాదు' : 'Please enter valid months');

    const r = R / (12 * 100); 
    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const totalAmount = emi * N;
    const totalInterest = totalAmount - P;

    setResult({
      type: 'emi',
      emi: emi,
      interest: totalInterest,
      total: totalAmount,
      months: N
    });
  };

  const handleCalculate = () => {
    const P = parseFloat(principal);
    if (isNaN(P) || P <= 0) {
      return showAlert(language === 'te' ? 'దయచేసి సరైన అసలు మొత్తం ఇవ్వండి' : 'Please enter a valid principal amount');
    }

    if (activeTab === 'village') calculateVillage(P);
    else if (activeTab === 'bank') calculateBank(P);
    else if (activeTab === 'emi') calculateEMI(P);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F7F6" />
      
      <AppHeader
        title={language === 'te' ? 'వడ్డీ లెక్కలు' : 'Interest Calculators'}
        subtitle={language === 'te' ? 'ఊరి వడ్డీ, బ్యాంక్ వడ్డీ & ఈఎంఐ' : 'Village, Bank & EMI Calc'}
        language={language}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.tabBtn, activeTab === 'village' && styles.activeTabBtn]} onPress={() => setActiveTab('village')}>
          <MaterialCommunityIcons name="hand-coin-outline" size={20} color={activeTab === 'village' ? '#fff' : '#4B5563'} />
          <AppText style={[styles.tabText, activeTab === 'village' && styles.activeTabText]}>{language === 'te' ? 'ఊరి వడ్డీ' : 'Village'}</AppText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={[styles.tabBtn, activeTab === 'bank' && styles.activeTabBtn]} onPress={() => setActiveTab('bank')}>
          <MaterialCommunityIcons name="bank-outline" size={20} color={activeTab === 'bank' ? '#fff' : '#4B5563'} />
          <AppText style={[styles.tabText, activeTab === 'bank' && styles.activeTabText]}>{language === 'te' ? 'బ్యాంక్ వడ్డీ' : 'Bank'}</AppText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={[styles.tabBtn, activeTab === 'emi' && styles.activeTabBtn]} onPress={() => setActiveTab('emi')}>
          <Ionicons name="calendar-outline" size={18} color={activeTab === 'emi' ? '#fff' : '#4B5563'} />
          <AppText style={[styles.tabText, activeTab === 'emi' && styles.activeTabText]}>{language === 'te' ? 'ఈఎంఐ' : 'EMI'}</AppText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.inputGroup}>
            <AppText style={styles.label}>{activeTab === 'emi' ? (language === 'te' ? 'లోన్ మొత్తం (రూపాయల్లో)' : 'Loan Amount (₹)') : (language === 'te' ? 'అసలు మొత్తం (రూపాయల్లో)' : 'Principal Amount (₹)')}</AppText>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="currency-inr" size={20} color="#16A34A" style={styles.inputIcon} />
              <TextInput style={styles.input} value={principal} onChangeText={setPrincipal} keyboardType="numeric" placeholder="ఉదా: 100000" placeholderTextColor="#9CA3AF" cursorColor="#16A34A" />
            </View>
          </View>

          {activeTab === 'village' && (
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>{language === 'te' ? 'వడ్డీ రేటు (నూరుకి నెలకు)' : 'Interest Rate (Per 100/Month)'}</AppText>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="brightness-percent" size={20} color="#EA580C" style={styles.inputIcon} />
                <TextInput style={styles.input} value={villageRate} onChangeText={setVillageRate} keyboardType="numeric" placeholder="ఉదా: 2" placeholderTextColor="#9CA3AF" cursorColor="#16A34A" />
                <AppText style={styles.suffixText}>{language === 'te' ? 'రూపాయలు' : 'Rupees'}</AppText>
              </View>
            </View>
          )}

          {activeTab === 'bank' && (
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>{language === 'te' ? 'వడ్డీ రేటు (% సంవత్సరానికి)' : 'Interest Rate (% Per Annum)'}</AppText>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="brightness-percent" size={20} color="#EA580C" style={styles.inputIcon} />
                <TextInput style={styles.input} value={bankRate} onChangeText={setBankRate} keyboardType="numeric" placeholder="ఉదా: 9" placeholderTextColor="#9CA3AF" cursorColor="#16A34A" />
                <AppText style={styles.suffixText}>%</AppText>
              </View>
            </View>
          )}

          {activeTab === 'emi' && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <AppText style={styles.label}>{language === 'te' ? 'వడ్డీ రేటు (% / ఏడాడికి)' : 'Interest Rate (%)'}</AppText>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={emiRate} onChangeText={setEmiRate} keyboardType="numeric" placeholder="11" placeholderTextColor="#9CA3AF" cursorColor="#16A34A" />
                  <AppText style={styles.suffixText}>%</AppText>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <AppText style={styles.label}>{language === 'te' ? 'సమయం (నెలల్లో)' : 'Tenure (Months)'}</AppText>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={emiMonths} onChangeText={setEmiMonths} keyboardType="numeric" placeholder="24" placeholderTextColor="#9CA3AF" cursorColor="#16A34A" />
                  <AppText style={styles.suffixText}>{language === 'te' ? 'నెలలు' : 'Mo'}</AppText>
                </View>
              </View>
            </View>
          )}

          {activeTab !== 'emi' && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <AppText style={styles.label}>{language === 'te' ? 'తీసుకున్న తేదీ' : 'Start Date'}</AppText>
                <TouchableOpacity activeOpacity={0.8} style={styles.datePickerBtn} onPress={() => setShowStartPicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                  <AppText style={styles.dateText}>{formatDate(startDate)}</AppText>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker 
                    value={startDate} 
                    mode="date" 
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
                    themeVariant="light"
                    accentColor="#16A34A"
                    textColor="#1F2937"
                    onChange={(event, date) => { setShowStartPicker(Platform.OS === 'ios'); if (date) setStartDate(date); }} 
                  />
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <AppText style={styles.label}>{language === 'te' ? 'తిరిగి ఇచ్చే తేదీ' : 'End Date'}</AppText>
                <TouchableOpacity activeOpacity={0.8} style={styles.datePickerBtn} onPress={() => setShowEndPicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                  <AppText style={styles.dateText}>{formatDate(endDate)}</AppText>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker 
                    value={endDate} 
                    mode="date" 
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    themeVariant="light"
                    accentColor="#16A34A"
                    textColor="#1F2937" 
                    onChange={(event, date) => { setShowEndPicker(Platform.OS === 'ios'); if (date) setEndDate(date); }} 
                  />
                )}
              </View>
            </View>
          )}

          <TouchableOpacity activeOpacity={0.8} style={styles.calculateBtn} onPress={handleCalculate}>
            <LinearGradient colors={["#16A34A", "#15803D"]} style={styles.btnGradient}>
              <Ionicons name="calculator" size={22} color="#fff" />
              <AppText style={styles.btnText}>{language === 'te' ? 'లెక్కించు' : 'Calculate'}</AppText>
            </LinearGradient>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="receipt-outline" size={24} color="#1E40AF" />
                <AppText style={styles.resultTitle}>{language === 'te' ? 'లెక్క వివరాలు' : 'Calculation Summary'}</AppText>
              </View>
              <View style={styles.divider} />

              {result.type === 'village' && (
                <>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'గడిచిన సమయం:' : 'Time:'}</AppText><AppText style={styles.resultValueTime}>{result.months} {language === 'te' ? 'నెలలు' : 'Months'}, {result.days} {language === 'te' ? 'రోజులు' : 'Days'}</AppText></View>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'అసలు:' : 'Principal:'}</AppText><AppText style={styles.resultValue}>{formatCurrency(parseFloat(principal))}</AppText></View>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'మొత్తం వడ్డీ:' : 'Interest:'}</AppText><AppText style={[styles.resultValue, { color: '#EA580C' }]}>+ {formatCurrency(result.interest)}</AppText></View>
                </>
              )}

              {result.type === 'bank' && (
                <>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'మొత్తం రోజులు:' : 'Total Days:'}</AppText><AppText style={styles.resultValueTime}>{result.days} {language === 'te' ? 'రోజులు' : 'Days'}</AppText></View>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'అసలు:' : 'Principal:'}</AppText><AppText style={styles.resultValue}>{formatCurrency(parseFloat(principal))}</AppText></View>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'మొత్తం వడ్డీ:' : 'Interest:'}</AppText><AppText style={[styles.resultValue, { color: '#EA580C' }]}>+ {formatCurrency(result.interest)}</AppText></View>
                </>
              )}

              {result.type === 'emi' && (
                <>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'నెలవారీ కంతు (EMI):' : 'Monthly EMI:'}</AppText><AppText style={[styles.resultValue, { color: '#16A34A', fontSize: 20 }]}>{formatCurrency(result.emi)}</AppText></View>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'అసలు లోన్:' : 'Loan Amount:'}</AppText><AppText style={styles.resultValue}>{formatCurrency(parseFloat(principal))}</AppText></View>
                  <View style={styles.resultRow}><AppText style={styles.resultLabel}>{language === 'te' ? 'మొత్తం వడ్డీ:' : 'Total Interest:'}</AppText><AppText style={[styles.resultValue, { color: '#EA580C' }]}>+ {formatCurrency(result.interest)}</AppText></View>
                </>
              )}

              <View style={[styles.divider, { borderStyle: 'dashed' }]} />
              <View style={styles.resultRow}>
                <AppText style={styles.totalLabel}>{language === 'te' ? 'చెల్లించాల్సిన మొత్తం:' : 'Total Payable:'}</AppText>
                <AppText style={styles.totalValue}>{formatCurrency(result.total)}</AppText>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 🔥 CUSTOM ALERT MODAL */}
      <Modal visible={alertData.visible} transparent animationType="fade">
        <View style={styles.statusOverlay}>
          <View style={styles.statusContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={50} color="#F59E0B" />
            </View>
            <AppText style={styles.statusTitle}>{language === 'te' ? 'గమనిక!' : 'Attention!'}</AppText>
            <AppText style={styles.statusDescription}>{alertData.message}</AppText>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.statusActionBtn} 
              onPress={() => setAlertData({ ...alertData, visible: false })}
            >
              <AppText style={styles.statusActionText}>{language === 'te' ? 'సరే, అర్థమైంది' : 'OK, Got it'}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F6' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 14, padding: 4, marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  activeTabBtn: { backgroundColor: '#16A34A', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#4B5563', fontFamily: 'Mandali' },
  activeTabText: { color: '#fff' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#4B5563', marginBottom: 8, fontWeight: '600', fontFamily: 'Mandali' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, height: 56, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 18, fontFamily: 'Mandali', color: '#1F2937', fontWeight: '600' },
  suffixText: { fontSize: 14, color: '#6B7280', fontFamily: 'Mandali', fontWeight: '600' },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, height: 56, paddingHorizontal: 15 },
  dateText: { fontSize: 15, color: '#1F2937', fontWeight: '600', marginLeft: 10, fontFamily: 'Mandali' },

  calculateBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#16A34A', shadowOpacity: 0.3, shadowRadius: 8 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 10 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'Mandali' },

  resultCard: { marginTop: 30, backgroundColor: '#EFF6FF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  resultTitle: { fontSize: 18, fontWeight: '600', color: '#1E40AF', fontFamily: 'Mandali' },
  divider: { height: 1, backgroundColor: '#BFDBFE', marginVertical: 12 },
  
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  resultLabel: { fontSize: 15, color: '#4B5563', fontFamily: 'Mandali' },
  resultValueTime: { fontSize: 15, color: '#1E40AF', fontWeight: '600', fontFamily: 'Mandali' },
  resultValue: { fontSize: 16, color: '#1F2937', fontWeight: '600', fontFamily: 'Mandali' },
  
  totalLabel: { fontSize: 18, color: '#1E40AF', fontWeight: '600', fontFamily: 'Mandali' },
  totalValue: { fontSize: 24, color: '#16A34A', fontWeight: '600', fontFamily: 'Mandali' },

  // 🔥 CUSTOM ALERT STYLES
  statusOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  statusContent: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: 30, padding: 25, alignItems: "center", elevation: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFFBEB", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  statusTitle: { fontSize: 22, fontWeight: "600", color: "#1F2937", marginBottom: 10, fontFamily: "Mandali" },
  statusDescription: { fontSize: 16, textAlign: "center", color: "#6B7280", lineHeight: 24, marginBottom: 25, fontFamily: "Mandali" },
  statusActionBtn: { width: "100%", height: 55, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "#F59E0B" },
  statusActionText: { color: "#fff", fontSize: 17, fontWeight: "600", fontFamily: "Mandali" },
});