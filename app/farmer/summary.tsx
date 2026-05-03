import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { InteractionManager } from "react-native";
// 1. Asset ఎర్రర్ కోసం ఇది:
import { Asset } from 'expo-asset';

// 2. FileSystem ఎర్రర్స్ కోసం ఇది (ముఖ్యంగా * as వాడాలి):
// పాత ఇంపోర్ట్ తీసేసి ఇది పెట్టు బ్రో
import * as FileSystem from 'expo-file-system/legacy';

// ఒకవేళ Print మరియు Sharing కూడా వాడుతుంటే ఇవి కూడా ఉండాలి:
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated, Easing, FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ---------------- 🔥 SEPARATE ANIMATED CIRCLE COMPONENT ---------------- */
const CropProgressCircle = memo(({ percent, displayText, color }: { percent: number; displayText: string; color: string }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
     const radius = 30;
const size = 80;
const center = size / 2;

  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percent,
      duration: 900,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [percent]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.circleWrap}>
<Svg width={size} height={size}>
  <Circle
    cx={center}
    cy={center}
    r={radius}
    stroke="#E5E7EB"
    strokeWidth="6"
    fill="none"
  />
      <AnimatedCircle
  cx={center}
  cy={center}
  r={radius}
  stroke={color}
  strokeWidth="6"
  fill="none"
  strokeDasharray={circumference}
  strokeDashoffset={strokeDashoffset}
  strokeLinecap="round"
  rotation="-90"
  origin={`${center},${center}`}
/>
      </Svg>
      <View style={styles.circleCenter}>
        <AppText style={[styles.circleText, { color }]}>
          {displayText}%
        </AppText>
      </View>
    </View>
  );
});

export default function SummaryScreen() {
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<any>({});
  // summary స్టేట్ లో rent కూడా యాడ్ చెయ్
const [summary, setSummary] = useState({ expense: 0, labour: 0, income: 0, profit: 0, rent: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
const [userName, setUserName] = useState("Farmer");
const [typedName, setTypedName] = useState("");
const [showDots, setShowDots] = useState(false);
  // Top Progress Bar Animations
  const expenseAnim = useRef(new Animated.Value(0)).current;
  const labourAnim = useRef(new Animated.Value(0)).current;
  const incomeAnim = useRef(new Animated.Value(0)).current;
const rentAnim = useRef(new Animated.Value(0)).current;
const [aiState, setAIState] = useState<"idle" | "loading" | "result">("idle");
const total = summary.expense + summary.labour + summary.rent + summary.income;
  const expensePercent = total ? (summary.expense / total) * 100 : 0;
const labourPercent = total ? (summary.labour / total) * 100 : 0;
const rentPercent = total ? (summary.rent / total) * 100 : 0;
const incomePercent = total ? (summary.income / total) * 100 : 0;
const pulseAnim = useRef(new Animated.Value(0)).current;
const floatAnim = useRef(new Animated.Value(0)).current;
const [barWidth, setBarWidth] = useState(0);
const dotAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  const anim = Animated.loop(
    Animated.timing(dotAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    })
  );

  anim.start();

  return () => anim.stop(); // 🔥 MUST
}, []);

useEffect(() => {
  setAIState("idle");
}, []);

const dotsOpacity = dotAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0.3, 1],
});

useEffect(() => {
  if (!userName) return; // 🔥 important

  let index = 0;
  setTypedName("");

  const interval = setInterval(() => {
    if (index < userName.length) {
      const char = userName.charAt(index); // ✅ safe

      setTypedName((prev) => prev + char);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 80);

  return () => clearInterval(interval);
}, [userName]);

useEffect(() => {
  const anim = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );

  anim.start();

  return () => anim.stop();
}, []);
  // 🔥 Floating (up-down)
 useEffect(() => {
  const anim = Animated.loop(
    Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: -10,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ])
  );

  anim.start();

  return () => anim.stop();
}, []);


const handleAIClick = () => {
  if (aiState !== "idle") return; // 🔥 prevent spam

  setAIState("loading");

  setTimeout(() => {
    setAIState("result");
  }, 4000);
};

const AnimatedAIItem = ({ text, index }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 500, // 🔥 one by one
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <View style={styles.aiCard}>
        <View style={styles.aiBullet} />
        <AppText style={styles.aiText}>{text}</AppText>
      </View>
    </Animated.View>
  );
};

const ShimmerBars = () => (
  <View style={styles.stickyBox}>
    {[1, 2, 3].map((_, i) => (
      <View key={i} style={{ marginBottom: 14 }}>
        <ShimmerPlaceholder
          style={{ height: 12, width: "40%", borderRadius: 6 }}
        />
        <ShimmerPlaceholder
          style={{ height: 8, width: "100%", marginTop: 6, borderRadius: 10 }}
        />
      </View>
    ))}
  </View>
);

