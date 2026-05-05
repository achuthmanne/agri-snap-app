import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient"; // 🔥 Shimmer కోసం యాడ్ చేశాం

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

const { width } = Dimensions.get("window");

/* ---------------- TRANSLATIONS ---------------- */
const translations = {
  te: {
    title: "వాతావరణం",
    subtitle: "తాజా వాతావరణ సమాచారం",
    hourly: "గంటల వారీగా",
    daily: "5 రోజుల వాతావరణం",
    humidity: "తేమ",
    wind: "గాలి వేగం",
    rainChance: "వర్షం అవకాశం",
    uv: "UV ఇండెక్స్",
    adviceTitle: "వ్యవసాయ సూచన",
    locating: "లొకేషన్ వెతుకుతోంది...",
    loadingData: "వాతావరణ డేటా పొందుతున్నాం...",
    permissionDenied: "లొకేషన్ పర్మిషన్ ఇవ్వలేదు. దయచేసి సెట్టింగ్స్ లో ఆన్ చేయండి.",
    noData: "వాతావరణ సమాచారం దొరకలేదు",
    retry: "మళ్ళీ ప్రయత్నించండి"
  },
  en: {
    title: "Weather",
    subtitle: "Latest Weather Updates",
    hourly: "Hourly Forecast",
    daily: "5-Day Forecast",
    humidity: "Humidity",
    wind: "Wind",
    rainChance: "Rain Chance",
    uv: "UV Index",
    adviceTitle: "Agri Advice",
    locating: "Locating you...",
    loadingData: "Fetching weather data...",
    permissionDenied: "Location permission denied. Please enable it in settings.",
    noData: "Weather data not available",
    retry: "Try Again"
  },
};

const WEATHER_CACHE_KEY = "ADVANCED_WEATHER_CACHE_V2";
const TRANSLATION_CACHE_KEY = "LOCATION_TRANSLATION_DICT";
const CACHE_TIME = 5 * 60 * 1000; 

