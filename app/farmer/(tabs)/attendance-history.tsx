import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AttendanceHistoryScreen() {
  /* ---------------- STATES ---------------- */
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'te' | 'en'>('en');
  const [userId, setUserId] = useState<string | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [displaySessions, setDisplaySessions] = useState<any[]>([]);
const [farmerName, setFarmerName] = useState('');

  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | string>('ALL');

  /* ---------------- TEXT ---------------- */
  const T = {
    title: language === 'te' ? 'హాజరు చరిత్ర' : 'Attendance History',
    mestri: language === 'te' ? 'మేస్త్రీ' : 'Mestri',
    crop: language === 'te' ? 'పంట' : 'Crop',
    present: language === 'te' ? 'హాజరు' : 'Present',
    absent: language === 'te' ? 'గైర్హాజరు' : 'Absent',
    amount: language === 'te' ? 'మొత్తం కూలి' : 'Total Wage',
    full: language === 'te' ? 'పూర్తి హాజరు' : 'Full Present',
    morning: language === 'te' ? 'ఉదయం' : 'Morning Only',
evening: language === 'te' ? 'సాయంత్రం' : 'Evening Only',

    total: language === 'te' ? 'మొత్తం హాజరు' : 'Total Present',
    noData:
      language === 'te'
        ? 'హాజరు చరిత్ర లేదు'
        : 'No attendance history',
    search:
      language === 'te' ? '🔍︎ రైతు పేరు వెతకండి' : '🔍︎ Search farmer',
  };

  /* ---------------- LOAD LANGUAGE ---------------- */
  useEffect(() => {
    AsyncStorage.getItem('APP_LANG').then(lang => {
      if (lang === 'te' || lang === 'en') setLanguage(lang);
    });
  }, []);

  /* ---------------- LOAD ATTENDANCE ---------------- */
 const loadAttendance = async () => {
  setLoading(true);

  const userRaw = await AsyncStorage.getItem('CURRENT_USER');
  if (!userRaw) {
    setLoading(false);
    return;
  }

  const user = JSON.parse(userRaw);
  setFarmerName(user.name || user.username || '');

  setUserId(user.id);

  const raw = await AsyncStorage.getItem(
    `FARMER_ATT_SNAPSHOT_${user.id}`
  );

  const data = raw ? JSON.parse(raw) : [];

  setSessions(data);
  setDisplaySessions(data);

  setTimeout(() => setLoading(false), 9000);
};


  useEffect(() => {
    setLoading(true);        // 👈 RESET LOADING ON FOCUS
    loadAttendance();
  }, [])


  /* ---------------- MONTH LIST ---------------- */
  const months = useMemo(() => {
  return Array.from(
    new Set(
      sessions.map(s =>
        new Date(s.date).toLocaleString('en-IN', {
          month: 'long',
          year: 'numeric',
        })
      )
    )
  );
}, [sessions]);

  /* ---------------- SEARCH + FILTER (SORT LOGIC) ---------------- */
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      let data = [...sessions];

      /* 🔍 SEARCH = MOVE MATCHES TO TOP */
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

      /* 📅 MONTH FILTER */
      if (selectedMonth !== 'ALL') {
        data = data.filter(
          s =>
            new Date(s.dateISO).toLocaleString('en-IN', {
              month: 'long',
              year: 'numeric',
            }) === selectedMonth
        );
      }

      setDisplaySessions(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, selectedMonth, sessions]);

  /* ---------------- DELETE ---------------- */
  const deleteSession = (id: string) => {
  if (!userId) return;

  Alert.alert(
    language === 'te' ? 'హాజరు తొలగించాలా' : 'Delete Attendance',
    language === 'te'
      ? 'ఈ హాజరు రికార్డును తొలగించాలా?'
      : 'Are you sure?',
    [
      { text: language === 'te' ? 'రద్దు చేయండి' : 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తొలగించండి' : 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = sessions.filter(s => s.id !== id);
          setSessions(updated);
          setDisplaySessions(updated);

          await AsyncStorage.setItem(
            `FARMER_ATT_SNAPSHOT_${userId}`,
            JSON.stringify(updated)
          );
        },
      },
    ]
  );
};
const confirmClearAll = () => {
  Alert.alert(
    language === 'te' ? 'నిర్ధారణ 1' : 'Confirmation 1',
    language === 'te'
      ? 'అన్ని హాజరు రికార్డులు తొలగించాలా?'
      : 'Do you want to delete all attendance records?',
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
      ? 'ఇది తిరిగి పొందలేరు. ఖచ్చితమా?'
      : 'This action cannot be undone. Sure?',
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
      ? 'కొన్ని నెలలుగా డబ్బు ఇవ్వకపోయినా మీరు క్లియర్ చేయాలనుకుంటున్నారా?'
      : 'Even if payments are pending, do you want to clear?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: language === 'te' ? 'తొలగించండి' : 'Delete',
        style: 'destructive',
        onPress: clearAllAttendance,
      },
    ]
  );
};
const clearAllAttendance = async () => {
  if (!userId) return;

  setLoading(true);

  await AsyncStorage.setItem(
    `FARMER_ATT_SNAPSHOT_${userId}`,
    JSON.stringify([])
  );

  setSessions([]);
  setDisplaySessions([]);

  setLoading(false);
};

