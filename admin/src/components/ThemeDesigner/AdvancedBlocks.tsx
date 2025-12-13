/**
 * Advanced Page Builder Blocks
 * Includes: Link System, Grid/Columns, Header Builder, E-commerce Blocks
 */
import React, { useState } from 'react';
import {
  FiMail, FiPhone, FiChevronDown,
  FiShoppingCart, FiStar, FiMenu, FiX,
  FiHeart, FiEye,
  FiSmartphone, FiTablet, FiMonitor, FiChevronRight, FiPlus, FiTrash2
} from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';

// ============ Link/Action System Types ============
export type LinkType = 'none' | 'internal' | 'external' | 'anchor' | 'email' | 'phone' | 'modal' | 'scroll';
export type ButtonAction = 'link' | 'scroll' | 'modal' | 'submit';

export interface LinkSettings {
  type: LinkType;
  url: string;
  anchor?: string;
  email?: string;
  phone?: string;
  newTab?: boolean;
  modalId?: string;
  scrollTarget?: string;
}

export interface BlockVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface AnimationSettings {
  type: 'none' | 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'bounce';
  duration: number;
  delay: number;
}

// ============ Grid System Types ============
export type ColumnWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type BreakpointSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ColumnSettings {
  id: string;
  width: { desktop: ColumnWidth; tablet: ColumnWidth; mobile: ColumnWidth };
  blocks: ContentBlock[];
}

export interface RowSettings {
  columns: ColumnSettings[];
  gap: number;
  verticalAlign: 'top' | 'center' | 'bottom' | 'stretch';
  horizontalAlign: 'left' | 'center' | 'right' | 'between' | 'around';
}

// ============ Header Builder Types ============
export interface NavItem {
  id: string;
  label: string;
  link: LinkSettings;
  children?: NavItem[];
}

export interface HeaderSettings {
  logo: { url: string; width: number; position: 'left' | 'center' | 'right' };
  style: 'default' | 'transparent' | 'solid' | 'sticky' | 'hamburger';
  backgroundColor: string;
  navItems: NavItem[];
  showTopBar: boolean;
  topBar: { phone: string; email: string; socialLinks: { platform: string; url: string }[] };
  ctaButton: { show: boolean; text: string; link: LinkSettings; style: 'solid' | 'outline' | 'ghost' };
  mobileBreakpoint: 'md' | 'lg';
}

// ============ E-commerce Types ============
export interface ProductData {
  id: string;
  image: string;
  title: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  inStock: boolean;
  description?: string;
  // Individual product links
  productUrl?: string;        // URL to product detail page
  addToCartAction?: 'link' | 'button' | 'modal';  // What happens on add to cart
  addToCartUrl?: string;      // URL if addToCartAction is 'link'
  quickViewEnabled?: boolean; // Enable quick view modal
}

// Re-export ContentBlock for this file
export interface ContentBlock {
  id: string;
  type: string;
  props: Record<string, any>;
  visibility?: BlockVisibility;
  animation?: AnimationSettings;
  link?: LinkSettings;
}

// ============ Preset Layouts ============
export const PRESET_LAYOUTS = [
  { id: '2-equal', name: '2 Equal', columns: [6, 6] },
  { id: '3-equal', name: '3 Equal', columns: [4, 4, 4] },
  { id: '4-equal', name: '4 Equal', columns: [3, 3, 3, 3] },
  { id: '1-3-2-3', name: '1/3 + 2/3', columns: [4, 8] },
  { id: '2-3-1-3', name: '2/3 + 1/3', columns: [8, 4] },
  { id: '1-4-3-4', name: '1/4 + 3/4', columns: [3, 9] },
  { id: '3-4-1-4', name: '3/4 + 1/4', columns: [9, 3] },
  { id: 'sidebar-left', name: 'Sidebar Left', columns: [3, 9] },
  { id: 'sidebar-right', name: 'Sidebar Right', columns: [9, 3] },
];

// ============ Animation Presets ============
export const ANIMATION_PRESETS = [
  { id: 'none', name: 'None', css: '' },
  { id: 'fadeIn', name: 'Fade In', css: 'animate-fadeIn' },
  { id: 'slideUp', name: 'Slide Up', css: 'animate-slideUp' },
  { id: 'slideDown', name: 'Slide Down', css: 'animate-slideDown' },
  { id: 'slideLeft', name: 'Slide Left', css: 'animate-slideLeft' },
  { id: 'slideRight', name: 'Slide Right', css: 'animate-slideRight' },
  { id: 'zoomIn', name: 'Zoom In', css: 'animate-zoomIn' },
  { id: 'bounce', name: 'Bounce', css: 'animate-bounce' },
];

