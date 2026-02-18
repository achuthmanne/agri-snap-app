import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'te' | 'en'>('en');
 const [time, setTime] = useState(new Date());
  const locale = language === 'te' ? 'te-IN' : 'en-IN';

const formattedDate = time.toLocaleDateString(locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const formattedTime = time.toLocaleTimeString(locale, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

  /* ---------- STATES ---------- */
 
  const [farmerName, setFarmerName] = useState('');

const [todaySessions, setTodaySessions] = useState<any[]>([]);

const [todaySummary, setTodaySummary] = useState({
  full: 0,
  morning: 0,
  evening: 0,
  total: 0,
});


useFocusEffect(
  useCallback(() => {
    loadDashboard();
  }, [])
);

  
  /* ---------- LIVE CLOCK ---------- */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---------- INIT ---------- */
  useEffect(() => {
    loadLanguage();
    loadDashboard();
  }, []);

  const loadLanguage = async () => {
    const savedLang = await AsyncStorage.getItem('APP_LANG');
    if (savedLang === 'te' || savedLang === 'en') {
      setLanguage(savedLang);
    }
  };

  /* ---------- LOAD DASHBOARD DATA ---------- */
  const loadDashboard = async () => {
  setLoading(true);

  const userRaw = await AsyncStorage.getItem('CURRENT_USER');
  if (!userRaw) {
    
    return;
  }
  const user = JSON.parse(userRaw);
  setFarmerName(user.name);


  // 🔹 READ SNAPSHOTS ONLY
  const snapRaw = await AsyncStorage.getItem(
    `FARMER_ATT_SNAPSHOT_${user.id}`
  );

  const allSnaps = snapRaw ? JSON.parse(snapRaw) : [];
  const todayStr = new Date().toDateString();

  // 🔥 EXACT FILTER
  const todayCards = allSnaps.filter(
    (s: any) =>
      s.date === todayStr &&
      s.farmerId === user.id
  );

  setTodaySessions(todayCards);
  // 🧮 TODAY SUMMARY CALCULATION
const summary = todayCards.reduce(
  (acc: any, s: any) => {
    acc.full += Number(s.summary?.full || 0);
    acc.morning += Number(s.summary?.morning || 0);
    acc.evening += Number(s.summary?.evening || 0);
    acc.total += Number(s.summary?.total || 0);
    return acc;
  },
  { full: 0, morning: 0, evening: 0, total: 0 }
);


setTodaySummary(summary);

  setLoading(false);
};


  /* ---------- NAV WITH LOADER ---------- */
  const goTo = (path: any) => {
  setLoading(true);

  setTimeout(() => {
    router.push(path);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, 300);
};

// ✅ LANGUAGE BASED LOCALE
const NavCard = ({
  icon,
  title,
  desc,
  onPress,
}: {
  icon: any;
  title: string;
  desc: string;
  onPress: () => void;
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.navCard,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
      onPress={onPress}
    >
      <View style={styles.navRow}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color="#1b5e20" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>{title}</Text>
          <Text style={styles.navDesc}>{desc}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#bbb" />
      </View>
    </Pressable>
  );
};


if (loading) {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#1b5e20" />
      <Text style={{ marginTop: 10, color: '#1b5e20', fontWeight: '600' }}>
        {language === 'te' ? 'లోడ్ అవుతోంది...' : 'Loading...'}
      </Text>
    </View>
  );
}

  /* ---------- UI ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* HEADER */}
      <View style={styles.headerCard}>
        <Text style={styles.title}>
          {language === 'te' ? 'డాష్‌బోర్డ్' : 'Dashboard'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* WELCOME */}
        <Text style={styles.sub}>
          {language === 'te' ? 'స్వాగతం!' : 'Welcome back!'} {farmerName}
        </Text>

        <Text style={styles.sub1}>
  {formattedDate} • {formattedTime}
</Text>


      {todaySessions.length > 0 ? (
  todaySessions.map((item, index) => (
    <View key={index} style={styles.todayCard}>
      <View style={styles.todayHeader}>
        <Ionicons name="calendar-outline" size={18} color="#1b5e20" />
        <Text style={styles.todayTitle}>
          {language === 'te' ? 'ఈరోజు హాజరు' : "Today's Attendance"}
        </Text>
      </View>

      <Text style={styles.savedTime}>
      ⏰ {formattedDate} • {item.time}
      </Text>
     
      <View style={styles.detailRow}>
        
        <Text style={styles.detailLabel}>
          {language === 'te' ? 'మెస్త్రి పేరు' : 'Mestri Name'}:
        </Text>
        <Text style={styles.detailValue}>{item.mestriName}</Text>
      </View>
      <View style={styles.detailRow}>
  <Text style={styles.detailLabel}>
    {language === 'te' ? 'పని' : 'Work'}:
  </Text>
  <Text style={styles.detailValue}>{item.work}</Text>
</View>

      <View style={styles.detailRow}>
         <Text style={styles.detailLabel}>{language === 'te' ? 'పంట' : 'Crop'}:</Text>
        <Text style={styles.detailValue}>{item.crop}</Text>
      </View>

<View style={styles.statsRow}>
  <View style={styles.statCard}>
    <Text style={styles.statValue1}>{item.summary?.full || 0}</Text>
    <Text style={styles.statLabel}>
      {language === 'te' ? 'పూర్తి' : 'Full'}
    </Text>
  </View>

  <View style={styles.statCard}>
    <Text style={styles.statValue2}>{item.summary?.morning || 0}</Text>
    <Text style={styles.statLabel}>
      {language === 'te' ? 'ఉదయం' : 'Morning'}
    </Text>
  </View>

  <View style={styles.statCard}>
    <Text style={styles.statValue2}>{item.summary?.evening || 0}</Text>
    <Text style={styles.statLabel}>
      {language === 'te' ? 'సాయంత్రం' : 'Evening'}
    </Text>
  </View>

  <View style={styles.statCard}>
    <Text style={styles.statValue3}>{item.summary?.total || 0}</Text>
    <Text style={styles.statLabel}>
      {language === 'te' ? 'మొత్తం' : 'Total'}
    </Text>
  </View>
</View>


    </View>
  ))
) : (
  <View style={styles.noAttendanceCard}>
    <Text style={styles.noAttendanceTitle}>
      {language === 'te'
        ? 'ఈరోజు హాజరు ఇంకా వెయ్యలేదు'
        : "Attandance Not Yet Taken Today"}
    </Text>
  </View>
)}
 
  {/* NAVIGATION CARDS */}

<NavCard
  icon="calendar-outline"
  title={language === 'te' ? 'హాజరు' : 'Attendance'}
  desc={
    language === 'te'
      ? 'రోజువారీ హాజరు నమోదు'
      : 'Daily attendance entry'
  }
  onPress={() => goTo('/farmer/attandance')}
/>

<NavCard
  icon="cash-outline"
  title={language === 'te' ? 'చెల్లింపులు' : 'Payments'}
  desc={
    language === 'te'
      ? 'కూలీల చెల్లింపులు & చరిత్ర'
      : 'Labour settlement & history'
  }
  onPress={() => goTo('/farmer/payments')}
/>

<NavCard
  icon="book-outline"
  title={language === 'te' ? 'ఖర్చుల పుస్తకం' : 'Expense Book'}
  desc={
    language === 'te'
      ? 'విత్తనాలు, ఎరువులు, ఇతర ఖర్చులు'
      : 'Seeds, fertilizer & other expenses'
  }
  onPress={() => goTo('/farmer/expenses')}
/>

<NavCard
  icon="trending-up-outline"
  title={language === 'te' ? 'పంట అమ్మకాలు' : 'Crop Sales'}
  desc={
    language === 'te'
      ? 'పంట అమ్మిన వివరాలు'
      : 'Record crop selling details'
  }
  onPress={() => goTo('/farmer/cropsales')}
/>

<NavCard
  icon="stats-chart-outline"
  title={language === 'te' ? 'వార్షిక సారాంశం' : 'Yearly Summary'}
  desc={
    language === 'te'
      ? 'మొత్తం ఖర్చు & ఆదాయం'
      : 'Total income & expense summary'
  }
  onPress={() => goTo('/farmer/summary')}
/>

<NavCard
  icon="leaf-outline"
  title={language === 'te' ? 'పంటల సమాచారం' : 'Crop Knowledge'}
  desc={
    language === 'te'
      ? 'పంటల పూర్తి వివరాలు'
      : 'Complete crop information'
  }
  onPress={() => goTo('/farmer/cropknowledge')}
/>

      </ScrollView>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1b5e20" />
          
        </View>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#1b5e20',
    paddingTop: 50,
    paddingBottom: 14,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },

  content: { padding: 20 },
  sub: { fontSize: 26, fontWeight: '600', color: '#1b5e20' },
  sub1: { color: '#555', marginBottom: 30, fontSize: 16},
statsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 30,
},

  
   statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 3
  },
  
  statValue1: { fontSize: 28, fontWeight: '700', color: '#1b5e20' },
  statValue2: { fontSize: 28, fontWeight: '700', color: '#1b5e20' },
  statValue3: { fontSize: 28, fontWeight: '700', color: '#1b5e20' },
  statLabel: { color: '#555' },
  todayCard: {
  backgroundColor: '#f1f8e9',
  borderRadius: 18,
  padding: 18,
  marginBottom: 30,
  elevation: 4,
},

todayHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
},

todayTitle: {
  marginLeft: 6,
  fontSize: 16,
  fontWeight: '700',
  color: '#1b5e20',
},

savedTime: {
  fontSize: 15,
  color: '#555',
  marginBottom: 12,
},

detailRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},

detailLabel: {
  marginLeft: 6,
  fontSize: 14,
  fontWeight: '600',
  color: '#555',
},

detailValue: {
  marginLeft: 6,
  fontSize: 14,
  fontWeight: '700',
  color: '#1b5e20',
},

summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 14,
},

summaryBox: {
  flex: 1,
  backgroundColor: '#ffffff',
  marginHorizontal: 4,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
  elevation: 1
},

summaryNumber: {
  fontSize: 18,
  fontWeight: '800',
  color: '#2e7d32',
},
summaryNumber1: {
  fontSize: 18,
  fontWeight: '800',
  color: '#e80e0e',
},

