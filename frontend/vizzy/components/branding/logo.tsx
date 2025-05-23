'use client';
import { cn } from '@/lib/utils/shadcn-merge';
import { JSX } from 'react';

interface LogoProps {
  /**
   * The width of the logo. Defaults to 50px if not provided.
   * @type {number}
   */
  width?: number;

  /**
   * Additional class names to apply to the container.
   * @type {string}
   */
  className?: string;
}

/**
 * Logo Component
 *
 * A simple reusable logo component that renders an SVG.
 * Automatically adapts to light/dark mode using shadcn theme.
 *
 * @param {LogoProps} props - The component's props.
 * @returns {JSX.Element} The rendered SVG logo.
 */
const Logo = ({ width = 50, className }: LogoProps): JSX.Element => {
  // If a custom color class is provided, use it
  // Otherwise, use text-primary in light mode and text-primary-foreground in dark mode
  // const logoColorClass = colorClass || 'text-primary dark:text-primary';

  return (
    <div
      className={cn('relative text-primary', className)}
      style={{ width: width, height: 'auto' }}
    >
      <svg
        className="w-full h-auto"
        viewBox="0 0 52 21"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13 1.72L8.14 16H4.84L0 1.72H3.06L5.74 10.22C5.79333 10.3667 5.86667 10.64 5.96 11.04C6.06667 11.4267 6.17333 11.84 6.28 12.28C6.38667 12.7067 6.46 13.0667 6.5 13.36C6.54 13.0667 6.60667 12.7067 6.7 12.28C6.80667 11.84 6.91333 11.4267 7.02 11.04C7.12667 10.64 7.2 10.3667 7.24 10.22L9.94 1.72H13ZM17.1078 5.08V16H14.0878V5.08H17.1078ZM15.6078 0.779999C16.0478 0.779999 16.4278 0.886666 16.7478 1.1C17.0811 1.3 17.2478 1.68667 17.2478 2.26C17.2478 2.80667 17.0811 3.18667 16.7478 3.4C16.4278 3.61333 16.0478 3.72 15.6078 3.72C15.1545 3.72 14.7678 3.61333 14.4478 3.4C14.1278 3.18667 13.9678 2.80667 13.9678 2.26C13.9678 1.68667 14.1278 1.3 14.4478 1.1C14.7678 0.886666 15.1545 0.779999 15.6078 0.779999ZM27.4244 16H18.7844V14.22L23.8244 7.38H19.0644V5.08H27.2444V7.02L22.3444 13.68H27.4244V16ZM36.8877 16H28.2477V14.22L33.2877 7.38H28.5277V5.08H36.7077V7.02L31.8077 13.68H36.8877V16ZM37.1109 5.08H40.2909L42.3509 11.32C42.4176 11.52 42.4776 11.7267 42.5309 11.94C42.5976 12.14 42.6509 12.3467 42.6909 12.56C42.7443 12.7733 42.7843 12.98 42.8109 13.18H42.8909C42.9309 12.9 42.9976 12.5933 43.0909 12.26C43.1976 11.9267 43.2976 11.6133 43.3909 11.32L45.4109 5.08H48.5309L44.0509 17C43.7576 17.8133 43.4043 18.5 42.9909 19.06C42.5909 19.6333 42.0976 20.0667 41.5109 20.36C40.9243 20.6533 40.1976 20.8 39.3309 20.8C38.9976 20.8 38.7043 20.78 38.4509 20.74C38.1976 20.7133 37.9843 20.68 37.8109 20.64V18.26C37.9576 18.2867 38.1309 18.3133 38.3309 18.34C38.5443 18.3667 38.7643 18.38 38.9909 18.38C39.4043 18.38 39.7509 18.2933 40.0309 18.12C40.3109 17.96 40.5443 17.74 40.7309 17.46C40.9176 17.1933 41.0776 16.8867 41.2109 16.54L41.4509 15.92L37.1109 5.08ZM48.4159 14.6C48.4159 13.9733 48.5826 13.54 48.9159 13.3C49.2626 13.0467 49.6759 12.92 50.1559 12.92C50.6226 12.92 51.0226 13.0467 51.3559 13.3C51.7026 13.54 51.8759 13.9733 51.8759 14.6C51.8759 15.1867 51.7026 15.6133 51.3559 15.88C51.0226 16.1333 50.6226 16.26 50.1559 16.26C49.6759 16.26 49.2626 16.1333 48.9159 15.88C48.5826 15.6133 48.4159 15.1867 48.4159 14.6Z" />
      </svg>
    </div>
  );
};

export default Logo;
