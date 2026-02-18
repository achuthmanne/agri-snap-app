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

export default function PaymentHistoryScreen() {
  /* ---------- STATES ---------- */
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | string>('ALL');
const [displayHistory, setDisplayHistory] = useState<any[]>([]);

  /* ---------- TEXT ---------- */
  const T = {
    title: language === 'te' ? 'చెల్లింపు చరిత్ర' : 'Payment History',
    farmer: language === 'te' ? 'రైతు' : 'Farmer',
    crop: language === 'te' ? 'పంట' : 'Crop',
    total: language === 'te' ? 'మొత్తం చెల్లింపు' : 'Grand Total',
    bank: language === 'te' ? 'చెల్లింపు విధానం' : 'Payment Mode',
    cleared: language === 'te' ? 'క్లియర్ చేసిన సమయం' : 'Cleared At',
    noData:
      language === 'te'
        ? 'చెల్లింపు చరిత్ర లేదు'
        : 'No payment history',
  };

  /* ---------- LOAD LANGUAGE ---------- */
  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem('APP_LANG');
      if (lang === 'te' || lang === 'en') {
        setLanguage(lang);
      }
    };
    loadLang();
  }, []);

  /* ---------- LOAD HISTORY ---------- */
 const loadHistory = async () => {
  setLoading(true);
await new Promise(resolve => setTimeout(resolve, 1500));

  const userRaw = await AsyncStorage.getItem('CURRENT_USER');
  if (!userRaw) {
    setLoading(false);
    return;
  }

  const user = JSON.parse(userRaw);
  setUserId(user.id);

  const raw = await AsyncStorage.getItem(`PAYMENT_HISTORY_${user.id}`);
  let historyItem = raw ? JSON.parse(raw) : [];

  // 🧹 auto clear > 1 year
  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  historyItem = historyItem.filter(
    (item: any) => now - item.createdAt < ONE_YEAR
  );

  await AsyncStorage.setItem(
    `PAYMENT_HISTORY_${user.id}`,
    JSON.stringify(historyItem)
  );

 setHistory(historyItem);
  setDisplayHistory(historyItem);

  setLoading(false);
};
useEffect(() => {
  loadHistory();
}, []);


  /* ---------- MONTH LIST ---------- */
  const months = Array.from(
    new Set(
      history.map(item =>
        new Date(item.createdAt).toLocaleString('en-IN', {
          month: 'long',
          year: 'numeric',
        })
      )
    )
  );

  /* ---------- SEARCH + FILTER (NO KEYBOARD ISSUE) ---------- */
 useEffect(() => {
  setLoading(true);

  const timer = setTimeout(() => {
    let data = [...history]; // 👈 ORIGINAL LIST

    // 🔍 SEARCH = SORT (NOT FILTER)
   if (searchText.trim()) {
  const q = searchText.toLowerCase();

  data.sort((a, b) => {
    const aMatch = a.farmer?.toLowerCase().includes(q);
    const bMatch = b.farmer?.toLowerCase().includes(q);

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });
}

    // 📅 MONTH FILTER (OPTIONAL)
    if (selectedMonth !== 'ALL') {
      data = data.filter(
        item =>
          new Date(item.createdAt).toLocaleString('en-IN', {
            month: 'long',
            year: 'numeric',
          }) === selectedMonth
      );
    }

    setDisplayHistory(data);
    setLoading(false);
  }, 1000);

  return () => clearTimeout(timer);
}, [searchText, selectedMonth, history]);


  /* ---------- DELETE ---------- */
  const deleteHistoryItem = async (id: string) => {
    if (!userId) return;

    Alert.alert(
      language === 'te' ? 'రికార్డు తొలగించు' : 'Delete Payment',
      language === 'te'
        ? 'ఈ రికార్డును తొలగించాలనుకున్నారా? ఇది తిరిగి రావు.'
        : 'Are you sure you want to delete this record?',
      [
        { text: language === 'te' ? 'రద్దు' : 'Cancel', style: 'cancel' },
        {
          text: language === 'te' ? 'తొలగించు' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = history.filter(item => item.id !== id);
            setHistory(updated);
setDisplayHistory(updated);


            await AsyncStorage.setItem(
              `PAYMENT_HISTORY_${userId}`,
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
  };

  /* ---------- UI ---------- */

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
        <Text style={styles.headerTitle}>{T.title}</Text>
      </View>

      {/* SEARCH + FILTER ROW */}
      <View style={styles.stickyBar}>
        <TextInput
          placeholder={language === 'te' ? '🔍︎  రైతు పేరు వెతకండి' : '🔍︎  Search Farmer'}
          value={searchText}
          onChangeText={setSearchText}
           placeholderTextColor="#333"
          style={styles.searchInput}
        />

       <Pressable
  onPress={() => {
    if (months.length === 0) return;

    if (selectedMonth === 'ALL') {
      setSelectedMonth(months[0]);
    } else {
      const index = months.indexOf(selectedMonth);
      const next =
        index === months.length - 1 ? 'ALL' : months[index + 1];
      setSelectedMonth(next);
    }
  }}
>
  <Ionicons name="filter" size={22} color="#1b5e20" />
</Pressable>

      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1b5e20"
          style={{ marginTop: 10 }}
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
       {!loading && displayHistory.length === 0 && (

          <Text style={styles.empty}>{T.noData}</Text>
        )}

        {displayHistory.map(item => (

          <View key={item.id} style={styles.card}>
            <Text style={styles.row}>
               👨‍🌾 <Text style={styles.label}>{T.farmer}:</Text> {item.farmer}
            </Text>
<Text style={styles.row}>
  <Ionicons name="leaf-outline" size={14} color="#1b5e20" />

  <Text style={styles.label}>

    {language === 'te' ? ' పని' : ' Work'}:
  </Text>{' '}
  {item.work}
</Text>

            <Text style={styles.row}>
               🌾 <Text style={styles.label}>{T.crop}:</Text> {item.crop}
            </Text>
{item.fromDate && item.toDate && ( <Text style={styles.meta}> 
  📅 {new Date(item.fromDate).toLocaleDateString('en-IN')}
   {' '}–{' '} {new Date(item.toDate).toLocaleDateString('en-IN')}
    </Text>
   )} 
  <View style={styles.summaryRow}> 
    <Text style={styles.summaryText}>
      <Ionicons name="people" size={16} color="#1b5e20" /> 
       {language === 'te' ? ' మొత్తం వచ్చిన కూలీలు' : ' Total Workers'} : {item.fullKulis + item.morningKulis + item.eveningKulis}
        </Text>
         </View>

{/* WORKER COUNTS */}
<View style={styles.sectionBox}>
  <Text style={styles.sectionTitle}>
    {language === 'te' ? 'కూలీల వివరాలు' : 'Worker Summary'}
  </Text>

  <View style={styles.gridRow}>
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>
        {language === 'te' ? 'పూర్తి' : 'Full'}
      </Text>
      <Text style={styles.gridValue}>{item.fullKulis}</Text>
    </View>

    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>
        {language === 'te' ? 'ఉదయం' : 'Morning'}
      </Text>
      <Text style={styles.gridValue}>{item.morningKulis}</Text>
    </View>

    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>
        {language === 'te' ? 'సాయంత్రం' : 'Evening'}
      </Text>
      <Text style={styles.gridValue}>{item.eveningKulis}</Text>
    </View>
  </View>
</View>

{/* AMOUNT SECTION */}
<View style={styles.sectionBox}>
  <Text style={styles.sectionTitle}>
    {language === 'te' ? 'మొత్తం లెక్కలు' : 'Amount Summary'}
  </Text>

  <View style={styles.gridRow}>
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>
        {language === 'te' ? 'పూర్తి మొత్తం' : 'Full'}
      </Text>
      <Text style={styles.gridAmount}>₹{item.fullAmount}</Text>
    </View>

    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>
        {language === 'te' ? 'ఉదయం మొత్తం' : 'Morning'}
      </Text>
      <Text style={styles.gridAmount}>₹{item.morningAmount}</Text>
    </View>

    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>
        {language === 'te' ? 'సాయంత్రం మొత్తం' : 'Evening'}
      </Text>
      <Text style={styles.gridAmount}>₹{item.eveningAmount}</Text>
    </View>
  </View>
</View>


            <View style={styles.totalLine}>
              <Text style={styles.totalText}>
                {T.total} : ₹{item.grandTotal}
              </Text>
            </View>
 <View style={styles.totalLine}></View>
            <Text style={styles.meta}>
              🏦 {T.bank}: {item.bankType}
            </Text>
            <Text style={styles.meta}>
              ⏱ {T.cleared}: {item.clearedDateText}
            </Text>

            <Pressable
              onPress={() => deleteHistoryItem(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash" size={20} color="#d32f2f" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f6f5' },

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

  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  searchInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
  },

  content: { padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },

  row: { marginBottom: 4 },
  label: { fontWeight: '700' },
metaBox: {
  marginTop: 8,
  padding: 8,
  backgroundColor: '#f8f8f8',
  borderRadius: 8,
},

metaRow: {
  fontSize: 12,
  color: '#555',
  marginBottom: 4,
},

sectionBox: {
  marginTop: 12,
  backgroundColor: '#f4f9f4',
  padding: 12,
  borderRadius: 12,
},

sectionTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: '#1b5e20',
  marginBottom: 8,
},

gridRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

gridItem: {
  alignItems: 'center',
  flex: 1,
},

gridLabel: {
  fontSize: 12,
  color: '#555',
},

gridValue: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1b5e20',
  marginTop: 2,
},

gridAmount: {
  fontSize: 15,
  fontWeight: '800',
  color: '#2e7d32',
  marginTop: 2,
},

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  summaryText: { fontWeight: '700' },
  summaryAmount: { fontWeight: '800' },

  totalLine: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 6,
  },
loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1b5e20',
    textAlign: 'center',
  },

  meta: { marginTop: 6, fontSize: 12, color: '#555' },

  deleteBtn: {
    position: 'absolute',
    right: 15,
    bottom: 20,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});
