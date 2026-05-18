// app/farmer/summary/index.tsx

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import AppEmptyState from "@/components/AppEmptyState";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { InteractionManager } from "react-native";
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated, Easing, FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
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
      duration: 1000, // Smooth transition
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [percent]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: "clamp"
  });

  return (
    <View style={styles.circleWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#F1F5F9"
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
  const [summary, setSummary] = useState({ expense: 0, labour: 0, income: 0, profit: 0, rent: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userName, setUserName] = useState("Farmer");
  const [typedName, setTypedName] = useState("");
  
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
  
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setAIState("idle");
  }, []);

  useEffect(() => {
    if (!userName) return; 

    let index = 0;
    setTypedName("");

    const interval = setInterval(() => {
      if (index < userName.length) {
        const char = userName.charAt(index); 
        setTypedName((prev) => prev + char);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [userName]);

  const handleAIClick = () => {
    if (aiState !== "idle") return; 
    setAIState("loading");
    setTimeout(() => {
      setAIState("result");
    }, 3000); // Made slightly faster for better UX
  };

  const AnimatedAIItem = ({ text, index }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 400, 
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
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
        <View style={styles.aiCard}>
          <View style={styles.aiBullet} />
          <AppText style={styles.aiText}>{text}</AppText>
        </View>
      </Animated.View>
    );
  };

  /* ---------------- 🔥 ULTRA HD PROFESSIONAL PDF GENERATOR ---------------- */
  const exportProfessionalPDF = async (existingInsights: string[]) => {
    try {
      // Fetching Logo safely
      let logoBase64 = "";
      try {
        const logoAsset = Asset.fromModule(require('../../assets/images/logo.jpeg'));
        await logoAsset.downloadAsync();
        logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri!, { encoding: 'base64' });
      } catch (e) {
        console.log("Logo missing, proceeding without logo");
      }

      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const time = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
      });

      // Commercial A4 Print Styles
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>AgriSnap Farm Report</title>
            <style>
              body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                padding: 40px; 
                color: #1e293b; 
                line-height: 1.6; 
                background-color: #ffffff;
                margin: 0;
              }
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                border-bottom: 3px solid #16A34A; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
              }
              .logo-container { display: flex; align-items: center; gap: 15px; }
              .logo-img { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; }
              .brand-title { font-size: 34px; font-weight: 800; color: #166534; margin: 0; letter-spacing: -0.5px; }
              .brand-sub { font-size: 13px; color: #64748b; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
              
              .report-meta { text-align: right; }
              .meta-title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0 0 5px 0; }
              .meta-date { font-size: 13px; color: #64748b; margin: 0; }
              .meta-farmer { font-size: 14px; font-weight: bold; color: #334155; margin-top: 5px; }

              /* AI Insights Section */
              .ai-section { 
                background-color: #F0FDF4; 
                border-left: 4px solid #16A34A; 
                padding: 20px 25px; 
                border-radius: 0 12px 12px 0; 
                margin-bottom: 35px; 
              }
              .ai-title { color: #166534; font-size: 18px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
              .ai-tip { font-size: 14px; color: #1e293b; margin-bottom: 10px; padding-left: 20px; position: relative; }
              .ai-tip::before { content: "✦"; position: absolute; left: 0; font-size: 14px; color: #16A34A; top: 0px; }

              /* Financial Dashboard */
              .dashboard { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 35px; 
                gap: 20px; 
              }
              .card { 
                flex: 1; 
                padding: 20px; 
                border-radius: 12px; 
                background-color: #F8FAFC; 
                border: 1px solid #E2E8F0; 
                text-align: center; 
              }
              .card-label { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
              .card-value { font-size: 24px; font-weight: 800; margin-top: 8px; color: #0F172A; }
              .val-profit { color: #166534; }
              .val-loss { color: #DC2626; }

              /* Professional Table */
              h2 { font-size: 20px; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; display: inline-block; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th { 
                background-color: #F1F5F9; 
                color: #334155; 
                padding: 14px; 
                text-align: left; 
                font-size: 13px; 
                font-weight: bold; 
                text-transform: uppercase; 
                border-bottom: 2px solid #CBD5E1; 
              }
              td { 
                padding: 14px; 
                border-bottom: 1px solid #E2E8F0; 
                font-size: 14px; 
                color: #1e293b; 
              }
              tr:nth-child(even) { background-color: #FAFAFA; }
              .crop-name { font-weight: bold; color: #0f172a; }
              .profit { color: #166534; font-weight: bold; }
              .loss { color: #DC2626; font-weight: bold; }
              
              /* Footer */
              .footer { 
                margin-top: 50px; 
                text-align: center; 
                border-top: 1px solid #E2E8F0; 
                padding-top: 20px; 
              }
              .footer-brand { font-size: 14px; font-weight: bold; color: #166534; }
              .footer-tag { font-size: 12px; color: #64748b; margin-top: 5px; }
            </style>
          </head>
          <body>

            <div class="header">
              <div class="logo-container">
                ${logoBase64 ? `<img src="data:image/jpeg;base64,${logoBase64}" class="logo-img" />` : ''}
                <div>
                  <h1 class="brand-title">Agrisnap</h1>
                  <p class="brand-sub">మీ వ్యవసాయానికి మా డిజిటల్ తోడ్పాటు</p>
                </div>
              </div>
              <div class="report-meta">
                <h2 class="meta-title">Financial Report</h2>
                <p class="meta-date">${today} | ${time}</p>
                <p class="meta-farmer">Prepared for: ${userName}</p>
              </div>
            </div>

            <div class="ai-section">
              <div class="ai-title">Agrisnap Smart Insights</div>
              ${existingInsights && existingInsights.length > 0 
                ? existingInsights.map(insight => `<div class="ai-tip">${insight}</div>`).join('')
                : '<div class="ai-tip">Sufficient data is not available to generate deep insights yet. Please log more records.</div>'
              }
            </div>

            <div class="dashboard">
              <div class="card">
                <div class="card-label">Total Revenue</div>
                <div class="card-value val-profit">₹${summary.income.toLocaleString('en-IN')}</div>
              </div>
              <div class="card">
                <div class="card-label">Total Expenses</div>
                <div class="card-value">₹${(summary.expense + summary.labour + summary.rent).toLocaleString('en-IN')}</div>
              </div>
              <div class="card" style="border-color: ${summary.profit >= 0 ? '#16A34A' : '#DC2626'}; background-color: ${summary.profit >= 0 ? '#F0FDF4' : '#FEF2F2'};">
                <div class="card-label" style="color: ${summary.profit >= 0 ? '#166534' : '#991B1B'};">Net Result</div>
                <div class="card-value ${summary.profit >= 0 ? 'val-profit' : 'val-loss'}">
                  ${summary.profit >= 0 ? '+' : '-'}₹${Math.abs(summary.profit).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <h2>Crop-wise Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Yield/Acres</th>
                  <th>Total Cost</th>
                  <th>Revenue</th>
                  <th>Net Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(crops).map(key => {
                  const c = crops[key];
                  const totalCost = c.expense + c.labour + c.rent;
                  return `
                    <tr>
                      <td class="crop-name">${key}</td>
                      <td>${c.quantity} ${getUnitLabel(c.unit)}<br><span style="font-size: 11px; color: #64748b;">${c.acres} Acres</span></td>
                      <td>₹${totalCost.toLocaleString('en-IN')}</td>
                      <td>₹${c.income.toLocaleString('en-IN')}</td>
                      <td class="${c.profit >= 0 ? 'profit' : 'loss'}">
                        ${c.profit >= 0 ? '+' : '-'}₹${Math.abs(c.profit).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="footer">
              <div class="footer-brand">Agrisnap</div>
              <div class="footer-tag">Certified Digital Farm Ledger & Management Solution</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 8px;">Generated securely via Agrisnap App © ${new Date().getFullYear()}</div>
            </div>

          </body>
        </html>
      `;

      setTimeout(async () => {
        const { uri } = await Print.printToFileAsync({ 
          html: htmlContent,
          margins: { left: 20, right: 20, top: 30, bottom: 30 } // Perfect A4 Margins
        });
        await Sharing.shareAsync(uri);
      }, 100);

    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  const round = (num: number) => Math.round(num);
  const e = round(expensePercent);
  const l = round(labourPercent);
  const r = round(rentPercent);
  const i = round(incomePercent);

  const diff = 100 - (e + l + r + i);
  const finalIncomePercent = i + diff;
  const totalExpenses = summary.expense + summary.labour + summary.rent;
  const isEmpty = Object.keys(crops).length === 0;

  const ShimmerCard = () => (
    <View style={styles.card}>
      <View style={{ width: 4, height: 60, backgroundColor: "#E5E7EB", borderRadius: 2 }} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 18, width: "40%", borderRadius: 6 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 12, width: "60%", marginTop: 8 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 12, width: "50%", marginTop: 6 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ height: 12, width: "55%", marginTop: 6 }} />
      </View>
      <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 60, height: 60, borderRadius: 30 }} />
    </View>
  );

  // 🔥 Smooth Bar Animation Initialization
  useEffect(() => {
    if (!loading && !isEmpty) {
      expenseAnim.setValue(0);
      labourAnim.setValue(0);
      rentAnim.setValue(0);
      incomeAnim.setValue(0);

      InteractionManager.runAfterInteractions(() => {
        Animated.parallel([
          Animated.timing(expenseAnim, { toValue: e, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(labourAnim, { toValue: l, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(rentAnim, { toValue: r, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(incomeAnim, { toValue: finalIncomePercent, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      });
    }
  }, [loading, isEmpty]);

  const generateSmartInsights = (cropMap: any, totalInc: number) => {
    const insights: string[] = [];
    const cropEntries = Object.entries(cropMap);
    
    if (cropEntries.length === 0) {
      insights.push(language === "te" ? "👋 మీ వ్యవసాయ వివరాలను నమోదు చేయండి. మీ డేటా ఆధారంగా నేను లోతైన విశ్లేషణ అందిస్తాను." : "👋 Please enter your farm details. I will provide a deep analysis based on your data.");
      setSuggestions(insights);
      return;
    }

    const globalTotalExp = summary.expense + summary.labour + summary.rent;
    const globalProfit = summary.profit;
    const globalROI = globalTotalExp > 0 ? (globalProfit / globalTotalExp) * 100 : 0;

    cropEntries.forEach(([name, data]: any) => {
      const d = data;
      const totalCropCost = d.expense + d.labour + d.rent;
      const profitMargin = d.income > 0 ? (d.profit / d.income) * 100 : 0;
      const labourRatio = totalCropCost > 0 ? (d.labour / totalCropCost) * 100 : 0;
      const totalCost = d.expense + d.labour + d.rent;
      
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

      if (d.acres > 0 && d.expense === 0 && d.labour === 0) {
          insights.push(language === "te" 
            ? `❗ ${name}: ఎరువులు, విత్తనాలు లేదా కూలీల ఖర్చు "సున్నా" గా ఉంది. మర్చిపోకుండా అప్డేట్ చేయండి.` 
            : `❗ ${name}: Fertilizer, seeds, or labour costs are 0. Ensure all costs are updated.`);
      }

      if (d.rent > 0 && d.expense === 0) {
          insights.push(language === "te" 
            ? `🧐 ${name}: కేవలం కౌలు మాత్రమే రాశారు. సాగు ఖర్చులు (Expenses) కూడా ఉంటే నమోదు చేయండి.` 
            : `🧐 ${name}: Only rent recorded. Please enter cultivation expenses as well.`);
      }

      if (labourRatio > 55) {
        insights.push(language === "te" 
          ? `👷 ${name}: కూలీల ఖర్చు విపరీతంగా ఉంది (${Math.round(labourRatio)}%). వీలైతే యంత్రాలను వాడండి.` 
          : `👷 ${name}: Excessive labour cost (${Math.round(labourRatio)}%). Explore automation or machinery.`);
      }

      if (d.profit < 0) {
        insights.push(language === "te" 
          ? `🛑 ${name} నష్టంలో ఉంది (-₹${Math.abs(d.profit)}). దీనికి ప్రధాన కారణం ${d.rent > d.expense ? 'అధిక కౌలు' : 'ఎక్కువ పెట్టుబడి'} కావచ్చు.` 
          : `🛑 ${name} is in loss (-₹${Math.abs(d.profit)}). Main reason might be ${d.rent > d.expense ? 'high rent' : 'high input costs'}.`);
      } else if (profitMargin < 15 && d.income > 0) {
        insights.push(language === "te" 
          ? `📉 ${name} లాభం చాలా తక్కువగా ఉంది. మార్కెట్ ధరలు పెరిగే వరకు స్టాక్ దాచుకోవడం మంచిది.` 
          : `📉 ${name} has thin margins. Consider holding stock if you expect price hikes.`);
      }

      if (d.quantity > 0 && d.acres > 0) {
        const yieldPerAcre = d.quantity / d.acres;
        insights.push(language === "te" 
          ? `🌾 ${name}: ఎకరాకు సగటున ${yieldPerAcre.toFixed(1)} ${getUnitLabel(d.unit)} దిగుబడి వస్తోంది.` 
          : `🌾 ${name}: Your average yield is ${yieldPerAcre.toFixed(1)} ${d.unit} per acre.`);
      }

      if (d.income > 0 && d.quantity === 0) {
        insights.push(language === "te" 
          ? `📦 ${name}: అమ్మకాలు రాశారు కానీ ఎంత పరిమాణం (Quantity) అమ్మారో రాయలేదు.` 
          : `📦 ${name}: Sales recorded but quantity sold is missing.`);
      }

      if (d.acres <= 0) {
        insights.push(language === "te" 
          ? `❗ ${name}: పొలం విస్తీర్ణం (Acres) సున్నా ఉంది. ఇది లేకుండా ఎకరా ఖర్చు లెక్కించడం అసాధ్యం!` 
          : `❗ ${name}: Acres is 0. Cannot calculate cost efficiency without land size!`);
      }

      if (d.quantity > 0 && d.income <= 0) {
        insights.push(language === "te" 
          ? `❗ ${name}: ${d.quantity} ${getUnitLabel(d.unit)} దిగుబడి ఉంది, కానీ అమ్మకం ధర రాయలేదు.` 
          : `❗ ${name}: Yield is ${d.quantity} ${d.unit}, but sales amount is missing.`);
      }

      if (d.income > 0 && totalCost <= 0) {
        insights.push(language === "te" 
          ? `❗ ${name}: ఆదాయం వచ్చింది కానీ పెట్టుబడి సున్నా ఉంది. నిజమైన లాభం తెలియాలంటే ఖర్చులు రాయండి.` 
          : `❗ ${name}: Income recorded but expenses are 0. Add costs to see real profit.`);
      }

      if (d.quantity > 0 && (!d.unit || d.unit === "")) {
        insights.push(language === "te" 
          ? `📦 ${name}: దిగుబడి రాశారు కానీ కొలమానం (Units) ఎంచుకోలేదు.` 
          : `📦 ${name}: Quantity added but Units are missing.`);
      }
    });

    if (globalROI > 50) {
      insights.push(language === "te" 
        ? "🔥 అద్భుతం బ్రో! మీ ఫామ్ 50% పైగా లాభంతో నడుస్తోంది. మీరు టాప్ 1% రైతుల్లో ఒకరు!" 
        : "🔥 Amazing! Your farm is yielding over 50% ROI. You are in the top 1% of farmers!");
    } else if (globalROI < 0) {
      insights.push(language === "te" 
        ? "🆘 మీ మొత్తం ఫామ్ నష్టాల్లో ఉంది. వెంటనే ఇతర ఖర్చులను తగ్గించుకుని ఆదాయ మార్గాలను చూడాలి." 
        : "🆘 Overall farm is in loss. Focus on cost reduction and alternative revenue streams.");
    }

    if (cropEntries.length >= 3) {
      insights.push(language === "te" 
        ? "✅ మీరు వివిధ రకాల పంటలు వేసి రిస్క్ తగ్గించుకున్నారు. ఇది మంచి పద్ధతి." 
        : "✅ Good diversification! Growing multiple crops helps balance market risks.");
    } else {
      insights.push(language === "te" 
        ? "💡 అంతర పంటలు (Intercropping) వేయడం ద్వారా తక్కువ స్థలంలో ఎక్కువ ఆదాయం పొందవచ్చు." 
        : "💡 Try intercropping to maximize revenue from the same land area.");
    }

    if (summary.rent > summary.income && summary.income > 0) {
      insights.push(language === "te" 
        ? "⚠️ హెచ్చరిక: మీ ఆదాయం కంటే కౌలు ఖర్చు ఎక్కువగా ఉంది. ఇది ఫైనాన్షియల్ గా చాలా రిస్క్." 
        : "⚠️ Warning: Your rent cost is higher than your income. This is financially unsustainable.");
    }

    if (totalInc > 1000000) {
      insights.push(language === "te" ? "💰 మైలురాయి! మీ టర్నోవర్ 10 లక్షలు దాటింది. కంగ్రాట్స్!" : "💰 Milestone! Your turnover crossed 10 Lakhs. Huge achievement!");
    }

    const expertTips = [
      language === "te" ? "💡 నేల పరీక్ష (Soil Test) చేయిస్తే ఎరువుల ఖర్చు 20% తగ్గుతుంది." : "💡 Soil testing can reduce fertilizer costs by up to 20%.",
      language === "te" ? "📊 ప్రతి రోజూ ఖర్చులను రాసే అలవాటు మిమ్మల్ని అప్పుల నుంచి కాపాడుతుంది." : "📊 Daily expense logging prevents unexpected debt traps.",
      language === "te" ? "⛅ వాతావరణాన్ని బట్టి నీటి యాజమాన్యం చేస్తే కరెంటు మరియు నీరు ఆదా అవుతాయి." : "⛅ Weather-based irrigation saves both water and power costs."
    ];
    insights.push(expertTips[Math.floor(Math.random() * expertTips.length)]);

    const uniqueInsights = [...new Set(insights)];
    setSuggestions(uniqueInsights.slice(0, 10)); 
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const phone = await AsyncStorage.getItem("USER_PHONE");
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang && isMounted) setLanguage(lang as any);
      if (!phone) return;
      
      const userDoc = await firestore().collection("users").doc(phone).get();
      const activeSession = userDoc.data()?.activeSession;

      if (!activeSession) {
        if (isMounted) setLoading(false);
        return;
      }
      
      if (isMounted) setLoading(true);

      try {
        const [expSnap, salesSnap, paySnap, fieldsSnap] = await Promise.all([
          firestore().collection("users").doc(phone).collection("expenses").where("session", "==", activeSession).get(),
          firestore().collection("users").doc(phone).collection("sales").where("session", "==", activeSession).get(),
          firestore().collection("users").doc(phone).collection("payments").where("session", "==", activeSession).get(),
          firestore().collection("users").doc(phone).collection("fields").where("session", "==", activeSession).get()
        ]);
        
        if (!isMounted) return;

        const cropMap: any = {};
        let totalExp = 0, totalLab = 0, totalInc = 0, totalRent = 0;

        const unitToKg: any = { gms: 0.001, kg: 1, quintal: 100, ton: 1000 };
        const name = userDoc.data()?.name || "Farmer";
        setUserName(name);
        
        expSnap.forEach(doc => {
          const d = doc.data();
          const crop = d.crop || "Others";
          const amt = typeof d.amount === "number" ? d.amount : Number(d.amount) || 0;
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

        salesSnap.forEach(doc => {
          const d = doc.data();
          const crop = d.crop || "Others";
          const amt = Number(d.total) || 0;
          const qty = Number(d.quantity) || 0;
          const unitMap: any = { ton: "ton", tons: "ton", kg: "kg", quintal: "quintal", gms: "gms" };

          const unit = unitMap[(d.unit || "kg").toLowerCase()] || "kg";
          totalInc += amt;
          if (!cropMap[crop]) cropMap[crop] = { expense: 0, labour: 0, income: 0, totalKg: 0, unitStats: {}, acres: 0, rent: 0 };

          cropMap[crop].income += amt;
          
          const weightInKg = qty * (unitToKg[unit] || 1);
          cropMap[crop].totalKg = (cropMap[crop].totalKg || 0) + weightInKg;
          cropMap[crop].unitStats[unit] = (cropMap[crop].unitStats[unit] || 0) + 1;
        });

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
          c.quantity = factor ? (c.totalKg / factor).toFixed(2) : "0";
          c.unit = bestUnit; 
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
          if (isMounted) generateSmartInsights(cropMap, totalInc);
        }, 300);
      } catch (e) {
        console.log(e);
        if (isMounted) {
          setSuggestions([
            language === "te" ? "డేటా లోడ్ చేయడంలో సమస్య వచ్చింది" : "Error loading data"
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadData();
    return () => { isMounted = false; };
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
        <View style={{ paddingTop: 10 }}>
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </View>
      ) : isEmpty ? (
        /* 🔥 FIXED EMPTY STATE */
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <AppEmptyState
            iconName="analytics-outline"
            title={language === "te" ? "ఇంకా విశ్లేషణ లేదు" : "No Summary Yet"}
            subtitle={language === "te"
              ? "ఖర్చులు మరియు అమ్మకాలు నమోదు చేస్తే ఇక్కడ పూర్తి నివేదిక కనిపిస్తుంది"
              : "Add expenses and sales to view complete farm insights"}
            language={language}
          />
        </View>
      ) : (
        /* ✅ FULL DATA UI */
        <FlatList
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          data={Object.keys(crops)}
          keyExtractor={(item, index) => item + index}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          
          ListHeaderComponent={
            <View style={styles.stickyBox}>
              {[
                { label: language === "te" ? "ఇతర ఖర్చులు" : "Other Expenses", val: summary.expense, color: "#3B82F6", anim: expenseAnim },
                { label: language === "te" ? "కూలీ ఖర్చులు" : "Labour Expenses", val: summary.labour, color: "#F59E0B", anim: labourAnim },
                { label: language === "te" ? "కౌలు ఖర్చులు" : "Field Rent", val: summary.rent, color: "#8B5CF6", anim: rentAnim },
                { label: language === "te" ? "మొత్తం ఆదాయం" : "Total Income", val: summary.income, color: "#16A34A", anim: incomeAnim },
              ]
              .filter(item => item.val > 0)
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
                    <View style={styles.barBg} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
                      <Animated.View 
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: item.color,
                            alignSelf: "flex-start",
                            transform: [
                              { translateX: targetAnim.interpolate({ inputRange: [0, 100], outputRange: [-barWidth / 2, 0] }) },
                              { scaleX: targetAnim.interpolate({ inputRange: [0, 100], outputRange: [0.01, 1] }) },
                            ]
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          }

          renderItem={({ item }) => {
            const c = crops[item];
            const profitPercent = c.income > 0 
              ? ( (c.profit || 0) / c.income ) * 100 
              : (c.profit < 0 ? -100 : 0); 

            const finalPercent = Math.min(Math.max(Math.abs(profitPercent), 0), 100);
            let color = "#16A34A"; 

            if (profitPercent < 0) {
              color = "#DC2626"; 
            } else if (profitPercent >= 0 && profitPercent <= 20 ) {
              color = "#F59E0B"; 
            }

            return (
              <View style={styles.card}>
                <View style={[styles.sideBar, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <AppText style={styles.cropName}>{item}</AppText>
                    <View style={[styles.qtyBadge, { marginLeft: 10, backgroundColor: color === "#16A34A" ? "#ECFDF5" : color === "#DC2626" ? "#FEF2F2" : "#FFFBEB", borderColor: color === "#16A34A" ? "#A7F3D0" : color === "#DC2626" ? "#FECACA" : "#FDE68A" }]}>
                      <AppText style={[styles.qtyText, { color }]}>
                        {c.acres} {language === "te" ? "ఎకరాలు" : "Acres"}
                      </AppText>
                    </View>
                  </View>
                  <AppText style={styles.row}>{language === "te" ? "పరిమాణం" : "Quantity"}: {c.quantity} {getUnitLabel(c.unit)}</AppText>
                  <AppText style={styles.row}>{language === "te" ? "ఇతర ఖర్చులు" : "Other Expense"}: ₹{c.expense.toLocaleString("en-IN")}</AppText>
                  <AppText style={styles.row}>{language === "te" ? "కూలీ ఖర్చులు" : "Labour Expenses"}: ₹{c.labour.toLocaleString("en-IN")}</AppText>
                  {c.rent > 0 && (
                    <AppText style={styles.row}>
                      {language === "te" ? "కౌలు ఖర్చులు" : "Field Rent"}: ₹{c.rent.toLocaleString("en-IN")}
                    </AppText>
                  )}
                  <AppText style={styles.row}>{language === "te" ? "మొత్తం ఆదాయం" : "Total Income"}: ₹{c.income.toLocaleString("en-IN")}</AppText>
                  {c.profit !== undefined && !isNaN(c.profit) && c.profit !== 0 && (
                    <AppText style={[styles.profitText, { color }]}>
                      {c.profit > 0 ? (language === "te" ? "వచ్చిన లాభం" : "Profit Gained") : (language === "te" ? "పోయిన నష్టం" : "Loss Incurred")}: ₹{Math.abs(c.profit).toLocaleString("en-IN")}
                    </AppText>
                  )}
                </View>
                <CropProgressCircle percent={finalPercent} displayText={Math.abs(finalPercent).toFixed(0)} color={color} />
              </View>
            );
          }}

          ListFooterComponent={
            <>
              <LinearGradient colors={isProfit ? ["#14532d", "#052e16"] : ["#7f1d1d", "#450a0a"]} style={styles.topCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.glassBox}>
                    <Ionicons name="cash-outline" size={18} color="#86EFAC" />
                    <AppText style={styles.glassLabel}>
                      {language === "te" ? "మొత్తం ఆదాయం" : "Total Income"}
                    </AppText>
                    <AppText style={styles.glassValue}>
                      ₹ {summary.income.toLocaleString("en-IN")}
                    </AppText>
                  </View>

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
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.aiSmartInner}
                >
                  <View style={styles.aiSmartIcon}>
                    <MaterialCommunityIcons name="leaf" size={26} color="#fff" />
                    <MaterialCommunityIcons name="star-four-points" size={10} color="#fff" style={{ position: "absolute", top: 3, left: 5, opacity: 0.9 }} />
                    <MaterialCommunityIcons name="star-four-points" size={8} color="rgba(255, 255, 255, 0.7)" style={{ position: "absolute", bottom: 6,right: 6 }} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText style={styles.aiSmartTitle}>
                      {language === "te" ? `${typedName} గారు,` : `${typedName},`}
                    </AppText>
                    <AppText style={styles.aiSmartSub}>
                      {aiState === "idle" && (language === "te" ? "మీ పంటపై స్మార్ట్ విశ్లేషణ చూడండి" : "Tap to view smart farm analysis")}
                      {aiState === "loading" && (language === "te" ? "విశ్లేషణ జరుగుతోంది..." : "Analyzing your farm...")}
                      {aiState === "result" && (language === "te" ? "మీ రిపోర్ట్ సిద్ధంగా ఉంది" : "Your report is ready")}
                    </AppText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
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
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  stickyBox: { 
    backgroundColor: "#ffffff", 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  barItem: { marginBottom: 16 },
  barTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  barLabel: { fontSize: 13, color: "#64748B", fontWeight: "600", letterSpacing: 0.3 },
  barValue: { fontSize: 14, fontWeight: "600" },
  barBg: { height: 10, backgroundColor: "#F1F5F9", borderRadius: 12, overflow: "hidden", flexDirection: "row" },
  barFill: { height: "100%", width: "100%", borderRadius: 12, transform: [{ scaleX: 0.01 }] },
  card: { marginHorizontal: 20, marginVertical: 6, flexDirection: "row", backgroundColor: "#fff", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", alignItems: 'center' },
  sideBar: { width: 4, height: '80%', marginRight: 12, borderRadius: 2 },
  cropName: { fontSize: 18, fontWeight: "600", color: "#0F172A", flexShrink: 1 },
  row: { fontSize: 13, color: "#475569", marginTop: 2, fontWeight: "500" },
  profitText: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  circleWrap: { justifyContent: "center", alignItems: "center", marginLeft: 10 },
  circleCenter: { position: "absolute", width: 80, height: 80, justifyContent: "center", alignItems: "center" },
  circleText: { fontSize: 13, fontWeight: "700" },
  topCard: { margin: 20, padding: 24, borderRadius: 24, elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  glassBox: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  glassLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 6, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  glassValue: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 16 },
  resultBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  resultTitle: { color: "#fff", fontSize: 14, fontWeight: "600", letterSpacing: 1.5, opacity: 0.9 },
  resultAmount: { color: "#fff", fontSize: 36, fontWeight: "800", textAlign: "center", marginTop: 2 },
  messageGlass: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  messageText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  qtyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  qtyText: { fontSize: 11, fontWeight: "600" },
  aiContainer: { margin: 20, backgroundColor: "#0F172A", padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", elevation: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(245, 158, 11, 0.2)", paddingBottom: 10 },
  aiTitle: { fontSize: 15, fontWeight: "600", color: "#F59E0B", letterSpacing: 1, textTransform: "uppercase" },
  aiCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: "rgba(255,255,255,0.06)", padding: 14, borderRadius: 12, marginBottom: 10, gap: 12 },
  aiBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F59E0B", marginTop: 7 },
  aiText: { flex: 1, fontSize: 14, color: "#F1F5F9", lineHeight: 24, fontWeight: "500" },
  aiSmartCard: { marginHorizontal: 20, marginTop: 10, marginBottom: 10 },
  aiSmartInner: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 20, elevation: 6 },
  aiSmartIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  aiSmartTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  aiSmartSub: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 2, fontWeight: "500" }
});