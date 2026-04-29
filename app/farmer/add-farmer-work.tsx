//add farmer work
import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import firestore from "@react-native-firebase/firestore";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function AddFarmerWork() {
const acresInputRef = useRef<TextInput>(null);
  const [language, setLanguage] = useState<"te" | "en">("te");

  const [activeInput, setActiveInput] = useState<string | null>(null);
const [workType, setWorkType] = useState<"time" | "acres" | null>(null);
const [showTypeModal, setShowTypeModal] = useState(true); // Screen open avvagane modal ravali

  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [crop, setCrop] = useState("");
  const [work, setWork] = useState("");

  const [modalType, setModalType] = useState<"crop" | "work" | null>(null);
  const [searchText, setSearchText] = useState("");

  const [acres, setAcres] = useState("");
const [duration, setDuration] = useState("");
const [unit, setUnit] = useState(language === "te" ? "గంటలు" : "Hrs");
const [ratePerHour, setRatePerHour] = useState(""); // 👈 Iidhi add cheyyandi

const [hrs, setHrs] = useState("");
const [mins, setMins] = useState("");
const hrsInputRef = useRef<TextInput>(null);
const minsInputRef = useRef<TextInput>(null);
const rateInputRef = useRef<TextInput>(null); // 👈 Iidhi kuda add cheyyandi
const [saalluCount, setSaalluCount] = useState(""); // ఎన్ని సాళ్లు
const [ratePerSaalu, setRatePerSaalu] = useState(""); // ఒక్క సాళ్లుకు ధర
const saalluInputRef = useRef<TextInput>(null);
const rateSaaluInputRef = useRef<TextInput>(null);

const [payableAmount, setPayableAmount] = useState(""); // User editable total
const [advanceAmount, setAdvanceAmount] = useState("0"); // Advance (default 0)

const payableInputRef = useRef<TextInput>(null);
const advanceInputRef = useRef<TextInput>(null);

const [notes, setNotes] = useState("");

const [errorModal, setErrorModal] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [saving, setSaving] = useState(false);
const router = useRouter();
const { vehicleId, farmerId } = useLocalSearchParams(); 
const notesInputRef = useRef<TextInput>(null);
const isFocused = useIsFocused();
const [isListening, setIsListening] = useState(false);
// Automatic ga Calculation maragane Payable Amount update avvali
useEffect(() => {
  if (workType === "time") {
    const h = parseFloat(hrs) || 0;
    const m = parseFloat(mins) || 0;
    const r = parseFloat(ratePerHour) || 0;
    const totalInHrs = h + (m / 60);
    setPayableAmount(Math.round(totalInHrs * r).toString());
  } else if (workType === "acres") {
    const count = parseFloat(saalluCount) || 0;
    const rate = parseFloat(ratePerSaalu) || 0;
    setPayableAmount(Math.round(count * rate).toString());
  }
}, [hrs, mins, ratePerHour, saalluCount, ratePerSaalu, workType]);

const getCalculationDetails = () => {
  if (workType === "time") {
    const h = parseFloat(hrs) || 0;
    const m = parseFloat(mins) || 0;
    const r = parseFloat(ratePerHour) || 0;

    const totalInHrs = h + (m / 60);
    const totalAmount = totalInHrs * r;

    let calcStep = "";
    if (h > 0 || m > 0) {
      calcStep = language === "te"
        ? `${h} గం ${m} ని × ₹${r}`
        : `${h} hr ${m} min × ₹${r}`;
    }

    return {
      amount: totalAmount.toFixed(0),
      calcStep,
      hasValue: (h > 0 || m > 0) && r > 0
    };
  }

  // 🔥 ACRES LOGIC ADD
  if (workType === "acres") {
    const s = parseFloat(saalluCount) || 0;
    const r = parseFloat(ratePerSaalu) || 0;
    const total = s * r;

    return {
      amount: total.toFixed(0),
      calcStep: `${s} × ₹${r}`,
      hasValue: s > 0 && r > 0
    };
  }

  return { amount: "0", calcStep: "", hasValue: false };
};
// Final Calculation
const getFinalAmount = () => {
  const p = parseFloat(payableAmount) || 0;
  const a = parseFloat(advanceAmount) || 0;
  const final = p - a;
  
  // Minus lo unte 0 chupinchali leda correct format lo chupinchali
  return (final < 0 ? 0 : final).toLocaleString('en-IN');
};

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


const workOptions = [
  { "en": "Bailing (Straw)", "te": "గడ్డి చుట్టలు చుట్టడం (బేలర్)" },
  { "en": "Blade Harrowing (Gorru)", "te": "గొర్రు తోలడం" },
   { "en": "Blade Harrowing", "te": "గుంటక తోలడం" },
  { "en": "Borewell Drilling", "te": "బోరు బావి తవ్వకం" },
  { "en": "Bund Forming", "te": "గట్లు వేయడం" },
  { "en": "Cage Wheel Puddling", "te": "కేజ్ వీల్ దమ్మి (పల్లేరు చక్రాలు)" },
  { "en": "Chaff Cutting", "te": "గడ్డి కత్తిరించడం" },
  { "en": "Combined Harvesting (Paddy)", "te": "వరి కోత (హార్వెస్టర్)" },
  { "en": "Corn Shelling", "te": "మొక్కజొన్న వలుపు" },
  { "en": "Cultivator Ploughing", "te": "కల్టివేటర్ దుక్కి" },
  { "en": "Digging (Earth)", "te": "జేసీబీ మట్టి పని (JCB/Excavator)" },
  { "en": "Disc Harrowing", "te": "డిస్క్ హారో దున్నడం" },
  { "en": "Ditching / Trenching", "te": "కాలువలు / గుంతలు తీయడం" },
  { "en": "Drone Spraying", "te": "డ్రోన్ పిచికారీ" },
  { "en": "Fruit Plucking", "te": "పండ్ల కోత" },
  { "en": "Ginning (Cotton)", "te": "పత్తి గిన్నింగ్" },
  { "en": "Grass Cutting", "te": "గడ్డి కోయడం" },
  { "en": "Inter-Cultivation (Sallu)", "te": "అంతరకృషి (సళ్లు తోలడం)" },
  { "en": "Land Leveling (Gorru)", "te": "సదును గొర్రు (లెవలింగ్)" },
  { "en": "Laser Land Leveling", "te": "లేజర్ లెవలింగ్" },
  { "en": "MB Ploughing", "te": "మడక దుక్కి (పెద్ద నాగలి)" },
  { "en": "Mud Spraying", "te": "బురద పిచికారీ" },
  { "en": "Multi-Crop Threshing", "te": "నూర్పిడి (థ్రెషర్)" },
  { "en": "Paddy Nursery Sowing", "te": "వరి నారు పోయడం" },
  { "en": "Paddy Reaping", "te": "వరి కోత (రీపర్)" },
  { "en": "Paddy Transplanting", "te": "వరి నాటు మిషన్" },
  { "en": "Power Weeding", "te": "పవర్ వీడర్ కలుపు తీయడం" },
  { "en": "Pumping Water", "te": "నీరు తోడటం (ఇంజన్/మోటార్)" },
  { "en": "Rotavator Puddling", "te": "రోటవేటర్ దమ్మి / దుక్కి" },
  { "en": "Seed Drilling / Sowing", "te": "విత్తనం వేయడం (సీడ్ డ్రిల్)" },
  { "en": "Shredding (Stalks)", "te": "చెత్తను పొడి చేయడం (ష్రెడ్డర్)" },
  { "en": "Sugarcane Loading", "te": "చెరకు లోడింగ్" },
  { "en": "Tipping / Transport", "te": "ట్రాక్టర్ రవాణా (ట్రిప్పింగ్)" },
  { "en": "Tractor Spraying", "te": "ట్రాక్టర్ పిచికారీ" }
];


const handleVoiceInput = async (target: "crop" | "work") => {
  try {
    // 🔥 STOP previous (important)
    ExpoSpeechRecognitionModule.stop();

    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;

    setActiveInput(target);
    setSearchText(""); // fresh start
    setIsListening(true);

    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });

  } catch (e) {
    console.log("Mic error", e);
  }
};
useSpeechRecognitionEvent("result", (event) => {
  if (!isFocused) return;

  if (!event.results || event.results.length === 0) return;

  const text = event.results[0].transcript;

  if (modalType === "crop") {
    setCrop(text);
    setSearchText(text);
  } 
  else if (modalType === "work") {
    setWork(text);
    setSearchText(text);
  } 
  else if (activeInput === "notes") {
    setNotes((prev) => prev ? prev + " " + text : text); // 🔥 append
  }
});
useSpeechRecognitionEvent("end", () => {
  setIsListening(false);
});
useEffect(() => {
  return () => {
    ExpoSpeechRecognitionModule.stop(); // 🔥 no leak
  };
}, []);
const handleNotesVoice = async () => {
  try {
    ExpoSpeechRecognitionModule.stop(); // 🔥 reset

    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;

    setActiveInput("notes");
    setIsListening(true);

    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });

  } catch (e) {
    console.log("Notes mic error", e);
  }
};

