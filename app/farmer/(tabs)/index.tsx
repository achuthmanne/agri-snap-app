///dashbaordapp/farmer/(tabs)/index.tsx)
import { setDrawer } from "@/assets/stores/drawerStore";
import { useLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated, AppState, Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl, SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import AppText from "../../../components/AppText";
const { width } = Dimensions.get("window");

/* ---------------- TRANSLATIONS ---------------- */

const translations = {

te:{
morning:"శుభోదయం",
afternoon:"శుభ మధ్యాహ్నం",
evening:"శుభ సాయంత్రం",
night:"శుభ రాత్రి",
quick:"స్మార్ట్ సూచనలు",
all:"అన్ని సేవలు",
attendance:"హాజరు",
payments:"పేమెంట్స్",
sales:"అమ్మకాలు",
expenses:"ఖర్చులు",
ai:"అగ్రి స్కాన్",
crops:"సారాంశం",
schemes:"పథకాలు",
market:"మార్కెట్",
news:"వార్తలు",
forecast:"వాతావరణం చూడండి",
weather: "వాతావరణం",
machine: "యంత్ర పని",
calculator:"కాలిక్యులేటర్",
land:"భూమి కొలత",
booking: "అగ్రి కనెక్ట్",
fields: "పొలాలు"
},

en:{
morning:"Good Morning",
afternoon:"Good Afternoon",
evening:"Good Evening",
night:"Good Night",
quick:"Smart Suggestions",
all:"All Services",
calculator:"Calculator",
land:"Land",
attendance:"Attendance",
payments:"Payments",
forecast:"See Forecast",
sales:"Sales",
expenses:"Expenses",
ai:"AgriScan",
crops:"Summary",
schemes:"Schemes",
market:"Market",
news:"News",
weather: "Weather",
machine: "Machines",
booking: "AgriConnect",
fields: "Fields"
}

};

export default function Dashboard() {

  const router = useRouter();
  const quickRef = useRef<any>(null);
const scrollY = useRef(new Animated.Value(0)).current; // 👈 Add this for scroll tracking
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const { language } = useLanguage();

  const [city, setCity] = useState(
  language === "te" ? "లోడ్ అవుతోంది..." : "Loading..."
);
  const [temp, setTemp] = useState<number | null>(null);
  const [weather, setWeather] = useState("");
  const [humidity, setHumidity] = useState<number | null>(null);
  const [wind, setWind] = useState<number | null>(null);
const [refreshing,setRefreshing] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
const [scrollForward,setScrollForward] = useState(true);
  const [quickServices, setQuickServices] = useState<any[]>([]);
const [activeHeaderCard,setActiveHeaderCard] = useState(0);
const [prices,setPrices] = useState<any[]>([]);
const [priceLoading,setPriceLoading] = useState(true);
const [notifCount, setNotifCount] = useState(0);
const headerCardRef = useRef<any>(null);
const [isOnline, setIsOnline] = useState(true);
const [weatherType, setWeatherType] = useState("");
const [activeSession, setActiveSession] = useState("");
// 🔥 నీ పర్సనల్ అడ్మిన్ నెంబర్ (నీ అసలు నెంబర్ ఇక్కడ పెట్టుకో)
  const ADMIN_PHONE = "8121648629"; 
  const [isAdmin, setIsAdmin] = useState(false);
const [sessionModal, setSessionModal] = useState(false);
const [oldSessionModal, setOldSessionModal] = useState(false);
const [allSessions, setAllSessions] = useState<string[]>([]);
  const t = translations[language as "te" | "en"];
  const CACHE_KEY = "WEATHER_CACHE";
const CACHE_TIME = 5 * 60 * 1000; // 5 mins

const PRICE_CACHE_KEY = "PRICE_CACHE";
const PRICE_CACHE_TIME = 2 * 60 * 1000; // 2 mins

const LOCATION_CACHE_KEY = "LOCATION_CACHE";
const LOCATION_CACHE_TIME = 15 * 60 * 1000; // 15 mins

  /* ---------------- ICONS ---------------- */


  const icons = {
    attendance: require("../../../assets/images/user-check.png"),
    payments: require("../../../assets/images/secured-payment.png"),
    sales: require("../../../assets/images/cash-flow.png"),
    expenses: require("../../../assets/images/ex.png"),
    ai: require("../../../assets/images/technology.png"),
    crops: require("../../../assets/images/r.png"),
    schemes: require("../../../assets/images/distribution.png"),
    market: require("../../../assets/images/forecast-analytics.png"),
    news: require("../../../assets/images/television.png"),
    weather:require("../../../assets/images/a.png"),
machine:require("../../../assets/images/tractor.png"),
calculator:require("../../../assets/images/calc.png"),
land:require("../../../assets/images/land.png"),
booking:require("../../../assets/images/link.png"),
fields:require("../../../assets/images/farm.png")
  };
const fadeAnim = useRef(new Animated.Value(0)).current;
const swipeAnim = useRef(new Animated.Value(0)).current;
const priceScroll = useRef(new Animated.Value(0)).current;


  /* ---------------- SERVICES ---------------- */


const getServices = () => [
  // 1. Daily Essentials (యూజర్ రోజూ చెక్ చేసేవి)
  { service: "attendance", title: t.attendance, icon: icons.attendance, screen: "/farmer/attendance" },
  { service: "weather", title: t.weather, icon: icons.weather, screen: "/farmer/weather" },
  { service: "expenses", title: t.expenses, icon: icons.expenses, screen: "/farmer/expenses" },

  // 2. Field & Crop Management (ప్రధానమైన వ్యవసాయ పనులు)
  { service: "fields", title: t.fields, icon: icons.fields, screen: "/farmer/fields" },
  { service: "crops", title: t.crops, icon: icons.crops, screen: "/farmer/summary" },

  // 3. Money & Business (ఆదాయం మరియు పేమెంట్స్)
  { service: "sales", title: t.sales, icon: icons.sales, screen: "/farmer/sales" },
  { service: "payments", title: t.payments, icon: icons.payments, screen: "/farmer/payments" },
  { service: "market", title: t.market, icon: icons.market, screen: "/farmer/market" },

  // 4. Machinery & Services (ట్రాక్టర్ బుకింగ్స్ వంటివి)
  { service: "machine", title: t.machine, icon: icons.machine, screen: "/farmer/vehicles" },
  { service: "booking", title: t.booking, icon: icons.booking, screen: "/farmer/bookings" },

  // 5. Intelligence & Knowledge (నాలెడ్జ్ కోసం)
  { service: "schemes", title: t.schemes, icon: icons.schemes, screen: "/farmer/schemes" },
  { service: "calculator", title: t.calculator, icon: icons.calculator, screen: "/farmer/calculator" },
  { service: "news", title: t.news, icon: icons.news, screen: "/farmer/(tabs)/news" },
];



const cityMap: Record<string, string> = {
  // --- Telangana Districts ---
  "Adilabad": "ఆదిలాబాద్",
  "Bhadradri Kothagudem": "భద్రాద్రి కొత్తగూడెం",
  "Hanumakonda": "హన్మకొండ",
  "Hyderabad": "హైదరాబాద్",
  "Jagtial": "జగిత్యాల",
  "Jangaon": "జనగామ",
  "Jayashankar Bhupalpally": "జయశంకర్ భూపాలపల్లి",
  "Jogulamba Gadwal": "జోగులాంబ గద్వాల్",
  "Kamareddy": "కామారెడ్డి",
  "Karimnagar": "కరీంనగర్",
  "Khammam": "ఖమ్మం",
  "Kumuram Bheem Asifabad": "కుమురం భీమ్ ఆసిఫాబాద్",
  "Mahabubabad": "మహబూబాబాద్",
  "Mahabubnagar": "మహబూబ్‌నగర్",
  "Mancherial": "మంచిర్యాల",
  "Medak": "మెదక్",
  "Medchal Malkajgiri": "మేడ్చల్ మల్కాజిగిరి",
  "Mulugu": "ములుగు",
  "Nagarkurnool": "నాగర్ కర్నూల్",
  "Nalgonda": "నల్గొండ",
  "Narayanpet": "నారాయణపేట",
  "Nirmal": "నిర్మల్",
  "Nizamabad": "నిజామాబాద్",
  "Peddapalli": "పెద్దపల్లి",
  "Rajanna Sircilla": "రాజన్న సిరిసిల్ల",
  "Rangareddy": "రంగారెడ్డి",
  "Sangareddy": "సంగారెడ్డి",
  "Siddipet": "సిద్ధిపేట",
  "Suryapet": "సూర్యాపేట",
  "Vikarabad": "వికారాబాద్",
  "Wanaparthy": "వనపర్తి",
  "Warangal": "వరంగల్",
  "Yadadri Bhuvanagiri": "యాదాద్రి భువనగిరి",

  // --- Andhra Pradesh Districts ---
  "Alluri Sitharama Raju": "అల్లూరి సీతారామరాజు",
  "Anakapalli": "అనకాపల్లి",
  "Anantapur": "అనంతపురం",
  "Annamayya": "అన్నమయ్య",
  "Bapatla": "బాపట్ల",
  "Chittoor": "చిత్తూరు",
  "East Godavari": "తూర్పు గోదావరి",
  "Eluru": "ఏలూరు",
  "Guntur": "గుంటూరు",
  "Kakinada": "కాకినాడ",
  "Konaseema": "కోనసీమ",
  "Krishna": "కృష్ణా",
  "Kurnool": "కర్నూలు",
  "Manyam": "మన్యం",
  "Nandyal": "నంద్యాల",
  "NTR": "ఎన్టీఆర్",
  "Palnadu": "పల్నాడు",
  "Prakasam": "ప్రకాశం",
  "Nellore": "నెల్లూరు",
  "Sri Sathya Sai": "శ్రీ సత్యసాయి",
  "Srikakulam": "శ్రీకాకుళం",
  "Tirupati": "తిరుపతి",
  "Visakhapatnam": "విశాఖపట్నం",
  "Vizianagaram": "విజయనగరం",
  "West Godavari": "పశ్చిమ గోదావరి",
  "YSR Kadapa": "వైఎస్ఆర్ కడప",
  "Vijayawada": "విజయవాడ",

  // --- Common Town/Mandal names for Weather APIs ---
  "Secunderabad": "సికింద్రాబాద్",
  "Gajwel": "గజ్వేల్",
  "Sircilla": "సిరిసిల్ల",
  "Proddatur": "ప్రొద్దుటూరు",
  "Hindupur": "హిందూపూర్",
  "Madanapalle": "మదనపల్లి",
  "Adoni": "ఆదోని",
  "Tenali": "తెనాలి"
};



useEffect(() => {

  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected ?? false);
  });

  return () => unsubscribe();

}, []);

