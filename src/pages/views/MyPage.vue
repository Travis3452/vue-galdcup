<template>
  <div class="mypage max-w-3xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-indigo-700 mb-6">내 정보</h1>

    <!-- 탭 메뉴 -->
    <div class="flex space-x-4 border-b mb-6">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'px-4 py-2 font-semibold transition',
          activeTab === tab
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-600 hover:text-indigo-600'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 프로필 탭 -->
    <div v-if="activeTab === '프로필'" class="bg-white shadow-md rounded-lg p-6 space-y-6">
      <h2 class="text-xl font-bold text-gray-800">프로필 정보</h2>

      <div class="flex items-center space-x-4 border rounded-lg px-4 py-3 shadow-sm">
        <div class="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-lg">
          {{ user.nickname ? user.nickname.charAt(0) : '?' }}
        </div>
        <div>
          <p class="text-gray-700"><span class="font-semibold">이메일:</span> {{ user.email }}</p>
          <p class="text-gray-700"><span class="font-semibold">닉네임:</span> {{ user.nickname }}</p>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">닉네임 변경</h3>
        <input
          v-model="newNickname"
          placeholder="새 닉네임 입력"
          class="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
        />
        <div class="flex justify-end mt-2">
          <button
            @click="changeNickname"
            class="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            변경
          </button>
        </div>
      </div>
    </div>

    <!-- 권한 신청 탭 -->
    <div v-else-if="activeTab === '권한 신청'" class="bg-white shadow-md rounded-lg p-6 space-y-6">
      <h2 class="text-xl font-bold text-gray-800">권한 신청</h2>

      <div class="flex items-center space-x-4 border rounded-lg px-4 py-3 shadow-sm">
        <p class="text-gray-700 font-semibold">
          현재 권한:
          <span
            :class="[
              user.role === 'USER' ? 'text-blue-600 font-bold' :
              user.role === 'MANAGER' ? 'text-yellow-600 font-bold' :
              user.role === 'ADMIN' ? 'text-red-600 font-bold' : 'text-gray-500'
            ]"
          >
            {{ user.role || '알 수 없음' }}
          </span>
        </p>
      </div>

      <div class="flex justify-end">
        <!-- ADMIN이면 별도의 서브창 열기 -->
        <button
          v-if="user.role === 'ADMIN'"
          @click="openApprovalWindow"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          요청 승인하기
        </button>
        <!-- USER/MANAGER이면 권한 신청 -->
        <button
          v-else
          @click="requestRole"
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          권한 신청하기
        </button>
      </div>
    </div>

    <!-- 회원 탈퇴 탭 -->
    <div v-else-if="activeTab === '회원 탈퇴'" class="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 class="text-xl font-bold text-gray-800">회원 탈퇴</h2>
      <p class="text-gray-700">
        회원 탈퇴를 위해 이메일을 입력하세요.<br />
        <span class="font-semibold">이메일:</span> {{ user.email }}
      </p>
      <input
        v-model="confirmEmail"
        placeholder="이메일 입력"
        class="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none w-full"
      />
      <div class="flex justify-end">
        <button
          @click="deleteAccount"
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          회원 탈퇴하기
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-red-500 mt-4 font-semibold">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import useMyPage from '@/pages/scripts/MyPage.js'
import { ref } from 'vue'

const { user, newNickname, confirmEmail, errorMessage, changeNickname, deleteAccount, requestRole, openApprovalWindow } = useMyPage()

const tabs = ['프로필', '권한 신청', '회원 탈퇴']
const activeTab = ref('프로필')
</script>