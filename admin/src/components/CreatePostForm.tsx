/**
 * CreatePostForm Component
 * Form for creating new timeline posts with text and media
 * Includes @mention autocomplete and #hashtag highlighting
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { FiImage, FiVideo, FiX, FiGlobe, FiLock, FiHash, FiAtSign, FiLink, FiPlay, FiFolder } from 'react-icons/fi';
import { timelineApi, mediaApi, CreatePostMediaDto, TimelinePostUser } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import EmojiPicker from './EmojiPicker';
import MediaLibraryPicker from './MediaLibraryPicker';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [media, setMedia] = useState<CreatePostMediaDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<TimelinePostUser[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isLoadingMentions, setIsLoadingMentions] = useState(false);

  // Media library and URL input state
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Debounced search for mention suggestions
  useEffect(() => {
    if (!mentionQuery || mentionQuery.length < 1) {
      setMentionSuggestions([]);
      setShowMentionDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingMentions(true);
      try {
        const res = await timelineApi.searchUsersForMention(mentionQuery);
        setMentionSuggestions(res.data);
        setShowMentionDropdown(res.data.length > 0);
        setSelectedSuggestionIndex(0);
      } catch {
        console.error('Error searching mentions');
      } finally {
        setIsLoadingMentions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [mentionQuery]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(value);

    // Check for @ mention trigger
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionStartIndex(textBeforeCursor.length - mentionMatch[0].length);
    } else {
      setMentionQuery('');
      setShowMentionDropdown(false);
    }
  }, []);

  const insertMention = useCallback((user: TimelinePostUser) => {
    if (mentionStartIndex < 0) return;

    const before = content.slice(0, mentionStartIndex);
    const after = content.slice(mentionStartIndex + mentionQuery.length + 1); // +1 for @
    const newContent = `${before}@${user.username || user.name} ${after}`;

    setContent(newContent);
    setShowMentionDropdown(false);
    setMentionQuery('');
    setMentionStartIndex(-1);

    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = before.length + (user.username || user.name).length + 2; // +2 for @ and space
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [content, mentionQuery, mentionStartIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown || mentionSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < mentionSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : mentionSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && showMentionDropdown) {
      e.preventDefault();
      insertMention(mentionSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowMentionDropdown(false);
    }
  }, [showMentionDropdown, mentionSuggestions, selectedSuggestionIndex, insertMention]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 4 media items
    const remaining = 4 - media.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
          toast.error('Only images and videos are supported');
          continue;
        }

        // Upload to server
        const res = await mediaApi.upload(file, (progress) => {
          setUploadProgress(Math.round((i / filesToProcess.length) * 100 + progress / filesToProcess.length));
        });

        const uploadedUrl = res.data.url || res.data.path;
        setPreviewUrls((prev) => [...prev, uploadedUrl]);

        const mediaItem: CreatePostMediaDto = {
          type: isVideo ? 'VIDEO' : 'IMAGE',
          url: uploadedUrl,
        };

        setMedia((prev) => [...prev, mediaItem]);
      }
    } catch {
      toast.error('Failed to upload media');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    const cursorPos = textareaRef.current?.selectionStart || content.length;
    const newContent = content.slice(0, cursorPos) + emoji + content.slice(cursorPos);
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = cursorPos + emoji.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Handle media library selection
  const handleMediaLibrarySelect = (items: any[]) => {
    const remaining = 4 - media.length;
    const itemsToAdd = items.slice(0, remaining);

    for (const item of itemsToAdd) {
      const isVideo = item.mimeType?.startsWith('video/');
      const url = item.path || item.url;
      setPreviewUrls((prev) => [...prev, url]);
      setMedia((prev) => [...prev, { type: isVideo ? 'VIDEO' : 'IMAGE', url }]);
    }
  };

  // Handle external URL input
  const handleAddExternalUrl = () => {
    if (!externalUrl.trim()) return;

    const url = externalUrl.trim();
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    const isVideo = isYouTube || isVimeo || /\.(mp4|webm|ogg|mov)$/i.test(url);

    if (media.length >= 4) {
      toast.error('Maximum 4 media items allowed');
      return;
    }

    setPreviewUrls((prev) => [...prev, url]);
    setMedia((prev) => [...prev, { type: isVideo ? 'VIDEO' : 'IMAGE', url }]);
    setExternalUrl('');
    setShowUrlInput(false);
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    setIsSubmitting(true);
    try {
      await timelineApi.createPost({
        content: content.trim() || undefined,
        isPublic,
        media: media.length > 0 ? media : undefined,
      });
      toast.success('Post created!');
      setContent('');
      setMedia([]);
      setPreviewUrls([]);
      onPostCreated?.();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
      <div className="flex gap-3">
        {/* User Avatar */}
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Use @username to mention someone or #hashtag to tag topics"
            className="w-full resize-none border-0 focus:ring-0 text-gray-800 dark:text-gray-200 bg-transparent placeholder-gray-400 text-lg"
            rows={3}
          />

          {/* Mention Autocomplete Dropdown */}
          {showMentionDropdown && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 max-h-48 overflow-y-auto z-20">
              {isLoadingMentions ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : mentionSuggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              ) : (
                mentionSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => insertMention(suggestion)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                      index === selectedSuggestionIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    {suggestion.avatar ? (
                      <img src={suggestion.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {suggestion.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.name}
                      </div>
                      {suggestion.username && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{suggestion.username}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* External URL Input */}
          {showUrlInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="Paste image/video URL (YouTube, Vimeo, or direct link)"
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddExternalUrl()}
              />
              <button
                onClick={handleAddExternalUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add
              </button>
              <button
                onClick={() => { setShowUrlInput(false); setExternalUrl(''); }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Media Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {previewUrls.map((url, index) => {
                const isVideo = media[index]?.type === 'VIDEO';
                const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
                const isVimeo = url.includes('vimeo.com');
                const isExternalVideo = isYouTube || isVimeo;

                return (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {isExternalVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <FiPlay className="w-10 h-10 text-red-500 mb-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full">
                          {isYouTube ? 'YouTube' : 'Vimeo'} Video
                        </span>
                      </div>
                    ) : isVideo ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                    {isVideo && !isExternalVideo && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        Video
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload from device */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={media.length >= 4 || isUploading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 disabled:opacity-50 transition-colors"
                title="Upload from device"
              >
                <FiImage className="w-5 h-5" />
              </button>

              {/* Video from device */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={media.length >= 4 || isUploading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 disabled:opacity-50 transition-colors"
                title="Upload video"
              >
                <FiVideo className="w-5 h-5" />
              </button>

              {/* Media Library */}
              <button
                onClick={() => setShowMediaLibrary(true)}
                disabled={media.length >= 4}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 disabled:opacity-50 transition-colors"
                title="Choose from media library"
              >
                <FiFolder className="w-5 h-5" />
              </button>

              {/* External URL */}
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                disabled={media.length >= 4}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 transition-colors ${
                  showUrlInput ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 dark:text-gray-400'
                }`}
                title="Add URL (YouTube, Vimeo, image)"
              >
                <FiLink className="w-5 h-5" />
              </button>

              {/* Emoji Picker */}
              <EmojiPicker onSelect={handleEmojiSelect} />

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* Visibility Toggle */}
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  isPublic
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {isPublic ? <FiGlobe className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                {isPublic ? 'Public' : 'Private'}
              </button>

              {/* Media count indicator */}
              {media.length > 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                  {media.length}/4 media
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || (!content.trim() && media.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : isUploading ? 'Uploading...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryPicker
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaLibrarySelect}
        multiple={true}
        accept="all"
      />
    </div>
  );
}
