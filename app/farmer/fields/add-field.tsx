import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router"; // 🔥 added params
import React, { useEffect, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import {
  FlatList, Modal, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, TextInput, TouchableOpacity, View
} from "react-native";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function AddField() {
  const router = useRouter();
  const { editId } = useLocalSearchParams(); // 🔥 Get editId from params
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false); // 🔥 For Alert Modal

  
  // Form States
  const [crop, setCrop] = useState("");
  const [acres, setAcres] = useState("");
  const [type, setType] = useState<"own" | "rent" | null>(null);
  const [rent, setRent] = useState("");
const [soilType, setSoilType] = useState(""); // 🔥 Soil type state
const [modalType, setModalType] = useState<"crop" | "soil" | null>(null); // 🔥 Added "soil"
  const [searchText, setSearchText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const acresRef = useRef<TextInput>(null);
  const rentRef = useRef<TextInput>(null);

 const cropOptions = [
  { "en": "Acid Lime / Lemon", "te": "నిమ్మ" },
  { "en": "Apple Gourd", "te": "దండకాయ" },
  { "en": "Areca Nut", "te": "పోక చెక్క" },
  { "en": "Banana", "te": "అరటి" },
  { "en": "Bajra / Pearl Millet", "te": "సజ్జలు" },
  { "en": "Beetroot", "te": "బీట్రూట్" },
  { "en": "Bengal Gram / Chickpea", "te": "శనగలు" },
  { "en": "Bhendi / Okra", "te": "బెండకాయ" },
  { "en": "Bitter Gourd", "te": "కాకరకాయ" },
  { "en": "Black Gram / Urad Dal", "te": "మినుములు" },
  { "en": "Bottle Gourd", "te": "సొరకాయ" },
  { "en": "Brinjal / Eggplant", "te": "వంకాయ" },
  { "en": "Broad Beans", "te": "చిక్కుడుకాయ" },
  { "en": "Cabbage", "te": "క్యాబేజీ" },
  { "en": "Carrot", "te": "క్యారెట్" },
  { "en": "Cashew Nut", "te": "జీడిమామిడి" },
  { "en": "Castor", "te": "ఆముదం" },
  { "en": "Cauliflower", "te": "కాలీఫ్లవర్" },
  { "en": "Chilli", "te": "మిర్చి" },
  { "en": "Citrus / Sweet Orange", "te": "బత్తాయి" },
  { "en": "Cluster Beans", "te": "గోరు చిక్కుడు" },
  { "en": "Coconut", "te": "కొబ్బరి" },
  { "en": "Coriander", "te": "కొత్తిమీర" },
  { "en": "Cotton", "te": "పత్తి" },
  { "en": "Cowpea", "te": "బొబ్బర్లు" },
  { "en": "Cucumber", "te": "దోసకాయ" },
  { "en": "Curry Leaves", "te": "కరివేపాకు" },
  { "en": "Drumstick", "te": "ములక్కాయ" },
  { "en": "Flowers / Marigold", "te": "బంతి పూలు" },
  { "en": "Garlic", "te": "వెల్లుల్లి" },
  { "en": "Ginger", "te": "అల్లం" },
  { "en": "Grapes", "te": "ద్రాక్ష" },
  { "en": "Green Chilli", "te": "పచ్చి మిరపకాయ" },
  { "en": "Green Gram / Mung Bean", "te": "పెసలు" },
  { "en": "Groundnut / Peanut", "te": "వేరుశనగ" },
  { "en": "Guava", "te": "జామ" },
  { "en": "Horse Gram", "te": "ఉలవలు" },
  { "en": "Jowar / Sorghum", "te": "జొన్న" },
  { "en": "Jute", "te": "జనుము" },
  { "en": "Maize / Corn", "te": "మొక్కజొన్న" },
  { "en": "Mango", "te": "మామిడి" },
  { "en": "Mesta", "te": "గోగునార" },
  { "en": "Millets / Korra", "te": "కొర్రలు" },
  { "en": "Muskmelon", "te": "కర్బూజా" },
  { "en": "Mustard", "te": "ఆవాలు" },
  { "en": "Oil Palm", "te": "పామాయిల్" },
  { "en": "Onion", "te": "ఉల్లిపాయ" },
  { "en": "Paddy / Rice", "te": "వరి" },
  { "en": "Papaya", "te": "బొప్పాయి" },
  { "en": "Pomegranate", "te": "దానిమ్మ" },
  { "en": "Potato", "te": "బంగాళాదుంప" },
  { "en": "Radish", "te": "ముల్లంగి" },
  { "en": "Ragi / Finger Millet", "te": "రాగులు" },
  { "en": "Red Gram / Pigeon Pea", "te": "కంది" },
  { "en": "Ridge Gourd", "te": "బీరకాయ" },
  { "en": "Sapota", "te": "సపోటా" },
  { "en": "Sesame / Gingelly", "te": "నువ్వులు" },
  { "en": "Snake Gourd", "te": "పొట్లకాయ" },
  { "en": "Soybean", "te": "సోయాబీన్" },
  { "en": "Sugarcane", "te": "చెరకు" },
  { "en": "Sunflower", "te": "పొద్దుతిరుగుడు" },
  { "en": "Tobacco", "te": "పొగాకు" },
  { "en": "Tomato", "te": "టమాటా" },
  { "en": "Turmeric", "te": "పసుపు" },
  { "en": "Watermelon", "te": "పుచ్చకాయ" },
  { "en": "Wheat", "te": "గోధుమ" }
];
const soilOptions = [
  { "en": "Black Soil", "te": "నల్ల రేగడి నేల" },
  { "en": "Red Soil", "te": "ఎర్ర నేల" },
  { "en": "Sandy Soil", "te": "ఇసుక నేల" },
  { "en": "Clay Soil", "te": "బంక మట్టి నేల" },
  { "en": "Alluvial Soil", "te": "ఒండ్రు నేల" },
  { "en": "Laterite Soil", "te": "లేటరైట్ నేల" },
];


  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => { if (l) setLanguage(l as any); });
    
    // 🔥 EDIT LOGIC: editId ఉంటేనే డేటా లోడ్ అవుతుంది
    if (editId) {
      loadFieldData();
    }
  }, [editId]);

  const loadFieldData = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    // ఇక్కడ editId ని string గా కన్ఫర్మ్ చేసుకుంటున్నాం
    if (!phone || !editId || typeof editId !== 'string') return;
    
    setLoading(true);
    try {
     const doc = await firestore()
  .collection("users")
  .doc(phone)
  .collection("fields")
  .doc(editId)
  .get();

// ఒకవేళ .exists పని చేయకపోతే .exists() అని లేదా ఇలా చెక్ చెయ్
if (doc.data()) { 
  const data = doc.data();
  setCrop(data?.crop || "");
  setAcres(String(data?.acres || ""));
  setType(data?.type || null);
  setRent(String(data?.rent || ""));
}
    } catch (error) {
      console.log("Error loading field:", error);
    }
    setLoading(false);
  };
