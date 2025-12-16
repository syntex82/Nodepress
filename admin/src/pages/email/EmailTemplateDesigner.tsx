/**
 * Visual Email Template Designer
 * Beautiful drag-and-drop block-based email template builder with media library integration
 */

import { useState, useCallback, useEffect } from 'react';
import {
  FiType, FiImage, FiSquare, FiMinus, FiLink,
  FiArrowUp, FiArrowDown, FiTrash2, FiCopy, FiSmartphone, FiMonitor,
  FiSave, FiEye, FiX, FiPlus, FiLayout, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiGrid, FiStar, FiMail, FiCheck, FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { emailApi, mediaApi } from '../../services/api';

// Types
export type BlockType = 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'footer' | 'hero' | 'social' | 'features' | 'cta' | 'testimonial';

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  styles: Record<string, any>;
}

export interface EmailDesign {
  blocks: EmailBlock[];
  globalStyles: {
    backgroundColor: string;
    contentWidth: number;
    fontFamily: string;
    primaryColor: string;
    textColor: string;
    linkColor: string;
  };
}

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
}

// Default block configurations
const DEFAULT_BLOCKS: Record<BlockType, Partial<EmailBlock>> = {
  header: {
    content: { logoUrl: '', title: 'Your Brand' },
    styles: { backgroundColor: '#ffffff', padding: 32, textAlign: 'center' }
  },
  text: {
    content: { text: 'Write your message here.' },
    styles: { backgroundColor: '#ffffff', padding: 24, fontSize: 16, lineHeight: 1.7, textAlign: 'left', color: '#374151' }
  },
  image: {
    content: { src: '', alt: 'Image', link: '' },
    styles: { backgroundColor: '#ffffff', padding: 16, borderRadius: 8 }
  },
  button: {
    content: { text: 'Get Started', link: '#' },
    styles: { backgroundColor: '#4F46E5', textColor: '#ffffff', padding: 16, borderRadius: 8, fontSize: 16, align: 'center' }
  },
  divider: {
    content: {},
    styles: { color: '#e5e7eb', thickness: 1, padding: 24 }
  },
  spacer: {
    content: {},
    styles: { height: 40 }
  },
  footer: {
    content: { companyName: '{{site.name}}', address: '123 Main St', unsubscribeText: 'Unsubscribe' },
    styles: { backgroundColor: '#1f2937', padding: 40, textAlign: 'center', color: '#9ca3af' }
  },
  hero: {
    content: { title: 'Welcome!', subtitle: 'Discover something amazing.', buttonText: 'Get Started', buttonLink: '#' },
    styles: { backgroundColor: '#4F46E5', textColor: '#ffffff', padding: 64, textAlign: 'center' }
  },
  social: {
    content: { links: [{ platform: 'facebook', url: '#' }, { platform: 'twitter', url: '#' }] },
    styles: { backgroundColor: '#f9fafb', padding: 32, align: 'center' }
  },
  features: {
    content: { title: 'Features', features: [{ icon: '⚡', title: 'Fast', desc: 'Quick' }] },
    styles: { backgroundColor: '#ffffff', padding: 40 }
  },
  cta: {
    content: { title: 'Ready?', subtitle: 'Join now.', buttonText: 'Start', buttonLink: '#' },
    styles: { backgroundColor: '#f3f4f6', padding: 48, textAlign: 'center' }
  },
  testimonial: {
    content: { quote: '"Amazing!"', author: 'Jane', role: 'CEO' },
    styles: { backgroundColor: '#ffffff', padding: 40, textAlign: 'center' }
  }
};

const BLOCK_CATEGORIES: Record<string, BlockType[]> = {
  'Layout': ['header', 'footer', 'divider', 'spacer'],
  'Content': ['text', 'image', 'button'],
  'Marketing': ['hero', 'cta', 'features', 'testimonial', 'social']
};

