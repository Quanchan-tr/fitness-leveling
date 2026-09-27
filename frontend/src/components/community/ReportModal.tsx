'use strict';
'use client';

import React, { useState } from 'react';
import { Flag, X, CheckCircle, AlertTriangle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F7F3EA] border border-[#B9A78E]/50 rounded-2xl p-5 max-w-md w-full shadow-xl relative animate-scaleIn text-[#1F2328]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#B9A78E]/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2328]">Report Exercise Post</h3>
              <p className="text-[11px] text-[#76583E]">{post.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#76583E] hover:bg-[#E8E1D5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-[#7FB069] animate-bounce" />
            <h4 className="text-sm font-bold text-[#1F2328]">Report Submitted</h4>
            <p className="text-xs text-[#76583E] max-w-xs">
              Thank you for keeping our fitness community safe and accurate. Our AI and moderation team will review this movement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F2328] mb-1.5">
                Why are you reporting this post?
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { value: 'incorrect_form', label: 'Dangerous or incorrect exercise form' },
                  { value: 'misleading_tags', label: 'Misleading tags or muscle group categorization' },
                  { value: 'inappropriate', label: 'Inappropriate or harmful media/content' },
                  { value: 'spam', label: 'Spam, advertisement, or duplicate post' },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-[#B9A78E]/30 cursor-pointer hover:bg-white transition-colors"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <span className="font-medium text-[#1F2328]">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2328] mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what seems incorrect or needs adjustment..."
                rows={2}
                className="w-full bg-white p-2.5 rounded-xl border border-[#B9A78E]/40 text-xs text-[#1F2328] placeholder-[#76583E]/60 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#B9A78E]/20 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#76583E] hover:bg-[#E8E1D5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