// ============ Link Settings Form Component ============
export function LinkSettingsForm({
  link,
  onChange,
}: {
  link: LinkSettings;
  onChange: (link: LinkSettings) => void;
  settings?: CustomThemeSettings;
}) {
  return (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Link Type</label>
        <select
          value={link.type}
          onChange={e => onChange({ ...link, type: e.target.value as LinkType })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
        >
          <option value="none">None</option>
          <option value="internal">Internal Page</option>
          <option value="external">External URL</option>
          <option value="anchor">Anchor Link</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="modal">Open Modal</option>
          <option value="scroll">Scroll to Section</option>
        </select>
      </div>
      {(link.type === 'internal' || link.type === 'external') && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">URL</label>
          <input
            type="text"
            value={link.url || ''}
            onChange={e => onChange({ ...link, url: e.target.value })}
            placeholder={link.type === 'internal' ? '/page-slug' : 'https://example.com'}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          />
        </div>
      )}
      {link.type === 'anchor' && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Anchor ID</label>
          <input
            type="text"
            value={link.anchor || ''}
            onChange={e => onChange({ ...link, anchor: e.target.value })}
            placeholder="#section-id"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          />
        </div>
      )}
      {link.type === 'email' && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
          <input
            type="email"
            value={link.email || ''}
            onChange={e => onChange({ ...link, email: e.target.value })}
            placeholder="hello@example.com"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          />
        </div>
      )}
      {link.type === 'phone' && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Phone Number</label>
          <input
            type="tel"
            value={link.phone || ''}
            onChange={e => onChange({ ...link, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          />
        </div>
      )}
      {link.type === 'scroll' && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Scroll Target</label>
          <input
            type="text"
            value={link.scrollTarget || ''}
            onChange={e => onChange({ ...link, scrollTarget: e.target.value })}
            placeholder="#target-section"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          />
        </div>
      )}
      {link.type === 'external' && (
        <label className="flex items-center gap-2 text-sm text-gray-300 mt-2">
          <input
            type="checkbox"
            checked={link.newTab || false}
            onChange={e => onChange({ ...link, newTab: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          Open in new tab
        </label>
      )}
    </div>
  );
}

// ============ Visibility Settings Component ============
export function VisibilitySettings({
  visibility,
  onChange,
}: {
  visibility: BlockVisibility;
  onChange: (visibility: BlockVisibility) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
      <span className="text-xs text-gray-400">Show on:</span>
      <button
        onClick={() => onChange({ ...visibility, desktop: !visibility.desktop })}
        className={`p-1.5 rounded ${visibility.desktop ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        title="Desktop"
      >
        <FiMonitor size={14} />
      </button>
      <button
        onClick={() => onChange({ ...visibility, tablet: !visibility.tablet })}
        className={`p-1.5 rounded ${visibility.tablet ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        title="Tablet"
      >
        <FiTablet size={14} />
      </button>
      <button
        onClick={() => onChange({ ...visibility, mobile: !visibility.mobile })}
        className={`p-1.5 rounded ${visibility.mobile ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        title="Mobile"
      >
        <FiSmartphone size={14} />
      </button>
    </div>
  );
}

// ============ Animation Settings Component ============
export function AnimationSettingsForm({
  animation,
  onChange,
}: {
  animation: AnimationSettings;
  onChange: (animation: AnimationSettings) => void;
}) {
  return (
    <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Animation</label>
        <select
          value={animation.type}
          onChange={e => onChange({ ...animation, type: e.target.value as AnimationSettings['type'] })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
        >
          {ANIMATION_PRESETS.map(preset => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
      </div>
      {animation.type !== 'none' && (
        <>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Duration (ms)</label>
            <input
              type="number"
              value={animation.duration}
              onChange={e => onChange({ ...animation, duration: parseInt(e.target.value) || 300 })}
              min={100}
              max={3000}
              step={100}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Delay (ms)</label>
            <input
              type="number"
              value={animation.delay}
              onChange={e => onChange({ ...animation, delay: parseInt(e.target.value) || 0 })}
              min={0}
              max={2000}
              step={100}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            />
          </div>
        </>
      )}
    </div>
  );
}


// ============ Row/Column Grid Block ============
export function RowBlock({
  props,
  settings,
  renderBlock,
}: {
  props: RowSettings;
  settings: CustomThemeSettings;
  onUpdateColumn?: (colIndex: number, blocks: ContentBlock[]) => void;
  renderBlock?: (block: ContentBlock, colIndex: number, blockIndex: number) => React.ReactNode;
}) {
  const { columns, gap, verticalAlign, horizontalAlign } = props;

  const alignItems: Record<string, string> = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyContent: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div
      className={`grid grid-cols-12 ${alignItems[verticalAlign]} ${justifyContent[horizontalAlign]}`}
      style={{ gap: `${gap}px` }}
    >
      {columns.map((col, colIndex) => (
        <div
          key={col.id}
          className="min-h-[60px] rounded-lg border-2 border-dashed border-gray-600 p-2 transition-all hover:border-blue-500"
          style={{
            gridColumn: `span ${col.width.desktop}`,
            background: settings.colors.surface,
          }}
        >
          {col.blocks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              <FiPlus className="mr-1" /> Drop blocks here
            </div>
          ) : (
            <div className="space-y-2">
              {col.blocks.map((block, blockIndex) => (
                renderBlock ? renderBlock(block, colIndex, blockIndex) : (
                  <div key={block.id} className="p-2 bg-gray-700/50 rounded text-xs text-gray-300">
                    {block.type}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============ Column Width Selector ============
export function ColumnWidthSelector({
  width,
  onChange,
}: {
  width: ColumnWidth;
  onChange: (width: ColumnWidth) => void;
  breakpoint?: 'desktop' | 'tablet' | 'mobile';
}) {
  const widths: ColumnWidth[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="flex flex-wrap gap-1">
      {widths.map(w => (
        <button
          key={w}
          onClick={() => onChange(w)}
          className={`w-6 h-6 text-xs rounded ${width === w ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
          {w}
        </button>
      ))}
    </div>
  );
}

// ============ E-commerce Product Card Block ============
export function ProductCardBlock({
  props,
  settings,
}: {
  props: {
    product: ProductData;
    showRating?: boolean;
    showBadge?: boolean;
    buttonStyle?: 'solid' | 'outline' | 'icon';
  };
  settings: CustomThemeSettings;
}) {
  const { product, showRating = true, showBadge = true, buttonStyle = 'solid' } = props;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.salePrice! / product.price) * 100) : 0;

  // Product link wrapper component
  const ProductLink = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    if (product.productUrl) {
      return (
        <a
          href={product.productUrl}
          className={`block ${className}`}
          onClick={(e) => e.preventDefault()} // Prevent navigation in preview
        >
          {children}
        </a>
      );
    }
    return <div className={className}>{children}</div>;
  };

  // Handle add to cart action
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In preview mode, just show a console log
    console.log('Add to cart:', product.id, product.title);
  };

  return (
    <div
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{
        background: settings.colors.surface,
        borderRadius: settings.borders.radius,
        border: `${settings.borders.width}px solid ${settings.colors.border}`,
      }}
    >
      {/* Product Image - Clickable */}
      <ProductLink className="relative aspect-square overflow-hidden block cursor-pointer">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {showBadge && product.badge && (
          <span
            className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-full"
            style={{ background: settings.colors.primary, color: 'white' }}
          >
            {product.badge}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
            -{discountPercent}%
          </span>
        )}
        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {product.quickViewEnabled !== false && (
            <button
              className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('Quick view:', product.id); }}
              title="Quick View"
            >
              <FiEye className="text-gray-800" />
            </button>
          )}
          <button
            className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            title="Add to Wishlist"
          >
            <FiHeart className="text-gray-800" />
          </button>
        </div>
      </ProductLink>

      {/* Product Info */}
      <div className="p-4">
        {/* Title - Clickable */}
        <ProductLink>
          <h3
            className="font-semibold mb-2 line-clamp-2 hover:underline cursor-pointer"
            style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }}
          >
            {product.title}
          </h3>
        </ProductLink>

        {showRating && (
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <FiStar
                key={star}
                size={14}
                className={star <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold" style={{ color: settings.colors.primary }}>
                ${product.salePrice?.toFixed(2)}
              </span>
              <span className="text-sm line-through" style={{ color: settings.colors.textMuted }}>
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold" style={{ color: settings.colors.heading }}>
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {buttonStyle === 'icon' ? (
          <button
            onClick={handleAddToCart}
            className="w-full py-2 flex items-center justify-center gap-2 font-medium transition-all hover:opacity-90"
            style={{
              background: settings.colors.primary,
              color: 'white',
              borderRadius: settings.borders.radius,
            }}
          >
            <FiShoppingCart size={18} />
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full py-2 flex items-center justify-center gap-2 font-medium transition-all hover:opacity-90"
            style={{
              background: buttonStyle === 'solid' ? settings.colors.primary : 'transparent',
              color: buttonStyle === 'solid' ? 'white' : settings.colors.primary,
              border: buttonStyle === 'outline' ? `2px solid ${settings.colors.primary}` : 'none',
              borderRadius: settings.borders.radius,
            }}
          >
            <FiShoppingCart size={16} /> Add to Cart
          </button>
        )}

        {/* Product URL indicator (shown in designer) */}
        {product.productUrl && (
          <div className="mt-2 text-xs text-gray-500 truncate" title={product.productUrl}>
            🔗 {product.productUrl}
          </div>
        )}
      </div>
    </div>
  );
}


// ============ Product Grid Block ============
export function ProductGridBlock({
  props,
  settings,
}: {
  props: {
    products: ProductData[];
    columns: 2 | 3 | 4;
    showRating?: boolean;
    buttonStyle?: 'solid' | 'outline' | 'icon';
  };
  settings: CustomThemeSettings;
}) {
  const { products, columns, showRating = true, buttonStyle = 'solid' } = props;
  const gridCols: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  return (
    <div className={`grid grid-cols-1 md:${gridCols[columns]} gap-6`}>
      {products.map(product => (
        <ProductCardBlock
          key={product.id}
          props={{ product, showRating, buttonStyle }}
          settings={settings}
        />
      ))}
    </div>
  );
}

// ============ Featured Product Block ============
export function FeaturedProductBlock({
  props,
  settings,
}: {
  props: {
    product: ProductData;
    layout: 'left' | 'right';
  };
  settings: CustomThemeSettings;
}) {
  const { product, layout } = props;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Add to cart:', product.id, product.title);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.productUrl) {
      console.log('Navigate to:', product.productUrl);
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row gap-8 p-8 ${layout === 'right' ? 'md:flex-row-reverse' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${settings.colors.surface}, ${settings.colors.background})`,
        borderRadius: settings.borders.radius * 2,
      }}
    >
      <div className="flex-1">
        {product.productUrl ? (
          <a href={product.productUrl} onClick={(e) => e.preventDefault()} className="block">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-80 object-cover rounded-xl shadow-2xl cursor-pointer hover:opacity-90 transition-opacity"
            />
          </a>
        ) : (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-80 object-cover rounded-xl shadow-2xl"
          />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {product.badge && (
          <span
            className="inline-block px-3 py-1 text-sm font-bold rounded-full mb-4 w-fit"
            style={{ background: settings.colors.primary, color: 'white' }}
          >
            {product.badge}
          </span>
        )}
        {product.productUrl ? (
          <a href={product.productUrl} onClick={(e) => e.preventDefault()} className="block">
            <h2
              className="text-3xl font-bold mb-4 hover:underline cursor-pointer"
              style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }}
            >
              {product.title}
            </h2>
          </a>
        ) : (
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }}
          >
            {product.title}
          </h2>
        )}

        {product.description && (
          <p className="mb-4" style={{ color: settings.colors.textMuted }}>
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <FiStar key={star} size={20} className={star <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          ))}
          <span className="ml-2" style={{ color: settings.colors.textMuted }}>({product.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          {hasDiscount ? (
            <>
              <span className="text-4xl font-bold" style={{ color: settings.colors.primary }}>${product.salePrice?.toFixed(2)}</span>
              <span className="text-xl line-through" style={{ color: settings.colors.textMuted }}>${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-4xl font-bold" style={{ color: settings.colors.heading }}>${product.price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 flex items-center justify-center gap-2 font-semibold transition-all hover:opacity-90"
            style={{ background: settings.colors.primary, color: 'white', borderRadius: settings.borders.radius }}
          >
            <FiShoppingCart /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="px-6 py-3 font-semibold transition-all hover:opacity-90"
            style={{ background: settings.colors.surface, color: settings.colors.primary, border: `2px solid ${settings.colors.primary}`, borderRadius: settings.borders.radius }}
          >
            Buy Now
          </button>
        </div>

        {/* Product URL indicator (shown in designer) */}
        {product.productUrl && (
          <div className="mt-4 text-xs text-gray-500 truncate" title={product.productUrl}>
            🔗 {product.productUrl}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Product Carousel Block ============
export function ProductCarouselBlock({
  props,
  settings,
}: {
  props: {
    products: ProductData[];
    autoPlay?: boolean;
    showArrows?: boolean;
  };
  settings: CustomThemeSettings;
}) {
  const { products, showArrows = true } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex(i => (i + 1) % products.length);
  const prev = () => setCurrentIndex(i => (i - 1 + products.length) % products.length);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {products.map(product => (
            <div key={product.id} className="flex-shrink-0 w-full px-2">
              <ProductCardBlock props={{ product }} settings={settings} />
            </div>
          ))}
        </div>
      </div>
      {showArrows && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg"
            style={{ background: settings.colors.surface, color: settings.colors.heading }}
          >
            <FiChevronRight className="rotate-180" size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg"
            style={{ background: settings.colors.surface, color: settings.colors.heading }}
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-6' : ''}`}
            style={{ background: i === currentIndex ? settings.colors.primary : settings.colors.border }}
          />
        ))}
      </div>
    </div>
  );
}

