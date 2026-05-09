// app/farmer/admin-scheme.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";

export default function AddSchemeAdmin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [language, setLanguage] = useState<"te" | "en">("te");

  // ఫారమ్ స్టేట్స్
  const [title, setTitle] = useState("");
  const [stateChoice, setStateChoice] = useState<"AP" | "TS" | "BOTH">("AP");
  const [shortDesc, setShortDesc] = useState("");
  const [eligibility, setEligibility] = useState(""); 
  const [documents, setDocuments] = useState(""); 
  const [applySteps, setApplySteps] = useState("");
  const [applyLink, setApplyLink] = useState("");

  // 🔥 STANDARD PATTERN STATES
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isListening, setIsListening] = useState(false);

  // REFS
  const titleRef = useRef<TextInput>(null);
  const shortDescRef = useRef<TextInput>(null);
  const eligibilityRef = useRef<TextInput>(null);
  const documentsRef = useRef<TextInput>(null);
  const applyStepsRef = useRef<TextInput>(null);
  const applyLinkRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => { if (l) setLanguage(l as any); });
  }, []);

  /* ---------------- వాయిస్ ఇన్‌పుట్ (MIC LOGIC) ---------------- */
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const text = event.results[0].transcript;
      if (activeInput === "title") setTitle(text);
      else if (activeInput === "shortDesc") setShortDesc((prev) => prev ? prev + " " + text : text);
      else if (activeInput === "eligibility") setEligibility((prev) => prev ? prev + "\n" + text : text);
      else if (activeInput === "documents") setDocuments((prev) => prev ? prev + "\n" + text : text);
      else if (activeInput === "applySteps") setApplySteps(text);
      else if (activeInput === "applyLink") setApplyLink(text.toLowerCase().replace(/\s/g, ""));
      
      if (errors[activeInput!]) setErrors({ ...errors, [activeInput!]: "" });
    }
  });

  useSpeechRecognitionEvent("end", () => setIsListening(false));

  const handleVoiceInput = async (target: string) => {
    setActiveInput(target);
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: language === "te" ? "te-IN" : "en-US",
      interimResults: true,
    });
  };

  /* ---------------- ఇమేజ్ పికర్ ---------------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], 
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      if (errors.image) setErrors({ ...errors, image: "" });
    }
  };

  /* ---------------- ఫైర్‌బేస్ కి సేవ్ చేయడం ---------------- */
  const handleSave = async () => {
    if (loading) return;

    // 🔥 INLINE VALIDATION LOGIC 
    const newErrors: any = {};
    if (!imageUri) newErrors.image = language === "te" ? "బ్యానర్ ఫోటో అప్‌లోడ్ చేయండి*" : "Banner image is required*";
    if (!title.trim()) newErrors.title = language === "te" ? "పథకం పేరు నమోదు చేయండి*" : "Enter Scheme Title*";
    if (!shortDesc.trim()) newErrors.shortDesc = language === "te" ? "చిన్న వివరణ ఇవ్వండి*" : "Enter short description*";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);

    try {
      const fileName = `schemes/${Date.now()}_banner.jpg`;
      const reference = storage().ref(fileName);
      
      const response = await fetch(imageUri!);
      const blob = await response.blob();
      
      await reference.put(blob);
      const downloadURL = await reference.getDownloadURL();

      const eligibilityArray = eligibility.split("\n").map((s) => s.trim()).filter((s) => s !== "");
      const documentsArray = documents.split("\n").map((s) => s.trim()).filter((s) => s !== "");

      await firestore().collection("schemes").add({
        title: title.trim(),
        state: stateChoice,
        shortDesc: shortDesc.trim(),
        eligibility: eligibilityArray,
        documentsRequired: documentsArray,
        howToApply: applySteps.trim(),
        applyLink: applyLink.trim() || null,
        bannerImage: downloadURL,
        isActive: true, 
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("సక్సెస్! 🎉", "పథకం అద్భుతంగా యాడ్ చేయబడింది.", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("ఫెయిల్", "డేటా సేవ్ అవ్వలేదు. ఇంటర్నెట్ చెక్ చేయండి.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader title="AgriSnap Admin" subtitle="కొత్త పథకం యాడ్ చేయండి" language={language} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          {/* 1. ఇమేజ్ అప్‌లోడ్ */}
          <AppText style={styles.label}>బ్యానర్ ఫోటో (16:9)</AppText>
          <TouchableOpacity 
            style={[styles.imageBox, errors.image && { borderColor: "#EF4444", borderWidth: 2 }]} 
            onPress={pickImage} 
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cloud-upload-outline" size={40} color={errors.image ? "#EF4444" : "#16A34A"} />
                <AppText style={[styles.uploadText, errors.image && { color: "#EF4444" }]}>బ్యానర్ అప్‌లోడ్ చేయండి</AppText>
              </View>
            )}
          </TouchableOpacity>
          {errors.image && <AppText style={styles.errorText} language={language}>{errors.image}</AppText>}

          {/* 2. పథకం పేరు */}
          <AppText style={styles.label}>పథకం పేరు</AppText>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputBox, activeInput === "title" && styles.inputFocused, errors.title && styles.inputError]}
            onPress={() => { setActiveInput("title"); titleRef.current?.focus(); }}
          >
            <Ionicons name="bookmark-outline" size={20} color={title || activeInput === "title" ? "#16A34A" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              {!title && activeInput !== "title" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>ఉదా: వైఎస్సార్ రైతు భరోసా</AppText>
              )}
              <TextInput
                ref={titleRef}
                value={title}
                onChangeText={(txt) => { setTitle(txt); if (errors.title) setErrors({ ...errors, title: "" }); }}
                onFocus={() => setActiveInput("title")}
                onBlur={() => setActiveInput(null)}
                style={[styles.input, { display: (title || activeInput === "title") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("title")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "title" ? "microphone" : "microphone-outline"} 
                size={24} color={isListening && activeInput === "title" ? "#EF4444" : (activeInput === "title" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {errors.title && <AppText style={styles.errorText} language={language}>{errors.title}</AppText>}

          {/* 3. రాష్ట్రం ఎంపిక */}
          <AppText style={styles.label}>ఏ రాష్ట్రానికి సంబంధించింది?</AppText>
          <View style={styles.tabContainer}>
            {["AP", "TS", "BOTH"].map((state) => (
              <TouchableOpacity
                key={state}
                style={[styles.tabBtn, stateChoice === state && styles.activeTab]}
                onPress={() => setStateChoice(state as any)}
              >
                <AppText style={[styles.tabText, stateChoice === state && styles.activeTabText]}>
                  {state === "BOTH" ? "రెండు" : state}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* 4. షార్ట్ డిస్క్రిప్షన్ */}
          <AppText style={styles.label}>చిన్న వివరణ (Short Description)</AppText>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputBox, styles.inputAreaBox, activeInput === "shortDesc" && styles.inputFocused, errors.shortDesc && styles.inputError]}
            onPress={() => { setActiveInput("shortDesc"); shortDescRef.current?.focus(); }}
          >
            <Ionicons name="document-text-outline" size={20} color={shortDesc || activeInput === "shortDesc" ? "#16A34A" : "#9CA3AF"} style={{ marginTop: 2 }} />
            <View style={styles.inputWrapper}>
              {!shortDesc && activeInput !== "shortDesc" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>రైతులకు పెట్టుబడి సాయం కింద ఏటా ఆర్థిక సాయం...</AppText>
              )}
              <TextInput
                ref={shortDescRef}
                value={shortDesc}
                onChangeText={(txt) => { setShortDesc(txt); if (errors.shortDesc) setErrors({ ...errors, shortDesc: "" }); }}
                onFocus={() => setActiveInput("shortDesc")}
                onBlur={() => setActiveInput(null)}
                multiline
                style={[styles.input, { minHeight: 70, textAlignVertical: "top", display: (shortDesc || activeInput === "shortDesc") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("shortDesc")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "shortDesc" ? "microphone" : "microphone-outline"} 
                size={24} color={isListening && activeInput === "shortDesc" ? "#EF4444" : (activeInput === "shortDesc" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {errors.shortDesc && <AppText style={styles.errorText} language={language}>{errors.shortDesc}</AppText>}

          {/* 5. అర్హతలు */}
          <AppText style={styles.label}>అర్హతలు (లైన్ కి ఒకటి చొప్పున రాయండి)</AppText>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputBox, styles.inputAreaBox, activeInput === "eligibility" && styles.inputFocused]}
            onPress={() => { setActiveInput("eligibility"); eligibilityRef.current?.focus(); }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={eligibility || activeInput === "eligibility" ? "#16A34A" : "#9CA3AF"} style={{ marginTop: 2 }} />
            <View style={styles.inputWrapper}>
              {!eligibility && activeInput !== "eligibility" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>సొంత భూమి ఉన్న రైతులు.&#10;కౌలు రైతులు.</AppText>
              )}
              <TextInput
                ref={eligibilityRef}
                value={eligibility}
                onChangeText={setEligibility}
                onFocus={() => setActiveInput("eligibility")}
                onBlur={() => setActiveInput(null)}
                multiline
                style={[styles.input, { minHeight: 70, textAlignVertical: "top", display: (eligibility || activeInput === "eligibility") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("eligibility")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "eligibility" ? "microphone" : "microphone-outline"} 
                size={24} color={isListening && activeInput === "eligibility" ? "#EF4444" : (activeInput === "eligibility" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* 6. కావాల్సిన పత్రాలు */}
          <AppText style={styles.label}>కావాల్సిన పత్రాలు (లైన్ కి ఒకటి)</AppText>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputBox, styles.inputAreaBox, activeInput === "documents" && styles.inputFocused]}
            onPress={() => { setActiveInput("documents"); documentsRef.current?.focus(); }}
          >
            <Ionicons name="document-attach-outline" size={20} color={documents || activeInput === "documents" ? "#16A34A" : "#9CA3AF"} style={{ marginTop: 2 }} />
            <View style={styles.inputWrapper}>
              {!documents && activeInput !== "documents" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>ఆధార్ కార్డ్&#10;పట్టాదార్ పాస్ బుక్</AppText>
              )}
              <TextInput
                ref={documentsRef}
                value={documents}
                onChangeText={setDocuments}
                onFocus={() => setActiveInput("documents")}
                onBlur={() => setActiveInput(null)}
                multiline
                style={[styles.input, { minHeight: 70, textAlignVertical: "top", display: (documents || activeInput === "documents") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("documents")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "documents" ? "microphone" : "microphone-outline"} 
                size={24} color={isListening && activeInput === "documents" ? "#EF4444" : (activeInput === "documents" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* 7. ఎక్కడ దరఖాస్తు చేయాలి */}
          <AppText style={styles.label}>ఎలా అప్లై చేయాలి?</AppText>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputBox, activeInput === "applySteps" && styles.inputFocused]}
            onPress={() => { setActiveInput("applySteps"); applyStepsRef.current?.focus(); }}
          >
            <Ionicons name="information-circle-outline" size={20} color={applySteps || activeInput === "applySteps" ? "#16A34A" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              {!applySteps && activeInput !== "applySteps" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>ఉదా: సమీప మీసేవ లేదా గ్రామ సచివాలయం</AppText>
              )}
              <TextInput
                ref={applyStepsRef}
                value={applySteps}
                onChangeText={setApplySteps}
                onFocus={() => setActiveInput("applySteps")}
                onBlur={() => setActiveInput(null)}
                style={[styles.input, { display: (applySteps || activeInput === "applySteps") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
            <TouchableOpacity onPress={() => handleVoiceInput("applySteps")} style={styles.micBtn}>
              <MaterialCommunityIcons 
                name={isListening && activeInput === "applySteps" ? "microphone" : "microphone-outline"} 
                size={24} color={isListening && activeInput === "applySteps" ? "#EF4444" : (activeInput === "applySteps" ? "#16A34A" : "#6B7280")} 
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* 8. ఆన్లైన్ లింక్ (ఆప్షనల్) */}
          <AppText style={styles.label}>ఆన్‌లైన్ వెబ్‌సైట్ లింక్ (ఉంటే)</AppText>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.inputBox, activeInput === "applyLink" && styles.inputFocused]}
            onPress={() => { setActiveInput("applyLink"); applyLinkRef.current?.focus(); }}
          >
            <Ionicons name="link-outline" size={20} color={applyLink || activeInput === "applyLink" ? "#16A34A" : "#9CA3AF"} />
            <View style={styles.inputWrapper}>
              {!applyLink && activeInput !== "applyLink" && (
                <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>https://agri.ap.gov.in</AppText>
              )}
              <TextInput
                ref={applyLinkRef}
                value={applyLink}
                onChangeText={setApplyLink}
                onFocus={() => setActiveInput("applyLink")}
                onBlur={() => setActiveInput(null)}
                keyboardType="url"
                autoCapitalize="none"
                style={[styles.input, { display: (applyLink || activeInput === "applyLink") ? "flex" : "none" }]}
                cursorColor="#16A34A"
                selectionColor="#16A34A40"
              />
            </View>
          </TouchableOpacity>

          {/* 9. SUBMIT BUTTON */}
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={["#16A34A", "#15803D"]} style={styles.gradientBtn}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <AppText style={styles.saveText}>పథకాన్ని పబ్లిష్ చేయి</AppText>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F6" },
  
  // 🔥 FIX: Increased paddingBottom from 60 to 150 to solve the scrolling issue
  scrollContent: { padding: 20, paddingBottom: 200 }, 
  label: { fontSize: 14, fontWeight: "600", color: "#4B5563", marginBottom: 8, marginTop: 16 },
  imageBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#BBF7D0",
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { alignItems: "center" },
  uploadText: { marginTop: 8, color: "#16A34A", fontWeight: "600" },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#D1D5DB"
  },
  inputAreaBox: {
    minHeight: 110,
    alignItems: "flex-start",
    paddingVertical: 14,
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
    marginTop: 6,
    marginLeft: 4,
  },
  micBtn: {
    marginLeft: 10,
    padding: 4,
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

  tabContainer: { flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#1B5E20" },
  tabText: { color: "#6B7280", fontWeight: "600" },
  activeTabText: { color: "#ffffff" },

  saveBtn: { marginTop: 30, borderRadius: 14, overflow: "hidden" },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" }
});