// 1. Language type ni define chey
type SupportedLang = 'en' | 'te';

// 2. Function lo lang type ni specify chey
const validate = (lang: SupportedLang = 'en') => { 
  const msg: Record<string, Record<SupportedLang, string>> = {
    date: { en: "Select Date", te: "తేదీని ఎంచుకోండి" },
    crop: { en: "Select Crop", te: "పంటను ఎంచుకోండి" },
    work: { en: "Select Work", te: "పనిని ఎంచుకోండి" },
    acres: { en: "Enter Acres", te: "ఎకరాలు నమోదు చేయండి" },
    duration: { en: "Enter Work Duration", te: "పని సమయాన్ని నమోదు చేయండి" },
    rate: { en: "Enter Rate", te: "ధరను నమోదు చేయండి" },
    saallu: { en: "Enter Saallu", te: "సాళ్ల సంఖ్య నమోదు చేయండి" },
    amount: { en: "Invalid Amount", te: "మొత్తం సరికాదు" }
  };

  if (!date) return msg.date[lang];
  if (!crop) return msg.crop[lang];
  if (!work) return msg.work[lang];
  if (!acres) return msg.acres[lang];

  if (workType === "time") {
    if (!hrs && !mins) return msg.duration[lang];
    if (!ratePerHour) return msg.rate[lang];
  }

  if (workType === "acres") {
    if (!saalluCount) return msg.saallu[lang];
    if (!ratePerSaalu) return msg.rate[lang];
  }

  if (!payableAmount) return msg.amount[lang];

  return null;
};

