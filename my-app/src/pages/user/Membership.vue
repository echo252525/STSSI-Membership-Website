<template>
  <div class="container-fluid membership">
    <!-- ===== Page Header ===== -->
    <div class="page-head d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <div>
        <h2 class="h4 mb-1 text-dark">Membership</h2>
        <p class="text-secondary mb-0">See your tier, benefits, and how to upgrade.</p>
      </div>

      <!-- Opens the “Compare all tiers” modal.
           Purely UI — no data mutation happens here. -->
      <button
        class="btn btn-brand-ghost"
        data-bs-toggle="modal"
        data-bs-target="#tiersModal"
        type="button"
      >
        View all tiers
      </button>
    </div>

    <!-- ===== Hero / Current status =====
         Dynamic class 'is-<tier>' drives the background theme and progress colors via CSS variables. -->
    <div
      :class="[
        'card',
        'border-0',
        'rounded-4',
        'shadow-sm',
        'tier-hero',
        'mb-4',
        'is-' + currentTier.key, // .is-regular / .is-silver / .is-gold / .is-platinum / .is-diamond
      ]"
    >
      <div class="card-body p-4 p-md-5">
        <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div class="d-flex align-items-center gap-5">
            <!-- Tier badge:
                 - If we have a branded image for the tier (silver/gold/platinum/diamond), show it
                 - Otherwise fall back to the Material icon (regular). -->
            <div class="tier-badge">
              <img v-if="badgeIcon" :src="badgeIcon" :alt="currentTier.name + ' badge'" />
              <span v-else class="material-symbols-outlined">workspace_premium</span>
            </div>

            <!-- Current tier label (server-provided via computed 'currentTier') -->
            <div>
              <div class="text-uppercase small text-muted">Current Tier</div>
              <h3 class="mb-0 fw-bold">{{ currentTier.name }}</h3>
            </div>
          </div>

          <!-- Summary stats.
               Backend provides lifetimePurchases and referrals on the 'user' object. -->
          <div class="d-flex gap-2 flex-wrap">
            <div class="stat-chip">
              <span class="label">Total Purchases</span>
              <span class="value">{{ peso(user.lifetimePurchases) }}</span>
            </div>
            <div class="stat-chip">
              <span class="label">Referrals</span>
              <span class="value">{{ user.referrals }}</span>
            </div>
            <div class="stat-chip" v-if="nextTier">
              <span class="label">Next Tier</span>
              <span class="value">{{ nextTier?.name }}</span>
            </div>
          </div>
        </div>

        <!-- ===== Progress towards upgrade =====
             Only shown when there IS a higher tier (i.e., not already at max). -->
        <div class="row g-3 mt-4" v-if="nextTier">
          <!-- Purchase progress -->
          <div class="col-md-6">
            <div class="progress-card rounded-4 p-3 h-100">
              <div class="d-flex justify-content-between mb-1">
                <span class="fw-semibold">Purchases towards {{ nextTier.name }}</span>
                <span class="fw-semibold">{{ purchasesPct }}%</span>
              </div>
              <div class="progress progress-brand">
                <!-- Width computed from user.lifetimePurchases vs nextTier.purchasesRequired -->
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: purchasesPct + '%' }"
                ></div>
              </div>
              <div class="mt-2 text-secondary small">
                You need <strong>{{ peso(remainingPurchases) }}</strong> more in purchases to
                upgrade.
              </div>
            </div>
          </div>

          <!-- Referral progress -->
          <div class="col-md-6">
            <div class="progress-card rounded-4 p-3 h-100">
              <div class="d-flex justify-content-between mb-1">
                <span class="fw-semibold">Referrals towards {{ nextTier.name }}</span>
                <span class="fw-semibold">{{ referralsPct }}%</span>
              </div>
              <div class="progress progress-brand">
                <!-- Width computed from user.referrals vs nextTier.referralsRequired -->
                <div
                  class="progress-bar alt"
                  role="progressbar"
                  :style="{ width: referralsPct + '%' }"
                ></div>
              </div>
              <div class="mt-2 text-secondary small">
                You need <strong>{{ remainingReferrals }}</strong> more referral(s) to upgrade.
              </div>
            </div>
          </div>
        </div>

        <!-- If there’s no higher tier (already top tier), show a friendly notice. -->
        <div class="alert alert-success mt-3 mb-0 rounded-3 d-flex align-items-center gap-2" v-else>
          <span class="material-symbols-outlined">verified</span>
          You’re at the highest tier. Enjoy all the perks!
        </div>
      </div>
    </div>

    <!-- ===== Current benefits & preview of next tier ===== -->
    <div class="row g-4">
      <!-- Current tier benefits (static text pulled from 'tiers' config based on currentTier) -->
      <div class="col-lg-6">
        <div class="card border-0 rounded-4 shadow-sm h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
              <span class="material-symbols-outlined text-azure">redeem</span>
              Your Benefits
            </h5>
            <ul class="benefit-list mb-0">
              <li v-for="(b, i) in currentTier.benefits" :key="i">
                <span class="material-symbols-outlined">check_circle</span>
                <!-- Benefit strings can contain markup (e.g., bold %). -->
                <span v-html="b"></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Sneak peek of next tier (requirements + benefits).
           Hidden when user is already at the highest tier. -->
      <div class="col-lg-6">
        <div class="card border-0 rounded-4 shadow-sm h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
              <span class="material-symbols-outlined text-green">trending_up</span>
              What you’ll unlock next ({{ nextTier?.name || '–' }})
            </h5>

            <template v-if="nextTier">
              <div class="mb-3 small text-secondary">
                Requirements:
                <strong>{{ peso(nextTier.purchasesRequired) }} in purchases</strong> and
                <strong>{{ nextTier.referralsRequired }} referrals</strong>.
              </div>

              <ul class="benefit-list mb-3">
                <li v-for="(b, i) in nextTier.benefits" :key="i">
                  <span class="material-symbols-outlined">star</span>
                  <span v-html="b"></span>
                </li>
              </ul>
            </template>

            <!-- Shortcut to open the detailed comparison modal. -->
            <button
              class="btn btn-outline-secondary w-100 mt-1"
              data-bs-toggle="modal"
              data-bs-target="#tiersModal"
              type="button"
            >
              Compare all tiers
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== “All tiers” modal (compact comparison) ===== -->
    <div class="modal fade" id="tiersModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div
          :class="['modal-content', 'border-0', 'rounded-4', 'tier-modal', 'is-' + currentTier.key]"
        >
          <div class="modal-header border-0 px-4 pt-4 pb-0">
            <h5 class="modal-title fw-bold">Membership tiers</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body px-4 pb-4">
            <div class="row g-3">
              <!-- Renders every tier from the static config below. -->
              <div class="col-sm-6 col-lg-4" v-for="t in tiers" :key="t.key">
                <div
                  :class="[
                    'tier-card',
                    'rounded-4',
                    'h-100',
                    { active: t.key === currentTier.key },
                  ]"
                >
                  <!-- Show tier icon when available; otherwise just the text name. -->
                  <div class="tier-card-head d-flex align-items-center justify-content-between">
                    <h6 class="fw-bold mb-0 d-flex align-items-center gap-2">
                      <img
                        v-if="iconFor(t.key)"
                        :src="iconFor(t.key)"
                        class="tier-icon"
                        :alt="t.name + ' badge'"
                      />
                      <span>{{ t.name }}</span>
                    </h6>
                    <span class="badge bg-light text-secondary" v-if="t.key === currentTier.key"
                      >Current</span
                    >
                  </div>

                  <div class="small text-secondary mt-2">
                    Requires <strong>{{ peso(t.purchasesRequired) }}</strong> purchases /
                    <strong>{{ t.referralsRequired }}</strong> referrals
                  </div>
                  <hr class="my-3" />
                  <ul class="benefit-list compact">
                    <li v-for="(b, i) in t.benefits" :key="i">
                      <span class="material-symbols-outlined">check_small</span>
                      <span v-html="b"></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="mt-3 small text-secondary">
              * Some referral requirements include a minimum purchase amount; see terms for details.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Tier type — this mirrors your business rules.
 * If backend changes requirements/benefits, update the 'tiers' config below
 * or return a similar structure from your API and replace this local constant.
 */
