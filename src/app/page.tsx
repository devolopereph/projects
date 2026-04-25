"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Search, Clock, MapPin, Phone, Mail, Globe, X, Filter, Menu } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { formatPrice, getLocalizedText, calculateDiscountedPrice } from "@/lib/utils"
import { type Language, t } from "@/lib/translations"
import { useTheme } from "@/lib/theme-context"

interface Category extends Record<string, unknown> {
  id: number
  name_tr: string
  name_en: string
  name_ar: string
  description_tr: string
  description_en: string
  description_ar: string
  order_index: number
  is_active: boolean
}

interface Product extends Record<string, unknown> {
  id: number
  category_id: number
  name_tr: string
  name_en: string
  name_ar: string
  description_tr: string
  description_en: string
  description_ar: string
  price: number
  original_price?: number
  discount_percent: number
  image_url?: string
  is_published: boolean
  order_index: number
}

interface CafeInfo extends Record<string, unknown> {
  name_tr: string
  name_en: string
  name_ar: string
  description_tr: string
  description_en: string
  description_ar: string
  phone: string
  address_tr: string
  address_en: string
  address_ar: string
  email: string
  website: string
  working_hours_tr: string
  working_hours_en: string
  working_hours_ar: string
  cafe_logo_url: string
}

export default function MenuPage() {
  const { theme } = useTheme()
  const [language, setLanguage] = useState<Language>('tr')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showCategorySidebar, setShowCategorySidebar] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Device fingerprinting ile güvenilir session ID oluşturma
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled,
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `fp_${Math.abs(hash).toString(36)}`;
  }, []);

  const getOrCreateSessionId = useCallback(() => {
    // Önce localStorage'dan kontrol et
    const storageKey = 'qr_cafe_session_id';
    let sessionId = localStorage.getItem(storageKey);
    
    if (!sessionId) {
      // Device fingerprint oluştur
      const deviceFingerprint = generateDeviceFingerprint();
      
      // Fingerprint + timestamp ile session ID oluştur
      sessionId = `${deviceFingerprint}_${Date.now()}`;
      
      try {
        localStorage.setItem(storageKey, sessionId);
      } catch {
        // localStorage kullanılamıyorsa (gizli sekme vb.) sadece fingerprint kullan
        sessionId = deviceFingerprint;
      }
    }
    
    return sessionId;
  }, [generateDeviceFingerprint]);

  const trackVisit = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      
      const response = await fetch('/api/analytics/visit', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      await response.json();
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }, [getOrCreateSessionId]);

  useEffect(() => {
    fetchData()
    trackVisit()
    
    // Prevent right-click context menu globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }
    
    // Prevent keyboard shortcuts for saving images
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+Shift+S, F12, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J
      if (
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        e.preventDefault()
        return false
      }
    }
    
    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }
    
    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    
    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      // Restore scrolling when component unmounts
      document.body.style.overflow = 'unset'
    }
  }, [trackVisit])

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, cafeRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/settings/cafe-info')
      ])

      const categoriesData = await categoriesRes.json()
      const productsData = await productsRes.json()
      const cafeData = await cafeRes.json()

      setCategories(categoriesData.filter((cat: Category) => cat.is_active))
      setProducts(productsData.filter((prod: Product) => prod.is_published))
      
      // Set cafe info directly from the API response (now in correct format)
      if (cafeData.name_tr || cafeData.name_en || cafeData.name_ar) {
        setCafeInfo({
          name_tr: cafeData.name_tr || '',
          name_en: cafeData.name_en || '',
          name_ar: cafeData.name_ar || '',
          description_tr: cafeData.description_tr || '',
          description_en: cafeData.description_en || '',
          description_ar: cafeData.description_ar || '',
          phone: cafeData.phone || '',
          address_tr: cafeData.address_tr || '',
          address_en: cafeData.address_en || '',
          address_ar: cafeData.address_ar || '',
          email: cafeData.email || '',
          website: cafeData.website || '',
          working_hours_tr: cafeData.working_hours_tr || '',
          working_hours_en: cafeData.working_hours_en || '',
          working_hours_ar: cafeData.working_hours_ar || '',
          cafe_logo_url: cafeData.cafe_logo_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackProductView = async (productId: number) => {
    try {
      await fetch('/api/analytics/product-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
    } catch (error) {
      console.error('Error tracking product view:', error)
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    trackProductView(product.id)
    // Prevent background scrolling
    document.body.style.overflow = 'hidden'
  }

  // Group products by category for display
  const getProductsByCategory = () => {
    const filteredProds = products.filter(product => {
      const matchesSearch = searchQuery ? 
        (() => {
          const query = searchQuery.toLowerCase().trim()
          const productName = getLocalizedText(product, 'name', language).toLowerCase()
          const productDescription = getLocalizedText(product, 'description', language).toLowerCase()
          
          // Kelime başlangıçlarına göre arama
          const nameWords = productName.split(/\s+/)
          const descWords = productDescription.split(/\s+/)
          
          // Ürün adında veya açıklamasında query ile başlayan kelime var mı kontrol et
          const nameMatches = nameWords.some(word => word.startsWith(query))
          const descMatches = descWords.some(word => word.startsWith(query))
          
          return nameMatches || descMatches
        })()
        : true
      
      // Arama yapılıyorsa kategori filtresini uygulama, tüm kategorilerde ara
      const matchesCategory = searchQuery ? true : (selectedCategory ? product.category_id === selectedCategory : true)
      return matchesSearch && matchesCategory && product.is_published
    })

    // Arama yapılıyorsa, seçili kategori göz ardı edilir ve tüm kategorilerde arama yapılır
    if (searchQuery) {
      return categories
        .filter(category => category.is_active)
        .map(category => ({
          category,
          products: filteredProds.filter(product => product.category_id === category.id)
        }))
        .filter(group => group.products.length > 0)
    }

    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory)
      if (category) {
        return [{
          category,
          products: filteredProds.filter(product => product.category_id === selectedCategory)
        }].filter(group => group.products.length > 0)
      }
      return []
    }

    return categories
      .filter(category => category.is_active)
      .map(category => ({
        category,
        products: filteredProds.filter(product => product.category_id === category.id)
      }))
      .filter(group => group.products.length > 0)
  }

  // Get products for main page display (no search filtering)
  const getMainPageProducts = () => {
    const filteredProds = products.filter(product => {
      const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true
      return matchesCategory && product.is_published
    })

    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory)
      if (category) {
        return [{
          category,
          products: filteredProds.filter(product => product.category_id === selectedCategory)
        }].filter(group => group.products.length > 0)
      }
      return []
    }

    return categories
      .filter(category => category.is_active)
      .map(category => ({
        category,
        products: filteredProds.filter(product => product.category_id === category.id)
      }))
      .filter(group => group.products.length > 0)
  }

  const cafeName = cafeInfo ? getLocalizedText(cafeInfo, 'name', language) || 'QR Cafe Menu' : 'QR Cafe Menu'
  const cafeDescription = cafeInfo ? getLocalizedText(cafeInfo, 'description', language) : ''
  const cafeAddress = cafeInfo ? getLocalizedText(cafeInfo, 'address', language) : ''
  const workingHours = cafeInfo ? getLocalizedText(cafeInfo, 'working_hours', language) : ''
  const currentYear = new Date().getFullYear()
  const footerLabels = {
    contact: language === 'tr' ? 'İletişim' : language === 'en' ? 'Contact' : 'اتصال',
    hours: language === 'tr' ? 'Çalışma Saatleri' : language === 'en' ? 'Opening Hours' : 'ساعات العمل',
    menu: language === 'tr' ? 'Dijital QR Menü' : language === 'en' ? 'Digital QR Menu' : 'قائمة QR الرقمية',
    rights: language === 'tr' ? 'Tüm hakları saklıdır.' : language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.',
  }





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading', language)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <style jsx global>{`
        /* Category button click animation */
        .category-press {
          animation: catPress 0.18s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes catPress {
          0% { transform: scale(1); }
          40% { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
        /* Simple fade-in for main content */
        .fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        /* Card hover scale */
        .card-anim {
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s;
        }
        .card-anim:hover {
          transform: scale(1.04) translateY(-2px);
          box-shadow: 0 6px 24px 0 rgba(0,0,0,0.10);
        }
        /* Modal fade */
        .modal-fade {
          animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        /* Sidebar slide (now slides in from the right) */
        .sidebar-slide {
          animation: sidebarSlideIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes sidebarSlideIn {
          from { transform: translateX(100%); }
          to { transform: none; }
        }
        /* Fade + slide animation for category transitions */
        .fade-slide-category {
          animation: fadeSlideIn 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full h-16">
            {/* Sol: Logo */}
            <div className="flex items-center min-w-[56px]">
              {cafeInfo?.cafe_logo_url && (
                <Image
                  src={cafeInfo.cafe_logo_url}
                  alt="Cafe Logo"
                  width={48}
                  height={48}
                  className="object-contain rounded-lg shadow bg-white dark:bg-background border border-primary/20 select-none pointer-events-none"
                  priority
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
              )}
            </div>
            {/* Orta: Boşluk (gerekirse başlık eklenebilir) */}
            <div className="flex-1" />
            {/* Sağ: İkonlar */}
            <div className="flex items-center gap-2">
              <div className="relative w-[40px] h-[40px] flex items-center justify-center border border-primary/20 rounded-lg bg-white dark:bg-background p-0">
                <LanguageSelector 
                  currentLanguage={language} 
                  onLanguageChange={setLanguage} 
                />
              </div>
              <div className="relative w-[40px] h-[40px] flex items-center justify-center border border-primary/20 rounded-lg bg-white dark:bg-background p-0">
                <ThemeToggle />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery('')
                  setShowSearchModal(true)
                }}
                className="relative w-[40px] h-[40px] flex items-center justify-center p-0"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <Search className="w-[24px] h-[24px]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCategorySidebar(true)}
                className="relative w-[40px] h-[40px] flex items-center justify-center p-0"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <Menu className="w-[24px] h-[24px]" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Site Bilgileri */}
      {cafeInfo && (
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 fade-in" style={{animationDelay: '0.1s', animationFillMode: 'backwards'}}>
          <div className="container mx-auto px-4 text-center">
            {cafeInfo?.cafe_logo_url && (
              <div className="mb-6">
                <Image 
                  src={cafeInfo.cafe_logo_url} 
                  alt="Cafe Logo"
                  width={80}
                  height={80}
                  className="object-contain rounded-lg mx-auto shadow-lg select-none pointer-events-none"
                  priority
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
              </div>
            )}
            <h2 className="text-4xl font-bold mb-4">
              {language === 'tr' ? cafeInfo.name_tr :
               language === 'en' ? cafeInfo.name_en :
               cafeInfo.name_ar}
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              {language === 'tr' ? cafeInfo.description_tr :
               language === 'en' ? cafeInfo.description_en :
               cafeInfo.description_ar}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{language === 'tr' ? cafeInfo.address_tr :
                       language === 'en' ? cafeInfo.address_en :
                       cafeInfo.address_ar}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{cafeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{cafeInfo.email}</span>
              </div>
              {cafeInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={cafeInfo.website.startsWith('http') ? cafeInfo.website : `https://${cafeInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {cafeInfo.website}
                  </a>
                </div>
              )}
              {(cafeInfo.working_hours_tr || cafeInfo.working_hours_en || cafeInfo.working_hours_ar) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{language === 'tr' ? cafeInfo.working_hours_tr :
                         language === 'en' ? cafeInfo.working_hours_en :
                         cafeInfo.working_hours_ar}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Kategoriler Bölümü */}
      <section className="py-6 bg-muted/30 fade-in" style={{animationDelay: '0.2s', animationFillMode: 'backwards'}}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-3 text-foreground">
              {language === 'tr' ? 'Kategoriler' :
               language === 'en' ? 'Categories' :
               'الفئات'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'tr' ? 'Menümüzden istediğiniz kategoriyi seçin' :
               language === 'en' ? 'Choose your desired category from our menu' :
               'اختر الفئة المرغوبة من قائمتنا'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={e => {
                setSelectedCategory(null);
                // Add animation class
                const btn = e.currentTarget;
                btn.classList.remove('category-press');
                void btn.offsetWidth; // force reflow
                btn.classList.add('category-press');
              }}
              className={`text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                selectedCategory === null 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                  : 'bg-transparent border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-foreground'
              }`}
            >
              <Filter className="h-3 w-3 mr-1" />
              {language === 'tr' ? 'Tümü' :
               language === 'en' ? 'All' :
               'الكل'}
            </Button>
            {categories.filter(cat => cat.is_active).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={e => {
                  setSelectedCategory(category.id);
                  // Add animation class
                  const btn = e.currentTarget;
                  btn.classList.remove('category-press');
                  void btn.offsetWidth;
                  btn.classList.add('category-press');
                }}
                className={`text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.id 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'bg-transparent border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-foreground'
                }`}
              >
                {getLocalizedText(category, 'name', language)}
              </Button>
            ))}
          </div>
        </div>
      </section>



      {/* Products by Category */}
      <section className="py-8 fade-in" style={{animationDelay: '0.3s', animationFillMode: 'backwards'}}>
        <div className="container mx-auto px-4">
          {/* Kategori geçiş animasyonu için anahtar olarak kategori değişimini kullan */}
          <div key={selectedCategory} className="fade-slide-category">
            {getMainPageProducts().map(({ category, products: categoryProducts }) => (
              <div key={category.id} className="mb-12">
                <h3 className="text-3xl font-bold mb-6 text-center text-foreground border-b-2 border-primary/20 pb-4">
                  {getLocalizedText(category, 'name', language)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoryProducts.map((product, idx) => (
                    <Card 
                      key={product.id} 
                      className={`overflow-hidden card-anim cursor-pointer ${
                        theme === 'light' ? 'product-card-light' : 'product-card-dark'
                      }`}
                      onClick={() => handleProductClick(product)}
                    >
                      <div className={`aspect-square bg-muted relative product-image-container ${
                        theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
                      }`}>
                        {product.image_url ? (
                          <Image 
                            src={product.image_url} 
                            alt={getLocalizedText(product, 'name', language)}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105 select-none pointer-events-none"
                            priority={idx < 6}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Clock className="h-8 w-8" />
                          </div>
                        )}
                        {product.discount_percent > 0 && (
                          <div className="absolute top-2 right-2 discount-badge px-2 py-1 rounded-full text-xs font-bold">
                            -{product.discount_percent}%
                          </div>
                        )}
                      </div>
                      <CardContent className={`p-3 flex flex-col justify-between min-h-[120px] ${
                        theme === 'light' ? 'product-content-light' : 'product-content-dark'
                      }`}>
                        <div>
                          <h4 className={`font-semibold text-sm mb-1 line-clamp-1 product-title`}>
                            {getLocalizedText(product, 'name', language)}
                          </h4>
                          <p className={`text-xs mb-2 line-clamp-2 product-description`}>
                            {getLocalizedText(product, 'description', language)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col min-h-[40px] justify-end">
                              {product.discount_percent > 0 && product.original_price ? (
                                <>
                                  <span className="text-sm font-bold product-price">
                                    {formatPrice(calculateDiscountedPrice(product.original_price, product.discount_percent))}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.original_price)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-bold product-price">
                                    {formatPrice(product.price)}
                                  </span>
                                  {/* Placeholder for consistent height */}
                                  <span className="text-xs opacity-0 select-none">
                                    placeholder
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {getMainPageProducts().length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {selectedCategory ? 'Bu kategoride ürün bulunmuyor' : 'Henüz ürün bulunmuyor'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Sidebar */}
      {showCategorySidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 modal-fade"
          onClick={() => setShowCategorySidebar(false)}
        >
          <div 
            className="fixed right-0 top-0 h-full w-80 bg-background shadow-lg sidebar-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {language === 'tr' ? 'Kategoriler' :
                   language === 'en' ? 'Categories' :
                   'الفئات'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategorySidebar(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                className={`w-full justify-start rounded-full transition-all duration-200 ${
                  selectedCategory === null 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                    : 'hover:bg-primary/10 text-foreground'
                }`}
                onClick={() => {
                  setSelectedCategory(null)
                  setShowCategorySidebar(false)
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                {language === 'tr' ? 'Tüm Ürünler' :
                 language === 'en' ? 'All Products' :
                 'جميع المنتجات'}
              </Button>
              
              {categories.filter(cat => cat.is_active).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className={`w-full justify-start rounded-full transition-all duration-200 ${
                    selectedCategory === category.id 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'hover:bg-primary/10 text-foreground'
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setShowCategorySidebar(false)
                  }}
                >
                  {getLocalizedText(category, 'name', language)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 modal-fade"
          onClick={() => {
            setShowSearchModal(false)
            setSearchQuery('')
          }}
        >
          <div 
            className="fixed left-1/2 top-0 -translate-x-1/2 w-full max-w-md bg-background rounded-b-lg shadow-lg fade-in max-h-[80vh] overflow-hidden flex flex-col"
            style={{ zIndex: 100 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-background rounded-b-lg shadow-lg border-b">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">
                  {language === 'tr' ? 'Ürün Ara' :
                   language === 'en' ? 'Search Products' :
                   'البحث عن المنتجات'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSearchModal(false)
                    setSearchQuery('')
                  }}
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('search', language)}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                <div className="space-y-4">
                  {getProductsByCategory().map(({ category, products: categoryProducts }) => (
                    <div key={category.id}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        {getLocalizedText(category, 'name', language)}
                      </h4>
                      <div className="space-y-2">
                        {categoryProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => {
                              handleProductClick(product)
                              setShowSearchModal(false)
                              setSearchQuery('')
                            }}
                          >
                            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={getLocalizedText(product, 'name', language)}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full select-none pointer-events-none"
                                  onContextMenu={(e) => e.preventDefault()}
                                  onDragStart={(e) => e.preventDefault()}
                                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm truncate">
                                {getLocalizedText(product, 'name', language)}
                              </h5>
                              <p className="text-xs text-muted-foreground truncate">
                                {getLocalizedText(product, 'description', language)}
                              </p>
                              <p className="text-sm font-semibold text-primary">
                                {product.discount_percent > 0 && product.original_price ? 
                                  formatPrice(calculateDiscountedPrice(product.original_price, product.discount_percent)) :
                                  formatPrice(product.price)
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {getProductsByCategory().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {language === 'tr' ? 'Arama sonucu bulunamadı' :
                         language === 'en' ? 'No search results found' :
                         'لم يتم العثور على نتائج'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'tr' ? 'Ürün aramak için yazmaya başlayın' :
                     language === 'en' ? 'Start typing to search products' :
                     'ابدأ بالكتابة للبحث عن المنتجات'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-fade"
          onClick={() => {
            setSelectedProduct(null)
            // Restore background scrolling
            document.body.style.overflow = 'unset'
          }}
        >
          <div 
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {getLocalizedText(selectedProduct, 'name', language)}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedProduct(null)
                  // Restore background scrolling
                  document.body.style.overflow = 'unset'
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {/* Product Image */}
              <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden relative">
                {selectedProduct.image_url ? (
                  <Image 
                    src={selectedProduct.image_url} 
                    alt={getLocalizedText(selectedProduct, 'name', language)}
                    fill
                    className="object-cover select-none pointer-events-none"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Clock className="h-16 w-16" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {getLocalizedText(selectedProduct, 'name', language)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {categories.find(cat => cat.id === selectedProduct.category_id) 
                      ? getLocalizedText(categories.find(cat => cat.id === selectedProduct.category_id)!, 'name', language)
                      : 'Kategori Yok'
                    }
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {getLocalizedText(selectedProduct, 'description', language)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {selectedProduct.discount_percent > 0 && selectedProduct.original_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(calculateDiscountedPrice(selectedProduct.original_price, selectedProduct.discount_percent))}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(selectedProduct.original_price)}
                        </span>
                        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-sm font-bold">
                          -{selectedProduct.discount_percent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(selectedProduct.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 bg-gray-950 text-white fade-in" style={{animationDelay: '0.4s', animationFillMode: 'backwards'}}>
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="grid gap-8 md:grid-cols-[1.35fr_1fr_1fr] md:items-start">
            <div className="max-w-xl">
              <div className="flex items-center gap-4">
                {cafeInfo?.cafe_logo_url && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white p-2 ring-1 ring-white/10">
                    <Image
                      src={cafeInfo.cafe_logo_url}
                      alt={`${cafeName} logo`}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold leading-tight">{cafeName}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-400">{footerLabels.menu}</p>
                </div>
              </div>
              {cafeDescription && (
                <p className="mt-5 max-w-md text-sm leading-6 text-gray-300">{cafeDescription}</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-100">{footerLabels.contact}</h4>
              {cafeInfo && (
                <div className="mt-4 space-y-3 text-sm text-gray-300">
                  {cafeAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                      <span className="leading-6">{cafeAddress}</span>
                    </div>
                  )}
                  {cafeInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                      <a href={`tel:${cafeInfo.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-white">
                        {cafeInfo.phone}
                      </a>
                    </div>
                  )}
                  {cafeInfo.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                      <a href={`mailto:${cafeInfo.email}`} className="transition-colors hover:text-white">
                        {cafeInfo.email}
                      </a>
                    </div>
                  )}
                  {cafeInfo.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 shrink-0 text-gray-500" />
                      <a
                        href={cafeInfo.website.startsWith('http') ? cafeInfo.website : `https://${cafeInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-white"
                      >
                        {cafeInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-100">{footerLabels.hours}</h4>
              <div className="mt-4 flex items-start gap-3 text-sm text-gray-300">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                <span className="leading-6">{workingHours || '-'}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {currentYear} {cafeName}. {footerLabels.rights}</p>
            <p className="text-gray-500">{footerLabels.menu}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
