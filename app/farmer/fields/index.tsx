import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal } from "react-native";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

// 🔥 UNIQUE PREMIUM COLORS FOR CROPS (Max 10-12)
const PREM_COLORS = [
  "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", 
  "#EC4899", "#06B6D4", "#F97316", "#84CC16", 
  "#6366F1", "#14B8A6", "#F43F5E", "#EAB308"
];

export default function FieldsScreen() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [language, setLanguage] = useState<"te" | "en">("te");
  const [totalAcres, setTotalAcres] = useState(0);
  const [ownAcres, setOwnAcres] = useState(0);
  const [rentAcres, setRentAcres] = useState(0);
  const [cropStats, setCropStats] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
const [selectedItem, setSelectedItem] = useState<any>(null);
const [deleteVisible, setDeleteVisible] = useState(false);
const [loading, setLoading] = useState(true); // Default loading true
const [soilStats, setSoilStats] = useState<any[]>([]); // 🔥 Soil Stats కోసం

  useEffect(() => {
    AsyncStorage.getItem("APP_LANG").then((l) => { if (l) setLanguage(l as any); });
  }, []);

 useEffect(() => {
  let unsubscribe: any;
  const load = async () => {
    const phone = await AsyncStorage.getItem("USER_PHONE");
    if (!phone) return;
const userDoc = await firestore()
  .collection("users")
  .doc(phone)
  .get();

const activeSession = userDoc.data()?.activeSession;

if (!activeSession) {
  setLoading(false);
  return;
}
    // 🔥 ఇక్కడ క్వెరీ నుండి .where("session") తీసేశా బ్రో 
    // ఎందుకంటే మనం డేటాబేస్ లో ఉన్న యాక్టివ్ సెషన్ ఏంటో ముందే తెలియదు కాబట్టి.
    unsubscribe = firestore()
      .collection("users").doc(phone).collection("fields")
.where("session", "==", activeSession)   // 🔥 ADD THIS LINE
.orderBy("createdAt", "desc")
      
      .onSnapshot((snap) => {
        if (snap && !snap.empty) {
          
          const list: any[] = [];
          let total = 0, own = 0, rent = 0;
          const cropsMap: any = {};
          const soilMap: any = {};

          // 2. ఇప్పుడు ఆ యాక్టివ్ సెషన్ కి సంబంధించిన డేటాని మాత్రమే లూప్ చెయ్
         snap.forEach((doc) => {
  const d: any = doc.data();

  list.push({
    id: doc.id,
    ...d
  });

  // 🔥 total acres
  total += d.acres || 0;

  // 🔥 own / rent split
  if (d.type === "own") {
    own += d.acres || 0;
  } else {
    rent += d.acres || 0;
  }

  // 🔥 crop stats
  if (!cropsMap[d.crop]) {
    cropsMap[d.crop] = 0;
  }
  cropsMap[d.crop] += d.acres || 0;

  // 🔥 soil stats
  if (!soilMap[d.soilType]) {
    soilMap[d.soilType] = 0;
  }
  soilMap[d.soilType] += d.acres || 0;
});
          // 3. స్టేట్స్ అన్నీ అప్‌డేట్ చెయ్
          setData(list);
          setTotalAcres(total);
          setOwnAcres(own);
          setRentAcres(rent);
          
          // Charts Data Formatting
          setSoilStats(Object.keys(soilMap).map((name, index) => ({
            name, population: soilMap[name],
            color: PREM_COLORS[(index + 4) % PREM_COLORS.length],
            legendFontColor: "#475569", legendFontSize: 12
          })));

          setCropStats(Object.keys(cropsMap).map((name, index) => ({
            name, population: cropsMap[name],
            color: PREM_COLORS[index % PREM_COLORS.length],
            legendFontColor: "#475569", legendFontSize: 12
          })));

        } else {
          // డేటా అసలు లేకపోతే
          setData([]);
        }
        setLoading(false);
      }, (err) => setLoading(false));
  };

  load();
  return () => unsubscribe && unsubscribe();
}, [language]); // language మారినప్పుడు రీ-లోడ్ అవ్వాలి
  
