//vechile farmer
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import React, { useEffect, useRef, useState } from "react";
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // 🔥 Inline Errors State
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
      name: "రైతు పూర్తి పేరు*",
      phone: "ఫోన్ నంబర్*",
      village: "గ్రామం పేరు*"
    }
  };

  const t = placeholders[language] || placeholders.en;
  const [isListening, setIsListening] = useState(false);

  // వాయిస్ రిజల్ట్ ని హ్యాండిల్ చేయడం
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      if (activeInput === "name") {
        setName(transcript);
        if (errors.name) setErrors({ ...errors, name: "" });
      }
      else if (activeInput === "village") {
        setVillage(transcript);
        if (errors.village) setErrors({ ...errors, village: "" });
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

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => {
      if (l) setLanguage(l as any);
    });
  }, []);

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
        .collection("farmers")
        .doc(editId as string)
        .get();

      const data = doc.data();
      const userDoc = await firestore()
        .collection("users")
        .doc(userPhone)
        .get();

      const activeSession = userDoc.data()?.activeSession;

      if (data?.session !== activeSession) {
        console.log("Wrong session blocked");
        return;
      }
      
      if (data) {
        setName(data.farmerName || "");
        setPhone(data.phone || "");
        setVillage(data.village || "");
      }
    };

    loadEditData();
  }, [editId]);

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (loading) return;

    // ముందుగా స్పేసెస్ లేకుండా క్లీన్ చేసుకుందాం
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanVillage = village.trim();

    // 🔥 INLINE VALIDATION LOGIC
    const newErrors: any = {};
    if (!cleanName) newErrors.name = language === "te" ? "రైతు పేరు నమోదు చేయండి*" : "Enter farmer name*";
    
    if (!cleanPhone) {
      newErrors.phone = language === "te" ? "ఫోన్ నంబర్ నమోదు చేయండి*" : "Enter phone number*";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = language === "te" ? "సరైన ఫోన్ నంబర్ ఇవ్వండి*" : "Enter valid phone number*";
    }

    if (!cleanVillage) newErrors.village = language === "te" ? "గ్రామం పేరు నమోదు చేయండి*" : "Enter village name*";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);

      // 🔥 FORCE UI RENDER
      await new Promise(resolve => setTimeout(resolve, 0));
      const userPhone = await AsyncStorage.getItem("USER_PHONE");
      if (!userPhone) {
        setLoading(false);
        return;
      }

      const userDoc = await firestore()
        .collection("users")
        .doc(userPhone)
        .get();

      const activeSession = userDoc.data()?.activeSession;

      if (!activeSession) {
        setLoading(false);
        return;
      }

      const ref = firestore()
        .collection("users")
        .doc(userPhone)
        .collection("vehicles")
        .doc(vehicleId as string)
        .collection("farmers");

      if (editId) {
        await ref.doc(editId as string).update({
          farmerName: cleanName,
          phone: cleanPhone,
          village: cleanVillage
        });
      } else {
        await ref.add({
          farmerName: cleanName,
          phone: cleanPhone,
          village: cleanVillage,
          session: activeSession, 
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      }

      setTimeout(() => {
        setLoading(false);
        router.back();
      }, 400);

    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={
          editId
            ? (language === "te" ? "రైతు వివరాలు మార్చండి" : "Edit Farmer")
            : (language === "te" ? "రైతు వివరాలు" : "Add Farmer")
        }
        subtitle={
          editId
            ? (language === "te" ? "సవరించండి" : "Update Details")
            : (language === "te" ? "రైతు నమోదు చేయండి" : "Add Farmer Details")
        }
        language={language}
      />

      <View style={styles.container}>

        {/* 👤 NAME */}
        <TouchableOpacity
          style={[styles.inputBox, activeInput === "name" && styles.inputFocused, errors.name && styles.inputError]}
          activeOpacity={1}
          onPress={() => { setActiveInput("name"); nameRef.current?.focus(); }}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={name || activeInput === "name" ? "#16A34A" : "#9CA3AF"} 
          />
          <View style={styles.inputWrapper}>
            {!name && activeInput !== "name" && (
              <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>{t.name}</AppText>
            )}
            <TextInput
              ref={nameRef}
              value={name}
              onChangeText={(txt) => {
                setName(txt);
                if (errors.name) setErrors({ ...errors, name: "" });
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
          <TouchableOpacity onPress={() => handleVoiceInput("name")} style={styles.micBtn}>
            <MaterialCommunityIcons 
              name={isListening && activeInput === "name" ? "microphone" : "microphone-outline"} 
              size={24} 
              color={isListening && activeInput === "name" ? "#EF4444" : (activeInput === "name" ? "#16A34A" : "#6B7280")} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        {errors.name && <AppText style={styles.errorText} language={language}>{errors.name}</AppText>}

        {/* 📞 PHONE */}
        <TouchableOpacity
          style={[styles.inputBox, activeInput === "phone" && styles.inputFocused, errors.phone && styles.inputError]}
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
              <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>{t.phone}</AppText>
            )}
            <TextInput
              ref={phoneRef}
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              keyboardType="number-pad"
              maxLength={10}
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              style={[styles.input, { display: (phone || activeInput === "phone") ? "flex" : "none" }]}
              onFocus={() => setActiveInput("phone")}
              onBlur={() => setActiveInput(null)}
              returnKeyType="next"
              onSubmitEditing={() => villageRef.current?.focus()}
            />
          </View>
        </TouchableOpacity>
        {errors.phone && <AppText style={styles.errorText} language={language}>{errors.phone}</AppText>}

        {/* 📍 VILLAGE */}
        <TouchableOpacity
          style={[styles.inputBox, activeInput === "village" && styles.inputFocused, errors.village && styles.inputError]}
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
              <AppText style={{ color: "#9CA3AF", fontFamily: "Mandali" }}>{t.village}</AppText>
            )}
            <TextInput
              ref={villageRef}
              value={village}
              onChangeText={(txt) => {
                setVillage(txt);
                if (errors.village) setErrors({ ...errors, village: "" });
              }}
              cursorColor="#16A34A"
              selectionColor="#16A34A40"
              style={[styles.input, { display: (village || activeInput === "village") ? "flex" : "none" }]}
              onFocus={() => setActiveInput("village")}
              onBlur={() => setActiveInput(null)}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity onPress={() => handleVoiceInput("village")} style={styles.micBtn}>
            <MaterialCommunityIcons 
              name={isListening && activeInput === "village" ? "microphone" : "microphone-outline"} 
              size={24} 
              color={isListening && activeInput === "village" ? "#EF4444" : (activeInput === "village" ? "#16A34A" : "#6B7280")} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        {errors.village && <AppText style={styles.errorText} language={language}>{errors.village}</AppText>}

        {/* SAVE */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.9}
          disabled={loading}
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
    marginTop: -10,
    marginBottom: 10,
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
  
  // ORIGINAL BUTTON STYLES
  saveBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveGradient: {
    height: 56,
    justifyContent: "center",
    alignItems: "center"
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});