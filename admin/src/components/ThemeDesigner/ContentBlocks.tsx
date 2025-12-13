/**
 * Content Block System for Theme Designer
 * Provides draggable content blocks for building theme previews
 */
import React, { useState } from 'react';
import {
  FiMusic, FiVideo, FiImage, FiSquare, FiStar, FiMessageSquare,
  FiGrid, FiMinus, FiPlay, FiPause, FiVolume2, FiVolumeX,
  FiMaximize, FiX, FiChevronLeft, FiChevronRight, FiTrash2,
  FiMove, FiPlus, FiArrowUp, FiArrowDown, FiCopy, FiEye, FiEyeOff,
  FiBook, FiList, FiTrendingUp, FiUser, FiFolder, FiShoppingCart,
  FiFilter, FiCreditCard, FiPercent
} from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';

import {
  LinkSettings, BlockVisibility, AnimationSettings, RowSettings, HeaderSettings, ProductData,
  LinkSettingsForm, VisibilitySettings, AnimationSettingsForm,
  RowBlock, ProductCardBlock, ProductGridBlock, FeaturedProductBlock, ProductCarouselBlock,
  HeaderBuilderBlock, HeaderSettingsPanel, PRESET_LAYOUTS, ANIMATION_PRESETS,
  // Course/LMS types and components
  CourseData, CourseCategoryData, CourseProgressData, InstructorData, ModuleData,
  CourseCardBlock, CourseGridBlock, CourseCurriculumBlock, CourseProgressBlock,
  CourseInstructorBlock, CourseCategoriesBlock,
  // Shop/E-commerce types and components
  CartData, ProductCategory,
  ShoppingCartBlock, ProductCategoriesBlock, ProductFilterBlock,
  CheckoutSummaryBlock, SaleBannerBlock
} from './AdvancedBlocks';

// ============ Block Type Definitions ============
export type BlockType =
  | 'audio' | 'video' | 'gallery' | 'button' | 'hero'
  | 'card' | 'testimonial' | 'cta' | 'features' | 'divider'
  | 'pricing' | 'stats' | 'timeline' | 'accordion' | 'tabs'
  | 'imageText' | 'logoCloud' | 'newsletter' | 'socialProof' | 'countdown'
  | 'row' | 'header' | 'productCard' | 'productGrid' | 'featuredProduct' | 'productCarousel'
  // Course/LMS blocks
  | 'courseCard' | 'courseGrid' | 'courseCurriculum' | 'courseProgress' | 'courseInstructor' | 'courseCategories'
  // Shop/E-commerce blocks
  | 'shoppingCart' | 'productCategories' | 'productFilter' | 'checkoutSummary' | 'saleBanner';

export interface ContentBlock {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  link?: LinkSettings;
  visibility?: BlockVisibility;
  animation?: AnimationSettings;
}

