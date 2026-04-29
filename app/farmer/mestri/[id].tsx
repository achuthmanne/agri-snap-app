//app/farmer/mestri/[id].tsx
// This screen allows the farmer to add attendance details for a specific Mestri. It includes fields for date, crop, work, and shift counts (morning, evening, full day). It validates the input, checks for duplicates, and saves the attendance record to Firestore. It also handles loading states and shows success or error messages as needed.
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList, Keyboard, Modal, Pressable, SafeAreaView,
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
  const [date, setDate] = useState("");
  const [crop, setCrop] = useState("");
  const [work, setWork] = useState("");
const [language, setLanguage] = useState<"te" | "en">("te");
const [selectedDate, setSelectedDate] = useState(new Date());
const [showPicker, setShowPicker] = useState(false);
  const [morning, setMorning] = useState(0);
  const [evening, setEvening] = useState(0);
  const [full, setFull] = useState(0);
const [showWarning, setShowWarning] = useState(false);
const [showGuide, setShowGuide] = useState(false);
const [warningType, setWarningType] = useState<"empty" | "duplicate" | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaderType, setLoaderType] = useState("saving");
const [showSuccess, setShowSuccess] = useState(false);
const [focusedField, setFocusedField] = useState<string | null>(null);
const cropRef = useRef<TextInput>(null);
const workRef = useRef<TextInput>(null);
const [showCrop, setShowCrop] = useState(false);
const [showWork, setShowWork] = useState(false);
const formattedDate = selectedDate.toDateString(); 
const normalizedCrop = crop.trim().toLowerCase();
const normalizedWork = work.trim().toLowerCase();
const [modalType, setModalType] = useState<"crop" | "work" | null>(null);
const [searchText, setSearchText] = useState("");
const [isListening, setIsListening] = useState(false);
const [userCrops, setUserCrops] = useState<string[]>([]);
const uniqueKey = `${formattedDate}_${normalizedCrop}_${normalizedWork}`;

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
      const data = doc.data();
      if (data.crop) set.add(data.crop);
    });

    setUserCrops(Array.from(set));
  };

  loadUserCrops();
}, []);
const handleVoiceSearch = async () => {
  try {
    // 🔥 stop previous session
    ExpoSpeechRecognitionModule.stop();

    const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!res.granted) return;

    setIsListening(true);

    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });

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

    if (modalType === "crop") setCrop(text);
    if (modalType === "work") setWork(text);
  }
});



const filterData = (list: any[], value: string) => {
  return list.filter(item =>
    item.en.toLowerCase().includes(value.toLowerCase()) ||
    item.te.includes(value)
  );
};

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
const tickScale = useSharedValue(0);

useEffect(() => {
  if (showSuccess) {
    tickScale.value = withTiming(1, { duration: 300 });
  } else {
    tickScale.value = 0;
  }
}, [showSuccess]);

const tickStyle = useAnimatedStyle(() => ({
  transform: [{ scale: tickScale.value }]
}));
/* ---------------- COUNT ---------------- */

  const inc = (type: string) => {
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
  if (!crop.trim() || !work.trim()) {
    setWarningType("empty");
    setShowWarning(true);
    return false;
  }

  return true; // 🔥 IMPORTANT
};

  /* ---------------- SAVE ---------------- */

 const handleSave = async () => {
  if (!validate()) return;

  try {
    setLoaderType("saving");
    setLoading(true);

    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone || !id) return;

    const snap = await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .doc(id as string)
      .collection("attendance")
      .where("uniqueKey", "==", uniqueKey)
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
        morning,
        evening,
        full,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

    // ✅ STOP LOADER
    setLoading(false);

    // ✅ SHOW SUCCESS
    setShowSuccess(true);

    // ✅ AUTO BACK AFTER ANIMATION
    setTimeout(() => {
      setShowSuccess(false);
      router.back();
    }, 1600);

  } catch (e) {
    setLoading(false);
  }
};
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB"); // current date in dd/mm/yyyy format
};

useEffect(() => {
  const loadMestri = async () => {
    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone || !id) return;

    const doc = await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .doc(id as string)
      .get();

    const data = doc.data();

    if (data) {
      setMestriName(data.name || "");
      setVillage(data.village || "");
    }
  };

  loadMestri();
}, []);

const options =
  modalType === "crop"
    ? userCrops.map(c => ({ en: c, te: c }))
    : WORKS;
