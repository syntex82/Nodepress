/**
 * Content Block System for Theme Designer
 * Provides draggable content blocks for building theme previews
 */
import React, { useState } from 'react';
import {
  FiMusic, FiVideo, FiImage, FiSquare, FiStar, FiMessageSquare,
  FiGrid, FiMinus, FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiX, FiChevronLeft, FiChevronRight, FiTrash2,
  FiMove, FiPlus, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';

// ============ Block Type Definitions ============
export type BlockType =
  | 'audio' | 'video' | 'gallery' | 'button' | 'hero'
  | 'card' | 'testimonial' | 'cta' | 'features' | 'divider';

export interface ContentBlock {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

// Block configurations with defaults
export const BLOCK_CONFIGS: Record<BlockType, { label: string; icon: React.ElementType; defaultProps: Record<string, any> }> = {
  audio: {
    label: 'Audio Player',
    icon: FiMusic,
    defaultProps: {
      title: 'Track Title',
      artist: 'Artist Name',
      albumArt: 'https://picsum.photos/200',
      audioUrl: '',
    },
  },
  video: {
    label: 'Video Player',
    icon: FiVideo,
    defaultProps: {
      videoUrl: '',
      posterUrl: 'https://picsum.photos/800/450',
      title: 'Video Title',
    },
  },
  gallery: {
    label: 'Image Gallery',
    icon: FiImage,
    defaultProps: {
      layout: 'grid',
      columns: 3,
      images: [
        { src: 'https://picsum.photos/400/300?1', caption: 'Image 1' },
        { src: 'https://picsum.photos/400/300?2', caption: 'Image 2' },
        { src: 'https://picsum.photos/400/300?3', caption: 'Image 3' },
      ],
    },
  },
  button: {
    label: 'Button',
    icon: FiSquare,
    defaultProps: {
      text: 'Click Me',
      style: 'solid',
      size: 'medium',
      icon: null,
      iconPosition: 'left',
      url: '#',
    },
  },
  hero: {
    label: 'Hero Section',
    icon: FiMaximize,
    defaultProps: {
      title: 'Welcome to Our Site',
      subtitle: 'Discover amazing content and experiences',
      ctaText: 'Get Started',
      ctaUrl: '#',
      backgroundImage: 'https://picsum.photos/1920/800',
      overlay: 0.5,
      alignment: 'center',
    },
  },
  card: {
    label: 'Card',
    icon: FiSquare,
    defaultProps: {
      image: 'https://picsum.photos/400/250',
      title: 'Card Title',
      description: 'This is a sample card description with some text content.',
      buttonText: 'Learn More',
      buttonUrl: '#',
      variant: 'default',
    },
  },
  testimonial: {
    label: 'Testimonial',
    icon: FiMessageSquare,
    defaultProps: {
      quote: 'This product has completely transformed how we work. Highly recommended!',
      author: 'John Doe',
      role: 'CEO, Company Inc.',
      avatar: 'https://i.pravatar.cc/100',
      rating: 5,
    },
  },
  cta: {
    label: 'Call to Action',
    icon: FiArrowUp,
    defaultProps: {
      heading: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today.',
      buttonText: 'Sign Up Now',
      buttonUrl: '#',
      backgroundType: 'gradient',
      backgroundColor: '#3b82f6',
    },
  },
  features: {
    label: 'Feature Grid',
    icon: FiGrid,
    defaultProps: {
      columns: 3,
      features: [
        { icon: '🚀', title: 'Fast', description: 'Lightning quick performance' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: '💎', title: 'Premium', description: 'High-quality experience' },
      ],
    },
  },
  divider: {
    label: 'Divider',
    icon: FiMinus,
    defaultProps: {
      style: 'solid',
      spacing: 40,
      color: '',
    },
  },
};

// ============ Block Components ============

// Audio Player Block
export function AudioPlayerBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(35);
  const [volume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: settings.colors.surface,
        border: `${settings.borders.width}px solid ${settings.colors.border}`,
        borderRadius: settings.borders.radius,
      }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Album Art */}
        <div
          className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
          style={{
            backgroundImage: `url(${props.albumArt})`,
            borderRadius: settings.borders.radius * 0.75,
          }}
        />

        {/* Track Info & Controls */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold truncate"
            style={{
              color: settings.colors.heading,
              fontFamily: settings.typography.headingFont,
            }}
          >
            {props.title}
          </h4>
          <p
            className="text-sm truncate"
            style={{ color: settings.colors.textMuted }}
          >
            {props.artist}
          </p>

          {/* Waveform Visualization */}
          <div className="mt-3 flex items-center gap-0.5 h-8">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = Math.random() * 100;
              const isActive = (i / 40) * 100 <= progress;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-150"
                  style={{
                    height: `${Math.max(15, height)}%`,
                    background: isActive ? settings.colors.primary : settings.colors.border,
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
              );
            })}
          </div>

          {/* Time */}
          <div className="flex justify-between text-xs mt-1" style={{ color: settings.colors.textMuted }}>
            <span>1:24</span>
            <span>3:45</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: settings.colors.background,
          borderTop: `${settings.borders.width}px solid ${settings.colors.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: settings.colors.primary }}
          >
            {isPlaying ? <FiPause className="text-white" size={18} /> : <FiPlay className="text-white ml-0.5" size={18} />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} style={{ color: settings.colors.textMuted }}>
            {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: settings.colors.border }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: isMuted ? '0%' : `${volume}%`, background: settings.colors.primary }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Player Block
export function VideoPlayerBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  return (
    <div
      className="relative rounded-xl overflow-hidden group"
      style={{ borderRadius: settings.borders.radius }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      {/* Video/Poster */}
      <div
        className="aspect-video bg-cover bg-center"
        style={{ backgroundImage: `url(${props.posterUrl})` }}
      >
        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: settings.colors.primary }}
            >
              <FiPlay className="text-white ml-1" size={32} />
            </button>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-1 rounded-full overflow-hidden bg-white/30">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: settings.colors.primary }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-gray-200"
            >
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>
            <button className="text-white hover:text-gray-200">
              <FiVolume2 size={20} />
            </button>
            <span className="text-white text-sm">0:00 / 3:45</span>
          </div>
          <button className="text-white hover:text-gray-200">
            <FiMaximize size={20} />
          </button>
        </div>
      </div>

      {/* Title */}
      {props.title && (
        <div
          className="absolute top-0 left-0 right-0 p-4"
          style={{ background: 'linear-gradient(rgba(0,0,0,0.6), transparent)' }}
        >
          <h4 className="text-white font-semibold">{props.title}</h4>
        </div>
      )}
    </div>
  );
}

// Image Gallery Block
export function GalleryBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { columns, images } = props;

  const gridColsMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };
  const gridCols = gridColsMap[columns as number] || 'grid-cols-3';

  return (
    <>
      <div className={`grid ${gridCols} gap-4`}>
        {images.map((img: { src: string; caption?: string }, i: number) => (
          <div
            key={i}
            className="relative group cursor-pointer overflow-hidden"
            style={{ borderRadius: settings.borders.radius }}
            onClick={() => setLightboxIndex(i)}
          >
            <img
              src={img.src}
              alt={img.caption || `Image ${i + 1}`}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center"
            >
              <FiMaximize className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            {img.caption && (
              <div
                className="absolute bottom-0 left-0 right-0 p-2 text-sm text-white bg-black/50"
                style={{ fontFamily: settings.typography.bodyFont }}
              >
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxIndex(null)}
          >
            <FiX size={32} />
          </button>
          <button
            className="absolute left-4 text-white hover:text-gray-300"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)); }}
          >
            <FiChevronLeft size={48} />
          </button>
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].caption}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white hover:text-gray-300"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(images.length - 1, lightboxIndex + 1)); }}
          >
            <FiChevronRight size={48} />
          </button>
        </div>
      )}
    </>
  );
}


// Button Block
export function ButtonBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { text, style, size, icon, iconPosition } = props;

  const sizeClassesMap: Record<string, string> = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-8 py-4 text-lg',
  };
  const sizeClasses = sizeClassesMap[size as string] || 'px-5 py-2.5 text-base';

  const getButtonStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: settings.borders.radius,
      fontFamily: settings.typography.bodyFont,
      fontWeight: 600,
      transition: 'all 0.2s ease',
    };

    switch (style) {
      case 'solid':
        return { ...base, background: settings.colors.primary, color: 'white' };
      case 'outline':
        return { ...base, background: 'transparent', color: settings.colors.primary, border: `2px solid ${settings.colors.primary}` };
      case 'gradient':
        return { ...base, background: `linear-gradient(135deg, ${settings.colors.primary}, ${settings.colors.secondary})`, color: 'white' };
      case 'ghost':
        return { ...base, background: 'transparent', color: settings.colors.primary };
      default:
        return { ...base, background: settings.colors.primary, color: 'white' };
    }
  };

  return (
    <button
      className={`inline-flex items-center gap-2 ${sizeClasses} hover:opacity-90 hover:scale-105 transition-all`}
      style={getButtonStyle()}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {text}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
}

// Hero Section Block
export function HeroBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { title, subtitle, ctaText, ctaUrl, backgroundImage, overlay, alignment } = props;

  const alignmentClassesMap: Record<string, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  const alignmentClasses = alignmentClassesMap[alignment as string] || 'text-center items-center';

  return (
    <div
      className="relative min-h-[400px] flex items-center justify-center overflow-hidden"
      style={{ borderRadius: settings.borders.radius }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlay})` }}
      />

      {/* Content */}
      <div className={`relative z-10 max-w-3xl mx-auto px-8 py-16 flex flex-col ${alignmentClasses}`}>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{
            color: 'white',
            fontFamily: settings.typography.headingFont,
            fontWeight: settings.typography.headingWeight,
          }}
        >
          {title}
        </h1>
        <p
          className="text-xl mb-8 opacity-90"
          style={{
            color: 'white',
            fontFamily: settings.typography.bodyFont,
          }}
        >
          {subtitle}
        </p>
        <a
          href={ctaUrl}
          className="inline-block px-8 py-4 font-semibold transition-transform hover:scale-105"
          style={{
            background: settings.colors.primary,
            color: 'white',
            borderRadius: settings.borders.radius,
          }}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}

