import React, { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  addClassName?: string;
  onClick?: () => void;
  isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = React.forwardRef(
  ({ children, addClassName, type, onClick, isLoading = false }, ref) => {
    return (
      <button
        className={`flex items-center justify-center sm:px-4 sm:py-1 px-5 py-2 text-lg sm:text-base leading-7 font-medium whitespace-no-wrap transition duration-150 ease-in-out border border-transparent rounded-md focus:outline-none text-white bg-teal-500 hover:bg-teal-600 focus:border-teal-700 active:bg-teal-700 focus:shadow-outline-teal ${
          addClassName ? addClassName : ''
        }`}
        type={type}
        onClick={onClick}
      >
        <LoadingSpinner isLoading={isLoading} />
        <div className={isLoading ? 'invisible' : 'visible'}>{children}</div>
      </button>
    );
  }
);

export default Button;
