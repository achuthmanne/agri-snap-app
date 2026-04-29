import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from "expo-speech-recognition";

import {
    FlatList,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

// నువ్వు ఇమేజ్ సెర్చ్ చేసి పెట్టుకున్న డీఫాల్ట్ ఇమేజెస్ మ్యాపింగ్
const getLocalImage = (type: string) => {
  if (!type) return require("@/assets/images/John-deere-Tractors..jpg");
  const t = type.toLowerCase();
// 1. MINI TRACTOR
  if (t.includes("mini tractor") || t.includes("మినీ ట్రాక్టర్")) {
    return require("@/assets/images/mini.webp");
  }

  // 3. POWER TILLER
  if (t.includes("power tiller") || t.includes("పవర్ టిల్లర్")) {
    return require("@/assets/images/tiller.avif");
  }

  // 4. COMBINE HARVESTER
  if (t.includes("combine harvester") || t.includes("కంబైన్డ్ హార్వెస్టర్") || t.includes("కోత మిషన్")) {
    return require("@/assets/images/harvester.jpg");
  }

  // 5. PADDY TRANSPLANTER
  if (t.includes("paddy transplanter") || t.includes("వరి నాటు యంత్రం")) {
    return require("@/assets/images/vari.png");
  }
  // 8. SEED DRILL
  if (t.includes("seed drill") || t.includes("విత్తన గొర్రు") || t.includes("సీడ్ డ్రిల్")) {
    return require("@/assets/images/seeddrill.jpg");
  }
  // TATA ACE / MINI TRUCK
if (
  t.includes("tata") || 
  t.includes("ace") || 
  t.includes("ఏస్") || 
  t.includes("ఏనుగు") ||
  t.includes("mini truck")
) {
  // నీ దగ్గర ఉన్న టాటా ఏస్ ఇమేజ్ నేమ్ ఇక్కడ ఇవ్వు
  return require("@/assets/images/tataace.jpg"); 
}

  // 9. POWER SPRAYER
  if (t.includes("sprayer") || t.includes("స్ప్రేయర్")) {
    return require("@/assets/images/sprayer.jpg");
  }
  // 2. TRACTORS
  if (t.includes("tractor") || t.includes("ట్రాక్టర్")) {
    return require("@/assets/images/John-deere-Tractors..jpg");
  }
  // BULLDOZER / DOZER
if (
  t.includes("dozer") || 
  t.includes("డొజర్") || 
  t.includes("bulldozer")
) {
  // నీ దగ్గర ఉన్న డొజర్ ఇమేజ్ నేమ్ ఇక్కడ ఇవ్వు
  return require("@/assets/images/dozer.avif"); 
}

  // 10. DRONE SPRAYER
  if (t.includes("drone sprayer") || t.includes("డ్రోన్ స్ప్రేయర్")) {
    return require("@/assets/images/drone.jpg");
  }

  // 11. THRESHER
  if (t.includes("thresher") || t.includes("నూర్పిడి యంత్రం") || t.includes("థ్రెషర్")) {
    return require("@/assets/images/tresher.jpg");
  }

  // 12. BALER
  if (t.includes("baler") || t.includes("గడ్డి కట్టల మిషన్") || t.includes("బేలర్")) {
    return require("@/assets/images/baler.jpg");
  }

  // 13. JCB / BACKHOE
  if (t.includes("jcb") || t.includes("జెసిబి") || t.includes("backhoe")) {
    return require("@/assets/images/jcb.webp");
  }

  // AUTO TROLLEY / 3-WHEELER
if (
  t.includes("auto") || 
  t.includes("ఆటో") || 
  t.includes("trolley") || 
  t.includes("ట్రాలీ") ||
  t.includes("ape") ||
  t.includes("అప్పే")
) {
  // నీ దగ్గర ఉన్న ఆటో ట్రాలీ ఇమేజ్ నేమ్ ఇక్కడ ఇవ్వు
  return require("@/assets/images/auto.webp"); 
}
  // 2. CHAIN EXCAVATOR / POCLAIN (కొత్తది)
if (
  t.includes("excavator") || 
  t.includes("poclain") || 
  t.includes("పొక్లెయిన్") || 
  t.includes("ఎక్స్కవేటర్") ||
  t.includes("హిటాచి") // రైతులు హిటాచి అని కూడా పిలుస్తారు
) {
  // ఇక్కడ నీ దగ్గర ఉన్న చెయిన్ హిటాచి/పొక్లెయిన్ ఇమేజ్ నేమ్ ఇవ్వు
  return require("@/assets/images/chain.jpg"); 
}
  // 14. TIPPER / TROLLEY
  if (t.includes("tipper") || t.includes("టిప్పర్") || t.includes("trolley") || t.includes("ట్రాలీ")) {
    return require("@/assets/images/tataace.jpg");
  }

  // 15. DIGGER
  if (t.includes("digger") || t.includes("గుంతలు తీసే యంత్రం")) {
    return require("@/assets/images/digger.jpg");
  }

  // 16. LASER LAND LEVELER
  if (t.includes("laser land leveler") || t.includes("లేజర్ ల్యాండ్ లెవెలర్")) {
    return require("@/assets/images/laser.jpg");
  }

  // 17. CHAFF CUTTER
  if (t.includes("chaff cutter") || t.includes("గడ్డి కత్తిరించే యంత్రం")) {
    return require("@/assets/images/chaff.jpg");
  }

  // 20. MAIZE SHELLER
  if (t.includes("maize sheller") || t.includes("మొక్కజొన్న వొలిచే యంత్రం")) {
    return require("@/assets/images/maize.jpg");
  }
};

const equipmentOptions = [
  { en: "Tractor", te: "ట్రాక్టర్" },
  { en: "Mini Tractor / Chota Tractor", te: "మినీ ట్రాక్టర్ / చిన్న ట్రాక్టర్" },
  { en: "Power Tiller", te: "పవర్ టిల్లర్" },
  { en: "Combine Harvester", te: "కంబైన్డ్ హార్వెస్టర్ (కోత మిషన్)" },
  { en: "Paddy Transplanter", te: "వరి నాటు యంత్రం" },
  { en: "Seed Drill", te: "విత్తన గొర్రు (సీడ్ డ్రిల్)" },
  { en: "Tractor Mounted Sprayer / Machine Sprayer", te: "ట్రాక్టర్ స్ప్రేయర్ / యంత్రం స్ప్రేయర్" },
  { en: "Drone Sprayer", te: "డ్రోన్ స్ప్రేయర్" },
  { en: "Thresher", te: "నూర్పిడి యంత్రం (థ్రెషర్)" },
  { en: "Baler", te: "గడ్డి కట్టల మిషన్ (బేలర్)" },
  { en: "JCB / Backhoe", te: "జెసిబి (JCB)" },
  { en: "Bulldozer / Crawler Dozer", te: "డొజర్ / బుల్‌డొజర్ (Dozer)" },
  { en: "Chain Excavator / Poclain", te: "చెయిన్ ఎక్స్కవేటర్ / పొక్లెయిన్ (Poclain)" },
  { en: "Auto Trolley / 3-Wheeler", te: "ఆటో ట్రాలీ / అప్పే ఆటో" },
  { en: "TATA Ace / Mini Truck", te: "టాటా ఏస్ / చిన్న ఏనుగు (Mini Truck)" },
  { en: "Digger / Post Hole Digger", te: "గుంతలు తీసే యంత్రం (డిగ్గర్)" },
  { en: "Laser Land Leveler", te: "లేజర్ ల్యాండ్ లెవెలర్" },
  { en: "Chaff Cutter", te: "గడ్డి కత్తిరించే యంత్రం (చాఫ్ కట్టర్)" },
  { en: "Maize Sheller", te: "మొక్కజొన్న వొలిచే యంత్రం" },
];

const radiusOptions = [2, 5, 10, 20, 50];

export default function FindMachines() {
  const router = useRouter();
  const [language, setLanguage] = useState<"te" | "en">("en");
  const [coords, setCoords] = useState<any>(null);
  const [locationText, setLocationText] = useState("");
  const [loading, setLoading] = useState(true);
const [translatedData, setTranslatedData] = useState<any>({});
  // Filters State
  const [equipment, setEquipment] = useState("");
  
  const [searchText, setSearchText] = useState("");
const [selectedEq, setSelectedEq] = useState(""); 
  const [radius, setRadius] = useState(10);
  const [modalType, setModalType] = useState<"equipment" | "radius" | null>(null);
  const [allMachines, setAllMachines] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false); // See All బటన్ కోసం
  const [results, setResults] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
const [voiceTarget, setVoiceTarget] = useState<"equipment" | null>(null);

  useEffect(() => {
  if (language !== "te") {
    setTranslatedData({});
    return;
  }

  const translateAll = async () => {
    let newData: any = {};

    for (let item of results) {
      try {
        const translatedEquipment = await translateToTelugu(item.equipment || "");
        const translatedOwner = await translateToTelugu(item.ownerName || "");
        const translatedVillage = await translateToTelugu(item.village || "");

        const translatedOps = await Promise.all(
          (item.operations || []).map((op: string) =>
            translateToTelugu(op)
          )
        );

        newData[item.id] = {
          equipment: translatedEquipment,
          ownerName: translatedOwner,
          village: translatedVillage,
          operations: translatedOps
        };
      } catch {
        newData[item.id] = item; // fallback
      }
    }

    setTranslatedData(newData);
  };

  translateAll();
}, [results, language]);

useEffect(() => {
  if (!coords) return;
  let filtered = allMachines;

  // ఒకవేళ 'showAll' ఫాల్స్ అయ్యి, ఏదైనా యంత్రాన్ని సెలెక్ట్ చేసి ఉంటేనే ఫిల్టర్ చేయాలి
  if (selectedEq && !showAll) {
    filtered = filtered.filter(m => m.equipment === selectedEq);
  }

  const final = filtered.map(m => ({
    ...m,
    distance: getDistance(coords.latitude, coords.longitude, m.latitude, m.longitude)
  })).filter(m => m.distance <= radius).sort((a, b) => a.distance - b.distance);
  
  setResults(final);
}, [coords, selectedEq, radius, allMachines, showAll]); // showAll ని ఇక్కడ యాడ్ చేశాం

  useEffect(() => {
  (async () => {
    const l = await AsyncStorage.getItem("APP_LANG");
    const lang = l ? (l as "te" | "en") : "en";

    setLanguage(lang);
  })();
}, []);
useEffect(() => {
  if (!language) return;

  fetchLocation();
}, [language]); // 🔥 language change ayina re-run avvali
const translateToTelugu = useCallback(async (text: string) => {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0][0][0];
  } catch {
    return text;
  }
}, []);
const fetchLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocationText(
        language === "te"
          ? "లొకేషన్ అనుమతి ఇవ్వలేదు"
          : "Location permission denied"
      );
      return;
    }

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      setLocationText(
        language === "te"
          ? "GPS ఆఫ్‌లో ఉంది"
          : "GPS is turned off"
      );
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setCoords(loc.coords);

    const address = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    });

    if (address.length > 0) {
      const place = address[0];

      const village =
        place.name || place.subregion || place.city || "";

      const district =
        place.district || place.region || "";

      const fullLocation = `${village}, ${district}`;

      if (language === "te") {
        const translated = await translateToTelugu(fullLocation);
        setLocationText(translated);
      } else {
        setLocationText(fullLocation);
      }
    }
  } catch (error) {
    console.error(error);

    setLocationText(
      language === "te"
        ? "లొకేషన్ దొరకలేదు"
        : "Location not found"
    );
  }
};

