import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

const { width } = Dimensions.get("window");

/* ---------------- TRANSLATIONS ---------------- */
const translations = {
  te: {
    title: "ప్రభుత్వ పథకాలు",
    subtitle: "రైతు సంక్షేమ పథకాలు & రాయితీలు",
    ap: "ఆంధ్రప్రదేశ్",
    ts: "తెలంగాణ",
    noData: "ప్రస్తుతం పథకాలు ఏమీ అందుబాటులో లేవు",
    retry: "మళ్ళీ ప్రయత్నించండి",
    readMore: "పూర్తి వివరాలు",
    errorText: "డేటా తీసుకురావడంలో లోపం జరిగింది"
  },
  en: {
    title: "Govt Schemes",
    subtitle: "Farmer Welfare & Subsidies",
    ap: "Andhra Pradesh",
    ts: "Telangana",
    noData: "No schemes available at the moment",
    retry: "Try Again",
    readMore: "View Details",
    errorText: "Error fetching schemes data"
  },
};

export default function SchemesScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<"te" | "en">("te");
  const t = translations[language];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [schemes, setSchemes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"AP" | "TS">("AP");

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  /* ---------------- LOAD LANG & DATA ---------------- */
  useEffect(() => {
    const init = async () => {
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang) setLanguage(lang as "te" | "en");
      fetchSchemes(false);
    };
    init();
  }, []);

  /* ---------------- SHIMMER ANIMATION ---------------- */
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  /* ---------------- FETCH SCHEMES FROM FIREBASE ---------------- */
  const fetchSchemes = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(false);

      // ఫైర్‌బేస్ నుండి కేవలం యాక్టివ్ గా ఉన్న స్కీమ్స్ మాత్రమే తెస్తున్నాం
      const snapshot = await firestore()
        .collection("schemes")
        .where("isActive", "==", true)
        .get();

      if (snapshot.empty) {
        setSchemes([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // డేటా తెచ్చి, లేటెస్ట్ ఫస్ట్ వచ్చేలా (createdAt) సార్ట్ చేస్తున్నాం
      const fetchedSchemes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setSchemes(fetchedSchemes);
    } catch (err) {
      console.log("Schemes API Error:", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchemes(true);
  };

  /* ---------------- FILTERING BY STATE ---------------- */
  // నువ్వు అడ్మిన్ లో BOTH ఇస్తే రెండు ట్యాబ్స్ లోనూ కనిపిస్తుంది!
  const filteredSchemes = schemes.filter(
    (scheme) => scheme.state === activeTab || scheme.state === "BOTH"
  );

  /* ---------------- COMPONENTS ---------------- */
  const ShimmerSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.shimmerCard}>
          <View style={[styles.shimmerBox, { height: 180, width: "100%" }]} />
          <View style={{ padding: 16 }}>
            <View style={[styles.shimmerBox, { height: 20, width: "70%", borderRadius: 4, marginBottom: 10 }]} />
            <View style={[styles.shimmerBox, { height: 14, width: "90%", borderRadius: 4, marginBottom: 6 }]} />
            <View style={[styles.shimmerBox, { height: 14, width: "50%", borderRadius: 4 }]} />
          </View>
          <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX: shimmerTranslate }] }]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.6)", "transparent"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      ))}
    </View>
  );

 const renderSchemeCard = ({ item }: { item: any }) => {
    // 🔥 ఫైర్‌బేస్ టైమ్ స్టాంప్ ని పక్కా Date ఫార్మాట్ లోకి మార్చడం
    let formattedDate = "";
    if (item.createdAt) {
      const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
      const day = String(date.getDate()).padStart(2, '0');
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      formattedDate = `${day} ${month}, ${year}`;
    }

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => router.push(`/farmer/schemes/${item.id}` as any)}
      >
        {/* పైన పెద్ద బ్యానర్ ఇమేజ్ */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.bannerImage }} style={styles.bannerImage} />
          {/* 🔥 ఇక్కడ AgriLog Updates తీసేసి Date పెట్టాం */}
          {formattedDate ? (
            <View style={styles.tagBadge}>
              <AppText style={styles.tagText} language={language}>{formattedDate}</AppText>
            </View>
          ) : null}
        </View>

        {/* కింద టెక్స్ట్ & డీటెయిల్స్ */}
        <View style={styles.cardContent}>
          <AppText style={styles.schemeTitle} language={language}>{item.title}</AppText>
          <AppText style={styles.schemeDesc} language={language} numberOfLines={2}>
            {item.shortDesc}
          </AppText>

          <View style={styles.cardBottomRow}>
            <AppText style={styles.readMoreText} language={language}>{t.readMore}</AppText>
            <Ionicons name="arrow-forward-circle" size={24} color="#1B5E20" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader title={t.title} subtitle={t.subtitle} language={language} />

      {/* 🔥 TABS (AP & TS) */}
      <View style={styles.stickyHeader}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === "AP" && styles.activeTabBtn]} 
            onPress={() => setActiveTab("AP")}
            activeOpacity={0.8}
          >
            <AppText style={[styles.tabText, activeTab === "AP" && styles.activeTabText]} language={language}>{t.ap}</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === "TS" && styles.activeTabBtn]} 
            onPress={() => setActiveTab("TS")}
            activeOpacity={0.8}
          >
            <AppText style={[styles.tabText, activeTab === "TS" && styles.activeTabText]} language={language}>{t.ts}</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔥 CONTENT AREA */}
      {loading && !refreshing ? (
        <ShimmerSkeleton />
      ) : error ? (
        <View style={styles.centerContainer}>
          <View style={styles.errorIconBg}>
            <Ionicons name="warning-outline" size={50} color="#DC2626" />
          </View>
          <AppText style={styles.errorText} language={language}>{t.errorText}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchSchemes(true)}>
            <AppText style={styles.retryText} language={language}>{t.retry}</AppText>
          </TouchableOpacity>
        </View>
      ) : filteredSchemes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={60} color="#D1D5DB" />
          <AppText style={[styles.errorText, { marginTop: 16 }]} language={language}>{t.noData}</AppText>
        </View>
      ) : (
        <FlatList
          data={filteredSchemes}
          keyExtractor={(item) => item.id}
          renderItem={renderSchemeCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2E7D32"]} />}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  stickyHeader: {
    backgroundColor: "#F6F7F6",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    zIndex: 10,
  },
  
 // TABS (🔥 ప్రైసెస్ స్క్రీన్ లాగా డిట్టో మార్చాను)
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    padding: 4,
    marginBottom: 15,
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: 10, 
    alignItems: "center" 
  },
  activeTabBtn: { 
    backgroundColor: "#1B5E20" 
  },
  tabText: { 
    fontSize: 14, 
    color: "#6B7280", 
    fontWeight: "600" 
  },
  activeTabText: { 
    color: "#ffffff", 
    fontWeight: "600" 
  },

  // LIST & CARDS
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },
  
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB", // 🔥 షాడోస్ తీసేసి పక్కా ఫ్లాట్ బోర్డర్ పెట్టాను
    overflow: "hidden", 
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#F3F4F6",
    position: "relative"
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  tagBadge: {
    position: "absolute",
    top: 12,
    right: 12, // 🔥 డేట్ ని రైట్ సైడ్ కి జరిపాను, నీట్ గా ఉంటుంది
    backgroundColor: "rgba(0, 0, 0, 0.6)", // బ్లాక్ కలర్ బ్యాక్ గ్రౌండ్ తో ప్రొఫెషనల్ గా
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600"
  },
 
  cardContent: {
    padding: 16,
  },
  schemeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 28,
  },
  schemeDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 16,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16A34A"
  },

  // ERROR & SHIMMER
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, marginTop: -50 },
  errorIconBg: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  errorText: { fontSize: 16, fontWeight: "600", color: "#4B5563", textAlign: "center", marginBottom: 20 },
  retryBtn: { backgroundColor: "#1B5E20", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: "white", fontSize: 15, fontWeight: "bold" },
  
  shimmerCard: { backgroundColor: "#ffffff", borderRadius: 20, marginBottom: 20, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" },
  shimmerBox: { backgroundColor: "#E5E7EB", overflow: "hidden" },
  shimmerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
});