type Tier = {
  key: 'regular' | 'silver' | 'gold' | 'platinum' | 'diamond'
  name: string
  purchasesRequired: number
  referralsRequired: number
  benefits: string[]
}

/**
 * Static tier configuration (copy of the descriptions you provided).
 * Backend can also source this dynamically; keep keys stable as they’re used in theming and icon mapping.
 */
const tiers: Tier[] = [
  {
    key: 'regular',
    name: 'Regular Member',
    purchasesRequired: 0,
    referralsRequired: 0,
    benefits: [
      'Free Membership',
      '₱2,000 discount credits per month',
      'Enjoy <strong>5%</strong> discount on all purchases',
    ],
  },
  {
    key: 'silver',
    name: 'Silver Member',
    purchasesRequired: 10_000,
    referralsRequired: 10,
    benefits: [
      'Made ₱10,000 worth of purchases',
      '10 Referrals with ₱5,000 purchases',
      '₱10,000 discount credits per month',
      'Enjoy <strong>6%</strong> discount on all purchases',
    ],
  },
  {
    key: 'gold',
    name: 'Gold Member',
    purchasesRequired: 20_000,
    referralsRequired: 20,
    benefits: [
      'Made ₱20,000 worth of purchases',
      '20 Referrals with ₱10,000 purchases',
      '₱20,000 discount credits per month',
      'Enjoy <strong>7%</strong> discount on all purchases',
      'Free Delivery for Val. Order worth ₱10,000',
    ],
  },
  {
    key: 'platinum',
    name: 'Platinum Member',
    purchasesRequired: 50_000,
    referralsRequired: 50,
    benefits: [
      'Made ₱50,000 worth of purchases',
      '50 Referrals with ₱20,000 purchases',
      '₱50,000 discount credits per month',
      'Enjoy <strong>8%</strong> discount on all purchases',
      'Free delivery for GMA orders worth ₱10,000',
    ],
  },
  {
    key: 'diamond',
    name: 'Diamond Member',
    purchasesRequired: 100_000,
    referralsRequired: 100,
    benefits: [
      'Made ₱100,000 worth of purchases',
      '100 Referrals with ₱50,000 purchases',
      '₱100,000 discount credits per month',
      'Enjoy <strong>10%</strong> discount on all purchases',
      'Free delivery for GMA orders worth ₱10,000',
      'Exclusive Discount Offers',
    ],
  },
]

