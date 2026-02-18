import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

/* ---------- HELPERS ---------- */
const money = (n: number) => n.toLocaleString('en-IN');

type CropSummary = {
  crop: string;
  labour: number;      // mestri charges
  expense: number;     // other expenses
  income: number;
  quantity: number;    // ✅ TOTAL QUINTALS
  profit: number;
  margin: number;
  advice: string;
};


export default function FarmerSummary() {
  const router = useRouter();

  const [language, setLanguage] = useState<'te' | 'en'>('te');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CropSummary[]>([]);
const [farmerName, setFarmerName] = useState('');
const animatedValue = useRef(new Animated.Value(0)).current;
const [displayValue, setDisplayValue] = useState(0);

  /* ---------- TEXT ---------- */
 const T = {
  title: language === 'te' ? 'పంటల సారాంశం' : 'Crop Summary',

  income: language === 'te' ? 'ఆదాయం' : 'Income',
  expense: language === 'te' ? 'మొత్తం ఖర్చు' : 'Expense',
  profit: language === 'te' ? 'లాభం' : 'Profit',
  loss: language === 'te' ? 'నష్టం' : 'Loss',

  quantity: language === 'te' ? 'పరిమాణం (క్వింటాళ్లు)' : 'Quantity (Quintals)',
  labour: language === 'te' ? 'మెస్త్రీ ఖర్చు' : 'Labour Cost',
  otherExpense: language === 'te' ? 'ఇతర ఖర్చులు' : 'Other Expenses',

  margin: language === 'te' ? 'లాభ శాతం' : 'Profit Margin',

  best: language === 'te' ? 'బాగా వచ్చిన పంటలు' : 'Best Performing Crops',
  weak: language === 'te' ? 'శ్రద్ధ అవసరం' : 'Needs Attention',

  guidance: language === 'te' ? 'సూచనలు' : 'Guidance',
  noData:
    language === 'te'
      ? 'డేటా అందుబాటులో లేదు'
      : 'No data available',

  advice: {
    excellent:
      language === 'te'
        ? 'ఈ పంట చాలా లాభదాయకం. ఇదే విధానాన్ని కొనసాగించండి.'
        : 'This crop is highly profitable. Continue the same approach.',

    average:
      language === 'te'
        ? 'లాభం ఉంది కానీ ఖర్చులు ఇంకా తగ్గించవచ్చు.'
        : 'Profit exists, but expenses can be reduced.',

    poor:
      language === 'te'
        ? 'ఖర్చులు ఎక్కువగా ఉన్నాయి. పద్ధతి మార్చాలి.'
        : 'High costs observed. Strategy needs change.',
  },
weakMsg:
  language === 'te'
    ? 'ఖర్చులు తగ్గించాలి'
    : 'Reduce cost / rethink crop',
guideBest:
  language === 'te'
    ? 'లాభదాయకమైన పంటలను వచ్చే సీజన్‌లో కొనసాగించండి.'
    : 'Repeat profitable crops next season.',

guideWeak:
  language === 'te'
    ? 'నష్ట పంటల్లో ఖర్చులను నియంత్రించాలి.'
    : 'Control labour and input costs for loss crops.',

guideOverall:
  language === 'te'
    ? 'మొత్తం వ్యవసాయ ప్రణాళికను పునఃసమీక్షించండి.'
    : 'Review overall farming plan.',

  finalProfit:
    language === 'te'
      ? 'మొత్తం లాభం / నష్టం'
      : 'Overall Profit / Loss',

  congrats:
    language === 'te'
      ? 'అభినందనలు! మీ వ్యవసాయం లాభాల్లో ఉంది.'
      : 'Congratulations! Your farming is profitable.',

  warning:
    language === 'te'
      ? 'నష్టం ఉంది. ఖర్చులపై నియంత్రణ అవసరం.'
      : 'Loss observed. Expense control required.',
      goodMsg:
  language === 'te'
    ? 'మంచి లాభం వచ్చింది'
    : 'Good profit achieved',

};

  /* ---------- LOAD ---------- */
  useEffect(() => {
    load();
  }, []);
  
const load = async () => {
  setLoading(true);
  /* 1️⃣ Language */
  const lang = await AsyncStorage.getItem('APP_LANG');
  if (lang === 'te' || lang === 'en') setLanguage(lang);

  /* 2️⃣ Current User */
  const userRaw = await AsyncStorage.getItem('CURRENT_USER');
  if (!userRaw) {
    setLoading(false);
    return;
  }
  const user = JSON.parse(userRaw);
setFarmerName(user.name || user.username || '');

  /* 3️⃣ Read Storage */
  const paymentsRaw = await AsyncStorage.getItem(
    `FARMER_PAYMENT_HISTORY_${user.id}`
  );
  const expensesRaw = await AsyncStorage.getItem(
    `FARMER_EXPENSES_${user.id}`
  );
  const salesRaw = await AsyncStorage.getItem(
    `FARMER_SALES_${user.id}`
  );

  const payments = paymentsRaw ? JSON.parse(paymentsRaw) : [];
  const expenses = expensesRaw ? JSON.parse(expensesRaw) : [];
  const sales = salesRaw ? JSON.parse(salesRaw) : [];

  /* 4️⃣ Crop Map */
  const cropMap: Record<string, CropSummary> = {};

  const initCrop = (crop: string) => {
    if (!cropMap[crop]) {
      cropMap[crop] = {
        crop,
        labour: 0,
        expense: 0,
        income: 0,
        quantity: 0,
        profit: 0,
        margin: 0,
        advice: '',
      };
    }
  };

  /* 5️⃣ Mestri (Labour) */
  payments.forEach((p: any) => {
    initCrop(p.crop);
    cropMap[p.crop].labour += Number(p.grandTotal || 0);
  });

  /* 6️⃣ Other Expenses */
  expenses.forEach((e: any) => {
    initCrop(e.crop);
    cropMap[e.crop].expense += Number(e.amount || 0);
  });

  /* 7️⃣ Sales */
  sales.forEach((s: any) => {
    initCrop(s.crop);
    cropMap[s.crop].income += Number(s.total || 0);
    cropMap[s.crop].quantity += Number(s.quantity || 0);
  });

  /* 8️⃣ Final Calculation + Advice */
  const result: CropSummary[] = Object.values(cropMap).map(c => {
 const totalCost = c.labour + c.expense;
const profit = c.income - totalCost;

let margin = 0;

if (c.income > 0) {
  margin = (profit / c.income) * 100; // better logic
}


 let advice = '';

// No activity → no message
if (c.income === 0 && totalCost === 0) {
  advice = '';
}

// Income exists but loss
else if (profit < 0) {
  advice =
    language === 'te'
      ? 'ఖర్చులు ఆదాయానికి మించి ఉన్నాయి. ఖర్చులను నియంత్రించాలి.'
      : 'Expenses are higher than income. Cost control needed.';
}

// Small profit
else if (profit > 0 && margin < 15) {
  advice =
    language === 'te'
      ? 'లాభం ఉంది కానీ శాతం తక్కువగా ఉంది.'
      : 'Profit exists but margin is low.';
}

// Medium profit
else if (profit > 0 && margin >= 15 && margin < 35) {
  advice =
    language === 'te'
      ? 'మంచి లాభం వచ్చింది. ఖర్చులను కొంచెం తగ్గిస్తే ఇంకా మంచిది.'
      : 'Good profit. Slight cost reduction can improve more.';
}

// High profit
else if (profit > 0 && margin >= 35) {
  advice =
    language === 'te'
      ? 'ఈ పంట చాలా లాభదాయకం. ఇదే విధానాన్ని కొనసాగించండి.'
      : 'Highly profitable crop. Continue same strategy.';
}



    return {
      ...c,
      profit,
      margin,
      advice,
    };
  });

  /* 9️⃣ Set State */
  setSummary(result);
  setLoading(false);
};
const guidanceMessages: string[] = [];

summary.forEach(c => {
  const totalCost = c.labour + c.expense;

  // High labour cost warning
  if (c.labour > c.expense && c.labour > 0) {
    guidanceMessages.push(
      language === 'te'
        ? `${c.crop} లో మెస్త్రీ ఖర్చు ఎక్కువగా ఉంది. పనిదినాలను సమీక్షించండి.`
        : `High labour cost in ${c.crop}. Review attendance days.`
    );
  }

  // No income but expenses exist
  if (c.income === 0 && totalCost > 0) {
    guidanceMessages.push(
      language === 'te'
        ? `${c.crop} లో అమ్మకం నమోదు కాలేదు. ఆదాయం నమోదు చేయండి.`
        : `No sales recorded for ${c.crop}. Add income details.`
    );
  }

  // Good profit crop suggestion
  if (c.profit > 0 && c.margin >= 30) {
    guidanceMessages.push(
      language === 'te'
        ? `${c.crop} లాభదాయకం. వచ్చే సీజన్‌లో విస్తరించవచ్చు.`
        : `${c.crop} is profitable. Consider expanding next season.`
    );
  }

  // Loss crop suggestion
  if (c.profit < 0) {
    guidanceMessages.push(
      language === 'te'
        ? `${c.crop} లో నష్టం ఉంది. ఎరువులు / కూలీల ఖర్చులు తగ్గించాలి.`
        : `${c.crop} is in loss. Reduce fertilizer or labour cost.`
    );
  }
});
  /* ---------- CLASSIFY ---------- */
  const bestCrops = summary.filter(
  s => s.profit > 0 && s.margin >= 25
);

const weakCrops = summary.filter(
  s => s.profit < 0
);

const totalIncome = summary.reduce((s, c) => s + c.income, 0);
const totalExpense = summary.reduce(
  (s, c) => s + c.labour + c.expense,
  0
);
const CropProfit = ({ value }: { value: number }) => {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.abs(value),
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const id = animated.addListener(({ value }) => {
      setDisplay(Math.floor(value));
    });

    return () => animated.removeListener(id);
  }, []);

  const isProfit = value >= 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
      <Ionicons
        name={isProfit ? "trending-up" : "trending-down"}
        size={18}
        color={isProfit ? "#1b5e20" : "#d32f2f"}
        style={{ marginRight: 6 }}
      />
      <Text style={{
        fontWeight: '900',
        fontSize: 15,
        color: isProfit ? "#1b5e20" : "#d32f2f",
      }}>
        ₹{money(display)}
      </Text>
    </View>
  );
};