useEffect(() => {
  const unsub = firestore()
    .collection("notifications")
    .onSnapshot(async snap => {

      const phone = await AsyncStorage.getItem("USER_PHONE");
      if (!phone) return;

      const userDoc = await firestore()
        .collection("users")
        .doc(phone)
        .get();

      const userState = userDoc.data()?.state;

      const hiddenSnap = await firestore()
        .collection("users")
        .doc(phone)
        .collection("hiddenNotifications")
        .get();

      const hiddenIds = hiddenSnap.docs.map(d => d.id);

      let count = 0;
      const now = new Date();
const normalize = (s:any) => (s || "").trim().toLowerCase();
      snap.forEach(doc => {
        const data = doc.data();

        // ❌ hidden skip
        if (hiddenIds.includes(doc.id)) return;

        // ❌ deleteAt skip
        let deleteTime = null;
        if (data.deleteAt && typeof data.deleteAt.toDate === "function") {
          deleteTime = data.deleteAt.toDate();
        }
        if (deleteTime && now > deleteTime) return;
console.log("📢 Notif state:", data.state);
console.log("👤 User state:", userState);

       if (data.userId === "all") {
  // ok
}
else if (data.state) {
  if (normalize(data.state) !== normalize(userState)) return;
}
else if (data.userId) {
  if (data.userId !== phone) return;
}
else {
  return; // 🔥 IMPORTANT fallback
}

        // ✅ only unread count
        if (!data.seen) {
          count++;
        }
      });

      setNotifCount(count);
    });

  return () => unsub();
}, []);

useEffect(() => {
  setDrawer(false);
}, []);



useEffect(() => {

  async function saveToken() {

    const token = await messaging().getToken();
    console.log("FCM TOKEN:", token);

    const phone = await AsyncStorage.getItem("USER_PHONE");

    if (phone) {
      await firestore()
        .collection("users")
        .doc(phone)
        .set({ fcmToken: token }, { merge: true });
    }

  }

  saveToken();

  const unsubscribe = messaging().onTokenRefresh(async token => {
    const phone = await AsyncStorage.getItem("USER_PHONE");

    if (phone) {
      await firestore()
        .collection("users")
        .doc(phone)
        .set({ fcmToken: token }, { merge: true });
    }
  });

  return unsubscribe;

}, []);
 /* ---------------- QUICK SERVICES ---------------- */