/**
 * Tier icon mapping:
 * Place silver.png, gold.png, platinum.png, diamond.png inside /public (Vite/CLI serves them from the site root).
 * For “regular”, we intentionally don’t map an image (uses Material icon instead).
 */
import { computed } from 'vue'
const ICON_BASE = '/' // point to /public
const iconFor = (key: Tier['key']) => {
  switch (key) {
    case 'silver':
      return ICON_BASE + 'silver.png'
    case 'gold':
      return ICON_BASE + 'gold.png'
    case 'platinum':
      return ICON_BASE + 'platinum.png'
    case 'diamond':
      return ICON_BASE + 'diamond.png'
    default:
      return '' // regular => keep Material icon
  }
}
const badgeIcon = computed(() => iconFor(currentTier.key))

/**
 * DUMMY snapshot of the signed-in member.
 * >>> Backend: replace with data from your API/session store.
 * Expected shape:
 *   user.tier                 -> one of Tier['key']
 *   user.lifetimePurchases    -> number in PHP
 *   user.referrals            -> total qualifying referrals
 */
const user = {
  tier: 'silver' as Tier['key'],
  lifetimePurchases: 7_500,
  referrals: 6,
}

/** Resolve current & next tier from the config using user.tier. */
const currentIndex = tiers.findIndex((t) => t.key === user.tier)
const currentTier = tiers[Math.max(0, currentIndex)]
const nextTier = tiers[currentIndex + 1] ?? null

