import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatMetric, formatBytes, statusLabel, hasChartValues } from '../src/utils/monitoring.js'

test('missing values remain distinct from a measured zero', () => {
  for (const value of [null, undefined, NaN, Infinity, '0']) assert.equal(formatMetric(value), '—')
  assert.equal(formatMetric(0), '0')
  assert.equal(formatMetric(1.234, 2), '1.23')
})
test('memory uses binary units without guessing missing values', () => {
  assert.equal(formatBytes(0), '0 B')
  assert.equal(formatBytes(1024), '1 KiB')
  assert.equal(formatBytes(1048576), '1 MiB')
  assert.equal(formatBytes(null), '—')
  assert.equal(formatBytes(-1), '—')
})
test('unknown service states cannot be displayed as normal', () => {
  assert.equal(statusLabel('UP'), '정상')
  assert.equal(statusLabel('DOWN'), '연결 실패')
  assert.equal(statusLabel(undefined), '확인 불가')
})
test('charts display measured zero but not absent or invalid samples', () => {
  assert.equal(hasChartValues([]), false)
  assert.equal(hasChartValues([{ value: null }, { value: NaN }]), false)
  assert.equal(hasChartValues([{ value: 0 }]), true)
})
