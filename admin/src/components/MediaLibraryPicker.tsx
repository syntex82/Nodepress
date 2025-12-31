/**
 * MediaLibraryPicker Component
 * Modal for selecting media from library or uploading new files
 */

import { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiImage, FiVideo, FiCheck, FiSearch, FiLoader } from 'react-icons/fi';
import { mediaApi } from '../services/api';
import toast from 'react-hot-toast';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

interface MediaLibraryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  accept?: 'all' | 'image' | 'video';
}

export default function MediaLibraryPicker({
  isOpen,
  onClose,
  onSelect,
  multiple = true,
  accept = 'all',
}: MediaLibraryPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const mimeFilter = accept === 'image' ? 'image' : accept === 'video' ? 'video' : undefined;
      const res = await mediaApi.getAll({ limit: 50, mimeType: mimeFilter });
      setMedia(res.data.data || []);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await mediaApi.upload(file, (progress) => {
          setUploadProgress(Math.round((i / files.length) * 100 + progress / files.length));
        });
        uploaded.push({ ...res.data, path: res.data.url || res.data.path });
      }
      setMedia((prev) => [...uploaded, ...prev]);
      toast.success(`${files.length} file(s) uploaded`);
      setActiveTab('library');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (!multiple) newSelected.clear();
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    const selected = media.filter((m) => selectedIds.has(m.id));
    onSelect(selected);
    onClose();
  };

  const filteredMedia = media.filter((m) =>
    m.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const getAcceptString = () => {
    if (accept === 'image') return 'image/*';
    if (accept === 'video') return 'video/*';
    return 'image/*,video/*';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Library</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiImage className="w-4 h-4 inline mr-2" />
            Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiUpload className="w-4 h-4 inline mr-2" />
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptString()}
                multiple={multiple}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              {uploading ? (
                <div className="space-y-3">
                  <FiLoader className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Uploading... {uploadProgress}%</p>
                  <div className="w-48 mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-gray-400">Supports images and videos</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media..."
                  className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Media Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <FiLoader className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No media found</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {filteredMedia.map((item) => {
                    const isVideo = item.mimeType?.startsWith('video/');
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelection(item.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                          isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {isVideo ? (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FiVideo className="w-8 h-8 text-gray-400" />
                          </div>
                        ) : (
                          <img src={item.path} alt={item.originalName} className="w-full h-full object-cover" />
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <FiCheck className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                        {isVideo && (
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            Video
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-sm text-gray-500">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

