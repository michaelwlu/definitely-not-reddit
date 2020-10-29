import Link from 'next/link';
import React from 'react';

type NavLinkProps = {
  href: string;
  addClassName?: string;
  onClick?: any;
};

const NavLink: React.FC<NavLinkProps> = ({
  children,
  href,
  addClassName,
  onClick,
}) => {
  return (
    <Link href={href} passHref>
      <a
        onClick={onClick}
        className={`${addClassName} flex items-center tracking-wide justify-center whitespace-no-wrap font-semibold text-white transition duration-150 ease-in-out rounded-lg focus:outline-none hover:bg-orange-400 focus:bg-orange-400 px-2.5 py-1.5 text-sm leading-6 border-2 border-gray-200 focus:shadow-outline-orange`}
      >
        {children}
      </a>
    </Link>
  );
};

export default NavLink;
