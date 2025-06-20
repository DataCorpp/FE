import React, { forwardRef } from 'react';
import { motion, MotionProps, useTransform, useMotionValue } from 'framer-motion';

interface SafeMotionProps extends MotionProps {
  children: React.ReactNode;
}

/**
 * SafeMotion.div - A motion wrapper that ensures blur values never go negative
 * Automatically clamps blur values during animation interpolation
 */
export const SafeMotionDiv = forwardRef<HTMLDivElement, SafeMotionProps>(
  ({ style, ...props }, ref) => {
    // Transform function to ensure blur values are never negative
    const transformFilterSafety = (value: string) => {
      if (typeof value === 'string' && value.includes('blur(')) {
        // Extract blur value and ensure it's not negative
        const blurMatch = value.match(/blur\(([^)]+)\)/);
        if (blurMatch) {
          const blurValue = parseFloat(blurMatch[1]);
          if (blurValue < 0) {
            return value.replace(/blur\([^)]+\)/, 'blur(0px)');
          }
        }
      }
      return value;
    };

    const safeStyle = {
      ...style,
      filter: style?.filter ? transformFilterSafety(style.filter as string) : undefined,
    };

    return (
      <motion.div
        ref={ref}
        style={safeStyle}
        {...props}
      />
    );
  }
);

SafeMotionDiv.displayName = 'SafeMotionDiv';

/**
 * Higher-order component to add blur safety to any motion component
 */
export const withBlurSafety = <T extends React.ComponentType<any>>(Component: T) => {
  return forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const { style, variants, ...restProps } = props;

    // Process variants to ensure no negative blur values
    const safeVariants = variants ? Object.fromEntries(
      Object.entries(variants).map(([key, variant]) => {
        if (typeof variant === 'object' && variant.filter) {
          const safeFilter = typeof variant.filter === 'string' 
            ? variant.filter.replace(/blur\((-?\d*\.?\d+)px\)/g, (match, value) => {
                const numValue = parseFloat(value);
                return `blur(${Math.max(0, numValue)}px)`;
              })
            : variant.filter;
          
          return [key, { ...variant, filter: safeFilter }];
        }
        return [key, variant];
      })
    ) : undefined;

    // Process inline style
    const safeStyle = style?.filter 
      ? {
          ...style,
          filter: typeof style.filter === 'string'
            ? style.filter.replace(/blur\((-?\d*\.?\d+)px\)/g, (match, value) => {
                const numValue = parseFloat(value);
                return `blur(${Math.max(0, numValue)}px)`;
              })
            : style.filter
        }
      : style;

    return (
      <Component
        ref={ref}
        style={safeStyle}
        variants={safeVariants}
        {...restProps}
      />
    );
  });
};

// Create safe motion components
export const SafeMotion = {
  div: SafeMotionDiv,
  span: withBlurSafety(motion.span),
  article: withBlurSafety(motion.article),
  section: withBlurSafety(motion.section),
};

export default SafeMotion; 