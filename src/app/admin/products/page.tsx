'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  category_id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  description_tr: string;
  description_en: string;
  description_ar: string;
  price: number;
  original_price: number;
  discount_percent: number;
  image_url: string;
  is_published: boolean;
  order_index: number;
  category_name_tr: string;
}

interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_id: 0,
    name_tr: '',
    name_en: '',
    name_ar: '',
    description_tr: '',
    description_en: '',
    description_ar: '',
    price: 0,
    original_price: 0,
    discount_percent: 0,
    image_url: '/uploads/logo.png',
    order_index: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Token kontrolü için admin API çağrısı
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetch('/api/admin/auth-check');
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      
      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fiyat validasyonu
    if (formData.price <= 0) {
      toast.error('Fiyat 0\'dan büyük olmalıdır');
      return;
    }

    // İndirim varsa eski fiyat validasyonu
    if (hasDiscount && formData.original_price <= 0) {
      toast.error('İndirim uygulanacaksa eski fiyat 0\'dan büyük olmalıdır');
      return;
    }

    // İndirim varsa eski fiyatın yeni fiyattan büyük olması kontrolü
    if (hasDiscount && formData.original_price <= formData.price) {
      toast.error('Eski fiyat, yeni fiyattan büyük olmalıdır');
      return;
    }
    
    try {
      // Güncelleme işleminde eski resmi silmek için mevcut ürün bilgisini al
      let oldImageUrl = '';
      if (editingId) {
        const currentProduct = products.find(p => p.id === editingId);
        oldImageUrl = currentProduct?.image_url || '';
      }

      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        is_published: true,
        oldImageUrl: editingId ? oldImageUrl : undefined
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Ürün güncellendi' : 'Ürün eklendi');
        resetForm();
        fetchData();
      } else {
        toast.error('İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      category_id: product.category_id || 0,
      name_tr: product.name_tr || '',
      name_en: product.name_en || '',
      name_ar: product.name_ar || '',
      description_tr: product.description_tr || '',
      description_en: product.description_en || '',
      description_ar: product.description_ar || '',
      price: product.price || 0,
      original_price: product.original_price || 0,
      discount_percent: product.discount_percent || 0,
      image_url: product.image_url || '/uploads/logo.png',
      order_index: product.order_index || 0,
    });
    setHasDiscount(product.discount_percent > 0 || product.original_price > 0);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      // Silinecek ürünün resim URL'sini al
      const productToDelete = products.find(p => p.id === id);
      const imageUrl = productToDelete?.image_url || '';

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        toast.success('Ürün silindi');
        fetchData();
      } else {
        toast.error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm('Ürün resmini kaldırmak istediğinizden emin misiniz?')) return;
    
    const currentImageUrl = formData.image_url;
    
    // Önce UI'da değişikliği yap
    setFormData(prev => ({ ...prev, image_url: '/uploads/logo.png' }));
    
    // Eğer logo.png değilse sunucudan sil
    if (currentImageUrl && currentImageUrl !== '/uploads/logo.png') {
      try {
        const response = await fetch('/api/delete-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: currentImageUrl }),
        });
        
        if (response.ok) {
          toast.success('Ürün resmi kaldırıldı, varsayılan logo kullanılacak');
        } else {
          toast.success('Ürün resmi kaldırıldı (dosya silinirken sorun oluştu)');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.success('Ürün resmi kaldırıldı (dosya silinirken sorun oluştu)');
      }
    } else {
      toast.success('Varsayılan logo kullanılacak');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Check file size before upload (2MB limit to match server)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dosya çok büyük. Maksimum boyut 2MB olmalıdır.');
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Geçersiz dosya türü. Sadece JPEG, PNG ve WebP dosyaları kabul edilir.');
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    setUploadingImage(true);
    
    try {
      // Store the old image URL before upload
      const oldImageUrl = formData.image_url;
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      // Send old image URL to delete it after successful upload
      if (oldImageUrl && oldImageUrl !== '/uploads/logo.png') {
        uploadFormData.append('oldImageUrl', oldImageUrl);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      // Check if response is ok and has content
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON response');
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
      
      if (result.success) {
        setFormData(prev => ({ ...prev, image_url: result.imageUrl }));
        toast.success('Resim başarıyla yüklendi');
      } else {
        toast.error(result.error || 'Resim yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Resim yükleme zaman aşımına uğradı');
        } else {
          toast.error(error.message || 'Resim yüklenirken hata oluştu');
        }
      } else {
        toast.error('Resim yüklenirken hata oluştu');
      }
    } finally {
      setUploadingImage(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: 0,
      name_tr: '',
      name_en: '',
      name_ar: '',
      description_tr: '',
      description_en: '',
      description_ar: '',
      price: 0,
      original_price: 0,
      discount_percent: 0,
      image_url: '/uploads/logo.png',
      order_index: 1, // Varsayılan olarak 1 yap
    });
    setEditingId(null);
    setIsModalOpen(false);
    setHasDiscount(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ürünler</h2>
            <p className="text-muted-foreground">
              Menü ürünlerini yönetin
            </p>
          </div>
          <Button onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ürün
          </Button>
        </div>

        {/* Modal for Add/Edit Product */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </DialogTitle>
              <DialogDescription>
                Ürün bilgilerini doldurun ve kaydedin
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category_id">Kategori</Label>
                <Select
                  id="category_id"
                  value={formData.category_id.toString()}
                  onChange={(e) => {
                    const categoryId = parseInt(e.target.value);
                    const categoryProducts = products.filter(p => p.category_id === categoryId);
                    const nextOrderIndex = categoryProducts.length + 1;
                    setFormData({ 
                      ...formData, 
                      category_id: categoryId,
                      order_index: editingId ? formData.order_index : nextOrderIndex
                    });
                  }}
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_tr}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_tr">Türkçe İsim</Label>
                  <Input
                    id="name_tr"
                    value={formData.name_tr || ''}
                    onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">İngilizce İsim</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en || ''}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_ar">Arapça İsim</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar || ''}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description_tr">Türkçe Açıklama</Label>
                  <Textarea
                    id="description_tr"
                    value={formData.description_tr || ''}
                    onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_en">İngilizce Açıklama</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_ar">Arapça Açıklama</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar || ''}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Fiyat (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (e.target.value === '' || (value > 0 && !isNaN(value))) {
                        const rounded = e.target.value === '' ? 0 : Math.round(value * 100) / 100;
                        setFormData({ ...formData, price: rounded });
                      }
                    }}
                    placeholder="Fiyat girin (0'dan büyük olmalı)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_index">
                    Sıra {formData.category_id > 0 && `(1-${products.filter(p => p.category_id === formData.category_id).length + (editingId ? 0 : 1)})`}
                  </Label>
                  <Input
                    id="order_index"
                    type="number"
                    min="1"
                    max={formData.category_id > 0 ? products.filter(p => p.category_id === formData.category_id).length + (editingId ? 0 : 1) : undefined}
                    value={formData.order_index === 0 ? '' : formData.order_index}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const maxOrder = formData.category_id > 0 ? products.filter(p => p.category_id === formData.category_id).length + (editingId ? 0 : 1) : 999;
                      if (value >= 1 && value <= maxOrder) {
                        setFormData({ ...formData, order_index: value });
                      } else if (e.target.value === '') {
                        setFormData({ ...formData, order_index: 0 });
                      }
                    }}
                    placeholder="Sıra numarası"
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_discount"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      if (!e.target.checked) {
                        setFormData({ ...formData, original_price: 0, discount_percent: 0 });
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="has_discount" className="font-medium">İndirim Uygula</Label>
                </div>
                
                {hasDiscount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="original_price">Eski Fiyat (₺)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.original_price === 0 ? '' : formData.original_price}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (e.target.value === '' || (value > 0 && !isNaN(value))) {
                            setFormData({ ...formData, original_price: e.target.value === '' ? 0 : value });
                          }
                        }}
                        placeholder="İndirimli fiyat için eski fiyatı girin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount_percent">İndirim Oranı (%)</Label>
                      <Input
                        id="discount_percent"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount_percent || 0}
                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                        placeholder="İndirim yüzdesi"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                <Label className="font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Ürün Resmi
                </Label>
                
                <div className="space-y-2">
                  <Label htmlFor="image_file">Resim Dosyası (Max 2MB)</Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    key={editingId || 'new'}
                  />
                  {uploadingImage && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Resim yükleniyor...</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Desteklenen formatlar: JPEG, PNG, WebP (Max 2MB) - Otomatik WebP&apos;ye dönüştürülür
                  </p>
                </div>

                {formData.image_url && (
                  <div className="mt-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Önizleme</Label>
                      {formData.image_url !== '/uploads/logo.png' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Resmi Kaldır
                        </Button>
                      )}
                    </div>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                      <Image
                        src={formData.image_url}
                        alt="Ürün resmi önizleme"
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    {formData.image_url === '/uploads/logo.png' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Varsayılan logo kullanılıyor
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button type="submit" className="w-full sm:w-auto transition-all hover:scale-105">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm} 
                  className="w-full sm:w-auto transition-all hover:scale-105"
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          {/* Category Filter */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Kategoriye Göre Filtrele</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tüm Ürünler
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name_tr}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Resim</TableHead>
                  <TableHead className="min-w-[120px]">İsim</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Kategori</TableHead>
                  <TableHead className="w-20">Fiyat</TableHead>
                  <TableHead className="w-24">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products
                  .filter(product => selectedCategory === null || product.category_id === selectedCategory)
                  .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={product.image_url}
                            alt={product.name_tr}
                            fill
                            sizes="(max-width: 640px) 100vw, 48px"
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Resim yok</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{product.name_tr}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">
                          {product.category_name_tr}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{product.category_name_tr}</TableCell>
                    <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Düzenle</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Sil</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}