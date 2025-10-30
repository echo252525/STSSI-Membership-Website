<template>
  <div class="container py-4 howto">
    <!-- Header / Breadcrumb -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h5 mb-1">How to Play</h1>
        <p class="text-muted small mb-0">
          Join an event, auto-deduct the entry fee from your eWallet, wait for players, and spin!
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <RouterLink
          :to="{ name: 'user.minigames' }"
          class="btn btn-outline-secondary btn-sm"
          aria-label="Back to Mini Games"
          >Back</RouterLink
        >
      </div>
    </div>

    <!-- Hero / Summary -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 tutorial-hero">
      <div class="card-body p-4">
        <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
          <div class="flex-grow-1">
            <h2 class="h5 mb-2 d-flex align-items-center gap-2">
              <span class="badge bg-success-subtle text-success border-success-subtle"
                >Quick Start</span
              >
              Spin & Win in Minutes
            </h2>
            <p class="mb-0 text-secondary">
              Pick an open event, your entry fee is securely deducted, then relax in the Waiting
              Area. When the player slots are complete, the wheel spins automatically—winners see
              prizes right away.
            </p>
          </div>
          <RouterLink :to="{ name: 'user.minigames' }" class="btn btn-primary">
            Try a Spin Now
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- HOW TO PLAY -->
    <section class="mb-4">
      <header class="d-flex align-items-center gap-2 mb-2">
        <span class="pill pill-red">HOW TO PLAY</span>
        <div class="rule"></div>
      </header>
      <FlashStepper :steps="stepsPlay" :group-size="3" />
    </section>

    <!-- HOW THE GAME WORKS -->
    <section class="mb-4">
      <header class="d-flex align-items-center gap-2 mb-2">
        <span class="pill pill-blue">HOW THE GAME WORKS</span>
        <div class="rule"></div>
      </header>
      <!-- disable keyboard here so only the first one listens to arrows -->
      <FlashStepper :steps="stepsWorks" :group-size="3" :keyboard="false" />
    </section>

    <!-- FRIENDLY TIPS -->
    <section class="mb-4">
      <header class="d-flex align-items-center gap-2 mb-2">
        <span class="pill pill-lilac">FRIENDLY TIPS</span>
        <div class="rule"></div>
      </header>

      <div class="tips-wrap">
        <div class="tip-chip">
          <i class="bi bi-phone"></i>
          On mobile, swipe event cards left/right to browse.
        </div>
        <div class="tip-chip">
          <i class="bi bi-cash-coin"></i>
          Keep a small wallet buffer so you can join multiple events quickly.
        </div>
        <div class="tip-chip">
          <i class="bi bi-info-circle"></i>
          You can only leave (and auto-refund) while you’re in the Waiting Area.
        </div>
        <div class="tip-chip">
          <i class="bi bi-wifi"></i>
          If your connection drops, re-open the event—results are server-authoritative.
        </div>
        <div class="tip-chip">
          <i class="bi bi-gift"></i>
          Check Deals & Rewards for any credits or discounts you earned.
        </div>
      </div>
    </section>

    <!-- FAQ (unchanged copy) -->
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <h3 class="h6 mb-3">FAQ</h3>
        <div class="accordion" id="mgFaq">
          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq1"
              >
                What gets deducted when I join?
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                Your event’s <strong>entry fee</strong> is securely deducted from your eWallet. If
                you leave while still in the <strong>Waiting Area</strong>, that entry fee is
                automatically refunded.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq2"
              >
                When does the game start?
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                As soon as the <strong>player cap</strong> is reached. The room locks and the wheel
                spins automatically.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq3"
              >
                Can I leave after joining?
              </button>
            </h2>
            <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                Yes, but <strong>only</strong> while you are in the Waiting Area. Once the game
                starts, it is locked and you can’t leave. Leaving in the Waiting Area triggers an
                automatic refund of your entry fee.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq4"
              >
                How will I know if I won?
              </button>
            </h2>
            <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                A winner screen appears immediately after the spin with your prize details and next
                steps. Wallet updates and any credits are reflected right away.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#faq5"
              >
                Is the spin fair?
              </button>
            </h2>
            <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                Yes. Results are generated server-side using a fair, tamper-resistant process, then
                broadcast to all players at the same time.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// keep ONE import
import { RouterLink } from 'vue-router'
// import the extracted stepper
import FlashStepper from '@/components/FlashStepper.vue'

// (optional) local type for better TS hints
type Step = {
  num: string
  title: string
  text: string
  icon: string
  accent: 'red' | 'cyan' | 'orange' | 'purple' | 'violet' | 'mint'
}