const handleSave = async () => {
  const err = validate(language);

  if (err) {
    setErrorMsg(err);
    setErrorModal(true);
    return;
  }

  const phone = await AsyncStorage.getItem("USER_PHONE");
  if (!phone || !vehicleId) return;

  setSaving(true);

  try {
    await firestore()
      .collection("users")
      .doc(phone)
      .collection("vehicles")
      .doc(vehicleId as string)
      .collection("works")
.doc(farmerId as string)
.collection("entries")// or "works" (better same name maintain)
      .add({
        date,
        crop,
        work,
        acres,
        workType,
        hrs,
        mins,
        ratePerHour,
        saalluCount,
        ratePerSaalu,
        payableAmount,
        advanceAmount,
        finalAmount: getFinalAmount(),
        notes,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

   setTimeout(() => {
  setSaving(false);
  router.back();
}, 800); // smooth feel

   

  } catch (e) {
    setSaving(false);
    setErrorMsg("Something went wrong");
    setErrorModal(true);
  }
};
  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
  }, []);

const options = modalType === "crop" ? cropOptions : workOptions;

const filteredData = options.filter(item => {
  const value = (language === "te" ? item.te : item.en)
    .toLowerCase()
    .trim();

  return value.includes(searchText.toLowerCase().trim());
});

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "పని నమోదు" : "Add Work"}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter details"}
        language={language}
      />

     <ScrollView 
  contentContainerStyle={{ padding: 16, paddingBottom: 300 }} 
  keyboardShouldPersistTaps="handled"
>
  
  {/* 📋 SECTION 1: WORK DETAILS */}
  <View style={styles.sectionHeader}>
     <AppText style={styles.sectionTitle}>
        {language === "te" ? "పని వివరాలు" : "Work Details"}
     </AppText>
  </View>
        {/* 📅 DATE */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.inputBox,
            activeInput === "date" && styles.inputFocused
          ]}
          onPress={() => {
            setActiveInput("date");
            setShowDatePicker(true);
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={date || activeInput === "date" ? "#2E7D32" : "#9CA3AF"}
          />

          <View style={styles.inputWrapper}>
            <AppText style={{
              color: date ? "#1F2937" : "#9CA3AF"
            }}>
              {date || (language === "te" ? "తేదీ ఎంచుకోండి*" : "Select Date*")}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* 🌾 CROP */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.inputBox,
            activeInput === "crop" && styles.inputFocused
          ]}
          onPress={() => {
            setModalType("crop");
            setActiveInput("crop");
          }}
        >
          <Ionicons
            name="leaf-outline"
            size={20}
            color={crop || activeInput === "crop" ? "#2E7D32" : "#9CA3AF"}
          />

          <View style={styles.inputWrapper}>
            <AppText style={{
              color: crop ? "#1F2937" : "#9CA3AF"
            }}>
              {crop || (language === "te" ? "పంట ఎంచుకోండి*" : "Select Crop*")}
            </AppText>
          </View>

          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 🛠 WORK */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.inputBox,
            activeInput === "work" && styles.inputFocused
          ]}
          onPress={() => {
            setModalType("work");
            setActiveInput("work");
          }}
        >
         <MaterialCommunityIcons
  name="tractor"
  size={20}
  color={work || activeInput === "work" ? "#2E7D32" : "#9CA3AF"}
/>


          <View style={styles.inputWrapper}>
            <AppText style={{
              color: work ? "#1F2937" : "#9CA3AF"
            }}>
              {work || (language === "te" ? "పని ఎంచుకోండి*" : "Select Work*")}
            </AppText>
          </View>

          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

{/* 📏 ACRES */}
<TouchableOpacity
  activeOpacity={1}
  style={[
    styles.inputBox,
    activeInput === "acres" && styles.inputFocused
  ]}
  onPress={() => {
    setActiveInput("acres");
    acresInputRef.current?.focus(); // ఇక్కడ useRef వాడుతున్నాం
  }}
