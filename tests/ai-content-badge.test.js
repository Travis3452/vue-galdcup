import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'

const { descriptor } = parse(readFileSync(new URL('../src/components/ui/AiContentBadge.vue', import.meta.url), 'utf8'))
const render = new Function('Vue', compile(descriptor.template.content, { mode: 'function', prefixIdentifiers: true }).code)(Vue)
const Badge = { props: { source: { type: String, default: 'UNKNOWN' } }, render }

test('AI source renders an explicit readable label', async () => {
  const html = await renderToString(Vue.createSSRApp(Badge, { source: 'AI' }))
  assert.match(html, /AI 작성/)
  assert.match(html, /title=/)
})

test('human, legacy and missing sources cannot be labelled AI', async () => {
  for (const props of [{ source: 'USER' }, { source: 'UNKNOWN' }, {}, { source: null }]) {
    const html = await renderToString(Vue.createSSRApp(Badge, props))
    assert.doesNotMatch(html, /AI 작성/)
  }
})