/**
 * Upgrade gaps — show how much more is needed.
 * If already at top tier, values are 0 and the “max tier” banner is shown.
 */
const remainingPurchases = nextTier
  ? Math.max(0, nextTier.purchasesRequired - user.lifetimePurchases)
  : 0
const remainingReferrals = nextTier ? Math.max(0, nextTier.referralsRequired - user.referrals) : 0

/** Percent completion bars (clamped to 0–100). */
const purchasesPct = nextTier
  ? Math.min(100, Math.round((user.lifetimePurchases / nextTier.purchasesRequired) * 100))
  : 100
const referralsPct = nextTier
  ? Math.min(100, Math.round((user.referrals / nextTier.referralsRequired) * 100))
  : 100

/** Simple peso formatter. Backend can also send preformatted strings if preferred. */
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
</script>

<style scoped>
/* ========= Brand tokens (global-ish for this component) ========= */
:root,
:host {
  --brand-green: #20a44c;
  --brand-azure: #20647c;
  --soft-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
}

/* Header CTA styling */
.page-head .btn-brand-ghost {
  border: 1px solid color-mix(in srgb, var(--brand-azure) 40%, #fff 60%);
  color: var(--brand-azure);
  background: #fff;
  border-radius: 12px;
  font-weight: 600;
  padding: 0.5rem 0.9rem;
}
.page-head .btn-brand-ghost:hover {
  border-color: var(--brand-azure);
  background: linear-gradient(135deg, #fff, #f6fbfd);
}

/* ========= Tier hero theming =========
   The hero uses CSS variables (set per-tier) to paint soft backgrounds and to color progress bars. */
.tier-hero {
  position: relative;
  overflow: hidden;
  background: #fff;

  /* defaults (overridden by .is-*) */
  --fx-a: rgba(32, 164, 76, 0.1);
  --fx-b: rgba(32, 100, 124, 0.12);
  --fx-line: rgba(32, 100, 124, 0.06);
  --accent-1: #20a44c; /* progress primary */
  --accent-2: #20647c; /* progress secondary */
}
.tier-hero .card-body {
  position: relative;
  z-index: 1;
}
/* Background paint (two blurred blobs + faint stripes) */
.tier-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(140% 120% at 85% 8%, var(--fx-a) 0%, transparent 60%),
    radial-gradient(120% 140% at 10% 90%, var(--fx-b) 0%, transparent 60%),
    repeating-linear-gradient(135deg, transparent 0 10px, var(--fx-line) 10px 11px);
  pointer-events: none;
}

/* ===== Per-tier palettes (adjust these to fine-tune the look) ===== */
.tier-hero.is-regular,
.tier-modal.is-regular {
  --fx-a: rgba(32, 164, 76, 0.1);
  --fx-b: rgba(32, 100, 124, 0.12);
  --fx-line: rgba(32, 100, 124, 0.06);
  --accent-1: #20a44c;
  --accent-2: #20647c;
}
.tier-hero.is-silver,
.tier-modal.is-silver {
  --fx-a: #f3f6fa;
  --fx-b: #eceff5;
  --fx-line: rgba(130, 140, 160, 0.16);
  --accent-1: #9aa7b8;
  --accent-2: #c6ced8;
}
.tier-hero.is-gold,
.tier-modal.is-gold {
  --fx-a: #fff4ce;
  --fx-b: #ffe7a6;
  --fx-line: rgba(201, 161, 12, 0.18);
  --accent-1: #d4a017;
  --accent-2: #f1c40f;
}
.tier-hero.is-platinum,
.tier-modal.is-platinum {
  --fx-a: #eef3f9;
  --fx-b: #e7eef7;
  --fx-line: rgba(120, 140, 160, 0.18);
  --accent-1: #8aa2b5;
  --accent-2: #c8d4e1;
}
.tier-hero.is-diamond,
.tier-modal.is-diamond {
  --fx-a: #e6fbff;
  --fx-b: #dff4ff;
  --fx-line: rgba(48, 172, 228, 0.22);
  --accent-1: #30ace4;
  --accent-2: #3094cc;
}
.tier-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(135% 120% at 85% 0%, var(--fx-a) 0%, transparent 60%),
    radial-gradient(120% 140% at 8% 100%, var(--fx-b) 0%, transparent 60%),
    repeating-linear-gradient(120deg, transparent 0 10px, var(--fx-line) 10px 11px);
  pointer-events: none;
}
.tier-modal > * {
  position: relative;
  z-index: 1;
}
.tier-modal .modal-title {
  color: var(--accent-1);
}