const handleSave = async () => {
  if (!crop || !soilType || !acres || !type || (type === "rent" && !rent)) {
    setErrorVisible(true);
    return;
  }

  setLoading(true);
  const phone = await AsyncStorage.getItem("USER_PHONE");
  
  try {
    // మిగతా సేవ్ లాజిక్ (If matches or no existing data)
    proceedToSave(phone!);
    
  } catch (e) { 
    console.log(e); 
    setLoading(false);
  }
};

// సేవ్ చేసే ఫంక్షన్ ని విడిగా రాద్దాం
const proceedToSave = async (phone: string) => {
  try {
    // 🔥 get active session from DB
    const userDoc = await firestore()
      .collection("users")
      .doc(phone)
      .get();

    const activeSession = userDoc.data()?.activeSession;

    const fieldData = {
      session: activeSession,   // ✅ FIXED
      crop,
      soilType,
      acres: Number(acres),
      type,
      rent: Number(rent) || 0,
      updatedAt: firestore.FieldValue.serverTimestamp()
    };

    if (editId) {
      await firestore()
        .collection("users")
        .doc(phone)
        .collection("fields")
        .doc(editId as string)
        .update(fieldData);
    } else {
      await firestore()
        .collection("users")
        .doc(phone)
        .collection("fields")
        .add({
          ...fieldData,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
    }

    router.back();

  } catch (error) {
    console.log("Save error:", error);
  } finally {
    setLoading(false);
  }
};
  // ... (startVoice, speech events, handleAddNewCrop functions same as before)
  const startVoice = async () => {
    const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!res.granted) return;
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({ lang: language === "te" ? "te-IN" : "en-US" });
  };

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results?.[0]?.transcript;
    if (text) setSearchText(text);
  });
  useSpeechRecognitionEvent("end", () => setIsListening(false));

