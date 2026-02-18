import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';

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


export default function FarmerPaymentHistory() {
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [loading, setLoading] = useState(true);

  const [sessions, setSessions] = useState<any[]>([]);
  const [display, setDisplay] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<'ALL' | string>('ALL');
const [farmerName, setFarmerName] = useState('');

  const locale = language === 'te' ? 'te-IN' : 'en-IN';
const [userId, setUserId] = useState('');

  const T = {
    title: language === 'te' ? 'చెల్లింపు చరిత్ర' : 'Payment History',
    search: language === 'te' ? '🔍 పంట / మెస్త్రి వెతకండి' : '🔍 Search crop / mestri',
    noData:
      language === 'te'
        ? 'చెల్లింపు చరిత్ర లేదు'
        : 'No payment history',
    total: language === 'te' ? 'మొత్తం' : 'Total',
    bank: language === 'te' ? 'చెల్లింపు విధానం' : 'Payment Mode',
    cleared: language === 'te' ? 'క్లియర్ చేసిన సమయం' : 'Cleared At',
  };

  /* ---------- INIT ---------- */
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    const lang = await AsyncStorage.getItem('APP_LANG');
    if (lang === 'te' || lang === 'en') setLanguage(lang);

    const userRaw = await AsyncStorage.getItem('CURRENT_USER');
    
    if (!userRaw) return;

   const user = JSON.parse(userRaw);
setFarmerName(user.name || user.username || '');

setUserId(user.id);

const raw = await AsyncStorage.getItem(
  `FARMER_PAYMENT_HISTORY_${user.id}`
);

    const data = raw ? JSON.parse(raw) : [];

    setSessions(data);
    setDisplay(data);
    setLoading(false);
  };

  /* ---------- MONTH LIST ---------- */
  const months = useMemo(() => {
    return Array.from(
      new Set(
        sessions.map(s =>
          new Date(s.clearedAt).toLocaleString('en-IN', {
            month: 'long',
            year: 'numeric',
          })
        )
      )
    );
  }, [sessions]);
const deleteHistoryItem = async (historyId: string) => {
  if (!userId) return;

  Alert.alert(
    language === 'te' ? 'పేమెంట్ తొలగించాలా?' : 'Delete Payment',
    language === 'te'
      ? 'ఈ పేమెంట్ తొలగిస్తే సంబంధిత హాజరు మళ్ళీ పేమెంట్‌కి అందుబాటులో ఉంటుంది.'
      : 'Deleting this payment will unlock related attendance.',
    [
      { text: language === 'te' ? 'రద్దు' : 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తొలగించు' : 'Delete',
        style: 'destructive',
        onPress: async () => {
          const historyKey = `FARMER_PAYMENT_HISTORY_${userId}`;
          const snapKey = `FARMER_ATT_SNAPSHOT_${userId}`;

          const raw = await AsyncStorage.getItem(historyKey);
          const history = raw ? JSON.parse(raw) : [];

          const item = history.find((h: any) => h.id === historyId);

          if (!item) return;

          // 1️⃣ remove history card
          const updatedHistory = history.filter((h: any) => h.id !== historyId);

          await AsyncStorage.setItem(
            historyKey,
            JSON.stringify(updatedHistory)
          );

          // 2️⃣ unlock attendance cards
          const snapRaw = await AsyncStorage.getItem(snapKey);
          const snaps = snapRaw ? JSON.parse(snapRaw) : [];

          const updatedSnaps = snaps.map((s: any) =>
  item.attendanceIds.includes(s.id)
    ? { ...s, isPaid: false }
    : s
);


          await AsyncStorage.setItem(
            snapKey,
            JSON.stringify(updatedSnaps)
          );

          setSessions(updatedHistory);
          setDisplay(updatedHistory);
          setMonth('ALL');

        },
      },
    ]
  );
};
const confirmClearAll = () => {
  Alert.alert(
    language === 'te' ? 'నిర్ధారణ 1' : 'Confirmation 1',
    language === 'te'
      ? 'అన్ని చెల్లింపులు తొలగించాలా?'
      : 'Do you want to delete all payments?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Next', onPress: confirmClearAll2 },
    ]
  );
};
const confirmClearAll2 = () => {
  Alert.alert(
    language === 'te' ? 'నిర్ధారణ 2' : 'Confirmation 2',
    language === 'te'
      ? 'ఈ డేటా తిరిగి రాదు. ఖచ్చితమా?'
      : 'This data cannot be recovered. Sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Next', onPress: confirmClearAll3 },
    ]
  );
};
const confirmClearAll3 = () => {
  Alert.alert(
    language === 'te' ? 'చివరి నిర్ధారణ' : 'Final Confirmation',
    language === 'te'
      ? 'ఈ సంవత్సరం పూర్తయ్యిందని నిర్ధారించుకుంటున్నారా?'
      : 'Are you sure this year is completed?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తొలగించు' : 'Delete',
        style: 'destructive',
        onPress: clearAllPayments,
      },
    ]
  );
};
const clearAllPayments = async () => {
  if (!userId) return;

  setLoading(true);

  const historyKey = `FARMER_PAYMENT_HISTORY_${userId}`;
  const snapKey = `FARMER_ATT_SNAPSHOT_${userId}`;

  // 1️⃣ Clear payment history
  await AsyncStorage.setItem(historyKey, JSON.stringify([]));

  // 2️⃣ Unlock all attendance
  const snapRaw = await AsyncStorage.getItem(snapKey);
  const snaps = snapRaw ? JSON.parse(snapRaw) : [];

  const unlocked = snaps.map((s: any) => ({
    ...s,
    isPaid: false,
  }));

  await AsyncStorage.setItem(snapKey, JSON.stringify(unlocked));

  setSessions([]);
  setDisplay([]);
  setMonth('ALL');

  setLoading(false);
};

