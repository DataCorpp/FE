import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const AdminLoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'md',
  fullPage = false
}: AdminLoadingSpinnerProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Size classes for the spinner
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  // Container classes based on fullPage
  const containerClasses = fullPage 
    ? 'min-h-[80vh] flex items-center justify-center' 
    : 'flex items-center justify-center py-12';
  
  // Animation variants
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
  
  const fadeInVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3, 
        duration: 0.3 
      }
    }
  };
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <motion.div
          variants={spinnerVariants}
          animate="animate"
        >
          <Loader2 className={`text-primary ${sizeClasses[size]}`} />
        </motion.div>
        
        {message && (
          <motion.p
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            className={`mt-4 ${isDark ? 'text-white/80' : 'text-gray-700'} font-medium text-sm`}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default AdminLoadingSpinner; 