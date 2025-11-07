<template>
  <div>
    <!-- ====================== NAVBAR (Glassy) ====================== -->
    <nav class="navbar navbar-expand-lg navbar-light glassy-nav sticky-top">
      <div class="container-xl">
        <router-link
          class="navbar-brand fw-bold d-flex align-items-center gap-2"
          :to="{ name: 'home' }"
          @click="closeNav"
        >
          <img src="/STSSI_logo.png" alt="STSSI Logo" class="simp-logo img-fluid" />
          <span class="logoText h5 m-0">STSSI Member Incentive Program</span>
        </router-link>

        <!-- Toggler: menu icon ⇄ X (Vue only; no data-bs-*) -->
        <button
          class="navbar-toggler"
          type="button"
          @click="toggleNav"
          :aria-expanded="navOpen"
          aria-controls="mobileDrawer"
          :aria-label="navOpen ? 'Close navigation' : 'Open navigation'"
        >
          <span v-if="!navOpen" class="navbar-toggler-icon"></span>
          <i v-else class="bi bi-x-lg fs-2"></i>
        </button>

        <!-- Desktop nav -->
        <div class="d-none d-lg-flex ms-lg-4 align-items-center flex-grow-1">
          <ul class="navbar-nav me-auto gap-lg-2">
            <li class="nav-item"><a class="nav-link modern-link" href="#features">Features</a></li>
            <li class="nav-item"><a class="nav-link modern-link" href="#pricing">Pricing</a></li>
            <li class="nav-item">
              <a class="nav-link modern-link" href="#testimonials">Testimonials</a>
            </li>
            <li class="nav-item"><a class="nav-link modern-link" href="#faq">FAQ</a></li>
          </ul>

          <div class="d-flex align-items-center gap-3">
            <router-link class="btn btn-outline-primary btn-modern" :to="{ name: 'login' }">
              <i class="bi bi-box-arrow-in-right me-1"></i> Log in
            </router-link>
            <router-link class="btn btn-primary btn-modern --pulse" :to="{ name: 'signup' }">
              <i class="bi bi-person-plus-fill me-1"></i> Sign up
            </router-link>
            <router-link
              v-if="showAdminIcon"
              :to="{ name: 'admin.login' }"
              class="admin-icon-btn"
              aria-label="Admin login"
              title="Admin"
            >
              <i class="bi bi-shield-lock-fill"></i>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- ====================== MOBILE DRAWER (RIGHT) ====================== -->
    <!-- Backdrop -->
    <transition name="fade">
      <div v-if="navOpen" class="drawer-backdrop" @click="closeNav" aria-hidden="true" />
    </transition>

    <!-- Panel -->
    <transition name="slide-drawer">
      <aside
        v-if="navOpen"
        id="mobileDrawer"
        class="drawer-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'drawerTitle'"
      >
        <button class="drawer-close" @click="closeNav" aria-label="Close menu">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="drawer-body">
          <ul class="list-unstyled m-0 p-0">
            <li><a class="overlay-link" href="#features" @click="closeNav">Features</a></li>
            <li><a class="overlay-link" href="#pricing" @click="closeNav">Pricing</a></li>
            <li><a class="overlay-link" href="#faq" @click="closeNav">FAQ</a></li>
          </ul>

          <div class="overlay-actions">
            <router-link
              class="btn btn-outline-primary w-100"
              :to="{ name: 'login' }"
              @click="closeNav"
            >
              <i class="bi bi-box-arrow-in-right me-1"></i> Log in
            </router-link>

            <router-link 
              class="btn btn-primary w-100" 
              :to="{ name: 'signup' }" 
              @click="closeNav"
            >
              <i class="bi bi-person-plus-fill me-1"></i> Sign up
            </router-link>

            <!-- ADMIN in mobile drawer -->
            <router-link
              v-if="showAdminIcon"
              :to="{ name: 'admin.login' }"
              class="btn btn-outline-secondary w-100 drawer-admin-btn"
              @click="closeNav"
              aria-label="Admin login"
              title="Admin"
            >
              <i class="bi bi-shield-lock-fill me-1"></i> Admin
            </router-link>
          </div>
        </div>
      </aside>
    </transition>

    <!-- ====================== HERO (Gradient) ====================== -->
    <header class="hero-wrap border-bottom">
      <div class="container-xl">
        <div class="row align-items-center gy-4">
          <!-- Text -->
          <div class="col-12 col-lg-6">
            <h1 class="display-5 fw-bold mt-3">
              Level up your <span class="grad-text">membership</span> experience
            </h1>
            <p class="lead text-secondary mt-3">
              Exclusive membership app with rewards, discounts, and benefits for loyal
              customers—powered by STSSI.
            </p>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <router-link
                class="btn btn-primary btn-lg btn-modern --lift"
                :to="{ name: 'signup' }"
                @click="closeNav"
              >
                Get Started
              </router-link>
              <a class="btn btn-outline-secondary btn-lg btn-modern" href="#features"
                >Explore Features</a
              >
            </div>

            <div class="d-flex align-items-center gap-3 mt-4 text-secondary small">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-bag-heart"></i> Bigger Discounts
              </div>
              <div class="d-none d-sm-flex align-items-center gap-2">
                <i class="bi bi-award"></i> Tiered Rewards
              </div>
            </div>
          </div>

          <!-- Visual -->
          <div class="col-12 col-lg-6">
            <div class="showcase-card rounded-4 shadow-sm bg-white">
              <div class="glow"></div>
              <div class="p-4 p-lg-5">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h5 class="fw-semibold mb-0">Membership Dashboard</h5>
                  <span class="badge rounded-pill text-bg-light border">Preview</span>
                </div>
                <div class="row g-3">
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-graph-up-arrow"></i>
                      <div>
                        <div class="mini-title">Membership</div>
                        <div class="mini-sub">Tier, benefits &amp; progress</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-people"></i>
                      <div>
                        <div class="mini-title">Deals &amp; Rewards</div>
                        <div class="mini-sub">Discounts &amp; vouchers</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-journal-code"></i>
                      <div>
                        <div class="mini-title">Mini Games</div>
                        <div class="mini-sub">Spin &amp; win events</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-gift"></i>
                      <div>
                        <div class="mini-title">E-Wallet</div>
                        <div class="mini-sub">Balance, top-ups &amp; history</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /Visual -->
        </div>
      </div>
    </header>

    <!-- ====================== FEATURES ====================== -->
    <section id="features" class="section-pad">
      <div class="container-xl">
        <div class="section-head">
          <h2 class="fw-bold">Everything you need in one place</h2>
          <p class="text-secondary mb-0">
            Built for STSSI members—rewards and benefits made simple.
          </p>
        </div>

        <div class="row g-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-bar-chart-line"></i></div>
              <h5 class="card-title mb-2">Track Progress</h5>
              <p class="text-secondary mb-3">Monitor purchases & referrals.</p>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-graph-up-arrow"></i></div>
              <h5 class="card-title mb-2">Tier Upgrades</h5>
              <p class="text-secondary mb-3">Unlock higher membership levels.</p>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-gift"></i></div>
              <h5 class="card-title mb-2">Bigger Discounts</h5>
              <p class="text-secondary mb-3">Higher tiers = bigger savings.</p>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-unlock2"></i></div>
              <h5 class="card-title mb-2">Exclusive Vouchers</h5>
              <p class="text-secondary mb-3">Tier-locked rewards and credits.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== MEMBERSHIP ====================== -->
    <section id="pricing" class="section-pad bg-section">
      <div class="container-xl">
        <div class="section-head">
          <h2 class="fw-bold">Membership Tiers & Benefits</h2>
          <p class="text-secondary mb-0">More perks as you progress.</p>
        </div>

        <div class="row g-4 align-items-stretch">
          <div class="col-12 col-md-4 col-xl">
            <div class="price-card h-100 highlight border-success-subtle">
              <div class="price-head text-success">Regular</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/regular.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> Free Membership</li>
                <li><i class="bi bi-check2"></i> ₱2,000 discount credits per month</li>
                <li><i class="bi bi-check2"></i> 5% discount on all purchases</li>
              </ul>
            </div>
          </div>
          <div class="col-12 col-md-4 col-xl">
            <div class="price-card h-100 highlight border-primary-subtle">
              <div class="price-head text-primary">Silver</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/silver.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> ₱10,000 purchases</li>
                <li><i class="bi bi-check2"></i> 10 referrals (₱5,000 each)</li>
                <li><i class="bi bi-check2"></i> ₱10,000 monthly credits</li>
                <li><i class="bi bi-check2"></i> 6% discount on all purchases</li>
              </ul>
            </div>
          </div>
          <div class="col-12 col-md-4 col-xl">
            <div class="price-card h-100 border-warning-subtle">
              <div class="price-head text-warning">Gold</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/gold.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> ₱20,000 purchases</li>
                <li><i class="bi bi-check2"></i> 20 referrals (₱10,000 each)</li>
                <li><i class="bi bi-check2"></i> ₱20,000 monthly credits</li>
                <li><i class="bi bi-check2"></i> 7% discount</li>
                <li><i class="bi bi-check2"></i> Free Delivery for ₱10,000+ order</li>
              </ul>
            </div>
          </div>
          <div class="col-12 col-md-4 col-xl">
            <div class="price-card h-100 border-dark-subtle">
              <div class="price-head text-dark">Platinum</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/platinum.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> ₱50,000 purchases</li>
                <li><i class="bi bi-check2"></i> 50 referrals (₱20,000 each)</li>
                <li><i class="bi bi-check2"></i> ₱50,000 monthly credits</li>
                <li><i class="bi bi-check2"></i> 8% discount</li>
                <li><i class="bi bi-check2"></i> Free GMA delivery for ₱10,000+</li>
              </ul>
            </div>
          </div>
          <div class="col-12 col-md-4 col-xl">
            <div class="price-card h-100 border-info-subtle">
              <div class="price-head text-info">Diamond</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/diamond.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> ₱100,000 purchases</li>
                <li><i class="bi bi-check2"></i> 100 referrals (₱50,000 each)</li>
                <li><i class="bi bi-check2"></i> ₱100,000 monthly credits</li>
                <li><i class="bi bi-check2"></i> 10% discount</li>
                <li><i class="bi bi-check2"></i> Free GMA delivery for ₱10,000+</li>
                <li><i class="bi bi-check2"></i> Exclusive Offers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== FAQ ====================== -->
    <section id="faq" class="section-pad bg-section">
      <div class="container-xl">
        <div class="section-head">
          <h2 class="fw-bold">Frequently Asked Questions</h2>
          <p class="text-secondary mb-0">Quick answers about membership &amp; features.</p>
        </div>

        <div class="accordion modern-acc" id="faqAcc">
          <div class="accordion-item" v-for="q in faqs" :key="q.id">
            <h2 class="accordion-header" :id="'q' + q.id">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== q.id }"
                type="button"
                @click="toggle(q.id)"
                :aria-expanded="open === q.id"
                :aria-controls="'a' + q.id"
              >
                {{ q.title }}
              </button>
            </h2>
            <div
              class="accordion-collapse collapse"
              :id="'a' + q.id"
              :class="{ show: open === q.id }"
              :aria-labelledby="'q' + q.id"
            >
              <div class="accordion-body">{{ q.body }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== CTA ====================== -->
    <section
      class="section-pad text-center cta-grad d-flex justify-content-center align-items-center"
    >
      <div class="container-xl">
        <h1 class="fw-bold mb-3 fs-3">Ready to join?</h1>
        <p class="text-secondary mb-5">
          Create your account and start exploring member perks today.
        </p>
        <router-link
          class="btn btn-primary btn-lg btn-modern --lift fs-6"
          :to="{ name: 'signup' }"
          @click="closeNav"
        >
          Create Account
        </router-link>
      </div>
    </section>

    <!-- ====================== FOOTER ====================== -->
    <footer class="py-4 bg-dark text-white-50">
      <div class="container-xl d-flex flex-column flex-md-row justify-content-between gap-2">
        <div>© {{ new Date().getFullYear() }} STSSI. All rights reserved.</div>
        <div class="d-flex gap-3">
          <a href="#features" class="link-light link-underline-opacity-0">Features</a>
          <a href="#pricing" class="link-light link-underline-opacity-0">Tiers</a>
          <a href="#faq" class="link-light link-underline-opacity-0">FAQ</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ===== Nav open/close ===== */
const navOpen = ref<boolean>(false)
const toggleNav = () => (navOpen.value = !navOpen.value)
const closeNav = () => (navOpen.value = false)

/* Lock page scroll when drawer is open */
watch(navOpen, (v) => {
  document.documentElement.classList.toggle('overflow-hidden', v)
})

/* Close on route change */
watch(() => router.currentRoute.value.fullPath, closeNav)

/* ===== FAQ ===== */
const open = ref<string | null>(null)
const toggle = (id: string) => (open.value = open.value === id ? null : id)
const faqs = [
  {
    id: 'a1',
    title: 'How do I create an account?',
    body: 'Click signup, verify email, and complete your profile.',
  },
  {
    id: 'a2',
    title: 'Is membership free?',
    body: 'Yes. Regular is free; level up via purchases and referrals.',
  },
  {
    id: 'a3',
    title: 'How do tiers and progress work?',
    body: 'Based on total purchases and qualified referrals.',
  },
  {
    id: 'a4',
    title: 'What discounts do I get per tier?',
    body: 'Regular 5%, Silver 6%, Gold 7%, Platinum 8%, Diamond 10%.',
  },
  {
    id: 'a5',
    title: 'Do discounts/vouchers/credits stack?',
    body: 'Tier discount first, then vouchers & credits if allowed.',
  },
  {
    id: 'a6',
    title: 'How do referrals work?',
    body: 'Share your referral link; qualified purchases count.',
  },
]

/* Hidden admin icon */
const showAdminIcon = ref(false)
function onKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (e.altKey && e.shiftKey && key === 'a') showAdminIcon.value = !showAdminIcon.value
  if (key === 'escape') closeNav()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* ---------- Base ---------- */
:root {
  --surface: #ffffff;
  --soft: #f6f8fb;
  --ring: rgba(13, 110, 253, 0.15);
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-bd: rgba(255, 255, 255, 0.4);
}
html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* Keep navbar above drawer/backdrop so the X is always clickable */
.glassy-nav {
  background-color: #fff;
  z-index: 1040; /* > backdrop/panel */
}
.navbar-toggler .bi {
  line-height: 1;
}
.navbar-toggler:focus {
  box-shadow: 0 0 0 0.1rem rgba(13, 110, 253, 0.25);
}

/* ---------- MOBILE DRAWER ---------- */
/* Backdrop (fades in) */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35); /* slate w/ alpha */
  backdrop-filter: blur(2px);
  z-index: 1065;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Panel (slides from right) */
