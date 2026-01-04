import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import GoogleCallback from '@/pages/GoogleCallback.vue'
import CreateBoard from '@/pages/CreateBoard.vue'
import Board from '@/pages/Board.vue'
import CreatePost from '@/pages/CreatePost.vue'
import Post from '@/pages/Post.vue'
import CreateVoteSession from '@/pages/CreateVoteSession.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/auth/callback/google', name: 'GoogleCallback', component: GoogleCallback },
  { path: '/boards/create', name: 'CreateBoard', component: CreateBoard },
  { path: '/boards/:id', name: 'Board', component: Board },
  { path: '/boards/:boardId/posts/create', name: 'CreatePost', component: CreatePost },
  { path: '/boards/:boardId/posts/:postId', name: 'Post', component: Post },
  { path: '/boards/:boardId/votesession/create', name: 'CreateVoteSession', component: CreateVoteSession },
]

export default createRouter({
  history: createWebHistory(),
  routes
})