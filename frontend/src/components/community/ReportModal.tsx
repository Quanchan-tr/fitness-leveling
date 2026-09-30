'use strict';
'use client';

import React, { useState } from 'react';
import { Flag, X, CheckCircle } from 'lucide-react';
import { ExercisePostItem } from '@/types/community';

interface ReportModalProps {
  post: ExercisePostItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ post, isOpen, onClose }) => {
  const [reason, setReason] = useState('incorrect_form');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setDetails('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/60">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Báo cáo bài tập cộng đồng</h3>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{post.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-600 transition-transform scale-100" />
            <h4 className="text-sm font-bold text-slate-900">Báo cáo đã được tiếp nhận</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Cảm ơn bạn đã hỗ trợ xây dựng cộng đồng tập luyện an toàn. Đội ngũ kiểm duyệt sẽ xử lý trong vòng 24 giờ.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Lý do báo cáo nội dung này:
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { value: 'incorrect_form', label: 'Kỹ thuật sai lệch, có nguy cơ gây chấn thương' },
                  { value: 'misleading_tags', label: 'Gắn sai nhóm cơ hoặc thông tin gây hiểu lầm' },
                  { value: 'inappropriate', label: 'Hình ảnh / Video không phù hợp' },
                  { value: 'spam', label: 'Nội dung spam hoặc quảng cáo trùng lặp' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-white hover:border-slate-300 transition-colors"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-[#FF5722] focus:ring-[#FF5722]"
                    />
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Chi tiết bổ sung (tùy chọn)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Mô tả cụ thể lỗi form hoặc vấn đề kỹ thuật..."
                rows={2}
                className="w-full bg-slate-50 p-3 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5722] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Gửi báo cáo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