// filteredData ని ఇలా డిక్లేర్ చెయ్
const filteredData = modalType === "crop" 
  ? cropOptions.filter(i => (language === "te" ? i.te : i.en).toLowerCase().includes(searchText.toLowerCase().trim()))
  : soilOptions.filter(i => (language === "te" ? i.te : i.en).toLowerCase().includes(searchText.toLowerCase().trim()));

// handleAdd ని ఇలా మార్చు
const handleAddItem = (manualName: string) => {
  if (manualName.trim().length > 0) {
    if (modalType === "crop") setCrop(manualName.trim());
    else setSoilType(manualName.trim());
    
    setSearchText("");
    setModalType(null);
    setActiveInput(null);
  }
};
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={editId ? (language === "te" ? "వివరాలు మార్చండి" : "Edit Field") : (language === "te" ? "పొలం వివరాలు" : "Field Details")}
        subtitle={language === "te" ? "మీ పొలం వివరాలను నమోదు చేయండి" : "Enter your field details"}
        language={language}
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* 🌾 CROP BOX */}
        <TouchableOpacity 
          activeOpacity={1}
          style={[styles.inputBox, activeInput === "crop" && styles.inputFocused]} 
          onPress={() => { setModalType("crop"); setActiveInput("crop"); }}
        >
          <Ionicons name="leaf-outline" size={20} color={crop ? "#16A34A" : "#9CA3AF"} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
              {crop || (language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 🪨 SOIL TYPE BOX */}
<TouchableOpacity 
  activeOpacity={1}
  style={[styles.inputBox, activeInput === "soil" && styles.inputFocused]} 
  onPress={() => { setModalType("soil"); setActiveInput("soil"); }}
>
  <Ionicons name="layers-outline" size={20} color={soilType ? "#16A34A" : "#9CA3AF"} />
  <View style={{ flex: 1, marginLeft: 10 }}>
    <AppText style={{ color: soilType ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
      {soilType || (language === "te" ? "నేల రకాన్ని ఎంచుకోండి*" : "Select Soil Type*")}
    </AppText>
  </View>
  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
</TouchableOpacity>

        {/* 📏 ACRES BOX */}
        <View style={[styles.inputBox, activeInput === "acres" && styles.inputFocused]}>
          <Ionicons name="resize-outline" size={20} color={acres ? "#16A34A" : "#9CA3AF"} />
          <TextInput
            ref={acresRef}
            placeholder={language === "te" ? "ఎన్ని ఎకరాలు?*" : "Enter acres*"}
            value={acres}
            cursorColor={'green'}
            placeholderTextColor={'#9CA3AF'}
            onChangeText={setAcres}
            onFocus={() => setActiveInput("acres")}
            onBlur={() => setActiveInput(null)}
            keyboardType="numeric"
            style={[styles.input, { fontFamily: 'Mandali' }]}
          />
        </View>

        {/* 🔘 TYPE SELECTION */}
        <AppText style={styles.label}>{language === "te" ? "పొలం రకం*" : "Field Type*"}</AppText>
        <View style={styles.row}>
          <TouchableOpacity activeOpacity={0.8}
            style={[styles.pill, type === "own" && styles.activePill]} 
            onPress={() => { setType("own"); setActiveInput(null); }}
          >
            <AppText style={[styles.pillText, { color: type === "own" ? "#fff" : "#4B5563" }]}>
              {language === "te" ? "సొంతం" : "Own"}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.pill, type === "rent" && styles.activePill]} 
            onPress={() => { setType("rent"); setActiveInput(null); }}
          >
            <AppText style={[styles.pillText, { color: type === "rent" ? "#fff" : "#4B5563" }]}>
              {language === "te" ? "కౌలు" : "Rent"}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 💰 RENT BOX */}
        {type === "rent" && (
            <View style={[styles.inputBox, activeInput === "rent" && styles.inputFocused]}>
              <Ionicons name="cash-outline" size={20} color={rent ? "#16A34A" : "#9CA3AF"} />
              <TextInput
                ref={rentRef}
               placeholder={
        language === "te" 
          ? `${acres || 0} ఎకరాలకు కలిపి మొత్తం కౌలు (రూ!!)*` 
          : `Total rent for ${acres || 0} acres (₹)*`
      }
                value={rent}
                onChangeText={setRent}
                placeholderTextColor={'#979ba2'}
                cursorColor={'green'}
                onFocus={() => setActiveInput("rent")}
                onBlur={() => setActiveInput(null)}
                keyboardType="numeric"
                style={[styles.input, { fontFamily: 'Mandali' }]}
              />
            </View>
        )}

        {/* 💾 SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveInner}>
            <AppText style={styles.saveText}>
              {editId 
                ? (language === "te" ? "వివరాలు మార్చండి" : "Update Details") 
                : (language === "te" ? "భద్రపరచండి" : "Save Details")}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

     {/* 🚨 MIDDLE ALERT MODAL (మొత్తం AppText తో) */}
      <Modal visible={errorVisible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconBg}>
              <Ionicons name="warning" size={32} color="#F59E0B" />
            </View>
            
            <AppText style={styles.alertTitle}>
              {language === "te" ? "వివరాలు కావాలి" : "Details Required"}
            </AppText>
            
            <AppText style={styles.alertSub}>
              {language === "te" ? "దయచేసి అన్ని ఖాళీలను పూరించండి. నక్షత్ర గుర్తు (*) ఉన్నవి తప్పనిసరి." : "Please fill all fields marked with (*). They are mandatory."}
            </AppText>

            <TouchableOpacity activeOpacity={0.8} style={styles.alertBtn} onPress={() => setErrorVisible(false)}>
              <AppText style={styles.alertBtnText}>
                {language === "te" ? "సరే" : "OK"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* OTHER MODALS */}
      <AgriLoader visible={loading} type="saving" language={language} />
      
      {/* 🔥 MODAL WRAPPER - ఇది మిస్ అయింది బ్రో */}

      <Modal visible={modalType !== null} transparent animationType="slide" onRequestClose={() => setModalType(null)}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <AppText style={{ fontSize: 18, fontWeight: "600" }}>
          {modalType === "crop" ? (language === "te" ? "పంటను ఎంచుకోండి" : "Select Crop") : (language === "te" ? "నేల రకాన్ని ఎంచుకోండి" : "Select Soil Type")}
        </AppText>
        <TouchableOpacity onPress={() => { setModalType(null); setActiveInput(null); setSearchText(""); }}>
          <Ionicons name="close-circle" size={30} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          autoFocus
          value={searchText}
          onChangeText={setSearchText}
          placeholder={language === "te" ? "టైప్ చేయండి..." : "Search or Type..."}
          placeholderTextColor={'#9CA3AF'}
          cursorColor={'green'}
          style={[styles.searchInput, { fontFamily: 'Mandali' }]}
          onSubmitEditing={() => handleAddItem(searchText)}
        />
        {searchText.trim().length > 0 && (
          <TouchableOpacity onPress={() => handleAddItem(searchText)} style={{ backgroundColor: "#16A34A", borderRadius: 12, padding: 6, marginRight: 6 }}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={startVoice} style={{ marginLeft: 8, padding: 6, borderRadius: 10, backgroundColor: "#eaedf2" }}>
          <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#EF4444" : "#16A34A"} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
         ListEmptyComponent={() => (

                searchText.length > 0 ? (

                  <TouchableOpacity style={styles.item} onPress={() => handleAddItem(searchText)}>

                    <AppText style={{ color: '#16A34A', fontWeight: '600' }}>

                      {language === "te" ? `"${searchText}" ని చేర్చండి +` : `Add "${searchText}" +`}

                    </AppText>

                  </TouchableOpacity>

                ) : null

              )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              const selected = language === "te" ? item.te : item.en;
              if (modalType === "crop") setCrop(selected);
              else setSoilType(selected);
              setModalType(null);
              setSearchText("");
              setActiveInput(null);
            }}
          >
            <AppText style={styles.itemText}>{language === "te" ? item.te : item.en}</AppText>
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
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { padding: 20 },
  label: { fontSize: 14, color: "#6B7280", marginBottom: 6, marginLeft: 4, fontWeight: '500' },
  
  // 🔥 Input Focused Styles
  inputBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 16, paddingHorizontal: 15, height: 58, marginBottom: 18,
    borderWidth: 1.5, borderColor: "#E5E7EB" 
  },
  inputFocused: { borderColor: "#16A34A"}, // Green border when focused
  
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#1F2937" },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  pill: {
    flex: 1, padding: 15, borderRadius: 16, backgroundColor: "#fff", 
    alignItems: "center", borderWidth: 1.5, borderColor: "#E5E7EB"
  },
  activePill: { backgroundColor: "#098034", borderColor: "#03762d" },
  pillText: { fontSize: 16, fontWeight: "600" },

  // 🔥 Save Button Styles
  saveBtn: { marginTop: 10, borderRadius: 18, overflow: "hidden", elevation: 4, shadowColor: "#16A34A", shadowOpacity: 0.3, shadowRadius: 5 },
  saveInner: { height: 60, justifyContent: "center", alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "500" },

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

