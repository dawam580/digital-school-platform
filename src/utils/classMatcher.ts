/**
 * ============================================================================
 * منصة المدرسة الرقمية | Libyan School Class Matching Engine
 * محرك مطابقة وتوحيد أسماء الفصول الليبية (مستخرج الـ PDF، الإدخال اليدوي، والاختصارات)
 * يطابق بدقة 100%: 9/1 صباح <-> الصف التاسع أ <-> 9 أ <-> 9/أ <-> تاسع أ
 * ============================================================================
 */

export const normalizeClassQuery = (cls: string): string => {
  if (!cls) return '';
  let str = cls.trim();

  // 1. Remove prefixes like 'الصف' or 'صف'
  str = str.replace(/(?:الصف|صف)\s*/g, '');

  // 2. Normalize Grade names to standard digits
  str = str
    .replace(/(?:ال)?تاسع/g, '9')
    .replace(/(?:ال)?ثامن/g, '8')
    .replace(/(?:ال)?سابع/g, '7')
    .replace(/(?:ال)?سادس/g, '6')
    .replace(/(?:ال)?خامس/g, '5')
    .replace(/(?:ال)?رابع/g, '4')
    .replace(/(?:ال)?ثالث/g, '3')
    .replace(/(?:ال)?ثان(?:ي)?/g, '2')
    .replace(/(?:ال)?[أا]ول/g, '1');

  // 3. Normalize Section letters to section numbers (أ=1, ب=2, ج=3, د=4, هـ=5)
  str = str
    .replace(/[\/(\s\-_]+[أا][\)\s]*$/g, '/1')
    .replace(/[\/(\s\-_]+[ب][\)\s]*$/g, '/2')
    .replace(/[\/(\s\-_]+[ج][\)\s]*$/g, '/3')
    .replace(/[\/(\s\-_]+[د][\)\s]*$/g, '/4')
    .replace(/[\/(\s\-_]+[هـه][\)\s]*$/g, '/5');

  str = str
    .replace(/\/أ/g, '/1')
    .replace(/\/ب/g, '/2')
    .replace(/\/ج/g, '/3')
    .replace(/\/د/g, '/4')
    .replace(/\/هـ/g, '/5')
    .replace(/\/ه/g, '/5');

  // 4. Strip Shift tags (صباح، مساء)
  str = str.replace(/(?:صباحي?|مسائي?)/g, '').trim();

  // 5. Unify pattern "9 1" or "9-1" to standard "9/1"
  str = str.replace(/^([1-9])\s*[\/\-_ ]\s*([1-5])$/, '$1/$2');

  return str;
};

export const matchesClass = (studentClass: string | undefined, targetClass: string | undefined): boolean => {
  if (!studentClass || !targetClass) return false;
  if (studentClass === targetClass || studentClass.includes(targetClass)) return true;

  const normS = normalizeClassQuery(studentClass);
  const normT = normalizeClassQuery(targetClass);

  const targetBase = normT.split(' ')[0];
  const studentBase = normS.split(' ')[0];

  return normS.includes(normT) || (targetBase.length > 0 && studentBase === targetBase);
};

export const formatClassDisplayName = (className: string): string => {
  const norm = normalizeClassQuery(className);
  const parts = norm.split('/');
  if (parts.length === 2) {
    const gradeNum = parts[0];
    const secNum = parts[1];
    const secLetters = ['', 'أ', 'ب', 'ج', 'د', 'هـ'];
    const secLetter = secLetters[parseInt(secNum, 10)] || secNum;
    return `${className} (${gradeNum}/${secLetter})`;
  }
  return className;
};
