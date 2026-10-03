/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك الذكاء الاصطناعي والتدقيق الذكي لاستيراد ملفات الطلاب والمعلمين
 * Libyan Smart Data & Identity Intelligence Engine
 * ============================================================================
 */

import { Student, TeacherAccount } from '../../types';
import { getCleanAvatar } from '../../utils/avatarHelper';
import { studentFromRosterRow, cleanNationalNumber, gradeFromClassName } from '../importers/rosterSanitizer';


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
      warnings.push('الرقم الوطني مفقود — يُستكمل يدوياً');
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
    const rawName = String(raw.name || '').trim();
    const validation = this.validateAndInferLibyanId(raw.nationalNumber || raw.nationalId || '', rawName);
    const className = String(raw.className || '').trim();
    // الصف من رقم الفصل إن لم يُذكر (5/1 ← الصف الخامس الأساسي) — اشتقاق لا تخمين
    const gradeFromClass = gradeFromClassName(className);
    const student = studentFromRosterRow({
      name: validation.sanitizedName || rawName,
      nationalNumber: validation.sanitizedNationalId,
      studentNumber: raw.studentNumber,
      grade: raw.grade || gradeFromClass,
      className,
      motherName: raw.motherName,
      birthDate: raw.birthDate,
      birthPlace: raw.birthPlace,
      parentName: raw.parentName,
      parentPhone: raw.parentPhone,
      gender: raw.gender || (validation.sanitizedNationalId.length === 12 ? undefined : validation.inferredGender),
    }, index, 'std-smart');
    // اسم فارغ: نُبقي سجلاً يظهر في المعاينة ليصححه المستخدم بدل إسقاطه بصمت
    return student || { ...studentFromRosterRow({ name: `صف ${index + 2} بلا اسم` }, index, 'std-smart')! };
  }

  /**
   * استيراد وتدقيق بيانات المعلمين الذكي
   */
  static completeTeacherData(raw: Partial<TeacherAccount>, index: number): TeacherAccount {
    const rawName = String(raw.name || `معلم جديد ${index + 1}`).trim();
    const cleanName = this.sanitizeArabicName(rawName) || rawName;
    const nationalNumber = cleanNationalNumber(raw.nationalNumber);

    return {
      id: raw.id || `tch-smart-${Date.now()}-${index}`,
      code: raw.code || `LIB-TCH-${String(100 + index)}`,
      name: cleanName,
      phone: this.normalizeNumbers(raw.phone || ''),
      subject: raw.subject || 'الرياضيات',
      subjectCode: raw.subjectCode || 'MATH',
      assignedClasses: raw.assignedClasses || [],
      avatar: getCleanAvatar(cleanName, 'teacher'),
      email: raw.email || '',
      nationalNumber,
      fileNumber: raw.fileNumber || '',
      qualification: raw.qualification || '',
      specialization: raw.specialization || raw.subject || 'التعليم الأساسي',
      teachingQuota: raw.teachingQuota || 20,
      assignedPeriodsCount: raw.assignedPeriodsCount || 0,
      appointmentDate: raw.appointmentDate || '',
      status: 'active',
      notes: ''
    };
  }
}
