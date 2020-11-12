import React from 'react';

interface UsernameIconProps {
  username: string;
}

const UsernameIcon: React.FC<UsernameIconProps> = ({ username }) => {
  return (
    <div className="flex items-center justify-center text-base font-medium text-white bg-gray-400 border-2 border-gray-200 rounded-full w-9 h-9">
      {username[0].toUpperCase()}
    </div>
  );
};

export default UsernameIcon;
