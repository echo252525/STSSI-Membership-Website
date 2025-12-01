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
import ForgotPassword from '@/pages/public/ForgotPassword.vue' // adjust path if needed

// ✅ About Us now under user pages
import AboutUs from '@/pages/user/AboutUs.vue'

import UserDashboard from '@/pages/user/Dashboard.vue'
import Membership from '@/pages/user/Membership.vue'
import MiniGames from '@/pages/user/MiniGames.vue'
import ewallet from '@/pages/user/Ewallet.vue'
import Settings from '@/pages/user/Settings.vue'
import WaitingArea from '@/pages/user/WaitingArea.vue' // stays in pages/user/
import GamesEvent from '@/pages/user/GamesEvent.vue' // ✅ NEW: add this import
import DealsRewards from '@/pages/user/DealsRewards.vue' // ✅ NEW: add this import
import Winner from '@/pages/user/Winner.vue' // ✅ NEW: add this import
import Loser from '@/pages/user/Loser.vue' // ✅ NEW: add this import
import Tutorial from '@/pages/user/Tutorial.vue'

// 🆕 Shop
import Shop from '@/pages/user/Shop.vue'

// 🆕 My Purchases (ADDED)
import MyPurchase from '@/pages/user/MyPurchase.vue'

import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AdminMiniGames from '@/pages/admin/AdminMiniGames.vue'
import AdminProducts from '@/pages/admin/AdminProducts.vue'
import Transactions from '@/pages/admin/Transactions.vue'
import AdminSettings from '@/pages/admin/AdminSettings.vue'
import AdminMemberships from '@/pages/admin/AdminMemberships.vue'

// 🆕 Admin Orders
import Orders from '@/pages/admin/Orders.vue'

// 🆕 Admin Discounts
import AdminDiscounts from '@/pages/admin/AdminDiscounts.vue' // 🆕

/* 🔒 Admin gate */
import { isGateOpen } from '@/lib/adminGate'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: 'login', name: 'login', component: Login },
      { path: 'signup', name: 'signup', component: Signup },

      // ✅ Forgot Password (PUBLIC)
      { path: 'forgot-password', name: 'forgot-password', component: ForgotPassword },

      // 🔒 Admin login/signup (now both gated)
      {
        path: 'admin/login',
        name: 'admin.login',
        component: AdminLogin,
        meta: { requiresAdminGate: true },
      },
      {
        path: 'admin/signup',
        name: 'admin.signup',
        component: AdminSignup,
        meta: { requiresAdminGate: true },
      },

      // 👉 Waiting page WITHOUT UserLayout sidebar (public layout wrapper)
      { path: 'waiting', name: 'user.waiting', component: WaitingArea },
      {
        path: 'mini-games/event',
        name: 'user.minigames.event',
        component: GamesEvent,
        alias: ['minigames/event'],
      },
      { path: 'winner', name: 'user.winner', component: Winner },
      { path: 'loser', name: 'user.loser', component: Loser },
    ],
  },
  {
    path: '/app',
    component: UserLayout,
    children: [
      { path: '', name: 'user.dashboard', component: UserDashboard },
      { path: 'about', name: 'user.about', component: AboutUs }, // ✅ NEW: /app/about
      { path: 'membership', name: 'user.membership', component: Membership },
      { path: 'minigames', name: 'user.minigames', component: MiniGames },
      { path: 'deals', name: 'user.deals', component: DealsRewards },
      { path: 'shop', name: 'user.shop', component: Shop },
      { path: 'minigames/tutorial', name: 'user.minigames.tutorial', component: Tutorial },

      // 🆕 My Purchases (ADDED)
      { path: 'purchases', name: 'user.mypurchase', component: MyPurchase },

      { path: 'ewallet', name: 'user.ewallet', component: ewallet },
      { path: 'settings', name: 'user.settings', component: Settings },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', name: 'admin.dashboard', component: AdminDashboard },
      { path: 'mini-games', name: 'admin.minigames', component: AdminMiniGames },
      { path: 'products', name: 'admin.products', component: AdminProducts },
      { path: 'AdminMemberships', name: 'admin.memberships', component: AdminMemberships },
      { path: 'Transactions', name: 'admin.transactions', component: Transactions },
      { path: 'orders', name: 'admin.orders', component: Orders },
      { path: 'settings', name: 'admin.settings', component: AdminSettings },
      { path: 'discounts', name: 'admin.discounts', component: AdminDiscounts },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 🧠 Dynamic document.title
 * Admin routes → "STSSI Admin Portal"
 * All others → "STSSI Member Portal"
 */
router.afterEach((to) => {
  const isAdminRoute = to.matched.some((record) => {
    const name = (record.name ?? '') as string
    return name.startsWith('admin.')
  })

  document.title = isAdminRoute ? 'STSSI Admin Portal' : 'STSSI Member Portal'
})

/**
 * 🔒 Admin-gate guard
 */
router.beforeEach((to, _from, next) => {
  const needsGate = to.matched.some(record => record.meta?.requiresAdminGate)
  if (needsGate && !isGateOpen()) {
    return next({ name: 'home' })
  }
  return next()
})

export default router
