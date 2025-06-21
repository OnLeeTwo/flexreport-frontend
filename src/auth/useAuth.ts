import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../lib/axios'
import router from '../router'
import type { User, LoginPayload } from '@/types/types'

export const useAuth = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') ?? '')

  const login = async (credentials: LoginPayload) => {
    const res = await api.post<{ token: string }>('/login', credentials)
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    await fetchUser()
    router.push('/reports')
  }

  const fetchUser = async () => {
    const res = await api.get<User>('/me')
    user.value = res.data
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  return { user, token, login, fetchUser, logout }
})
