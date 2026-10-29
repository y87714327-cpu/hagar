import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { Plus, Search, Edit3, Trash2, Copy, Eye, Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { token } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [shortDescAr, setShortDescAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [trackInventory, setTrackInventory] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  // Feedback states
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    if (!token) return;
    try {
      const [prods, cats] = await Promise.all([
        api.getAdminProducts(token),
        api.getAdminCategories(token),
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const openAddForm = () => {
    setEditingProduct(null);
    setName('');
    setNameAr('');
    setSlug('');
    setShortDesc('');
    setShortDescAr('');
    setDescription('');
    setDescriptionAr('');
    setPrice('');
    setOriginalPrice('');
    setCurrency('EGP');
    setCategoryId(categories[0]?.id || '');
    setSku('');
    setStockQuantity('10');
    setTrackInventory(true);
    setIsFeatured(false);
    setIsPublished(true);
    setImages(['/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png']);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setNameAr(prod.name_ar || '');
    setSlug(prod.slug);
    setShortDesc(prod.short_description || '');
    setShortDescAr(prod.short_description_ar || '');
    setDescription(prod.description);
    setDescriptionAr(prod.description_ar || '');
    setPrice(prod.price.toString());
    setOriginalPrice(prod.original_price ? prod.original_price.toString() : '');
    setCurrency(prod.currency || 'EGP');
    setCategoryId(prod.category_id);
    setSku(prod.sku || '');
    setStockQuantity(prod.stock_quantity.toString());
    setTrackInventory(prod.track_inventory);
    setIsFeatured(prod.is_featured);
    setIsPublished(prod.is_published);
    setImages(prod.images && prod.images.length > 0 ? [...prod.images] : ['/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png']);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploading(true);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadedUrl = await api.uploadAdminImage(token, base64, file.name, file.type);
        setImages(prev => [uploadedUrl, ...prev.filter(img => !img.includes('Artistic_Touch_Gold_Badge_Logo'))]);
      } catch (err: any) {
        setFormError(err.message || 'Image upload failed');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Save product (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setFormError(null);

    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Selling price must be a valid positive number.');
      return;
    }

    let numOrigPrice: number | undefined = undefined;
    if (originalPrice.trim() !== '') {
      numOrigPrice = parseFloat(originalPrice);
      if (isNaN(numOrigPrice) || numOrigPrice < 0) {
        setFormError('Original price must be a valid positive number.');
        return;
      }
      if (numOrigPrice <= numPrice) {
        setFormError('Original price must be higher than selling price to offer a discount.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        name_ar: nameAr.trim() || undefined,
        slug: slug.trim() || undefined,
        short_description: shortDesc.trim() || undefined,
        short_description_ar: shortDescAr.trim() || undefined,
        description: description.trim(),
        description_ar: descriptionAr.trim() || undefined,
        price: numPrice,
        original_price: numOrigPrice,
        currency,
        category_id: categoryId,
        sku: sku.trim() || undefined,
        stock_quantity: trackInventory ? Math.max(0, parseInt(stockQuantity, 10) || 0) : 999,
        track_inventory: trackInventory,
        is_featured: isFeatured,
        is_published: isPublished,
        images: images.length > 0 ? images : ['/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'],
      };

      if (editingProduct) {
        await api.updateAdminProduct(token, editingProduct.id, payload);
      } else {
        await api.createAdminProduct(token, payload);
      }

      await loadData();
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish
  const togglePublish = async (prod: Product) => {
    if (!token) return;
    try {
      await api.updateAdminProduct(token, prod.id, { is_published: !prod.is_published });
      setProducts(prev =>
        prev.map(p => (p.id === prod.id ? { ...p, is_published: !p.is_published } : p))
      );
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  // Toggle featured
  const toggleFeatured = async (prod: Product) => {
    if (!token) return;
    try {
      await api.updateAdminProduct(token, prod.id, { is_featured: !prod.is_featured });
      setProducts(prev =>
        prev.map(p => (p.id === prod.id ? { ...p, is_featured: !p.is_featured } : p))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  // Duplicate product
  const handleDuplicate = async (prod: Product) => {
    if (!token) return;
    try {
      await api.duplicateAdminProduct(token, prod.id);
      await loadData();
    } catch (err) {
      console.error('Failed to duplicate product:', err);
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deleteCandidate || !token) return;
    try {
      await api.deleteAdminProduct(token, deleteCandidate.id);
      setProducts(prev => prev.filter(p => p.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#302A2D]">
            Product Catalog Management
          </h2>
          <p className="text-xs text-[#302A2D]/60 mt-0.5">
            Add, update prices, upload photos, or manage inventory.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="cursor-pointer py-2.5 px-4 bg-[#302A2D] text-[#FFF9F0] text-xs font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-xs text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#302A2D]/60">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#EBDCCF] rounded-lg py-1.5 px-3 text-xs text-[#302A2D] focus:border-[#C6A15B] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#302A2D]/60">
            Loading product inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#302A2D]/60 space-y-2">
            <p>No products found.</p>
            <button
              onClick={openAddForm}
              className="text-xs text-[#E85D8A] font-semibold hover:underline"
            >
              Click here to add your first creation →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#302A2D]">
              <thead className="bg-[#F7F2EA] border-b border-[#EBDCCF] text-[11px] uppercase tracking-wider text-[#302A2D]/70">
                <tr>
                  <th className="py-3 px-4">Artwork</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBDCCF]/60">
                {filteredProducts.map(p => {
                  const cat = categories.find(c => c.id === p.category_id);
                  const isOutOfStock = p.track_inventory && p.stock_quantity <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#FFF9F0]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-[#EBDCCF] shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-xs text-[#302A2D] block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-[#302A2D]/50 font-mono">
                              {p.sku || p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#302A2D]/70">
                        {cat?.name || 'Uncategorized'}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                        {p.price.toLocaleString()} {p.currency}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums">
                        {p.track_inventory ? (
                          isOutOfStock ? (
                            <span className="text-rose-600 font-bold">0 (Sold Out)</span>
                          ) : (
                            <span>{p.stock_quantity} in stock</span>
                          )
                        ) : (
                          <span className="text-[#302A2D]/50">Untracked</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={`cursor-pointer px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                            p.is_featured
                              ? 'bg-[#C6A15B]/20 text-[#C6A15B]'
                              : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                          }`}
                        >
                          {p.is_featured ? '★ Featured' : '☆ Standard'}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePublish(p)}
                          className={`cursor-pointer px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                            p.is_published
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {p.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditForm(p)}
                            className="p-1.5 text-[#302A2D]/70 hover:text-[#E85D8A] transition-colors rounded hover:bg-black/5"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 text-[#302A2D]/70 hover:text-[#C6A15B] transition-colors rounded hover:bg-black/5"
                            title="Duplicate Product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors rounded hover:bg-black/5"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-2xl bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCCF]">
              <h3 className="font-serif text-xl font-bold text-[#302A2D]">
                {editingProduct ? 'Edit Creation' : 'Add New Creation'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-[#302A2D]/60 hover:text-[#302A2D] rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Product Names (EN & AR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    Product Title (English) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Botanical Resin Art Tray"
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    اسم المنتج (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    placeholder="صينية ريزن بالزهور الطبيعية"
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    placeholder="850"
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    Original Price (Optional strikethrough)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    placeholder="980"
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inventory & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    SKU or Reference Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="AT-RESIN-01"
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value)}
                    disabled={!trackInventory}
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block font-semibold text-[#302A2D]/80 mb-1">
                  Full Description (English)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the craftsmanship, materials used, dimensions, and care instructions..."
                  className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#302A2D]/80 mb-1">
                  الوصف الكامل (بالعربية)
                </label>
                <textarea
                  rows={2}
                  value={descriptionAr}
                  onChange={e => setDescriptionAr(e.target.value)}
                  placeholder="وصف القطعة الفنية والمواد المصنوعة منها وأسلوب العناية بها..."
                  className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
                />
              </div>

              {/* Product Images Management */}
              <div className="space-y-2 pt-2 border-t border-[#EBDCCF]">
                <label className="block font-semibold text-[#302A2D]/80">
                  Product Images (Upload from device or manage previews)
                </label>

                {/* Upload Trigger */}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer py-2 px-3 bg-white border border-[#C6A15B] text-[#302A2D] text-xs font-semibold rounded-lg hover:bg-[#C6A15B]/10 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#C6A15B]" />
                    <span>{isUploading ? 'Uploading Image...' : 'Upload Image from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#302A2D]/50">
                    Supports JPG, PNG, WebP
                  </span>
                </div>

                {/* Image Previews */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#EBDCCF] group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 font-semibold">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-[#EBDCCF] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={e => setTrackInventory(e.target.checked)}
                    className="rounded text-[#E85D8A]"
                  />
                  <span className="font-medium text-[#302A2D]">Track Inventory</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="rounded text-[#E85D8A]"
                  />
                  <span className="font-medium text-[#302A2D]">Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={e => setIsPublished(e.target.checked)}
                    className="rounded text-[#E85D8A]"
                  />
                  <span className="font-medium text-[#302A2D]">Publish to Store</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#EBDCCF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-[#EBDCCF] text-[#302A2D] rounded-lg hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#302A2D] text-[#FFF9F0] rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update Creation' : 'Save Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setDeleteCandidate(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-[#302A2D]">
              Confirm Product Deletion
            </h3>
            <p className="text-xs text-[#302A2D]/70 leading-relaxed">
              Are you sure you want to delete <strong>"{deleteCandidate.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 border border-[#EBDCCF] text-xs font-medium rounded-lg text-[#302A2D]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
