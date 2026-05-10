// app/farmer/fields/add-field.tsx

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import React, { useEffect, useRef, useState } from "react";
import { Keyboard } from "react-native";
import {
  FlatList, Modal, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, TextInput, TouchableOpacity, View
} from "react-native";

import AgriLoader from "@/components/AgriLoader";
import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

// URL params helper
const getStr = (val: string | string[] | undefined) => (Array.isArray(val) ? val[0] : val || "");

export default function AddField() {
  const router = useRouter();
  const params = useLocalSearchParams(); 

  const editId = getStr(params.editId);

  // 🔥 INSTANT DATA LOAD FROM PARAMS
  const [crop, setCrop] = useState(getStr(params.crop));
  const [soilType, setSoilType] = useState(getStr(params.soilType));
  const [acres, setAcres] = useState(getStr(params.acres));
  const [type, setType] = useState<"own" | "rent" | null>(getStr(params.type) as "own" | "rent" | null);
  const [rent, setRent] = useState(getStr(params.rent) !== "0" ? getStr(params.rent) : "");

  const [language, setLanguage] = useState<"te" | "en">("te");
  const [loading, setLoading] = useState(false);
  
  // 🔥 STANDARD PATTERN STATES
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); 
  
  const [modalType, setModalType] = useState<"crop" | "soil" | null>(null); 
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
  }, []);

  const handleSave = async () => {
    if (loading) return;
    Keyboard.dismiss();

    // 🔥 INLINE VALIDATION LOGIC
    const newErrors: any = {};
    if (!crop.trim()) newErrors.crop = language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop*";
    if (!soilType.trim()) newErrors.soilType = language === "te" ? "నేల రకాన్ని ఎంచుకోండి*" : "Select Soil Type*";
    if (!acres) newErrors.acres = language === "te" ? "ఎకరాలు నమోదు చేయండి*" : "Enter acres*";
    if (!type) newErrors.type = language === "te" ? "పొలం రకం ఎంచుకోండి*" : "Select field type*";
    if (type === "rent" && !rent) newErrors.rent = language === "te" ? "కౌలు మొత్తం నమోదు చేయండి*" : "Enter rent amount*";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) {
        setLoading(false);
        return;
      }

      const userDoc = await firestore().collection("users").doc(phone).get();
      const activeSession = userDoc.data()?.activeSession;

      if (!activeSession) {
        setLoading(false);
        return;
      }

      const fieldData = {
        session: activeSession,
        crop: crop.trim(),
        soilType: soilType.trim(),
        acres: Number(acres),
        type,
        rent: type === "rent" ? Number(rent || 0) : 0,
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

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  const filteredData = modalType === "crop" 
    ? cropOptions.filter(i => (language === "te" ? i.te : i.en).toLowerCase().includes(searchText.toLowerCase().trim()))
    : soilOptions.filter(i => (language === "te" ? i.te : i.en).toLowerCase().includes(searchText.toLowerCase().trim()));

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
          style={[styles.inputBox, activeInput === "crop" && styles.inputFocused, errors.crop && styles.inputError]} 
          onPress={() => { setModalType("crop"); setActiveInput("crop"); if (errors.crop) setErrors({...errors, crop: ""}); }}
        >
          <Ionicons name="leaf-outline" size={20} color={crop ? "#16A34A" : "#9CA3AF"} />
          <View style={styles.inputWrapper}>
            <AppText style={{ color: crop ? "#1F2937" : "#9CA3AF", fontSize: 16, fontFamily: "Mandali" }}>
              {crop || (language === "te" ? "పంటను ఎంచుకోండి*" : "Select Crop*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.crop && <AppText style={styles.errorText} language={language}>{errors.crop}</AppText>}

        {/* 🪨 SOIL TYPE BOX */}
        <TouchableOpacity 
          activeOpacity={1}
          style={[styles.inputBox, activeInput === "soil" && styles.inputFocused, errors.soilType && styles.inputError]} 
          onPress={() => { setModalType("soil"); setActiveInput("soil"); if (errors.soilType) setErrors({...errors, soilType: ""}); }}
        >
          <Ionicons name="layers-outline" size={20} color={soilType ? "#16A34A" : "#9CA3AF"} />
          <View style={styles.inputWrapper}>
            <AppText style={{ color: soilType ? "#1F2937" : "#9CA3AF", fontSize: 16, fontFamily: "Mandali" }}>
              {soilType || (language === "te" ? "నేల రకాన్ని ఎంచుకోండి*" : "Select Soil Type*")}
            </AppText>
          </View>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {errors.soilType && <AppText style={styles.errorText} language={language}>{errors.soilType}</AppText>}

        {/* 📏 ACRES BOX */}
        <TouchableOpacity
          style={[styles.inputBox, activeInput === "acres" && styles.inputFocused, errors.acres && styles.inputError]}
          activeOpacity={1}
          onPress={() => {
            setActiveInput("acres");
            setTimeout(() => acresRef.current?.focus(), 50); 
          }}
        >
          <Ionicons name="resize-outline" size={20} color={acres ? "#16A34A" : "#9CA3AF"} />
          <View style={styles.inputWrapper}>
            {!acres && activeInput !== "acres" && (
              <AppText style={styles.placeholder}>
                {language === "te" ? "ఎన్ని ఎకరాలు?*" : "Enter acres*"}
              </AppText>
            )}
            <TextInput
              ref={acresRef}
              value={acres}
              onChangeText={(txt) => {
                setAcres(txt);
                if (errors.acres) setErrors({ ...errors, acres: "" });
              }}
              keyboardType="numeric"
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              style={[styles.input, { display: (acres || activeInput === "acres") ? "flex" : "none" }]}
              onFocus={() => setActiveInput("acres")}
              onBlur={() => setActiveInput(null)}
            />
          </View>
        </TouchableOpacity>
        {errors.acres && <AppText style={styles.errorText} language={language}>{errors.acres}</AppText>}

        {/* 🔘 TYPE SELECTION */}
        <AppText style={styles.label}>{language === "te" ? "పొలం రకం*" : "Field Type*"}</AppText>
        <View style={styles.row}>
          <TouchableOpacity activeOpacity={0.8}
            style={[styles.pill, type === "own" && styles.activePill, errors.type && !type && { borderColor: "#EF4444" }]} 
            onPress={() => { setType("own"); setActiveInput(null); if (errors.type) setErrors({ ...errors, type: "" }); }}
          >
            <AppText style={[styles.pillText, { color: type === "own" ? "#fff" : "#4B5563" }]}>
              {language === "te" ? "సొంతం" : "Own"}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}
            style={[styles.pill, type === "rent" && styles.activePill, errors.type && !type && { borderColor: "#EF4444" }]} 
            onPress={() => { setType("rent"); setActiveInput(null); if (errors.type) setErrors({ ...errors, type: "" }); }}
          >
            <AppText style={[styles.pillText, { color: type === "rent" ? "#fff" : "#4B5563" }]}>
              {language === "te" ? "కౌలు" : "Rent"}
            </AppText>
          </TouchableOpacity>
        </View>
        {errors.type && <AppText style={[styles.errorText, {marginTop: -10, marginBottom: 16}]} language={language}>{errors.type}</AppText>}

        {/* 💰 RENT BOX */}
        {type === "rent" && (
          <View>
            <TouchableOpacity
              style={[styles.inputBox, activeInput === "rent" && styles.inputFocused, errors.rent && styles.inputError]}
              activeOpacity={1}
              onPress={() => {
                setActiveInput("rent");
                setTimeout(() => rentRef.current?.focus(), 50);
              }}
            >
              <Ionicons name="cash-outline" size={20} color={rent ? "#16A34A" : "#9CA3AF"} />
              <View style={styles.inputWrapper}>
                {!rent && activeInput !== "rent" && (
                  <AppText style={styles.placeholder}>
                    {language === "te" 
                      ? `${acres || 0} ఎకరాలకు కలిపి మొత్తం కౌలు (రూ!!)*` 
                      : `Total rent for ${acres || 0} acres (₹)*`}
                  </AppText>
                )}
                <TextInput
                  ref={rentRef}
                  value={rent}
                  onChangeText={(txt) => {
                    setRent(txt);
                    if (errors.rent) setErrors({ ...errors, rent: "" });
                  }}
                  keyboardType="numeric"
                  cursorColor="#16A34A"
                  selectionColor="#16A34A40"
                  style={[styles.input, { display: (rent || activeInput === "rent") ? "flex" : "none" }]}
                  onFocus={() => setActiveInput("rent")}
                  onBlur={() => setActiveInput(null)}
                />
              </View>
            </TouchableOpacity>
            {errors.rent && <AppText style={styles.errorText} language={language}>{errors.rent}</AppText>}
          </View>
        )}

        {/* 💾 SAVE BUTTON (🔥 REPLACED WITH STANDARD PREM BUTTON) */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
          <LinearGradient colors={["#2E7D32", "#1B5E20"]} style={styles.saveGradient}>
            <AppText style={styles.saveText}>
              {editId 
                ? (language === "te" ? "వివరాలు మార్చండి" : "Update Details") 
                : (language === "te" ? "భద్రపరచండి" : "Save Details")}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* 🟢 LOADER (🔥 Corrected Type) */}
      <AgriLoader visible={loading} type={editId ? "updating" : "saving"} language={language} />
      
      {/* 🔥 MODAL WRAPPER */}
      <Modal visible={modalType !== null} transparent animationType="slide" onRequestClose={() => setModalType(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={{ fontSize: 18, fontWeight: "600", fontFamily: "Mandali" }}>
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
                cursorColor={'#16A34A'}
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
                    if (modalType === "crop") {
                      setCrop(selected);
                      if (errors.crop) setErrors({ ...errors, crop: "" });
                    } else {
                      setSoilType(selected);
                      if (errors.soilType) setErrors({ ...errors, soilType: "" });
                    }
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
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  container: { padding: 20 },
  label: { fontSize: 14, color: "#6B7280", marginBottom: 6, marginLeft: 4, fontWeight: '500', fontFamily: 'Mandali' },
  
  // 🔥 STANDARD PATTERN INPUT STYLES (Grey Bg, Thin Border, Green Focus)
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

  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  pill: {
    flex: 1, padding: 15, borderRadius: 12, backgroundColor: "#F9FAFB", 
    alignItems: "center", borderWidth: 1, borderColor: "#D1D5DB"
  },
  activePill: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  pillText: { fontSize: 16, fontWeight: "600", fontFamily: "Mandali" },

  // 🔥 STANDARD SAVE BUTTON
  saveBtn: { marginTop: 10, borderRadius: 18, overflow: "hidden", elevation: 6, shadowColor: "#1B5E20", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8 },
  saveGradient: { height: 56, justifyContent: "center", alignItems: "center" },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", height: "70%", borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: "center" },
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
  itemText: { fontSize: 17, fontFamily: "Mandali" },
});