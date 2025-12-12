'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import TextArea from '@/components/forms/TextArea';
import Chip from '@/components/ui/Chip';
import Card from '@/components/ui/Card';
import SnowEffect from '@/components/SnowEffect';
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
  const [shareText, setShareText] = useState(''); // AI-generated shareable content
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

  // Suggested questions with short labels
  const suggestedQuestions = [
    {
      category: "Pháp luật",
      icon: "📚",
      questions: [
        { short: "Sang tên Sổ đỏ", full: "Thủ tục sang tên Sổ đỏ năm 2025 cần những giấy tờ gì?" },
        { short: "Rút BHXH 1 lần", full: "Điều kiện để rút Bảo hiểm xã hội một lần mới nhất là gì?" },
        { short: "Ly hôn đơn phương", full: "Ly hôn đơn phương nộp hồ sơ ở đâu và mất bao lâu?" },
        { short: "Đòi nợ không giấy tờ", full: "Cho vay tiền qua tin nhắn không viết giấy có kiện đòi được không?" },
        { short: "Phạt nồng độ cồn", full: "Mức phạt nồng độ cồn xe máy hiện nay là bao nhiêu?" },
        { short: "Chia thừa kế đất đai", full: "Chia thừa kế đất đai khi cha mẹ mất không để lại di chúc như thế nào?" },
        { short: "Bồi thường sa thải", full: "Công ty sa thải nhân viên không báo trước phải bồi thường những gì?" },
        { short: "Trả nợ thay chồng", full: "Chồng vay nợ cờ bạc vợ có phải trả thay không?" },
        { short: "Giấy phép xây dựng", full: "Xây nhà cấp 4 ở nông thôn có cần xin giấy phép xây dựng không?" },
        { short: "Tố giác lừa đảo", full: "Bị lừa đảo chuyển tiền qua mạng thì tố giác ở đâu để lấy lại tiền?" }
      ]
    },
    {
      category: "Thủ tục hành chính",
      icon: "🏢",
      questions: [
        { short: "Làm Hộ chiếu online", full: "Hướng dẫn cách làm Hộ chiếu (Passport) online nhận tại nhà." },
        { short: "Lý lịch tư pháp", full: "Thủ tục xin cấp phiếu Lý lịch tư pháp trên ứng dụng VNeID." },
        { short: "Đổi thẻ Căn cước", full: "Thủ tục đổi thẻ Căn cước công dân sang thẻ Căn cước mới nhất." },
        { short: "Đăng ký tạm trú", full: "Cách đăng ký tạm trú online cho người thuê trọ không cần ra công an phường." },
        { short: "Đăng ký khai sinh", full: "Thủ tục liên thông đăng ký khai sinh và cấp thẻ BHYT cho trẻ sơ sinh." }
      ]
    }
  ];

  // Quick access links
  const quickLinks = [
    { icon: '📋', label: 'Thủ tục', href: '/law?tab=procedures' },
    { icon: '📚', label: 'Văn bản', href: '/law?tab=documents' },
    { icon: '🎨', label: 'AI Prompts', href: '/ai-prompts' },
    { icon: '🎲', label: 'Ứng dụng AI', href: '/apps' },
  ];

  // Format text for social sharing - remove markdown and add appropriate formatting
  const formatShareText = (rawAnswer: string): string => {
    let formatted = rawAnswer
      // Remove markdown bold/italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      // Remove "Lưu ý quan trọng" section and similar disclaimers
      .replace(/\*\*Lưu ý quan trọng:?\*\*/gi, '')
      .replace(/Lưu ý quan trọng:?/gi, '')
      .replace(/\*\*Lưu ý:?\*\*/gi, '')
      .replace(/Lưu ý:?/gi, '')
      // Remove disclaimer sentences
      .replace(/Đây chỉ là thông tin tham khảo.*?\.?/gi, '')
      .replace(/không thay thế.*?pháp lý.*?\.?/gi, '')
      .replace(/nên tham khảo.*?chuyên gia.*?\.?/gi, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return formatted;
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');
    setShareText('');

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể lấy câu trả lời');
      }

      setAnswer(data.answer);
      setShareText(data.shareText || ''); // AI-generated shareable content
    } catch (err: any) {
      const errorMessage = err.message || 'Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.';
      setError(errorMessage);
      console.error('Q&A API Error:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (fullQuestion: string) => {
    setQuestion(fullQuestion);
  };

  const handleQuestionClick = (q: string) => {
    setQuestion(q);
  };

  return (
    <AppShell showHeader={true} showBottomNav={true}>
      <SnowEffect />
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
                  placeholder="🎄 Ông già Noel ơi, cho hỏi về thủ tục pháp lý..."
                  maxLength={1000}
                  rows={6}
                  className="w-full bg-[#F9FAFC] border border-[#D6DFEA] rounded-xl px-[14px] py-3 text-sm text-[#1A2B49] placeholder:text-[#8897AC] focus:outline-none focus:border-[#1F4FB2] focus:ring-2 focus:ring-[#1F4FB2]/10 transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-[#8897AC]">
                  {question.length}/1000
                </div>
              </div>
            </div>

            {/* Style Guide Selector - REMOVED */}

            {/* Suggested Questions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-[#1A2B49]">💡 Gợi ý câu hỏi</span>
              </div>
              
              {suggestedQuestions.map((group, groupIdx) => (
                <div key={group.category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      groupIdx === 0 ? 'text-blue-900' : 'text-green-900'
                    }`}>{group.icon} {group.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(q.full)}
                        title={q.full}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                          groupIdx === 0 
                            ? 'bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300'
                            : 'bg-green-50 border border-green-200 text-green-900 hover:bg-green-100 hover:border-green-300'
                        }`}
                      >
                        {q.short}
                      </button>
                    ))}
                  </div>
                </div>
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
                className="h-12 min-w-[160px] px-5 rounded-xl bg-[#D42426] shadow-[0_4px_10px_rgba(0,0,0,0.08)] text-white font-semibold text-base hover:bg-[#b01b1d] active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>🎄 Trợ lý đang tổng hợp dữ liệu...</span>
                  </div>
                ) : (
                  <>
                    🎁 Hỏi ngay
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
                    <p className="text-sm text-gray-600 italic mt-3">
                      💡 Nếu câu trả lời chưa đầy đủ, hãy nhấn &quot;Hỏi ngay&quot; để AI tổng hợp lại.
                    </p>
                    
                    {/* Social Sharing Buttons */}
                    <div className="mt-4 pt-3 border-t border-[#EEF1F4]">
                      <p className="text-sm font-medium text-[#1A2B49] mb-2">📤 Chia sẻ câu trả lời:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Use AI-generated shareText if available, fallback to formatted answer
                            const content = shareText || formatShareText(answer);
                            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(content)}`;
                            window.open(fbUrl, '_blank', 'width=600,height=400');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </button>
                        <button
                          onClick={() => {
                            const content = shareText || formatShareText(answer);
                            const zaloUrl = `https://sp.zalo.me/share?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(content)}`;
                            window.open(zaloUrl, '_blank', 'width=600,height=400');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0068FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652.521 2.411-.343 6.237-.343 6.237s3.48-.908 5.513-2.051c.651.14 1.324.24 2.017.29.18.013.362.022.545.027.18-.005.362-.014.542-.027.693-.05 1.366-.15 2.017-.29 2.033 1.143 5.513 2.051 5.513 2.051s-.864-3.826-.343-6.237C22.255 17.727 24 14.608 24 11.111 24 4.975 18.627 0 12 0zm.545 19.644c-.18.013-.362.022-.545.027-.183-.005-.365-.014-.545-.027-5.621-.406-10.11-4.46-10.11-9.422C1.345 5.26 6.172.889 12 .889s10.655 4.37 10.655 9.733c0 4.962-4.489 9.016-10.11 9.422z"/>
                          </svg>
                          Zalo
                        </button>
                        <button
                          onClick={() => {
                            const content = shareText || formatShareText(answer);
                            navigator.clipboard.writeText(content);
                            alert('✅ Đã copy nội dung chia sẻ!');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                    </div>
                    
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

          {/* Popular Questions Section - REMOVED */}

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
