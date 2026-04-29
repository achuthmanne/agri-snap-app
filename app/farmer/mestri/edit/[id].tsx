/// This is the edit screen for a Mestri. It loads the existing details, allows the user to edit them, and saves the updates back to Firestore.
// It also includes validation to ensure required fields are filled, and shows a success message upon successful update.
//app/farmer/mestri/edit//[id].tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import {
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

export default function EditMestri() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
const [language, setLanguage] = useState<"te" | "en">("te");
const [loading, setLoading] = useState(false);
const [loaderType, setLoaderType] = useState<"loading" | "updating">("loading"
);
const [activeInput, setActiveInput] = useState<string | null>(null);
const [showWarning, setShowWarning] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const villageRef = useRef<TextInput>(null);
const t = {
  name: language === "te" ? "పేరు నమోదు చేయండి*" : "Enter name*",
  phone: language === "te" ? "ఫోన్ నంబర్ నమోదు చేయండి" : "Enter phone number",
  village: language === "te" ? "గ్రామం నమోదు చేయండి*" : "Enter village*"
};
const [isListening, setIsListening] = useState(false);

  // వాయిస్ రిజల్ట్ ని హ్యాండిల్ చేయడం
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      if (activeInput === "name") setName(transcript);
      else if (activeInput === "village") setVillage(transcript);
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

useEffect(() => {
  const loadLang = async () => {
    const lang = await AsyncStorage.getItem("APP_LANG");
    
    if (lang) setLanguage(lang as "te" | "en");
  };

  loadLang();
}, []);
  /* ---------------- LOAD DATA ---------------- */

useEffect(() => {
  const loadData = async () => {
    try {
      setLoaderType("loading");   // 👈 loading type
      setLoading(true);

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
        setName(data.name || "");
        setPhone(data.phone || "");
        setVillage(data.village || "");
      }

    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  /* ---------------- UPDATE ---------------- */

const handleUpdate = async () => {
  if (!name.trim() || !village.trim()) {
  setShowWarning(true);
  return;
}
  try {
    setLoaderType("updating");  // 👈 updating type
    setLoading(true);

    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone || !id) return;

    await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .doc(id as string)
      .update({
        name,
        phone,
        village
      });

    setLoading(false);
    router.back();

  } catch (e) {
    setLoading(false);
  }
};
  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "మార్చండి" : "Edit Mestri"}
        subtitle={language === "te" ? "వివరాలు సవరించండి" : "Update Details"}
        language={language}
      />

      <View style={styles.container}>

        {/* NAME */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "name" && styles.inputFocused
          ]}
          activeOpacity={1}
          onPress={() => nameRef.current?.focus()}
        >
          <Ionicons name="person-outline" size={18}  color={name? "#2E7D32" : "#9CA3AF"} />

          <TextInput
            ref={nameRef}
            placeholder={t.name}
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            
            cursorColor="#2E7D32"
            selectionColor="#2E7D32"
            style={[
              styles.input,
              { fontFamily: "Mandali"  }
            ]}
            onFocus={() => setActiveInput("name")}
            onBlur={() => setActiveInput(null)}
          
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
          <TouchableOpacity onPress={() => handleVoiceInput("name")} style={{
                marginLeft: 10,
                padding: 6,
                borderRadius: 50,
                backgroundColor: "#f0f9f3"
              }}>
            <MaterialCommunityIcons 
              name={isListening && activeInput === "name" ? "microphone" : "microphone-outline"} 
              size={22} 
              color={isListening && activeInput === "name" ? "#EF4444" : "#2E7D32"} 
            />
          </TouchableOpacity>
       </TouchableOpacity>

        {/* PHONE */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "phone" && styles.inputFocused
          ]}
          activeOpacity={1}
          onPress={() => phoneRef.current?.focus()}
        >
          <Ionicons name="call-outline" size={18}  color={phone? "#2E7D32" : "#9CA3AF"} />

          <TextInput
            ref={phoneRef}
            placeholder={t.phone}
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            
            cursorColor="#2E7D32"
            selectionColor="#2E7D32"
            style={[
              styles.input,
              { fontFamily: "Mandali" }
            ]}
            onFocus={() => setActiveInput("phone")}
            onBlur={() => setActiveInput(null)}
          
            returnKeyType="next"
            onSubmitEditing={() => villageRef.current?.focus()}
          />
        </TouchableOpacity>

        {/* VILLAGE */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "village" && styles.inputFocused
          ]}
          activeOpacity={1}
          onPress={() => villageRef.current?.focus()}
        >
          <Ionicons name="location-outline" size={18} color={village? "#2E7D32" : "#9CA3AF"} />

         
          <TextInput
            ref={villageRef}
            placeholder={t.village}
            placeholderTextColor="#9CA3AF"
            value={village}
            onChangeText={setVillage}
            
            cursorColor="#2E7D32"
            style={[
              styles.input,
              { fontFamily: "Mandali"  }
            ]}
            onFocus={() => setActiveInput("village")}
            onBlur={() => setActiveInput(null)}
          
            returnKeyType="next"
            
          />
           {/* 📍 VILLAGE Input Wrapper లోపల చివరన */}
          <TouchableOpacity onPress={() => handleVoiceInput("village")}  style={{
                marginLeft: 10,
                padding: 6,
                borderRadius: 50,
                backgroundColor: "#f0f9f3"
              }} >
            <MaterialCommunityIcons 
              name={isListening && activeInput === "village" ? "microphone" : "microphone-outline"} 
              size={22} 
              color={isListening && activeInput === "village" ? "#EF4444" : "#2E7D32"} 
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* UPDATE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdate}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            style={styles.saveGradient}
          >
            <AppText style={styles.saveText} language={language}>
             {language === "te" ? "సవరించండి" : "Update"}
            </AppText>
          </LinearGradient>
        </TouchableOpacity>

      </View>
   <AgriLoader
  visible={loading}
  type={loaderType}
  language={language}
/>
{showWarning && (
  <View style={styles.overlay}>

    <View style={styles.modalBox}>

      <View style={styles.iconBg}>
        <Ionicons name="warning" size={36} color="#1B5E20" />
      </View>

      <AppText style={styles.modalTitle} language={language}>
        {language === "te" ? "లోపం" : "Error"}
      </AppText>

      <AppText style={styles.modalSub} language={language}>
        {language === "te"
          ? "దయచేసి * గుర్తు వివరాలు నమోదు చేయండి"
          : "Please enter all required* fields to continue"}
      </AppText>

      <TouchableOpacity
        style={styles.okBtn}
        onPress={() => setShowWarning(false)}
      >
        <AppText style={styles.okText} language={language}>
          {language === "te" ? "సరే" : "Okay"}
        </AppText>
      </TouchableOpacity>

    </View>

  </View>
)}
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

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

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1F2937",
    includeFontPadding: false
  },
inputFocused: {
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  saveBtn: {
    marginTop: 25,
    borderRadius: 18,
    overflow: "hidden"
  },

  saveGradient: {
    height: 52,
    justifyContent: "center",
    alignItems: "center"
  },

  saveText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600"
  },
  overlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
},

modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 24,
  alignItems: "center"
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

modalTitle: {
  fontSize: 16,
  fontWeight: "600"
},

modalSub: {
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  marginTop: 6
},

okBtn: {
  marginTop: 20,
  backgroundColor: "#1B5E20",
  paddingVertical: 12,
  paddingHorizontal: 40,
  borderRadius: 12
},

okText: {
  color: "white",
  fontWeight: "600"
}
});