<template>
  <section class="container py-4">
    <!-- =================== SKELETON (initial) =================== -->
    <template v-if="isBooting">
      <!-- Header skeleton -->
      <header class="mb-4 breath-in-500" role="status" aria-live="polite">
        <div class="skel-line w-25 mb-2"></div>
        <div class="skel-line w-40 sm"></div>
      </header>

      <!-- Card skeleton -->
      <div class="card border-0 shadow-sm rounded-4 breath-in-500 delay-100" role="status" aria-live="polite">
        <div class="card-body p-4 p-md-5">
          <!-- Our Mission (heading) -->
          <div class="skel-line w-20 mb-3"></div>

          <!-- Paragraph lines -->
          <div class="skel-line w-100 mb-2"></div>
          <div class="skel-line w-100 mb-2"></div>
          <div class="skel-line w-90 mb-2"></div>
          <div class="skel-line w-85 mb-2"></div>
          <div class="skel-line w-70 mb-3"></div>

          <!-- Divider -->
          <div class="skel-hr my-4"></div>

          <!-- What We Offer (heading) -->
          <div class="skel-line w-25 mb-3"></div>

          <!-- List skeleton -->
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
      <header class="mb-4 breath-in-500">
        <h1 class="h4 fw-bold m-0">About Us</h1>
        <p class="text-muted mt-2 mb-0">Who we are and what we do</p>
      </header>

      <div class="card border-0 shadow-sm rounded-4 breath-in-500 delay-100">
        <div class="card-body p-4 p-md-5">
          <h2 class="h5 fw-semibold">Our Mission</h2>
          <p class="text-secondary">
            We are STEQ Technological Solutions &amp; Services Inc.—formed in 2024 by the merger of
            STEQ Computer Parts &amp; Accessories and ZK TECH IT SOLUTIONS. United as a single, one-stop
            shop, we deliver the combined services and solutions of our predecessors under one roof.
            Our vision is simple: make technology easy, high-quality, and affordable for every client.
            Backed by seasoned engineers and proven processes, we’ve completed several high-profile
            installations across industries and continue to support MSMEs and enterprises with
            dependable, scalable systems.
          </p>

          <hr class="my-4" />

          <h2 class="h5 fw-semibold">What We Offer</h2>
          <ul class="text-secondary mb-0">
            <li>SimpleERP — streamline operations, inventory, and reporting</li>
            <li>STEQ MDVR — reliable fleet monitoring and video evidence</li>
            <li>Customizable AI Chatbots — automate support, capture leads, and scale service</li>
            <li>FDAS installation — code-compliant Fire Detection &amp; Alarm Systems</li>
            <li>CCTV installation — site survey, design, supply, setup, and tuning</li>
            <li>Networking Solutions installation — structured cabling, switching, and Wi-Fi</li>
            <li>End-to-end delivery — assessment → design → installation → maintenance</li>
            <li>One partner for world-class brands with responsive after-sales support</li>
          </ul>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
// User-scoped informational page (renders inside UserLayout sidebar)
import { ref, onMounted } from 'vue'

const isBooting = ref(true)

onMounted(() => {
  // Show skeleton briefly, then reveal with a 500ms "breath-in" animation
  setTimeout(() => {
    isBooting.value = false
  }, 500)
})
</script>

<style scoped>
/* Keep your original heading color tweak */
.card-body :is(h2) { color: #0d6efd; }

/* ===================== Breath-in animation (500ms) ===================== */
.breath-in-500 {
  animation: breath-in 0.5s ease-out both;
}
.breath-in-500.delay-100 { animation-delay: 0.1s; }
.breath-in-500.delay-200 { animation-delay: 0.2s; }

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

/* ===================== Skeleton styles ===================== */
.skel-line,
.skel-pill,
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

.skel-line.sm { height: 10px; }
.skel-line.xs { height: 8px; }

.skel-hr {
  height: 1px;
  border-radius: 0;
  background: var(--skel-base, #e9ecef);
}

/* Width helpers */
.skel-line.w-15 { width: 15%; }
.skel-line.w-20 { width: 20%; }
.skel-line.w-25 { width: 25%; }
.skel-line.w-30 { width: 30%; }
.skel-line.w-35 { width: 35%; }
.skel-line.w-40 { width: 40%; }
.skel-line.w-50 { width: 50%; }
.skel-line.w-60 { width: 60%; }
.skel-line.w-70 { width: 70%; }
.skel-line.w-75 { width: 75%; }
.skel-line.w-80 { width: 80%; }
.skel-line.w-85 { width: 85%; }
.skel-line.w-90 { width: 90%; }
.skel-line.w-100 { width: 100%; }

/* List skeleton layout */
.skel-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
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

/* Shimmer animation */
@keyframes shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

/* Dark mode tuning */
@media (prefers-color-scheme: dark) {
  :host {
    --skel-base: #2b3035;
    --skel-wave: #343a40;
  }
}
</style>