const services = useMemo(() => getServices(), [language]);
  const calculateQuick = async () => {

  const usage = await AsyncStorage.getItem("SERVICE_USAGE");

  let sorted = services;

if(usage){

const data = JSON.parse(usage);

sorted = [...services].sort((a,b)=>{
return (data[b.service] || 0) - (data[a.service] || 0);
});

}

/* ---- TIME BASED BOOST ---- */

const hour = new Date().getHours();

let priority:string[] = [];

if (hour >= 5 && hour < 10) {
    // 🌅 ఉదయం (5AM - 10AM): పని మొదలయ్యే సమయం
    // వాతావరణం చూసుకోవాలి, కూలీల అటెండెన్స్ వేయాలి
    priority = ["weather", "attendance", "market"];
} 

else if (hour >= 10 && hour < 16) {
    // ☀️ మధ్యాహ్నం (10AM - 4PM): బిజినెస్ & మేనేజ్మెంట్ సమయం
    // ఫీల్డ్స్ విజిట్, అమ్మకాలు, పేమెంట్స్ చూసుకునే టైమ్
    priority = ["fields", "sales", "payments"];
} 

else if (hour >= 16 && hour < 21) {
    // 🌇 సాయంత్రం (4PM - 9PM): లెక్కలు & రేపటి ప్లానింగ్
    // ఖర్చులు రాయడం, రేపటికి మెషీన్ బుక్ చేసుకోవడం
    priority = ["expenses", "machine", "booking"];
} 

else {
    // 🌙 రాత్రి (9PM - 5AM): రిలాక్స్ & నాలెడ్జ్ టైమ్
    // పంటల సమ్మరీ, ప్రభుత్వ పథకాలు, వార్తలు చదువుకోవడం
    priority = ["crops", "schemes", "news"];
}

/* ---- BOOST PRIORITY ---- */

sorted.sort((a,b)=>{

if(priority.includes(a.service)) return -1;
if(priority.includes(b.service)) return 1;

return 0;

});

setQuickServices(sorted.slice(0,5));

};



  /* ---------------- EFFECTS ---------------- */

  useEffect(()=>{
calculateQuick();
},[language]);


