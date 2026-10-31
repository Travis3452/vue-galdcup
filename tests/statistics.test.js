import { test } from 'node:test'
import assert from 'node:assert/strict'
import { koreaDate, isActivityPage, createActivityReporter } from '../src/utils/activity.js'
import { signupChartPoints, formatDay } from '../src/utils/statistics.js'

test('Korean calendar crosses the date boundary at 15:00 UTC', () => {
  assert.equal(koreaDate(new Date('2026-10-31T14:59:59Z')), '2026-10-31')
  assert.equal(koreaDate(new Date('2026-10-31T15:00:00Z')), '2026-11-01')
})
test('admin screens and auth callback cannot count as activity', () => {
  for (const path of ['/admin/statistics', '/admin/monitoring', '/auth/callback/google', '/privacy']) assert.equal(isActivityPage(path), false)
  for (const path of ['/', '/mypage', '/boards/1/posts/2']) assert.equal(isActivityPage(path), true)
})
test('activity is deduplicated while pending and after success, then resets on a new day or user', async () => {
  let resolve, calls = 0, day = '2026-10-31'
  const reporter = createActivityReporter(() => { calls++; return new Promise(done => { resolve = done }) }, { day: () => day })
  const pending = reporter.report(1)
  assert.equal(await reporter.report(1), false)
  resolve(); assert.equal(await pending, true)
  assert.equal(await reporter.report(1), false)
  day = '2026-11-01'
  const next = reporter.report(1); resolve(); await next
  const another = reporter.report(2); resolve(); await another
  assert.equal(calls, 3)
})
test('failed activity is retried after backoff and cancelled sessions cannot mark success', async () => {
  let now = 0, calls = 0, resolve
  const reporter = createActivityReporter(async () => { calls++; if (calls === 1) throw Error('offline') }, { day: () => '2026-10-31', now: () => now })
  assert.equal(await reporter.report(1), false)
  assert.equal(await reporter.report(1), false)
  now = 30000; assert.equal(await reporter.report(1), true)
  const pendingReporter = createActivityReporter(() => new Promise(done => { resolve = done }))
  const pending = pendingReporter.report(1); pendingReporter.reset(); resolve()
  assert.equal(await pending, false)
})
test('chart conversion preserves missing data and midnight in Korea', () => {
  const points = signupChartPoints([{ date: '2026-11-01', count: null }, { date: '2026-11-02', count: 0 }])
  assert.equal(points[0].timestamp, Date.parse('2026-10-31T15:00:00Z'))
  assert.equal(points[0].value, null)
  assert.equal(points[1].value, 0)
  assert.equal(formatDay(null), '아직 없음')
})
