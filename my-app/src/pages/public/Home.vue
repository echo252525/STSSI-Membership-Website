<template>
  <div>
    <!-- ====================== NAVBAR (Glassy) ====================== -->
    <nav class="navbar navbar-expand-lg navbar-light glassy-nav sticky-top position-relative">
      <div class="container-xl position-relative">
        <router-link
          class="navbar-brand fw-bold d-flex align-items-center gap-2"
          :to="{ name: 'home' }"
        >
          <img
            src="/STSSI_logo.png"
            alt="STSSI Logo"
            class="simp-logo img-fluid"
          />
          <span class="logoText h5 m-0">STSSI Member Incentive Program</span>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto my-3 my-lg-0 gap-lg-2">
            <li class="nav-item"><a class="nav-link modern-link" href="#features">Features</a></li>
            <li class="nav-item"><a class="nav-link modern-link" href="#pricing">Pricing</a></li>
            <li class="nav-item">
              <a class="nav-link modern-link" href="#testimonials">Testimonials</a>
            </li>
            <li class="nav-item"><a class="nav-link modern-link" href="#faq">FAQ</a></li>
          </ul>

          <div class="d-flex align-items-center gap-3">
            <!-- login button -->
            <router-link class="btn btn-outline-primary btn-modern" :to="{ name: 'login' }">
              <i class="bi bi-box-arrow-in-right me-1"></i> Log in
            </router-link>
            <!-- signup button -->
            <router-link class="btn btn-primary btn-modern --pulse" :to="{ name: 'signup' }">
              <i class="bi bi-person-plus-fill me-1"></i> Sign up
            </router-link>
            <!-- admin button: hidden by default; reveal via Alt+Shift+A -->
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
        </div>
      </div>
    </header>

    <!-- ====================== FEATURES (Soft cards) ====================== -->
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
              <p class="text-secondary mb-3">
                Monitor your purchases and referrals to see how close you are to your next tier.
              </p>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-graph-up-arrow"></i></div>
              <h5 class="card-title mb-2">Tier Upgrades</h5>
              <p class="text-secondary mb-3">
                Reach milestones and unlock higher membership levels with better perks.
              </p>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-gift"></i></div>
              <h5 class="card-title mb-2">Bigger Discounts</h5>
              <p class="text-secondary mb-3">
                Higher tiers = bigger savings on products and services.
              </p>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-unlock2"></i></div>
              <h5 class="card-title mb-2">Exclusive Vouchers</h5>
              <p class="text-secondary mb-3">
                Unlock special vouchers and rewards available only at your tier.
              </p>
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
          <p class="text-secondary mb-0">
            Progress through tiers with every purchase and referral—more perks unlocked along the
            way.
          </p>
        </div>

        <div class="row g-4 align-items-stretch">
          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 highlight border-success-subtle">
              <div class="price-head text-success">Regular</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/regular.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> Free Membership</li>
                <li><i class="bi bi-check2"></i> ₱2,000 discount credits per month</li>
                <li><i class="bi bi-check2"></i> Enjoy 5% discount on all purchases</li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 highlight border-primary-subtle">
              <div class="price-head text-primary">Silver</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/silver.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> Made ₱10,000 worth of purchases</li>
                <li><i class="bi bi-check2"></i> 10 Referrals with ₱5,000 purchases</li>
                <li><i class="bi bi-check2"></i> ₱10,000 discount credits per month</li>
                <li><i class="bi bi-check2"></i> Enjoy 6% discount on all purchases</li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 border-warning-subtle">
              <div class="price-head text-warning">Gold</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/gold.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> Made ₱20,000 worth of purchases</li>
                <li><i class="bi bi-check2"></i> 20 Referrals with ₱10,000 purchases</li>
                <li><i class="bi bi-check2"></i> ₱20,000 discount credits per month</li>
                <li><i class="bi bi-check2"></i> Enjoy 7% discount on all purchases</li>
                <li><i class="bi bi-check2"></i> Free Delivery for Val. Order worth ₱10,000</li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 border-dark-subtle">
              <div class="price-head text-dark">Platinum</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/platinum.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> Made ₱50,000 worth of purchases</li>
                <li><i class="bi bi-check2"></i> 50 Referrals with ₱20,000 purchases</li>
                <li><i class="bi bi-check2"></i> ₱50,000 discount credits per month</li>
                <li><i class="bi bi-check2"></i> Enjoy 8% discount on all purchases</li>
                <li><i class="bi bi-check2"></i> Free delivery for GMA orders worth ₱10,000</li>
              </ul>
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 border-info-subtle">
              <div class="price-head text-info">Diamond</div>
              <div class="tier-logoDiv border-bottom pb-4">
                <img src="/diamond.png" alt="tier_logo" class="tier-logo img-fluid" />
              </div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li><i class="bi bi-check2"></i> Made ₱100,000 worth of purchases</li>
                <li><i class="bi bi-check2"></i> 100 Referrals with ₱50,000 purchases</li>
                <li><i class="bi bi-check2"></i> ₱100,000 discount credits per month</li>
                <li><i class="bi bi-check2"></i> Enjoy 10% discount on all purchases</li>
                <li><i class="bi bi-check2"></i> Free delivery for GMA orders worth ₱10,000</li>
                <li><i class="bi bi-check2"></i> Exclusive Discount Offers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== FAQ (Accordion) ====================== -->
    <section id="faq" class="section-pad bg-section">
      <div class="container-xl">
        <div class="section-head">
          <h2 class="fw-bold">Frequently Asked Questions</h2>
        <p class="text-secondary mb-0">Quick answers about membership &amp; features.</p>
        </div>

        <div class="accordion modern-acc" id="faqAcc">
          <!-- question 1 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="q1">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== 'a1' }"
                type="button"
                aria-expanded="false"
                aria-controls="a1"
                 @click="toggle('a1')"
              >
                How do I create an account?
              </button>
            </h2>
            <div
              id="a1"
              class="accordion-collapse collapse"
               :class="{ show: open === 'a1' }"
              aria-labelledby="q1"
            >
              <div class="accordion-body">
                Click
                <router-link :to="{ name: 'signup' }" class="text-decoration-none"
                  >signup</router-link
                >, verify your email, and complete your profile. That’s it—you’re a member!
              </div>
            </div>
          </div>

          <!-- question 2 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="q2">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== 'a2' }"
                type="button"
                aria-expanded="false"
                aria-controls="a2"
                @click="toggle('a2')"
              >
                Is membership free?
              </button>
            </h2>
            <div
              id="a2"
              class="accordion-collapse collapse"
              :class="{ show: open === 'a2' }"
              aria-labelledby="q2"
            >
              <div class="accordion-body">
                Yes. <strong>Regular</strong> membership is free. As you purchase or refer friends,
                you can level up to Silver, Gold, Platinum, and Diamond for bigger perks.
              </div>
            </div>
          </div>

          <!-- question 3 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="q3">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== 'a3' }"
                type="button"
                aria-expanded="false"
                aria-controls="a3"
                @click="toggle('a3')"
              >
                How do tiers and progress work?
              </button>
            </h2>
            <div
              id="a3"
              class="accordion-collapse collapse"
              :class="{ show: open === 'a3' }"
              aria-labelledby="q3"
            >
              <div class="accordion-body">
                Your tier is based on <strong>total purchases</strong> and
                <strong>qualified referrals</strong>. Hitting the tier milestones unlocks more
                benefits like higher discounts, monthly credits, and delivery perks.
              </div>
            </div>
          </div>

          <!-- question 4 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="q4">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== 'a4' }"
                type="button"
                aria-expanded="false"
                aria-controls="a4"
                @click="toggle('a4')"
              >
                What discounts do I get per tier?
              </button>
            </h2>
            <div
              id="a4"
              class="accordion-collapse collapse"
              :class="{ show: open === 'a4' }"
              aria-labelledby="q4"
            >
              <div class="accordion-body">
                <ul class="mb-0">
                  <li><strong>Regular:</strong> 5% discount</li>
                  <li><strong>Silver:</strong> 6% discount</li>
                  <li><strong>Gold:</strong> 7% discount</li>
                  <li><strong>Platinum:</strong> 8% discount</li>
                  <li><strong>Diamond:</strong> 10% discount</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- question 5 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="q5">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== 'a5' }"
                type="button"
                aria-expanded="false"
                aria-controls="a5"
                @click="toggle('a5')"
              >
                Do discounts, vouchers, and credits stack?
              </button>
            </h2>
            <div
              id="a5"
              class="accordion-collapse collapse"
              :class="{ show: open === 'a5' }"
              aria-labelledby="q5