/* Badge and modal icons */
.tier-badge {
  display: grid;
  place-items: center;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-azure) 10%, #fff 90%),
    color-mix(in srgb, var(--brand-green) 10%, #fff 90%)
  );
  color: var(--brand-azure);
}
.tier-badge .material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
  font-size: 56px;
}
.tier-badge img {
  width: 78px;
  height: 78px;
  object-fit: contain;
}
.tier-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

/* Summary chips */
.stat-chip {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  min-width: 160px;
}
.stat-chip .label {
  font-size: 0.8rem;
  color: #6c757d;
  display: block;
}
.stat-chip .value {
  font-weight: 700;
}

/* Progress bars (colors are taken from --accent-1/2 set above) */
.progress-card {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.progress-brand {
  height: 10px;
  background: #f0f5f7;
  border-radius: 999px;
}
.progress-brand .progress-bar {
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  border-radius: 999px;
}
.progress-brand .progress-bar.alt {
  background: linear-gradient(90deg, var(--accent-2), var(--accent-1));
}

/* Benefit list */
.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.benefit-list li {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.4rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}
.benefit-list li:last-child {
  border-bottom: 0;
}
.benefit-list .material-symbols-outlined {
  color: var(--brand-azure);
  font-variation-settings: 'FILL' 1;
  font-size: 20px;
  line-height: 1.1;
  margin-top: 0.1rem;
}
.benefit-list.compact .material-symbols-outlined {
  font-size: 18px;
}

/* Modal tier cards */
.tier-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
  padding: 1rem;
  transition: transform 0.18s ease;
}
.tier-card:hover {
  transform: translateY(-2px);
}
.tier-card.active {
  outline: 2px solid var(--accent-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-1) 18%, transparent);
}
.tier-card-head h6 {
  font-size: 0.95rem;
}
.text-green {
  color: var(--brand-green);
}
.text-azure {
  color: var(--brand-azure);
}

/* ===== Mobile tweaks (≤ 431px) ===== */
@media only screen and (max-width: 431px) {
  .page-head {
    gap: 0.25rem;
  }
  .page-head .btn-brand-ghost {
    padding: 0.45rem 0.7rem;
    border-radius: 10px;
  }
  .tier-badge .material-symbols-outlined {
    font-size: 44px;
  }
  .stat-chip {
    min-width: 140px;
    padding: 0.55rem 0.7rem;
  }
  .progress-brand {
    height: 8px;
  }
  .benefit-list li {
    padding: 0.35rem 0;
  }
  .tier-card {
    padding: 0.85rem;
  }
  .tier-badge img {
    width: 58px;
    height: 58px;
  }
  .tier-icon {
    width: 28px;
    height: 28px;
  }
}
</style>
