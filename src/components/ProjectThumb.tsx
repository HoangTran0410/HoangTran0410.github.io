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
  // shot === null nghĩa là cố tình bỏ ảnh chụp, khác hẳn với shot === undefined
  // (chưa khai báo gì, cứ tìm theo slug).
  const src =
    project.shot === null
      ? null
      : (project.shot ?? (SHOT_SLUGS.includes(project.slug) ? `/shots/${project.slug}.webp` : null));

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

  // Không có ảnh thật thì dựng một tấm bìa: gradient tất định theo slug, phủ
  // tên dự án. Nhìn có chủ ý hơn hẳn một ô màu trống.
  return (
    <div
      data-fallback="gradient"
      role="img"
      aria-label={project.title}
      className={className}
      style={{
        aspectRatio: ratio,
        width: '100%',
        display: 'grid',
        alignContent: 'end',
        gap: '0.15em',
        padding: '6%',
        overflow: 'hidden',
        containerType: 'inline-size',
        background: gradientFor(project.slug, project.categoryMeta.accent),
      }}
    >
      <span
        aria-hidden
        style={{
          fontFamily: 'var(--font-meta)',
          fontSize: 'clamp(0.5rem, 1.5cqw, 0.7rem)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgb(255 255 255 / 0.72)',
        }}
      >
        {project.categoryMeta.label.en}
      </span>
      <span
        aria-hidden
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.15rem, 7cqw, 2.6rem)',
          lineHeight: 1.02,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#fff',
          textShadow: '0 1px 24px rgb(0 0 0 / 0.28)',
          textWrap: 'balance',
        }}
      >
        {project.title}
      </span>
    </div>
  );
}
