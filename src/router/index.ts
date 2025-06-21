import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuth } from '../auth/useAuth'
import { Component } from 'vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: (): Promise<Component> => import('../views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/templates',
    name: 'create-template',
    component: (): Promise<Component> => import('../views/CreateTemplateView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/', redirect: '/templates' },
  {
    path: '/reports',
    name: 'reports',
    component: (): Promise<Component> => import('../views/ReportsView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  const auth = useAuth()
  if (to.meta.requiresAuth && auth.token === '') {
    return next('/login')
  }
  console.log()
  console.log(`Navigating to: ${to.path}`)
  next()
})

export default router