// ఫంక్షన్‌కి insights ని పరామీటర్‌గా పంపాలి
const exportProfessionalPDF = async (existingInsights: string[]) => {
 
  try {
    const logoAsset = Asset.fromModule(require('../../assets/images/logo.jpeg'));
    await logoAsset.downloadAsync();
    const logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri!, {
      encoding: 'base64',
    });

    const today = new Date().toLocaleDateString('te-IN');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; flex-direction: row; justify-content: space-between; align-items: center; border-bottom: 4px solid #1b5e20; padding-bottom: 15px; }
            .logo-img { width: 80px; height: 80px; border-radius: 10px; }
            .brand-name { font-size: 32px; font-weight: 800; color: #1b5e20; margin: 0; }
            
            /* AI Insights Section */
            .ai-section { background-color: #f0fdf4; border: 1px dashed #16a34a; padding: 20px; border-radius: 12px; margin: 25px 0; }
            .ai-title { color: #166534; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
            .ai-tip { font-size: 13px; color: #1e293b; margin-bottom: 8px; padding-left: 15px; position: relative; }
            .ai-tip::before { content: "✨"; position: absolute; left: 0; font-size: 10px; top: 2px; }

            .dashboard { display: flex; flex-direction: row; justify-content: space-between; margin: 25px 0; gap: 15px; }
            .card { flex: 1; padding: 15px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; text-align: center; }
            .card-label { font-size: 11px; color: #64748b; font-weight: bold; }
            .card-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden; }
            th { background-color: #1b5e20; color: white; padding: 12px; text-align: left; font-size: 13px; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            .profit { color: #16a34a; font-weight: bold; }
            .loss { color: #dc2626; font-weight: bold; }
            
            .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="data:image/png;base64,${logoBase64}" class="logo-img" />
            <div style="text-align: right;">
              <h1 class="brand-name">AgriLog</h1>
              <p style="font-size: 12px; color: #64748b; margin:0;">వ్యవసాయ నివేదిక | ${today}</p>
            </div>
          </div>

          <div class="ai-section">
            <div class="ai-title">AgriLog AI విశ్లేషణ (AI Insights)</div>
            ${existingInsights && existingInsights.length > 0 
              ? existingInsights.map(insight => `<div class="ai-tip">${insight}</div>`).join('')
              : '<div class="ai-tip">ప్రస్తుతానికి ఎటువంటి విశ్లేషణలు లేవు.</div>'
            }
          </div>

          <div class="dashboard">
            <div class="card"><div class="card-label">మొత్తం ఆదాయం</div><div class="card-value" style="color: #16a34a;">₹${summary.income.toLocaleString('en-IN')}</div></div>
            <div class="card"><div class="card-label">మొత్తం ఖర్చులు</div><div class="card-value">₹${(summary.expense + summary.labour + summary.rent).toLocaleString('en-IN')}</div></div>
            <div class="card"><div class="card-label">నికర ఫలితం</div><div class="card-value ${summary.profit >= 0 ? 'profit' : 'loss'}">₹${Math.abs(summary.profit).toLocaleString('en-IN')}</div></div>
          </div>

          <h2 style="font-size: 16px; color: #1e293b;">పంటల వివరాలు</h2>
          <table>
            <thead>
              <tr><th>పంట పేరు</th><th>దిగుబడి</th><th>పెట్టుబడి</th><th>ఆదాయం</th><th>ఫలితం</th></tr>
            </thead>
            <tbody>
              ${Object.keys(crops).map(key => {
                const c = crops[key];
                return `
                  <tr>
                    <td><b>${key}</b></td>
                    <td>${c.quantity} ${getUnitLabel(c.unit)}</td>
                    <td>₹${(c.expense + c.labour + c.rent).toLocaleString('en-IN')}</td>
                    <td>₹${c.income.toLocaleString('en-IN')}</td>
                    <td class="${c.profit >= 0 ? 'profit' : 'loss'}">₹${Math.abs(c.profit).toLocaleString('en-IN')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div style="font-weight: bold; color: #1b5e20;">AgriLog - సాగు లెక్కల డిజిటల్ పుస్తకం</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 5px;">© 2026 AgriLog Management Solutions.</div>
          </div>
        </body>
      </html>
    `;

    setTimeout(async () => {
  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  await Sharing.shareAsync(uri);
}, 100);

  } catch (error) {
    console.error("PDF Error:", error);
  }
};

const EmptyState = ({ language }: { language: "te" | "en" }) => {

  return (
    <View style={styles.emptyWrap}>

      {/* ICON */}
      <View style={styles.emptyIconWrap}>
        <Ionicons name="analytics-outline" size={42} color="#16A34A" />
      </View>

      {/* TITLE */}
      <AppText style={styles.emptyTitle}>
        {language === "te"
          ? "ఇంకా విశ్లేషణ లేదు"
          : "No Summary Yet"}
      </AppText>

      {/* SUB */}
      <AppText style={styles.emptySub}>
        {language === "te"
          ? "ఖర్చులు మరియు అమ్మకాలు నమోదు చేస్తే ఇక్కడ పూర్తి నివేదిక కనిపిస్తుంది"
          : "Add expenses and sales to view complete farm insights"}
      </AppText>

    </View>
  );
};
const round = (num: number) => Math.round(num);
const e = round(expensePercent);
const l = round(labourPercent);
const r = round(rentPercent);
const i = round(incomePercent);

// 🔥 final adjust (ensure 100%)
const diff = 100 - (e + l + r + i);

const finalIncomePercent = i + diff;
const totalExpenses = summary.expense + summary.labour + summary.rent;
const isEmpty = Object.keys(crops).length === 0;
const ShimmerCard = () => (
  <View style={styles.card}>
    
    <View style={{ width: 4, height: 60, backgroundColor: "#E5E7EB", borderRadius: 2 }} />

    <View style={{ flex: 1, marginLeft: 10 }}>
      
      <ShimmerPlaceholder style={{ height: 18, width: "40%", borderRadius: 6 }} />
      

      
      <ShimmerPlaceholder style={{ height: 12, width: "60%", marginTop: 8 }} />
      <ShimmerPlaceholder style={{ height: 12, width: "50%", marginTop: 6 }} />
      <ShimmerPlaceholder style={{ height: 12, width: "55%", marginTop: 6 }} />

      <ShimmerPlaceholder style={{ height: 14, width: "45%", marginTop: 10 }} />

    </View>

    <ShimmerPlaceholder
      style={{ width: 50, height: 50, borderRadius: 25 }}
    />

  </View>
);
const ShimmerTopCard = () => (
  <View style={[styles.topCard, { backgroundColor: "#E5E7EB" }]}>
    
    <ShimmerPlaceholder style={{ height: 12, width: "30%" }} />
    <ShimmerPlaceholder style={{ height: 30, width: "50%", marginTop: 10 }} />

    <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
      <ShimmerPlaceholder style={{ flex: 1, height: 60, borderRadius: 12 }} />
      <ShimmerPlaceholder style={{ flex: 1, height: 60, borderRadius: 12 }} />
    </View>

  </View>
);
useEffect(() => {
  if (!loading) {

    // 🔥 reset values (VERY IMPORTANT)
    expenseAnim.setValue(0);
    labourAnim.setValue(0);
    rentAnim.setValue(0);
    incomeAnim.setValue(0);

    InteractionManager.runAfterInteractions(() => {

      Animated.parallel([
        Animated.timing(expenseAnim, {
          toValue: e,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(labourAnim, {
          toValue: l,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(rentAnim, {
          toValue: r,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(incomeAnim, {
          toValue: finalIncomePercent,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

      ]).start();

    });
  }
}, [loading]);

 // 🔥 THE ULTIMATE AGRI-INTELLIGENCE ENGINE (PRO VERSION)
  const generateSmartInsights = (cropMap: any, totalInc: number) => {
    const insights: string[] = [];
    const cropEntries = Object.entries(cropMap);
    
    if (cropEntries.length === 0) {
      insights.push(language === "te" ? "👋 మీ వ్యవసాయ వివరాలను నమోదు చేయండి. మీ డేటా ఆధారంగా నేను లోతైన విశ్లేషణ అందిస్తాను." : "👋 Please enter your farm details. I will provide a deep analysis based on your data.");
      setSuggestions(insights);
      return;
    }

    // --- 📊 CALCULATE GLOBAL TOTALS ---
    const globalTotalExp = summary.expense + summary.labour + summary.rent;
    const globalProfit = summary.profit;
    const globalROI = globalTotalExp > 0 ? (globalProfit / globalTotalExp) * 100 : 0;

    // --- 🚜 1. CROP-WISE CRITICAL ANALYSIS ---
    cropEntries.forEach(([name, data]: any) => {
      const d = data;
      const totalCropCost = d.expense + d.labour + d.rent;
      const profitMargin = d.income > 0 ? (d.profit / d.income) * 100 : 0;
      const labourRatio = totalCropCost > 0 ? (d.labour / totalCropCost) * 100 : 0;
      const totalCost = d.expense + d.labour + d.rent;
      
      // 🔴 RENT (KOWLU) DEEP DIVE
     // ఒకవేళ ఎకరాలు ఉండి, మిగతావి సున్నా ఉంటే ఇది పట్టుకుంటుంది
      if (d.acres > 0) {
        if (totalCost === 0 && d.income === 0) {
          insights.push(language === "te" 
            ? `⚠️ ${name}: పొలం వివరాలు ఉన్నాయి కానీ ఖర్చులు లేదా అమ్మకాలు ఏవీ నమోదు చేయలేదు. ఖర్చుల వివరాలు రాయండి.` 
            : `⚠️ ${name}: Land details added but no expenses or sales recorded. Please start logging costs.`);
        }
        
        if (d.quantity === 0 && d.income === 0 && totalCost > 0) {
          insights.push(language === "te" 
            ? `📦 ${name}: పెట్టుబడి పెడుతున్నారు కానీ దిగుబడి (Quantity) అంచనా లేదా అమ్మకాలు రాయలేదు.` 
            : `📦 ${name}: You are spending money but haven't recorded yield or sales yet.`);
        }
      }

      // 🛑 ఎక్స్క్లూజివ్ జీరో చెక్ (Zero Value Audit)
      if (d.acres > 0 && d.expense === 0 && d.labour === 0) {
          insights.push(language === "te" 
            ? `❗ ${name}: ఎరువులు, విత్తనాలు లేదా కూలీల ఖర్చు "సున్నా" గా ఉంది. మర్చిపోకుండా అప్డేట్ చేయండి.` 
            : `❗ ${name}: Fertilizer, seeds, or labour costs are 0. Ensure all costs are updated.`);
      }

      // కౌలు ఉండి కూడా మిగతావి లేకపోతే
      if (d.rent > 0 && d.expense === 0) {
          insights.push(language === "te" 
            ? `🧐 ${name}: కేవలం కౌలు మాత్రమే రాశారు. సాగు ఖర్చులు (Expenses) కూడా ఉంటే నమోదు చేయండి.` 
            : `🧐 ${name}: Only rent recorded. Please enter cultivation expenses as well.`);
      }

      // 🟡 LABOUR & WORKFORCE EFFICIENCY
      if (labourRatio > 55) {
        insights.push(language === "te" 
          ? `👷 ${name}: కూలీల ఖర్చు విపరీతంగా ఉంది (${Math.round(labourRatio)}%). వీలైతే డ్రోన్ స్ప్రేయింగ్ లేదా యంత్రాలను వాడండి.` 
          : `👷 ${name}: Excessive labour cost (${Math.round(labourRatio)}%). Explore automation or machinery.`);
      }

      // 🔵 PROFIT & LOSS INTELLIGENCE
      if (d.profit < 0) {
        insights.push(language === "te" 
          ? `🛑 ${name} నష్టంలో ఉంది (-₹${Math.abs(d.profit)}). దీనికి ప్రధాన కారణం ${d.rent > d.expense ? 'అధిక కౌలు' : 'ఎక్కువ పెట్టుబడి'} కావచ్చు.` 
          : `🛑 ${name} is in loss (-₹${Math.abs(d.profit)}). Main reason might be ${d.rent > d.expense ? 'high rent' : 'high input costs'}.`);
      } else if (profitMargin < 15 && d.income > 0) {
        insights.push(language === "te" 
          ? `📉 ${name} లాభం చాలా తక్కువగా ఉంది. మార్కెట్ ధరలు పెరిగే వరకు స్టాక్ దాచుకోవడం మంచిది.` 
          : `📉 ${name} has thin margins. Consider holding stock if you expect price hikes.`);
      }

      // 🟢 YIELD & PRODUCTION INSIGHTS
      if (d.quantity > 0 && d.acres > 0) {
        const yieldPerAcre = d.quantity / d.acres;
        insights.push(language === "te" 
          ? `🌾 ${name}: ఎకరాకు సగటున ${yieldPerAcre.toFixed(1)} ${getUnitLabel(d.unit)} దిగుబడి వస్తోంది.` 
          : `🌾 ${name}: Your average yield is ${yieldPerAcre.toFixed(1)} ${d.unit} per acre.`);
      }

      // 🟠 MISSING DATA WARNINGS
      if (d.income > 0 && d.quantity === 0) {
        insights.push(language === "te" 
          ? `📦 ${name}: అమ్మకాలు రాశారు కానీ ఎంత పరిమాణం (Quantity) అమ్మారో రాయలేదు.` 
          : `📦 ${name}: Sales recorded but quantity sold is missing.`);
      }
      // --- 🚜 1. DATA ENTRY FOCUS & MISSING DETAILS (zero tolerance) ---
      // 🛑 MISSING ACRES (ఎకరాల వివరాలు)
      if (d.acres <= 0) {
        insights.push(language === "te" 
          ? `❗ ${name}: పొలం విస్తీర్ణం (Acres) సున్నా ఉంది. ఇది లేకుండా ఎకరా ఖర్చు లెక్కించడం అసాధ్యం!` 
          : `❗ ${name}: Acres is 0. Cannot calculate cost efficiency without land size!`);
      }

      // 🛑 MISSING INCOME BUT HAS QUANTITY (అమ్మకాల వివరాలు)
      if (d.quantity > 0 && d.income <= 0) {
        insights.push(language === "te" 
          ? `❗ ${name}: ${d.quantity} ${getUnitLabel(d.unit)} దిగుబడి ఉంది, కానీ అమ్మకం ధర రాయలేదు. లాభం లెక్కించలేను.` 
          : `❗ ${name}: Yield is ${d.quantity} ${d.unit}, but sales amount is missing. Profit cannot be calculated.`);
      }

      // 🛑 MISSING COSTS BUT HAS INCOME (ఖర్చుల వివరాలు)
      if (d.income > 0 && totalCost <= 0) {
        insights.push(language === "te" 
          ? `❗ ${name}: ఆదాయం వచ్చింది కానీ పెట్టుబడి సున్నా ఉంది. నిజమైన లాభం తెలియాలంటే ఖర్చులు రాయండి.` 
          : `❗ ${name}: Income recorded but expenses are 0. Add costs to see real profit.`);
      }

      // 🛑 RENT VS OWN LAND CHECK
      if (d.rent <= 0 && d.acres > 0) {
        insights.push(language === "te" 
          ? `🧐 ${name}: కౌలు ఖర్చు సున్నా ఉంది. ఇది మీ సొంత భూమి అయితే పర్వాలేదు, లేదంటే అప్‌డేట్ చేయండి.` 
          : `🧐 ${name}: Rent is 0. If this is leased land, please update the rent amount.`);
      }

      // 🛑 UNIT VALIDATION
      if (d.quantity > 0 && (!d.unit || d.unit === "")) {
        insights.push(language === "te" 
          ? `📦 ${name}: దిగుబడి రాశారు కానీ కొలమానం (Units: kg/quintal/tons) ఎంచుకోలేదు.` 
          : `📦 ${name}: Quantity added but Units (kg/bags/tons) are missing.`);
      }
    });

    // --- 🌍 2. FARM-WIDE STRATEGIC INSIGHTS ---

    // ROI Check
    if (globalROI > 50) {
      insights.push(language === "te" 
        ? "🔥 అద్భుతం బ్రో! మీ ఫామ్ 50% పైగా లాభంతో నడుస్తోంది. మీరు టాప్ 1% రైతుల్లో ఒకరు!" 
        : "🔥 Amazing! Your farm is yielding over 50% ROI. You are in the top 1% of farmers!");
    } else if (globalROI < 0) {
      insights.push(language === "te" 
        ? "🆘 మీ మొత్తం ఫామ్ నష్టాల్లో ఉంది. వెంటనే ఇతర ఖర్చులను తగ్గించుకుని ఆదాయ మార్గాలను చూడాలి." 
        : "🆘 Overall farm is in loss. Focus on cost reduction and alternative revenue streams.");
    }

    // Diversification Logic
    if (cropEntries.length >= 3) {
      insights.push(language === "te" 
        ? "✅ మీరు వివిధ రకాల పంటలు వేసి రిస్క్ తగ్గించుకున్నారు. ఇది మంచి పద్ధతి." 
        : "✅ Good diversification! Growing multiple crops helps balance market risks.");
    } else {
      insights.push(language === "te" 
        ? "💡 అంతర పంటలు (Intercropping) వేయడం ద్వారా తక్కువ స్థలంలో ఎక్కువ ఆదాయం పొందవచ్చు." 
        : "💡 Try intercropping to maximize revenue from the same land area.");
    }

    // Expense Skewness
    if (summary.rent > summary.income && summary.income > 0) {
      insights.push(language === "te" 
        ? "⚠️ హెచ్చరిక: మీ ఆదాయం కంటే కౌలు ఖర్చు ఎక్కువగా ఉంది. ఇది ఫైనాన్షియల్ గా చాలా రిస్క్." 
        : "⚠️ Warning: Your rent cost is higher than your income. This is financially unsustainable.");
    }

    // Milestone Achievement
    if (totalInc > 1000000) {
      insights.push(language === "te" ? "💰 మైలురాయి! మీ టర్నోవర్ 10 లక్షలు దాటింది. కంగ్రాట్స్!" : "💰 Milestone! Your turnover crossed 10 Lakhs. Huge achievement!");
    }

    // General Expert Tips (Randomized)
    const expertTips = [
      language === "te" ? "💡 నేల పరీక్ష (Soil Test) చేయిస్తే ఎరువుల ఖర్చు 20% తగ్గుతుంది." : "💡 Soil testing can reduce fertilizer costs by up to 20%.",
      language === "te" ? "📊 ప్రతి రోజూ ఖర్చులను రాసే అలవాటు మిమ్మల్ని అప్పుల నుంచి కాపాడుతుంది." : "📊 Daily expense logging prevents unexpected debt traps.",
      language === "te" ? "⛅ వాతావరణాన్ని బట్టి నీటి యాజమాన్యం చేస్తే కరెంటు మరియు నీరు ఆదా అవుతాయి." : "⛅ Weather-based irrigation saves both water and power costs."
    ];
    insights.push(expertTips[Math.floor(Math.random() * expertTips.length)]);

    // --- 🚀 FINAL PROCESSING ---
    // Duplicate removal and showing top 10 most critical ones
    const uniqueInsights = [...new Set(insights)];
    setSuggestions(uniqueInsights.slice(0, 10)); // Show only top 10 insights
  };
useEffect(() => {
  const loadData = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    const lang = await AsyncStorage.getItem("APP_LANG");
    if (lang) setLanguage(lang as any);
    if (!phone) return;
const userDoc = await firestore()
  .collection("users")
  .doc(phone)
  .get();

const activeSession = userDoc.data()?.activeSession;

if (!activeSession) return;
    setLoading(true);
    try {
      const [expSnap, salesSnap, paySnap, fieldsSnap] = await Promise.all([
        firestore()
  .collection("users")
  .doc(phone)
  .collection("expenses")
  .where("session", "==", activeSession)
        .get(),
              firestore()
  .collection("users")
  .doc(phone)
  .collection("sales")
  .where("session", "==", activeSession)
  .get(),
        firestore()
  .collection("users")
  .doc(phone)
  .collection("payments")
  .where("session", "==", activeSession)
  .get(),
        firestore()
  .collection("users")
  .doc(phone)
  .collection("fields")
  .where("session", "==", activeSession)
  .get()
      ]);
await new Promise(resolve => setTimeout(resolve, 0)); // 🔥 ADD HERE

      const cropMap: any = {};
      let totalExp = 0, totalLab = 0, totalInc = 0, totalRent = 0;

      // కన్వర్షన్ రేట్స్ (Gms, Kg, Quintal, Ton)
      const unitToKg: any = { gms: 0.001, kg: 1, quintal: 100, ton: 1000 };
const userDoc = await firestore().collection("users").doc(phone).get();
const name = userDoc.data()?.name || "Farmer";
setUserName(name);
      // 1. Expenses & Payments (పాత కోడ్ లాగే)
      expSnap.forEach(doc => {
        const d = doc.data();
        const crop = d.crop || "Others";
        const amt =
  typeof d.amount === "number"
    ? d.amount
    : Number(d.amount) || 0;
        totalExp += amt;
        if (!cropMap[crop]) cropMap[crop] = { expense: 0, labour: 0, income: 0, totalKg: 0, unitStats: {}, acres: 0, rent: 0 };
        cropMap[crop].expense += amt;
      });

      paySnap.forEach(doc => {
        const d = doc.data();
        const crop = d.crop || "Others";
        const amt = Number(d.totalAmount) || 0;
        totalLab += amt;
        if (!cropMap[crop]) cropMap[crop] = { expense: 0, labour: 0, income: 0, totalKg: 0, unitStats: {}, acres: 0, rent: 0 };
        cropMap[crop].labour += amt;
      });

      // 2. Sales Logic with Unit Conversion
      salesSnap.forEach(doc => {
        const d = doc.data();
        const crop = d.crop || "Others";
        const amt = Number(d.total) || 0;
        const qty = Number(d.quantity) || 0;
        const unitMap: any = {
  ton: "ton",
  tons: "ton",
  kg: "kg",
  quintal: "quintal",
  gms: "gms"
};

const unit =
  unitMap[(d.unit || "kg").toLowerCase()] || "kg";
        totalInc += amt;
        if (!cropMap[crop]) cropMap[crop] = { expense: 0, labour: 0, income: 0, totalKg: 0, unitStats: {}, acres: 0, rent: 0 };

        cropMap[crop].income += amt;
        
        // అన్నింటినీ KG లోకి మార్చడం
        const weightInKg = qty * (unitToKg[unit] || 1);
        cropMap[crop].totalKg = (cropMap[crop].totalKg || 0) + weightInKg;

        // ఏ యూనిట్ ఎక్కువ వాడారో లెక్కించడం
        cropMap[crop].unitStats[unit] = (cropMap[crop].unitStats[unit] || 0) + 1;
      });

      // 3. Field & Rent Logic
      fieldsSnap.forEach(doc => {
        const d = doc.data();
        const crop = d.crop || "Others";
        const rent = Number(d.rent) || 0;
        const acres = Number(d.acres) || 0;

        if (!cropMap[crop]) cropMap[crop] = { expense: 0, labour: 0, income: 0, totalKg: 0, unitStats: {}, acres: 0, rent: 0 };
        cropMap[crop].acres += acres;
        if (d.type === "rent") {
          totalRent += rent;
          cropMap[crop].rent += rent;
        }
      });

      // 4. Final Processing: Majority Unit కి కన్వర్ట్ చేయడం
      Object.keys(cropMap).forEach(key => {
        const c = cropMap[key];
        
        let bestUnit = "kg";
        let maxCount = 0;
        if (c.unitStats) {
          Object.entries(c.unitStats).forEach(([u, count]: any) => {
            if (count > maxCount) {
              maxCount = count;
              bestUnit = u;
            }
          });
        }

        const factor = unitToKg[bestUnit] || 1;
c.quantity = factor
  ? (c.totalKg / factor).toFixed(2)
  : "0";
        c.unit = bestUnit; // ఫైనల్ యూనిట్
        c.profit = c.income - (c.expense + c.labour + c.rent);
      });

      setSummary({
        expense: totalExp,
        labour: totalLab,
        income: totalInc,
        rent: totalRent,
        profit: totalInc - (totalExp + totalLab + totalRent)
      });
      setCrops(cropMap);
     setTimeout(() => {
  generateSmartInsights(cropMap, totalInc);
}, 300);
    } catch (e) {
  console.log(e);

  setSuggestions([
    language === "te"
      ? "డేటా లోడ్ చేయడంలో సమస్య వచ్చింది"
      : "Error loading data"
  ]);
}
    setLoading(false);
  };
  loadData();
}, [language]);
  const isProfit = summary.profit >= 0;

  const getUnitLabel = (unit: string) => {
    if (language === "te") {
      switch (unit) {
        case "kg": return "కిలోలు";
        case "tons": return "టన్నులు";
        case "quintal": return "క్వింటాళ్లు";
        case "bags": return "బ్యాగులు";
        default: return unit;
      }
    }
    return unit;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader 
  title={language === "te" ? "సారాంశం" : "Summary"} 
  subtitle={language === "te" ? "వ్యవసాయ నివేదిక" : "Farm Report"} 
  language={language} 
 onDownload={() => exportProfessionalPDF(suggestions)}
/>
{loading ? (
  <>
    <ShimmerCard />
    <ShimmerCard />
    <ShimmerCard />
  </>
) : isEmpty ? (

  // 🔥 ONLY EMPTY SCREEN
  <EmptyState language={language} />

) : (

  // ✅ FULL DATA UI
 <FlatList
  initialNumToRender={6}
  maxToRenderPerBatch={8}
  windowSize={5}
  removeClippedSubviews={true}
     data={Object.keys(crops)}
        keyExtractor={(item, index) => item + index}
      ListHeaderComponent={
  loading ? <ShimmerBars /> : (
    <View style={styles.stickyBox}>
      {[
        { label: language === "te" ? "ఇతర ఖర్చులు" : "Other Expenses", val: summary.expense, color: "#3B82F6", anim: expenseAnim },
        { label: language === "te" ? "కూలీ ఖర్చులు" : "Labour Expenses", val: summary.labour, color: "#F59E0B", anim: labourAnim },
        { label: language === "te" ? "కౌలు ఖర్చులు" : "Field Rent", val: summary.rent, color: "#8B5CF6", anim: rentAnim },
        { label: language === "te" ? "మొత్తం ఆదాయం" : "Total Income", val: summary.income, color: "#16A34A", anim: incomeAnim },
      ]
      .filter(item => item.val > 0) // 🔥 అమౌంట్ 0 కంటే ఎక్కువ ఉన్నవి మాత్రమే చూపిస్తుంది
      .map((item, idx) => {
        const targetAnim = item.anim;

        return (
          <View key={idx} style={styles.barItem}>
            <View style={styles.barTopRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                <AppText style={styles.barLabel}>{item.label}</AppText>
              </View>
              <AppText style={[styles.barValue, { color: item.color }]}>
                ₹{item.val.toLocaleString("en-IN")}
              </AppText>
            </View>
          <View 
  style={styles.barBg}
  onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
>
           <Animated.View 
  style={[
    styles.barFill,
    {
      backgroundColor: item.color,
      alignSelf: "flex-start", // 🔥 KEY FIX
      transform: [
  {
    translateX: targetAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [-barWidth / 2, 0], // 🔥 EXACT FIX
    }),
  },
  {
    scaleX: targetAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [0.01, 1],
    }),
  },
]
    },
  ]}
/>
            </View>
          </View>
        );
      })}
    </View>
  )
}
        ListEmptyComponent={
  !loading ? <EmptyState language={language} /> : null
}
        renderItem={({ item }) => {
          const c = crops[item];

// 🔥 profit margin (income base)
// renderItem లోపల
const profitPercent = c.income > 0 
  ? ( (c.profit || 0) / c.income ) * 100 
  : (c.profit < 0 ? -100 : 0); // ఆదాయం 0 ఉండి నష్టం ఉంటే 100% లాస్ కింద చూపిస్తుంది

// clamp 0–100
const finalPercent = Math.min(Math.max(Math.abs(profitPercent), 0), 100);
          
          let color = "#16A34A"; // green

if (profitPercent < 0) {
  color = "#DC2626"; // red (loss)
} else if (profitPercent >= 0 && profitPercent <= 20 ) {
  color = "#F59E0B"; // yellow (low profit)
}

          return (
            <View style={styles.card}>
              <View style={[styles.sideBar, { backgroundColor: color }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <AppText style={styles.cropName}>{item}</AppText>
                 
                    <View style={[styles.qtyBadge, { marginLeft: 10, backgroundColor: color === "#16A34A" ? "#ECFDF5" : color === "#DC2626" ? "#FEF2F2" : "#FFFBEB", borderColor: color === "#16A34A" ? "#A7F3D0" : color === "#DC2626" ? "#FECACA" : "#FDE68A" }]}>
                      <AppText style={[styles.qtyText, { color, fontSize: 11, fontWeight: '600' }]}>
                       {c.acres} {language === "te" ? "ఎకరాలు" : "Acres"}
                      </AppText>
                    </View>
                 
                </View>
                <AppText style={styles.row}>{language === "te" ? "పరిమాణం" : "Quantity"}: {c.quantity} {getUnitLabel(c.unit)}</AppText>
                <AppText style={styles.row}>{language === "te" ? "ఇతర ఖర్చులు" : "Other Expense"}: ₹{c.expense}</AppText>
                <AppText style={styles.row}>{language === "te" ? "కూలీ ఖర్చులు" : "Kulis Expenses"}: ₹{c.labour}</AppText>
                {c.rent > 0 && (
  <AppText style={styles.row}>
    {language === "te" ? "కౌలు ఖర్చులు" : "Field Rent"}: ₹{c.rent}
  </AppText>
)}
                <AppText style={styles.row}>{language === "te" ? "మొత్తం ఆదాయం" : "Total Income"}: ₹{c.income}</AppText>
               {/* c.profit వాల్యూ ఉండి, అది NaN కాకుండా మరియు 0 కాకుండా ఉంటేనే చూపిస్తుంది */}
{c.profit !== undefined && !isNaN(c.profit) && c.profit !== 0 && (
  <AppText style={[styles.profitText, { color }]}>
    {c.profit > 0
      ? (language === "te" ? "వచ్చిన లాభం" : "Profit Gained")
      : (language === "te" ? "పోయిన నష్టం" : "Loss Incurred")
    }: ₹{Math.abs(c.profit).toLocaleString("en-IN")}
  </AppText>
)}
              </View>
              <CropProgressCircle percent={finalPercent} displayText={Math.abs(finalPercent).toFixed(0)} color={color} />
            </View>
          );
        }}
        ListFooterComponent={
  loading ? <ShimmerTopCard /> : (

          <>
            <LinearGradient colors={isProfit ? ["#14532d", "#052e16"] : ["#7f1d1d", "#450a0a"]} style={styles.topCard}>

              <View style={styles.rowBetween}>
  
  {/* LEFT → TOTAL INCOME */}
  <View style={styles.glassBox}>
    <Ionicons name="cash-outline" size={18} color="#86EFAC" />
    <AppText style={styles.glassLabel}>
      {language === "te" ? "మొత్తం ఆదాయం" : "Total Income"}
    </AppText>
    <AppText style={styles.glassValue}>
      ₹ {summary.income.toLocaleString("en-IN")}
    </AppText>
  </View>

  {/* RIGHT → TOTAL EXPENSE */}
  <View style={styles.glassBox}>
    <Ionicons name="wallet-outline" size={18} color="#FCA5A5" />
    <AppText style={styles.glassLabel}>
      {language === "te" ? "మొత్తం ఖర్చులు" : "Total Expenses"}
    </AppText>
    <AppText style={styles.glassValue}>
      ₹ {totalExpenses.toLocaleString("en-IN")}
    </AppText>
  </View>

</View>
              <View style={styles.divider} />
              <View style={styles.resultBox}>
                <Ionicons name={isProfit ? "trending-up" : "trending-down"} size={22} color="#fff" />
                <AppText style={styles.resultTitle}>{isProfit ? (language === "te" ? "లాభం" : "PROFIT") : (language === "te" ? "నష్టం" : "LOSS")}</AppText>
              </View>
              <AppText style={styles.resultAmount}>{isProfit ? `+ ₹${summary.profit.toLocaleString("en-IN")}` : `- ₹${Math.abs(summary.profit).toLocaleString("en-IN")}`}</AppText>
              {!loading && summary.profit !== 0 && (
                <View style={styles.messageGlass}>
                  <Ionicons name={isProfit ? "sparkles-outline" : "alert-circle-outline"} size={16} color="#fff" />
                  <AppText style={styles.messageText}>{summary.profit > 0 ? (language === "te" ? "బాగా చేసారు! మీ వ్యవసాయం లాభంలో ఉంది" : "Great work! Your farm is in profit") : (language === "te" ? "ధైర్యంగా ఉండండి. ఖర్చులను తగ్గించండి" : "Stay strong. Optimize your costs")}</AppText>
                </View>
              )}
            </LinearGradient>

        {/* AI CARD */}
<TouchableOpacity
  activeOpacity={0.85}
  onPress={handleAIClick}
  style={styles.aiSmartCard}
>
  <LinearGradient
    colors={["#065F46", "#10B981", "#6EE7B7"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.aiSmartInner}
  >

    {/* 🌱 ICON (SAME NAVBAR STYLE) */}
    <View style={styles.aiSmartIcon}>

    <MaterialCommunityIcons name="leaf" size={26} color="#fff" />
    
          {/* Floating Sparkles (More Dynamic) */}
          <MaterialCommunityIcons
            name="star-four-points"
            size={10}
            color="#fff"
            style={{ position: "absolute", top: 3, left: 5, opacity: 0.9 }}
          />
          
          <MaterialCommunityIcons
            name="star-four-points"
            size={8}
            color="rgba(255, 255, 255, 0.7)"
            style={{ position: "absolute", bottom: 6,right: 6 }}
          />
    </View>

    {/* TEXT */}
    <View style={{ flex: 1, marginLeft: 12 }}>

      <AppText style={styles.aiSmartTitle}>
        {language === "te" ? `${typedName} గారు,` : `${typedName},`}
      </AppText>

      <AppText style={styles.aiSmartSub}>
        {aiState === "idle" &&
          (language === "te"
            ? "మీ పంటపై స్మార్ట్ విశ్లేషణ చూడండి"
            : "Tap to view smart farm analysis")}

        {aiState === "loading" &&
          (language === "te"
            ? "విశ్లేషణ జరుగుతోంది..."
            : "Analyzing your farm...")}

        {aiState === "result" &&
          (language === "te"
            ? "మీ రిపోర్ట్ సిద్ధంగా ఉంది"
            : "Your report is ready")}
      </AppText>

    </View>

    {/* 👉 ARROW (UX clarity) */}
    <MaterialCommunityIcons
      name="chevron-right"
      size={20}
      color="#fff"
    />

  </LinearGradient>
</TouchableOpacity>
{/* RESULT */}
{aiState === "result" && (
  <View style={styles.aiContainer}>
    <View style={styles.aiHeader}>
      <Ionicons name="bulb" size={20} color="#F59E0B" />
      <AppText style={styles.aiTitle}>
        {language === "te" ? "AgriSnap స్మార్ట్ సూచనలు" : "AgriSnap SMART INSIGHTS"}
      </AppText>
    </View>

    {suggestions.map((s, i) => (
      <AnimatedAIItem key={i} text={s} index={i} />
    ))}
  </View>
)}
            
          </>
  )
}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
 stickyBox: { 
    backgroundColor: "#ffffff", // Pure white for a cleaner look
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: "#F1F5F9",
    // కొంచెం షాడో ఇస్తే ప్రీమియం గా ఉంటుంది
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  barItem: { 
    marginBottom: 16 // స్పేసింగ్ పెంచాను
  },
  barTopRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: 'center',
    marginBottom: 8 
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  barLabel: { 
    fontSize: 13, 
    color: "#64748B", 
    fontWeight: "600",
    letterSpacing: 0.3
  },
  barValue: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
 barBg: {
  height: 10,
  backgroundColor: "#F1F5F9",
  borderRadius: 12,
  overflow: "hidden",
  flexDirection: "row", // 🔥 KEY FIX
},
barFill: {
  height: "100%",
  width: "100%", // 🔥 MUST
  borderRadius: 12,
  transform: [{ scaleX: 0.01 }], // 🔥 IMPORTANT
},
  card: { marginHorizontal: 20, marginVertical: 6, flexDirection: "row", backgroundColor: "#fff", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", alignItems: 'center' },
  sideBar: { width: 4, height: '80%', marginRight: 12, borderRadius: 2 },
  cropName: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  row: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  profitText: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  circleWrap: { justifyContent: "center", alignItems: "center", marginLeft: 10 },
  circleCenter: {
  position: "absolute",
  width: 80,
  height: 80,
  justifyContent: "center",
  alignItems: "center"
},
  circleText: { fontSize: 11, fontWeight: "600" },
  topCard: { margin: 20, padding: 24, borderRadius: 28, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  glassBox: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  glassLabel: { color: "#E5E7EB", fontSize: 11, marginTop: 4 },
  glassValue: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 12 },
  resultBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 },
  resultTitle: { color: "#fff", fontSize: 16, fontWeight: "600", letterSpacing: 1.2 },
  resultAmount: { color: "#fff", fontSize: 30, fontWeight: "600", textAlign: "center", marginTop: 4 },
  messageGlass: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  messageText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  topLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", letterSpacing: 1.5, lineHeight: 16 },
  topValue: { color: "#fff", fontSize: 34, fontWeight: "600", marginTop: -4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  qtyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  qtyText: { fontSize: 12, fontWeight: "500" },
  aiContainer: { margin: 20, backgroundColor: "#1E293B", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", elevation: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: "rgba(245, 158, 11, 0.2)", paddingBottom: 8 },
  aiTitle: { fontSize: 14, fontWeight: "600", color: "#F59E0B", letterSpacing: 1 },
  aiCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 12, marginBottom: 10, gap: 10 },
  aiBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F59E0B", marginTop: 6 },
  aiText: { flex: 1, fontSize: 13, color: "#E2E8F0", lineHeight: 22, fontWeight: "500" },
  emptyWrap: {
  marginTop: 140,
  alignItems: "center",
  paddingHorizontal: 30
},

emptyIconWrap: {
  width: 80,
  height: 80,
  borderRadius: 40,

  backgroundColor: "#ECFDF5", // light green

  justifyContent: "center",
  alignItems: "center",

  marginBottom: 18,

  // 🔥 shadow
  shadowColor: "#16A34A",
  shadowOpacity: 0.15,
  shadowRadius: 10,
  
},

emptyTitle: {
  fontSize: 20,
  fontWeight: "600",
  color: "#111827"
},

emptySub: {
  fontSize: 13,
  color: "#6B7280",
  textAlign: "center",
  marginTop: 8,
  lineHeight: 20
},

emptyIcon: {
  width: 80,
  height: 80,
  borderRadius: 35,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 16
},
aiSmartCard: {
  marginHorizontal: 20,
  marginTop: 18,

  transform: [{ translateY: -6 }], // 🔥 FLOAT LIKE NAVBAR
},
aiSmartInner: {
  flexDirection: "row",
  alignItems: "center",
  padding: 16,
  borderRadius: 20,
  elevation: 12,
},
aiSmartIcon: {
  width: 42,
  height: 42,
  borderRadius: 21,
  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "rgba(255,255,255,0.15)",

  // 🔥 ADD THIS (missing)
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
},
aiSmartTitle: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
},

aiSmartSub: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 12,
  marginTop: 2,
},

});