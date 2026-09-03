/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك الذكاء الاصطناعي والتدقيق الذكي لاستيراد ملفات الطلاب والمعلمين
 * Libyan Smart Data & Identity Intelligence Engine
 * ============================================================================
 */

import { Student, TeacherAccount } from '../../types';

export interface SmartValidationResult {
  isValid: boolean;
  inferredGender: 'male' | 'female';
  birthYear?: number;
  birthDate?: string;
  recommendedGrade?: string;
  warnings: string[];
  sanitizedName: string;
  sanitizedNationalId: string;
}

export class SmartDataEngine {
  /**
   * تحويل الأرقام العربية الهندية (١٢٣) إلى أرقام عربية قياسية (123)
   */
  static normalizeNumbers(input: string | number): string {
    if (!input) return '';
    const str = String(input);
    const hindiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[٠-٩]/g, d => String(hindiDigits.indexOf(d))).replace(/[\s\-_]/g, '');
  }

  /**
   * تنظيف وتنسيق الاسم العربي وإزالة الرموز الزائدة
   */
  static sanitizeArabicName(name: string): string {
    if (!name) return '';
    return name
      .replace(/[^\u0600-\u06FF\s]/g, '') // Keep only Arabic letters and spaces
      .replace(/\s+/g, ' ')               // Collapse multiple spaces
      .trim();
  }

  /**
   * الفحص الذكي للرقم الوطني الليبي (12 خانة)
   * الخانة الأولى: 1 (ذكر) / 2 (أنثى)
   * الخانات 2-4: سنة الميلاد (مثال 12009... يعني سنة 2009)
   */
  static validateAndInferLibyanId(nationalIdRaw: string, studentName: string = ''): SmartValidationResult {
    const sanitizedId = this.normalizeNumbers(nationalIdRaw);
    const warnings: string[] = [];
    let inferredGender: 'male' | 'female' = 'male';
    let birthYear: number | undefined;
    let birthDate: string | undefined;
    let recommendedGrade: string | undefined;

    // Smart gender inference from first name heuristics
    const femaleNameTokens = ['فاطمة', 'مريم', 'آية', 'سارة', 'هدى', 'عائشة', 'خديجة', 'زينب', 'نور', 'سعاد', 'أمينة', 'ريان', 'ياسمين', 'شهد'];
    const nameIsFemale = femaleNameTokens.some(tok => studentName.includes(tok)) || studentName.endsWith('ة');
    if (nameIsFemale) {
      inferredGender = 'female';
    }

    if (!sanitizedId || sanitizedId.length === 0) {
      warnings.push('الرقم الوطني مفقود - تم توليد رقم مؤقت');
    } else if (sanitizedId.length !== 12) {
      warnings.push(`طول الرقم الوطني (${sanitizedId.length}) غير قياسي (يجب أن يكون 12 خانة)`);
    } else {
      // 1st digit dictates gender in Libyan Civil Registry
      const firstDigit = sanitizedId[0];
      if (firstDigit === '1') {
        inferredGender = 'male';
      } else if (firstDigit === '2') {
        inferredGender = 'female';
      }

      // Year digits: indices 1 to 4
      const yearPrefix = sanitizedId.substring(1, 5);
      const parsedYear = parseInt(yearPrefix, 10);
      if (parsedYear >= 1990 && parsedYear <= 2024) {
        birthYear = parsedYear;
        birthDate = `${birthYear}-03-15`;

        // Estimate recommended grade based on birth year
        const currentYear = 2025;
        const age = currentYear - birthYear;
        if (age === 9) recommendedGrade = 'الصف الرابع الأساسي';
        else if (age === 11) recommendedGrade = 'الصف السادس الأساسي';
        else if (age === 12) recommendedGrade = 'الصف السابع الأساسي';
        else if (age === 13) recommendedGrade = 'الصف الثامن الأساسي';
        else if (age === 14) recommendedGrade = 'الصف التاسع الأساسي';
        else recommendedGrade = 'الصف الثالث الأساسي';
      }
    }

    return {
      isValid: sanitizedId.length === 12 && (sanitizedId[0] === '1' || sanitizedId[0] === '2'),
      inferredGender,
      birthYear,
      birthDate,
      recommendedGrade,
      warnings,
      sanitizedName: this.sanitizeArabicName(studentName),
      sanitizedNationalId: sanitizedId
    };
  }

  /**
   * التوليد الذكي للبيانات المفقودة للطلاب (Smart Imputation)
   */
  static completeStudentData(raw: Partial<Student>, index: number): Student {
    const rawName = String(raw.name || `طالب جديد ${index + 1}`).trim();
    const validation = this.validateAndInferLibyanId(raw.nationalNumber || raw.nationalId || '', rawName);

    const nationalNumber = validation.sanitizedNationalId || (validation.inferredGender === 'male' ? `12010${String(1000000 + index).slice(-7)}` : `22010${String(1000000 + index).slice(-7)}`);
    const cleanName = validation.sanitizedName || rawName;

    // Detect or assign class
    let className = raw.className || '7/أ';
    let grade = raw.grade || validation.recommendedGrade || 'الصف السابع الأساسي';
    if (className.startsWith('7')) grade = 'الصف السابع الأساسي';
    else if (className.startsWith('8')) grade = 'الصف الثامن الأساسي';
    else if (className.startsWith('6')) grade = 'الصف السادس الأساسي';
    else if (className.startsWith('4')) grade = 'الصف الرابع الأساسي';
    else if (className.startsWith('9')) grade = 'الصف التاسع الأساسي';
    else if (className.startsWith('3')) grade = 'الصف الثالث الأساسي';

    return {
      id: raw.id || `std-smart-${Date.now()}-${index}`,
      name: cleanName,
      nationalNumber,
      nationalId: nationalNumber,
      studentNumber: raw.studentNumber || `2025-${String(1100 + index)}`,
      linkCode: raw.linkCode || `SCH-2026-L${index + 1}`,
      grade,
      className,
      motherName: raw.motherName || 'فاطمة محمد',
      birthDate: raw.birthDate || validation.birthDate || '2011-05-10',
      parentName: raw.parentName || `ولي أمر ${cleanName}`,
      parentPhone: this.normalizeNumbers(raw.parentPhone || '0912345678'),
      parentEmail: raw.parentEmail || `parent.${nationalNumber}@school.edu.ly`,
      gender: validation.inferredGender,
      status: 'present',
      attendanceRate: raw.attendanceRate || 96,
      academicAverage: raw.academicAverage || 89,
      courseworkScore: raw.courseworkScore || 36,
      examScore: raw.examScore || 53,
      totalScore: raw.totalScore || 89,
      appreciation: 'ممتاز',
      behaviorRating: 'ممتاز',
      behaviorPointsTotal: 25,
      avatar: validation.inferredGender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      competencies: [],
      behaviorPoints: [],
      subjects: [
        { name: 'الرياضيات', score: 90, maxScore: 100, teacher: 'أ. طارق الفيتوري', evaluation: 'ممتاز' },
        { name: 'اللغة العربية', score: 92, maxScore: 100, teacher: 'أ. عبدالسلام الورفلي', evaluation: 'ممتاز' },
        { name: 'العلوم الطبيعية', score: 88, maxScore: 100, teacher: 'أ. مريم الترهوني', evaluation: 'ممتاز' },
        { name: 'اللغة الإنجليزية', score: 85, maxScore: 100, teacher: 'أ. فاطمة الزوي', evaluation: 'ممتاز' },
        { name: 'الحاسوب', score: 95, maxScore: 100, teacher: 'أ. أسامة المقريف', evaluation: 'ممتاز' }
      ]
    };
  }

  /**
   * استيراد وتدقيق بيانات المعلمين الذكي
   */
  static completeTeacherData(raw: Partial<TeacherAccount>, index: number): TeacherAccount {
    const rawName = String(raw.name || `معلم جديد ${index + 1}`).trim();
    const cleanName = this.sanitizeArabicName(rawName) || rawName;
    const nationalNumber = this.normalizeNumbers(raw.nationalNumber || `11985${String(1000000 + index).slice(-7)}`);

    return {
      id: raw.id || `tch-smart-${Date.now()}-${index}`,
      code: raw.code || `LIB-TCH-${String(100 + index)}`,
      name: cleanName,
      phone: this.normalizeNumbers(raw.phone || '0912345678'),
      subject: raw.subject || 'الرياضيات',
      subjectCode: raw.subjectCode || 'MATH',
      assignedClasses: raw.assignedClasses && raw.assignedClasses.length > 0 ? raw.assignedClasses : ['7/أ', '7/ب'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      email: raw.email || `teacher.${index + 1}@school.edu.ly`,
      nationalNumber,
      fileNumber: raw.fileNumber || `WSH-${8000 + index}`,
      qualification: raw.qualification || 'بكالوريوس علوم تربوية',
      specialization: raw.specialization || raw.subject || 'التعليم الأساسي',
      teachingQuota: raw.teachingQuota || 20,
      assignedPeriodsCount: raw.assignedPeriodsCount || 18,
      appointmentDate: raw.appointmentDate || '2015-09-01',
      status: 'active',
      notes: 'تم التدقيق والتوليد الذكي'
    };
  }
}
