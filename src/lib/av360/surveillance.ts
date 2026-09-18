// Veterinary Surveillance, Outbreak Triage and Epidemiological Decision-Support Engine.
// Designed for District, Block/Taluk, and Village administrative tiers.

export type AdminLevel = "DISTRICT" | "BLOCK" | "VILLAGE";

export type OutbreakSeverity = "CRITICAL" | "HIGH" | "ELEVATED" | "GUARDED" | "NORMAL";

export type LabSampleStatus =
  | "COLLECTED"
  | "IN_TRANSIT_COLD_CHAIN"
  | "AT_DISTRICT_LAB"
  | "PCR_CONFIRMED"
  | "RULED_OUT_NEGATIVE";

export interface OutbreakCluster {
  id: string;
  code: string;
  disease: string;
  icdCode: string;
  species: "CATTLE" | "BUFFALO" | "GOAT" | "SHEEP" | "MULTISPECIES";
  district: string;
  block: string;
  village: string;
  coordinates: [number, number];
  reportedCases: number;
  mortalityCount: number;
  outbreakScore: number; // 0-100
  severity: OutbreakSeverity;
  containmentStatus:
    | "Active Investigation"
    | "Quarantine Perimeter Active"
    | "Ring Vaccination Deployed"
    | "Sample Sent to DDL"
    | "Resolved";
  symptoms: string[];
  firstReportedAt: string;
  lastUpdatedAt: string;
  vaccinationRingKm: number;
  vaccinationCoveragePct: number;
}

export interface LabReferral {
  id: string;
  sampleCode: string;
  animalTag: string;
  species: string;
  sampleType:
    | "Blood / Serum"
    | "Vesicular Swab"
    | "Skin Scrape"
    | "Nasal Exudate"
    | "Tissue Biopsy";
  suspectedPathogen: string;
  village: string;
  block: string;
  collectedBy: string;
  collectedAt: string;
  destinationLab: string;
  status: LabSampleStatus;
  urgency: "Stat Rapid Response" | "Priority Outbreak" | "Routine Surveillance";
  notes?: string;
}

export interface WeatherEpidemiology {
  temperatureC: number;
  relativeHumidityPct: number;
  rainfall24hMm: number;
  standingWaterIndex: "High" | "Moderate" | "Low";
  heatStressCategory: "Normal" | "Alert" | "Danger" | "Emergency";
  vectorRisk: {
    level: "Critical" | "High" | "Moderate" | "Low";
    primaryVectors: string[];
    threatenedPathologies: string[];
    actionAdvice: string;
  };
}

export interface MultilingualAdvisory {
  language: "en" | "hi" | "kn" | "ta" | "te";
  languageName: string;
  title: string;
  diseaseTarget: string;
  containmentNotice: string;
  preventiveDirectives: string[];
  hotline: string;
}

export const DISTRICT_BLOCKS = [
  {
    id: "kolar-central",
    name: "Kolar Central",
    district: "Kolar",
    totalHerds: 480,
    totalAnimals: 3840,
  },
  { id: "malur-west", name: "Malur West", district: "Kolar", totalHerds: 620, totalAnimals: 5120 },
  {
    id: "bangarapet-south",
    name: "Bangarapet South",
    district: "Kolar",
    totalHerds: 540,
    totalAnimals: 4260,
  },
  {
    id: "srinivaspur-north",
    name: "Srinivaspur North",
    district: "Kolar",
    totalHerds: 410,
    totalAnimals: 3350,
  },
  {
    id: "mulbagal-east",
    name: "Mulbagal East",
    district: "Kolar",
    totalHerds: 390,
    totalAnimals: 2980,
  },
] as const;

