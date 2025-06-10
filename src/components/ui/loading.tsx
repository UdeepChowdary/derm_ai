import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  /**
   * Additional class names to apply to the loading container
   */
  className?: string;
  /**
   * Size of the loading spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * Text to display below the loading spinner
   */
  text?: string;
  /**
   * Whether to show a full-screen overlay
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Whether to show a semi-transparent background
   * @default true
   */
  withBackground?: boolean;
  /**
   * Custom spinner component to use instead of the default
   */
  spinner?: React.ReactNode;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
  '2xl': 'h-16 w-16',
} as const;

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl',
} as const;

/**
 * A loading spinner component with optional text and full-screen overlay
 */
export function Loading({
  className,
  size = 'md',
  text,
  fullScreen = false,
  withBackground = true,
  spinner,
}: LoadingProps) {
  const spinnerElement = spinner || (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        sizeMap[size],
        text && 'mb-2'
      )}
    />
  );

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
    >
      {spinnerElement}
      {text && (
        <p
          className={cn(
            'text-muted-foreground text-center',
            textSizeMap[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          withBackground && 'bg-background/80 backdrop-blur-sm'
        )}
      >
        {content}
      </div>
    );
  }
  return content;
}

/**
 * A loading spinner that fills its container
 */
export function LoadingContainer({
  className,
  ...props
}: Omit<LoadingProps, 'fullScreen'>) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center', className)}>
      <Loading {...props} />
    </div>
  );
}

/**
 * A loading spinner that displays text below it
 */
export function LoadingWithText({
  text,
  className,
  ...props
}: Omit<LoadingProps, 'text'> & { text: string }) {
  return <Loading text={text} className={className} {...props} />;
}

/**
 * A loading spinner with a pulsing animation
 */
export function PulsingLoader({ className, ...props }: Omit<LoadingProps, 'spinner'>) {
  return (
    <Loading
      {...props}
      className={cn('animate-pulse', className)}
      spinner={
        <div
          className={cn(
            'rounded-full bg-primary/20',
            sizeMap[props.size || 'md']
          )}
        />
      }
    />
  );
}

/**
 * A loading spinner with dots animation
 */
export function DotsLoader({
  className,
  size = 'md',
  ...props
}: Omit<LoadingProps, 'spinner'>) {
  const dotSize = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  }[size];

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-muted-foreground rounded-full',
            dotSize,
            'animate-bounce',
            `animation-delay-${i * 100}`
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
