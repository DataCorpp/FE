import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSafeBlur, BlurLevel } from '@/hooks/use-safe-blur';

interface SafeBlurWrapperProps extends HTMLAttributes<HTMLDivElement> {
  blur?: BlurLevel;
  as?: 'div' | 'span' | 'section' | 'article';
  animate?: boolean;
  motionProps?: MotionProps;
}

/**
 * SafeBlurWrapper - A wrapper component that ensures blur effects never go negative
 * Automatically handles blur values and provides fallbacks for unsupported browsers
 */
export const SafeBlurWrapper = forwardRef<HTMLDivElement, SafeBlurWrapperProps>(
  ({ 
    blur = 'none', 
    as: Component = 'div', 
    animate = false,
    motionProps,
    className, 
    style,
    children,
    ...props 
  }, ref) => {
    const safeBlurValue = useSafeBlur(blur);
    
    const combinedStyle = {
      ...style,
      filter: safeBlurValue,
      // Fallback for browsers that don't support CSS filter
      WebkitFilter: safeBlurValue,
    };

    const combinedClassName = cn(
      'blur-safe', // CSS class for additional safety
      className
    );

    if (animate && motionProps) {
      return (
        <motion.div
          ref={ref}
          className={combinedClassName}
          style={combinedStyle}
          {...motionProps}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    const TagComponent = Component as keyof JSX.IntrinsicElements;

    return (
      <TagComponent
        ref={ref}
        className={combinedClassName}
        style={combinedStyle}
        {...props}
      >
        {children}
      </TagComponent>
    );
  }
);

SafeBlurWrapper.displayName = 'SafeBlurWrapper';

export default SafeBlurWrapper; 