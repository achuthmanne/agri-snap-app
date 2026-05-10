import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import AppEmptyState from "@/components/AppEmptyState"; // 🔥 మన గ్లోబల్ కాంపోనెంట్
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
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
const [activeSession, setActiveSession] = useState("");

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

    return () => {
      ExpoSpeechRecognitionModule.stop(); 
    };
  }, [isScreenFocused]);

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
    const userPhone = await AsyncStorage.getItem("USER_PHONE");

    if (!userPhone) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const userDoc = await firestore()
      .collection("users")
      .doc(userPhone)
      .get();
 const session = userDoc.data()?.activeSession;

    if (!session) {
      setLoading(false);
      return;
    }

    setActiveSession(session);
    try {
      const db = firestore();
      const userDoc = await db.collection("users").doc(userPhone).get();
      const activeSession = userDoc.data()?.activeSession;

      if (!activeSession) return;
      
      /* 🔥 1. GET PAYMENTS ONLY */
      const paymentSnap = await db
        .collection("users")
        .doc(userPhone)
        .collection("payments")
        .where("session", "==", activeSession) 
        .get();

      const payments = paymentSnap.docs.map(d => d.data());

      /* 🔥 2. GROUP BY MESTRI */
      const map: any = {};

      payments.forEach(p => {
        const id = p.mestriId;
        if (!id) return;

        const ids = Array.isArray(p.selectedAttendanceIds)
          ? p.selectedAttendanceIds
          : [];

        if (!map[id]) {
          map[id] = {
            id,
            name: p.name,
            village: p.village,
            paid: 0
          };
        }

        map[id].paid += ids.length; 
      });

      /* 🔥 3. FETCH TOTAL ATTENDANCE */
      const promises = Object.keys(map).map(async (key) => {
        const attendanceSnap = await db
          .collection("users")
          .doc(userPhone)
          .collection("mestris")
          .doc(key)
          .collection("attendance")
          .where("session", "==", activeSession)
          .get();

        const total = attendanceSnap.size;
        const paid = map[key].paid;

        if (total === 0) return null;

        const percent = (paid / total) * 100;

        return {
          id: key,
          name: map[key].name,
          village: map[key].village,
          total,
          paid,
          percent
        };
      });

      const result = (await Promise.all(promises)).filter(Boolean);
      setMestris(result);

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false); 
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const filtered = useMemo(() => {
    return mestris.filter(item =>
      (item.name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  }, [mestris, search]);

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
        subtitle={language === "te" ? `సీజన్: ${activeSession}` : `Season: ${activeSession}`}
        language={language}
      />

      {/* 🔥 HIDE SEARCH BAR IF NO DATA EXISTS */}
      {(!loading && mestris.length === 0) ? null : (
        <View style={[styles.searchContainer, isFocused && styles.searchFocused]}>
          <Ionicons name="search-outline" size={20} color={isFocused ? "#16A34A" : "#9CA3AF"} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={language === "te" ? "మేస్త్రీ పేరుతో వెతకండి..." : "Search by mestriname..."}
            placeholderTextColor="#9CA3AF"
            cursorColor="#16A34A"
            selectionColor="#16A34A40"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={styles.searchInput}
          />

          {search.trim().length > 0 ? (
            <TouchableOpacity 
              onPress={() => setSearch("")} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleVoiceSearch} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name={isListening ? "microphone" : "microphone-outline"} 
                size={22} 
                color={isListening ? "#EF4444" : (isFocused ? "#16A34A" : "#9CA3AF")} 
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <>
          <ShimmerRow />
          <ShimmerRow />
          <ShimmerRow />
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i, index) => i.id || index.toString()}
          keyboardShouldPersistTaps="handled" // 🔥 ADDED THIS TO PREVENT KEYBOARD CLOSING ISSUE
          contentContainerStyle={[
            { paddingBottom: 100 },
            // 🔥 సెంటర్ లోకి రావడానికి లాజిక్
            filtered.length === 0 && { flexGrow: 1, justifyContent: 'center' }
          ]}

          /* 🔥 OUR NEW GLOBAL EMPTY STATE COMPONENT */
          ListEmptyComponent={
            <AppEmptyState
              iconName={search.trim().length > 0 ? "search-outline" : "wallet-outline"}
              title={
                search.trim().length > 0
                  ? (language === "te" ? "ఏమి దొరకలేదు" : "Not Found")
                  : (language === "te" ? "చెల్లింపు చరిత్ర లేవు" : "No Payments History Yet")
              }
              subtitle={
                search.trim().length > 0
                  ? (language === "te" ? "మీ శోధనకు సరిపడే ఫలితాలు లేవు" : "No results match your search")
                  : (language === "te" ? "మీరు చేసిన చెల్లింపులు ఇక్కడ కనిపిస్తాయి" : "Your completed payments will appear here")
              }
              language={language}
            />
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
                       {item.paid} / {item.total} {language === "te" ? "చెల్లించినది" : "Paid"}
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

  // 🔥 MINIMAL, CLEAN SEARCH BAR STYLES
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchFocused: {
    borderColor: "#16A34A",
    backgroundColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 15,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
    color: "#1F2937",
    fontFamily: "Mandali",
    includeFontPadding: false,
  },

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