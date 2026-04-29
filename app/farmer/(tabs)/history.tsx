import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
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

/* ---------------- PROGRESS ---------------- */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressCircle = ({ percent }: { percent: number }) => {
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const size = 60;
  const center = size / 2;

  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(percent, { duration: 1200 });
  }, [percent]);

  const animatedProps = useAnimatedProps(() => {
    const progress = (animatedValue.value / 100) * circumference;
    return {
      strokeDashoffset: circumference - progress
    };
  });

  const color =
    percent === 0 ? "#EF4444" :
    percent < 100 ? "#F59E0B" :
    "#22C55E";

  return (
   <View style={{
  width: size,
  height: size,
  alignItems: "center",
  justifyContent: "center"
}}>
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

  {/* 🔥 PERFECT CENTER */}
  <AppText
    style={{
      position: "absolute",
      fontSize: 11,
      fontWeight: "600"
    }}
  >
    {Math.round(percent)}%
  </AppText>
</View>
  );
};

/* ---------------- STATUS ---------------- */
const getStatus = (paid: number, total: number) => {
  if (paid === 0) return { label: "Not Paid", color: "#EF4444" };
  if (paid < total) return { label: "Pending", color: "#F59E0B" };
  return { label: "Cleared", color: "#22C55E" };
};

/* ---------------- SCREEN ---------------- */
export default function PaymentHistory() {
  const router = useRouter();
const [isFocused, setIsFocused] = useState(false);
  const [mestris, setMestris] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<"te" | "en">("te");
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

  /* ---------- LANGUAGE ---------- */
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("APP_LANG").then(l => {
        if (l) setLanguage(l as any);
      });
    }, [])
  );

 
  /* ---------- COLORS ---------- */
  const avatarColors = ["#22C55E","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];

  const getColor = (id: string) => {
    const index = id.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };

  /* ---------- LOAD DATA ---------- */
  const loadData = async () => {
  const phone = await AsyncStorage.getItem("USER_PHONE");
  if (!phone) return;

  setLoading(true);

  try {
    const db = firestore();

    /* 🔥 1. GET PAYMENTS ONLY */
    const paymentSnap = await db
      .collection("users")
      .doc(phone)
      .collection("payments")
      .get();

    const payments = paymentSnap.docs.map(d => d.data());

    /* 🔥 2. GROUP BY MESTRI */
    const map: any = {};

    payments.forEach(p => {
      const id = p.mestriId;
      if (!id) return;

      if (!map[id]) {
        map[id] = {
          id,
          name: p.name,
          village: p.village,
          paid: 0
        };
      }

      map[id].paid += (p.selectedAttendanceIds || []).length;
    });

    /* 🔥 3. FETCH TOTAL ATTENDANCE */
    const result: any[] = [];

    for (const key in map) {
      const attendanceSnap = await db
        .collection("users")
        .doc(phone)
        .collection("mestris")
        .doc(key)
        .collection("attendance")
        .get();

      const total = attendanceSnap.size;
      const paid = map[key].paid;

      const percent = total > 0 ? (paid / total) * 100 : 0;

      result.push({
        id: key,
        name: map[key].name,
        village: map[key].village,
        total,
        paid,
        percent
      });
    }

    setMestris(result);

  } catch (e) {
    console.log(e);
  }

  setLoading(false);
};

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const filtered = mestris.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- SHIMMER ---------- */
  const ShimmerRow = () => (
    <View style={styles.row}>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 42, height: 42, borderRadius: 21 }} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: "60%", height: 14 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: "40%", height: 12, marginTop: 6 }} />
      </View>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 60, height: 60, borderRadius: 30 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "చెల్లింపు చరిత్ర" : "Payment History"}
        subtitle={language === "te" ? "స్థితి & పురోగతి" : "Status & Progress"}
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
  <>
    <ShimmerRow />
    <ShimmerRow />
    <ShimmerRow />
  </>
) : (
  <FlatList
    data={filtered}
    keyExtractor={(i) => i.id}
    contentContainerStyle={{ paddingBottom: 100 }}

    /* 🔥 EMPTY STATE ADD HERE */
    ListEmptyComponent={
      <View style={styles.emptyBox}>

        <Ionicons
          name={search.length > 0 ? "search-outline" : "wallet-outline"}
          size={60}
          color="#9CA3AF"
        />

        <AppText style={styles.emptyTitle} language={language}>
          {search.length > 0
            ? (language === "te" ? "ఏమి దొరకలేదు" : "Not Found")
            : (language === "te" ? "చెల్లింపులు లేవు" : "No Payments Yet")}
        </AppText>

        <AppText style={styles.emptySub} language={language}>
          {search.length > 0
            ? (language === "te"
                ? "మీ శోధనకు సరిపడే ఫలితాలు లేవు"
                : "No results match your search")
            : (language === "te"
                ? "మీరు చేసిన చెల్లింపులు ఇక్కడ కనిపిస్తాయి"
                : "Your completed payments will appear here")}
        </AppText>

      </View>
    }

    renderItem={({ item }) => {
      const status = getStatus(item.paid, item.total);

      return (
        <TouchableOpacity
  style={styles.card}
  activeOpacity={0.7}
  onPress={() => {
    router.push({
      pathname: "/farmer/payment-detail-history",
      params: {
        mestriId: item.id,
        name: item.name,
        village: item.village
      }
    });
  }}
>

          <View style={styles.mainRow}>

            {/* LEFT */}
            <View style={styles.leftSection}>

              <View style={[styles.avatar, { backgroundColor: getColor(item.id) }]}>
                <AppText style={styles.avatarText} language={language}>
                  {item.name?.charAt(0)?.toUpperCase()}
                </AppText>
              </View>

              <View style={styles.details}>
                <AppText style={styles.name} language={language}>
                  {item.name}
                </AppText>

                <AppText style={styles.sub} language={language}>
                  {item.village || "----"}
                </AppText>

                <AppText style={styles.paidText} language={language}>
                  {language === "te" ? "చెల్లించినది" : "Paid"}: {item.paid} / {item.total}
                </AppText>
              </View>

            </View>

            {/* RIGHT */}
            <View style={styles.rightSection}>

              <ProgressCircle percent={item.percent || 0} />

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: status.color + "20" }
                ]}
              >
                <AppText
                  style={[styles.statusText, { color: status.color }]}
                  language={language}
                >
                  {language === "te"
                    ? status.label === "Cleared"
                      ? "చెల్లింపు పూర్తి"
                      : status.label === "Pending"
                      ? "చెల్లింపు పెండింగ్"
                      : "చెల్లించలేదు"
                    : status.label}
                </AppText>
              </View>

            </View>

          </View>

        </TouchableOpacity>
      );
    }}
  />
)}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },


  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "flex-end"
  },
