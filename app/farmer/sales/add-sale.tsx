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

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function AddSale() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const [modalType, setModalType] = useState<"crop" | null>(null);
  const [searchText, setSearchText] = useState("");
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [rate, setRate] = useState("");
  const [unitOpen, setUnitOpen] = useState(false);
  
  // 🔥 STANDARD PATTERN STATES
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
    const loadUserCrops = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) return;

      const userDoc = await firestore().collection("users").doc(phone).get();
      const activeSession = userDoc.data()?.activeSession;

      if (!activeSession) return; 

      const snap = await firestore()
        .collection("users")
        .doc(phone)
        .collection("fields")
        .where("session", "==", activeSession) 
        .get();

      const set = new Set<string>();

      snap.forEach(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        if (data.crop) set.add(data.crop);
      });

      setUserCrops(Array.from(set));
    };

    loadUserCrops();
  }, []);

  const startVoice = async () => {
    try {
      ExpoSpeechRecognitionModule.stop(); 
      const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!res.granted) return;

      setVoiceTarget("crop");
      setIsListening(true);

      ExpoSpeechRecognitionModule.start({
        lang: language === "te" ? "te-IN" : "en-US",
        interimResults: true,
      });

    } catch (e) {
      console.log("voice error", e);
    }
  };

  useSpeechRecognitionEvent("result", (event) => {
    if (!isListening) return;
    if (!event.results?.length) return;

    const text = event.results[0].transcript;

    if (voiceTarget === "crop" && modalType === "crop") {
      setSearchText(text);
      setCrop(text); 
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

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
  }, []);

  const filteredCrops = userCrops.filter(c =>
    c.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  useEffect(() => {
    if (!editId) return;
    if (loading) return; 
    const load = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) return;

      const doc = await firestore()
        .collection("users")
        .doc(phone)
        .collection("sales")
        .doc(editId as string)
        .get();

      const data = doc.data();
      if (data) {
        setCrop(data.crop);
        setQuantity(String(data.quantity));
        setUnit(data.unit);
        setRate(String(data.rate));
      }
    };
    load();
  }, [editId]);

  const total = (Number(quantity) || 0) * (Number(rate) || 0);

  const handleSave = async () => {
    if (loading) return;
    Keyboard.dismiss();

    // 🔥 INLINE VALIDATION
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
      const userDoc = await firestore()
        .collection("users")
        .doc(phone)
        .get();

      const activeSession = userDoc.data()?.activeSession;

      if (!activeSession) {
        setLoading(false);
        return;
      }

      const totalVal = (Number(quantity) || 0) * (Number(rate) || 0);

      const data = {
        crop: crop.trim(),
        quantity: Number(quantity),
        unit,
        rate: Number(rate),
        total: totalVal,
        session: activeSession, 
        createdAt: firestore.FieldValue.serverTimestamp(),
        localCreatedAt: Date.now()
      };

      if (editId) {
        await firestore()
          .collection("users")
          .doc(phone)
          .collection("sales")
          .doc(editId as string)
          .update(data);
      } else {
        await firestore()
          .collection("users")
          .doc(phone)
          .collection("sales")
          .add(data);
      }

      router.back();

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={editId
          ? (language === "te" ? "అమ్మకం సవరించు" : "Edit Sale")
          : (language === "te" ? "అమ్మకం చేర్చండి" : "Add Sale")}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter Details"}
        language={language}
      />

      <View style={styles.container}>
        
        {/* 🌾 CROP */}
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
            <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF", fontFamily: "Mandali" }}>
              {crop || (language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.crop && <AppText style={styles.errorText} language={language}>{errors.crop}</AppText>}

        {/* 🔥 CROP HELP INFO */}
        <View style={styles.cropHintBox}>
          <View style={styles.hintHeader}>
            <Ionicons name="bulb" size={18} color="#059669" />
            <AppText style={styles.hintTitle}>
              {language === "te" ? "సూచన:" : "Tip:"}
            </AppText>
          </View>
          <AppText style={styles.cropHintText}>
            {language === "te"
              ? "పంటకు సంబంధించిన ఇతర రకాలు (ఉదా: తాలు కాయ, మిర్చి) అమ్మినప్పుడు కూడా అదే పంట పేరునే ఎంచుకోండి."
              : "For related variants (e.g., Mirchi Thalu, Chilli), please select the main crop name."}
          </AppText>
          <View style={styles.exampleBadge}>
            <AppText style={styles.exampleText}>
              {language === "te" ? "ఉదాహరణ: వరి (వరి తాలు)" : "Eg: Paddy (Paddy Variants)"}
            </AppText>
          </View>
        </View>

        {/* 📦 QUANTITY & UNIT */}
        <View style={{ zIndex: 10, marginTop: 10 }}> 
          <View style={{ flexDirection: "row", gap: 10 }}>
            
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={[styles.inputBox, { marginBottom: 0 }, activeInput === "qty" && styles.inputFocused, errors.quantity && styles.inputError]}
                activeOpacity={1}
                // 🔥 BUG FIX: Added setActiveInput("qty") here so it renders "flex" BEFORE focusing
                onPress={() => {
                  setActiveInput("qty");
                  setUnitOpen(false);
                  setTimeout(() => qtyRef.current?.focus(), 50); // Small delay ensures display: flex is applied
                }}
              >
                <Ionicons name="cube-outline" size={20} color={quantity ? "#16A34A" : "#9CA3AF"} />
                <View style={styles.inputWrapper}>
                  {!quantity && activeInput !== "qty" && (
                    <AppText style={styles.placeholder}>
                      {language === "te" ? "పరిమాణం*" : "Quantity*"}
                    </AppText>
                  )}
                  <TextInput
                    ref={qtyRef}
                    value={quantity}
                    onChangeText={(txt) => {
                      setQuantity(txt);
                      if (errors.quantity) setErrors({ ...errors, quantity: "" });
                    }}
                    style={[styles.input, { display: (quantity || activeInput === "qty") ? "flex" : "none" }]}
                    cursorColor="#16A34A"
                    selectionColor="#16A34A40"
                    keyboardType="numeric"
                    onFocus={() => { setActiveInput("qty"); setUnitOpen(false); }}
                    onBlur={() => setActiveInput(null)}
                  />
                </View>
              </TouchableOpacity>
              {errors.quantity && <AppText style={[styles.errorText, { marginTop: 4, marginBottom: 0 }]} language={language}>{errors.quantity}</AppText>}
            </View>

            <TouchableOpacity
              style={styles.unitBox}
              onPress={() => {
                Keyboard.dismiss();
                setUnitOpen(!unitOpen);
              }}
            >
              <AppText style={{fontSize: 15, color: "#1F2937", fontFamily: "Mandali"}}>
                  {language === "te" ? unitMapping[unit] : unit}
              </AppText>
              <Ionicons name="chevron-down" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* 🔥 FLOATING DROPDOWN */}
          {unitOpen && (
            <View style={styles.dropdown}>
              {unitOptions.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setUnit(u);
                    setUnitOpen(false);
                  }}
                >
                  <AppText>{language === "te" ? unitMapping[u] : u}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 💰 RATE */}
        <TouchableOpacity
          style={[styles.inputBox, { marginTop: errors.quantity ? 10 : 16 }, activeInput === "rate" && styles.inputFocused, errors.rate && styles.inputError]}
          activeOpacity={1}
          // 🔥 BUG FIX: Added setActiveInput("rate") here
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
              onChangeText={(txt) => {
                setRate(txt);
                if (errors.rate) setErrors({ ...errors, rate: "" });
              }}
              style={[styles.input, { display: (rate || activeInput === "rate") ? "flex" : "none" }]}
              keyboardType="numeric"
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              onFocus={() => { setActiveInput("rate"); setUnitOpen(false); }}
              onBlur={() => setActiveInput(null)}
            />
          </View>
        </TouchableOpacity>
        {errors.rate && <AppText style={styles.errorText} language={language}>{errors.rate}</AppText>}

        {/* 🔥 TOTAL */}
        <View style={styles.totalBox}>
          <AppText style={styles.totalLabel}>
            {language === "te" ? "మొత్తం రాబడి" : "Total Revenue"}
          </AppText>
          <AppText style={styles.totalValue}>
            ₹ {total.toLocaleString('en-IN')}
          </AppText>
        </View>

        {/* SAVE / UPDATE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.9}>
            <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
                <AppText style={styles.saveText}>
                    {editId 
                        ? (language === "te" ? "సవరించండి" : "Update Sale") 
                        : (language === "te" ? "భద్రపరచండి" : "Save Sale")}
                </AppText>
            </LinearGradient>
        </TouchableOpacity>

      </View>

      {/* 🔥 CROP SELECTION MODAL */}
      <Modal visible={modalType === "crop"} transparent animationType="slide" onRequestClose={() => setModalType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={{ fontSize: 18, fontWeight: "600", fontFamily: "Mandali" }}>
                 {language === "te" ? "పంటను ఎంచుకోండి" : "Select Crop"}
              </AppText>
              <TouchableOpacity onPress={() => { setModalType(null); setActiveInput(null); }}>
                <Ionicons name="close-circle" size={30} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <TextInput
                autoFocus
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                placeholder={language === "te" ? "పంట పేరు టైప్ చేయండి..." : "Search or Type crop..."}
                placeholderTextColor={'#9CA3AF'}
                cursorColor={'#16A34A'}
                style={[styles.searchInput, { fontFamily: 'Mandali' }]}
              />
              <TouchableOpacity onPress={startVoice} style={{ marginLeft: 8, padding: 6, borderRadius: 10, backgroundColor: "#eaedf2" }}>
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#EF4444" : "#16A34A"} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredCrops}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: "center" }}>
                 <View style={{ padding: 20, alignItems: 'center' }}>
                  <Ionicons name="information-circle-outline" size={24} color="#6B7280" style={{ marginBottom: 10 }} />
                  
                  <AppText style={{ color: "#4B5563", textAlign: "center", fontSize: 15, fontWeight: '500', lineHeight: 22 }}>
                    {language === "te"
                      ? "మొదట 'పొలాలు' విభాగంలో\nపంట వివరాలను నమోదు చేయండి."
                      : "First, register your crop details in the\n'Fields' section."}
                  </AppText>

                  <AppText style={{ color: "#9CA3AF", textAlign: "center", fontSize: 13, marginTop: 8 }}>
                    {language === "te"
                      ? "అక్కడ జోడించిన పంటలు మాత్రమే ఇక్కడ కనిపిస్తాయి."
                      : "Only crops added there will appear here for selection."}
                  </AppText>
                  
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setModalType(null); 
                      router.push("/farmer/fields"); 
                    }}
                    style={{
                      marginTop: 16, flexDirection: "row", alignItems: "center", gap: 6,
                      backgroundColor: "#16A34A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <AppText style={{ color: "#fff", fontWeight: "600" }}>
                      {language === "te" ? "పంట జోడించండి" : "Add Crop"}
                    </AppText>
                  </TouchableOpacity>
                </View>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    setCrop(item); 
                    setModalType(null);
                    setSearchText("");
                    setActiveInput(null);
                    if (errors.crop) setErrors({ ...errors, crop: "" });
                  }}
                >
                  <AppText style={styles.itemText}>
                    {item}
                  </AppText>
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

  // 🔥 STANDARD PATTERN INPUT STYLES
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
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
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
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
  placeholder: {
    position: "absolute",
    fontSize: 16,
    color: "#9CA3AF",
    fontFamily: "Mandali"
  },
  
  unitBox: {
    width: 110,
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#fff"
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 0,
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1000, 
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6" },
  totalBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB"
  },
  totalLabel: { fontSize: 13, color: "#6B7280", fontFamily: "Mandali", fontWeight: "600" },
  totalValue: { fontSize: 24, fontWeight: "800", color: "#16A34A", marginTop: 4 },
  
  // ORIGINAL SAVE BTN
  saveBtn: { marginTop: 30, borderRadius: 16, overflow: "hidden", elevation: 4, shadowColor: "#1B5E20", shadowOpacity: 0.3, shadowRadius: 8 },
  saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  saveText: { color: "white", fontSize: 16, fontWeight: "600" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", height: "70%", borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: "center" },
  
  searchBar: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  searchInput: { flex: 1, height: 54, fontSize: 16, fontFamily: 'Mandali' },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemText: { fontSize: 17, fontFamily: "Mandali" },

  // CROP HINT BOX
  cropHintBox: {
    backgroundColor: "#F0FDF4", 
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderStyle: 'dashed', 
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: "Mandali"
  },
  cropHintText: {
    fontSize: 13,
    color: "#166534",
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: "Mandali"
  },
  exampleBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  exampleText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    fontFamily: "Mandali"
  },
});