useFocusEffect(
React.useCallback(()=>{
loadUser();
},[])
);
  useEffect(() => {
    const interval = setInterval(() => {

      const now = new Date();

      setTime(
        now.toLocaleTimeString(language === "te" ? "te-IN" : "en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      );

      setDate(
        now.toLocaleDateString(language === "te" ? "te-IN" : "en-IN", {
          weekday: "long",
          day: "numeric",
          month: "short"
        })
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [language]);


useEffect(()=>{

// Greeting fade + slide
Animated.timing(fadeAnim,{
toValue:1,
duration:900,
useNativeDriver:true
}).start();


},[]);

useEffect(()=>{

Animated.loop(
Animated.sequence([

Animated.timing(swipeAnim,{
toValue:10,
duration:700,
useNativeDriver:true
}),

Animated.timing(swipeAnim,{
toValue:0,
duration:700,
useNativeDriver:true
})

])
).start();

},[]);

useEffect(()=>{

const interval = setInterval(()=>{

const next = activeHeaderCard === 1 ? 0 : 1;

headerCardRef.current?.scrollToIndex({
index:next,
animated:true
});

setActiveHeaderCard(next);

},4000);

return ()=>clearInterval(interval);

},[activeHeaderCard]);

useEffect(()=>{

Animated.loop(

Animated.sequence([

Animated.timing(priceScroll,{
toValue:-60,
duration:2500,
useNativeDriver:true
}),

Animated.timing(priceScroll,{
toValue:0,
duration:0,
useNativeDriver:true
})

])

).start();

},[]);



const onRefresh = async () => {

setRefreshing(true);

await getLocationWeather();
await fetchPrices();

await new Promise(resolve => setTimeout(resolve,800));

setRefreshing(false);

};


  /* ---------------- USER ---------------- */

  const loadUser = async () => {

    try {

      const phone = await AsyncStorage.getItem("USER_PHONE");

      if (!phone) {
        setLoading(false);
        return;
      }
      // 🔥 ఇక్కడ అడ్మిన్ చెక్ జరుగుతుంది!
      if (phone === ADMIN_PHONE) {
         setIsAdmin(true);
      }
await fetchAllSessions(phone);
      const doc = await firestore().collection("users").doc(phone).get();
      const data = doc.data();

      if (data?.name) setName(data.name);
const current = getCurrentSession();

if (!data?.activeSession) {
  await firestore()
    .collection("users")
    .doc(phone)
    .set({ activeSession: current }, { merge: true });

  setActiveSession(current);
} else {
  setActiveSession(data.activeSession);
}
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };


const translateToTelugu = async (text: string) => {

  // 🔥 STEP 1: STATIC MAP CHECK
  if (cityMap[text]) {
    return cityMap[text]; // ⚡ instant
  }

  // 🔥 STEP 2: FALLBACK (optional API)
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(text)}`
    );

    const data = await res.json();
    return data[0][0][0];

  } catch {
    return text;
  }
};


// 🌾 CURRENT SESSION (June based)
const getCurrentSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 5 ? year : year - 1;

  return `${startYear}-${(startYear + 1).toString().slice(-2)}`;
};

// 📅 LAST 3 SESSIONS
const getSessionList = () => {
  const current = getCurrentSession();
  const startYear = parseInt(current.split("-")[0]);

  return [
    `${startYear - 2}-${(startYear - 1).toString().slice(-2)}`,
    `${startYear - 1}-${(startYear).toString().slice(-2)}`,
    current
  ];
};
const sessions = getSessionList();

const oldestSession = sessions[0]; // 2023-24

const oldSessions = allSessions.filter(s => {
  return parseInt(s.split("-")[0]) < parseInt(oldestSession.split("-")[0]);
});
const fetchAllSessions = async (phone:string) => {
  const snap = await firestore()
    .collection("users")
    .doc(phone)
    .collection("fields")
    .get();

  const sessionsSet = new Set<string>();

  snap.forEach(doc => {
    const data = doc.data();
    if (data.session) {
      sessionsSet.add(data.session);
    }
  });

  const sorted = Array.from(sessionsSet).sort(
  (a, b) => parseInt(b.split("-")[0]) - parseInt(a.split("-")[0])
);
  setAllSessions(sorted);
};
  /* ---------------- WEATHER ---------------- */

const formatWeather = (raw: string, language: string) => {
  const w = raw.toLowerCase();

  // 1. Thunderstorms (పిడుగులు/ఉరుములు)
  if (w.includes("thunderstorm") || w.includes("storm") || w.includes("lightning")) {
    return {
      text: language === "te" ? "పిడుగులతో కూడిన వర్షం" : "Thunderstorm Warning",
      type: "storm"
    };
  }

  // 2. Rain & Drizzle (వర్షం)
  if (w.includes("rain") || w.includes("drizzle") || w.includes("shower")) {
    if (w.includes("heavy") || w.includes("extreme") || w.includes("very heavy")) {
      return {
        text: language === "te" ? "భారీ వర్షం" : "Heavy Rainfall",
        type: "rain"
      };
    }
    if (w.includes("light") || w.includes("drizzle")) {
      return {
        text: language === "te" ? "చిరుజల్లులు" : "Light Drizzle",
        type: "rain"
      };
    }
    return {
      text: language === "te" ? "వర్షం" : "Rainy Weather",
      type: "rain"
    };
  }

  // 3. Clouds (మేఘాలు)
  if (w.includes("cloud") || w.includes("overcast")) {
    if (w.includes("few") || w.includes("scattered") || w.includes("broken")) {
      return {
        text: language === "te" ? "పాక్షికంగా మబ్బులు" : "Partly Cloudy",
        type: "cloud"
      };
    }
    return {
      text: language === "te" ? "మబ్బులుగా ఉంది" : "Overcast/Cloudy",
      type: "cloud"
    };
  }

  // 4. Haze, Mist & Fog (పొగమంచు - Farmers morning visibility)
  if (w.includes("haze") || w.includes("mist") || w.includes("fog") || w.includes("smoke")) {
    return {
      text: language === "te" ? "పొగమంచు / మసక" : "Hazy & Misty",
      type: "haze"
    };
  }

  // 5. Clear & Sunny (నిర్మలమైన ఆకాశం/ఎండ)
  if (w.includes("clear") || w.includes("sun") || w.includes("hot")) {
    return {
      text: language === "te" ? "ఎండ / నిర్మలం" : "Clear Sunny Sky",
      type: "clear"
    };
  }

  // 6. Wind & Stormy (బలమైన గాలులు)
  if (w.includes("wind") || w.includes("gale") || w.includes("tornado") || w.includes("squall")) {
    return {
      text: language === "te" ? "బలమైన గాలులు" : "High Wind Alert",
      type: "wind"
    };
  }

  // 7. Snow (మంచు)
  if (w.includes("snow") || w.includes("sleet")) {
    return {
      text: language === "te" ? "మంచు కురుస్తోంది" : "Snowfall",
      type: "snow"
    };
  }

  return {
    text: raw, // Default fallback
    type: "default"
  };
};



const getLocationWeather = async () => {

if (!isOnline) {
  console.log("Offline → using cache");

  const cached = await AsyncStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);

    setCity(parsed.city);
    setTemp(parsed.temp);
    setWeather(parsed.weather);
    setHumidity(parsed.humidity);
    setWind(parsed.wind);
  }

  return;
}

  try {

    // 🔥 STEP 1: CHECK CACHE FIRST
    const cached = await AsyncStorage.getItem(CACHE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);

      if (
  Date.now() - parsed.timestamp < CACHE_TIME &&
  parsed.language === language
) {
      
        setCity(parsed.city);
        setTemp(parsed.temp);
        setWeather(parsed.weather);
        setHumidity(parsed.humidity);
        setWind(parsed.wind);

        return; // 🔥 STOP API CALL
      }
    }

   let latitude;
let longitude;

// 🔥 STEP 1: CHECK CACHE
const locCache = await AsyncStorage.getItem(LOCATION_CACHE_KEY);

if (locCache) {
  const parsed = JSON.parse(locCache);

  if (Date.now() - parsed.timestamp < LOCATION_CACHE_TIME) {
    console.log("⚡ using cached location");

    latitude = parsed.latitude;
    longitude = parsed.longitude;
  }
}

// 🔥 STEP 2: IF NO CACHE → FETCH NEW
if (!latitude || !longitude) {

  console.log("📍 fetching new location");

  const location = await Location.getCurrentPositionAsync({});
  latitude = location.coords.latitude;
  longitude = location.coords.longitude;

  // 🔥 SAVE CACHE
  await AsyncStorage.setItem(
    LOCATION_CACHE_KEY,
    JSON.stringify({
      latitude,
      longitude,
      timestamp: Date.now()
    })
  );
}
    // 🔥 STEP 3: API CALL
  const res = await fetch(
  `https://getweather-pdetykgfaq-uc.a.run.app?lat=${latitude}&lon=${longitude}`
);

// 🔥 API FAILURE CHECK
if (!res.ok) {
  throw new Error("Weather API failed");
}

const data = await res.json();

   // 🔥 STEP 4: UPDATE UI

let finalCity = data.name;

if (language === "te") {
  finalCity = await translateToTelugu(data.name);
}

setCity(finalCity);
setTemp(Math.round(data.main.temp));
const rawWeather = data.weather[0].description.toLowerCase();
const result = formatWeather(rawWeather, language);

setWeather(result.text);
setWeatherType(result.type);
setHumidity(data.main.humidity);
setWind(data.wind.speed);

// 🔥 STEP 5: SAVE CACHE

await AsyncStorage.setItem(
  CACHE_KEY,
  JSON.stringify({
    city: finalCity,
    temp: Math.round(data.main.temp),
    weather: result.text,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    timestamp: Date.now(),
language: language
  })
);

  }catch (e) {

  console.log("Weather API failed, using cache");

  const cached = await AsyncStorage.getItem(CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);

    setCity(parsed.city);
    setTemp(parsed.temp);
    setWeather(parsed.weather);
    setHumidity(parsed.humidity);
    setWind(parsed.wind);
  }

}
};

const fetchPrices = async () => {

if (!isOnline) {
  console.log("Offline → prices from cache");

  const cached = await AsyncStorage.getItem(PRICE_CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);
    setPrices(parsed.data.slice(0,3));
    setPriceLoading(false);
  }

  return;
}

  try {

    // 🔥 STEP 1: CACHE CHECK
    const cached = await AsyncStorage.getItem(PRICE_CACHE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);

      if (Date.now() - parsed.timestamp < PRICE_CACHE_TIME) {
        console.log("⚡ prices from cache");
        setPrices(parsed.data.slice(0,3)); // UI ki 3 matrame
        setPriceLoading(false);
        return;
      }
    }

    setPriceLoading(true);

    // 🔥 STEP 2: CALL BACKEND
   const res = await fetch(
  "https://us-central1-agrisnap-9b487.cloudfunctions.net/getPrices"
);

// 🔥 API CHECK
if (!res.ok) {
  throw new Error("Price API failed");
}

const data = await res.json();

// 🔥 STEP 1: SORT (latest first)
const sorted = data.sort(
  (a: any, b: any) =>
    new Date(b.arrival_date).getTime() -
    new Date(a.arrival_date).getTime()
);

// 🔥 STEP 2: GROUP BY CROP
const grouped: any = {};

sorted.forEach((item: any) => {
  if (!grouped[item.commodity]) {
    grouped[item.commodity] = [];
  }
  grouped[item.commodity].push(item);
});

// 🔥 STEP 3: CREATE FINAL LIST
const finalPrices = Object.keys(grouped).map((key) => {
  const items = grouped[key];

  return {
    ...items[0], // latest
    prevPrice: items[1]?.modal_price || items[0].modal_price
  };
});

    setPrices(finalPrices.slice(0,3));

    // 🔥 STEP 3: SAVE CACHE
    await AsyncStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({
        data: finalPrices,
        timestamp: Date.now()
      })
    );

  } catch (e) {

  console.log("Price API failed, using cache");

  const cached = await AsyncStorage.getItem(PRICE_CACHE_KEY);

  if (cached) {
    const parsed = JSON.parse(cached);
    setPrices(parsed.data.slice(0,3));
  }

}

  setPriceLoading(false);
};

const getTrend = (current: number, prev: number) => {

  if (current > prev) return "up";
  if (current < prev) return "down";
  return "same";

};

