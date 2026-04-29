import { execSync } from 'node:child_process'

const diff = execSync('git diff -U0 HEAD -- src', { encoding: 'utf8' })
const added = diff.split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++'))
const tokenPattern = /\b(?:sm:|md:|lg:|xl:|2xl:)?(?:p[trblxy]?|m[trblxy]?|gap|grid-cols|flex|items|justify|rounded|border|text|bg|w|h|min|max|leading|tracking|shadow|opacity|ring)-[\w/[\].:%-]+\b/g
const violations = []
for (const line of added) {
  if (!line.includes('className')) continue
  const tokens = line.match(tokenPattern)
  if (tokens) violations.push({ line: line.trim(), tokens: [...new Set(tokens)] })
}
if (violations.length) {
  console.error('Tailwind-like utility tokens found in newly added className lines:')
  for (const v of violations) console.error(`- ${v.tokens.join(', ')} | ${v.line}`)
  process.exit(1)
}
console.log('No Tailwind-like utility tokens found in newly added className lines.')
