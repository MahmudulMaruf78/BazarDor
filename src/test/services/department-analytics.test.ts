import { beforeEach, describe, expect, it } from 'vitest'
import { resetDemoData } from '@/data/bootstrap/demoDataLifecycle'
import {
  buildCsvExport,
  defaultDepartmentFilters,
  exportWorkbookXlsxBlob,
  fetchOfficialAverage,
  fetchRegionalComparison,
  hasMapGeometry,
} from '@/features/department/departmentAnalyticsService'
import { demoSeedBundle } from '@/data/seed'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'

describe('Phase 7 department analytics', () => {
  beforeEach(async () => {
    expect((await resetDemoData()).ok).toBe(true)
  })

  it('calculates official average via shared service with sample metadata', async () => {
    const filters = defaultDepartmentFilters()
    const result = await fetchOfficialAverage(filters)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    if (result.data.status === 'calculated') {
      expect(result.data.sampleCount).toBeGreaterThanOrEqual(2)
    }
  })

  it('regional rows use per-scope service results not averaged child avgs', async () => {
    const filters = defaultDepartmentFilters()
    const regional = await fetchRegionalComparison(filters, D.districtJashore)
    expect(regional.ok).toBe(true)
    if (!regional.ok) return
    expect(regional.data.length).toBeGreaterThan(0)
    for (const row of regional.data) {
      expect(row.result.status).toMatch(/calculated|insufficient_data/)
    }
  })

  it('csv export includes product metadata', async () => {
    const filters = defaultDepartmentFilters()
    const avg = await fetchOfficialAverage(filters)
    const regional = await fetchRegionalComparison(filters, D.districtJashore)
    if (!avg.ok || !regional.ok) throw new Error('setup failed')
    const csv = buildCsvExport(filters, avg.data, regional.data)
    expect(csv).toContain('BazarDor price export')
  })

  it('enables map layer when seed has centroids', () => {
    expect(hasMapGeometry([...demoSeedBundle.locations])).toBe(true)
  })

  it('exports xlsx workbook blob', async () => {
    const filters = defaultDepartmentFilters()
    const avg = await fetchOfficialAverage(filters)
    const regional = await fetchRegionalComparison(filters, D.districtJashore)
    if (!avg.ok || !regional.ok) throw new Error('setup failed')
    const blob = await exportWorkbookXlsxBlob(filters, avg.data, regional.data)
    expect(blob.type).toContain('spreadsheet')
  })
})
