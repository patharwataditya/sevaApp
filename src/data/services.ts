// SevaApp service directory.
//
// Scope model:
//  - "national" services apply everywhere in India.
//  - state-scoped services (e.g. "MH") are only shown when the user's detected /
//    selected state matches. Right now Maharashtra ("MH") is fully populated;
//    users in other states still get the full set of national services plus a
//    gentle note that state-specific listings are being added.

export type IoniconName = string;

export type Phone = { label: string; number: string };

export type AppLink = {
  name: string;
  description?: string;
  android?: string;
  ios?: string;
  website?: string;
};

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  department?: string;
  phones?: Phone[];
  website?: string;
  complaintUrl?: string;
  apps?: AppLink[];
  scope: 'national' | 'MH';
  emergency?: boolean; // surfaced as a one-tap dial tile
  femaleOnly?: boolean; // highlighted for users who selected "Female"
  keywords?: string[];
};

export type Category = {
  id: string;
  title: string;
  subtitle: string;
  icon: IoniconName; // Ionicons name
  color: string;
  emergency?: boolean;
};

export const categories: Category[] = [
  {
    id: 'emergency',
    title: 'Emergency',
    subtitle: 'Police · Fire · Ambulance',
    icon: 'alert-circle',
    color: '#D32F2F',
    emergency: true,
  },
  {
    id: 'women-child',
    title: 'Women & Child',
    subtitle: 'Safety & helplines',
    icon: 'female',
    color: '#C2185B',
  },
  {
    id: 'environment',
    title: 'Environment',
    subtitle: 'Pollution & air quality',
    icon: 'leaf',
    color: '#2E7D32',
  },
  {
    id: 'civic',
    title: 'Civic & Complaints',
    subtitle: 'Grievances & sanitation',
    icon: 'megaphone',
    color: '#00796B',
  },
  {
    id: 'health',
    title: 'Health',
    subtitle: 'Hospitals & schemes',
    icon: 'medkit',
    color: '#1565C0',
  },
  {
    id: 'transport',
    title: 'Transport & Traffic',
    subtitle: 'RTO · challans · buses',
    icon: 'car',
    color: '#5E35B1',
  },
  {
    id: 'documents',
    title: 'Govt Documents',
    subtitle: 'Certificates & IDs',
    icon: 'document-text',
    color: '#3949AB',
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Scholarships & schemes',
    icon: 'school',
    color: '#00838F',
  },
  {
    id: 'agriculture',
    title: 'Agriculture',
    subtitle: 'Land records & PM-KISAN',
    icon: 'nutrition',
    color: '#558B2F',
  },
  {
    id: 'employment',
    title: 'Employment',
    subtitle: 'Jobs & skilling',
    icon: 'briefcase',
    color: '#6D4C41',
  },
];