const filteredData = options.filter(item => {
  const value = (language === "te" ? item.te : item.en)
    .toLowerCase()
    .trim();

  return value.includes(searchText.toLowerCase().trim());
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

      <View style={styles.container}>
<View style={styles.mestriBox}>
  <AppText style={styles.mestriName} language={language}>
  {mestriName} {village ? `| ${village}` : ""}
</AppText>
</View>
        {/* INPUTS */}
       {/* date */}
       <TouchableOpacity
  style={styles.inputBox1}
  onPress={() => setShowPicker(true)}
  activeOpacity={0.7}
>
  <Ionicons name="calendar-outline" size={18} color= "#2E7D32" />

  <AppText style={{flex: 1, marginLeft: 10 }} language={language}>
    {formatDate(selectedDate)}
  </AppText>
  <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
</TouchableOpacity>
{/* crop */}
<TouchableOpacity
  activeOpacity={0.7}
  style={styles.inputBox}
  onPress={() => {
    setModalType("crop");
    setSearchText(crop);
  }}
>
  <Ionicons name="leaf-outline" size={18} color={crop? "#2E7D32": "#9CA3AF"} />

  <View style={{ flex: 1, marginLeft: 10 }}>
    <AppText style={{ color: crop ? "#111" : "#9CA3AF" }}>
      {crop || (language === "te" ? "పంట ఎంచుకోండి" : "Select Crop")}
    </AppText>
  </View>

  <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
</TouchableOpacity>
{/* work */}
<TouchableOpacity
  activeOpacity={0.7}
  style={styles.inputBox}
  onPress={() => {
    setModalType("work");
    setSearchText(work);
  }}
>
  <Ionicons name="people-outline" size={18} color={work? "#2E7D32": "#9CA3AF"} />

  <View style={{ flex: 1, marginLeft: 10 }}>
    <AppText style={{ color: work ? "#111" : "#9CA3AF" }}>
      {work || (language === "te" ? "పని ఎంచుకోండి" : "Select Work")}
    </AppText>
  </View>

  <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
</TouchableOpacity>


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
        {/* COUNTS */}
        {[
          { label: "Morning Shift", te: "ఉదయం పూట (మొదటి పూట)", key: "morning", value: morning },
           { label: "Evening Shift", te: "సాయంత్రం పూట (రెండవ పూట)", key: "evening", value: evening },
          { label: "Full Day", te: "రోజంతా / పూర్తి పూట", key: "full", value: full }

        ].map((item) => (
          <View key={item.key} style={styles.row}>
            <AppText style={styles.label} language={language}>
              {language === "te" ? item.te : item.label}
            </AppText>

            <View style={styles.counter}>
              <TouchableOpacity onPress={() => dec(item.key)}>
                <Ionicons name="remove-circle" size={26} color="#DC2626" />
              </TouchableOpacity>

              <AppText style={styles.count}>{item.value}</AppText>

              <TouchableOpacity onPress={() => inc(item.key)}>
                <Ionicons name="add-circle" size={26} color="#16A34A" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* SAVE */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
                 <LinearGradient
                   colors={["#2E7D32", "#1B5E20"]}
                   style={styles.saveGradient}
                 >
                   <AppText style={styles.saveText} language={language}>
                     {language === "te" ? "సేవ్ చేయండి" : "Save"}
                   </AppText>
                 </LinearGradient>
               </TouchableOpacity>

      </View>

    <Modal visible={showWarning} transparent animationType="fade">
  <View style={styles.modalOverlay}>

    <View style={styles.warningBox}>

      <View style={styles.iconBg}>
        <Ionicons name="warning" size={36} color="#1B5E20" />
      </View>

      <AppText style={styles.warningTitle} language={language}>
        {warningType === "duplicate"
          ? (language === "te" ? "ఇప్పటికే ఉంది" : "Already Exists")
          : (language === "te" ? "లోపం" : "Error")}
      </AppText>

      <AppText style={styles.warningText} language={language}>
        {warningType === "duplicate"
          ? (language === "te"
              ? "ఈ తేదీ, పంట, పని ఇప్పటికే నమోదు అయింది"
              : "Already exists for this date, crop and work")
          : (language === "te"
              ? "పంట మరియు పని నమోదు చేయండి"
              : "Please enter crop and work")}
      </AppText>

      {/* BUTTONS */}
      {warningType === "duplicate" ? (
        <View style={styles.rowBtns}>

          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => {
              setShowWarning(false);
              setTimeout(() => setShowGuide(true), 200);
            }}
          >
            <AppText style={styles.helpText} language={language}>
              {language === "te" ? "సహాయం" : "Help"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.noBtn}
            onPress={() => {
              setShowWarning(false);
              router.back();
            }}
          >
            <AppText style={styles.noText} language={language}>
              {language === "te" ? "వద్దు" : "No Thanks"}
            </AppText>
          </TouchableOpacity>

        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowWarning(false)}
          style={styles.okBtn}
        >
          <AppText style={{ color: "white" }} language={language}>
            {language === "te" ? "సరే" : "Okay"}
          </AppText>
        </TouchableOpacity>
      )}

    </View>

  </View>
</Modal>

<Modal visible={modalType !== null} transparent animationType="slide">
  <View style={styles.modalOverlay11}>
    <View style={styles.modalContent}>

      {/* HEADER */}
      <View style={styles.modalHeader}>
        <AppText style={styles.modalTitleText}>
          {modalType === "crop"
            ? (language === "te" ? "పంట ఎంచుకోండి" : "Select Crop")
            : (language === "te" ? "పని ఎంచుకోండి" : "Select Work")}
        </AppText>

        <TouchableOpacity onPress={() => setModalType(null)}>
          <Ionicons name="close-circle" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* SEARCH + MIC */}
      <View style={[styles.searchBar, { flexDirection: "row", alignItems: "center" }]}>

        <TextInput
          autoFocus
          value={searchText}
          onChangeText={(text) => {
  setSearchText(text);

  if (modalType === "work") {
    setWork(text); // only work allow typing
  }
}}
          placeholder={language === "te" ? "టైప్ చేయండి..." : "Type crop..."}
    placeholderTextColor="black"
    cursorColor={'green'}
           style={[styles.searchInput, { fontFamily: "Mandali", flex: 1 }]}
        />
{modalType === "work" && searchText.trim().length > 0 && (
  <TouchableOpacity
    onPress={() => {
      setWork(searchText);
      setModalType(null);
      setSearchText("");
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
        <TouchableOpacity
          onPress={handleVoiceSearch}
          style={{
      marginLeft: 10,
      padding: 6,
      borderRadius: 10,
       backgroundColor: "#eaedf2"
    }}
        >
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={20}
            color={isListening ? "#EF4444" : "#16A34A"}
          />
        </TouchableOpacity>

      </View>

      {/* LIST */}
      <FlatList
       data={filteredData}
        keyExtractor={(item, i) => i.toString()}
      ListEmptyComponent={() => {
  // 🌾 CROP EMPTY STATE
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
      ? "మొదట 'నా పొలాలు' విభాగంలో\nపంట వివరాలను నమోదు చేయండి."
      : "First, register your crop details in the\n'My Fields' section."}
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

  // 👷 WORK EMPTY STATE (OLD BEHAVIOR)
  return searchText.trim().length > 0 ? (
    <TouchableOpacity
      style={[styles.option, { alignItems: "center" }]}
      onPress={() => {
        setWork(searchText);
        setModalType(null);
        setSearchText("");
      }}
    >
      <AppText style={{ color: "#16A34A", fontWeight: "600" }}>
        {language === "te"
          ? `"${searchText}" ని చేర్చండి +`
          : `Add "${searchText}" +`}
      </AppText>
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
            }}
          >
            <AppText>
              {language === "te" ? item.te : item.en}
            </AppText>
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
        {language === "te"
          ? "హాజరు చరిత్ర(కి) వెళ్లి తప్పు నమోదు తొలగించి మళ్లీ చేర్చండి"
          : "Go to Attendance History, delete and add again"}
      </AppText>

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => {
          setShowGuide(false);
          router.push("/farmer/attendance-history");
        }}
      >
        <AppText style={styles.historyText} language={language}>
          {language === "te" ? "హిస్టరీ చూడండి" : "View History"}
        </AppText>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
<Modal visible={showSuccess} transparent>
  <View style={styles.successOverlay}>

    <Animated.View style={[styles.successCard, animStyle]}>

      <Ionicons name="checkmark-circle" size={32} color="#16A34A" />

      <AppText style={styles.successText} language={language}>
        {language === "te"
          ? "హాజరు విజయవంతంగా సేవ్ అయింది"
          : "Attendance Saved successfully"}
      </AppText>

    </Animated.View>

  </View>
</Modal>
      {/* LOADER */}
      <AgriLoader visible={loading} type="saving" language={language} />
      
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },

  container: {
  padding: 20,
  overflow: "visible"   // 👈 MUST ADD
},
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
 inputBox1: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: "#2E7D32",

  shadowColor: "#2E7D32",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15
  },
inputFocused: {
  borderColor: "#2E7D32",

  shadowColor: "#2E7D32",
  shadowOpacity: 0.15,
  shadowRadius: 6,

  elevation: 3
},
  row: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  label: {
    fontSize: 15,
    fontWeight: "600"
  },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15
  },

  count: {
    fontSize: 18,
    fontWeight: "600"
  },
iconBg: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#E8F5E9",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10
},
  saveBtn: {
    marginTop: 25,
    borderRadius: 18,
    overflow: "hidden"
  },
   modalOverlay11: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "flex-end"
},
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center"
},
successOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.1)" // very light
},

