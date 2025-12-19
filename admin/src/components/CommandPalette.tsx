/**
 * Command Palette Component
 * Global search with Cmd+K / Ctrl+K keyboard shortcut
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiFileText, FiFile, FiUsers, FiSettings, FiLayout, FiImage,
  FiShoppingBag, FiBookOpen, FiMail, FiShield, FiCornerDownLeft,
  FiArrowUp, FiArrowDown, FiZap, FiPlus, FiHome, FiMenu,
  FiPackage, FiMessageSquare, FiBarChart2, FiTag, FiGrid
} from 'react-icons/fi';
import { postsApi, pagesApi, usersApi } from '../services/api';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  category: 'action' | 'page' | 'post' | 'user' | 'navigation' | 'recent';
  action: () => void;
}

const NAVIGATION_ITEMS: Omit<SearchResult, 'action'>[] = [
  { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'Overview and stats', icon: FiHome, iconColor: 'text-blue-400', category: 'navigation' },
  { id: 'nav-posts', title: 'Posts', subtitle: 'Manage blog posts', icon: FiFileText, iconColor: 'text-blue-400', category: 'navigation' },
  { id: 'nav-pages', title: 'Pages', subtitle: 'Manage static pages', icon: FiFile, iconColor: 'text-emerald-400', category: 'navigation' },
  { id: 'nav-media', title: 'Media Library', subtitle: 'Images and files', icon: FiImage, iconColor: 'text-amber-400', category: 'navigation' },
  { id: 'nav-users', title: 'Users', subtitle: 'Manage users', icon: FiUsers, iconColor: 'text-purple-400', category: 'navigation' },
  { id: 'nav-menus', title: 'Menus', subtitle: 'Navigation menus', icon: FiMenu, iconColor: 'text-cyan-400', category: 'navigation' },
  { id: 'nav-themes', title: 'Themes', subtitle: 'Theme management', icon: FiLayout, iconColor: 'text-violet-400', category: 'navigation' },
  { id: 'nav-customize', title: 'Customize', subtitle: 'Theme customizer', icon: FiLayout, iconColor: 'text-pink-400', category: 'navigation' },
  { id: 'nav-plugins', title: 'Plugins', subtitle: 'Manage plugins', icon: FiPackage, iconColor: 'text-orange-400', category: 'navigation' },
  { id: 'nav-shop', title: 'Shop Products', subtitle: 'E-commerce', icon: FiShoppingBag, iconColor: 'text-pink-400', category: 'navigation' },
  { id: 'nav-orders', title: 'Orders', subtitle: 'Shop orders', icon: FiTag, iconColor: 'text-green-400', category: 'navigation' },
  { id: 'nav-lms', title: 'LMS Courses', subtitle: 'Learning management', icon: FiBookOpen, iconColor: 'text-cyan-400', category: 'navigation' },
  { id: 'nav-email', title: 'Email Templates', subtitle: 'Email management', icon: FiMail, iconColor: 'text-orange-400', category: 'navigation' },
  { id: 'nav-groups', title: 'Groups', subtitle: 'Community groups', icon: FiMessageSquare, iconColor: 'text-indigo-400', category: 'navigation' },
  { id: 'nav-analytics', title: 'Analytics', subtitle: 'Site analytics', icon: FiBarChart2, iconColor: 'text-teal-400', category: 'navigation' },
  { id: 'nav-seo', title: 'SEO Settings', subtitle: 'Search optimization', icon: FiSearch, iconColor: 'text-lime-400', category: 'navigation' },
  { id: 'nav-security', title: 'Security', subtitle: 'Security settings', icon: FiShield, iconColor: 'text-red-400', category: 'navigation' },
  { id: 'nav-settings', title: 'Settings', subtitle: 'Site settings', icon: FiSettings, iconColor: 'text-slate-400', category: 'navigation' },
  { id: 'nav-marketplace', title: 'Theme Marketplace', subtitle: 'Browse themes', icon: FiGrid, iconColor: 'text-violet-400', category: 'navigation' },
];

const QUICK_ACTIONS: Omit<SearchResult, 'action'>[] = [
  { id: 'action-new-post', title: 'Create New Post', subtitle: 'Write a new blog post', icon: FiPlus, iconColor: 'text-blue-400', category: 'action' },
  { id: 'action-new-page', title: 'Create New Page', subtitle: 'Create a static page', icon: FiPlus, iconColor: 'text-emerald-400', category: 'action' },
  { id: 'action-new-product', title: 'Create New Product', subtitle: 'Add shop product', icon: FiPlus, iconColor: 'text-pink-400', category: 'action' },
  { id: 'action-new-course', title: 'Create New Course', subtitle: 'Add LMS course', icon: FiPlus, iconColor: 'text-cyan-400', category: 'action' },
  { id: 'action-upload', title: 'Upload Media', subtitle: 'Upload images/files', icon: FiImage, iconColor: 'text-amber-400', category: 'action' },
];

const ROUTE_MAP: Record<string, string> = {
  'nav-dashboard': '/', 'nav-posts': '/posts', 'nav-pages': '/pages', 'nav-media': '/media',
  'nav-users': '/users', 'nav-menus': '/menus', 'nav-themes': '/themes', 'nav-customize': '/customize',
  'nav-plugins': '/plugins', 'nav-shop': '/shop/products', 'nav-orders': '/shop/orders',
  'nav-lms': '/lms/courses', 'nav-email': '/email/templates', 'nav-groups': '/groups',
  'nav-analytics': '/analytics', 'nav-seo': '/seo', 'nav-security': '/security',
  'nav-settings': '/settings', 'nav-marketplace': '/marketplace',
  'action-new-post': '/posts/new', 'action-new-page': '/pages/new',
  'action-new-product': '/shop/products/new', 'action-new-course': '/lms/courses/new',
  'action-upload': '/media',
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('commandPaletteRecent');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Create result with navigation action
  const createResult = useCallback((item: Omit<SearchResult, 'action'>): SearchResult => ({
    ...item,
    action: () => {
      const route = ROUTE_MAP[item.id];
      if (route) navigate(route);
      onClose();
    },
  }), [navigate, onClose]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      // Show quick actions and navigation when empty
      const quickResults = [...QUICK_ACTIONS, ...NAVIGATION_ITEMS.slice(0, 8)].map(createResult);
      setResults(quickResults);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    // Filter navigation items
    const navMatches = NAVIGATION_ITEMS.filter(item =>
      item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)
    ).map(createResult);
    searchResults.push(...navMatches);

    // Filter quick actions
    const actionMatches = QUICK_ACTIONS.filter(item =>
      item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)
    ).map(createResult);
    searchResults.push(...actionMatches);

    // Search posts
    try {
      const postsRes = await postsApi.getAll({ search: q, limit: 5 });
      const posts = postsRes.data.data || [];
      posts.forEach((post: any) => {
        searchResults.push({
          id: `post-${post.id}`, title: post.title, subtitle: `Post • ${post.status}`,
          icon: FiFileText, iconColor: 'text-blue-400', category: 'post',
          action: () => { navigate(`/posts/${post.id}`); onClose(); },
        });
      });
    } catch (e) { /* ignore */ }

    // Search pages
    try {
      const pagesRes = await pagesApi.getAll({ search: q, limit: 5 });
      const pages = pagesRes.data.data || [];
      pages.forEach((page: any) => {
        searchResults.push({
          id: `page-${page.id}`, title: page.title, subtitle: `Page • ${page.status}`,
          icon: FiFile, iconColor: 'text-emerald-400', category: 'page',
          action: () => { navigate(`/pages/${page.id}`); onClose(); },
        });
      });
    } catch (e) { /* ignore */ }

    // Search users
    try {
      const usersRes = await usersApi.getAll({ search: q, limit: 5 });
      const users = usersRes.data.data || [];
      users.forEach((user: any) => {
        searchResults.push({
          id: `user-${user.id}`, title: user.name, subtitle: `${user.email} • ${user.role}`,
          icon: FiUsers, iconColor: 'text-purple-400', category: 'user',
          action: () => { navigate(`/users`); onClose(); },
        });
      });
    } catch (e) { /* ignore */ }

    setResults(searchResults);
    setLoading(false);
    setSelectedIndex(0);
  }, [createResult, navigate, onClose]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 150);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          // Save to recent
          if (query.trim()) {
            const newRecent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
            setRecentSearches(newRecent);
            localStorage.setItem('commandPaletteRecent', JSON.stringify(newRecent));
          }
          results[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Category labels
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'action': return 'Quick Actions';
      case 'navigation': return 'Navigation';
      case 'post': return 'Posts';
      case 'page': return 'Pages';
      case 'user': return 'Users';
      case 'recent': return 'Recent';
      default: return category;
    }
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-2xl bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50">
            <FiSearch className="text-slate-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search posts, pages, users, or type a command..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
            />
            {loading && (
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && query && !loading && (
              <div className="px-4 py-8 text-center text-slate-400">
                <FiSearch size={32} className="mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            )}

            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 bg-slate-900/50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {getCategoryLabel(category)}
                </div>
                {items.map((result) => {
                  const globalIndex = results.indexOf(result);
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={result.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        globalIndex === selectedIndex
                          ? 'bg-violet-500/20 border-l-2 border-violet-500'
                          : 'hover:bg-slate-700/50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-slate-700/50 ${result.iconColor}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-sm text-slate-400 truncate">{result.subtitle}</p>
                        )}
                      </div>
                      {globalIndex === selectedIndex && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <FiCornerDownLeft size={14} />
                          <span className="text-xs">to select</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FiArrowUp size={12} /><FiArrowDown size={12} /> to navigate
              </span>
              <span className="flex items-center gap-1">
                <FiCornerDownLeft size={12} /> to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">ESC</kbd> to close
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FiZap className="text-violet-400" size={12} />
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

