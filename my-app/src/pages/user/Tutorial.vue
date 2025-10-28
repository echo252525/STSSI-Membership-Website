<template>
  <div class="container py-4">
    <!-- Header / Breadcrumb -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h5 mb-1">How to Play</h1>
        <p class="text-muted small mb-0">
          Quick guide to joining events, spinning the wheel, and claiming discounts.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <RouterLink
          :to="{ name: 'user.minigames' }"
          class="btn btn-outline-secondary btn-sm"
          aria-label="Back to Mini Games"
        >
          ← Back to Mini Games
        </RouterLink>
      </div>
    </div>

    <!-- Hero / Summary -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 tutorial-hero">
      <div class="card-body p-4">
        <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
          <div class="flex-grow-1">
            <h2 class="h5 mb-2 d-flex align-items-center gap-2">
              <span class="badge bg-success-subtle text-success border-success-subtle">Quick Start</span>
              Spin & Save in 3 Steps
            </h2>
            <p class="mb-0 text-secondary">
              Join an open event, spin the prize wheel, and apply your discount at checkout.
              You’ll see real-time players, slots left, and your balance checks before joining.
            </p>
          </div>
          <RouterLink
            :to="{ name: 'user.minigames' }"
            class="btn btn-primary"
            aria-label="Open Mini Games now"
          >
            Try a Spin Now
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Steps -->
    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h3 class="h6 mb-2">1) Find an Open Event</h3>
            <p class="text-secondary mb-3">
              Go to <strong>Mini Games</strong>. Use the slider to browse cards labeled
              <span class="badge bg-success-subtle text-success border-success-subtle text-capitalize">open</span>.
              You’ll see <em>Entry Fee</em>, <em>Joined</em>/<em>Cap</em>, and a progress ring.
            </p>
            <ul class="small text-secondary mb-0">
              <li>Only <em>open</em> events are joinable.</li>
              <li>If an event has a product, the price/discount preview appears in the card.</li>
              <li>Avatars show recent participants; “+N more” indicates additional players.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h3 class="h6 mb-2">2) Join Eligibility</h3>
            <p class="text-secondary mb-3">
              You must be signed in, have enough <strong>eWallet</strong> balance for the entry fee,
              and there must be slots available.
            </p>
            <ul class="small text-secondary mb-0">
              <li>If balance is insufficient, a red inline hint shows how much more you need.</li>
              <li>If the event is full or locked, you’ll see a disabled state and tooltip.</li>
              <li>Already joined? The card shows a “Joined” badge and clicking takes you to the waiting area.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h3 class="h6 mb-2">3) Spin & Results</h3>
            <p class="text-secondary mb-3">
              Click the center wheel area on the active card to join. You’ll hear a subtle sound
              and get routed to the <strong>Waiting Area</strong>. Once the event spins:
            </p>
            <ul class="small text-secondary mb-0">
              <li><strong>Winner:</strong> You’ll be routed to the Winner page with your reward details.</li>
              <li><strong>Didn’t win:</strong> You’ll be routed to the Loser page (there may still be consolation logic based on event rules).</li>
              <li>Real-time updates adjust player counts, avatars, and prices automatically.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h3 class="h6 mb-2">Tips & Shortcuts</h3>
            <ul class="small text-secondary mb-3">
              <li>Use <kbd>←</kbd>/<kbd>→</kbd> keys to switch event cards.</li>
              <li>On mobile, swipe horizontally on the stack to browse events.</li>
              <li>Hovering the active card tilts it slightly; this is decorative and doesn’t affect outcome.</li>
              <li>The progress ring shows how full the event is: more players → fuller ring.</li>
            </ul>

            <div class="d-flex gap-2">
              <RouterLink :to="{ name: 'user.ewallet' }" class="btn btn-outline-primary btn-sm">
                Top Up eWallet
              </RouterLink>
              <RouterLink :to="{ name: 'user.minigames' }" class="btn btn-primary btn-sm">
                Go to Mini Games
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="card border-0 shadow-sm rounded-4 mt-4">
      <div class="card-body p-4">
        <h3 class="h6 mb-3">FAQ</h3>
        <div class="accordion" id="mgFaq">
          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                Why can’t I click the wheel?
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                Make sure the card is active (centered), the event is open, slots are available,
                and your balance covers the entry fee. Tooltips on the card explain the current state.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                Where do I see my rewards/discounts?
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                Winners are redirected to a result page. You may also see applicable discounts in
                <RouterLink :to="{ name: 'user.deals' }">Deals & Rewards</RouterLink> and when purchasing eligible products.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 mb-2 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                Can I join multiple events?
              </button>
            </h2>
            <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                Yes, as long as your balance covers each entry and the events are open with available slots.
              </div>
            </div>
          </div>

          <div class="accordion-item border-0 rounded-3 overflow-hidden">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                How do product discounts display?
              </button>
            </h2>
            <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#mgFaq">
              <div class="accordion-body text-secondary">
                If the event is tied to a product, the card shows the original price and the discounted price
                (original minus the per-player interest). Final application depends on event settlement rules.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  // Optional analytics / focus
  // console.log('[Tutorial] mounted')
})
</script>

<style scoped>
/* match your subtle success palette from MiniGames */
.bg-success-subtle { background-color: rgba(25, 135, 84, 0.08) !important; }
.text-success { color: #198754 !important; }
.border-success-subtle { border-color: rgba(25, 135, 84, 0.25) !important; }

/* soft hero background to blend with your neon gradient app surface */
.tutorial-hero {
  background:
    radial-gradient(700px 400px at 120% -20%, rgba(124,58,237,.08), transparent 60%),
    radial-gradient(700px 400px at -20% -10%, rgba(67,97,238,.08), transparent 60%),
    linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
}

/* Bootstrap accordion polish inside cards */
.accordion-button { box-shadow: none !important; }
.accordion-button:not(.collapsed) {
  background: rgba(67,97,238, .06);
}
</style>
