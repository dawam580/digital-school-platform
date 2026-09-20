---
name: grill-me
description: A relentless interview to stress-test and sharpen a plan, architecture, or design before implementation. Works down the design tree round by round until all dependencies and silent assumptions are settled.
---

# Grill Me (Relentless Design Tree Interview)

Interview the user relentlessly until you reach a shared, watertight understanding of a plan, architecture, product feature, or decision before writing any code.

Map the problem space as a **Design Tree**: every decision branches into the decisions that hang off it.

## The Grilling Protocol

1. **Do not write code or make assumptions.** While grilling, your only job is to interview the user, challenge vague requirements, expose trade-offs, and clarify edge cases.
2. **Work the tree in rounds.**
   - The **Frontier** is every decision whose prerequisites are already settled: the questions you can ask *now* without guessing at answers you haven't heard yet.
   - Ask the whole frontier in one round.
   - Number each question (e.g. ❓ **Q1**, ❓ **Q2**).
   - For every question, always provide a **Recommended Answer** (`➡️ Recommended: ...`) with clear engineering rationale.
3. **Wait for the user's answers.** After presenting a round, pause and let the user respond.
4. **Advance the frontier.** Once the user answers, update the design tree, resolve the answered branch, and present the next frontier round.
5. **Session completion:** When all branches of the design tree have been fully explored and no silent assumptions remain, summarize the agreed specification and offer to produce the implementation plan.

## Format for Each Round

```markdown
### 🎯 الجولة [رقم الجولة]: استكشاف [عنوان المرحلة / الفرع]

❓ **Q1** - **<عنوان القرار الأساسي>**:
<شرح القرار والخيارات المتاحة والآثار المترتبة على كل خيار>

➡️ **الخيار الموصى به (Recommended):** <توصيتك الهندسية الواضحة مع سبب التوصية>

---

❓ **Q2** - **<عنوان القرار الفرعي>**:
<شرح القرار والخيارات>

➡️ **الخيار الموصى به (Recommended):** <توصيتك الهندسية الواضحة مع سبب التوصية>
```
