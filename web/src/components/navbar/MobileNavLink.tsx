import Link from 'next/link';
import React from 'react';

type MobileNavLinkProps = {
  href: string;
  addClassName?: string;
  onClick?: any;
};

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  children,
  href,
  addClassName,
  onClick,
}) => {
  return (
    <Link href={href} passHref>
      <a
        onClick={onClick}
        className={
          'block py-2 pl-5 text-lg font-medium text-white transition duration-75 ease-in-out border-t border-opacity-50 focus:outline-none focus:bg-orange-800 hover:bg-orange-800 focus:bg-opacity-25 hover:bg-opacity-25 border-gray-50' +
          ' ' +
          addClassName
        }
      >
        {children}
      </a>
    </Link>
  );
};

export default MobileNavLink;
