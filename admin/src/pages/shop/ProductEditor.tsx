/**
 * Product Editor Page with Variant Management
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, categoriesApi, ProductCategory, ProductVariant, ColorOption } from '../../services/api';
import MediaPickerModal from '../../components/MediaPickerModal';
import { FiPlus, FiX, FiImage, FiTrash2, FiPackage } from 'react-icons/fi';

// Standard clothing sizes
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Common colors with hex codes
const COMMON_COLORS: ColorOption[] = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Navy', code: '#1E3A5F' },
  { name: 'Red', code: '#DC2626' },
  { name: 'Blue', code: '#2563EB' },
  { name: 'Green', code: '#16A34A' },
  { name: 'Gray', code: '#6B7280' },
  { name: 'Pink', code: '#EC4899' },
  { name: 'Purple', code: '#9333EA' },
  { name: 'Orange', code: '#EA580C' },
  { name: 'Yellow', code: '#EAB308' },
  { name: 'Brown', code: '#92400E' },
];

interface VariantFormData {
  id?: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  colorCode: string;
  price: string;
  stock: string;
  isActive: boolean;
}

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Variant management state
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  // Reserved for future variant inline editing modal
  const [_editingVariant, _setEditingVariant] = useState<VariantFormData | null>(null);
  const [customColor, setCustomColor] = useState({ name: '', code: '#000000' });

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: '',
    salePrice: '',
    costPrice: '',
    stock: '0',
    lowStockThreshold: '5',
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
    type: 'PHYSICAL' as 'PHYSICAL' | 'DIGITAL' | 'SERVICE',
    categoryId: '',
    images: [] as string[],
    tags: '',
  });

  useEffect(() => {
    loadCategories();
    if (!isNew && id) {
      loadProduct(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const { data } = await productsApi.getById(productId);
      setForm({
        name: data.name,
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        sku: data.sku || '',
        price: String(data.price),
        salePrice: data.salePrice ? String(data.salePrice) : '',
        costPrice: data.costPrice ? String(data.costPrice) : '',
        stock: String(data.stock),
        lowStockThreshold: String(data.lowStockThreshold),
        status: data.status,
        type: data.type,
        categoryId: data.categoryId || '',
        images: Array.isArray(data.images) ? data.images : [],
        tags: data.tags?.map((t: any) => t.name).join(', ') || '',
      });

      // Load variant data
      setHasVariants(data.hasVariants || false);
      if (data.variantOptions) {
        setSelectedSizes(data.variantOptions.sizes || []);
        setSelectedColors(data.variantOptions.colors || []);
      }
      if (data.variants && data.variants.length > 0) {
        setVariants(data.variants.map((v: ProductVariant) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || '',
          size: v.size || '',
          color: v.color || '',
          colorCode: v.colorCode || '',
          price: v.price ? String(v.price) : '',
          stock: String(v.stock),
          isActive: v.isActive,
        })));
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate variant combinations from selected sizes and colors
  const generateVariants = () => {
    const newVariants: VariantFormData[] = [];

    if (selectedSizes.length === 0 && selectedColors.length === 0) {
      return;
    }

    // Only sizes
    if (selectedColors.length === 0) {
      selectedSizes.forEach(size => {
        newVariants.push({
          name: size,
          sku: '',
          size,
          color: '',
          colorCode: '',
          price: form.price,
          stock: '0',
          isActive: true,
        });
      });
    }
    // Only colors
    else if (selectedSizes.length === 0) {
      selectedColors.forEach(color => {
        newVariants.push({
          name: color.name,
          sku: '',
          size: '',
          color: color.name,
          colorCode: color.code,
          price: form.price,
          stock: '0',
          isActive: true,
        });
      });
    }
    // Both sizes and colors
    else {
      selectedSizes.forEach(size => {
        selectedColors.forEach(color => {
          newVariants.push({
            name: `${size} / ${color.name}`,
            sku: '',
            size,
            color: color.name,
            colorCode: color.code,
            price: form.price,
            stock: '0',
            isActive: true,
          });
        });
      });
    }

    setVariants(newVariants);
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Toggle color selection
  const toggleColor = (color: ColorOption) => {
    setSelectedColors(prev =>
      prev.some(c => c.code === color.code)
        ? prev.filter(c => c.code !== color.code)
        : [...prev, color]
    );
  };

  // Add custom color
  const addCustomColor = () => {
    if (customColor.name && customColor.code) {
      setSelectedColors(prev => [...prev, { ...customColor }]);
      setCustomColor({ name: '', code: '#000000' });
    }
  };

  // Update variant field
  const updateVariant = (index: number, field: keyof VariantFormData, value: string | boolean) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  // Delete variant
  const deleteVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      alert('Valid price is required');
      return;
    }

    try {
      setSaving(true);
      const productData: any = {
        name: form.name,
        description: form.description || undefined,
        shortDescription: form.shortDescription || undefined,
        sku: form.sku || undefined,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        stock: parseInt(form.stock) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
        status: form.status,
        type: form.type,
        categoryId: form.categoryId || undefined,
        images: form.images.length > 0 ? form.images : undefined,
        featuredImage: form.images.length > 0 ? form.images[0] : undefined,
        // Variant configuration
        hasVariants,
        variantOptions: hasVariants ? {
          sizes: selectedSizes,
          colors: selectedColors,
        } : undefined,
        variants: hasVariants && variants.length > 0 ? variants.map((v, index) => ({
          name: v.name,
          sku: v.sku || undefined,
          size: v.size || undefined,
          color: v.color || undefined,
          colorCode: v.colorCode || undefined,
          price: v.price ? parseFloat(v.price) : undefined,
          stock: parseInt(v.stock) || 0,
          isActive: v.isActive,
          isDefault: index === 0,
          sortOrder: index,
          options: { size: v.size, color: v.color, colorCode: v.colorCode },
        })) : undefined,
      };

      if (isNew) {
        await productsApi.create(productData);
      } else {
        await productsApi.update(id!, productData);
      }
      navigate('/shop/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const message = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to save product: ${Array.isArray(message) ? message.join(', ') : message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">{isNew ? 'Add Product' : 'Edit Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 h-32 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sale Price</label>
              <input
                type="number"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cost Price</label>
              <input
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Inventory - show if no variants or no variants generated yet */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Inventory {hasVariants && variants.length > 0 && <span className="text-sm text-slate-400 font-normal">(managed per variant below)</span>}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder={hasVariants && variants.length > 0 ? "Base SKU (variants have own SKUs)" : ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stock {hasVariants && variants.length > 0 && "(base)"}</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiPackage className="text-blue-400" size={20} />
              <h2 className="text-lg font-semibold text-white">Product Variants</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
              />
              <span className="text-sm text-slate-300">This product has size/color variants</span>
            </label>
          </div>

          {hasVariants && (
            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_COLORS.map(color => (
                    <button
                      key={color.code}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedColors.some(c => c.code === color.code)
                          ? 'ring-2 ring-blue-500 bg-slate-700'
                          : 'bg-slate-700/50 hover:bg-slate-600/50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-500"
                        style={{ backgroundColor: color.code }}
                      />
                      <span className="text-slate-300">{color.name}</span>
                    </button>
                  ))}
                </div>
                {/* Custom color input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Custom color name"
                    value={customColor.name}
                    onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <input
                    type="color"
                    value={customColor.code}
                    onChange={(e) => setCustomColor({ ...customColor, code: e.target.value })}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-600/50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected options summary */}
              {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-sm text-slate-400">
                    {selectedSizes.length} sizes × {selectedColors.length || 1} colors = {' '}
                    <span className="text-white font-medium">
                      {Math.max(1, selectedSizes.length) * Math.max(1, selectedColors.length)} variants
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateVariants}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Generate Variants
                  </button>
                </div>
              )}

              {/* Variants Table */}
              {variants.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-2 text-slate-400 font-medium">Variant</th>
                        <th className="text-left py-2 px-2 text-slate-400 font-medium">SKU</th>
                        <th className="text-left py-2 px-2 text-slate-400 font-medium">Price</th>
                        <th className="text-left py-2 px-2 text-slate-400 font-medium">Stock</th>
                        <th className="text-center py-2 px-2 text-slate-400 font-medium">Active</th>
                        <th className="text-right py-2 px-2 text-slate-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant, index) => (
                        <tr key={index} className="border-b border-slate-700/50">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {variant.colorCode && (
                                <span
                                  className="w-4 h-4 rounded-full border border-slate-500"
                                  style={{ backgroundColor: variant.colorCode }}
                                />
                              )}
                              <span className="text-white">{variant.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                              placeholder="Auto"
                              className="w-24 bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              placeholder={form.price}
                              className="w-20 bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                              className="w-16 bg-slate-700/50 border border-slate-600/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={variant.isActive}
                              onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => deleteVariant(index)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Organization */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Organization</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Product Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="PHYSICAL">Physical</option>
                <option value="DIGITAL">Digital</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Product Images</h2>
          <p className="text-xs text-slate-500 mb-4">
            📐 Recommended size: <span className="text-blue-400 font-medium">800 × 600 px</span> (4:3 aspect ratio)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {form.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-xl border border-slate-600/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = form.images.filter((_, i) => i !== index);
                    setForm({ ...form, images: newImages });
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-lg">
                    Main
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="w-full h-32 border-2 border-dashed border-slate-600/50 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              <FiPlus size={24} />
              <span className="text-sm mt-1">Add Image</span>
              <span className="text-xs opacity-75">800 × 600 px</span>
            </button>
          </div>
          <p className="text-sm text-slate-500">
            <FiImage className="inline mr-1" />
            First image is the main product image. Drag to reorder (coming soon).
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
          >
            {saving ? 'Saving...' : (isNew ? 'Create Product' : 'Update Product')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/shop/products')}
            className="border border-slate-600/50 text-slate-300 px-6 py-2 rounded-xl hover:bg-slate-700/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <MediaPickerModal
          type="image"
          onSelect={(media) => {
            setForm({ ...form, images: [...form.images, media.path] });
            setShowImagePicker(false);
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}

