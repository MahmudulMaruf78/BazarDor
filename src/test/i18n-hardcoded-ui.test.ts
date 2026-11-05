import { describe, expect, it } from 'vitest'

const DENYLIST: RegExp[] = [
  /Viewer:/,
  /No match/,
  /BDT\/kg/,
  /sr-only">Close</,
  /Jashore District/,
  /: \$\{dot\.samples\} samples/,
  /\b(Dashboard|Submit|Available|Pending|Walkthrough)\b/,
]

const rawModules = import.meta.glob(
  [
    '../app/**/*.tsx',
    '../features/**/*.tsx',
    '../layouts/**/*.tsx',
    '../components/common/**/*.tsx',
    '../components/ui/**/*.tsx',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

describe('i18n hardcoded UI scan', () => {
  it('has no denylisted English literals in scanned tsx', () => {
    const hits: string[] = []
    for (const [file, text] of Object.entries(rawModules)) {
      for (const pattern of DENYLIST) {
        if (pattern.test(text)) hits.push(`${file}: ${pattern}`)
      }
    }
    expect(hits).toEqual([])
  })
})