// Re-export advanced block types for use elsewhere
export type { LinkSettings, BlockVisibility, AnimationSettings, RowSettings, HeaderSettings, ProductData };
export type { CourseData, CourseCategoryData, CourseProgressData, InstructorData, ModuleData, CartData, ProductCategory };
export { LinkSettingsForm, VisibilitySettings, AnimationSettingsForm, HeaderSettingsPanel, PRESET_LAYOUTS, ANIMATION_PRESETS };

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
  pricing: {
    label: 'Pricing Table',
    icon: FiGrid,
    defaultProps: {
      plans: [
        { name: 'Starter', price: '$9', period: '/month', features: ['5 Projects', '10GB Storage', 'Email Support'], highlighted: false, buttonText: 'Get Started' },
        { name: 'Pro', price: '$29', period: '/month', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'API Access'], highlighted: true, buttonText: 'Start Free Trial' },
        { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Unlimited Storage', '24/7 Support', 'Custom Integrations'], highlighted: false, buttonText: 'Contact Sales' },
      ],
    },
  },
  stats: {
    label: 'Stats Counter',
    icon: FiGrid,
    defaultProps: {
      stats: [
        { value: '10K+', label: 'Active Users', icon: '👥' },
        { value: '99.9%', label: 'Uptime', icon: '⚡' },
        { value: '150+', label: 'Countries', icon: '🌍' },
        { value: '24/7', label: 'Support', icon: '💬' },
      ],
      style: 'cards',
    },
  },
  timeline: {
    label: 'Timeline',
    icon: FiMinus,
    defaultProps: {
      items: [
        { date: '2024', title: 'Company Founded', description: 'Started with a vision to change the world.' },
        { date: '2024', title: 'First Product Launch', description: 'Released our flagship product to market.' },
        { date: '2025', title: 'Series A Funding', description: 'Raised $10M to accelerate growth.' },
      ],
      style: 'alternating',
    },
  },
  accordion: {
    label: 'FAQ Accordion',
    icon: FiChevronRight,
    defaultProps: {
      items: [
        { question: 'What is your refund policy?', answer: 'We offer a 30-day money-back guarantee on all plans.' },
        { question: 'How do I get started?', answer: 'Simply sign up for a free account and follow our onboarding guide.' },
        { question: 'Do you offer custom plans?', answer: 'Yes! Contact our sales team for enterprise pricing.' },
      ],
      allowMultiple: false,
    },
  },
  tabs: {
    label: 'Content Tabs',
    icon: FiGrid,
    defaultProps: {
      tabs: [
        { label: 'Features', content: 'Discover all the amazing features our platform offers.' },
        { label: 'Benefits', content: 'Learn how our solution can help your business grow.' },
        { label: 'Pricing', content: 'Flexible pricing plans for teams of all sizes.' },
      ],
      style: 'pills',
    },
  },
  imageText: {
    label: 'Image + Text',
    icon: FiImage,
    defaultProps: {
      image: 'https://picsum.photos/600/400',
      title: 'Feature Highlight',
      description: 'Describe your amazing feature here with compelling copy that converts visitors into customers.',
      buttonText: 'Learn More',
      buttonUrl: '#',
      imagePosition: 'left',
      style: 'rounded',
    },
  },
  logoCloud: {
    label: 'Logo Cloud',
    icon: FiGrid,
    defaultProps: {
      title: 'Trusted by Industry Leaders',
      logos: [
        { name: 'Company 1', url: 'https://via.placeholder.com/120x40?text=Logo+1' },
        { name: 'Company 2', url: 'https://via.placeholder.com/120x40?text=Logo+2' },
        { name: 'Company 3', url: 'https://via.placeholder.com/120x40?text=Logo+3' },
        { name: 'Company 4', url: 'https://via.placeholder.com/120x40?text=Logo+4' },
        { name: 'Company 5', url: 'https://via.placeholder.com/120x40?text=Logo+5' },
      ],
      style: 'grayscale',
    },
  },
  newsletter: {
    label: 'Newsletter',
    icon: FiMessageSquare,
    defaultProps: {
      title: 'Stay Updated',
      description: 'Subscribe to our newsletter for the latest news and updates.',
      buttonText: 'Subscribe',
      placeholder: 'Enter your email',
      style: 'inline',
    },
  },
  socialProof: {
    label: 'Social Proof',
    icon: FiStar,
    defaultProps: {
      type: 'reviews',
      rating: 4.9,
      reviewCount: 2847,
      avatars: [
        'https://i.pravatar.cc/40?img=1',
        'https://i.pravatar.cc/40?img=2',
        'https://i.pravatar.cc/40?img=3',
        'https://i.pravatar.cc/40?img=4',
      ],
      text: 'Join 10,000+ happy customers',
    },
  },
  countdown: {
    label: 'Countdown Timer',
    icon: FiGrid,
    defaultProps: {
      title: 'Launch Coming Soon',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      style: 'cards',
      showLabels: true,
    },
  },
  row: {
    label: 'Row / Columns',
    icon: FiGrid,
    defaultProps: {
      columns: [
        { id: 'col-1', width: { desktop: 6, tablet: 6, mobile: 12 }, blocks: [] },
        { id: 'col-2', width: { desktop: 6, tablet: 6, mobile: 12 }, blocks: [] },
      ],
      gap: 24,
      verticalAlign: 'top',
      horizontalAlign: 'left',
    } as RowSettings,
  },
  header: {
    label: 'Header',
    icon: FiGrid,
    defaultProps: {
      logo: { url: '', width: 120, position: 'left' },
      style: 'default',
      backgroundColor: '',
      navItems: [
        { id: '1', label: 'Home', link: { type: 'internal', url: '/' }, children: [] },
        { id: '2', label: 'About', link: { type: 'internal', url: '/about' }, children: [] },
        { id: '3', label: 'Services', link: { type: 'internal', url: '/services' }, children: [] },
        { id: '4', label: 'Contact', link: { type: 'internal', url: '/contact' }, children: [] },
      ],
      showTopBar: false,
      topBar: { phone: '+1 (555) 123-4567', email: 'hello@example.com', socialLinks: [] },
      ctaButton: { show: true, text: 'Get Started', link: { type: 'internal', url: '/signup' }, style: 'solid' },
      mobileBreakpoint: 'md',
    } as HeaderSettings,
  },
  productCard: {
    label: 'Product Card',
    icon: FiGrid,
    defaultProps: {
      product: {
        id: '1',
        image: 'https://picsum.photos/400/400',
        title: 'Premium Product',
        price: 99.99,
        salePrice: 79.99,
        rating: 4.5,
        reviewCount: 128,
        badge: 'Sale',
        inStock: true,
        productUrl: '/products/premium-product',
        quickViewEnabled: true,
      } as ProductData,
      showRating: true,
      showBadge: true,
      buttonStyle: 'solid',
    },
  },
  productGrid: {
    label: 'Product Grid',
    icon: FiGrid,
    defaultProps: {
      products: [
        { id: '1', image: 'https://picsum.photos/400/400?1', title: 'Product One', price: 49.99, rating: 4.5, reviewCount: 42, inStock: true, productUrl: '/products/product-one', quickViewEnabled: true },
        { id: '2', image: 'https://picsum.photos/400/400?2', title: 'Product Two', price: 79.99, salePrice: 59.99, rating: 5, reviewCount: 128, badge: 'Sale', inStock: true, productUrl: '/products/product-two', quickViewEnabled: true },
        { id: '3', image: 'https://picsum.photos/400/400?3', title: 'Product Three', price: 29.99, rating: 4, reviewCount: 18, inStock: true, productUrl: '/products/product-three', quickViewEnabled: true },
        { id: '4', image: 'https://picsum.photos/400/400?4', title: 'Product Four', price: 149.99, rating: 4.8, reviewCount: 256, badge: 'Best Seller', inStock: true, productUrl: '/products/product-four', quickViewEnabled: true },
      ] as ProductData[],
      columns: 4,
      showRating: true,
      buttonStyle: 'solid',
    },
  },
  featuredProduct: {
    label: 'Featured Product',
    icon: FiGrid,
    defaultProps: {
      product: {
        id: '1',
        image: 'https://picsum.photos/800/600',
        title: 'Featured Product Hero',
        description: 'This is our most popular product with amazing features and quality.',
        price: 199.99,
        salePrice: 149.99,
        rating: 5,
        reviewCount: 512,
        badge: 'Featured',
        inStock: true,
        productUrl: '/products/featured-product',
        quickViewEnabled: true,
      } as ProductData,
      layout: 'left',
    },
  },
  productCarousel: {
    label: 'Product Carousel',
    icon: FiGrid,
    defaultProps: {
      products: [
        { id: '1', image: 'https://picsum.photos/400/400?5', title: 'Carousel Item 1', price: 59.99, rating: 4.5, reviewCount: 32, inStock: true, productUrl: '/products/carousel-1', quickViewEnabled: true },
        { id: '2', image: 'https://picsum.photos/400/400?6', title: 'Carousel Item 2', price: 89.99, rating: 4.8, reviewCount: 64, inStock: true, productUrl: '/products/carousel-2', quickViewEnabled: true },
        { id: '3', image: 'https://picsum.photos/400/400?7', title: 'Carousel Item 3', price: 39.99, rating: 4.2, reviewCount: 21, inStock: true, productUrl: '/products/carousel-3', quickViewEnabled: true },
      ] as ProductData[],
      autoPlay: false,
      showArrows: true,
    },
  },
  // ============ Course/LMS Blocks ============
  courseCard: {
    label: 'Course Card',
    icon: FiBook,
    defaultProps: {
      course: {
        id: '1',
        title: 'Complete Web Development Bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.',
        image: 'https://picsum.photos/600/400?course1',
        instructor: 'John Doe',
        instructorImage: 'https://i.pravatar.cc/150?u=instructor1',
        duration: '42 hours',
        lessonCount: 156,
        price: 99.99,
        salePrice: 49.99,
        rating: 4.8,
        reviewCount: 2450,
        enrollmentCount: 15000,
        level: 'beginner' as const,
        category: 'Web Development',
        courseUrl: '/courses/web-development-bootcamp',
      } as CourseData,
      showInstructor: true,
      showPrice: true,
      showRating: true,
    },
  },
  courseGrid: {
    label: 'Course Grid',
    icon: FiGrid,
    defaultProps: {
      courses: [
        { id: '1', title: 'Web Development Bootcamp', image: 'https://picsum.photos/600/400?c1', instructor: 'John Doe', instructorImage: 'https://i.pravatar.cc/150?u=i1', duration: '42h', lessonCount: 156, price: 99.99, salePrice: 49.99, rating: 4.8, reviewCount: 2450, enrollmentCount: 15000, level: 'beginner' as const, courseUrl: '/courses/1' },
        { id: '2', title: 'React Masterclass', image: 'https://picsum.photos/600/400?c2', instructor: 'Jane Smith', instructorImage: 'https://i.pravatar.cc/150?u=i2', duration: '28h', lessonCount: 98, price: 79.99, rating: 4.9, reviewCount: 1820, enrollmentCount: 8500, level: 'intermediate' as const, courseUrl: '/courses/2' },
        { id: '3', title: 'Node.js Backend', image: 'https://picsum.photos/600/400?c3', instructor: 'Mike Johnson', instructorImage: 'https://i.pravatar.cc/150?u=i3', duration: '35h', lessonCount: 120, price: 89.99, rating: 4.7, reviewCount: 980, enrollmentCount: 5200, level: 'intermediate' as const, courseUrl: '/courses/3' },
      ] as CourseData[],
      columns: 3,
      showFilters: false,
    },
  },
  courseCurriculum: {
    label: 'Course Curriculum',
    icon: FiList,
    defaultProps: {
      modules: [
        { id: '1', title: 'Getting Started', duration: '30:00', lessons: [
          { id: '1-1', title: 'Welcome to the Course', type: 'video' as const, duration: '5:00', isFree: true },
          { id: '1-2', title: 'Course Overview', type: 'video' as const, duration: '10:00', isFree: true },
          { id: '1-3', title: 'Setting Up Your Environment', type: 'video' as const, duration: '15:00' },
        ]},
        { id: '2', title: 'Core Concepts', duration: '55:00', lessons: [
          { id: '2-1', title: 'Understanding the Basics', type: 'video' as const, duration: '20:00' },
          { id: '2-2', title: 'Hands-on Practice', type: 'video' as const, duration: '25:00' },
          { id: '2-3', title: 'Module Quiz', type: 'quiz' as const, duration: '10:00' },
        ]},
      ] as ModuleData[],
      showDuration: true,
      showLessonCount: true,
      expandedByDefault: false,
    },
  },
  courseProgress: {
    label: 'Course Progress',
    icon: FiTrendingUp,
    defaultProps: {
      progress: {
        courseId: '1',
        courseTitle: 'Complete Web Development Bootcamp',
        courseImage: 'https://picsum.photos/600/400?progress',
        progress: 65,
        completedLessons: 101,
        totalLessons: 156,
        lastAccessedLesson: 'Building REST APIs',
      } as CourseProgressData,
      showContinueButton: true,
    },
  },
  courseInstructor: {
    label: 'Course Instructor',
    icon: FiUser,
    defaultProps: {
      instructor: {
        id: '1',
        name: 'Dr. Sarah Johnson',
        photo: 'https://i.pravatar.cc/300?u=instructor',
        title: 'Senior Software Engineer & Educator',
        bio: 'With over 15 years of experience in software development and 8 years of teaching, I\'ve helped over 100,000 students master programming.',
        rating: 4.9,
        reviewCount: 12500,
        courseCount: 12,
        studentCount: 150000,
        credentials: ['PhD Computer Science', 'AWS Certified', 'Google Developer Expert'],
        socialLinks: [
          { platform: 'twitter', url: 'https://twitter.com/sarahjohnson' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/sarahjohnson' },
          { platform: 'youtube', url: 'https://youtube.com/@sarahjohnson' },
        ],
      } as InstructorData,
      showStats: true,
      showSocial: true,
    },
  },
  courseCategories: {
    label: 'Course Categories',
    icon: FiFolder,
    defaultProps: {
      categories: [
        { id: '1', name: 'Web Development', slug: 'web-dev', icon: '💻', courseCount: 245, color: '#3B82F6' },
        { id: '2', name: 'Mobile Development', slug: 'mobile', icon: '📱', courseCount: 128, color: '#10B981' },
        { id: '3', name: 'Data Science', slug: 'data-science', icon: '📊', courseCount: 89, color: '#8B5CF6' },
        { id: '4', name: 'Design', slug: 'design', icon: '🎨', courseCount: 156, color: '#F59E0B' },
      ] as CourseCategoryData[],
      columns: 4,
      style: 'cards',
    },
  },
  // ============ Shop/E-commerce Blocks ============
  shoppingCart: {
    label: 'Shopping Cart',
    icon: FiShoppingCart,
    defaultProps: {
      cart: {
        items: [
          { id: '1', productId: 'p1', title: 'Wireless Headphones', image: 'https://picsum.photos/200/200?cart1', price: 149.99, quantity: 1, variant: 'Black' },
          { id: '2', productId: 'p2', title: 'Smart Watch', image: 'https://picsum.photos/200/200?cart2', price: 299.99, quantity: 2, variant: 'Silver' },
        ],
        subtotal: 749.97,
        tax: 67.50,
        shipping: 0,
        discount: 50,
        total: 767.47,
        currency: '$',
      } as CartData,
      style: 'full',
      showCheckoutButton: true,
    },
  },
  productCategories: {
    label: 'Product Categories',
    icon: FiFolder,
    defaultProps: {
      categories: [
        { id: '1', name: 'Electronics', slug: 'electronics', image: 'https://picsum.photos/400/400?cat1', productCount: 156 },
        { id: '2', name: 'Clothing', slug: 'clothing', image: 'https://picsum.photos/400/400?cat2', productCount: 324 },
        { id: '3', name: 'Home & Garden', slug: 'home-garden', image: 'https://picsum.photos/400/400?cat3', productCount: 89 },
        { id: '4', name: 'Sports', slug: 'sports', image: 'https://picsum.photos/400/400?cat4', productCount: 112 },
      ] as ProductCategory[],
      columns: 4,
      style: 'overlay',
    },
  },
  productFilter: {
    label: 'Product Filter',
    icon: FiFilter,
    defaultProps: {
      showPriceRange: true,
      showCategories: true,
      showRating: true,
      showSort: true,
      categories: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'],
      priceMin: 0,
      priceMax: 500,
    },
  },
  checkoutSummary: {
    label: 'Checkout Summary',
    icon: FiCreditCard,
    defaultProps: {
      cart: {
        items: [
          { id: '1', productId: 'p1', title: 'Premium Headphones', image: 'https://picsum.photos/200/200?checkout1', price: 199.99, quantity: 1 },
          { id: '2', productId: 'p2', title: 'Laptop Stand', image: 'https://picsum.photos/200/200?checkout2', price: 79.99, quantity: 1 },
        ],
        subtotal: 279.98,
        tax: 25.20,
        shipping: 0,
        discount: 20,
        total: 285.18,
        currency: '$',
      } as CartData,
      showItems: true,
      showCoupon: true,
    },
  },
  saleBanner: {
    label: 'Sale Banner',
    icon: FiPercent,
    defaultProps: {
      title: '🔥 Black Friday Sale!',
      subtitle: 'Up to 70% off on all products',
      discountCode: 'BLACKFRIDAY',
      discountText: 'SAVE 50%',
      ctaText: 'Shop Now',
      ctaUrl: '/sale',
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      style: 'full',
      backgroundColor: '#DC2626',
    },
  },
};