"
            >
              <div class="accordion-body">
                Yes, your tier discount applies first, then eligible <strong>vouchers</strong> and
                <strong>discount credits</strong> are applied where allowed by promo rules.
              </div>
            </div>
          </div>

          <!-- question 6 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="q6">
              <button
                class="accordion-button"
                :class="{ collapsed: open !== 'a6' }"
                type="button"
                aria-expanded="false"
                aria-controls="a6"
                @click="toggle('a6')"
              >
                How do referrals work?
              </button>
            </h2>
            <div
              id="a6"
              class="accordion-collapse collapse"
              :class="{ show: open === 'a6' }"
              aria-labelledby="q6"
            >
              <div class="accordion-body">
                Share your <strong>referral link</strong>. When a new user signs up and completes
                qualified purchases, it counts toward your referral milestone for tier upgrades.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== CTA (Gradient) ====================== -->
    <section class="section-pad text-center cta-grad d-flex justify-content-center align-items-center">
      <div class="container-xl">
        <h1 class="fw-bold mb-3 fs-3">Ready to join?</h1>
        <p class="text-secondary mb-5">
          Create your account and start exploring member perks today.
        </p>
        <router-link class="btn btn-primary btn-lg btn-modern --lift fs-6" :to="{ name: 'signup' }"
          >Create Account</router-link
        >
      </div>
    </section>

    <!-- ====================== FOOTER ====================== -->
    <footer class="py-4 bg-dark text-white-50">
      <div class="container-xl d-flex flex-column flex-md-row justify-content-between gap-2">
        <div>© {{ new Date().getFullYear() }} STSSI. All rights reserved.</div>
        <div class="d-flex gap-3">
          <a href="#features" class="link-light link-underline-opacity-0">Features</a>
          <a href="#pricing" class="link-light link-underline-opacity-0">Pricing</a>
          <a href="#faq" class="link-light link-underline-opacity-0">FAQ</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const has = (name: string) => router.hasRoute(name as any)

