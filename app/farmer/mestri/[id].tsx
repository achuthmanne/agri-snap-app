// app/farmer/mestri/[id].tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList, Modal, SafeAreaView, ScrollView, // 🔥 ScrollView ని యాడ్ చేశాను
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

export default function MestriAttendance() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const [mestriName, setMestriName] = useState("");
  const [village, setVillage] = useState("");
  const [crop, setCrop] = useState("");
  const [work, setWork] = useState("");
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  const [morning, setMorning] = useState(0);
  const [evening, setEvening] = useState(0);
  const [full, setFull] = useState(0);

  // 🔥 INLINE ERRORS STATE
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [showWarning, setShowWarning] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [warningType, setWarningType] = useState<"duplicate" | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const formattedDate = selectedDate.toLocaleDateString("en-GB");
  const normalizedCrop = crop.trim().toLowerCase();
  const normalizedWork = work.trim().toLowerCase();
  
  const [modalType, setModalType] = useState<"crop" | "work" | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeSession, setActiveSession] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userCrops, setUserCrops] = useState<string[]>([]);
  
  const uniqueKey = `${id}_${formattedDate}_${normalizedCrop}_${normalizedWork}`;
  
  const WORKS = [
    { en: "Ploughing", te: "దున్నడం" },
    { en: "Sowing", te: "విత్తడం" },
    { en: "Transplanting", te: "నాటడం" },
    { en: "Weeding", te: "ముల్లు తీసివేయడం" },
    { en: "Harvesting", te: "పంట కోయడం" },
    { en: "Watering", te: "నీరు పోయడం" },
    { en: "Spraying", te: "మందు పిచికారీ" },
    { en: "Loading", te: "లోడింగ్" },
    { en: "Unloading", te: "అన్‌లోడింగ్" },
    { en: "General Work", te: "సాధారణ పని" }
  ];

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
      const snap = await firestore().collection("users").doc(phone).collection("fields").where("session", "==", activeSession).get();
      const set = new Set<string>();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.crop) set.add(data.crop);
      });
      setUserCrops(Array.from(set));
    };
    if (activeSession) loadUserCrops();
  }, [activeSession]);

  const handleVoiceSearch = async () => {
    try {
      ExpoSpeechRecognitionModule.stop();
      const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!res.granted) return;
      setIsListening(true);
      ExpoSpeechRecognitionModule.start({ lang: language === "te" ? "te-IN" : "en-US", interimResults: true });
    } catch (e) {
      console.log("voice error", e);
    }
  };
  
  useSpeechRecognitionEvent("end", () => setIsListening(false));

  useSpeechRecognitionEvent("result", (event) => {
    if (!isListening || modalType === null) return;
    if (event.results?.length) {
      const text = event.results[0].transcript;
      setSearchText(text);
      if (modalType === "crop") { setCrop(text); if (errors.crop) setErrors({ ...errors, crop: "" }); }
      if (modalType === "work") { setWork(text); if (errors.work) setErrors({ ...errors, work: "" }); }
    }
  });

  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang) setLanguage(lang as "te" | "en");
    };
    loadLang();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 250 });
    } else {
      opacity.value = 0;
      translateY.value = 20;
    }
  }, [showSuccess]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  /* ---------------- COUNT ---------------- */
  const inc = (type: string) => {
    if (errors.counts) setErrors({ ...errors, counts: "" }); // Clear count error
    if (type === "morning") setMorning((p) => p + 1);
    if (type === "evening") setEvening((p) => p + 1);
    if (type === "full") setFull((p) => p + 1);
  };

  const dec = (type: string) => {
    if (type === "morning") setMorning((p) => Math.max(0, p - 1));
    if (type === "evening") setEvening((p) => Math.max(0, p - 1));
    if (type === "full") setFull((p) => Math.max(0, p - 1));
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors: any = {};
    if (!crop.trim()) newErrors.crop = language === "te" ? "దయచేసి పంటను ఎంచుకోండి*" : "Please select crop*";
    if (!work.trim()) newErrors.work = language === "te" ? "దయచేసి పనిని ఎంచుకోండి*" : "Please select work*";
    if (morning === 0 && evening === 0 && full === 0) {
      newErrors.counts = language === "te" ? "కనీసం ఒకరి హాజరు నమోదు చేయండి*" : "Add at least one worker's attendance*";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true; 
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const userPhone = await AsyncStorage.getItem("USER_PHONE");
      
      if (!userPhone || !id || !activeSession) {
        setLoading(false); 
        return;
      }

      // Check for duplicate
      const snap = await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .doc(id as string)
        .collection("attendance")
        .where("uniqueKey", "==", uniqueKey)
        .where("session", "==", activeSession)
        .get();

      if (!snap.empty) {
        setLoading(false);
        setWarningType("duplicate");
        setShowWarning(true);
        return;
      }

      await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .doc(id as string)
        .collection("attendance")
        .add({
          date: formattedDate,
          crop: normalizedCrop,
          work: normalizedWork,
          uniqueKey,
          session: activeSession,
          morning,
          evening,
          full,
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .doc(id as string)
        .set({ attendanceSessions: { [activeSession]: true } }, { merge: true });
        
      setLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1600);

    } catch (e) {
      setLoading(false);
      console.log("Attendance save error:", e);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB"); 
  };

  useEffect(() => {
    return () => { ExpoSpeechRecognitionModule.stop(); };
  }, []);

  useEffect(() => {
    const loadMestri = async () => {
      const userPhone = await AsyncStorage.getItem("USER_PHONE");
      if (!userPhone || !id) return;

      const doc = await firestore().collection("users").doc(userPhone).collection("mestris").doc(id as string).get();
      const data = doc.data();
      if (data) {
        setMestriName(data.name || "");
        setVillage(data.village || "");
      }
    };
    loadMestri();
  }, []);

  const options = modalType === "crop" ? userCrops.map(c => ({ en: c, te: c })) : WORKS;
  const filteredData = options.filter(item => {
    const value = (language === "te" ? item.te : item.en).toLowerCase().trim();
    return (value || "").includes(searchText.toLowerCase().trim());
  });

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "హాజరు నమోదు" : "Attendance"}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter Details"}
        language={language}
      />
{/* 🔥 ఇక్కడ View తీసేసి ScrollView పెట్టాను */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.container}
      >
        <View style={styles.mestriBox}>
          <AppText style={styles.mestriName} language={language}>
            {mestriName} {village ? `| ${village}` : ""}
          </AppText>
        </View>

        {/* DATE INPUT */}
        <TouchableOpacity
          style={styles.inputBox1}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color= "#2E7D32" />
          <AppText style={{flex: 1, marginLeft: 10, color: "#111" }} language={language}>
            {formatDate(selectedDate)}
          </AppText>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* CROP INPUT */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.inputBox, activeInput === "crop" && styles.inputFocused, errors.crop && styles.inputError]}
          onPress={() => {
            setModalType("crop");
            setActiveInput("crop");
            setSearchText(crop);
            if (errors.crop) setErrors({ ...errors, crop: "" });
          }}
        >
          <Ionicons name="leaf-outline" size={18} color={crop ? "#16A34A" : "#9CA3AF"} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={{ color: crop ? "#111" : "#9CA3AF" }}>
              {crop || (language === "te" ? "పంట ఎంచుకోండి*" : "Select Crop*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.crop && <AppText style={styles.errorText} language={language}>{errors.crop}</AppText>}

        {/* WORK INPUT */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.inputBox, activeInput === "work" && styles.inputFocused, errors.work && styles.inputError]}
          onPress={() => {
            setModalType("work");
            setActiveInput("work");
            setSearchText(work);
            if (errors.work) setErrors({ ...errors, work: "" });
          }}
        >
          <Ionicons name="people-outline" size={18} color={work ? "#16A34A" : "#9CA3AF"} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={{ color: work ? "#111" : "#9CA3AF" }}>
              {work || (language === "te" ? "పని ఎంచుకోండి*" : "Select Work*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.work && <AppText style={styles.errorText} language={language}>{errors.work}</AppText>}

        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              setShowPicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        <View style={styles.divider} />

        {/* 🔥 GROUND LEVEL COUNTS */}
        <View style={{ marginTop: 10 }}>
          <AppText style={styles.sectionTitle} language={language}>
            {language === "te" ? "హాజరైన కూలీల సంఖ్య" : "Workers Count"}
          </AppText>

          {[
            { label: "Full Day Workers", te: "పూర్తి రోజు చేసినవారు", key: "full", value: full },
            { label: "Morning (Half Day)", te: "సగం పూట (ఉదయం)", key: "morning", value: morning },
            { label: "Afternoon (Half Day)", te: "సగం పూట (మధ్యాహ్నం)", key: "evening", value: evening },
          ].map((item) => (
            <View key={item.key} style={styles.row}>
              <AppText style={styles.label} language={language}>
                {language === "te" ? item.te : item.label}
              </AppText>

              <View style={styles.counter}>
                <TouchableOpacity onPress={() => dec(item.key)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                  <Ionicons name="remove-circle" size={32} color={item.value > 0 ? "#DC2626" : "#E5E7EB"} />
                </TouchableOpacity>

                <AppText style={styles.count}>{item.value}</AppText>

                <TouchableOpacity onPress={() => inc(item.key)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                  <Ionicons name="add-circle" size={32} color="#16A34A" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {errors.counts && <AppText style={[styles.errorText, {marginTop: 10, textAlign: 'center'}]} language={language}>{errors.counts}</AppText>}
        </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.9}>
          <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
            <AppText style={styles.saveText} language={language}>
              {language === "te" ? "భద్రపరచండి" : "Save"}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView> 
      {/* 🔥 ScrollView ఇక్కడితో ఎండ్ అవుతుంది */}

      {/* DUPLICATE WARNING MODAL */}
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningBox}>
            <View style={styles.iconBg}>
              <Ionicons name="warning" size={36} color="#1B5E20" />
            </View>
            <AppText style={styles.warningTitle} language={language}>
              {language === "te" ? "ఇప్పటికే ఉంది" : "Already Exists"}
            </AppText>
            <AppText style={styles.warningText} language={language}>
              {language === "te"
                ? "ఈ తేదీ, పంట, మరియు పని వివరాలతో ఇప్పటికే హాజరు నమోదు అయింది."
                : "Attendance already exists for this date, crop, and work combination."}
            </AppText>

            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => {
                  setShowWarning(false);
                  setTimeout(() => setShowGuide(true), 200);
                }}
              >
                <AppText style={styles.helpText} language={language}>{language === "te" ? "సహాయం" : "Help"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noBtn} onPress={() => setShowWarning(false)}>
                <AppText style={styles.noText} language={language}>{language === "te" ? "సరే" : "Okay"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SELECTION MODALS */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay11}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitleText}>
                {modalType === "crop"
                  ? (language === "te" ? "పంట ఎంచుకోండి" : "Select Crop")
                  : (language === "te" ? "పని ఎంచుకోండి" : "Select Work")}
              </AppText>
              <TouchableOpacity onPress={() => { setModalType(null); setActiveInput(null); }}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { flexDirection: "row", alignItems: "center" }]}>
              <TextInput
                autoFocus
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  if (modalType === "work") setWork(text); 
                }}
                placeholder={language === "te" ? "టైప్ చేయండి..." : "Type here..."}
                placeholderTextColor="#9CA3AF"
                cursorColor={'green'}
                style={[styles.searchInput, { fontFamily: "Mandali", flex: 1 }]}
              />
              {modalType === "work" && searchText.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setWork(searchText);
                    setModalType(null);
                    setSearchText("");
                    setActiveInput(null);
                  }}
                  style={{ backgroundColor: "#16A34A", borderRadius: 12, padding: 6, marginLeft: 6 }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleVoiceSearch} style={{ marginLeft: 10, padding: 6, borderRadius: 10, backgroundColor: "#eaedf2" }}>
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={20} color={isListening ? "#EF4444" : "#16A34A"} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredData}
              keyExtractor={(item, i) => i.toString()}
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
                          onPress={() => {
                            setModalType(null); 
                            router.push("/farmer/fields"); 
                          }}
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
                return searchText.trim().length > 0 && modalType === "work" ? (
                  <TouchableOpacity style={[styles.option, { alignItems: "center" }]} onPress={() => { setWork(searchText); setModalType(null); setSearchText(""); setActiveInput(null); }}>
                    <AppText style={{ color: "#16A34A", fontWeight: "600" }}>{language === "te" ? `"${searchText}" ని చేర్చండి +` : `Add "${searchText}" +`}</AppText>
                  </TouchableOpacity>
                ) : null;
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    const value = language === "te" ? item.te : item.en;
                    modalType === "crop" ? setCrop(value) : setWork(value);
                    setModalType(null);
                    setSearchText("");
                    setActiveInput(null);
                    if (errors.crop && modalType === "crop") setErrors({ ...errors, crop: "" });
                    if (errors.work && modalType === "work") setErrors({ ...errors, work: "" });
                  }}
                >
                  <AppText>{language === "te" ? item.te : item.en}</AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showGuide} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.guideBox}>
            <AppText style={styles.guideTitle} language={language}>
              {language === "te" ? "ఏం చేయాలి?" : "What to do?"}
            </AppText>
            <AppText style={styles.guideText} language={language}>
              {language === "te" ? "ఈ రోజుటి హాజరు వివరాలు మార్చాలనుకుంటే 'హిస్టరీ' లోకి వెళ్లి సవరించుకోండి." : "If you want to edit today's attendance, please go to History and edit it."}
            </AppText>
            <View style={styles.rowBtns}>
              <TouchableOpacity style={[styles.noBtn, {backgroundColor: '#F1F5F9'}]} onPress={() => setShowGuide(false)}>
                <AppText style={[styles.noText, {color: '#4B5563'}]} language={language}>{language === "te" ? "వద్దు" : "Close"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.historyBtn} onPress={() => { setShowGuide(false); router.push("/farmer/attendance-history"); }}>
                <AppText style={styles.historyText} language={language}>{language === "te" ? "హిస్టరీ చూడండి" : "View History"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccess} transparent>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, animStyle]}>
            <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
            <AppText style={styles.successText} language={language}>
              {language === "te" ? "హాజరు విజయవంతంగా సేవ్ అయింది" : "Attendance Saved successfully"}
            </AppText>
          </Animated.View>
        </View>
      </Modal>

      <AgriLoader visible={loading} type="saving" language={language} />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  // 🔥 కింద సేవ్ బటన్ కింద గ్యాప్ ఉండటానికి paddingBottom: 40 యాడ్ చేశాను
  container: { padding: 20, paddingBottom: 40, overflow: "visible" },
  inputBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 14,
    borderWidth: 1, borderColor: "#E5E7EB"
  },
  inputBox1: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 14,
    borderWidth: 1, borderColor: "#2E7D32", shadowColor: "#2E7D32"
  },
  inputFocused: { borderColor: "#2E7D32", shadowColor: "#2E7D32", shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  inputError: { borderColor: "#EF4444" },
  errorText: { color: "#EF4444", fontSize: 12, fontFamily: "Mandali", marginTop: -10, marginBottom: 14, marginLeft: 4 },
  
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 15, marginLeft: 4 },

  row: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#F3F4F6" },
  label: { fontSize: 15, fontWeight: "600", color: "#374151" },
  counter: { flexDirection: "row", alignItems: "center", gap: 20 },
  count: { fontSize: 20, fontWeight: "700", color: "#111827", width: 24, textAlign: 'center' },

  iconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#E8F5E9", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  saveBtn: { marginTop: 35, borderRadius: 18, overflow: "hidden", elevation: 4 },
  saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  saveText: { color: "white", fontSize: 16, fontWeight: "600" },
  
  modalOverlay11: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  successOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.1)" },
  
  successCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", borderLeftWidth: 4, borderLeftColor: "#16A34A", elevation: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", margin: 20, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  searchInput: { flex: 1, height: 50, color: "#1F2937", fontSize: 16 },
  successText: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  
  warningBox: { width: "85%", backgroundColor: "white", borderRadius: 20, padding: 24, alignItems: "center" },
  warningTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 6 },
  warningText: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  rowBtns: { flexDirection: "row", gap: 10, marginTop: 10 },
  helpBtn: { flex: 1, backgroundColor: "#E8F5E9", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  helpText: { color: "#2E7D32", fontWeight: "600" },
  noBtn: { flex: 1, backgroundColor: "#16A34A", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  noText: { color: "white", fontWeight: "600" },
  
  guideBox: { width: "85%", backgroundColor: "white", borderRadius: 22, padding: 24 },
  guideTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 10 },
  guideText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },
  historyBtn: { flex: 1.5, backgroundColor: "#2E7D32", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  historyText: { color: "white", fontWeight: "600" },

  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25, height: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalTitleText: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  option: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  
  mestriBox: { alignItems: "center", marginTop: 5, marginBottom: 15 },
  mestriName: { fontSize: 18, fontWeight: "600", color: "#1F2937", includeFontPadding: false },
});