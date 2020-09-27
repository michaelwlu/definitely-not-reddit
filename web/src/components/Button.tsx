import React, { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  text: string;
  variant: 'light' | 'teal';
  addClassName?: string;
  onClick?: () => void;
  isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = React.forwardRef(
  ({ text, addClassName, type, variant, onClick, isLoading = false }) => {
    const variants = {
      light:
        'text-black bg-gray-100 hover:bg-gray-200 focus:border-gray-300 active:bg-gray-300 focus:shadow-outline-gray',
      teal:
        'text-white bg-teal-500 hover:bg-teal-600 focus:border-teal-700 active:bg-teal-700 focus:shadow-outline-teal',
    };
    return (
      <button
        className={`flex items-center justify-center px-3 py-1 text-sm font-medium leading-6 whitespace-no-wrap transition duration-150 ease-in-out border border-transparent rounded-md focus:outline-none ${
          variants[variant]
        } ${addClassName ? addClassName : ''}`}
        type={type}
        onClick={onClick}
      >
        <svg
          className={`w-4 h-4 absolute ${
            isLoading ? 'visible animate-spin' : 'invisible'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <div className={isLoading ? 'invisible' : 'visible'}>{text}</div>
      </button>
    );
  }
);

export default Button;
