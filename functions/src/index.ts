import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import fetch from "node-fetch";

export const getWeather = functions.https.onRequest(async (req, res) => {
  try {
    const lat = req.query.lat || "17.3850";
    const lon = req.query.lon || "78.4867";

    const API_KEY = "c95b023f0a7c59ce9e1600c2fcf35036";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log("Invalid response:", text);
      res.status(500).json({ error: "Invalid API response" });
      return; // ✅ IMPORTANT
    }

    if (!data || !data.main) {
      res.status(400).json({ error: "Weather data not found" });
      return; // ✅ IMPORTANT
    }

    res.json(data); // ✅ NO return

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching weather" });
  }
});


export const getPrices = functions.https.onRequest(async (req, res) => {
  try {

    const API =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000012deb5555117e4ebe4ffd6df74e6ae0d8&format=json&filters[state]=Andhra Pradesh&limit=100";

    const API2 =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd0000012deb5555117e4ebe4ffd6df74e6ae0d8&format=json&filters[state]=Telangana&limit=100";

    const ap = await fetch(API);
    const ts = await fetch(API2);

    const apData = await ap.json();
    const tsData = await ts.json();

    const combined = [
      ...(apData.records || []),
      ...(tsData.records || [])
    ];

    res.json(combined.slice(0, 10));

  } catch (e) {
    res.status(500).json({ error: "Price fetch failed" });
  }
});

admin.initializeApp();

export const pushNotification = onDocumentCreated(
  "notifications/{id}",
  async (event) => {

    const snap = event.data;
    if (!snap) return;

    const data = snap.data();

// helper
const normalize = (s: any) => (s || "").trim().toLowerCase();

const targetUserId = data.userId;
const targetState = data.state;

const isGlobal = targetUserId === "all" || (!targetUserId && !targetState);

let tokens: string[] = [];

// GLOBAL
if (isGlobal) {
  const users = await admin.firestore().collection("users").get();

  users.forEach(doc => {
    const t = doc.data()?.fcmToken;
    if (t) tokens.push(t);
  });
}

// STATE
else if (targetState) {
  const state = normalize(targetState);

  const users = await admin.firestore().collection("users").get();

  users.forEach(doc => {
    const userState = normalize(doc.data()?.state);
    if (userState === state) {
      const t = doc.data()?.fcmToken;
      if (t) tokens.push(t);
    }
  });
}

// USER
else if (targetUserId) {
  const userDoc = await admin.firestore()
    .collection("users")
    .doc(targetUserId)
    .get();

  const token = userDoc.data()?.fcmToken;
  
  if (token) tokens.push(token);
}
// before sending
tokens = [...new Set(tokens)];
    if (tokens.length === 0) {
      console.log("❌ No tokens found");
      return;
    }

    console.log("✅ Sending to tokens:", tokens.length);
    console.log("🔥 New notification triggered:", data.title);
    console.log("👉 Incoming state:", data.state);
console.log("👉 Tokens found:", tokens.length);

   try {
  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: data.title || "AgriSnap",
      body: data.message || "",
    },
    android: {
      priority: "high",
      notification: { channelId: "default", sound: "default" },
    },
    apns: {
      payload: { aps: { sound: "default" } },
    },
    data: {
      screen: "notifications",
    },
  });
} catch (e) {
  console.log("❌ pushNotification error:", e);
}
  }
);