const PremiumDonutChart = ({ chartData, title }: any) => (
  <Animated.View entering={FadeInDown.delay(500)} style={styles.chartBox}>
    <AppText style={styles.sectionTitle}>{title}</AppText>
    
    <View style={styles.chartRowWrapper}>
      {/* 🍩 డోనట్ చార్ట్ - సేమ్ టు సేమ్ అలాగే ఉంది బ్రో */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <PieChart
          data={chartData.map((d: any) => ({ ...d, name: "" }))}
          width={screenWidth / 2}
          height={200}
          chartConfig={{ color: (opacity = 1) => `rgba(0,0,0, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"48"}
          hasLegend={false}
          absolute
        />
        <View style={styles.donutHole}>
          <AppText style={styles.donutText}>
            {Math.round((chartData.reduce((a: any, b: any) => a + b.population, 0) / totalAcres) * 100) || 0}%
          </AppText>
        </View>
      </View>

      {/* 🔥 ఇక్కడ మార్పు చేశా బ్రో: నేమ్స్ అన్నీ నీట్ గా లైన్ గా వస్తాయి */}
      <View style={styles.modernLegendContainer}>
        <ScrollView 
          style={{ maxHeight: 180 }} 
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {chartData.map((item: any, index: number) => {
            const perc = Math.round((item.population / (totalAcres || 1)) * 100);
            return (
              <View key={index} style={styles.modernLegendRow}>
                {/* రంగు చుక్క */}
                <View style={[styles.modernDot, { backgroundColor: item.color }]} />
                
                <View style={styles.modernTextWrapper}>
                  {/* పంట పేరు */}
                  <AppText style={styles.modernNameText} numberOfLines={1}>
                    {item.name}
                  </AppText>
                  
                  {/* పర్సంటేజీ మరియు ఎకరాలు - నీట్ గా చిన్నగా కింద కనిపిస్తాయి */}
                  <AppText style={styles.modernValueText}>
                    {perc}% | {item.population} {language==='te'? "ఎకరాలు" : 'Acres'}
                  </AppText>
                  
                  {/* ఒక సన్నని గీత (Indicator Line) */}
                  <View style={styles.modernUnderline}>
                     <View style={[styles.modernFill, { width: `${perc}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  </Animated.View>
);
  // 🔥 CUSTOM LEGEND COMPONENT (ప్రీమియం లుక్ కోసం)
  const RenderLegend = ({ name,  color }: any) => (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <AppText style={styles.legendName}>{name}</AppText>
      </View>
    </View>
  );

  const ownershipData = [
    { 
        name: language === "te" ? "సొంతం (%)" : "Own (%)", 
        population: ownAcres, 
        color: "#10B981", 
        legendFontColor: "#475569", 
        legendFontSize: 12 
    },
    { 
        name: language === "te" ? "కౌలు (%)" : "Rent (%)", 
        population: rentAcres, 
        color: "#F59E0B", 
        legendFontColor: "#475569", 
        legendFontSize: 12 
    }
  ];

  // 🎨 1. SHIMMER LOADING COMPONENT
const ShimmerLoader = () => {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.shimmerCard}>
          {/* ఎడమ వైపున ఉండే చిన్న కలర్ బార్ కోసం */}
          <View style={styles.shimmerSideBar} />
          
          <View style={styles.fieldInfo}>
            {/* పంట పేరు కోసం షిమ్మర్ లైన్ */}
            <View style={styles.shimmerLineTitle} />
            {/* ఎకరాల వివరాల కోసం షిమ్మర్ లైన్ */}
            <View style={styles.shimmerLineSub} />
          </View>

          <View style={styles.cardRightSection}>
             {/* ప్రైస్ సెక్షన్ కోసం ఒక బాక్స్ */}
            <View style={styles.shimmerPriceBox} />
            {/* మెనూ ఐకాన్ కోసం ఒక చిన్న సర్కిల్ */}
            <View style={styles.shimmerMenuCircle} />
          </View>
        </View>
      ))}
    </View>
  );
};

// 📭 2. EMPTY STATE COMPONENT
const EmptyState = ({ language }: { language: string }) => (
  <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
    <View style={styles.emptyIconBg}>
      <Ionicons name="leaf-outline" size={50} color="#10B981" />
    </View>
    <AppText style={styles.emptyTitle}>
      {language === "te" ? "పొలాలు లేవు" : "No Fields Added"}
    </AppText>
    <AppText style={styles.emptySub}>
      {language === "te" 
        ? "మీరు ఇంకా ఏ పొలం వివరాలను జోడించలేదు. కింద ఉన్న '+' బటన్ నొక్కి జోడించండి." 
        : "You haven't added any field details yet. Tap the '+' button to start."}
    </AppText>
  </Animated.View>
);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <AppHeader
        title={language === "te" ? "నా పొలాలు" : "My Fields"}
        subtitle={language === "te" ? "విశ్లేషణ & వివరాలు" : "Analytics & Details"}
        language={language}
      />