export default function WeatherScreen() {
  const [language, setLanguage] = useState<"te" | "en">("te");
  const t = translations[language];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // 🔥 ఎర్రర్ హ్యాండ్లింగ్ కోసం
  const [refreshing, setRefreshing] = useState(false);

  const [exactLocation, setExactLocation] = useState("");
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);

  // 🔥 Shimmer Animation Value
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang) setLanguage(lang as "te" | "en");
    };
    loadLang();
    fetchRealtimeWeather(false);
  }, [language]);

  /* ---------------- SHIMMER ANIMATION EFFECT ---------------- */
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const translateLocation = async (text: string, lang: string) => {
    if (!text || text === "Location") return lang === "te" ? "లొకేషన్ దొరకలేదు" : "Location Not Found";
    if (lang === "en") return text;
    try {
      const cachedDictString = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
      const dict = cachedDictString ? JSON.parse(cachedDictString) : {};
      if (dict[text]) return dict[text];
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(text)}`);
      const data = await res.json();
      const translatedText = data[0][0][0];
      dict[text] = translatedText;
      await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(dict));
      return translatedText;
    } catch (e) {
      return text;
    }
  };

  const fetchRealtimeWeather = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(false);

      if (!forceRefresh) {
        const cachedWeather = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
        if (cachedWeather) {
          const parsed = JSON.parse(cachedWeather);
          if (Date.now() - parsed.timestamp < CACHE_TIME && parsed.lang === language) {
            setExactLocation(parsed.data.translatedLocation);
            setCurrentWeather(parsed.data.current);
            setHourlyData(parsed.data.hourly || []);
            setDailyData(parsed.data.daily || []);
            setLoading(false);
            return;
          }
        }
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(t.permissionDenied);
        setError(true);
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      const response = await fetch(
        `https://us-central1-agrisnap-9b487.cloudfunctions.net/getAdvancedWeather?lat=${lat}&lon=${lon}&lang=${language}`
      );

      if (!response.ok) throw new Error("Cloud Function Failed");

      const data = await response.json();

      let englishLoc = data.exactLocation;
      if (englishLoc === "Location" && data.current?.name) englishLoc = data.current.name; 
      
      const finalTranslatedLocation = await translateLocation(englishLoc, language);

      setExactLocation(finalTranslatedLocation);
      setCurrentWeather(data.current);
      setHourlyData(data.hourly || []);
      setDailyData(data.daily || []);

      await AsyncStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          lang: language,
          data: { translatedLocation: finalTranslatedLocation, current: data.current, hourly: data.hourly, daily: data.daily }
        })
      );

    } catch (error) {
      console.log("Weather API Error:", error);
      setError(true); // 🔥 Show neat error UI instead of fallback dummy data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRealtimeWeather(true); 
  };

  /* ---------------- SHIMMER UI COMPONENT ---------------- */
  const ShimmerSkeleton = () => (
    <View style={styles.scrollContent}>
      {/* Location Shimmer */}
      <View style={[styles.shimmerBox, { width: 150, height: 35, borderRadius: 12, marginBottom: 20 }]} />
      
      {/* Main Weather Shimmer */}
      <View style={{ alignItems: "center", marginBottom: 25 }}>
        <View style={[styles.shimmerBox, { width: 90, height: 90, borderRadius: 45, marginBottom: 10 }]} />
        <View style={[styles.shimmerBox, { width: 120, height: 50, borderRadius: 12, marginBottom: 10 }]} />
        <View style={[styles.shimmerBox, { width: 180, height: 20, borderRadius: 8 }]} />
      </View>

      {/* Advice Box Shimmer */}
      <View style={[styles.shimmerBox, { height: 90, borderRadius: 16, marginBottom: 25, width: "100%" }]} />

      {/* Grid Shimmer */}
      <View style={styles.gridContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.shimmerBox, { width: (width - 52) / 2, height: 100, borderRadius: 16 }]} />
        ))}
      </View>
      
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.6)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      
      <AppHeader title={t.title} subtitle={t.subtitle} language={language} />

      {/* 🔥 1. SHIMMER LOADING UI */}
      {loading && !refreshing ? (
        <ShimmerSkeleton />
      ) : 
      
      /* 🔥 2. NEAT ERROR UI */
      error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconBg}>
            <Ionicons name="cloud-offline" size={50} color="#9CA3AF" />
          </View>
          <AppText style={styles.errorText} language={language}>{t.noData}</AppText>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchRealtimeWeather(true)}>
            <AppText style={styles.retryText} language={language}>{t.retry}</AppText>
          </TouchableOpacity>
        </View>
      ) : 

      /* 🔥 3. ACTUAL PRO WEATHER UI */
      (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2E7D32"]} />}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 📍 EXACT LOCATION */}
          <View style={styles.locationBox}>
            <Ionicons name="location-sharp" size={18} color="#2E7D32" />
            <AppText style={styles.locationText} language={language}>
              {exactLocation}
            </AppText>
          </View>

          {/* 🌡️ MAIN WEATHER */}
          <View style={styles.mainWeatherBox}>
            <Ionicons name={currentWeather?.icon || "partly-sunny"} size={85} color={currentWeather?.color || "#F59E0B"} />
            <AppText style={styles.mainTemp} language={language}>{currentWeather?.temp}°C</AppText>
            <AppText style={styles.mainCondition} language={language}>{currentWeather?.condition}</AppText>
          </View>

          {/* 💡 AGRI ADVICE */}
          <View style={[styles.adviceBox, currentWeather?.isGood ? styles.adviceGood : styles.adviceBad]}>
            <View style={styles.adviceHeader}>
              <Ionicons 
                name={currentWeather?.isGood ? "information-circle" : "warning"} 
                size={18} 
                color={currentWeather?.isGood ? "#15803D" : "#DC2626"} 
              />
              <AppText 
                style={[styles.adviceTitle, { color: currentWeather?.isGood ? "#15803D" : "#DC2626" }]} 
                language={language}
              >
                {currentWeather?.isGood 
                  ? (language === "te" ? "ముఖ్య గమనిక" : "Important Note") 
                  : (language === "te" ? "వాతావరణ హెచ్చరిక" : "Weather Alert")}
              </AppText>
            </View>
            <AppText style={[styles.adviceText, { color: currentWeather?.isGood ? "#14532D" : "#7F1D1D" }]} language={language}>
              {currentWeather?.advice}
            </AppText>
          </View>

          {/* 📊 WEATHER GRID */}
          <View style={styles.gridContainer}>
            <View style={styles.gridBox}>
              <Ionicons name="water" size={24} color="#3B82F6" />
              <AppText style={styles.gridLabel} language={language}>{t.humidity}</AppText>
              <AppText style={styles.gridValue} language={language}>{currentWeather?.humidity}%</AppText>
            </View>
            <View style={styles.gridBox}>
              <Ionicons name="umbrella" size={24} color="#3B82F6" />
              <AppText style={styles.gridLabel} language={language}>{t.rainChance}</AppText>
              <AppText style={styles.gridValue} language={language}>{currentWeather?.rainChance}%</AppText>
            </View>
            <View style={styles.gridBox}>
              <Ionicons name="navigate" size={24} color="#0D9488" />
              <AppText style={styles.gridLabel} language={language}>{t.wind}</AppText>
              <AppText style={styles.gridValue} language={language}>{currentWeather?.wind} km/h</AppText>
            </View>
            <View style={styles.gridBox}>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
              <AppText style={styles.gridLabel} language={language}>{t.uv}</AppText>
              <AppText style={styles.gridValue} language={language}>{currentWeather?.uv}</AppText>
            </View>
          </View>

          {/* ⏱️ HOURLY FORECAST */}
          {hourlyData.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle} language={language}>{t.hourly}</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScroll}>
                {hourlyData.map((item, index) => (
                  <View key={index} style={styles.hourlyCard}>
                    <AppText style={styles.hourlyTime} language={language}>{item.time}</AppText>
                    <Ionicons name={item.icon} size={28} color={item.color || "#F59E0B"} style={{ marginVertical: 8 }} />
                    <AppText style={styles.hourlyTemp} language={language}>{item.temp}°</AppText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 📅 5-DAY FORECAST */}
          {dailyData.length > 0 && (
            <View style={styles.section}>
              <AppText style={styles.sectionTitle} language={language}>{t.daily}</AppText>
              <View style={styles.dailyBox}>
                {dailyData.map((item, index) => (
                  <View key={index} style={[styles.dailyRow, index === dailyData.length - 1 && { borderBottomWidth: 0 }]}>
                    <AppText style={styles.dailyDay} language={language}>{item.day}</AppText>
                    <Ionicons name={item.icon} size={22} color={item.color || "#6B7280"} />
                    <View style={styles.dailyTemps}>
                      <AppText style={styles.dailyMin} language={language}>{item.min}°</AppText>
                      <AppText style={styles.dailyMax} language={language}>{item.max}°</AppText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7F6",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  
  // 🔥 SHIMMER & ERROR STYLES
  shimmerBox: {
    backgroundColor: "#E5E7EB", // Light Gray Base
    overflow: "hidden",
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  // (REST OF YOUR STYLES REMAIN SAME)
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: "#1B5E20",
    fontWeight: "600",
    marginLeft: 6,
  },
  mainWeatherBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  mainTemp: {
    fontSize: 70,
    color: "#1F2937",
    fontWeight: "bold",
    includeFontPadding: false,
    marginTop: 5,
  },
  mainCondition: {
    fontSize: 20,
    color: "#4B5563",
    marginTop: -5,
  },
  adviceBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
  },
  adviceGood: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  adviceBad: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 6,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 25,
  },
  gridBox: {
    width: (width - 52) / 2,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gridLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  hourlyScroll: {
    gap: 12,
  },
  hourlyCard: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hourlyTime: {
    fontSize: 13,
    color: "#6B7280",
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  dailyBox: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dailyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dailyDay: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
  },
  dailyTemps: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  dailyMin: {
    fontSize: 15,
    color: "#6B7280",
  },
  dailyMax: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
});