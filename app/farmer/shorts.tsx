import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import AgriLoader from "@/components/AgriLoader";
import AppText from "@/components/AppText";

const { width, height } = Dimensions.get("window");

const AgriNewsItem = ({ item, language }: any) => {
  const [liked, setLiked] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const heartAnim = useRef(new Animated.Value(0)).current;

  // 🔥 డబుల్ టాప్ లైక్ లాజిక్
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      toggleLike();
    } else {
      setLastTap(now);
    }
  };

  const toggleLike = async () => {
    if (liked) return;
    setLiked(true);

    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    await firestore().collection("agri_news").doc(item.newsId).update({
      likes: firestore.FieldValue.increment(1)
    });
  };

  // 🔥 పక్కా ప్రొఫెషనల్ షేర్ ఆప్షన్
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `AgriLog న్యూస్: ${item.title}\n\nపూర్తి వార్త: ${item.newsUrl}\n\nమరిన్ని వ్యవసాయ వార్తల కోసం AgriLog యాప్ ని వాడండి!`,
      });
      if (result.action === Share.sharedAction) {
        await firestore().collection("agri_news").doc(item.newsId).update({
          shares: firestore.FieldValue.increment(1)
        });
      }
    } catch (error) {
      console.log("Share Error:", error);
    }
  };

  const openFullArticle = () => {
    if (item.newsUrl) {
      Linking.openURL(item.newsUrl);
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleDoubleTap} 
        style={styles.touchArea}
      >
        {/* వెనుక ఫుల్ స్క్రీన్ ఫోటో */}
        <Image 
          source={{ uri: item.imageUrl }} 
          style={StyleSheet.absoluteFillObject} 
          resizeMode="cover" 
        />
        {/* ఇమేజ్ మీద కొద్దిగా డార్క్ లేయర్ (టెక్స్ట్ హైలైట్ అవ్వడానికి) */}
        <View style={styles.darkOverlay} />
      </TouchableOpacity>

      {/* కింద గ్రాడియంట్ మరియు టెక్స్ట్ */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.95)"]}
        style={styles.bottomGradient}
        pointerEvents="none"
      >
        <View style={styles.infoContainer}>
          {/* న్యూస్ పేపర్ పేరు (ఈనాడు/సాక్షి) */}
          <View style={styles.sourceBadge}>
            <AppText style={styles.sourceText} language={language}>{item.source}</AppText>
          </View>
          
          <AppText style={styles.newsTitle} language={language}>
            {item.title}
          </AppText>

          {/* పూర్తి వార్త చదవడానికి బటన్ */}
          <TouchableOpacity style={styles.readMoreBtn} onPress={openFullArticle}>
            <AppText style={styles.readMoreText} language={language}>పూర్తి వార్త చదవండి</AppText>
            <Ionicons name="chevron-forward" size={14} color="#16A34A" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ఇన్‌స్టా స్టైల్ ఐకాన్స్ (కుడివైపు) */}
      <View style={styles.sideIcons}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleLike}>
          <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={34} 
              color={liked ? "#16A34A" : "white"} 
              style={styles.iconShadow}
            />
          </Animated.View>
          <AppText style={styles.iconLabel} language={language}>{item.likes + (liked ? 1 : 0)}</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
          <Ionicons name="paper-plane-outline" size={32} color="white" style={styles.iconShadow} />
          <AppText style={styles.iconLabel} language={language}>Share</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function AgriNewsScreen() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [language, setLanguage] = useState<"te" | "en">("te");
  
  const navigation = useNavigation();

  // 🔥 ట్యాబ్ బార్ హైడ్ చేయడం
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: "none" } });
    }
    return () => {
      if (parent) {
        parent.setOptions({ tabBarStyle: { display: "flex", backgroundColor: "#FFFFFF" } });
      }
    };
  }, [navigation]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const lang = await AsyncStorage.getItem("APP_LANG");
      if (lang) setLanguage(lang as "te" | "en");

      const snapshot = await firestore()
        .collection("agri_news")
        .where("isActive", "==", true)
        .orderBy("addedAt", "desc")
        .limit(20)
        .get();

      const fetched = snapshot.docs.map(doc => ({ ...doc.data() }));
      setNews(fetched);
    } catch (e) {
      console.log("Fetch News Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AgriLoader visible={true} type="loading" />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        data={news}
        keyExtractor={(item) => item.newsId}
        renderItem={({ item }) => (
          <AgriNewsItem item={item} language={language} />
        )}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="newspaper-outline" size={60} color="#4B5563" />
            <AppText style={{ color: '#9CA3AF', marginTop: 15, fontSize: 16, fontFamily: "Mandali" }} language={language}>
              వార్తలు లోడ్ అవుతున్నాయి...
            </AppText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  screenWrapper: { height, width, backgroundColor: "black" },
  touchArea: { flex: 1 },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // ఫోటో మీద లైట్ బ్లాక్ షాడో
  },
  
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%", // టెక్స్ట్ కింద వరకు నీట్ గా షాడో
    paddingHorizontal: 15,
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  infoContainer: { width: "80%" },
  
  sourceBadge: {
    backgroundColor: "#16A34A",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
  },
  sourceText: { color: "white", fontSize: 12, fontWeight: "bold" },
  
  newsTitle: { 
    color: "white", 
    fontSize: 20, // పెద్దగా అట్రాక్టివ్ గా ఉండేలా
    lineHeight: 30, 
    fontFamily: "Mandali",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginBottom: 15,
  },

  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMoreText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 5,
  },
  
  sideIcons: {
    position: "absolute",
    right: 15,
    bottom: 60,
    alignItems: "center",
  },
  iconBtn: { alignItems: "center", marginBottom: 25 },
  iconLabel: { 
    color: "white", 
    fontSize: 12, 
    marginTop: 5, 
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  iconShadow: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  }
});