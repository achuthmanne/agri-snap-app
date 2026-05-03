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
const [showValidationModal, setShowValidationModal] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
const [voiceTarget, setVoiceTarget] = useState<"crop" | null>(null);
  const [userCrops, setUserCrops] = useState<string[]>([]);

  const unitMapping: any = {
    "gm": "గ్రాములు",
    "kg": "కిలోలు",
    "quintal": "క్వింటాల్",
    "ton": "టన్ను"
  };

  const unitOptions = ["gm", "kg", "quintal", "ton"];
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [activeInput, setActiveInput] = useState<string | null>(null);

useEffect(() => {
  const loadUserCrops = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;

    const snap = await firestore()
      .collection("users")
      .doc(phone)
      .collection("fields")
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

  const cropRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);
  const rateRef = useRef<TextInput>(null);

const startVoice = async () => {
  try {
    ExpoSpeechRecognitionModule.stop(); // 🔥 clear previous

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

  // 🔥 ONLY THIS MODAL
  if (voiceTarget === "crop" && modalType === "crop") {
    setSearchText(text);
    setCrop(text); // 🔥 live update
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
if (loading) return; // 🔥 ADD FIRST LINE
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

  const total =
  (Number(quantity) || 0) * (Number(rate) || 0);

 const handleSave = async () => {
  if (loading) return;

  Keyboard.dismiss();

  if (!crop.trim() || !quantity || !rate) {
    setShowValidationModal(true);
    return;
  }

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

    const total =
      (Number(quantity) || 0) * (Number(rate) || 0);

    const data = {
      crop: crop.trim(),
      quantity: Number(quantity),
      unit,
      rate: Number(rate),
      total,
      session: activeSession, // 🔥 IMPORTANT
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
    setShowValidationModal(true);
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
  style={[styles.inputBox, activeInput === "crop" && styles.inputFocused]}
  onPress={() => {
    setModalType("crop");
    setActiveInput("crop");
  }}
>
  <Ionicons name="leaf-outline" size={18} color={crop? "#2E7D32" : "#9CA3AF"} />

  <View style={{ flex: 1, marginLeft: 10 }}>
    <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF" }}>
      {crop || (language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop*")}
    </AppText>
  </View>

  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
</TouchableOpacity>
{/* 🔥 CROP HELP INFO - Enhanced UX */}
<View style={styles.cropHintBox}>
  <View style={styles.hintHeader}>
    <Ionicons name="bulb" size={18} color="#059669" />
    <AppText style={styles.hintTitle}>
      {language === "te" ? "సూచన:" : "Tip:"}
    </AppText>
  </View>

  <AppText style={styles.cropHintText}>
    {language === "te"
      ? "పంటకు సంబంధించిన ఇతర రకాలు (ఉదా: తాలుకాయ, నూకలు) అమ్మినప్పుడు కూడా అదే పంట పేరునే ఎంచుకోండి."
      : "For related variants (e.g., small-grade, husks), please select the main crop name."}
  </AppText>
  
  {/* Adding a subtle example line */}
  <View style={styles.exampleBadge}>
    <AppText style={styles.exampleText}>
      {language === "te" ? "ఉదాహరణ: వరి (వరి తాలు)" : "Eg: Paddy (Paddy Variants)"}
    </AppText>
  </View>
</View>
        {/* 📦 QUANTITY & UNIT */}
        <View style={{ zIndex: 10 }}> 
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <TouchableOpacity
              style={[styles.inputBox, { flex: 1, marginBottom: 0 }, activeInput === "qty" && styles.inputFocused]}
              activeOpacity={1}
              onPress={() => qtyRef.current?.focus()}
            >
              <Ionicons name="cube-outline" size={18} color={quantity? "#2E7D32" : "#9CA3AF"} />
              <TextInput
                ref={qtyRef}
                placeholder={language === "te" ? "పరిమాణం*" : "Quantity*"}
                value={quantity}
                onChangeText={setQuantity}
                style={styles.input}
                cursorColor="#16A34A"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                onFocus={() => { setActiveInput("qty"); setUnitOpen(false); }}
                onBlur={() => setActiveInput(null)}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.unitBox}
              onPress={() => {
                Keyboard.dismiss();
                setUnitOpen(!unitOpen);
              }}
            >
              <AppText style={{fontSize: 14, color: "#1F2937"}}>
                  {language === "te" ? unitMapping[unit] : unit}
              </AppText>
              <Ionicons name="chevron-down" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* 🔥 FLOATING DROPDOWN (Doesn't push inputs) */}
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
  style={[styles.inputBox, activeInput === "rate" && styles.inputFocused]}
  activeOpacity={1}
  onPress={() => rateRef.current?.focus()}
>
  <Ionicons name="cash-outline" size={18} color={rate? "#2E7D32" : "#9CA3AF"} />
  <TextInput
    ref={rateRef}
    // ఇక్కడ డైనమిక్ ప్లేస్‌హోల్డర్ బ్రో 👇
    placeholder={
      language === "te" 
        ? `ధర (1 ${unitMapping[unit]} కు)*` 
        : `Rate (per 1 ${unit})*`
    }
    value={rate}
    onChangeText={setRate}
    style={styles.input}
    keyboardType="numeric"
    cursorColor="#16A34A"
    selectionColor="#16A34A"
    placeholderTextColor="#9CA3AF"
    onFocus={() => { setActiveInput("rate"); setUnitOpen(false); }}
    onBlur={() => setActiveInput(null)}
  />
</TouchableOpacity>

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
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
                    <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
                        <AppText style={styles.saveText}>
                            {editId 
                                ? (language === "te" ? "సవరించండి" : "Update Sale") 
                                : (language === "te" ? "భద్రపరచండి" : "Save Sale")}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>

      </View>
      {/* ⚠️ VALIDATION MODAL */}
            <Modal
                visible={showValidationModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowValidationModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.alertBox}>
                        <View style={styles.alertIconBg}>
                            <Ionicons name="warning-outline" size={30} color="#F59E0B" />
                        </View>
                        <AppText style={styles.alertTitle}>
                            {language === "te" ? "వివరాలు అవసరం" : "Missing Details"}
                        </AppText>
                        <AppText style={styles.alertSub}>
                            {language === "te" 
                                ? "దయచేసి * గుర్తు ఉన్న అన్ని వివరాలను పూరించండి." 
                                : "Please fill all the mandatory fields marked with *"}
                        </AppText>
                      <TouchableOpacity 
                      activeOpacity={0.8}
    style={styles.alertBtn} 
    onPress={() => setShowValidationModal(false)}
>
    <AppText style={styles.alertBtnText}>
        {language === "te" ? "సరే" : "OK"}
    </AppText>
</TouchableOpacity>
                    </View>
                </View>
            </Modal>
 {/* 🔥 MODAL WRAPPER - ఇది మిస్ అయింది బ్రో */}

      <Modal visible={modalType === "crop"} transparent animationType="slide" onRequestClose={() => setModalType(null)}>

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>

              <AppText style={{ fontSize: 18, fontWeight: "600" }}>

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

                onChangeText={(text) => {
  setSearchText(text);
}}
                placeholder={language === "te" ? "పంట పేరు టైప్ చేయండి..." : "Search or Type crop..."}

                placeholderTextColor={'#9CA3AF'}

                cursorColor={'green'}

                style={[styles.searchInput, { fontFamily: 'Mandali' }]}

                
              />
              <TouchableOpacity onPress={startVoice} style={{
    marginLeft: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#eaedf2"
  }}
>

                <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#EF4444" : "#16A34A"} />

              </TouchableOpacity>

            </View>



        <FlatList
  data={filteredCrops}
  ListEmptyComponent={() => (
    <View style={{ padding: 20, alignItems: "center" }}>
     <View style={{ padding: 20, alignItems: 'center' }}>
  <Ionicons name="information-circle-outline" size={24} color="#6B7280" style={{ marginBottom: 10 }} />
  
  <AppText style={{ 
    color: "#4B5563", 
    textAlign: "center", 
    fontSize: 15, 
    fontWeight: '500',
    lineHeight: 22 
  }}>
    {language === "te"
      ? "మొదట 'పొలాలు' విభాగంలో\nపంట వివరాలను నమోదు చేయండి."
      : "First, register your crop details in the\n'Fields' section."}
  </AppText>

  <AppText style={{ 
    color: "#9CA3AF", 
    textAlign: "center", 
    fontSize: 13, 
    marginTop: 8 
  }}>
    {language === "te"
      ? "అక్కడ జోడించిన పంటలు మాత్రమే ఇక్కడ కనిపిస్తాయి."
      : "Only crops added there will appear here for selection."}
  </AppText>
      {/* 🔥 ADD BUTTON */}
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        setModalType(null); // close modal
        router.push("/farmer/fields"); // 👉 navigate
      }}
      style={{
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#16A34A",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12
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
        setCrop(item); // ✅ correct
        setModalType(null);
        setSearchText("");
        setActiveInput(null);
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
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 58,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  inputFocused: { borderColor: "#2E7D32", elevation: 2 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#1F2937", fontFamily: "Mandali" },
  unitBox: {
    width: 100,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#fff"
  },
  dropdown: {
    position: "absolute",
    top: 62,
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
    zIndex: 1000, // కచ్చితంగా పైన రావడానికి
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6" },
  totalBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  totalLabel: { fontSize: 12, color: "#6B7280" },
  totalValue: { fontSize: 22, fontWeight: "800", color: "#16A34A", marginTop: 4 },
  saveBtn: { marginTop: 30, borderRadius: 18, overflow: "hidden" },
  saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  saveText: { color: "white", fontSize: 16, fontWeight: "600" },
  label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4B5563",
        marginBottom: 6,
        marginLeft: 4
    },
   
    alertBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 10
    },
    alertIconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    alertTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
    alertSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
    alertBtn: {
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 12
    },
    alertBtnText: { color: '#fff', fontWeight: '600' },
     modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", height: "70%", borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBar: {
  flexDirection: "row",
  margin: 20,
  backgroundColor: "#F3F4F6",
  borderRadius: 18,
  paddingHorizontal: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E5E7EB"
},
  searchInput: { flex: 1, height: 54, fontSize: 16, fontFamily: 'Mandali' },
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemText: { fontSize: 17 },

modalTitleText: {
  fontSize: 18,
  fontWeight: "600",
  color: "#1F2937"
},
categoryItem: {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: "#F9FAFB"
},
cropHintBox: {
  backgroundColor: "#F0FDF4", // Light mint green
  borderRadius: 16,
  padding: 14,
  marginTop: -4,
  marginVertical: 12,
  borderWidth: 1,
  borderColor: "#DCFCE7",
  borderStyle: 'dashed', // Dashed border looks like a "tip" or "note"
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
},
cropHintText: {
  fontSize: 13,
  color: "#166534",
  lineHeight: 18,
  marginBottom: 8
},
exampleBadge: {
  backgroundColor: 'rgba(5, 150, 105, 0.1)',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
  alignSelf: 'flex-start'
},
exampleText: {
  fontSize: 11,
  color: '#059669',
  fontWeight: '600'
},
});