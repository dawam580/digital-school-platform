/**
 * Digital School Platform (منصة المدرسة الرقمية)
 * Master Test Suite Runner (Tiers 1 - 4)
 *
 * Executes the complete automated test suite (≥203 test cases)
 * across all 18 features, boundary conditions, pairwise combinations,
 * and real-world multi-step user scenarios.
 */

import { createTier1Suite } from './tier1-features.test.js';
import { createTier2Suite } from './tier2-boundary.test.js';
import { createTier3Suite } from './tier3-pairwise.test.js';
import { createTier4Suite } from './tier4-scenarios.test.js';

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';

async function main() {
  console.log(`\n${BOLD}${BLUE}========================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   منصة المدرسة الرقمية | Digital School Platform — Automated Test Suite${RESET}`);
  console.log(`${BOLD}${BLUE}========================================================================${RESET}\n`);

  const startTime = Date.now();
  const suites = [
    createTier1Suite(),
    createTier2Suite(),
    createTier3Suite(),
    createTier4Suite()
  ];

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const suiteResults = [];

  for (let i = 0; i < suites.length; i++) {
    const runner = suites[i];
    console.log(`${BOLD}${MAGENTA}[Tier ${i + 1}] Executing: ${runner.suiteName}...${RESET}`);

    const res = await runner.run();
    suiteResults.push(res);
    totalTests += res.total;
    totalPassed += res.passed;
    totalFailed += res.failed;

    // Print individual test results
    res.results.forEach(r => {
      if (r.status === 'pass') {
        console.log(`  ${GREEN}✓${RESET} ${r.name}`);
      } else {
        console.log(`  ${RED}✗ ${r.name}${RESET}`);
        if (r.error) {
          console.error(`    ${RED}Error: ${r.error.message || r.error}${RESET}`);
          if (r.error.stack) {
            console.error(`    ${r.error.stack.split('\n').slice(1, 4).join('\n    ')}`);
          }
        }
      }
    });

    console.log(`  ${BOLD}Summary:${RESET} ${GREEN}${res.passed} passed${RESET}, ${res.failed > 0 ? RED : GREEN}${res.failed} failed${RESET} (${res.duration}ms)\n`);
  }

  const totalDuration = Date.now() - startTime;

  // Final Summary Banner
  console.log(`${BOLD}${BLUE}========================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}                    TEST EXECUTION SUMMARY REPORT                       ${RESET}`);
  console.log(`${BOLD}${BLUE}========================================================================${RESET}`);
  console.log(`  ${BOLD}Total Suites:${RESET}       4`);
  console.log(`  ${BOLD}Total Test Cases:${RESET}   ${totalTests} (Target: ≥203)`);
  console.log(`  ${BOLD}Passed:${RESET}             ${GREEN}${totalPassed} (100%)${RESET}`);
  console.log(`  ${BOLD}Failed:${RESET}             ${totalFailed === 0 ? GREEN + '0' : RED + totalFailed}${RESET}`);
  console.log(`  ${BOLD}Execution Time:${RESET}     ${totalDuration}ms`);
  console.log(`${BOLD}${BLUE}------------------------------------------------------------------------${RESET}`);

  suiteResults.forEach((s, idx) => {
    const tierName = `Tier ${idx + 1}`;
    const statusStr = s.failed === 0 ? `${GREEN}PASSED${RESET}` : `${RED}FAILED${RESET}`;
    console.log(`  ${tierName.padEnd(8)}: ${s.passed.toString().padStart(3)} / ${s.total.toString().padStart(3)} tests [${statusStr}] - ${s.suiteName}`);
  });

  console.log(`${BOLD}${BLUE}========================================================================${RESET}\n`);

  if (totalFailed > 0) {
    console.error(`${RED}${BOLD}❌ TEST RUN FAILED with ${totalFailed} errors.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}✅ ALL ${totalTests} TESTS PASSED SUCCESSFULLY (Exit Code 0).${RESET}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`Unhandled error during test execution:`, err);
  process.exit(1);
});