const BLOCK_INFO: Record<BlockType, { label: string; icon: any }> = {
  header: { label: 'Header', icon: FiLayout },
  text: { label: 'Text', icon: FiType },
  image: { label: 'Image', icon: FiImage },
  button: { label: 'Button', icon: FiSquare },
  divider: { label: 'Divider', icon: FiMinus },
  spacer: { label: 'Spacer', icon: FiGrid },
  footer: { label: 'Footer', icon: FiLayout },
  hero: { label: 'Hero', icon: FiStar },
  social: { label: 'Social', icon: FiLink },
  features: { label: 'Features', icon: FiCheck },
  cta: { label: 'CTA', icon: FiMail },
  testimonial: { label: 'Quote', icon: FiStar }
};

const FONTS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createBlock = (type: BlockType): EmailBlock => ({
  id: generateId(),
  type,
  content: { ...DEFAULT_BLOCKS[type].content },
  styles: { ...DEFAULT_BLOCKS[type].styles }
});

const DEFAULT_DESIGN: EmailDesign = {
  blocks: [],
  globalStyles: {
    backgroundColor: '#f3f4f6',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif',
    primaryColor: '#4F46E5',
    textColor: '#333333',
    linkColor: '#4F46E5'
  }
};

export default function EmailTemplateDesigner() {
  const [design, setDesign] = useState<EmailDesign>(DEFAULT_DESIGN);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ blockId: string; field: string } | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedBlock = design.blocks.find(b => b.id === selectedBlockId);

  // Load media library
  const loadMedia = useCallback(async () => {
    try {
      const response = await mediaApi.getAll({ limit: 50 });
      setMediaItems(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Block operations
  const addBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock = createBlock(type);
    setDesign(prev => {
      const blocks = [...prev.blocks];
      if (index !== undefined) {
        blocks.splice(index, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }
      return { ...prev, blocks };
    });
    setSelectedBlockId(newBlock.id);
    toast.success(`${BLOCK_INFO[type].label} block added`);
  }, []);

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setDesign(prev => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex(b => b.id === blockId);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return prev;
      [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
      return { ...prev, blocks };
    });
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setDesign(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== blockId) }));
    setSelectedBlockId(null);
    toast.success('Block deleted');
  }, []);

  const duplicateBlock = useCallback((blockId: string) => {
    setDesign(prev => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex(b => b.id === blockId);
      if (index === -1) return prev;
      const newBlock = { ...blocks[index], id: generateId(), content: { ...blocks[index].content }, styles: { ...blocks[index].styles } };
      blocks.splice(index + 1, 0, newBlock);
      return { ...prev, blocks };
    });
    toast.success('Block duplicated');
  }, []);

  const updateBlockContent = useCallback((blockId: string, content: Record<string, any>) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, content: { ...b.content, ...content } } : b)
    }));
  }, []);

  const updateBlockStyles = useCallback((blockId: string, styles: Record<string, any>) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, styles: { ...b.styles, ...styles } } : b)
    }));
  }, []);

  const updateGlobalStyles = useCallback((styles: Partial<EmailDesign['globalStyles']>) => {
    setDesign(prev => ({ ...prev, globalStyles: { ...prev.globalStyles, ...styles } }));
  }, []);

  // Open media library for a specific block field
  const openMediaLibrary = (blockId: string, field: string) => {
    setMediaTarget({ blockId, field });
    setShowMediaModal(true);
  };

  // Select media item
  const selectMedia = (item: MediaItem) => {
    if (mediaTarget) {
      updateBlockContent(mediaTarget.blockId, { [mediaTarget.field]: item.url });
      setShowMediaModal(false);
      setMediaTarget(null);
      toast.success('Image selected');
    }
  };

  // Filter media by search
  const filteredMedia = mediaItems.filter(item =>
    item.mimeType?.startsWith('image/') &&
    (mediaSearch === '' || item.filename?.toLowerCase().includes(mediaSearch.toLowerCase()))
  );

  // Generate email HTML
  const generateHtml = useCallback((): string => {
    const { blocks, globalStyles } = design;

    const renderBlock = (block: EmailBlock): string => {
      const { type, content, styles } = block;
      const primaryColor = globalStyles.primaryColor;

      switch (type) {
        case 'header':
          return `<tr><td style="background:#fff;padding:${styles.padding}px;text-align:${styles.textAlign};border-bottom:1px solid #e5e7eb;">
            ${content.logoUrl ? `<img src="${content.logoUrl}" alt="Logo" style="max-height:50px;margin-bottom:12px;">` : ''}
            <h1 style="margin:0;font-size:24px;font-weight:700;color:${globalStyles.textColor};">${content.title}</h1>
          </td></tr>`;

        case 'text':
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;font-size:${styles.fontSize}px;line-height:${styles.lineHeight};text-align:${styles.textAlign};color:${styles.color};">
            ${content.text}
          </td></tr>`;

        case 'image':
          const imgHtml = content.src ? `<img src="${content.src}" alt="${content.alt}" style="max-width:100%;border-radius:${styles.borderRadius}px;display:block;margin:0 auto;">` : '<div style="background:#e5e7eb;height:200px;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#9ca3af;">No image selected</div>';
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;text-align:center;">
            ${content.link ? `<a href="${content.link}">${imgHtml}</a>` : imgHtml}
          </td></tr>`;

        case 'button':
          return `<tr><td style="padding:24px;text-align:${styles.align};">
            <a href="${content.link}" style="display:inline-block;background:${styles.backgroundColor};color:${styles.textColor};padding:${styles.padding}px ${styles.padding * 2}px;border-radius:${styles.borderRadius}px;text-decoration:none;font-size:${styles.fontSize}px;font-weight:600;">
              ${content.text}
            </a>
          </td></tr>`;

        case 'divider':
          return `<tr><td style="padding:${styles.padding}px 0;"><hr style="border:none;border-top:${styles.thickness}px solid ${styles.color};margin:0;"></td></tr>`;

        case 'spacer':
          return `<tr><td style="height:${styles.height}px;"></td></tr>`;

        case 'hero':
          return `<tr><td style="background:linear-gradient(135deg,${primaryColor},#7c3aed);padding:${styles.padding}px;text-align:${styles.textAlign};">
            <h1 style="margin:0 0 16px;font-size:36px;font-weight:800;color:${styles.textColor};">${content.title}</h1>
            <p style="margin:0 0 32px;font-size:18px;color:${styles.textColor};opacity:0.9;">${content.subtitle}</p>
            <a href="${content.buttonLink}" style="display:inline-block;background:#fff;color:${primaryColor};padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
              ${content.buttonText}
            </a>
          </td></tr>`;

        case 'footer':
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;text-align:${styles.textAlign};color:${styles.color};font-size:14px;">
            <p style="margin:0 0 8px;font-weight:600;">${content.companyName}</p>
            <p style="margin:0 0 16px;">${content.address}</p>
            <a href="${content.unsubscribeLink || '#'}" style="color:#9ca3af;">${content.unsubscribeText}</a>
          </td></tr>`;

        case 'cta':
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;text-align:${styles.textAlign};border-radius:12px;">
            <h2 style="margin:0 0 12px;font-size:28px;font-weight:700;color:${globalStyles.textColor};">${content.title}</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:16px;">${content.subtitle}</p>
            <a href="${content.buttonLink}" style="display:inline-block;background:${primaryColor};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
              ${content.buttonText}
            </a>
          </td></tr>`;

        case 'features':
          const featuresHtml = (content.features || []).map((f: any) =>
            `<td style="padding:16px;text-align:center;width:33%;">
              <div style="font-size:32px;margin-bottom:12px;">${f.icon}</div>
              <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:${globalStyles.textColor};">${f.title}</h3>
              <p style="margin:0;color:#6b7280;font-size:14px;">${f.desc || f.description || ''}</p>
            </td>`
          ).join('');
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;">
            <h2 style="margin:0 0 24px;text-align:center;font-size:24px;font-weight:700;color:${globalStyles.textColor};">${content.title}</h2>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>${featuresHtml}</tr></table>
          </td></tr>`;

        case 'testimonial':
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;text-align:${styles.textAlign};border-left:4px solid ${primaryColor};">
            <p style="margin:0 0 16px;font-size:18px;font-style:italic;color:${globalStyles.textColor};">${content.quote}</p>
            <p style="margin:0;font-weight:600;color:${globalStyles.textColor};">${content.author}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:14px;">${content.role}</p>
          </td></tr>`;

        case 'social':
          const socialIcons: Record<string, string> = { facebook: '📘', twitter: '🐦', instagram: '📸', linkedin: '💼', youtube: '▶️' };
          const linksHtml = (content.links || []).map((l: any) =>
            `<a href="${l.url}" style="display:inline-block;margin:0 8px;font-size:24px;text-decoration:none;">${socialIcons[l.platform] || '🔗'}</a>`
          ).join('');
          return `<tr><td style="background:${styles.backgroundColor};padding:${styles.padding}px;text-align:${styles.align};">
            ${content.title ? `<p style="margin:0 0 16px;font-weight:600;color:${globalStyles.textColor};">${content.title}</p>` : ''}
            ${linksHtml}
          </td></tr>`;

        default:
          return '';
      }
    };

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Email</title></head>
<body style="margin:0;padding:0;background:${globalStyles.backgroundColor};font-family:${globalStyles.fontFamily};">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${globalStyles.backgroundColor};">
<tr><td align="center" style="padding:20px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="${globalStyles.contentWidth}" style="max-width:${globalStyles.contentWidth}px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
${blocks.map(renderBlock).join('')}
</table></td></tr></table></body></html>`;
  }, [design]);

  // Save template
  const handleSave = async () => {
    if (!templateName || !templateSlug) {
      toast.error('Please enter template name and slug');
      return;
    }
    setSaving(true);
    try {
      const htmlContent = generateHtml();
      await emailApi.createTemplate({
        name: templateName,
        slug: templateSlug,
        subject: templateSubject || templateName,
        htmlContent,
        textContent: '',
        type: 'CUSTOM',
        variables: [{ name: '__design__', description: 'Design data', example: JSON.stringify(design) }],
        isActive: true
      });
      toast.success('Template saved!');
      setShowSaveModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Beautiful block preview renderer
  const renderBlockPreview = (block: EmailBlock) => {
    const { type, content, styles } = block;
    const isSelected = selectedBlockId === block.id;
    const primary = design.globalStyles.primaryColor;

    const wrapperClass = `relative transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-2 hover:ring-indigo-200'}`;

    switch (type) {
      case 'header':
        return (
          <div className={wrapperClass} style={{ background: '#fff', padding: styles.padding, textAlign: styles.textAlign as any, borderBottom: '1px solid #e5e7eb' }}>
            {content.logoUrl && <img src={content.logoUrl} alt="Logo" className="h-12 mx-auto mb-3" />}
            <h1 className="text-2xl font-bold text-gray-800 m-0">{content.title}</h1>
          </div>
        );

      case 'text':
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding, fontSize: styles.fontSize, lineHeight: styles.lineHeight, textAlign: styles.textAlign as any, color: styles.color }}>
            {content.text}
          </div>
        );

      case 'image':
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding, textAlign: 'center' }}>
            {content.src ? (
              <img src={content.src} alt={content.alt} className="max-w-full rounded-lg shadow-sm mx-auto" style={{ borderRadius: styles.borderRadius }} />
            ) : (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                <FiImage size={48} className="mb-2" />
                <span className="text-sm">Click to add image from Media Library</span>
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <div className={wrapperClass} style={{ padding: 24, textAlign: styles.align as any }}>
            <span className="inline-block shadow-lg transform hover:scale-105 transition-transform" style={{
              background: `linear-gradient(135deg, ${styles.backgroundColor}, ${styles.backgroundColor}dd)`,
              color: styles.textColor,
              padding: `${styles.padding}px ${styles.padding * 2}px`,
              borderRadius: styles.borderRadius,
              fontSize: styles.fontSize,
              fontWeight: 600
            }}>
              {content.text}
            </span>
          </div>
        );

      case 'divider':
        return (
          <div className={wrapperClass} style={{ padding: `${styles.padding}px 0` }}>
            <hr style={{ border: 'none', borderTop: `${styles.thickness}px solid ${styles.color}`, margin: 0 }} />
          </div>
        );

      case 'spacer':
        return (
          <div className={wrapperClass} style={{ height: styles.height, background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(79,70,229,0.03) 10px, rgba(79,70,229,0.03) 20px)' }}>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
              {styles.height}px
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className={wrapperClass} style={{ background: `linear-gradient(135deg, ${primary}, #7c3aed)`, padding: styles.padding, textAlign: styles.textAlign as any }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{content.title}</h1>
            <p className="text-lg text-white/90 mb-8 max-w-md mx-auto">{content.subtitle}</p>
            <span className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold shadow-lg">
              {content.buttonText}
            </span>
          </div>
        );

      case 'footer':
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding, textAlign: styles.textAlign as any, color: styles.color }}>
            <p className="font-semibold mb-2">{content.companyName}</p>
            <p className="text-sm mb-4">{content.address}</p>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300 underline">{content.unsubscribeText}</a>
          </div>
        );

      case 'cta':
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding, textAlign: styles.textAlign as any, borderRadius: 12 }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{content.title}</h2>
            <p className="text-gray-600 mb-6">{content.subtitle}</p>
            <span className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md">
              {content.buttonText}
            </span>
          </div>
        );

      case 'features':
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding }}>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">{content.title}</h2>
            <div className="grid grid-cols-3 gap-4">
              {(content.features || []).map((f: any, i: number) => (
                <div key={i} className="text-center p-4">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc || f.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding, textAlign: styles.textAlign as any, borderLeft: `4px solid ${primary}` }}>
            <p className="text-lg italic text-gray-700 mb-4">{content.quote}</p>
            <p className="font-semibold text-gray-800">{content.author}</p>
            <p className="text-sm text-gray-500">{content.role}</p>
          </div>
        );

      case 'social':
        const icons: Record<string, string> = { facebook: '📘', twitter: '🐦', instagram: '📸', linkedin: '💼' };
        return (
          <div className={wrapperClass} style={{ background: styles.backgroundColor, padding: styles.padding, textAlign: styles.align as any }}>
            {content.title && <p className="font-semibold text-gray-800 mb-4">{content.title}</p>}
            <div className="flex justify-center gap-4">
              {(content.links || []).map((l: any, i: number) => (
                <span key={i} className="text-2xl cursor-pointer hover:scale-110 transition-transform">
                  {icons[l.platform] || '🔗'}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return <div className={wrapperClass} style={{ padding: 20 }}>Unknown block</div>;
    }
  };

  // Style editor panel
  const StyleEditor = ({ block }: { block: EmailBlock }) => {
    const { type, content, styles } = block;
    const Icon = BLOCK_INFO[type].icon;

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{BLOCK_INFO[type].label}</h3>
            <p className="text-xs text-gray-500">Edit block settings</p>
          </div>
        </div>

        {/* Text block */}
        {type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={content.text}
                onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                <input type="number" value={styles.fontSize} onChange={(e) => updateBlockStyles(block.id, { fontSize: +e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                <input type="color" value={styles.color} onChange={(e) => updateBlockStyles(block.id, { color: e.target.value })} className="w-full h-10 rounded-lg border cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Alignment</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(a => (
                  <button key={a} onClick={() => updateBlockStyles(block.id, { textAlign: a })} className={`flex-1 p-2 rounded-lg border ${styles.textAlign === a ? 'bg-indigo-100 border-indigo-500 text-indigo-600' : 'hover:bg-gray-50'}`}>
                    {a === 'left' && <FiAlignLeft className="mx-auto" />}
                    {a === 'center' && <FiAlignCenter className="mx-auto" />}
                    {a === 'right' && <FiAlignRight className="mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Image block */}
        {type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <button onClick={() => openMediaLibrary(block.id, 'src')} className="w-full p-4 border-2 border-dashed rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                {content.src ? (
                  <img src={content.src} alt="" className="max-h-32 mx-auto rounded-lg" />
                ) : (
                  <div className="text-center text-gray-500">
                    <FiImage size={32} className="mx-auto mb-2" />
                    <span className="text-sm">Choose from Media Library</span>
                  </div>
                )}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
              <input type="text" value={content.alt} onChange={(e) => updateBlockContent(block.id, { alt: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL (optional)</label>
              <input type="text" value={content.link} onChange={(e) => updateBlockContent(block.id, { link: e.target.value })} placeholder="https://..." className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
              <input type="range" min="0" max="24" value={styles.borderRadius} onChange={(e) => updateBlockStyles(block.id, { borderRadius: +e.target.value })} className="w-full" />
            </div>
          </>
        )}

        {/* Button block */}
        {type === 'button' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
              <input type="text" value={content.text} onChange={(e) => updateBlockContent(block.id, { text: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
              <input type="text" value={content.link} onChange={(e) => updateBlockContent(block.id, { link: e.target.value })} placeholder="https://..." className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Button Color</label>
                <input type="color" value={styles.backgroundColor} onChange={(e) => updateBlockStyles(block.id, { backgroundColor: e.target.value })} className="w-full h-10 rounded-lg border cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                <input type="color" value={styles.textColor} onChange={(e) => updateBlockStyles(block.id, { textColor: e.target.value })} className="w-full h-10 rounded-lg border cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
              <input type="range" min="0" max="24" value={styles.borderRadius} onChange={(e) => updateBlockStyles(block.id, { borderRadius: +e.target.value })} className="w-full" />
            </div>
          </>
        )}

        {/* Header block */}
        {type === 'header' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <button onClick={() => openMediaLibrary(block.id, 'logoUrl')} className="w-full p-4 border-2 border-dashed rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                {content.logoUrl ? (
                  <img src={content.logoUrl} alt="" className="max-h-16 mx-auto" />
                ) : (
                  <div className="text-center text-gray-500">
                    <FiImage size={24} className="mx-auto mb-1" />
                    <span className="text-sm">Add Logo</span>
                  </div>
                )}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" value={content.title} onChange={(e) => updateBlockContent(block.id, { title: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </>
        )}

        {/* Hero block */}
        {type === 'hero' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" value={content.title} onChange={(e) => updateBlockContent(block.id, { title: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
              <textarea value={content.subtitle} onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })} className="w-full p-2 border rounded-lg text-sm" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                <input type="text" value={content.buttonText} onChange={(e) => updateBlockContent(block.id, { buttonText: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Button Link</label>
                <input type="text" value={content.buttonLink} onChange={(e) => updateBlockContent(block.id, { buttonLink: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
            </div>
          </>
        )}

        {/* CTA block */}
        {type === 'cta' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" value={content.title} onChange={(e) => updateBlockContent(block.id, { title: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
              <input type="text" value={content.subtitle} onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                <input type="text" value={content.buttonText} onChange={(e) => updateBlockContent(block.id, { buttonText: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Button Link</label>
                <input type="text" value={content.buttonLink} onChange={(e) => updateBlockContent(block.id, { buttonLink: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
            </div>
          </>
        )}

        {/* Footer block */}
        {type === 'footer' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
              <input type="text" value={content.companyName} onChange={(e) => updateBlockContent(block.id, { companyName: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input type="text" value={content.address} onChange={(e) => updateBlockContent(block.id, { address: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unsubscribe Text</label>
              <input type="text" value={content.unsubscribeText} onChange={(e) => updateBlockContent(block.id, { unsubscribeText: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </>
        )}

        {/* Testimonial block */}
        {type === 'testimonial' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quote</label>
              <textarea value={content.quote} onChange={(e) => updateBlockContent(block.id, { quote: e.target.value })} className="w-full p-2 border rounded-lg text-sm" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
                <input type="text" value={content.author} onChange={(e) => updateBlockContent(block.id, { author: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <input type="text" value={content.role} onChange={(e) => updateBlockContent(block.id, { role: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
              </div>
            </div>
          </>
        )}

        {/* Spacer block */}
        {type === 'spacer' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Height: {styles.height}px</label>
            <input type="range" min="16" max="120" value={styles.height} onChange={(e) => updateBlockStyles(block.id, { height: +e.target.value })} className="w-full" />
          </div>
        )}

        {/* Divider block */}
        {type === 'divider' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
              <input type="color" value={styles.color} onChange={(e) => updateBlockStyles(block.id, { color: e.target.value })} className="w-full h-10 rounded-lg border cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thickness: {styles.thickness}px</label>
              <input type="range" min="1" max="8" value={styles.thickness} onChange={(e) => updateBlockStyles(block.id, { thickness: +e.target.value })} className="w-full" />
            </div>
          </>
        )}

        {/* Common padding */}
        {styles.padding !== undefined && (
          <div className="pt-4 border-t">
            <label className="block text-xs font-medium text-gray-600 mb-1">Padding: {styles.padding}px</label>
            <input type="range" min="0" max="80" value={styles.padding} onChange={(e) => updateBlockStyles(block.id, { padding: +e.target.value })} className="w-full" />
          </div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top toolbar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Email Designer
          </h1>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <FiMonitor size={18} />
            </button>
            <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <FiSmartphone size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreviewModal(true)} className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <FiEye size={18} /> Preview
          </button>
          <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md">
            <FiSave size={18} /> Save Template
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Block palette */}
        <div className="w-72 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Blocks</h2>
            {Object.entries(BLOCK_CATEGORIES).map(([category, types]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-medium text-gray-400 uppercase mb-3">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {types.map(type => {
                    const info = BLOCK_INFO[type];
                    const Icon = info.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-purple-100 flex items-center justify-center text-gray-500 group-hover:text-indigo-600 transition-colors">
                          <Icon size={20} />
                        </div>
                        <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto p-8" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)' }}>
          <div
            className="mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
            style={{ width: previewMode === 'mobile' ? 375 : design.globalStyles.contentWidth, maxWidth: '100%' }}
          >
            {design.blocks.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <FiPlus size={32} className="text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Building</h3>
                <p className="text-gray-500 mb-6">Click on blocks from the left panel to add them here</p>
                <button onClick={() => addBlock('hero')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg">
                  Add Hero Section
                </button>
              </div>
            ) : (
              design.blocks.map((block, index) => (
                <div key={block.id} className="relative group" onClick={() => setSelectedBlockId(block.id)}>
                  {renderBlockPreview(block)}
                  {/* Block controls */}
                  <div className={`absolute top-2 right-2 flex gap-1 transition-opacity ${selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} disabled={index === 0} className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <FiArrowUp size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} disabled={index === design.blocks.length - 1} className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <FiArrowDown size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50">
                      <FiCopy size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 text-red-500">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar - Style editor */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-5">
            {selectedBlock ? (
              <StyleEditor block={selectedBlock} />
            ) : (
              <>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Global Styles</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
                    <input type="color" value={design.globalStyles.backgroundColor} onChange={(e) => updateGlobalStyles({ backgroundColor: e.target.value })} className="w-full h-10 rounded-lg border cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Primary Color</label>
                    <input type="color" value={design.globalStyles.primaryColor} onChange={(e) => updateGlobalStyles({ primaryColor: e.target.value })} className="w-full h-10 rounded-lg border cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Content Width</label>
                    <input type="number" value={design.globalStyles.contentWidth} onChange={(e) => updateGlobalStyles({ contentWidth: +e.target.value })} className="w-full p-2 border rounded-lg text-sm" min={400} max={800} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                    <select value={design.globalStyles.fontFamily} onChange={(e) => updateGlobalStyles({ fontFamily: e.target.value })} className="w-full p-2 border rounded-lg text-sm">
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-medium text-indigo-600">Tip:</span> Click on a block in the canvas to edit its content and styles
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Email Preview</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-md ${previewMode === 'desktop' ? 'bg-white shadow' : ''}`}>
                    <FiMonitor size={16} />
                  </button>
                  <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-md ${previewMode === 'mobile' ? 'bg-white shadow' : ''}`}>
                    <FiSmartphone size={16} />
                  </button>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              <div className="mx-auto transition-all" style={{ width: previewMode === 'mobile' ? 375 : design.globalStyles.contentWidth }}>
                <iframe
                  srcDoc={generateHtml()}
                  className="w-full h-[600px] bg-white rounded-lg shadow-lg border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Save Template</h2>
              <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => { setTemplateName(e.target.value); setTemplateSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }}
                  placeholder="Welcome Email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={templateSlug}
                  onChange={(e) => setTemplateSlug(e.target.value)}
                  placeholder="welcome-email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Welcome to {{site.name}}!"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !templateName || !templateSlug}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Media Library</h2>
              <button onClick={() => { setShowMediaModal(false); setMediaTarget(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Search images..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No images found in your media library</p>
                  <p className="text-sm mt-2">Upload images via Media → Library</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {filteredMedia.map(item => (
                    <button
                      key={item.id}
                      onClick={() => selectMedia(item)}
                      className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors group relative"
                    >
                      <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}