.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(78vw, 380px);
  background: #fff;
  z-index: 1070;
  border-left: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: -12px 0 28px rgba(0, 0, 0, 0.12);
  display: none; /* hidden on desktop */
}
.drawer-body {
  height: 100%;
  overflow-y: auto;
  padding: calc(16px + env(safe-area-inset-top)) 20px 20px;
}
@media (max-width: 991.98px) {
  .drawer-panel {
    display: block;
  }
}
/* Close button inside the drawer */
.drawer-close {
  position: absolute;
  top: calc(8px + env(safe-area-inset-top));
  right: 12px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  background: #fff;
  border-radius: .5rem;
  padding: .35rem .5rem;
  line-height: 1;
}
.drawer-close i { font-size: 1.25rem; }




/* Slide transition */
.slide-drawer-enter-active,
.slide-drawer-leave-active {
  transition:
    transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.22s ease;
}
.slide-drawer-enter-from,
.slide-drawer-leave-to {
  transform: translateX(100%);
  opacity: 0.98;
}

/* Links and actions inside drawer */
.overlay-link {
  display: block;
  padding: 0.9rem 0.25rem;
  font-size: 1.125rem;
  color: #212529;
  text-decoration: none;
}
.overlay-link:hover {
  color: #0d6efd;
}
.overlay-actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* Desktop link underline effect */
.modern-link {
  position: relative;
  transition: color 0.15s ease;
}
.modern-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
  opacity: 0.35;
}
.modern-link:hover::after {
  transform: scaleX(1);
}

