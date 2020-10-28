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
        className={`${addClassName} font-semibold text-white transition duration-150 ease-in-out rounded-lg focus:outline-none focus:text-orange-100 px-1 hover:text-orange-100`}
      >
        {children}
      </a>
    </Link>
  );
};

export default NavLink;
