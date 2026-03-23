import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

const WalletLogo: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M416 128H96C69.4903 128 48 149.49 48 176V336C48 362.51 69.4903 384 96 384H416C442.51 384 464 362.51 464 336V176C464 149.49 442.51 128 416 128Z" fill={color}/>
      <path d="M416 208H352C334.33 208 320 222.33 320 240V272C320 289.67 334.33 304 352 304H416C433.67 304 448 289.67 448 272V240C448 222.33 433.67 208 416 208Z" fill="white"/>
      <rect x="128" y="208" width="128" height="32" rx="16" fill="white"/>
      <circle cx="384" cy="256" r="16" fill={color}/>
    </svg>
  );
};

export default WalletLogo;
