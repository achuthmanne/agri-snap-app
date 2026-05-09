// app/farmer/fields/index.tsx

import AppHeader from "@/components/AppHeader";
import AppText from "@/components/AppText";
import AppEmptyState from "@/components/AppEmptyState";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import Animated, { FadeInDown } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

// 🔥 UNIQUE PREMIUM COLORS FOR CROPS
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
  const [loading, setLoading] = useState(true); 
  const [soilStats, setSoilStats] = useState<any[]>([]); 

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

      unsubscribe = firestore()
        .collection("users").doc(phone).collection("fields")
        .where("session", "==", activeSession)
        .where("createdAt", "!=", null)  
        .orderBy("createdAt", "desc")
        .onSnapshot((snap) => {
          if (snap && !snap.empty) {
            const list: any[] = [];
            let total = 0, own = 0, rent = 0;
            const cropsMap: any = {};
            const soilMap: any = {};

            snap.forEach((doc) => {
              const d: any = doc.data();
              list.push({ id: doc.id, ...d });

              // 🔥 FIX 1: ఎకరాలు String లా వచ్చినా Number కి మారుస్తున్నాం
              const acres = Number(d.acres) || 0; 

              total += acres;

              if (d.type === "own") {
                own += acres;
              } else {
                rent += acres;
              }

              const cropName = d.crop || "Others";
              if (!cropsMap[cropName]) cropsMap[cropName] = 0;
              cropsMap[cropName] += acres;

              const soilName = d.soilType || "Others";
              if (!soilMap[soilName]) soilMap[soilName] = 0;
              soilMap[soilName] += acres;
            });

            setData(list);
            setTotalAcres(total);
            setOwnAcres(own);
            setRentAcres(rent);
            
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
            setData([]);
          }
          setLoading(false);
        }, (err) => setLoading(false));
    };

    load();
    return () => unsubscribe && unsubscribe();
  }, [language]); 
  
  const PremiumDonutChart = ({ chartData, title }: any) => {
    // 🔥 FIX 2: డేటా లేనప్పుడు క్రాష్ అవ్వకుండా Dummy Safe Data
    const totalPop = chartData.reduce((a: any, b: any) => a + Number(b.population), 0);
    const safeData = totalPop > 0 ? chartData : [{ name: "No Data", population: 1, color: "#E5E7EB" }];

    return (
      <Animated.View entering={FadeInDown.delay(500)} style={styles.chartBox}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        
        <View style={styles.chartRowWrapper}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <PieChart
              data={safeData.map((d: any) => ({ ...d, name: "" }))}
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
                {Math.round((totalPop / (totalAcres || 1)) * 100) || 0}%
              </AppText>
            </View>
          </View>

          <View style={styles.modernLegendContainer}>
            <ScrollView 
              style={{ maxHeight: 180 }} 
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {chartData.map((item: any, index: number) => {
                const perc = Math.round((Number(item.population) / (totalAcres || 1)) * 100) || 0;
                return (
                  <View key={index} style={styles.modernLegendRow}>
                    <View style={[styles.modernDot, { backgroundColor: item.color }]} />
                    <View style={styles.modernTextWrapper}>
                      <AppText style={styles.modernNameText} numberOfLines={1}>{item.name}</AppText>
                      <AppText style={styles.modernValueText}>
                        {perc}% | {item.population} {language==='te'? "ఎకరాలు" : 'Acres'}
                      </AppText>
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
  };

  const ownershipData = [
    { name: language === "te" ? "సొంతం (%)" : "Own (%)", population: ownAcres, color: "#10B981", legendFontColor: "#475569", legendFontSize: 12 },
    { name: language === "te" ? "కౌలు (%)" : "Rent (%)", population: rentAcres, color: "#F59E0B", legendFontColor: "#475569", legendFontSize: 12 }
  ];

  // 🔥 FIX 3: Safe data for the top ownership PieChart
  const safeOwnershipData = (ownAcres + rentAcres) > 0 
    ? ownershipData.map(d => ({ ...d, name: "" })) 
    : [{ population: 1, color: "#E5E7EB", name: "" }];

  // 🔥 FIX 4: Safe data for the crop distribution PieChart
  const safeCropStats = totalAcres > 0 && cropStats.length > 0
    ? cropStats.map(d => ({ ...d, name: "" }))
    : [{ population: 1, color: "#E5E7EB", name: "" }];

  const ShimmerLoader = () => {
    return (
      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.shimmerCard}>
            <View style={styles.shimmerSideBar} />
            <View style={styles.shimmerContent}>
              <View style={styles.shimmerLineTitle} />
              <View style={styles.shimmerLineSub} />
            </View>
            <View style={styles.shimmerRight}>
              <View style={styles.shimmerPriceBox} />
              <View style={styles.shimmerMenuCircle} />
            </View>
          </View>
        ))}
      </View>
    );
  };

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
        contentContainerStyle={[
          { paddingBottom: 120 },
          data.length === 0 && !loading && { flex: 1, justifyContent: 'center' }
        ]}
      >
        {loading ? (
          <ShimmerLoader />
        ) : data.length === 0 ? (
          <AppEmptyState
            iconName="leaf-outline"
            title={language === "te" ? "పొలాలు లేవు" : "No Fields Added"}
            subtitle={language === "te" 
              ? "మీరు ఇంకా ఏ పొలం వివరాలను జోడించలేదు. కింద ఉన్న '+' బటన్ నొక్కి జోడించండి." 
              : "You haven't added any field details yet. Tap the '+' button to start."}
            language={language}
          />
        ) : (
          <>
             <LinearGradient colors={["#53143d", "#2e0513"]} style={styles.mainCard}>
                <AppText style={styles.cardLabel}>{language === "te" ? "మొత్తం సాగు భూమి" : "Total Cultivated Area"}</AppText>
                <AppText style={styles.cardValue}>{totalAcres} <AppText style={{fontSize: 18, color: '#ef86e4'}}>{language === "te" ? "ఎకరాలు" : "Acres"}</AppText></AppText>

                <View style={styles.glassRow}>
                  <View style={styles.glassBox}>
                    <View style={[styles.glassIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Ionicons name="leaf" size={16} color="#10B981" />
                    </View>
                    <View>
                      <AppText style={styles.glassLabel}>{language === "te" ? "సొంతం" : "Own"}</AppText>
                      <AppText style={styles.glassValue}>{ownAcres} <AppText style={styles.glassUnit}>{language === "te" ? "ఎకరాలు" : "Acres"}</AppText></AppText>
                    </View>
                  </View>

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

            <View style={styles.chartsRow}>
                <Animated.View entering={FadeInDown.delay(200)} style={styles.chartBox}>
                  <AppText style={styles.sectionTitle}>
                    {language === "te" ? "భూమి యాజమాన్యం" : "Land Ownership"}
                  </AppText>
                  <View style={styles.semiChartWrapper}>
                    <PieChart
                      data={safeOwnershipData}
                      width={screenWidth * 0.9} 
                      height={220}
                      chartConfig={{ color: (opacity = 1) => `rgba(0,0,0, ${opacity})` }}
                      accessor={"population"}
                      backgroundColor={"transparent"}
                      paddingLeft={"88"} 
                      hasLegend={false}
                      absolute
                    />
                    <View style={styles.semiHole}>
                        <Ionicons name="location" size={24} color="#6366F1" style={{marginBottom: 4}} />
                        <AppText style={styles.semiValueText}>{totalAcres}</AppText>
                        <AppText style={styles.semiLabelText}>{language === 'te' ? 'మొత్తం ఎకరాలు' : 'Total Acres'}</AppText>
                    </View>
                  </View>
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

                <Animated.View entering={FadeInDown.delay(400)} style={styles.chartBox}>
                  <AppText style={styles.sectionTitle}>
                    {language === "te" ? "పంటల వారీగా వివరాలు" : "Crop-wise Distribution"}
                  </AppText>
                  <View style={styles.centerChartWrapper}>
                    <PieChart
                      data={safeCropStats} 
                      width={screenWidth - 60} 
                      height={200}
                      chartConfig={{ color: (opacity = 1) => `rgba(0,0,0, ${opacity})` }}
                      accessor={"population"}
                      backgroundColor={"transparent"}
                      paddingLeft={(screenWidth / 4).toString()} 
                      hasLegend={false}
                    />
                  </View>
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

                <PremiumDonutChart chartData={soilStats} title={language === "te" ? "నేల రకాల విశ్లేషణ" : "Soil Type Analytics"} />
            </View>

            <AppText style={styles.listHeading}>{language === "te" ? "పొలాల పూర్తి వివరాలు" : "Detailed Field List"}</AppText>

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

      <Modal visible={menuVisible} transparent animationType="none" onRequestClose={() => { setMenuVisible(false); setSelectedItem(null); }}>
        <TouchableWithoutFeedback onPress={() => { setMenuVisible(false); setSelectedItem(null); }}>
          <View style={styles.modalOverlay}>
            {selectedItem ? (
              <View style={styles.menuContent}>
                <AppText style={styles.menuHeader}>
                  {selectedItem.crop} - {selectedItem.category || "Field"}
                </AppText>
                
                {/* 🔥 FIX 5: Modal Navigation Safety (setTimeout) */}
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => {
                    const id = selectedItem.id; 
                    setMenuVisible(false);
                    setSelectedItem(null);
                    
                    // మోడల్ క్లోజ్ అయ్యి రూటింగ్ స్మూత్ గా జరగడానికి చిన్న గ్యాప్
                    setTimeout(() => {
                      router.push({ 
                        pathname: "/farmer/fields/add-field", 
                        params: { editId: id } 
                      });
                    }, 100); 
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
                  <AppText style={styles.menuText}>
                    {language === "te" ? "సవరించండి" : "Edit Record"}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.menuItem, { borderBottomWidth: 0 }]} 
                  onPress={() => {
                    setMenuVisible(false);
                    setDeleteVisible(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <AppText style={[styles.menuText, { color: '#EF4444' }]}>
                    {language === "te" ? "తొలగించండి" : "Delete Record"}
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={deleteVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.deleteBox}>
            <View style={styles.iconBg}>
              <Ionicons name="trash-outline" size={32} color="#DC2626" />
            </View>
            <AppText style={styles.deleteTitle}>{language === "te" ? "తొలగించాలా?" : "Delete Field?"}</AppText>
            <AppText style={styles.deleteSub}>
              {language === "te" ? "ఈ రికార్డ్ శాశ్వతంగా తొలగించబడుతుంది" : "This record will be permanently deleted"}
            </AppText>
            <View style={styles.deleteBtns}>
              <TouchableOpacity activeOpacity={0.8} style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}>
                <AppText style={styles.cancelText}>{language === "te" ? "వద్దు" : "Cancel"}</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={async () => {
                  const phone = await AsyncStorage.getItem("USER_PHONE");
                  if (phone && selectedItem) {
                    await firestore().collection("users").doc(phone).collection("fields").doc(selectedItem.id).delete();
                  }
                  setDeleteVisible(false);
                  setSelectedItem(null);
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <AppText style={styles.deleteText}>{language === "te" ? "తొలగించు" : "Delete"}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  glassRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  glassBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', gap: 10 },
  glassIconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  glassLabel: { fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500', textTransform: 'uppercase' },
  glassValue: { fontSize: 16, color: '#fff', fontWeight: '700' },
  glassUnit: { fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: '400' },
  mainCard: { margin: 16, padding: 20, borderRadius: 24 },
  cardLabel: { color: "#f7bbe4", fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  cardValue: { color: "#fff", fontSize: 32, fontWeight: "600", marginTop: 5 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 15 },
  miniChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  chipText: { color: "#E2E8F0", fontSize: 12, fontWeight: '600' },
  chartRowWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  chartBox: { backgroundColor: '#fff', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  chartsRow: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 10 },
  listHeading: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginHorizontal: 20, marginVertical: 15 },
  fieldCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  sideBar: { width: 5, height: '100%' },
  fieldInfo: { flex: 1, padding: 16 },
  cropName: { fontSize: 18, fontWeight: '600', color: '#334155' },
  fieldMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  priceContainer: { alignItems: 'flex-end', paddingRight: 10 },
  rentPrice: { fontSize: 16, fontWeight: '600', color: '#166534' },
  rentUnit: { fontSize: 9, color: '#94A3B8', fontWeight: '600' },
  cardRightSection: { flexDirection: 'row', alignItems: 'center', paddingRight: 8, gap: 10 },
  menuBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center" },
  menuContent: { width: "80%", backgroundColor: "#fff", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#E5E7EB" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  deleteBox: { width: "80%", backgroundColor: "#fff", borderRadius: 18, padding: 20, alignItems: "center" },
  iconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  deleteTitle: { fontSize: 16, fontWeight: "600" },
  deleteSub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 6 },
  menuHeader: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 15, textAlign: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#1e293b' },
  deleteBtns: { flexDirection: "row", marginTop: 20, gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  deleteBtn: { flex: 1, flexDirection: "row", gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: "#DC2626", alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  fab: { position: "absolute", bottom: 30, right: 20 },
  fabGradient: { width: 64, height: 64, borderRadius: 35, justifyContent: "center", alignItems: "center" },
  shimmerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  shimmerSideBar: { width: 5, height: '100%', backgroundColor: '#E2E8F0' },
  shimmerContent: { flex: 1, padding: 16 },
  shimmerLineTitle: { width: '55%', height: 18, backgroundColor: '#E2E8F0', borderRadius: 6, marginBottom: 8 },
  shimmerLineSub: { width: '40%', height: 12, backgroundColor: '#F1F5F9', borderRadius: 6 },
  shimmerRight: { flexDirection: 'row', alignItems: 'center', paddingRight: 10, gap: 10 },
  shimmerPriceBox: { width: 55, height: 30, backgroundColor: '#F1F5F9', borderRadius: 8 },
  shimmerMenuCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9' },
  donutHole: { position: 'absolute', width: 90, height: 90, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  donutText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  semiChartWrapper: { height: 160, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start', marginTop: -20 },
  semiHole: { position: 'absolute', bottom: -20, width: 130, height: 125, borderRadius: 75, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  semiValueText: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  semiLabelText: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  semiLegendRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingTop: 15 },
  semiLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendName: { fontSize: 14, color: '#475569', fontWeight: '500' },
  centerChartWrapper: { alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 10 },
  gridLegendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 5, marginTop: 10, gap: 10 },
  gridLegendItem: { width: (screenWidth - 100) / 2, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  gridDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  gridTextWrapper: { flex: 1 },
  gridName: { fontSize: 13, fontWeight: '600', color: '#334155' },
  modernLegendContainer: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  modernLegendRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingRight: 5 },
  modernDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 8 },
  modernTextWrapper: { flex: 1 },
  modernNameText: { marginTop: -7, fontSize: 15, fontWeight: '600', color: '#334155', textTransform: 'capitalize' },
  modernValueText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginTop: 1 },
  modernUnderline: { height: 3, backgroundColor: '#F1F5F9', borderRadius: 1, marginTop: 4, width: '90%' },
  modernFill: { height: '100%', borderRadius: 1, opacity: 0.8 },
});