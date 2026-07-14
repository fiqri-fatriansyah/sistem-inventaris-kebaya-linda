---
trigger: always_on
---

# Constraints and Rules
Confirm with me before running any terminal test command or modifying more than 2 files at once.
Always respond in English.
Always write implementation plan and task in English.
Write walkthrough in 2 versions: English and Indonesian.
Always add new feedbacks and request into Notes.md in format: [timestamp]\n-feedback1\n-feedback2\n-feedback<n>

# UI UX
Minimum font size must be configurable with default of 18px and every single font in every component must adhere to minimum font size regardless of PWA.
Font choice must be the clean font (Arial, Calibri, Sans Serif, etc.) and must be consistent.
Adhere to PWA.

# Security
Always scan and check external references for vulnerabilities and attack report before downloading and using new package.

# Language
The application back-end must be in English.
The application front-end UI language must be in Indonesian.

# Tech Stack
Must only use MEVN stack.
Use TypeScript for this project.
Use Vue 3 for this project.
Use Nuxt 4 for this project.
Never install another MEVN stack independently and instead ask me to download or configure the stack for this project.
Always use npm for this project.

# Version Control
Use git for this project.
Connect with my Github account.
Always use commit when needed, with proper message.
Always create a new branch for new features or bug fixes.
Always use proper naming convention for the branch names.
Always push the branch to the remote repository after commit.
.agent/rules and docs/Notes.md must not be inside main, but must be inside other branches.
Readme.md must not mention existence of .agent/rules and docs/Notes.md inside main, but must be mentioned inside other branches.

# Test Cases
For every new or perceived major modification of use case, add or modify test cases, including general and edge cases.

# Documentation
Always document the code changes in the documentation files.
Documentation file is located at `docs/`.
Documentation file is in Markdown format.
Documentation must always be updated.