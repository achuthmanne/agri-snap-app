import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
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

    let tokens: string[] = [];

   if (!data.userId) {
  console.log("❌ userId missing");
  return;
}

// 🌍 GLOBAL
if (data.userId === "all") {

  const users = await admin.firestore()
    .collection("users")
    .get();

  users.forEach(doc => {
    const t = doc.data()?.fcmToken;
    if (t) tokens.push(t);
  });

}

// 👤 PERSONAL
else {

  const userDoc = await admin.firestore()
    .collection("users")
    .doc(data.userId)
    .get();

  const token = userDoc.data()?.fcmToken;

  if (token) tokens.push(token);
}

    if (tokens.length === 0) {
      console.log("❌ No tokens found");
      return;
    }

    console.log("✅ Sending to tokens:", tokens.length);

    await admin.messaging().sendEachForMulticast({
      tokens,

      // 🔔 SYSTEM NOTIFICATION
      notification: {
        title: data.title || "AgriSnap",
        body: data.message || "",
      },

      // 🔥 ANDROID FORCE DELIVERY
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
        },
      },

      // 🔥 iOS (future safe)
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },

      // 🔥 DATA (for click handling)
      data: {
        screen: "notifications",
      },
    });
  }
);