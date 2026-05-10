//add-expenses
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

// URL params helper
const getStr = (val: string | string[] | undefined) => (Array.isArray(val) ? val[0] : val || "");

export default function AddExpense() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const editId = getStr(params.editId);

    // 🔥 INSTANT DATA LOAD FROM PARAMS
    const [crop, setCrop] = useState(getStr(params.crop));
    const [category, setCategory] = useState(getStr(params.category));
    const [amount, setAmount] = useState(getStr(params.amount));
    
    const [userCrops, setUserCrops] = useState<string[]>([]);
    
    // 🔥 New States for Modal & Standard Pattern
    const [modalType, setModalType] = useState<"crop" | "cat" | null>(null);
    const [searchText, setSearchText] = useState("");
    const [showLabourInfo, setShowLabourInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<"te" | "en">("te");
    
    const [activeInput, setActiveInput] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); 
    
    const [isListening, setIsListening] = useState(false);
    const [voiceTarget, setVoiceTarget] = useState<"modal" | null>(null);
    const [activeSession, setActiveSession] = useState("");
    const [showRentInfo, setShowRentInfo] = useState(false);
    
    const amtRef = useRef<TextInput>(null);

    useEffect(() => {
      const loadSession = async () => {
        const phone = await AsyncStorage.getItem("USER_PHONE");
        if (!phone) return;

        const doc = await firestore().collection("users").doc(phone).get();
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

    // 🔥 Check initially if editing
    useEffect(() => {
      if (editId) {
        setShowLabourInfo(isLabourCategory(category));
        setShowRentInfo(isRentCategory(category));
      }
    }, [editId, category]);

    const analyzeExpenseAndNotify = async ({ phone, category, amount }: any) => {
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
          if (d.category === category) categoryTotal += amt;
        });

        if (categoryTotal > total * 0.4) {
          await createNotification({
            title: "High Expense Alert",
            message: `${category} ఖర్చులు ఎక్కువగా ఉన్నాయి`,
            userId: phone,
          });
        }

        if (amount > 5000) {
          await createNotification({
            title: "Large Expense Added",
            message: `₹${amount} పెద్ద ఖర్చు నమోదు అయింది`,
            userId: phone,
          });
        }

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
        "labour", "laber", "leber", "worker",
        "mestri", "mestry", "maistree", "mestree",
        "kuli", "cooli", "coolie", "koolie",
        "panivallu", "panollu", "mutha",
        "లేబర్", "మేస్త్రి", "మేస్త్రీ", "కూలి", "కూలీ", "పనివారు", "పనోళ్ళు", "ముఠా"
      ];
      return keywords.some(keyword => t.includes(keyword));
    };

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

    const handlePick = (val: string) => {
      if (modalType === "crop") {
        if (!userCrops.includes(val)) return;
        setCrop(val);
        setModalType(null);
        if (errors.crop) setErrors({ ...errors, crop: "" });
        setTimeout(() => {
          setSearchText("");
          setModalType("cat");
        }, 300);
        return;
      }

      setCategory(val);
      setModalType(null);
      setSearchText("");
      if (errors.category) setErrors({ ...errors, category: "" });

      setShowLabourInfo(isLabourCategory(val));
      setShowRentInfo(isRentCategory(val));

      setTimeout(() => {
        setActiveInput("amt");
        amtRef.current?.focus();
      }, 300);
    };

    useEffect(() => {
      if (modalType !== null) {
        setSearchText("");
      }
    }, [modalType]);

    const options = modalType === "crop" ? userCrops.map(c => ({ en: c, te: c })) : categoryOptions;

    const filteredData = options.filter(item => {
      const value = (language === "te" ? item.te : item.en).toLowerCase().trim();
      return (value || "").includes(searchText.toLowerCase().trim());
    });

    const handleSave = async () => {
        // 🔥 INLINE VALIDATION
        const newErrors: any = {};
        if (!crop.trim()) newErrors.crop = language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop Name*";
        if (!category.trim()) newErrors.category = language === "te" ? "ఖర్చు రకాన్ని ఎంచుకోండి*" : "Select Category*";
        if (!amount) newErrors.amount = language === "te" ? "మొత్తం నమోదు చేయండి*" : "Enter Amount*";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const phone = await AsyncStorage.getItem("USER_PHONE");
        if (!phone || !activeSession) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = {
          crop: crop.trim(),
          category: category.trim(),
          amount: Number(amount),
          session: activeSession, 
          createdAt: firestore.FieldValue.serverTimestamp()
        };

        try {
            const ref = firestore().collection("users").doc(phone).collection("expenses");
            editId ? await ref.doc(editId as string).update(data) : await ref.add(data);

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
        ExpoSpeechRecognitionModule.stop();
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
      if (voiceTarget === "modal" && modalType !== null) {
        setSearchText(text);
      }
    });

    useSpeechRecognitionEvent("end", () => {
      setIsListening(false);
      setVoiceTarget(null);
    });

    useEffect(() => {
      return () => { ExpoSpeechRecognitionModule.stop(); };
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
                    activeOpacity={1}
                    style={[styles.inputBox, activeInput === "crop" && styles.inputFocused, errors.crop && styles.inputError]}
                    onPress={() => { setModalType("crop"); setActiveInput("crop"); }}
                >
                    <Ionicons name="leaf-outline" size={20} color={crop ? "#DC2626" : "#9CA3AF"} />
                    <View style={styles.inputWrapper}>
                        <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF", fontSize: 16, fontFamily: "Mandali" }}>
                            {crop || (language === "te" ? "పంట పేరును ఎంచుకోండి*" : "Select Crop Name*")}
                        </AppText>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>
                {errors.crop && <AppText style={styles.errorText} language={language}>{errors.crop}</AppText>}

                {/* 📂 CATEGORY SELECTOR */}
                <TouchableOpacity 
                    activeOpacity={1}
                    style={[styles.inputBox, activeInput === "cat" && styles.inputFocused, errors.category && styles.inputError]}
                    onPress={() => { setModalType("cat"); setActiveInput("cat"); }}
                >
                    <Ionicons name="grid-outline" size={20} color={category ? "#DC2626" : "#9CA3AF"} />
                    <View style={styles.inputWrapper}>
                        <AppText style={{ color: category ? "#1F2937" : "#9CA3AF", fontSize: 16, fontFamily: "Mandali" }}>
                            {category || (language === "te" ? "ఖర్చు రకాన్ని ఎంచుకోండి*" : "Select Category*")}
                        </AppText>
                    </View>
                    <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>
                {errors.category && <AppText style={styles.errorText} language={language}>{errors.category}</AppText>}

                {/* 💰 AMOUNT INPUT */}
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => { setActiveInput("amt"); amtRef.current?.focus(); }}
                  style={[styles.inputBox, activeInput === "amt" && styles.inputFocused, errors.amount && styles.inputError]}
                >
                    <Ionicons name="cash-outline" size={20} color={amount ? "#DC2626" : "#9CA3AF"} />
                    <View style={styles.inputWrapper}>
                        {!amount && activeInput !== "amt" && (
                            <AppText style={styles.customPlaceholder}>
                                {language === "te" ? "ఖర్చు చేసిన మొత్తం*" : "Amount Spent*"}
                            </AppText>
                        )}
                        <TextInput
                            ref={amtRef}
                            value={amount}
                            cursorColor="#DC2626"
                            selectionColor="#DC262640"
                            onChangeText={(txt) => { setAmount(txt); if(errors.amount) setErrors({...errors, amount: ""}); }}
                            style={[styles.input, { display: (amount || activeInput === "amt") ? "flex" : "none" }]}
                            keyboardType="numeric"
                            onFocus={() => setActiveInput("amt")}
                            onBlur={() => setActiveInput(null)}
                        />
                    </View>
                </TouchableOpacity>
                {errors.amount && <AppText style={styles.errorText} language={language}>{errors.amount}</AppText>}

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
                
                {/* SAVE BUTTON - ORIGINAL THEME UNTOUCHED */}
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
                            <TouchableOpacity onPress={() => { setModalType(null); setActiveInput(null); }}>
                                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* ⌨️ TYPING / SEARCH AREA */}
                        <View style={styles.searchBar}>
                            <TextInput 
                                cursorColor="#DC2626"
                                autoFocus
                                placeholder={language === "te" ? "ఇక్కడ టైప్ చేయండి..." : "Type here..."}
                                style={[styles.searchInput, {fontFamily: 'Mandali'}]}
                                value={searchText}
                                placeholderTextColor={"black"}
                                onChangeText={(text) => setSearchText(text)}
                                onSubmitEditing={() => handlePick(searchText)}
                            />
                            {modalType === "cat" && searchText.trim().length > 0 && (
                              <TouchableOpacity
                                onPress={() => handlePick(searchText)}
                                style={{ backgroundColor: "#DC2626", borderRadius: 12, padding: 6, marginLeft: 6 }}
                              >
                                <Ionicons name="add" size={20} color="#fff" />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={startVoice} style={{ marginLeft: 8, padding: 6, borderRadius: 10, backgroundColor: "#eaedf2" }}>
                              <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#EF4444" : "#157c3e"} />
                            </TouchableOpacity>
                        </View>

                        {/* 📜 LIST AREA */}
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingBottom: 30 }}
                            ListEmptyComponent={() => {
                              if (modalType === "crop") {
                                return (
                                  <View style={{ padding: 20, alignItems: "center" }}>
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                      <Ionicons name="information-circle-outline" size={24} color="#6B7280" style={{ marginBottom: 10 }} />
                                      <AppText style={{ color: "#4B5563", textAlign: "center", fontSize: 15, fontWeight: '500', lineHeight: 22 }}>
                                        {language === "te" ? "మొదట 'పొలాలు' విభాగంలో\nపంట వివరాలను నమోదు చేయండి." : "First, register your crop details in the\n'Fields' section."}
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

            <AgriLoader visible={loading} type="saving" language={language} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F6F7F6" },
    container: { padding: 20, flexGrow: 1 },
    
    inputBox: { 
        flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", 
        borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 16, 
        borderWidth: 1, borderColor: "#D1D5DB" 
    },
    inputFocused: { 
        borderColor: "#DC2626", 
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputError: { borderColor: "#EF4444" },
    errorText: {
        color: "#EF4444",
        fontSize: 12,
        fontFamily: "Mandali",
        marginTop: -10,
        marginBottom: 10,
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
    customPlaceholder: {
        position: 'absolute',
        fontSize: 16,
        color: "#9CA3AF",
        fontFamily: "Mandali"
    },
    
    saveBtn: { marginTop: 10, borderRadius: 18, overflow: "hidden" },
    saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '75%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitleText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    
    searchBar: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', 
      margin: 20, borderRadius: 18, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB'
    },
    searchInput: { flex: 1, height: 54, fontSize: 16, color: '#1F2937' },
    
    categoryItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    categoryItemText: { fontSize: 16, color: '#374151' },
    
    infoBox: {
      flexDirection: "row", alignItems: "flex-start", gap: 8,
      backgroundColor: "#FFFBEB", borderRadius: 14, padding: 12,
      marginTop: -6, marginBottom: 10, borderWidth: 1, borderColor: "#FDE68A"
    },
    infoText: {
      flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18, fontFamily: "Mandali"
    },
});