import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
        success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-200',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-200',
        destructive: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
  success: <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
  destructive: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
  default: <Info className="h-5 w-5" />,
} as const;

interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof alertVariants> {
  /**
   * The variant of the alert
   * @default 'default'
   */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive';
  /**
   * Whether to show an icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;
  /**
   * Callback when the close button is clicked
   */
  onClose?: () => void;
  /**
   * Whether to show the close button
   * @default false
   */
  closable?: boolean;
  /**
   * The title of the alert
   */
  title?: React.ReactNode;
  /**
   * The description of the alert
   */
  description?: React.ReactNode;
  /**
   * Additional actions to display in the alert
   */
  actions?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      showIcon = true,
      icon,
      onClose,
      closable = false,
      title,
      description,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const displayIcon = showIcon ? (icon || iconMap[variant] || iconMap.default) : null;
    const hasHeader = title || description;
    const showCloseButton = closable && onClose;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {displayIcon && (
          <div className="absolute left-4 top-4">
            {displayIcon}
          </div>
        )}
        
        <div className={cn({
          'pl-7': displayIcon,
          'pr-7': showCloseButton,
        })}>
          {hasHeader ? (
            <>
              {title && (
                <h5 className="mb-1 font-medium leading-none tracking-tight">
                  {title}
                </h5>
              )}
              {description && (
                <div className="text-sm [&_p]:leading-relaxed">
                  {description}
                </div>
              )}
              {children}
            </>
          ) : (
            children
          )}
          
          {actions && (
            <div className="mt-3 flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground/70"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert, alertVariants };

/**
 * A simple alert component with predefined variants
 */
export const AlertInfo = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant'>
>((props, ref) => (
  <Alert ref={ref} variant="info" {...props} />
));
AlertInfo.displayName = 'AlertInfo';

/**
 * A success alert component
 */
export const AlertSuccess = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant'>
>((props, ref) => (
  <Alert ref={ref} variant="success" {...props} />
));
AlertSuccess.displayName = 'AlertSuccess';

/**
 * A warning alert component
 */
export const AlertWarning = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant'>
>((props, ref) => (
  <Alert ref={ref} variant="warning" {...props} />
));
AlertWarning.displayName = 'AlertWarning';

/**
 * A destructive alert component
 */
export const AlertDestructive = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant'>
>((props, ref) => (
  <Alert ref={ref} variant="destructive" {...props} />
));
AlertDestructive.displayName = 'AlertDestructive';
