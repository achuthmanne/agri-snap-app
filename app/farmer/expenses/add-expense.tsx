//add-expenses
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList, Modal, SafeAreaView, ScrollView, StatusBar,
    StyleSheet, TextInput, TouchableOpacity, View
} from "react-native";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import { createNotification } from "@/utils/notifications";
import AppText from "@/components/AppText";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function AddExpense() {
    const router = useRouter();
    const { editId } = useLocalSearchParams();

    const [crop, setCrop] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [userCrops, setUserCrops] = useState<string[]>([]);
    // 🔥 New States for Modal
    const [modalType, setModalType] = useState<"crop" | "cat" | null>(null);
    const [searchText, setSearchText] = useState("");
const [showLabourInfo, setShowLabourInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<"te" | "en">("te");
    const [activeInput, setActiveInput] = useState<string | null>(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
const [isListening, setIsListening] = useState(false);
const [voiceTarget, setVoiceTarget] = useState<"modal" | null>(null);
const [activeSession, setActiveSession] = useState("");
// 2. Rent Info చూపించడానికి స్టేట్
const [showRentInfo, setShowRentInfo] = useState(false)
    const amtRef = useRef<TextInput>(null);

useEffect(() => {
  const loadSession = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;

    const doc = await firestore()
      .collection("users")
      .doc(phone)
      .get();

    setActiveSession(doc.data()?.activeSession || "");
  };

  loadSession();
}, []);

useEffect(() => {
  const loadUserCrops = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;

    const snap = await firestore()
      .collection("users")
      .doc(phone)
     .collection("fields")
.where("session", "==", activeSession)
.get();

    const set = new Set<string>();

    snap.forEach(doc => {
      const d = doc.data();
      if (d.crop) set.add(d.crop);
    });

    setUserCrops(Array.from(set));
  };

 if (activeSession) {
    loadUserCrops();
  }
}, [activeSession]);

const analyzeExpenseAndNotify = async ({
  phone,
  category,
  amount,
}: any) => {
  try {
    const snapshot = await firestore()
      .collection("users")
      .doc(phone)
      .collection("expenses")
.where("session", "==", activeSession)
.get();

    let total = 0;
    let categoryTotal = 0;

    snapshot.forEach(doc => {
      const d: any = doc.data();
      const amt = Number(d.amount) || 0;

      total += amt;

      if (d.category === category) {
        categoryTotal += amt;
      }
    });

    // 🔥 RULE 1: CATEGORY DOMINANCE
    if (categoryTotal > total * 0.4) {
      await createNotification({
        title: "High Expense Alert",
        message: `${category} ఖర్చులు ఎక్కువగా ఉన్నాయి`,
        userId: phone,
      });
    }

    // 🔥 RULE 2: HIGH SINGLE ENTRY
    if (amount > 5000) {
      await createNotification({
        title: "Large Expense Added",
        message: `₹${amount} పెద్ద ఖర్చు నమోదు అయింది`,
        userId: phone,
      });
    }

    // 🔥 RULE 3: TOTAL LIMIT
    if (total > 10000) {
      await createNotification({
        title: "Total Expense Alert",
        message: `మీ మొత్తం ఖర్చులు ₹${total} దాటాయి`,
        userId: phone,
      });
    }

  } catch (e) {
    console.log("analysis error", e);
  }
};


 const categoryOptions = [
    { en: "Seeds", te: "విత్తనాలు" },
    { en: "Fertilizer", te: "ఎరువులు" },
    { en: "Pesticides", te: "పురుగుల మందులు" },
    { en: "Transport", te: "రవాణా" },
    { en: "Tractor", te: "ట్రాక్టర్ / యంత్రాలు" },
    { en: "Electricity", te: "కరెంట్ బిల్లు" },
    { en: "Water(Irrigation)", te: "నీటి ఖర్చులు" },
    { en: "Storage", te: "కోల్డ్ స్టోరేజ్ / నిల్వ" },
    { en: "Packaging", te: "ప్యాకింగ్ ఖర్చులు" },
     { en: "Labour", te: "రోజువారీ కూలీలు" },
    { en: "Loan Interest", te: "అప్పుల వడ్డీ" },
    { en: "Market Commission", te: "మార్కెట్ కమిషన్" },
    { en: "Equipment Repair", te: "యంత్రాల రిపేర్లు" },
    { en: "Other", te: "ఇతర ఖర్చులు" }
];


const isLabourCategory = (text: string) => {
  const t = text.toLowerCase().trim();

  const keywords = [
    // English & Tanglish
    "labour", "laber", "leber", "worker",
    "mestri", "mestry", "maistree", "mestree",
    "kuli", "cooli", "coolie", "koolie",
    "panivallu", "panollu", "mutha",

    // Telugu Script
    "లేబర్", "మేస్త్రి", "మేస్త్రీ", "కూలి", "కూలీ", "పనివారు", "పనోళ్ళు", "ముఠా"
  ];

  // Edina okkati match ayina true returns chestundi
  return keywords.some(keyword => t.includes(keyword));
};

// 1. Rent Category చెక్ చేయడానికి ఫంక్షన్
const isRentCategory = (text: string) => {
  const t = text.toLowerCase().trim();
  const keywords = [
    "rent", "lease", "kavulu", "bhumi kavulu", "land rent",
    "కౌలు", "అద్దె", "భూమి కౌలు", "లీజు"
  ];
  return keywords.some(keyword => t.includes(keyword));
};




    useEffect(() => {
        AsyncStorage.getItem("APP_LANG").then(l => { if (l) setLanguage(l as any); });
    }, []);

    useEffect(() => {
        if (!editId) return;
        const load = async () => {
            const phone = await AsyncStorage.getItem("USER_PHONE");
            const doc = await firestore().collection("users").doc(phone!).collection("expenses").doc(editId as string).get();
            const d = doc.data();
            if (d) {
                setCrop(d.crop);
                setCategory(d.category);
                setAmount(String(d.amount));
            }
        };
        load();
    }, [editId]);

    // 🔥 Selection Handler
const handlePick = (val: string) => {

  if (modalType === "crop") {

    if (!userCrops.includes(val)) return;

    setCrop(val);
    setModalType(null);

    setTimeout(() => {
      setSearchText("");   // 🔥 important
      setModalType("cat");
    }, 300);

    return;
  }

  setCategory(val);
  setModalType(null);
  setSearchText("");

  setShowLabourInfo(isLabourCategory(val));
  setShowRentInfo(isRentCategory(val));

  setTimeout(() => amtRef.current?.focus(), 300);
};
useEffect(() => {
  if (modalType !== null) {
    setSearchText("");
  }
}, [modalType]);
const options =
  modalType === "crop"
    ? userCrops.map(c => ({ en: c, te: c }))
    : categoryOptions;

const filteredData = options.filter(item => {
  const value = (language === "te" ? item.te : item.en)
    .toLowerCase()
    .trim();

  return (value || "").includes(searchText.toLowerCase().trim());
});

    const handleSave = async () => {
        if (!crop.trim() || !category.trim() || !amount) {
            setShowValidationModal(true);
            return;
        }
       const phone = await AsyncStorage.getItem("USER_PHONE");

if (!phone) {
  setLoading(false);
  return;
}

if (!activeSession) {
  setLoading(false);
  return;
}


        setLoading(true);
       const data = {
  crop: crop.trim(),
  category: category.trim(),
  amount: Number(amount),
  session: activeSession, // 🔥 MUST
  createdAt: firestore.FieldValue.serverTimestamp()
};

        try {
            const ref = firestore().collection("users").doc(phone).collection("expenses");
            editId ? await ref.doc(editId as string).update(data) : await ref.add(data);

// 🔥 CALL SMART ANALYSIS FUNCTION
await analyzeExpenseAndNotify({
  phone,
  category: category.trim(),
  amount: Number(amount)
});

router.back();
        } catch (e) {
  console.log("Expense save error:", e);
}
        setLoading(false);
    };

    const startVoice = async () => {
  try {
    ExpoSpeechRecognitionModule.stop(); // 🔥 previous clear

    const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!res.granted) return;

    setVoiceTarget("modal");
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
  if (voiceTarget === "modal" && modalType !== null) {
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

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <AppHeader
                title={editId ? (language === "te" ? "ఖర్చు మార్చు" : "Edit Expense") : (language === "te" ? "ఖర్చు చేర్చండి" : "Add Expense")}
                subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter details"}
                language={language}
            />

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                
                {/* 🌾 CROP NAME SELECTOR */}
                <TouchableOpacity 
                    style={[styles.inputBox, activeInput === "crop" && styles.inputFocused]}
                    onPress={() => { setModalType("crop"); setActiveInput("crop"); }}
                >
                    <Ionicons name="leaf-outline" size={18} color={crop? "#DC2626" : "#9CA3AF"} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
                            {crop || (language === "te" ? "పంట పేరును ఎంచుకోండి*" : "Select Crop Name*")}
                        </AppText>
                    </View>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                {/* 📂 CATEGORY SELECTOR */}
                <TouchableOpacity 
                    style={[styles.inputBox, activeInput === "cat" && styles.inputFocused]}
                    onPress={() => { setModalType("cat"); setActiveInput("cat"); }}
                >
                    <Ionicons name="grid-outline" size={18} color={category ? "#DC2626" : "#9CA3AF"} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <AppText style={{ color: category ? "#1F2937" : "#9CA3AF", fontSize: 16 }}>
                            {category || (language === "te" ? "ఖర్చు రకాన్ని ఎంచుకోండి*" : "Select Category*")}
                        </AppText>
                    </View>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                {/* 💰 AMOUNT INPUT */}
                <View style={[styles.inputBox, activeInput === "amt" && styles.inputFocused]}>
                    <Ionicons name="cash-outline" size={18} color={amount? "#DC2626" : "#9CA3AF"} />
                    <TextInput
                        ref={amtRef}
                        placeholder={language === "te" ? "ఖర్చు చేసిన మొత్తం*" : "Amount Spent*"}
                        value={amount}
                        cursorColor="#ec371f"
                        onChangeText={setAmount}
                        style={styles.input}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        onFocus={() => { setActiveInput("amt"); }}
                        onBlur={() => setActiveInput(null)}
                    />
                </View>
{/* LABOUR INFO NOTE */}
{showLabourInfo && (
  <View style={styles.infoBox}>
    <Ionicons name="information-circle-outline" size={18} color="#F59E0B" />
    <AppText style={styles.infoText} language={language}>
      {language === "te"
        ? "మేస్త్రీకి ఇచ్చిన కూలీ డబ్బులు ఇక్కడ నమోదు చేయవద్దు. అవి చివరలో నేరుగా లెక్కలోకి వస్తాయి."
        : "Do not enter mestri labour payments here. They are already calculated separately."}
    </AppText>
  </View>
)}

{/* RENT/KAVULU INFO NOTE 🔥 */}
{showRentInfo && (
  <View style={[styles.infoBox, { borderColor: "#F87171", backgroundColor: "#FEF2F2" }]}>
    <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
    <AppText style={[styles.infoText, { color: "#991B1B" }]} language={language}>
      {language === "te"
        ? "భూమి కౌలు ఖర్చులు ఇక్కడ నమోదు చేయకండి. దీని కోసం ప్రత్యేక విభాగం ఉంది."
        : "Do not add Land Rent/Lease expenses here. Please use the dedicated section for Rent."}
    </AppText>
  </View>
)}
                {/* SAVE BUTTON */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.9}>
                    <LinearGradient colors={["#DC2626", "#991B1B"]} style={styles.saveGradient}>
                        <AppText style={styles.saveText}>
                            {editId ? (language === "te" ? "ఖర్చు సవరించండి" : "Update Expense") : (language === "te" ? "ఖర్చు భద్రపరచండి" : "Save Expense")}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* 🛠 HYBRID SELECTION MODAL */}
            <Modal visible={modalType !== null} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitleText}>
                                {modalType === "crop" 
                                    ? (language === "te" ? "పంటను ఎంచుకోండి" : "Select Crop") 
                                    : (language === "te" ? "ఖర్చు రకాన్ని ఎంచుకోండి" : "Select Category")}
                            </AppText>
                            <TouchableOpacity onPress={() => setModalType(null)}>
                                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* ⌨️ TYPING / SEARCH AREA */}
                        <View style={styles.searchBar}>
                            <TextInput 
                           cursorColor="#ec371f"
                                autoFocus
                                placeholder={language === "te" ? "ఇక్కడ టైప్ చేయండి..." : "Type here..."}
                                // Correct way to combine styles in React Native