// ============ Theme Page Structure ============
export interface ThemePage {
  id: string;
  name: string;
  slug: string;
  blocks: ContentBlock[];
  isHomePage?: boolean;
}

// ============ Page Template Presets ============
export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  blocks: { type: BlockType; props?: Record<string, any> }[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty page',
    icon: '📄',
    blocks: [],
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero, features, testimonials, and CTA',
    icon: '🚀',
    blocks: [
      { type: 'hero', props: { title: 'Welcome to Our Platform', subtitle: 'Build something amazing with our tools', buttonText: 'Get Started', buttonLink: '#', imageUrl: 'https://picsum.photos/1200/600', style: 'centered' } },
      { type: 'features', props: { title: 'Why Choose Us', columns: 3, features: [
        { icon: '⚡', title: 'Lightning Fast', description: 'Optimized for speed and performance' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security built in' },
        { icon: '🎨', title: 'Customizable', description: 'Fully customizable to your brand' },
        { icon: '📱', title: 'Responsive', description: 'Works perfectly on all devices' },
        { icon: '💬', title: '24/7 Support', description: 'We\'re here whenever you need us' },
        { icon: '📈', title: 'Analytics', description: 'Deep insights into your performance' },
      ]}},
      { type: 'testimonial', props: { quote: 'This platform transformed our business. The results have been incredible!', author: 'Sarah Johnson', role: 'CEO, TechCorp', avatar: 'https://i.pravatar.cc/100?1', style: 'card' } },
      { type: 'stats', props: { stats: [
        { value: '10K+', label: 'Happy Users' },
        { value: '99.9%', label: 'Uptime' },
        { value: '24/7', label: 'Support' },
        { value: '50+', label: 'Countries' },
      ], style: 'cards' }},
      { type: 'cta', props: { title: 'Ready to Get Started?', description: 'Join thousands of satisfied customers today.', buttonText: 'Start Free Trial', buttonLink: '#', style: 'gradient' } },
    ],
  },
  {
    id: 'about',
    name: 'About Page',
    description: 'Company story, team, and stats',
    icon: '👥',
    blocks: [
      { type: 'hero', props: { title: 'About Us', subtitle: 'Our story, our mission, our team', buttonText: '', imageUrl: 'https://picsum.photos/1200/500', style: 'minimal' } },
      { type: 'imageText', props: { title: 'Our Story', text: 'Founded in 2020, we set out to revolutionize the way businesses build their online presence. What started as a small team with a big vision has grown into a platform trusted by thousands of businesses worldwide.', imageUrl: 'https://picsum.photos/600/400?1', imagePosition: 'left' } },
      { type: 'imageText', props: { title: 'Our Mission', text: 'We believe everyone deserves the tools to build something great. Our mission is to democratize web development and make professional-grade tools accessible to all.', imageUrl: 'https://picsum.photos/600/400?2', imagePosition: 'right' } },
      { type: 'stats', props: { stats: [
        { value: '50+', label: 'Team Members' },
        { value: '2020', label: 'Founded' },
        { value: '10K+', label: 'Customers' },
        { value: '25', label: 'Countries' },
      ], style: 'minimal' }},
      { type: 'cta', props: { title: 'Want to Join Our Team?', description: 'We\'re always looking for talented people.', buttonText: 'View Careers', buttonLink: '#', style: 'simple' } },
    ],
  },
  {
    id: 'product',
    name: 'Product Page',
    description: 'Featured product showcase with grid',
    icon: '🛍️',
    blocks: [
      { type: 'featuredProduct', props: { product: { id: '1', image: 'https://picsum.photos/800/600', title: 'Premium Product Bundle', price: 299.99, salePrice: 199.99, rating: 4.9, reviewCount: 512, badge: 'Best Value', description: 'Everything you need in one complete package. Limited time offer!', inStock: true }, layout: 'horizontal', showBadge: true } },
      { type: 'divider', props: { style: 'line' } },
      { type: 'productGrid', props: { products: [
        { id: '1', image: 'https://picsum.photos/400/400?10', title: 'Essential Kit', price: 49.99, rating: 4.5, reviewCount: 128, inStock: true },
        { id: '2', image: 'https://picsum.photos/400/400?11', title: 'Pro Bundle', price: 99.99, salePrice: 79.99, rating: 4.8, reviewCount: 256, badge: 'Sale', inStock: true },
        { id: '3', image: 'https://picsum.photos/400/400?12', title: 'Starter Pack', price: 29.99, rating: 4.2, reviewCount: 64, inStock: true },
        { id: '4', image: 'https://picsum.photos/400/400?13', title: 'Ultimate Edition', price: 199.99, rating: 5.0, reviewCount: 89, badge: 'New', inStock: true },
      ], columns: 4, showRating: true }},
      { type: 'testimonial', props: { quote: 'The quality is outstanding. Best purchase I\'ve made this year!', author: 'Mike Chen', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?3', style: 'centered' } },
      { type: 'cta', props: { title: 'Free Shipping on Orders Over $100', description: 'Plus easy returns within 30 days.', buttonText: 'Shop Now', buttonLink: '#', style: 'gradient' } },
    ],
  },
  {
    id: 'blog',
    name: 'Blog Layout',
    description: 'Content-focused blog with sidebar',
    icon: '📝',
    blocks: [
      { type: 'hero', props: { title: 'Our Blog', subtitle: 'Insights, tips, and stories from our team', buttonText: '', imageUrl: '', style: 'minimal' } },
      { type: 'card', props: { image: 'https://picsum.photos/800/400?20', title: 'Getting Started with Our Platform', description: 'A comprehensive guide to help you hit the ground running with all the tools and features available.', buttonText: 'Read More', buttonLink: '#' } },
      { type: 'card', props: { image: 'https://picsum.photos/800/400?21', title: '10 Tips for Better Productivity', description: 'Discover the secrets to maximizing your workflow and getting more done in less time.', buttonText: 'Read More', buttonLink: '#' } },
      { type: 'card', props: { image: 'https://picsum.photos/800/400?22', title: 'The Future of Web Development', description: 'Explore the trends and technologies shaping the future of how we build for the web.', buttonText: 'Read More', buttonLink: '#' } },
      { type: 'newsletter', props: { title: 'Subscribe to Our Newsletter', description: 'Get the latest articles and updates delivered to your inbox.', buttonText: 'Subscribe', placeholder: 'Enter your email', style: 'inline' } },
    ],
  },
  {
    id: 'pricing',
    name: 'Pricing Page',
    description: 'Pricing tiers with comparison',
    icon: '💰',
    blocks: [
      { type: 'hero', props: { title: 'Simple, Transparent Pricing', subtitle: 'Choose the plan that works for you', buttonText: '', imageUrl: '', style: 'minimal' } },
      { type: 'pricing', props: { plans: [
        { name: 'Starter', price: 0, period: 'forever', features: ['5 Projects', '10GB Storage', 'Community Support', 'Basic Analytics'], buttonText: 'Get Started', popular: false },
        { name: 'Pro', price: 29, period: 'month', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'Custom Domain', 'API Access'], buttonText: 'Start Free Trial', popular: true },
        { name: 'Enterprise', price: 99, period: 'month', features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations', 'SLA', 'On-premise Option'], buttonText: 'Contact Sales', popular: false },
      ]}},
      { type: 'accordion', props: { title: 'Frequently Asked Questions', items: [
        { question: 'Can I change plans later?', answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
        { question: 'Is there a free trial?', answer: 'Yes! The Pro plan includes a 14-day free trial. No credit card required.' },
        { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.' },
        { question: 'Can I cancel anytime?', answer: 'Absolutely. Cancel anytime with no questions asked. We\'ll even prorate your refund.' },
      ]}},
      { type: 'cta', props: { title: 'Still Have Questions?', description: 'Our team is here to help you find the perfect plan.', buttonText: 'Contact Us', buttonLink: '#', style: 'simple' } },
    ],
  },
];

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

// Pricing Table Block
export function PricingBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { plans } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan: any, i: number) => (
        <div
          key={i}
          className={`relative p-6 rounded-2xl transition-all duration-300 ${plan.highlighted ? 'scale-105 shadow-2xl z-10' : 'hover:shadow-xl'}`}
          style={{
            background: plan.highlighted ? `linear-gradient(135deg, ${settings.colors.primary}, ${settings.colors.secondary})` : settings.colors.surface,
            border: plan.highlighted ? 'none' : `${settings.borders.width}px solid ${settings.colors.border}`,
            borderRadius: settings.borders.radius * 1.5,
          }}
        >
          {plan.highlighted && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">
              MOST POPULAR
            </div>
          )}
          <h3 style={{ color: plan.highlighted ? 'white' : settings.colors.heading, fontFamily: settings.typography.headingFont }} className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span style={{ color: plan.highlighted ? 'white' : settings.colors.heading }} className="text-4xl font-bold">{plan.price}</span>
            <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : settings.colors.textMuted }} className="text-sm">{plan.period}</span>
          </div>
          <ul className="space-y-3 mb-6">
            {plan.features.map((f: string, j: number) => (
              <li key={j} className="flex items-center gap-2" style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : settings.colors.text }}>
                <span className="text-green-400">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            className="w-full py-3 rounded-xl font-semibold transition-all"
            style={{
              background: plan.highlighted ? 'white' : settings.colors.primary,
              color: plan.highlighted ? settings.colors.primary : 'white',
              borderRadius: settings.borders.radius,
            }}
          >
            {plan.buttonText}
          </button>
        </div>
      ))}
    </div>
  );
}

