import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function FarmerPayment() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fullRate, setFullRate] = useState('');
const [morningRate, setMorningRate] = useState('');
const [eveningRate, setEveningRate] = useState('');

  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [navLoading, setNavLoading] = useState(false);

const locale = language === 'te' ? 'te-IN' : 'en-IN';

 const loadLanguage = async () => {
    const savedLang = await AsyncStorage.getItem('APP_LANG');
    if (savedLang === 'te' || savedLang === 'en') {
      setLanguage(savedLang);
    }
  };
  useEffect(() => {
  AsyncStorage.getItem('APP_LANG').then(l => {
    if (l === 'te' || l === 'en') setLanguage(l);
  });
}, []);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    loadLanguage();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    setUserId(user.id);

    const raw = await AsyncStorage.getItem(
      `FARMER_ATT_SNAPSHOT_${user.id}`
    );
    const data = raw ? JSON.parse(raw) : [];

    const sorted = [...data].sort((a, b) => {
  if (a.isPaid && !b.isPaid) return 1;   // paid → last
  if (!a.isPaid && b.isPaid) return -1;  // unpaid → first
  return 0;
});

setSessions(sorted);

    setLoading(false);
  };

  /* ---------------- SELECT CARD ---------------- */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const selectedCards = sessions.filter(s =>
    selectedIds.includes(s.id)
  );

  /* ---------------- CALCULATIONS ---------------- */
  const totals = selectedCards.reduce(
  (acc, s) => {
    acc.full += Number(s.summary?.full || 0);
    acc.morning += Number(s.summary?.morning || 0);
    acc.evening += Number(s.summary?.evening || 0);
    return acc;
  },
  { full: 0, morning: 0, evening: 0 }
);
const fullRateValue = Number(fullRate || 0);
const morningRateValue = Number(morningRate || 0);
const eveningRateValue = Number(eveningRate || 0);
const fullAmount = totals.full * fullRateValue;
const morningAmount = totals.morning * morningRateValue;
const eveningAmount = totals.evening * eveningRateValue;

