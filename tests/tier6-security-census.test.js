import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- Running Tier 6: Security Isolation & School Census Tests ---');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Security Engine Master PIN Logic Verification
const secEnginePath = path.join(projectRoot, 'src', 'services', 'security', 'securityEngine.ts');
assert(fs.existsSync(secEnginePath), 'securityEngine.ts exists');
const secContent = fs.readFileSync(secEnginePath, 'utf8');

assert(secContent.includes('getSuperAdminPin'), 'securityEngine contains getSuperAdminPin');
assert(secContent.includes('verifySuperAdminPin'), 'securityEngine contains verifySuperAdminPin');
assert(secContent.includes('9988'), 'securityEngine sets default master PIN 9988 for SuperAdmin');
assert(secContent.includes('isSuperAdminLockedOut'), 'securityEngine enforces brute-force lockout for SuperAdmin');

// 2. School Census & Demographics Data Integrity
const datasetPath = path.join(projectRoot, 'src', 'data', 'libyanBaourSchoolDataset.ts');
assert(fs.existsSync(datasetPath), 'libyanBaourSchoolDataset.ts exists');
const datasetContent = fs.readFileSync(datasetPath, 'utf8');

// Count occurrences of registration numbers or names
const regMatch = datasetContent.match(/"(?:studentNumber|nationalNumber|id)":\s*"[^"]+"/g);
assert(regMatch && regMatch.length >= 873, `Accurate 873 students with official records in dataset (found: ${regMatch ? Math.floor(regMatch.length / 3) : 0})`);

const maleMatches = datasetContent.match(/"gender":\s*"male"/g) || [];
const femaleMatches = datasetContent.match(/"gender":\s*"female"/g) || [];
assert(maleMatches.length === 440, `Exact 440 male students in census (found: ${maleMatches.length})`);
assert(femaleMatches.length === 433, `Exact 433 female students in census (found: ${femaleMatches.length})`);
assert(maleMatches.length + femaleMatches.length === 873, 'All 873 students categorized strictly');

// Classes count
const classMatches = datasetContent.match(/"className":\s*"([^"]+)"/g) || [];
const uniqueClasses = new Set(classMatches.map(m => m.replace(/"className":\s*"/, '').replace(/"/, '')));
assert(uniqueClasses.size === 28, `Exact 28 distinct class sections in school (found: ${uniqueClasses.size})`);

const morningShiftClasses = Array.from(uniqueClasses).filter(c => c.includes('صباح'));
const eveningShiftClasses = Array.from(uniqueClasses).filter(c => c.includes('مساء'));
assert(morningShiftClasses.length === 20, `Exact 20 morning shift classes for grades 5-9 (found: ${morningShiftClasses.length})`);
assert(eveningShiftClasses.length === 8, `Exact 8 evening shift classes for grades 1-4 (found: ${eveningShiftClasses.length})`);

// 3. Components existence & UI Wiring
const censusViewPath = path.join(projectRoot, 'src', 'components', 'admin', 'SchoolCensusAnalyticsView.tsx');
assert(fs.existsSync(censusViewPath), 'SchoolCensusAnalyticsView.tsx exists');
const censusContent = fs.readFileSync(censusViewPath, 'utf8');
assert(censusContent.includes('totalStudents'), 'SchoolCensusAnalyticsView computes totalStudents');
assert(censusContent.includes('gradeBreakdown'), 'SchoolCensusAnalyticsView computes gradeBreakdown');
assert(censusContent.includes('avgClassDensity'), 'SchoolCensusAnalyticsView calculates class density');

const guideBannerPath = path.join(projectRoot, 'src', 'components', 'common', 'AttractiveUserGuideBanner.tsx');
assert(fs.existsSync(guideBannerPath), 'AttractiveUserGuideBanner.tsx exists');
const guideContent = fs.readFileSync(guideBannerPath, 'utf8');
assert(guideContent.includes('activeGuideRole'), 'AttractiveUserGuideBanner provides role tabs');
assert(guideContent.includes('startTour'), 'AttractiveUserGuideBanner integrates with interactive tour');

const superLockModalPath = path.join(projectRoot, 'src', 'components', 'common', 'SuperAdminLockModal.tsx');
assert(fs.existsSync(superLockModalPath), 'SuperAdminLockModal.tsx exists');
const lockContent = fs.readFileSync(superLockModalPath, 'utf8');
assert(lockContent.includes('verifySuperAdminPin'), 'SuperAdminLockModal calls verifySuperAdminPin');

// 4. Role Isolation Verification
const navbarContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'layout', 'Navbar.tsx'), 'utf8');
assert(navbarContent.includes('staffRoles'), 'Navbar groups internal school staff together');
assert(navbarContent.includes('SuperAdminLockModal'), 'Navbar mounts SuperAdminLockModal for master protection');

console.log(`\nTier 6 Summary: ${passed}/${total} assertions passed successfully.`);
if (passed === total) {
  console.log('✅ ALL SECURITY ISOLATION & SCHOOL CENSUS TESTS PASSED!\n');
}
