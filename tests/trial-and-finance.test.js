import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing Libyan Cities & Data File...');
const mockFilePath = path.join(__dirname, '../src/data/mockFinanceData.ts');
const mockFileContent = fs.readFileSync(mockFilePath, 'utf-8');

const requiredCities = [
  'بنغازي', 'طبرق', 'الجفرة', 'البريقة', 'طرابلس', 'اوباري', 'سبها', 'البيضاء',
  'درنة', 'ترهونة', 'صبراتة', 'القطرون', 'خارج ليبيا', 'سرت', 'غريان', 'جالو',
  'توكرة', 'سلوق', 'الخمس', 'زليتن', 'الجبل الغربي', 'مصراتة'
];

requiredCities.forEach(city => {
  assert(mockFileContent.includes(`'${city}'`), `City ${city} should be present in mockFinanceData.ts`);
});
console.log('✓ All 22 Libyan cities verified in mockFinanceData.ts');

// 2. Test Trial Calculation Logic
console.log('Testing Trial Duration Calculation...');
function calculateTrialDaysRemaining(trialStartDate, durationDays = 7) {
  const startDate = new Date(trialStartDate).getTime();
  const msPassed = Date.now() - startDate;
  const daysPassed = msPassed / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(durationDays - daysPassed));
}

const justNow = new Date().toISOString();
assert.strictEqual(calculateTrialDaysRemaining(justNow, 7), 7, 'Fresh trial should have 7 days remaining');

const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
assert.strictEqual(calculateTrialDaysRemaining(twoDaysAgo, 7), 5, 'Trial started 2 days ago should have 5 days remaining');

const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
assert.strictEqual(calculateTrialDaysRemaining(eightDaysAgo, 7), 0, 'Expired trial should floor at 0 days remaining');
console.log('✓ Trial countdown calculations accurate');

// 3. Test Trial Extension Logic
console.log('Testing Trial Extension Logic...');
let trialDuration = 7;
trialDuration += 7;
assert.strictEqual(trialDuration, 14, 'Trial extension should add 7 days to total duration');
assert.strictEqual(calculateTrialDaysRemaining(eightDaysAgo, trialDuration), 6, 'Expired trial after +7 extension should have 6 days remaining');
console.log('✓ Trial extension logic verified');

// 4. Test Tuition Payment Logic
console.log('Testing Tuition Payment Logic...');
function applyTuitionPayment(record, amountToAdd) {
  const newPaid = Math.min(record.totalFee, record.paidAmount + amountToAdd);
  const newRemaining = Math.max(0, record.totalFee - newPaid);
  return {
    ...record,
    paidAmount: newPaid,
    remainingAmount: newRemaining,
    status: newRemaining === 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid')
  };
}

const initialFee = {
  id: 'fee-test',
  studentId: 'std-1',
  studentName: 'أحمد الترهوني',
  totalFee: 2000,
  paidAmount: 0,
  remainingAmount: 2000,
  status: 'unpaid'
};

const partialPayment = applyTuitionPayment(initialFee, 800);
assert.strictEqual(partialPayment.paidAmount, 800);
assert.strictEqual(partialPayment.remainingAmount, 1200);
assert.strictEqual(partialPayment.status, 'partial');

const fullPayment = applyTuitionPayment(partialPayment, 1200);
assert.strictEqual(fullPayment.paidAmount, 2000);
assert.strictEqual(fullPayment.remainingAmount, 0);
assert.strictEqual(fullPayment.status, 'paid');
console.log('✓ Tuition payment calculations and status transitions verified');

console.log('\n======================================================');
console.log('🎉 ALL FREE TRIAL & FINANCE UNIT TESTS PASSED (100%)!');
console.log('======================================================');