// which panel is open; null means all closed
const open = ref<string | null>(null)
const toggle = (id: string) => {
  open.value = open.value === id ? null : id
}

/** Hidden admin icon logic */
const showAdminIcon = ref(false)

// Secret keyboard combo: Alt + Shift + A to toggle; Esc to hide
function onKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase()
  if (e.altKey && e.shiftKey && key === 'a') {
    showAdminIcon.value = !showAdminIcon.value
  }
  if (key === 'escape') {
    showAdminIcon.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
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
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
/* 🔐 Admin icon button */
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
    opacity 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease;
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
/* ---------- Navbar (glassy) ---------- */
.glassy-nav {
  backdrop-filter: saturate(1.3) blur(10px);
  background: var(--glass-bg) !important;
  border-bottom: 1px solid var(--glass-bd) !important;
}
.navbar-toggler-icon {
  background-image: var(--bs-navbar-toggler-icon-bg) !important;
}
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
.simp-logo {
  height: 45px;
  cursor: default;
}

@media (max-width: 500px) {
  .glassy-nav {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .logoText {
    font-size: 1rem;
  }
  .simp-logo {
    height: 30px;
  }
  .admin-icon-btn {
    width: 42px;
    height: 42px;
  }
  .admin-icon-btn i {
    font-size: 1.4rem;
  }
}

/* ---------- Buttons ---------- */
.btn-modern {
  border-radius: 999px;
  padding-inline: 1rem;
}
.btn-modern.--lift {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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

/* ---------- Hero ---------- */
.hero-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, #e7f0ff 0%, transparent 60%),
    radial-gradient(1200px 600px at 100% 0%, #fff1f1 0%, transparent 60%), #ffffff;
  padding: 64px 0;
}
.eyebrow {
  letter-spacing: 0.04em;
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
.mini-card i {
  font-size: 1.25rem;
}
.mini-title {
  font-weight: 600;
}
.mini-sub {
  font-size: 0.8125rem;
  color: #6c757d;
}

/* ---------- Sections ---------- */
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

/* ---------- Feature cards ---------- */
.feature-card {
  padding: 1.25rem;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.04);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.06);
}
.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5ff;
  color: #0d6efd;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

/* ---------- Membership Infos ---------- */
.price-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}

/* ---------- Accordion ---------- */
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

/* ---------- CTA ---------- */
.cta-grad {
  height: 50vh;
  background: linear-gradient(135deg, #eef4ff, #f7fcff 40%, #f6fff7);
}

/* ---------- Utilities ---------- */
.text-secondary {
  color: #6c757d !important;
}
</style>