const finalProfit = totalIncome - totalExpense;
const FinalCard = ({
  profit,
  income,
  expense,
  language
}: {
  profit: number;
  income: number;
  expense: number;
  language: 'te' | 'en';
}) => {

  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: Math.abs(profit),
      duration: 5500,
      useNativeDriver: false,
    }).start();

    const id = animated.addListener(({ value }) => {
      setDisplay(Math.floor(value));
    });

    return () => animated.removeListener(id);
  }, []);

  const isProfit = profit >= 0;

  return (
    <View style={[
      styles.finalCard,
      !isProfit && styles.finalCardLoss
    ]}>

      <Ionicons name="analytics-outline" size={28} color="#fff" />

      <Text style={styles.finalTitle}>
        {language === 'te' ? 'మొత్తం ఫలితం' : 'Overall Result'}
      </Text>

      <Text style={styles.finalText}>
        💰 {language === 'te' ? 'ఆదాయం' : 'Income'}: ₹{money(income)}
      </Text>

      <Text style={styles.finalText}>
        💸 {language === 'te' ? 'ఖర్చు' : 'Expense'}: ₹{money(expense)}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Ionicons
          name={isProfit ? "trending-up" : "trending-down"}
          size={22}
          color={isProfit ? "#00ff88" : "#ff4d4d"}
          style={{ marginRight: 6 }}
        />

        <Text style={{
          fontSize: 20,
          fontWeight: '900',
          color: isProfit ? "#00ff88" : "#ff4d4d"
        }}>
          ₹{money(display)}
        </Text>
      </View>

      {/* 🔥 MESSAGE SECTION */}
      {profit !== 0 && (
        <Text style={styles.finalMsg}>
          {isProfit
            ? language === 'te'
              ? "🎉 అభినందనలు! మీ కష్టానికి తగిన ప్రతిఫలం లభించింది. ఇదే ఉత్సాహంతో ముందడుగు వేయండి."
              : "🎉 Congratulations! Your hard work has paid off. Keep the momentum going!"
            : language === 'te'
              ? "⚠ ఈసారి ఆశించిన ఫలితం రాలేదు. ఖర్చులను తగ్గించి తదుపరి సీజన్‌లో మెరుగైన ప్రణాళిక చేయండి."
              : "⚠ Returns are lower than expected. Optimize costs and plan better next season."
          }
        </Text>
      )}

    </View>
  );
};



