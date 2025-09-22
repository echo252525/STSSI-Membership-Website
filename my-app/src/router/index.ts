import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import PublicLayout from '@/layouts/PublicLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue' // ✅ new

import Home from '@/pages/public/Home.vue'
import Login from '@/pages/public/Login.vue'
import Signup from '@/pages/public/Signup.vue'
import AdminLogin from '@/pages/public/AdminLogin.vue'
import AdminSignup from '@/pages/public/AdminSignup.vue'

import UserDashboard from '@/pages/user/Dashboard.vue'
import Membership from '@/pages/user/Membership.vue'
import MiniGames from '@/pages/user/MiniGames.vue'
import Settings from '@/pages/user/Settings.vue'

import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AdminMiniGames from '@/pages/admin/AdminMiniGames.vue' 
import AdminProducts from '@/pages/admin/AdminProducts.vue' //
import AdminSettings from '@/pages/admin/AdminSettings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: 'login', name: 'login', component: Login },
      { path: 'signup', name: 'signup', component: Signup },

      // 🔒 Admin login/signup (public)
      { path: 'admin/login', name: 'admin.login', component: AdminLogin },
      { path: 'admin/signup', name: 'admin.signup', component: AdminSignup },
    ],
  },
  {
    path: '/app',
    component: UserLayout,
    children: [
      { path: '', name: 'user.dashboard', component: UserDashboard },
      { path: 'membership', name: 'user.membership', component: Membership },
      { path: 'minigames', name: 'user.minigames', component: MiniGames },
      { path: 'settings', name: 'user.settings', component: Settings },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout, // 👈 new admin layout
    children: [
      { path: 'dashboard', name: 'admin.dashboard', component: AdminDashboard },
      { path: 'mini-games', name: 'admin.minigames', component: AdminMiniGames },
      { path: 'products', name: 'admin.products', component: AdminProducts },
      { path: 'settings', name: 'admin.settings', component: AdminSettings },
      // add more admin pages here later
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
