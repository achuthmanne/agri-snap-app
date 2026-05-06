// app/farmer/scheme/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import AgriLoader from "@/components/AgriLoader"; // 👈 నీ ఫైల్ పాత్ కరెక్ట్ గా ఉందో లేదో చూసుకో
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

/* ---------------- TRANSLATIONS ---------------- */
const translations = {
  te: {
    eligibility: "అర్హతలు (Eligibility)",
    documents: "కావాల్సిన పత్రాలు",
    howToApply: "ఎలా దరఖాస్తు చేయాలి?",
    applyNow: "ఆన్‌లైన్ లో దరఖాస్తు చేయండి",
    loading: "వివరాలు లోడ్ అవుతున్నాయి...",
    error: "డేటా తీసుకురావడంలో లోపం జరిగింది"
  },
  en: {
    eligibility: "Eligibility Criteria",
    documents: "Documents Required",
    howToApply: "How to Apply?",
    applyNow: "Apply Online Here",
    loading: "Loading details...",
    error: "Error fetching details"
  }
};

export default function SchemeDetailsScreen() {
  const { id } = useLocalSearchParams(); // URL నుండి స్కీమ్ ID తీసుకుంటాం
  const router = useRouter();

  const [language, setLanguage] = useState<"te" | "en">("te");
  const t = translations[language];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scheme, setScheme] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang) setLanguage(lang as "te" | "en");
      fetchSchemeDetails();
    };
    init();
  }, [id]);

  const fetchSchemeDetails = async () => {
    try {
      setLoading(true);
      setError(false);

      if (!id) return;

      const docSnap = await firestore().collection("schemes").doc(id as string).get();

      if (docSnap.exists()) {
        setScheme({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching scheme:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const openApplyLink = async () => {
    if (scheme?.applyLink) {
      const supported = await Linking.canOpenURL(scheme.applyLink);
      if (supported) {
        await Linking.openURL(scheme.applyLink);
      } else {
        alert(language === "te" ? "లింక్ ఓపెన్ అవ్వట్లేదు." : "Cannot open link.");
      }
    }
  };

 if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        {/* 🔥 ఇక్కడ visible={true} యాడ్ చేశాను చూడు */}
        <AgriLoader visible={true} type="loading" /> 
        <AppText style={{ marginTop: 10, color: "#6B7280" }} language={language}>
          {t.loading}
        </AppText>
      </SafeAreaView>
    );
  }

  if (error || !scheme) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="warning-outline" size={50} color="#DC2626" />
        <AppText style={{ marginTop: 10, color: "#4B5563" }} language={language}>{t.error}</AppText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppText style={{ color: "white" }} language={language}>వెనక్కి వెళ్ళండి</AppText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="పథకం వివరాలు" subtitle={scheme.title.substring(0, 20) + "..."} language={language} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 🔥 HERO BANNER */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: scheme.bannerImage }} style={styles.heroImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          />
          <View style={styles.heroTextWrapper}>
            <AppText style={styles.heroTitle} language={language}>{scheme.title}</AppText>
          </View>
        </View>

        {/* 🔥 SHORT DESCRIPTION */}
        <View style={styles.section}>
          <AppText style={styles.descText} language={language}>{scheme.shortDesc}</AppText>
        </View>

        {/* 🔥 ELIGIBILITY (అర్హతలు) */}
        {scheme.eligibility && scheme.eligibility.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBg}><Ionicons name="checkmark-circle-outline" size={22} color="#16A34A" /></View>
              <AppText style={styles.cardTitle} language={language}>{t.eligibility}</AppText>
            </View>
            {scheme.eligibility.map((point: string, index: number) => (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.bulletPoint} />
                <AppText style={styles.bulletText} language={language}>{point}</AppText>
              </View>
            ))}
          </View>
        )}

        {/* 🔥 DOCUMENTS REQUIRED (కావాల్సిన పత్రాలు) */}
        {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="document-text-outline" size={22} color="#2563EB" />
              </View>
              <AppText style={styles.cardTitle} language={language}>{t.documents}</AppText>
            </View>
            {scheme.documentsRequired.map((doc: string, index: number) => (
              <View key={index} style={styles.bulletRow}>
                <Ionicons name="folder-outline" size={16} color="#6B7280" style={{ marginRight: 8, marginTop: 2 }} />
                <AppText style={styles.bulletText} language={language}>{doc}</AppText>
              </View>
            ))}
          </View>
        )}

        {/* 🔥 HOW TO APPLY (ఎలా దరఖాస్తు చేయాలి) */}
        {scheme.howToApply ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBg, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="information-circle-outline" size={22} color="#D97706" />
              </View>
              <AppText style={styles.cardTitle} language={language}>{t.howToApply}</AppText>
            </View>
            <AppText style={styles.infoText} language={language}>{scheme.howToApply}</AppText>
          </View>
        ) : null}

      </ScrollView>

     {/* 🔥 STICKY APPLY BUTTON (AgriLog Green Theme) */}
      {scheme.applyLink && (
        <View style={styles.bottomBar}>
          <TouchableOpacity activeOpacity={0.8} onPress={openApplyLink}>
            {/* 🔥 కలర్స్ ని మన ట్యాబ్స్ కి మ్యాచ్ అయ్యేలా #1B5E20 కి మార్చాను */}
            <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.applyBtn}>
              <Ionicons name="globe-outline" size={22} color="white" />
              <AppText style={styles.applyBtnText} language={language}>{t.applyNow}</AppText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F7F6" },
  scrollContent: { paddingBottom: 100 }, // Bottom bar space

  // HERO BANNER
  heroContainer: { width: "100%", height: 250, position: "relative" },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  heroTextWrapper: { position: "absolute", bottom: 16, left: 16, right: 16 },
  heroTitle: { color: "white", fontSize: 22, fontWeight: "600", lineHeight: 30 },

  // TEXT SECTION
  section: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  descText: { fontSize: 15, color: "#4B5563", lineHeight: 24 },

  // CARDS
  card: { backgroundColor: "#ffffff", marginHorizontal: 20, marginTop: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", elevation: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#DCFCE7", justifyContent: "center", alignItems: "center", marginRight: 10 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  
  // BULLET POINTS
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16A34A", marginTop: 8, marginRight: 10 },
  bulletText: { flex: 1, fontSize: 14, color: "#4B5563", lineHeight: 22 },
  infoText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },

  // STICKY BOTTOM BAR
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#ffffff", paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#E5E7EB", elevation: 10 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  applyBtnText: { color: "white", fontSize: 16, fontWeight: "600" },
  
  backBtn: { marginTop: 20, backgroundColor: "#4B5563", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});