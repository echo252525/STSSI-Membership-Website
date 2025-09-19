<template>
  <div>
    <!-- ====================== NAVBAR (Glassy) ====================== -->
    <nav class="navbar navbar-expand-lg navbar-light glassy-nav sticky-top position-relative">
      <div class="container-xl position-relative">
        <router-link
          class="navbar-brand fw-bold d-flex align-items-center gap-2"
          :to="{ name: 'home' }"
        >
          <i class="bi bi-stars"></i>
          <span>STSSI Membership</span>
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

          <div class="d-flex gap-2">
            <router-link class="btn btn-outline-primary btn-modern" :to="{ name: 'login' }">
              <i class="bi bi-box-arrow-in-right me-1"></i> Log in
            </router-link>
            <router-link class="btn btn-primary btn-modern --pulse" :to="{ name: 'signup' }">
              <i class="bi bi-person-plus-fill me-1"></i> Sign up
            </router-link>
          </div>
        </div>
      </div>
      <!-- 🔐 Small Admin Icon (visible) -->
        <router-link
          :to="{ name: 'admin.login' }"
          class="admin-icon-btn"
          aria-label="Admin login"
          title="Admin"
        >
          <i class="bi bi-shield-lock-fill"></i>
        </router-link>
    </nav>

    <!-- ====================== HERO (Gradient) ====================== -->
    <header class="hero-wrap border-bottom">
      <div class="container-xl">
        <div class="row align-items-center gy-4">
          <!-- Text -->
          <div class="col-12 col-lg-6">
            <span
              class="eyebrow badge rounded-pill text-bg-primary-subtle border border-primary-subtle"
              >New</span
            >
            <h1 class="display-5 fw-bold mt-3">
              Level up your <span class="grad-text">membership</span> experience
            </h1>
            <p class="lead text-secondary mt-3">
              Courses, perks, and community for technicians and customers across the
              Philippines—powered by STSSI.
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
                <i class="bi bi-shield-check"></i> Secure by Supabase
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
                        <div class="mini-title">Levels</div>
                        <div class="mini-sub">Progress + badges</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-people"></i>
                      <div>
                        <div class="mini-title">Community</div>
                        <div class="mini-sub">Verified installers</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-journal-code"></i>
                      <div>
                        <div class="mini-title">Courses</div>
                        <div class="mini-sub">Learn & grow</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mini-card">
                      <i class="bi bi-gift"></i>
                      <div>
                        <div class="mini-title">Perks</div>
                        <div class="mini-sub">Raffles & deals</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-secondary small mt-3 mb-0 text-center">
                  *Mock preview for illustration
                </p>
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
          <p class="text-secondary mb-0">Built for members, installers, and admins.</p>
        </div>

        <div class="row g-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-patch-check"></i></div>
              <h5 class="card-title mb-2">Verified Installers</h5>
              <p class="text-secondary mb-3">
                Browse vetted technicians with badges and level progress.
              </p>
              <span class="badge rounded-pill text-bg-primary-subtle border"
                >Trust &amp; Safety</span
              >
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-book"></i></div>
              <h5 class="card-title mb-2">Courses &amp; Levels</h5>
              <p class="text-secondary mb-3">
                Learn CCTV, networks, and smart home—earn levels &amp; perks.
              </p>
              <span class="badge rounded-pill text-bg-success-subtle border">Skill Growth</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-gift"></i></div>
              <h5 class="card-title mb-2">Member Perks</h5>
              <p class="text-secondary mb-3">
                Discounts, raffles, and rewards tailored to your tier.
              </p>
              <span class="badge rounded-pill text-bg-warning-subtle border">Rewards</span>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="feature-card h-100">
              <div class="icon-wrap"><i class="bi bi-shield-lock"></i></div>
              <h5 class="card-title mb-2">Secure &amp; Simple</h5>
              <p class="text-secondary mb-3">
                Supabase auth + RLS-secured profiles. Your data, protected.
              </p>
              <span class="badge rounded-pill text-bg-info-subtle border">Security</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== PRICING (Modern tiles) ====================== -->
    <section id="pricing" class="section-pad bg-section">
      <div class="container-xl">
        <div class="section-head">
          <h2 class="fw-bold">Choose your membership</h2>
          <p class="text-secondary mb-0">Regular → Silver → Gold → Platinum → Diamond.</p>
        </div>

        <div class="row g-4 align-items-stretch">
          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100">
              <div class="price-head">Regular</div>
              <div class="price-amt">Free</div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li>Basic access</li>
                <li>Community updates</li>
                <li>Email support</li>
              </ul>
              <router-link
                class="btn btn-outline-primary btn-modern mt-auto"
                :to="{ name: 'signup' }"
                >Get Started</router-link
              >
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 highlight border-primary-subtle">
              <div class="price-head text-primary">Silver</div>
              <div class="price-amt">₱—/mo</div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li>Member discounts</li>
                <li>Basic courses</li>
                <li>Priority support</li>
              </ul>
              <router-link class="btn btn-primary btn-modern mt-auto" :to="{ name: 'signup' }"
                >Choose Silver</router-link
              >
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 border-warning-subtle">
              <div class="price-head text-warning">Gold</div>
              <div class="price-amt">₱—/mo</div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li>All Silver perks</li>
                <li>Intermediate courses</li>
                <li>Raffle entries</li>
              </ul>
              <router-link
                class="btn btn-warning btn-modern text-dark mt-auto"
                :to="{ name: 'signup' }"
                >Go Gold</router-link
              >
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 border-dark-subtle">
              <div class="price-head text-dark">Platinum</div>
              <div class="price-amt">₱—/mo</div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li>All Gold perks</li>
                <li>Advanced courses</li>
                <li>1:1 expert sessions</li>
              </ul>
              <router-link class="btn btn-dark btn-modern mt-auto" :to="{ name: 'signup' }"
                >Go Platinum</router-link
              >
            </div>
          </div>

          <div class="col-12 col-md-6 col-xl">
            <div class="price-card h-100 border-info-subtle">
              <div class="price-head text-info">Diamond</div>
              <div class="price-amt">₱—/mo</div>
              <ul class="list-unstyled mt-3 mb-4 text-secondary">
                <li>All Platinum perks</li>
                <li>VIP support</li>
                <li>Exclusive events</li>
              </ul>
              <router-link
                class="btn btn-info btn-modern text-dark mt-auto"
                :to="{ name: 'signup' }"
                >Become Diamond</router-link
              >
            </div>
          </div>
        </div>

        <p class="text-center text-secondary small mt-3 mb-0">
          Prices are placeholders—replace with your actual tiers.
        </p>
      </div>
    </section>

    <!-- ====================== TESTIMONIALS (Cards) ====================== -->
    <section id="testimonials" class="section-pad">
      <div class="container-xl">
        <div class="section-head">
          <h2 class="fw-bold">What members say</h2>
          <p class="text-secondary mb-0">Real outcomes from our community.</p>
        </div>

        <div class="row g-4">
          <div class="col-12 col-md-4">
            <div class="quote-card h-100">
              <div class="avatar bg-primary-subtle text-primary">
                <i class="bi bi-person-badge"></i>
              </div>
              <p class="mb-1">“Got verified and landed more CCTV installs.”</p>
              <small class="text-secondary">— Carlo, Installer</small>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="quote-card h-100">
              <div class="avatar bg-success-subtle text-success"><i class="bi bi-cpu"></i></div>
              <p class="mb-1">“Courses helped me level up and earn better gigs.”</p>
              <small class="text-secondary">— Sean, Network Tech</small>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="quote-card h-100">
              <div class="avatar bg-warning-subtle text-warning">
                <i class="bi bi-emoji-smile"></i>
              </div>
              <p class="mb-1">“Support is responsive and perks are worth it.”</p>
              <small class="text-secondary">— Murky, Member</small>
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
          <div class="accordion-item">
            <h2 class="accordion-header" id="q1">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a1"
                aria-expanded="true"
                aria-controls="a1"
              >
                How do I sign up?
              </button>
            </h2>
            <div
              id="a1"
              class="accordion-collapse collapse show"
              aria-labelledby="q1"
              data-bs-parent="#faqAcc"
            >
              <div class="accordion-body">
                Click <router-link :to="{ name: 'signup' }">Sign up</router-link>, confirm your
                email, and you’re in.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" id="q2">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a2"
                aria-expanded="false"
                aria-controls="a2"
              >
                Are my details secure?
              </button>
            </h2>
            <div
              id="a2"
              class="accordion-collapse collapse"
              aria-labelledby="q2"
              data-bs-parent="#faqAcc"
            >
              <div class="accordion-body">
                Yes—Supabase Auth and Row Level Security protect your profile data.
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" id="q3">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a3"
                aria-expanded="false"
                aria-controls="a3"
              >
                Can I upgrade my tier later?
              </button>
            </h2>
            <div
              id="a3"
              class="accordion-collapse collapse"
              aria-labelledby="q3"
              data-bs-parent="#faqAcc"
            >
              <div class="accordion-body">
                Absolutely. Move from Regular → Silver → Gold → Platinum → Diamond anytime.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== CTA (Gradient) ====================== -->
    <section class="section-pad text-center cta-grad">
      <div class="container-xl">
        <h3 class="fw-bold mb-2">Ready to join?</h3>
        <p class="text-secondary mb-4">
          Create your account and start exploring member perks today.
        </p>
        <router-link class="btn btn-primary btn-lg btn-modern --lift" :to="{ name: 'signup' }"
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
import { useRouter } from 'vue-router';
const router = useRouter();
/** Render admin icon only if the route exists */
const has = (name: string) => router.hasRoute(name as any);
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
html { scroll-behavior: smooth; }

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* 🔐 Admin icon button */
.admin-icon-btn{
  position: absolute;
  top: 10px;
  right: 12px;                     /* desktop: tuck into top-right */
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: rgba(255,255,255,.8);
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 .25rem .75rem rgba(0,0,0,.06);
  opacity: .55;
  transition: opacity .18s ease, transform .12s ease, box-shadow .18s ease;
}
.admin-icon-btn i { font-size: 1rem; color: #0d6efd; }
.admin-icon-btn:hover{
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.1);
}

