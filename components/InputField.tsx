import React from 'react';

interface InputFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  maxLength,
  multiline = false,
  disabled = false,
}) => {
  const baseClasses = `
    w-full px-4 py-3 rounded-lg border outline-none transition-all duration-200
    ${error 
      ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
      : 'border-gray-300 focus:border-ecc-blue focus:ring-2 focus:ring-blue-100 bg-white'
    }
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-2 font-body uppercase tracking-wide text-xs">
        {label} <span className="text-ecc-red">*</span>
      </label>
      
      {multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`${baseClasses} min-h-[100px] resize-y font-body shadow-sm`}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`${baseClasses} font-body shadow-sm`}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
        />
      )}
      
      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center font-bold animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
};