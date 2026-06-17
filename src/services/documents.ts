// @BACKEND: API contract for documents:
//   GET    /documents          → Document[]
//   GET    /documents/:id      → Document
//   POST   /documents/upload   → Document (multipart/form-data via FormData)
// All endpoints prefix with BASE_URL (default http://localhost:3001/api)

import { apiClient } from '../lib/api-client';
import { Document, OFFICES } from '../types';

export { OFFICES };

export const MAIN_CATEGORIES = [
  { code: '000', name: 'መተዳደሪያ ደንብ' },
  { code: '100', name: 'የፓርቲ መመሪያዎች' },
  { code: '200', name: 'የኮሚሽን መመሪያዎች' },
  { code: '300', name: 'ዕቅድ' },
  { code: '400', name: 'ሪፖርት' },
  { code: '500', name: 'ቼክ ሊስት' },
  { code: '600', name: 'ግብረ-መልስ' },
  { code: '700', name: 'ልዩ ልዩ ሰነዶች' },
  { code: '800', name: 'ቃለ ጉባዔ' },
  { code: '900', name: 'የመረጃ ቅጾች' },
] as const;

export const SUB_CATEGORIES: Record<string, { code: string; name: string }[]> = {
  '000': [
    { code: '010', name: 'የ2012 መተዳደሪያ ደንብ' },
    { code: '020', name: 'የ2014 መተዳደሪያ ደንብ' },
    { code: '030', name: 'የ2017 መተዳደሪያ ደንብ' },
  ],
  '100': [
    { code: '110', name: 'የዲሲፕሊን መመሪያ' },
    { code: '120', name: 'የኢንስፔክሽንና የቁጥጥር መመሪያ' },
    { code: '130', name: 'የአመራር የምደባ መመሪያ' },
    { code: '140', name: 'የአመራር የምዘና መመሪያ' },
    { code: '150', name: 'የአደረጃጀትና አሰራር መመሪያ' },
    { code: '160', name: 'የአባላት መዋጮ አሰባሰብ መመሪያ' },
    { code: '170', name: 'የፓርቲ አባላት ምልመላ፣ ግንባታና ስንብት መመሪያ' },
    { code: '180', name: 'የፓርቲ ሀብቶች መመሪያዎች' },
    { code: '190', name: 'የተተኪና ኮር አመራር ምልመላ መመሪያ' },
  ],
  '200': [
    { code: '210', name: 'የአደረጃጀትና አሰራር መመሪያ ቁጥር 1/2014' },
    { code: '220', name: 'የተሻሻለ የአደረጃጀትና አሰራር መመሪያ ቁጥር 2/2016' },
    { code: '230', name: 'የግምገማና ምዘና መመሪያ ቁጥር 3/2016' },
    { code: '240', name: 'የአቤቱታ አቀራረብ መመሪያ ቁጥር 4/2016' },
  ],
  '300': [
    { code: '310', name: 'የ2016 በጀት ዓመት ዕቅድ' },
    { code: '320', name: 'የ2017 በጀት ዓመት ዕቅድ' },
    { code: '330', name: 'የ2018 በጀት ዓመት ዕቅድ' },
  ],
  '400': [
    { code: '410', name: 'የሩብ ዓመት ሪፖርት' },
    { code: '420', name: 'የዓመት ሪፖርት' },
    { code: '430', name: 'ለኮንፈረንስ የቀረበ ሪፖርት' },
    { code: '440', name: 'ለኮሚሽን መዋቅር የተላከ ሪፖርት' },
    { code: '450', name: 'የኢንስፔክሽን ግኝቶች ምክረ-ሃሳብ የግብረ-መልስ ሪፖርት' },
    { code: '460', name: 'ለፓርቲ ቅ/ጽ/ቤት የተላከ ሪፖርት' },
    { code: '470', name: 'ለጉባዔ የቀረበ ሪፖርት' },
  ],
  '500': [
    { code: '510', name: 'የሱፐርቪዥንና የኢንስፔክሽን ቼክ ሊስት' },
    { code: '520', name: 'የዕቅድ ቼክ ሊስት' },
    { code: '530', name: 'የምዘና ቼክ ሊስት' },
  ],
  '600': [
    { code: '610', name: 'ለፓርቲ መዋቅር የተሰጠ የኢንስፔክሽን ግብረ-መልስ' },
    { code: '620', name: 'ለኮሚሽን መዋቅር የተሰጠ የሱፐርቪዥን ግብረ መልስ' },
    { code: '630', name: 'የእቅድ ግብረ መልስ' },
    { code: '640', name: 'የሪፖርት ግብረ-መልስ' },
    { code: '650', name: 'የግምገማ ግብረ-መልስ' },
    { code: '660', name: 'ከፓርቲ ጽ/ቤቶች የተሰጠ የግብረ-መልስ ግብረ-መልስ' },
  ],
  '700': [
    { code: '710', name: 'የአቅም ግንባታ ስልጠና ሰነድ' },
    { code: '720', name: 'የሥነ-ምግባር ግንባታ ሰነድ' },
    { code: '730', name: 'የጸረ-ሙስና ስልጠና ሰነድ' },
    { code: '740', name: 'የተቀመረ ልምድ ሰነድ' },
    { code: '750', name: 'ፎቶግራፎች' },
    { code: '760', name: 'የማህበራዊ ሚዲያ አጠቃቀም ሰነድ' },
    { code: '770', name: 'የመግባቢያ ሰነድ እና የጅግጅጋ/አዲስ አበባ ስምምነት' },
    { code: '780', name: 'የስልጠና/የኦሬንተሽን/የጋራ መድረክ ተሳታፊ አቴንዳንስ' },
    { code: '790', name: 'ከፓርቲ ዋና ጽ/ቤትና ለዞኖች/ከተሞች/ልዩ ወረዳ የተላከ ስራ መመሪያ/ሰርኩላር' },
  ],
  '800': [
    { code: '810', name: 'የኮሚሽን' },
    { code: '820', name: 'የሥራ አመራር ኮሚቴ' },
    { code: '830', name: 'የጽ/ቤት ማኔጅመንት ኮሚቴ' },
    { code: '840', name: 'የሱፐርቪዥንና ኢንስፔክሽን' },
    { code: '850', name: 'የስልጠና ቃለ-ጉባዬ' },
    { code: '860', name: 'ክ/ከተማ ፓርቲ ጋር መደበኛ ግኑኘነት ቃለ-ጉባዔ' },
    { code: '870', name: 'ከወረዳ ኮሚሽን ቅ/ቤት ጋር መደበኛ ግኑኘነት ቃለ-ጉባዔ' },
    { code: '880', name: 'የልዩ ወረዳ ኮሚሽን ቃለ-ጉባዬ' },
    { code: '890', name: 'የፕሮቶኮል መዝገብ' },
    { code: '891', name: 'አስተያየት መስጫ' },
  ],
  '900': [
    { code: '910', name: 'ቅጽ 1 – 20' },
    { code: '920', name: 'የምዘና ቅጾች' },
    { code: '930', name: 'የስልጠና እርካታ ቅጾች' },
    { code: '940', name: 'የጽሁፍ መጠይቅ ቅጾች' },
    { code: '950', name: 'ልዩ ልዩ ደብዳቤዎች' },
    { code: '960', name: 'የምስጋናና የዕውቅና የምስክር ወረቀቶች' },
  ],
};

