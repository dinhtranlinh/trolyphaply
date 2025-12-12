import React from 'react';

interface LegalDocCardProps {
  title: string;
  code: string;
  category: string;
  documentType: string;
  tags: string[];
  issuedDate?: string;
  effectiveDate?: string;
  status?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * LegalDocCard Component - Clean List Design
 * Giao diện tối giản, Mobile-first, phong cách hiện đại
 */
export default function LegalDocCard({
  title,
  code,
  category,
  documentType,
  tags,
  issuedDate,
  effectiveDate,
  status = 'active',
  onClick,
  className = '',
}: LegalDocCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div
      className={`group p-4 border-b border-gray-100 hover:bg-gray-50 active:bg-blue-50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Dòng 1: Meta-data (Loại văn bản • Số hiệu) */}
      <div className="flex items-center gap-2 mb-1">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
          {documentType}
        </span>
        <span className="text-xs text-gray-400">{code}</span>
      </div>
      
      {/* Dòng 2: Tiêu đề chính */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1.5 group-hover:text-blue-700 line-clamp-2">
        {title}
      </h3>
      
      {/* Dòng 3: Thông tin bổ trợ (Trạng thái • Ngày ban hành) */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${
          status === 'active' 
            ? 'text-green-600 bg-green-50' 
            : 'text-red-600 bg-red-50'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'active' ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          {status === 'active' ? 'Hiệu lực' : 'Hết hiệu lực'}
        </span>
        {issuedDate && <span>{formatDate(issuedDate)}</span>}
      </div>
    </div>
  );
}
