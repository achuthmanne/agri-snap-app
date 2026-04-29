//vechile drivers
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

export default function AddWork() {

  const router = useRouter();
  const { vehicleId, editId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");

  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState<"te" | "en">("te");

  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const villageRef = useRef<TextInput>(null);

  const placeholders = {
  en: {
    name: "Full Name*",
    phone: "Phone Number*",
    village: "Village Name*"
  },
  te: {
    name: "డ్రైవర్ పూర్తి పేరు*",
    phone: "ఫోన్ నంబర్*",
    village: "గ్రామం పేరు*"
  }
};

const t = placeholders[language] || placeholders.en;
const [isListening, setIsListening] = useState(false);

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
  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
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
      if (!userPhone) return;

      const ref = firestore()
        .collection("users")
        .doc(userPhone)
        .collection("vehicles")
        .doc(vehicleId as string)
        .collection("drivers");

      if (editId) {
        await ref.doc(editId as string).update({
          driverName: name.trim(),
          phone: phone.trim(),
          village: village.trim()
        });
      } else {
        await ref.add({
          driverName: name.trim(),
          phone: phone.trim(),
          village: village.trim(),
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


  useEffect(() => {
  const loadEditData = async () => {
    if (!editId) return;

    const userPhone = await AsyncStorage.getItem("USER_PHONE");
    if (!userPhone) return;

    const doc = await firestore()
      .collection("users")
      .doc(userPhone)
      .collection("vehicles")
      .doc(vehicleId as string)
      .collection("drivers")
      .doc(editId as string)
      .get();

    const data = doc.data();

    if (data) {
      setName(data.driverName || "");
      setPhone(data.phone || "");
      setVillage(data.village || "");
    }
  };

  loadEditData();
}, [editId]);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
  title={
    editId
      ? (language === "te" ? "డ్రైవర్ వివరాలు మార్చండి" : "Edit Driver")
      : (language === "te" ? "డ్రైవర్ వివరాలు" : "Add Driver")
  }
  subtitle={
    editId
      ? (language === "te" ? "సవరించండి" : "Update Details")
      : (language === "te" ? "డ్రైవర్ నమోదు చేయండి" : "Add Driver Details")
  }
  language={language}
/>

      <View style={styles.container}>

       {/* 👤 NAME */}
<TouchableOpacity
  style={[styles.inputBox, activeInput === "name" && styles.inputFocused]}
  activeOpacity={1}
  onPress={() => nameRef.current?.focus()}
>
  <Ionicons 
    name="person-outline" 
    size={18} 
    color={activeInput === "name" ? "#2E7D32" : "#9CA3AF"} 
  />
  <View style={styles.inputWrapper}>
    {/* Custom AppText Placeholder */}
    {!name && activeInput !== "name" && (
      <AppText style={styles.customPlaceholder}>{t.name}</AppText>
    )}
    <TextInput
      ref={nameRef}
      value={name}
      onChangeText={setName}
      cursorColor={'green'}
      selectionColor={'green'}
      style={[
  styles.input,
  {
    fontFamily: "Mandali"   // 🔥 SAME AS AppText
  }
]}
      onFocus={() => setActiveInput("name")}
      onBlur={() => setActiveInput(null)}
      returnKeyType="next"
      onSubmitEditing={() => phoneRef.current?.focus()}
    />
  </View>
  {/* 👤 NAME Input లోపల చివరన */}
<TouchableOpacity onPress={() => handleVoiceInput("name")}  style={{
      marginLeft: 10,
      padding: 6,
      borderRadius: 50,
      backgroundColor: "#f0f9f3"
    }}>
  <MaterialCommunityIcons 
    name={isListening && activeInput === "name" ? "microphone" : "microphone-outline"} 
    size={22} 
    // ఇక్కడ మార్పు: Listening లో ఉండాలి మరియు యాక్టివ్ ఇన్‌పుట్ 'name' అయి ఉండాలి
    color={isListening && activeInput === "name" ? "#EF4444" : "#2E7D32"} 
  />
</TouchableOpacity>
</TouchableOpacity>

{/* 📞 PHONE */}
<TouchableOpacity
  style={[styles.inputBox, activeInput === "phone" && styles.inputFocused]}
  activeOpacity={1}
  onPress={() => phoneRef.current?.focus()}
>
  <Ionicons 
    name="call-outline" 
    size={18} 
    color={activeInput === "phone" ? "#2E7D32" : "#9CA3AF"} 
  />
  <View style={styles.inputWrapper}>
    {!phone && activeInput !== "phone" && (
      <AppText style={styles.customPlaceholder}>{t.phone}</AppText>
    )}
    <TextInput
      ref={phoneRef}
      value={phone}
      onChangeText={setPhone}
      keyboardType="number-pad"
      maxLength={10}
       cursorColor={'green'}
      selectionColor={'green'}
      style={[
  styles.input,
  {
    fontFamily: "Mandali"   // 🔥 SAME AS AppText
  }
]}
      onFocus={() => setActiveInput("phone")}
      onBlur={() => setActiveInput(null)}
      returnKeyType="next"
      onSubmitEditing={() => villageRef.current?.focus()}
    />
  </View>
</TouchableOpacity>

{/* 📍 VILLAGE */}
<TouchableOpacity
  style={[styles.inputBox, activeInput === "village" && styles.inputFocused]}
  activeOpacity={1}
  onPress={() => villageRef.current?.focus()}
>
  <Ionicons 
    name="location-outline" 
    size={18} 
    color={activeInput === "village" ? "#2E7D32" : "#9CA3AF"} 
  />
  <View style={styles.inputWrapper}>
    {!village && activeInput !== "village" && (
      <AppText style={styles.customPlaceholder}>{t.village}</AppText>
    )}
    <TextInput
      ref={villageRef}
      value={village}
      onChangeText={setVillage}
      style={[
  styles.input,
  {
    fontFamily: "Mandali"   // 🔥 SAME AS AppText
  }
]}
      cursorColor={'green'}
      selectionColor={'green'}
      onFocus={() => setActiveInput("village")}
      onBlur={() => setActiveInput(null)}
      returnKeyType="done"
    />
  </View>
  <TouchableOpacity onPress={() => handleVoiceInput("village")}  style={{
      marginLeft: 10,
      padding: 6,
      borderRadius: 50,
      backgroundColor: "#f0f9f3"
    }}>
  <MaterialCommunityIcons 
    name={isListening && activeInput === "village" ? "microphone" : "microphone-outline"} 
    size={22} 
    // ఇక్కడ మార్పు: Listening లో ఉండాలి మరియు యాక్టివ్ ఇన్‌పుట్ 'village' అయి ఉండాలి
    color={isListening && activeInput === "village" ? "#EF4444" : "#2E7D32"} 
  />
</TouchableOpacity>
</TouchableOpacity>

        {/* SAVE */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            style={styles.saveGradient}
          >
            <AppText style={styles.saveText}>
                        {editId
                          ? (language === "te" ? "సవరించండి" : "Update Farmer")
                          : (language === "te" ? "భద్రపరచండి" : "Save Farmer")}
                      </AppText>
          </LinearGradient>
        </TouchableOpacity>

      </View>

      {/* ALERT */}
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
                ? "అవసరమైన వివరాలు నమోదు చేయండి"
                : "Please fill required fields"}
            </AppText>

            <TouchableOpacity activeOpacity={0.8}
              style={styles.modalBtn}
              onPress={() => setShowAlert(false)}
            >
             <AppText style={styles.modalBtnText}>
  {language === "te" ? "సరే" : "OK"}
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
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 60, // Fixed height for consistency
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
  },
  inputFocused: {
    borderColor: "#2E7D32",
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    paddingVertical: 0,
    // Note: Don't add fontFamily here, it will take from TextInput default. 
    // If you have a custom font for TextInput, add it here.
  },
  customPlaceholder: {
    position: 'absolute',
    left: 0,
    fontSize: 16,
    color: "#9CA3AF",
    // It will automatically use the font style from your AppText component!
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