export const ACTIVE_CLUSTERS: OutbreakCluster[] = [
  {
    id: "cluster-fmd-01",
    code: "CLS-2026-FMD-04",
    disease: "Foot-and-Mouth Disease (FMD)",
    icdCode: "WOAH-FMD-O",
    species: "CATTLE",
    district: "Kolar",
    block: "Malur West",
    village: "Tekal Rural",
    coordinates: [13.015, 78.028],
    reportedCases: 19,
    mortalityCount: 2,
    outbreakScore: 92,
    severity: "CRITICAL",
    containmentStatus: "Quarantine Perimeter Active",
    symptoms: [
      "Oral vesicular ulcerations",
      "Excessive salivation",
      "Interdigital coronary lesions",
      "High pyrexia (40.8C)",
    ],
    firstReportedAt: "2026-09-15T08:30:00Z",
    lastUpdatedAt: "2026-09-18T10:15:00Z",
    vaccinationRingKm: 5,
    vaccinationCoveragePct: 68,
  },
  {
    id: "cluster-lsd-02",
    code: "CLS-2026-LSD-11",
    disease: "Lumpy Skin Disease (LSD)",
    icdCode: "CAPRIPOX-LSDV",
    species: "CATTLE",
    district: "Kolar",
    block: "Srinivaspur North",
    village: "Rayalpadu",
    coordinates: [13.412, 78.318],
    reportedCases: 11,
    mortalityCount: 0,
    outbreakScore: 76,
    severity: "HIGH",
    containmentStatus: "Ring Vaccination Deployed",
    symptoms: [
      "Cutaneous firm nodules (2-5cm)",
      "Enlarged superficial lymph nodes",
      "Ocular discharge",
      "Depression",
    ],
    firstReportedAt: "2026-09-16T11:00:00Z",
    lastUpdatedAt: "2026-09-18T09:40:00Z",
    vaccinationRingKm: 3,
    vaccinationCoveragePct: 82,
  },
  {
    id: "cluster-ppr-03",
    code: "CLS-2026-PPR-02",
    disease: "Peste des Petits Ruminants (PPR)",
    icdCode: "MORBILLI-PPR",
    species: "GOAT",
    district: "Kolar",
    block: "Bangarapet South",
    village: "Kamasamudram",
    coordinates: [12.872, 78.216],
    reportedCases: 14,
    mortalityCount: 3,
    outbreakScore: 84,
    severity: "CRITICAL",
    containmentStatus: "Sample Sent to DDL",
    symptoms: [
      "Severe erosive stomatitis",
      "Muco-purulent catarrhal nasal discharge",
      "Profuse watery diarrhea",
      "High mortality in kids",
    ],
    firstReportedAt: "2026-09-17T06:45:00Z",
    lastUpdatedAt: "2026-09-18T11:20:00Z",
    vaccinationRingKm: 5,
    vaccinationCoveragePct: 54,
  },
  {
    id: "cluster-bq-04",
    code: "CLS-2026-BQ-01",
    disease: "Blackquarter (Clostridial Myositis)",
    icdCode: "CLOSTRID-CHAUVOEI",
    species: "BUFFALO",
    district: "Kolar",
    block: "Kolar Central",
    village: "Sugatur",
    coordinates: [13.189, 78.081],
    reportedCases: 4,
    mortalityCount: 1,
    outbreakScore: 61,
    severity: "ELEVATED",
    containmentStatus: "Active Investigation",
    symptoms: [
      "Crepitating swellings over rump and shoulder",
      "Severe acute lameness",
      "Dry cracked hot skin over lesion",
    ],
    firstReportedAt: "2026-09-17T14:15:00Z",
    lastUpdatedAt: "2026-09-18T07:10:00Z",
    vaccinationRingKm: 2,
    vaccinationCoveragePct: 74,
  },
];