>
  <Ionicons
    name="resize-outline"
    size={20}
    color={acres || activeInput === "acres" ? "#2E7D32" : "#9CA3AF"}
  />

  <View style={styles.inputWrapper}>
    {/* Placeholder as AppText - Matches Date/Crop style */}
    {!acres && activeInput !== "acres" && (
      <AppText style={{ color: "#9CA3AF" }}>
        {language === "te" ? "ఎకరాలు నమోదు చేయండి*" : "Enter Acres*"}
      </AppText>
    )}

    <TextInput
      ref={acresInputRef} // Ref ఇక్కడ ఇచ్చాం
      value={acres}
      onChangeText={setAcres}
      keyboardType="numeric"
      style={[
        styles.input, 
        // టైప్ చేస్తున్నప్పుడు లేదా ఫోకస్ లో ఉన్నప్పుడు మాత్రమే TextInput కనిపిస్తుంది
        { display: (acres || activeInput === "acres") ? "flex" : "none" }
      ]}
      cursorColor="#2E7D32"
      selectionColor={'green'}
      onFocus={() => setActiveInput("acres")}
      onBlur={() => setActiveInput(null)}
    />
  </View>

  {/* 🔥 Automatic Unit Label */}
  {acres.length > 0 && (
    <AppText style={styles.unitText}>
      {language === "te" ? "ఎకరాలు" : "Acres"}
    </AppText>
  )}
</TouchableOpacity>
<View style={styles.divider} />

{/* 🛠️ CONDITIONAL SECTION BASED ON WORK TYPE */}
{workType === "time" ? (
  <View>
    {/* 🕒 TIME BASED SECTION (HH:MM & RATE PER HR) */}
    {/* Ippudu manam paina rasina Time & Costing logic antha ikkada untundi */}
    <View style={styles.sectionHeader}>
       <AppText style={styles.sectionTitle}>
          {language === "te" ? "సమయం మరియు ధర" : "Time & Costing"}
       </AppText>
    </View>
    {/* Time inputs, Rate input, Calculation box... */}
  </View>
) : (
  <View>
    {/* 📏 ACRES BASED SECTION (Coming Soon) */}
     <View style={styles.sectionHeader}>
      <AppText style={styles.sectionTitle}>
        {language === "te" ? "సాళ్ల వివరాలు & ధర" : "Saallu Details & Rate"}
      </AppText>
    </View>

  </View>
)}
{workType === "acres" ? (
  <View>
   

    <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
      {/* LEFT: SAALLU COUNT */}
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.inputBox, { flex: 1, marginBottom: 0 }, activeInput === "saallu" && styles.inputFocused]}
        onPress={() => {
          setActiveInput("saallu");
          saalluInputRef.current?.focus();
        }}
      >
        <Ionicons name="list-outline" size={20} color={saalluCount ? "#2E7D32" : "#9CA3AF"} />
        <View style={styles.inputWrapper}>
          {!saalluCount && activeInput !== "saallu" && (
            <AppText style={{ color: "#9CA3AF", fontSize: 13 }}>
              {language === "te" ? "ఎన్ని సాళ్లు?*" : "No. of Saallu*"}
            </AppText>
          )}
          <TextInput
            ref={saalluInputRef}
            value={saalluCount}
            onChangeText={setSaalluCount}
            keyboardType="numeric"
            cursorColor={'green'}
            selectionColor={'green'}
            style={[styles.input, { display: (saalluCount || activeInput === "saallu") ? "flex" : "none" }]}
            onFocus={() => setActiveInput("saallu")}
            onBlur={() => setActiveInput(null)}
          />
        </View>
      </TouchableOpacity>

      {/* X SYMBOL */}
      <View style={{ justifyContent: 'center' }}>
        <AppText style={{ fontSize: 18, fontWeight: 'bold', color: '#9CA3AF' }}>×</AppText>
      </View>

      {/* RIGHT: RATE PER SAALU */}
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.inputBox, { flex: 1.2, marginBottom: 0 }, activeInput === "rateSaalu" && styles.inputFocused]}
        onPress={() => {
          setActiveInput("rateSaalu");
          rateSaaluInputRef.current?.focus();
        }}
      >
        <Ionicons name="cash-outline" size={20} color={ratePerSaalu ? "#2E7D32" : "#9CA3AF"} />
        <View style={styles.inputWrapper}>
          {!ratePerSaalu && activeInput !== "rateSaalu" && (
            <AppText style={{ color: "#9CA3AF", fontSize: 13 }}>
              {language === "te" ? "సాళ్లుకు ధర (₹)*" : "Rate/Saalu (₹)*"}
            </AppText>
          )}
          <TextInput
            ref={rateSaaluInputRef}
            value={ratePerSaalu}
            onChangeText={setRatePerSaalu}
            keyboardType="numeric"
            cursorColor={'green'}
            selectionColor={'green'}
            style={[styles.input, { display: (ratePerSaalu || activeInput === "rateSaalu") ? "flex" : "none" }]}
            onFocus={() => setActiveInput("rateSaalu")}
            onBlur={() => setActiveInput(null)}
          />
        </View>
      </TouchableOpacity>
    </View> 
    <View style={{ paddingHorizontal: 4, marginBottom: 10 }}>
  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
    <Ionicons name="information-circle-outline" size={14} color="#6B7280" style={{ marginTop: 2 }} />
    <View style={{ marginLeft: 6, flex: 1 }}>
      <AppText style={{ fontSize: 12, color: "#4B5563", lineHeight: 18 }}>
        {language === "te" 
          ? "ఇక్కడ ఎకరాకు ఎన్ని సాళ్లు అనేది కాకుండా, మీరు మొత్తం పొలంలో వేసిన సాళ్ల సంఖ్యను నమోదు చేయండి (ఉదా: 2 ఎకరాల్లో 2 సార్లు దున్నితే 4 సాళ్లు అని ఇవ్వాలి)." 
          : "Enter the total number of Saallu done across the entire field, not per acre."}
      </AppText>
    </View>
  </View>
