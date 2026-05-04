import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

export default function AddVehicle() {
  const router = useRouter();
  const { vehicleId, name: paramName, type: paramType, number: paramNumber } = useLocalSearchParams();
const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [type, setType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [modalType, setModalType] = useState<"vehicle" | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [errorType, setErrorType] = useState<"validation" | "duplicate" | null>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const numberRef = useRef<TextInput>(null);

  const vehicleOptions = [
    { en: "Tractor", te: "ట్రాక్టర్" },
    { en: "Mini Tractor", te: "మినీ ట్రాక్టర్" },
    { en: "Combine Harvester", te: "కంబైన్ హార్వెస్టర్" },
    { en: "Power Tiller", te: "పవర్ టిల్లర్" },
    { en: "Tractor Trailer", te: "ట్రాక్టర్ ట్రైలర్" },
    { en: "Tata Ace (Chhota Hathi)", te: "టాటా ఏస్ / చిన్న ఏనుగు" },
    { en: "Mahindra Bolero Pickup", te: "మహీంద్రా బొలెరో పికప్" },
    { en: "Ashok Leyland Dost", te: "అశోక్ లేలాండ్ దోస్త్" },
    { en: "Auto Rickshaw (Trolley Auto)", te: "ట్రాలీ ఆటో" },
    { en: "Seven Seater / Passenger Auto", te: "ప్యాసింజర్ ఆటో" },
    { en: "Bullock Cart", te: "ఎద్దుల బండి" },
    { en: "JCB / Backhoe Loader", te: "జెసిబి" },
    { en: "Dozer", te: "డోజర్" },
    { en: "Tipper Truck", te: "టిప్పర్ లారీ" },
  ];
const filteredVehicles = vehicleOptions.filter(item => {
  const value = (language === "te" ? item.te : item.en)
    .toLowerCase()
    .trim();

  return value.includes(searchText.toLowerCase().trim());
});


const formatVehicleNumber = (value: string) => {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // AP13HU1232 → AP 13 HU 1232
  const match = clean.match(/^([A-Z]{2})(\d{2})([A-Z]{2})(\d{4})$/);

  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }

  return clean; // partial typing case
};

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      if (activeInput === "name") setName(transcript);
      else if (activeInput === "number") setVehicleNumber(transcript.toUpperCase().replace(/\s/g, ''));
      else if (activeInput === "modal") { setSearchText(transcript); setType(transcript); }
    }
  });

  useSpeechRecognitionEvent("end", () => setIsListening(false));

  const handleVoiceInput = async (target: string) => {
    setActiveInput(target);
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });
  };

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => { if (l) setLanguage(l as any); });
  }, []);

useEffect(() => {
  if (vehicleId) {
    setName((paramName as string) || "");
    setType((paramType as string) || "");
    setVehicleNumber((paramNumber as string) || "");
  }
}, [vehicleId]);

  const handleSave = async () => {
   if (saving) return; // 🔥 FIRST LINE

setSaving(true);

if (!name.trim() || !type.trim()) {
  setErrorType("validation");
  setShowValidationModal(true);
  setSaving(false); // 🔥 ADD
  return;
}

    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) {
  setSaving(false); // 🔥 ADD
  return;
}
    const userDoc = await firestore()
  .collection("users")
  .doc(phone)
  .get();

const activeSession = userDoc.data()?.activeSession;
if (!activeSession) return;
   


    const existing = await firestore()
  .collection("users")
  .doc(phone)
  .collection("vehicles")
  .where("number", "==", vehicleNumber.trim())
  .where("session", "==", activeSession)
  .get();
if (!existing.empty && !vehicleId) {
  setErrorType("duplicate");
  setShowValidationModal(true);
  setSaving(false); // 🔥 ADD THIS
  return;
}

 setLoading(true);
const cleanNumber = vehicleNumber.replace(/\s/g, "");

const isValid = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(cleanNumber);

