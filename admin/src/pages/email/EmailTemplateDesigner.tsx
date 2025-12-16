/**
 * Visual Email Template Designer
 * Drag-and-drop block-based email template builder
 */

import { useState, useCallback } from 'react';
import { 
  FiType, FiImage, FiSquare, FiColumns, FiMinus, FiLink, 
  FiArrowUp, FiArrowDown, FiTrash2, FiCopy, FiSmartphone, FiMonitor,
  FiSave, FiEye, FiX, FiPlus, FiLayout, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { emailApi } from '../../services/api';

// Block Types
export type BlockType = 'header' | 'text' | 'image' | 'button' | 'columns' | 'divider' | 'spacer' | 'footer' | 'hero' | 'social';

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
    secondaryColor: string;
    textColor: string;
    linkColor: string;
  };
}

// Default block configurations
const DEFAULT_BLOCKS: Record<BlockType, Partial<EmailBlock>> = {
  header: {
    content: { logoUrl: '', logoAlt: 'Logo', showLogo: true, title: 'Company Name' },
    styles: { backgroundColor: '#ffffff', padding: 20, textAlign: 'center' }
  },
  text: {
    content: { text: 'Add your text content here. You can use <strong>bold</strong>, <em>italic</em>, and other HTML formatting.' },
    styles: { backgroundColor: 'transparent', padding: 16, fontSize: 16, lineHeight: 1.6, textAlign: 'left', color: '#333333' }
  },
  image: {
    content: { src: 'https://via.placeholder.com/600x200', alt: 'Image', link: '' },
    styles: { backgroundColor: 'transparent', padding: 0, width: '100%', borderRadius: 0 }
  },
  button: {
    content: { text: 'Click Here', link: '#' },
    styles: { backgroundColor: '#4F46E5', textColor: '#ffffff', padding: 14, borderRadius: 6, fontSize: 16, align: 'center', fullWidth: false }
  },
  columns: {
    content: { 
      columns: [
        { blocks: [], width: 50 },
        { blocks: [], width: 50 }
      ]
    },
    styles: { backgroundColor: 'transparent', padding: 0, gap: 16 }
  },
  divider: {
    content: {},
    styles: { color: '#e5e7eb', thickness: 1, padding: 16, style: 'solid' }
  },
  spacer: {
    content: {},
    styles: { height: 32 }
  },
  footer: {
    content: { 
      companyName: '{{site.name}}',
      address: '123 Main Street, City, Country',
      unsubscribeText: 'Unsubscribe',
      unsubscribeLink: '{{unsubscribe_url}}'
    },
    styles: { backgroundColor: '#f9fafb', padding: 24, textAlign: 'center', fontSize: 12, color: '#6b7280' }
  },
  hero: {
    content: { 
      title: 'Welcome to Our Newsletter',
      subtitle: 'Stay updated with our latest news',
      buttonText: 'Get Started',
      buttonLink: '#',
      backgroundImage: ''
    },
    styles: { backgroundColor: '#4F46E5', textColor: '#ffffff', padding: 48, textAlign: 'center' }
  },
  social: {
    content: {
      links: [
        { platform: 'facebook', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'instagram', url: '#' },
        { platform: 'linkedin', url: '#' }
      ]
    },
    styles: { backgroundColor: 'transparent', padding: 16, iconSize: 32, iconColor: '#6b7280', align: 'center' }
  }
};

const BLOCK_LABELS: Record<BlockType, { label: string; icon: any }> = {
  header: { label: 'Header', icon: FiLayout },
  text: { label: 'Text Block', icon: FiType },
  image: { label: 'Image', icon: FiImage },
  button: { label: 'Button', icon: FiSquare },
  columns: { label: 'Columns', icon: FiColumns },
  divider: { label: 'Divider', icon: FiMinus },
  spacer: { label: 'Spacer', icon: FiArrowDown },
  footer: { label: 'Footer', icon: FiLayout },
  hero: { label: 'Hero Section', icon: FiLayout },
  social: { label: 'Social Links', icon: FiLink }
};

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
];