</View>   
  </View>
  
) : (
  <View>
    {/* Ikkada patha TIME BASED UI logic ni pettu (Duration, Rate per hour etc.) */}
    {/* 🕒 TIME INPUT (HH : MM) */}

<View style={{ marginBottom: 16 }}>

  <AppText style={styles.label}>

    {language === "te" ? "పని చేసిన సమయం (గంటలు : నిమిషాలు)*" : "Work Duration (Hours : Minutes)*"}

  </AppText>

 

  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

   

    {/* HOURS INPUT */}

    <TouchableOpacity

      activeOpacity={1}

      style={[styles.inputBox, { flex: 1, marginBottom: 0 }, activeInput === "hrs" && styles.inputFocused]}

      onPress={() => {

        setActiveInput("hrs");

        hrsInputRef.current?.focus();

      }}

    >

      <View style={styles.inputWrapper}>

        {!hrs && activeInput !== "hrs" && (

          <AppText style={{ color: "#9CA3AF" }}>00</AppText>

        )}

        <TextInput

          ref={hrsInputRef}

          value={hrs}

          onChangeText={setHrs}

          keyboardType="numeric"

          maxLength={2}

          style={[styles.input, { textAlign: 'center', display: (hrs || activeInput === "hrs") ? "flex" : "none" }]}

          cursorColor="#2E7D32"

          onFocus={() => setActiveInput("hrs")}

          onBlur={() => setActiveInput(null)}

        />

      </View>

    <AppText style={{ fontSize: 14, color: "#2E7D32", fontWeight: '600' }}>
  {language === "te" ? "గం" : "Hrs"}
</AppText>
    </TouchableOpacity>



    {/* SEPARATOR */}

    <AppText style={{ fontSize: 24, fontWeight: "bold", color: "#9CA3AF" }}>:</AppText>



    {/* MINUTES INPUT */}

    <TouchableOpacity

      activeOpacity={1}

      style={[styles.inputBox, { flex: 1, marginBottom: 0 }, activeInput === "mins" && styles.inputFocused]}

      onPress={() => {

        setActiveInput("mins");

        minsInputRef.current?.focus();

      }}

    >

      <View style={styles.inputWrapper}>

        {!mins && activeInput !== "mins" && (

          <AppText style={{ color: "#9CA3AF" }}>00</AppText>

        )}

        <TextInput

          ref={minsInputRef}

          value={mins}

          onChangeText={(val) => {

            // Minutes 60 kante ekkuva undakunda logic

            if (parseInt(val) < 60 || val === "") setMins(val);

          }}

          keyboardType="numeric"

          maxLength={2}

          style={[styles.input, { textAlign: 'center', display: (mins || activeInput === "mins") ? "flex" : "none" }]}

          cursorColor="#2E7D32"

          onFocus={() => setActiveInput("mins")}

          onBlur={() => setActiveInput(null)}

        />

      </View>

     <AppText style={{ fontSize: 14, color: "#2E7D32", fontWeight: '600' }}>
  {language === "te" ? "నిమి" : "Min"}
</AppText>

    </TouchableOpacity>



  </View>

</View>
  </View>
)}

