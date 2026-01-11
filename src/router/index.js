import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/views/Home.vue'
import GoogleCallback from '@/pages/views/GoogleCallback.vue'
import CreateBoard from '@/pages/views/CreateBoard.vue'
import Board from '@/pages/views/Board.vue'
import CreatePost from '@/pages/views/CreatePost.vue'
import Post from '@/pages/views/Post.vue'
import UpdatePost from '@/pages/views/UpdatePost.vue'
import CreateVoteSession from '@/pages/views/CreateVoteSession.vue'
import MyPage from '@/pages/views/MyPage.vue'
import RoleApproval from '@/pages/views/RoleApproval.vue'
import Vote from '@/pages/views/Vote.vue'
import VoteStatus from '@/pages/views/VoteStatus.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth/callback/google', name: 'GoogleCallback', component: GoogleCallback },
  { path: '/boards/create', name: 'CreateBoard', component: CreateBoard },
  { path: '/boards/:boardId', name: 'Board', component: Board },
  { path: '/boards/:boardId/posts/create', name: 'CreatePost', component: CreatePost },
  { path: '/boards/:boardId/posts/:postId', name: 'Post', component: Post },
  { path: '/boards/:boardId/posts/:postId/update', name: 'UpdatePost', component: UpdatePost },
  { path: '/boards/:boardId/createVoteSession', name: 'CreateVoteSession', component: CreateVoteSession },
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