<ScrollView 
  showsVerticalScrollIndicator={false} 
  // 🔥 డేటా లేనప్పుడు సెంటర్ అయ్యేలా ఈ కండిషన్ వాడు బ్రో
  contentContainerStyle={[
    { paddingBottom: 120 },
    data.length === 0 && !loading && { flex: 1, justifyContent: 'center' }
  ]}
>
  {loading ? (
    <ShimmerLoader />
  ) : data.length === 0 ? (
    <EmptyState language={language} /> // ఇప్పుడు ఇది కరెక్ట్ గా సెంటర్ లో ఉంటుంది
  ) : (
    <>


       <LinearGradient colors={["#53143d", "#2e0513"]} style={styles.mainCard}>
  <AppText style={styles.cardLabel}>{language === "te" ? "మొత్తం సాగు భూమి" : "Total Cultivated Area"}</AppText>
  <AppText style={styles.cardValue}>{totalAcres} <AppText style={{fontSize: 18, color: '#ef86e4'}}>{language === "te" ? "ఎకరాలు" : "Acres"}</AppText></AppText>

  {/* 🔥 GLASS EFFECT ROW START */}
  <View style={styles.glassRow}>
    {/* OWN LAND BOX */}
    <View style={styles.glassBox}>
      <View style={[styles.glassIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
        <Ionicons name="leaf" size={16} color="#10B981" />
      </View>
      <View>
        <AppText style={styles.glassLabel}>{language === "te" ? "సొంతం" : "Own"}</AppText>
        <AppText style={styles.glassValue}>{ownAcres} <AppText style={styles.glassUnit}>{language === "te" ? "ఎకరాలు" : "Acres"}</AppText></AppText>
      </View>
    </View>

    {/* RENT LAND BOX */}
    <View style={styles.glassBox}>
      <View style={[styles.glassIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
        <Ionicons name="business" size={16} color="#F59E0B" />
      </View>
      <View>
        <AppText style={styles.glassLabel}>{language === "te" ? "కౌలు" : "Rent"}</AppText>
        <AppText style={styles.glassValue}>{rentAcres} <AppText style={styles.glassUnit}>{language === "te" ? "ఎకరాలు" : "Acres"}</AppText></AppText>
      </View>
    </View>
  </View>
  {/* 🔥 GLASS EFFECT ROW END */}

  <View style={styles.divider} />
  
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {cropStats.map((item, index) => (
      <View key={index} style={styles.miniChip}>
        <View style={[styles.dot, { backgroundColor: item.color }]} />
        <AppText style={styles.chipText}>{item.name}: {item.population} {language === "te" ? "ఎకరాలు" : "Acres"}</AppText>
      </View>
    ))}
  </ScrollView>
  
</LinearGradient>

      {/* 📊 PIE CHARTS (డేటా ఉన్నప్పుడే చూపించు) */}
      <View style={styles.chartsRow}>
          
        {/* 📊 1. OWNERSHIP ANALYTICS (NEW SEMI-DONUT MODEL) */}
<Animated.View entering={FadeInDown.delay(200)} style={styles.chartBox}>
  <AppText style={styles.sectionTitle}>
    {language === "te" ? "భూమి యాజమాన్యం" : "Land Ownership"}
  </AppText>

  <View style={styles.semiChartWrapper}>
    <PieChart
      data={ownershipData.map(d => ({ ...d, name: "" }))}
      width={screenWidth * 0.9} // విడ్త్ పెంచితే సెంటర్ కి వస్తుంది
      height={220}
      chartConfig={{
        color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
      }}
      accessor={"population"}
      backgroundColor={"transparent"}
      paddingLeft={"88"} // సెంటరింగ్ కోసం
      hasLegend={false}
      absolute
    />
    
    {/* 🔥 SEMI-CIRCLE EFFECT & OVERLAY */}
    <View style={styles.semiHole}>
        <Ionicons name="location" size={24} color="#6366F1" style={{marginBottom: 4}} />
        <AppText style={styles.semiValueText}>{totalAcres}</AppText>
        <AppText style={styles.semiLabelText}>{language === 'te' ? 'మొత్తం ఎకరాలు' : 'Total Acres'}</AppText>
    </View>
  </View>

  {/* కింద నీట్ గా లెజెండ్స్ */}
  <View style={styles.semiLegendRow}>
    {ownershipData.map((item, index) => (
      <View key={index} style={styles.semiLegendItem}>
        <View style={[styles.legendDot, { backgroundColor: item.color, width: 12, height: 12 }]} />
        <View>
          <AppText style={styles.legendName}>{item.name.replace(" (%)", "")}</AppText>
        </View>
      </View>
    ))}
  </View>
</Animated.View>

          {/* 🌾 2. CROP DISTRIBUTION CHART */}
         <Animated.View entering={FadeInDown.delay(400)} style={styles.chartBox}>
  <AppText style={styles.sectionTitle}>
    {language === "te" ? "పంటల వారీగా వివరాలు" : "Crop-wise Distribution"}
  </AppText>
  
  {/* చార్ట్‌ని పైన సెంటర్‌లో ఉంచుదాం */}
  <View style={styles.centerChartWrapper}>
    <PieChart
      data={cropStats.map(d => ({ ...d, name: "" }))} 
      width={screenWidth - 60} // ఫుల్ విడ్త్ ఇస్తే చార్ట్ సెంటర్ అవుతుంది
      height={200}
      chartConfig={{ color: (opacity = 1) => `rgba(0,0,0, ${opacity})` }}
      accessor={"population"}
      backgroundColor={"transparent"}
      paddingLeft={(screenWidth / 4).toString()} // పక్కా సెంటర్ కోసం
      hasLegend={false}
    />
  </View>

  {/* 🔥 GRID LEGEND: ఇక్కడ పంటల పేర్లు అన్నీ గ్రిడ్ లాగా వస్తాయి */}
  <View style={styles.gridLegendContainer}>
    {cropStats.map((item, index) => (
      <View key={index} style={styles.gridLegendItem}>
        <View style={[styles.gridDot, { backgroundColor: item.color }]} />
        <View style={styles.gridTextWrapper}>
          <AppText style={styles.gridName} numberOfLines={1}>{item.name}</AppText>
        </View>
      </View>
    ))}
  </View>
</Animated.View>
{/* 📊 3. SOIL TYPE ANALYSIS (DONUT) */}
<PremiumDonutChart 
  chartData={soilStats} 
  title={language === "te" ? "నేల రకాల విశ్లేషణ" : "Soil Type Analytics"} 
/>
        </View>



        {/* 📋 RENTAL & FIELD CARDS - LIST HEADING */}
        <AppText style={styles.listHeading}>
          {language === "te" ? "పొలాల పూర్తి వివరాలు" : "Detailed Field List"}
        </AppText>

        <View style={{ paddingHorizontal: 16 }}>
          {data.map((item, index) => {
            const cropColor = PREM_COLORS[index % PREM_COLORS.length];
            return (
             <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)} style={styles.fieldCard}>
  <View style={[styles.sideBar, { backgroundColor: cropColor }]} />
  
  <View style={styles.fieldInfo}>
    <AppText style={styles.cropName}>{item.crop}</AppText>
    <AppText style={styles.fieldMeta}>
      {item.acres} {language === "te" ? "ఎకరాలు" : "Acres"} | 
      <AppText style={{ color: item.type === 'own' ? '#10B981' : '#F59E0B', fontWeight: '600' }}>
          {item.type === 'own' ? (language === 'te' ? ' సొంతం' : ' OWN') : (language === 'te' ? ' కౌలు' : ' RENT')}
      </AppText>
    </AppText>
  </View>

  <View style={styles.cardRightSection}>
    {item.type === 'rent' && (
      <View style={styles.priceContainer}>
        <AppText style={styles.rentPrice}>₹{item.rent.toLocaleString('en-IN')}</AppText>
        <AppText style={styles.rentUnit}>{language === 'te' ? 'సంవత్సరానికి' : 'PER YEAR'}</AppText>
      </View>
    )}
    
    {/* 🔥 MENU ICON */}
    <TouchableOpacity 
      style={styles.menuBtn} 
      onPress={() => {
        setSelectedItem(item);
        setMenuVisible(true);
      }}
    >
      <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
    </TouchableOpacity>
  </View>
</Animated.View>
            );
          
          })}
       </View>
    </>
  )}
</ScrollView>
{/* 🛠️ EDIT/DELETE MENU */}
<Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
  <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
    <View style={styles.menuContent}>
      <AppText style={styles.menuHeader}>{selectedItem?.crop}</AppText>
      
      <TouchableOpacity 
  style={styles.menuItem} 
  onPress={() => {
    // ఇక్కడ చెక్ చేయాలి బ్రో
    if (selectedItem?.id) {
      const id = selectedItem.id;
      setMenuVisible(false);
      router.push({ 
        pathname: "/farmer/fields/add-field", 
        params: { editId: id } 
      });
    }
  }}
>
        <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
        <AppText style={styles.menuText}>{language === "te" ? "సవరించండి" : "Edit Details"}</AppText>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => {
        setMenuVisible(false);
        setDeleteVisible(true);
      }}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <AppText style={[styles.menuText, { color: '#EF4444' }]}>{language === "te" ? "తొలగించండి" : "Delete Field"}</AppText>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

{/* 🗑️ DELETE CONFIRMATION */}
<Modal visible={deleteVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.deleteBox}>
      <View style={styles.deleteIconBg}><Ionicons name="trash" size={30} color="#DC2626" /></View>
      <AppText style={styles.deleteTitle}>{language === "te" ? "తొలగించాలా?" : "Delete Field?"}</AppText>
      <AppText style={styles.deleteSub}>{language === "te" ? "ఈ పొలం వివరాలు శాశ్వతంగా తొలగించబడతాయి." : "This field record will be permanently removed."}</AppText>
      
      <View style={styles.deleteBtns}>
        <TouchableOpacity activeOpacity={0.8} style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}>
          <AppText style={styles.cancelBtnText}>{language === "te" ? "వద్దు" : "Cancel"}</AppText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.confirmDeleteBtn} onPress={async () => {
          const phone = await AsyncStorage.getItem("USER_PHONE");
          if (phone && selectedItem) {
            await firestore().collection("users").doc(phone).collection("fields").doc(selectedItem.id).delete();
          }
          setDeleteVisible(false);
        }}>
          <AppText style={styles.confirmDeleteText}>{language === "te" ? "తొలగించు" : "Delete"}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      {/* 🔥 PREMIUM FLOATING ACTION BUTTON */}
      <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={() => router.push("/farmer/fields/add-field")}>
        <LinearGradient colors={["#16A34A", "#064E3B"]} style={styles.fabGradient}>
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  glassBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glass Effect
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 10,
  },
  glassIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  glassValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  glassUnit: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  // Header Stats
  mainCard: { margin: 16, padding: 20, borderRadius: 24 },
  cardLabel: { color: "#f7bbe4", fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  cardValue: { color: "#fff", fontSize: 32, fontWeight: "600", marginTop: 5 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 15 },
  
  miniChip: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', 
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8 
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  chipText: { color: "#E2E8F0", fontSize: 12, fontWeight: '600' },
chartRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // సెంటర్ కోసం
    width: '100%',
  },
  pieContainer: {
    flex: 1.2, // చార్ట్ కి కొంచెం ఎక్కువ స్పేస్
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -15, // లైబ్రరీ డీఫాల్ట్ గ్యాప్ ని కవర్ చేయడానికి
  },
  legendWrapper: {
    flex: 0.8, // లెజెండ్స్ కి తగినంత స్పేస్
    paddingLeft: 5,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendName: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  legendTotalValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
    opacity: 0.7
  },
  chartBox: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginBottom: 16,
    // alignItems: 'center' ని తీసేయండి ఇక్కడ, RowWrapper చూసుకుంటుంది
  },
  // Charts
  chartsRow: { paddingHorizontal: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 10 },

  // Field Cards
  listHeading: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginHorizontal: 20, marginVertical: 15 },
  fieldCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  sideBar: { width: 5, height: '100%' },
  fieldInfo: { flex: 1, padding: 16 },
  cropName: { fontSize: 18, fontWeight: '600', color: '#334155' },
  fieldMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  priceContainer: { alignItems: 'flex-end', paddingRight: 10 },
  rentPrice: { fontSize: 16, fontWeight: '600', color: '#166534' },
  rentUnit: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },
  actionBtn: { paddingRight: 12 },

  legendContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  cardRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    gap: 10
  },
  menuBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  menuHeader: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  
  deleteBox: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 25, alignItems: 'center' },
  deleteIconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  deleteTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B' },
  deleteSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 25 },
  deleteBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 14 },
  confirmDeleteBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#DC2626', borderRadius: 14 },
  cancelBtnText: { fontWeight: '600', color: '#475569' },
  confirmDeleteText: { fontWeight: '600', color: '#fff' },
  // FAB
  fab: { position: "absolute", bottom: 30, right: 20 },
  fabGradient: { width: 64, height: 64, borderRadius: 35, justifyContent: "center", alignItems: "center" },
  // 🔥 EMPTY STATE STYLES
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  // 🔥 PRODUCTION SHIMMER STYLES
  shimmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 85, // ఒరిజినల్ కార్డ్ హైట్ తో మ్యాచ్ చేశా బ్రో
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    opacity: 0.6
  },
  shimmerSideBar: {
    width: 5,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  shimmerLineTitle: {
    width: '60%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8
  },
  shimmerLineSub: {
    width: '40%',
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 4
  },
  shimmerPriceBox: {
    width: 50,
    height: 30,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginRight: 10
  },
  shimmerMenuCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 8
  },
  donutHole: {
  position: 'absolute',
  width: 90,
  height: 90,
  borderRadius: 50,
  backgroundColor: '#fff', // చార్ట్ సెంటర్‌లో వైట్ సర్కిల్
  justifyContent: 'center',
  alignItems: 'center',
  // ఒక చిన్న షాడో ఇస్తే రిచ్ గా ఉంటుంది
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
},
donutText: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#1E293B',
},
semiChartWrapper: {
    height: 160, // హైట్ తగ్గించి క్రాప్ చేస్తే సెమీ సర్కిల్ లా కనిపిస్తుంది
    overflow: 'hidden', // ఇది ముఖ్యం బ్రో, కింద పార్ట్ కట్ చేస్తుంది
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
  },
  semiHole: {
    position: 'absolute',
    bottom: -20, // కిందకి లాక్ చేయడం వల్ల సెమీ సర్కిల్ లుక్ వస్తుంది
    width: 130,
    height: 125,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  semiValueText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  semiLabelText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  semiLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
  },
  semiLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  centerChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  gridLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // ఇది ఉంటేనే ఐటమ్స్ పక్కపక్కకి వస్తాయి
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginTop: 10,
    gap: 10,
  },
  gridLegendItem: {
    width: (screenWidth - 100) / 2, // ఒక లైన్ లో రెండు ఐటమ్స్ వచ్చేలా
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', // చిన్న బాక్స్ లాంటి ఫీల్ కోసం
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  gridTextWrapper: {
    flex: 1,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  gridValue: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  modernLegendContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  modernLegendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 5,
  },
  modernDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 8,
  },
  modernTextWrapper: {
    flex: 1,
  },
  modernNameText: {
    marginTop: -7,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textTransform: 'capitalize',
  },
  modernValueText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  modernUnderline: {
    height: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 1,
    marginTop: 4,
    width: '90%',
  },
  modernFill: {
    height: '100%',
    borderRadius: 1,
    opacity: 0.8,
  },
 sessionAdvancedWrapper: {
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 8,
  },
  sessionMainContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: 90,
    alignItems: 'center',
    // షాడోస్ తీసేసి సన్నని బార్డర్ వాడదాం (Neat look)
    borderWidth: 1.2,
    borderColor: '#F1F5F9', 
    overflow: 'hidden',
  },
  accentBar: {
    width: 6,
    height: '40%', // ఫుల్ కాకుండా మధ్యలో చిన్న బార్
    backgroundColor: '#16A34A',
    borderRadius: 10,
    marginLeft: 15,
  },
  sessionContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },

  sessionSmallTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000', // Muted slate color
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sessionMainYear: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', // Very light grey
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 6,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusSide: {
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    // Soft Red Glow - ఎలివేషన్ కి బదులు ఇది అడ్వాన్స్‌డ్ గా ఉంటుంది
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  powerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});