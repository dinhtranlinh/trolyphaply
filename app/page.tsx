'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import TextArea from '@/components/forms/TextArea';
import Chip from '@/components/ui/Chip';
import Card from '@/components/ui/Card';
import { MagnifyingGlassIcon, ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Home Page - Legal Q&A Hub
 * Trang chủ với chức năng hỏi đáp pháp luật
 */

interface StyleGuide {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [styleGuides, setStyleGuides] = useState<StyleGuide[]>([]);
  const [selectedStyleGuideId, setSelectedStyleGuideId] = useState<string>('');

  // Fetch style guides on mount
  useEffect(() => {
    const fetchStyleGuides = async () => {
      try {
        const response = await fetch('/api/style-guides');
        if (response.ok) {
          const data = await response.json();
          setStyleGuides(data.data || []);
          // Auto-select default style guide
          const defaultGuide = data.data?.find((sg: StyleGuide) => sg.is_default);
          if (defaultGuide) {
            setSelectedStyleGuideId(defaultGuide.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch style guides:', err);
      }
    };

    fetchStyleGuides();
  }, []);

  // Suggested question chips
  const suggestionChips = [
    'Thủ tục dân sự',
    'Thuế & Doanh nghiệp',
    'Hộ khẩu & Cư trú',
    'Phạt hành chính',
    'Đất đai',
    'Lao động',
  ];

  // Popular questions
  const popularQuestions = [
    'Thủ tục đăng ký kết hôn cần những giấy tờ gì?',
    'Cách tính thuế thu nhập cá nhân năm 2026?',
    'Thời gian làm việc tối đa theo luật lao động?',
    'Thủ tục chuyển hộ khẩu nội tỉnh như thế nào?',
    'Mức phạt vi phạm giao thông không đội mũ bảo hiểm?',
  ];

  // Quick access links
  const quickLinks = [
    { icon: '📋', label: 'Thủ tục', href: '/law?tab=procedures' },
    { icon: '📚', label: 'Văn bản', href: '/law?tab=documents' },
    { icon: '💡', label: 'Câu hỏi mẫu', href: '/prompts' },
    { icon: '🎲', label: 'Ứng dụng AI', href: '/apps' },
  ];

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          styleGuideId: selectedStyleGuideId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể lấy câu trả lời');
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      setError('Không thể lấy câu trả lời. Vui lòng thử lại sau.');
      console.error('Q&A Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(`Tôi muốn hỏi về ${suggestion.toLowerCase()}`);
  };

  const handleQuestionClick = (q: string) => {
    setQuestion(q);
  };

  return (
    <AppShell showHeader={true} showBottomNav={true}>
      {/* Content Container - Max Width 760px Centered with semi-transparent gradient */}
      <div className="max-w-[760px] mx-auto px-4 py-10 space-y-10 min-h-screen" style={{
        background: 'linear-gradient(180deg, rgba(249, 251, 255, 0.92) 0%, rgba(238, 242, 248, 0.92) 100%)',
        opacity: 0.75
      }}>
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            {/* Title with Icon */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 text-[#1F4FB2]">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254v11.505a20.01 20.01 0 013.78.501.75.75 0 11-.339 1.462A18.558 18.558 0 0010 17.5c-1.442 0-2.845.165-4.191.477a.75.75 0 01-.338-1.462 20.01 20.01 0 013.779-.501V4.509c-1.129.026-2.243.112-3.34.254l1.771 7.85a.75.75 0 01-.387.83A4.98 4.98 0 015 14a4.98 4.98 0 01-2.294-.556.75.75 0 01-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232a.75.75 0 01-.336-1.462 33.19 33.19 0 016.668-.829V2.75A.75.75 0 0110 2zM5 7.543L3.92 12.33a3.499 3.499 0 002.16 0L5 7.543zm10 0l-1.08 4.787a3.498 3.498 0 002.16 0L15 7.543z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-[32px] font-bold text-[#1A2B49]">
                Hỏi về Pháp Luật & Thủ Tục
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base text-[#7D8DA6] max-w-[640px] mx-auto">
              Tư vấn nhanh, không thay thế dịch vụ pháp lý chính thức
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#EEF1F4] p-6 space-y-4">
            
            {/* Textarea Input */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn về pháp luật, thủ tục hành chính…"
                  maxLength={1000}
                  rows={6}
                  className="w-full bg-[#F9FAFC] border border-[#D6DFEA] rounded-xl px-[14px] py-3 text-sm text-[#1A2B49] placeholder:text-[#8897AC] focus:outline-none focus:border-[#1F4FB2] focus:ring-2 focus:ring-[#1F4FB2]/10 transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-[#8897AC]">
                  {question.length}/1000
                </div>
              </div>
            </div>

            {/* Style Guide Selector */}
            {styleGuides.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="style-guide" className="text-xs font-medium text-[#44536E]">
                  Phong cách trả lời
                </label>
                <select
                  id="style-guide"
                  value={selectedStyleGuideId}
                  onChange={(e) => setSelectedStyleGuideId(e.target.value)}
                  className="w-full h-10 bg-[#F9FAFC] border border-[#D6DFEA] rounded-xl px-[14px] text-sm text-[#1A2B49] focus:outline-none focus:border-[#1F4FB2] focus:ring-2 focus:ring-[#1F4FB2]/10 transition-all"
                >
                  {styleGuides.map((sg) => (
                    <option key={sg.id} value={sg.id}>
                      {sg.name} {sg.is_default ? '(Mặc định)' : ''}
                    </option>
                  ))}
                </select>
                {styleGuides.find(sg => sg.id === selectedStyleGuideId)?.description && (
                  <p className="text-xs text-[#7D8DA6]">
                    {styleGuides.find(sg => sg.id === selectedStyleGuideId)?.description}
                  </p>
                )}
              </div>
            )}

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSuggestionClick(chip)}
                  className="h-8 px-[14px] rounded-full bg-[#F3F5F9] border border-[#D6DFEA] text-sm font-medium text-[#44536E] hover:bg-[#E8F0FF] hover:border-[#B2D4FF] hover:text-[#1F4FB2] transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Button Row */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs font-medium text-[#8897AC]">
                AI hỗ trợ • Beta
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || loading}
                className="h-12 min-w-[160px] px-5 rounded-xl bg-gradient-to-r from-[#F0CD71] to-[#E9C35A] shadow-[0_4px_10px_rgba(0,0,0,0.08)] text-[#1A2B49] font-semibold text-base hover:brightness-105 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Đang xử lý...' : (
                  <>
                    Hỏi ngay
                    <ArrowRightIcon className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-4 mt-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Answer Display */}
            {answer && (
              <div className="mt-6 pt-6 border-t border-[#EEF1F4]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1F4FB2] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-3 text-[#1F4FB2]">
                      Câu trả lời
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none text-[#1A2B49]"
                      dangerouslySetInnerHTML={{ 
                        __html: answer
                          .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.+?)\*/g, '<em>$1</em>')
                          .replace(/\n\n/g, '</p><p class="mt-3">')
                          .replace(/\n/g, '<br/>')
                          .replace(/^(.+)$/, '<p>$1</p>')
                      }}
                    />
                    <div className="mt-4 pt-3 border-t border-[#EEF1F4]">
                      <p className="text-xs text-[#7D8DA6]">
                        ⚠️ Thông tin mang tính tham khảo. Vui lòng tham khảo ý kiến chuyên gia pháp lý cho các vấn đề quan trọng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Popular Questions Section */}
          {!answer && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[20px] font-semibold text-[#1A2B49] mb-1">
                  Câu hỏi phổ biến
                </h2>
                <p className="text-sm text-[#7D8DA6]">
                  Một số câu hỏi thường gặp về thủ tục và quy định
                </p>
              </div>
              
              <div className="space-y-2">
                {popularQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(q)}
                    className="w-full h-14 px-4 bg-white rounded-xl border border-[#EEF1F4] hover:bg-[#F9FBFF] hover:border-[#D6DFEA] transition-all group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="w-5 h-5 rounded-full bg-[#FFF8E6] flex items-center justify-center shrink-0">
                        <span className="text-[#E9C35A] text-sm font-bold">?</span>
                      </div>
                      <span className="text-[15px] font-medium text-[#44536E] group-hover:text-[#1F4FB2] transition-colors">
                        {q}
                      </span>
                    </div>
                    <ChevronRightIcon className="w-[18px] h-[18px] text-[#C0CAD8] group-hover:text-[#1F4FB2] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-[20px] font-semibold text-[#1A2B49]">
              Truy cập nhanh
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#EEF1F4] p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{link.icon}</div>
                    <p className="text-xs font-medium text-[#44536E]">{link.label}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
    </AppShell>
  );
}