const totalAmount = fullAmount + morningAmount + eveningAmount;


  /* ---------------- SAVE PAYMENT ---------------- */
  const savePayment = async () => {
 if (selectedCards.length === 0) {
  Alert.alert(
    'Error',
    language === 'te'
      ? 'కార్డ్లు సెలెక్ట్ చేయండి'
      : 'Select attendance cards'
  );
  return;
}

if (
  (totals.full > 0 && !fullRateValue) ||
  (totals.morning > 0 && !morningRateValue) ||
  (totals.evening > 0 && !eveningRateValue)
) {
  Alert.alert(
    'Error',
    language === 'te'
      ? 'వచ్చిన హాజరుకు తగిన రేటు ఇవ్వండి'
      : 'Enter rate for present types'
  );
  return;
}

const grouped: Record<string, any[]> = {};

selectedCards.forEach(card => {
  const key = `${card.crop}__${card.work}`; // 🔑 crop + work

  if (!grouped[key]) {
    grouped[key] = [];
  }
  grouped[key].push(card);
});


  const historyKey = `FARMER_PAYMENT_HISTORY_${userId}`;
  const oldRaw = await AsyncStorage.getItem(historyKey);
  const oldHistory = oldRaw ? JSON.parse(oldRaw) : [];
const newHistory = Object.keys(grouped).map(key => {
  const cards = grouped[key];
  const { crop, work } = cards[0];
    // 🔹 most common mestri name
    const nameCount: Record<string, number> = {};
    cards.forEach(c => {
      nameCount[c.mestriName] = (nameCount[c.mestriName] || 0) + 1;
    });
    const mestriName = Object.keys(nameCount).sort(
      (a, b) => nameCount[b] - nameCount[a]
    )[0];

    const fullKulis = cards.reduce(
  (s, c) => s + Number(c.summary?.full || 0),
  0
);

const morningKulis = cards.reduce(
  (s, c) => s + Number(c.summary?.morning || 0),
  0
);

const eveningKulis = cards.reduce(
  (s, c) => s + Number(c.summary?.evening || 0),
  0
);

const fullAmount = fullKulis * fullRateValue;
const morningAmount = morningKulis * morningRateValue;
const eveningAmount = eveningKulis * eveningRateValue;

const grandTotal = fullAmount + morningAmount + eveningAmount;


   const timestamps = cards.map(c => new Date(c.date).getTime());

const fromDate = new Date(Math.min(...timestamps)).toISOString();
const toDate   = new Date(Math.max(...timestamps)).toISOString();
const clearedAt = new Date();

return {
  id: Date.now().toString() + crop,
  crop,
  mestriName,
  work,
  fromDate,
  toDate,

  fullKulis,
  morningKulis,
  eveningKulis,

  fullRate: fullRateValue,
  morningRate: morningRateValue,
  eveningRate: eveningRateValue,

  fullAmount,
  morningAmount,
  eveningAmount,

  grandTotal,

  bankType: 'Cash',
  attendanceIds: cards.map(c => c.id),

  clearedAt: clearedAt.toISOString(),
clearedDateText: clearedAt.toLocaleString(language === 'te' ? 'te-IN' : 'en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}),
};

  });

  await AsyncStorage.setItem(
    historyKey,
    JSON.stringify([...newHistory, ...oldHistory])
  );
// 🔒 FREEZE SELECTED ATTENDANCE CARDS
const snapKey = `FARMER_ATT_SNAPSHOT_${userId}`;
const snapRaw = await AsyncStorage.getItem(snapKey);
const snaps = snapRaw ? JSON.parse(snapRaw) : [];

const now = new Date().toISOString();

const updatedSnaps = snaps.map((s: any) =>
  selectedIds.includes(s.id)
    ? { ...s, isPaid: true, clearedAt: now }
    : s
);



await AsyncStorage.setItem(
  snapKey,
  JSON.stringify(updatedSnaps)
);

  Alert.alert(
    language === 'te' ? 'సఫలం' : 'Success',
    language === 'te'
      ? 'పేమెంట్ హిస్టరీ సేవ్ అయ్యింది'
      : 'Payment saved successfully'
  );

  setNavLoading(true);

setTimeout(() => {
  router.replace('/farmer/history');
}, 2000);

};

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
       <Pressable
  onPress={() => {
    setLoading(true);
    setTimeout(() => {
      router.back();
    }, 300);
  }}
>
  <Ionicons name="arrow-back" size={22} color="#1b5e20" />
</Pressable>
        <Text style={styles.headerTitle}>{language === 'te' ? 'పేమెంట్' : 'Payment'}</Text>
       <Ionicons
  name="time-outline"
  size={22}
  color="#1b5e20"
  onPress={() =>{
 setNavLoading(true);
  router.push('/farmer/history')}}
/>


      </View>

     
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          
{/* RATES CARD */}
<View style={styles.rateCard}>
  <Text style={styles.rateTitle}>
    {language === 'te' ? 'రేట్లు నమోదు చేయండి' : 'Enter Rates'}
  </Text>

  <View style={styles.rateRow}>
    <View style={styles.rateItem}>
      <Text style={styles.rateLabel}>
        {language === 'te' ? 'పూర్తి రోజు' : 'Full Day'}
      </Text>
      <TextInput
        value={fullRate}
        onChangeText={setFullRate}
        keyboardType="number-pad"
        placeholder="₹"
        style={styles.rateInput}
      />
    </View>

    <View style={styles.rateItem}>
      <Text style={styles.rateLabel}>
        {language === 'te' ? 'ఉదయం' : 'Morning Only'}
      </Text>
      <TextInput
        value={morningRate}
        onChangeText={setMorningRate}
        keyboardType="number-pad"
        placeholder="₹"
        style={styles.rateInput}
      />
    </View>

    <View style={styles.rateItem}>
      <Text style={styles.rateLabel}>
        {language === 'te' ? 'సాయంత్రం' : 'Evening Only'}
      </Text>
      <TextInput
        value={eveningRate}
        onChangeText={setEveningRate}
        keyboardType="number-pad"
        placeholder="₹"
        style={styles.rateInput}
      />
    </View>
  </View>
</View>

        {/* ATTENDANCE CARDS */}
        {sessions.map(item => {
          const selected = selectedIds.includes(item.id);
          const locale = language === 'te' ? 'te-IN' : 'en-IN';
const disabled = item.isPaid;

const dateText = new Date(item.date).toLocaleDateString(locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});



          return (
  <Pressable
    key={item.id}          // ✅ ADD THIS LINE
    disabled={disabled}
    onPress={() => toggleSelect(item.id)}
    style={[
      styles.card,
      selected && styles.cardSelected,
      disabled && styles.cardDisabled,
    ]}
  >


             <View style={styles.dateRow}>
  <Text style={styles.date}>
    {dateText} • {item.time}
  </Text>

  <View
    style={[
      styles.statusBadge,
      item.isPaid ? styles.paidBadge : styles.pendingBadge,
    ]}
  >
    <Text style={styles.statusText}>
      {item.isPaid
        ? language === 'te' ? 'చెల్లించారు' : 'PAID'
        : language === 'te' ? 'పెండింగ్' : 'PENDING'}
    </Text>
  </View>
</View>


              <Text style={styles.row}>
                👷 {item.mestriName}
              </Text>
              <Text style={styles.row}>
                🌾 {item.crop}
              </Text>
              <Text style={styles.row}>
  🛠 {language === 'te' ? 'పని:' : 'Work:'} {item.work}
</Text>
 <View style={styles.line}>
  <View style={styles.summaryRow}>
  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>
      {item.summary.full || 0}
    </Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'పూర్తి' : 'Full'}
    </Text>
  </View>

  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>
      {item.summary.morning || 0}
    </Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'ఉదయం' : 'Morning'}
    </Text>
  </View>

  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>
      {item.summary.evening || 0}
    </Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'సాయంత్రం' : 'Evening'}
    </Text>
  </View>

  <View style={[styles.summaryBox, { backgroundColor: '#f2f2f2' }]}>
    <Text style={[styles.summaryNumber, { color: '#1b5e20' }]}>
      {(item.summary.full || 0) +
       (item.summary.morning || 0) +
       (item.summary.evening || 0)}
    </Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'మొత్తం' : 'Total'}
    </Text>
  </View>
