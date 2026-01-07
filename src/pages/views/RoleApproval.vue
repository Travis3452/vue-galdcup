<template>
  <div class="role-approval w-full max-w-2xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
    <h1 class="text-2xl font-bold text-indigo-700 mb-4">권한 요청 관리</h1>

    <div>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">대기 중인 요청</h2>

      <ul class="space-y-3">
        <li
          v-for="req in requests"
          :key="req.id"
          class="flex justify-between items-center border rounded px-3 py-2 shadow-sm"
        >
          <div>
            <p class="text-gray-700 font-semibold">
              {{ req.nickname }} <span class="text-gray-500 text-sm">({{ req.email }})</span>
            </p>
            <p class="text-gray-600 text-xs">
              요청 권한: <span class="font-bold">{{ req.requestedRole }}</span>
            </p>
          </div>
          <div class="space-x-1">
            <button
              @click="approve(req.id)"
              class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
            >
              승인
            </button>
            <button
              @click="deny(req.id)"
              class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
            >
              거절
            </button>
          </div>
        </li>
      </ul>

      <p v-if="requests.length === 0" class="text-gray-500 mt-4 text-center">
        현재 대기 중인 권한 요청이 없습니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import useRoleApproval from '@/pages/scripts/RoleApproval.js'

const { requests, approve, deny } = useRoleApproval()
</script>