export const LAB_REFERRALS: LabReferral[] = [
  {
    id: "ref-001",
    sampleCode: "DDL-KL-2026-881",
    animalTag: "IND-KA-0941",
    species: "Bovine (Crossbred Jersey)",
    sampleType: "Vesicular Swab",
    suspectedPathogen: "Foot-and-Mouth Disease Virus (Type O/Asia-1)",
    village: "Tekal Rural",
    block: "Malur West",
    collectedBy: "Dr. K. Srinivas (Veterinary Officer)",
    collectedAt: "2026-09-17 10:30",
    destinationLab: "Institute of Animal Health & Vet Biologicals (IAH&VB), Bengaluru",
    status: "AT_DISTRICT_LAB",
    urgency: "Stat Rapid Response",
    notes: "Cold-chain verified at 4.2C during arrival. RT-PCR in progress.",
  },
  {
    id: "ref-002",
    sampleCode: "DDL-KL-2026-882",
    animalTag: "IND-KA-1182",
    species: "Caprine (Sirohi Cross)",
    sampleType: "Nasal Exudate",
    suspectedPathogen: "Peste des Petits Ruminants Virus",
    village: "Kamasamudram",
    block: "Bangarapet South",
    collectedBy: "Para-Vet Ramesh M.",
    collectedAt: "2026-09-17 15:45",
    destinationLab: "District Diagnostic Laboratory, Kolar",
    status: "IN_TRANSIT_COLD_CHAIN",
    urgency: "Priority Outbreak",
    notes: "Dispatched via refrigerated carrier vehicle KA-07-G-4102.",
  },
  {
    id: "ref-003",
    sampleCode: "DDL-KL-2026-879",
    animalTag: "IND-KA-0493",
    species: "Bovine (Holstein Friesian Cross)",
    sampleType: "Skin Scrape",
    suspectedPathogen: "Lumpy Skin Disease Virus (Capripox)",
    village: "Rayalpadu",
    block: "Srinivaspur North",
    collectedBy: "Dr. Anitha Reddy (RRT Lead)",
    collectedAt: "2026-09-16 11:20",
    destinationLab: "District Diagnostic Laboratory, Kolar",
    status: "PCR_CONFIRMED",
    urgency: "Priority Outbreak",
    notes: "Real-time PCR positive for Capripoxvirus DNA. Official notice sent to DVO.",
  },
  {
    id: "ref-004",
    sampleCode: "DDL-KL-2026-875",
    animalTag: "IND-KA-0219",
    species: "Bovine (Indigenous Hallikar)",
    sampleType: "Blood / Serum",
    suspectedPathogen: "Bovine Brucellosis (Brucella abortus)",
    village: "Sugatur",
    block: "Kolar Central",
    collectedBy: "Dr. K. Srinivas (Veterinary Officer)",
    collectedAt: "2026-09-15 09:15",
    destinationLab: "IAH&VB State Reference Lab",
    status: "RULED_OUT_NEGATIVE",
    urgency: "Routine Surveillance",
    notes: "Rose Bengal Plate Test and Serum Agglutination Test both negative.",
  },
];

export const CURRENT_WEATHER_EPI: WeatherEpidemiology = {
  temperatureC: 31.4,
  relativeHumidityPct: 83,
  rainfall24hMm: 42.5,
  standingWaterIndex: "High",
  heatStressCategory: "Alert",
  vectorRisk: {
    level: "High",
    primaryVectors: ["Culicoides biting midges", "Hyalomma anatolicum ticks", "Tabanus horseflies"],
    threatenedPathologies: ["Bovine Theileriosis", "Babesiosis (Redwater)", "Bluetongue in Ovine"],
    actionAdvice:
      "Standing water post-rainfall combined with 83% relative humidity creates ideal midge and tick hatching zones. Initiate mandatory livestock shelter spraying with deltamethrin/flumethrin within 48 hours.",
  },
};

export const MULTILINGUAL_ADVISORIES: Record<
  "en" | "hi" | "kn" | "ta" | "te",
  MultilingualAdvisory
