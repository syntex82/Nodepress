/**
 * Custom Tiptap Map Extension
 * Allows embedding Google Maps or OpenStreetMap in content
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface MapOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    map: {
      setMap: (options: {
        address?: string;
        lat?: number;
        lng?: number;
        zoom?: number;
        height?: number;
        mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
        provider?: 'google' | 'openstreetmap';
      }) => ReturnType;
    };
  }
}

export const Map = Node.create<MapOptions>({
  name: 'map',

  group: 'block',

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      address: {
        default: '',
      },
      lat: {
        default: 40.7128, // New York City
      },
      lng: {
        default: -74.006,
      },
      zoom: {
        default: 14,
      },
      height: {
        default: 400,
      },
      mapType: {
        default: 'roadmap',
      },
      provider: {
        default: 'openstreetmap',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="map"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { address, lat, lng, zoom, height, mapType, provider } = HTMLAttributes;

    // Generate iframe src based on provider
    let iframeSrc: string;
    if (provider === 'google') {
      // Google Maps embed (requires API key for production)
      const q = address || `${lat},${lng}`;
      iframeSrc = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=${zoom}&output=embed`;
    } else {
      // OpenStreetMap embed (free, no API key needed)
      const bbox = calculateBBox(lat, lng, zoom);
      iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    }

    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-type': 'map',
        'data-address': address,
        'data-lat': lat,
        'data-lng': lng,
        'data-zoom': zoom,
        'data-height': height,
        'data-map-type': mapType,
        'data-provider': provider,
        class: 'map-figure',
        style: 'margin: 1rem 0;',
      }),
      [
        'iframe',
        {
          src: iframeSrc,
          width: '100%',
          height: `${height}px`,
          style: 'border: 0; border-radius: 8px;',
          loading: 'lazy',
          allowfullscreen: '',
          referrerpolicy: 'no-referrer-when-downgrade',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setMap:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Helper function to calculate bounding box for OpenStreetMap
function calculateBBox(lat: number, lng: number, zoom: number): string {
  const offset = 0.01 * Math.pow(2, 14 - zoom);
  const minLng = lng - offset;
  const maxLng = lng + offset;
  const minLat = lat - offset * 0.6;
  const maxLat = lat + offset * 0.6;
  return `${minLng},${minLat},${maxLng},${maxLat}`;
}