style={[styles.searchInput, {fontFamily: 'Mandali'}]}

                                value={searchText}
                                placeholderTextColor={"black"}
                                      onChangeText={(text) => {
  setSearchText(text);
}}
                                onSubmitEditing={() => handlePick(searchText)}
                            />
                           
                           {modalType === "cat" && searchText.trim().length > 0 && (
  <TouchableOpacity
    onPress={() => handlePick(searchText)}
    style={{
      backgroundColor: "#DC2626",
      borderRadius: 12,
      padding: 6,
      marginLeft: 6
    }}
  >
    <Ionicons name="add" size={20} color="#fff" />
  </TouchableOpacity>
)}
                              <TouchableOpacity
  onPress={startVoice}
  style={{
    marginLeft: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#eaedf2"
  }}
>
  <Ionicons
    name={isListening ? "mic" : "mic-outline"}
    size={24}
    color={isListening ? "#EF4444" : "#157c3e"}
  />
</TouchableOpacity>
                        </View>

                        {/* 📜 LIST AREA */}
                        <FlatList
                           data={filteredData}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingBottom: 30 }}
                       ListEmptyComponent={() => {
  // 🌾 CROP EMPTY
  if (modalType === "crop") {
    return (
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
    );
  }

  // 📂 CATEGORY OLD BEHAVIOR
  return searchText.trim().length > 0 ? (
    <TouchableOpacity
      style={[styles.categoryItem, { justifyContent: "center" }]}
      onPress={() => handlePick(searchText)}
    >
      <AppText style={{ color: '#a32d16', fontWeight: '600' }}>
        {language === "te"
          ? `"${searchText}" ని చేర్చండి +`
          : `Add "${searchText}" +`}
      </AppText>
    </TouchableOpacity>
  ) : null;
}}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.categoryItem} 
                                    onPress={() => handlePick(language === "te" ? item.te : item.en)}
                                >
                                    <AppText style={styles.categoryItemText}>
                                        {language === "te" ? item.te : item.en}
                                    </AppText>
                                    <Ionicons name="chevron-forward" size={16} color="#E5E7EB" />
                                </TouchableOpacity>
                                
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Validation Modal */}
           <Modal visible={showValidationModal} transparent animationType="fade">
    <View style={styles.modalBg}>
        <View style={styles.modalBox}>
            {/* Added a View wrapper for the Icon Background */}
            <View style={styles.iconContainer}>
                <Ionicons name="warning-outline" size={32} color="#DC2626" />
            </View>

            <AppText style={styles.modalTitle}>
                {language === "te" ? "వివరాలు అవసరం" : "Missing Details"}
            </AppText>
            
            <AppText style={styles.modalSub}>
                {language === "te" ? "దయచేసి అన్ని వివరాలను నమోదు చేయండి." : "Please fill all fields."}
            </AppText>

            <TouchableOpacity activeOpacity={0.8} style={styles.modalBtn} onPress={() => setShowValidationModal(false)}>
                {/* Updated with Telugu "సరే" translation */}
                <AppText style={{ color: "#fff", fontWeight: "600", fontFamily: language === "te" ? 'Mandali' : undefined }}>
                    {language === "te" ? "సరే" : "OK"}
                </AppText>
            </TouchableOpacity>
        </View>
    </View>