if (!isValid) {
  setErrorType("validation");
  setShowValidationModal(true);
  setSaving(false);
  return;
}
const data = {
  nickname: name.trim(),
  type,
  number: cleanNumber,
  session: activeSession, // 🔥 MUST ADD
  createdAt: firestore.FieldValue.serverTimestamp()
};
    try {
    
      const col = firestore().collection("users").doc(phone).collection("vehicles");
      if (vehicleId) await col.doc(vehicleId as string).update(data);
      else await col.add(data);
      router.back();
    }  catch (e) {
  console.log(e);
} finally {
  setLoading(false);
  setSaving(false); // 🔥 IMPORTANT
}
  };

const formatDisplay = (num: string) => {
  const match = num.match(/^([A-Z]{2})(\d{2})([A-Z]{2})(\d{4})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : num;
};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={vehicleId ? (language === "te" ? "వాహనం సవరించు" : "Edit Vehicle") : (language === "te" ? "వాహనం చేర్చండి" : "Add Vehicle")}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter vehicle details"}
        language={language}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          {/* 🚜 VEHICLE NAME */}
          <View style={[styles.inputBox, activeInput === "name" && styles.inputFocused]}>
            <MaterialCommunityIcons name="tractor" size={22} color={type ? "#2E7D32" : "#9CA3AF"}/>
            <View style={styles.inputWrapper}>
              {!name && (
                <AppText pointerEvents="none" style={styles.customPlaceholder}>
                  {language === "te" ? "వాహనం పేరు (ముద్దు పేరు)*" : "Vehicle Name (Nickname)*"}
                </AppText>
              )}
              <TextInput
                ref={nameRef}
                value={name}
                onChangeText={setName}
                onFocus={() => setActiveInput("name")}
                onBlur={() => setActiveInput(null)}
                style={[styles.input, { fontFamily: 'Mandali' }]}
                cursorColor="#16A34A"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("name")}  style={{
      marginLeft: 10,
      padding: 5,
      borderRadius: 50,
      backgroundColor: "#f0f9f3"
    }}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "name" ? "microphone" : "microphone-outline"} 
                size={22} color={isListening && activeInput === "name" ? "#EF4444" : "#2E7D32"} 
              />
            </TouchableOpacity>
          </View>

          {/* 🔢 VEHICLE NUMBER */}
          <View style={[styles.inputBox, activeInput === "number" && styles.inputFocused]}>
            <Ionicons name="card-outline" size={20} color={type ? "#2E7D32" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              {!vehicleNumber && (
                <AppText pointerEvents="none" style={styles.customPlaceholder}>
                  {language === "te" ? "వాహనం నంబర్" : "Vehicle Number"}
                </AppText>
              )}
              <TextInput
                ref={numberRef}
                value={vehicleNumber}
                onChangeText={(text) => {
  const formatted = formatVehicleNumber(text);
  setVehicleNumber(formatted);
}}
                onFocus={() => setActiveInput("number")}
                onBlur={() => setActiveInput(null)}
                style={[styles.input, { textTransform: "uppercase", fontFamily: 'Mandali' }]}
                autoCapitalize="characters"
                cursorColor="#16A34A"
              />
            </View>
          </View>

          {/* 🔽 VEHICLE TYPE */}
          <View style={[styles.inputBox, modalType && styles.inputFocused]}>
            <MaterialCommunityIcons name="forklift" size={22} color={type ? "#2E7D32" : "#9CA3AF"} />
            <TouchableOpacity activeOpacity={0.7} style={styles.inputWrapper} onPress={() => setModalType("vehicle")}>
              <AppText style={{ color: type ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
                {type || (language === "te" ? "వాహనం రకం ఎంచుకోండి*" : "Select Type*")}
              </AppText>
            </TouchableOpacity>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </View>

          {/* SAVE BUTTON */}
         <TouchableOpacity
  activeOpacity={0.85}
  style={[styles.saveBtn]}
  onPress={handleSave}
  disabled={saving} // 🔥 ADD THIS
>
            <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
              <AppText style={styles.saveText}>
                {vehicleId ? (language === "te" ? "సవరించండి" : "Update Vehicle") : (language === "te" ? "భద్రపరచండి" : "Save Vehicle")}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* VALIDATION MODAL */}
      <Modal visible={showValidationModal} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconBg}><Ionicons name="warning-outline" size={32} color="#F59E0B" /></View>
            <AppText style={styles.alertTitle}>
  {errorType === "duplicate"
    ? (language === "te" ? "ఇప్పటికే ఉంది" : "Already Exists")
    : (language === "te" ? "వివరాలు అవసరం" : "Missing Details")}
</AppText>
<AppText style={styles.alertSub}>
  {errorType === "duplicate"
    ? (language === "te"
        ? "ఈ వాహనం ఇప్పటికే ఉంది"
        : "This vehicle already exists")
    : (language === "te"
        ? "దయచేసి * అన్ని వివరాలు నమోదు చేయండి"
        : "Please enter all * details")}
</AppText>
            <TouchableOpacity activeOpacity={0.8} style={styles.alertBtn} onPress={() => setShowValidationModal(false)}>
              <AppText style={styles.alertBtnText}>{language === "te" ? "సరే" : "OK"}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VEHICLE TYPE MODAL */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitleText}>{language === "te" ? "వాహనం ఎంచుకోండి" : "Select Vehicle"}</AppText>
              <TouchableOpacity onPress={() => { setModalType(null); setActiveInput(null); }}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <TextInput
                autoFocus
               placeholder={language === "te" ? "ఇక్కడ రాయండి..." : "Type here..."}
                value={searchText}
                cursorColor={'green'}
                placeholderTextColor={'black'}
               onChangeText={(text) => setSearchText(text)}
                style={[styles.searchInput, { fontFamily: "Mandali", flex: 1 }]}
              />
              {searchText.trim().length > 0 && (
  <TouchableOpacity
    onPress={() => {
      setType(searchText);
      setModalType(null);
      setSearchText("");
      setActiveInput(null);
    }}
    style={{
      backgroundColor: "#16A34A",
      borderRadius: 12,
      padding: 6,
      marginLeft: 6
    }}
  >
    <Ionicons name="add" size={20} color="#fff" />
  </TouchableOpacity>
)}
              <TouchableOpacity onPress={() => handleVoiceInput("modal")}   style={{
      marginLeft: 10,
      padding: 6,
      borderRadius: 10,
      backgroundColor: "#E5E7EB"
    }}>
                <MaterialCommunityIcons 
                  name={isListening && activeInput === "modal" ? "microphone" : "microphone-outline"} 
                  size={22} color={isListening && activeInput === "modal" ? "#EF4444" : "#2E7D32"} 
                />
              </TouchableOpacity>
            </View>

            <FlatList
            data={filteredVehicles}
              keyExtractor={(_, i) => i.toString()}
              ListEmptyComponent={() =>
  searchText.trim().length > 0 ? (
    <TouchableOpacity
      style={[styles.categoryItem, { alignItems: "center" }]}
      onPress={() => {
        setType(searchText);
        setModalType(null);
        setSearchText("");
        setActiveInput(null);
      }}
    >
       <AppText style={{ color: '#16A34A', fontWeight: '600' }}>
      
                            {language === "te" ? `"${searchText}" ని చేర్చండి +` : `Add "${searchText}" +`}
      
                          </AppText>
    </TouchableOpacity>
  ) : null
}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setType(language === "te" ? item.te : item.en);
                    setModalType(null);
                    setSearchText("");
                    setActiveInput(null);
                  }}
                >
                  <AppText>{language === "te" ? item.te : item.en}</AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <AgriLoader visible={loading} type="saving" language={language} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
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
  inputWrapper: { flex: 1, height: '100%', justifyContent: "center", marginLeft: 10 },
  input: { flex: 1, fontSize: 16, color: "#1F2937", height: '100%' },
  customPlaceholder: { position: "absolute", fontSize: 16, color: "#9CA3AF" },
  micBtn: { padding: 8, backgroundColor: '#F9FAFB', borderRadius: 12, marginLeft: 5 },
  saveBtn: { marginTop: 20, borderRadius: 18, overflow: "hidden" },
  saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25, height: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" },
  modalTitleText: { fontSize: 18, fontWeight: "600" },
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
  searchInput: { height: 50, fontSize: 16 },
  categoryItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalOverlayCenter: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  alertBox: { width: "85%", backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center" },
  alertIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFBEB", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  alertTitle: { fontSize: 20, fontWeight: "600" },
  alertSub: { fontSize: 15, color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 24 },
  alertBtn: { width: "100%", backgroundColor: "#2E7D32", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  alertBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});