const mockDocs: Document[] = [
  {
    id: '1', title: 'የ2017 የስራ ሂደት መመሪያ', description: 'አዲሱ የ2017 የስራ ሂደት መመሪያ',
    office: 'main', mainCategory: '000', subCategory: '030', year: '2017',
    files: [
      { id: 'f1', name: 'መመሪያ_ሰነድ.pdf', fileType: 'PDF', fileSize: '2.4 MB' },
      { id: 'f2', name: 'አባሪ_ሰነድ.docx', fileType: 'DOCX', fileSize: '1.1 MB' },
    ],
    uploadDate: 'ጥቅምት 14, 2026', uploadedBy: 'አስተዳዳሪ',
  },
  {
    id: '2', title: 'የዲሲፕሊን መመሪያ እና አተገባበር', description: 'የዲሲፕሊን መመሪያ አተገባበር ላይ የተሻሻለ ሰነድ',
    office: 'main', mainCategory: '100', subCategory: '110', year: '2026',
    files: [
      { id: 'f3', name: 'ዲሲፕሊን_መመሪያ.pdf', fileType: 'PDF', fileSize: '1.8 MB' },
    ],
    uploadDate: 'ጥቅምት 12, 2026', uploadedBy: 'ፋይናንስ ክፍል',
  },
  {
    id: '3', title: 'የአደረጃጀትና አሰራር መመሪያ ቁጥር 1/2014', description: 'የኮሚሽኑ የአደረጃጀትና አሰራር መመሪያ',
    office: 'main', mainCategory: '200', subCategory: '210', year: '2014',
    files: [
      { id: 'f4', name: 'መመሪያ_ቁጥር_1_2014.pdf', fileType: 'PDF', fileSize: '3.2 MB' },
      { id: 'f5', name: 'የማሻሻያ_ሀሳብ.docx', fileType: 'DOCX', fileSize: '856 KB' },
      { id: 'f6', name: 'የውሳኔ_ሰነድ.xlsx', fileType: 'XLSX', fileSize: '412 KB' },
    ],
    uploadDate: 'ጥቅምት 10, 2026', uploadedBy: 'ሄለን ተስፋዬ',
  },
  {
    id: '4', title: 'የ2016 በጀት ዓመት ዕቅድ', description: 'የ2016 በጀት ዓመት ዕቅድ ሰነድ',
    office: 'branch', mainCategory: '300', subCategory: '310', year: '2016',
    files: [
      { id: 'f7', name: 'ዕቅድ_2016.pdf', fileType: 'PDF', fileSize: '5.1 MB' },
      { id: 'f8', name: 'የበጀት_ዝርዝር.xlsx', fileType: 'XLSX', fileSize: '2.3 MB' },
    ],
    uploadDate: 'ጥቅምት 8, 2026', uploadedBy: 'አበበ በቀለ',
  },
  {
    id: '5', title: 'የሩብ ዓመት ሪፖርት Q3 2026', description: 'የሶስተኛ ሩብ ዓመት የአፈጻጸም ሪፖርት',
    office: 'branch', mainCategory: '400', subCategory: '410', year: '2026',
    files: [
      { id: 'f9', name: 'Q3_ሪፖርት.pdf', fileType: 'PDF', fileSize: '4.2 MB' },
    ],
    uploadDate: 'ጥቅምት 5, 2026', uploadedBy: 'ማርታ ደሳለኝ',
  },
  {
    id: '6', title: 'የሱፐርቪዥን ቼክ ሊስት 2026', description: 'የሱፐርቪዥን ተቆጣጣሪ ቼክ ሊስት',
    office: 'branch', mainCategory: '500', subCategory: '510', year: '2026',
    files: [
      { id: 'f10', name: 'ቼክ_ሊስት.xlsx', fileType: 'XLSX', fileSize: '1.2 MB' },
      { id: 'f11', name: 'መመሪያ.pdf', fileType: 'PDF', fileSize: '678 KB' },
    ],
    uploadDate: 'መስከረም 28, 2026', uploadedBy: 'ውጭ ኦዲተር',
  },
  {
    id: '7', title: 'ለፓርቲ መዋቅር የኢንስፔክሽን ግብረ-መልስ', description: 'የኢንስፔክሽን ግኝቶች እና ምክረ-ሃሳቦች',
    office: 'main', mainCategory: '600', subCategory: '610', year: '2026',
    files: [
      { id: 'f12', name: 'ግብረ_መልስ.pdf', fileType: 'PDF', fileSize: '3.6 MB' },
    ],
    uploadDate: 'መስከረም 25, 2026', uploadedBy: 'አስተዳዳሪ',
  },
  {
    id: '8', title: 'የአቅም ግንባታ ስልጠና ሰነድ', description: 'የአቅም ግንባታ ስልጠና ቁሳቁሶች',
    office: 'branch', mainCategory: '700', subCategory: '710', year: '2026',
    files: [
      { id: 'f13', name: 'ስልጠና_ሰነድ.pdf', fileType: 'PDF', fileSize: '8.6 MB' },
      { id: 'f14', name: 'የአቀራረብ.pptx', fileType: 'DOCX', fileSize: '4.5 MB' },
      { id: 'f15', name: 'ተሳታፊ_ዝርዝር.xlsx', fileType: 'XLSX', fileSize: '234 KB' },
    ],
    uploadDate: 'መስከረም 20, 2026', uploadedBy: 'ዳንኤል መኮንን',
  },
  {
    id: '9', title: 'የኮሚሽን ቃለ-ጉባዔ መዝገብ ሰኔ 2026', description: 'የኮሚሽን መደበኛ ቃለ-ጉባዔ የውሳኔ ሰነድ',
    office: 'main', mainCategory: '800', subCategory: '810', year: '2026',
    files: [
      { id: 'f16', name: 'ቃለ_ጉባዔ_መዝገብ.pdf', fileType: 'PDF', fileSize: '1.5 MB' },
      { id: 'f17', name: 'የውሳኔ_ማስታወሻ.docx', fileType: 'DOCX', fileSize: '892 KB' },
    ],
    uploadDate: 'መስከረም 15, 2026', uploadedBy: 'ሄለን ተስፋዬ',
  },
  {
    id: '10', title: 'ቅጽ የስልጠና እርካታ ቅጽ', description: 'የስልጠና እርካታ ቅጽ አብነት',
    office: 'main', mainCategory: '900', subCategory: '930', year: '2026',
    files: [
      { id: 'f18', name: 'እርካታ_ቅጽ.pdf', fileType: 'PDF', fileSize: '456 KB' },
    ],
    uploadDate: 'መስከረም 10, 2026', uploadedBy: 'ማርታ ደሳለኝ',
  },
  {
    id: '11', title: 'የፓርቲ ሀብቶች አያያዝ መመሪያ', description: 'የፓርቲ ሀብቶች አያያዝ እና አስተዳደር መመሪያ',
    office: 'branch', mainCategory: '100', subCategory: '180', year: '2025',
    files: [
      { id: 'f19', name: 'ሀብቶች_መመሪያ.pdf', fileType: 'PDF', fileSize: '2.1 MB' },
    ],
    uploadDate: 'ነሐሴ 20, 2026', uploadedBy: 'አበበ በቀለ',
  },
  {
    id: '12', title: 'የ2017 በጀት ዓመት ዕቅድ ረቂቅ', description: 'የ2017 በጀት ዓመት ዕቅድ ረቂቅ ሰነድ',
    office: 'main', mainCategory: '300', subCategory: '320', year: '2017',
    files: [
      { id: 'f20', name: 'ዕቅድ_ረቂቅ_2017.pdf', fileType: 'PDF', fileSize: '3.8 MB' },
      { id: 'f21', name: 'የበጀት_ዝርዝር_2017.xlsx', fileType: 'XLSX', fileSize: '1.6 MB' },
      { id: 'f22', name: 'ማጠቃለያ.docx', fileType: 'DOCX', fileSize: '945 KB' },
    ],
    uploadDate: 'ነሐሴ 15, 2026', uploadedBy: 'ዳንኤል መኮንን',
  },
];

export const documentService = {
  // @BACKEND: Replace mock return with real API call — response matches Document[]
  getDocuments: async (): Promise<Document[]> => {
    await apiClient.get('/documents');
    return mockDocs;
  },
  // @BACKEND: Replace mock return with real API call — response matches Document
  getDocumentById: async (id: string): Promise<Document | undefined> => {
    await apiClient.get(`/documents/${id}`);
    return mockDocs.find(d => d.id === id);
  },
  // @BACKEND: Replace mock — real call should send FormData, return created Document
  uploadDocument: async (data: FormData): Promise<Document> => {
    await apiClient.post('/documents/upload', data);
    const newDoc = { id: Date.now().toString(), title: 'አዲስ ሰነድ', mainCategory: '000', subCategory: '010', year: '2026', files: [], uploadDate: 'ዛሬ', uploadedBy: 'አስተዳዳሪ' } as Document;
    mockDocs.push(newDoc);
    return newDoc;
  }
};
