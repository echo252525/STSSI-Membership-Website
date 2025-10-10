<template>
  <div class="container-fluid membership">
    <!-- ===== Page Header ===== -->
    <div class="page-head d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <div>
        <h2 class="h4 mb-1 text-dark">Membership</h2>
        <p class="text-secondary mb-0">See your tier, benefits, and how to upgrade.</p>
      </div>

      <!-- Opens the “Compare all tiers” modal. -->
      <button
        class="btn btn-brand-ghost"
        data-bs-toggle="modal"
        data-bs-target="#tiersModal"
        type="button"
      >
        View all tiers
      </button>
    </div>

    <!-- ===== Hero / Current status ===== -->
    <div
      :class="[
        'card',
        'border-0',
        'rounded-4',
        'tier-hero',
        'mb-4',
        'is-' + (currentTier?.key || 'regular'),
      ]"
    >
      <div class="card-body p-4 p-md-5">
        <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div class="d-flex align-items-center gap-5">
            <!-- Tier badge (signed URL) -->
            <div class="tier-badge">
              <img v-if="badgeIcon" :src="badgeIcon" :alt="(currentTier?.name || 'Tier') + ' badge'" />
            </div>

            <!-- Current tier label -->
            <div>
              <div class="text-uppercase small text-muted">Current Tier</div>
              <h3 class="mb-0 fw-bold">{{ currentTier?.name || 'Regular Member' }}</h3>
            </div>
          </div>

          <!-- Summary stats -->
          <div class="d-flex gap-2 flex-wrap">
            <div class="stat-chip">
              <span class="label">Total Purchases</span>
              <span class="value">{{ peso(userState.lifetimePurchases) }}</span>
            </div>
            <div class="stat-chip">
              <span class="label">Referrals</span>
              <span class="value">{{ userState.referrals }}</span>
            </div>
            <div class="stat-chip" v-if="nextTier">
              <span class="label">Next Tier</span>
              <span class="value">{{ nextTier?.name }}</span>
            </div>
          </div>
        </div>

        <!-- ===== Progress towards upgrade ===== -->
        <div class="row g-3 mt-4" v-if="nextTier">
          <!-- Purchase progress -->
          <div class="col-md-6">
            <div class="progress-card rounded-4 p-3 h-100">
              <div class="d-flex justify-content-between mb-1">
                <span class="fw-semibold">Purchases towards {{ nextTier.name }}</span>
                <span class="fw-semibold">{{ purchasesPct }}%</span>
              </div>
              <div class="progress progress-brand">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: purchasesPct + '%' }"
                ></div>
              </div>
              <div class="mt-2 text-secondary small">
                You need <strong>{{ peso(remainingPurchases) }}</strong> more in purchases to upgrade.
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

        <!-- At highest tier -->
        <div class="alert alert-success mt-3 mb-0 rounded-3 d-flex align-items-center gap-2" v-else>
          <span class="material-symbols-outlined">verified</span>
          You’re at the highest tier. Enjoy all the perks!
        </div>
      </div>
    </div>

    <!-- ===== Current benefits & preview of next tier ===== -->
    <div class="row g-4">
      <!-- Current tier benefits -->
      <div class="col-lg-6">
        <div class="card border-0 rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
              <span class="material-symbols-outlined text-azure">redeem</span>
              Your Benefits
            </h5>
            <ul class="benefit-list mb-0">
              <li v-for="(b, i) in (currentTier?.benefits || [])" :key="i">
                <span class="material-symbols-outlined">check_circle</span>
                <span v-html="b"></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Next tier preview -->
      <div class="col-lg-6">
        <div class="card border-0 rounded-4 h-100">
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

    <!-- ===== “All tiers” modal ===== -->
    <div class="modal fade" id="tiersModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div :class="['modal-content', 'border-0', 'rounded-4', 'tier-modal', 'is-' + (currentTier?.key || 'regular')]">
          <div class="modal-header border-0 px-4 pt-4 pb-0">
            <h5 class="modal-title fw-bold">Membership tiers</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body px-4 pb-4">
            <div class="row g-3">
              <!-- Use live tiers from DB; falls back to static if needed -->
              <div class="col-sm-6 col-lg-4" v-for="t in tiersLive" :key="t.key">
                <div :class="['tier-card','rounded-4','h-100',{ active: t.key === (currentTier?.key || 'regular') }]">
                  <div class="tier-card-head d-flex align-items-center justify-content-between">
                    <h6 class="fw-bold mb-0 d-flex align-items-center gap-2">
                      <img v-if="t.iconSignedUrl" :src="t.iconSignedUrl" class="tier-icon" :alt="t.name + ' badge'" />
                      <span>{{ t.name }}</span>
                    </h6>
                    <span class="badge bg-light text-secondary" v-if="t.key === (currentTier?.key || 'regular')">Current</span>
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
import { onMounted, ref, reactive, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const users = computed(() => currentUser.value)

/* -------------------------
   Types
------------------------- */
type TierKey = 'regular' | 'silver' | 'gold' | 'platinum' | 'diamond'
type Tier = {
  key: TierKey
  name: string
  purchasesRequired: number
  referralsRequired: number
  benefits: string[]
  iconSignedUrl?: string | null
  id?: string
  order?: number
}

/* -------------------------
   Static (fallback) config
   (kept so your UI never breaks)
------------------------- */
const staticTiers: Tier[] = [
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

/* -------------------------
   Reactive/live state
------------------------- */
const tiersLive = ref<Tier[]>(staticTiers)               // replaces the old hard-coded list in UI
const currentTier = ref<Tier | null>(staticTiers[0])
const nextTier = ref<Tier | null>(null)

// Signed-in user snapshot used by UI
const userState = reactive({
  id: '' as string,
  tierKey: 'regular' as TierKey,
  lifetimePurchases: 0, // ⚠️ replace with your real total purchase amount if you track it
  referrals: 0,
})

// Signed icon for hero badge (current tier)
const badgeIcon = computed(() => currentTier.value?.iconSignedUrl || null)

/* -------------------------
   Utilities
------------------------- */
const peso = (n: number) => `₱${Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

// Slug -> TierKey mapping (DB names should match these keys; fallback is 'regular')
const nameToKey = (name: string): TierKey => {
  const k = (name || '').trim().toLowerCase()
  if (k.includes('silver')) return 'silver'
  if (k.includes('gold')) return 'gold'
  if (k.includes('platinum')) return 'platinum'
  if (k.includes('diamond')) return 'diamond'
  return 'regular'
}

// Build benefits text for a tier from DB row
function composeBenefits(row: any): string[] {
  const out: string[] = []
  // Discount credits per month
  if (row.discount_credits && Number(row.discount_credits) > 0) {
    out.push(`₱${Number(row.discount_credits).toLocaleString('en-PH')} discount credits per month`)
  }
  // % off per purchase
  if (row.discount_per_purchase && Number(row.discount_per_purchase) > 0) {
    out.push(`Enjoy <strong>${Number(row.discount_per_purchase).toFixed(0)}%</strong> discount on all purchases`)
  }
  // Free delivery flag / requirement text
  if (row.is_free_delivery) {
    if (row.purchase_requirements_for_free_delivery && Number(row.purchase_requirements_for_free_delivery) > 0) {
      out.push(`Free delivery for orders worth ₱${Number(row.purchase_requirements_for_free_delivery).toLocaleString('en-PH')}`)
    } else {
      out.push('Free delivery on eligible orders')
    }
  }
  // Referral requirement preview (optional)
  if (row.referral_count_requirements && Number(row.referral_count_requirements) > 0) {
    out.push(`${row.referral_count_requirements} referral${row.referral_count_requirements > 1 ? 's' : ''} required`)
  }
  return out.length ? out : ['Free Membership']
}

/* -------------------------
   Loaders
------------------------- */
const BUCKET = 'tier_icons'
async function signedUrlOrNull(path: string | null | undefined): Promise<string | null> {
  try {
    const p = (path || '').replace(/^\/+/, '')
    if (!p) return null
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(p, 60 * 60) // 1 hour
    if (error) return null
    return data?.signedUrl || null
  } catch {
    return null
  }
}

async function loadLiveTiers() {
  // membership.tiers lives under the "membership" schema
  const { data, error } = await supabase.schema('membership').from('tiers')
    .select('id, membership_name, membership_tier_order, purchases_count, referral_count_requirements, discount_credits, discount_per_purchase, is_free_delivery, purchase_requirements_for_free_delivery, icon_url')
    .order('membership_tier_order', { ascending: true })

  if (error || !data) {
    // keep fallback staticTiers
    return
  }

  // Map DB rows -> Tier model + signed icon URL
  const mapped: Tier[] = []
  for (const row of data) {
    const key = nameToKey(row.membership_name)
    const iconSignedUrl = await signedUrlOrNull(row.icon_url)

    mapped.push({
      id: row.id,
      key,
      name: row.membership_name,
      order: row.membership_tier_order,
      purchasesRequired: Number(row.purchases_count || 0), // interpreted as PHP requirement (adjust if it's "count")
      referralsRequired: Number(row.referral_count_requirements || 0),
      benefits: composeBenefits(row),
      iconSignedUrl,
    })
  }

  // If nothing mapped, keep static; else set live
  if (mapped.length) {
    tiersLive.value = mapped
  }
}

async function loadUserAndMembership() {
  // Ensure authenticated
  let uid: string | null = null
  if (!users.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
    uid = data.user.id
  } else {
    uid = users.value.id
  }

  userState.id = uid!

  // Fetch users row (public.users)
  const { data: userRow, error: uErr } = await supabase
    .from('users')
    .select('id, membership_id, purchases_per_month') // add more fields if needed
    .eq('id', uid)
    .maybeSingle()

  if (uErr) {
    // fallback keeps defaults
  }

  // Referrals via view: referral_stats (referrer_id, referral_code, referrals_count)
  const { data: refRow } = await supabase
    .from('referral_stats')
    .select('referrals_count')
    .eq('referrer_id', uid)
    .maybeSingle()

  userState.referrals = Number(refRow?.referrals_count || 0)

  // Purchases amount (UI stat). Replace this line with your true lifetime amount if you have it.
  userState.lifetimePurchases = Number(userRow?.purchases_per_month || 0)

  // Resolve current tier by user's membership_id
  let tier: Tier | undefined
  if (userRow?.membership_id) {
    tier = tiersLive.value.find(t => t.id === userRow.membership_id)
  }

  // Fallback to first/by order
  currentTier.value = tier || tiersLive.value[0] || staticTiers[0]

  // Compute next tier by order
  if (currentTier.value) {
    // Find ordered list
    const ordered = [...tiersLive.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const idx = ordered.findIndex(t => t.id === currentTier.value!.id)
    nextTier.value = idx >= 0 ? (ordered[idx + 1] || null) : null
  } else {
    nextTier.value = null
  }

  // Save key for hero class
  userState.tierKey = (currentTier.value?.key || 'regular') as TierKey
}

async function loadAll() {
  await loadLiveTiers()
  await loadUserAndMembership()
}

/* -------------------------
   Progress + remaining
------------------------- */
const remainingPurchases = computed(() => {
  if (!nextTier.value) return 0
  const need = Number(nextTier.value.purchasesRequired || 0)
  const have = Number(userState.lifetimePurchases || 0)
  return Math.max(0, need - have)
})

const remainingReferrals = computed(() => {
  if (!nextTier.value) return 0
  const need = Number(nextTier.value.referralsRequired || 0)
  const have = Number(userState.referrals || 0)
  return Math.max(0, need - have)
})

const purchasesPct = computed(() => {
  if (!nextTier.value) return 100
  const pct = clamp01((userState.lifetimePurchases || 0) / Math.max(1, nextTier.value.purchasesRequired || 1))
  return Math.round(pct * 100)
})

const referralsPct = computed(() => {
  if (!nextTier.value) return 100
  const pct = clamp01((userState.referrals || 0) / Math.max(1, nextTier.value.referralsRequired || 1))
  return Math.round(pct * 100)
})

/* -------------------------
   Auth gate + initial load
------------------------- */
onMounted(async () => {
  if (!users.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
  await loadAll()
})
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

/* ========= Tier hero theming ========= */
.tier-hero {
  position: relative;
  overflow: hidden;
  background: #fff;
  --fx-a: rgba(32, 164, 76, 0.1);
  --fx-b: rgba(32, 100, 124, 0.12);
  --fx-line: rgba(32, 100, 124, 0.06);
  --accent-1: #20a44c; /* progress primary */
  --accent-2: #20647c; /* progress secondary */
}
.tier-hero .card-body { position: relative; z-index: 1; }
.card { box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px; }

/* Background paint */
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

/* Per-tier palettes */
.tier-hero.is-regular, .tier-modal.is-regular {
  --fx-a: rgba(0, 128, 0, 0.12);
  --fx-b: rgba(34, 197, 94, 0.14);
  --fx-line: rgba(0, 128, 0, 0.08);
  --accent-1: #2e8b57;
  --accent-2: #20a44c;
}
.tier-hero.is-silver, .tier-modal.is-silver {
  --fx-a: #f3f6fa;
  --fx-b: #eceff5;
  --fx-line: rgba(130, 140, 160, 0.16);
  --accent-1: #9aa7b8;
  --accent-2: #c6ced8;
}
.tier-hero.is-gold, .tier-modal.is-gold {
  --fx-a: #fff4ce;
  --fx-b: #ffe7a6;
  --fx-line: rgba(201, 161, 12, 0.18);
  --accent-1: #d4a017;
  --accent-2: #f1c40f;
}
.tier-hero.is-platinum, .tier-modal.is-platinum {
  --fx-a: #eef3f9;
  --fx-b: #e7eef7;
  --fx-line: rgba(120, 140, 160, 0.18);
  --accent-1: #8aa2b5;
  --accent-2: #c8d4e1;
}
.tier-hero.is-diamond, .tier-modal.is-diamond {
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
    radial-gradient(120% 140% at 8% 100%, var(--fx-b) 0%, transparent 60%);
  pointer-events: none;
}
.tier-modal > * { position: relative; z-index: 1; }
.tier-modal .modal-title { color: var(--accent-1); }

/* Badge and modal icons */
.tier-badge { display: grid; place-items: center; }
.tier-badge img { width: 78px; height: 78px; object-fit: contain; }
.tier-icon { width: 30px; height: 30px; object-fit: contain; }

/* Summary chips */
.stat-chip {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  min-width: 160px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
              rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
              rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
}
.stat-chip .label { font-size: 0.8rem; color: #6c757d; display: block; }
.stat-chip .value { font-weight: 700; }

/* Progress bars */
.progress-card { background: #fff; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px; }
.progress-brand { height: 10px; background: #f0f5f7; border-radius: 999px; }
.progress-brand .progress-bar { background: linear-gradient(90deg, var(--accent-1), var(--accent-2)); border-radius: 999px; }
.progress-brand .progress-bar.alt { background: linear-gradient(90deg, var(--accent-2), var(--accent-1)); }

/* Benefit list */
.benefit-list { list-style: none; padding: 0; margin: 0; }
.benefit-list li {
  display: flex; gap: 0.55rem; align-items: flex-start;
  padding: 0.4rem 0; border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}
.benefit-list li:last-child { border-bottom: 0; }
.benefit-list .material-symbols-outlined {
  color: var(--brand-azure);
  font-variation-settings: 'FILL' 1;
  font-size: 20px; line-height: 1.1; margin-top: 0.1rem;
}
.benefit-list.compact .material-symbols-outlined { font-size: 18px; }

/* Modal tier cards */
.tier-card { border: 1px solid rgba(0, 0, 0, 0.06); background: #fff; padding: 1rem; transition: transform 0.18s ease; }
.tier-card:hover { transform: translateY(-2px); }
.tier-card.active { outline: 2px solid var(--accent-1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-1) 18%, transparent); }
.tier-card-head h6 { font-size: 0.95rem; }
.text-green { color: var(--brand-green); }
.text-azure { color: var(--brand-azure); }

/* Mobile */
@media only screen and (max-width: 431px) {
  .page-head { gap: 0.25rem; }
  .page-head .btn-brand-ghost { padding: 0.45rem 0.7rem; border-radius: 10px; }
  .tier-badge .material-symbols-outlined { font-size: 44px; }
  .stat-chip { min-width: 140px; padding: 0.55rem 0.7rem; }
  .progress-brand { height: 8px; }
  .benefit-list li { padding: 0.35rem 0; }
  .tier-card { padding: 0.85rem; }
  .tier-badge img { width: 58px; height: 58px; }
  .tier-icon { width: 28px; height: 28px; }
}
</style>
