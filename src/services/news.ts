// @BACKEND: API contract for news:
//   GET    /news           → NewsArticle[]
//   GET    /news/:id       → NewsArticle
//   POST   /news           → NewsArticle (JSON body with Partial<NewsArticle>)
//   PUT    /news/:id       → void (JSON body with Partial<NewsArticle>)
//   DELETE /news/:id       → void
// All endpoints prefix with BASE_URL (default http://localhost:3001/api)

import { apiClient } from '../lib/api-client';
import { NewsArticle } from '../types';

// Mock Data
const mockNews: NewsArticle[] = [
  { 
    id: '1', 
    title: 'የ2026 ዓመታዊ የኮሚሽን ሪፖርት ታትሟል', 
    lang: 'አማርኛ', 
    status: 'Published', 
    author: 'ሄለን ተስፋዬ', 
    created: 'ጥቅምት 10, 2026', 
    published: 'ጥቅምት 12, 2026',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1450101499163-c8848e968838?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=500&fit=crop',
    ],
    excerpt: 'ኮሚሽኑ የ2026 ዓመታዊ ሪፖርትን በማተም ባለፈው ዓመት የተመዘገቡ ውጤቶችን ይፋ አድርጓል።',
    body: 'ኮሚሽኑ የ2026 ዓመታዊ ሪፖርትን በማተም ባለፈው ዓመት የተመዘገቡ ውጤቶችን ይፋ አድርጓል።\n\nከ80% በላይ የሚሆኑ ሰነዶቻችንን ዲጂታል ማድረግ የቻልን ሲሆን ሶስት አዳዲስ ቅርንጫፍ ቢሮዎችን ከፍተናል።\n\nዋና ዋና ውጤቶች፦\n- የአገልግሎት አሰጣጥ 15% መሻሻል\n- አዲስ የዲጂታል ማንነት ማረጋገጫ ሥርዓት\n- ለ14 ክልሎች መድረስ\n- ከ500,000 በላይ ዜጎችን ማገልገል'
  },
  { 
    id: '2', 
    title: 'የ2018 ዓ.ም በጀት ዓመት እቅድ ትውውቅ', 
    lang: 'አማርኛ', 
    status: 'Draft', 
    author: 'አበበ በቀለ', 
    created: 'ጥቅምት 11, 2026', 
    published: '-',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848e968838?w=800&h=500&fit=crop',
    excerpt: 'የ2018 ዓ.ም በጀት ዓመት እቅድ በመጠባበቅ ላይ ይገኛል።',
    body: 'የ2018 ዓ.ም በጀት ዓመት እቅድ በመጠባበቅ ላይ ይገኛል።\n\nከዚህ በፊት በተደረጉ መረጃዎች መሰረት የሚከተሉት ማስተካከያዎች ቀርበዋል።'
  },
  { 
    id: '3', 
    title: 'አዲስ የዲጂታል መታወቂያ አገልግሎት ይፋ ሆነ', 
    lang: 'አማርኛ', 
    status: 'Published', 
    author: 'ሄለን ተስፋዬ', 
    created: 'ጥቅምት 5, 2026', 
    published: 'ጥቅምት 8, 2026',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&h=500&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    excerpt: 'የዜጎችን አገልግሎት ለማቀላጠፍ አዲስ የዲጂታል መታወቂያ ማረጋገጫ ሥርዓት ተጀመረ።',
    body: 'የዜጎችን አገልግሎት ለማቀላጠፍ አዲስ የዲጂታል መታወቂያ ማረጋገጫ ሥርዓት ተጀመረ።\n\nይህ ሥርዓት የሚከተሉትን ያስችላል፦\n- የሂደት ጊዜን በ60% መቀነስ\n- ድርብ ምዝገባን ማስቀረት\n- በቢሮዎች መካከል ማረጋገጥ\n- በሞባይል ማረጋገጥ መቻል'
  },
  { 
    id: '4', 
    title: 'Oduu Haaraa: Tajaajila Dijitaalaa', 
    lang: 'Afaan Oromo', 
    status: 'Draft', 
    author: 'Chala D.', 
    created: 'Oct 12, 2026', 
    published: '-',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&h=500&fit=crop',
    excerpt: 'Tajaajila dijitaalaa haaraa laga argamaa guyyaa kana irraa eegalu.',
    body: 'Tajaajila dijitaalaa haaraa laga argamaa guyyaa kana irraa eegalu.'
  },
  {
    id: '5',
    title: 'ኮሚሽኑ የፀረ-ሙስና ዘመቻ ጀመረ',
    lang: 'አማርኛ',
    status: 'Published',
    author: 'ዳንኤል መኮንን',
    created: 'ጥቅምት 1, 2026',
    published: 'ጥቅምት 3, 2026',
    image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    excerpt: 'በሁሉም የመንግሥት ተቋማት ላይ ያነጣጠረ አጠቃላይ የፀረ-ሙስና ተነሳሽነት ተጀመረ።',
    body: 'በሁሉም የመንግሥት ተቋማት ላይ ያነጣጠረ አጠቃላይ የፀረ-ሙስና ተነሳሽነት ተጀመረ።\n\nዘመቻው የሚከተሉትን ያካትታል፦\n- ለባለሥልጣናት የግዴታ ንብረት መግለጽ\n- ማንነት የማይገለጽ የሪፖርት ማድረጊያ መስመር\n- በየሩብ ዓመቱ የሂሳብ ቁጥጥር\n- የህዝብ ሪፖርት መሣሪያ ሰሌዳ'
  }
];

export const newsService = {
  // @BACKEND: Replace mock return with real API call — response matches NewsArticle[]
  getArticles: async (): Promise<NewsArticle[]> => {
    await apiClient.get('/news');
    return mockNews;
  },
  // @BACKEND: Replace mock return with real API call — response matches NewsArticle
  getArticle: async (id: string): Promise<NewsArticle | undefined> => {
    await apiClient.get(`/news/${id}`);
    return mockNews.find(n => n.id === id);
  },
  // @BACKEND: Replace mock — real API should persist and return created NewsArticle
  createArticle: async (data: Partial<NewsArticle>): Promise<NewsArticle> => {
    await apiClient.post('/news', data);
    const newArticle = { ...data, id: Date.now().toString(), created: 'Today' } as NewsArticle;
    mockNews.push(newArticle);
    return newArticle;
  },
  // @BACKEND: Replace mock — real API should persist updated fields
  updateArticle: async (id: string, data: Partial<NewsArticle>): Promise<void> => {
    await apiClient.put(`/news/${id}`, data);
  },
  // @BACKEND: Replace mock — real API should delete from database
  deleteArticle: async (id: string): Promise<void> => {
    await apiClient.delete(`/news/${id}`);
  }
};