const startVoice = async () => {
  try {
    // 🔥 stop previous session (IMPORTANT)
    ExpoSpeechRecognitionModule.stop();

    const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!res.granted) return;

    setVoiceTarget("equipment");
    setIsListening(true);

    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });

  } catch (e) {
    console.log("Voice error", e);
  }
};

useSpeechRecognitionEvent("result", (event) => {
  if (!isListening) return;
  if (!event.results?.length) return;

  const text = event.results[0].transcript;

  // 🔥 ONLY THIS MODAL
  if (voiceTarget === "equipment" && modalType === "equipment") {
    setSearchText(text);
  }
});

useSpeechRecognitionEvent("end", () => {
  setIsListening(false);
  setVoiceTarget(null);
});

useEffect(() => {
  return () => {
    ExpoSpeechRecognitionModule.stop();
  };
}, []);

const openInGoogleMaps = () => {
  if (coords) {
    const { latitude, longitude } = coords;
    // మ్యాప్స్‌లో ప్రస్తుత కోఆర్డినేట్స్‌ని పిన్ చేసి చూపిస్తుంది
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  } else {
    // ఒకవేళ లొకేషన్ ఇంకా రాకపోతే మళ్ళీ లొకేషన్ తెచ్చుకోమని అడుగుతాం
    fetchLocation();
  }
};

  useEffect(() => {
    const unsub = firestore().collection("machines").onSnapshot(snap => {
      setAllMachines(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

  // Distance Calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };
const ShimmerCard = () => (
  <View style={[styles.card, { height: 400, opacity: 0.6 }]}>
    {/* Image Place holder */}
    <View style={{ width: '100%', height: 280, backgroundColor: '#E5E7EB' }} />
    
    <View style={{ padding: 18 }}>
      {/* Title Placeholder */}
      <View style={{ width: '60%', height: 20, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 12 }} />
      
      {/* Location Placeholder */}
      <View style={{ width: '40%', height: 14, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 15 }} />
      
      <View style={styles.divider} />
      
      {/* Footer Placeholder */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <View style={{ width: '45%', height: 40, backgroundColor: '#E5E7EB', borderRadius: 10 }} />
        <View style={{ width: '45%', height: 40, backgroundColor: '#E5E7EB', borderRadius: 10 }} />
      </View>
    </View>
  </View>
);

  const renderItem = ({ item }: any) => (
  <View style={styles.card}>
    {/* TOP IMAGE SECTION */}
    <View style={styles.imageWrapper}>
      <Image source={getLocalImage(item.equipment)} style={styles.image} />
     <View style={styles.distBadge}>
  <Ionicons name="navigate" size={12} color="#fff" />
  <AppText style={styles.distText}>
    {item.distance.toFixed(1)} {language === "te" ? "కి.మీ దూరంలో" : "KM Away"}
  </AppText>
</View>
    </View>

    {/* CONTENT SECTION */}
    <View style={[styles.content, { borderWidth: 1, borderBottomEndRadius: 20, borderColor: "#E5E7EB", }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1,}}>
          <AppText>
{item.equipment}
</AppText>
          <View style={styles.ownerRow}>
            <Ionicons name="person-circle" size={16} color="#6B7280" />
            <AppText>
{language === "te"
  ? translatedData[item.id]?.ownerName || item.ownerName
  : item.ownerName}
</AppText>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-sharp" size={16} color="#16A34A" />
        <AppText>
{language === "te"
  ? translatedData[item.id]?.village || item.village
  : item.village}
</AppText>
      </View>

      <View style={styles.tagWrapper}>
        {item.operations?.slice(0, 3).map((op: string, i: number) => (
          <View key={i} style={styles.tag}>
            <AppText style={styles.tagText}>{op}</AppText>
          </View>
        ))}
      </View>

      {/* --- ఇక్కడ మార్పులు చేసాను బ్రో (Flex Row for Phone & Call) --- */}
      <View style={styles.divider} />
      
      <View style={styles.footerActionRow}>
        <View style={styles.phoneContainer}>
          <AppText style={styles.phoneLabel}>
            {language === "te" ? "ఫోన్ నంబర్" : "Contact Number"}
          </AppText>
          <AppText style={styles.phoneValue}>{item.phone}</AppText>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          style={styles.callFullBtn} 
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
        >
          <LinearGradient 
            colors={["#16A34A", "#15803D"]} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.callGradientFull}
          >
            <Ionicons name="call-outline" size={18} color="#fff" />
            <AppText style={styles.callBtnText}>
              {language === "te" ? "కాల్ చేయండి" : "Call Now"}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
    
  </View>

  
);
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={language === "te" ? "యంత్రాలు కనుగొనండి" : "Find Machines"}
        subtitle={language === "te" ? "వ్యవసాయాన్ని సులువు చేసుకోండి" : "Making farming easier for you"}
        language={language}
      />

      {/* FILTER CONTAINER */}
      <View style={styles.filterContainer}>
     <View style={[
  styles.locationWrapper, 
  { 
    // లొకేషన్ టెక్స్ట్‌లో కామా ఉంటేనే అది వాలిడ్ అడ్రస్ అని అర్థం (Green)
    // మిగిలిన ఏ సందర్భంలోనైనా (Permission Denied, GPS Off, Fetching) అది Red లోనే ఉంటుంది
    borderColor: (locationText.includes(",")) ? '#16A34A' : '#EF4444' 
  } 
]}>
  <Ionicons 
    name="location" 
    size={20} 
    color={(locationText.includes(",")) ? "#16A34A" : "#EF4444"} 
  />
  
  <AppText style={[
    styles.locationInput, 
    { color: (locationText.includes(",")) ? '#374151' : '#EF4444' }
  ]}>
    {/* ఇక్కడ మనం యూజర్‌కి అర్థమయ్యేలా మెసేజ్ చూపిస్తాం */}
    {locationText === "PERMISSION_DENIED" 
      ? (language === "te" ? "అనుమతి ఇవ్వలేదు" : "Permission Denied")
      : locationText === "GPS_OFF"
      ? (language === "te" ? "GPS ఆఫ్ లో ఉంది" : "GPS is Off")
      : locationText 
      ? locationText 
      : (language === "te" ? "మీ ప్రాంతం కోసం వెతుకుతోంది..." : "Fetching your location...")
    }
  </AppText>

 <TouchableOpacity onPress={openInGoogleMaps}>
  <MaterialCommunityIcons 
    name="crosshairs-gps" 
    size={20} 
    color={(locationText.includes(",")) ? "#2563EB" : "#EF4444"} 
  />
</TouchableOpacity>
</View>

        <View style={styles.rowFilters}>
          {/* EQUIPMENT BUTTON */}
          <TouchableOpacity activeOpacity={0.7}
            style={[styles.filterBtn, { flex: 2 }]} 
            onPress={() => setModalType("equipment")}
          >
            <MaterialCommunityIcons name="tractor" size={18} color="#2E7D32" />
            <AppText style={styles.btnText} numberOfLines={1}>
              {selectedEq || (language === "te" ? "యంత్రం" : "Equipment")}
            </AppText>
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
          </TouchableOpacity>

          {/* RADIUS BUTTON */}
          <TouchableOpacity 
            style={[styles.filterBtn, { flex: 1 }]} 
            onPress={() => setModalType("radius")}
          >
            <MaterialCommunityIcons name="radius-outline" size={18} color="#2E7D32" />
            <AppText style={styles.btnText}>{radius} {language === "te" ? "కి.మీ" : "KM"}</AppText>
            <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
{/* LIST SECTION */}
{locationText === "PERMISSION_DENIED" ? (
  // పర్మిషన్ ఇవ్వనప్పుడు చూపే స్క్రీన్
  <View style={styles.emptyContainer}>
    <Ionicons name="lock-closed-outline" size={60} color="#EF4444" />
    <AppText style={styles.emptyTitle}>
      {language === "te" ? "లొకేషన్ అనుమతి అవసరం" : "Location Permission Required"}
    </AppText>
    <AppText style={styles.emptySub}>
      {language === "te" 
        ? "మీకు దగ్గరలో ఉన్న యంత్రాలను చూపించడానికి లొకేషన్ పర్మిషన్ ఇవ్వండి." 
        : "Please enable location permission in settings to see nearby machines."}
    </AppText>
    <TouchableOpacity style={styles.settingsBtn} onPress={openSettings}>
      <AppText style={{color: '#fff', fontWeight: '600'}}>
        {language === "te" ? "సెట్టింగ్స్ కి వెళ్ళండి" : "Open Settings"}
      </AppText>
    </TouchableOpacity>
  </View>
) : locationText === "GPS_OFF" ? (
  // GPS ఆఫ్ చేసినప్పుడు
  <View style={styles.emptyContainer}>
    <Ionicons name="location" size={60} color="#F59E0B" />
    <AppText style={styles.emptyTitle}>
      {language === "te" ? "GPS ఆఫ్ లో ఉంది" : "GPS is Switched Off"}
    </AppText>
    <AppText style={styles.emptySub}>
      {language === "te" 
        ? "దగ్గరలోని యంత్రాలను చూపించడానికి GPS ఆన్ చేయండి."
        : "Please turn on GPS to see nearby machines."}
    </AppText>

  </View>
) : !coords ? (
  // 1. లొకేషన్ కోసం వెతుకుతున్నప్పుడు - కేవలం మెసేజ్ మాత్రమే
  <View style={styles.emptyContainer}>
    <Ionicons name="location-outline" size={50} color="#16A34A" style={{ marginBottom: 15 }} />
    <AppText style={styles.emptySub}>
      {language === "te" 
        ? "దగ్గరలోని యంత్రాలను చూపించడానికి మీ లొకేషన్ అవసరం. దయచేసి వేచి ఉండండి." 
        : "Please wait while we determine your current location."}
    </AppText>
  </View>
) : loading ? (
  // 2. లొకేషన్ వచ్చాక డేటా లోడ్ అవుతున్నప్పుడు (Shimmer Effect)
  <View style={{ padding: 16 }}>
    <ShimmerCard />
    <ShimmerCard />
    <ShimmerCard />
  </View>
) : results.length === 0 ? (
  // 3. డేటా లోడ్ అయ్యాక ఏమీ దొరకకపోతే (Empty State)
  <View style={styles.emptyContainer}>
    <Image 
      source={{ uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png" }} 
      style={styles.emptyImg} 
    />
    <AppText style={styles.emptyTitle}>
      {language === "te" ? "యంత్రాలు ఏమీ దొరకలేదు!" : "No Machines Found!"}
    </AppText>
    <AppText style={styles.emptySub}>
      {language === "te" 
        ? "మీరు ఎంచుకున్న దూరంలో ప్రస్తుతానికి ఏ యంత్రాలు లేవు. దూరాన్ని పెంచి చూడండి." 
        : "No machines found in this radius. Try increasing the distance."}
    </AppText>
  </View>
) : (

        <View style={{ flex: 1 }}> 
    {/* బటన్‌ను ఇక్కడ యాడ్ చెయ్ బ్రో, లిస్ట్ కి పైన ఉంటుంది */}
   {(selectedEq && (showAll || allMachines.length > results.length)) && (
  <TouchableOpacity 
    activeOpacity={0.8}
    style={[styles.seeAllBtn, showAll && styles.activeSeeAll]} 
    onPress={() => setShowAll(!showAll)}
  >
        <Ionicons 
          name={showAll ? "chevron-up-circle" : "apps-sharp"} 
          size={18} 
          color={showAll ? "#fff" : "#ffffff"} 
        />
       <AppText style={[styles.seeAllText, { color: showAll ? "#fff" : "#fff" }]}>
      {showAll 
        ? (language === "te" ? "ఎంచుకున్నవి మాత్రమే చూడండి" : "Show Selected Only")
        : (language === "te" 
            ? `మిగిలిన అన్ని యంత్రాలను చూడండి (${allMachines.length})` 
            : `See All Other Machines (${allMachines.length})`
          )
      }
    </AppText>
      </TouchableOpacity>
    )}

    <FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  </View>
      )}

     {/* ---------------- MODALS ---------------- */}

      {/* 1. EQUIPMENT MODAL */}
      <Modal visible={modalType === "equipment"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitleText}>
                {language === "te" ? "యంత్రం ఎంచుకోండి" : "Select Equipment"}
              </AppText>
              <TouchableOpacity onPress={() => {
  setShowAll(false);
  setModalType(null);
  setSearchText("");
}}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

          <View style={[styles.searchBar, { flexDirection: "row", alignItems: "center" }]}>

  <TextInput
    value={searchText}
    onChangeText={setSearchText}
    placeholder={language === "te" ? "వెతకండి..." : "Search..."}
    placeholderTextColor="#9CA3AF"
    cursorColor="green"
    selectionColor="green"
    style={{
      flex: 1,
      height: 50,
      fontFamily: "Mandali",
      color: "#1F2937"
    }}
  />

  <TouchableOpacity
    onPress={startVoice}
    style={{
      marginLeft: 10,
      padding: 6,
      borderRadius: 10,
      backgroundColor: "#e5e7eb"
    }}
  >
    <MaterialCommunityIcons
      name={isListening ? "microphone" : "microphone-outline"}
      size={20}
      color={isListening ? "#EF4444" : "#2E7D32"}
    />
  </TouchableOpacity>

</View>

            <FlatList
              data={equipmentOptions.filter(item => 
                (language === "te" ? item.te : item.en).toLowerCase().includes(searchText.toLowerCase())
              )}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedEq(language === "te" ? item.te : item.en); // 🔥 ఇక్కడ సెలెక్ట్ చేస్తున్నాం
                    setModalType(null);
                    setSearchText("");
                  }}
                >
                  <AppText>{language === "te" ? item.te : item.en}</AppText>
                  {selectedEq === (language === "te" ? item.te : item.en) && (
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 2. RADIUS MODAL */}
      <Modal visible={modalType === "radius"} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalType(null)}
        >
          <View style={[styles.modalContent, { height: 'auto', paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitleText}>
                {language === "te" ? "దూరం ఎంచుకోండి" : "Select Distance"}
              </AppText>
            </View>
            
            <View style={styles.radiusGrid}>
              {radiusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.radiusOption, radius === opt && styles.activeRadius]}
                  onPress={() => {
                    setRadius(opt);
                    setModalType(null);
                  }}
                >
                  <AppText style={[styles.radiusText, radius === opt && styles.activeRadiusText]}>
                    {opt} {language === "te" ? "కి.మీ" : "KM"}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      

      <AgriLoader visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F6F7F6" },

  // FILTER CONTAINER
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 10,
  },
  locationWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff', // వైట్ బ్యాక్‌గ్రౌండ్ అయితే బోర్డర్ బాగా కనిపిస్తుంది
  paddingHorizontal: 12,
  height: 52,
  borderRadius: 15,
  borderWidth: 1.5, // బోర్డర్ కొంచెం థిక్ గా ఉంచాను
  marginBottom: 12,
  // Shadow for premium look
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 5,
},
locationInput: {
  flex: 1,
  fontSize: 14,
  color: '#374151',
  fontWeight: '600', // టెక్స్ట్ కొంచెం బోల్డ్ గా ఉంటే బాగుంటుంది
},
card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imageWrapper: { width: "100%", height: 280, position: 'relative' },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  distBadge: { 
  position: 'absolute', 
  top: 15, 
  right: 15, 
  backgroundColor: 'rgba(0,0,0,0.65)', 
  paddingHorizontal: 12, // కొంచెం పెంచాను
  paddingVertical: 6, 
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5
},
distText: { 
  color: '#fff', 
  fontSize: 11, // టెక్స్ట్ ఫిట్ అవ్వడానికి 11 లేదా 12 పెట్టుకో బ్రో
  fontWeight: '600'
},
settingsBtn: {
  backgroundColor: '#16A34A',
  paddingHorizontal: 25,
  paddingVertical: 12,
  borderRadius: 12,
  marginTop: 20,
  elevation: 3
},
  divider: { 
    height: 1, 
    backgroundColor: '#F3F4F6', 
    marginVertical: 12 
  },
  footerActionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    gap: 15
  },
  phoneContainer: { 
    flex: 1 
  },
  phoneLabel: { 
    fontSize: 10, 
    color: '#9CA3AF', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  phoneValue: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1F2937' 
  },
  callFullBtn: { 
    flex: 1, // కాల్ బటన్ కొంచెం పెద్దగా ఉండటానికి
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#16A34A',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  callGradientFull: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 10,
    gap: 8 
  },
  callBtnText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 14 
  },
  content: { padding: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 19, fontWeight: "600", color: "#1F2937" },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 },
  ownerText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  infoText: { fontSize: 14, color: "#4B5563", fontWeight: '500' },
  
  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  tag: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  tagText: { fontSize: 11, color: '#166534', fontWeight: '600' },
  phoneDisplay: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginLeft: 'auto' },
 
  modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 20,
  alignItems: "center"
},