</Modal>


            <AgriLoader visible={loading} type="saving" language={language} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F6F7F6" },
    container: { padding: 20, flexGrow: 1 },
    inputBox: { 
        flexDirection: "row", alignItems: "center", backgroundColor: "white", 
        borderRadius: 18, paddingHorizontal: 15, height: 58, marginBottom: 16, 
        borderWidth: 1, borderColor: "#E5E7EB" 
    },
    inputFocused: { borderColor: "#DC2626", borderWidth: 1.5 },
    input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#1F2937", fontFamily: "Mandali" },
    
    saveBtn: { marginTop: 10, borderRadius: 18, overflow: "hidden" },
    saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
 iconContainer: {
        backgroundColor: '#FEE2E2', // Light red background
        width: 60,
        height: 60,
        borderRadius: 30, // Makes it a circle
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    // Ensure modalBox centers its children
    modalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center', // Centers icon and text
        width: '80%',
    },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '75%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitleText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    
   searchBar: { 
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  margin: 20,
  borderRadius: 18,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB'
},
    searchInput: { flex: 1, height: 54, fontSize: 16, color: '#1F2937' },
    
    categoryItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    categoryItemText: { fontSize: 16, color: '#374151' },
    
    modalBg: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 30 },
    modalTitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },
    modalSub: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 5, marginBottom: 20 },
    modalBtn: { backgroundColor: "#DC2626", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
    infoBox: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,

  backgroundColor: "#FFFBEB",
  borderRadius: 14,
  padding: 12,
  marginTop: -6,
  marginBottom: 10,

  borderWidth: 1,
  borderColor: "#FDE68A"
},

infoText: {
  flex: 1,
  fontSize: 13,
  color: "#92400E",
  lineHeight: 18
},
});