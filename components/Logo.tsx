import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/logo.jpeg" 
        alt="Glads Apartment Hotel"
        className="h-12 w-auto object-contain transition-all duration-300 hover:scale-105"
        style={{ filter: 'brightness(1.2) contrast(1.2)' }}
      />
    </div>
  );
};