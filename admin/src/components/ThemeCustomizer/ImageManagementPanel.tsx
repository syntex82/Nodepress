/**
 * Image Management Panel - Advanced Version
 * Features: Drag-and-drop reordering, bulk actions, downloads, beautiful UI
 */

import { useState, useEffect, useRef } from 'react';
import {
  FiUpload, FiTrash2, FiEdit2, FiX, FiSave, FiImage as FiImageIcon,
  FiDownload, FiCheckSquare, FiSquare, FiMove,
  FiZoomIn, FiGrid, FiList
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { themeCustomizationApi, ThemeCustomizationImage } from '../../services/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageManagementPanelProps {
  themeId: string;
}

const IMAGE_TYPES = [
  { id: 'logo', label: 'Logo', icon: '🏷️', color: 'blue' },
  { id: 'hero', label: 'Hero', icon: '🖼️', color: 'purple' },
  { id: 'background', label: 'Background', icon: '🎨', color: 'green' },
  { id: 'featured', label: 'Featured', icon: '⭐', color: 'yellow' },
  { id: 'banner', label: 'Banner', icon: '📢', color: 'orange' },
  { id: 'custom', label: 'Custom', icon: '✨', color: 'gray' },
];

// Sortable Image Card Component
function SortableImageCard({
  image,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDownload,
  onPreview,
  viewMode
}: {
  image: ThemeCustomizationImage;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (image: ThemeCustomizationImage) => void;
  onDelete: (id: string) => void;
  onDownload: (image: ThemeCustomizationImage) => void;
  onPreview: (image: ThemeCustomizationImage) => void;
  viewMode: 'grid' | 'list';
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const typeInfo = IMAGE_TYPES.find(t => t.id === image.type) || IMAGE_TYPES[5];
  const fileSize = image.fileSize ? (image.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown';

  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-center gap-4 p-4 rounded-xl transition-all ${
          isDragging ? 'bg-indigo-900/50 shadow-2xl ring-2 ring-indigo-500' : 'bg-gray-700/50 hover:bg-gray-700'
        } ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-900/30' : ''}`}
      >
        <button
          onClick={() => onSelect(image.id)}
          className="flex-shrink-0 text-gray-400 hover:text-indigo-400"
        >
          {isSelected ? <FiCheckSquare size={20} className="text-indigo-400" /> : <FiSquare size={20} />}
        </button>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white"
        >
          <FiMove size={18} />
        </div>

        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
          <img src={image.url} alt={image.altText} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{image.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl">{typeInfo.icon}</span>
            <span className="text-gray-400 text-sm capitalize">{image.type}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500 text-sm">{fileSize}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onPreview(image)} className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white" title="Preview">
            <FiZoomIn size={16} />
          </button>
          <button onClick={() => onDownload(image)} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg text-white" title="Download">
            <FiDownload size={16} />
          </button>
          <button onClick={() => onEdit(image)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white" title="Edit">
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => onDelete(image.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white" title="Delete">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl overflow-hidden transition-all ${
        isDragging ? 'shadow-2xl ring-2 ring-indigo-500 scale-105' : 'hover:shadow-xl hover:scale-[1.02]'
      } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {/* Selection Checkbox */}
      <button
        onClick={() => onSelect(image.id)}
        className="absolute top-3 left-3 z-10 p-1 bg-black/50 rounded-lg backdrop-blur-sm"
      >
        {isSelected ? <FiCheckSquare size={20} className="text-indigo-400" /> : <FiSquare size={20} className="text-white/70" />}
      </button>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-lg backdrop-blur-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiMove size={16} className="text-white" />
      </div>

      {/* Image */}
      <div className="aspect-video bg-gray-800 overflow-hidden">
        <img
          src={image.url}
          alt={image.altText}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </div>

      {/* Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end">
        <div className="w-full p-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <button onClick={() => onPreview(image)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm" title="Preview">
              <FiZoomIn size={18} className="text-white" />
            </button>
            <button onClick={() => onDownload(image)} className="p-2 bg-green-500/80 hover:bg-green-500 rounded-lg backdrop-blur-sm" title="Download">
              <FiDownload size={18} className="text-white" />
            </button>
            <button onClick={() => onEdit(image)} className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg backdrop-blur-sm" title="Edit">
              <FiEdit2 size={18} className="text-white" />
            </button>
            <button onClick={() => onDelete(image.id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-sm" title="Delete">
              <FiTrash2 size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <h4 className="text-white font-medium truncate text-sm">{image.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg">{typeInfo.icon}</span>
          <span className="text-gray-300 text-xs capitalize">{image.type}</span>
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-400 text-xs">{fileSize}</span>
        </div>
      </div>
    </div>
  );
}

export default function ImageManagementPanel({ themeId }: ImageManagementPanelProps) {
  const [images, setImages] = useState<ThemeCustomizationImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<ThemeCustomizationImage | null>(null);
  const [editData, setEditData] = useState<Partial<ThemeCustomizationImage>>({});
  const [filterType, setFilterType] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewImage, setPreviewImage] = useState<ThemeCustomizationImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadImages();
  }, [themeId, filterType]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await themeCustomizationApi.getImages(themeId, filterType || undefined);
      setImages(response.data.sort((a: ThemeCustomizationImage, b: ThemeCustomizationImage) => a.position - b.position));
    } catch (err: any) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex(img => img.id === active.id);
    const newIndex = images.findIndex(img => img.id === over.id);

    const newImages = arrayMove(images, oldIndex, newIndex);
    setImages(newImages);

    // Update positions in database
    try {
      await Promise.all(
        newImages.map((img, idx) =>
          themeCustomizationApi.updateImage(img.id, { position: idx })
        )
      );
      toast.success('Order updated');
    } catch (err) {
      toast.error('Failed to update order');
      loadImages();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(((i + 1) / files.length) * 100);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        const imageData = {
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'custom',
          url,
          altText: file.name,
          mimeType: file.type,
          fileSize: file.size,
          position: images.length + i,
        };

        try {
          const response = await themeCustomizationApi.createImage(themeId, imageData);
          setImages(prev => [...prev, response.data]);
        } catch (err: any) {
          toast.error(`Failed to upload ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }

    toast.success(`${files.length} image(s) uploaded`);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await themeCustomizationApi.deleteImage(id);
      setImages(images.filter(img => img.id !== id));
      setSelectedIds(selectedIds.filter(sid => sid !== id));
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} images?`)) return;

    try {
      await Promise.all(selectedIds.map(id => themeCustomizationApi.deleteImage(id)));
      setImages(images.filter(img => !selectedIds.includes(img.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} images deleted`);
    } catch (err) {
      toast.error('Failed to delete some images');
    }
  };

  const handleDownload = (image: ThemeCustomizationImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.name}.${image.mimeType?.split('/')[1] || 'png'}`;
    link.click();
    toast.success('Download started');
  };

  const handleBulkDownload = () => {
    const selectedImages = images.filter(img => selectedIds.includes(img.id));
    selectedImages.forEach(img => handleDownload(img));
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    try {
      const response = await themeCustomizationApi.updateImage(editingImage.id, editData);
      setImages(images.map(img => img.id === editingImage.id ? response.data : img));
      setEditingImage(null);
      setEditData({});
      toast.success('Image updated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.length === images.length ? [] : images.map(img => img.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (fileInputRef.current) {
            const dt = new DataTransfer();
            Array.from(files).forEach(f => dt.items.add(f));
            fileInputRef.current.files = dt.files;
            fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-10 transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all ${
            isDragging ? 'bg-indigo-500 scale-110' : 'bg-gray-700'
          }`}>
            <FiUpload size={28} className={isDragging ? 'text-white' : 'text-indigo-400'} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragging ? 'Drop images here!' : 'Upload Images'}
          </h3>
          <p className="text-gray-400 mb-4">Drag and drop or click to select multiple images</p>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
            Browse Files
          </button>
        </div>
        {uploadProgress > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === '' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({images.length})
          </button>
          {IMAGE_TYPES.map(type => {
            const count = images.filter(img => img.type === type.id).length;
            return (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filterType === type.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
                {count > 0 && <span className="text-xs opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <span className="text-indigo-400 text-sm">{selectedIds.length} selected</span>
              <button onClick={handleBulkDownload} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg text-white" title="Download Selected">
                <FiDownload size={18} />
              </button>
              <button onClick={handleBulkDelete} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white" title="Delete Selected">
                <FiTrash2 size={18} />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-2" />
            </>
          )}
          <button onClick={selectAll} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white" title={selectedIds.length === images.length ? 'Deselect All' : 'Select All'}>
            {selectedIds.length === images.length ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
            <FiGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
            <FiList size={18} />
          </button>
        </div>
      </div>

      {/* Images Grid/List with Drag and Drop */}
      {images.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
          <FiImageIcon className="mx-auto mb-4 text-gray-600" size={48} />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No images yet</h3>
          <p className="text-gray-500">Upload your first image to get started</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
            }>
              {images.map(image => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  isSelected={selectedIds.includes(image.id)}
                  onSelect={toggleSelect}
                  onEdit={(img) => { setEditingImage(img); setEditData(img); }}
                  onDelete={handleDeleteImage}
                  onDownload={handleDownload}
                  onPreview={setPreviewImage}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Edit Image</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                <img src={editingImage.url} alt={editingImage.altText} className="w-full h-full object-contain" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  value={editData.type || ''}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {IMAGE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={editData.altText || ''}
                  onChange={(e) => setEditData({ ...editData, altText: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the image for accessibility"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={() => setEditingImage(null)} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium flex items-center gap-2">
                <FiSave size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
            <FiX size={24} />
          </button>
          <div className="max-w-6xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <img src={previewImage.url} alt={previewImage.altText} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-medium">{previewImage.name}</h3>
              <p className="text-gray-400 mt-1">{previewImage.altText}</p>
              <button onClick={() => handleDownload(previewImage)} className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl inline-flex items-center gap-2">
                <FiDownload size={18} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