const exportPDF = async () => {
 if (!summary.length) {
     Alert.alert(
       language === 'te' ? 'డేటా లేదు' : 'No Data',
       language === 'te'
         ? 'ఎగుమతి చేయడానికి రికార్డులు లేవు'
         : 'No attendance records to export'
     );
     return;
   }
  const today = new Date().toLocaleDateString(
    language === 'te' ? 'te-IN' : 'en-IN'
  );

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #222;
        }
         
        h1 {
          text-align: center;
          color: #1b5e20;
          margin-bottom: 6px;
        }

        .date {
          text-align: center;
          margin-bottom: 20px;
          color: #666;
          font-size: 12px;
        }

        .card {
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 14px;
        }

        .crop {
          font-size: 16px;
          font-weight: bold;
          color: #1b5e20;
          margin-bottom: 6px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .profit { color: #2e7d32; font-weight: bold; }
        .loss { color: #d32f2f; font-weight: bold; }

        .finalBox {
          margin-top: 25px;
          padding: 18px;
          border-radius: 12px;
          background: #f1f8f4;
          border: 1px solid #c8e6c9;
        }

        .finalTitle {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 15px;
        }

      </style>
    </head>

    <body>

      
      <h1>మీ పంటల వార్షిక సారాంశం</h1>

<div class="date">
  ${language === 'te' ? 'రైతు పేరు' : 'Farmer Name'} :
  <strong>${farmerName}</strong>
</div>

<div class="date">
  ${today}
</div>

      
      ${summary.map(c => `
        <div class="card">
          <div class="crop">🌾 ${c.crop}</div>

          <div class="row">
            <span>${T.quantity}</span>
            <span>${c.quantity}</span>
          </div>

          <div class="row">
            <span>${T.labour}</span>
            <span>₹${money(c.labour)}</span>
          </div>

          <div class="row">
            <span>${T.otherExpense}</span>
            <span>₹${money(c.expense)}</span>
          </div>

          <div class="row">
            <span>${T.income}</span>
            <span>₹${money(c.income)}</span>
          </div>

          <div class="row">
            <span>${T.expense}</span>
            <span>₹${money(c.labour + c.expense)}</span>
          </div>

          <div class="row ${c.profit >= 0 ? 'profit' : 'loss'}">
            <span>${c.profit >= 0 ? T.profit : T.loss}</span>
            <span>₹${money(Math.abs(c.profit))}</span>
          </div>

          <div class="row">
            <span>${T.margin}</span>
            <span>${c.margin.toFixed(1)}%</span>
          </div>

          ${c.advice ? `
            <div style="margin-top:6px;font-size:12px;color:#555;">
              🧠 ${c.advice}
            </div>
          ` : ''}

        </div>
      `).join('')}

      <div class="finalBox">
        <div class="finalTitle">
          ${language === 'te' ? 'మొత్తం ఫలితం' : 'Overall Result'}
        </div>

        <div class="row">
          <span>${T.income}</span>
          <span>₹${money(totalIncome)}</span>
        </div>

        <div class="row">
          <span>${T.expense}</span>
          <span>₹${money(totalExpense)}</span>
        </div>

        <div class="row ${finalProfit >= 0 ? 'profit' : 'loss'}">
          <span>${finalProfit >= 0 ? T.profit : T.loss}</span>
          <span>₹${money(Math.abs(finalProfit))}</span>
        </div>
      </div>

    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1b5e20" />
        </Pressable>
        <Text style={styles.headerTitle}>{T.title}</Text>
        <Pressable onPress={exportPDF}>
  <Ionicons name="download-outline" size={22} color="#1b5e20" />
</Pressable>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {summary.length === 0 && (
          <Text style={styles.empty}>{T.noData}</Text>
        )}

        {/* PER CROP CARDS */}
       {summary.map((c, i) => (
  <View key={`${c.crop}-${i}`} style={styles.card}>

  <Text style={styles.crop}>🌾 {c.crop}</Text>

  <Text>📦 {T.quantity}: {c.quantity}</Text>
  <Text>👷 {T.labour}: ₹{money(c.labour)}</Text>
  <Text>🧾 {T.otherExpense}: ₹{money(c.expense)}</Text>

  <Text>💰 {T.income}: ₹{money(c.income)}</Text>
  <Text>💸 {T.expense}: ₹{money(c.labour + c.expense)}</Text>
<Text style={{ marginTop: 6, fontWeight: '700' }}>
  {c.profit >= 0 ? T.profit : T.loss}:
</Text>

<CropProfit value={c.profit} />

  <Text style={styles.margin}>
    {T.margin}: {c.margin.toFixed(1)}%
  </Text>

  {c.advice !== '' && (
  <Text style={styles.advice}>🧠 {c.advice}</Text>
)}

</View>


        ))}

     
     {summary.length > 0 && (
  <FinalCard
    profit={finalProfit}
    income={totalIncome}
    expense={totalExpense}
    language={language}
  />
)}

   {/* BEST */}
        {bestCrops.length > 0 && (
          <>
            <Text style={styles.section}>{T.best}</Text>
           {bestCrops.map((c, i) => (
  <Text key={`best-${c.crop}-${i}`} style={styles.good}>

                ✔ {c.crop} – {T.goodMsg}

              </Text>
            ))}
          </>
        )}
        {/* WEAK */}
       {weakCrops.length > 0 && (
  <>
    <Text style={styles.section1}>{T.weak}</Text>
   {weakCrops.map((c, i) => (
  <Text key={`weak-${c.crop}-${i}`} style={styles.warn}>

        ⚠ {c.crop} – {T.weakMsg}
      </Text>
    ))}
  </>
)}


        {/* GUIDANCE */}
{summary.length > 0 && (
  <View style={styles.guideBox}>
    <Text style={styles.section}>{T.guidance}</Text>

    {guidanceMessages.length === 0 ? (
      <Text>
        {language === 'te'
          ? 'అన్ని పంటల డేటా సాధారణ స్థితిలో ఉంది.'
          : 'All crops are performing normally.'}
      </Text>
    ) : (
      guidanceMessages.map((msg, i) => (
        <Text key={i} style={{ marginBottom: 6 }}>
          👉 {msg}
        </Text>
      ))
    )}
  </View>
)}

      </ScrollView>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#1b5e20',
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
  },
  crop: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 6,
  },
  finalCardLoss: {
  backgroundColor: '#8e2b2b',
},

  profit: {
    marginTop: 6,
    fontWeight: '800',
    color: '#1b5e20',
  },
  loss: {
    color: '#d32f2f',
  },
  margin: {
    color: '#555',
    marginTop: 4,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b5e20',
    marginVertical: 10,
  },
  section1: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ac3f31',
    marginVertical: 10,
  },
  good: {
    color: '#2e7d32',
    marginBottom: 4,
  },
  warn: {
    color: '#d32f2f',
    marginBottom: 4,
  },
  guideBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  advice: {
  marginTop: 6,
  fontStyle: 'italic',
  color: '#555',
  fontWeight: '700',
},

finalCard: {
  backgroundColor: '#35712b',
  borderRadius: 18,
  padding: 20,
  elevation: 4,
  marginVertical: 30,
  alignItems: 'center',
},
finalTitle: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '700',
  marginVertical: 6,
},
finalText: {
  color: '#fff',
  marginTop: 6,
},
finalProfit: {
  marginTop: 10,
  fontSize: 18,
  fontWeight: '800',
  color: '#a5d6a7',
},
finalMsg: {
  marginTop: 10,
  textAlign: 'center',
  color: '#fff',
  fontWeight: '600',
},

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
