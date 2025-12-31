/**
 * CreatePostForm Component
 * Form for creating new timeline posts with text and media
 * Includes @mention autocomplete and #hashtag highlighting
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { FiImage, FiVideo, FiX, FiGlobe, FiLock, FiHash, FiAtSign } from 'react-icons/fi';
import { timelineApi, CreatePostMediaDto, TimelinePostUser } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

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

    for (const file of filesToProcess) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        toast.error('Only images and videos are supported');
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, previewUrl]);

      // In a real app, you'd upload to a server here
      // For now, we'll use the preview URL as the media URL
      const mediaItem: CreatePostMediaDto = {
        type: isVideo ? 'VIDEO' : 'IMAGE',
        url: previewUrl, // This would be the uploaded URL in production
      };

      setMedia((prev) => [...prev, mediaItem]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

          {/* Media Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  {media[index]?.type === 'VIDEO' ? (
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
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={media.length >= 4}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 disabled:opacity-50"
                title="Add image"
              >
                <FiImage className="w-5 h-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={media.length >= 4}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 disabled:opacity-50"
                title="Add video"
              >
                <FiVideo className="w-5 h-5" />
              </button>

              {/* Visibility Toggle */}
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isPublic
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {isPublic ? <FiGlobe className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && media.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