export const services: Service[] = [
  // ─────────────────────────── EMERGENCY ───────────────────────────
  {
    id: 'em-112',
    categoryId: 'emergency',
    name: 'All Emergencies (112)',
    description:
      'Single pan-India emergency number for Police, Fire, Medical and Disaster help. Connects you to the State Emergency Response Centre with your location.',
    department: 'Ministry of Home Affairs — ERSS',
    phones: [{ label: 'Emergency', number: '112' }],
    apps: [
      {
        name: '112 India',
        description:
          'Panic app for police, fire, medical & disaster emergencies with a SHOUT alert for women & child safety.',
        android:
          'https://play.google.com/store/apps/details?id=in.cdac.ners.psa.mobile.android.national',
        ios: 'https://apps.apple.com/in/app/112-india/id1441951304',
      },
    ],
    scope: 'national',
    emergency: true,
    keywords: ['emergency', 'sos', '112', 'help', 'panic', 'danger'],
  },
  {
    id: 'em-police',
    categoryId: 'emergency',
    name: 'Police (100)',
    description: 'Dial for any police emergency, crime in progress or immediate danger.',
    department: 'State Police',
    phones: [
      { label: 'Police', number: '100' },
      { label: 'Emergency (ERSS)', number: '112' },
    ],
    complaintUrl:
      'https://citizen.mahapolice.gov.in/citizen/mh/index.aspx',
    scope: 'national',
    emergency: true,
    keywords: ['police', 'crime', 'theft', 'robbery', '100', 'fir', 'law'],
  },
  {
    id: 'em-fire',
    categoryId: 'emergency',
    name: 'Fire Brigade (101)',
    description: 'Fire, gas leak, building collapse or rescue emergencies.',
    department: 'Fire & Emergency Services',
    phones: [
      { label: 'Fire', number: '101' },
      { label: 'Emergency (ERSS)', number: '112' },
    ],
    scope: 'national',
    emergency: true,
    keywords: ['fire', 'fire hazard', 'gas leak', 'burn', 'rescue', '101', 'smoke'],
  },
  {
    id: 'em-ambulance-108',
    categoryId: 'emergency',
    name: 'Ambulance (108)',
    description: 'Free emergency ambulance for accidents and medical emergencies.',
    department: 'Emergency Medical Services',
    phones: [
      { label: 'Ambulance', number: '108' },
      { label: 'Emergency (ERSS)', number: '112' },
    ],
    scope: 'national',
    emergency: true,
    keywords: ['ambulance', 'medical', 'accident', 'hospital', '108', 'injury', 'heart'],
  },
  {
    id: 'em-ambulance-102',
    categoryId: 'emergency',
    name: 'Ambulance — Mother & Child (102)',
    description: 'Free ambulance service dedicated to pregnant women and infants.',
    department: 'National Health Mission',
    phones: [{ label: 'Ambulance (102)', number: '102' }],
    scope: 'national',
    emergency: true,
    keywords: ['ambulance', 'pregnant', 'pregnancy', 'baby', 'infant', 'delivery', '102'],
  },
  {
    id: 'em-disaster',
    categoryId: 'emergency',
    name: 'Disaster Management (SACHET)',
    description:
      'Real-time geo-targeted alerts for floods, cyclones, earthquakes, heatwaves and landslides with Dos & Don’ts and helplines in 12 languages.',
    department: 'National Disaster Management Authority (NDMA)',
    phones: [{ label: 'Emergency (ERSS)', number: '112' }],
    website: 'https://sachet.ndma.gov.in/',
    apps: [
      {
        name: 'SACHET — Disaster Alerts',
        description: 'Early-warning alerts and IMD weather forecasts.',
        android: 'https://play.google.com/store/apps/details?id=com.cdotindia.capsachet',
        ios: 'https://apps.apple.com/in/app/sachet/id6443882278',
      },
    ],
    scope: 'national',
    keywords: ['disaster', 'flood', 'cyclone', 'earthquake', 'heatwave', 'landslide', 'ndma', 'alert'],
  },

  // ─────────────────────────── WOMEN & CHILD ───────────────────────────
  {
    id: 'wc-women-181',
    categoryId: 'women-child',
    name: 'Women Helpline (181)',
    description:
      '24×7 national support for women facing domestic violence, harassment or distress — counselling, legal guidance and rescue coordination.',
    department: 'Ministry of Women & Child Development',
    phones: [
      { label: 'National Women Helpline', number: '181' },
      { label: 'Emergency', number: '112' },
    ],
    scope: 'national',
    femaleOnly: true,
    emergency: true,
    keywords: ['women', 'female', 'harassment', 'domestic violence', 'distress', '181', 'safety'],
  },
  {
    id: 'wc-women-1091',
    categoryId: 'women-child',
    name: 'Maharashtra Women Helpline (1091)',
    description:
      'Dedicated Maharashtra women’s safety line coordinated with local police stations.',
    department: 'Maharashtra Police',
    phones: [
      { label: 'Women Helpline', number: '1091' },
      { label: 'Control Room', number: '02222633333' },
    ],
    scope: 'MH',
    femaleOnly: true,
    emergency: true,
    keywords: ['women', 'female', 'maharashtra', '1091', 'helpline', 'safety'],
  },
  {
    id: 'wc-child-1098',
    categoryId: 'women-child',
    name: 'CHILDLINE (1098)',
    description:
      '24-hour toll-free emergency service for children in need of care and protection. A team aims to reach a child in distress within 60 minutes.',
    department: 'Ministry of Women & Child Development — Mission Vatsalya',
    phones: [{ label: 'Child Helpline', number: '1098' }],
    website: 'https://childlineindia.org/',
    scope: 'national',
    keywords: ['child', 'children', 'kid', 'childline', '1098', 'protection', 'abuse'],
  },
  {
    id: 'wc-cyber-1930',
    categoryId: 'women-child',
    name: 'Cyber Crime Helpline (1930)',
    description:
      'Report online fraud, financial cyber crime and social-media harassment. Quick reporting helps freeze fraudulent transactions.',
    department: 'Indian Cyber Crime Coordination Centre (I4C)',
    phones: [{ label: 'Cyber Crime', number: '1930' }],
    website: 'https://cybercrime.gov.in/',
    scope: 'national',
    keywords: ['cyber', 'fraud', 'online', 'scam', 'money', '1930', 'harassment', 'otp'],
  },

  // ─────────────────────────── ENVIRONMENT ───────────────────────────
  {
    id: 'env-mpcb',
    categoryId: 'environment',
    name: 'Pollution Control Board (MPCB)',
    description:
      'Report industrial and waste pollution with geotagged photos/videos and track complaint status. Handles consents, NOCs and environmental info.',
    department: 'Maharashtra Pollution Control Board',
    phones: [
      { label: 'Helpline', number: '02267808888' },
      { label: 'Helpline 2', number: '02224020781' },
    ],
    website: 'https://mpcb.gov.in/',
    apps: [
      {
        name: 'Maha Paryavaran',
        description: 'Report pollution issues with geotagged media and live status tracking.',
        android: 'https://play.google.com/store/apps/details?id=com.maha.paryavaran',
        ios: 'https://apps.apple.com/in/app/maha-paryavaran/id6746112134',
      },
    ],
    scope: 'MH',
    keywords: ['pollution', 'mpcb', 'industrial', 'waste', 'environment', 'noc'],
  },
  {
    id: 'env-aqi',
    categoryId: 'environment',
    name: 'Air Quality (SAMEER / CPCB)',
    description:
      'Hourly National Air Quality Index (AQI) updates and the ability to register and track air-pollution complaints.',
    department: 'Central Pollution Control Board',
    website: 'https://app.cpcbccr.com/AQI_India/',
    apps: [
      {
        name: 'SAMEER',
        description: 'Hourly AQI and air-pollution complaints.',
        android: 'https://play.google.com/store/apps/details?id=com.cpcb',
        website: 'https://airquality.cpcb.gov.in/',
      },
      {
        name: 'SAFAR-Air',
        description: '1-day & 3-day air quality + weather forecasts with health advisories.',
        android:
          'https://play.google.com/store/apps/details?id=com.cloud.mobile.android.airqualityindex',
        ios: 'https://apps.apple.com/in/app/safar-air/id982823016',
        website: 'https://safar.tropmet.res.in/',
      },
    ],
    scope: 'national',
    keywords: ['air', 'aqi', 'quality', 'pollution', 'smog', 'sameer', 'safar'],
  },

  // ─────────────────────────── CIVIC & COMPLAINTS ───────────────────────────
  {
    id: 'civ-aaple-sarkar',
    categoryId: 'civic',
    name: 'Aaple Sarkar Grievance',
    description:
      'Maharashtra’s single-window grievance portal against village, taluka, district or Mantralaya offices. Each grievance gets a trackable token, addressed within 21 working days.',
    department: 'Chief Minister’s Office, Govt. of Maharashtra',
    phones: [{ label: 'Citizen Call Centre (24×7)', number: '18001208040' }],
    website: 'https://grievances.maharashtra.gov.in/en',
    complaintUrl: 'https://grievances.maharashtra.gov.in/en',
    scope: 'MH',
    keywords: ['grievance', 'complaint', 'aaple sarkar', 'municipal', 'government', 'token'],
  },
  {
    id: 'civ-swachhata',
    categoryId: 'civic',
    name: 'Sanitation & Garbage (Swachhata)',
    description:
      'Report garbage dumps, unclean public toilets and civic issues. Complaints auto-route to the local Urban Local Body sanitary inspector with status tracking.',
    department: 'Ministry of Housing & Urban Affairs',
    phones: [{ label: 'Helpline', number: '1969' }],
    website: 'https://swachhata.mygov.in/',
    apps: [
      {
        name: 'Swachhata-MoHUA',
        description: 'Report civic & sanitation issues to your local body.',
        android:
          'https://play.google.com/store/apps/details?id=com.ichangemycity.swachhbharat',
        ios: 'https://apps.apple.com/in/app/swachhata-mohua/id1124033628',
      },
    ],
    scope: 'national',
    keywords: ['garbage', 'sanitation', 'toilet', 'clean', 'swachh', 'civic', 'waste', '1969'],
  },
  {
    id: 'civ-cpgrams',
    categoryId: 'civic',
    name: 'Central Grievances (CPGRAMS)',
    description:
      '24×7 platform connecting all central ministries and state governments to lodge and track public-service grievances, with an appeal facility.',
    department: 'Dept. of Administrative Reforms & Public Grievances, Govt. of India',
    website: 'https://pgportal.gov.in/',
    complaintUrl: 'https://pgportal.gov.in/',
    scope: 'national',
    keywords: ['grievance', 'complaint', 'central', 'cpgrams', 'ministry', 'government'],
  },

  // ─────────────────────────── HEALTH ───────────────────────────
  {
    id: 'hl-ayushman',
    categoryId: 'health',
    name: 'Ayushman Bharat (PM-JAY)',
    description:
      'Cashless treatment up to ₹5 lakh per family per year at empanelled hospitals. Check eligibility, generate your Ayushman card and find hospitals.',
    department: 'National Health Authority',
    phones: [
      { label: 'Helpline', number: '14555' },
      { label: 'Toll-free', number: '1800111565' },
    ],
    website: 'https://pmjay.gov.in/',
    apps: [
      {
        name: 'Ayushman App',
        description: 'Check eligibility, generate card via e-KYC, locate empanelled hospitals.',
        android: 'https://play.google.com/store/apps/details?id=com.beneficiaryapp',
        ios: 'https://apps.apple.com/in/app/ayushman-app/id6740080642',
      },
    ],
    scope: 'national',
    keywords: ['health', 'ayushman', 'hospital', 'insurance', 'pmjay', 'card', 'treatment'],
  },
  {
    id: 'hl-mjpjay',
    categoryId: 'health',
    name: 'MJPJAY (Maharashtra)',
    description:
      'Maharashtra state health-assurance scheme (MJPJAY 2.0) offering cashless hospitalisation up to ₹5 lakh per family per year at empanelled hospitals.',
    department: 'Public Health Dept., Govt. of Maharashtra',
    website: 'https://www.jeevandayee.gov.in/',
    scope: 'MH',
    keywords: ['health', 'mjpjay', 'jeevandayee', 'hospital', 'maharashtra', 'scheme'],
  },

  // ─────────────────────────── TRANSPORT ───────────────────────────
  {
    id: 'tr-mparivahan',
    categoryId: 'transport',
    name: 'Driving Licence & RC (mParivahan)',
    description:
      'Carry a digital DL and RC, check vehicle/owner details, PUC and insurance validity, locate the nearest RTO and pay e-Challans.',
    department: 'Ministry of Road Transport & Highways',
    website: 'https://parivahan.gov.in/',
    apps: [
      {
        name: 'mParivahan',
        description: 'Digital DL/RC, vehicle details, e-Challan payment.',
        website: 'https://parivahan.gov.in/',
      },
    ],
    scope: 'national',
    keywords: ['rto', 'licence', 'license', 'rc', 'vehicle', 'challan', 'puc', 'parivahan', 'car', 'bike'],
  },
  {
    id: 'tr-traffic',
    categoryId: 'transport',
    name: 'Traffic Police & Challans',
    description:
      'Report traffic violations with geo-tagged photos/videos, receive challan notifications and pay e-challans.',
    department: 'Maharashtra Traffic Police',
    phones: [{ label: 'Traffic Helpline (Mumbai)', number: '1073' }],
    apps: [
      {
        name: 'MahaTrafficapp',
        description: 'Two-way citizen ↔ traffic police reporting and challan payment.',
        android:
          'https://play.google.com/store/apps/details?id=com.sparken.maharashtra.mtpkotlinapp',
      },
    ],
    scope: 'MH',
    keywords: ['traffic', 'challan', 'violation', 'police', 'road', '1073'],
  },
  {
    id: 'tr-msrtc',
    categoryId: 'transport',
    name: 'ST Buses (MSRTC Aapli ST)',
    description:
      'Find the nearest bus stand, track running buses live, check timetables and use the in-app SOS for women passengers, breakdowns or medical help.',
    department: 'Maharashtra State Road Transport Corporation',
    phones: [{ label: 'MSRTC Enquiry', number: '02224937746' }],
    apps: [
      {
        name: 'MSRTC Aapli ST',
        description: 'Live bus tracking, timetables and in-app SOS.',
        android: 'https://play.google.com/store/apps/details?id=com.app.commuter',
      },
      {
        name: 'MSRTC Bus Reservation',
        description: 'Book ST bus seats across Maharashtra.',
        android: 'https://play.google.com/store/apps/details?id=com.itms_consumer.msrtc.msrtc',
      },
    ],
    scope: 'MH',
    keywords: ['bus', 'msrtc', 'st', 'transport', 'travel', 'ticket', 'shivneri'],
  },

  // ─────────────────────────── DOCUMENTS ───────────────────────────
  {
    id: 'doc-aaple-sarkar',
    categoryId: 'documents',
    name: 'Certificates (Aaple Sarkar)',
    description:
      '400+ Maharashtra government services — income, caste and domicile certificates, licences, permits and welfare-scheme applications with online tracking.',
    department: 'Directorate of IT, Govt. of Maharashtra',
    phones: [{ label: 'Helpline', number: '18001208040' }],
    website: 'https://aaplesarkar.mahaonline.gov.in/',
    scope: 'MH',
    keywords: ['certificate', 'income', 'caste', 'domicile', 'licence', 'aaple sarkar', 'document'],
  },
  {
    id: 'doc-digilocker',
    categoryId: 'documents',
    name: 'DigiLocker',
    description:
      'Government digital wallet for Aadhaar, PAN, driving licence, RC and marksheets — legally at par with physical originals.',
    department: 'Ministry of Electronics & IT',
    website: 'https://digilocker.gov.in/',
    apps: [{ name: 'DigiLocker', website: 'https://digilocker.gov.in/' }],
    scope: 'national',
    keywords: ['digilocker', 'aadhaar', 'pan', 'documents', 'wallet', 'certificate'],
  },
  {
    id: 'doc-umang',
    categoryId: 'documents',
    name: 'UMANG (All Govt Services)',
    description:
      'Single app for central, state and local government services across India — EPFO, income tax, e-District and CPGRAMS grievance filing.',
    department: 'National e-Governance Division, MeitY',
    phones: [{ label: 'Helpline', number: '18001199847' }],
    website: 'https://web.umang.gov.in/',
    apps: [{ name: 'UMANG', website: 'https://web.umang.gov.in/' }],
    scope: 'national',
    keywords: ['umang', 'government', 'services', 'epfo', 'tax', 'edistrict'],
  },

  // ─────────────────────────── EDUCATION ───────────────────────────
  {
    id: 'edu-mahadbt',
    categoryId: 'education',
    name: 'Scholarships (MahaDBT)',
    description:
      'Apply for post-matric & pre-matric scholarships, fee reimbursement and hostel schemes across SC, ST, OBC, VJNT, SBC and minority categories.',
    department: 'Higher & Technical Education Dept., Govt. of Maharashtra',
    website: 'https://mahadbt.maharashtra.gov.in/',
    scope: 'MH',
    keywords: ['scholarship', 'mahadbt', 'student', 'fee', 'education', 'hostel'],
  },
  {
    id: 'edu-nsp',
    categoryId: 'education',
    name: 'National Scholarship Portal',
    description:
      'Single-window platform for central- and state-sector scholarships across school and higher education.',
    department: 'Ministry of Education, Govt. of India',
    website: 'https://scholarships.gov.in/',
    scope: 'national',
    keywords: ['scholarship', 'nsp', 'student', 'education', 'central'],
  },

  // ─────────────────────────── AGRICULTURE ───────────────────────────
  {
    id: 'ag-mahabhulekh',
    categoryId: 'agriculture',
    name: 'Land Records (Mahabhulekh)',
    description:
      'View 7/12 (Satbara) extracts, 8A records and property cards free of cost. Download a digitally-signed, QR-verified 7/12 valid for banks and courts.',
    department: 'Revenue Dept. (Land Records), Govt. of Maharashtra',
    website: 'https://bhulekh.mahabhumi.gov.in/',
    scope: 'MH',
    keywords: ['land', 'satbara', '7/12', 'mahabhulekh', 'property', 'record', 'farm'],
  },
  {
    id: 'ag-pmkisan',
    categoryId: 'agriculture',
    name: 'PM-KISAN',
    description:
      'Income support for eligible farmer families paid directly to bank accounts in three instalments a year. Check beneficiary status and payments.',
    department: 'Ministry of Agriculture & Farmers Welfare',
    phones: [
      { label: 'Helpline', number: '155261' },
      { label: 'Toll-free', number: '18001155526' },
    ],
    website: 'https://pmkisan.gov.in/',
    scope: 'national',
    keywords: ['farmer', 'pmkisan', 'agriculture', 'income', 'subsidy', 'kisan'],
  },

  // ─────────────────────────── EMPLOYMENT ───────────────────────────
  {
    id: 'emp-ncs',
    categoryId: 'employment',
    name: 'National Career Service (NCS)',
    description:
      'One-stop platform connecting job seekers with employers — vacancies, career counselling, skill courses, apprenticeships and local Rojgar Melas.',
    department: 'Ministry of Labour & Employment',
    phones: [{ label: 'Helpline (Tue–Sun, 8AM–8PM)', number: '18004251514' }],
    website: 'https://www.ncs.gov.in/',
    apps: [
      {
        name: 'National Career Service',
        description: 'Jobs, counselling and skilling.',
        android: 'https://play.google.com/store/apps/details?id=com.gov.ncs',
        ios: 'https://apps.apple.com/us/app/national-career-service-ncs/id6759326457',
      },
    ],
    scope: 'national',
    keywords: ['job', 'employment', 'career', 'ncs', 'skill', 'work', 'rojgar'],
  },
];

// NOTE: `categories` and `services` above are the bundled offline fallback / seed.
// At runtime the app prefers live data from the API (cached locally). Query helpers
// live in ./logic.ts so they can operate on whichever dataset is active.
// The backend seed script (backend/seed.mjs) imports these same arrays.
