import Link from 'next/link';
import React from 'react';

type NavLinkProps = {
  text: string;
  href: string;
  addClassName?: string;
  onClick?: any;
};

const NavLink: React.FC<NavLinkProps> = ({
  text,
  href,
  addClassName,
  onClick,
}) => {
  return (
    <Link href={href} passHref>
      <a
        onClick={onClick}
        className={`font-medium text-white transition duration-150 ease-in-out hover:text-orange-200 rounded-lg focus:outline-none focus:shadow-outline-orange px-1 ${addClassName}`}
      >
        {text}
      </a>
    </Link>
  );
};

export default NavLink;
