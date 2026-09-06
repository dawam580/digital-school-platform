import { StaffMember, StaffRole } from '../types';

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'إداري',
  supervisor: 'مشرف تربوي',
  teacher: 'مدرس مادة',
  cleaner: 'عامل نظافة',
  gardener: 'بستاني',
  student_affairs: 'شؤون طلبة',
  maintenance: 'فني صيانة'
};

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    firstName: 'طارق',
    middleName: 'عبدالرحمن',
    lastName: 'الورفلي',
    fullName: 'طارق عبدالرحمن الورفلي',
    nationalNumber: '119850123456',
    gender: 'male',
    phone: '0913344556',
    birthDate: '1985-04-12',
    role: 'admin',
    roleLabel: 'إداري / مسجل عام',
    hireDate: '2021-09-01',
    documents: {
      contract: true,
      healthCert: true,
      qualification: true,
      nationalIdCopy: true,
      criminalClearance: true,
      personalPhotos: true
    },
    notes: 'مسؤول القبول والتسجيل وشؤون الامتحانات',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'staff-2',
    firstName: 'سالم',
    middleName: 'فرج',
    lastName: 'المقرحي',
    fullName: 'سالم فرج المقرحي',
    nationalNumber: '119900987654',
    gender: 'male',
    phone: '0925566778',
    birthDate: '1990-07-20',
    role: 'supervisor',
    roleLabel: 'مشرف أدوار وطوابق',
    hireDate: '2023-01-15',
    documents: {
      contract: true,
      healthCert: true,
      qualification: true,
      nationalIdCopy: true,
      criminalClearance: false, // ناقص
      personalPhotos: true
    },
    notes: 'إشراف على طابور الصباح والجناح الثانوي',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'staff-3',
    firstName: 'هند',
    middleName: 'مصطفى',
    lastName: 'الزوي',
    fullName: 'هند مصطفى الزوي',
    nationalNumber: '219920334455',
    gender: 'female',
    phone: '0917788990',
    birthDate: '1992-11-05',
    role: 'student_affairs',
    roleLabel: 'مسؤولة شؤون طلبة',
    hireDate: '2022-09-10',
    documents: {
      contract: true,
      healthCert: true,
      qualification: true,
      nationalIdCopy: true,
      criminalClearance: true,
      personalPhotos: true
    },
    notes: 'متابعة أذونات الغياب والتواصل مع أمهات الطلاب',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'staff-4',
    firstName: 'عمر',
    middleName: 'خليفة',
    lastName: 'التائب',
    fullName: 'عمر خليفة التائب',
    nationalNumber: '119880654321',
    gender: 'male',
    phone: '0921122334',
    birthDate: '1988-03-18',
    role: 'maintenance',
    roleLabel: 'فني كهرباء وصيانة عامة',
    hireDate: '2020-10-01',
    documents: {
      contract: true,
      healthCert: true,
      qualification: false, // ناقص
      nationalIdCopy: true,
      criminalClearance: true,
      personalPhotos: true
    },
    notes: 'صيانة معامل الحاسوب والمولد والمرافق المدرسية',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'staff-5',
    firstName: 'مبروكة',
    middleName: 'سليمان',
    lastName: 'القذافي',
    fullName: 'مبروكة سليمان القذافي',
    nationalNumber: '219800778899',
    gender: 'female',
    phone: '0916677889',
    birthDate: '1980-08-25',
    role: 'cleaner',
    roleLabel: 'عاملة نظافة وخدمات',
    hireDate: '2019-09-01',
    documents: {
      contract: true,
      healthCert: true,
      qualification: false,
      nationalIdCopy: true,
      criminalClearance: true,
      personalPhotos: false // ناقص
    },
    notes: 'نظافة مكاتب الإدارة وجناح التعليم الأساسي',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'staff-6',
    firstName: 'رمضان',
    middleName: 'عطية',
    lastName: 'الشيباني',
    fullName: 'رمضان عطية الشيباني',
    nationalNumber: '119760112233',
    gender: 'male',
    phone: '0928899001',
    birthDate: '1976-05-14',
    role: 'gardener',
    roleLabel: 'بستاني وري حدائق المدرسة',
    hireDate: '2018-03-01',
    documents: {
      contract: true,
      healthCert: true,
      qualification: false,
      nationalIdCopy: true,
      criminalClearance: true,
      personalPhotos: true
    },
    notes: 'رعاية حديقة المدرسة وتشجير الفناء والمدخل',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'staff-7',
    firstName: 'فتحي',
    middleName: 'محمد',
    lastName: 'الطرابلسي',
    fullName: 'فتحي محمد الطرابلسي',
    nationalNumber: '119820556677',
    gender: 'male',
    phone: '0912233445',
    birthDate: '1982-01-30',
    role: 'teacher',
    roleLabel: 'مدرس مادة لغة عربية',
    hireDate: '2017-09-15',
    documents: {
      contract: true,
      healthCert: true,
      qualification: true,
      nationalIdCopy: true,
      criminalClearance: true,
      personalPhotos: true
    },
    notes: 'مدرس أول لمادة اللغة العربية للصف التاسع',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  }
];