successCard: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,

  backgroundColor: "#fff",
  paddingVertical: 14,
  paddingHorizontal: 18,

  borderRadius: 14,

  borderWidth: 1,
  borderColor: "#E5E7EB",
   
  borderLeftWidth: 4,
  borderLeftColor: "#16A34A",
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 4
},
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
successText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#1F2937"
},
warningBox: {
  width: "85%",
  backgroundColor: "white",
  borderRadius: 20,
  padding: 20,
  alignItems: "center"
},

warningTitle: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1B5E20",
  marginBottom: 6
},

warningText: {
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  marginBottom: 18
},

rowBtns: {
  flexDirection: "row",
  gap: 10
},

helpBtn: {
  flex: 1,
  backgroundColor: "#E8F5E9",
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center"
},

helpText: {
  color: "#2E7D32",
  fontWeight: "600"
},

noBtn: {
  flex: 1,
  backgroundColor: "#EF4444",
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center"
},

noText: {
  color: "white",
  fontWeight: "600"
},


successBox: {
  width: 140,
  height: 140,
  borderRadius: 70,

  backgroundColor: "#22C55E",
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#22C55E",
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 10
},


guideBox: {
  width: "90%",
  backgroundColor: "white",
  borderRadius: 22,
  padding: 22
},

guideTitle: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1B5E20",
  marginBottom: 10
},

