//expenses/index.tsx
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
  FlatList, Modal, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, TouchableOpacity, View
} from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

// 🔥 REANIMATED తో SUPER SMOOTH COUNT UP (No Lag)
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { TextInput } from "react-native"; // We animate a hidden TextInput for the number

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedText = Animated.createAnimatedComponent(TextInput);

export default function ExpensesScreen() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState<"te" | "en">("te");
    
    const [totalExpense, setTotalExpense] = useState(0);
    const [cropTotals, setCropTotals] = useState<any>({});
    const [categoryTotals, setCategoryTotals] = useState<any>({});
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [activeSession, setActiveSession] = useState("");
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // 🔥 Shared value for Animation
    const animatedAmount = useSharedValue(0);

    // Trigger animation whenever totalExpense changes
    useEffect(() => {
        animatedAmount.value = withTiming(totalExpense, {
            duration: 2500, // 3 Seconds for slow, premium feel
            easing: Easing.out(Easing.exp), // Starts fast, ends slow & smooth
        });
    }, [totalExpense]);

   // Format the number properly with Indian commas
    const animatedProps = useAnimatedProps(() => {
        const formatted = Math.floor(animatedAmount.value).toLocaleString('en-IN');
        return {
            text: `₹ ${formatted}`,
        } as any; // 🔥 TypeScript Error సాల్వ్ చేయడానికి ఇది పెట్టాలి బ్రో!
    });

    const EmptyShimmer = () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 }}>
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 120, height: 120, borderRadius: 60 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 150, height: 18, marginTop: 20, borderRadius: 6 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 220, height: 12, marginTop: 10, borderRadius: 6 }} />
        <ShimmerPlaceholder LinearGradient={LinearGradient} style={{ width: 180, height: 12, marginTop: 6, borderRadius: 6 }} />
      </View>
    );

    const ExpenseShimmerCard = () => (
      <View style={[styles.card, { borderColor: '#F1F5F9' }]}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerColors={['#ebebeb', '#f5f5f5', '#ebebeb']}
          style={{ width: 4, height: 40, borderRadius: 2 }}
        />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={['#ebebeb', '#f5f5f5', '#ebebeb']}
            style={{ height: 18, width: "50%", borderRadius: 6 }}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={['#f1f5f9', '#f8fafc', '#f1f5f9']}
            style={{ height: 12, width: "70%", marginTop: 8, borderRadius: 4 }}
          />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            shimmerColors={['#ebebeb', '#f5f5f5', '#ebebeb']}
            style={{ width: 70, height: 18, borderRadius: 6 }}
          />
        </View>
      </View>
    );

    useEffect(() => {
        let unsubscribe: any;
        const load = async () => {
            const phone = await AsyncStorage.getItem("USER_PHONE");
            const lang = await AsyncStorage.getItem("APP_LANG");
            if (lang) setLanguage(lang as any);
            if (!phone) {
              setLoading(false);
              return;
            }
            setLoading(true);
            const userDoc = await firestore()
              .collection("users")
              .doc(phone)
              .get();

            const session = userDoc.data()?.activeSession;

            if (!session) {
              setLoading(false);
              return;
            }

            setActiveSession(session);
            unsubscribe = firestore()
                .collection("users").doc(phone).collection("expenses")
                .where("session", "==", session)
                .where("createdAt", "!=", null) 
                .orderBy("createdAt", "desc")
                .limit(100)
              .onSnapshot((snap) => {
                if (!snap || !snap.docs) {
                  setLoading(false);
                  return;
                }

                const list: any[] = [];
                let total = 0;
                const cropMap: any = {};
                const catMap: any = {};

                snap.docs.forEach(doc => {
                    const d: any = doc.data();
                    const amt = Number(d.amount) || 0;
                    total += amt;
                    const crop = d.crop || "Other";
                    const category = d.category || "Other";

                    cropMap[crop] = (cropMap[crop] || 0) + amt;
                    catMap[category] = (catMap[category] || 0) + amt;
                    list.push({ id: doc.id, ...d });
                });

                setData(list);
                setTotalExpense(total);
                setCropTotals(cropMap);
                setCategoryTotals(catMap);
                setLoading(false);
              });
        };
        load();
        return () => unsubscribe && unsubscribe();
    }, []);

    const getColor = (str: string) => {
        const colors = ["#10B981", "#3B82F6", "#F59E0B", "#950f52", "#8B5CF6", "#EC4899"];
        let hash = 0;
        for (let i = 0; i < (str?.length || 0); i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const optionsStyles = {
      optionsContainer: {
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 0,
        width: 150,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        marginTop: 25, 
      }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" />
            <AppHeader
                title={language === "te" ? "నా ఖర్చులు" : "My Expenses"}
                subtitle={language === "te" ? "వ్యయాల చరిత్ర" : "History"}
                language={language}
            />

            <FlatList
              data={loading ? [1, 2, 3, 4, 5] : data} 
              keyExtractor={(item, index) => (loading ? index.toString() : item.id)} 
              contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
                
              ListEmptyComponent={
                loading ? (
                  <EmptyShimmer />
                ) : (
                  <AppEmptyState
                    iconName="receipt-outline"
                    title={language === "te" ? "ఖర్చులు లేవు" : "No Expenses Yet"}
                    subtitle={language === "te" ? "మీ పెట్టుబడిని నమోదు చేయడం ప్రారంభించండి" : "Start tracking your farm investments"}
                    language={language}
                    marginTop={60}
                  />
                )
              }

              ListHeaderComponent={
                  data.length > 0 ? (
                      <>
                          <LinearGradient colors={["#911d10", "#561111"]} style={styles.mainStatsCard}>
                              <AppText style={styles.statLabel}>{language === "te" ? "మొత్తం పెట్టుబడి" : "Total Investment"}</AppText>
                              
                              {/* 🔥 PRO-LEVEL ANIMATED TOTAL VALUE */}
                              <AnimatedText 
                                editable={false}
                                animatedProps={animatedProps}
                                style={styles.statValue}
                              />
                              
                              <View style={styles.divider} />
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} >
                                  {Object.keys(cropTotals || {}).map((crop) => (
                                      <View key={crop} style={styles.cropChip}>
                                          <View style={[styles.dot, { backgroundColor: getColor(crop) }]} />
                                          <AppText style={styles.chipText}>{crop}: ₹{cropTotals[crop].toLocaleString('en-IN')}</AppText>
                                      </View>
                                  ))}
                              </ScrollView>
                          </LinearGradient>

                          <View style={styles.categorySummary}>
                              <AppText style={styles.sectionTitle} language={language}>
                                {language === "te" ? "రకాల వారీగా ఖర్చులు" : "Expenses by Category"}
                              </AppText>

                              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                                  {Object.keys(categoryTotals || {}).map((cat) => {
                                      const color = getColor(cat.trim());
                                      return (
                                          <View key={cat} style={[styles.catBox, { borderColor: color + "40" }]}>
                                              <View style={[styles.catIconCircle, { backgroundColor: color + "15" }]}>
                                                  <Ionicons name="pie-chart" size={16} color={color} />
                                              </View>
                                              <AppText style={styles.catBoxLabel}>{cat}</AppText>
                                              <AppText style={[styles.catBoxValue, { color }]}>
                                                  ₹{categoryTotals[cat].toLocaleString("en-IN")}
                                              </AppText>
                                          </View>
                                      );
                                  })}
                              </ScrollView>
                          </View>
                      </>
                  ) : null
              }

              renderItem={({ item }) => {
                if (loading) return <ExpenseShimmerCard />;

                const color = getColor(item.crop || "default");
                const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : "---";

                return (
                    <View style={styles.card}>
                        <View style={[styles.cardBar, { backgroundColor: color }]} />
                        <View style={styles.cardInfo}>
                            <AppText style={styles.cardCrop}>{item.crop}</AppText>
                            <AppText style={styles.cardCat}>{item.category} | {item.date || date}</AppText>
                        </View>
                        <View style={styles.cardRight}>
                            <AppText style={styles.cardAmount}>- ₹{item.amount.toLocaleString('en-IN')}</AppText>
                            
                            <Menu>
                              <MenuTrigger style={styles.menuBtn}>
                                <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
                              </MenuTrigger>

                              <MenuOptions customStyles={optionsStyles}>
                                <MenuOption onSelect={() => {
                                  router.push({ 
                                      pathname: "/farmer/expenses/add-expense", 
                                      params: { 
                                        editId: item.id,
                                        amount: item.amount?.toString() || "",
                                        category: item.category || "",
                                        crop: item.crop || "",
                                        date: item.date || "",
                                        notes: item.notes || ""
                                      } 
                                  });
                                }}>
                                  <View style={styles.modernMenuItem}>
                                    <Ionicons name="create-outline" size={18} color="#2563EB" />
                                    <AppText style={styles.menuTextEdit} language={language}>
                                      {language === "te" ? "సవరించు" : "Edit"}
                                    </AppText>
                                  </View>
                                </MenuOption>
                                
                                <View style={styles.menuDivider} />

                                <MenuOption onSelect={() => {
                                  setSelectedItem(item);
                                  setDeleteVisible(true);
                                }}>
                                  <View style={styles.modernMenuItem}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    <AppText style={styles.menuTextDelete} language={language}>
                                      {language === "te" ? "తొలగించు" : "Delete"}
                                    </AppText>
                                  </View>
                                </MenuOption>
                              </MenuOptions>
                            </Menu>

                        </View>
                    </View>
                );
              }}
            />

            <Modal visible={deleteVisible} transparent animationType="fade">
              <View style={styles.overlay}>
                <View style={styles.deleteBox}>
                  <View style={styles.iconBg}>
                    <Ionicons name="trash-outline" size={32} color="#DC2626" />
                  </View>
                  <AppText style={styles.deleteTitle} language={language}>
                    {language === "te" ? "తొలగించాలా?" : "Delete Expense?"}
                  </AppText>
                  <AppText style={styles.deleteSub} language={language}>
                    {language === "te"
                      ? "ఈ ఖర్చు వివరాలు శాశ్వతంగా తొలగించబడతాయి."
                      : "This expense record will be permanently deleted."}
                  </AppText>
                  <View style={styles.deleteBtns}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.cancelBtn}
                      onPress={() => setDeleteVisible(false)}
                    >
                      <AppText style={styles.cancelText} language={language}>
                        {language === "te" ? "వద్దు" : "Cancel"}
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.deleteBtn}
                      onPress={async () => {
                        const phone = await AsyncStorage.getItem("USER_PHONE");
                        if (phone && selectedItem?.id) {
                          await firestore()
                            .collection("users")
                            .doc(phone)
                            .collection("expenses")
                            .doc(selectedItem.id)
                            .delete();
                        }
                        setDeleteVisible(false);
                        setSelectedItem(null);
                      }}
                    >
                      <AppText style={styles.deleteText} language={language}>
                        {language === "te" ? "అవును" : "Delete"}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <TouchableOpacity activeOpacity={0.8} style={styles.addBtn} onPress={() => router.push("/farmer/expenses/add-expense")}>
                <LinearGradient colors={["#c53822", "#801515"]} style={styles.addGradient}>
                    <Ionicons name="add" size={32} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },
    mainStatsCard: { margin: 20, padding: 22, borderRadius: 24, elevation: 5 },
    statLabel: { color: "#f7bbbb", fontSize: 12 },
    // Animated Text Styles
    statValue: { color: "#fff", fontSize: 32, fontWeight: "600", marginVertical: 2, marginTop: -5, fontFamily: 'System' },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 12},
    cropChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    chipText: { color: '#fff', fontSize: 12 },
    
    catBox: {
      width: 110,          
      height: 110,         
      backgroundColor: "#fff",
      borderRadius: 16,
      marginRight: 10,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      alignItems: "center",
      justifyContent: "center"
    },
    
    catIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6
    },
    catBoxValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
    categorySummary: { paddingLeft: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 15 },
    catScroll: { flexDirection: 'row' },
    catBoxLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },

    menuBtn: { padding: 6, borderRadius: 10, backgroundColor: "#F3F4F6" },
    card: { 
      marginHorizontal: 20, marginVertical: 6, backgroundColor: "#fff",
      borderRadius: 16, flexDirection: 'row', alignItems: 'center',
      padding: 14, borderWidth: 1, borderColor: "#E5E7EB"   
    },
    cardBar: { width: 4, height: '80%', borderRadius: 2 },
    cardInfo: { flex: 1, marginLeft: 15 },
    cardCrop: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    cardCat: { fontSize: 12, color: '#64748b', marginTop: 2 },
    cardRight: { alignItems: 'flex-end', flexDirection: 'row', gap: 10 },
    cardAmount: { fontSize: 16, fontWeight: '600', color: '#ef4444' },

    modernMenuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, gap: 10 },
    menuTextEdit: { fontSize: 14, color: "#1E293B", fontWeight: "500" },
    menuTextDelete: { fontSize: 14, color: "#EF4444", fontWeight: "500" },
    menuDivider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 10 },

    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    deleteBox: { width: "80%", backgroundColor: "#fff", padding: 24, borderRadius: 20, alignItems: "center", elevation: 10 },
    iconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginBottom: 10 },
    deleteTitle: { fontSize: 18, fontWeight: "600", marginTop: 12, color: '#111827' },
    deleteSub: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 20 },
    deleteBtns: { flexDirection: "row", marginTop: 20, gap: 12 },
    cancelBtn: { flex: 1, paddingVertical: 12, backgroundColor: "#F1F5F9", borderRadius: 12, alignItems: "center" },
    cancelText: { fontWeight: "600", color: "#475569" },
    deleteBtn: { flex: 1, paddingVertical: 12, backgroundColor: "#DC2626", borderRadius: 12, alignItems: "center" },
    deleteText: { fontWeight: "600", color: "#fff" },

    addBtn: { position: "absolute", bottom: 30, right: 25 },
    addGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", elevation: 5 }
});