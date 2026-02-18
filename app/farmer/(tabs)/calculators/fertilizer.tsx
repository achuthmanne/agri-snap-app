import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface FertilizerItem {
  id: string;
  name: string;
  nameTe: string;
  bags: number;
  cost: number;
}

// Motham AP/TS lo unde anni rakala mandhu kattalu (15+ Varieties)
const fertilizerData = [
  { label: 'Urea (యూరియా)', labelTe: 'యూరియా', value: 'Urea' },
  { label: 'DAP (డి.ఎ.పి)', labelTe: 'డి.ఎ.పి', value: 'DAP' },
  { label: 'Potash (MOP - పొటాష్)', labelTe: 'పొటాష్', value: 'Potash' },
  { label: '20-20-0-13 (అమ్మోనియం ఫాస్ఫేట్)', labelTe: '20-20-0-13', value: '20-20-0-13' },
  { label: '28-28-0 (గ్రోమోర్)', labelTe: '28-28-0', value: '28-28-0' },
  { label: '14-35-14 (కాంప్లెక్స్)', labelTe: '14-35-14', value: '14-35-14' },
  { label: '10-26-26 (IFFCO)', labelTe: '10-26-26', value: '10-26-26' },
  { label: '12-32-16 (కాంప్లెక్స్)', labelTe: '12-32-16', value: '12-32-16' },
  { label: '15-15-15 (విజయ)', labelTe: '15-15-15', value: '15-15-15' },
  { label: '17-17-17 (మద్రాస్ ఫెర్టిలైజర్స్)', labelTe: '17-17-17', value: '17-17-17' },
  { label: '19-19-19 (Water Soluble)', labelTe: '19-19-19', value: '19-19-19' },
  { label: 'SSP (సింగిల్ సూపర్ ఫాస్ఫేట్)', labelTe: 'SSP', value: 'SSP' },
  { label: 'Ammonium Sulphate', labelTe: 'అమ్మోనియం సల్ఫేట్', value: 'Ammonium Sulphate' },
  { label: 'Magnesium Sulphate', labelTe: 'మెగ్నీషియం సల్ఫేట్', value: 'Magnesium Sulphate' },
  { label: 'Zinc Sulphate', labelTe: 'జింక్ సల్ఫేట్', value: 'Zinc Sulphate' },
  { label: 'Gypsum (జిప్సం)', labelTe: 'జిప్సం', value: 'Gypsum' },
  { label: 'Other (ఇతరములు)', labelTe: 'ఇతరములు', value: 'Other' },
];