// Generate unique ID
const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a new block
const createBlock = (type: BlockType): EmailBlock => ({
  id: generateId(),
  type,
  content: { ...DEFAULT_BLOCKS[type].content },
  styles: { ...DEFAULT_BLOCKS[type].styles }
});

// Default design
const DEFAULT_DESIGN: EmailDesign = {
  blocks: [],
  globalStyles: {
    backgroundColor: '#f3f4f6',
    contentWidth: 600,
    fontFamily: 'Arial, sans-serif',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
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
  const [templateName, setTemplateName] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [showBlockPanel, setShowBlockPanel] = useState(true);
  const [showStylePanel, setShowStylePanel] = useState(true);
  const [draggedBlockType, setDraggedBlockType] = useState<BlockType | null>(null);

  const selectedBlock = design.blocks.find(b => b.id === selectedBlockId);

  // Add a new block
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
  }, []);

  // Move block up/down
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

  // Delete block
  const deleteBlock = useCallback((blockId: string) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId)
    }));
    setSelectedBlockId(null);
  }, []);

  // Duplicate block
  const duplicateBlock = useCallback((blockId: string) => {
    setDesign(prev => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex(b => b.id === blockId);
      if (index === -1) return prev;

      const newBlock = {
        ...blocks[index],
        id: generateId(),
        content: { ...blocks[index].content },
        styles: { ...blocks[index].styles }
      };
      blocks.splice(index + 1, 0, newBlock);
      return { ...prev, blocks };
    });
  }, []);

  // Update block content
  const updateBlockContent = useCallback((blockId: string, content: Record<string, any>) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === blockId ? { ...b, content: { ...b.content, ...content } } : b
      )
    }));
  }, []);

  // Update block styles
  const updateBlockStyles = useCallback((blockId: string, styles: Record<string, any>) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.map(b =>
        b.id === blockId ? { ...b, styles: { ...b.styles, ...styles } } : b
      )
    }));
  }, []);

  // Update global styles
  const updateGlobalStyles = useCallback((styles: Partial<EmailDesign['globalStyles']>) => {
    setDesign(prev => ({
      ...prev,
      globalStyles: { ...prev.globalStyles, ...styles }
    }));
  }, []);

  // Handle drag start
  const handleDragStart = (type: BlockType) => {
    setDraggedBlockType(type);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlockType) {
      addBlock(draggedBlockType, index);
      setDraggedBlockType(null);
    }
  };

  // Generate HTML from design
  const generateHtml = useCallback((): string => {
    const { blocks, globalStyles } = design;

    const renderBlock = (block: EmailBlock): string => {
      const { type, content, styles } = block;

      switch (type) {
        case 'header':
          return `
            <tr>
              <td style="background-color: ${styles.backgroundColor}; padding: ${styles.padding}px; text-align: ${styles.textAlign};">
                ${content.showLogo && content.logoUrl ? `<img src="${content.logoUrl}" alt="${content.logoAlt}" style="max-height: 60px;" />` : ''}
                ${content.title ? `<h1 style="margin: 10px 0 0; font-size: 24px; color: ${globalStyles.textColor};">${content.title}</h1>` : ''}
              </td>
            </tr>`;

        case 'text':
          return `
            <tr>
              <td style="background-color: ${styles.backgroundColor}; padding: ${styles.padding}px; font-size: ${styles.fontSize}px; line-height: ${styles.lineHeight}; text-align: ${styles.textAlign}; color: ${styles.color};">
                ${content.text}
              </td>
            </tr>`;

        case 'image':
          const imgHtml = `<img src="${content.src}" alt="${content.alt}" style="width: ${styles.width}; border-radius: ${styles.borderRadius}px; display: block;" />`;
          return `
            <tr>
              <td style="background-color: ${styles.backgroundColor}; padding: ${styles.padding}px; text-align: center;">
                ${content.link ? `<a href="${content.link}">${imgHtml}</a>` : imgHtml}
              </td>
            </tr>`;

        case 'button':
          return `
            <tr>
              <td style="padding: 16px; text-align: ${styles.align};">
                <a href="${content.link}" style="display: ${styles.fullWidth ? 'block' : 'inline-block'}; background-color: ${styles.backgroundColor}; color: ${styles.textColor}; padding: ${styles.padding}px ${styles.padding * 2}px; border-radius: ${styles.borderRadius}px; text-decoration: none; font-size: ${styles.fontSize}px; font-weight: 600;">
                  ${content.text}
                </a>
              </td>
            </tr>`;

        case 'divider':
          return `
            <tr>
              <td style="padding: ${styles.padding}px 0;">
                <hr style="border: none; border-top: ${styles.thickness}px ${styles.style} ${styles.color}; margin: 0;" />
              </td>
            </tr>`;

        case 'spacer':
          return `<tr><td style="height: ${styles.height}px;"></td></tr>`;

        case 'hero':
          return `
            <tr>
              <td style="background-color: ${styles.backgroundColor}; ${content.backgroundImage ? `background-image: url('${content.backgroundImage}'); background-size: cover;` : ''} padding: ${styles.padding}px; text-align: ${styles.textAlign};">
                <h1 style="margin: 0 0 16px; font-size: 32px; color: ${styles.textColor};">${content.title}</h1>
                <p style="margin: 0 0 24px; font-size: 18px; color: ${styles.textColor}; opacity: 0.9;">${content.subtitle}</p>
                <a href="${content.buttonLink}" style="display: inline-block; background-color: #ffffff; color: ${styles.backgroundColor}; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  ${content.buttonText}
                </a>
              </td>
            </tr>`;

        case 'footer':
          return `
            <tr>
              <td style="background-color: ${styles.backgroundColor}; padding: ${styles.padding}px; text-align: ${styles.textAlign}; font-size: ${styles.fontSize}px; color: ${styles.color};">
                <p style="margin: 0 0 8px;">${content.companyName}</p>
                <p style="margin: 0 0 8px;">${content.address}</p>
                <a href="${content.unsubscribeLink}" style="color: ${globalStyles.linkColor};">${content.unsubscribeText}</a>
              </td>
            </tr>`;

        case 'social':
          const socialIcons: Record<string, string> = {
            facebook: '📘', twitter: '🐦', instagram: '📸', linkedin: '💼', youtube: '▶️'
          };
          return `
            <tr>
              <td style="background-color: ${styles.backgroundColor}; padding: ${styles.padding}px; text-align: ${styles.align};">
                ${content.links.map((link: any) =>
                  `<a href="${link.url}" style="display: inline-block; margin: 0 8px; font-size: ${styles.iconSize}px; text-decoration: none;">${socialIcons[link.platform] || '🔗'}</a>`
                ).join('')}
              </td>
            </tr>`;

        default:
          return '';
      }
    };

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${globalStyles.backgroundColor}; font-family: ${globalStyles.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${globalStyles.backgroundColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="${globalStyles.contentWidth}" style="max-width: ${globalStyles.contentWidth}px; background-color: #ffffff;">
          ${blocks.map(renderBlock).join('\n')}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }, [design]);

  // Save template
  const handleSave = async () => {
    if (!templateName || !templateSlug) {
      toast.error('Please enter template name and slug');
      return;
    }

    try {
      const htmlContent = generateHtml();
      // Store design data as a special variable for later editing
      const designVariable = {
        name: '__design_data__',
        description: 'Block design data for visual editor',
        example: JSON.stringify(design)
      };
      await emailApi.createTemplate({
        name: templateName,
        slug: templateSlug,
        subject: templateSubject || templateName,
        htmlContent,
        textContent: '',
        type: 'CUSTOM',
        variables: [designVariable],
        isActive: true
      });
      toast.success('Template saved successfully!');
      setShowSaveModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  // Block toolbar component
  const BlockToolbar = ({ block }: { block: EmailBlock }) => (
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1 shadow-lg z-10">
      <button
        onClick={() => moveBlock(block.id, 'up')}
        className="p-1 text-gray-300 hover:text-white"
        title="Move up"
      >
        <FiArrowUp size={14} />
      </button>
      <button
        onClick={() => moveBlock(block.id, 'down')}
        className="p-1 text-gray-300 hover:text-white"
        title="Move down"
      >
        <FiArrowDown size={14} />
      </button>
      <button
        onClick={() => duplicateBlock(block.id)}
        className="p-1 text-gray-300 hover:text-white"
        title="Duplicate"
      >
        <FiCopy size={14} />
      </button>
      <button
        onClick={() => deleteBlock(block.id)}
        className="p-1 text-red-400 hover:text-red-300"
        title="Delete"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  );

  // Render block in canvas
  const renderBlockPreview = (block: EmailBlock) => {
    const { type, content, styles } = block;
    const isSelected = selectedBlockId === block.id;

    const wrapperStyle: React.CSSProperties = {
      backgroundColor: styles.backgroundColor || 'transparent',
      padding: styles.padding ? `${styles.padding}px` : undefined,
      cursor: 'pointer',
      position: 'relative',
      outline: isSelected ? '2px solid #4F46E5' : '2px solid transparent',
      transition: 'outline-color 0.15s'
    };

    switch (type) {
      case 'header':
        return (
          <div style={{ ...wrapperStyle, textAlign: styles.textAlign as any }}>
            {content.showLogo && content.logoUrl && (
              <img src={content.logoUrl} alt={content.logoAlt} style={{ maxHeight: 60 }} />
            )}
            {content.title && <h1 style={{ margin: '10px 0 0', fontSize: 24 }}>{content.title}</h1>}
          </div>
        );

      case 'text':
        return (
          <div
            style={{
              ...wrapperStyle,
              fontSize: styles.fontSize,
              lineHeight: styles.lineHeight,
              textAlign: styles.textAlign as any,
              color: styles.color
            }}
            dangerouslySetInnerHTML={{ __html: content.text }}
          />
        );

      case 'image':
        return (
          <div style={{ ...wrapperStyle, textAlign: 'center' }}>
            <img
              src={content.src}
              alt={content.alt}
              style={{ width: styles.width, borderRadius: styles.borderRadius, maxWidth: '100%' }}
            />
          </div>
        );

      case 'button':
        return (
          <div style={{ ...wrapperStyle, padding: 16, textAlign: styles.align as any }}>
            <span
              style={{
                display: styles.fullWidth ? 'block' : 'inline-block',
                backgroundColor: styles.backgroundColor,
                color: styles.textColor,
                padding: `${styles.padding}px ${styles.padding * 2}px`,
                borderRadius: styles.borderRadius,
                fontSize: styles.fontSize,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              {content.text}
            </span>
          </div>
        );

      case 'divider':
        return (
          <div style={{ ...wrapperStyle, padding: `${styles.padding}px 0` }}>
            <hr style={{ border: 'none', borderTop: `${styles.thickness}px ${styles.style} ${styles.color}`, margin: 0 }} />
          </div>
        );

      case 'spacer':
        return <div style={{ ...wrapperStyle, height: styles.height, backgroundColor: 'rgba(79, 70, 229, 0.05)' }} />;

      case 'hero':
        return (
          <div
            style={{
              ...wrapperStyle,
              backgroundColor: styles.backgroundColor,
              backgroundImage: content.backgroundImage ? `url('${content.backgroundImage}')` : undefined,
              backgroundSize: 'cover',
              textAlign: styles.textAlign as any
            }}
          >
            <h1 style={{ margin: '0 0 16px', fontSize: 32, color: styles.textColor }}>{content.title}</h1>
            <p style={{ margin: '0 0 24px', fontSize: 18, color: styles.textColor, opacity: 0.9 }}>{content.subtitle}</p>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#ffffff',
                color: styles.backgroundColor,
                padding: '14px 32px',
                borderRadius: 6,
                fontWeight: 600
              }}
            >
              {content.buttonText}
            </span>
          </div>
        );

      case 'footer':
        return (
          <div style={{ ...wrapperStyle, textAlign: styles.textAlign as any, fontSize: styles.fontSize, color: styles.color }}>
            <p style={{ margin: '0 0 8px' }}>{content.companyName}</p>
            <p style={{ margin: '0 0 8px' }}>{content.address}</p>
            <a href="#" style={{ color: design.globalStyles.linkColor }}>{content.unsubscribeText}</a>
          </div>
        );

      case 'social':
        const socialIcons: Record<string, string> = {
          facebook: '📘', twitter: '🐦', instagram: '📸', linkedin: '💼', youtube: '▶️'
        };
        return (
          <div style={{ ...wrapperStyle, textAlign: styles.align as any }}>
            {content.links?.map((link: any, i: number) => (
              <span key={i} style={{ display: 'inline-block', margin: '0 8px', fontSize: styles.iconSize }}>
                {socialIcons[link.platform] || '🔗'}
              </span>
            ))}
          </div>
        );

      default:
        return <div style={wrapperStyle}>Unknown block type</div>;
    }
  };

  // Block style editor panel
  const BlockStyleEditor = ({ block }: { block: EmailBlock }) => {
    const { type, content, styles } = block;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          {(() => { const Icon = BLOCK_LABELS[type].icon; return <Icon size={16} />; })()}
          {BLOCK_LABELS[type].label} Settings
        </h3>

        {/* Common padding control */}
        {styles.padding !== undefined && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Padding</label>
            <input
              type="range"
              min="0"
              max="64"
              value={styles.padding}
              onChange={(e) => updateBlockStyles(block.id, { padding: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{styles.padding}px</span>
          </div>
        )}

        {/* Background color */}
        {styles.backgroundColor !== undefined && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={styles.backgroundColor === 'transparent' ? '#ffffff' : styles.backgroundColor}
              onChange={(e) => updateBlockStyles(block.id, { backgroundColor: e.target.value })}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
        )}

        {/* Text block specific */}
        {type === 'text' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text Content</label>
              <textarea
                value={content.text}
                onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Font Size</label>
              <input
                type="range"
                min="12"
                max="32"
                value={styles.fontSize}
                onChange={(e) => updateBlockStyles(block.id, { fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{styles.fontSize}px</span>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text Color</label>
              <input
                type="color"
                value={styles.color}
                onChange={(e) => updateBlockStyles(block.id, { color: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text Align</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateBlockStyles(block.id, { textAlign: align })}
                    className={`flex-1 p-2 rounded border ${styles.textAlign === align ? 'bg-indigo-100 border-indigo-500' : ''}`}
                  >
                    {align === 'left' && <FiAlignLeft className="mx-auto" />}
                    {align === 'center' && <FiAlignCenter className="mx-auto" />}
                    {align === 'right' && <FiAlignRight className="mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Button block specific */}
        {type === 'button' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Text</label>
              <input
                type="text"
                value={content.text}
                onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Link</label>
              <input
                type="text"
                value={content.link}
                onChange={(e) => updateBlockContent(block.id, { link: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Color</label>
              <input
                type="color"
                value={styles.backgroundColor}
                onChange={(e) => updateBlockStyles(block.id, { backgroundColor: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text Color</label>
              <input
                type="color"
                value={styles.textColor}
                onChange={(e) => updateBlockStyles(block.id, { textColor: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Border Radius</label>
              <input
                type="range"
                min="0"
                max="32"
                value={styles.borderRadius}
                onChange={(e) => updateBlockStyles(block.id, { borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{styles.borderRadius}px</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={styles.fullWidth}
                onChange={(e) => updateBlockStyles(block.id, { fullWidth: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm text-gray-600">Full Width</label>
            </div>
          </>
        )}

        {/* Image block specific */}
        {type === 'image' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Image URL</label>
              <input
                type="text"
                value={content.src}
                onChange={(e) => updateBlockContent(block.id, { src: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Alt Text</label>
              <input
                type="text"
                value={content.alt}
                onChange={(e) => updateBlockContent(block.id, { alt: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Link (optional)</label>
              <input
                type="text"
                value={content.link}
                onChange={(e) => updateBlockContent(block.id, { link: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Border Radius</label>
              <input
                type="range"
                min="0"
                max="32"
                value={styles.borderRadius}
                onChange={(e) => updateBlockStyles(block.id, { borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{styles.borderRadius}px</span>
            </div>
          </>
        )}

        {/* Hero block specific */}
        {type === 'hero' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => updateBlockContent(block.id, { subtitle: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Text</label>
              <input
                type="text"
                value={content.buttonText}
                onChange={(e) => updateBlockContent(block.id, { buttonText: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Link</label>
              <input
                type="text"
                value={content.buttonLink}
                onChange={(e) => updateBlockContent(block.id, { buttonLink: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Text Color</label>
              <input
                type="color"
                value={styles.textColor}
                onChange={(e) => updateBlockStyles(block.id, { textColor: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
          </>
        )}

        {/* Header block specific */}
        {type === 'header' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Logo URL</label>
              <input
                type="text"
                value={content.logoUrl}
                onChange={(e) => updateBlockContent(block.id, { logoUrl: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => updateBlockContent(block.id, { title: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.showLogo}
                onChange={(e) => updateBlockContent(block.id, { showLogo: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm text-gray-600">Show Logo</label>
            </div>
          </>
        )}

        {/* Footer block specific */}
        {type === 'footer' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Company Name</label>
              <input
                type="text"
                value={content.companyName}
                onChange={(e) => updateBlockContent(block.id, { companyName: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <input
                type="text"
                value={content.address}
                onChange={(e) => updateBlockContent(block.id, { address: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </>
        )}

        {/* Spacer block specific */}
        {type === 'spacer' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Height</label>
            <input
              type="range"
              min="8"
              max="128"
              value={styles.height}
              onChange={(e) => updateBlockStyles(block.id, { height: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{styles.height}px</span>
          </div>
        )}

        {/* Divider block specific */}
        {type === 'divider' && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Color</label>
              <input
                type="color"
                value={styles.color}
                onChange={(e) => updateBlockStyles(block.id, { color: e.target.value })}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Thickness</label>
              <input
                type="range"
                min="1"
                max="8"
                value={styles.thickness}
                onChange={(e) => updateBlockStyles(block.id, { thickness: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{styles.thickness}px</span>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Style</label>
              <select
                value={styles.style}
                onChange={(e) => updateBlockStyles(block.id, { style: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}
      </div>
    );
  };

  // Global styles editor
  const GlobalStylesEditor = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Global Styles</h3>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Email Background</label>
        <input
          type="color"
          value={design.globalStyles.backgroundColor}
          onChange={(e) => updateGlobalStyles({ backgroundColor: e.target.value })}
          className="w-full h-10 rounded border cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Content Width</label>
        <input
          type="range"
          min="400"
          max="800"
          step="50"
          value={design.globalStyles.contentWidth}
          onChange={(e) => updateGlobalStyles({ contentWidth: parseInt(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{design.globalStyles.contentWidth}px</span>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Font Family</label>
        <select
          value={design.globalStyles.fontFamily}
          onChange={(e) => updateGlobalStyles({ fontFamily: e.target.value })}
          className="w-full p-2 border rounded text-sm"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
        <input
          type="color"
          value={design.globalStyles.primaryColor}
          onChange={(e) => updateGlobalStyles({ primaryColor: e.target.value })}
          className="w-full h-10 rounded border cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Text Color</label>
        <input
          type="color"
          value={design.globalStyles.textColor}
          onChange={(e) => updateGlobalStyles({ textColor: e.target.value })}
          className="w-full h-10 rounded border cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Link Color</label>
        <input
          type="color"
          value={design.globalStyles.linkColor}
          onChange={(e) => updateGlobalStyles({ linkColor: e.target.value })}
          className="w-full h-10 rounded border cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Email Template Designer</h1>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
              title="Desktop Preview"
            >
              <FiMonitor size={18} />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
              title="Mobile Preview"
            >
              <FiSmartphone size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FiEye size={16} />
            Preview HTML
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FiSave size={16} />
            Save Template
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Block Palette */}
        <div className={`bg-white border-r transition-all ${showBlockPanel ? 'w-64' : 'w-12'}`}>
          <div className="p-3 border-b flex items-center justify-between">
            {showBlockPanel && <span className="font-semibold text-sm">Blocks</span>}
            <button
              onClick={() => setShowBlockPanel(!showBlockPanel)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {showBlockPanel ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            </button>
          </div>

          {showBlockPanel && (
            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {(Object.keys(BLOCK_LABELS) as BlockType[]).map(type => {
                const { label, icon: Icon } = BLOCK_LABELS[type];
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => handleDragStart(type)}
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100 border border-transparent hover:border-indigo-300 transition-colors"
                  >
                    <Icon size={18} className="text-gray-600" />
                    <span className="text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center - Canvas */}
        <div
          className="flex-1 overflow-auto p-6"
          style={{ backgroundColor: design.globalStyles.backgroundColor }}
        >
          <div
            className="mx-auto bg-white shadow-lg transition-all"
            style={{
              width: previewMode === 'mobile' ? 375 : design.globalStyles.contentWidth,
              fontFamily: design.globalStyles.fontFamily,
              minHeight: 400
            }}
          >
            {design.blocks.length === 0 ? (
              <div
                className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 0)}
              >
                <FiPlus size={32} className="mb-2" />
                <p>Drag blocks here or click to add</p>
                <p className="text-sm">from the left panel</p>
              </div>
            ) : (
              <div>
                {design.blocks.map((block, index) => (
                  <div key={block.id} className="relative group">
                    {/* Drop zone before block */}
                    <div
                      className="h-1 bg-transparent hover:bg-indigo-300 transition-colors"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, index)}
                    />

                    {/* Block */}
                    <div
                      className="relative"
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      {selectedBlockId === block.id && <BlockToolbar block={block} />}
                      {renderBlockPreview(block)}
                    </div>

                    {/* Drop zone after last block */}
                    {index === design.blocks.length - 1 && (
                      <div
                        className="h-4 bg-transparent hover:bg-indigo-300 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, index + 1)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Style Editor */}
        <div className={`bg-white border-l transition-all ${showStylePanel ? 'w-72' : 'w-12'}`}>
          <div className="p-3 border-b flex items-center justify-between">
            {showStylePanel && <span className="font-semibold text-sm">Settings</span>}
            <button
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {showStylePanel ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            </button>
          </div>

          {showStylePanel && (
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {selectedBlock ? (
                <BlockStyleEditor block={selectedBlock} />
              ) : (
                <GlobalStylesEditor />
              )}

              {selectedBlock && (
                <button
                  onClick={() => setSelectedBlockId(null)}
                  className="mt-4 w-full p-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
                >
                  ← Back to Global Styles
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">HTML Preview</h2>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                {generateHtml()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Save Template</h2>
              <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Welcome Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={templateSlug}
                  onChange={(e) => setTemplateSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., welcome-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Welcome to {{site.name}}!"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