// Stats Counter Block
export function StatsBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { stats, style } = props;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6`}>
      {stats.map((stat: any, i: number) => (
        <div
          key={i}
          className="text-center p-6 transition-all hover:scale-105"
          style={{
            background: style === 'cards' ? settings.colors.surface : 'transparent',
            border: style === 'cards' ? `${settings.borders.width}px solid ${settings.colors.border}` : 'none',
            borderRadius: settings.borders.radius,
          }}
        >
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div style={{ color: settings.colors.primary, fontFamily: settings.typography.headingFont }} className="text-3xl font-bold mb-1">{stat.value}</div>
          <div style={{ color: settings.colors.textMuted }} className="text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Timeline Block
export function TimelineBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { items } = props;

  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full" style={{ background: settings.colors.border }} />
      <div className="space-y-12">
        {items.map((item: any, i: number) => (
          <div key={i} className={`flex items-center gap-8 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
              <div style={{ color: settings.colors.primary }} className="text-sm font-semibold mb-1">{item.date}</div>
              <h4 style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }} className="text-lg font-bold mb-2">{item.title}</h4>
              <p style={{ color: settings.colors.textMuted }}>{item.description}</p>
            </div>
            <div className="relative z-10 w-4 h-4 rounded-full" style={{ background: settings.colors.primary, boxShadow: `0 0 0 4px ${settings.colors.background}` }} />
            <div className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Accordion Block
