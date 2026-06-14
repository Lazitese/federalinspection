export interface NavLink {
  label: string;
  href: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

export interface Member {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  image: string;
}

export interface MemberCategory {
  id: string;
  label: string;
  members: Member[];
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  icon: "clipboard" | "shield" | "file" | "briefcase";
}

export interface Responsibility {
  id: string;
  title: string;
  description: string;
  icon: "check" | "shield" | "file";
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Files", href: "/files" },
  { label: "Statistics", href: "/statistics" },
  { label: "Contact Us", href: "/contact" },
];

export const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "ብሔራዊ የኢንስፔክሽን መስፈርቶች ለ2026 ተዘምነዋል",
    date: "ሰኔ 10, 2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: "__placeholder__",
  },
  {
    id: "2",
    title: "ሩብ ዓመታዊ የሕግ ማክበር ሪፖርት ታተመ",
    date: "ሰኔ 5, 2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    image: "__placeholder__",
  },
  {
    id: "3",
    title: "ለሜዳ ኢንስፔክተሮች የሥልጠና ፕሮግራም ተጀመረ",
    date: "ሜይ 28, 2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    image: "__placeholder__",
  },
  {
    id: "4",
    title: "ስለ ሥነ-ምግባር አመራር እና ተጠያቂነት የጋራ ፎረም",
    date: "ሜይ 15, 2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident sunt in culpa.",
    image: "__placeholder__",
  },
  {
    id: "5",
    title: "የክልል ጽ/ቤት አፈጻጸም ኦዲቶች ተጠናቀቁ",
    date: "ሜይ 08, 2026",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.",
    image: "__placeholder__",
  },
];

export const memberCategories: MemberCategory[] = [
  {
    id: "secretariat",
    label: "ኮሚሽን ጽ/ቤት",
    members: [
      {
        id: "sec-1",
        name: "ዋና ኮሚሽነር",
        position: "ዋና ኮሚሽነር (Chief Commissioner)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "sec-2",
        name: "ምክትል ኮሚሽነር",
        position: "ምክትል ኮሚሽነር (Deputy Commissioner)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "sec-3",
        name: "ጸሃፊና ጽህፈት ቤት ሃላፊ",
        position: "ጸሃፊና ጽህፈት ቤት ሃላፊ (Secretary & Office Head)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "sec-4",
        name: "ኮሚቴ አባል",
        position: "ኮሚሽን ኮሚቴ አባላት (Committee Member)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "sec-5",
        name: "ስራ አመራር አባል",
        position: "ስራ አመራር ኮሚቴ አባላት (Executive Member)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "sec-6",
        name: "ማኔጅመንት አባል",
        position: "ኮሚሽን ማኔጅመንት አባላት (Management Member)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
    ],
  },
  {
    id: "branch",
    label: "ኮሚሽን ቅርንጫፍ ጽ/ቤት",
    members: [
      {
        id: "br-1",
        name: "ዋና ኮሚሽነር",
        position: "ዋና ኮሚሽነር (Branch Chief Commissioner)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "br-2",
        name: "ምክትል ኮሚሽነር",
        position: "ምክትል ኮሚሽነር (Branch Deputy Commissioner)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "br-3",
        name: "ጸሃፊ",
        position: "ጸሃፊና ጽህፈት ቤት ሃላፊ (Branch Secretary)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
      {
        id: "br-4",
        name: "ኮሚቴ አባል",
        position: "ኮሚሽን ኮሚቴ አባላት (Branch Committee Member)",
        email: "",
        phone: "",
        image: "__placeholder__",
      },
    ],
  },
];

export const metrics: Metric[] = [
  {
    id: "inspections",
    label: "Total Inspections Conducted",
    value: "12,847",
    icon: "clipboard",
  },
  {
    id: "compliance",
    label: "Compliance Rate",
    value: "94.2%",
    icon: "shield",
  },
  {
    id: "reports",
    label: "Reports Generated",
    value: "3,256",
    icon: "file",
  },
  {
    id: "cases",
    label: "Active Cases",
    value: "187",
    icon: "briefcase",
  },
];

export const responsibilities: Responsibility[] = [
  {
    id: "1",
    title: "Conduct Quality Inspections",
    description:
      "Systematically evaluate government services and institutions to ensure they meet established quality standards.",
    icon: "check",
  },
  {
    id: "2",
    title: "Ensure Regulatory Compliance",
    description:
      "Monitor adherence to national regulations, policies, and procedural guidelines across all sectors.",
    icon: "shield",
  },
  {
    id: "3",
    title: "Report Violations & Recommendations",
    description:
      "Document findings, report violations, and provide actionable recommendations for improvement.",
    icon: "file",
  },
  {
    id: "4",
    title: "Promote Accountability Standards",
    description:
      "Champion transparency and accountability to build public trust in government institutions.",
    icon: "check",
  },
  {
    id: "5",
    title: "Support Institutional Reform",
    description:
      "Partner with agencies to implement reforms that strengthen service delivery and governance.",
    icon: "shield",
  },
  {
    id: "6",
    title: "Publish Performance Analytics",
    description:
      "Provide data-driven insights and public reports on inspection outcomes and compliance trends.",
    icon: "file",
  },
];
