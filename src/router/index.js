import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

import HomeView from '@/views/HomeView.vue'
import GoogleCallback from '@/views/auth/GoogleCallback.vue'
import BoardLayout from '@/views/board/BoardLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth/callback/google',
      name: 'googleCallback',
      component: GoogleCallback
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
          path: 'votes/:voteSessionId/status',
          name: 'VoteStatus',
          component: () => import('@/views/board/VoteStatusView.vue'),
          props: true
        },
        {
          path: 'create-vote-session',
          name: 'CreateVoteSession',
          component: () => import('@/views/board/CreateVoteSessionView.vue'),
          props: true,
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (!userStore.accessToken && localStorage.getItem('accessToken')) {
    await userStore.restore()
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    alert('로그인이 필요한 서비스입니다.')
    next('/')
  } else if (to.meta.adminOnly && !userStore.isAdmin) {
    alert('관리자만 접근 가능합니다.')
    next('/')
  } else {
    next()
  }
})

export default router