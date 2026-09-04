import { useState } from 'react';
import { SHOT_SLUGS } from '../data/shots.generated';
import { gradientFor } from '../lib/gradient';
import type { Project } from '../data/types';

interface Props {
  project: Project;
  /** Tỉ lệ khung, mặc định 8/5 giống ảnh chụp màn hình 1280×800. */
  ratio?: string;
  className?: string;
  /** Ảnh đầu màn hình nên tải sớm; ảnh trong danh sách thì lazy. */
  eager?: boolean;
}

const W = 1280;
const H = 800;

export function ProjectThumb({ project, ratio = '8 / 5', className, eager }: Props) {
  const [failed, setFailed] = useState(false);
  const src = project.shot ?? (SHOT_SLUGS.includes(project.slug) ? `/shots/${project.slug}.webp` : null);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={project.title}
        width={W}
        height={H}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        style={{ aspectRatio: ratio, objectFit: 'cover', width: '100%', height: 'auto' }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      data-fallback="gradient"
      role="img"
      aria-label={project.title}
      className={className}
      style={{
        aspectRatio: ratio,
        width: '100%',
        background: gradientFor(project.slug, project.categoryMeta.accent),
      }}
    />
  );
}
