import { StaffMember, StaffRole } from '../types';
import { getCleanAvatar } from '../utils/avatarHelper';

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
    avatar: getCleanAvatar('طارق عبدالرحمن الورفلي', 'admin')
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
    avatar: getCleanAvatar('سالم فرج المقرحي', 'staff')
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
    avatar: getCleanAvatar('هند مصطفى الزوي', 'female')
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
    avatar: getCleanAvatar('عمر خليفة التائب', 'staff')
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
    avatar: getCleanAvatar('مبروكة سليمان القذافي', 'female')
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
    avatar: getCleanAvatar('رمضان عطية الشيباني', 'staff')
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
    avatar: getCleanAvatar('فتحي محمد الطرابلسي', 'teacher')
  }
];