summaryLabel: {
  fontSize: 12,
  color: '#555',
  marginTop: 2,
},


  

  value: { color: '#1b5e20', fontWeight: '600', marginBottom: 6 },
  attValue: { color: '#2e7d32', fontWeight: '600' },
  attTotal: { fontWeight: '700', marginTop: 6 },

  noAttendanceCard: {
    backgroundColor: '#fffbcb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    elevation: 3
  },
  noAttendanceTitle: { fontWeight: '700', color: '#ff0000'
   },
  noAttendanceMsg: { color: '#ff0000', marginTop: 6 },
navCard: {
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: 18,
  marginBottom: 18,
  elevation: 6,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 6,
},

navRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

iconBox: {
  backgroundColor: '#e8f5e9',
  padding: 10,
  borderRadius: 12,
  marginRight: 12,
},

navTitle: {
  fontSize: 17,
  fontWeight: '700',
  color: '#1b5e20',
},

navDesc: {
  fontSize: 13,
  color: '#666',
  marginTop: 3,
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1b5e20' },
  cardDesc: { color: '#555' },
mestriBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#e8f5ea',
  padding: 10,
  borderRadius: 12,
  marginBottom: 12,
elevation: 2,
},
mestriText: {
  marginLeft:10,
  fontSize: 18,
  fontWeight: '700',
  color: '#1b5e20',
alignItems: 'center'
},




  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: { marginTop: 10, color: '#1b5e20', fontWeight: '600' },
});