card: {
  marginHorizontal: 20,
  marginVertical: 8,
  padding: 16,
  borderRadius: 16,
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#E5E7EB"
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
topRow: {
  flexDirection: "row",
  alignItems: "center"
},

avatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  justifyContent: "center",
  alignItems: "center"
},

avatarText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600"
},

details: {
  marginLeft: 12,
  flex: 1
},
mainRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},
input: {
  fontSize: 14,
  color: "#111827"
},
leftSection: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1
},

rightSection: {
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 10
},

name: {
  fontSize: 16,
  fontWeight: "600",
  color: "#111827"
},
emptyBox: {
  marginTop: 120,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 30
},

emptyTitle: {
  marginTop: 12,
  fontSize: 17,
  fontWeight: "600",
  color: "#1F2937"
},

emptySub: {
  marginTop: 6,
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  lineHeight: 18
},
sub: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 2
},

paidText: {
  fontSize: 12,
  color: "#374151",
  marginTop: 4
},

centerCircle: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 14
},

statusBadge: {
  marginTop: 12,
  alignSelf: "center",
  paddingHorizontal: 12,
  paddingVertical: 5,
  borderRadius: 12
},

statusText: {
  fontSize: 12,
  fontWeight: "600"
},
 placeholder: {
  position: "absolute",
  left: 4,
  right: 0,
  textAlignVertical: "center",
  height: "100%",   // 🔥 important
  fontSize: 14,
  color: "#9CA3AF"
},
  searchBox: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: "row",
    alignItems: "center"
  },

  inputWrap: { flex: 1, marginLeft: 8 },

});