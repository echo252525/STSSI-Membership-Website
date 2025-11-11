<template>
  <section class="about-shell container-xl py-5">
    <!-- =================== SKELETON (initial) =================== -->
    <template v-if="isBooting">
      <header class="mb-4 breath-in-500" role="status" aria-live="polite">
        <div class="skel-line w-25 mb-2"></div>
        <div class="skel-line w-40 sm"></div>
      </header>

      <div
        class="card border-0 shadow-sm rounded-4 breath-in-500 delay-100"
        role="status"
        aria-live="polite"
      >
        <div class="card-body p-4 p-md-5">
          <div class="skel-line w-20 mb-3"></div>
          <div class="skel-line w-100 mb-2"></div>
          <div class="skel-line w-100 mb-2"></div>
          <div class="skel-line w-90 mb-2"></div>
          <div class="skel-line w-85 mb-2"></div>
          <div class="skel-line w-70 mb-3"></div>
          <div class="skel-hr my-4"></div>
          <div class="skel-line w-25 mb-3"></div>
          <ul class="skel-list">
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-80"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-75"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-85"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-70"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-90"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-80"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-75"></div>
            </li>
            <li class="skel-li">
              <span class="skel-bullet"></span>
              <div class="skel-line w-85"></div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- =================== REAL CONTENT =================== -->
    <template v-else>
      <!-- ===== HERO / BRAND STRIP ===== -->
      <header
        class="hero brand-gradient rounded-4 shadow-sm p-4 p-md-5 breath-in-500 position-relative overflow-hidden"
      >
        <div class="row align-items-center g-4">
          <div class="col-lg-7">
            <div class="d-flex align-items-center gap-3 mb-3">
              <img src="/STSSI_logo.png" alt="STSSI Logo" class="brand-logo" />
              <h1 class="h3 fw-bold m-0 text-white">
                About STEQ Technological Solutions &amp; Services Inc.
              </h1>
            </div>
            <p class="lead text-white-80 mb-4">
              Born in 2024 from the merger of STEQ Computer Parts &amp; Accessories and ZK TECH IT
              SOLUTIONS, we operate as one partner for end-to-end technology—from assessment and
              design to installation and support.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-glass text-white fw-semibold">CCTV &amp; FDAS</span>
              <span class="badge bg-glass text-white fw-semibold">Networking Solutions</span>
              <span class="badge bg-glass text-white fw-semibold">SimpleERP</span>
              <span class="badge bg-glass text-white fw-semibold">STEQ MDVR</span>
              <span class="badge bg-glass text-white fw-semibold">AI Chatbots</span>
            </div>
          </div>
          <div class="col-lg-5 text-center position-relative">
            <div class="mascot-wrap">
              <img src="/STSSI_mascot.png" alt="STSSI Mascot" class="mascot floaty" />
              <div class="mascot-orb" aria-hidden="true"></div>
            </div>
          </div>
        </div>
        <!-- aurora decor -->
        <div class="aurora" aria-hidden="true"></div>
      </header>

      <!-- ===== MISSION / VISION / VALUES (interactive tabs) ===== -->
      <section class="rounded-4 shadow-sm glass-panel p-4 p-md-5 my-4 breath-in-500 delay-100">
        <div class="d-flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Company pillars">
          <button
            class="seg-btn"
            :class="{ active: activePillar === 'mission' }"
            @click="activePillar = 'mission'"
            role="tab"
            :aria-selected="activePillar === 'mission'"
          >
            Mission
          </button>
          <button
            class="seg-btn"
            :class="{ active: activePillar === 'vision' }"
            @click="activePillar = 'vision'"
            role="tab"
            :aria-selected="activePillar === 'vision'"
          >
            Vision
          </button>
          <button
            class="seg-btn"
            :class="{ active: activePillar === 'values' }"
            @click="activePillar = 'values'"
            role="tab"
            :aria-selected="activePillar === 'values'"
          >
            Values
          </button>
        </div>

        <transition name="fade-slide" mode="out-in">
          <div :key="activePillar" class="text-secondary fs-6">
            <template v-if="activePillar === 'mission'">
              <p>
                Make technology easy, high-quality, and affordable through dependable engineering,
                clear processes, and responsive after-sales support for MSMEs and enterprises.
              </p>
            </template>
            <template v-else-if="activePillar === 'vision'">
              <p>
                Become the trusted one-stop partner for integrated systems—uniting hardware,
                software, and services that scale with our clients’ ambitions.
              </p>
            </template>
            <template v-else>
              <ul class="m-0 ps-3">
                <li><strong>Integrity:</strong> honest recommendations, transparent pricing</li>
                <li><strong>Reliability:</strong> on-time delivery with measurable outcomes</li>
                <li><strong>Care:</strong> human-centered support and long-term relationships</li>
              </ul>
            </template>
          </div>
        </transition>
      </section>

      <section>
        <h2 class="h5 fw-semibold mb-3 breath-in-500">What We Offer</h2>
        <div class="row g-3 g-md-4">
          <div v-for="f in features" :key="f.title" class="col-12 col-sm-6 col-lg-4">
            <div class="feature-flip" :aria-label="f.title">
              <article class="feature-card glass-panel" tabindex="0">
                <div class="feature-inner">
                  <!-- FRONT -->
                  <div class="feature-face feature-front">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <i :class="['bi', f.icon, 'fs-4']" aria-hidden="true"></i>
                      <h3 class="h6 m-0 fw-semibold">{{ f.title }}</h3>
                    </div>
                    <p class="text-secondary small mb-3">{{ f.desc }}</p>
                  </div>

                  <!-- BACK -->
                  <div class="feature-face feature-back">
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <i :class="['bi', f.icon, 'fs-4']" aria-hidden="true" style="color: #20a44c;"></i>
                    </div>
                    <p class="text-secondary small mb-0">{{ f.long }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isBooting = ref(true)
const activePillar = ref<'mission' | 'vision' | 'values'>('mission')

// ===== Feature grid data
const features = [
  {
    icon: 'bi-diagram-3',
    title: 'SimpleERP',
    desc: 'Streamline operations, inventory, and reports with a modular ERP tuned for MSMEs.',
    long: 'We deploy a practical ERP stack that centralizes purchasing, inventory, and sales. Start lean, then scale feature-by-feature as your operations grow.',
  },
  {
    icon: 'bi-camera-video',
    title: 'STEQ MDVR',
    desc: 'Reliable fleet monitoring with secure video evidence capture.',
    long: 'Dash-mounted recorders + cloud sync give you tamper-resistant incident logs, making claims and safety audits straightforward.',
  },
  {
    icon: 'bi-robot',
    title: 'AI Chatbots',
    desc: 'Automate support, capture leads, and scale service 24/7.',
    long: 'We build guided chat flows, knowledge-base lookups, and handover to humans—so customers get instant help and you keep context.',
  },
  {
    icon: 'bi-fire',
    title: 'FDAS Installation',
    desc: 'Code-compliant Fire Detection & Alarm Systems from survey to turnover.',
    long: 'Site assessment, riser diagrams, device selection, panel setup, and commissioning with proper documentation.',
  },
  {
    icon: 'bi-shield-check',
    title: 'CCTV Installation',
    desc: 'Design, supply, setup, tuning, and after-sales support.',
    long: 'We match camera types and lenses to your actual environment, set NVR retention, and tune alerts to useful signals only.',
  },
  {
    icon: 'bi-wifi',
    title: 'Networking Solutions',
    desc: 'Structured cabling, switching, and Wi-Fi designed for reliability.',
    long: 'Heat-mapping, channel planning, VLANs, and cable management that make scaling and troubleshooting easier.',
  },
]

// ===== Boot skeleton toggle only
onMounted(() => {
  setTimeout(() => {
    isBooting.value = false
  }, 500)
})
</script>

<style scoped>
/* ===================== THEME TOKENS ===================== */
.about-shell {
  /* Greens */
  --g-700: #20a44c;
  --g-600: #60bc44;
  --g-500: #50bc4c;
  --g-400: #20a44c;
  /* Azures */
  --az-700: #20647c;
  --az-600: #40b4e4;
  --az-500: #30ace4;
  --az-400: #3094cc;
  /* Dark */
  --ink-800: #302c2c;
  /* Utilities */
  --white-80: hsla(0, 0%, 100%, 0.8);
}

.text-white-80 {
  color: var(--white-80);
}

/* ===================== HERO ===================== */
.brand-gradient {
  background:
    radial-gradient(
      1200px 600px at 10% -10%,
      color-mix(in oklab, var(--az-600) 70%, transparent),
      transparent 60%
    ),
    radial-gradient(
      1200px 600px at 90% 120%,
      color-mix(in oklab, var(--g-600) 70%, transparent),
      transparent 60%
    ),
    linear-gradient(135deg, var(--g-700), var(--az-700) 60%);
}
.bg-glass {
  background: color-mix(in oklab, white 10%, transparent);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.brand-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.2));
}
.mascot-wrap {
  position: relative;
  display: inline-block;
}
.mascot {
  width: clamp(200px, 38vw, 320px);
  height: auto;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.25));
}
.mascot-orb {
  position: absolute;
  inset: auto 0 -6% 0;
  margin: auto;
  width: 70%;
  height: 14px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.25), transparent 70%);
  border-radius: 999px;
}
.floaty {
  animation: floaty 5s ease-in-out infinite;
}
@keyframes floaty {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* subtle moving aurora layer */
.aurora {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(
      40% 25% at 20% 20%,
      color-mix(in oklab, var(--az-600) 20%, transparent),
      transparent 70%
    ),
    radial-gradient(
      35% 25% at 80% 30%,
      color-mix(in oklab, var(--g-600) 22%, transparent),
      transparent 72%
    ),
    radial-gradient(
      25% 20% at 60% 80%,
      color-mix(in oklab, var(--az-400) 20%, transparent),
      transparent 70%
    );
  filter: blur(28px) saturate(1.1);
  animation: auroraMove 16s ease-in-out infinite alternate;
}
@keyframes auroraMove {
  from {
    transform: translateX(-2%);
  }
  to {
    transform: translateX(2%);
  }
}

/* ===================== PANELS & INTERACTIONS ===================== */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(48, 44, 44, 0.08);
}
.seg-btn {
  --c: color-mix(in oklab, var(--g-700), var(--az-700));
  border: 1px solid color-mix(in oklab, var(--c) 40%, transparent);
  background: color-mix(in oklab, white 70%, transparent);
  color: var(--ink-800);
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  transition: 0.25s ease;
  backdrop-filter: blur(4px);
}
.seg-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
}
.seg-btn.active {
  background: linear-gradient(135deg, var(--g-600), var(--az-600));
  color: #fff;
}

