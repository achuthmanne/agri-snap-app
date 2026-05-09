//app/farmer/mestri/add-mestri.tsx
// This screen allows the farmer to add a new Mestri. It includes fields for name, phone, and village. It validates the input, saves the new Mestri to Firestore under the current user's collection, and handles loading states and error messages.
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import React, { useEffect, useRef, useState } from "react";
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
  
  // 🔥 STANDARD PATTERN STATES
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; village?: string }>({});
  
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [loading, setLoading] = useState(false);
  
  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const villageRef = useRef<TextInput>(null);
  
  const [activeSession, setActiveSession] = useState("");
  
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
      if (activeInput === "name") {
        setName(transcript);
        if (errors.name) setErrors({ ...errors, name: undefined });
      }
      else if (activeInput === "village") {
        setVillage(transcript);
        if (errors.village) setErrors({ ...errors, village: undefined });
      }
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
    const loadSession = async () => {
      const userPhone = await AsyncStorage.getItem("USER_PHONE");
      if (!userPhone) {
        console.log("User not found");
        return;
      }

      const doc = await firestore()
        .collection("users")
        .doc(userPhone)
        .get();

      setActiveSession(doc.data()?.activeSession || "");
    };

    loadSession();
  }, []);

  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang) setLanguage(lang as "te" | "en");
    };

    loadLang();
  }, []);

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    // 🔥 INLINE VALIDATION LOGIC
    const newErrors: { name?: string; phone?: string; village?: string } = {};
    if (!name.trim()) {
      newErrors.name = language === "te" ? "పేరు నమోదు చేయండి*" : "Name is required*";
    }
    if (!village.trim()) {
      newErrors.village = language === "te" ? "గ్రామం నమోదు చేయండి*" : "Village is required*";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length !== 10) {
      newErrors.phone = language === "te" ? "సరైన ఫోన్ నంబర్ ఇవ్వండి" : "Enter valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setLoading(true);

      const userPhone = await AsyncStorage.getItem("USER_PHONE");

      if (!userPhone) {
        setLoading(false);
        Alert.alert("Error", "User not found");
        return;
      }

      // 🔥 PRODUCTION FIX: ALWAYS GET FRESH SESSION
      const userDoc = await firestore()
        .collection("users")
        .doc(userPhone)
        .get();

      const session = userDoc.data()?.activeSession;

      if (!session) {
        setLoading(false);
        Alert.alert("Error", "Session not found");
        return;
      }

      await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .add({
          name: name.trim(),
          phone: cleanPhone,
          village: village.trim(),
          session: session, 
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      router.back();

    } catch (e) {
      console.log("Save error:", e);
      Alert.alert("Error", "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop(); // 🔥 cleanup
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={language === "te" ? "మేస్త్రీ చేర్చండి" : "Add Mestri"}
        subtitle={language === "te" ? "వివరాలు నమోదు చేయండి" : "Enter Details"}
        language={language}
      />

      <View style={styles.container}>

        {/* 👤 NAME INPUT */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "name" && styles.inputFocused,
            errors.name && styles.inputError
          ]}
          activeOpacity={1}
          onPress={() => { setActiveInput("name"); nameRef.current?.focus(); }}
        >
          <Ionicons name="person-outline" size={20} color={name || activeInput === "name" ? "#16A34A" : "#9CA3AF"} />

          <View style={styles.inputWrapper}>
            {!name && activeInput !== "name" && (
              <AppText style={styles.placeholder}>
                {isListening && activeInput === "name" ? (language === "te" ? "వింటున్నాను..." : "Listening...") : t.name}
              </AppText>
            )}
            <TextInput
              ref={nameRef}
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              style={[styles.input, { display: (name || activeInput === "name") ? "flex" : "none" }]}
              onFocus={() => setActiveInput("name")}
              onBlur={() => setActiveInput(null)}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>
          
          <TouchableOpacity
            onPress={() => handleVoiceInput("name")}
            style={styles.micBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isListening && activeInput === "name" ? "mic" : "mic-outline"}
              size={24}
              color={isListening && activeInput === "name" ? "#EF4444" : (activeInput === "name" ? "#16A34A" : "#6B7280")}
            />
          </TouchableOpacity>
        </TouchableOpacity>
        {errors.name && <AppText style={styles.errorText} language={language}>{errors.name}</AppText>}

        {/* 📞 PHONE INPUT */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "phone" && styles.inputFocused,
            errors.phone && styles.inputError
          ]}
          activeOpacity={1}
          onPress={() => { setActiveInput("phone"); phoneRef.current?.focus(); }}
        >
          <Ionicons
            name="call-outline"
            size={20}
            color={phone || activeInput === "phone" ? "#16A34A" : "#9CA3AF"}
          />

          <View style={styles.inputWrapper}>
            {!phone && activeInput !== "phone" && (
              <AppText style={styles.placeholder}>{t.phone}</AppText>
            )}
            <TextInput
              ref={phoneRef}
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              style={[styles.input, { display: (phone || activeInput === "phone") ? "flex" : "none" }]}
              keyboardType="number-pad"
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              onFocus={() => setActiveInput("phone")}
              onBlur={() => setActiveInput(null)}
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => villageRef.current?.focus()}
            />
          </View>
        </TouchableOpacity>
        {errors.phone && <AppText style={styles.errorText} language={language}>{errors.phone}</AppText>}

        {/* 📍 VILLAGE INPUT */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "village" && styles.inputFocused,
            errors.village && styles.inputError
          ]}
          activeOpacity={1}
          onPress={() => { setActiveInput("village"); villageRef.current?.focus(); }}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={village || activeInput === "village" ? "#16A34A" : "#9CA3AF"}
          />

          <View style={styles.inputWrapper}>
            {!village && activeInput !== "village" && (
              <AppText style={styles.placeholder}>
                {isListening && activeInput === "village" ? (language === "te" ? "వింటున్నాను..." : "Listening...") : t.village}
              </AppText>
            )}
            <TextInput
              ref={villageRef}
              value={village}
              onChangeText={(txt) => {
                setVillage(txt);
                if (errors.village) setErrors({ ...errors, village: undefined });
              }}
              style={[styles.input, { display: (village || activeInput === "village") ? "flex" : "none" }]}
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              onFocus={() => setActiveInput("village")}
              onBlur={() => setActiveInput(null)}
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            onPress={() => handleVoiceInput("village")}
            style={styles.micBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isListening && activeInput === "village" ? "mic" : "mic-outline"}
              size={24}
              color={isListening && activeInput === "village" ? "#EF4444" : (activeInput === "village" ? "#16A34A" : "#6B7280")}
            />
          </TouchableOpacity>
        </TouchableOpacity>
        {errors.village && <AppText style={styles.errorText} language={language}>{errors.village}</AppText>}

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.9}>
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

  // 🔥 STANDARD PATTERN INPUT STYLES
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
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 5,
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
  placeholder: {
    position: "absolute",
    fontSize: 16,
    color: "#9CA3AF",
    fontFamily: "Mandali"
  },

  // ORIGINAL BUTTON STYLES (UNTOUCHED)
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
  }
});