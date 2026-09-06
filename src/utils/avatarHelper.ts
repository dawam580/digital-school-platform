/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * منشئ الهوية البصرية وشارات الطلاب والمعلمين الرسمية (Vector SVG Badges)
 * يلغي الصور الوهمية ويولد شارات احترافية بنقوش عربية وأيقونات رسمية
 * ============================================================================
 */

export const getCleanAvatar = (
  name: string = '',
  roleOrGender: 'male' | 'female' | 'teacher' | 'admin' | 'staff' | 'counselor' | string = 'male'
): string => {
  const cleanName = (name || '').trim();
  let initial = cleanName
    ? cleanName.replace(/^(?:أ\.|أستاذ|أستاذة|د\.|طالب|طالبة|الشيخ|الأستاذ|الأستاذة)\s*/, '').charAt(0)
    : 'ط';
  if (!initial || initial === ' ') initial = 'م';

  let bg1 = '#1e3a8a'; // Deep blue
  let bg2 = '#0284c7'; // Sky blue
  let badgeIcon = '👦';

  const type = roleOrGender.toLowerCase();

  if (type === 'female') {
    bg1 = '#831843'; // Deep pink/rose
    bg2 = '#db2777'; // Vibrant rose
    badgeIcon = '👧';
  } else if (type === 'teacher') {
    bg1 = '#064e3b'; // Deep emerald
    bg2 = '#059669'; // Emerald
    badgeIcon = '👨‍🏫';
  } else if (type === 'admin' || type === 'superadmin') {
    bg1 = '#311042'; // Royal purple
    bg2 = '#7c3aed'; // Violet
    badgeIcon = '🏛️';
  } else if (type === 'counselor' || type === 'staff') {
    bg1 = '#78350f'; // Amber brown
    bg2 = '#d97706'; // Amber
    badgeIcon = '📋';
  }

  const gradId = 'avGrad_' + Math.abs(hashString(name + roleOrGender));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="36" fill="url(#${gradId})"/>
  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <text x="50%" y="42%" text-anchor="middle" font-size="36" font-family="system-ui, -apple-system, sans-serif" fill="#ffffff" dy=".3em">${badgeIcon}</text>
  <text x="50%" y="82%" text-anchor="middle" font-size="28" font-weight="900" font-family="Cairo, Tahoma, Arial, sans-serif" fill="#ffffff">${initial}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
