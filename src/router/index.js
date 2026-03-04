import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChatView from '../views/ChatView.vue'
import AgentStreamDemoView from '../views/AgentStreamDemoView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView
  },
  {
    path: '/agent-demo',
    name: 'agent-demo',
    component: AgentStreamDemoView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
