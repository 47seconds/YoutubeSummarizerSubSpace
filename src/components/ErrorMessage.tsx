import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="flex items-center space-x-2 p-4 text-sm text-red-700 bg-red-100 rounded-md">
      <AlertCircle className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}