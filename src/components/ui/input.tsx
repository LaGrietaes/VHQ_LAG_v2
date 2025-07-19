import React from 'react'

interface InputProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  className?: string
  disabled?: boolean
}

export function Input({ 
  value, 
  onChange, 
  onKeyPress,
  placeholder, 
  type = 'text',
  className = '',
  disabled = false 
}: InputProps) {
  const baseClasses = 'flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50'
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      className={`${baseClasses} ${className}`}
      disabled={disabled}
    />
  )
} 