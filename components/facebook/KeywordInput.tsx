'use client';

import { useState, KeyboardEvent } from 'react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function KeywordInput({
  keywords,
  onChange,
  placeholder = 'Type keyword and press Enter',
  label = 'Keywords',
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword when backspace on empty input
      removeKeyword(keywords.length - 1);
    }
  };

  const addKeyword = () => {
    const keyword = inputValue.trim();
    
    if (!keyword) {
      return;
    }

    // Check for duplicates (case-insensitive)
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    if (lowerKeywords.includes(keyword.toLowerCase())) {
      setError('This keyword already exists');
      setTimeout(() => setError(''), 2000);
      return;
    }

    // Check length
    if (keyword.length < 2) {
      setError('Keyword must be at least 2 characters');
      setTimeout(() => setError(''), 2000);
      return;
    }

    if (keyword.length > 50) {
      setError('Keyword must be less than 50 characters');
      setTimeout(() => setError(''), 2000);
      return;
    }

    onChange([...keywords, keyword]);
    setInputValue('');
    setError('');
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    onChange(newKeywords);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="hover:text-blue-900 ml-1"
                title="Remove keyword"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addKeyword}
          placeholder={keywords.length === 0 ? placeholder : ''}
          className="w-full px-1 py-1 text-sm outline-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        💡 Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to add keyword. 
        Click <span className="font-medium">×</span> to remove.
      </p>

      {/* Keyword Count */}
      {keywords.length > 0 && (
        <p className="text-xs text-gray-600">
          {keywords.length} {keywords.length === 1 ? 'keyword' : 'keywords'} added
        </p>
      )}
    </div>
  );
}