export function AccordionBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { items } = props;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item: any, i: number) => (
        <div
          key={i}
          className="overflow-hidden transition-all"
          style={{
            background: settings.colors.surface,
            border: `${settings.borders.width}px solid ${settings.colors.border}`,
            borderRadius: settings.borders.radius,
          }}
        >
          <button
            className="w-full flex items-center justify-between p-4 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }} className="font-semibold">{item.question}</span>
            <FiChevronRight className={`transition-transform ${openIndex === i ? 'rotate-90' : ''}`} style={{ color: settings.colors.primary }} />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4" style={{ color: settings.colors.textMuted }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Tabs Block
export function TabsBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { tabs, style } = props;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className={`flex gap-2 mb-6 ${style === 'pills' ? '' : 'border-b border-gray-200'}`} style={{ borderColor: settings.colors.border }}>
        {tabs.map((tab: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 font-medium transition-all ${style === 'pills' ? 'rounded-full' : 'rounded-t-lg'}`}
            style={{
              background: activeTab === i ? settings.colors.primary : 'transparent',
              color: activeTab === i ? 'white' : settings.colors.textMuted,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="p-6"
        style={{
          background: settings.colors.surface,
          borderRadius: settings.borders.radius,
          color: settings.colors.text,
        }}
      >
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}

// Image + Text Block
export function ImageTextBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { image, title, description, buttonText, imagePosition } = props;

  return (
    <div className={`flex flex-col md:flex-row gap-8 items-center ${imagePosition === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover shadow-xl"
          style={{ borderRadius: settings.borders.radius * 1.5 }}
        />
      </div>
      <div className="flex-1 space-y-4">
        <h3 style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }} className="text-2xl font-bold">{title}</h3>
        <p style={{ color: settings.colors.textMuted }} className="text-lg leading-relaxed">{description}</p>
        <button
          className="px-6 py-3 font-semibold transition-all hover:opacity-90"
          style={{ background: settings.colors.primary, color: 'white', borderRadius: settings.borders.radius }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// Logo Cloud Block
export function LogoCloudBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { title, logos, style } = props;

  return (
    <div className="text-center">
      <p style={{ color: settings.colors.textMuted }} className="text-sm uppercase tracking-wider mb-8">{title}</p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {logos.map((logo: any, i: number) => (
          <img
            key={i}
            src={logo.url}
            alt={logo.name}
            className={`h-10 object-contain transition-all hover:opacity-100 ${style === 'grayscale' ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

// Newsletter Block
export function NewsletterBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { title, description, buttonText, placeholder, style: layoutStyle } = props;

  return (
    <div
      className="p-8 text-center"
      style={{
        background: `linear-gradient(135deg, ${settings.colors.primary}15, ${settings.colors.secondary}15)`,
        borderRadius: settings.borders.radius * 2,
      }}
    >
      <h3 style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }} className="text-2xl font-bold mb-2">{title}</h3>
      <p style={{ color: settings.colors.textMuted }} className="mb-6">{description}</p>
      <div className={`flex gap-3 max-w-md mx-auto ${layoutStyle === 'stacked' ? 'flex-col' : ''}`}>
        <input
          type="email"
          placeholder={placeholder}
          className="flex-1 px-4 py-3 outline-none focus:ring-2"
          style={{
            background: settings.colors.surface,
            border: `${settings.borders.width}px solid ${settings.colors.border}`,
            borderRadius: settings.borders.radius,
            color: settings.colors.text,
          }}
        />
        <button
          className="px-6 py-3 font-semibold whitespace-nowrap transition-all hover:opacity-90"
          style={{ background: settings.colors.primary, color: 'white', borderRadius: settings.borders.radius }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// Social Proof Block
export function SocialProofBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { rating, reviewCount, avatars, text } = props;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6" style={{ background: settings.colors.surface, borderRadius: settings.borders.radius }}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar key={star} className={star <= Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} size={20} />
        ))}
        <span style={{ color: settings.colors.heading }} className="ml-2 font-bold">{rating}</span>
      </div>
      <div className="flex -space-x-2">
        {avatars.slice(0, 4).map((avatar: string, i: number) => (
          <img key={i} src={avatar} alt="" className="w-10 h-10 rounded-full border-2" style={{ borderColor: settings.colors.background }} />
        ))}
        {avatars.length > 4 && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: settings.colors.primary, color: 'white' }}>
            +{avatars.length - 4}
          </div>
        )}
      </div>
      <div style={{ color: settings.colors.textMuted }}>
        <span style={{ color: settings.colors.heading }} className="font-semibold">{reviewCount.toLocaleString()}</span> reviews • {text}
      </div>
    </div>
  );
}

// Countdown Timer Block
export function CountdownBlock({
  props,
  settings
}: {
  props: Record<string, any>;
  settings: CustomThemeSettings;
}) {
  const { title, targetDate, showLabels } = props;
  const target = new Date(targetDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

  const timeUnits = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ];

  return (
    <div className="text-center py-8">
      <h3 style={{ color: settings.colors.heading, fontFamily: settings.typography.headingFont }} className="text-2xl font-bold mb-8">{title}</h3>
      <div className="flex justify-center gap-4">
        {timeUnits.map((unit, i) => (
          <div key={i} className="text-center">
            <div
              className="w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-xl shadow-lg"
              style={{ background: settings.colors.surface, color: settings.colors.primary, borderRadius: settings.borders.radius }}
            >
              {String(unit.value).padStart(2, '0')}
            </div>
            {showLabels && (
              <div style={{ color: settings.colors.textMuted }} className="text-xs mt-2 uppercase tracking-wider">{unit.label}</div>
            )}
          </div>
        ))}
      </div>
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
  onDuplicate,
  onCopy,
  onUpdateBlock,
  previewDevice = 'desktop',
}: {
  block: ContentBlock;
  settings: CustomThemeSettings;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onUpdateBlock?: (block: ContentBlock) => void;
  onUpdateProps?: (props: Record<string, any>) => void;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}) {
  // Check visibility based on device
  const isVisible = block.visibility ? block.visibility[previewDevice] : true;

  // Get animation class
  const getAnimationStyle = (): React.CSSProperties => {
    if (!block.animation || block.animation.type === 'none') return {};
    return {
      animationDuration: `${block.animation.duration}ms`,
      animationDelay: `${block.animation.delay}ms`,
      animationFillMode: 'both',
    };
  };

  const animationClass = block.animation?.type && block.animation.type !== 'none'
    ? `animate-${block.animation.type}`
    : '';

  if (!isVisible) {
    return (
      <div className="relative group opacity-30 border border-dashed border-gray-500 rounded p-2">
        <div className="text-xs text-gray-400 text-center">Hidden on {previewDevice}</div>
      </div>
    );
  }
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
      case 'pricing':
        return <PricingBlock props={block.props} settings={settings} />;
      case 'stats':
        return <StatsBlock props={block.props} settings={settings} />;
      case 'timeline':
        return <TimelineBlock props={block.props} settings={settings} />;
      case 'accordion':
        return <AccordionBlock props={block.props} settings={settings} />;
      case 'tabs':
        return <TabsBlock props={block.props} settings={settings} />;
      case 'imageText':
        return <ImageTextBlock props={block.props} settings={settings} />;
      case 'logoCloud':
        return <LogoCloudBlock props={block.props} settings={settings} />;
      case 'newsletter':
        return <NewsletterBlock props={block.props} settings={settings} />;
      case 'socialProof':
        return <SocialProofBlock props={block.props} settings={settings} />;
      case 'countdown':
        return <CountdownBlock props={block.props} settings={settings} />;
      case 'row':
        return <RowBlock props={block.props as RowSettings} settings={settings} />;
      case 'header':
        return <HeaderBuilderBlock props={block.props as HeaderSettings} settings={settings} />;
      case 'productCard':
        return <ProductCardBlock props={block.props as { product: ProductData; showRating?: boolean; showBadge?: boolean; buttonStyle?: 'solid' | 'outline' | 'icon' }} settings={settings} />;
      case 'productGrid':
        return <ProductGridBlock props={block.props as { products: ProductData[]; columns: 2 | 3 | 4; showRating?: boolean; buttonStyle?: 'solid' | 'outline' | 'icon' }} settings={settings} />;
      case 'featuredProduct':
        return <FeaturedProductBlock props={block.props as { product: ProductData; layout: 'left' | 'right' }} settings={settings} />;
      case 'productCarousel':
        return <ProductCarouselBlock props={block.props as { products: ProductData[]; autoPlay?: boolean; showArrows?: boolean }} settings={settings} />;
      // Course/LMS Blocks
      case 'courseCard':
        return <CourseCardBlock props={block.props as { course: CourseData; showInstructor?: boolean; showPrice?: boolean; showRating?: boolean }} settings={settings} />;
      case 'courseGrid':
        return <CourseGridBlock props={block.props as { courses: CourseData[]; columns: 2 | 3 | 4; showFilters?: boolean }} settings={settings} />;
      case 'courseCurriculum':
        return <CourseCurriculumBlock props={block.props as { modules: ModuleData[]; showDuration?: boolean; showLessonCount?: boolean; expandedByDefault?: boolean }} settings={settings} />;
      case 'courseProgress':
        return <CourseProgressBlock props={block.props as { progress: CourseProgressData; showContinueButton?: boolean }} settings={settings} />;
      case 'courseInstructor':
        return <CourseInstructorBlock props={block.props as { instructor: InstructorData; showStats?: boolean; showSocial?: boolean }} settings={settings} />;
      case 'courseCategories':
        return <CourseCategoriesBlock props={block.props as { categories: CourseCategoryData[]; columns: 2 | 3 | 4 | 6; style: 'cards' | 'minimal' | 'icons' }} settings={settings} />;
      // Shop/E-commerce Blocks
      case 'shoppingCart':
        return <ShoppingCartBlock props={block.props as { cart: CartData; style: 'mini' | 'full' | 'sidebar'; showCheckoutButton?: boolean }} settings={settings} />;
      case 'productCategories':
        return <ProductCategoriesBlock props={block.props as { categories: ProductCategory[]; columns: 2 | 3 | 4 | 5; style: 'cards' | 'overlay' | 'minimal' }} settings={settings} />;
      case 'productFilter':
        return <ProductFilterBlock props={block.props as { showPriceRange?: boolean; showCategories?: boolean; showRating?: boolean; showSort?: boolean; categories?: string[]; priceMin?: number; priceMax?: number }} settings={settings} />;
      case 'checkoutSummary':
        return <CheckoutSummaryBlock props={block.props as { cart: CartData; showItems?: boolean; showCoupon?: boolean }} settings={settings} />;
      case 'saleBanner':
        return <SaleBannerBlock props={block.props as { title: string; subtitle?: string; discountCode?: string; discountText?: string; ctaText?: string; ctaUrl?: string; endDate?: string; style: 'full' | 'compact' | 'floating'; backgroundColor?: string }} settings={settings} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''} ${animationClass}`}
      style={getAnimationStyle()}
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
        <div className="w-px h-4 bg-gray-600" />
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}
          className="p-1.5 hover:bg-blue-600 rounded text-gray-300"
          title="Duplicate Block"
        >
          <FiCopy size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCopy?.(); }}
          className="p-1.5 hover:bg-green-600 rounded text-gray-300"
          title="Copy to Clipboard"
        >
          <FiMove size={14} />
        </button>
        <div className="w-px h-4 bg-gray-600" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onUpdateBlock) {
              const visibility = block.visibility || { desktop: true, tablet: true, mobile: true };
              onUpdateBlock({ ...block, visibility: { ...visibility, [previewDevice]: !visibility[previewDevice] } });
            }
          }}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-300"
          title={`Toggle visibility on ${previewDevice}`}
        >
          {block.visibility?.[previewDevice] === false ? <FiEyeOff size={14} /> : <FiEye size={14} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="p-1.5 hover:bg-red-600 rounded text-gray-300"
          title="Delete"
        >
          <FiTrash2 size={14} />
        </button>
      </div>

      {/* Block Type Label */}
      <div className={`absolute -top-3 left-2 px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {BLOCK_CONFIGS[block.type as BlockType]?.label || block.type}
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
  onUpdateFullBlock,
  onLoadTemplate,
  selectedBlockId,
  onSelectBlock,
}: {
  blocks: ContentBlock[];
  onAddBlock: (type: BlockType) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onUpdateBlock: (id: string, props: Record<string, any>) => void;
  onUpdateFullBlock?: (block: ContentBlock) => void;
  onLoadTemplate?: (template: PageTemplate) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // Helper to update a full block (for link, visibility, animation)
  const handleUpdateFullBlock = (updatedBlock: ContentBlock) => {
    if (onUpdateFullBlock) {
      onUpdateFullBlock(updatedBlock);
    } else {
      // Fallback: use onUpdateBlock to update props, but we can't update link/visibility/animation this way
      onUpdateBlock(updatedBlock.id, updatedBlock.props);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Content Blocks</h3>
        <div className="flex items-center gap-2">
          {/* Template Selector Button */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium"
            title="Use a template"
          >
            📋
          </button>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              <FiPlus size={16} /> Add
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
      </div>

      {/* Template Selector Panel */}
      {showTemplates && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">📋 Page Templates</h4>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {blocks.length > 0
              ? 'Warning: Loading a template will replace all current blocks.'
              : 'Choose a template to get started quickly.'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PAGE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  if (onLoadTemplate) {
                    onLoadTemplate(template);
                  }
                  setShowTemplates(false);
                }}
                className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
              >
                <span className="text-2xl">{template.icon}</span>
                <span className="text-xs font-medium text-white">{template.name}</span>
                <span className="text-[10px] text-gray-400 leading-tight">{template.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-4">
        {blocks.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <FiGrid className="text-blue-400" size={28} />
            </div>
            <p className="text-gray-300 font-medium mb-1">Start Building</p>
            <p className="text-gray-500 text-xs mb-4">Add blocks or use a template</p>

            {/* Quick Template Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setShowTemplates(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                📋 Use a Template
              </button>
              <button
                onClick={() => setShowAddMenu(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors text-gray-300"
              >
                <FiPlus size={16} /> Add First Block
              </button>
            </div>

            {/* Template Preview */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-3">Popular Templates:</p>
              <div className="flex justify-center gap-2">
                {PAGE_TEMPLATES.slice(1, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onLoadTemplate?.(t)}
                    className="flex flex-col items-center gap-1 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                    title={t.description}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-[10px] text-gray-400">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
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
        <div className="border-t border-gray-700 p-4 max-h-[400px] overflow-y-auto">
          <h4 className="font-medium text-white mb-3">Block Settings</h4>
          <BlockSettingsForm
            block={selectedBlock}
            onUpdate={(props) => onUpdateBlock(selectedBlock.id, props)}
          />

          {/* Advanced Settings Accordion */}
          <div className="mt-4 space-y-3">
            {/* Link Settings */}
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-300 hover:text-white py-2 border-b border-gray-700">
                <span>🔗 Link Settings</span>
                <span className="text-xs text-blue-400">{selectedBlock.link?.type !== 'none' && selectedBlock.link?.type ? `(${selectedBlock.link.type})` : ''}</span>
              </summary>
              <div className="mt-2">
                <LinkSettingsForm
                  link={selectedBlock.link || { type: 'none', url: '' }}
                  onChange={(link) => {
                    handleUpdateFullBlock({ ...selectedBlock, link });
                  }}
                />
              </div>
            </details>

            {/* Visibility Settings */}
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-300 hover:text-white py-2 border-b border-gray-700">
                <span>👁️ Visibility</span>
                <span className="text-xs text-gray-500">
                  {selectedBlock.visibility ?
                    `${selectedBlock.visibility.desktop ? '🖥' : ''}${selectedBlock.visibility.tablet ? '📱' : ''}${selectedBlock.visibility.mobile ? '📲' : ''}`
                    : '🖥📱📲'}
                </span>
              </summary>
              <div className="mt-2">
                <VisibilitySettings
                  visibility={selectedBlock.visibility || { desktop: true, tablet: true, mobile: true }}
                  onChange={(visibility) => {
                    handleUpdateFullBlock({ ...selectedBlock, visibility });
                  }}
                />
              </div>
            </details>

            {/* Animation Settings */}
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-300 hover:text-white py-2 border-b border-gray-700">
                <span>✨ Animation</span>
                <span className="text-xs text-purple-400">{selectedBlock.animation?.type !== 'none' ? selectedBlock.animation?.type : ''}</span>
              </summary>
              <div className="mt-2">
                <AnimationSettingsForm
                  animation={selectedBlock.animation || { type: 'none', duration: 300, delay: 0 }}
                  onChange={(animation) => {
                    handleUpdateFullBlock({ ...selectedBlock, animation });
                  }}
                />
              </div>
            </details>

            {/* Row/Column Preset Layouts (only for row blocks) */}
            {selectedBlock.type === 'row' && (
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-300 hover:text-white py-2 border-b border-gray-700">
                  <span>📐 Column Presets</span>
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PRESET_LAYOUTS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const newColumns = preset.columns.map((width, i) => ({
                          id: `col-${Date.now()}-${i}`,
                          width: { desktop: width as 1|2|3|4|5|6|7|8|9|10|11|12, tablet: Math.min(width * 2, 12) as 1|2|3|4|5|6|7|8|9|10|11|12, mobile: 12 as 1|2|3|4|5|6|7|8|9|10|11|12 },
                          blocks: [],
                        }));
                        handleUpdateFullBlock({
                          ...selectedBlock,
                          props: { ...selectedBlock.props, columns: newColumns }
                        });
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white text-center"
                    >
                      {preset.name}
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {preset.columns.map((w, i) => (
                          <div key={i} className="h-2 bg-blue-500 rounded" style={{ width: `${(w / 12) * 100}%`, minWidth: 4 }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
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

  const NumberInput = ({ label, propKey }: { label: string; propKey: string }) => (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        value={props[propKey] || 0}
        onChange={(e) => updateProp(propKey, Number(e.target.value))}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
      />
    </div>
  );

  const CheckboxInput = ({ label, propKey }: { label: string; propKey: string }) => (
    <div className="mb-3 flex items-center gap-2">
      <input
        type="checkbox"
        checked={props[propKey] || false}
        onChange={(e) => updateProp(propKey, e.target.checked)}
        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
      />
      <label className="text-xs text-gray-400">{label}</label>
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

    case 'productCard':
    case 'featuredProduct': {
      const product = props.product || {};
      const updateProduct = (key: string, value: any) => {
        onUpdate({ ...props, product: { ...product, [key]: value } });
      };
      return (
        <>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Product Title</label>
            <input
              type="text"
              value={product.title || ''}
              onChange={(e) => updateProduct('title', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Product URL</label>
            <input
              type="text"
              value={product.productUrl || ''}
              onChange={(e) => updateProduct('productUrl', e.target.value)}
              placeholder="/products/my-product"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
            <input
              type="text"
              value={product.image || ''}
              onChange={(e) => updateProduct('image', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Price ($)</label>
              <input
                type="number"
                value={product.price || 0}
                onChange={(e) => updateProduct('price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sale Price ($)</label>
              <input
                type="number"
                value={product.salePrice || ''}
                onChange={(e) => updateProduct('salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Badge</label>
            <input
              type="text"
              value={product.badge || ''}
              onChange={(e) => updateProduct('badge', e.target.value)}
              placeholder="Sale, New, Featured..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
          </div>
          {type === 'featuredProduct' && (
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea
                value={product.description || ''}
                onChange={(e) => updateProduct('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={product.quickViewEnabled !== false}
              onChange={(e) => updateProduct('quickViewEnabled', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600"
            />
            <label className="text-xs text-gray-400">Enable Quick View</label>
          </div>
        </>
      );
    }

    case 'productGrid':
    case 'productCarousel': {
      const products = props.products || [];
      const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

      const updateProductAtIndex = (index: number, key: string, value: any) => {
        const newProducts = [...products];
        newProducts[index] = { ...newProducts[index], [key]: value };
        onUpdate({ ...props, products: newProducts });
      };

      const addProduct = () => {
        const newProduct: ProductData = {
          id: `product-${Date.now()}`,
          image: 'https://picsum.photos/400/400',
          title: `New Product ${products.length + 1}`,
          price: 49.99,
          rating: 4.5,
          reviewCount: 0,
          inStock: true,
          productUrl: `/products/new-product-${products.length + 1}`,
          quickViewEnabled: true,
        };
        onUpdate({ ...props, products: [...products, newProduct] });
      };

      const removeProduct = (index: number) => {
        const newProducts = products.filter((_: ProductData, i: number) => i !== index);
        onUpdate({ ...props, products: newProducts });
        setEditingIndex(null);
      };

      return (
        <>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-2">Products ({products.length})</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map((product: ProductData, index: number) => (
                <div key={product.id} className="bg-gray-700 rounded-lg p-2">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    <img src={product.image} alt="" className="w-8 h-8 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{product.title}</p>
                      <p className="text-xs text-gray-400">${product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeProduct(index); }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <FiX size={14} />
                    </button>
                  </div>

                  {/* Expanded edit form */}
                  {editingIndex === index && (
                    <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => updateProductAtIndex(index, 'title', e.target.value)}
                        placeholder="Product Title"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        value={product.productUrl || ''}
                        onChange={(e) => updateProductAtIndex(index, 'productUrl', e.target.value)}
                        placeholder="Product URL"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        value={product.image}
                        onChange={(e) => updateProductAtIndex(index, 'image', e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProductAtIndex(index, 'price', parseFloat(e.target.value))}
                          placeholder="Price"
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                        />
                        <input
                          type="number"
                          value={product.salePrice || ''}
                          onChange={(e) => updateProductAtIndex(index, 'salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Sale Price"
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={product.badge || ''}
                        onChange={(e) => updateProductAtIndex(index, 'badge', e.target.value)}
                        placeholder="Badge (Sale, New...)"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addProduct}
              className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white flex items-center justify-center gap-1"
            >
              <FiPlus size={14} /> Add Product
            </button>
          </div>

          {type === 'productGrid' && (
            <SelectInput
              label="Columns"
              propKey="columns"
              options={[
                { value: '2', label: '2 Columns' },
                { value: '3', label: '3 Columns' },
                { value: '4', label: '4 Columns' },
              ]}
            />
          )}
        </>
      );
    }

    // ============ Course/LMS Block Settings ============
    case 'courseCard': {
      const course = props.course || {};
      const updateCourse = (key: string, value: any) => {
        updateProp('course', { ...course, [key]: value });
      };
      return (
        <>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Course Title</label>
            <input type="text" value={course.title || ''} onChange={(e) => updateCourse('title', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea value={course.description || ''} onChange={(e) => updateCourse('description', e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white resize-none" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
            <input type="text" value={course.image || ''} onChange={(e) => updateCourse('image', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Course URL</label>
            <input type="text" value={course.courseUrl || ''} onChange={(e) => updateCourse('courseUrl', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Price</label>
              <input type="number" value={course.price || 0} onChange={(e) => updateCourse('price', Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Sale Price</label>
              <input type="number" value={course.salePrice || 0} onChange={(e) => updateCourse('salePrice', Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Instructor Name</label>
            <input type="text" value={course.instructor || ''} onChange={(e) => updateCourse('instructor', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Duration</label>
            <input type="text" value={course.duration || ''} onChange={(e) => updateCourse('duration', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <CheckboxInput label="Show Instructor" propKey="showInstructor" />
          <CheckboxInput label="Show Price" propKey="showPrice" />
          <CheckboxInput label="Show Rating" propKey="showRating" />
        </>
      );
    }

    case 'courseGrid': {
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
          <CheckboxInput label="Show Filters" propKey="showFilters" />
          <p className="text-xs text-gray-400 mt-2">Courses can be edited in the course management section.</p>
        </>
      );
    }

    case 'courseCurriculum': {
      return (
        <>
          <CheckboxInput label="Show Duration" propKey="showDuration" />
          <CheckboxInput label="Show Lesson Count" propKey="showLessonCount" />
          <CheckboxInput label="Expanded by Default" propKey="expandedByDefault" />
          <p className="text-xs text-gray-400 mt-2">Curriculum modules can be edited in the course management section.</p>
        </>
      );
    }

    case 'courseProgress': {
      const progress = props.progress || {};
      const updateProgress = (key: string, value: any) => {
        updateProp('progress', { ...progress, [key]: value });
      };
      return (
        <>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Course Title</label>
            <input type="text" value={progress.courseTitle || ''} onChange={(e) => updateProgress('courseTitle', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Course Image URL</label>
            <input type="text" value={progress.courseImage || ''} onChange={(e) => updateProgress('courseImage', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Progress %</label>
            <input type="number" min={0} max={100} value={progress.progress || 0} onChange={(e) => updateProgress('progress', Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Completed</label>
              <input type="number" value={progress.completedLessons || 0} onChange={(e) => updateProgress('completedLessons', Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Total</label>
              <input type="number" value={progress.totalLessons || 0} onChange={(e) => updateProgress('totalLessons', Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
            </div>
          </div>
          <CheckboxInput label="Show Continue Button" propKey="showContinueButton" />
        </>
      );
    }

    case 'courseInstructor': {
      const instructor = props.instructor || {};
      const updateInstructor = (key: string, value: any) => {
        updateProp('instructor', { ...instructor, [key]: value });
      };
      return (
        <>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Name</label>
            <input type="text" value={instructor.name || ''} onChange={(e) => updateInstructor('name', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input type="text" value={instructor.title || ''} onChange={(e) => updateInstructor('title', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Photo URL</label>
            <input type="text" value={instructor.photo || ''} onChange={(e) => updateInstructor('photo', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Bio</label>
            <textarea value={instructor.bio || ''} onChange={(e) => updateInstructor('bio', e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Courses</label>
              <input type="number" value={instructor.courseCount || 0} onChange={(e) => updateInstructor('courseCount', Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
            </div>
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Students</label>
              <input type="number" value={instructor.studentCount || 0} onChange={(e) => updateInstructor('studentCount', Number(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white" />
            </div>
          </div>
          <CheckboxInput label="Show Stats" propKey="showStats" />
          <CheckboxInput label="Show Social Links" propKey="showSocial" />
        </>
      );
    }

    case 'courseCategories': {
      return (
        <>
          <SelectInput
            label="Columns"
            propKey="columns"
            options={[
              { value: '2', label: '2 Columns' },
              { value: '3', label: '3 Columns' },
              { value: '4', label: '4 Columns' },
              { value: '6', label: '6 Columns' },
            ]}
          />
          <SelectInput
            label="Style"
            propKey="style"
            options={[
              { value: 'cards', label: 'Cards' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'icons', label: 'Icons' },
            ]}
          />
          <p className="text-xs text-gray-400 mt-2">Categories can be managed in the course settings.</p>
        </>
      );
    }

    // ============ Shop/E-commerce Block Settings ============
    case 'shoppingCart': {
      return (
        <>
          <SelectInput
            label="Cart Style"
            propKey="style"
            options={[
              { value: 'mini', label: 'Mini Cart' },
              { value: 'full', label: 'Full Cart' },
              { value: 'sidebar', label: 'Sidebar Cart' },
            ]}
          />
          <CheckboxInput label="Show Checkout Button" propKey="showCheckoutButton" />
          <p className="text-xs text-gray-400 mt-2">Cart items are populated dynamically from the shop.</p>
        </>
      );
    }

    case 'productCategories': {
      return (
        <>
          <SelectInput
            label="Columns"
            propKey="columns"
            options={[
              { value: '2', label: '2 Columns' },
              { value: '3', label: '3 Columns' },
              { value: '4', label: '4 Columns' },
              { value: '5', label: '5 Columns' },
            ]}
          />
          <SelectInput
            label="Style"
            propKey="style"
            options={[
              { value: 'cards', label: 'Cards' },
              { value: 'overlay', label: 'Image Overlay' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
          <p className="text-xs text-gray-400 mt-2">Categories are managed in the shop settings.</p>
        </>
      );
    }

    case 'productFilter': {
      return (
        <>
          <CheckboxInput label="Show Price Range" propKey="showPriceRange" />
          <CheckboxInput label="Show Categories" propKey="showCategories" />
          <CheckboxInput label="Show Rating Filter" propKey="showRating" />
          <CheckboxInput label="Show Sort Options" propKey="showSort" />
          <NumberInput label="Min Price" propKey="priceMin" />
          <NumberInput label="Max Price" propKey="priceMax" />
        </>
      );
    }

    case 'checkoutSummary': {
      return (
        <>
          <CheckboxInput label="Show Items" propKey="showItems" />
          <CheckboxInput label="Show Coupon Field" propKey="showCoupon" />
          <p className="text-xs text-gray-400 mt-2">Order details are populated from the cart.</p>
        </>
      );
    }

    case 'saleBanner': {
      return (
        <>
          <TextInput label="Title" propKey="title" />
          <TextInput label="Subtitle" propKey="subtitle" />
          <TextInput label="Discount Text" propKey="discountText" />
          <TextInput label="Discount Code" propKey="discountCode" />
          <TextInput label="CTA Text" propKey="ctaText" />
          <TextInput label="CTA URL" propKey="ctaUrl" />
          <TextInput label="End Date (ISO)" propKey="endDate" />
          <SelectInput
            label="Style"
            propKey="style"
            options={[
              { value: 'full', label: 'Full Width' },
              { value: 'compact', label: 'Compact Bar' },
              { value: 'floating', label: 'Floating Card' },
            ]}
          />
          <TextInput label="Background Color" propKey="backgroundColor" />
        </>
      );
    }

    default:
      return <p className="text-gray-400 text-sm">No settings available</p>;
  }
}