/* ---------- Content: How to Play ---------- */
const stepsPlay: Step[] = [
  {
    num: '01',
    title: 'Find an Open Event',
    text: 'Go to Mini Games and pick a card labeled “open”. Check the Entry Fee and remaining slots.',
    icon: 'bi bi-broadcast-pin',
    accent: 'red',
  },
  {
    num: '02',
    title: 'Join & Auto-Deduct',
    text: 'Tap Join. Your entry fee is securely deducted from your eWallet. Not enough balance? Top up first.',
    icon: 'bi bi-wallet2',
    accent: 'cyan',
  },
  {
    num: '03',
    title: 'Waiting Area',
    text: 'If slots aren’t full yet, you’ll wait here with other players. You can leave anytime at this stage and your entry fee is instantly refunded.',
    icon: 'bi bi-people',
    accent: 'orange',
  },
  {
    num: '04',
    title: 'Auto-Start',
    text: 'When the player cap is reached, the room locks and the game starts automatically. Leaving is no longer possible.',
    icon: 'bi bi-lock',
    accent: 'purple',
  },
  {
    num: '05',
    title: 'Spin & Reveal',
    text: 'The wheel spins and results are shown to everyone at once. Winners are highlighted and sent to the prize page.',
    icon: 'bi bi-disc',
    accent: 'violet',
  },
  {
    num: '06',
    title: 'Claim & Credits',
    text: 'Winners view prize details and next steps. Players may receive small thank-you credits based on event rules, reflected in your eWallet.',
    icon: 'bi bi-gift',
    accent: 'mint',
  },
]

/* ---------- Content: How the Game Works ---------- */
const stepsWorks: Step[] = [
  {
    num: '01',
    title: 'Balance Check',
    text: 'We verify your eWallet balance before joining. If it’s short, a clear hint tells you how much to top up.',
    icon: 'bi bi-shield-check',
    accent: 'cyan',
  },
  {
    num: '02',
    title: 'Secure Hold',
    text: 'Your entry fee is placed on hold when you join. Leave during the Waiting Area to get an automatic refund.',
    icon: 'bi bi-arrow-repeat',
    accent: 'orange',
  },
  {
    num: '03',
    title: 'Room Lock',
    text: 'Once the player cap is reached, the room locks. From this point the spin begins and leaving is disabled.',
    icon: 'bi bi-hourglass-split',
    accent: 'purple',
  },
  {
    num: '04',
    title: 'Fair Spin',
    text: 'Results are generated server-side using a fair, tamper-resistant process and broadcast simultaneously.',
    icon: 'bi bi-cpu',
    accent: 'mint',
  },
  {
    num: '05',
    title: 'Prizes & Rewards',
    text: 'Winners see prize details instantly. Non-winners may receive event-defined credits or discounts—clear amounts only.',
    icon: 'bi bi-box-seam',
    accent: 'red',
  },
  {
    num: '06',
    title: 'Notifications',
    text: 'On-screen confirmations and (where enabled) notifications appear for wallet updates and prize actions.',
    icon: 'bi bi-bell',
    accent: 'violet',
  },
]
</script>

<style scoped>
/* ===== Palette helpers ===== */
.bg-success-subtle {
  background-color: rgba(25, 135, 84, 0.08) !important;
}
.text-success {
  color: #198754 !important;
}
.border-success-subtle {
  border-color: rgba(25, 135, 84, 0.25) !important;
}

/* ===== Hero ===== */
.tutorial-hero {
  background:
    radial-gradient(700px 400px at 120% -20%, rgba(124, 58, 237, 0.08), transparent 60%),
    radial-gradient(700px 400px at -20% -10%, rgba(67, 97, 238, 0.08), transparent 60%),
    linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
}

/* ===== Section labels ===== */
.pill {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: #f1f5f9;
  color: #0f172a;
  white-space: nowrap;
}
.pill-red {
  border-color: #fecaca;
  background: #fff1f2;
  color: #9f1239;
}
.pill-blue {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}
.pill-lilac {
  border-color: #e9d5ff;
  background: #faf5ff;
  color: #6d28d9;
}
.rule {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, #e5e7eb, transparent);
}

/* ===== Tips chips ===== */
.tips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tip-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
  background:
    radial-gradient(240px 120px at -20% 0%, rgba(99, 102, 241, 0.06), transparent 60%), #ffffff;
  color: #475569;
  font-size: 0.92rem;
}
.tip-chip i {
  font-size: 1rem;
}

/* Accordion polish */
.accordion-button {
  box-shadow: none !important;
}
.accordion-button:not(.collapsed) {
  background: rgba(67, 97, 238, 0.06);
}

/* Small container tweaks */
.howto .card {
  overflow: hidden;
}
</style>
