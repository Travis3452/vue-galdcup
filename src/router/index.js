import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/views/Home.vue'
import GoogleCallback from '@/pages/views/GoogleCallback.vue'
import CreateBoard from '@/pages/views/CreateBoard.vue'
import MyPage from '@/pages/views/MyPage.vue'
import RoleApproval from '@/pages/views/RoleApproval.vue'
import Vote from '@/pages/views/Vote.vue'
import VoteStatus from '@/pages/views/VoteStatus.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth/callback/google', name: 'GoogleCallback', component: GoogleCallback },
  { path: '/boards/create', name: 'CreateBoard', component: CreateBoard },

  {
    path: '/boards/:boardId',
    component: () => import('@/pages/views/BoardLayout.vue'),
    children: [
      { path: '', name: 'Board', component: () => import('@/pages/views/Board.vue') },
      { path: 'posts/:postId', name: 'Post', component: () => import('@/pages/views/Post.vue') },
      { path: 'posts/create', name: 'CreatePost', component: () => import('@/pages/views/CreatePost.vue') },
      { path: 'posts/:postId/update', name: 'UpdatePost', component: () => import('@/pages/views/UpdatePost.vue') },
      { path: 'createVoteSession', name: 'CreateVoteSession', component: () => import('@/pages/views/CreateVoteSession.vue') }
    ]
  },

  { path: '/mypage', name: 'MyPage', component: MyPage },
  { 
    path: '/role-approval', 
    name: 'RoleApproval', 
    component: RoleApproval,
    meta: { noLayout: true }
  },
  { 
    path: '/boards/:boardId/vote-session/:voteSessionId/vote', 
    name: 'Vote', 
    component: Vote,
    meta: { noLayout: true }
  },
  { 
    path: '/boards/:boardId/vote-status',
    name: 'VoteStatus',
    component: VoteStatus,
    meta: { noLayout: true }
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