> = {
  en: {
    language: "en",
    languageName: "English",
    title: "Official Animal Husbandry Advisory: FMD & LSD Containment Directive",
    diseaseTarget: "Foot-and-Mouth Disease (FMD) & Lumpy Skin Disease (LSD)",
    containmentNotice:
      "Outbreak surveillance protocol activated for Malur and Srinivaspur taluks following verified clinical reports. All livestock movement within 5km of Tekal and Rayalpadu is restricted.",
    preventiveDirectives: [
      "Isolate animals exhibiting salivation, oral lesions, or nodular skin eruptive lesions immediately.",
      "Disinfect animal sheds and water troughs daily with 4 percent sodium carbonate solution.",
      "Suspend inter-village livestock trade and weekly cattle santhes in the containment perimeter.",
      "Present all healthy cattle and buffaloes to the mobile government vaccination ring team.",
    ],
    hotline: "1800-425-0012 (District Veterinary Disaster Control Room)",
  },
  kn: {
    language: "kn",
    languageName: "ಕನ್ನಡ (Kannada)",
    title: "ಪಶುಪಾಲನಾ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ: ಕಾಲುಬಾಯಿ ಮತ್ತು ಚರ್ಮಗಂಟು ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ",
    diseaseTarget: "ಕಾಲುಬಾಯಿ ರೋಗ (FMD) ಮತ್ತು ಚರ್ಮಗಂಟು ರೋಗ (LSD)",
    containmentNotice:
      "ಮಾಲೂರು ಮತ್ತು ಶ್ರೀನಿವಾಸಪುರ ತಾಲ್ಲೂಕುಗಳಲ್ಲಿ ಸೋಂಕು ದೃಢಪಟ್ಟ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ತುರ್ತು ನಿಗಾ ಜಾರಿಯಲ್ಲಿದೆ. ಟೇಕಲ್ ಮತ್ತು ರಾಯಲಪಾಡು ಸುತ್ತಮುತ್ತಲಿನ 5 ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಜಾನುವಾರು ಸಾಗಣೆ ನಿಷೇಧಿಸಲಾಗಿದೆ.",
    preventiveDirectives: [
      "ಬಾಯಿಯಲ್ಲಿ ಹುಣ್ಣು, ಜೊಲ್ಲು ಸುರಿಸುವ ಅಥವಾ ಮೈಮೇಲೆ ಗಂಟುಗಳುಳ್ಳ ಜಾನುವಾರುಗಳನ್ನು ತಕ್ಷಣ ಪ್ರತ್ಯೇಕಿಸಿ.",
      "ಕೊಟ್ಟಿಗೆ ಮತ್ತು ಕುಡಿಯುವ ನೀರಿನ ತೊಟ್ಟಿಗಳನ್ನು 4 ಪ್ರತಿಶತ ವಾಷಿಂಗ್ ಸೋಡಾ ದ್ರಾವಣದಿಂದ ಪ್ರತಿದಿನ ಸ್ವಚ್ಛಗೊಳಿಸಿ.",
      "ಗ್ರಾಮಗಳ ನಡುವಿನ ಜಾನುವಾರು ಸಂತೆ ಮತ್ತು ವ್ಯಾಪಾರವನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ಮುಂದೂಡಿ.",
      "ಆರೋಗ್ಯವಂತ ಎಲ್ಲಾ ಹಸು ಮತ್ತು ಎಮ್ಮೆಗಳಿಗೆ ಇಲಾಖೆಯ ಉಚಿತ ತುರ್ತು ಲಸಿಕೆ ಹಾಕಿಸಿ.",
    ],
    hotline: "1800-425-0012 (ಜಿಲ್ಲಾ ಪಶು ವೈದ್ಯಕೀಯ ನಿಯಂತ್ರಣ ಕೊಠಡಿ)",
  },
  hi: {
    language: "hi",
    languageName: "हिन्दी (Hindi)",
    title: "पशुपालन विभाग आधिकारिक परामर्श: खुरपका-मुंहपका एवं लंपी त्वचा रोग रोकथाम निर्देश",
    diseaseTarget: "खुरपका-मुंहपका (FMD) एवं लंपी स्किन डिजीज (LSD)",
    containmentNotice:
      "माल्लूर और श्रीनिवासपुर प्रखंड में संक्रमण की पुष्टि के बाद निगरानी प्रोटोकॉल लागू किया गया है। 5 किलोमीटर परिधि में पशु आवागमन प्रतिबंधित है।",
    preventiveDirectives: [
      "लार टपकने, मुंह में छाले अथवा शरीर पर गांठ दिखने पर प्रभावित पशु को तत्काल अलग बाड़े में रखें।",
      "पशुबाड़े और खुरली को 4 प्रतिशत सोडियम कार्बोनेट घोल से प्रतिदिन कीटाणुमुक्त करें।",
      "साप्ताहिक पशु हाट-बाजार और अंतर्ग्राम पशु परिवहन पर तत्काल प्रभाव से रोक लगाएं।",
      "मोबाइल पशु चिकित्सा रिंग टीकाकरण दल से सभी स्वस्थ पशुओं का टीकाकरण सुनिश्चित कराएं।",
    ],
    hotline: "1800-425-0012 (जिला पशु स्वास्थ्य नियंत्रण कक्ष)",
  },
  ta: {
    language: "ta",
    languageName: "தமிழ் (Tamil)",
    title:
      "கால்நடை பராமரிப்புத் துறை அவசர அறிவிப்பு: கோமாரி மற்றும் பெரியம்மை தடுப்பு வழிகாட்டுதல்",
    diseaseTarget: "கோமாரி நோய் (FMD) மற்றும் தோல் கழலை நோய் (LSD)",
    containmentNotice:
      "மாலூர் மற்றும் சீனிவாசபுரம் வட்டாரங்களில் நோய் அறிகுறி கண்டறியப்பட்டதால் 5 கி.மீ சுற்றளவுக்கு கட்டுப்பாட்டு வளையம் அமைக்கப்பட்டுள்ளது. மாட்டுச் சந்தைகள் தற்காலிகமாக நிறுத்தப்பட்டுள்ளன.",
    preventiveDirectives: [
      "வாயில் புண், எச்சில் வடிதல் அல்லது தோலில் முடிச்சுகள் உள்ள கால்நடைகளை உடனே தனிமைப்படுத்தவும்.",
      "கொட்டகைகளை தினமும் 4 சதவீத சோடியம் கார்பனேட் கரைசலால் கிருமி நீக்கம் செய்யவும்.",
      "அண்டை கிராமங்களுக்கு கால்நடைகளை அழைத்துச் செல்வதையும் சந்தை வியாபாரத்தையும் தவிர்க்கவும்.",
      "அரசு நடமாடும் தடுப்பூசிக் குழுவினரிடம் ஆரோக்கியமான கால்நடைகளுக்கு உடனடியாக தடுப்பூசி செலுத்தவும்.",
    ],
    hotline: "1800-425-0012 (மாவட்ட கால்நடை அவசர கட்டுப்பாட்டு மையம்)",
  },
  te: {
    language: "te",
    languageName: "తెలుగు (Telugu)",
    title: "పశుసంవర్ధక శాఖ అధికారిక హెచ్చరిక: గాలికుంటు మరియు లంపీ చర్మ వ్యాధి నియంత్రణ ఉత్తర్వులు",
    diseaseTarget: "గాలికుంటు వ్యాధి (FMD) మరియు లంపీ స్కిన్ డిసీజ్ (LSD)",
    containmentNotice:
      "మాలూరు మరియు శ్రీనివాసపురం మండలాల్లో వ్యాధి లక్షణాలు నమోదు కావడం వలన 5 కి.మీ పరిధిలో పశువుల రవాణాపై ఆంక్షలు విధించబడ్డాయి.",
    preventiveDirectives: [
      "నోటిలో పుండ్లు, లాలాజలం కారడం లేదా ఒంటిపై గడ్డలు ఉన్న పశువులను వెంటనే వేరుచేయండి.",
      "పశువుల పాకలను రోజూ 4 శాతం సోడా ఉప్పు ద్రావణంతో క్రిమిసంహారక శుద్ధి చేయండి.",
      "వారంవారీ పశువుల సంతలు మరియు ఇతర గ్రామాలకు పశువుల అమ్మకాలను తాత్కాలికంగా ఆపండి.",
      "ఆరోగ్యంగా ఉన్న పశువులన్నింటికీ ప్రభుత్వ మొబైల్ బృందాల ద్వారా రింగ్ టీకాలు వేయించండి.",
    ],
    hotline: "1800-425-0012 (జిల్లా పశువైద్య అత్యవసర కేంద్రం)",
  },
};
