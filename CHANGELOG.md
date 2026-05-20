# Changelog - Kisan Khata (v1.2.0) - మే 21, 2026

### 🌾 Branding & Identity
* **Rebranding:** "AgriSnap" నుండి "Kisan Khata" గా మార్చబడింది.
* **Logo:** కొత్త "Book & Leaf" లోగో అప్‌డేట్ చేయబడింది.
* **Splash Screen:** ప్యూర్ వైట్ బ్యాక్‌గ్రౌండ్ మరియు క్లీన్ లోగోతో ప్రొఫెషనల్ ఎంట్రీ స్క్రీన్ సెట్ చేయబడింది.

### 💰 Sales & Expenses
* **Mic Input:** 'Add Sale' లో డిస్క్రిప్షన్ కోసం వాయిస్ ఇన్‌పుట్ (Mic) యాడ్ చేయబడింది.
* **UI/UX:** సేల్స్ కార్డ్స్‌లో గ్రేడ్/డిస్క్రిప్షన్ ని సపరేట్ లైన్ లో wrap అయ్యేలా మార్చాము (ఎంత పెద్ద పేరు ఉన్నా ఓవర్‌ల్యాప్ అవ్వదు).
* **Validation:** సేల్స్ లో మిస్టేక్స్ లేకుండా ఫీల్డ్ వాలిడేషన్స్ స్ట్రిక్ట్ చేయబడ్డాయి.

### 📊 Analytics & Summary
* **Status Badges:** 'Complete' మరియు 'Pending' బ్యాడ్జెస్ యాడ్ చేయబడ్డాయి (యూజర్ కి ఏ డేటా మిస్ అయ్యిందో ఇప్పుడే తెలుస్తుంది).
* **PDF Report:** ఆండ్రాయిడ్ లో PDF క్రాష్ అయ్యే బగ్ (Emoji issue & Newline issue) పూర్తిగా ఫిక్స్ చేయబడింది. 

### ⚙️ Backend & Performance
* **Notification Scaling:** `index.ts` లో FCM టోకెన్స్ కోసం `batch processing` (500 limit) యాడ్ చేయబడింది.
* **Data Health:** ఇన్యాక్టివ్ యూజర్స్ కోసం పాత/ఇన్వాలిడ్ టోకెన్స్ ఆటో-క్లీనప్ లాజిక్ యాడ్ చేయబడింది.


# AgriLog Changelog

## [1.1.0] - మే 20, 2026
- Dashboard: Fixed layout overlap, optimized cards.
- Fields: Added 'Delete Lock' logic (Prevention of deletion if crop data exists).
- Add Field: Implemented 'Edit Mode Lock' for crop names.
- Payment Summary: Keyboard overlap fix & Indian currency formatting (₹).

## [1.1.0] - మే 19, 2026
- Feature: Added Tractor Owner Work module & dynamic calculations.
- Feature: Voice UI for crop/work selection.
- Feature: Side Drawer & FAQs.
- Fixed: Memory leaks & Performance.

## [1.0.0] - మే 13, 2026
- Initial Core Release.