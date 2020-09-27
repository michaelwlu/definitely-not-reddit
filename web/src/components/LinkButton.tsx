import React from 'react';
import Link from 'next/link';
import Button, { ButtonProps } from './Button';

type LinkButtonProps = ButtonProps & {
  href: string;
};

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  text,
  addClassName,
  type,
  variant,
  isLoading,
}) => {
  return (
    <Link href={href}>
      <Button
        text={text}
        addClassName={addClassName}
        variant={variant}
        type={type}
        isLoading={isLoading}
      />
    </Link>
  );
};

export default LinkButton;
