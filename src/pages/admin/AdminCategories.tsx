import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { api } from '../../services/api';
import { Category } from '../../types';
import { Plus, Edit3, Trash2, Upload, AlertCircle, X, Check, Image as ImageIcon } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Inputs
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState('1');
  const [isPublished, setIsPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadCategories = async () => {
    if (!token) return;
    try {
      const cats = await api.getAdminCategories(token);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setNameAr('');
    setSlug('');
    setDescription('');
    setDescriptionAr('');
    setImage('/src/assets/images/hero_artist_atelier_1793303316706.jpg');
    setOrder((categories.length + 1).toString());
    setIsPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameAr(cat.name_ar || '');
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setDescriptionAr(cat.description_ar || '');
    setImage(cat.image || '');
    setOrder(cat.order.toString());
    setIsPublished(cat.is_published);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const uploadedUrl = await api.uploadAdminImage(token, base64, file.name, file.type);
        setImage(uploadedUrl);
      } catch (err: any) {
        setFormError(err.message || 'Image upload failed');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setFormError(null);
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Category> = {
        name: name.trim(),
        name_ar: nameAr.trim() || undefined,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        description_ar: descriptionAr.trim() || undefined,
        image: image || '/src/assets/images/hero_artist_atelier_1793303316706.jpg',
        order: parseInt(order, 10) || categories.length + 1,
        is_published: isPublished,
      };

      if (editingCategory) {
        await api.updateAdminCategory(token, editingCategory.id, payload);
      } else {
        await api.createAdminCategory(token, payload);
      }

      await loadCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const prepareDelete = (cat: Category) => {
    const prodCount = (cat as any).product_count || 0;
    setDeleteCandidate(cat);
    if (prodCount > 0) {
      setDeleteWarning(
        `Warning: This category has ${prodCount} product(s) assigned to it. Deleting it will reassign these products to another available collection.`
      );
    } else {
      setDeleteWarning(null);
    }
  };

  const confirmDelete = async (force: boolean) => {
    if (!deleteCandidate || !token) return;
    try {
      await api.deleteAdminCategory(token, deleteCandidate.id, force);
      await loadCategories();
      setDeleteCandidate(null);
      setDeleteWarning(null);
    } catch (err: any) {
      setDeleteWarning(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#302A2D]">
            Category Collections
          </h2>
          <p className="text-xs text-[#302A2D]/60 mt-0.5">
            Organize and curate your art mediums, supplies, and bespoke collections.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="cursor-pointer py-2.5 px-4 bg-[#302A2D] text-[#FFF9F0] text-xs font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#302A2D]/60">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#302A2D]/60 space-y-2">
          <p>No categories configured yet.</p>
          <button
            onClick={openAddModal}
            className="text-xs text-[#E85D8A] font-semibold hover:underline"
          >
            Create your first collection category →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const prodCount = (cat as any).product_count || 0;
            return (
              <div
                key={cat.id}
                className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-[#F7F2EA] overflow-hidden">
                    <img
                      src={cat.image || '/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png'}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${cat.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'}`}>
                        {cat.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#302A2D]">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[#302A2D]/60">
                        {prodCount} products
                      </span>
                    </div>
                    {cat.name_ar && (
                      <p className="text-xs text-[#E85D8A] font-medium">
                        {cat.name_ar}
                      </p>
                    )}
                    {cat.description && (
                      <p className="text-xs text-[#302A2D]/70 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-[#EBDCCF]/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#302A2D]/50 font-mono">
                    Order: #{cat.order}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-[#302A2D]/70 hover:text-[#E85D8A] rounded hover:bg-black/5"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => prepareDelete(cat)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-black/5"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-lg bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBDCCF]">
              <h3 className="font-serif text-xl font-bold text-[#302A2D]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
              <div>
                <label className="block font-semibold text-[#302A2D]/80 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Botanical & Resin Art"
                  className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#302A2D]/80 mb-1">
                  اسم التصنيف (بالعربية)
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  placeholder="إبداعات الريزن والزهور"
                  className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#302A2D]/80 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short description of items in this collection..."
                  className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
                />
              </div>

              {/* Category Cover Image */}
              <div className="space-y-2">
                <label className="block font-semibold text-[#302A2D]/80">
                  Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer py-1.5 px-3 bg-white border border-[#C6A15B] text-[#302A2D] rounded-lg hover:bg-[#C6A15B]/10 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-[#C6A15B]" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  {image && (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#EBDCCF]"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#302A2D]/80 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={e => setOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={e => setIsPublished(e.target.checked)}
                      className="rounded text-[#E85D8A]"
                    />
                    <span className="font-medium text-[#302A2D]">Active & Visible</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBDCCF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#EBDCCF] text-[#302A2D] rounded-lg hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#302A2D] text-[#FFF9F0] rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Safeguard Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setDeleteCandidate(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-[#302A2D]">
              Confirm Category Deletion
            </h3>
            <p className="text-xs text-[#302A2D]/70 leading-relaxed">
              Are you sure you want to delete <strong>"{deleteCandidate.name}"</strong>?
            </p>
            {deleteWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{deleteWarning}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 border border-[#EBDCCF] text-xs font-medium rounded-lg text-[#302A2D]"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(true)}
                className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
