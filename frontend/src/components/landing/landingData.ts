'use strict';

/**
 * Data structures, configuration, and copy for Fitness-Leveling Web Application Landing Page.
 * - Primary Brand Color: Athletic Vibrant Orange (#FF5722, hover #E64A19, light #FFF7ED)
 * - Brand Dark: #0F172A
 * - Background: #FFFFFF & #F8FAFC
 * - Product: Web Application (Nền tảng Web Quản trị thể lực & 3D Leveling)
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export const NAV_LINKS: NavItem[] = [
  { id: 'hero', label: 'Trang chủ', href: '#hero' },
  { id: 'features', label: 'Tính năng', href: '#features' },
  { id: 'showcase', label: 'Trải nghiệm Web', href: '#showcase' },
  { id: 'how-it-works', label: 'Cách hoạt động', href: '#how-it-works' },
  { id: 'testimonials', label: 'Cộng đồng', href: '#testimonials' },
];

export interface SocialProofData {
  rating: number;
  totalReviews: string;
  activeUsers: string;
  accuracyRate: string;
  workoutsLogged: string;
  avatarNames: string[];
}

export const SOCIAL_PROOF: SocialProofData = {
  rating: 4.9,
  totalReviews: '17M+',
  activeUsers: '17.000.000+',
  accuracyRate: '98.4%',
  workoutsLogged: '28M+',
  avatarNames: ['Alex Rivera', 'Minh Tran', 'Sarah Chen', 'Marcus Vance'],
};

export interface PartnerLogo {
  name: string;
  subtitle: string;
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'TechCrunch', subtitle: 'Leading Web Fitness Tech' },
  { name: 'Forbes', subtitle: 'Top AI Gamified Platform' },
  { name: 'WIRED', subtitle: 'Next-Gen 3D Web Graphics' },
  { name: "Men's Health", subtitle: 'Best Workout System 2026' },
  { name: 'Product Hunt', subtitle: '#1 Fitness Product' },
];

export interface FeatureItem {
  id: string;
  category: string;
  title: string;
  description: string;
  benefits: string[];
  screenType: 'pose' | 'avatar' | 'biometrics';
  badge: string;
}

export const FEATURES: FeatureItem[] = [
  {
    id: 'ai-pose',
    category: 'AI POSE CHECK TRỰC TIẾP TRÊN TRÌNH DUYỆT',
    title: 'Chỉnh form tập chuẩn xác từng mili-giây qua Webcam',
    description:
      'Chỉ cần bật camera trên laptop hoặc điện thoại, thuật toán MediaPipe cục bộ phân tích 33 khớp xương theo thời gian thực. Nhận diện chuẩn góc squat, biên độ hít đất và cảnh báo tư thế sai tức thì.',
    benefits: [
      'Không cần cài đặt ứng dụng: Hoạt động trực tiếp 100% trên trình duyệt Web',
      'Tự động đếm rep chuẩn biên độ chuyển động (ROM)',
      'Bảo mật tuyệt đối: Luồng video xử lý cục bộ trên thiết bị, không lưu trữ lên server',
      'Đánh giá điểm kỹ thuật form chi tiết sau từng hiệp tập',
    ],
    screenType: 'pose',
    badge: 'Real-time Web AI Camera',
  },
  {
    id: 'avatar-leveling',
    category: 'TIẾN HOÁ NHÂN VẬT 3D & GAMIFICATION',
    title: 'Biến từng giọt mồ hôi thành điểm kinh nghiệm (XP)',
    description:
      'Mỗi buổi tập hoàn thành, mỗi kỷ lục cá nhân (PR) đều biến thành XP tăng cấp cho nhân vật 3D đại diện trên nền Web Three.js mượt mà. Nâng cấp chỉ số Sức mạnh (STR), Bền bỉ (END) và Linh hoạt (AGI).',
    benefits: [
      'Mô hình 3D xoay 360 độ tương tác mượt mà bằng công nghệ WebGL',
      'Tùy biến trang phục thi đấu: áo đấu, băng trán, giày và phụ kiện',
      'Hệ thống bảng radar chỉ số phản ánh trung thực phong độ bản thân',
      'Duy trì chuỗi streak kỷ luật hàng ngày và leo bảng xếp hạng',
    ],
    screenType: 'avatar',
    badge: 'Interactive 3D WebGL Avatar',
  },
  {
    id: 'bio-metrics',
    category: 'CHỈ SỐ SINH TRẮC HỌC Y KHOA',
    title: 'Đo lường thể lực khoa học theo chuẩn Deurenberg',
    description:
      'Tích hợp công thức lâm sàng Deurenberg tính % mỡ cơ thể (% Body Fat), phân loại BMI chuẩn WHO và tính toán chỉ số trao đổi chất BMR/TDEE cá nhân hoá theo từng mục tiêu Tăng cơ hoặc Giảm mỡ.',
    benefits: [
      'Phân tích % Body Fat, khối lượng cơ nạc và phân bố mô cơ bắp',
      'Gợi ý Macro Protein / Carb / Fat chi tiết theo ngày',
      'Lưu trữ nhật ký tiến độ và ảnh vóc dáng an toàn trên trình duyệt',
      'Theo dõi mức nước uống và mức độ hồi phục cơ thể',
    ],
    screenType: 'biometrics',
    badge: 'Clinical Biometrics & TDEE',
  },
];

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  detail: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: '01',
    title: 'Mở Web & Thiết lập hồ sơ',
    description:
      'Truy cập trực tiếp trên trình duyệt, khởi tạo chỉ số sinh trắc học và mục tiêu thể hình trong chưa đầy 60 giây.',
    detail: 'Không cần tải xuống hay cài đặt bất kỳ phần mềm nào.',
  },
  {
    step: '02',
    title: 'Bật Camera & Luyện tập với AI',
    description:
      'Camera AI Web tự động nhận diện bài tập, chấm điểm form và tự động đếm số lần nâng tạ chuẩn xác.',
    detail: 'Tập trung 100% vào việc bứt phá giới hạn thể lực.',
  },
  {
    step: '03',
    title: 'Tăng cấp nhân vật 3D & Theo dõi tiến độ',
    description:
      'Nhận XP thăng hạng, mở khóa trang phục mới và nhìn thấy vóc dáng biến chuyển qua biểu đồ trực quan.',
    detail: 'Cảm nhận sự tiến bộ rõ rệt qua từng ngày tập luyện.',
  },
];

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  metric: string;
  verified: boolean;
  rating: number;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    quote:
      'Tính năng AI Pose Check trên trình duyệt thật sự ấn tượng. Tôi chỉ cần mở laptop ở phòng gym, camera tự nhận diện góc gập gối 92 độ khi Squat và nhắc nhở ngay khi tôi cong lưng. Cực kỳ tiện lợi.',
    author: 'Trần Hoàng Long',
    role: 'VĐV Thể hình bán chuyên, 4 năm tập luyện',
    metric: 'Tăng 6kg cơ nạc sau 5 tháng',
    verified: true,
    rating: 5,
  },
  {
    id: 't2',
    quote:
      'Giao diện web chạy siêu mượt, nhân vật 3D chuyển động rất chân thực. Mỗi khi hoàn thành buổi tập được cộng điểm XP tăng cấp như chơi game RPG làm tôi có động lực tập luyện mỗi ngày!',
    author: 'Nguyễn Thảo My',
    role: 'Marathoner & UI Designer, TP.HCM',
    metric: 'Duy trì streak 142 ngày liên tục',
    verified: true,
    rating: 5,
  },
  {
    id: 't3',
    quote:
      'Là chuyên gia y học thể thao, tôi đánh giá rất cao việc áp dụng công thức Deurenberg chuẩn y khoa cùng khả năng xử lý camera cục bộ. Dữ liệu bệnh nhân và học viên hoàn toàn an toàn.',
    author: 'Dr. David Nguyễn',
    role: 'Chuyên gia Y học Thể thao, Viện Thể Chất',
    metric: 'Khuyên dùng cho hơn 300 học viên',
    verified: true,
    rating: 5,
  },
];

export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Nền tảng',
    links: [
      { label: 'AI Pose Web Camera', href: '#features' },
      { label: 'Nhân vật 3D Leveling', href: '#features' },
      { label: 'Chỉ số Deurenberg', href: '#features' },
      { label: 'Quản lý lịch tập', href: '#how-it-works' },
      { label: 'Dinh dưỡng & Nước uống', href: '#features' },
    ],
  },
  {
    title: 'Hệ sinh thái',
    links: [
      { label: 'Về Fitness-Leveling', href: '#showcase' },
      { label: 'Cộng đồng tập luyện', href: '/community' },
      { label: 'Đội ngũ phát triển', href: '#testimonials' },
      { label: 'Liên hệ hỗ trợ', href: 'mailto:support@fitness-leveling.com' },
    ],
  },
  {
    title: 'Pháp lý & Riêng tư',
    links: [
      { label: 'Chính sách bảo mật', href: '#' },
      { label: 'Điều khoản sử dụng', href: '#' },
      { label: 'Bảo mật camera Web', href: '#' },
    ],
  },
];
