# Safe Blur Implementation Guide

## Vấn đề

Lỗi `Invalid keyframe value for property filter: blur(-0.00014px)` xảy ra khi Framer Motion interpolate giữa các blur values và tạo ra giá trị âm trong quá trình animation.

## Giải pháp

### 1. Safe Blur Hook

```typescript
import { createClampedBlurVariants } from '@/hooks/use-safe-blur';

// Sử dụng clamped variants thay vì safe variants
const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 32, 
    scale: 0.94,
    ...createClampedBlurVariants('md', 'none').hidden
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    ...createClampedBlurVariants('md', 'none').visible,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
      mass: 0.9,
      duration: 0.8,
      // Ngăn chặn overshoot
      restDelta: 0.001,
      restSpeed: 0.001
    }
  }
};
```

### 2. CSS Clamp Approach

```css
/* Sử dụng CSS clamp để đảm bảo giá trị >= 0 */
.safe-blur {
  filter: blur(clamp(0px, var(--blur-value), 20px));
}
```

### 3. Runtime Transform

```typescript
import { transformBlurSafety } from '@/hooks/use-safe-blur';

// Transform runtime values
const safeFilterValue = transformBlurSafety(motionValue);
```

### 4. Safe Motion Components

```typescript
import { SafeMotion } from '@/components/ui/SafeMotion';

// Sử dụng SafeMotion thay vì motion trực tiếp
<SafeMotion.div
  variants={blurVariants}
  initial="hidden"
  animate="visible"
>
  Content here
</SafeMotion.div>
```

## Best Practices

### 1. Animation Configuration

```typescript
// Sử dụng transition config để ngăn chặn overshoot
transition: {
  type: "spring",
  stiffness: 260,
  damping: 22,
  mass: 0.9,
  duration: 0.8,
  // Quan trọng: Ngăn chặn overshoot
  restDelta: 0.001,
  restSpeed: 0.001
}
```

### 2. Explicit Filter Values

```typescript
// Luôn set explicit filter values cho hover states
hover: {
  y: -12,
  scale: 1.03,
  filter: "blur(0px)", // Explicit zero value
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 18,
    mass: 0.6
  }
}
```

### 3. Blur Level Hierarchy

```typescript
// Sử dụng blur levels có sẵn
const BLUR_LEVELS = {
  none: 0,    // blur(0px)
  sm: 2,      // blur(2px)  
  md: 4,      // blur(4px)
  lg: 8,      // blur(8px)
}
```

## Implementation

### Files Updated:

1. **FE/src/hooks/use-safe-blur.ts**
   - `createClampedBlurVariants()` - Sử dụng CSS clamp
   - `transformBlurSafety()` - Runtime transform
   - `createMotionSafeBlurVariants()` - Motion-specific variants

2. **FE/src/components/ui/SafeMotion.tsx**  
   - `SafeMotion.div` - Wrapper với blur safety
   - `withBlurSafety()` - HOC để add safety

3. **FE/src/styles/globals.css**
   - CSS clamp utilities
   - Safe animation keyframes
   - Fallback cho browsers không support

4. **FE/src/pages/Manufacturers.tsx**
   - Updated animation variants
   - Added transition safety config

5. **FE/src/components/ManufacturerCard.tsx**
   - Updated animation variants  
   - Added explicit filter values

## Testing

```typescript
// Test các edge cases
const testBlurValues = [-5, -0.1, 0, 2, 4, 8];
testBlurValues.forEach(value => {
  const safe = Math.max(0, value);
  console.log(`${value}px -> ${safe}px`);
});
```

## Browser Support

- **Modern browsers**: Sử dụng CSS `clamp()` và `max()`
- **Legacy browsers**: Fallback với JavaScript transform
- **All browsers**: Explicit animation configs để ngăn chặn overshoot

## Monitoring

```typescript
// Add logging để track negative values
const originalFilter = element.style.filter;
if (originalFilter.includes('blur(-')) {
  console.warn('Negative blur detected:', originalFilter);
}
``` 