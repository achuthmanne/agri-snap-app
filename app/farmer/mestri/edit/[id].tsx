/// This is the edit screen for a Mestri. It loads the existing details, allows the user to edit them, and saves the updates back to Firestore.
// It also includes validation to ensure required fields are filled, and shows a success message upon successful update.
//app/farmer/mestri/edit//[id].tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function EditMestri() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeSession, setActiveSession] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [loading, setLoading] = useState(false);
  const [loaderType, setLoaderType] = useState<"loading" | "updating">("loading");
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; village?: string }>({});
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
    const loadSession = async () => {
      const userPhone = await AsyncStorage.getItem("USER_PHONE");
      if (!userPhone) return;

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


  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop(); // 🔥 cleanup
    };
  }, []);

  /* ---------------- UPDATE ---------------- */

  const handleUpdate = async () => {
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
      setLoaderType("updating");  // 👈 updating type
      setLoading(true);

      const userPhone = await AsyncStorage.getItem("USER_PHONE");
      if (!userPhone || !id) {
        setLoading(false);
        return;
      }

      if (!activeSession) {
        setLoading(false);
        Alert.alert("Error", "Session missing");
        return;
      }
      await firestore()
        .collection("users")
        .doc(userPhone)
        .collection("mestris")
        .doc(id as string)
        .update({
          name: name.trim(),
          phone: cleanPhone,
          village: village.trim(),
          session: activeSession // 🔥 ensure correct session
        });

      setLoading(false);
      router.back();

    } catch (e) {
      setLoading(false);
      console.log("Update error:", e);
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
            activeInput === "name" && styles.inputFocused,
            errors.name && styles.inputError
          ]}
          activeOpacity={1}
          onPress={() => nameRef.current?.focus()}
        >
          <Ionicons name="person-outline" size={20} color={activeInput === "name" ? "#16A34A" : "#9CA3AF"} />

          <TextInput
            ref={nameRef}
            placeholder={isListening && activeInput === "name" ? (language === "te" ? "వింటున్నాను..." : "Listening...") : t.name}
            placeholderTextColor={isListening && activeInput === "name" ? "#EF4444" : "#9CA3AF"}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            cursorColor="#16A34A"
            selectionColor="#16A34A40"
            style={styles.input}
            onFocus={() => setActiveInput("name")}
            onBlur={() => setActiveInput(null)}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
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

        {/* PHONE */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "phone" && styles.inputFocused,
            errors.phone && styles.inputError
          ]}
          activeOpacity={1}
          onPress={() => phoneRef.current?.focus()}
        >
          <Ionicons name="call-outline" size={20} color={activeInput === "phone" ? "#16A34A" : "#9CA3AF"} />

          <TextInput
            ref={phoneRef}
            placeholder={t.phone}
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={(txt) => {
              setPhone(txt);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            cursorColor="#16A34A"
            selectionColor="#16A34A40"
            style={styles.input}
            onFocus={() => setActiveInput("phone")}
            onBlur={() => setActiveInput(null)}
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="next"
            onSubmitEditing={() => villageRef.current?.focus()}
          />
        </TouchableOpacity>
        {errors.phone && <AppText style={styles.errorText} language={language}>{errors.phone}</AppText>}

        {/* VILLAGE */}
        <TouchableOpacity
          style={[
            styles.inputBox,
            activeInput === "village" && styles.inputFocused,
            errors.village && styles.inputError
          ]}
          activeOpacity={1}
          onPress={() => villageRef.current?.focus()}
        >
          <Ionicons name="location-outline" size={20} color={activeInput === "village" ? "#16A34A" : "#9CA3AF"} />

          <TextInput
            ref={villageRef}
            placeholder={isListening && activeInput === "village" ? (language === "te" ? "వింటున్నాను..." : "Listening...") : t.village}
            placeholderTextColor={isListening && activeInput === "village" ? "#EF4444" : "#9CA3AF"}
            value={village}
            onChangeText={(txt) => {
              setVillage(txt);
              if (errors.village) setErrors({ ...errors, village: undefined });
            }}
            cursorColor="#16A34A"
            selectionColor="#16A34A40"
            style={styles.input}
            onFocus={() => setActiveInput("village")}
            onBlur={() => setActiveInput(null)}
            returnKeyType="done"
          />
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

        {/* UPDATE BUTTON */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdate}
          disabled={loading} >
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
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB"
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "Mandali",
    textAlignVertical: "center",
    includeFontPadding: false,
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