export const sendInactiveNotifications = onSchedule({
  schedule: "0 9 * * *",
  timeZone: "Asia/Kolkata"
},
  async () => {
    const now = new Date();
    const usersSnap = await admin.firestore().collection("users").get();

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      if (!data.lastActiveAt) continue;

      const lastActive = data.lastActiveAt.toDate();
      const daysInactive = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
console.log(`👤 Checking user: ${doc.id} | Days: ${daysInactive}`);
      // --- ఇక్కడి నుండి కొత్త లాజిక్ స్టార్ట్ ---
      let selectedMsg = null;

      if (daysInactive >= 5 && daysInactive < 7) {
        selectedMsg = {
          title: "👋 రైతు సోదరా, బాగున్నారా?",
          body: "చాలా రోజులయ్యింది AgriSnap తెరిచి! మీ వాతావరణం మరియు మార్కెట్ ధరలు ఒకసారి చూడండి.",
          screen: "weather"
        };
      } 
     else if (daysInactive >= 7 && daysInactive < 10) {
        selectedMsg = {
          title: "📈 మీ పంట ధరలు పెరిగాయా?",
          body: "లేటెస్ట్ మార్కెట్ యార్డ్ ధరలు అప్డేట్ అయ్యాయి. ఇప్పుడే చెక్ చేయండి!",
          screen: "market"
        };
      } 
      else if (daysInactive >= 10 && (daysInactive - 10) % 3 === 0) {
        const cycle = Math.floor((daysInactive - 10) / 3);
      const rotation = [
  // 1. Attendance (హాజరు)
  { 
    t: "👥 కూలీల హాజరు వేయండి", 
    b: "ఈరోజు మీ పొలం పనులకు వచ్చిన కూలీల అటెండెన్స్ AgriSnapలో మార్క్ చేయడం మర్చిపోకండి.", 
    s: "attendance" 
  },
  
  // 2. Sales (అమ్మకాలు)
  { 
    t: "💰 పంట అమ్మకాల వివరాలు", 
    b: "మీరు ఈరోజు అమ్మిన పంట వివరాలను, వచ్చిన ఆదాయాన్ని వెంటనే యాప్‌లో నమోదు చేయండి.", 
    s: "sales" 
  },
  
  // 3. Expenses (ఖర్చులు)
  { 
    t: "📒 సాగు ఖర్చుల లెక్క", 
    b: "విత్తనాలు, మందులు మరియు ఇతర పెట్టుబడి ఖర్చులను Expenses సెక్షన్‌లో నోట్ చేసుకోండి.", 
    s: "expenses" 
  },
  
  // 4. News (వార్తలు)
  { 
    t: "📰 నేటి వ్యవసాయ వార్తలు", 
    b: "ప్రభుత్వ నిర్ణయాలు మరియు ఆధునిక సాగు పద్ధతుల గురించి తాజా వార్తలు ఇక్కడ చదవండి.", 
    s: "(tabs)/news" 
  },
  
  // 5. Bookings (యంత్రాల బుకింగ్)
  { 
    t: "🚜 ట్రాక్టర్ కావాలా?", 
    b: "దున్నడానికి లేదా ఇతర పనుల కోసం యంత్రాలు కావాలంటే AgriConnectలో ఇప్పుడే బుక్ చేయండి.", 
    s: "bookings" 
  },
  
  // 6. Weather (వాతావరణం)
  { 
    t: "🌦️ వాతావరణ సమాచారం", 
    b: "వచ్చే మూడు రోజుల్లో మీ ప్రాంతంలో వాతావరణం ఎలా ఉండబోతుందో ఇప్పుడే తెలుసుకోండి.", 
    s: "weather" 
  },
  
  // 7. Market Prices (ధరలు)
  { 
    t: "📈 మార్కెట్ ధరల అప్డేట్", 
    b: "మీ జిల్లాలోని మార్కెట్ యార్డులలో వివిధ పంటలకు ఉన్న తాజా ధరలను చెక్ చేయండి.", 
    s: "market" 
  },
  
  // 8. Summary (సారాంశం)
  { 
    t: "🌾 మీ పంట సారాంశం", 
    b: "ఈ సీజన్ సాగులో మీ పెట్టుబడి, ఆదాయం మరియు లాభాల రిపోర్టును ఒకసారి చూడండి.", 
    s: "summary" 
  },
  
  // 9. Schemes (పథకాలు)
  { 
    t: "💡 రైతులకు కొత్త పథకాలు", 
    b: "ప్రభుత్వం అందిస్తున్న కొత్త సబ్సిడీలు మరియు పథకాల వివరాలు AgriSnapలో సిద్ధంగా ఉన్నాయి.", 
    s: "schemes" 
  },
  
  // 10. Payments (పేమెంట్స్)
  { 
    t: "💸 బాకీల వివరాలు", 
    b: "మీరు ఇతరులకు ఇవ్వాల్సిన లేదా మీకు రావాల్సిన పేమెంట్స్ ఒకసారి సరిచూసుకోండి.", 
    s: "payments" 
  },
  
  // 11. Fields (పొలాలు)
  { 
    t: "🗺️ పొలాల నిర్వహణ", 
    b: "మీ వివిధ పొలాల్లో జరుగుతున్న పనుల వివరాలను ఎప్పటికప్పుడు అప్డేట్ చేయండి.", 
    s: "fields" 
  },
  
];
        const pick = rotation[cycle % rotation.length];
        selectedMsg = { title: pick.t, body: pick.b, screen: pick.s };
      }

      if (!selectedMsg) continue; // ఈ రోజుకి మెసేజ్ ఏదీ లేకపోతే స్కిప్ చేయి
      // --- కొత్త లాజిక్ ఎండ్ ---

      // 🔥 ANTI-SPAM
      const lastSent = data.lastInactiveNotificationSentAt?.toDate();
      if (lastSent) {
        const diff = now.getTime() - lastSent.getTime();
        if (diff < 24 * 60 * 60 * 1000) continue; // 24 hours
      }

        const token = data.fcmToken;
      if (!token) continue;

      try {

        await admin.firestore()
          .collection("users")
          .doc(doc.id)
          .update({
            lastInactiveNotificationSentAt: admin.firestore.FieldValue.serverTimestamp()
          });

        await admin.messaging().send({
          token,
          notification: {
            title: selectedMsg.title,
            body: selectedMsg.body
          },
          data: {
            screen: selectedMsg.screen
          },
          android: {
            priority: "high",
            notification: { channelId: "default", sound: "default" }
          }
        });

        console.log(`📤 Sent to ${doc.id} | Days: ${daysInactive}`);

      } catch (error: any) {

        console.log("❌ Error sending to user:", doc.id, error);

        if (error.code === "messaging/registration-token-not-registered") {
          await admin.firestore()
            .collection("users")
            .doc(doc.id)
            .update({
              fcmToken: null
            });

          console.log("🗑️ Removed invalid token:", doc.id);
        }
      }
    } // 👈 for loop close

    console.log("🔥 Inactive system executed");

  } // 👈 async close
); // 👈 onSchedule close