/* On very small screens: offset to not block the burger */
@media (max-width: 575.98px) {
  .admin-icon-btn { right: 54px; top: 8px; }
}

/* ---------- Navbar (glassy) ---------- */
.glassy-nav {
  backdrop-filter: saturate(1.3) blur(10px);
  background: var(--glass-bg) !important;
  border-bottom: 1px solid var(--glass-bd) !important;
}
.navbar-toggler-icon { background-image: var(--bs-navbar-toggler-icon-bg) !important; }
.modern-link { position: relative; transition: color 0.15s ease; }
.modern-link::after {
  content: '';
  position: absolute; left: 0; right: 0; bottom: -4px; height: 2px;
  background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform 0.2s ease;
  opacity: 0.35;
}
.modern-link:hover::after { transform: scaleX(1); }

/* ---------- Buttons ---------- */
.btn-modern { border-radius: 999px; padding-inline: 1rem; }
.btn-modern.--lift { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.btn-modern.--lift:hover { transform: translateY(-2px); box-shadow: 0 0.5rem 1rem rgba(0,0,0,.08); }
.--pulse { position: relative; }
.--pulse::after {
  content: ''; position: absolute; inset: -6px; border-radius: 999px; border: 2px solid var(--ring);
  animation: pulse 1.8s ease-out infinite; pointer-events: none;
}
@keyframes pulse {
  0% { opacity: .7; transform: scale(.98); }
  100% { opacity: 0; transform: scale(1.2); }
}

/* ---------- Hero ---------- */
.hero-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, #e7f0ff 0%, transparent 60%),
    radial-gradient(1200px 600px at 100% 0%, #fff1f1 0%, transparent 60%), #ffffff;
  padding: 64px 0;
}
.eyebrow { letter-spacing: 0.04em; }
.grad-text {
  background: linear-gradient(90deg, #0d6efd, #6610f2 60%, #20c997);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.showcase-card { position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,.06); }
.showcase-card .glow {
  position: absolute; width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(13, 110, 253, 0.25), transparent 70%);
  right: -40px; top: -40px; filter: blur(16px);
}
.mini-card {
  display: flex; gap: .75rem; align-items: center;
  border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: .75rem; background: #fff;
}
.mini-card i { font-size: 1.25rem; }
.mini-title { font-weight: 600; }
.mini-sub { font-size: .8125rem; color: #6c757d; }

/* ---------- Sections ---------- */
.section-pad { padding: 72px 0; }
.section-head { text-align: center; margin-bottom: 24px; }
.bg-section { background: radial-gradient(800px 400px at 0% 0%, #f4f8ff 0%, transparent 60%), var(--soft); }

/* ---------- Feature cards ---------- */
.feature-card {
  padding: 1.25rem; border-radius: 16px; background: var(--surface);
  border: 1px solid rgba(0,0,0,.06); box-shadow: 0 .75rem 2rem rgba(0,0,0,.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.feature-card:hover { transform: translateY(-2px); box-shadow: 0 1rem 2.5rem rgba(0,0,0,.06); }
.icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  background: #f1f5ff; color: #0d6efd; margin-bottom: .5rem; font-size: 1.25rem;
}

/* ---------- Pricing ---------- */
.price-card {
  display: flex; flex-direction: column; padding: 1.25rem; border-radius: 16px; background: #fff;
  border: 1px solid rgba(0,0,0,.06); box-shadow: 0 .75rem 2rem rgba(0,0,0,.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.price-card:hover { transform: translateY(-2px); box-shadow: 0 1rem 2.5rem rgba(0,0,0,.06); }
.price-card.highlight { outline: 2px solid var(--ring); }
.price-head { font-weight: 700; letter-spacing: .02em; }
.price-amt { font-size: 1.75rem; font-weight: 800; margin-top: .25rem; }

/* ---------- Testimonials ---------- */
.quote-card {
  padding: 1.25rem; border-radius: 16px; background: #fff;
  border: 1px solid rgba(0,0,0,.06); box-shadow: 0 .75rem 2rem rgba(0,0,0,.04);
}
.avatar {
  width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: .5rem; font-size: 1.25rem;
}

/* ---------- Accordion ---------- */
.modern-acc .accordion-button { border-radius: 12px !important; }
.modern-acc .accordion-item { border: none; margin-bottom: .5rem; }
.modern-acc .accordion-button:not(.collapsed) { background: #f7f9ff; box-shadow: inset 0 0 0 1px rgba(13,110,253,.15); }

/* ---------- CTA ---------- */
.cta-grad { background: linear-gradient(135deg, #eef4ff, #f7fcff 40%, #f6fff7); }

/* ---------- Utilities ---------- */
.text-secondary { color: #6c757d !important; }
</style>
