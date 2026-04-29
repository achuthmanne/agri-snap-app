//app/farmer/mestri/add-mestri.tsx
// This screen allows the farmer to add a new Mestri. It includes fields for name, phone, and village. It validates the input, saves the new Mestri to Firestore under the current user's collection, and handles loading states and error messages.
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import {
  Alert,
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

export default function AddMestri() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
const [activeInput, setActiveInput] = useState<string | null>(null);
const [language, setLanguage] = useState<"te" | "en">("te");
  const [loading, setLoading] = useState(false);
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

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
  if (!name.trim() || !village.trim()) {
    setShowAlert(true);
    return;
  }

  try {
    setLoading(true);

    const userPhone = await AsyncStorage.getItem("USER_PHONE");

    if (!userPhone) {
      Alert.alert("Error", "User not found");
      return;
    }

    await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("mestris")
      .add({
        name: name.trim(),
        phone: phone.trim(),
        village: village.trim(),
        createdAt: firestore.FieldValue.serverTimestamp()
      });

    router.back();

  } catch (e) {
    Alert.alert("Error", "Failed to save");
  } finally {
    setLoading(false);
  }
};
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "మేస్త్రీ చేర్చండి" : "Add Mestri"}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter Details"}
        language={language}
      />

      <View style={styles.container}>

   <TouchableOpacity
  style={[
    styles.inputBox,
    activeInput === "name" && styles.inputFocused
  ]}
  activeOpacity={1}
  onPress={() => nameRef.current?.focus()}
>
  <Ionicons name="person-outline" size={18} color={name? "#2E7D32" : "#9CA3AF"} />

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
    { fontFamily:  "Mandali"  }
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
          <Ionicons
            name="call-outline"
            size={18}
             color={phone? "#2E7D32" : "#9CA3AF"}
          />

         <TextInput
  ref={phoneRef}
  placeholder={t.phone}
  value={phone}
  onChangeText={setPhone}
 style={[
    styles.input,
    { fontFamily:"Mandali" }
  ]}
  placeholderTextColor="#9CA3AF"
  keyboardType="number-pad"
  cursorColor="#2E7D32"
  selectionColor="#2E7D32"
  onFocus={() => setActiveInput("phone")}
  onBlur={() => setActiveInput(null)}
maxLength={10}
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
          <Ionicons
            name="location-outline"
            size={18}
            color={village? "#2E7D32" : "#9CA3AF"}
          />

       <TextInput
  ref={villageRef}
   placeholder={t.village}
  value={village}
  placeholderTextColor="#9CA3AF"
  onChangeText={setVillage}
 style={[
    styles.input,
    { fontFamily:  "Mandali" }
  ]}
  cursorColor="#2E7D32"
  selectionColor="#2E7D32"
  onFocus={() => setActiveInput("village")}
  onBlur={() => setActiveInput(null)}

  returnKeyType="done"
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

        {/* SAVE BUTTON */}
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
      {showAlert && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>

      <View style={styles.iconBg}>
              <Ionicons name="warning" size={36} color="#1B5E20" />
            </View>
      <AppText style={styles.modalTitle} language={language}>
        {language === "te" ? "లోపం" : "Error"}
      </AppText>

      <AppText style={styles.modalText} language={language}>
        {language === "te"
          ? "దయచేసి * గుర్తు వివరాలు నమోదు చేయండి"
          : "Please fill all required* fields to continue"}
      </AppText>

      <TouchableOpacity
        style={styles.modalBtn}
        onPress={() => setShowAlert(false)}
      >
        <AppText style={styles.modalBtnText} language={language}>
          {language === "te" ? "సరే" : "Okay"}
        </AppText>
      </TouchableOpacity>

    </View>
  </View>
)}
<AgriLoader visible={loading} type="saving" language={language} />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#F6F7F6"
  },

  container: {
    padding: 20
  },

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

  inputFocused: {
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },

  input: {
  flex: 1,
  marginLeft: 10,

  fontSize: 15,
  color: "#1F2937",

  includeFontPadding: false
},
  saveBtn: {
    marginTop: 25,
    borderRadius: 18,
    overflow: "hidden"
  },
modalOverlay: {
  flex: 1,
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center"
},

modalBox: {
  width: "80%",
  backgroundColor: "white",
  borderRadius: 20,
  padding: 20,
  alignItems: "center"
},

modalTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginTop: 10,
  color: "#1F2937"
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

modalText: {
  marginTop: 8,
  textAlign: "center",
  color: "#6B7280"
},

modalBtn: {
  marginTop: 20,
  backgroundColor: "#2E7D32",
  paddingHorizontal: 30,
  paddingVertical: 10,
  borderRadius: 10
},

modalBtnText: {
  color: "white",
  fontWeight: "600"
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
  }

});