/* Logo sizing */
.simp-logo {
  height: 45px;
  cursor: default;
}
@media (max-width: 500px) {
  .logoText {
    font-size: 1rem;
  }
  .simp-logo {
    height: 30px;
  }
  .tier-logo {
    max-height: 90px !important;
  }
}

/* Admin button */
.admin-icon-btn {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.06);
  opacity: 0.55;
  transition:
    opacity 0.18s,
    transform 0.12s,
    box-shadow 0.18s;
}
.admin-icon-btn i {
  font-size: 2rem;
  color: #0d6efd;
}
.admin-icon-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

/* Buttons */
.btn-modern {
  border-radius: 999px;
  padding-inline: 1rem;
}
.btn-modern.--lift {
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.btn-modern.--lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
}
.--pulse {
  position: relative;
}
.--pulse::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  border: 2px solid var(--ring);
  animation: pulse 1.8s ease-out infinite;
  pointer-events: none;
}
@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

/* Hero / Sections / Cards */
.hero-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, #e7f0ff 0%, transparent 60%),
    radial-gradient(1200px 600px at 100% 0%, #fff1f1 0%, transparent 60%), #fff;
  padding: 64px 0;
}
.grad-text {
  background: linear-gradient(90deg, #0d6efd, #6610f2 60%, #20c997);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.showcase-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.showcase-card .glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(13, 110, 253, 0.25), transparent 70%);
  right: -40px;
  top: -40px;
  filter: blur(16px);
}
.mini-card {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 0.75rem;
  background: #fff;
}
.mini-title {
  font-weight: 600;
}
.mini-sub {
  font-size: 0.8125rem;
  color: #6c757d;
}

.section-pad {
  padding: 72px 0;
}
.section-head {
  text-align: center;
  margin-bottom: 24px;
}
.bg-section {
  background: radial-gradient(800px 400px at 0% 0%, #f4f8ff 0%, transparent 60%), var(--soft);
}

.price-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.price-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.06);
}
.price-card.highlight {
  outline: 2px solid var(--ring);
}
.price-head {
  font-weight: 700;
  letter-spacing: 0.02em;
}
.tier-logoDiv {
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
}
.tier-logo {
  max-height: 120px;
  width: auto;
}
.list-unstyled li {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.4rem 0;
}

.modern-acc .accordion-button {
  border-radius: 12px !important;
}
.modern-acc .accordion-item {
  border: none;
  margin-bottom: 0.5rem;
}
.modern-acc .accordion-button:not(.collapsed) {
  background: #f7f9ff;
  box-shadow: inset 0 0 0 1px rgba(13, 110, 253, 0.15);
}

.cta-grad {
  height: 50vh;
  background: linear-gradient(135deg, #eef4ff, #f7fcff 40%, #f6fff7);
}

/* Utility */
.text-secondary {
  color: #6c757d !important;
}
</style>
