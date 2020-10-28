import React from 'react';

const Header: React.FC = ({ children }) => {
  return (
    <h1 className="mb-3 text-3xl font-semibold text-gray-400">{children}</h1>
  );
};

export default Header;
