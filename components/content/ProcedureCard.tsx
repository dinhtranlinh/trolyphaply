import React from 'react';

interface ProcedureCardProps {
  title: string;
  category: string;
  difficulty: string;
  estimatedTime?: string;
  authority?: string;
  tags: string[];
  onClick?: () => void;
  className?: string;
}

/**
 * ProcedureCard Component - Clean List Design
 * Giao diện tối giản, Mobile-first, phong cách hiện đại
 */
export default function ProcedureCard({
  title,
  category,
  difficulty,
  estimatedTime,
  authority,
  tags,
  onClick,
  className = '',
}: ProcedureCardProps) {
  const difficultyColors = {
    easy: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Dễ' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'TB' },
    hard: { bg: 'bg-red-100', text: 'text-red-red-700', dot: 'bg-red-500', label: 'Khó' },
  };

  const difficultyConfig =
    difficultyColors[difficulty as keyof typeof difficultyColors] ||
    difficultyColors.medium;

  return (
    <div
      className={`group p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-blue-50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Dòng 1: Meta-data (Loại • Độ khó) */}
      <div className="flex items-center gap-2 mb-1">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
          Thủ tục
        </span>
        <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${difficultyConfig.bg} ${difficultyConfig.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${difficultyConfig.dot}`}></span>
          {difficultyConfig.label}
        </span>
      </div>
      
      {/* Dòng 2: Tiêu đề chính */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1.5 group-hover:text-blue-700 line-clamp-2">
        {title}
      </h3>
      
      {/* Dòng 3: Thông tin bổ trợ (Thời gian • Cơ quan) */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {estimatedTime && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {estimatedTime}
          </span>
        )}
        {authority && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {authority}
          </span>
        )}
      </div>
    </div>
  );
}