// Card Block
export function CardBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { image, title, description, buttonText, buttonUrl } = props;

  return (
    <div
      className="overflow-hidden transition-all hover:shadow-xl"
      style={{
        background: settings.colors.surface,
        border: `${settings.borders.width}px solid ${settings.colors.border}`,
        borderRadius: settings.borders.radius,
      }}
    >
      {image && (
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div style={{ padding: settings.spacing.sectionPadding }}>
        <h3
          className="text-xl font-semibold mb-2"
          style={{
            color: settings.colors.heading,
            fontFamily: settings.typography.headingFont,
          }}
        >
          {title}
        </h3>
        <p
          className="mb-4"
          style={{
            color: settings.colors.textMuted,
            fontFamily: settings.typography.bodyFont,
            lineHeight: settings.typography.lineHeight,
          }}
        >
          {description}
        </p>
        {buttonText && (
          <a
            href={buttonUrl}
            className="inline-block px-4 py-2 font-medium transition-colors hover:opacity-90"
            style={{
              background: settings.colors.primary,
              color: 'white',
              borderRadius: settings.borders.radius,
            }}
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}



// Testimonial Block
export function TestimonialBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { quote, author, role, avatar, rating } = props;

  return (
    <div
      className="p-8"
      style={{
        background: settings.colors.surface,
        border: `${settings.borders.width}px solid ${settings.colors.border}`,
        borderRadius: settings.borders.radius,
      }}
    >
      {/* Stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={i < rating ? 'fill-current' : ''}
              style={{ color: i < rating ? '#fbbf24' : settings.colors.border }}
              size={20}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote
        className="text-lg italic mb-6"
        style={{
          color: settings.colors.text,
          fontFamily: settings.typography.bodyFont,
          lineHeight: settings.typography.lineHeight,
        }}
      >
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={author}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <div
            className="font-semibold"
            style={{
              color: settings.colors.heading,
              fontFamily: settings.typography.headingFont,
            }}
          >
            {author}
          </div>
          <div
            className="text-sm"
            style={{ color: settings.colors.textMuted }}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}

// CTA Block
export function CTABlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { heading, description, buttonText, buttonUrl, backgroundType, backgroundColor } = props;

  const bgStyle = backgroundType === 'gradient'
    ? `linear-gradient(135deg, ${settings.colors.primary}, ${settings.colors.secondary})`
    : backgroundColor || settings.colors.primary;

  return (
    <div
      className="py-16 px-8 text-center"
      style={{
        background: bgStyle,
        borderRadius: settings.borders.radius,
      }}
    >
      <h2
        className="text-3xl font-bold mb-4"
        style={{
          color: 'white',
          fontFamily: settings.typography.headingFont,
          fontWeight: settings.typography.headingWeight,
        }}
      >
        {heading}
      </h2>
      <p
        className="text-lg mb-8 opacity-90 max-w-2xl mx-auto"
        style={{
          color: 'white',
          fontFamily: settings.typography.bodyFont,
        }}
      >
        {description}
      </p>
      <a
        href={buttonUrl}
        className="inline-block px-8 py-4 font-semibold transition-all hover:scale-105"
        style={{
          background: 'white',
          color: settings.colors.primary,
          borderRadius: settings.borders.radius,
        }}
      >
        {buttonText}
      </a>
    </div>
  );
}

// Features Grid Block
export function FeaturesBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { columns, features } = props;

  const gridColsMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };
  const gridCols = gridColsMap[columns as number] || 'grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-8`}>
      {features.map((feature: { icon: string; title: string; description: string }, i: number) => (
        <div
          key={i}
          className="text-center p-6"
          style={{
            background: settings.colors.surface,
            border: `${settings.borders.width}px solid ${settings.colors.border}`,
            borderRadius: settings.borders.radius,
          }}
        >
          <div
            className="text-4xl mb-4"
            style={{ filter: 'grayscale(0)' }}
          >
            {feature.icon}
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{
              color: settings.colors.heading,
              fontFamily: settings.typography.headingFont,
            }}
          >
            {feature.title}
          </h3>
          <p
            className="text-sm"
            style={{
              color: settings.colors.textMuted,
              fontFamily: settings.typography.bodyFont,
            }}
          >
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

// Divider Block
export function DividerBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { style, spacing, color } = props;

  const dividerColor = color || settings.colors.border;

  const getLineStyle = (): React.CSSProperties => {
    switch (style) {
      case 'dashed':
        return { borderTop: `2px dashed ${dividerColor}` };
      case 'dotted':
        return { borderTop: `2px dotted ${dividerColor}` };
      case 'gradient':
        return {
          height: 2,
          background: `linear-gradient(90deg, transparent, ${settings.colors.primary}, transparent)`,
        };
      default:
        return { borderTop: `1px solid ${dividerColor}` };
    }
  };

  return (
    <div style={{ padding: `${spacing}px 0` }}>
      <div style={getLineStyle()} />
    </div>
  );
}


// ============ Block Renderer ============
export function BlockRenderer({
  block,
  settings,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  block: ContentBlock;
  settings: CustomThemeSettings;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUpdateProps?: (props: Record<string, any>) => void;
}) {
  const renderBlock = () => {
    switch (block.type) {
      case 'audio':
        return <AudioPlayerBlock props={block.props} settings={settings} />;
      case 'video':
        return <VideoPlayerBlock props={block.props} settings={settings} />;
      case 'gallery':
        return <GalleryBlock props={block.props} settings={settings} />;
      case 'button':
        return <ButtonBlock props={block.props} settings={settings} />;
      case 'hero':
        return <HeroBlock props={block.props} settings={settings} />;
      case 'card':
        return <CardBlock props={block.props} settings={settings} />;
      case 'testimonial':
        return <TestimonialBlock props={block.props} settings={settings} />;
      case 'cta':
        return <CTABlock props={block.props} settings={settings} />;
      case 'features':
        return <FeaturesBlock props={block.props} settings={settings} />;
      case 'divider':
        return <DividerBlock props={block.props} settings={settings} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onSelect}
    >
      {/* Block Controls */}
      <div className={`absolute -top-3 right-2 flex items-center gap-1 bg-gray-800 rounded-lg p-1 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-300"
          title="Move Up"
        >
          <FiArrowUp size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-300"
          title="Move Down"
        >
          <FiArrowDown size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="p-1.5 hover:bg-red-600 rounded text-gray-300"
          title="Delete"
        >
          <FiTrash2 size={14} />
        </button>
      </div>

      {renderBlock()}
    </div>
  );
}

// ============ Content Blocks Panel (Sidebar) ============
export function ContentBlocksPanel({
  blocks,
  onAddBlock,
  onUpdateBlock,
  selectedBlockId,
  onSelectBlock,
}: {
  blocks: ContentBlock[];
  onAddBlock: (type: BlockType) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onUpdateBlock: (id: string, props: Record<string, any>) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Content Blocks</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            <FiPlus size={16} /> Add Block
          </button>

          {/* Add Block Menu */}
          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
              {Object.entries(BLOCK_CONFIGS).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => {
                    onAddBlock(type as BlockType);
                    setShowAddMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 text-left"
                >
                  <config.icon size={18} className="text-gray-400" />
                  <span className="text-white">{config.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-4">
        {blocks.length === 0 ? (
          <div className="text-center py-8">
            <FiGrid className="mx-auto mb-3 text-gray-600" size={32} />
            <p className="text-gray-400 text-sm">No blocks added yet</p>
            <p className="text-gray-500 text-xs mt-1">Click "Add Block" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => {
              const config = BLOCK_CONFIGS[block.type];
              const Icon = config.icon;
              return (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedBlockId === block.id
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <FiMove className="text-gray-500 cursor-grab" size={14} />
                  <Icon size={16} className="text-gray-400" />
                  <span className="flex-1 text-sm text-white">{config.label}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Settings Panel */}
      {selectedBlock && (
        <div className="border-t border-gray-700 p-4 max-h-64 overflow-y-auto">
          <h4 className="font-medium text-white mb-3">Block Settings</h4>
          <BlockSettingsForm
            block={selectedBlock}
            onUpdate={(props) => onUpdateBlock(selectedBlock.id, props)}
          />
        </div>
      )}
    </div>
  );
}

// ============ Block Settings Form ============
function BlockSettingsForm({
  block,
  onUpdate,
}: {
  block: ContentBlock;
  onUpdate: (props: Record<string, any>) => void;
}) {
  const { type, props } = block;

  const updateProp = (key: string, value: any) => {
    onUpdate({ ...props, [key]: value });
  };

  // Common input component
  const TextInput = ({ label, propKey }: { label: string; propKey: string }) => (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={props[propKey] || ''}
        onChange={(e) => updateProp(propKey, e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
      />
    </div>
  );

  const SelectInput = ({ label, propKey, options }: { label: string; propKey: string; options: { value: string; label: string }[] }) => (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={props[propKey] || ''}
        onChange={(e) => updateProp(propKey, e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const RangeInput = ({ label, propKey, min, max, step = 1 }: { label: string; propKey: string; min: number; max: number; step?: number }) => (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}: {props[propKey]}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={props[propKey] || min}
        onChange={(e) => updateProp(propKey, Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );

  switch (type) {
    case 'audio':
      return (
        <>
          <TextInput label="Track Title" propKey="title" />
          <TextInput label="Artist" propKey="artist" />
          <TextInput label="Album Art URL" propKey="albumArt" />
        </>
      );
    case 'video':
      return (
        <>
          <TextInput label="Video Title" propKey="title" />
          <TextInput label="Poster URL" propKey="posterUrl" />
        </>
      );
    case 'gallery':
      return (
        <>
          <SelectInput
            label="Layout"
            propKey="layout"
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'masonry', label: 'Masonry' },
            ]}
          />
          <SelectInput
            label="Columns"
            propKey="columns"
            options={[
              { value: '2', label: '2 Columns' },
              { value: '3', label: '3 Columns' },
              { value: '4', label: '4 Columns' },
            ]}
          />
        </>
      );
    case 'button':
      return (
        <>
          <TextInput label="Button Text" propKey="text" />
          <SelectInput
            label="Style"
            propKey="style"
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'ghost', label: 'Ghost' },
            ]}
          />
          <SelectInput
            label="Size"
            propKey="size"
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </>
      );
    case 'hero':
      return (
        <>
          <TextInput label="Title" propKey="title" />
          <TextInput label="Subtitle" propKey="subtitle" />
          <TextInput label="CTA Text" propKey="ctaText" />
          <TextInput label="Background Image" propKey="backgroundImage" />
          <RangeInput label="Overlay Opacity" propKey="overlay" min={0} max={1} step={0.1} />
          <SelectInput
            label="Alignment"
            propKey="alignment"
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </>
      );
    case 'card':
      return (
        <>
          <TextInput label="Title" propKey="title" />
          <TextInput label="Description" propKey="description" />
          <TextInput label="Image URL" propKey="image" />
          <TextInput label="Button Text" propKey="buttonText" />
        </>
      );
    case 'testimonial':
      return (
        <>
          <TextInput label="Quote" propKey="quote" />
          <TextInput label="Author" propKey="author" />
          <TextInput label="Role" propKey="role" />
          <TextInput label="Avatar URL" propKey="avatar" />
          <RangeInput label="Rating" propKey="rating" min={0} max={5} />
        </>
      );
    case 'cta':
      return (
        <>
          <TextInput label="Heading" propKey="heading" />
          <TextInput label="Description" propKey="description" />
          <TextInput label="Button Text" propKey="buttonText" />
          <SelectInput
            label="Background"
            propKey="backgroundType"
            options={[
              { value: 'gradient', label: 'Gradient' },
              { value: 'solid', label: 'Solid' },
            ]}
          />
        </>
      );
    case 'features':
      return (
        <>
          <SelectInput
            label="Columns"
            propKey="columns"
            options={[
              { value: '2', label: '2 Columns' },
              { value: '3', label: '3 Columns' },
              { value: '4', label: '4 Columns' },
            ]}
          />
        </>
      );
    case 'divider':
      return (
        <>
          <SelectInput
            label="Style"
            propKey="style"
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
              { value: 'gradient', label: 'Gradient' },
            ]}
          />
          <RangeInput label="Spacing" propKey="spacing" min={10} max={100} />
        </>
      );
    default:
      return <p className="text-gray-400 text-sm">No settings available</p>;
  }
}