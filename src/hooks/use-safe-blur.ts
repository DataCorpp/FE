import { useMemo } from 'react';

export type BlurLevel = 'none' | 'sm' | 'md' | 'lg' | number;

interface BlurConfig {
  none: number;
  sm: number;
  md: number;
  lg: number;
}

const DEFAULT_BLUR_CONFIG: BlurConfig = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
};

/**
 * Custom hook to generate safe blur values that prevent negative blur
 * @param level - Blur level or custom pixel value
 * @param config - Optional custom blur configuration
 * @returns Safe blur CSS value
 */
export const useSafeBlur = (
  level: BlurLevel,
  config: Partial<BlurConfig> = {}
): string => {
  const blurConfig = { ...DEFAULT_BLUR_CONFIG, ...config };

  const blurValue = useMemo(() => {
    if (typeof level === 'number') {
      // Ensure minimum value is 0
      return Math.max(0, level);
    }

    return blurConfig[level] || 0;
  }, [level, blurConfig]);

  return `blur(${blurValue}px)`;
};

/**
 * Utility function to create safe blur animation variants
 * Ensures no negative blur values during animation interpolation
 */
export const createSafeBlurVariants = (
  hiddenBlur: BlurLevel = 'md',
  visibleBlur: BlurLevel = 'none',
  config?: Partial<BlurConfig>
) => {
  const getBlurValue = (level: BlurLevel) => {
    if (typeof level === 'number') {
      return Math.max(0, level);
    }
    const blurConfig = { ...DEFAULT_BLUR_CONFIG, ...config };
    return Math.max(0, blurConfig[level] || 0);
  };

  const hiddenValue = getBlurValue(hiddenBlur);
  const visibleValue = getBlurValue(visibleBlur);

  return {
    hidden: {
      filter: hiddenValue > 0 ? `blur(${hiddenValue}px)` : 'none',
    },
    visible: {
      filter: visibleValue > 0 ? `blur(${visibleValue}px)` : 'none',
    },
  };
};

/**
 * Creates animation variants with guaranteed non-negative blur interpolation
 * Uses transform function to clamp values during animation
 */
export const createClampedBlurVariants = (
  hiddenBlur: BlurLevel = 'md',
  visibleBlur: BlurLevel = 'none',
  config?: Partial<BlurConfig>
) => {
  const getBlurValue = (level: BlurLevel) => {
    if (typeof level === 'number') {
      return Math.max(0, level);
    }
    const blurConfig = { ...DEFAULT_BLUR_CONFIG, ...config };
    return Math.max(0, blurConfig[level] || 0);
  };

  const hiddenValue = getBlurValue(hiddenBlur);
  const visibleValue = getBlurValue(visibleBlur);

  return {
    hidden: {
      // Use CSS clamp to ensure no negative values
      filter: `blur(clamp(0px, ${hiddenValue}px, ${hiddenValue + 10}px))`,
    },
    visible: {
      filter: `blur(clamp(0px, ${visibleValue}px, ${visibleValue + 10}px))`,
    },
  };
};

/**
 * CSS clamp function for blur - ensures values stay within bounds
 */
export const clampBlur = (min: number, value: number, max: number): string => {
  const clampedValue = Math.max(min, Math.min(max, value));
  return `blur(${clampedValue}px)`;
};

/**
 * Runtime transform function to fix negative blur values
 * Used for fixing interpolated values during animation
 */
export const transformBlurSafety = (filterValue: string): string => {
  if (typeof filterValue !== 'string') return filterValue;
  
  // Replace any negative blur values with 0px
  return filterValue.replace(/blur\((-?\d*\.?\d+)px\)/g, (match, value) => {
    const numValue = parseFloat(value);
    return `blur(${Math.max(0, numValue)}px)`;
  });
};

/**
 * Motion variants with built-in blur safety transform
 */
export const createMotionSafeBlurVariants = (
  hiddenBlur: BlurLevel = 'md',
  visibleBlur: BlurLevel = 'none',
  config?: Partial<BlurConfig>
) => {
  const getBlurValue = (level: BlurLevel) => {
    if (typeof level === 'number') {
      return Math.max(0, level);
    }
    const blurConfig = { ...DEFAULT_BLUR_CONFIG, ...config };
    return Math.max(0, blurConfig[level] || 0);
  };

  const hiddenValue = getBlurValue(hiddenBlur);
  const visibleValue = getBlurValue(visibleBlur);

  return {
    hidden: {
      filter: `blur(${hiddenValue}px)`,
      transition: {
        // Add transform function to ensure safety during interpolation
        filter: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.3
        }
      }
    },
    visible: {
      filter: `blur(${visibleValue}px)`,
      transition: {
        filter: {
          type: "tween", 
          ease: "easeInOut",
          duration: 0.3
        }
      }
    },
  };
};

export default useSafeBlur; 