const [fontsLoaded] = useFonts({
Mandali: require("../../../assets/fonts/Mandali-Regular.ttf")
});

if(!fontsLoaded){
return null;
}



useEffect(() => {

  let weatherInterval: any;
  let priceInterval: any;

  const start = () => {
    console.log("🟢 App Active → start fetching");

    getLocationWeather();
    fetchPrices();

    weatherInterval = setInterval(getLocationWeather, 300000); // 5 mins
    priceInterval = setInterval(fetchPrices, 120000); // 2 mins
  };

  const stop = () => {
    console.log("🔴 App Background → stop fetching");

    if (weatherInterval) clearInterval(weatherInterval);
    if (priceInterval) clearInterval(priceInterval);
  };

  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") start();
    else stop();
  });

  // 🔥 initial start
  start();

  return () => {
    stop();
    sub.remove();
  };

}, [language]);
 
  /* ---------------- SERVICE CLICK ---------------- */
const handleServiceClick = async (screen:string,service:string,index:number)=>{

try{

const usage = await AsyncStorage.getItem("SERVICE_USAGE");
let data = usage ? JSON.parse(usage) : {};

data[service] = (data[service] || 0) + 1;

await AsyncStorage.setItem("SERVICE_USAGE",JSON.stringify(data));

}catch(e){
console.log(e);
}

if(index < quickServices.length){
quickRef.current?.scrollToIndex({
index,
animated:true
});
}

router.push(screen as any);

};

          //  greeting handle
const getGreeting = () => {

const hour = new Date().getHours();

if(hour >= 5 && hour < 12){
return t.morning;
}

if(hour >= 12 && hour < 17){
return t.afternoon;
}

if(hour >= 17 && hour < 21){
return t.evening;
}

return t.night;

};
const getGreetingIcon = () => {

const hour = new Date().getHours();

if(hour >= 5 && hour < 12){
return "sunny-outline";
}

if(hour >= 12 && hour < 17){
return "partly-sunny-outline";
}

if(hour >= 17 && hour < 21){
return "cloudy-night-outline";
}

return "moon-outline";

};
//handle weather

  /* ---------------- WEATHER ICON ---------------- */

const getWeatherIcon = () => {

  if (weatherType === "cloud")
    return require("../../../assets/images/clouds.png");

  if (weatherType === "rain")
    return require("../../../assets/images/heavy-rain.png");

  if (weatherType === "storm")
    return require("../../../assets/images/thunder.png");

  if (weatherType === "clear")
    return require("../../../assets/images/sun.png");

  if (weatherType === "haze")
    return require("../../../assets/images/haze.png");

  if (weatherType === "snow")
    return require("../../../assets/images/snowy.png"); // Nuvvu kotha image add chesthe ikkada marchu

  if (weatherType === "wind")
    return require("../../../assets/images/windy.png"); // Nuvvu kotha image add chesthe ikkada marchu

  return require("../../../assets/images/we.png");
};


  /* ---------------- UI ---------------- */

  return (

    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* BODY */}
     <LinearGradient
  colors={["#1B5E20", "#1B5E20"]}
  style={styles.stickyTop}
>
    <View style={styles.headerRow}>

          <TouchableOpacity
style={styles.profileRow}
onPress={() => setDrawer(true)}

activeOpacity={0.8}
>
            <Image
              source={require("../../../assets/images/farmer.png")}
              style={styles.profileImage}
            />

            <View>
            <Animated.View
style={[
styles.greetRow,
{
opacity:fadeAnim,
transform:[
{
translateY:fadeAnim.interpolate({
inputRange:[0,1],
outputRange:[-12,0]
})
}
]
}
]}
>

<Ionicons
name={getGreetingIcon()}
size={18}
color="#C8E6C9"
/>

<AppText style={styles.greet} language={language}>
{getGreeting()}
</AppText>

</Animated.View>
   <AppText
  style={[
    styles.name,
    language === "en" && { fontWeight: "600", marginTop: -8 },
    language === "te" && { fontFamily: "Mandali", marginTop: -8}
  ]}
  language={language}
>
{name || "Farmer"}
</AppText>
            </View>
</TouchableOpacity>
   <TouchableOpacity
  style={styles.notifyBtn}
  activeOpacity={0.8}
  onPress={() => router.push("/farmer/notifications")}
>

  <Ionicons name="notifications-outline" size={22} color="white" />

  {notifCount > 0 && (
    <View style={styles.badge}>
      <AppText style={styles.badgeText}>
  {notifCount > 9 ? "9+" : notifCount}
</AppText>
    </View>
  )}

</TouchableOpacity>

        </View>
</LinearGradient>
    <Animated.ScrollView
onScroll={Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  { useNativeDriver: false }
)}
scrollEventThrottle={16}
showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingTop: 110 }}
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={onRefresh}
colors={["#2E7D32"]}
tintColor="#2E7D32"
/>
}

>
   <Animated.View>

<View>

<LinearGradient
colors={["#1B5E20","#1B5E20"]}
style={styles.header}
>

{!isOnline && (
  <View style={{
    flexDirection: 'row', // Icon & Text side-by-side ki
    alignItems: 'center',
    backgroundColor: "rgba(239, 68, 68, 0.12)", // Koncham soft red
    borderColor: "rgba(239, 68, 68, 0.4)",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8, // Spacing between icon and text
    alignSelf: "flex-start"
  }}>
    {/* Optional: Add a Lucide or Material Icon here */}
    <View>
      <AppText style={{
        color: "#EF4444", // Solid red for better contrast
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.5
      }} language={language}>
        {language === "te"
          ? "ఇంటర్నెట్ లేదు | పాత డేటా కనిపిస్తోంది" 
          : "Offline | Using cached data"}
      </AppText>
    </View>
  </View>
)}


      {/* HEADER CAROUSEL */}
<View style={styles.headerCarousel}>