modalTitleText: {
  fontSize: 18,
  fontWeight: "600"
},

searchBar: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F3F4F6",
  margin: 20,
  borderRadius: 18,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: "#E5E7EB"
},

searchInput: {
  height: 50
},

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },

  modalContent: {
    backgroundColor: "#fff",
    height: "60%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },

  // ROW FILTERS (Eq & Radius)
  rowFilters: {
    flexDirection: 'row',
    gap: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginLeft: 8,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    height: 45,
    borderRadius: 12,
    justifyContent: 'space-between'
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#374151', marginHorizontal: 6 },
 
  cardImg: { width: '100%', height: 160, backgroundColor: '#E5E7EB' },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eqTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },

  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locText: { fontSize: 13, color: '#6B7280', marginLeft: 4, flex: 1 },
  opsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  opTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  opTagText: { fontSize: 11, color: '#4B5563' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
 
radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
    justifyContent: 'center'
  },
  radiusOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: '28%',
    alignItems: 'center'
  },
  activeRadius: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563'
  },
  activeRadiusText: {
    color: '#166534'
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyImg: { width: 100, height: 100, opacity: 0.5, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#374151' },
  emptySub: { textAlign: 'center', color: '#6B7280', marginTop: 8, lineHeight: 20 },
  categoryItem: {
  padding: 18,
  flexDirection: "row",
  justifyContent: "space-between",
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6"
},
seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b6b06', // Light Green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 15,
    gap: 8,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  activeSeeAll: {
    backgroundColor: '#0b6b06', // నొక్కినప్పుడు Dark Green
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "Mandali" // నీ ఫాంట్ పేరు
  },
});