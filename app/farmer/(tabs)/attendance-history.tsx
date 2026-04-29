// app/farmer/attendance-history.tsx

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import Svg, { Circle } from "react-native-svg";

/* ---------------- CIRCLE ---------------- */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressCircle = ({ percent }: { percent: number }) => {
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const size = 60;
  const center = size / 2;

  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(percent, {
      duration: 1800
    });
  }, [percent]);

  const animatedProps = useAnimatedProps(() => {
    const progress = (animatedValue.value / 100) * circumference;
    return {
      strokeDashoffset: circumference - progress
    };
  });

  const color =
    percent < 40 ? "#EF4444" :
    percent < 70 ? "#F59E0B" :
    "#22C55E";

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center},${center}`}
        />
      </Svg>
      <AppText style={styles.percentText}>
        {Math.round(percent)}%
      </AppText>
    </View>
  );
};

/* ---------------- SCREEN ---------------- */
export default function AttendanceHistory() {
  const router = useRouter();
  const [mestris, setMestris] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
 const [isListening, setIsListening] = useState(false);
const isScreenFocused = useIsFocused();

useSpeechRecognitionEvent("result", (event) => {

  // 🔥 FIX: only current screen lo unna appude work avvali
  if (!isScreenFocused || !isListening) return;

  if (event.results && event.results.length > 0) {
    setSearch(event.results[0].transcript);
  }
});

useSpeechRecognitionEvent("end", () => setIsListening(false));

const handleVoiceSearch = async () => {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  if (!result.granted) return;

  setIsListening(true);
  ExpoSpeechRecognitionModule.start({
    lang: language === "te" ? "te-IN" : "en-US",
    interimResults: true,
  });
};



useEffect(() => {
  if (!isScreenFocused) {
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }
}, [isScreenFocused]);


  const filteredMestris = mestris.filter((item) =>
  item.name?.toLowerCase().includes(search.toLowerCase())
);


  useFocusEffect(
    useCallback(() => {
      const loadLang = async () => {
        const lang = await AsyncStorage.getItem("APP_LANG");
        if (lang) setLanguage(lang as "te" | "en");
      };
      loadLang();
    }, [])
  );

 

  const avatarColors = [
    "#22C55E", "#3B82F6", "#F59E0B", "#EF4444",
    "#8B5CF6", "#14B8A6", "#F97316", "#6366F1",
    "#10B981", "#E11D48"
  ];

  const getColor = (id: string) => {
    const index = id.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };



  const ShimmerRow = () => (
    <View style={styles.row}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: 42, height: 42, borderRadius: 21 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: "60%", height: 14, borderRadius: 6 }}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: "40%", height: 12, borderRadius: 6, marginTop: 6 }}
        />
      </View>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: 45, height: 45, borderRadius: 25 }}
      />
    </View>
  );
const getUsageColor = (percent: number) => {
  if (percent >= 70) return "#16A34A"; // green
  if (percent >= 40) return "#F59E0B"; // yellow
  return "#EF4444"; // red
};
  const loadData = async () => {
    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone) return;
    setLoading(true);
    try {
      const mestriSnap = await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .get();

      const counts: any[] = [];
      for (const doc of mestriSnap.docs) {
        const mestri = doc.data();
        const attendanceSnap = await firestore()
          .collection("users")
          .doc(userPhone)
          .collection("mestris")
          .doc(doc.id)
          .collection("attendance")
          .get();

        const list = attendanceSnap.docs.map(d => d.data());
        let total = 0;
        list.forEach(a => {
         total += 1; // 🔥 each record = 1 day
        });
        if (total > 0) {
          counts.push({ id: doc.id, ...mestri, total });
        }
      }

      const grandTotal = counts.reduce((sum, item) => sum + item.total, 0);
      const result = counts.map(item => ({
        ...item,
        percent: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0
      }));
      result.sort((a, b) => b.percent - a.percent);
      setMestris(result);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filtered = mestris.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "హాజరు చరిత్ర" : "Attendance History"}
        subtitle={language === "te" ? "పూర్వపు వివరాలు" : "Previous Details"}
        language={language}
      />

    {/* SEARCH */}
<View style={[
  styles.searchContainer,
  { borderColor: isFocused ? "#16A34A" : "#E5E7EB" }
]}>
  <Ionicons name="search" size={18} color={isFocused ? "#16A34A" : "#9CA3AF"} />

  <TextInput
    value={search}
    onChangeText={setSearch}
    placeholder={
    language === "te"
      ? "మేస్త్రీని వెతకండి..."
      : "Search mestri..."
  }
    placeholderTextColor="#9CA3AF"
    cursorColor={'green'}
    selectionColor={'green'}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
    style={[styles.searchInput, { fontFamily: 'Mandali' }]}
  />

  {search.length > 0 ? (
    <TouchableOpacity onPress={() => setSearch("")} >
      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity 
      onPress={handleVoiceSearch}   style={{
      marginLeft: 10,
      padding: 5,
      borderRadius: 50,
      backgroundColor: "#f0f9f3"
    }}>
      <MaterialCommunityIcons 
        name={isListening ? "microphone" : "microphone-outline"} 
        size={20} 
        color={isListening ? "#EF4444" : "#16A34A"} 
      />
    </TouchableOpacity>
  )}
</View>

      {loading ? (
        <View>
          <ShimmerRow />
          <ShimmerRow />
          <ShimmerRow />
          <ShimmerRow />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons
                name={search.length > 0 ? "search-outline" : "people-outline"}
                size={60}
                color="#9CA3AF"
              />
              <AppText style={styles.emptyTitle} language={language}>
                {search.length > 0
                  ? (language === "te" ? "ఏమి దొరకలేదు" : "Not Found")
                  : (language === "te" ? "మేస్త్రీలు లేరు" : "No Mestris")}
              </AppText>
              <AppText style={styles.emptySub} language={language}>
                {search.length > 0
                  ? (language === "te" ? "మీ శోధనకు సరిపడే ఫలితాలు లేవు" : "No results match your search")
                  : (language === "te" ? "ముందుగా హాజరు నమోదు చేయండి." : "Please record the attendance first.")}
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/farmer/mestri-history",
                  params: {
                    id: item.id,
                    name: item.name,
                    village: item.village
                  }
                });
              }}
            >
              <View style={styles.left}>
                <View style={[styles.avatar, { backgroundColor: getColor(item.id) }]}>
                  <AppText style={styles.avatarText} language={language}>
                    {item.name?.charAt(0)?.toUpperCase()}
                  </AppText>
                </View>
                <View style={styles.details}>
                  <AppText style={styles.name} language={language}>{item.name}</AppText>
                  <AppText style={styles.sub} language={language}>{item.village || "----"}</AppText>
                </View>
              </View>

              <View style={styles.right}>
                <View style={styles.circleWrapper}>
                  <ProgressCircle percent={item.percent || 0} />
                </View>
                <View
  style={{
    backgroundColor: getUsageColor(item.percent) + "15", // light bg
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  }}
>

  <AppText
    style={{
      fontSize: 11,
      color: getUsageColor(item.percent),
      fontWeight: "600"
    }}
    language={language}
  >
    {language === "te" ? "పని వాటా" : "Work Share"}
  </AppText>

</View>
                
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 50, // కొంచెం హైట్ పెంచితే బాగుంటుంది
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1 // నీట్‌గా కనిపిస్తుంది
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
    height: '100%'
  },
  percentLabel: { fontSize: 12, color: "#6B7280", marginTop: 2, lineHeight: 18 },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "600", lineHeight: 20 },
  details: { flex: 1, gap: 4, marginLeft: 8 },
  name: { fontSize: 16, fontWeight: "600", color: "#0F172A", lineHeight: 24 },
  sub: { fontSize: 14, color: "#64748B", lineHeight: 20 },
  right: { justifyContent: "center", alignItems: "center" },
  percentText: { position: "absolute", fontSize: 10, fontWeight: "600" },
  searchWrapper: { paddingHorizontal: 20, marginTop: 10, alignItems: "flex-end" },
  emptyBox: { marginTop: 100, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  circleWrapper: { width: 60, height: 60, justifyContent: "center", alignItems: "center" },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: "600", color: "#1F2937" },
  emptySub: { marginTop: 6, fontSize: 13, color: "#6B7280", textAlign: "center" },
  searchBox: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, height: 44, flexDirection: "row", alignItems: "center" },
  inputWrap: { flex: 1, marginLeft: 8, justifyContent: "center" },
  input: { fontSize: 14, color: "#111827", padding: 0 },
  placeholder: { position: "absolute", left: 0, fontSize: 14, color: "#9CA3AF" },
});