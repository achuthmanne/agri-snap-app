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
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); 
  
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
    { en: "Seven Seater / Passenger Auto", te: "ప్యాసింజర్ auto" },
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

  // 🔥 SMART NUMBER FORMATTER LOGIC
  const formatVehicleNumber = (text: string) => {
    // Spaces తీసేసి ప్రాసెస్ చేస్తున్నాం
    let val = text.toUpperCase().replace(/\s/g, "");
    let result = "";

    // 1. స్టేట్ కోడ్ (AP / TS - 2 అక్షరాలు మాత్రమే)
    const stateCode = val.match(/^[A-Z]{1,2}/);
    if (stateCode) {
      result += stateCode[0];
      val = val.substring(stateCode[0].length);
    } else if (val.length > 0) {
      return ""; // అక్షరం కాకుండా నంబర్ టైప్ చేస్తే తీసుకోదు
    }

    // 2. స్టేట్ కోడ్ పూర్తయ్యాక, నంబర్ కి వెళ్లాలి
    if (result.length === 2) {
      const rtoCode = val.match(/^\d{1,2}/);
      if (rtoCode) {
        result += " " + rtoCode[0]; // ఆటోమేటిక్ స్పేస్
        val = val.substring(rtoCode[0].length);
      } else if (val.length > 0) {
        return result; // ఇక్కడ అక్షరాలు టైప్ చేస్తే ఆపేస్తుంది
      }

      // 3. RTO కోడ్ పూర్తయ్యాక సిరీస్ (లేదా) పాత ఫార్మాట్ నంబర్స్ కి వెళ్లాలి
      if (rtoCode && rtoCode[0].length === 2) {
        const series = val.match(/^[A-Z]{1,2}/);
        if (series) {
          result += " " + series[0]; // ఆటోమేటిక్ స్పేస్
          val = val.substring(series[0].length);

          // చివర్లో 4 అంకెలు
          const numbers = val.match(/^\d{1,4}/);
          if (numbers) {
            result += " " + numbers[0];
          }
        } else {
          // ఒకవేళ అక్షరాలు లేని పాత బండి నంబర్ అయితే (Ex: AP 16 1234)
          const numbers = val.match(/^\d{1,4}/);
          if (numbers) {
            result += " " + numbers[0];
          }
        }
      }
    }
    return result;
  };

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      if (activeInput === "name") {
        setName(transcript);
        if (errors.name) setErrors({ ...errors, name: "" });
      }
      else if (activeInput === "number") {
        // వాయిస్ తో చెప్పినా కూడా ఫార్మాట్ అయ్యేలా సెట్ చేశాం
        setVehicleNumber(formatVehicleNumber(transcript));
        if (errors.number) setErrors({ ...errors, number: "" });
      }
      else if (activeInput === "modal") { 
        setSearchText(transcript); 
        setType(transcript); 
      }
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
      // ఓపెన్ అయినప్పుడు కూడా కరెక్ట్ ఫార్మాట్ లో ఉండేలా
      setVehicleNumber(formatVehicleNumber((paramNumber as string) || ""));
    }
  }, [vehicleId]);

  const handleSave = async () => {
    if (saving) return; 

    const newErrors: any = {};
    if (!name.trim()) newErrors.name = language === "te" ? "వాహనం పేరు నమోదు చేయండి*" : "Enter Vehicle Name*";
    if (!type.trim()) newErrors.type = language === "te" ? "వాహనం రకం ఎంచుకోండి*" : "Select Vehicle Type*";
    
    const cleanNumber = vehicleNumber.replace(/\s/g, "");
    if (!cleanNumber) {
        newErrors.number = language === "te" ? "వాహనం నంబర్ నమోదు చేయండి*" : "Enter Vehicle Number*";
    } else {
        // 🔥 ఫైనల్ వాలిడేషన్: కనీసం 8 క్యారెక్టర్స్ పక్కాగా ఉండాలి (AP16 1234 లేదా AP16 CD 1234)
        const isValid = /^[A-Z]{2}\d{2}[A-Z]{0,2}\d{4}$/.test(cleanNumber);
        if (!isValid) {
            newErrors.number = language === "te" ? "పూర్తి నంబర్ (ఉదా: AP 16 CD 1234) ఇవ్వండి*" : "Enter full number (Ex: AP 16 CD 1234)*";
        }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    
    setSaving(true);

    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) {
      setSaving(false); 
      return;
    }
    const userDoc = await firestore().collection("users").doc(phone).get();
    const activeSession = userDoc.data()?.activeSession;
    if (!activeSession) return;
    
    // DUPLICATE CHECK
    const existing = await firestore()
      .collection("users")
      .doc(phone)
      .collection("vehicles")
      .where("number", "==", cleanNumber)
      .where("session", "==", activeSession)
      .get();
      
    if (!existing.empty && !vehicleId) {
      setErrorType("duplicate");
      setShowValidationModal(true);
      setSaving(false); 
      return;
    }

    setLoading(true);
    
    const data = {
      nickname: name.trim(),
      type,
      number: cleanNumber,
      session: activeSession, 
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    
    try {
      const col = firestore().collection("users").doc(phone).collection("vehicles");
      if (vehicleId) await col.doc(vehicleId as string).update(data);
      else await col.add(data);
      router.back();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setSaving(false); 
    }
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
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.inputBox,
              activeInput === "name" && styles.inputFocused,
              errors.name && styles.inputError
            ]}
            onPress={() => {
              setActiveInput("name");
              nameRef.current?.focus();
            }}
          >
            <MaterialCommunityIcons name="tractor" size={22} color={name || activeInput === "name" ? "#16A34A" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              {!name && activeInput !== "name" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>
                  {language === "te" ? "వాహనం పేరు (ముద్దు పేరు)*" : "Vehicle Name (Nickname)*"}
                </AppText>
              )}
              <TextInput
                ref={nameRef}
                value={name}
                onChangeText={(txt) => {
                  setName(txt);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                onFocus={() => setActiveInput("name")}
                onBlur={() => setActiveInput(null)}
                style={[styles.input, { fontFamily: 'Mandali', display: (name || activeInput === "name") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("name")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "name" ? "microphone" : "microphone-outline"} 
                size={24} 
                color={isListening && activeInput === "name" ? "#EF4444" : (activeInput === "name" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {errors.name && <AppText style={styles.errorText} language={language}>{errors.name}</AppText>}

          {/* 🔢 VEHICLE NUMBER */}
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.inputBox,
              activeInput === "number" && styles.inputFocused,
              errors.number && styles.inputError
            ]}
            onPress={() => {
              setActiveInput("number");
              numberRef.current?.focus();
            }}
          >
            <Ionicons name="card-outline" size={20} color={vehicleNumber || activeInput === "number" ? "#16A34A" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              {!vehicleNumber && activeInput !== "number" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>
                  {language === "te" ? "వాహనం నంబర్ (Ex: AP 16 CD 1234)*" : "Vehicle Number (Ex: AP 16 CD 1234)*"}
                </AppText>
              )}
              <TextInput
                ref={numberRef}
                value={vehicleNumber}
                onChangeText={(text) => {
                  const formatted = formatVehicleNumber(text);
                  setVehicleNumber(formatted);
                  if (errors.number) setErrors({ ...errors, number: "" });
                }}
                onFocus={() => setActiveInput("number")}
                onBlur={() => setActiveInput(null)}
                style={[
                  styles.input, 
                  { textTransform: "uppercase", fontFamily: 'Mandali', display: (vehicleNumber || activeInput === "number") ? "flex" : "none" }
                ]}
                autoCapitalize="characters"
                maxLength={13} // 🔥 AP 16 CD 1234 (13 chars with spaces)
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("number")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "number" ? "microphone" : "microphone-outline"} 
                size={24} 
                color={isListening && activeInput === "number" ? "#EF4444" : (activeInput === "number" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {errors.number && <AppText style={styles.errorText} language={language}>{errors.number}</AppText>}

          {/* 🔽 VEHICLE TYPE */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.inputBox,
              modalType === "vehicle" && styles.inputFocused,
              errors.type && styles.inputError
            ]}
            onPress={() => {
              setModalType("vehicle");
              setActiveInput("type");
              if (errors.type) setErrors({ ...errors, type: "" });
            }}
          >
            <MaterialCommunityIcons name="forklift" size={22} color={type || modalType === "vehicle" ? "#16A34A" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              <AppText style={{ color: type ? "#1F2937" : "#9CA3AF", fontFamily: "Mandali" }}>
                {type || (language === "te" ? "వాహనం రకం ఎంచుకోండి*" : "Select Type*")}
              </AppText>
            </View>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          {errors.type && <AppText style={styles.errorText} language={language}>{errors.type}</AppText>}

          {/* SAVE BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.saveBtn]}
            onPress={handleSave}
            disabled={saving} 
          >
            <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
              <AppText style={styles.saveText}>
                {vehicleId ? (language === "te" ? "సవరించండి" : "Update Vehicle") : (language === "te" ? "భద్రపరచండి" : "Save Vehicle")}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* VALIDATION MODAL FOR DUPLICATES ONLY */}
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
                    ? "ఈ వాహనం ఇప్పటికే మీ ఖాతాలో ఉంది"
                    : "This vehicle already exists in your account")
                : (language === "te"
                    ? "దయచేసి వివరాలు సరిగ్గా నమోదు చేయండి"
                    : "Please check your entered details")}
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
                cursorColor={'#16A34A'}
                placeholderTextColor={'#9CA3AF'}
                onChangeText={(text) => setSearchText(text)}
                style={[styles.searchInput, { fontFamily: "Mandali", flex: 1, color: "#1F2937" }]}
              />
              {searchText.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setType(searchText);
                    setModalType(null);
                    setSearchText("");
                    setActiveInput(null);
                  }}
                  style={{ backgroundColor: "#16A34A", borderRadius: 12, padding: 6, marginLeft: 6 }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              {/* 🎤 MODAL MIC */}
              <TouchableOpacity onPress={() => handleVoiceInput("modal")} style={{ marginLeft: 10, padding: 6, borderRadius: 10, backgroundColor: "#E5E7EB" }}>
                <MaterialCommunityIcons 
                  name={isListening && activeInput === "modal" ? "microphone" : "microphone-outline"} 
                  size={20} 
                  color={isListening && activeInput === "modal" ? "#EF4444" : "#16A34A"} 
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
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB"
  },
  inputFocused: {
    borderColor: "#16A34A",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Mandali",
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 4,
  },
  micBtn: {
    marginLeft: 10,
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "Mandali",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
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