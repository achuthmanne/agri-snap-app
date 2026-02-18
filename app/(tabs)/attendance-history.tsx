import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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

  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | string>('ALL');

  /* ---------------- TEXT ---------------- */
  const T = {
    title: language === 'te' ? 'హాజరు చరిత్ర' : 'Attendance History',
    farmer: language === 'te' ? 'రైతు' : 'Farmer',
    crop: language === 'te' ? 'పంట' : 'Crop',
    present: language === 'te' ? 'హాజరు' : 'Present',
    absent: language === 'te' ? 'గైర్హాజరు' : 'Absent',
    total: language === 'te' ? 'మొత్తం' : 'Total',
    amount: language === 'te' ? 'మొత్తం కూలి' : 'Total Wage',
    noData:
      language === 'te'
        ? 'హాజరు చరిత్ర లేదు'
        : 'No attendance history',
    search:
      language === 'te' ? '🔍︎ రైతు పేరు వెతకండి' : '🔍︎ Search farmer',
      work: language === 'te' ? 'పని' : 'Work',
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
    setUserId(user.id);

    const raw = await AsyncStorage.getItem(`ATTENDANCE_${user.id}`);
    let data = raw ? JSON.parse(raw) : [];

  
/* 🧹 AUTO DELETE DATA OLDER THAN 6 MONTHS */
const now = new Date();

const threeMonthsAgo = new Date(
  now.getFullYear(),
  now.getMonth() - 6, 
  1
);

data = data.filter((s: any) => {
  if (!s.dateISO) return false;

  const d = new Date(s.dateISO);
  return d >= threeMonthsAgo;
});


    await AsyncStorage.setItem(
      `ATTENDANCE_${user.id}`,
      JSON.stringify(data)
    );

    setSessions(data);
    setDisplaySessions(data);

    setTimeout(() => setLoading(false), 900);
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  /* ---------------- MONTH LIST ---------------- */
  const months = useMemo(() => {
    return Array.from(
      new Set(
        sessions.map(s =>
          new Date(s.dateISO).toLocaleString('en-IN', {
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
          const aMatch =
  a.farmer?.toLowerCase().includes(q) ||
  a.crop?.toLowerCase().includes(q) ||
  a.work?.toLowerCase().includes(q);

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
  const deleteSession = (dateISO: string) => {
    if (!userId) return;

    Alert.alert(
       language === 'te'
      ? 'ఈరోజు హాజరు తొలగించాలా'
      : 'Delete Attendance',
       language === 'te'
      ? 'నిశ్చయంగా ఈ హాజరు రికార్డును తొలగించాలా? ఇది తిరిగి పొందలేనిది.'
      : 'Are you sure?',
      
      [
        { text:  language === 'te'
      ? 'రద్దు చేయి'
      : 'Cancel', style: 'cancel' },
        {
          text:  language === 'te'
      ? 'తొలగించు'
      : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = sessions.filter(
              s => s.dateISO !== dateISO
            );
            setSessions(updated);
            setDisplaySessions(updated);

            await AsyncStorage.setItem(
              `ATTENDANCE_${userId}`,
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
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

    const dateText = new Date(item.dateISO).toLocaleDateString(
      language === 'te' ? 'te-IN' : 'en-IN',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    );

    const timeText = new Date(item.dateISO).toLocaleTimeString(
      language === 'te' ? 'te-IN' : 'en-IN',
      { hour: '2-digit', minute: '2-digit' }
    );
const fullCount =
  item.records?.filter((r: any) => r.status === 'full').length || 0;

const morningCount =
  item.records?.filter((r: any) => r.status === 'morning').length || 0;

const eveningCount =
  item.records?.filter((r: any) => r.status === 'evening').length || 0;


    return (
      <Animated.View
        style={[
          styles.card,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        <View style={{ flexDirection: 'row' }}>
        <Text style={styles.date}>
          <Ionicons name="calendar-outline" /> {dateText} • {timeText}
        </Text>
        <Pressable
          onPress={() => deleteSession(item.dateISO)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash" size={20} color="#d32f2f" />
        </Pressable>
        </View>
        <Text style={styles.row}>
          👨‍🌾<Text style={styles.label}>{T.farmer}:</Text> {item.farmer}
        </Text>
<Text style={styles.row}>
  💰<Text style={styles.label}>{T.work}:</Text> {item.work || '-'}
</Text>

        <Text style={styles.row}>
         🌾 <Text style={styles.label}>{T.crop}:</Text> {item.crop}
        </Text>
 <View style={styles.totalLine}>
<View style={styles.summary}>
  <Text style={styles.green}>
    {T.present}: {item.summary.present}
  </Text>

  <Text style={{ color: '#2e7d32', fontWeight: '700' }}>
    {language === 'te' ? 'పూర్తి' : 'Full'}: {fullCount}
  </Text>

  <Text style={{ color: '#1565c0', fontWeight: '700' }}>
    {language === 'te' ? 'ఉదయం' : 'Morning'}: {morningCount}
  </Text>

  <Text style={{ color: '#ef6c00', fontWeight: '700' }}>
    {language === 'te' ? 'సాయంత్రం' : 'Evening'}: {eveningCount}
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
    }, 300);
  }}
>
  <Ionicons name="arrow-back" size={22} color="#1b5e20" />
</Pressable>
        <Text style={styles.headerTitle}>{T.title}</Text>
      </View>

      {/* SEARCH + FILTER */}
      <View style={styles.searchRow}>
        <TextInput
        
          placeholder={`${T.search}`}
           placeholderTextColor="#333"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        <Pressable
          onPress={() => {
            if (!months.length) return;
            if (selectedMonth === 'ALL') setSelectedMonth(months[0]);
            else {
              const i = months.indexOf(selectedMonth);
              setSelectedMonth(
                i === months.length - 1 ? 'ALL' : months[i + 1]
              );
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
          style={{ marginTop: 20 }}
        />
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!loading && displaySessions.length === 0 && (
          <Text style={styles.empty}>{T.noData}</Text>
        )}

        {displaySessions.map((item, i) => (
          <AnimatedCard key={item.dateISO} item={item} index={i} />
        ))}
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
  totalLine: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 6,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  green: { color: '#2e7d32', fontWeight: '700' },
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
});
