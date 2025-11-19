import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'large', showTitle = true, className = '' }) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48 md:w-64 md:h-64'
  };

  const containerClasses = {
    small: 'mb-2',
    medium: 'mb-4',
    large: 'mb-6'
  };

  const titleClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl md:text-4xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} w-full animate-fade-in-down ${className}`}>
      {/* Logo Image Container */}
      <div className={`relative ${sizeClasses[size]} filter drop-shadow-2xl mb-2 transition-transform hover:scale-105 duration-500 ease-in-out`}>
        <img 
          src="https://drive.google.com/uc?export=view&id=1ZURLY67gGcsi0KKrEfnT0bqsorW1XWd8"
          alt="Brasão ECC - Encontro de Casais com Cristo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {showTitle && (
        <>
          <h1 className={`${titleClasses[size]} font-header font-bold text-ecc-blue uppercase tracking-widest text-center drop-shadow-sm`}>
            Pré-Cadastro
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-ecc-gold to-transparent mt-3 rounded-full opacity-80"></div>
        </>
      )}
    </div>
  );
};