{/* 💰 RATE & TOTAL DISPLAY */}
<View style={{ marginBottom: 16 }}>

  {/* ✅ TIME BASED */}
  {workType === "time" && (
    <View style={{ flexDirection: "row", gap: 12 }}>
    {/* LEFT: RATE PER HOUR */}
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.inputBox,
        { flex: 1.5, marginBottom: 0 },
        activeInput === "rate" && styles.inputFocused
      ]}
      onPress={() => {
        setActiveInput("rate");
        rateInputRef.current?.focus();
      }}
    >
      <Ionicons
        name="cash-outline"
        size={20}
        color={ratePerHour || activeInput === "rate" ? "#2E7D32" : "#9CA3AF"}
      />
      <View style={styles.inputWrapper}>
        {!ratePerHour && activeInput !== "rate" && (
          <AppText style={{ color: "#9CA3AF" }}>
            {language === "te" ? "గంటకు ధర (₹)*" : "Rate per Hr (₹)*"}
          </AppText>
        )}
        <TextInput
          ref={rateInputRef}
          value={ratePerHour}
          onChangeText={setRatePerHour}
          keyboardType="numeric"
          style={[
            styles.input,
            { display: (ratePerHour || activeInput === "rate") ? "flex" : "none" }
          ]}
          cursorColor="#2E7D32"
          onFocus={() => setActiveInput("rate")}
          onBlur={() => setActiveInput(null)}
        />
      </View>
    </TouchableOpacity>

    {/* RIGHT: TOTAL DISPLAY */}
    <View
      style={[
        styles.inputBox,
        { flex: 1, marginBottom: 0, backgroundColor: "#F9FAFB", borderColor: "#D1D5DB" }
      ]}
    >
      <View style={[styles.inputWrapper, { marginLeft: 0, alignItems: 'center' }]}>
        <AppText style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
          {language === "te" ? "మొత్తం" : "Total"}
        </AppText>
        <AppText style={{ color: "#111827", fontWeight: "bold", fontSize: 16 }}>
          ₹{getCalculationDetails().amount}
        </AppText>
      </View>
    </View>
  </View>
    
  )}
  {/* 🔥 ACRES BASED FULL WIDTH TOTAL */}
{workType === "acres" && saalluCount && ratePerSaalu && (
  <View
    style={[
      styles.inputBox,
      {
        justifyContent: "center",
        alignItems: "center",
        height: 65,
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0"
      }
    ]}
  >
    <View style={{ alignItems: "center" }}>
      <AppText style={{ fontSize: 12, color: "#6B7280" }}>
        {language === "te" ? "మొత్తం" : "Total Amount"}
      </AppText>

      <AppText style={{ fontSize: 20, fontWeight: "bold", color: "#166534" }}>
        ₹{(parseFloat(saalluCount) * parseFloat(ratePerSaalu)).toLocaleString('en-IN')}
      </AppText>
    </View>
  </View>
)}
  {/* 💡 DYNAMIC CALCULATION INFO BOX */}
{getCalculationDetails().hasValue ? (
  <View style={styles.calculationInfoBox}>
    <View style={styles.infoIconWrapper}>
      <Ionicons name="calculator" size={16} color="#2E7D32" />
    </View>
    
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <AppText style={styles.calcLabel}>
        {language === "te" ? "లెక్కించిన విధానం:" : "Calculation:"}
      </AppText>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AppText style={styles.calcStepText}>
          {getCalculationDetails().calcStep}
        </AppText>
        <AppText style={styles.equalSign}> = </AppText>
        <AppText style={styles.finalCalcAmount}>
          ₹{getCalculationDetails().amount}
        </AppText>
      </View>
    </View>
  </View>
) : null}
</View>
 {/* 💳 SECTION 3: BILLING & SETTLEMENT */}
 <View style={styles.divider} />

  <View style={styles.sectionHeader}>
     <AppText style={styles.sectionTitle}>
        {language === "te" ? "చెల్లింపు వివరాలు" : "Billing Details"}
     </AppText>
  </View>

  {/* Payable, Advance and Final Box ikkada untayi... */}

{/* 💸 BILLING SECTION: PAYABLE - ADVANCE */}
<View style={{ marginBottom: 16 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
    
    {/* LEFT: PAYABLE AMOUNT (AUTO + EDITABLE) */}
    <View style={{ flex: 1 }}>
      <AppText style={styles.label}>
        {language === "te" ? "చెల్లించాల్సిన మొత్తం*" : "Payable Amount*"}
      </AppText>
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.inputBox, { marginBottom: 0 }, activeInput === "payable" && styles.inputFocused]}
        onPress={() => {
          setActiveInput("payable");
          payableInputRef.current?.focus();
        }}
      >
        <TextInput
          ref={payableInputRef}
          value={payableAmount}
          onChangeText={setPayableAmount}
          keyboardType="numeric"
          style={styles.input}
          cursorColor="#2E7D32"
          onFocus={() => setActiveInput("payable")}
          onBlur={() => setActiveInput(null)}
        />
      </TouchableOpacity>
    </View>
    

    {/* MINUS SYMBOL */}
    <Ionicons name="remove" size={24} color="#9CA3AF" style={{ marginTop: 25 }} />

    {/* RIGHT: ADVANCE AMOUNT */}
    <View style={{ flex: 1 }}>
      <AppText style={styles.label}>
        {language === "te" ? "అడ్వాన్స్ (ముందస్తు)" : "Advance Amount"}
      </AppText>
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.inputBox, { marginBottom: 0 }, activeInput === "advance" && styles.inputFocused]}
        onPress={() => {
          setActiveInput("advance");
          advanceInputRef.current?.focus();
        }}
      >
        <TextInput
          ref={advanceInputRef}
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          keyboardType="numeric"
          style={styles.input}
          cursorColor="#2E7D32"
          onFocus={() => setActiveInput("advance")}
          onBlur={() => setActiveInput(null)}
        />
      </TouchableOpacity>
    </View>
  </View>
<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 4 }}>
    <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
    <AppText style={{ fontSize: 11, color: "#6B7280", marginLeft: 4 }}>
      {language === "te"
    ? "లెక్కలో తప్పు ఉంటే, మీరు చెల్లించాల్సిన మొత్తం* సవరించుకోవచ్చు."
    : "If the calculated Payable Amount* is incorrect, you can edit it."}
    </AppText>
  </View>
  {/* 🏆 FINAL SETTLEMENT BOX */}
  <View style={styles.finalBox}>
    <View>
      <AppText style={{ color: "#fff", opacity: 0.9, fontSize: 13 }}>
        {language === "te" ? "నికర మొత్తం" : "Net Final Amount"}
      </AppText>
      <AppText style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
        ₹{getFinalAmount()}
      </AppText>
    </View>
    <Ionicons name="checkmark-done-circle" size={40} color="rgba(255,255,255,0.4)" />
  </View>