</View>

             </View>
            </Pressable>
          );
        })}
  </ScrollView>
        {/* TOTAL SUMMARY */}
         <View style={{ padding: 16 }}>
        {selectedCards.length > 0 && (

          <View style={styles.totalBox}>
            <Text>{language === 'te' ? 'పూర్తి వచ్చిన వారి సంఖ్య: ' : 'Full days: '} {totals.full}</Text>
     <Text>
  {language === 'te' ? 'ఉదయం సంఖ్య: ' : 'Morning Count: '}
  {totals.morning}
</Text>

<Text>
  {language === 'te' ? 'సాయంత్రం సంఖ్య: ' : 'Evening Count: '}
  {totals.evening}
</Text>

<Text>
  {language === 'te' ? 'ఉదయం మొత్తం: ₹ ' : 'Morning Amount: ₹ '}
  {morningAmount}
</Text>

<Text>
  {language === 'te' ? 'సాయంత్రం మొత్తం: ₹ ' : 'Evening Amount: ₹ '}
  {eveningAmount}
</Text>


            <Text>{language === 'te' ? 'పూర్తిగా వచ్చిన వారి మొత్తం: ₹ ' : 'Full Amount: ₹ '} {fullAmount}</Text>
            
<View style={styles.line}>
            <Text style={styles.grandTotal}>
              {language === 'te' ? 'మొత్తం చెల్లించాల్సిన: ₹' : 'Total Payable: ₹'} {totalAmount}
            </Text>
          </View>
          </View>
         
        )}

        {/* SAVE */}
        <Pressable style={styles.payBtn} onPress={savePayment}>
          <Text style={styles.payText}>{language === 'te' ? 'పేమెంట్ నమోదు చేయండి' : 'Save Payment'}</Text>
        </Pressable>
      </View>
      </View>
   
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f6f5' },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
line: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 6,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1b5e20',
  },

  rateBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  label: { fontWeight: '700', marginBottom: 6 },

 rateCard: {
  backgroundColor: '#ffffff',
  padding: 16,
  borderRadius: 16,
  elevation: 4,
  marginVertical: 12,
},

rateTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1b5e20',
  marginBottom: 12,
},
dateRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
},

statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
},

paidBadge: {
  backgroundColor: '#2e7d32',
},

pendingBadge: {
  backgroundColor: '#f57c00',
},

statusText: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '800',
},

rateRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

rateItem: {
  flex: 1,
  marginHorizontal: 4,
},

rateLabel: {
  fontSize: 12,
  color: '#555',
  marginBottom: 4,
},

rateInput: {
  borderWidth: 1,
  borderColor: '#1b5e20',
  borderRadius: 10,
  padding: 10,
  textAlign: 'center',
  fontWeight: '700',
  backgroundColor: '#f9f9f9',
},

summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},

summaryBox: {
  flex: 1,
  backgroundColor: '#f2f2f2',
  marginHorizontal: 4,
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: 'center',
},

summaryNumber: {
  fontSize: 16,
  fontWeight: '800',
  color: '#333',
},

summaryLabel: {
  fontSize: 11,
  color: '#666',
  marginTop: 2,
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 3
  },
cardDisabled: {
  opacity: 0.85,                 // 👈 slight dim only
  backgroundColor: '#f9f9f9',    // 👈 very light grey
  borderWidth: 1,
  borderColor: '#dcdcdc',
  borderLeftWidth: 6,
  borderLeftColor: '#2e7d32',  // green
 
},



  cardSelected: {
    borderWidth: 2,
    borderColor: '#1b5e20',
    backgroundColor: '#e8f5e9',
  },

  date: { fontWeight: '700', marginBottom: 4 },

  row: { marginBottom: 2 },

  summary: {
    flexDirection: 'row',

    marginTop: 6,
    gap: 25,
  },

  totalBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
  },

  grandTotal: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#1b5e20',
  },

  payBtn: {
    backgroundColor: '#1b5e20',
    padding: 18,
    borderRadius: 14,
    marginTop: 20,
    alignItems: 'center',
  },

  payText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
