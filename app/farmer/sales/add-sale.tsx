// app/farmer/sales/add-sale.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList, Keyboard,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useIsFocused } from "@react-navigation/native";

// URL params helper
const getStr = (val: string | string[] | undefined) => (Array.isArray(val) ? val[0] : val || "");

export default function AddSale() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isScreenFocused = useIsFocused(); // 🔥 Lifecycle Fixes

  const editId = getStr(params.editId);

  // 🔥 INSTANT DATA LOAD FROM PARAMS
  const [crop, setCrop] = useState(getStr(params.crop));
  const [quantity, setQuantity] = useState(getStr(params.qty));
  const [unit, setUnit] = useState(getStr(params.unit) || "kg");
  const [rate, setRate] = useState(getStr(params.rate));

  const [modalType, setModalType] = useState<"crop" | null>(null);
  const [searchText, setSearchText] = useState("");
  const [unitOpen, setUnitOpen] = useState(false);
  
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); 
  const [isListening, setIsListening] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<"crop" | null>(null);
  
  const [userCrops, setUserCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"te" | "en">("te");

  const unitMapping: any = {
    "gm": "గ్రాములు",
    "kg": "కిలోలు",
    "quintal": "క్వింటాల్",
    "ton": "టన్ను"
  };

  const unitOptions = ["gm", "kg", "quintal", "ton"];

  const qtyRef = useRef<TextInput>(null);
  const rateRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });

    const loadUserCrops = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) return;

      const userDoc = await firestore().collection("users").doc(phone).get();
      const activeSession = userDoc.data()?.activeSession;
      if (!activeSession) return; 

      const snap = await firestore()
        .collection("users").doc(phone).collection("fields")
        .where("session", "==", activeSession) 
        .get();

      const set = new Set<string>();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.crop) set.add(data.crop);
      });
      setUserCrops(Array.from(set));
    };
    loadUserCrops();
  }, []);

  const startVoice = async () => {
    try {
      ExpoSpeechRecognitionModule.stop(); // Safe restart
      const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!res.granted) return;
      setVoiceTarget("crop");
      setIsListening(true);
      ExpoSpeechRecognitionModule.start({ lang: language === "te" ? "te-IN" : "en-US", interimResults: true });
    } catch (e) { console.log(e); }
  };

  useSpeechRecognitionEvent("result", (event) => {
    if (!isListening) return;
    const text = event.results?.[0]?.transcript;
    // 🔥 Punctuation bug fix
    if (text && voiceTarget === "crop" && modalType === "crop") {
      setSearchText(text.replace(/[.,?!]/g, "").trim());
    }
  });

  useSpeechRecognitionEvent("end", () => setIsListening(false));

  // 🔥 Cleanup listener to prevent memory leaks
  useEffect(() => {
    if (!isScreenFocused) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    }
    return () => {
      ExpoSpeechRecognitionModule.stop();
    };
  }, [isScreenFocused]);

  // 🔥 Safe Calculation
  const total = (Number(quantity) || 0) * (Number(rate) || 0);

  const filteredCrops = userCrops.filter(c =>
    c.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const handleSave = async () => {
    Keyboard.dismiss(); // 🔥 Close keyboard on save
    if (loading) return;

    const newErrors: any = {};
    if (!crop.trim()) newErrors.crop = language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop Name*";
    if (!quantity) newErrors.quantity = language === "te" ? "పరిమాణం నమోదు చేయండి*" : "Enter Quantity*";
    if (!rate) newErrors.rate = language === "te" ? "ధర నమోదు చేయండి*" : "Enter Rate*";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;

    setLoading(true);
    try {
      const userDoc = await firestore().collection("users").doc(phone).get();
      const activeSession = userDoc.data()?.activeSession;
      if (!activeSession) { setLoading(false); return; }

      const data = {
        crop: crop.trim(),
        quantity: Number(quantity),
        unit,
        rate: Number(rate),
        total: total,
        session: activeSession, 
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const ref = firestore().collection("users").doc(phone).collection("sales");
      if (editId) await ref.doc(editId).update(data);
      else await ref.add(data);

      router.back();
    } catch (e) { console.log(e); }
    finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={editId ? (language === "te" ? "అమ్మకం సవరించు" : "Edit Sale") : (language === "te" ? "అమ్మకం చేర్చండి" : "Add Sale")}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter Details"}
        language={language}
      />

      <KeyboardAwareScrollView 
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
      >
        
        {/* 🌾 CROP BOX */}
        <TouchableOpacity
          style={[styles.inputBox, activeInput === "crop" && styles.inputFocused, errors.crop && styles.inputError]}
          activeOpacity={1}
          onPress={() => {
            setModalType("crop");
            setActiveInput("crop");
            if (errors.crop) setErrors({ ...errors, crop: "" });
          }}
        >
          <Ionicons name="leaf-outline" size={20} color={crop ? "#16A34A" : "#9CA3AF"} />
          <View style={styles.inputWrapper}>
            <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF", fontSize: 16, fontFamily: "Mandali" }}>
              {crop || (language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.crop && <AppText style={styles.errorText} language={language}>{errors.crop}</AppText>}

        {/* 📋 HINT */}
        <View style={styles.cropHintBox}>
          <Ionicons name="bulb" size={18} color="#059669" />
          <AppText style={styles.cropHintText} language={language}>
            {language === "te"
              ? "సూచన: ప్రధాన పంట పేరునే ఎంచుకోండి (ఉదా: వరి తాలు అమ్మినా 'వరి' అని ఎంచుకోండి)."
              : "Tip: Select the main crop name even for variants (e.g., select 'Paddy' for Paddy Thalu)."}
          </AppText>
        </View>

        {/* 📦 QTY & UNIT ROW */}
        <View style={{ flexDirection: "row", gap: 10, zIndex: 10 }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={[styles.inputBox, { marginBottom: 0 }, activeInput === "qty" && styles.inputFocused, errors.quantity && styles.inputError]}
              activeOpacity={1}
              onPress={() => {
                setActiveInput("qty");
                setUnitOpen(false);
                setTimeout(() => qtyRef.current?.focus(), 50); 
              }}
            >
              <Ionicons name="cube-outline" size={20} color={quantity ? "#16A34A" : "#9CA3AF"} />
              <View style={styles.inputWrapper}>
                {!quantity && activeInput !== "qty" && (
                  <AppText style={styles.placeholder}>{language === "te" ? "పరిమాణం*" : "Quantity*"}</AppText>
                )}
                <TextInput
                  ref={qtyRef}
                  value={quantity}
                  cursorColor="#16A34A"
                  selectionColor="#16A34A40"
                  onChangeText={(txt) => {
                    setQuantity(txt);
                    if (errors.quantity) setErrors({ ...errors, quantity: "" });
                  }}
                  style={[styles.input, { display: (quantity || activeInput === "qty") ? "flex" : "none" }]}
                  keyboardType="numeric"
                  onFocus={() => { setActiveInput("qty"); setUnitOpen(false); }}
                  onBlur={() => setActiveInput(null)}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.unitBox} onPress={() => { Keyboard.dismiss(); setUnitOpen(!unitOpen); }}>
            <AppText style={{fontSize: 15, color: "#1F2937", fontFamily: "Mandali"}} language={language}>
              {language === "te" ? unitMapping[unit] : unit}
            </AppText>
            <Ionicons name="chevron-down" size={16} color="#4B5563" />
          </TouchableOpacity>

          {unitOpen && (
            <View style={styles.dropdown}>
              {unitOptions.map((u) => (
                <TouchableOpacity key={u} style={styles.dropdownItem} onPress={() => { setUnit(u); setUnitOpen(false); }}>
                  <AppText language={language}>{language === "te" ? unitMapping[u] : u}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {errors.quantity && <AppText style={[styles.errorText, { marginTop: 4 }]} language={language}>{errors.quantity}</AppText>}

        {/* 💰 RATE BOX */}
        <TouchableOpacity
          style={[styles.inputBox, { marginTop: errors.quantity ? 10 : 16 }, activeInput === "rate" && styles.inputFocused, errors.rate && styles.inputError]}
          activeOpacity={1}
          onPress={() => {
            setActiveInput("rate");
            setUnitOpen(false);
            setTimeout(() => rateRef.current?.focus(), 50);
          }}
        >
          <Ionicons name="cash-outline" size={20} color={rate ? "#16A34A" : "#9CA3AF"} />
          <View style={styles.inputWrapper}>
            {!rate && activeInput !== "rate" && (
              <AppText style={styles.placeholder}>
                {language === "te" ? `ధర (1 ${unitMapping[unit]} కు)*` : `Rate (per 1 ${unit})*`}
              </AppText>
            )}
            <TextInput
              ref={rateRef}
              value={rate}
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              onChangeText={(txt) => {
                setRate(txt);
                if (errors.rate) setErrors({ ...errors, rate: "" });
              }}
              style={[styles.input, { display: (rate || activeInput === "rate") ? "flex" : "none" }]}
              keyboardType="numeric"
              onFocus={() => { setActiveInput("rate"); setUnitOpen(false); }}
              onBlur={() => setActiveInput(null)}
            />
          </View>
        </TouchableOpacity>
        {errors.rate && <AppText style={styles.errorText} language={language}>{errors.rate}</AppText>}

        {/* 💎 TOTAL BOX */}
        <View style={styles.totalBox}>
          <AppText style={styles.totalLabel} language={language}>{language === "te" ? "మొత్తం రాబడి" : "Total Revenue"}</AppText>
          <AppText style={styles.totalValue}>₹ {total.toLocaleString('en-IN')}</AppText>
        </View>

        {/* 💾 SAVE BTN */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
          <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveInner}>
            <AppText style={styles.saveText} language={language}>
              {editId ? (language === "te" ? "సవరించండి" : "Update Sale") : (language === "te" ? "భద్రపరచండి" : "Save Sale")}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>

      </KeyboardAwareScrollView>

      {/* 🟢 LOADER */}
      <AgriLoader visible={loading} type={editId ? "updating" : "saving"} language={language} />

      {/* 🌾 MODAL */}
      <Modal visible={modalType === "crop"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={{ fontSize: 18, fontWeight: "600" }} language={language}>{language === "te" ? "పంటను ఎంచుకోండి" : "Select Crop"}</AppText>
              <TouchableOpacity onPress={() => { setModalType(null); setActiveInput(null); ExpoSpeechRecognitionModule.stop(); setIsListening(false); }}>
                <Ionicons name="close-circle" size={30} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <TextInput
                autoFocus
                value={searchText}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
                placeholderTextColor={"black"}
                onChangeText={setSearchText}
                placeholder={language === "te" ? "పంట పేరు టైప్ చేయండి..." : "Search crop..."}
                style={[styles.searchInput, { fontFamily: 'Mandali' }]}
              />
              <TouchableOpacity onPress={startVoice} style={{ marginLeft: 8, padding: 6, borderRadius: 10, backgroundColor: "#eaedf2" }}>
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#EF4444" : "#16A34A"} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredCrops}
              keyboardShouldPersistTaps="handled" // 🔥 Important fix
              ListEmptyComponent={() => {
                  if (modalType === "crop") {
                      return (
                          <View style={{ padding: 20, alignItems: "center" }}>
                              <View style={{ padding: 20, alignItems: 'center' }}>
                                  <Ionicons name="information-circle-outline" size={24} color="#6B7280" style={{ marginBottom: 10 }} />
                                  <AppText style={{ color: "#4B5563", textAlign: "center", fontSize: 15, fontWeight: '500', lineHeight: 22 }}>
                                      {language === "te" ? "మొదట 'నా పొలాలు' విభాగంలో\nపంట వివరాలను నమోదు చేయండి." : "First, register your crop details in the\n'My Fields' section."}
                                  </AppText>
                                  <AppText style={{ color: "#9CA3AF", textAlign: "center", fontSize: 13, marginTop: 8 }}>
                                      {language === "te" ? "అక్కడ జోడించిన పంటలు మాత్రమే ఇక్కడ కనిపిస్తాయి." : "Only crops added there will appear here for selection."}
                                  </AppText>
                                  <TouchableOpacity
                                      activeOpacity={0.85}
                                      onPress={() => { setModalType(null); router.push("/farmer/fields"); }}
                                      style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16A34A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
                                  >
                                      <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                      <AppText style={{ color: "#fff", fontWeight: "600" }}>
                                          {language === "te" ? "పంట జోడించండి" : "Add Crop"}
                                      </AppText>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      );
                  }
                  return null;
              }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => { setCrop(item); setModalType(null); setActiveInput(null); ExpoSpeechRecognitionModule.stop(); setIsListening(false); }}>
                  <AppText style={styles.itemText}>{item}</AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  inputBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 16,
    borderWidth: 1, borderColor: "#D1D5DB"
  },
  inputFocused: { borderColor: "#16A34A", backgroundColor: "#FFFFFF", elevation: 2 },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 12, fontFamily: "Mandali", marginTop: -12, marginBottom: 12, marginLeft: 4 },
  inputWrapper: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  input: { flex: 1, fontSize: 16, color: "#1F2937", fontFamily: "Mandali" },
  placeholder: { position: "absolute", fontSize: 16, color: "#9CA3AF", fontFamily: "Mandali" },
  unitBox: { width: 100, height: 55, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 4, backgroundColor: "#fff" },
  dropdown: { position: "absolute", top: 60, right: 0, width: 110, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", elevation: 5, zIndex: 1000 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6" },
  totalBox: { marginTop: 10, padding: 18, backgroundColor: "#fff", borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#D1D5DB" },
  totalLabel: { fontSize: 12, color: "#6B7280", textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 28, fontWeight: "800", color: "#16A34A", marginTop: 4 },
  saveBtn: { marginTop: 30, borderRadius: 16, overflow: "hidden", elevation: 4 },
  saveInner: { height: 58, justifyContent: "center", alignItems: "center" },
  saveText: { color: "white", fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", height: "70%", borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: "center" },
  searchBar: { flexDirection: "row", margin: 20, backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 12, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemText: { fontSize: 17, fontFamily: "Mandali" },
  cropHintBox: { backgroundColor: "#F0FDF4", padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', gap: 10, borderLeftWidth: 4, borderLeftColor: '#059669' },
  cropHintText: { flex: 1, fontSize: 13, color: "#166534", lineHeight: 18 },
});