<FlatList
ref={headerCardRef}
data={[{type:"weather"},{type:"market"}]}
horizontal
pagingEnabled
snapToInterval={width}
decelerationRate="fast"
showsHorizontalScrollIndicator={false}
keyExtractor={(item,index)=>index.toString()}
onMomentumScrollEnd={(e)=>{

const index = Math.round(
e.nativeEvent.contentOffset.x / (width - 40)
);

setActiveHeaderCard(index);

}}
renderItem={({item})=>{

if(item.type==="weather"){

return(



<View style={{
width: width - 40,
alignSelf:"center"
}}>

<TouchableOpacity
style={styles.headerGlassCard}
onPress={()=>router.push("/farmer/weather")}
activeOpacity={0.9}
>

<View style={styles.weatherLeft}>

<View style={styles.locationRow}>
<Ionicons name="location-outline" size={16} color="white"/>
<AppText style={styles.city} language={language}>
{city}
</AppText>
</View>

<AppText style={styles.date} language={language}>
{date} | {time}
</AppText>

<View style={styles.weatherRow}>

<Animated.Image source={getWeatherIcon()} style={ styles.weatherIcon} />
 <AppText style={styles.weatherText} language={language}>
 {weather}
 </AppText>
 
</View>

<View style={styles.rightTopSection}>

<View style={styles.forecastRow}>
<AppText style={styles.openText} language={language}>
{t.forecast}
</AppText>

<Animated.View
style={[
styles.swipeIcon,
{ transform:[{translateX:swipeAnim}] }
]}
>
<Ionicons name="arrow-forward-outline" size={16} color="#ffffff"/>
</Animated.View>
</View>

<AppText style={styles.temp} language={language}>
{temp ?? "--"}°C
</AppText>

</View>
</View>
</TouchableOpacity>
</View>

)

}

return(


<View
style={{
width: width - 40,
alignSelf:"center"
}}
>

<TouchableOpacity
style={[styles.headerGlassCard,{flexDirection:"column"}]}
onPress={()=>router.push("/farmer/market")}
activeOpacity={0.9}
>

<View style={styles.marketHeaderRow}>

<View style={styles.marketTitleRow}>
<Ionicons name="analytics-outline" size={16} color="white" />

<AppText style={styles.marketTitle} language={language}>
{language==="te" ? "పంట ధరలు" : "Crop Prices"}
</AppText>
</View>

<View style={styles.marketSeeMore}>

<AppText style={styles.openText} language={language}>
{language==="te" ? "ఇంకా చూడండి" : "See More"}
</AppText>

<Animated.View
style={[
styles.swipeIcon,
{ transform:[{translateX:swipeAnim}] }
]}
>
<Ionicons name="arrow-forward-outline" size={16} color="#ffffff"/>
</Animated.View>

</View>

</View>
<View style={{height:80,overflow:"hidden",marginTop:4}}>

<Animated.View
style={{
transform:[{translateY:priceScroll}]
}}
>

{priceLoading ? (

<View style={styles.priceLoadingBox}>

<Animated.View>
<Ionicons name="sync-outline" size={18} color="white"/>
</Animated.View>
<AppText style={styles.priceLoadingText} language={language}>
{language==="te" ? "ధరలు పొందుతున్నాం..." : "Fetching Prices..."}
</AppText>

</View>

) : (
  <>

   {/* 🔥 ADD THIS */}
    {prices.length === 0 && !priceLoading && (
      <AppText style={{ color: "white", textAlign: "center" }}>
        {language === "te" ? "డేటా లేదు" : "No data available"}
      </AppText>
    )}

{prices.map((item:any,index:number)=>{

const trend = getTrend(item.modal_price, item.prevPrice);


return(

<View key={index} style={styles.marketRow}>

<View style={styles.marketLeft}>

<AppText style={styles.crop} language={language}>
{item.commodity.replace(/\(.*?\)/g,"")}
</AppText>

<AppText style={styles.marketName} language={language }>
{item.market} | {item.arrival_date.slice(0,5)}
</AppText>

</View>

<View style={styles.marketRight}>

<AppText style={styles.price} language={language}>
₹{item.modal_price}
</AppText>

{trend==="up" && (
<Ionicons name="arrow-up" size={16} color="#22c55e"/>
)}

{trend==="down" && (
<Ionicons name="arrow-down" size={16} color="#ef4444"/>
)}

</View>

</View>

)

})}
</>
)}
</Animated.View>

</View>

</TouchableOpacity>
</View>

)
}}
/>
</View>
{/* DOT INDICATORS */}

<View style={styles.headerDots}>

<View style={[
styles.headerDot,
activeHeaderCard===0 && styles.headerDotActive
]}/>

<View style={[
styles.headerDot,
activeHeaderCard===1 && styles.headerDotActive
]}/>

</View>

      </LinearGradient>

<Svg
  width={width + 40}   // 🔥 add extra width
  height={40}
  viewBox={`0 0 ${width + 40} 40`}
  style={[styles.headerSvg, { marginLeft: -20 }]}  // 🔥 center adjust
>
<Path
  d={`M0 0 H${width + 40} V20 Q${(width + 40)/2} 60 0 20 Z`}
  fill="#1B5E20"
/>
</Svg>

</View>
</Animated.View>


{/* 🔥 ACTIVE SESSION CARD */}
<TouchableOpacity 
  style={styles.sessionMainContainer}
  onPress={() => setSessionModal(true)}
  activeOpacity={0.9}
>

  {/* LEFT CONTENT */}
  <View style={styles.sessionContent}>

    <View style={styles.sessionIcon}>
      <Ionicons name="calendar-outline" size={20} color="#16A34A" />
    </View>

    <View>
      <AppText style={styles.sessionLabel}>
        {language === "te" 
          ? "ప్రస్తుత సాగు సంవత్సరం" 
          : "Active Season"}
      </AppText>

      <AppText style={styles.sessionValue}>
        {activeSession || "Set Season"}
      </AppText>
    </View>

  </View>

  {/* RIGHT SIDE POWER BUTTON */}
 <TouchableOpacity 
  style={styles.powerButton}
  onPress={() => setSessionModal(true)}
>
    <LinearGradient
      colors={["#ff4d4d", "#b30000"]}
      style={styles.powerGradient}
    >
      <Ionicons name="power" size={20} color="#fff" />
    </LinearGradient>
  </TouchableOpacity>
{/* 🔥 SECRET ADMIN BUTTON (కేవలం నీకు మాత్రమే కనిపిస్తుంది) */}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.notifyBtn, { marginRight: 10, backgroundColor: "rgba(234, 179, 8, 0.2)" }]}
              activeOpacity={0.8}
              onPress={() => router.push("/farmer/admin-scheme" as any)}
            >
              <Ionicons name="shield-checkmark" size={22} color="#FBBF24" />
            </TouchableOpacity>
          )}
</TouchableOpacity>



        {/* QUICK SERVICES */}

       <View style={styles.sectionHeader}>

<Text
style={[
styles.sectionTitle,
{ fontFamily: "Mandali" }
]}
>
{t.quick}
</Text>
<TouchableOpacity
style={styles.swipeContainer}
onPress={()=>{

quickRef.current?.scrollToIndex({
index: scrollForward ? 3 : 0,
animated: true
});

setScrollForward(!scrollForward);

}}
>

<Text
style={[
styles.swipeText,
{ fontFamily: "Mandali" }
]}
>
{language === "te" ? "స్వైప్" : "Swipe"}
</Text>

<Animated.View
style={[
styles.swipeIcon,
{ transform:[{translateX:swipeAnim}] }
]}
>
<Ionicons
name={scrollForward ? "chevron-forward-outline" : "chevron-back-outline"}
size={16}
color="#9CA3AF"
/>
</Animated.View>

</TouchableOpacity>