.feature-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  border: 1px solid rgba(48, 44, 44, 0.08);
}
.feature-card:hover,
.feature-card:focus {
  box-shadow: 0 10px 28px rgba(48, 44, 44, 0.15);
  border-color: color-mix(in oklab, var(--g-700) 30%, transparent);
}
.mini-cta {
  border: 0;
  background: linear-gradient(135deg, var(--g-700), var(--az-700));
  color: #fff;
  padding: 0.45rem 0.9rem;
  border-radius: 0.75rem;
  font-weight: 600;
}
.mini-cta:hover {
  filter: brightness(1.05);
}

/* ===================== FEATURE FLIP CARDS ===================== */
.feature-flip {
  perspective: 1100px;
}

.feature-card {
  position: relative;
  border-radius: 1.5rem;
  border: 2px solid rgba(48, 44, 44, 0.08);
  box-shadow: 0 8px 18px rgba(48, 44, 44, 0.08);
  min-height: 170px;
  overflow: hidden;
  background: transparent; /* faces own the background */
}

.feature-card:focus {
  outline: 2px solid color-mix(in oklab, var(--g-600), var(--az-600));
  outline-offset: 2px;
}

.feature-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
}

.feature-flip:hover .feature-inner,
.feature-flip:focus-within .feature-inner {
  transform: rotateY(180deg);
}