export default function FertilizerCalculator() {
  const [language, setLanguage] = useState<'te' | 'en'>('te');
  const [loading, setLoading] = useState(true);

  const [acres, setAcres] = useState('');
  const [selectedFert, setSelectedFert] = useState<any>(null);
  const [bagsPerAcre, setBagsPerAcre] = useState('');
  const [rate, setRate] = useState('');
  const [itemList, setItemList] = useState<FertilizerItem[]>([]);

  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem('APP_LANG');
      if (lang === 'te' || lang === 'en') setLanguage(lang as 'te' | 'en');
      setLoading(false);
    };
    loadLang();
  }, []);

  const addItem = () => {
    if (!acres || !selectedFert || !bagsPerAcre || !rate) {
      Alert.alert(language === 'te' ? "అన్ని వివరాలు నింపండి" : "Please fill all fields");
      return;
    }
    const totalBags = Math.ceil(Number(acres) * Number(bagsPerAcre));
    const totalCost = totalBags * Number(rate);

    const newItem: FertilizerItem = {
      id: Date.now().toString(),
      name: selectedFert.label,
      nameTe: selectedFert.labelTe,
      bags: totalBags,
      cost: totalCost
    };
    setItemList([...itemList, newItem]);
    setSelectedFert(null);
    setBagsPerAcre('');
    setRate('');
  };

  const shareToWhatsApp = async () => {
    let message = `*--- ${language === 'te' ? 'ఎరువుల లిస్ట్' : 'Fertilizer List'} ---*\n`;
    itemList.forEach((item, index) => {
      const name = language === 'te' ? item.nameTe : item.name;
      message += `${index + 1}. ${name}: ${item.bags} Bags - ₹${item.cost}\n`;
    });
    const total = itemList.reduce((sum, item) => sum + item.cost, 0);
    message += `\n*${language === 'te' ? 'మొత్తం బిల్లు' : 'Total Bill'}: ₹${total.toLocaleString('en-IN')}*`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("WhatsApp not installed"));
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#1b5e20" /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <MaterialCommunityIcons name="dolly" size={24} color="#fff" />
          <Text style={styles.headerTitle}>
            {language === 'te' ? 'ఎరువుల షాపింగ్ లిస్ట్' : 'Fertilizer Shopping List'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.label}>{language === 'te' ? 'ఎకరాలు (Acres)' : 'Acres'}</Text>
            <TextInput keyboardType="numeric" value={acres} onChangeText={setAcres} style={styles.input} placeholder="0" />

            <Text style={styles.label}>{language === 'te' ? 'ఎరువు ఎంచుకోండి' : 'Select Fertilizer'}</Text>
            <Dropdown
              style={styles.dropdown}
              data={fertilizerData}
              labelField="label"
              valueField="value"
              placeholder={language === 'te' ? "ఎంచుకోండి (Select)" : "Select"}
              value={selectedFert?.value}
              onChange={item => setSelectedFert(item)}
              maxHeight={350}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>{language === 'te' ? 'ఎకరాకు బస్తాలు' : 'Bags/Acre'}</Text>
                <TextInput keyboardType="numeric" value={bagsPerAcre} onChangeText={setBagsPerAcre} style={styles.input} placeholder="1" />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>{language === 'te' ? 'బస్తా ధర ₹' : 'Price/Bag ₹'}</Text>
                <TextInput keyboardType="numeric" value={rate} onChangeText={setRate} style={styles.input} placeholder="0" />
              </View>
            </View>

            <Pressable style={styles.addBtn} onPress={addItem}>
              <Text style={styles.addBtnText}>{language === 'te' ? '+ లిస్ట్ లో చేర్చు' : '+ Add to List'}</Text>
            </Pressable>
          </View>

          {itemList.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{language === 'te' ? item.nameTe : item.name}</Text>
                <Text style={styles.itemSub}>{item.bags} {language === 'te' ? 'బస్తాలు (Bags)' : 'Bags'}</Text>
              </View>
              <Text style={styles.itemCost}>₹{item.cost.toLocaleString('en-IN')}</Text>
              <Pressable onPress={() => setItemList(itemList.filter(i => i.id !== item.id))} style={{marginLeft: 10}}>
                <Ionicons name="trash-outline" size={22} color="#ff4444" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {itemList.length > 0 && (
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>{language === 'te' ? 'మొత్తం బిల్లు' : 'Total Bill'}</Text>
              <Text style={styles.totalAmount}>₹{itemList.reduce((s, i) => s + i.cost, 0).toLocaleString('en-IN')}</Text>
            </View>
            <Pressable style={styles.shareBtn} onPress={shareToWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#fff" />
              <Text style={styles.shareText}>{language === 'te' ? 'షేర్' : 'Share'}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f5' },
  header: { backgroundColor: '#1b5e20', padding: 16, marginTop: 40, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 15, elevation: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 10 },
  scrollContent: { padding: 15, paddingBottom: 120 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 20, elevation: 4, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, backgroundColor: '#fafafa' },
  dropdown: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, backgroundColor: '#fafafa' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  addBtn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  itemRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 12, alignItems: 'center', elevation: 2, borderLeftWidth: 5, borderLeftColor: '#1b5e20' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#333' },
  itemSub: { fontSize: 12, color: '#666' },
  itemCost: { fontSize: 16, fontWeight: '800', color: '#1b5e20' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', elevation: 10 },
  totalLabel: { fontSize: 12, color: '#666' },
  totalAmount: { fontSize: 24, fontWeight: '900', color: '#1b5e20' },
  shareBtn: { backgroundColor: '#25D366', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  shareText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
