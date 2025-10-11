export interface IFixed extends React.ComponentPropsWithoutRef<'div'> {
  variant: 'full' | 'mobile' | 'desktop';
  className?: string;
}

export const Fixed: React.FC<IFixed> = ({ children, variant, className }) => {
  return <div className={`c-fixed--${variant} ${className}`}>{children}</div>;
};

Fixed.displayName = 'Fixed';
