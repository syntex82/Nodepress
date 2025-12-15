/**
 * Navigation Block Components for Theme Designer
 *
 * This file contains all navigation-related content blocks:
 * - NavGlassBlock: Glassmorphism-style sticky navigation
 * - NavMinimalBlock: Clean, minimalist navigation
 * - NavMegaBlock: Enterprise-style with mega menu dropdowns
 * - NavCenteredBlock: Logo centered with split navigation
 * - NavSidebarBlock: Vertical sidebar navigation
 */

import React, { useState } from 'react';
import {
  FiMenu, FiX, FiSearch, FiUser, FiChevronDown, FiHome, FiTrendingUp,
  FiFolder, FiSettings, FiHelpCircle, FiExternalLink, FiBell, FiUpload,
  FiTrash2, FiBook, FiMail
} from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';
import MediaPickerModal from '../MediaPickerModal';

// ============ Navigation Item Types ============
export interface NavItem {
  id: string;
  label: string;
  url: string;
  active?: boolean;
  icon?: string;
  badge?: string;
  hasMegaMenu?: boolean;
  megaMenuColumns?: MegaMenuColumn[];
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuItem {
  label: string;
  url: string;
  icon?: string;
  description?: string;
}

// ============ Block Config Types ============
export interface NavBlockConfig {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  defaultProps: Record<string, unknown>;
}

// ============ Glass Navigation Block ============
export function NavGlassBlock({ props }: { props: Record<string, unknown>; settings: CustomThemeSettings }) {
  const logoUrl = (props.logoUrl as string) || '';
  const logoText = (props.logoText as string) || 'Brand';
  const navItems = (props.navItems as NavItem[]) || [];
  const showCta = props.showCta !== false;
  const ctaText = (props.ctaText as string) || 'Get Started';
  const ctaUrl = (props.ctaUrl as string) || '#';
  const ctaStyle = (props.ctaStyle as string) || 'gradient';
  const showSearch = Boolean(props.showSearch);
  const showUserMenu = Boolean(props.showUserMenu);
  const position = (props.position as string) || 'sticky';
  const blur = (props.blur as number) || 16;
  const opacity = (props.opacity as number) || 0.8;
  const borderBottom = props.borderBottom !== false;
  const backgroundColor = (props.backgroundColor as string) || '#0F172A';
  const textColor = (props.textColor as string) || '#F8FAFC';
  const accentColor = (props.accentColor as string) || '#6366F1';
  const height = (props.height as number) || 72;
  const maxWidth = (props.maxWidth as number) || 1280;
  const paddingX = (props.paddingX as number) || 24;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const bgWithOpacity = backgroundColor + Math.round(opacity * 255).toString(16).padStart(2, '0');

  const getCtaStyles = (): React.CSSProperties => {
    switch (ctaStyle) {
      case 'gradient':
        return { background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, color: '#fff', border: 'none' };
      case 'outline':
        return { background: 'transparent', color: accentColor, border: `2px solid ${accentColor}` };
      default:
        return { background: accentColor, color: '#fff', border: 'none' };
    }
  };

  const items = navItems;

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ${position === 'sticky' ? 'sticky top-0' : position === 'fixed' ? 'fixed top-0 left-0 right-0' : ''}`}
      style={{
        background: bgWithOpacity,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        borderBottom: borderBottom ? `1px solid rgba(255,255,255,0.1)` : 'none',
        height: height,
      }}
    >
      <div className="flex items-center justify-between h-full mx-auto" style={{ maxWidth: maxWidth, paddingLeft: paddingX, paddingRight: paddingX }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={logoText} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold" style={{ color: textColor }}>{logoText}</span>
          )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.url || '#'}
              className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group"
              style={{ color: item.active ? accentColor : textColor }}
            >
              {item.label}
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-3/4"
                style={{ background: accentColor }}
              />
              {item.active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: accentColor }} />
              )}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {showSearch && (
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg transition-all hover:bg-white/10"
              style={{ color: textColor }}
            >
              <FiSearch size={20} />
            </button>
          )}

          {showUserMenu && (
            <button className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: textColor }}>
              <FiUser size={20} />
            </button>
          )}

          {showCta && (
            <a
              href={ctaUrl}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ ...getCtaStyles(), boxShadow: `0 4px 14px ${accentColor}40` }}
            >
              {ctaText}
            </a>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg transition-all hover:bg-white/10"
            style={{ color: textColor }}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 p-4" style={{ background: bgWithOpacity, backdropFilter: `blur(${blur}px)` }}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <FiSearch size={20} style={{ color: textColor }} />
              <input type="text" placeholder="Search..." className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: textColor }} autoFocus />
              <button onClick={() => setSearchOpen(false)} style={{ color: textColor }}><FiX size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 py-4 px-6 space-y-2" style={{ background: bgWithOpacity, backdropFilter: `blur(${blur}px)`, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {items.map((item) => (
            <a key={item.id} href={item.url || '#'} className="block py-3 px-4 rounded-lg text-sm font-medium transition-all" style={{ color: item.active ? accentColor : textColor, background: item.active ? `${accentColor}15` : 'transparent' }}>
              {item.label}
            </a>
          ))}
          {showCta && (
            <a href={ctaUrl} className="block text-center py-3 px-4 rounded-xl text-sm font-semibold mt-4" style={getCtaStyles()}>
              {ctaText}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}

// ============ Minimal Navigation Block ============
export function NavMinimalBlock({ props }: { props: Record<string, unknown>; settings: CustomThemeSettings }) {
  const logoUrl = (props.logoUrl as string) || '';
  const logoText = (props.logoText as string) || 'Brand';
  const navItems = (props.navItems as NavItem[]) || [];
  const showCta = Boolean(props.showCta);
  const ctaText = (props.ctaText as string) || '';
  const ctaUrl = (props.ctaUrl as string) || '#';
  const alignment = (props.alignment as string) || 'spread';
  const backgroundColor = (props.backgroundColor as string) || 'transparent';
  const textColor = (props.textColor as string) || '#111827';
  const accentColor = (props.accentColor as string) || '#000000';
  const height = (props.height as number) || 80;
  const borderBottom = Boolean(props.borderBottom);
  const uppercase = props.uppercase !== false;
  const letterSpacing = (props.letterSpacing as number) || 2;
  const fontSize = (props.fontSize as number) || 12;

  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navItems;

  const navStyle: React.CSSProperties = {
    textTransform: uppercase ? 'uppercase' : 'none',
    letterSpacing: `${letterSpacing}px`,
    fontSize: `${fontSize}px`,
  };

  return (
    <nav className="w-full" style={{ background: backgroundColor, height: height, borderBottom: borderBottom ? `1px solid ${textColor}20` : 'none' }}>
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-6">
        {alignment === 'center' ? (
          <>
            <div className="hidden md:flex items-center gap-8">
              {items.slice(0, Math.ceil(items.length / 2)).map((item) => (
                <a key={item.id} href={item.url || '#'} className="font-medium tracking-wide transition-all hover:opacity-60" style={{ ...navStyle, color: textColor }}>{item.label}</a>
              ))}
            </div>
            <div className="flex items-center">
              {logoUrl ? <img src={logoUrl} alt={logoText} className="h-10 w-auto" /> : <span className="text-2xl font-light tracking-widest" style={{ color: textColor }}>{logoText}</span>}
            </div>
            <div className="hidden md:flex items-center gap-8">
              {items.slice(Math.ceil(items.length / 2)).map((item) => (
                <a key={item.id} href={item.url || '#'} className="font-medium tracking-wide transition-all hover:opacity-60" style={{ ...navStyle, color: textColor }}>{item.label}</a>
              ))}
              {showCta && <a href={ctaUrl} className="font-medium px-5 py-2 border-2 transition-all hover:bg-black hover:text-white" style={{ ...navStyle, color: accentColor, borderColor: accentColor }}>{ctaText}</a>}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              {logoUrl ? <img src={logoUrl} alt={logoText} className="h-10 w-auto" /> : <span className="text-2xl font-light tracking-widest" style={{ color: textColor }}>{logoText}</span>}
            </div>
            <div className="hidden md:flex items-center gap-8">
              {items.map((item) => (
                <a key={item.id} href={item.url || '#'} className="relative font-medium tracking-wide transition-all group" style={{ ...navStyle, color: textColor }}>
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
              {showCta && <a href={ctaUrl} className="font-medium px-5 py-2 border-2 transition-all hover:bg-black hover:text-white" style={{ ...navStyle, color: accentColor, borderColor: accentColor }}>{ctaText}</a>}
            </div>
          </>
        )}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" style={{ color: textColor }}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden py-8 px-6 space-y-4" style={{ background: backgroundColor || '#fff' }}>
          {items.map((item) => (
            <a key={item.id} href={item.url || '#'} className="block py-2 font-medium transition-all" style={{ ...navStyle, color: textColor }}>{item.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}



// ============ Mega Menu Navigation Block ============
export function NavMegaBlock({ props }: { props: Record<string, unknown>; settings: CustomThemeSettings }) {
  const logoUrl = (props.logoUrl as string) || '';
  const logoText = (props.logoText as string) || 'Enterprise';
  const topBarEnabled = Boolean(props.topBarEnabled);
  const topBarItems = (props.topBarItems as Array<{ label: string; url: string; icon?: string }>) || [];
  const navItems = (props.navItems as NavItem[]) || [];
  const showCta = props.showCta !== false;
  const ctaText = (props.ctaText as string) || 'Get Started';
  const ctaUrl = (props.ctaUrl as string) || '#';
  const ctaStyle = (props.ctaStyle as string) || 'solid';
  const showSearch = Boolean(props.showSearch);
  const backgroundColor = (props.backgroundColor as string) || '#FFFFFF';
  const textColor = (props.textColor as string) || '#374151';
  const accentColor = (props.accentColor as string) || '#4F46E5';
  const megaMenuBg = (props.megaMenuBg as string) || '#F9FAFB';
  const height = (props.height as number) || 64;
  const topBarBg = (props.topBarBg as string) || '#1F2937';
  const topBarTextColor = (props.topBarTextColor as string) || '#D1D5DB';

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navItems;
  const topItems = topBarItems;

  const getIcon = (iconName: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      help: <FiHelpCircle size={14} />, book: <FiBook size={14} />, phone: <FiMail size={14} />,
    };
    return icons[iconName] || null;
  };

  return (
    <div className="w-full">
      {topBarEnabled && (
        <div className="py-2 px-4" style={{ background: topBarBg }}>
          <div className="max-w-7xl mx-auto flex items-center justify-end gap-6">
            {topItems.map((item, i) => (
              <a key={i} href={item.url || '#'} className="flex items-center gap-1.5 text-xs font-medium transition-all hover:opacity-80" style={{ color: topBarTextColor }}>
                {getIcon(item.icon || '')} {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
      <nav className="border-b" style={{ background: backgroundColor, borderColor: `${textColor}15`, height: height }}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center">
            {logoUrl ? <img src={logoUrl} alt={logoText} className="h-8 w-auto" /> : <span className="text-xl font-bold" style={{ color: textColor }}>{logoText}</span>}
          </div>
          <div className="hidden lg:flex items-center h-full">
            {items.map((item) => (
              <div key={item.id} className="relative h-full" onMouseEnter={() => item.hasMegaMenu && setActiveMenu(item.id)} onMouseLeave={() => setActiveMenu(null)}>
                <a href={item.url || '#'} className="h-full flex items-center gap-1 px-4 text-sm font-medium transition-all hover:text-opacity-70" style={{ color: activeMenu === item.id ? accentColor : textColor }}>
                  {item.label}
                  {item.hasMegaMenu && <FiChevronDown size={14} className={`transition-transform ${activeMenu === item.id ? 'rotate-180' : ''}`} />}
                </a>
                {item.hasMegaMenu && activeMenu === item.id && (
                  <div className="absolute top-full left-0 w-[600px] p-6 rounded-b-xl shadow-2xl grid grid-cols-2 gap-8 z-50" style={{ background: megaMenuBg, borderTop: `3px solid ${accentColor}` }}>
                    {item.megaMenuColumns?.map((col, ci) => (
                      <div key={ci}>
                        <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: `${textColor}80` }}>{col.title}</h4>
                        <div className="space-y-3">
                          {col.items?.map((subItem, si) => (
                            <a key={si} href={subItem.url || '#'} className="flex items-start gap-3 p-2 rounded-lg transition-all hover:bg-white group">
                              <span className="text-2xl">{subItem.icon}</span>
                              <div>
                                <div className="font-medium text-sm group-hover:text-opacity-80" style={{ color: textColor }}>{subItem.label}</div>
                                <div className="text-xs mt-0.5" style={{ color: `${textColor}70` }}>{subItem.description}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {showSearch && <button className="p-2 rounded-lg transition-all hover:bg-gray-100" style={{ color: textColor }}><FiSearch size={20} /></button>}
            {showCta && (
              <a href={ctaUrl} className="hidden md:flex px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:shadow-lg" style={{ background: ctaStyle === 'solid' ? accentColor : 'transparent', color: ctaStyle === 'solid' ? '#fff' : accentColor, border: ctaStyle === 'outline' ? `2px solid ${accentColor}` : 'none' }}>
                {ctaText}
              </a>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2" style={{ color: textColor }}>
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <div className="lg:hidden py-4 px-6 space-y-2" style={{ background: backgroundColor }}>
          {items.map((item) => (
            <a key={item.id} href={item.url || '#'} className="block py-3 px-4 rounded-lg text-sm font-medium" style={{ color: textColor }}>{item.label}</a>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Centered Navigation Block ============
export function NavCenteredBlock({ props }: { props: Record<string, unknown>; settings: CustomThemeSettings }) {
  const logoUrl = (props.logoUrl as string) || '';
  const logoText = (props.logoText as string) || 'Studio';
  const leftItems = (props.leftItems as NavItem[]) || [];
  const rightItems = (props.rightItems as NavItem[]) || [];
  const showCta = Boolean(props.showCta);
  const backgroundColor = (props.backgroundColor as string) || '#FAFAFA';
  const textColor = (props.textColor as string) || '#18181B';
  const accentColor = (props.accentColor as string) || '#A855F7';
  const height = (props.height as number) || 88;
  const borderBottom = props.borderBottom !== false;
  const borderColor = (props.borderColor as string) || '#E4E4E7';
  const logoSize = (props.logoSize as string) || 'large';
  const fontWeight = (props.fontWeight as number) || 500;
  const hoverStyle = (props.hoverStyle as string) || 'underline';

  const [mobileOpen, setMobileOpen] = useState(false);
  const left = leftItems;
  const right = rightItems;
  const logoSizes = { small: 'text-lg', medium: 'text-2xl', large: 'text-3xl' };
  const allItems = [...left, ...right];

  return (
    <nav className="w-full" style={{ background: backgroundColor, height: height, borderBottom: borderBottom ? `1px solid ${borderColor}` : 'none' }}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <div className="hidden md:flex items-center gap-8">
          {left.map((item) => (
            <a key={item.id} href={item.url || '#'} className={`relative text-sm transition-all ${hoverStyle === 'underline' ? 'hover:after:w-full' : hoverStyle === 'color' ? 'hover:opacity-60' : 'hover:bg-black/5 px-3 py-1 rounded'}`} style={{ color: textColor, fontWeight: fontWeight }}>
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center justify-center">
          {logoUrl ? <img src={logoUrl} alt={logoText} className="h-12 w-auto" /> : <span className={`font-bold tracking-tight ${logoSizes[logoSize as keyof typeof logoSizes] || logoSizes.large}`} style={{ color: textColor }}>{logoText}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {right.map((item) => (
            <a key={item.id} href={item.url || '#'} className="relative text-sm transition-all" style={{ color: textColor, fontWeight: fontWeight }}>{item.label}</a>
          ))}
          {showCta && <a href="#" className="px-4 py-2 rounded-full text-sm font-medium transition-all" style={{ background: accentColor, color: '#fff' }}>Contact</a>}
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" style={{ color: textColor }}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden py-6 px-6 space-y-4" style={{ background: backgroundColor }}>
          {allItems.map((item) => (
            <a key={item.id} href={item.url || '#'} className="block py-2 text-sm font-medium" style={{ color: textColor }}>{item.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}


// ============ Sidebar Navigation Block ============
export function NavSidebarBlock({ props }: { props: Record<string, unknown>; settings: CustomThemeSettings }) {
  const logoUrl = (props.logoUrl as string) || '';
  const logoText = (props.logoText as string) || 'Dashboard';
  const navItems = (props.navItems as NavItem[]) || [];
  const footerItemsRaw = (props.footerItems as NavItem[]) || [];
  const showUserProfile = props.showUserProfile !== false;
  const userAvatar = (props.userAvatar as string) || '';
  const userName = (props.userName as string) || 'John Doe';
  const userEmail = (props.userEmail as string) || 'john@example.com';
  const width = (props.width as number) || 260;
  const collapsed = Boolean(props.collapsed);
  const collapsedWidth = (props.collapsedWidth as number) || 72;
  const backgroundColor = (props.backgroundColor as string) || '#111827';
  const textColor = (props.textColor as string) || '#9CA3AF';
  const activeTextColor = (props.activeTextColor as string) || '#FFFFFF';
  const accentColor = (props.accentColor as string) || '#6366F1';
  const hoverBg = (props.hoverBg as string) || 'rgba(255,255,255,0.05)';
  const activeBg = (props.activeBg as string) || 'rgba(99,102,241,0.2)';
  const position = (props.position as string) || 'left';

  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const items = navItems;
  const footer = footerItemsRaw;
  const [activeItem, setActiveItem] = useState(items[0]?.id);
  const sidebarWidth = isCollapsed ? collapsedWidth : width;

  const getIcon = (iconName: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      home: <FiHome size={20} />, chart: <FiTrendingUp size={20} />, folder: <FiFolder size={20} />,
      users: <FiUser size={20} />, settings: <FiSettings size={20} />, help: <FiHelpCircle size={20} />,
      logout: <FiExternalLink size={20} />, bell: <FiBell size={20} />,
    };
    return icons[iconName] || <FiFolder size={20} />;
  };

  return (
    <aside className={`h-screen flex flex-col transition-all duration-300 ${position === 'right' ? 'order-last' : ''}`} style={{ width: sidebarWidth, background: backgroundColor, borderRight: position === 'left' ? `1px solid ${textColor}20` : 'none', borderLeft: position === 'right' ? `1px solid ${textColor}20` : 'none' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: `${textColor}20` }}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            {logoUrl ? <img src={logoUrl} alt={logoText} className="h-8 w-8 rounded" /> : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: accentColor }}>{logoText.charAt(0)}</div>}
            <span className="font-semibold" style={{ color: activeTextColor }}>{logoText}</span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg transition-all" style={{ color: textColor, background: hoverBg }}><FiMenu size={18} /></button>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <a key={item.id} href={item.url || '#'} onClick={() => setActiveItem(item.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isCollapsed ? 'justify-center' : ''}`} style={{ color: activeItem === item.id ? activeTextColor : textColor, background: activeItem === item.id ? activeBg : 'transparent' }} onMouseEnter={(e) => { if (activeItem !== item.id) e.currentTarget.style.background = hoverBg; }} onMouseLeave={(e) => { if (activeItem !== item.id) e.currentTarget.style.background = 'transparent'; }}>
            <span style={{ color: activeItem === item.id ? accentColor : textColor }}>{getIcon(item.icon || 'folder')}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.badge && <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ background: accentColor, color: '#fff' }}>{item.badge}</span>}
              </>
            )}
          </a>
        ))}
      </div>
      <div className="border-t py-4 px-3 space-y-1" style={{ borderColor: `${textColor}20` }}>
        {footer.map((item) => (
          <a key={item.id} href={item.url || '#'} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5 ${isCollapsed ? 'justify-center' : ''}`} style={{ color: textColor }}>
            {getIcon(item.icon || 'settings')}
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </a>
        ))}
      </div>
      {showUserProfile && !isCollapsed && (
        <div className="p-4 border-t" style={{ borderColor: `${textColor}20` }}>
          <div className="flex items-center gap-3">
            <img src={userAvatar || 'https://i.pravatar.cc/40'} alt={userName} className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: activeTextColor }}>{userName}</div>
              <div className="text-xs truncate" style={{ color: textColor }}>{userEmail}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}


// ============ Navigation Settings Components ============

export function NavGlassSettings({ props, onUpdate }: { props: Record<string, unknown>; onUpdate: (props: Record<string, unknown>) => void }) {
  const navItems = (props.navItems || []) as NavItem[];
  const [showLogoPicker, setShowLogoPicker] = useState(false);

  const updateNavItem = (index: number, key: string, value: unknown) => {
    const newItems = [...navItems];
    newItems[index] = { ...newItems[index], [key]: value };
    onUpdate({ ...props, navItems: newItems });
  };

  const addNavItem = () => {
    onUpdate({ ...props, navItems: [...navItems, { id: Date.now().toString(), label: 'New Link', url: '/', active: false }] });
  };

  const removeNavItem = (index: number) => {
    onUpdate({ ...props, navItems: navItems.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-blue-400 py-2 border-b border-gray-700">🎨 Logo & Branding</summary>
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input type="text" value={(props.logoUrl as string) || ''} onChange={(e) => onUpdate({ ...props, logoUrl: e.target.value })} placeholder="Logo URL" className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
            <button onClick={() => setShowLogoPicker(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"><FiUpload size={14} /></button>
          </div>
          <input type="text" value={(props.logoText as string) || ''} onChange={(e) => onUpdate({ ...props, logoText: e.target.value })} placeholder="Logo text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
        </div>
      </details>

      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-green-400 py-2 border-b border-gray-700">🔗 Navigation Items ({navItems.length})</summary>
        <div className="mt-3 space-y-2">
          {navItems.map((item, index) => (
            <div key={item.id || index} className="flex gap-2 items-center bg-gray-800 p-2 rounded">
              <input type="text" value={item.label || ''} onChange={(e) => updateNavItem(index, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <input type="text" value={item.url || ''} onChange={(e) => updateNavItem(index, 'url', e.target.value)} placeholder="URL" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <label className="flex items-center gap-1 text-xs text-gray-400">
                <input type="checkbox" checked={item.active || false} onChange={(e) => updateNavItem(index, 'active', e.target.checked)} className="rounded" />Active
              </label>
              <button onClick={() => removeNavItem(index)} className="text-red-400 hover:text-red-300"><FiTrash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addNavItem} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">+ Add Navigation Item</button>
        </div>
      </details>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-purple-400 py-2 border-b border-gray-700">🔘 CTA Button</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input type="checkbox" checked={props.showCta !== false} onChange={(e) => onUpdate({ ...props, showCta: e.target.checked })} className="rounded" />Show CTA
          </label>
          {props.showCta !== false && (
            <>
              <input type="text" value={(props.ctaText as string) || ''} onChange={(e) => onUpdate({ ...props, ctaText: e.target.value })} placeholder="Button text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
              <input type="text" value={(props.ctaUrl as string) || ''} onChange={(e) => onUpdate({ ...props, ctaUrl: e.target.value })} placeholder="Button URL" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
              <select value={(props.ctaStyle as string) || 'gradient'} onChange={(e) => onUpdate({ ...props, ctaStyle: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white">
                <option value="gradient">Gradient</option>
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
              </select>
            </>
          )}
        </div>
      </details>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-yellow-400 py-2 border-b border-gray-700">⚙️ Features</summary>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={!!props.showSearch} onChange={(e) => onUpdate({ ...props, showSearch: e.target.checked })} className="rounded" />Show Search</label>
          <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={!!props.showUserMenu} onChange={(e) => onUpdate({ ...props, showUserMenu: e.target.checked })} className="rounded" />Show User Menu</label>
          <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={props.borderBottom !== false} onChange={(e) => onUpdate({ ...props, borderBottom: e.target.checked })} className="rounded" />Border Bottom</label>
        </div>
      </details>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-pink-400 py-2 border-b border-gray-700">🎨 Styling</summary>
        <div className="mt-3 space-y-3">
          <select value={(props.position as string) || 'sticky'} onChange={(e) => onUpdate({ ...props, position: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white">
            <option value="sticky">Sticky</option>
            <option value="fixed">Fixed</option>
            <option value="static">Static</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Background</label><input type="color" value={(props.backgroundColor as string) || '#0F172A'} onChange={(e) => onUpdate({ ...props, backgroundColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Accent</label><input type="color" value={(props.accentColor as string) || '#6366F1'} onChange={(e) => onUpdate({ ...props, accentColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" /></div>
          </div>
          <div><label className="block text-xs text-gray-400 mb-1">Text Color</label><input type="color" value={(props.textColor as string) || '#F8FAFC'} onChange={(e) => onUpdate({ ...props, textColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Blur: {Number(props.blur) || 16}px</label><input type="range" min="0" max="32" value={(props.blur as number) || 16} onChange={(e) => onUpdate({ ...props, blur: parseInt(e.target.value) })} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Opacity: {Math.round(((props.opacity as number) || 0.8) * 100)}%</label><input type="range" min="0" max="100" value={Math.round(((props.opacity as number) || 0.8) * 100)} onChange={(e) => onUpdate({ ...props, opacity: parseInt(e.target.value) / 100 })} className="w-full" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Height: {Number(props.height) || 72}px</label><input type="range" min="48" max="100" value={(props.height as number) || 72} onChange={(e) => onUpdate({ ...props, height: parseInt(e.target.value) })} className="w-full" /></div>
        </div>
      </details>

      {showLogoPicker && <MediaPickerModal type="image" onClose={() => setShowLogoPicker(false)} onSelect={(media) => { onUpdate({ ...props, logoUrl: media.path || media.url }); setShowLogoPicker(false); }} />}
    </div>
  );
}

export function NavMinimalSettings({ props, onUpdate }: { props: Record<string, unknown>; onUpdate: (props: Record<string, unknown>) => void }) {
  const navItems = (props.navItems || []) as NavItem[];

  const updateNavItem = (index: number, key: string, value: unknown) => {
    const newItems = [...navItems];
    newItems[index] = { ...newItems[index], [key]: value };
    onUpdate({ ...props, navItems: newItems });
  };

  return (
    <div className="space-y-4">
      <input type="text" value={(props.logoText as string) || ''} onChange={(e) => onUpdate({ ...props, logoText: e.target.value })} placeholder="Logo Text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-green-400 py-2 border-b border-gray-700">Navigation Items</summary>
        <div className="mt-3 space-y-2">
          {navItems.map((item, index) => (
            <div key={item.id || index} className="flex gap-2">
              <input type="text" value={item.label || ''} onChange={(e) => updateNavItem(index, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <input type="text" value={item.url || ''} onChange={(e) => updateNavItem(index, 'url', e.target.value)} placeholder="URL" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <button onClick={() => onUpdate({ ...props, navItems: navItems.filter((_, i) => i !== index) })} className="text-red-400"><FiTrash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => onUpdate({ ...props, navItems: [...navItems, { id: Date.now().toString(), label: 'Link', url: '/' }] })} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">+ Add Item</button>
        </div>
      </details>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs text-gray-400 mb-1">Text</label><input type="color" value={(props.textColor as string) || '#111827'} onChange={(e) => onUpdate({ ...props, textColor: e.target.value })} className="w-full h-10 rounded" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">Accent</label><input type="color" value={(props.accentColor as string) || '#000000'} onChange={(e) => onUpdate({ ...props, accentColor: e.target.value })} className="w-full h-10 rounded" /></div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={props.uppercase !== false} onChange={(e) => onUpdate({ ...props, uppercase: e.target.checked })} className="rounded" />Uppercase</label>
      <div><label className="block text-xs text-gray-400 mb-1">Letter Spacing: {Number(props.letterSpacing) || 2}px</label><input type="range" min="0" max="8" value={(props.letterSpacing as number) || 2} onChange={(e) => onUpdate({ ...props, letterSpacing: parseInt(e.target.value) })} className="w-full" /></div>
      <div><label className="block text-xs text-gray-400 mb-1">Height: {Number(props.height) || 80}px</label><input type="range" min="60" max="120" value={(props.height as number) || 80} onChange={(e) => onUpdate({ ...props, height: parseInt(e.target.value) })} className="w-full" /></div>
    </div>
  );
}


export function NavMegaSettings({ props, onUpdate }: { props: Record<string, unknown>; onUpdate: (props: Record<string, unknown>) => void }) {
  const navItems = (props.navItems || []) as NavItem[];

  const updateNavItem = (index: number, key: string, value: unknown) => {
    const newItems = [...navItems];
    newItems[index] = { ...newItems[index], [key]: value };
    onUpdate({ ...props, navItems: newItems });
  };

  return (
    <div className="space-y-4">
      <input type="text" value={(props.logoText as string) || ''} onChange={(e) => onUpdate({ ...props, logoText: e.target.value })} placeholder="Logo Text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />

      <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={!!props.topBarEnabled} onChange={(e) => onUpdate({ ...props, topBarEnabled: e.target.checked })} className="rounded" />Enable Top Bar</label>

      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-green-400 py-2 border-b border-gray-700">Navigation Items</summary>
        <div className="mt-3 space-y-2">
          {navItems.map((item, index) => (
            <div key={item.id || index} className="bg-gray-800 p-2 rounded space-y-2">
              <div className="flex gap-2">
                <input type="text" value={item.label || ''} onChange={(e) => updateNavItem(index, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
                <input type="text" value={item.url || ''} onChange={(e) => updateNavItem(index, 'url', e.target.value)} placeholder="URL" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
                <button onClick={() => onUpdate({ ...props, navItems: navItems.filter((_, i) => i !== index) })} className="text-red-400"><FiTrash2 size={14} /></button>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={item.hasMegaMenu || false} onChange={(e) => updateNavItem(index, 'hasMegaMenu', e.target.checked)} className="rounded" />Has Mega Menu</label>
            </div>
          ))}
          <button onClick={() => onUpdate({ ...props, navItems: [...navItems, { id: Date.now().toString(), label: 'Link', url: '/', hasMegaMenu: false }] })} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">+ Add Item</button>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs text-gray-400 mb-1">Background</label><input type="color" value={(props.backgroundColor as string) || '#FFFFFF'} onChange={(e) => onUpdate({ ...props, backgroundColor: e.target.value })} className="w-full h-10 rounded" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">Accent</label><input type="color" value={(props.accentColor as string) || '#4F46E5'} onChange={(e) => onUpdate({ ...props, accentColor: e.target.value })} className="w-full h-10 rounded" /></div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={!!props.showSearch} onChange={(e) => onUpdate({ ...props, showSearch: e.target.checked })} className="rounded" />Show Search</label>
      <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={props.showCta !== false} onChange={(e) => onUpdate({ ...props, showCta: e.target.checked })} className="rounded" />Show CTA</label>
    </div>
  );
}

export function NavCenteredSettings({ props, onUpdate }: { props: Record<string, unknown>; onUpdate: (props: Record<string, unknown>) => void }) {
  const leftItems = (props.leftItems || []) as NavItem[];
  const rightItems = (props.rightItems || []) as NavItem[];

  const updateItem = (side: 'left' | 'right', index: number, key: string, value: unknown) => {
    const items = side === 'left' ? [...leftItems] : [...rightItems];
    items[index] = { ...items[index], [key]: value };
    onUpdate({ ...props, [side === 'left' ? 'leftItems' : 'rightItems']: items });
  };

  return (
    <div className="space-y-4">
      <input type="text" value={(props.logoText as string) || ''} onChange={(e) => onUpdate({ ...props, logoText: e.target.value })} placeholder="Logo Text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
      <select value={(props.logoSize as string) || 'large'} onChange={(e) => onUpdate({ ...props, logoSize: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white">
        <option value="small">Small Logo</option>
        <option value="medium">Medium Logo</option>
        <option value="large">Large Logo</option>
      </select>

      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-blue-400 py-2 border-b border-gray-700">Left Navigation</summary>
        <div className="mt-3 space-y-2">
          {leftItems.map((item, index) => (
            <div key={item.id || index} className="flex gap-2">
              <input type="text" value={item.label || ''} onChange={(e) => updateItem('left', index, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <input type="text" value={item.url || ''} onChange={(e) => updateItem('left', index, 'url', e.target.value)} placeholder="URL" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <button onClick={() => onUpdate({ ...props, leftItems: leftItems.filter((_, i) => i !== index) })} className="text-red-400"><FiTrash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => onUpdate({ ...props, leftItems: [...leftItems, { id: Date.now().toString(), label: 'Link', url: '/' }] })} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">+ Add Left Item</button>
        </div>
      </details>

      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-green-400 py-2 border-b border-gray-700">Right Navigation</summary>
        <div className="mt-3 space-y-2">
          {rightItems.map((item, index) => (
            <div key={item.id || index} className="flex gap-2">
              <input type="text" value={item.label || ''} onChange={(e) => updateItem('right', index, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <input type="text" value={item.url || ''} onChange={(e) => updateItem('right', index, 'url', e.target.value)} placeholder="URL" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
              <button onClick={() => onUpdate({ ...props, rightItems: rightItems.filter((_, i) => i !== index) })} className="text-red-400"><FiTrash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => onUpdate({ ...props, rightItems: [...rightItems, { id: Date.now().toString(), label: 'Link', url: '/' }] })} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">+ Add Right Item</button>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs text-gray-400 mb-1">Background</label><input type="color" value={(props.backgroundColor as string) || '#FAFAFA'} onChange={(e) => onUpdate({ ...props, backgroundColor: e.target.value })} className="w-full h-10 rounded" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">Accent</label><input type="color" value={(props.accentColor as string) || '#A855F7'} onChange={(e) => onUpdate({ ...props, accentColor: e.target.value })} className="w-full h-10 rounded" /></div>
      </div>
      <select value={(props.hoverStyle as string) || 'underline'} onChange={(e) => onUpdate({ ...props, hoverStyle: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white">
        <option value="underline">Underline Hover</option>
        <option value="color">Color Fade Hover</option>
        <option value="background">Background Hover</option>
      </select>
    </div>
  );
}

export function NavSidebarSettings({ props, onUpdate }: { props: Record<string, unknown>; onUpdate: (props: Record<string, unknown>) => void }) {
  const navItems = (props.navItems || []) as NavItem[];

  const updateNavItem = (index: number, key: string, value: unknown) => {
    const newItems = [...navItems];
    newItems[index] = { ...newItems[index], [key]: value };
    onUpdate({ ...props, navItems: newItems });
  };

  return (
    <div className="space-y-4">
      <input type="text" value={(props.logoText as string) || ''} onChange={(e) => onUpdate({ ...props, logoText: e.target.value })} placeholder="Logo/Title" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />

      <details className="group" open>
        <summary className="cursor-pointer text-sm font-medium text-green-400 py-2 border-b border-gray-700">Navigation Items</summary>
        <div className="mt-3 space-y-2">
          {navItems.map((item, index) => (
            <div key={item.id || index} className="bg-gray-800 p-2 rounded space-y-2">
              <div className="flex gap-2">
                <input type="text" value={item.label || ''} onChange={(e) => updateNavItem(index, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
                <select value={item.icon || 'folder'} onChange={(e) => updateNavItem(index, 'icon', e.target.value)} className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white">
                  <option value="home">Home</option>
                  <option value="chart">Chart</option>
                  <option value="folder">Folder</option>
                  <option value="users">Users</option>
                  <option value="settings">Settings</option>
                  <option value="bell">Bell</option>
                </select>
                <button onClick={() => onUpdate({ ...props, navItems: navItems.filter((_, i) => i !== index) })} className="text-red-400"><FiTrash2 size={14} /></button>
              </div>
              <input type="text" value={item.badge || ''} onChange={(e) => updateNavItem(index, 'badge', e.target.value)} placeholder="Badge (optional)" className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white" />
            </div>
          ))}
          <button onClick={() => onUpdate({ ...props, navItems: [...navItems, { id: Date.now().toString(), label: 'Item', url: '/', icon: 'folder' }] })} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">+ Add Item</button>
        </div>
      </details>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-purple-400 py-2 border-b border-gray-700">User Profile</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-xs text-gray-400"><input type="checkbox" checked={props.showUserProfile !== false} onChange={(e) => onUpdate({ ...props, showUserProfile: e.target.checked })} className="rounded" />Show User Profile</label>
          <input type="text" value={(props.userName as string) || ''} onChange={(e) => onUpdate({ ...props, userName: e.target.value })} placeholder="User Name" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
          <input type="text" value={(props.userEmail as string) || ''} onChange={(e) => onUpdate({ ...props, userEmail: e.target.value })} placeholder="User Email" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white" />
        </div>
      </details>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs text-gray-400 mb-1">Background</label><input type="color" value={(props.backgroundColor as string) || '#111827'} onChange={(e) => onUpdate({ ...props, backgroundColor: e.target.value })} className="w-full h-10 rounded" /></div>
        <div><label className="block text-xs text-gray-400 mb-1">Accent</label><input type="color" value={(props.accentColor as string) || '#6366F1'} onChange={(e) => onUpdate({ ...props, accentColor: e.target.value })} className="w-full h-10 rounded" /></div>
      </div>
      <div><label className="block text-xs text-gray-400 mb-1">Width: {Number(props.width) || 260}px</label><input type="range" min="200" max="320" value={(props.width as number) || 260} onChange={(e) => onUpdate({ ...props, width: parseInt(e.target.value) })} className="w-full" /></div>
      <select value={(props.position as string) || 'left'} onChange={(e) => onUpdate({ ...props, position: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white">
        <option value="left">Left Side</option>
        <option value="right">Right Side</option>
      </select>
    </div>
  );
}