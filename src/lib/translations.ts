export const translations = {
  tr: {
    // Common
    loading: 'Yükleniyor...',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    search: 'Ara...',
    language: 'Dil',
    theme: 'Tema',
    light: 'Açık',
    dark: 'Koyu',
    
    // Menu
    menu: 'Menü',
    categories: 'Kategoriler',
    products: 'Ürünler',
    price: 'Fiyat',
    description: 'Açıklama',
    featured: 'Öne Çıkan',
    dailyMenu: 'Günün Menüsü',
    
    // Admin
    admin: 'Yönetici',
    dashboard: 'Kontrol Paneli',
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    analytics: 'İstatistikler',
    settings: 'Ayarlar',
    
    // Analytics
    todayVisits: 'Bugünkü Ziyaretler',
    weeklyVisits: 'Haftalık Ziyaretler',
    monthlyVisits: 'Aylık Ziyaretler',
    popularProducts: 'Popüler Ürünler',
    totalCategories: 'Toplam Kategori',
    totalProducts: 'Toplam Ürün',
    
    // Messages
    success: 'Başarılı!',
    error: 'Hata!',
    confirmDelete: 'Silmek istediğinizden emin misiniz?',
    
    // Cafe Info
    cafeInfo: 'Kafe Bilgileri',
    cafeName: 'Kafe Adı',
    cafeDescription: 'Kafe Açıklaması',
    cafePhone: 'Telefon',
    cafeAddress: 'Adres',
    cafeEmail: 'E-posta',
  },
  en: {
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search...',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    
    // Menu
    menu: 'Menu',
    categories: 'Categories',
    products: 'Products',
    price: 'Price',
    description: 'Description',
    featured: 'Featured',
    dailyMenu: 'Daily Menu',
    
    // Admin
    admin: 'Admin',
    dashboard: 'Dashboard',
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    analytics: 'Analytics',
    settings: 'Settings',
    
    // Analytics
    todayVisits: 'Today\'s Visits',
    weeklyVisits: 'Weekly Visits',
    monthlyVisits: 'Monthly Visits',
    popularProducts: 'Popular Products',
    totalCategories: 'Total Categories',
    totalProducts: 'Total Products',
    
    // Messages
    success: 'Success!',
    error: 'Error!',
    confirmDelete: 'Are you sure you want to delete?',
    
    // Cafe Info
    cafeInfo: 'Cafe Information',
    cafeName: 'Cafe Name',
    cafeDescription: 'Cafe Description',
    cafePhone: 'Phone',
    cafeAddress: 'Address',
    cafeEmail: 'Email',
  },
  ar: {
    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث...',
    language: 'اللغة',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    
    // Menu
    menu: 'القائمة',
    categories: 'الفئات',
    products: 'المنتجات',
    price: 'السعر',
    description: 'الوصف',
    featured: 'مميز',
    dailyMenu: 'قائمة اليوم',
    
    // Admin
    admin: 'المدير',
    dashboard: 'لوحة التحكم',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    analytics: 'الإحصائيات',
    settings: 'الإعدادات',
    
    // Analytics
    todayVisits: 'زيارات اليوم',
    weeklyVisits: 'الزيارات الأسبوعية',
    monthlyVisits: 'الزيارات الشهرية',
    popularProducts: 'المنتجات الشائعة',
    totalCategories: 'إجمالي الفئات',
    totalProducts: 'إجمالي المنتجات',
    
    // Messages
    success: 'نجح!',
    error: 'خطأ!',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    
    // Cafe Info
    cafeInfo: 'معلومات المقهى',
    cafeName: 'اسم المقهى',
    cafeDescription: 'وصف المقهى',
    cafePhone: 'الهاتف',
    cafeAddress: 'العنوان',
    cafeEmail: 'البريد الإلكتروني',
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.tr;

export function t(key: TranslationKey, language: Language = 'tr'): string {
  return translations[language][key] || translations.tr[key] || key;
}