const canClearAll = sessions.length >= 10;
const exportToPDF = async () => {
  if (!sessions.length) {
    Alert.alert(
      language === 'te' ? 'డేటా లేదు' : 'No Data',
      language === 'te'
        ? 'ఎగుమతి చేయడానికి హాజరు రికార్డులు లేవు'
        : 'No attendance records to export'
    );
    return;
  }

  const year = new Date().getFullYear();
  const fileName = `Attendance_Report_${year}.pdf`;

  const rows = sessions.map((s, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${new Date(s.dateISO).toLocaleDateString(
        language === 'te' ? 'te-IN' : 'en-IN'
      )}</td>
      <td>${s.mestriName}</td>
      <td>${s.crop}</td>
      <td>${s.work}</td>
      <td>${s.summary.full}</td>
      <td>${s.summary.morning}</td>
      <td>${s.summary.evening}</td>
      <td>${s.summary.total}</td>
    </tr>
  `).join('');

  const html = `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          font-family: 'Noto Sans Telugu', sans-serif;
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #1b5e20;
        }
        .sub {
          text-align: center;
          margin-bottom: 20px;
          color: #555;
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

      <!-- Telugu Font -->
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu&display=swap" rel="stylesheet">
    </head>

    <body>
      <h1>
        ${language === 'te' ? 'హాజరు నివేదిక' : 'Attendance Report'}
      </h1>

<div class="date">
  ${language === 'te' ? 'రైతు పేరు' : 'Farmer Name'} :
  <strong>${farmerName}</strong>
</div>

      <div class="sub">
        ${language === 'te'
          ? `సంవత్సరం: ${year}`
          : `Year: ${year}`}
      </div>

      <table>
        <tr>
          <th>#</th>
          <th>${language === 'te' ? 'తేదీ' : 'Date'}</th>
          <th>${language === 'te' ? 'మెస్త్రీ' : 'Mestri'}</th>
          <th>${language === 'te' ? 'పంట' : 'Crop'}</th>
          <th>${language === 'te' ? 'పని' : 'Work'}</th>
          <th>${language === 'te' ? 'పూర్తి' : 'Full'}</th>
          <th>${language === 'te' ? 'ఉదయం' : 'Morning'}</th>
          <th>${language === 'te' ? 'సాయంత్రం' : 'Evening'}</th>
          <th>${language === 'te' ? 'మొత్తం' : 'Total'}</th>
        </tr>
        ${rows}
      </table>
    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle:
      language === 'te'
        ? 'PDF పంచుకోండి'
        : 'Share PDF',
    UTI: 'com.adobe.pdf',
  });
};


  /* ---------------- CARD ANIMATION ---------------- */
  const AnimatedCard = ({ item, index }: any) => {
    const slide = useRef(new Animated.Value(20)).current;
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 80),
        Animated.parallel([
          Animated.timing(slide, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

   const dateText = new Date(item.date).toLocaleDateString(
  language === 'te' ? 'te-IN' : 'en-IN',
  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
);

return (
  <Animated.View style={styles.card}>
    <View style={{ flexDirection: 'row' }}>
      <Text style={styles.date}>
        <Ionicons name="calendar-outline" /> {dateText} • {item.time}
      </Text>

      <Pressable
        onPress={() => deleteSession(item.id)}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash" size={20} color="#d32f2f" />
      </Pressable>
    </View>

    <Text style={styles.row}>
    👷  <Text style={styles.label}>{T.mestri}:</Text> {item.mestriName}
    </Text>

    <Text style={styles.row}>
      🌾<Text style={styles.label}>{T.crop}:</Text> {item.crop}
    </Text>
<Text style={styles.row}>
  🛠 <Text style={styles.label}>
    {language === 'te' ? 'పని:' : 'Work:'}
  </Text> {item.work}
</Text>

   <View style={styles.line}>

  <View style={styles.summaryRow}>
    <Text style={styles.green}>
      {T.full}: {item.summary.full}
    </Text>
    <Text style={styles.yellow}>
      {T.morning}: {item.summary.morning}
    </Text>
  </View>

  <View style={styles.summaryRow}>
    <Text style={styles.red}>
      {T.evening}: {item.summary.evening}
    </Text>
    <Text style={styles.bold}>
      {T.total}: {item.summary.total}
    </Text>
  </View>

</View>

  </Animated.View>
);
  };
  /* ---------------- UI ---------------- */
 
  return (
    
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
  onPress={() => {
    setLoading(true);
    setTimeout(() => {
      router.back();
    }, 1000);
  }}
>
</Pressable>
        <Text style={styles.headerTitle}>{T.title}</Text>
      
  <Pressable onPress={exportToPDF}>
    <Ionicons name="download-outline" size={22} color="#1b5e20" />
  </Pressable>
</View>

     

      {/* SEARCH + FILTER */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder={T.search}
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1b5e20"
          style={{ marginTop: 20 }}
        />
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!loading && displaySessions.length === 0 && (
          <Text style={styles.empty}>{T.noData}</Text>
        )}

       {displaySessions.map((item, i) => (
  <AnimatedCard
    key={item.id}     // ✅ ONLY THIS CHANGE
    item={item}
    index={i}
  />
))}
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

/* ---------------- STYLES ---------------- */
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

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
 clearText: {
  color: '#d32f2f',
  fontWeight: '700',
  fontSize: 14,
},
clearBox: {
  marginTop: 10,
  padding: 16,
  marginBottom: 60,
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
 line: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 6,
  },
  date: { fontWeight: '700', color: '#1b5e20', marginBottom: 6 },
  row: { marginBottom: 4 },
  label: { fontWeight: '700' },

  summary: {
  marginTop: 8,
  gap: 6,
},

summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},


  green: { color: '#2e7d32', fontWeight: '700' },
  yellow: { color: '#ff780a', fontWeight: '800' },
  red: { color: '#d32f2f', fontWeight: '700' },
  bold: { fontWeight: '800' },

  amount: {
    marginTop: 8,
    fontWeight: '900',
    color: '#1b5e20',
  },

  deleteBtn: {
    position: 'absolute',
    right: 1,
    bottom: 10,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  loader: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f4f6f5',
},

});
