import React from 'react';
import NavBar from '../navbar/NavBar';
import Footer from './Footer';

interface LayoutProps {
  variant?: 'small' | 'regular';
  leftBump?: boolean;
  fullBleed?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  variant = 'regular',
  leftBump = false,
  fullBleed = false,
}) => {
  const variantClassNames = {
    small: 'max-w-xl',
    regular: 'max-w-3xl',
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <NavBar />
      <main
        className={`w-full sm:pr-6 lg:pr-0 mx-auto pb-28 ${
          variantClassNames[variant]
        } ${
          fullBleed
            ? 'pt-2 sm:pt-6 sm:pl-5'
            : leftBump
            ? 'pl-5 pr-4 pt-8'
            : 'px-4 pt-8'
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