.feature-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  box-sizing: border-box;
}

/* BACK: full-height color */
.feature-back {
  transform: rotateY(180deg);
}


/* ===================== TRANSITIONS ===================== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ===================== BREATH-IN (kept) ===================== */
.breath-in-500 {
  animation: breath-in 0.5s ease-out both;
}
.breath-in-500.delay-100 {
  animation-delay: 0.1s;
}
@keyframes breath-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* ===================== SKELETON ===================== */
.skel-line,
.skel-hr {
  position: relative;
  overflow: hidden;
  background: var(--skel-base, #e9ecef);
  border-radius: 999px;
}
.skel-line {
  height: 12px;
  animation: shimmer 1.2s linear infinite;
  background: linear-gradient(
    90deg,
    var(--skel-base, #e9ecef) 25%,
    var(--skel-wave, #f8f9fa) 37%,
    var(--skel-base, #e9ecef) 63%
  );
  background-size: 400% 100%;
}
.skel-line.sm {
  height: 10px;
}
.skel-hr {
  height: 1px;
  border-radius: 0;
  background: var(--skel-base, #e9ecef);
}
.skel-line.w-20 {
  width: 20%;
}
.skel-line.w-25 {
  width: 25%;
}
.skel-line.w-40 {
  width: 40%;
}
.skel-line.w-70 {
  width: 70%;
}
.skel-line.w-75 {
  width: 75%;
}
.skel-line.w-80 {
  width: 80%;
}
.skel-line.w-85 {
  width: 85%;
}
.skel-line.w-90 {
  width: 90%;
}
.skel-line.w-100 {
  width: 100%;
}
.skel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}
.skel-li {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  gap: 0.75rem;
}
.skel-bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--skel-base, #e9ecef);
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* ===================== A11Y & PREFS ===================== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-color-scheme: dark) {
  :host {
    --skel-base: #2b3035;
    --skel-wave: #343a40;
  }
  .glass-panel {
    background: rgba(0, 0, 0, 0.35);
    border-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