</View>
<FlatList
ref={quickRef}
data={quickServices}
horizontal
showsHorizontalScrollIndicator={false}
keyExtractor={(item: any)=>item.service}
contentContainerStyle={{
paddingLeft:20,
paddingRight:10,
paddingTop:12
}}
snapToAlignment="start"
decelerationRate="fast"
snapToInterval={(width - 60) / 3 + 10}
renderItem={({item,index}: any)=>(

<TouchableOpacity
style={styles.smartChip}
onPress={()=>handleServiceClick(item.screen,item.service,index)}
activeOpacity={0.85}
>

<View style={styles.smartIconCircle}>
<Image source={item.icon} style={styles.smartChipIcon}/>
</View>
<AppText style={styles.smartChipText} language={language}>
{item.title}
</AppText>

</TouchableOpacity>
)}
/>
        {/* ALL SERVICES */}

        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle} language={language}>
            {t.all}
          </AppText>
          <View style={styles.sectionDivider} />
        </View>



      <View style={styles.grid}>
  {getServices().map((item, index) => (

   <TouchableOpacity
key={item.service}
style={styles.gridCard}
onPress={() => handleServiceClick(item.screen,item.service,index)}
activeOpacity={0.75}
>

<View style={styles.iconWrapper}>
<Image source={item.icon} style={styles.cardIcon} />
</View>

<AppText style={styles.cardText} language={language}>
{item.title}
</AppText>

</TouchableOpacity>

  ))}
</View>


<Modal visible={sessionModal} transparent animationType="slide">
  <View style={{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"flex-end"
  }}>

    <View style={{
      backgroundColor:"#fff",
      padding:20,
      borderTopLeftRadius:20,
      borderTopRightRadius:20
    }}>
<View style={styles.modalHeader}>
  <AppText style={styles.sectionTitle}>
    {language === "te" ? "సంవత్సరం ఎంచుకోండి" : "Select Season"}
  </AppText>

  <TouchableOpacity
    style={styles.closeBtn}
    onPress={() => setSessionModal(false)}
  >
    <Ionicons name="close" size={16} color="#1F2937" />
  </TouchableOpacity>
</View>

      {sessions.map((s)=>(
        <TouchableOpacity
          key={s}
          style={{
            padding:14,
            borderRadius:12,
            backgroundColor: activeSession === s ? "#DCFCE7" : "#F3F4F6",
            marginBottom:10
          }}
          onPress={async ()=>{
            const phone = await AsyncStorage.getItem("USER_PHONE");

            await firestore()
              .collection("users")
              .doc(phone!)
              .update({ activeSession: s });

            setActiveSession(s);
            setSessionModal(false);
          }}
        >
          <AppText style={{fontSize:16,fontWeight:"600"}}>
            {s}
          </AppText>
        </TouchableOpacity>
      ))}
{/* 🔥 VIEW OLD DATA BUTTON */}
{oldSessions.length > 0 && (
  <TouchableOpacity
    style={{
      padding:14,
      borderRadius:12,
      backgroundColor:"#E0F2FE",
      marginTop:10
    }}
    onPress={() => {
      setSessionModal(false);
      setOldSessionModal(true);
    }}
  >
    <AppText style={{textAlign:"center",fontWeight:"600"}}>
      {language === "te" ? "పాత డేటా చూడండి" : "View Old Data"}
    </AppText>
  </TouchableOpacity>
)}

    </View>
  </View>
</Modal>

<Modal visible={oldSessionModal} transparent animationType="slide">
  <View style={{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"flex-end"
  }}>
    <View style={{
      backgroundColor:"#fff",
      padding:20,
      borderTopLeftRadius:20,
      borderTopRightRadius:20
    }}>
<View style={styles.modalHeader}>
  <AppText style={styles.sectionTitle}>
    {language === "te" ? "పాత సీజన్లు" : "Old Sessions"}
  </AppText>

  <TouchableOpacity
    style={styles.closeBtn}
    onPress={() => setOldSessionModal(false)}
  >
    <Ionicons name="close" size={16} color="#1F2937" />
  </TouchableOpacity>
</View>

      {oldSessions.map((s)=>(
        <TouchableOpacity
          key={s}
          style={{
            padding:14,
            borderRadius:12,
            backgroundColor:"#F3F4F6",
            marginBottom:10
          }}
          onPress={async ()=>{
            const phone = await AsyncStorage.getItem("USER_PHONE");

            await firestore()
              .collection("users")
              .doc(phone!)
              .update({ activeSession: s });

            setActiveSession(s);
            setOldSessionModal(false);
          }}
        >
          <AppText style={{fontSize:16,fontWeight:"600"}}>
            {s}
          </AppText>
        </TouchableOpacity>
      ))}


    </View>
  </View>
</Modal>

      </Animated.ScrollView>



    </SafeAreaView>
  );
}



/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  safe:{ flex:1, backgroundColor:"#F6F7F6" },

header:{
paddingTop:40,
paddingBottom:5,
paddingHorizontal:20,
justifyContent:"center",
},
headerCarousel:{
alignItems:"center",
justifyContent:"center"
},

headerSvg:{
  marginTop:-1,
  alignSelf:"center"
},
stickyTop: {
  position: "absolute",
  top: 0,
  width: "100%",
  zIndex: 50,   // 🔥 increase
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingBottom: 10,
},
headerRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:10   // 🔥 reduce
},

  profileRow:{
    flexDirection:"row",
    alignItems:"center"
  },

  profileImage:{
    width:50,
    height:50,
    borderRadius:25,
    marginRight:10
  },

avatar:{
  width:70,
  height:70,
  borderRadius:35,
  backgroundColor:"#16A34A",
  justifyContent:"center",
  alignItems:"center",
  elevation:5
},

avatarText:{
  color:"#fff",
  fontSize:26,
  fontWeight:"bold"
},


name:{
  color:"white",
  fontSize:22,

  includeFontPadding:false,
  textAlignVertical:"center"
},
  notifyBtn:{
    backgroundColor:"rgba(255,255,255,0.2)",
    padding:10,
    borderRadius:12
  },
headerGlassCard:{
width:"100%",
height:120,   // 👈 FIXED HEIGHT
backgroundColor:"rgba(255,255,255,0.22)",
borderRadius:22,
paddingVertical:16,
paddingHorizontal:16,
flexDirection:"row",
justifyContent:"space-between",
borderWidth:1,
borderColor:"rgba(255,255,255,0.35)"
},
drawerItem:{
  flexDirection:"row",
  alignItems:"center",
  paddingVertical:14,
  borderBottomWidth:0.5,
  borderColor:"#E5E7EB",
  gap:12
},
drawerText:{
  fontSize:15,
  fontWeight:"600",
  color:"#1F2937"
},
openText:{
color:"white",
fontSize:12,
opacity:0.9
},
 weatherCard:{
marginTop:30,
backgroundColor:"rgba(255,255,255,0.22)",
borderRadius:22,
padding:18,
flexDirection:"row",
justifyContent:"space-between",
borderWidth:1,
borderColor:"rgba(255,255,255,0.35)"
},
  locationRow:{
    flexDirection:"row",
    alignItems:"center"
  },

  city:{
color:"white",
fontSize:16,
fontWeight:"600",
marginLeft:6,
marginBottom: 5,
lineHeight:22
},

  date:{
    color:"rgba(255,255,255,0.8)",
    fontSize:14,
    marginTop:5
  },
  greetRow:{
flexDirection:"row",
alignItems:"center",
gap:6
},
rightTopSection:{
position:"absolute",
right:8,
alignItems:"flex-end"
},

forecastRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:4
},
greet:{
color:"#C8E6C9",
fontSize:14,
fontWeight:"600"
},


weatherRow:{
flexDirection:"row",
alignItems:"center",
},
  weatherIcon:{ width:26, height:26, marginRight:6 },
weatherLeft:{
flex:1
},

weatherRight:{
justifyContent:"center",
alignItems:"center"
},

weatherText:{
color:"white",
fontSize:15,
marginRight:1,
flexShrink:1,
includeFontPadding:false
},

  temp:{
    color:"white",
    fontSize:55,
    fontWeight:"bold",
    marginRight: -6
  },


headerDots:{
flexDirection:"row",
justifyContent:"center",
marginTop:8
},
badge: {
  position: "absolute",
  top: -6,
  right: -6,
  width: 18,              // 🔥 fixed width
  height: 18,
  borderRadius: 9,
  backgroundColor: "#EF4444",
  justifyContent: "center",  // 🔥 vertical center
  alignItems: "center"       // 🔥 horizontal center
},

badgeText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "700",
  textAlign: "center",
  includeFontPadding: false, // 🔥 Android fix
  textAlignVertical: "center" // 🔥 perfect center
},
headerDot:{
width:8,
height:8,
borderRadius:4,
backgroundColor:"rgba(255,255,255,0.4)",
marginHorizontal:4
},

headerDotActive:{
backgroundColor:"white"
},


marketRow:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
paddingVertical:8,
borderBottomWidth:0.5,
borderBottomColor:"rgba(255,255,255,0.15)"
},
marketLeft:{
flex:1
},
marketHeaderRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:8,
marginTop: -5
},

marketTitleRow:{
flexDirection:"row",
alignItems:"center",
gap:6
},
priceLoadingBox:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
gap:6,
marginTop:10
},

priceLoadingText:{
color:"white",
fontSize:13,
opacity:0.9
},
marketTitle:{
color:"white",
fontSize:16,
fontWeight:"600"
},

marketSeeMore:{
flexDirection:"row",
alignItems:"center",
gap:4
},
marketRight:{
flexDirection:"row",
alignItems:"center",
justifyContent:"flex-end",
minWidth:80
},

crop:{
color:"white",
fontSize:15,
fontWeight:"700"
},

marketName:{
color:"rgba(255,255,255,0.75)",
fontSize:11,
marginTop:2
},

price:{
color:"white",
fontSize:16,
fontWeight:"bold",
marginRight:6
},
modalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15,
},

closeBtn: {
  width: 32,
  height: 32,
  borderRadius: 10,

  backgroundColor: "#E5E7EB",
  justifyContent: "center",
  alignItems: "center",
},
sessionMainContainer: {
  marginHorizontal: 20,
  marginTop: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: 14,
  borderRadius: 20,

  backgroundColor: '#ffffff',

  borderWidth: 1,
  borderColor: '#dfe1e3',

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
},

sessionContent: {
  flexDirection: 'row',
  alignItems: 'center',
},

sessionIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: '#F8FAF9',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 10,
},

sessionLabel: {
  fontSize: 12,
  color: '#6B7280',
},

sessionValue: {
  fontSize: 20,
  fontWeight: '600',
  color: '#1F2937',
},

powerButton: {
  width: 44,
  height: 44,
  borderRadius: 14,
  overflow: "hidden",
},

powerGradient: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},

  sectionHeader:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginHorizontal:20,
    marginTop:25,
    marginBottom: 8
  },

sessionBox: {
  marginHorizontal: 20,
  marginTop: 10,
  marginBottom: 10,
  backgroundColor: "#ffffff",
  padding: 14,
  borderRadius: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E5E7EB"
},



  sectionTitle:{
    fontSize:20,
    color:"#1F2937"
  },

  sectionDivider:{
    flex:1,
    height:1,
    backgroundColor:"#E5E7EB",
    marginLeft:10
  },

  swipeContainer:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#F3F4F6",
paddingHorizontal:10,
paddingVertical:4,
borderRadius:14
},

swipeText:{
fontSize:12,
color:"#6B7280",
fontWeight:"500",
marginHorizontal:4
},

swipeIcon:{
justifyContent:"center",
alignItems:"center"
},

quickScroll:{
paddingLeft:20,
paddingRight:10,
paddingTop:15
},
grid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"flex-start",
paddingHorizontal:20,
paddingBottom: 60,
marginBottom: 60,
gap:14
},
gridCard:{
width:(width - 70) / 3,

 backgroundColor:"#F8FAF9",
borderColor:"#E5E7EB",
borderRadius:18,

paddingVertical:16,

alignItems:"center",
justifyContent:"center",


borderWidth:1,

},
smartCard:{
flexDirection:"row",
alignItems:"center",

paddingVertical:12,
paddingHorizontal:16,
borderTopColor:"rgba(255,255,255,0.6)",
borderRadius:20,
marginRight:12,
marginBottom:10,

borderWidth:1,
borderColor:"rgba(255,255,255,0.35)",

shadowColor:"#000",
shadowOpacity:0.12,
shadowRadius:10,
elevation:5
},
smartChip:{
flexDirection:"row",
alignItems:"center",

backgroundColor:"#F8F9FA",

paddingVertical:9,
paddingHorizontal:14,

borderRadius:20,
minHeight: 36,
marginRight:12,
marginBottom:8,

borderWidth:1,
borderColor:"#E5E7EB"
},

smartChipIcon:{
width:16,
height:16,
tintColor:"#2E7D32",
resizeMode:"contain"
},

smartChipText:{
fontSize:13,
fontWeight:"600",
color:"#1F2937",
letterSpacing:0.2
},
smartIconCircle:{
width:26,
height:26,

borderRadius:13,

backgroundColor:"#E8F5E9",

justifyContent:"center",
alignItems:"center",

marginRight:8
},
iconWrapper:{
backgroundColor:"#E8F5E9",
padding:12,
borderRadius:16,
marginBottom:8,
justifyContent:"center",
alignItems:"center"
},

cardIcon:{
width:22,
height:22,
tintColor:"#2E7D32",
resizeMode:"contain"
},

cardText:{
fontSize:15,
fontWeight:"600",
color:"#1F2937",
textAlign:"center"
},
modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '500', color: '#e2431f', marginVertical: 10 },
   modalTitle1: { fontSize: 20, fontWeight: '500', color: '#187012', marginVertical: 10 },
  modalSub: { textAlign: 'center', color: '#64748B', marginBottom: 25, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '500' },
  confirmText: { color: 'white', fontWeight: '500' },
  iconBg: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#f5e8e8",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10
},
});