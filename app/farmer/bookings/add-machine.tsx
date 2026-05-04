import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// 🔥 ఇక్కడ MapView ఇంపోర్ట్ చేశాం
import MapView from "react-native-maps";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from "expo-speech-recognition";

export default function AddMachine() {

  const router = useRouter();
  const { machineId } = useLocalSearchParams(); 
  const isEditing = !!machineId; 
  const [language, setLanguage] = useState<"te" | "en">("en");
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [equipment, setEquipment] = useState("");
  const [operations, setOperations] = useState<string[]>([]);
  const [modalType1, setModalType1] = useState<"operations" | null>(null);
  const [modalType, setModalType] = useState<"equipment" | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({ visible: false, type: "success", message: "" });
  const [successModal, setSuccessModal] = useState(false);
  const [coords, setCoords] = useState<any>(null);
  const [locationText, setLocationText] = useState(
    language === "te" ? "స్థానాన్ని పొందుతోంది..." : "Fetching location..."
  );
  const [loading, setLoading] = useState(false);

  // 🔥 Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  /* ---------------- LANGUAGE ---------------- */
  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
  }, []);

  /* ---------------- AUTO-FILL LOGIC ---------------- */
  useEffect(() => {
    if (isEditing) {
      fetchMachineData();
    }
  }, [machineId]);

  const fetchMachineData = async () => {
    if (!machineId) return;
    setLoading(true);
    try {
      const doc = await firestore()
        .collection("machines")
        .doc(machineId as string)
        .get();

      const data = doc.data(); 
      if (data) {
        setOwnerName(data.ownerName || "");
        setPhone(data.phone || "");
        setEquipment(data.equipment || "");
        setOperations(data.operations || []);
        setLocationText(data.village || "");
        
        if (data.latitude && data.longitude) {
          setCoords({ 
            latitude: data.latitude, 
            longitude: data.longitude 
          });
        }
      }
    } catch (e) {
      console.log("Fetch Error:", e);
    }
    setLoading(false);
  };

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

  /* ---------------- LOCATION LOGIC ---------------- */
  // 1. Coords నుండి Address తెచ్చే ఫంక్షన్ (Map డ్రాగ్ చేసినప్పుడు కూడా వాడతాం)
  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    try {
      setLocationText(language === "te" ? "స్థానాన్ని పొందుతోంది..." : "Fetching location...");
      const address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      
      if (!address || address.length === 0) {
        setLocationText(language === "te" ? "లొకేషన్ వివరాలు దొరకలేదు" : "Location details not found");
        return;
      }

      const place = address[0];
      const village = place?.name || place?.subregion || place?.city || "";
      const district = place?.district || place?.region || "";
      const fullLocation = `${village}, ${district}`;

      if (language === "te") {
        try {
          const translated = await translateToTelugu(fullLocation);
          setLocationText(translated || fullLocation);
        } catch {
          setLocationText(fullLocation);
        }
      } else {
        setLocationText(fullLocation);
      }
    } catch (error) {
      setLocationText(language === "te" ? "లొకేషన్ పొందడంలో లోపం" : "Error getting location");
    }
  };

  // 2. ప్రస్తుత GPS తెచ్చే ఫంక్షన్
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationText(language === "te" ? "లొకేషన్ అనుమతి ఇవ్వలేదు" : "Location permission denied");
        return;
      }
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationText(language === "te" ? "GPS ఆఫ్‌లో ఉంది" : "GPS is turned off");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setCoords(loc.coords);
      fetchAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      setLocationText(language === "te" ? "లొకేషన్ దొరకలేదు" : "Location not found");
    }
  };

  // 3. Map Dragging ఆపినప్పుడు
  const handleRegionChangeComplete = (region: any) => {
    setCoords({ latitude: region.latitude, longitude: region.longitude });
    fetchAddressFromCoords(region.latitude, region.longitude);
  };

  useEffect(() => {
    if (!isEditing) {
      fetchLocation();
    }
  }, [language]);

  const startVoice = async (target: string) => {
    try {
      ExpoSpeechRecognitionModule.stop();
      const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!res.granted) return;
      setVoiceTarget(target);
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
    switch (voiceTarget) {
      case "name": setOwnerName(text); break;
      case "phone": setPhone(text.replace(/\D/g, "")); break;
      case "equipment": setSearchText(text); break;
      case "operations": setSearchText(text); break;
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setVoiceTarget(null);
  });

  useEffect(() => {
    return () => { ExpoSpeechRecognitionModule.stop(); };
  }, []);

  /* ---------------- OPTIONS ---------------- */
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
  const operationsOptions = [
    { en: "Ploughing / Tilling", te: "దున్నడం (దుక్కి)" },
    { en: "Puddling", te: "దమ్ము చేయడం" },
    { en: "Sowing / Seeding", te: "విత్తనాలు వేయడం" },
    { en: "Transplanting", te: "నాట్లు వేయడం" },
    { en: "Rotavator Work", te: "రోటావేటర్ పని" },
    { en: "Cultivation", te: "గుంటక / గొర్రు తోలడం" },
    { en: "Spraying", te: "మందు పిచికారీ (స్ప్రేయింగ్)" },
    { en: "Harvesting", te: "పంట కోత" },
    { en: "Threshing", te: "నూర్పిడి చేయడం" },
    { en: "Land Levelling", te: "సమతలీకరణ (లెవలింగ్)" },
    { en: "Trenching / Digging", te: "కాలువలు / గుంతలు తీయడం" },
    { en: "Loading & Transport", te: "లోడింగ్ మరియు రవాణా" },
    { en: "Local Transport (Small Loads)", te: "స్థానిక రవాణా (చిన్న సరుకులు)" },
    { en: "Vegetable & Fruit Transport", te: "కూరగాయలు మరియు పండ్ల రవాణా" },
    { en: "Water Tanker / Can Transport", te: "నీటి ట్యాంకర్ లేదా క్యాన్ల రవాణా" },
    { en: "Pesticide & Seed Transport", te: "మందులు మరియు విత్తనాల రవాణా" },
    { en: "Straw Baling", te: "గడ్డి కట్టలు కట్టడం" },
    { en: "Crop Transport (Market)", te: "పంటను మార్కెట్‌కి తరలించడం" },
    { en: "Fertilizer & Seed Transport", te: "ఎరువులు మరియు విత్తనాల రవాణా" },
    { en: "Fodder / Straw Transport", te: "గడ్డి మరియు పశుగ్రాసం రవాణా" },
    { en: "Farm Material Transport", te: "వ్యవసాయ సామాగ్రి రవాణా" },
    { en: "Grass Cutting", te: "గడ్డి కోయడం" },
    { en: "Large Scale Spraying (Tractor)", te: "పెద్ద ఎత్తున మందు పిచికారీ (ట్రాక్టర్ ద్వారా)" },
    { en: "Orchard / Fruit Tree Spraying", te: "తోటలు మరియు పండ్ల చెట్లకు పిచికారీ" },
    { en: "High Pressure Spraying", te: "అధిక పీడనంతో పిచికారీ (High Pressure)" },
    { en: "Pest & Disease Control", te: "పురుగులు మరియు తెగుళ్ల నివారణ" },
    { en: "Land Leveling & Grading", te: "భూమిని చదును చేయడం (లెవలింగ్)" },
    { en: "Pushing Soil & Debris", te: "మట్టి మరియు వ్యర్థాలను నెట్టడం" },
    { en: "Farm Road Construction", te: "పొలం బాటలు / రోడ్లు వేయడం" },
    { en: "Bush & Forest Clearing", te: "పొదల మరియు అడవి ప్రాంతాల శుభ్రత" },
    { en: "Land Clearing & Leveling", te: "భూమి చదును చేయడం / చుట్టుపక్కల శుభ్రం" },
    { en: "Stump & Tree Removal", te: "మొద్దులు మరియు చెట్లను తొలగించడం" },
    { en: "Canal & Pond Digging", te: "కాలువలు మరియు చెరువులు తవ్వడం" },
    { en: "Large Stone Breaking / Removal", te: "పెద్ద రాళ్లను పగులగొట్టడం / తొలగించడం" },
  ];

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!ownerName || !phone || !equipment || operations.length === 0 || !coords) {
      let errorMsg = language === "te" ? "దయచేసి అన్ని వివరాలను నింపండి" : "Please fill all details";
      if (!coords) {
        errorMsg = language === "te" ? "లొకేషన్ ఇంకా దొరకలేదు, దయచేసి ఆగండి!" : "Location not found, please wait!";
      }
      setStatusModal({ visible: true, type: "warning", message: errorMsg });
      return;
    }

    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone) return;

    setLoading(true);

    try {
      const machineData = {
        ownerName,
        phone,
        equipment,
        operations,
        latitude: coords.latitude,
        longitude: coords.longitude,
        village: locationText,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (isEditing) {
        await firestore().collection("machines").doc(machineId as string).update(machineData);
      } else {
        await firestore().collection("machines").add({
          ...machineData,
          userId: userPhone,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      setLoading(false);
      setSuccessModal(true);

    } catch (e) {
      setLoading(false);
      setStatusModal({
        visible: true,
        type: "error",
        message: language === "te" ? "సర్వర్ సమస్య, మళ్ళీ ప్రయత్నించండి." : "Server error, please try again."
      });
    }
  };

  const filteredEquipment = equipmentOptions.filter(item => {
    const value = (language === "te" ? item.te : item.en).toLowerCase().trim();
    return (value || "").includes(searchText.toLowerCase().trim());
  });

  const filteredOperations = operationsOptions.filter(item => {
    const value = (language === "te" ? item.te : item.en).toLowerCase().trim();
    return (value || "").includes(searchText.toLowerCase().trim());
  });

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={isEditing 
          ? (language === "te" ? "వివరాలు సవరించండి" : "Edit Machine") 
          : (language === "te" ? "యంత్రం జోడించండి" : "Add Machine")
        }
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter details"}
        language={language}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            
            {/* 👤 NAME INPUT */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => nameRef.current?.focus()}
              style={[styles.inputBox, activeInput === "name" && styles.inputFocused]}
            >
              <Ionicons name="person-outline" size={20} color={ownerName ? "#2E7D32" : "#9CA3AF"} />
              <View style={styles.inputWrapper}>
                {!ownerName && activeInput !== "name" && (
                  <AppText style={styles.placeholder}>
                    {language === "te" ? "యజమాని పేరు*" : "Owner Name*"}
                  </AppText>
                )}
                <TextInput
                  ref={nameRef}
                  value={ownerName}
                  onChangeText={setOwnerName}
                  style={styles.input}
                  cursorColor={'green'}
                  onFocus={() => setActiveInput("name")}
                  onBlur={() => setActiveInput(null)}
                />
              </View>
              <TouchableOpacity onPress={() => startVoice("name")}  style={styles.voiceBtn}>
                <MaterialCommunityIcons name={isListening && voiceTarget === "name" ? "microphone" : "microphone-outline"} size={20} color={isListening && voiceTarget === "name" ? "#EF4444" : "#2E7D32"} />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 📞 PHONE INPUT */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => phoneRef.current?.focus()}
              style={[styles.inputBox, activeInput === "phone" && styles.inputFocused]}
            >
              <Ionicons name="call-outline" size={20} color={phone ? "#2E7D32" : "#9CA3AF"} />
              <View style={styles.inputWrapper}>
                {!phone && activeInput !== "phone" && (
                  <AppText style={styles.placeholder}>
                    {language === "te" ? "ఫోన్ నంబర్*" : "Phone Number*"}
                  </AppText>
                )}
                <TextInput
                  ref={phoneRef}
                  value={phone}
                  onChangeText={setPhone}
                  cursorColor={'green'}
                  keyboardType="numeric"
                  maxLength={10}
                  style={styles.input}
                  onFocus={() => setActiveInput("phone")}
                  onBlur={() => setActiveInput(null)}
                />
              </View>
            </TouchableOpacity>

            {/* 🚜 EQUIPMENT SELECT */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.inputBox, activeInput === "equipment" && styles.inputFocused]}
              onPress={() => { setModalType("equipment"); setActiveInput("equipment"); }}
            >
              <MaterialCommunityIcons name="tractor-variant" size={22} color={equipment || activeInput === "equipment" ? "#2E7D32" : "#9CA3AF"} />
              <View style={styles.inputWrapper}>
                <AppText style={{ color: equipment ? "#1F2937" : "#9CA3AF" }}>
                  {equipment || (language === "te" ? "యంత్రం ఎంచుకోండి*" : "Select Equipment*")}
                </AppText>
              </View>
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* ⚙️ OPERATIONS */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.inputBox, activeInput === "operations" && styles.inputFocused]}
              onPress={() => { setModalType1("operations"); setActiveInput("operations"); }}
            >
              <Ionicons name="options-outline" size={20} color={operations.length ? "#2E7D32" : "#9CA3AF"} />
              <View style={styles.inputWrapper}>
                <AppText style={{ color: operations.length ? "#1F2937" : "#9CA3AF" }}>
                  {operations.length
                    ? `${operations.length} ${language === "te" ? "ఎంపిక చేయబడ్డాయి" : "Selected"}`
                    : (language === "te" ? "పనులు ఎంచుకోండి*" : "Select Operations*")}
                </AppText>
              </View>
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* SELECTED CHIPS */}
            {operations.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <AppText style={styles.selectedTitle}>
                  {language === "te" ? "ఎంచుకున్న పనులు" : "Selected Operations"}
                </AppText>
                <View style={styles.chipsContainer}>
                  {operations.map((op, index) => (
                    <View key={index} style={styles.chipBox}>
                      <AppText style={styles.chipText}>{op}</AppText>
                      <TouchableOpacity onPress={() => setOperations(prev => prev.filter(i => i !== op))}>
                        <Ionicons name="close-circle" size={18} color="#166534" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 📍 LOCATION (Blue Button for Map) */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setShowMapModal(true)}
              style={[styles.inputBox, !coords && { borderColor: '#FCA5A5' }]}
            >
              <Ionicons name="location" size={20} color={coords ? "#16A34A" : "#EF4444"} />
              <View style={styles.inputWrapper}>
                <AppText style={{ color: coords ? "#1F2937" : "#EF4444", fontSize: 14 }} numberOfLines={1}>
                  {locationText}
                </AppText>
              </View>
              <View style={styles.blueMapBtn}>
                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#2563EB" />
              </View>
            </TouchableOpacity>

            {/* ⚠️ LOCATION WARNING NOTE */}
            <View style={styles.locationNoteBox}>
              <Ionicons name="information-circle-outline" size={16} color="#B91C1C" />
              <AppText style={styles.locationNoteText}>
                {language === "te" 
                  ? "గమనిక: మెషీన్ ఉన్న చోట నుండి మాత్రమే వివరాలను నమోదు చేయండి. మీ లొకేషన్ మార్చుకోవడానికి పైనున్న బ్లూ బటన్ ని నొక్కండి." 
                  : "Note: Add details only when you are at the machine's location. Click the blue map icon above to adjust your location manually."}
              </AppText>
            </View>

            {/* SAVE BUTTON */}
            <TouchableOpacity activeOpacity={0.8} style={styles.saveBtn} onPress={handleSave}>
              <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
                <AppText style={styles.saveText}>
                  {isEditing ? (language === "te" ? "సవరించండి" : "Update Machine") : (language === "te" ? "భద్రపరచండి" : "Save Machine")}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------------- SWIGGY STYLE DRAGGABLE MAP MODAL ---------------- */}
      <Modal visible={showMapModal} animationType="fade" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {coords && (
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false} 
              onRegionChangeComplete={handleRegionChangeComplete}
            />
          )}

          {/* 📍 Fixed Center Pin */}
          <View style={styles.centerPinWrapper} pointerEvents="none">
            <Ionicons name="location-sharp" size={46} color="#DC2626" />
          </View>

          {/* 🔙 Simple Back Button */}
          <SafeAreaView style={styles.mapTopArea}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowMapModal(false)} style={styles.simpleBackBtn}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* 📍 Locate Me Button */}
          <TouchableOpacity activeOpacity={0.8} style={styles.simpleLocateBtn} onPress={fetchLocation}>
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#111827" />
          </TouchableOpacity>

          {/* 💳 Minimal Bottom Sheet */}
          <View style={styles.minimalBottomCard}>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={24} color="#16A34A" />
              <AppText style={styles.minimalAddress} numberOfLines={2}>
                {locationText}
              </AppText>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.minimalConfirmBtn} onPress={() => setShowMapModal(false)}>
              <AppText style={styles.minimalConfirmText}>
                {language === "te" ? "నిర్ధారించండి" : "Confirm Location"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EQUIPMENT MODAL */}
      <Modal visible={modalType === "equipment"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitleText}>
                {language === "te" ? "యంత్రం ఎంచుకోండి" : "Select Equipment"}
              </AppText>
              <TouchableOpacity onPress={() => { setModalType(null); setSearchText(""); }}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={[styles.searchBar, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, marginTop: 10 }]}>
              <TextInput
                autoFocus
                placeholder={language === "te" ? "వెతకండి..." : "Search equipment..."}
                value={searchText}
                placeholderTextColor="#9CA3AF"
                cursorColor="#2E7D32"
                onChangeText={(text) => setSearchText(text)}
                style={[styles.searchInput, { fontFamily: "Mandali", color: "#1F2937", fontSize: 15 }]}
              />
              <TouchableOpacity onPress={() => startVoice("equipment")} style={styles.voiceBtnSearch}>
                <MaterialCommunityIcons name={isListening && voiceTarget === "equipment" ? "microphone" : "microphone-outline"} size={20} color={isListening && voiceTarget === "equipment" ? "#EF4444" : "#2E7D32"} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredEquipment}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => { setEquipment(language === "te" ? item.te : item.en); setModalType(null); setSearchText(""); }}
                >
                  <AppText>{language === "te" ? item.te : item.en}</AppText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}><AppText style={{ color: '#9CA3AF' }}>{language === "te" ? "ఏమీ దొరకలేదు" : "No results found"}</AppText></View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* OPERATIONS MODAL */}
      <Modal visible={modalType1 === "operations"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitleText}>
                {language === "te" ? "పనులు ఎంచుకోండి" : "Select Operations"}
              </AppText>
              <TouchableOpacity onPress={() => setModalType1(null)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={[styles.searchBar, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, marginTop: 10 }]}>
              <TextInput
                autoFocus
                placeholder={language === "te" ? "టైప్ చేయండి..." : "Type operation..."}
                value={searchText}
                placeholderTextColor="#9CA3AF"
                cursorColor="#2E7D32"
                onChangeText={(text) => setSearchText(text)}
                style={[styles.searchInput, { fontFamily: "Mandali", color: "#1F2937" }]}
              />
              <TouchableOpacity onPress={() => startVoice("operations")} style={styles.voiceBtnSearch}>
                <MaterialCommunityIcons name={isListening && voiceTarget === "operations" ? "microphone" : "microphone-outline"} size={20} color={isListening && voiceTarget === "operations" ? "#EF4444" : "#2E7D32"} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredOperations}
              keyExtractor={(item, i) => i.toString()}
              renderItem={({ item }) => {
                const label = language === "te" ? item.te : item.en;
                const selected = operations.includes(label);
                return (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setOperations(prev => selected ? prev.filter(i => i !== label) : [...prev, label]);
                    }}
                  >
                    <AppText>{label}</AppText>
                    <Ionicons name={selected ? "checkbox" : "square-outline"} size={22} color={selected ? "#16A34A" : "#9CA3AF"} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={statusModal.visible} transparent animationType="fade">
        <View style={styles.statusOverlay}>
          <View style={styles.statusContent}>
            <View style={[styles.iconCircle, { backgroundColor: statusModal.type === "warning" ? "#FFFBEB" : "#F0FDF4" }]}>
              <Ionicons name={statusModal.type === "warning" ? "alert-circle" : "checkmark-circle"} size={50} color={statusModal.type === "warning" ? "#F59E0B" : "#16A34A"} />
            </View>
            <AppText style={styles.statusTitle}>
              {statusModal.type === "warning" ? (language === "te" ? "గమనిక!" : "Attention!") : (language === "te" ? "విజయం!" : "Success!") }
            </AppText>
            <AppText style={styles.statusDescription}>{statusModal.message}</AppText>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.statusActionBtn, { backgroundColor: statusModal.type === "warning" ? "#F59E0B" : "#16A34A" }]} 
              onPress={() => setStatusModal({ ...statusModal, visible: false })}
            >
              <AppText style={styles.statusActionText}>{language === "te" ? "సరే, అర్థమైంది" : "OK, Got it"}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-done-circle" size={60} color="#16A34A" />
            </View>
            <AppText style={styles.successTitle}>{language === "te" ? "విజయం!" : "Success!"}</AppText>
            <AppText style={styles.successMsg}>
              {isEditing
                ? (language === "te" ? "మీ యంత్ర వివరాలు విజయవంతంగా నవీకరించబడ్డాయి!" : "Your machine details updated successfully!")
                : (language === "te" ? "మీ యంత్రం నమోదు అయింది! రైతులు ఇప్పుడు మిమ్మల్ని కనుగొని సంప్రదించగలరు." : "Your machine is registered! Farmers can now find and contact you.")}
            </AppText>
            <View style={{ width: "100%" }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.successBtn, { backgroundColor: "#0a7130" }]}
                onPress={() => {
                  setSuccessModal(false);
                  router.replace("/farmer/bookings");
                }}
              >
                <AppText style={styles.successBtnText}>{language === "te" ? "పూర్తయింది" : "Done"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AgriLoader visible={loading} type="saving" language={language} />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  scrollContainer: { paddingBottom: 40 },
  container: { padding: 20 },
  
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 58,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  inputFocused: { borderColor: "#2E7D32" },
  inputWrapper: { flex: 1, justifyContent: "center", marginLeft: 10 },
  input: { fontSize: 16, fontFamily: "Mandali" },
  placeholder: { position: "absolute", left: 0, fontSize: 16, color: "#9CA3AF" },

  // 🔥 NEW BLUE MAP BTN STYLE
  blueMapBtn: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 10,
    marginLeft: 10
  },

  voiceBtn: { marginLeft: 10, padding: 6, borderRadius: 50, backgroundColor: "#f0f9f3" },
  voiceBtnSearch: { marginLeft: 10, padding: 6, borderRadius: 10, backgroundColor: "#E5E7EB" },

  saveBtn: { marginTop: 20, borderRadius: 18, overflow: "hidden" },
  saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16 },

  selectedTitle: { fontSize: 13, color: "#6B7280", marginBottom: 6, marginLeft: 4 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap" },
  chipBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 13, color: "#166534", marginRight: 6 },
  
  categoryItem: { padding: 18, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },

  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" },
  modalTitleText: { fontSize: 18, fontWeight: "600" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", margin: 20, borderRadius: 18, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  searchInput: { flex: 1, height: 50 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", height: "60%", borderTopLeftRadius: 25, borderTopRightRadius: 25 },

  locationNoteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FEE2E2', marginHorizontal: 4 },
  locationNoteText: { fontSize: 12, color: '#B91C1C', marginLeft: 6, flex: 1, fontFamily: "Mandali" },

  // 🔥 MINIMAL MAP STYLES
  centerPinWrapper: { position: 'absolute', top: '50%', left: '50%', marginTop: -40, marginLeft: -23, zIndex: 1, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  mapTopArea: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 50, left: 20 },
  simpleBackBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  simpleLocateBtn: { position: 'absolute', bottom: 160, right: 20, width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  minimalBottomCard: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20, elevation: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  minimalAddress: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 26, fontFamily: "Mandali" },
  minimalConfirmBtn: { backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  minimalConfirmText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: "Mandali" },

  statusOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
  statusContent: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: 30, padding: 25, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  statusTitle: { fontSize: 22, fontWeight: "600", color: "#1F2937", marginBottom: 10, fontFamily: "Mandali" },
  statusDescription: { fontSize: 16, textAlign: "center", color: "#6B7280", lineHeight: 24, marginBottom: 25, fontFamily: "Mandali", paddingHorizontal: 10 },
  statusActionBtn: { width: "100%", height: 55, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  statusActionText: { color: "#fff", fontSize: 17, fontWeight: "600", fontFamily: "Mandali" },
  
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 20 },
  successBox: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: 28, padding: 25, alignItems: "center" },
  successIcon: { marginBottom: 15 },
  successTitle: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  successMsg: { textAlign: "center", color: "#6B7280", marginBottom: 20, lineHeight: 22 },
  successBtn: { height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  successBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" }
});