// 🔥 NEAT MIDDLE ALERT STYLES
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // డార్క్ బ్యాక్ గ్రౌండ్
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  alertBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  alertIconBg: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10
  },
  alertSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25
  },
  alertBtn: {
    width: '100%',
    backgroundColor: '#eeb414',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center'
  },
  alertBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  sessionRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 62,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#16A34A', // Highlighted with green
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sessionLeft: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 10,
  },
  sessionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  sessionRight: {
    flex: 1,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  changeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  sessionPickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    marginBottom: 20,
  },
  sessionOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  selectedSessionOption: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#475569',
  },
  cancelSessionBtn: {
    marginTop: 15,
    padding: 10,
  },
  cancelSessionText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },

  warningIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  conflictTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  conflictSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    marginBottom: 20,
  },
  conflictBtns: {
    width: '100%',
    gap: 10,
  },
  keepBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  keepBtnText: {
    fontWeight: '600',
    color: '#1E293B',
  },
  clearBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  clearBtnText: {
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay1: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // కొంచెం డార్క్ చేస్తే సెంటర్ బాక్స్ బాగా ఎలివేట్ అవుతుంది
    justifyContent: 'center', // 👈 ఇది సెంటర్ కి తీసుకొస్తుంది (Vertical)
    alignItems: 'center',     // 👈 ఇది సెంటర్ కి తీసుకొస్తుంది (Horizontal)
    padding: 20,
  },
  conflictBox: {
    width: '90%', // వెడల్పు కొంచెం పెంచాను
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    // Premium Shadow (elevations వద్దు అన్నావుగా, అందుకే సాఫ్ట్ షాడో)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  closeModalBtn: {
    marginTop: 20,
    padding: 5,
  },
  closeModalText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // ... మిగతా స్టైల్స్ అవే ఉంచు బ్రో
});