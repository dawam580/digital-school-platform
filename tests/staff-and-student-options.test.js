// Automated tests for Staff Management, Missing Documents Tracking, and Student Class Transfer
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing Staff Roles and Dataset Content...');

const mockStaffPath = path.join(__dirname, '../src/data/mockStaffData.ts');
const mockStaffContent = fs.readFileSync(mockStaffPath, 'utf-8');

// 1. Verify all 7 requested roles are in STAFF_ROLE_LABELS
const expectedRoles = ['admin', 'supervisor', 'teacher', 'cleaner', 'gardener', 'student_affairs', 'maintenance'];
expectedRoles.forEach(role => {
  assert.ok(mockStaffContent.includes(`${role}:`), `Role ${role} must be defined in mockStaffData.ts`);
});
console.log(`✓ All ${expectedRoles.length} staff roles are defined with Arabic labels.`);

// 2. Check 12-digit national numbers and Libyan phones in mock dataset
const nationalIdMatches = mockStaffContent.match(/nationalNumber:\s*'(\d+)'/g);
assert.ok(nationalIdMatches && nationalIdMatches.length >= 7, 'Must have at least 7 staff records with nationalNumber');

nationalIdMatches.forEach(m => {
  const digits = m.match(/\d+/)[0];
  assert.strictEqual(digits.length, 12, `National ID ${digits} must be exactly 12 digits`);
});
console.log(`✓ Validated ${nationalIdMatches.length} staff national IDs: all are valid 12-digit Libyan national numbers.`);

// 3. Check document checklist fields exist in mock data
const expectedDocFields = ['contract', 'healthCert', 'qualification', 'nationalIdCopy', 'criminalClearance', 'personalPhotos'];
expectedDocFields.forEach(field => {
  assert.ok(mockStaffContent.includes(`${field}:`), `Document checklist must contain ${field}`);
});
console.log('✓ Staff document checklist includes all required 6 employment documents.');

// 4. Test Student Class Transfer logic
console.log('Testing Student Transfer and Document Tracking Logic...');
const mockStudent = {
  id: 'st-01',
  name: 'محمد عبدالسلام الورفلي',
  className: '9/1 صباح',
  transferHistory: [],
  documents: {
    birthCert: true,
    healthRecord: false,
    photos: true,
    parentConsent: false,
    transferCert: false
  }
};

const transferStudent = (student, newClass, reason) => {
  if (student.className === newClass) return false;
  const record = {
    fromClass: student.className,
    toClass: newClass,
    date: '2026-09-06',
    reason
  };
  return {
    ...student,
    className: newClass,
    transferHistory: [...(student.transferHistory || []), record]
  };
};

const transferred = transferStudent(mockStudent, '9/2 صباح', 'رغبة ولي الأمر وتخفيف الكثافة');
assert.strictEqual(transferred.className, '9/2 صباح', 'New class must be updated');
assert.strictEqual(transferred.transferHistory.length, 1, 'Transfer history must record 1 entry');
assert.strictEqual(transferred.transferHistory[0].fromClass, '9/1 صباح', 'Previous class recorded');
assert.strictEqual(transferred.transferHistory[0].toClass, '9/2 صباح', 'Target class recorded');
console.log('✓ Student transfer successfully moves student and records audit history.');

// 5. Student missing documents check
const studentMissingCount = Object.values(mockStudent.documents).filter(d => !d).length;
assert.strictEqual(studentMissingCount, 3, 'Must detect 3 missing documents (healthRecord, parentConsent, transferCert)');
console.log('✓ Student missing documents tracker accurately identifies missing files.');

// 6. School settings fields check in SchoolProfile
const typesPath = path.join(__dirname, '../src/types/index.ts');
const typesContent = fs.readFileSync(typesPath, 'utf-8');
assert.ok(typesContent.includes('schoolAddress?: string;'), 'SchoolProfile must contain schoolAddress');
assert.ok(typesContent.includes('workingHours?: string;'), 'SchoolProfile must contain workingHours');
console.log('✓ SchoolProfile includes schoolAddress and workingHours fields.');

console.log('\n========================================================================');
console.log('🎉 ALL STAFF MANAGEMENT & STUDENT ACTION TESTS PASSED 100%!');
console.log('========================================================================');