const canClearAll = display.length >= 10;
const exportToPDF = async () => {
  if (!display.length) {
    Alert.alert(
      language === 'te' ? 'డేటా లేదు' : 'No Data',
      language === 'te'
        ? 'ఎగుమతి చేయడానికి చెల్లింపు రికార్డులు లేవు'
        : 'No payment records to export'
    );
    return;
  }

  const year = new Date().getFullYear();
  const fileName = `Payment_History_${year}.pdf`;

  const rows = display.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.crop}</td>
      <td>${s.work}</td>
      <td>${s.mestriName}</td>
      <td>${s.fullKulis}</td>
      <td>${s.morningKulis}</td>
      <td>${s.eveningKulis}</td>
      <td>₹${s.grandTotal}</td>
      <td>${s.clearedDateText}</td>
    </tr>
  `).join('');

  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Noto Sans Telugu', sans-serif;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 15px;
          border-radius: 12px;
          background: linear-gradient(90deg,#1b5e20,#2e7d32);
          color: white;
          margin-bottom: 20px;
        }
        .title {
          font-size: 22px;
          font-weight: bold;
        }
        .meta {
          font-size: 12px;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background-color: #1b5e20;
          color: white;
          padding: 8px;
          border: 1px solid #ddd;
        }
        td {
          padding: 6px;
          border: 1px solid #ddd;
          text-align: center;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      </style>
    </head>

    <body>
      <div class="header">
        <div class="title">
          ${language === 'te' ? 'చెల్లింపు నివేదిక' : 'Payment Report'}
        </div>s

<div class="date">
  ${language === 'te' ? 'రైతు పేరు' : 'Farmer Name'} :
  <strong>${farmerName}</strong>
</div>

        <div class="meta">
          ${language === 'te'
            ? `సంవత్సరం: ${year}`
            : `Year: ${year}`}
        </div>
      </div>

      <table>
        <tr>
          <th>#</th>
          <th>${language === 'te' ? 'పంట' : 'Crop'}</th>
          <th>${language === 'te' ? 'పని' : 'Work'}</th>
          <th>${language === 'te' ? 'మెస్త్రి' : 'Mestri'}</th>
          <th>${language === 'te' ? 'పూర్తి' : 'Full'}</th>
          <th>${language === 'te' ? 'ఉదయం' : 'Morning'}</th>
          <th>${language === 'te' ? 'సాయంత్రం' : 'Evening'}</th>
          <th>${language === 'te' ? 'మొత్తం' : 'Total'}</th>
          <th>${language === 'te' ? 'తేదీ' : 'Date'}</th>
        </tr>
        ${rows}
      </table>
    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle:
      language === 'te'
        ? 'PDF పంచుకోండి'
        : 'Share PDF',
  });
};

  /* ---------- SEARCH + FILTER ---------- */
  useEffect(() => {
    let data = [...sessions];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        s =>
          s.crop.toLowerCase().includes(q) ||
          s.mestriName.toLowerCase().includes(q)
      );
    }

    if (month !== 'ALL') {
      data = data.filter(s => {
        const m = new Date(s.clearedAt).toLocaleString('en-IN', {
          month: 'long',
          year: 'numeric',
        });
        return m === month;
      });
    }

    setDisplay(data);
  }, [search, month, sessions]);

  /* ---------- UI ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* HEADER */}
      <View style={styles.header}>
        
        <Text style={styles.headerTitle}>{T.title}</Text>
          <Pressable onPress={exportToPDF}>
    <Ionicons name="download-outline" size={22} color="#1b5e20" />
  </Pressable>

      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder={T.search}
           placeholderTextColor="#333"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1b5e20"
          style={{ marginTop: 30 }}
        />
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!loading && display.length === 0 && (
          <Text style={styles.empty}>{T.noData}</Text>
        )}

        {display.map(item => {
          const from = new Date(item.fromDate).toLocaleDateString(locale);
          const to = new Date(item.toDate).toLocaleDateString(locale);

          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.row}>
                🌾 <Text style={styles.label}>{language === 'te' ? 'క్రాప్:' : 'Crop:'}</Text> {item.crop}
              </Text>
<Text style={styles.row}>
  🛠 <Text style={styles.label}>{language === 'te' ? 'పని' : 'Work'}:</Text> {item.work}
</Text>

              <Text style={styles.row}>
                👷 <Text style={styles.label}>{language === 'te' ? 'మెస్త్రి:' : 'Mestri:'}</Text> {item.mestriName}
              </Text>

              <Text style={styles.meta}>
                📅 {from} – {to}
              </Text>

              <View style={styles.line} />

            <View style={styles.summaryRow}>
  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>{item.fullKulis}</Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'పూర్తి' : 'Full'}
    </Text>
  </View>

  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>{item.morningKulis}</Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'ఉదయం' : 'Morning'}
    </Text>
  </View>

  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>{item.eveningKulis}</Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'సాయంత్రం' : 'Evening'}
    </Text>
  </View>
</View>

<View style={styles.summaryRow}>
  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>₹{item.fullAmount}</Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'పూర్తి మొత్తం' : 'Full Amt'}
    </Text>
  </View>

  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>₹{item.morningAmount}</Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'ఉదయం మొత్తం' : 'Morning Amt'}
    </Text>
  </View>

  <View style={styles.summaryBox}>
    <Text style={styles.summaryNumber}>₹{item.eveningAmount}</Text>
    <Text style={styles.summaryLabel}>
      {language === 'te' ? 'సాయంత్రం మొత్తం' : 'Evening Amt'}
    </Text>
  </View>
</View>



              <View style={styles.totalLine}>
               <View style={styles.grandTotalBox}>
  <Ionicons name="cash-outline" size={18} color="#fff" />
  <Text style={styles.grandTotalText}>
    {T.total}: ₹{item.grandTotal}
  </Text>
</View>

              </View>
             
                
                <View style={styles.metaBox}>
  <Text style={styles.meta}>
    🏦 {T.bank}: {item.bankType}
  </Text>
  <Text style={styles.meta}>
    ⏱ {T.cleared}: {item.clearedDateText}
  </Text>
</View>

  <Pressable
              onPress={() => deleteHistoryItem(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash" size={20} color="#d32f2f" />
            </Pressable>
              </View>
          
          );
        })}
         {canClearAll && (
          <View style={styles.clearBox}>
             <Pressable onPress={confirmClearAll}>
               <Text style={styles.clearText}>
                 {language === 'te'
                   ? 'ఈ సంవత్సరపు డేటా మొత్తం తొలగించండి'
                   : 'Clear all data for this year'}
               </Text>
             </Pressable>
         
             <Text style={styles.clearHint}>
               {language === 'te'
                 ? '⚠ సంవత్సరం పూర్తయిన తర్వాత మాత్రమే ఉపయోగించండి'
                 : '⚠ Use only after year completion'}
             </Text>
           </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
  },
  deleteBtn: {
  position: 'absolute',
  top: 12,
  right: 12,
},

  summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},

summaryBox: {
  flex: 1,
  backgroundColor: '#f4f6f5',
  marginHorizontal: 4,
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
},

summaryNumber: {
  fontSize: 15,
  fontWeight: '800',
  color: '#1b5e20',
},

summaryLabel: {
  fontSize: 10,
  color: '#555',
  marginTop: 2,
  textAlign: 'center',
},

grandTotalBox: {
  marginTop: 14,
  backgroundColor: '#1b5e20',
  borderRadius: 12,
  padding: 12,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6,
},

grandTotalText: {
  color: '#fff',
  fontWeight: '900',
  fontSize: 16,
},

metaBox: {
  marginTop: 10,
  borderTopWidth: 1,
  borderColor: '#eee',
  paddingTop: 8,
},

  row: { marginBottom: 6 },
  label: { fontWeight: '700' },
  meta: { color: '#555', marginBottom: 6 },
  line: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
  },
  totalLine: { marginTop: 8 },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1b5e20',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  clearText: {
  color: '#d32f2f',
  fontWeight: '700',
  fontSize: 14,
},
clearBox: {
  marginTop: 10,
  padding: 16,
  marginBottom: 20,
  borderRadius: 14,
  backgroundColor: '#fff3f3',
  borderWidth: 1,
  borderColor: '#f5c6cb',
  alignItems: 'center',
},


clearHint: {
  marginTop: 6,
  fontSize: 12,
  color: '#777',
  textAlign: 'center',
},
});