guideText: {
  fontSize: 14,
  color: "#4B5563",
  lineHeight: 20
},

historyBtn: {
  marginTop: 20,
  backgroundColor: "#2E7D32",
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center"
},

historyText: {
  color: "white",
  fontWeight: "600"
},

okOutline: {
  marginTop: 10,
  alignItems: "center"
},

okOutlineText: {
  color: "#6B7280"
},


okBtn: {
  backgroundColor: "#2E7D32",
  paddingHorizontal: 25,
  paddingVertical: 10,
  borderRadius: 12
},
  modalOverlay1: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.1)",
  justifyContent: "center",
  paddingHorizontal: 20
},

modalDropdown: {
  backgroundColor: "#fff",
  borderRadius: 10,
  maxHeight: 300,
  paddingVertical: 10
},
mestriBox: {
  alignItems: "center",
  marginTop: 10,
  marginBottom: 10
},

mestriName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#1F2937",
marginTop: -6,
  includeFontPadding: false,   // 👈 MUST
                // 👈 CONTROL HEIGHT
},
 saveText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600"
  },
  saveGradient: {
    height: 52,
    justifyContent: "center",
    alignItems: "center"
  },
dropdownWrapperCrop: {
  position: "relative",
  zIndex: 100   // 👈 INCREASE
},
dropdownWrapperWork: {
  position: "relative",
  zIndex: 50   // 👈 LOW
},
dropdown: {
  position: "absolute",
  top: 65,
  width: "100%",

  backgroundColor: "#fff",
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#E5E7EB",

  maxHeight: 200,

  zIndex: 9999,
  elevation: 20,

  pointerEvents: "auto"   // 👈 ADD THIS
},
option: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#F1F5F9"
},

optionText: {
  fontSize: 14,
  color: "#1F2937"
},
modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 26,
  alignItems: "center"
},

modalTitle: {
  marginTop: 10,
  fontSize: 15,
  textAlign: "center"
},



okText: {
  color: "#fff",
  fontWeight: "600"
},
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    alignItems: "center"
  },

  warnText: {
    marginVertical: 10
  },

modalContent: {
  backgroundColor: "#fff",
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  height: "75%"
},

modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 20,
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6"
},

modalTitleText: {
  fontSize: 18,
  fontWeight: "600",
  color: "#1F2937"
},


searchInput: {
  flex: 1,
  height: 54,
  fontSize: 16,
  color: "#1F2937"
},

});