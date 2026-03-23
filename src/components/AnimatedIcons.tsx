import React from 'react';
import { motion } from 'motion/react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
}

export const AnimatedChartIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor",
  accentColor = "#4fd1c5" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Axis */}
      <motion.path 
        d="M10 10V90H90" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Vertical Bars */}
      {[25, 45, 65, 85].map((x, i) => (
        <motion.line
          key={`bar-${i}`}
          x1={x}
          y1="90"
          x2={x}
          y2={[40, 60, 30, 50][i]}
          stroke={accentColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}

      {/* Connecting Lines */}
      <motion.path
        d="M25 40 L45 60 L65 30 L85 50"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nodes */}
      {[
        { x: 25, y: 40, targetY: 60 },
        { x: 45, y: 60, targetY: 30 },
        { x: 65, y: 30, targetY: 50 },
        { x: 85, y: 50, targetY: 20 }
      ].map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r="6"
          fill="white"
          stroke={color}
          strokeWidth="4"
        />
      ))}
    </svg>
  );
};

export const AnimatedWalletIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.path 
        d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15" 
      />
      <motion.path 
        d="M16 12h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2Z" 
      />
      <motion.circle 
        cx="18" 
        cy="14" 
        r="1" 
        fill={color}
      />
    </svg>
  );
};

export const AnimatedSendIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.line 
        x1="22" y1="2" x2="11" y2="13" 
      />
      <motion.polygon 
        points="22 2 15 22 11 13 2 9 22 2" 
      />
    </svg>
  );
};

export const AnimatedPlusIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.line 
        x1="12" y1="5" x2="12" y2="19" 
      />
      <motion.line 
        x1="5" y1="12" x2="19" y2="12" 
      />
    </svg>
  );
};

export const AnimatedCreditCardIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.rect 
        x="2" y="5" width="20" height="14" rx="2" 
      />
      <motion.line 
        x1="2" y1="10" x2="22" y2="10" 
      />
    </svg>
  );
};

export const AnimatedHistoryIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.path 
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" 
      />
      <motion.path 
        d="M3 3v5h5" 
      />
      <motion.path 
        d="M12 7v5l3 2" 
      />
    </svg>
  );
};

export const AnimatedDashboardIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.rect x="3" y="3" width="7" height="7" />
      <motion.rect x="14" y="3" width="7" height="7" />
      <motion.rect x="14" y="14" width="7" height="7" />
      <motion.rect x="3" y="14" width="7" height="7" />
    </svg>
  );
};

export const AnimatedTransferIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.path 
        d="m16 3 4 4-4 4" 
      />
      <motion.path 
        d="M4 7h16" 
      />
      <motion.path 
        d="m8 21-4-4 4-4" 
      />
      <motion.path 
        d="M20 17H4" 
      />
    </svg>
  );
};

export const AnimatedArrowUpRight: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.path 
        d="M7 17L17 7" 
      />
      <motion.path 
        d="M7 7h10v10" 
      />
    </svg>
  );
};

export const AnimatedArrowDownLeft: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <motion.path 
        d="M17 7L7 17" 
      />
      <motion.path 
        d="M17 17H7V7" 
      />
    </svg>
  );
};
