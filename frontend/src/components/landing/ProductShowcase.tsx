'use strict';

import React, { useState } from 'react';
import { PhoneMockup, ScreenType } from './PhoneMockup';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ScreenType>('pose');

  const tabs: { type: ScreenType; label: string; icon: string; summary: string }[] = [
    {
      type: 'pose',
      label: 'AI Pose Webcam (60 FPS)',
      icon: '⚡',
      summary: 'Theo dõi 33 điểm khớp xương và phát hiện sai form ngay trên trình duyệt.',
    },
    {
      type: 'avatar',
      label: 'Nhân vật 3D WebGL',
      icon: '🏆',
      summary: 'Mô hình thể thao 3D tương tác xoay 360 độ và tăng cấp theo điểm XP.',
    },
    {
      type: 'biometrics',
      label: 'Chỉ số Deurenberg',
      icon: '📊',
      summary: 'Tỷ lệ % mỡ, BMI WHO và công thức trao đổi chất BMR/TDEE cá nhân hoá.',
    },
  ];

  return (
    <section id="showcase" className="py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black tracking-widest uppercase text-[#FF5722] block mb-2">
            TRẢI NGHIỆM WEB TRỰC TIẾP
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight mb-3">
            Giao diện bên trong Fitness-Leveling
          </h2>
          <p className="text-base text-slate-600">
            Xem trước trải nghiệm thực tế khi bạn mở phòng tập ảo trên trình duyệt Web.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.type;
            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActiveTab(tab.type)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5722] text-white shadow-md shadow-orange-500/25 scale-105'
                    : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-[#FF5722] border border-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase Center Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Phone Screen Display */}
            <div className="md:col-span-6 flex justify-center">
              <PhoneMockup screenType={activeTab} />
            </div>

            {/* Explanatory Deep Dive */}
            <div className="md:col-span-6 flex flex-col items-start text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF5722] text-xs font-black border border-orange-200">
                <span>Hoạt động 100% trên nền Web</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                {activeTab === 'pose' && 'Camera AI Web nhận diện khớp xương'}
                {activeTab === 'avatar' && 'Nhân vật 3D WebGL tương tác trực tiếp'}
                {activeTab === 'biometrics' && 'Hồ sơ sinh trắc học y khoa'}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {activeTab === 'pose' &&
                  'Sử dụng kiến trúc MediaPipe Pose 33 điểm chạy trực tiếp trên GPU máy tính qua WebGL, độ trễ dưới 40ms. Nhận diện góc squat, tư thế bench press và độ thẳng cột sống an toàn tuyệt đối.'}
                {activeTab === 'avatar' &&
                  'Không chỉ là hình đại diện tĩnh, nhân vật 3D phản ánh sức mạnh thực tế của bạn. Xoay 360 độ kiểm tra sự phát triển các nhóm cơ và mở khóa trang phục thi đấu.'}
                {activeTab === 'biometrics' &&
                  'Dựa trên nghiên cứu Deurenberg et al. kết hợp cùng chuẩn BMI WHO, ứng dụng tự động tính toán tỷ lệ mỡ, cơ nạc và đưa ra khuyến nghị calo chính xác từng ngày.'}
              </p>

              <div className="pt-2 w-full">
                <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs font-medium text-[#0F172A]">
                  💡 <strong>Ưu thế công nghệ:</strong>{' '}
                  {activeTab === 'pose' && 'Tự động đếm rep khi hoàn thành đúng biên độ chuyển động.'}
                  {activeTab === 'avatar' && 'Hệ thống XP thúc đẩy tính kỷ luật duy trì thói quen.'}
                  {activeTab === 'biometrics' && 'Bảo mật dữ liệu sinh trắc học hoàn toàn trên thiết bị.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
