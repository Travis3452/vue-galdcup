import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { writeStorage } from '@/utils/storage'

import HomeView from '@/views/HomeView.vue'
const BoardLayout = () => import('@/views/board/BoardLayout.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // 💡 스크롤 동작 제어 함수 추가
  scrollBehavior(to, from, savedPosition) {
    // 사용자가 '뒤로 가기'나 '앞으로 가기'를 눌렀을 때 (이전 스크롤 위치 기억)
    if (savedPosition) {
      return savedPosition
    } 
    // 게시글 목록의 필터/페이지 변경은 위치를 유지하고 목록에서 스크롤을 제어한다.
    else if (to.path === from.path && ['Board', 'Post'].includes(to.name)) {
      return false
    }
    // 새로운 페이지로 이동할 때는 무조건 맨 위로 이동
    else {
      return { top: 0 }
    }
  },

  routes: [
    {
      path: '/admin/monitoring',
      name: 'AdminMonitoring',
      component: () => import('@/views/admin/MonitoringView.vue'),
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth/callback/google',
      name: 'GoogleCallback',
      component: () => import('@/views/auth/GoogleCallback.vue')
    },
    {
      path: '/mypage',
      name: 'MyPage',
      component: () => import('@/views/MyPageView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/boards/create',
      name: 'CreateBoard',
      component: () => import('@/views/board/CreateBoardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/privacy',
      name: 'PrivacyPolicy',
      component: () => import('@/views/PrivacyPolicy.vue')
    },
    {
      path: '/terms',
      name: 'TermsOfService',
      component: () => import('@/views/TermsOfService.vue')
    },
    {
      path: '/boards/:boardId/votes/:voteSessionId',
      name: 'Vote',
      component: () => import('@/views/board/VoteView.vue'),
      props: true,
      meta: { 
        requiresAuth: true, 
        noLayout: true 
      }
    },
    {
      path: '/boards/:boardId',
      component: BoardLayout,
      props: true,
      children: [
        {
          path: '',
          name: 'Board',
          component: () => import('@/views/board/BoardView.vue'),
          props: true
        },
        {
          path: 'posts/create',
          name: 'CreatePost',
          component: () => import('@/views/board/CreatePostView.vue'),
          props: true,
          meta: { requiresAuth: true }
        },
        {
          path: 'posts/:postId',
          name: 'Post',
          component: () => import('@/views/board/PostDetailView.vue'),
          props: true
        },
        {
          path: 'posts/:postId/edit',
          name: 'UpdatePost',
          component: () => import('@/views/board/UpdatePostView.vue'),
          props: true,
          meta: { requiresAuth: true }
        },
        {
          path: 'history',
          name: 'VoteHistory',
          component: () => import('@/views/board/VoteHistoryView.vue'),
          props: true
        },
        {
          path: 'votes/:voteSessionId/analysis',
          name: 'OpinionAnalysis',
          component: () => import('@/views/board/OpinionAnalysisView.vue'),
          props: true
        },
        {
          path: 'create-vote-session',
          name: 'CreateVoteSession',
          component: () => import('@/views/board/CreateVoteSessionView.vue'),
          props: true,
          meta: { requiresAuth: true }
        },
      ]
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFoundView.vue') }
  ]
})

/**
 * 네비게이션 가드: 쿠키 기반 인증 상태 복구 및 권한 체크
 */
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (!userStore.hasRestoredSession) {
    await userStore.restore()
  }

  if (to.meta.requiresAuth && !userStore.accessToken) {
    writeStorage('redirectPath', to.fullPath, 'sessionStorage')
    next({ path: '/', query: { login: 'required' } })
  } else if (to.meta.adminOnly && userStore.role !== 'ADMIN') {
    alert('관리자만 접근 가능합니다.')
    next('/')
  } else {
    next()
  }
})

export default router