// ============ Header Builder Block ============
export function HeaderBuilderBlock({
  props,
  settings,
}: {
  props: HeaderSettings;
  settings: CustomThemeSettings;
}) {
  const { logo, style, backgroundColor, navItems, showTopBar, topBar, ctaButton } = props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerBg = style === 'transparent' ? 'transparent' : (backgroundColor || settings.colors.surface);

  return (
    <div>
      {/* Top Bar */}
      {showTopBar && (
        <div className="py-2 px-4 text-sm flex items-center justify-between" style={{ background: settings.colors.primary, color: 'white' }}>
          <div className="flex items-center gap-4">
            {topBar.phone && (
              <a href={`tel:${topBar.phone}`} className="flex items-center gap-1 hover:opacity-80">
                <FiPhone size={14} /> {topBar.phone}
              </a>
            )}
            {topBar.email && (
              <a href={`mailto:${topBar.email}`} className="flex items-center gap-1 hover:opacity-80">
                <FiMail size={14} /> {topBar.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {topBar.socialLinks?.map((social, i) => (
              <a key={i} href={social.url} className="hover:opacity-80">{social.platform}</a>
            ))}
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`flex items-center justify-between px-6 py-4 ${style === 'sticky' ? 'sticky top-0 z-50' : ''}`}
        style={{ background: headerBg, borderBottom: `1px solid ${settings.colors.border}` }}
      >
        {/* Logo */}
        <div className={`flex items-center ${logo.position === 'center' ? 'absolute left-1/2 -translate-x-1/2' : ''}`}>
          {logo.url ? (
            <img src={logo.url} alt="Logo" style={{ width: logo.width }} className="h-auto" />
          ) : (
            <span className="text-xl font-bold" style={{ color: settings.colors.heading }}>Logo</span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <div key={item.id} className="relative group">
              <a
                href={item.link.url || '#'}
                className="flex items-center gap-1 font-medium transition-colors hover:opacity-80"
                style={{ color: settings.colors.text }}
              >
                {item.label}
                {item.children && item.children.length > 0 && <FiChevronDown size={14} />}
              </a>
              {/* Dropdown */}
              {item.children && item.children.length > 0 && (
                <div
                  className="absolute top-full left-0 mt-2 py-2 min-w-[200px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                  style={{ background: settings.colors.surface, border: `1px solid ${settings.colors.border}` }}
                >
                  {item.children.map(child => (
                    <a
                      key={child.id}
                      href={child.link.url || '#'}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      style={{ color: settings.colors.text }}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {ctaButton.show && (
            <button
              className="hidden md:flex px-4 py-2 font-medium transition-all"
              style={{
                background: ctaButton.style === 'solid' ? settings.colors.primary : 'transparent',
                color: ctaButton.style === 'solid' ? 'white' : settings.colors.primary,
                border: ctaButton.style !== 'solid' ? `2px solid ${settings.colors.primary}` : 'none',
                borderRadius: settings.borders.radius,
              }}
            >
              {ctaButton.text}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: settings.colors.heading }}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-6 space-y-3" style={{ background: settings.colors.surface }}>
          {navItems.map(item => (
            <a key={item.id} href={item.link.url || '#'} className="block py-2 font-medium" style={{ color: settings.colors.text }}>
              {item.label}
            </a>
          ))}
          {ctaButton.show && (
            <button
              className="w-full py-2 font-medium mt-4"
              style={{ background: settings.colors.primary, color: 'white', borderRadius: settings.borders.radius }}
            >
              {ctaButton.text}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Header Settings Form ============
export function HeaderSettingsPanel({
  headerSettings,
  onChange,
}: {
  headerSettings: HeaderSettings;
  onChange: (settings: HeaderSettings) => void;
  settings?: CustomThemeSettings;
}) {
  const addNavItem = () => {
    onChange({
      ...headerSettings,
      navItems: [
        ...headerSettings.navItems,
        { id: Date.now().toString(), label: 'New Item', link: { type: 'internal', url: '/' }, children: [] },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {/* Logo Settings */}
      <div className="p-3 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-3">Logo</h4>
        <div className="space-y-2">
          <input
            type="text"
            value={headerSettings.logo.url}
            onChange={e => onChange({ ...headerSettings, logo: { ...headerSettings.logo, url: e.target.value } })}
            placeholder="Logo URL"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Width:</label>
            <input
              type="number"
              value={headerSettings.logo.width}
              onChange={e => onChange({ ...headerSettings, logo: { ...headerSettings.logo, width: parseInt(e.target.value) || 120 } })}
              className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Position:</label>
            <select
              value={headerSettings.logo.position}
              onChange={e => onChange({ ...headerSettings, logo: { ...headerSettings.logo, position: e.target.value as 'left' | 'center' | 'right' } })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header Style */}
      <div className="p-3 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-3">Style</h4>
        <select
          value={headerSettings.style}
          onChange={e => onChange({ ...headerSettings, style: e.target.value as HeaderSettings['style'] })}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
        >
          <option value="default">Default</option>
          <option value="transparent">Transparent</option>
          <option value="solid">Solid</option>
          <option value="sticky">Sticky</option>
          <option value="hamburger">Hamburger Only</option>
        </select>
      </div>

      {/* Navigation Items */}
      <div className="p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Navigation</h4>
          <button onClick={addNavItem} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <FiPlus size={12} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {headerSettings.navItems.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                value={item.label}
                onChange={e => {
                  const newItems = [...headerSettings.navItems];
                  newItems[i] = { ...item, label: e.target.value };
                  onChange({ ...headerSettings, navItems: newItems });
                }}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
              />
              <button
                onClick={() => onChange({ ...headerSettings, navItems: headerSettings.navItems.filter((_, idx) => idx !== i) })}
                className="p-1 text-red-400 hover:text-red-300"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Bar Toggle */}
      <label className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg cursor-pointer">
        <input
          type="checkbox"
          checked={headerSettings.showTopBar}
          onChange={e => onChange({ ...headerSettings, showTopBar: e.target.checked })}
          className="rounded bg-gray-700 border-gray-600"
        />
        <span className="text-sm text-white">Show Top Bar</span>
      </label>

      {/* CTA Button */}
      <div className="p-3 bg-gray-800/50 rounded-lg">
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={headerSettings.ctaButton.show}
            onChange={e => onChange({ ...headerSettings, ctaButton: { ...headerSettings.ctaButton, show: e.target.checked } })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-sm font-semibold text-white">CTA Button</span>
        </label>
        {headerSettings.ctaButton.show && (
          <div className="space-y-2">
            <input
              type="text"
              value={headerSettings.ctaButton.text}
              onChange={e => onChange({ ...headerSettings, ctaButton: { ...headerSettings.ctaButton, text: e.target.value } })}
              placeholder="Button Text"
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            />
            <select
              value={headerSettings.ctaButton.style}
              onChange={e => onChange({ ...headerSettings, ctaButton: { ...headerSettings.ctaButton, style: e.target.value as 'solid' | 'outline' | 'ghost' } })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="solid">Solid</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
