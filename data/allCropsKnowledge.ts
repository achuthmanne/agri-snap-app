export const allCropsKnowledge = [
   {
    id: "paddy",
    name: { te: "వరి (Paddy)", en: "Paddy (వరి)" },
    basic: {
      season: { te: "ఖరీఫ్ / రబీ", en: "Kharif / Rabi" },
      duration: { te: "120-150 రోజులు", en: "120-150 Days" },
      soil: { te: "బంకమట్టి / నల్ల రేగడి నేలలు", en: "Clay / Loamy / Black Soils" },
      water: { te: "అత్యధిక నీటి అవసరం", en: "High Water Requirement" },
      idealTemp: "20°C - 35°C"
    },
    seedVarieties: [
      "RNR-15048 (Telangana Sona / తెలంగాణ సోనా)",
      "BPT-5204 (Samba Masuri / సాంబ మసూరి)",
      "MTU-1010 (Cottondora Sannalu / కాటన్ దొర సన్నాలు)",
      "WGL-962 (Warangal Vari-2 / వరంగల్ వారి-2)",
      "Spoorthi (GNV 1906) - High Zinc Variety"
    ],
    pestsAndDiseases: [
      { te: "సుడి దోమ (BPH)", en: "Brown Plant Hopper (BPH)" },
      { te: "కాండం తొలిచే పురుగు", en: "Stem Borer" },
      { te: "అగ్గి తెగులు", en: "Blast Disease" },
      { te: "ఆకు ముడత", en: "Leaf Folder" }
    ],
    practicalTips: [
      { te: "కోత సమయంలో తేమ 17% కంటే తక్కువ ఉంటేనే మద్దతు ధర (MSP) లభిస్తుంది.", en: "Moisture content should be below 17% for MSP during procurement." },
      { te: "DSR (నేరుగా విత్తడం) ద్వారా ఎకరానికి ₹5000-8000 ఆదా చేయవచ్చు.", en: "DSR method saves ₹5000-8000 per acre in labor costs." },
      { te: "లేజర్ లెవలింగ్ ద్వారా 20% నీటిని ఆదా చేయవచ్చు.", en: "Use Laser Land Leveling to save up to 20% irrigation water." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 120kg ", " భాస్వరం: 60kg", " పొటాష్: 40kg (ఎకరానికి)"],
      en: ["Nitrogen: 120kg", "Phosphorus: 60kg", "Potassium: 40kg (Per Acre)"]
    },
       schemes: [
      { 
        name: { te: "PM-Kisan (కేంద్ర ప్రభుత్వం)", en: "PM-Kisan (Central)" }, 
        link: "https://pmkisan.gov.in" 
      },
       { name: { te: "రైతు భరోసా (TS State PDF)", en: "Rythu Bharosa (TS State PDF)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
       { name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, link: "https://agriculture.ap.gov.in/home" },
      { 
        name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, 
        link: "https://ysrrythubharosa.ap.gov.in" 
      },
      { 
        name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, 
        link: "https://rythubharosa.telangana.gov.in" 
      },
      { 
        name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibhava (AP State)" }, 
        link: "https://apseeds.ap.gov.in/Website/Schemes.aspx" 
      },
      { 
        name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, 
        link: "https://pmfby.gov.in" 
      }
    ],
    markets: [
      { 
        name: { te: "తెలంగాణ OPMS పోర్టల్", en: "Telangana OPMS" }, 
        link: "https://pps.telangana.gov.in/View/Login.aspx" 
      },
      { 
        name: { te: "TS వరి మార్కెట్ ధరలు (Live)", en: "TS Market Prices (Live)" }, 
        link: "https://www.napanta.com/agri-commodity-prices/telangana/paddy-dhan/" 
      },
      { 
        name: { te: "AP వరి మార్కెట్ ధరలు (Live)", en: "AP Market Prices (Live)" }, 
        link: "https://www.kisandeals.com/mandiprices/PADDY/ANDHRA-PRADESH/ALL" 
      }
    ],
    videos: [
      { 
        title: { te: "అన్నదాత వరి సాగు యాజమాన్యం", en: "Annadatha Paddy Farming" }, 
        link: "https://www.youtube.com/results?search_query=annadata+vari+sagu" 
      },
      { 
        title: { te: "DSR సాగు పద్ధతి (మెళకువలు)", en: "DSR Method Tips" }, 
        link: "https://www.youtube.com/results?search_query=dsr+vari+sagu+method" 
      }
    ],
    helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]

  },
  {
    id: "cotton",
    name: { te: "పత్తి (Cotton)", en: "(Cotton) పత్తి"},
    basic: {
      season: { te: "ఖరీఫ్", en: "Kharif" },
      duration: { te: "150-180 రోజులు", en: "150-180 Days" },
      soil: { te: "నల్ల రేగడి నేలలు", en: "Black Soil" },
      water: { te: "మితమైన నీరు", en: "Moderate Water" },
      idealTemp: "21°C - 30°C"
    },
    seedVarieties: [
      "Bt Hybrid Seeds (Bolgard-II)",
      "Bunny Bt",
      "RCH 2 Bt"
    ],
    pestsAndDiseases: [
      { te: "గులాబీ రంగు పురుగు", en: "Pink Bollworm" },
      { te: "తెల్ల దోమ", en: "Whitefly" },
      { te: "పెను బంక", en: "Aphids" },
      { te: "తామర పురుగులు", en: "Thrips" }
    ],
    practicalTips: [
      { te: "గులాబీ పురుగు నివారణకు లింగమార్పిడి బుట్టలు (Pheromone Traps) వాడండి.", en: "Use pheromone traps to monitor and control Pink Bollworm." },
      { te: "తొలి దశలో వేప నూనె పిచికారీ చేయడం వల్ల రసం పీల్చే పురుగులు తగ్గుతాయి.", en: "Spray Neem Oil in early stages to manage sucking pests." },
      { te: "మొక్కల మధ్య దూరం 90సెం.మీ ఉండేలా చూసుకోండి.", en: "Maintain proper plant spacing (approx 90cm) for better yield." }
    ],
    fertilizerGuide: {
      te: "నత్రజని: 120kg, భాస్వరం: 60kg (ఎకరానికి)",
      en: "Nitrogen: 120kg, Phosphorus: 60kg per hectare."
    },
   schemes: [
      { 
        name: { te: "PM-Kisan (కేంద్ర ప్రభుత్వం)", en: "PM-Kisan (Central)" }, 
        link: "https://pmkisan.gov.in" 
      },
      { 
        name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, 
        link: "https://ysrrythubharosa.ap.gov.in" 
      },
      { 
        name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, 
        link: "https://rythubharosa.telangana.gov.in" 
      },
      { 
        name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibhava (AP State)" }, 
        link: "https://apseeds.ap.gov.in/Website/Schemes.aspx" 
      },
         { name: { te: "రైతు భరోసా (TS State PDF)", en: "Rythu Bharosa (TS State PDF)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
       { name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, link: "https://agriculture.ap.gov.in/home" },
      { 
        name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, 
        link: "https://pmfby.gov.in" 
      }
    ],
    markets: [
      { 
        name: { te: "AP పత్తి మార్కెట్ ధరలు", en: "Cotton Market Rates in AP" }, 
        link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/cotton/" 
      },
      { 
        name: { te: "TS పత్తి మార్కెట్ ధరలు", en: "Cotton Market Rates in TS" }, 
        link: "https://www.napanta.com/agri-commodity-prices/telangana/cotton/" 
      }
    ],
    videos: [
      { 
        title: { te: "అన్నదాత పత్తి సాగు యాజమాన్యం", en: "Annadatha Cotton Farming" }, 
        link: "https://www.youtube.com/results?search_query=annadata+patti" 
      },
      { 
        title: { te: "పత్తిలో తెగుళ్లు - నివారణ", en: "Cotton Diseases & Control" }, 
        link: "https://www.youtube.com/results?search_query=cotton+farming+diseses+in+telugu" 
      }
    ],
    helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
  {
    id: "maize",
    name: {te: "మొక్కజొన్న (Maize)", en: "(Maize) మొక్కజొన్న"},
    basic: {
      season: { te: "ఖరీఫ్ / రబీ", en: "Kharif / Rabi" },
      duration: { te: "90-120 రోజులు", en: "90-120 Days" },
      soil: { te: "నీరు నిలవని సారవంతమైన నేలలు", en: "Well Drained Rich Soils" },
      water: { te: "మితమైన నీరు", en: "Moderate Water" },
      idealTemp: "18°C - 27°C"
    },
    seedVarieties: [
      "DHM-117 / DHM-206",
      "NK-6240",
      "Pioneer Hybrids"
    ],
    pestsAndDiseases: [
      { te: "కత్తిర పురుగు", en: "Fall Armyworm (FAW)" },
      { te: "కాండం తొలిచే పురుగు", en: "Stem Borer" },
      { te: "ఆకు మాడు తెగులు", en: "Leaf Blight" }
    ],
    practicalTips: [
      { te: "కత్తిర పురుగు నివారణకు మొవ్వులో ఇసుక లేదా సున్నం వేయవచ్చు.", en: "Apply sand or lime in the whorl to control Fall Armyworm manually." },
      { te: "విత్తన శుద్ధి తప్పనిసరిగా చేయాలి.", en: "Seed treatment is essential to prevent early pest attacks." },
      { te: "పూత మరియు గింజ పాలు పోసుకునే దశలో నీటి ఎద్దడి ఉండకూడదు.", en: "Avoid water stress during flowering and grain filling stages." }
    ],
    fertilizerGuide: {
      te: "నత్రజని: 150kg, భాస్వరం: 75kg (ఎకరానికి)",
      en: "Nitrogen: 150kg, Phosphorus: 75kg per hectare."
    },
       schemes: [
      { 
        name: { te: "PM-Kisan (కేంద్ర ప్రభుత్వం)", en: "PM-Kisan (Central)" }, 
        link: "https://pmkisan.gov.in" 
      },
      { 
        name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, 
        link: "https://ysrrythubharosa.ap.gov.in" 
      },
      { 
        name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibhava (AP State)" }, 
        link: "https://apseeds.ap.gov.in/Website/Schemes.aspx" 
      },
         { name: { te: "రైతు భరోసా (TS State PDF)", en: "Rythu Bharosa (TS State PDF)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
       { name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, link: "https://agriculture.ap.gov.in/home" },
      { 
        name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, 
        link: "https://rythubharosa.telangana.gov.in" 
      },
      { 
        name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibhava (AP State)" }, 
        link: "https://apseeds.ap.gov.in/Website/Schemes.aspx" 
      },
      { 
        name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, 
        link: "https://pmfby.gov.in" 
      }
    ],
    markets: [
      { 
        name: { te: "TS మొక్కజొన్న మార్కెట్ ధరలు", en: "Maize TS Prices" }, 
        link: "https://www.napanta.com/agri-commodity-prices/telangana/maize/" 
      },
      { 
        name: { te: "AP మొక్కజొన్న మార్కెట్ ధరలు", en: "Maize AP Prices" }, 
        link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/maize/" 
      }
    ],
    videos: [
      { 
        title: { te: "అన్నదాత మొక్కజొన్న సాగు యాజమాన్యం", en: "Annadatha Maize Farming" }, 
        link: "https://www.youtube.com/results?search_query=maize+farming++in+telugu+annadatha" 
      },
      { 
        title: { te: "మొక్కజొన్నలో తెగుళ్లు - నివారణ", en: "Diseases in Maize" }, 
        link: "https://www.youtube.com/results?search_query=maize+farming+diseses+in+telugu" 
      }
    ],
    helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]

  },
    {
    id: "chilli",
    name: { te: "మిర్చి (Chilli)", en: "Chilli (మిర్చి)" },
    basic: {
      season: { te: "ఖరీఫ్ (ఆగస్టు - సెప్టెంబర్)", en: "Kharif (Aug - Sept)" },
      duration: { te: "150-210 రోజులు", en: "150-210 Days" },
      soil: { te: "నల్ల రేగడి / సారవంతమైన ఎర్ర నేలలు", en: "Black / Fertile Red Soils" },
      water: { te: "మితం నుండి ఎక్కువ (క్రమ పద్ధతిలో)", en: "Moderate to High (Regular intervals)" },
      idealTemp: "20°C - 30°C"
    },
    seedVarieties: [
      "Teja (S17) - High Export Demand",
      "Guntur Sannam (S4) - GI Tagged",
      "Byadgi (KDL) - For Color",
      "US-341, Syngenta HPH-5531 (Hybrids)",
      "Indam-5, Mahi-456"
    ],
    pestsAndDiseases: [
      { te: "నల్ల తామర పురుగు (Invasive Black Thrips)", en: "Invasive Black Thrips (Thrips parvispinus)" },
      { te: "వేరు కుళ్లు / కొమ్మ కుళ్లు", en: "Root Rot / Dieback" },
      { te: "ముడత తెగులు (Gemini Virus)", en: "Leaf Curl / Gemini Virus" }
    ],
    practicalTips: [
      { te: "నల్ల తామర పురుగు నివారణకు నీలి రంగు జిగురు అట్టలు (Blue Sticky Traps) ఎకరానికి 25-30 పెట్టండి.", en: "Install 25-30 Blue Sticky Traps per acre to control Black Thrips." },
      { te: "పంట చుట్టూ జొన్న లేదా మొక్కజొన్నను 3 వరుసల్లో రక్షణ పంటగా వేయండి.", en: "Grow 3 rows of Maize or Sorghum as a border crop for pest protection." },
      { te: "ఎగుమతి కోసం ఆశించే వారు పురుగుమందుల అవశేషాలు (MRL Levels) లేకుండా జాగ్రత్తపడాలి.", en: "Maintain MRL levels for exports by avoiding excessive chemical sprays." },
      { te: "డ్రిప్ ఇరిగేషన్ మరియు మల్చింగ్ షీట్ వాడకం వల్ల 30% దిగుబడి పెరుగుతుంది.", en: "Using Drip irrigation and Mulching sheets can increase yield by 30%." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 150kg,", "భాస్వరం: 60kg,", "పొటాష్: 60kg,", "జింక్ సల్ఫేట్: 20kg"],
      en: ["Nitrogen: 150kg", "Phosphorus: 60kg", "Potash: 60kg", "Zinc Sulphate: 20kg"]
    },
    schemes: [
      { name: { te: "PM-Kisan (కేంద్ర ప్రభుత్వం)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibava (AP State)" }, link: "https://agriculture.ap.gov.in" },
      { name: { te: "రైతు భరోసా (AP State)", en: "Rythu Bharosa (AP State)" }, link: "https://agriculture.ap.gov.in/home" },
      { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://rythubharosa.telangana.gov.in" },
      { name: { te: "రైతు భరోసా (TS State PDF)", en: "Rythu Bharosa (TS State PDF)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
      { name: { te: "ఉద్యానవన శాఖ సబ్సిడీలు (Horticulture)", en: "Horticulture Subsidies" }, link: "http://horticulture.tg.nic.in" },
      { name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, link: "https://pmfby.gov.in" }
    ],
    markets: [
      { name: { te: "గుంటూరు మిర్చి యార్డ్ లైవ్ ధరలు", en: "Guntur Mirchi Yard Live Rates" }, link: "https://gunturmirchi.in" },
      { name: { te: "TS మిర్చి మార్కెట్ ధరలు (NaPanta)", en: "TS Chilli Market Prices" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/dry-chillies/" },
      { name: { te: "AP మిర్చి మార్కెట్ ధరలు (NaPanta)", en: "AP Chilli Market Prices" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/chili-red/" },
    ],
    videos: [
      { title: { te: "మిర్చిలో నల్ల తామర పురుగు నివారణ", en: "Black Thrips Management in Chilli" }, link: "https://www.youtube.com/results?search_query=Black+Thrips+Management+in+Chilli" },
      { title: { te: "మిర్చి సాగులో అధిక దిగుబడి సూత్రాలు", en: "High Yield Chilli Farming Tips" }, link: "https://www.youtube.com/results?search_query=mirchi+farming+tips+in+telugu" }
    ],
    helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "groundnut",
    name: { te: "వేరుశనగ (Groundnut)", en: "Groundnut (వేరుశనగ)" },
    basic: {
      season: { te: "ఖరీఫ్ (జూన్-జూలై) / రబీ (నవంబర్-డిసెంబర్)", en: "Kharif (June-July) / Rabi (Nov-Dec)" },
      duration: { te: "100-120 రోజులు", en: "100-120 Days" },
      soil: { te: "నీరు నిలవని తేలికపాటి ఎర్ర నేలలు / ఇసుక నేలలు", en: "Well-drained Sandy Loams / Red Soils" },
      water: { te: "తక్కువ (కీలక దశల్లో తడి అవసరం)", en: "Low (Needs irrigation at critical stages)" },
      idealTemp: "25°C - 30°C"
    },
    seedVarieties: [
      "Kadiri-6 (K6), Kadiri-9 (K9) - Very Popular",
      "K-1812 (Kadiri Lepakshi) - High Yield",
      "Narayani, Dharani",
      "G-2, TAG-24 (For Rabi)"
    ],
    pestsAndDiseases: [
      { te: "వేరు పురుగు (White Grub)", en: "White Grub" },
      { te: "ఆకు ముడత / టిక్కా ఆకుమచ్చ తెగులు", en: "Leaf Miner / Tikka Leaf Spot" },
      { te: "బుడత కుళ్లు తెగులు (Stem Rot)", en: "Stem Rot / Bud Necrosis" }
    ],
    practicalTips: [
      { te: "విత్తే ముందు జిప్సం (Gypsum) ఎకరానికి 200kg వాడితే గింజ గట్టిగా, నూనె శాతంతో ఊరుతుంది.", en: "Apply 200kg Gypsum per acre to improve pod filling and oil content." },
      { te: "ట్రైకోడెర్మా విరిడితో విత్తన శుద్ధి చేయడం వల్ల వేరు కుళ్లును 90% నివారించవచ్చు.", en: "Seed treatment with Trichoderma viride prevents 90% of root rot cases." },
      { te: "ఊడలు దిగే దశలో (Pegging stage) నేలను కదిలించకూడదు.", en: "Do not disturb the soil during the pegging stage (45-50 days)." },
      { te: "పంట కోయడానికి 15 రోజుల ముందు నీరు ఆపేయాలి.", en: "Stop irrigation 15 days before harvesting for better shelf life." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 20kg, ", "భాస్వరం: 40kg, ", "పొటాష్: 20kg, ", "జిప్సం: 200kg (ఎకరానికి)"],
      en: ["Nitrogen: 20kg, ", "Phosphorus: 40kg, ", "Potash: 20kg, ", "Gypsum: 200kg (Per Acre)"]
    },
    schemes: [
      { name: { te: "PM-Kisan (కేంద్ర ప్రభుత్వం)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "విత్తన సబ్సిడీ (Seed Subsidy - AP)", en: "Seed Subsidy (AP State)" }, link: "https://apagrisnet.gov.in" },
      { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://rythubharosa.telangana.gov.in" },
      { name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibava (AP State)" }, link: "https://agriculture.ap.gov.in" },
       { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
     
      { name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, link: "https://pmfby.gov.in" }
    ],
    markets: [
      { name: { te: "AP వేరుశనగ మార్కెట్ ధరలు", en: "Groundnut Market Rates in AP" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/groundnut/" },
      { name: { te: "TS వేరుశనగ మార్కెట్ ధరలు", en: "Groundnut Market Rates in TS" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/groundnut/" }
    ],
    videos: [
      { title: { te: "వేరుశనగలో విత్తన శుద్ధి మరియు సాగు పద్ధతులు", en: "Groundnut Seed Treatment & Farming" }, link: "https://www.youtube.com/results?search_query=Groundnut+Seed+Treatment+%26+Farming+annadatha" },
      { title: { te: "కదిరి లేపాక్షి (K-1812) రకం ప్రత్యేకతలు", en: "Kadiri Lepakshi Variety Details" }, link: "https://www.youtube.com/results?search_query=Kadiri+Lepakshi+Variety+Details+annadatha" }
    ],
     helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "blackgram",
    name: { te: "మినుము (Black Gram)", en: "Black Gram (మినుము)" },
    basic: {
      season: { te: "రబీ (వరి కోతల తర్వాత) / ఖరీఫ్", en: "Rabi (Rice Fallows) / Kharif" },
      duration: { te: "75-90 రోజులు (తక్కువ కాలపరిమితి)", en: "75-90 Days (Short Duration)" },
      soil: { te: "నల్ల రేగడి నేలలు / తేమ ఉన్న నేలలు", en: "Black Cotton Soils / Moist Soils" },
      water: { te: "తక్కువ (ఆరతడి పంట)", en: "Low (Irrigated dry crop)" },
      idealTemp: "25°C - 35°C"
    },
    seedVarieties: [
      "PU-31, LBG-752 (Popular in AP/TS)",
      "LBG-787, TBG-104 (Yellow Mosaic Resistant)",
      "VBN-8, GBG-1"
    ],
    pestsAndDiseases: [
      { te: "పల్లాకు తెగులు (Yellow Mosaic Virus)", en: "Yellow Mosaic Virus (YMV)" },
      { te: "బూడిద తెగులు (Powdery Mildew)", en: "Powdery Mildew" },
      { te: "మారుకా పురుగు (Maruca Pod Borer)", en: "Maruca Pod Borer" }
    ],
    practicalTips: [
      { te: "విత్తే ముందు రైజోబియం (Rhizobium) తో విత్తన శుద్ధి చేస్తే 15% దిగుబడి పెరుగుతుంది.", en: "Seed treatment with Rhizobium culture can increase yield by 15%." },
      { te: "పల్లాకు తెగులు నివారణకు తెల్ల దోమను అరికట్టడం చాలా ముఖ్యం.", en: "Controlling Whitefly is crucial to prevent Yellow Mosaic Virus." },
      { te: "వరి కోసిన తర్వాత తడి ఉన్నప్పుడే విత్తనాలు చల్లితే మొలక శాతం బాగుంటుంది.", en: "Sowing in residual moisture after paddy harvest ensures better germination." },
      { te: "పూత దశలో 2% యూరియా ద్రావణం పిచికారీ చేస్తే కాయలు బాగా వస్తాయి.", en: "Spraying 2% Urea solution during flowering improves pod formation." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 8kg, ", "భాస్వరం: 20kg (ఎకరానికి - వరి మాగాణుల్లో అవసరం లేదు)"],
      en: ["Nitrogen: 8kg", "Phosphorus: 20kg (Per Acre - Not needed in rice fallows)"]
    },
    schemes: [
      { name: { te: "PM-Kisan (కేంద్ర ప్రభుత్వం)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "NFSM - పప్పుధాన్యాల పథకం", en: "NFSM - Pulses Scheme" }, link: "https://www.nfsm.gov.in" },
      { name: { te: "రైతు భరోసా (AP/TS)", en: "Rythu Bharosa (State)" }, link: "https://agri.telangana.gov.in" },
      { name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibava (AP State)" }, link: "https://agriculture.ap.gov.in" },
       { name: { te: "విత్తన సబ్సిడీ (Seed Subsidy - AP)", en: "Seed Subsidy (AP State)" }, link: "https://apagrisnet.gov.in" },
      { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://rythubharosa.telangana.gov.in" },
       { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
     
      { name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, link: "https://pmfby.gov.in" }
    ],
    markets: [
      { name: { te: "TS మినుము మార్కెట్ ధరలు", en: "Black Gram TS Market Rates" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/black-gram-urd-beans-whole/" },
      { name: { te: "AP మినుము మార్కెట్ ధరలు", en: "Black Gram AP Market Rates" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/black-gram-urd-beans-whole/" }
    ],
    videos: [
      { title: { te: "వరి మాగాణుల్లో మినుము సాగు విధానం", en: "Black Gram Cultivation in Rice Fallows" }, link: "https://www.youtube.com/results?search_query=Black+Gram+Cultivation+in+Rice+Fallows" },
      { title: { te: "మినుములో పల్లాకు తెగులు నివారణ", en: "YMV Control in Black Gram" }, link: "https://www.youtube.com/results?search_query=YMV+Control+in+Black+Gram" }
    ],
    helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
  {
    id: "redgram",
    name: { te: "కంది (Red Gram)", en: "Red Gram (కంది)" },
    basic: {
      season: { te: "ఖరీఫ్ (జూన్ - జూలై)", en: "Kharif (June - July)" },
      duration: { te: "150-180 రోజులు", en: "150-180 Days" },
      soil: { te: "నీరు నిలవని ఎర్ర నేలలు / నల్ల రేగడి నేలలు", en: "Well-drained Red / Black Soils" },
      water: { te: "తక్కువ (వర్షాధార పంట)", en: "Low (Rainfed crop)" },
      idealTemp: "25°C - 35°C"
    },
    seedVarieties: [
      "LRG-41, LRG-52 (Popular in AP/TS)",
      "PRG-176 (Short duration)",
      "Asha (ICPL 87119), WRG-65",
      "Mannem Konda (High Yielding)"
    ],
    pestsAndDiseases: [
      { te: "శనగ పచ్చ పురుగు (Helicoverpa)", en: "Gram Pod Borer" },
      { te: "ఎండు తెగులు (Wilt Disease)", en: "Wilt Disease" },
      { te: "మారుకా పురుగు (Maruca)", en: "Spotted Pod Borer" }
    ],
    practicalTips: [
      { te: "కందిలో అంతర పంటగా పెసర లేదా మినుము వేస్తే అదనపు ఆదాయం వస్తుంది.", en: "Intercropping with Green Gram or Black Gram gives extra income." },
      { te: "ఎండు తెగులు నివారణకు ట్రైకోడెర్మా విరిడితో విత్తన శుద్ధి తప్పనిసరి.", en: "Seed treatment with Trichoderma viride is essential to prevent Wilt." },
      { te: "మొక్కల చివరలను తుంచడం (Nipping) ద్వారా కొమ్మలు ఎక్కువగా వచ్చి దిగుబడి పెరుగుతుంది.", en: "Nipping the top buds encourages branching and increases yield." },
      { te: "పూత దశలో తేమ ఎక్కువగా ఉండకుండా జాగ్రత్త పడాలి.", en: "Avoid excessive moisture during the flowering stage." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 8kg, ", "భాస్వరం: 20kg (ఎకరానికి)"],
      en: ["Nitrogen: 8kg", "Phosphorus: 20kg (Per Acre)"]
    },
    schemes: [
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "రైతు భరోసా (AP/TS)", en: "Rythu Bharosa (State)" }, link: "https://ysrrythubharosa.ap.gov.in" },
      { name: { te: "NFSM Pulses Subsidies", en: "NFSM Pulses Subsidies" }, link: "https://www.nfsm.gov.in" },
      { name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibava (AP State)" }, link: "https://agriculture.ap.gov.in" },
       { name: { te: "విత్తన సబ్సిడీ (Seed Subsidy - AP)", en: "Seed Subsidy (AP State)" }, link: "https://apagrisnet.gov.in" },
      { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://rythubharosa.telangana.gov.in" },
       { name: { te: "రైతు భరోసా (TS State PDF)", en: "Rythu Bharosa (TS State PDF)" }, link: "https://www.manage.gov.in/fpoacademy/CGSchemes/Telangana%20Govt%20Schemes.pdf" },
     
      { name: { te: "PMFBY పంట భీమా", en: "PMFBY Crop Insurance" }, link: "https://pmfby.gov.in" }
    ],
    markets: [
      { name: { te: "TS కంది మార్కెట్ ధరలు (Live)", en: "Red Gram TS Prices" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/arhar-tur-red-gram/" },
      { name: { te: "AP కంది మార్కెట్ ధరలు (Live)", en: "Red Gram AP Prices" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/arhar-tur-red-gram/" }
    ],
    videos: [
      { title: { te: "కంది సాగులో మెళకువలు - అన్నదాత", en: "Red Gram Cultivation Tips" }, link: "https://www.youtube.com/results?search_query=Red+Gram+Cultivation+Tips" },
      { title: { te: "కందిలో పురుగు నివారణ పద్ధతులు", en: "Pest Control in Red Gram" }, link: "https://www.youtube.com/results?search_query=Pest+Control+in+Red+Gram" }
    ],
     helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP అగ్రికల్చర్ హెల్ప్‌లైన్", en: "AP Agri Helpline" }, phone: "1902, 1967" },
      { state: { te: "AP అదనపు హెల్ప్‌లైన్", en: "AP Additional Helpline" }, phone: "1800-425-1903" },
      { state: { te: "AP వాట్సాప్ బుకింగ్ సర్వీస్", en: "AP WhatsApp Booking Service" }, phone: "7337359375" },
      { state: { te: "కిసాన్ కాల్ సెంటర్ (Central)", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "tomato",
    name: { te: "టమాటా (Tomato)", en: "Tomato (టమాటా)" },
    basic: {
      season: { te: "ఏడాది పొడవునా (ముఖ్యంగా ఖరీఫ్/రబీ)", en: "Year-round (Mainly Kharif/Rabi)" },
      duration: { te: "100-120 రోజులు", en: "100-120 Days" },
      soil: { te: "నీరు నిలవని సారవంతమైన నేలలు / ఎర్ర నేలలు", en: "Well-drained Fertile / Red Loamy Soils" },
      water: { te: "మితం (క్రమబద్ధమైన తడి అవసరం)", en: "Moderate (Requires regular irrigation)" },
      idealTemp: "18°C - 28°C"
    },
    seedVarieties: [
      "Arka Rakshak, Arka Samrat (Triple Disease Resistant)",
      "Pusa Ruby, Pusa Early Dwarf",
      "Private Hybrids: US-440, Syngenta-6242, Heemsohni",
      "Sivansh (High Yield Hybrid)"
    ],
    pestsAndDiseases: [
      { te: "ఆకు ముడత వైరస్ (Leaf Curl Virus)", en: "Leaf Curl Virus" },
      { te: "కాయ తొలిచే పురుగు (Fruit Borer)", en: "Fruit Borer" },
      { te: "ఆకు మాడ / లేట్ బ్లైట్", en: "Early & Late Blight" },
      { te: "తామర పురుగులు (Thrips/Whitefly)", en: "Thrips / Whitefly (Vectors)" }
    ],
    practicalTips: [
      { te: "టమాటా మొక్కలకు ఊత కర్రలు (Staking) కట్టడం వల్ల కాయలు నేలకు తగలకుండా నాణ్యత పెరుగుతుంది.", en: "Staking tomato plants prevents fruit rot and improves quality." },
      { te: "వైరస్ వ్యాప్తిని అరికట్టడానికి తెల్ల దోమ నివారణకు పసుపు రంగు జిగురు అట్టలు వాడండి.", en: "Use Yellow Sticky Traps to control Whiteflies and prevent virus spread." },
      { te: "మల్చింగ్ షీట్ మరియు డ్రిప్ ఇరిగేషన్ వాడటం వల్ల కలుపు తగ్గి దిగుబడి 40% పెరుగుతుంది.", en: "Using Mulching sheets and Drip irrigation can boost yield by 40%." },
      { te: "వేసవిలో సాగు చేసేటప్పుడు నీడ పరదలు (Shade Nets) వాడటం మేలు.", en: "Use Shade Nets during summer cultivation to protect from heat stress." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 60kg, ", "భాస్వరం: 40kg, ", "పొటాష్: 40kg, ", "బోరాన్ & కాల్షియం (కాయ పగలకుండా)"],
      en: ["Nitrogen: 60kg", "Phosphorus: 40kg", "Potash: 40kg", "Boron & Calcium (To prevent cracking)"]
    },
    schemes: [
      { name: { te: "ఉద్యానవన శాఖ సబ్సిడీలు (Horticulture)", en: "Horticulture Subsidies" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "MIDH - సూక్ష్మ సాగు పథకం", en: "MIDH - Micro Irrigation Scheme" }, link: "https://midh.gov.in" },
       { name: { te: "అన్నదాత సుఖీభవ (AP State)", en: "Annadatha Sukhibava (AP State)" }, link: "https://agriculture.ap.gov.in" },
       { name: { te: "విత్తన సబ్సిడీ (Seed Subsidy - AP)", en: "Seed Subsidy (AP State)" }, link: "https://apagrisnet.gov.in" },
      { name: { te: "రైతు భరోసా (TS State)", en: "Rythu Bharosa (TS State)" }, link: "https://rythubharosa.telangana.gov.in" },
    ],
    markets: [
      { name: { te: "మదనపల్లి మార్కెట్ ధరలు (Live)", en: "Madanapalle Market Rates" }, link: "https://www.kisandeals.com/mandiprices/TOMATO/ANDHRA-PRADESH/MADANAPALLE" },
      
      { name: { te: "AP టమాటా మార్కెట్ ధరలు", en: "AP Tomato Market Prices" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/tomato/" },
      { name: { te: "TS టమాటా మార్కెట్ ధరలు", en: "TS Tomato Market Prices" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/tomato/" }
    ],
    videos: [
      { title: { te: "టమాటా సాగులో మేలైన యాజమాన్యం", en: "Tomato Cultivation Management" }, link: "https://www.youtube.com/results?search_query=Tomato+Cultivation+Management+annadatha" },
      { title: { te: "టమాటాలో ఆకు ముడత నివారణ", en: "Leaf Curl Control in Tomato" }, link: "https://www.youtube.com/results?search_query=leaf+curl+control+in+tomato+in+telugu+annadatha" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
      {
    id: "watermelon",
    name: { te: "పుచ్చకాయ (Watermelon)", en: "Watermelon (పుచ్చకాయ)" },
    basic: {
      season: { te: "వేసవి (డిసెంబర్ - మార్చి మధ్య విత్తుకోవాలి)", en: "Summer (Sow between Dec - March)" },
      duration: { te: "75-90 రోజులు (అతి తక్కువ కాలం)", en: "75-90 Days" },
      soil: { te: "నీరు నిలవని ఇసుక నేలలు / సారవంతమైన ఎర్ర నేలలు", en: "Well-drained Sandy Loams / Red Soils" },
      water: { te: "మితం (డ్రిప్ ఇరిగేషన్ శ్రేయస్కరం)", en: "Moderate (Drip irrigation preferred)" },
      idealTemp: "24°C - 35°C"
    },
    seedVarieties: [
      "Arka Muthu, Arka Manik (Disease Resistant)",
      "Sugar Baby (Small & Sweet)",
      "Augusta, Saraswati (Private Hybrids)",
      "Kiran (Dark Green - High Demand)"
    ],
    pestsAndDiseases: [
      { te: "పండు ఈగ (Fruit Fly)", en: "Fruit Fly" },
      { te: "తీగ కుళ్లు తెగులు (Fusarium Wilt)", en: "Fusarium Wilt" },
      { te: "పల్లాకు తెగులు (Mosaic Virus)", en: "Mosaic Virus" },
      { te: "పిండి నల్లి / తామర పురుగులు", en: "Mealy Bugs / Thrips" }
    ],
    practicalTips: [
      { te: "పండు ఈగ నివారణకు ఎకరానికి 10-15 'ఫ్రూట్ ఫ్లై ట్రాప్స్' (Pheromone Traps) తప్పనిసరిగా వాడండి.", en: "Use 10-15 Pheromone Traps per acre to control Fruit Fly effectively." },
      { te: "మల్చింగ్ షీట్ వాడటం వల్ల కలుపు తగ్గి, తేమ నిలిచి ఉండి కాయ సైజు బాగా పెరుగుతుంది.", en: "Using Mulching sheets reduces weeds and improves fruit size." },
      { te: "కాయ ఎదుగుదల దశలో పొటాష్ మరియు బోరాన్ ఇస్తే కాయలు తియ్యగా, పగలకుండా వస్తాయి.", en: "Apply Potash and Boron during fruit growth for sweetness and to prevent cracking." },
      { te: "పంట కోసే 5 రోజుల ముందు నీరు పెట్టడం ఆపేస్తే కాయ రుచి మరియు నిల్వ కాలం పెరుగుతుంది.", en: "Stop irrigation 5 days before harvest to increase sweetness and shelf life." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 40kg, ", "భాస్వరం: 20kg, ", "పొటాష్: 30kg (ఎకరానికి)"],
      en: ["Nitrogen: 40kg, ", "Phosphorus: 20kg, ", "Potash: 30kg (Per Acre)"]
    },
    schemes: [
      { name: { te: "ఉద్యానవన శాఖ డ్రిప్ సబ్సిడీ (AP/TS)", en: "Drip Irrigation Subsidy (AP/TS)" }, link: "http://horticulture.tg.nic.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "NHM - ఉద్యానవన యంత్రాల సబ్సిడీ", en: "NHM - Machinery Subsidy" }, link: "https://midh.gov.in" }
    ],
    markets: [
      { name: { te: "AP/TS పుచ్చకాయ మార్కెట్ ధరలు", en: "Watermelon Market Prices" }, link: "https://https://www.napanta.com/agri-commodity-prices/telangana/water-melon/" },
      { name: { te: "కోయంబేడు మార్కెట్ ధరలు (Export Hub)", en: "Koyambedu Market Rates" }, link: "https://vegetablemarketprice.com/fruits/koyambedu/today" }
    ],
    videos: [
      { title: { te: "పుచ్చకాయ సాగులో అధిక దిగుబడి సూత్రాలు", en: "Watermelon Farming High Yield Tips" }, link: "https://www.youtube.com/results?search_query=Watermelon+Farming+High+Yield+Tips+in+telugu+annadata" },
      { title: { te: "పుచ్చకాయలో పండు ఈగ నివారణ", en: "Fruit Fly Management in Watermelon" }, link: "https://www.youtube.com/results?search_query=fruit+fly+management+in+watermelon+in+telugu" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "onion",
    name: { te: "ఉల్లి (Onion)", en: "Onion (ఉల్లి)" },
    basic: {
      season: { te: "రబీ (అక్టోబర్ - నవంబర్) / ఖరీఫ్ (జూన్ - జూలై)", en: "Rabi (Oct - Nov) / Kharif (June - July)" },
      duration: { te: "120-140 రోజులు", en: "120-140 Days" },
      soil: { te: "నీరు నిలవని సారవంతమైన ఒండ్రు నేలలు / ఎర్ర నేలలు", en: "Well-drained Fertile Loamy / Red Soils" },
      water: { te: "మితం (క్రమబద్ధమైన తడి అవసరం)", en: "Moderate (Regular intervals)" },
      idealTemp: "15°C - 30°C"
    },
    seedVarieties: [
      "Agrifound Dark Red, Agrifound Light Red (Storage friendly)",
      "Pusa Red, Pusa Ratnar",
      "Baswant-780 (High Yielding)",
      "Private Hybrids: NHRDF-Red, Ellora, Prema-178"
    ],
    pestsAndDiseases: [
      { te: "తామర పురుగులు (Thrips)", en: "Thrips" },
      { te: "పర్పుల్ బ్లాచ్ (Purple Blotch)", en: "Purple Blotch / Leaf Spot" },
      { te: "వేరు కుళ్లు తెగులు (Root Rot)", en: "Root Rot / Damping off" }
    ],
    practicalTips: [
      { te: "ఉల్లి కోసే 15 రోజుల ముందు నీరు ఆపేయాలి, అప్పుడే నిల్వ సామర్థ్యం పెరుగుతుంది.", en: "Stop irrigation 15 days before harvest to increase storage life." },
      { te: "కోసిన తర్వాత పొలంలోనే 3-4 రోజులు ఆరబెట్టాలి (Curing).", en: "Cure the onions in the field for 3-4 days after harvest." },
      { te: "ఉల్లి గడ్డలు పగలకుండా మరియు రంగు మారకుండా ఉండటానికి పొటాష్ ఎరువులు తప్పనిసరి.", en: "Potash fertilizers are essential for bulb firmness and skin color." },
      { te: "తేమ ఎక్కువగా ఉంటే 'పర్పుల్ బ్లాచ్' తెగులు వస్తుంది, దీనికి మ్యాంకోజెబ్ పిచికారీ చేయాలి.", en: "Spray Mancozeb to control Purple Blotch during high humidity." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 40-60kg, ", "భాస్వరం: 30kg, ", "పొటాష్: 30kg (ఎకరానికి)"],
      en: ["Nitrogen: 40-60kg, ", "Phosphorus: 30kg, ", "Potash: 30kg (Per Acre)"]
    },
    schemes: [
      { name: { te: "ఉల్లి నిల్వ గదుల సబ్సిడీ (Onion Storage Structure)", en: "Onion Storage Subsidy" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "MIDH - ఉద్యానవన అభివృద్ధి పథకం", en: "MIDH Horticulture Development" }, link: "https://midh.gov.in" }
    ],
    markets: [
      { name: { te: "కర్నూలు ఉల్లి మార్కెట్ ధరలు (Live)", en: "Kurnool Onion Market Rates" }, link: "https://www.kisandeals.com/mandiprices/ONION/ANDHRA-PRADESH/KURNOOL" },
      { name: { te: "లాసల్గావ్ మార్కెట్ (India's Largest)", en: "Lasalgaon Market Rates" }, link: "https://www.napanta.com/market-price/maharashtra/nashik/lasalgaon" }
    ],
    videos: [
      { title: { te: "ఉల్లి సాగులో మెళకువలు మరియు నిల్వ పద్ధతులు", en: "Onion Cultivation & Storage Tips" }, link: "https://www.youtube.com/results?search_query=onion+cultivation+%26+storage+tips+in+telugu+annadata" },
      { title: { te: "ఉల్లిలో తామర పురుగు నివారణ", en: "Thrips Management in Onion" }, link: "https://www.youtube.com/results?search_query=Thrips+Management+in+Onion+in+telugu" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "banana",
    name: { te: "అరటి (Banana)", en: "Banana (అరటి)" },
    basic: {
      season: { te: "ఏడాది పొడవునా (ముఖ్యంగా జూన్-జూలై / సెప్టెంబర్-అక్టోబర్)", en: "Year-round (Mainly June-July / Sept-Oct)" },
      duration: { te: "11-13 నెలలు", en: "11-13 Months" },
      soil: { te: "నీరు నిలవని సారవంతమైన ఒండ్రు నేలలు / నల్ల రేగడి", en: "Well-drained Fertile Alluvial / Black Soils" },
      water: { te: "ఎక్కువ (డ్రిప్ ఇరిగేషన్ శ్రేయస్కరం)", en: "High (Drip irrigation is highly recommended)" },
      idealTemp: "20°C - 35°C"
    },
    seedVarieties: [
      "Grand Naine (G9) - Best for Export (టిష్యూ కల్చర్)",
      "Tella Chakrakeli (Speciality of AP)",
      "Karpura Chakrakeli (Long shelf life)",
      "Yelakki / Robusta"
    ],
    pestsAndDiseases: [
      { te: "సిగాటోకా ఆకుమచ్చ తెగులు (Sigatoka Leaf Spot)", en: "Sigatoka Leaf Spot" },
      { te: "పనామా విల్ట్ (Panama Wilt)", en: "Panama Wilt (Soil-borne)" },
      { te: "మొవ్వు కుళ్లు తెగులు (Bunchy Top)", en: "Bunchy Top Virus" },
      { te: "పిండి నల్లి / తామర పురుగులు", en: "Mealy Bugs / Thrips" }
    ],
    practicalTips: [
      { te: "టిష్యూ కల్చర్ మొక్కలను వాడటం వల్ల ఏకరీతి ఎదుగుదల మరియు అధిక దిగుబడి వస్తుంది.", en: "Use Tissue Culture plants for uniform growth and higher yields." },
      { te: "గాలి వానల నుండి రక్షణకు తోట చుట్టూ గాలిని అడ్డుకునే చెట్లు (Windbreaks) నాటాలి.", en: "Plant windbreaks like Casuarina around the farm to prevent wind damage." },
      { te: "అరటి గెలలపై ప్లాస్టిక్ కవర్లు (Bunch covers) కప్పడం వల్ల గీతలు పడకుండా నాణ్యత పెరుగుతుంది.", en: "Using Bunch Covers protects fruits from pests and improves export quality." },
      { te: "పిలకలను ఎప్పటికప్పుడు తొలగించడం (Desuckering) వల్ల తల్లి మొక్కకు బలం అందుతుంది.", en: "Regular desuckering is essential to ensure the main plant gets full nutrients." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 200g, భాస్వరం: 50g, పొటాష్: 300g (ప్రతి మొక్కకు - విడతలుగా)"],
      en: ["Nitrogen: 200g, Phosphorus: 50g, Potassium: 300g (Per plant - split doses)"]
    },
    schemes: [
      { name: { te: "టిష్యూ కల్చర్ సబ్సిడీ (Horticulture)", en: "Tissue Culture Subsidy" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "డ్రిప్ ఇరిగేషన్ సబ్సిడీ (APMIP/TSMIP)", en: "Micro Irrigation Subsidy" }, link: "http://horticulture.tg.nic.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" }
    ],
    markets: [
      { name: { te: "కడప అరటి మార్కెట్ ధరలు (Live)", en: "Kadapa Banana Market Rates" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/banana/" },
      { name: { te: "ఖమ్మం అరటి ధరలు", en: "Khammam Banana Prices" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/banana/" }
    ],
    videos: [
      { title: { te: "అరటి సాగులో మేలైన యాజమాన్యం", en: "Banana Farming Management Telugu" }, link: "https://www.youtube.com/results?search_query=Banana+Farming+Management+Telugu+in+annadata" },
      { title: { te: "అరటిలో సిగాటోకా తెగులు నివారణ", en: "Sigatoka Control in Banana" }, link: "https://www.youtube.com/results?search_query=Sigatoka+Control+in+Banana+annadata" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
  {
    id: "potato",
    name: { te: "బంగాళదుంప (Potato)", en: "Potato (బంగాళదుంప)" },
    basic: {
      season: { te: "శీతాకాలం (అక్టోబర్ - నవంబర్ విత్తుకోవాలి)", en: "Winter (Sow in Oct - Nov)" },
      duration: { te: "90-120 రోజులు", en: "90-120 Days" },
      soil: { te: "నీరు నిలవని సారవంతమైన ఇసుక నేలలు / ఒండ్రు నేలలు", en: "Well-drained Fertile Sandy Loams / Alluvial Soils" },
      water: { te: "మితం (క్రమబద్ధమైన తేమ అవసరం)", en: "Moderate (Requires consistent moisture)" },
      idealTemp: "15°C - 25°C"
    },
    seedVarieties: [
      "Kufri Jyoti, Kufri Bahar (High Yielding)",
      "Kufri Pukhraj (Early Maturing)",
      "Kufri Badshah, Kufri Chandramukhi",
      "Kufri Sindhuri (Red Skin Variety)"
    ],
    pestsAndDiseases: [
      { te: "అర్లీ బ్లైట్ / లేట్ బ్లైట్ (Late Blight)", en: "Early & Late Blight" },
      { te: "ఆకు ముడత వైరస్ (Leaf Roll Virus)", en: "Leaf Roll Virus / Mosaic" },
      { te: "దుంప కుళ్లు తెగులు (Soft Rot)", en: "Soft Rot / Common Scab" },
      { te: "పెను బంక (Aphids)", en: "Aphids" }
    ],
    practicalTips: [
      { te: "విత్తే ముందు విత్తన దుంపలను కోల్డ్ స్టోరేజీ నుండి తీసి 2-3 రోజులు నీడలో ఆరబెట్టాలి (Sprouting).", en: "Sprout cold-stored seed tubers in shade for 2-3 days before sowing." },
      { te: "దుంపలు ఆకుపచ్చగా మారకుండా ఉండటానికి మొక్కల మొదళ్లకు మట్టిని ఎగదోయాలి (Earthing up).", en: "Perform Earthing-up at 30-45 days to prevent tubers from turning green." },
      { te: "లేట్ బ్లైట్ తెగులు కనిపిస్తే వెంటనే మాంకోజెబ్ లేదా కాపర్ ఆక్సిక్లోరైడ్ పిచికారీ చేయాలి.", en: "Spray Mancozeb immediately upon noticing Late Blight symptoms." },
      { te: "కోతకు 10-12 రోజుల ముందే మొక్కల పైభాగం (Haulm cutting) తొలగిస్తే దుంపలు గట్టిపడతాయి.", en: "Remove top leaves (Haulm cutting) 10-12 days before harvest for skin hardening." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 60kg, భాస్వరం: 40kg, పొటాష్: 50kg (ఎకరానికి)"],
      en: ["Nitrogen: 60kg, Phosphorus: 40kg, Potassium: 50kg (Per Acre)"]
    },
    schemes: [
      { name: { te: "కోల్డ్ స్టోరేజ్ సబ్సిడీ (NHB)", en: "Cold Storage Subsidy (NHB)" }, link: "https://nhb.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "MIDH - కూరగాయల సాగు సబ్సిడీ", en: "MIDH - Vegetable Cultivation Subsidy" }, link: "https://midh.gov.in" }
    ],
    markets: [
      { name: { te: "హైదరాబాద్ బంగాళదుంప ధరలు (Live)", en: "Hyderabad Potato Prices" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/potato/" },
      { name: { te: "ఆగ్రా మార్కెట్ ధరలు (Main Hub)", en: "Agra Potato Market Rates" }, link: "https://www.kisandeals.com/mandiprices/POTATO/UTTAR-PRADESH/AGRA" }
    ],
    videos: [
      { title: { te: "బంగాళదుంప సాగులో మేలైన యాజమాన్యం", en: "Potato Cultivation Management Telugu" }, link: "https://www.youtube.com/results?search_query=Potato+Cultivation+Management+Telugu" },
      { title: { te: "బంగాళదుంపలో విత్తన శుద్ధి పద్ధతులు", en: "Potato Seed Treatment Methods" }, link: "https://www.youtube.com/results?search_query=potato+seed+treatment+methods+in+telugu" }
    ],
    helpline: [
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "papaya",
    name: { te: "బొప్పాయి (Papaya)", en: "Papaya (బొప్పాయి)" },
    basic: {
      season: { te: "ఏడాది పొడవునా (ముఖ్యంగా జూన్-జూలై / సెప్టెంబర్-అక్టోబర్)", en: "Year-round (Mainly June-July / Sept-Oct)" },
      duration: { te: "9-10 నెలల్లో కోత మొదలవుతుంది", en: "Harvest starts in 9-10 months" },
      soil: { te: "నీరు నిలవని సారవంతమైన ఎర్ర నేలలు / ఒండ్రు నేలలు", en: "Well-drained Fertile Red / Alluvial Soils" },
      water: { te: "మితం (డ్రిప్ ఇరిగేషన్ తప్పనిసరి)", en: "Moderate (Drip irrigation is essential)" },
      idealTemp: "25°C - 35°C"
    },
    seedVarieties: [
      "Red Lady (786) - Most Popular (Hybrid)",
      "Pusa Nanha (Dwarf Variety)",
      "Arka Surya, Arka Prabhath",
      "Co-3, Co-7"
    ],
    pestsAndDiseases: [
      { te: "రింగ్ స్పాట్ వైరస్ (Ring Spot Virus)", en: "Papaya Ring Spot Virus (PRSV)" },
      { te: "పిండి నల్లి (Mealy Bug)", en: "Mealy Bug" },
      { te: "వేరు కుళ్లు / మొదలు కుళ్లు", en: "Root Rot / Stem Rot" },
      { te: "తెల్ల దోమ (Whitefly)", en: "Whitefly (Virus carrier)" }
    ],
    practicalTips: [
      { te: "బొప్పాయిలో వైరస్ నివారణకు తోట చుట్టూ 2 వరుసల్లో మొక్కజొన్న లేదా జొన్నను రక్షణ పంటగా వేయండి.", en: "Grow 2 rows of Maize or Sorghum as a border crop to prevent virus spread." },
      { te: "మొక్క మొదలులో నీరు నిలబడకుండా ఎత్తుగా మట్టిని పోయాలి (Mounding).", en: "Ensure water doesn't stagnate at the base by creating a mound of soil." },
      { te: "రింగ్ స్పాట్ వైరస్ వచ్చిన మొక్కలను వెంటనే పీకేసి కాల్చివేయాలి.", en: "Uproot and burn virus-infected plants immediately to save the rest of the farm." },
      { te: "డ్రిప్ ద్వారా ఎరువులు ఇస్తే (Fertigation) కాయ సైజు మరియు నాణ్యత పెరుగుతుంది.", en: "Using Fertigation improves fruit size and overall market quality." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 250g, భాస్వరం: 250g, పొటాష్: 500g (ఏడాదికి ఒక మొక్కకు)"],
      en: ["Nitrogen: 250g, Phosphorus: 250g, Potassium: 500g (Per plant per year)"]
    },
    schemes: [
      { name: { te: "ఉద్యానవన శాఖ మొక్కల సబ్సిడీ", en: "Horticulture Plant Subsidy" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "డ్రిప్ ఇరిగేషన్ సబ్సిడీ (APMIP/TSMIP)", en: "Micro Irrigation Subsidy" }, link: "http://horticulture.tg.nic.in" }
    ],
    markets: [
      { name: { te: "AP బొప్పాయి మార్కెట్ ధరలు", en: "AP Papaya Market Rates" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/papaya/" },
      { name: { te: "హైదరాబాద్ ఫ్రూట్ మార్కెట్ (గడ్డిఅన్నారం)", en: "Hyderabad Fruit Market Rates" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/papaya/" }
    ],
    videos: [
      { title: { te: "బొప్పాయి సాగులో లాభదాయకమైన పద్ధతులు", en: "Profitable Papaya Farming Tips" }, link: "https://www.youtube.com/results?search_query=Profitable+Papaya+Farming+Tips+annadata" },
      { title: { te: "బొప్పాయిలో రింగ్ స్పాట్ వైరస్ నివారణ", en: "Ring Spot Virus Control in Papaya" }, link: "https://www.youtube.com/results?search_query=Ring+Spot+Virus+Control+in+Papaya" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
  {
    id: "guava",
    name: { te: "జామ (Guava)", en: "Guava (జామ)" },
    basic: {
      season: { te: "జూన్ - జూలై / సెప్టెంబర్ - అక్టోబర్", en: "June - July / Sept - Oct" },
      duration: { te: "2-3 ఏళ్లలో పూర్తి దిగుబడి మొదలవుతుంది", en: "Full yield starts in 2-3 years" },
      soil: { te: "నీరు నిలవని సారవంతమైన నేలలు / ఎర్ర నేలలు", en: "Well-drained Fertile / Red Soils" },
      water: { te: "మితం (డ్రిప్ ఇరిగేషన్ చాలా అవసరం)", en: "Moderate (Drip irrigation is highly recommended)" },
      idealTemp: "20°C - 30°C"
    },
    seedVarieties: [
      "Allahabad Safeda (Most Popular)",
      "Lucknow-49 (L-49 / Sardar)",
      "Arka Kiran (Pink Flesh)",
      "VNR Bihi (Jumbo Size - High Market Demand)",
      "Taiwan Pink"
    ],
    pestsAndDiseases: [
      { te: "పండు ఈగ (Fruit Fly)", en: "Fruit Fly" },
      { te: "పిండి నల్లి (Mealy Bug)", en: "Mealy Bug" },
      { te: "ఎండు తెగులు (Wilt Disease)", en: "Wilt Disease" },
      { te: "ఆంత్రాక్నోస్ / కాయ మచ్చ తెగులు", en: "Anthracnose / Fruit Spot" }
    ],
    practicalTips: [
      { te: "జామలో 'ప్రూనింగ్' (Pruning) చేయడం వల్ల కొమ్మలు ఎక్కువగా వచ్చి దిగుబడి రెట్టింపు అవుతుంది.", en: "Regular Pruning encourages more branching and doubles the yield." },
      { te: "పండు ఈగ నివారణకు గెలలకు/కాయలకు ఫోమ్ నెట్స్ (Foam Nets) వాడటం వల్ల నాణ్యత పెరుగుతుంది.", en: "Use Foam Nets or Fruit Bags to prevent Fruit Fly attacks and improve skin quality." },
      { te: "వేసవిలో పూత రాకుండా చేసి (Bahar Treatment), చలికాలంలో దిగుబడి వచ్చేలా ప్లాన్ చేస్తే లాభాలు బాగుంటాయి.", en: "Manage flowering (Bahar treatment) to ensure harvest during high-demand winter months." },
      { te: "అల్ట్రా హై డెన్సిటీ (UHDP) పద్ధతిలో తక్కువ స్థలంలో ఎక్కువ మొక్కలు నాటవచ్చు.", en: "Ultra High Density Planting allows more plants per acre for maximum profit." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 600g, భాస్వరం: 400g, పొటాష్: 600g (ఏడాదికి ఒక మొక్కకు - విడతలుగా)"],
      en: ["Nitrogen: 600g, Phosphorus: 400g, Potassium: 600g (Per plant per year - split doses)"]
    },
    schemes: [
      { name: { te: "ఉద్యానవన శాఖ తోటల పెంపకం సబ్సిడీ", en: "Horticulture Plantation Subsidy" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "డ్రిప్ ఇరిగేషన్ సబ్సిడీ (APMIP/TSMIP)", en: "Micro Irrigation Subsidy" }, link: "http://horticulture.tg.nic.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" }
    ],
    markets: [
      { name: { te: "AP/TS జామ మార్కెట్ ధరలు", en: "AP/TS Guava Market Prices" }, link: "https://www.napanta.com/agri-commodity-prices/andhra-pradesh/guava/" },
      { name: { te: "హైదరాబాద్ ఫ్రూట్ మార్కెట్ లైవ్ రేట్లు", en: "Hyderabad Fruit Market Live Rates" }, link: "https://www.napanta.com/market-price/telangana/hyderabad/gaddiannaram" }
    ],
    videos: [
      { title: { te: "జామ సాగులో ప్రూనింగ్ మరియు యాజమాన్యం", en: "Guava Pruning & Farming Management" }, link: "https://www.youtube.com/results?search_query=Guava+Pruning+%26+Farming+Management+annadata" },
      { title: { te: "VNR బిహి జామ సాగు ప్రత్యేకతలు", en: "VNR Bihi Guava Farming Details" }, link: "https://www.youtube.com/results?search_query=vnr+bihi+guava+farming+details+in+telugu" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
  {
    id: "mango",
    name: { te: "మామిడి (Mango)", en: "Mango (మామిడి)" },
    basic: {
      season: { te: "జూన్ - జూలై (నాట్లు) / డిసెంబర్ - జనవరి (పూత)", en: "June - July (Planting) / Dec - Jan (Flowering)" },
      duration: { te: "4-5 ఏళ్లలో దిగుబడి మొదలవుతుంది", en: "Yield starts in 4-5 years" },
      soil: { te: "నీరు నిలవని సారవంతమైన ఎర్ర నేలలు / గులక నేలలు", en: "Well-drained Red Gravelly / Fertile Soils" },
      water: { te: "మితం (పూత దశలో జాగ్రత్త వహించాలి)", en: "Moderate (Critical during flowering)" },
      idealTemp: "24°C - 35°C"
    },
    seedVarieties: [
      "Banganapalli (Benishan) - GI Tagged (Most Popular)",
      "Totapuri (Collector) - Processing focus",
      "Suvarnarekha, Chinna Rasalu",
      "Kesar, Alphonso (High Export Value)",
      "Mallika, Amrapali (Hybrids)"
    ],
    pestsAndDiseases: [
      { te: "తేనె మంచు పురుగు (Mango Hopper)", en: "Mango Hopper" },
      { te: "కాయ తొలిచే పురుగు (Stone Weevil)", en: "Stone Weevil" },
      { te: "బూడిద తెగులు (Powdery Mildew)", en: "Powdery Mildew" },
      { te: "ఆంత్రాక్నోస్ (Anthracnose / Fruit Spot)", en: "Anthracnose / Fruit Spot" }
    ],
    practicalTips: [
      { te: "పూత దశలో 'తేనె మంచు పురుగు' నివారణకు జిగురు అట్టలు మరియు వేప నూనె వాడండి.", en: "Use sticky traps and Neem oil to control Mango Hoppers during flowering." },
      { te: "కాయల నాణ్యత పెంచడానికి గెలలకు బ్యాగింగ్ (Fruit Bagging) చేయడం వల్ల ఎగుమతికి వీలవుతుంది.", en: "Fruit bagging improves skin quality and makes mangoes export-ready." },
      { te: "పంట కోత తర్వాత కొమ్మల కత్తిరింపు (Pruning) చేయడం వల్ల వచ్చే ఏడాది దిగుబడి పెరుగుతుంది.", en: "Post-harvest pruning ensures better sunlight penetration and higher next-year yield." },
      { te: "కాల్షియం క్లోరైడ్ పిచికారీ చేయడం వల్ల కాయలు నిల్వ ఉండే కాలం పెరుగుతుంది.", en: "Spraying Calcium Chloride increases the shelf life of the fruit." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 1kg, భాస్వరం: 0.5kg, పొటాష్: 1kg (10 ఏళ్లు పైబడిన చెట్టుకు - ఏడాదికి)"],
      en: ["Nitrogen: 1kg, Phosphorus: 0.5kg, Potassium: 1kg (Per tree per year for 10+ year old trees)"]
    },
    schemes: [
      { name: { te: "మామిడి తోటల పునరుద్ధరణ పథకం", en: "Mango Orchard Rejuvenation Scheme" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "APEDA - ఎగుమతి ప్రోత్సాహకాలు", en: "APEDA - Export Incentives" }, link: "https://apeda.gov.in" }
    ],
    markets: [
      { name: { te: "నూజివీడు మామిడి మార్కెట్ ధరలు", en: "Nuzvid Mango Market Rates" }, link: "https://www.commodityonline.com/mandiprices/mango/andhra-pradesh" },
      { name: { te: "తెలంగాణ మామిడి మార్కెట్ ధరలు", en: "TS Mango Market Prices" }, link: "https://www.napanta.com/agri-commodity-prices/telangana/mango/" }
    ],
    videos: [
      { title: { te: "మామిడి సాగులో అధిక దిగుబడి రహస్యాలు", en: "Mango Farming Management Telugu" }, link: "https://www.youtube.com/results?search_query=Mango+Farming+Management+Telugu" },
      { title: { te: "మామిడిలో పూత రాలకుండా జాగ్రత్తలు", en: "Mango Flower Drop Control" }, link: "https://www.youtube.com/results?search_query=mango+flower+drop+control+in+telugu" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
    {
    id: "acid-lime",
    name: { te: "నిమ్మ (Acid Lime)", en: "Acid Lime (నిమ్మ)" },
    basic: {
      season: { te: "జూన్ - జూలై / డిసెంబర్ - జనవరి", en: "June - July / Dec - Jan" },
      duration: { te: "3-4 ఏళ్లలో దిగుబడి మొదలవుతుంది", en: "Yield starts in 3-4 years" },
      soil: { te: "నీరు నిలవని సారవంతమైన నేలలు / ఇసుక నేలలు", en: "Well-drained Fertile Soils / Sandy Loams" },
      water: { te: "మితం (వేసవిలో క్రమం తప్పకుండా తడి ఇవ్వాలి)", en: "Moderate (Critical during summer months)" },
      idealTemp: "25°C - 35°C"
    },
    seedVarieties: [
      "Balaji (Canker Resistant)",
      "Pramalini, Vikram",
      "Sai Sharbati (High Yield)",
      "Tenali Selection (Popular in AP)"
    ],
    pestsAndDiseases: [
      { te: "బాక్టీరియల్ కాంకర్ (Bacterial Canker)", en: "Bacterial Canker" },
      { te: "ఆకు తొలిచే పురుగు (Leaf Miner)", en: "Leaf Miner" },
      { te: "పిండి నల్లి / తామర పురుగులు", en: "Mealy Bugs / Thrips" },
      { te: "బెండు తెగులు (Tristeza Virus)", en: "Tristeza Virus / Dieback" }
    ],
    practicalTips: [
      { te: "బాక్టీరియల్ కాంకర్ నివారణకు స్ట్రెప్టోసైక్లిన్ మరియు కాపర్ ఆక్సిక్లోరైడ్ కలిపి పిచికారీ చేయాలి.", en: "Spray Streptocycline with Copper Oxychloride to control Bacterial Canker." },
      { te: "ఆకు తొలిచే పురుగు నివారణకు వేప నూనెను వాడటం వల్ల రసాయనాల ఖర్చు తగ్గుతుంది.", en: "Using Neem oil for Leaf Miner management reduces chemical costs." },
      { te: "చెట్టు మొదళ్లలో నీరు నిలవకుండా చూడాలి, లేదంటే వేరు కుళ్లు వచ్చే ప్రమాదం ఉంది.", en: "Prevent water stagnation at the base to avoid root rot diseases." },
      { te: "వేసవిలో అధిక ధరలు పొందడానికి 'బహార్ ట్రీట్మెంట్' (Bahar Treatment) ద్వారా పూతను నియంత్రించాలి.", en: "Use Bahar Treatment to ensure maximum fruiting during peak summer demand." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 600g, భాస్వరం: 200g, పొటాష్: 300g (ఏడాదికి ఒక మొక్కకు - 5 ఏళ్లు పైబడిన చెట్టుకు)"],
      en: ["Nitrogen: 600g, Phosphorus: 200g, Potassium: 300g (Per tree per year for 5+ year old trees)"]
    },
    schemes: [
      { name: { te: "సిట్రస్ తోటల పునరుద్ధరణ పథకం", en: "Citrus Orchard Rejuvenation" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "MIDH - నిమ్మ సాగు సబ్సిడీ", en: "MIDH - Acid Lime Subsidy" }, link: "https://midh.gov.in" }
    ],
    markets: [
      { name: { te: "గూడూరు/నెల్లూరు నిమ్మ మార్కెట్ ధరలు", en: "Gudur/Nellore Lemon Prices" }, link: "https://www.commodityonline.com/mandiprices/district/andhra-pradesh/nellore/lemon" },
      { name: { te: "నల్గొండ నిమ్మ మార్కెట్ ధరలు", en: "Nalgonda Lemon Market Rates" }, link: "https://www.commodityonline.com/mandiprices/district/telangana/nalgonda/lime" }
    ],
    videos: [
      { title: { te: "నిమ్మ సాగులో అధిక దిగుబడి రహస్యాలు", en: "Acid Lime Farming Management Telugu" }, link: "https://www.youtube.com/results?search_query=Acid+Lime+Farming+Management+Telugu+annadata" },
      { title: { te: "నిమ్మలో కాంకర్ తెగులు నివారణ", en: "Bacterial Canker Control in Lemon" }, link: "https://www.youtube.com/results?search_query=bacterial+canker+control+in+lemon+in+telugu" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" },
      { state: { te: "కిసాన్ కాల్ సెంటర్", en: "Kisan Call Center" }, phone: "1800-180-1551" }
    ]
  },
  {
    id: "custard-apple",
    name: { te: "సీతాఫలం (Custard Apple)", en: "Custard Apple (సీతాఫలం)" },
    basic: {
      season: { te: "జూన్ - జూలై (నాట్లు) / అక్టోబర్ - డిసెంబర్ (కోత)", en: "June - July (Planting) / Oct - Dec (Harvest)" },
      duration: { te: "3-4 ఏళ్లలో దిగుబడి మొదలవుతుంది", en: "Yield starts in 3-4 years" },
      soil: { te: "రాతి నేలలు / నీరు నిలవని ఎర్ర నేలలు", en: "Stony Soils / Well-drained Red Soils" },
      water: { te: "చాలా తక్కువ (వర్షాధారంగా కూడా పండుతుంది)", en: "Very Low (Can grow as rainfed)" },
      idealTemp: "20°C - 30°C"
    },
    seedVarieties: [
      "Balanagar (Most Popular in TS/AP)",
      "Arka Sahan (Hybrid - Less seeds)",
      "NMK-01 (Golden Custard Apple - High Demand)",
      "Mommoth, Washington"
    ],
    pestsAndDiseases: [
      { te: "పిండి నల్లి (Mealy Bug)", en: "Mealy Bug" },
      { te: "కాయ కుళ్లు తెగులు (Anthracnose)", en: "Anthracnose / Fruit Rot" },
      { te: "తామర పురుగులు", en: "Thrips" }
    ],
    practicalTips: [
      { te: "కాయ సైజు పెరగడానికి వేసవిలో డ్రిప్ ద్వారా తడి ఇవ్వడం మేలు.", en: "Drip irrigation during summer helps in increasing fruit size." },
      { te: "పిండి నల్లి నివారణకు వెర్టిసీలియం లెకాని అనే జీవ నియంత్రణ మందు వాడండి.", en: "Use Verticillium lecanii for organic control of Mealy Bugs." },
      { te: "కాయలు కోసిన తర్వాత గాలి తగిలేలా ఉంచితే త్వరగా పాడవువు.", en: "Store harvested fruits in well-ventilated crates to prevent rot." },
      { te: "హ్యాండ్ పాలినేషన్ (Hand Pollination) ద్వారా కాయల సంఖ్యను పెంచవచ్చు.", en: "Hand pollination can significantly increase fruit set and yield." }
    ],
    fertilizerGuide: {
      te: ["నత్రజని: 250g, భాస్వరం: 125g, పొటాష్: 125g (ఒక చెట్టుకు - ఏడాదికి)"],
      en: ["Nitrogen: 250g, Phosphorus: 125g, Potassium: 125g (Per tree per year)"]
    },
    schemes: [
      { name: { te: "ఉద్యానవన శాఖ పండ్ల తోటల పథకం", en: "Horticulture Fruit Plantation" }, link: "https://horticulture.ap.gov.in" },
      { name: { te: "PM-Kisan (Central)", en: "PM-Kisan (Central)" }, link: "https://pmkisan.gov.in" },
      { name: { te: "MOFPI (Central)", en: "MOFPI (Central)" }, link: "https://pmfme.mofpi.gov.in/" }
    ],
    markets: [
      { name: { te: "హైదరాబాద్ సీతాఫలం మార్కెట్ ధరలు", en: "Hyderabad Custard Apple Prices" }, link: "https://www.kisandeals.com/mandiprices/CUSTARD-APPLE-(SHARIFA)/TELANGANA/ALL" },
      { name: { te: "AP సీతాఫలం మార్కెట్ ధరలు", en: "AP Custard Apple Market Rates" }, link: "https://www.oneindia.com/custard-apple-price-in-vijayawada.html" }
    ],
    videos: [
      { title: { te: "సీతాఫలం సాగులో అధిక దిగుబడి రహస్యాలు", en: "Custard Apple Farming Telugu" }, link: "https://www.youtube.com/results?search_query=Custard+Apple+Farming+Telugu+annadata" },
      { title: { te: "NMK-01 సీతాఫలం సాగు ప్రత్యేకతలు", en: "NMK-01 Custard Apple Success Story" }, link: "https://www.youtube.com/results?search_query=nmk-01+custard+apple+success+story+in+telugu" }
    ],
    helpline: [
      { state: { te: "AP ఉద్యానవన హెల్ప్‌లైన్", en: "AP Horticulture Helpline" }, phone: "1800-425-3435" },
      { state: { te: "TS అగ్రికల్చర్ హెల్ప్‌లైన్", en: "TS Agri Helpline" }, phone: "1800-150-1551" }
    ]
  }


];
