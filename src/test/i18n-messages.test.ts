import { describe, expect, it } from 'vitest'
import { ROLE_LABELS } from '@/constants/roles'
import { MESSAGES, translate, type MessageKey } from '@/lib/i18n/messages'
import { ERROR_MESSAGE_KEYS } from '@/lib/i18n/userFacingText'
import { statusLabel } from '@/lib/i18n/userFacingText'

const BN_EMPTY_ALLOWLIST = new Set<MessageKey>(['demoLabel', 'demoPrototypeNotice', 'locationSyntheticUnionDemoSuffix'])

describe('i18n message catalog', () => {
  it('has bn text for every en key except allowlist', () => {
    for (const key of Object.keys(MESSAGES.en) as MessageKey[]) {
      const bn = MESSAGES.bn[key]
      if (BN_EMPTY_ALLOWLIST.has(key)) continue
      expect(bn.trim().length, key).toBeGreaterThan(0)
    }
  })

  it('maps every ERROR_MESSAGE_KEYS value to an en message key', () => {
    for (const messageKey of Object.values(ERROR_MESSAGE_KEYS)) {
      expect(MESSAGES.en[messageKey]).toBeDefined()
    }
  })

  it('uses glossary terms in bn spot checks', () => {
    expect(ROLE_LABELS.fieldOfficer.bn).toBe('মাঠ কর্মকর্তা')
    expect(translate('bn', 'officialMarketAvg')).toBe('সরকারi গড় বাজারদর')
    expect(statusLabel('bn', 'approvalStatus', 'pending')).toBe('অপেক্ষমান')
    expect(statusLabel('bn', 'syncStatus', 'DRAFT')).toBe('খসড়া')
    expect(translate('bn', 'dashboard')).not.toMatch(/\b[a-zA-Z]{3,}\b/)
    expect(translate('bn', 'available')).not.toMatch(/\b[a-zA-Z]{3,}\b/)
    expect(translate('bn', 'submitOffer')).not.toMatch(/\b[a-zA-Z]{3,}\b/)
    expect(translate('bn', 'selectOfferAction')).toBe('এই অফারটি বেছে নিন')
    expect(translate('bn', 'selectOfferBeforeBid')).not.toMatch(/\b[a-zA-Z]{3,}\b/)
  })

  it('maps every service err message string in src to ERROR_MESSAGE_KEYS or MessageKey', () => {
    const rawModules = import.meta.glob(['../**/*.ts', '../**/*.tsx'], {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>
    const found = new Set<string>()
    const re = /message: '([^']+)'/g
    for (const [file, content] of Object.entries(rawModules)) {
      if (file.includes('/test/')) continue
      let m: RegExpExecArray | null
      while ((m = re.exec(content))) {
        found.add(m[1])
      }
    }
    const unmapped: string[] = []
    for (const msg of found) {
      if (ERROR_MESSAGE_KEYS[msg]) continue
      if (msg in MESSAGES.en) continue
      unmapped.push(msg)
    }
    expect(unmapped).toEqual([])
  })
})
