'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_ar: string;
  description_tr: string;
  description_en: string;
  description_ar: string;
  order_index: number;
  is_active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name_tr: '',
    name_en: '',
    name_ar: '',
    description_tr: '',
    description_en: '',
    description_ar: '',
    order_index: 1 as number | string,
  });

  useEffect(() => {
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ensure order_index is a number
      const orderIndex = typeof formData.order_index === 'string' 
        ? parseInt(formData.order_index) || 1 
        : formData.order_index;
      
      // Apply min/max limits
      const maxValue = editingId ? categories.length : categories.length + 1;
      const clampedOrderIndex = Math.min(Math.max(orderIndex, 1), maxValue);
      
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      const payload: Record<string, unknown> = { 
        ...formData, 
        order_index: clampedOrderIndex 
      };
      if (editingId) {
        const editingCategory = categories.find(cat => cat.id === editingId);
        if (editingCategory) {
          payload.is_active = editingCategory.is_active;
        } else {
          payload.is_active = true;
        }
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Kategori güncellendi' : 'Kategori eklendi');
        resetForm();
        fetchCategories();
      } else {
        toast.error('İşlem başarısız');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name_tr: category.name_tr,
      name_en: category.name_en,
      name_ar: category.name_ar,
      description_tr: category.description_tr || '',
      description_en: category.description_en || '',
      description_ar: category.description_ar || '',
      order_index: category.order_index,
    });
    setEditingId(category.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kategori silindi');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Bir hata oluştu');
    }
  };

  // ...removed handleFixOrder and related logic...

  const resetForm = () => {
    setFormData({
      name_tr: '',
      name_en: '',
      name_ar: '',
      description_tr: '',
      description_en: '',
      description_ar: '',
      order_index: categories.length + 1
    });
    setEditingId(null);
    setIsModalOpen(false);
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Kategoriler</h2>
            <p className="text-muted-foreground">
              Menü kategorilerini yönetin
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kategori
            </Button>
          </div>
        </div>

        {/* Modal for Add/Edit Category */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </DialogTitle>
              <DialogDescription>
                Kategori bilgilerini doldurun ve kaydedin
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_tr">Türkçe İsim</Label>
                  <Input
                    id="name_tr"
                    value={formData.name_tr}
                    onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">İngilizce İsim</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_ar">Arapça İsim</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
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
                    value={formData.description_tr}
                    onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_en">İngilizce Açıklama</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_ar">Arapça Açıklama</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_index">Sıra</Label>
                <Input
                  id="order_index"
                  type="number"
                  min="1"
                  max={editingId ? categories.length : categories.length + 1}
                  value={formData.order_index}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    // Allow empty input for manual editing
                    if (e.target.value === '') {
                      setFormData({ ...formData, order_index: '' as string | number });
                    } else if (!isNaN(value)) {
                      setFormData({ ...formData, order_index: value });
                    }
                  }}
                  onBlur={(e) => {
                    // Apply min/max limits when user leaves the input
                    const value = parseInt(e.target.value) || 1;
                    const maxValue = editingId ? categories.length : categories.length + 1;
                    const clampedValue = Math.min(Math.max(value, 1), maxValue);
                    setFormData({ ...formData, order_index: clampedValue });
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Kategorinin görüntüleme sırası (1-{editingId ? categories.length : categories.length + 1} arası). Aynı sıra numarasına sahip kategori varsa otomatik olarak düzenlenecektir.
                </p>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Sıra</TableHead>
                  <TableHead className="min-w-[120px]">Türkçe İsim</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">İngilizce İsim</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Arapça İsim</TableHead>
                  <TableHead className="w-20">Durum</TableHead>
                  <TableHead className="w-24">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.order_index}</TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{category.name_tr}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">
                          {category.name_en}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{category.name_en}</TableCell>
                    <TableCell className="hidden md:table-cell">{category.name_ar}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {category.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Düzenle</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(category.id)}
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