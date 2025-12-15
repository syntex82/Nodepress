/**
 * Custom Themes Service
 * Handles CRUD operations for user-created themes from Theme Designer
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as AdmZip from 'adm-zip';

export interface CustomThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    heading: string;
    link: string;
    linkHover: string;
    border: string;
    accent: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    lineHeight: number;
    headingWeight: number;
    h1Size?: number;
    h2Size?: number;
    h3Size?: number;
    h4Size?: number;
    h5Size?: number;
    h6Size?: number;
  };
  layout: {
    sidebarPosition: 'left' | 'right' | 'none';
    contentWidth: number;
    headerStyle: 'default' | 'centered' | 'minimal' | 'sticky';
    footerStyle: 'default' | 'centered' | 'minimal';
  };
  spacing: {
    sectionPadding: number;
    elementSpacing: number;
    containerPadding: number;
  };
  borders: {
    radius: number;
    width: number;
  };
  components?: {
    buttons?: {
      borderRadius?: number;
      padding?: string;
      fontWeight?: number;
    };
    cards?: {
      borderRadius?: number;
      shadow?: string;
      padding?: number;
    };
    forms?: {
      borderRadius?: number;
      borderWidth?: number;
      focusColor?: string;
    };
  };
  responsive?: {
    tablet?: Partial<CustomThemeSettings>;
    mobile?: Partial<CustomThemeSettings>;
  };
  darkMode?: Partial<CustomThemeSettings['colors']>;
}

export interface CreateCustomThemeDto {
  name: string;
  description?: string;
  settings: CustomThemeSettings;
  customCSS?: string;
  isDefault?: boolean;
}

export interface UpdateCustomThemeDto {
  name?: string;
  description?: string;
  settings?: CustomThemeSettings;
  customCSS?: string;
  isDefault?: boolean;
}

@Injectable()
export class CustomThemesService {
  private readonly themesDir: string;

  constructor(private prisma: PrismaService) {
    this.themesDir = path.join(process.cwd(), 'themes');
  }

  /**
   * Get all custom themes
   */
  async findAll(_userId?: string) {
    return this.prisma.customTheme.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Get custom theme by ID
   */
  async findById(id: string) {
    const theme = await this.prisma.customTheme.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!theme) {
      throw new NotFoundException('Custom theme not found');
    }

    return theme;
  }

  /**
   * Get active custom theme
   */
  async getActiveTheme() {
    return this.prisma.customTheme.findFirst({
      where: { isActive: true },
    });
  }

  /**
   * Create a new custom theme
   */
  async create(dto: CreateCustomThemeDto, userId: string) {
    // Check for duplicate name
    const existing = await this.prisma.customTheme.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Theme with name "${dto.name}" already exists`);
    }

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.customTheme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.customTheme.create({
      data: {
        name: dto.name,
        description: dto.description,
        settings: dto.settings as any,
        customCSS: dto.customCSS,
        isDefault: dto.isDefault || false,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Update a custom theme
   */
  async update(id: string, dto: UpdateCustomThemeDto) {
    const theme = await this.findById(id);

    // Check for duplicate name if changing
    if (dto.name && dto.name !== theme.name) {
      const existing = await this.prisma.customTheme.findUnique({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(`Theme with name "${dto.name}" already exists`);
      }
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.customTheme.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.customTheme.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.settings && { settings: dto.settings as any }),
        ...(dto.customCSS !== undefined && { customCSS: dto.customCSS }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Delete a custom theme
   */
  async delete(id: string) {
    const theme = await this.findById(id);

    if (theme.isActive) {
      throw new BadRequestException(
        'Cannot delete the active theme. Please activate another theme first.',
      );
    }

    return this.prisma.customTheme.delete({
      where: { id },
    });
  }

  /**
   * Duplicate a custom theme
   */
  async duplicate(id: string, userId: string, newName?: string) {
    const theme = await this.findById(id);

    // Generate unique name
    let name = newName || `${theme.name} (Copy)`;
    let counter = 1;
    while (await this.prisma.customTheme.findUnique({ where: { name } })) {
      name = newName ? `${newName} (${counter})` : `${theme.name} (Copy ${counter})`;
      counter++;
    }

    return this.prisma.customTheme.create({
      data: {
        name,
        description: theme.description,
        settings: theme.settings as any,
        customCSS: theme.customCSS,
        isDefault: false,
        isActive: false,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Activate a custom theme
   */
  async activate(id: string) {
    await this.findById(id);

    // Deactivate all custom themes
    await this.prisma.customTheme.updateMany({
      data: { isActive: false },
    });

    return this.prisma.customTheme.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Export theme as JSON
   */
  async exportTheme(id: string) {
    const theme = await this.findById(id);
    return {
      name: theme.name,
      description: theme.description,
      settings: theme.settings,
      customCSS: theme.customCSS,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
  }

  /**
   * Import theme from JSON
   */
  async importTheme(data: any, userId: string) {
    if (!data.name || !data.settings) {
      throw new BadRequestException('Invalid theme data: missing name or settings');
    }

    // Generate unique name if exists
    let name = data.name;
    let counter = 1;
    while (await this.prisma.customTheme.findUnique({ where: { name } })) {
      name = `${data.name} (Imported ${counter})`;
      counter++;
    }

    return this.prisma.customTheme.create({
      data: {
        name,
        description: data.description,
        settings: data.settings,
        customCSS: data.customCSS,
        isDefault: false,
        isActive: false,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Generate CSS from theme settings
   */
  generateCSS(settings: CustomThemeSettings, customCSS?: string): string {
    const { colors, typography, layout, spacing, borders } = settings;

    let css = `/* Generated Theme CSS */
:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-background: ${colors.background};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
  --color-text-muted: ${colors.textMuted};
  --color-heading: ${colors.heading};
  --color-link: ${colors.link};
  --color-link-hover: ${colors.linkHover};
  --color-border: ${colors.border};
  --color-accent: ${colors.accent};
  ${colors.success ? `--color-success: ${colors.success};` : ''}
  ${colors.warning ? `--color-warning: ${colors.warning};` : ''}
  ${colors.error ? `--color-error: ${colors.error};` : ''}

  /* Typography */
  --font-heading: ${typography.headingFont}, system-ui, sans-serif;
  --font-body: ${typography.bodyFont}, system-ui, sans-serif;
  --font-size-base: ${typography.baseFontSize}px;
  --line-height: ${typography.lineHeight};
  --heading-weight: ${typography.headingWeight};

  /* Layout */
  --content-width: ${layout.contentWidth}px;

  /* Spacing */
  --section-padding: ${spacing.sectionPadding}px;
  --element-spacing: ${spacing.elementSpacing}px;
  --container-padding: ${spacing.containerPadding}px;

  /* Borders */
  --border-radius: ${borders.radius}px;
  --border-width: ${borders.width}px;
}
`;

    if (customCSS) {
      css += `\n/* Custom CSS */\n${customCSS}`;
    }

    return css;
  }

  /**
   * Install custom theme as a full theme (creates actual theme files)
   */
  async installTheme(id: string) {
    const theme = await this.findById(id);
    const settings = theme.settings as unknown as CustomThemeSettings;

    // Create slug from name
    const slug = theme.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if theme already exists in installed themes
    const existingTheme = await this.prisma.theme.findUnique({
      where: { slug },
    });
    if (existingTheme) {
      throw new BadRequestException(
        `Theme "${slug}" already exists in installed themes. Please rename the theme first.`,
      );
    }

    const themePath = path.join(this.themesDir, slug);

    try {
      // Create theme directory structure
      await fs.mkdir(themePath, { recursive: true });
      await fs.mkdir(path.join(themePath, 'templates'), { recursive: true });
      await fs.mkdir(path.join(themePath, 'assets'), { recursive: true });
      await fs.mkdir(path.join(themePath, 'assets', 'css'), { recursive: true });

      // Generate theme.json
      const themeJson = {
        name: theme.name,
        version: '1.0.0',
        author: 'Theme Designer',
        description: theme.description || `Custom theme created with Theme Designer`,
        thumbnail: `/themes/${slug}/screenshot.png`,
        designConfig: settings,
      };
      await fs.writeFile(path.join(themePath, 'theme.json'), JSON.stringify(themeJson, null, 2));

      // Generate CSS
      const cssContent = this.generateCSS(settings, theme.customCSS || undefined);
      await fs.writeFile(path.join(themePath, 'assets', 'css', 'style.css'), cssContent);

      // Generate basic templates
      const templates = this.generateTemplates(theme.name, settings, slug);
      for (const [name, content] of Object.entries(templates)) {
        await fs.writeFile(path.join(themePath, 'templates', `${name}.hbs`), content);
      }

      // Generate screenshot placeholder
      await this.generateScreenshot(themePath, settings);

      // Register theme in database
      const installedTheme = await this.prisma.theme.create({
        data: {
          name: theme.name,
          slug,
          version: '1.0.0',
          author: 'Theme Designer',
          description: theme.description || `Custom theme created with Theme Designer`,
          thumbnail: `/themes/${slug}/screenshot.png`,
          path: `/themes/${slug}`,
          config: JSON.parse(JSON.stringify(themeJson)),
        },
      });

      return installedTheme;
    } catch (error) {
      // Clean up on failure
      try {
        await fs.rm(themePath, { recursive: true, force: true });
      } catch {}

      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error installing theme:', error);
      throw new BadRequestException('Failed to install theme: ' + error.message);
    }
  }

  /**
   * Export theme as ZIP file
   */
  async exportAsZip(id: string): Promise<Buffer> {
    const theme = await this.findById(id);
    const settings = theme.settings as unknown as CustomThemeSettings;

    const slug = theme.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const zip = new AdmZip();

    // Generate theme.json
    const themeJson = {
      name: theme.name,
      version: '1.0.0',
      author: 'Theme Designer',
      description: theme.description || `Custom theme created with Theme Designer`,
      thumbnail: `/themes/${slug}/screenshot.png`,
      designConfig: settings,
    };
    zip.addFile(`${slug}/theme.json`, Buffer.from(JSON.stringify(themeJson, null, 2)));

    // Generate CSS
    const cssContent = this.generateCSS(settings, theme.customCSS || undefined);
    zip.addFile(`${slug}/assets/css/style.css`, Buffer.from(cssContent));

    // Generate templates
    const templates = this.generateTemplates(theme.name, settings, slug);
    for (const [name, content] of Object.entries(templates)) {
      zip.addFile(`${slug}/templates/${name}.hbs`, Buffer.from(content));
    }

    // Generate SVG screenshot
    const screenshotSvg = this.generateScreenshotSVG(settings);
    zip.addFile(`${slug}/screenshot.svg`, Buffer.from(screenshotSvg));

    return zip.toBuffer();
  }

  /**
   * Generate basic Handlebars templates
   */
  private generateTemplates(themeName: string, settings: CustomThemeSettings, slug: string): Record<string, string> {
    const { colors, typography } = settings;

    const header = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{#if post}}{{post.title}} - {{/if}}{{site.name}}</title>
  <meta name="description" content="{{#if post}}{{post.excerpt}}{{else}}{{site.description}}{{/if}}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${typography.headingFont.replace(/ /g, '+')}:wght@400;500;600;700&family=${typography.bodyFont.replace(/ /g, '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/themes/${slug}/assets/css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <div class="nav-wrapper">
        <a href="/" class="logo">{{site.name}}</a>
        <div class="nav-menu">
          {{#if menus.header}}
            {{#each menus.header.items}}
              <a href="{{this.url}}" class="nav-link" target="{{this.target}}">{{this.label}}</a>
            {{/each}}
          {{else}}
            <a href="/" class="nav-link">Home</a>
            <a href="/blog" class="nav-link">Blog</a>
          {{/if}}
        </div>
      </div>
    </div>
  </nav>
  <main class="main-content">
`;

    const footer = `  </main>
  <footer class="site-footer">
    <div class="container">
      <p>&copy; {{year}} {{site.name}}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
`;

    const home = `{{> header}}
<section class="hero">
  <div class="container">
    <h1>Welcome to {{site.name}}</h1>
    <p>{{site.description}}</p>
  </div>
</section>
<section class="posts-section">
  <div class="container">
    <h2>Latest Posts</h2>
    <div class="posts-grid">
      {{#each posts}}
      <article class="post-card">
        {{#if this.featuredImage}}
        <img src="{{this.featuredImage}}" alt="{{this.title}}" class="post-image">
        {{/if}}
        <div class="post-content">
          <h3><a href="/{{this.slug}}">{{this.title}}</a></h3>
          <p>{{this.excerpt}}</p>
        </div>
      </article>
      {{/each}}
    </div>
  </div>
</section>
{{> footer}}
`;

    const post = `{{> header}}
<article class="single-post">
  <div class="container">
    {{#if post.featuredImage}}
    <img src="{{post.featuredImage}}" alt="{{post.title}}" class="featured-image">
    {{/if}}
    <h1>{{post.title}}</h1>
    <div class="post-meta">
      <span>By {{post.author.name}}</span>
      <span>{{formatDate post.publishedAt}}</span>
    </div>
    <div class="post-body">
      {{{post.content}}}
    </div>
  </div>
</article>
{{> footer}}
`;

    const page = `{{> header}}
<div class="page-content">
  <div class="container">
    <h1>{{page.title}}</h1>
    <div class="page-body">
      {{{page.content}}}
    </div>
  </div>
</div>
{{> footer}}
`;

    return { header, footer, home, post, page };
  }

  /**
   * Generate screenshot placeholder
   */
  private async generateScreenshot(themePath: string, settings: CustomThemeSettings) {
    const svg = this.generateScreenshotSVG(settings);
    await fs.writeFile(path.join(themePath, 'screenshot.svg'), svg);
    // Also create a simple PNG placeholder message
    await fs.writeFile(path.join(themePath, 'screenshot.png'), Buffer.from(''));
  }

  /**
   * Generate SVG screenshot
   */
  private generateScreenshotSVG(settings: CustomThemeSettings): string {
    const { colors } = settings;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="${colors.background}"/>
  <rect y="0" width="1200" height="60" fill="${colors.surface}"/>
  <text x="30" y="40" font-family="system-ui" font-size="24" font-weight="bold" fill="${colors.primary}">Theme Preview</text>
  <rect x="100" y="150" width="1000" height="400" rx="8" fill="${colors.surface}" stroke="${colors.border}"/>
  <text x="600" y="350" text-anchor="middle" font-family="system-ui" font-size="48" font-weight="bold" fill="${colors.heading}">Custom Theme</text>
  <text x="600" y="420" text-anchor="middle" font-family="system-ui" font-size="24" fill="${colors.textMuted}">Created with Theme Designer</text>
  <rect x="500" y="480" width="200" height="50" rx="8" fill="${colors.primary}"/>
  <text x="600" y="512" text-anchor="middle" font-family="system-ui" font-size="18" fill="#ffffff">Get Started</text>
</svg>`;
  }
}
