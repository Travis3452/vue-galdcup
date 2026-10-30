<template>
  <nav v-if="totalPages > 1" :aria-label="label" class="pagination">
    <button type="button" :disabled="disabled || currentPage <= 0" aria-label="이전 페이지"
      @click="$emit('change', currentPage - 1)">‹</button>
    <button v-for="page in pages" :key="page" type="button" :disabled="disabled"
      :aria-current="page - 1 === currentPage ? 'page' : undefined" :aria-label="`${page} 페이지`"
      @click="$emit('change', page - 1)">{{ page }}</button>
    <button type="button" :disabled="disabled || currentPage >= totalPages - 1" aria-label="다음 페이지"
      @click="$emit('change', currentPage + 1)">›</button>
    <span class="sr-only">전체 {{ totalPages }}페이지 중 {{ currentPage + 1 }}페이지</span>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { pageNumbers } from '../../utils/pagination.js'
import { useMediaQuery } from '../../composables/useMediaQuery.js'
const props = defineProps({ currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }, disabled: Boolean,
  label: { type: String, default: '페이지 이동' } })
defineEmits(['change'])
const compact = useMediaQuery('(max-width: 639px)')
const pages = computed(() => pageNumbers(props.currentPage, props.totalPages, compact.value ? 3 : 5))
</script>