</View>


{/* 📝 REMARKS / NOTES */}
<View style={{ marginBottom: 50 }}>
<AppText style={styles.label}>
  {language === "te"
    ? "ఇతర వివరాలు (అవసరమైతేనే)" 
    : "Additional Remarks (Optional)"}
</AppText>

  <View
    style={[
      styles.inputBox,
      {
        minHeight: 100,
        alignItems: "flex-start",
        paddingVertical: 14,
        flexDirection: "row",
      },
      activeInput === "notes" && styles.inputFocused,
    ]}
  >
    {/* LEFT ICON */}
    <Ionicons
      name="document-text-outline"
      size={20}
      color={notes || activeInput === "notes" ? "#2E7D32" : "#9CA3AF"}
      style={{ marginTop: 4 }}
    />

    {/* TEXT + INPUT */}
    <View style={{ flex: 1, marginLeft: 12 }}>

      {/* PLACEHOLDER */}
      {!notes && activeInput !== "notes" && (
        <AppText style={{ color: "#9CA3AF", lineHeight: 22 }}>
          {language === "te"
            ? "ఈ పనికి సంబంధించిన ఏమైనా వివరాలు ఇక్కడ రాయండి..."
            : "Write additional details, if any..."}
        </AppText>
      )}

      {/* TEXT INPUT */}
      <TextInput
        ref={notesInputRef}
        value={notes}
        onChangeText={setNotes}
        multiline
        style={{
          fontSize: 15,
          color: "#1F2937",
          lineHeight: 22,
          minHeight: 80,
          textAlignVertical: "top",
          padding: 0,
          fontFamily: "Mandali",
          display:
            notes || activeInput === "notes" ? "flex" : "none",
        }}
        cursorColor="#2E7D32"
        onFocus={() => setActiveInput("notes")}
        onBlur={() => setActiveInput(null)}
      />
    </View>

    {/* 🎤 MIC BUTTON RIGHT SIDE */}
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleNotesVoice()}
      style={{
        marginLeft: 10,
        padding: 6,
        borderRadius: 50,
        backgroundColor: "#ebf7f0",
      }}
    >
      <MaterialCommunityIcons
        name={
          isListening && activeInput === "notes"
            ? "microphone"
            : "microphone-outline"
        }
        size={20}
        color={
          isListening && activeInput === "notes"
            ? "#EF4444"
            : "#2E7D32"
        }
      />
    </TouchableOpacity>
  </View>
</View>

<TouchableOpacity 
  activeOpacity={0.85} 
  style={styles.saveBtn} 
  onPress={handleSave}
  disabled={saving}
>
  <LinearGradient
    colors={["#2E7D32", "#1B5E20"]}
    style={styles.saveGradient}
  >
    <Ionicons name="save-outline" size={18} color="#fff" />

    <AppText style={styles.saveText}>
      {language === "te" ? "భద్రపరచండి" : "Save Work"}
    </AppText>
  </LinearGradient>
