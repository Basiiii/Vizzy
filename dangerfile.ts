import { danger, fail, warn, message } from 'danger'

const pr = danger.github.pr

// 1️⃣ Warn if PR is too big
const bigPRThreshold = 500
const additions = pr.additions
const deletions = pr.deletions
if (additions + deletions > bigPRThreshold) {
  warn(`This PR is big (${additions + deletions} lines). Consider splitting it up.`)
}

// 2️⃣ Fail if PR description is missing or too short
if (!pr.body || pr.body.length < 10) {
  fail('Please add a meaningful PR description.')
}

// 3️⃣ Warn if title doesn't follow naming convention (e.g., feat/xxx, fix/xxx)
const validPrefixes = ['feat/', 'fix/', 'chore/', 'refactor/', 'test/', 'docs/']
const title = pr.title.toLowerCase()
const hasValidPrefix = validPrefixes.some((prefix) => title.startsWith(prefix))
if (!hasValidPrefix) {
  fail(`PR title should start with one of: ${validPrefixes.join(', ')}`)
}

// 4️⃣ Warn if no tests were modified (encourages test coverage)
const modifiedFiles = danger.git.modified_files.concat(danger.git.created_files)
const testModified = modifiedFiles.some((file) =>
  file.match(/\.test\.(ts|tsx)$|\.spec\.(ts|tsx)$/)
)
if (!testModified) {
  warn('No test files were updated in this PR. Make sure you have adequate test coverage.')
}

const forbiddenFiles = ['.env', '.env.local', '.env.production', 'firebaseConfig.ts']
const hasSensitiveFiles = modifiedFiles.some((file) =>
  forbiddenFiles.some((sensitive) => file.includes(sensitive))
)

if (hasSensitiveFiles) {
  fail('🚨 Do not commit sensitive files like `.env` or credentials.')
}

const maxFilesChanged = 20
if (modifiedFiles.length > maxFilesChanged) {
  warn(`This PR touches ${modifiedFiles.length} files. Might be hard to review 😅`)
}
