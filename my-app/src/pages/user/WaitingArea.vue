<template>
  <div class="container py-4 waiting-area-root">
    <!-- Neon gradient lobby background -->
    <div class="wa-aurora"></div>
    <div class="wa-grid"></div>

    <div class="card border-0 shadow-sm rounded-4 wa-card">
      <div class="card-body p-4 text-center position-relative">
        <!-- Title / subtitle -->
        <div class="wa-title-wrap">
          <h2 class="h4 mb-2 fw-semibold wa-title">Waiting Area</h2>
          <p class="text-secondary mb-0 wa-subtext">
            You’ve joined <strong>{{ event?.title || 'the event' }}</strong>. Settle in—your game starts soon.
          </p>
        </div>

        <!-- Players pill + progress -->
        <div v-if="event" class="wa-lobby-top mt-3">
          <div class="wa-lobby-row">
            <span class="badge rounded-pill px-3 py-2 wa-pill">
              Players&nbsp;·&nbsp;<strong>{{ event.player_count }}</strong>/<span class="text-muted">{{ event.player_cap }}</span>
            </span>
            <span class="badge rounded-pill px-3 py-2 wa-pill-soft text-capitalize">{{ event.status }}</span>
          </div>

        <div class="wa-progress-wrap mt-3" role="progressbar" :aria-valuenow="progressPct" aria-valuemin="0" aria-valuemax="100">
            <div class="wa-progress-bar" :style="{ width: progressPct + '%' }"></div>
            <div class="wa-progress-label">{{ progressPct }}%</div>
          </div>
        </div>

        <!-- Product image: centered round tile -->
        <div class="wa-image-frame mt-4">
          <div v-if="imageLoading" class="wa-img-skeleton-circle"></div>
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Event Prize"
            class="wa-image-circle"
            @load="imageLoading = false"
            @error="imageLoading = false"
          />
          <div class="wa-ring"></div>
        </div>

        <!-- Minimal spinner + dots -->
        <div class="mb-4 mt-3">
          <div class="wa-spinner-wrap" aria-hidden="true">
          </div>
          <div class="wa-dots mt-3" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div v-if="isLoading" class="small text-muted mt-2">Loading event…</div>
        </div>

        <!-- Lobby stat chips (no IDs) -->
        <div v-if="!isLoading && event" class="wa-stats-grid mt-2">
          <div class="wa-stat">
            <div class="wa-stat-label">Entry Fee</div>
            <div class="wa-stat-value">{{ formatMoney(event.entry_fee) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Winner Prize</div>
            <div class="wa-stat-value">{{ formatMoney(event.winner_price) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Loser Refund</div>
            <div class="wa-stat-value">{{ formatMoney(event.loser_refund_amount) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Interest / Loser</div>
            <div class="wa-stat-value">{{ formatMoney(event.interest_per_loser) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Interest Pool</div>
            <div class="wa-stat-value">{{ formatMoney(event.interest_pool) }}</div>
          </div>
          <div class="wa-stat">
            <div class="wa-stat-label">Item Cost</div>
            <div class="wa-stat-value">{{ formatMoney(event.item_supplier_cost) }}</div>
          </div>
        </div>

        <!-- Meta row (HIDDEN) -->
        <div v-if="!isLoading && event" class="wa-meta mt-3 d-none">
          <div class="wa-meta-item">
            <span class="wa-meta-k">Created</span>
            <span class="wa-meta-v">{{ formatDate(event.created_at) }}</span>
          </div>
          <div class="wa-meta-item">
            <span class="wa-meta-k">Updated</span>
            <span class="wa-meta-v">{{ formatDate(event.updated_at) }}</span>
          </div>
        </div>

        <!-- Tip marquee -->
        <div class="wa-tips mt-4" aria-live="polite">
          <div class="wa-tips-track">
            <span class="wa-tip">Tip: Don’t close the tab—your slot is reserved while you wait.</span>
            <span class="wa-dot">•</span>
            <span class="wa-tip">Your chance improves when the lobby fills. Invite a friend to speed it up.</span>
            <span class="wa-dot">•</span>
            <span class="wa-tip">Prizes are revealed at start. Good luck!</span>
          </div>
        </div>

        <!-- Back / confirm -->
        <div class="d-flex flex-column align-items-center gap-2 mt-4">
          <button
            class="btn btn-outline-secondary wa-leave-btn"
            :disabled="deleting || isLoading"
            @click="openConfirm"
          >
            <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
            ← Back
          </button>
          <div class="text-muted small">
            Going back will <strong>free your slot</strong>.
          </div>
        </div>

        <div v-if="err" class="text-danger small mt-3">{{ err }}</div>
      </div>
    </div>

    <!-- (Kept) Event card wrapper below if you want to place extra content later -->
    <div class="card border-0 shadow-sm rounded-4 mt-3 d-none">
      <div class="card-body p-4"></div>
    </div>

    <!-- Confirm modal -->
    <div v-if="showConfirm" class="wa-modal-backdrop" @click.self="closeConfirm">
      <div class="wa-modal card rounded-4 shadow-sm">
        <div class="card-body p-4">
          <h5 class="mb-2 fw-semibold">Leave waiting area?</h5>
          <p class="mb-4 text-secondary">
            If you go back now, your reserved slot for this event will be removed.
          </p>
          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-light" @click="closeConfirm">Stay</button>
            <button class="btn btn-danger" :disabled="deleting" @click="confirmLeave">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Leave & free my slot
            </button>
          </div>
        </div>
        <button class="wa-modal-close" @click="closeConfirm" aria-label="Close">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const router = useRouter()

const eventId = route.query.eventId as string | undefined
const deleting = ref(false)
const err = ref<string>('')

// NEW: loading states
const isLoading = ref(true)
const imageLoading = ref(true)

// display state
type EventRow = {
  id: string
  title: string
  item_supplier_cost: number
  entry_fee: number
  player_count: number
  interest_pool: number
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
  product_id: string
  player_cap: number
  user_id_winner: string | null
  interest_per_loser: number
  winner_price: number
  loser_refund_amount: number
}
const event = ref<EventRow | null>(null)
const imageUrl = ref<string | null>(null)

// Progress (players / cap) as %
const progressPct = computed<number>(() => {
  if (!event.value) return 0
  const cap = Number(event.value.player_cap || 0)
  const cnt = Number(event.value.player_count || 0)
  if (!cap) return 0
  const pct = Math.max(0, Math.min(100, Math.round((cnt / cap) * 100)))
  return pct
})

// ===== CONFIG per your setup =====
const PRODUCT_BUCKET = 'prize_product' // your storage bucket name

function isHttpUrl(path?: string | null) {
  return !!path && /^https?:\/\//i.test(path)
}

/**
 * Create a SIGNED URL for a storage object path in the 'prize_product' bucket.
 * If the product_url is already http(s), it is returned as-is.
 * @param path storage path like "products/abc123.jpg"
 * @param expiresIn seconds (default 1 hour)
 */
async function toSignedUrl(path: string | null | undefined, expiresIn = 3600): Promise<string | null> {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data, error } = await supabase
    .storage
    .from(PRODUCT_BUCKET)
    .createSignedUrl(path, expiresIn, { download: false })
  if (error) {
    console.error('createSignedUrl error:', error)
    return null
  }
  return data?.signedUrl || null
}

/**
 * (Kept for compatibility; not used for the main image since we require signed URL)
 */
function toPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
  return data?.publicUrl || null
}

// ===== Confirmation modal state =====
const showConfirm = ref(false)
function openConfirm() { showConfirm.value = true }
function closeConfirm() { if (!deleting.value) showConfirm.value = false }
async function confirmLeave() { await goBack() }

// ===== Load event + product image (uses games.products) =====
async function fetchEventAndImage() {
  isLoading.value = true
  imageLoading.value = true
  try {
    if (!eventId) {
      err.value = 'No event specified.'
      return
    }
    // 1) Get event (ALL columns, as per provided schema)
    const { data: ev, error: evErr } = await supabase
      .schema('games')
      .from('event')
      .select(`
        id, title, item_supplier_cost, entry_fee, player_count, interest_pool,
        status, created_by, created_at, updated_at, product_id, player_cap,
        user_id_winner, interest_per_loser, winner_price, loser_refund_amount
      `)
      .eq('id', eventId)
      .single()

    if (evErr) {
      console.error('Failed to load event:', evErr)
      err.value = 'Failed to load event details.'
      return
    }
    event.value = ev as EventRow

    // 2) If event has product_id, fetch products.product_url
    if (ev?.product_id) {
      const { data: prod, error: prodErr } = await supabase
        .schema('games')
        .from('products') // plural
        .select('product_url')
        .eq('id', ev.product_id)
        .single()

      if (prodErr) {
        console.error('Failed to load product:', prodErr)
        imageLoading.value = false
      } else {
        const path = (prod as any)?.product_url as string | null
        imageUrl.value = await toSignedUrl(path) // ← SIGNED URL
        // image will flip imageLoading off onload/onerror in <img>
      }
    } else {
      imageLoading.value = false
    }
  } catch (e: any) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// ===== Your existing delete logic (unchanged) =====
let deleteRan = false
async function deleteEntryIfNeeded() {
  if (deleteRan) return
  deleteRan = true
  try {
    if (!eventId) return
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) throw userErr
    const userId = userRes.user?.id
    if (!userId) return

    const { error: delErr } = await supabase
      .schema('games')
      .from('entry')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (delErr) {
      console.error('entry delete failed:', delErr)
      err.value = delErr.message || 'Failed to leave event.'
    }
  } catch (e: any) {
    console.error(e)
    err.value = e?.message || 'Something went wrong.'
  }
}

async function goBack() {
  err.value = ''
  deleting.value = true
  try {
    await deleteEntryIfNeeded()
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push({ name: 'user.minigames' })
    }
  } catch (e: any) {
    console.error(e)
    err.value = e?.message || 'Something went wrong.'
  } finally {
    deleting.value = false
    showConfirm.value = false
  }
}

// Keep deletion on route leave (browser back, link, etc.)
onBeforeRouteLeave(() => {
  void deleteEntryIfNeeded()
})

// Optional native prompt on hard refresh/close only
function beforeUnload(e: BeforeUnloadEvent) {
  if (!deleteRan) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// format helpers
function formatMoney(v: number | null | undefined) {
  if (v === null || v === undefined) return '—'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(v))
  } catch {
    return Number(v).toFixed(2)
  }
}
function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(v))
  } catch {
    return v
  }
}

onMounted(() => {
  fetchEventAndImage()
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
:root {
  --wa-bg: #0b1020;
  --wa-card: #0f1528;
  --wa-border: #212b43;
  --wa-muted: #a3acc2;
  --wa-accent: #7c9cff;
  --wa-accent-2: #52e3b6;
  --wa-danger: #dc3545;
  --wa-chip: #141b33;
  --wa-chip-border: #233054;
  --wa-chip-soft: #101a2e;
}

.waiting-area-root {
  position: relative;
  min-height: 70vh;
  color: #eaf1ff;
  overflow: hidden;
}

/* Neon gradient background + subtle grid */
.wa-aurora {
  position: absolute;
  inset: -20% -10%;
  background:
    radial-gradient(45% 55% at 20% 10%, rgba(124,156,255,0.25), transparent 60%),
    radial-gradient(60% 55% at 80% 30%, rgba(82,227,182,0.18), transparent 60%),
    radial-gradient(50% 60% at 50% 90%, rgba(143,119,255,0.18), transparent 60%);
  filter: blur(30px);
  z-index: 0;
}
.wa-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(80% 60% at 50% 40%, #000 60%, transparent 100%);
  z-index: 0;
}

.wa-card {
  position: relative;
  background: linear-gradient(180deg, rgba(18,26,49,0.9), rgba(15,21,40,0.95));
  border: 1px solid var(--wa-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.02);
  z-index: 1;
}
.wa-title { color: #f3f6ff; }
.wa-subtext { color: var(--wa-muted); }
.wa-title-wrap { display: grid; gap: 2px; }

/* Lobby top row */
.wa-lobby-top { display: grid; gap: 10px; }
.wa-lobby-row { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

.wa-pill {
  background: var(--wa-chip);
  color: #dbe5ff;
  border: 1px solid var(--wa-chip-border);
}
.wa-pill-soft {
  background: var(--wa-chip-soft);
  color: #cdd9ff;
  border: 1px dashed var(--wa-chip-border);
}

/* Progress */
.wa-progress-wrap {
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: #0c1224;
  border: 1px solid #1f2a49;
  overflow: hidden;
}
.wa-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6e8dff, #52e3b6);
  box-shadow: 0 0 12px rgba(124,156,255,0.5);
  transition: width 420ms ease;
}
.wa-progress-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #c7d3ff;
  text-shadow: 0 1px 0 rgba(0,0,0,0.4);
}

/* Circular prize image */
.wa-image-frame {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 180px;
}
.wa-image-circle {
  width: 164px;
  height: 164px;
  border-radius: 50%;
  border: 1px solid var(--wa-border);
  object-fit: cover;
  box-shadow: 0 10px 28px rgba(36, 62, 160, 0.25);
}
.wa-img-skeleton-circle {
  width: 164px;
  height: 164px;
  border-radius: 50%;
  border: 1px solid var(--wa-border);
  background: linear-gradient(90deg, #141c36 25%, #0f1a33 37%, #141c36 63%);
  background-size: 400% 100%;
  animation: wa-shimmer 1.4s ease-in-out infinite;
}
.wa-ring {
  position: absolute;
  width: 200px; height: 200px;
  border-radius: 50%;
  border: 1px dashed rgba(124,156,255,0.35);
  animation: wa-spin 10s linear infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes wa-spin {
  to { transform: rotate(360deg); }
}
@keyframes wa-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

/* Spinner */
.wa-spinner-wrap {
  width: 54px; height: 54px; margin: 0 auto; display: grid; place-items: center;
}
.wa-spinner-wrap .spinner-border {
  width: 2.2rem; height: 2.2rem; border-width: 0.22rem;
  color: var(--wa-accent);
  animation: wa-pulse 1.8s ease-in-out infinite;
}
@keyframes wa-pulse {
  0%, 100% { opacity: .9; }
  50% { opacity: .6; }
}

/* Dots */
.wa-dots { display: inline-flex; gap: 6px; }
.wa-dots span {
  width: 6px; height: 6px; background: #7e8cc2; border-radius: 999px; display: inline-block;
  animation: wa-bounce 1.4s infinite;
}
.wa-dots span:nth-child(2) { animation-delay: .12s; }
.wa-dots span:nth-child(3) { animation-delay: .24s; }
@keyframes wa-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: .85; }
  40% { transform: translateY(-5px); opacity: 1; }
}

/* Stat chips grid */
.wa-stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 992px) {
  .wa-stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 576px) {
  .wa-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.wa-stat {
  background: var(--wa-chip);
  border: 1px solid var(--wa-chip-border);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
}
.wa-stat-label {
  font-size: 11px;
  color: #9fb0d9;
  letter-spacing: .3px;
}
.wa-stat-value {
  font-weight: 600;
  color: #eaf1ff;
  margin-top: 2px;
}

/* Meta row */
.wa-meta {
  display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
}
.wa-meta-item {
  background: #0e162b;
  border: 1px dashed #233054;
  color: #c7d3ff;
  border-radius: 999px;
  font-size: 12px;
  padding: 6px 10px;
}
.wa-meta-k { opacity: .8; margin-right: 6px; }

/* Marquee tips */
.wa-tips {
  position: relative;
  height: 28px;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid #1f2a49;
  background: #0b1124;
}
.wa-tips-track {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  white-space: nowrap;
  padding: 4px 12px;
  animation: wa-marquee 18s linear infinite;
  color: #b6c5ff;
  font-size: 12px;
}
.wa-dot { opacity: .5; padding: 0 8px; }
@keyframes wa-marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

/* Buttons */
.wa-leave-btn {
  border-width: 2px;
  color: #dbe5ff;
  border-color: #263459;
  background: #0d1530;
}
.wa-leave-btn:hover {
  border-color: #3b4e86;
  box-shadow: 0 8px 24px rgba(124, 156, 255, 0.15);
}

/* Modal */
.wa-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(11,16,32,0.65);
  backdrop-filter: blur(4px);
  display: grid; place-items: center;
  z-index: 1040;
}
.wa-modal {
  position: relative;
  width: min(520px, 92vw);
  border: 1px solid var(--wa-border);
  background: linear-gradient(180deg, #0f172e, #0b1225);
  color: #eaf1ff;
}
.wa-modal-close {
  position: absolute; top: 8px; right: 10px;
  border: 0; background: transparent; color: #9aa6b2; cursor: pointer;
}
</style>
