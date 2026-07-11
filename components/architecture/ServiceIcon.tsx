'use client';

import { Icon } from '@iconify/react';
import { resolveIcon, IconSpec } from '@/lib/architecture/iconMap';

interface Props {
  /** Canonical service id (e.g. "postgres", "s3") — preferred */
  service?: string;
  /** Node type, used as a secondary hint */
  type?: string;
  /** Node label, used as a last-resort keyword source */
  label?: string;
  /** Pixel size of the glyph */
  size?: number;
  /** Pre-resolved spec (skips resolution when provided) */
  spec?: IconSpec;
  className?: string;
  /** Override tint for monochrome glyphs (e.g. white on a bold fill). Brand logos ignore it. */
  color?: string;
}

/**
 * Renders the brand logo (or clean generic glyph) for an architecture service
 * via Iconify. Monochrome `lucide:*` glyphs are tinted with the resolved accent;
 * full-colour `logos:*` brand icons render as-is.
 */
export default function ServiceIcon({ service, type, label, size = 18, spec, className, color }: Props) {
  const resolved = spec ?? resolveIcon({ service, type, label });
  return (
    <Icon
      icon={resolved.icon}
      width={size}
      height={size}
      className={className}
      // Brand logos are multi-colour and ignore `color`; generic glyphs inherit
      // the override when given, else the resolved accent.
      color={resolved.brand ? undefined : (color ?? resolved.accent)}
    />
  );
}
