'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Flame,
  Calendar,
  Menu,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  X,
  CheckCircle2,
  Trash2,
  Sparkles,
  CheckSquare,
  Square,
  ExternalLink,
  Droplets,
  MessageSquare,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { FitnessUser } from '@/lib/fitnessData';
import { useAuth } from '@/contexts/AuthContext';
import { useFitness } from '@/contexts/FitnessContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'workout' | 'water' | 'system' | 'community';
  actionUrl?: string;
  actionLabel?: string;
}

interface TopBarProps {
  user?: FitnessUser;
  streak?: number;
  photoCount?: number;
  onOpenBodyMetrics?: () => void;
  onOpenProgressPhotos?: () => void;
  onOpenOutfit?: () => void;
  onToggleMobileMenu?: () => void;
  onSignOut?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user: propUser,
  streak: propStreak,
  onToggleMobileMenu,
  onSignOut,
}) => {
  const { user: authUser, signOut } = useAuth();
  const { profile } = useFitness();

  const user: FitnessUser = propUser || {
    name: authUser?.displayName || profile?.name || 'Chiến binh',
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    nextLevelXp: profile?.maxXp || 1000,
    str: 24,
    end: 18,
    mob: 15,
    goal: (profile?.goal as 'gain_muscle' | 'lose_fat') || 'gain_muscle',
  };

  const streak = propStreak !== undefined ? propStreak : (profile?.streak || 17);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notifications State (Persisted in localStorage)
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fitnessleveling_notifications_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed reading notifications', e);
      }
    }
    return [];
  });

  // Expand / Collapse state: stores the ID of the expanded notification
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Selection mode state for bulk deletion
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Persist notifications to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fitnessleveling_notifications_v1', JSON.stringify(notifications));
      } catch (e) {
        console.error('Failed saving notifications', e);
      }
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
      setNotifications([]);
      setSelectedIds([]);
      setIsSelecting(false);
      setExpandedId(null);
    }
  };

  // Toggle expand/collapse when clicked in normal mode
  const handleItemClick = (id: string) => {
    if (isSelecting) {
      handleToggleSelect(id);
      return;
    }
    // Mark as read upon opening
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Toggle selection for an individual notification
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all
  const handleToggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  // Delete selected notifications in bulk
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    setIsSelecting(false);
    setExpandedId(null);
  };

  // Delete a single notification directly
  const handleDeleteSingle = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    if (expandedId === id) setExpandedId(null);
  };

  // Toggle selection mode on/off
  const handleToggleSelectMode = () => {
    setIsSelecting((prev) => {
      const next = !prev;
      if (!next) setSelectedIds([]);
      return next;
    });
  };

  const handleAddSampleNotification = () => {
    const samples: NotificationItem[] = [
      {
        id: `notif-${Date.now()}-1`,
        title: 'Lịch tập hôm nay sẵn sàng!',
        message:
          'Buổi tập Chủ nhật: Chest & Triceps (4 bài, ~45 phút) đã được khởi tạo theo giáo án của bạn. Nhấp để xem chi tiết bài tập và khởi động.',
        time: 'Vừa xong',
        read: false,
        type: 'workout',
        actionUrl: '/workout',
        actionLabel: 'Vào xem bài tập',
      },
      {
        id: `notif-${Date.now()}-2`,
        title: 'Nhắc nhở nạp nước đều đặn',
        message:
          'Bạn đã nạp 1.8L / 2.0L mục tiêu hôm nay. Hãy uống thêm một cốc nước 250ml để hỗ trợ quá trình phục hồi cơ bắp và trao đổi chất.',
        time: '15 phút trước',
        read: false,
        type: 'water',
        actionUrl: '/dashboard',
        actionLabel: 'Ghi nhanh nước',
      },
      {
        id: `notif-${Date.now()}-3`,
        title: 'Cập nhật hệ thống FitnessLeveling v2.5',
        message:
          'Tính năng AI Pose Coach đã được cập nhật thuật toán phát hiện góc khớp gối và độ võng lưng theo thời gian thực cho bài Squat & Push-up.',
        time: '2 giờ trước',
        read: true,
        type: 'system',
        actionUrl: '/ai-coach',
        actionLabel: 'Mở AI Coach',
      },
    ];
    setNotifications((prev) => [...samples, ...prev]);
  };

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    try {
      if (onSignOut) {
        await onSignOut();
      }
      await signOut();
    } catch (err) {
      console.error('Error during sign out:', err);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = [
        'Chủ Nhật',
        'Thứ Hai',
        'Thứ Ba',
        'Thứ Tư',
        'Thứ Năm',
        'Thứ Sáu',
        'Thứ Bảy',
      ];
      const dayName = days[now.getDay()];
      const date = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      setCurrentDateTime(
        `${dayName}, ${date}/${month}/${year} • ${hours}:${minutes}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Toggle & Always-Visible Date / Time Box */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#FF5722] shrink-0" strokeWidth={2} />
          <span className="tabular-nums font-medium text-slate-800">
            {currentDateTime || 'Đang cập nhật...'}
          </span>
        </div>
      </div>

      {/* Right Controls: Streak + Notifications + Interactive Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Indicator (Flat, high-contrast) */}
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-lg text-[#E64A19] font-bold text-xs">
          <Flame className="w-3.5 h-3.5 text-[#FF5722] fill-[#FF5722]" />
          <span className="hidden sm:inline tabular-nums">{streak} ngày streak</span>
          <span className="sm:hidden tabular-nums">{streak}N</span>
        </div>

        {/* Notifications Bell & Flyout Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (isProfileMenuOpen) setIsProfileMenuOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors relative cursor-pointer"
            aria-label="Xem thông báo"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FF5722] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  setIsSelecting(false);
                  setSelectedIds([]);
                }}
              />
              <div className="absolute right-0 mt-2 w-84 sm:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {/* Header (Switches between Normal mode and Selection mode) */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  {!isSelecting ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#FF5722]" />
                        <h3 className="font-extrabold text-sm text-slate-900">Thông báo</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-orange-100 text-[#C2410C] px-2 py-0.5 rounded-full">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {notifications.length > 0 && (
                          <>
                            {/* Toggle Select Mode button */}
                            <button
                              type="button"
                              onClick={handleToggleSelectMode}
                              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1"
                              title="Chọn để xóa nhiều thông báo"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                              <span>Chọn</span>
                            </button>

                            {/* Mark all as read */}
                            <button
                              type="button"
                              onClick={handleMarkAllAsRead}
                              className="text-[11px] font-bold text-slate-600 hover:text-[#FF5722] px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                              title="Đánh dấu tất cả đã đọc"
                            >
                              Đã đọc
                            </button>

                            {/* Clear all */}
                            <button
                              type="button"
                              onClick={handleClearNotifications}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xóa tất cả thông báo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            setIsSelecting(false);
                            setSelectedIds([]);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Active Selection Mode Header */
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleSelectAll}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
                        >
                          {selectedIds.length === notifications.length && notifications.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-[#FF5722]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                          <span>Đã chọn ({selectedIds.length})</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleDeleteSelected}
                          disabled={selectedIds.length === 0}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa ({selectedIds.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleSelectMode}
                          className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Notifications Body */}
                <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <EmptyState
                      icon={Bell}
                      title="Chưa có thông báo nào"
                      description="Bạn sẽ nhận được thông báo khi có lịch tập hôm nay, lời nhắc uống nước hoặc cập nhật từ cộng đồng."
                      className="py-8 border-0 shadow-none bg-transparent"
                      action={{
                        label: 'Tạo thông báo thử',
                        onClick: handleAddSampleNotification,
                        variant: 'secondary',
                      }}
                    />
                  ) : (
                    notifications.map((item) => {
                      const isExpanded = expandedId === item.id;
                      const isSelected = selectedIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`p-3.5 transition-all cursor-pointer select-none relative ${
                            isSelected
                              ? 'bg-orange-50/90 border-l-4 border-l-[#FF5722] ring-1 ring-inset ring-orange-200/60'
                              : !item.read
                              ? 'bg-orange-50/30 border-l-4 border-l-orange-400 hover:bg-orange-50/50'
                              : 'border-l-4 border-l-transparent hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox (in selection mode) or Category Icon (in normal mode) */}
                            {isSelecting ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelect(item.id);
                                }}
                                className="mt-0.5 p-0.5 rounded text-slate-400 hover:text-[#FF5722] transition-colors cursor-pointer shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-[#FF5722]" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400" />
                                )}
                              </button>
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                                  item.type === 'workout'
                                    ? 'bg-orange-100 text-[#FF5722]'
                                    : item.type === 'water'
                                    ? 'bg-sky-100 text-sky-600'
                                    : 'bg-purple-100 text-purple-600'
                                }`}
                              >
                                {item.type === 'workout' ? (
                                  <Flame className="w-4 h-4 fill-current" />
                                ) : item.type === 'water' ? (
                                  <Droplets className="w-4 h-4" />
                                ) : (
                                  <Bell className="w-4 h-4" />
                                )}
                              </div>
                            )}

                            {/* Main content */}
                            <div className="flex-1 min-w-0">
                              {/* Header row: Title + Time + Expand chevron */}
                              <div className="flex items-center justify-between gap-1">
                                <h4
                                  className={`text-xs font-bold leading-tight ${
                                    isExpanded ? 'text-slate-900' : 'truncate text-slate-800'
                                  } ${!item.read ? 'font-extrabold text-slate-900' : ''}`}
                                >
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                  <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                                    {item.time}
                                  </span>
                                  {!isSelecting && (
                                    <span className="text-slate-400">
                                      {isExpanded ? (
                                        <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Message Content: Collapsed (line-clamp) vs Expanded (Full text + action) */}
                              {!isExpanded ? (
                                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-1">
                                  {item.message}
                                </p>
                              ) : (
                                <div className="mt-2 pt-2 border-t border-slate-100/90 space-y-2.5 animate-in fade-in duration-150">
                                  <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                                    {item.message}
                                  </p>

                                  {/* Expanded Action Toolbar */}
                                  <div className="flex items-center justify-between pt-1 text-xs">
                                    {item.actionUrl ? (
                                      <Link
                                        href={item.actionUrl}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsNotificationsOpen(false);
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5722] hover:text-[#E64A19] hover:underline"
                                      >
                                        <span>{item.actionLabel || 'Xem chi tiết'}</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </Link>
                                    ) : (
                                      <div />
                                    )}

                                    {/* Delete individual notification button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSingle(item.id);
                                      }}
                                      className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Xóa thông báo này"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Xóa tin này</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Unread dot */}
                            {!item.read && !isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#FF5722] shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer action */}
                {notifications.length > 0 && (
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isSelecting
                        ? `Đang chọn ${selectedIds.length} / ${notifications.length} tin`
                        : `${notifications.length} thông báo`}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSampleNotification}
                      className="text-[11px] font-bold text-slate-600 hover:text-[#FF5722] transition-colors cursor-pointer"
                    >
                      + Thêm tin thử nghiệm
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Interactive User Profile with Dropdown Menu */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer p-1 rounded-lg hover:bg-slate-50"
            title="Tài khoản & Tùy chọn"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span>{user.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-semibold tabular-nums">
                Lv. {user.level} • {user.goal === 'gain_muscle' ? 'Tăng cơ' : 'Giảm cân'}
              </div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500">Cấp độ {user.level} • Chiến binh thể hình</div>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cài đặt ứng dụng</span>
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
