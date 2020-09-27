import React from 'react';
import NavBar from './NavBar';

interface LayoutProps {
  variant?: 'small' | 'regular';
}

const Layout: React.FC<LayoutProps> = ({ children, variant = 'regular' }) => {
  const variantClassNames = {
    small: 'max-w-md',
    regular: 'max-w-3xl',
  };

  return (
    <>
      <NavBar />
      <main
        className={`w-full mx-auto mt-8 mb-16 ${variantClassNames[variant]}`}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;