</TouchableOpacity>
      </ScrollView>

      {/* 📅 DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            setActiveInput(null);

            if (selectedDate) {
              const d = selectedDate.getDate().toString().padStart(2, "0");
              const m = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
              const y = selectedDate.getFullYear();

              setDate(`${d}-${m}-${y}`);
            }
          }}
        />
      )}

      {/* 🔽 MODAL */}
{/* 🎯 INITIAL SELECTION MODAL */}
<Modal visible={showTypeModal} transparent animationType="fade">
  <View style={styles.typeModalOverlay}>
    <View style={styles.typeModalContent}>
      <AppText style={styles.typeModalTitle}>
        {language === "te" ? "పని రకాన్ని ఎంచుకోండి" : "Select Work Type"}
      </AppText>
      
      <View style={styles.typeOptionsRow}>
        {/* TIME BASED OPTION */}
        <TouchableOpacity activeOpacity={0.8}
          style={styles.typeOptionCard} 
          onPress={() => {
            setWorkType("time");
            setShowTypeModal(false);
          }}
        >
          <View style={[styles.typeIconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="time" size={32} color="#2E7D32" />
          </View>
          <AppText style={styles.typeOptionText}>
            {language === "te" ? "గంటల లెక్క" : "Time Based"}
          </AppText>
        </TouchableOpacity>

        {/* ACRES BASED OPTION */}
        <TouchableOpacity activeOpacity={0.8}
          style={styles.typeOptionCard} 
          onPress={() => {
            setWorkType("acres");
            setShowTypeModal(false);
          }}
        >
          <View style={[styles.typeIconCircle, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="resize" size={32} color="#EF6C00" />
          </View>
          <AppText style={styles.typeOptionText}>
            {language === "te" ? "ఎకరాల లెక్క" : "Acre Based"}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

     <Modal visible={modalType !== null} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>

      <View style={styles.modalHeader}>
        <AppText style={styles.modalTitleText}>
          {modalType === "crop"
            ? (language === "te" ? "పంట ఎంచుకోండి" : "Select Crop")
            : (language === "te" ? "పని ఎంచుకోండి" : "Select Work")}
        </AppText>

        <TouchableOpacity onPress={() => {
          setModalType(null);
          setActiveInput(null);
        }}>
          <Ionicons name="close-circle" size={28} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* 🔥 SEARCH + MIC */}
     <View
  style={[
    styles.searchBar,
    {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      marginTop: 10,
    },
  ]}
>
  {/* 🔥 INPUT */}
  <TextInput
    autoFocus
    value={searchText}
    onChangeText={(text) => {
      setSearchText(text);
      modalType === "crop" ? setCrop(text) : setWork(text);
    }}
   placeholder={language === "te" ? "ఇక్కడ రాయండి..." : "Type here..."}
    placeholderTextColor="#9CA3AF"
    cursorColor="#2E7D32"
    style={{
      flex: 1,
      fontSize: 16,
      fontFamily: "Mandali",
      color: "#1F2937",
      paddingVertical: 10,
    }}
  />
{searchText.trim().length > 0 && (
  <TouchableOpacity
    onPress={() => {
      if (modalType === "crop") setCrop(searchText);
      else setWork(searchText);

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
  {/* 🎤 MIC BUTTON */}
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() =>
      handleVoiceInput(modalType === "crop" ? "crop" : "work")
    }
    style={{
      marginLeft: 10,
      padding: 6,
      borderRadius: 10,
      backgroundColor: "#E5E7EB"
    }}
  >
    <MaterialCommunityIcons
      name={isListening ? "microphone" : "microphone-outline"}
      size={20}
      color={isListening ? "#EF4444" : "#2E7D32"}
    />
  </TouchableOpacity>
</View>
      <FlatList
      data={filteredData}
        keyExtractor={(item, i) => i.toString()}
        ListEmptyComponent={() =>
  searchText.trim().length > 0 ? (
    <TouchableOpacity
      style={[styles.categoryItem, { alignItems: "center" }]}
      onPress={() => {
        if (modalType === "crop") setCrop(searchText);
        else setWork(searchText);

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
              const value = language === "te" ? item.te : item.en;

              modalType === "crop" ? setCrop(value) : setWork(value);

              if (searchText.trim()) {
                modalType === "crop"
                  ? setCrop(searchText)
                  : setWork(searchText);
              }

              setModalType(null);
              setSearchText("");
              setActiveInput(null);
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
      <Modal visible={errorModal} transparent animationType="fade">
  <View style={styles.overlay}>
    <View style={styles.errorBox}>

      <Ionicons name="alert-circle" size={40} color="#DC2626" />

     <AppText style={styles.errorTitle}>
  {language === "te" 
    ? "(*) గుర్తు ఉన్న వివరాలన్నీ తప్పనిసరిగా నింపండి" 
    : "Please fill all fields marked with (*)"}
</AppText>

      <AppText style={styles.errorMsg}>
        {errorMsg}
      </AppText>

      <TouchableOpacity activeOpacity={0.8}
        style={styles.okBtn}
        onPress={() => setErrorModal(false)}
      >
       <AppText style={{ color: "#fff" }}>
  {language === 'te' ? "సరే" : "OK"}
</AppText>

      </TouchableOpacity>

    </View>
  </View>
</Modal>
{saving && (
  <AgriLoader 
    visible 
    type="saving" 
    language={language} 
  />
)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: "#F6F7F6" },
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
  inputFocused: {
    borderColor: "#2E7D32",
    backgroundColor: "#fff",
    // Adding subtle shadow for focus
    elevation: 3,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calcNote: {
    fontSize: 11,
    color: "#2E7D32", // Green color to show it's a system calculation
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
    opacity: 0.8
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  input: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    padding: 0,
  },
  unitText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden'
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: "75%"
  },
label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "500"
  },
  finalBox: {
    backgroundColor: "#2E7D32", // Success Green
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center"
  },

  modalTitleText: {
    fontSize: 18,
    fontWeight: "600"
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

  searchInput: {
    height: 50
  },

  categoryItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 12,
    paddingLeft: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32", // Oka green line lanti indicator
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
    marginHorizontal: 10
  },
  calculationInfoBox: {
    backgroundColor: "#E8F5E9", // Light Green Background
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderStyle: 'dashed', // Dashed border isthundi clarity kosam
  },
  infoIconWrapper: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
   
  },
  calcLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  calcStepText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  equalSign: {
    fontSize: 14,
    color: "#9CA3AF",
    marginHorizontal: 4,
  },
  finalCalcAmount: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
  },
  typeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  typeModalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    width: '100%',
    alignItems: 'center'
  },
  typeModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 25
  },
  typeOptionsRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center'
  },
  typeOptionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  typeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  saveBtn: {
  
  borderRadius: 18,
  overflow: "hidden"
},

saveGradient: {
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  gap: 8
},

saveText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600"
},
  

overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center"
},

errorBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 18,
  padding: 20,
  alignItems: "center"
},

errorTitle: {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 10
},

errorMsg: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 6,
  textAlign: "center"
},

okBtn: {
  marginTop: 15,
  backgroundColor: "#DC2626",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 10
},
});