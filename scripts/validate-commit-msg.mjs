import { readFileSync } from 'node:fs'

const commitMessageFilePath = process.argv[2]

if (!commitMessageFilePath) {
  console.error('Commit message file path is required.')
  process.exit(1)
}

const commitMessage = readFileSync(commitMessageFilePath, 'utf8').trim()

if (!commitMessage) {
  console.error('Commit message cannot be empty.')
  process.exit(1)
}

if (commitMessage.startsWith('Merge ') || commitMessage.startsWith('Revert "')) {
  process.exit(0)
}

const lines = commitMessage.split('\n')
const header = lines[0]

const allowedTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
]

const headerPattern = new RegExp(
  `^(${allowedTypes.join('|')})(\\([a-z0-9./_-]+\\))?(!)?: [^\\s].+$`
)

if (!headerPattern.test(header)) {
  console.error(`Invalid commit message header: "${header}"`)
  console.error('')
  console.error('Expected format: <type>[optional scope]: <description>')
  console.error('Examples:')
  console.error('  feat(auth): add social login')
  console.error('  fix(api): handle empty refresh token')
  console.error('  refactor!: remove legacy session format')
  console.error('')
  console.error(`Allowed types: ${allowedTypes.join(', ')}`)
  process.exit(1)
}

const hasBang = header.includes('!:')
const breakingFooterIndex = lines.findIndex(line => line.startsWith('BREAKING CHANGE:'))

if (breakingFooterIndex !== -1) {
  const hasBlankLineBeforeFooter =
    breakingFooterIndex > 0 && lines[breakingFooterIndex - 1].trim() === ''

  if (!hasBlankLineBeforeFooter) {
    console.error('BREAKING CHANGE footer must be separated by a blank line.')
    process.exit(1)
  }
}

if (hasBang || breakingFooterIndex !== -1) {
  const hasBreakingMarker = hasBang || breakingFooterIndex !== -1

  if (!hasBreakingMarker) {
    console.error('Breaking changes must use "!" in the header or a BREAKING CHANGE footer.')
    process.exit(1)
  }
}
