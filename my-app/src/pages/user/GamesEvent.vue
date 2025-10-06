<template>
  <div class="game-event container py-4">
    <!-- ===== HERO / TITLE ===== -->
    <header class="hero text-center mb-3">
      <h1 class="hero-title">SPIN &amp; WIN</h1>
      <div class="promo-pill">Join the event to buy the item at a discount</div>
    </header>

    <!-- ===== MAIN GRID (Left roster · Wheel · Prize panel) ===== -->
    <div class="event-grid mb-4">
      <!-- LEFT: Players list -->
      <aside class="players-panel card shadow-sm">
        <div class="card-body">
          <div class="panel-head d-flex align-items-center gap-2 mb-2">
            <div class="icon-ring"><i class="bi bi-people-fill"></i></div>
            <h6 class="m-0">Players</h6>
          </div>
          <ul class="players-list">
            <li v-for="(e, i) in entries" :key="e.id" class="player-row">
              <div class="avatar-wrap">
                <img
                  class="avatar"
                  :src="avatarUrl(e.user_id)"
                  :alt="displayName(e.user_id)"
                  @error="onImgError($event, e.user_id)"
                />
              </div>
              <div class="player-label">
                <span class="index">Player {{ i + 1 }}</span>
                <span class="name">{{ displayName(e.user_id) || maskUser(e.user_id) }}</span>
              </div>
            </li>
            <li v-if="entries.length === 0" class="player-empty text-muted">No players yet</li>
          </ul>
        </div>
      </aside>

      <!-- CENTER: Wheel + controls -->
      <section class="center-stage">
        <!-- winner hero (kept, but hidden when modal is shown) -->
        <div
          v-if="revealWinner && displayWinnerEntry && !showOutcomeModal"
          class="winner-hero alert alert-success p-3 text-center mb-3"
        >
          <div class="fw-bold">
            🎉 Winner · <code>{{ maskUser(displayWinnerEntry.user_id) }}</code>
          </div>
        </div>

        <!-- Wheel -->
        <div class="wheel-stage">
          <div class="stage-glow"></div>

          <!-- gold frame + bulbs -->
          <div class="rim">
            <div v-for="n in 20" :key="n" class="bulb" :style="bulbStyle(n)"></div>
          </div>

          <div class="wheel-wrap mx-auto mb-3" :class="{ spinning }" :style="wheelVars">
            <div class="pointer"></div>

            <!-- wheel face -->
            <div class="wheel" :style="wheelStyle" @transitionend="onSpinEnd">
              <!-- hub -->
              <div class="hub"></div>
              <div class="hub-label">Spin</div>
              <div class="hub-dot"></div>

              <!-- slice labels – counter-rotated to stay upright -->
              <template v-for="(p, i) in spinEntries" :key="p.id">
                <div
                  class="slice-label"
                  :style="[labelVars(i), sliceLabelStyle(i, p.user_id)]"
                  :title="displayName(p.user_id) || maskUser(p.user_id)"
                >
                  <span class="label-text">
                    {{ displayName(p.user_id) || maskUser(p.user_id) }}
                  </span>
                </div>
              </template>
            </div>

            <!-- spinning overlay -->
            <div v-if="spinning" class="spin-overlay">
              <div class="pulse-dot"></div>
              <div class="mt-2 fw-semibold">Spinning…</div>
            </div>
          </div>

          <!-- Controls row -->
          <div class="controls d-flex align-items-center justify-content-center gap-3 mb-2" v-if="!resolved">
            <button
              class="btn btn-primary btn-arcade"
              :disabled="!canSpinGate || spinning || busy.commit"
              @click="startCountdownAndSpin()"
            >
              <span v-if="spinning" class="spinner-border spinner-border-sm me-2"></span>
              SPIN
            </button>

            <span v-if="countdown !== null" class="badge bg-warning text-dark fs-6 countdown-badge">
              Spinning in {{ countdown }}…
            </span>
          </div>
        </div>
      </section>

      <!-- RIGHT: Product / Info -->
      <aside class="prize-panel card shadow-sm">
        <div class="card-body">
          <!-- fading gallery -->
          <div class="prod-gallery">
            <img
              v-for="(u, idx) in productSignedUrls"
              :key="u"
              class="prod-img"
              :src="u"
              :alt="productMeta?.name || 'Product'"
              :class="{ 'is-active': idx === currentProdIdx }"
            />
          </div>

          <!-- name -->
          <h3 class="prize-title mt-3">{{ productMeta?.name || prizeTitle }}</h3>

          <!-- price w/ discount -->
          <div class="price-row" v-if="productMeta">
            <span class="old">₱ {{ fmtMoney(productMeta.price) }}</span>
            <span class="new">₱ {{ fmtMoney(discountedPrice) }}</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- bottom winner alert -->
    <div
      v-if="revealWinner && winnerEntry && !showOutcomeModal"
      class="alert alert-success mt-3 text-center"
    >
      Winner: <code>{{ maskUser(winnerEntry.user_id) }}</code>
    </div>

    <div v-if="err" class="text-danger mt-3">{{ err }}</div>

    <!-- Confetti -->
    <div v-if="revealWinner" class="confetti-wrap" aria-hidden="true">
      <span v-for="n in 30" :key="n" class="confetti-piece"></span>
    </div>

    <!-- ===================== Outcome Popup (Winner / Loser) ===================== -->
    <div v-if="showOutcomeModal" class="outcome-backdrop" @click.self="closeOutcomeModal">
      <div
        class="outcome-modal card"
        :class="outcomeType === 'winner' ? 'outcome-winner' : 'outcome-loser'"
      >
        <div class="sparkle-1"></div>
        <div class="sparkle-2"></div>

        <div class="card-body p-4 text-center">
          <div class="pop-title" v-if="outcomeType === 'winner'">🎉 Congratulations!</div>
          <div class="pop-title" v-else>Better luck next time</div>

          <p class="mt-2 mb-3" v-if="outcomeType === 'winner'">
            You won this round! <br />
            <small class="text-muted"
              >Winner · <code>{{ maskUser(displayWinnerEntry?.user_id || '') }}</code></small
            >
          </p>
          <p class="mt-2 mb-3" v-else>
            This time wasn’t yours—but your entry is safe. <br />
            <small class="text-muted"
              >Winner · <code>{{ maskUser(displayWinnerEntry?.user_id || '') }}</code></small
            >
          </p>

          <button
            class="btn btn-lg w-100 mt-1 pop-btn"
            @click="handleOutcomeAction"
            :class="outcomeType === 'winner' ? 'btn-winner' : 'btn-loser'"
          >
            <span v-if="outcomeType === 'winner'">Get Discount</span>
            <span v-else>Refund</span>
          </button>
        </div>

        <button class="pop-close" @click="closeOutcomeModal" aria-label="Close">✕</button>
      </div>
    </div>

    <!-- ===================== INTRO MODAL (Auto for 10s, no buttons) ===================== -->
    <div v-if="showIntroModal" class="intro-backdrop">
      <div class="intro-modal card">
        <div class="intro-sheen"></div>
        <div class="card-body p-4">
          <div class="d-flex flex-column gap-3">
            <div class="text-center">
              <div class="intro-title">Get Ready to Spin!</div>
              <div class="intro-sub">Prize &amp; Players</div>
            </div>

            <!-- Prize with animated slash & gold discount -->
            <div class="intro-prize">
              <div class="intro-prize-media">
                <img
                  v-if="productSignedUrls.length"
                  :src="productSignedUrls[0]"
                  :alt="productMeta?.name || 'Prize'"
                />
                <div v-else class="intro-prize-placeholder">🎁</div>
              </div>
              <div class="intro-prize-info">
                <div class="intro-prize-name">{{ productMeta?.name || prizeTitle }}</div>
                <div class="intro-prices">
                  <span class="intro-price-old">
                    ₱ {{ fmtMoney(productMeta?.price || 0) }}
                    <i class="intro-slash"></i>
                  </span>
                  <span class="intro-price-new">₱ {{ fmtMoney(discountedPrice) }}</span>
                </div>
              </div>
            </div>

            <!-- Players grid -->
            <div class="intro-players">
              <div class="intro-players-head">
                Players · <strong>{{ spinEntries.length }}</strong>
              </div>
              <div class="intro-players-grid">
                <div v-for="p in spinEntries" :key="p.id" class="intro-player-pill">
                  <img :src="avatarUrl(p.user_id)" :alt="displayName(p.user_id)" />
                  <span>{{ displayName(p.user_id) || maskUser(p.user_id) }}</span>
                </div>
              </div>
            </div>

            <!-- subtle countdown text -->
            <div class="intro-count text-center">
              Starting automatically in <b>{{ introSeconds }}</b>…
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* ======== ORIGINAL SCRIPT (kept) + intro auto-start changes ========= */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})
const route = useRoute()
const router = useRouter()
const eventId = route.query.eventId as string

type EntryRow = { id: string; event_id: string; user_id: string; status: string }

const prizeTitle = ref('USB DRIVE')
const costToEnter = ref<number | null>(50)
const interestFlat = ref<number | null>(null)
const costToBuy = ref<number | null>(48.5)

const INTEREST_RATE = 0.02
const calcInterest = (base: number) => Math.round(base * INTEREST_RATE * 100) / 100

type UserMeta = {
  id: string
  full_name?: string | null
  profile_url?: string | null
  avatar?: string
  signed_exp?: number
}
const userMeta = ref<Record<string, UserMeta>>({})
const AVATAR_TTL_SEC = 3600,
  REFRESH_AHEAD_SEC = 300
let avatarRefreshTimer: number | null = null

const entries = ref<EntryRow[]>([])
const busy = ref({ load: false, commit: false })
const spinning = ref(false)
const resolved = ref(false)
const err = ref('')
const rotateDeg = ref(0)
const spinDurationMs = ref(5200)
const targetIndex = ref<number | null>(null)
const winnerEntry = ref<EntryRow | null>(null)
const revealWinner = ref(false)

const showOutcomeModal = ref(false)
const outcomeType = ref<'winner' | 'loser' | null>(null)
const myUserId = ref<string | null>(null)

const eventWinnerUpdated = ref(false)
const receiptInserted = ref(false)
const voucherInserted = ref(false)

/* ========= INTRO (auto, no buttons) ========= */
const showIntroModal = ref(false)
const hasSeenIntro = ref(false)
const introSeconds = ref(10)
let introInterval: number | null = null
let introTimeout: number | null = null

const eventInfo = ref<{
  id: string
  player_cap: number
  status: string
  user_id_winner?: string | null
  product_id?: string | null
  entry_fee?: number | null
  winner_refund_amount?: number | null
  loser_refund_amount?: number | null
  interest_per_player?: number | null
} | null>(null)

const spinInfo = ref<{ event_id: string; winner_entry_id: string } | null>(null)

type JoinFeedItem = { user_id: string; at: Date; type: 'joined' | 'rejoined' | 'existing' }
const joinFeed = ref<JoinFeedItem[]>([])
const FEED_LIMIT = 20

const countdown = ref<number | null>(null)
let countdownHandle: number | null = null
const autoSpinStarted = ref(false)
const rpcWinnerId = ref<string | null>(null)
let participantsSnapshot: EntryRow[] = []
const spinStarted = ref(false)

const winnerPurchaseInserted = ref(false)
let winnerPurchaseInflight = false
const refundsCommitted = ref(false)
let refundsInflight = false

/* ======== product meta / signed images carousel ========= */
const productMeta = ref<{ id: string; name: string; price: number; product_url: string[] } | null>(
  null,
)
const productSignedUrls = ref<string[]>([])
const currentProdIdx = ref(0)
let prodTimer: number | null = null
const PROD_FADE_MS = 2600

/* ======== Computeds ========= */
const joinedEntries = computed(() => entries.value.filter((e) => e.status === 'joined'))
const readyEntries = computed(() => entries.value.filter((e) => e.status === 'ready'))
const spinEntries = computed(() =>
  readyEntries.value.length > 0 ? readyEntries.value : joinedEntries.value,
)
const anyWinner = computed(() => entries.value.some((e) => e.status === 'winner'))
const allReady = computed(
  () => spinEntries.value.length >= 2 && spinEntries.value.every((e) => e.status === 'ready'),
)
const canSpinGate = computed(() => allReady.value && !anyWinner.value)

const leftSideEntries = computed(() => {
  const mid = Math.ceil(entries.value.length / 2)
  return entries.value.slice(0, mid)
})
const rightSideEntries = computed(() => {
  const mid = Math.ceil(entries.value.length / 2)
  return entries.value.slice(mid)
})

const displayWinnerEntry = computed<EntryRow | null>(() => {
  if (winnerEntry.value) return winnerEntry.value
  const wid = spinInfo.value?.winner_entry_id
  if (!wid) return null
  return entries.value.find((e) => e.id === wid) || null
})

/* ======== UI helpers ========= */
function openOutcomePopupIfMe() {
  if (!revealWinner.value || !displayWinnerEntry.value || !myUserId.value) return
  const winnerUserId = displayWinnerEntry.value.user_id
  const iParticipated = entries.value.some((e) => e.user_id === myUserId.value)
  if (!iParticipated) return
  outcomeType.value = myUserId.value === winnerUserId ? 'winner' : 'loser'
  showOutcomeModal.value = true
}
function closeOutcomeModal() {
  showOutcomeModal.value = false
}
async function fetchMe() {
  try {
    const { data } = await supabase.auth.getUser()
    myUserId.value = data.user?.id ?? null
  } catch {
    myUserId.value = null
  }
}
function shortId(id?: string) {
  return id ? id.slice(0, 4) + '…' + id.slice(-4) : '—'
}
function maskUser(id: string) {
  return id.slice(0, 4) + '…' + id.slice(-4)
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function pushJoinFeed(item: JoinFeedItem) {
  joinFeed.value.unshift(item)
  if (joinFeed.value.length > FEED_LIMIT) joinFeed.value.length = FEED_LIMIT
}

/* ======== Wheel coloring & styles ========= */
function hashColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `hsl(${h} 78% 55%)`
}
function sliceColor(i: number, n: number, uid?: string) {
  return uid ? hashColor(uid) : `hsl(${Math.round((360 * i) / Math.max(1, n))} 78% 55%)`
}

/* Rotation via CSS var so labels can counter-rotate cleanly */
const wheelVars = computed(() => ({
  '--wheel-rot': `${rotateDeg.value}deg`,
}))

const wheelStyle = computed(() => {
  const n = Math.max(1, spinEntries.value.length)
  const stops: string[] = []
  for (let i = 0; i < n; i++) {
    const a0 = (360 / n) * i
    const a1 = (360 / n) * (i + 1)
    const uid = spinEntries.value[i]?.user_id
    stops.push(`${sliceColor(i, n, uid)} ${a0}deg ${a1}deg`)
  }
  return {
    background: `conic-gradient(${stops.join(',')})`,
    transform: `rotate(var(--wheel-rot))`,
    transition: spinning.value
      ? `transform ${spinDurationMs.value / 1000}s cubic-bezier(.08,.55,.24,1)`
      : 'none',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    contain: 'paint',
  } as any
})

function labelVars(i: number) {
  const n = Math.max(1, spinEntries.value.length)
  const mid = (360 / n) * (i + 0.5)
  return { '--slice-angle': `${mid}deg` } as any
}
function sliceLabelStyle(i: number, uid?: string) {
  return {
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,.65), 0 0 4px rgba(0,0,0,.25)',
    background: 'rgba(0,0,0,.15)',
    padding: '2px 8px',
    borderRadius: '10px',
    boxShadow: `0 0 0 2px rgba(255,255,255,.09), 0 0 10px ${sliceColor(i, 1, uid)}55`,
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  } as any
}

/* ======== Rim bulbs ========= */
function bulbStyle(n: number) {
  const deg = (360 / 20) * (n - 1)
  return { transform: `rotate(${deg}deg) translate(0, -168px)` }
}

/* ======== Data fetch ========= */
async function fetchEntries() {
  if (!eventId) return
  const { data, error } = await supabase
    .schema('games')
    .from('entry')
    .select('id, event_id, user_id, status')
    .eq('event_id', eventId)
  if (error) {
    setErr(error, 'load entries')
    return
  }
  const prev = entries.value
  entries.value = (data || []) as EntryRow[]
  resolved.value = entries.value.some((e) => e.status === 'winner')

  const ids = Array.from(new Set(entries.value.map((e) => e.user_id)))
  await ensureUserMeta(ids)

  if (prev.length === 0 && entries.value.length > 0) {
    entries.value
      .filter((e) => e.status === 'joined')
      .slice(0, FEED_LIMIT)
      .forEach((e) => pushJoinFeed({ user_id: e.user_id, at: new Date(), type: 'existing' }))
  }
  if (!spinning.value && resolved.value) revealWinner.value = true
}
async function fetchEvent() {
  if (!eventId) return
  const { data, error } = await supabase
    .schema('games')
    .from('event')
    .select(
      'id, player_cap, status, user_id_winner, product_id, entry_fee, winner_refund_amount, loser_refund_amount, interest_per_player',
    )
    .eq('id', eventId)
    .single()
  if (error) {
    setErr(error, 'load event')
    return
  }
  eventInfo.value = data as any

  const ef = eventInfo.value?.entry_fee ?? null
  const wr = eventInfo.value?.winner_refund_amount ?? null
  costToEnter.value = ef !== null ? Number(ef) : costToEnter.value
  costToBuy.value = wr !== null ? Number(wr) : costToBuy.value

  if (eventInfo.value?.product_id) {
    await fetchProduct(eventInfo.value.product_id)
  }
}
async function fetchProduct(productId: string) {
  const { data, error } = await supabase
    .schema('games')
    .from('products')
    .select('id, name, price, product_url')
    .eq('id', productId)
    .single()
  if (error) {
    setErr(error, 'load product')
    return
  }
  productMeta.value = data as any
  await resolveSignedProductUrls()
  startProductRotation()
}
async function resolveSignedProductUrls() {
  productSignedUrls.value = []
  const paths = (productMeta.value?.product_url || []) as string[]
  const urls: string[] = []
  for (const raw of paths) {
    const { path } = splitBucketAndPath(raw)
    const signed = await signFromBucket(path)
    if (signed) urls.push(signed)
  }
  productSignedUrls.value = urls
}
function splitBucketAndPath(s: string) {
  const parts = s.split('/')
  const path = parts.join('/')
  return { path }
}
async function signFromBucket(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from('prize_product').createSignedUrl(path, 3600)
    if (error || !data?.signedUrl) return null
    return data.signedUrl
  } catch {
    return null
  }
}

async function fetchSpin() {
  if (!eventId) return
  const { data, error } = await supabase
    .schema('games')
    .from('spin')
    .select('event_id, winner_entry_id')
    .eq('event_id', eventId)
    .maybeSingle()
  if (!error && data) {
    spinInfo.value = data as any
    if (!spinning.value) revealWinner.value = true
  }
}

function setErr(e: any, ctx: string) {
  const msg = e?.message || e?.hint || e?.details || e?.error || JSON.stringify(e)
  err.value = `${ctx}: ${msg}`
  console.error(`[${ctx}]`, e)
}

/* ======== SPIN ========= */
async function startSpin(forcedIndex: number) {
  const slice = 360 / spinEntries.value.length
  const targetAngle = slice * (forcedIndex + 0.5)
  const fullTurns = 12
  rotateDeg.value = 360 * fullTurns + (360 - targetAngle)
  spinning.value = true
}
async function settleEntriesAfterSpin(winnerId: string) {
  try {
    await supabase.schema('games').from('entry').update({ status: 'winner' }).eq('id', winnerId)
    await supabase
      .schema('games')
      .from('entry')
      .update({ status: 'refunded' })
      .eq('event_id', eventId)
      .neq('id', winnerId)
      .in('status', ['joined', 'ready'])
  } catch (e: any) {
    setErr(e, 'settle entries')
  }
}

/* ===== event winner column ===== */
async function updateEventWinnerUserId(winnerUserId: string | null | undefined) {
  if (!eventId || !winnerUserId || eventWinnerUpdated.value) return
  try {
    await supabase
      .schema('games')
      .from('event')
      .update({ user_id_winner: winnerUserId })
      .eq('id', eventId)
    eventWinnerUpdated.value = true
  } catch (e: any) {
    setErr(e, 'update event winner')
  }
}

/* ===== receipts ===== */
async function insertReceiptsForParticipants(entriesList: EntryRow[]) {
  if (!eventId || receiptInserted.value || !entriesList?.length) return
  try {
    const payload = entriesList.map((e) => ({
      event_id: eventId,
      user_id: e.user_id,
      entry_id: e.id,
    }))
    await supabase
      .schema('ewallet')
      .from('game_receipt')
      .upsert(payload, { onConflict: 'entry_id', ignoreDuplicates: true })
    receiptInserted.value = true
  } catch (e: any) {
    setErr(e, 'insert game receipts')
  }
}
async function ensureVoucherForWinner() {
  voucherInserted.value = true
}

/* ===== purchases / balances / refunds ===== */
function isUuid(v?: string | null) {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}
async function createWinnerPurchaseIfNeeded() {
  try {
    if (winnerPurchaseInserted.value || winnerPurchaseInflight) return
    const winnerUid = displayWinnerEntry.value?.user_id || null
    const productId = eventInfo.value?.product_id || null

    if (!winnerUid) throw new Error('Missing winner user id')
    if (!isUuid(winnerUid)) throw new Error(`Winner user_id is not a UUID: ${winnerUid}`)
    if (!productId) throw new Error('Missing event.product_id')
    if (!isUuid(productId)) throw new Error(`event.product_id is not a UUID: ${productId}`)
    if (!eventId) throw new Error('Missing eventId/reference_number')

    winnerPurchaseInflight = true

    const { data: existing, error: qErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id')
      .eq('user_id', winnerUid)
      .eq('product_id', productId)
      .eq('reference_number', eventId)
      .limit(1)
    if (qErr) {
      setErr(qErr, 'check existing purchase')
      winnerPurchaseInflight = false
      return
    }
    if (existing && existing.length) {
      winnerPurchaseInserted.value = true
      winnerPurchaseInflight = false
      return
    }

    let insertedId: string | null = null
    {
      const { data, error } = await supabase
        .schema('games')
        .from('purchases')
        .insert({
          user_id: winnerUid,
          product_id: productId,
          reference_number: eventId,
        })
        .select('id')
        .single()
      if (error) {
        setErr(error, 'insert purchase (minimal)')
        winnerPurchaseInflight = false
        return
      }
      insertedId = data?.id ?? null
      if (!insertedId) throw new Error('Insert returned no id')
    }
    {
      const { error } = await supabase
        .schema('games')
        .from('purchases')
        .update({ status: 'to ship', modeofpayment: 'ewallet', qty: 1 })
        .eq('id', insertedId)
      if (error) {
        setErr(error, 'update purchase status/mop')
        winnerPurchaseInflight = false
        return
      }
    }
    winnerPurchaseInserted.value = true
    winnerPurchaseInflight = false
  } catch (e: any) {
    winnerPurchaseInflight = false
    setErr(e, 'create winner purchase')
  }
}
async function adjustUserBalance(userId: string, delta: number) {
  try {
    const { data, error } = await supabase.from('users').select('balance').eq('id', userId).single()
    if (error) throw error
    const current = Number(data?.balance ?? 0)
    const next = Math.round((current + delta) * 100) / 100
    const { error: uerr } = await supabase.from('users').update({ balance: next }).eq('id', userId)
    if (uerr) throw uerr
  } catch (e: any) {
    setErr(e, `update balance for ${shortId(userId)}`)
  }
}
function resolveRefundAmounts() {
  const winnerAmt = Number(eventInfo.value?.winner_refund_amount ?? 0)
  const loserAmt = Number(eventInfo.value?.loser_refund_amount ?? 0)
  return { winnerAmt, loserAmt }
}
async function acquireRefundLock(): Promise<boolean> {
  if (!eventId || refundsCommitted.value || refundsInflight) return false
  refundsInflight = true
  try {
    const { error } = await supabase.schema('games').from('refund_lock').insert({ event_id: eventId })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      const details = (error.details || '').toLowerCase()
      const hint = (error.hint || '').toLowerCase()
      const dup =
        msg.includes('duplicate') ||
        msg.includes('already exists') ||
        details.includes('duplicate') ||
        hint.includes('duplicate') ||
        (error.code && String(error.code) === '23505')
      if (dup) {
        refundsInflight = false
        refundsCommitted.value = true
        return false
      }
      throw error
    }
    refundsInflight = false
    return true
  } catch (e: any) {
    refundsInflight = false
    setErr(e, 'acquire refund lock')
    return false
  }
}
async function processRefundsAndPayments() {
  try {
    if (!displayWinnerEntry.value) return
    const gotLock = await acquireRefundLock()
    if (!gotLock) {
      refundsCommitted.value = true
      return
    }
    const winnerUid = displayWinnerEntry.value.user_id
    const { winnerAmt, loserAmt } = resolveRefundAmounts()

    if (winnerAmt !== 0) await adjustUserBalance(winnerUid, winnerAmt)

    const losersNow = (await supabase
      .schema('games')
      .from('entry')
      .select('user_id, status')
      .eq('event_id', eventId)
      .neq('user_id', winnerUid)).data as { user_id: string; status: string }[] | null

    const loserList = (losersNow || []).filter((e) => e.status === 'refunded')
    if (loserAmt !== 0) {
      for (const l of loserList) await adjustUserBalance(l.user_id, loserAmt)
    }

    await createWinnerPurchaseIfNeeded()
    refundsCommitted.value = true
  } catch (e: any) {
    setErr(e, 'refund/payment processing')
  }
}

async function onSpinEnd() {
  if (!spinning.value) return
  spinning.value = false
  if (rpcWinnerId.value) {
    const idx = participantsSnapshot.findIndex((e) => e.id === rpcWinnerId.value)
    if (idx >= 0) winnerEntry.value = participantsSnapshot[idx]
    await settleEntriesAfterSpin(rpcWinnerId.value)
    await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])

    await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
    await insertReceiptsForParticipants(participantsSnapshot)
    await ensureVoucherForWinner()
    await processRefundsAndPayments()

    resolved.value = true
    rpcWinnerId.value = null
  }
  busy.value.commit = false
  spinStarted.value = false
  revealWinner.value = true
  openOutcomePopupIfMe()
}
async function triggerServerSpinAndAnimate() {
  if (!eventId || !canSpinGate.value || resolved.value || spinStarted.value) return
  participantsSnapshot = spinEntries.value.slice()
  spinStarted.value = true
  try {
    busy.value.commit = true
    revealWinner.value = false
    const { data, error } = await supabase.rpc('rpc_spin_event', { _event_id: eventId, _seed: null })
    if (error) {
      setErr(error, 'rpc_spin_event')
      busy.value.commit = false
      spinStarted.value = false
      return
    }
    const spinRow = Array.isArray(data) ? data[0] : data
    const winner_id: string | undefined = spinRow?.winner_entry_id
    if (!winner_id) {
      err.value = 'RPC did not return winner_entry_id'
      busy.value.commit = false
      spinStarted.value = false
      return
    }
    rpcWinnerId.value = winner_id
    let forcedIdx = participantsSnapshot.findIndex((e) => e.id === winner_id)
    if (forcedIdx < 0) {
      await fetchEntries()
      participantsSnapshot = spinEntries.value.slice()
      forcedIdx = participantsSnapshot.findIndex((e) => e.id === winner_id)
    }
    if (forcedIdx < 0) {
      await settleEntriesAfterSpin(winner_id)
      await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
      await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
      await insertReceiptsForParticipants(participantsSnapshot)
      await ensureVoucherForWinner()
      await processRefundsAndPayments()
      resolved.value = true
      busy.value.commit = false
      spinStarted.value = false
      revealWinner.value = true
      return
    }
    await startSpin(forcedIdx)
  } catch (e: any) {
    setErr(e, 'trigger spin/animate')
    busy.value.commit = false
    spinStarted.value = false
  }
}
function actuallyStartCountdown() {
  autoSpinStarted.value = true
  countdown.value = 3
  if (countdownHandle) {
    clearInterval(countdownHandle)
    countdownHandle = null
  }
  countdownHandle = window.setInterval(async () => {
    if ((countdown.value as number) > 1) {
      countdown.value = (countdown.value as number) - 1
    } else {
      clearInterval(countdownHandle!)
      countdownHandle = null
      countdown.value = null
      await triggerServerSpinAndAnimate()
    }
  }, 1000)
}
function startCountdownAndSpin() {
  if (autoSpinStarted.value || resolved.value || spinning.value || spinStarted.value) return
  Promise.all([fetchEntries()]).then(() => {
    if (!canSpinGate.value) {
      const stop = watch(allReady, (ok) => {
        if (ok && !autoSpinStarted.value && !resolved.value && !spinning.value && !spinStarted.value) {
          stop()
          if (!hasSeenIntro.value) openIntro()
          else actuallyStartCountdown()
        }
      })
      return
    }
    if (!hasSeenIntro.value) {
      openIntro()
    } else {
      actuallyStartCountdown()
    }
  })
}

/* ===== Realtime ===== */
let realtimeChannel: any | null = null,
  realtimeChannelSpin: any | null = null,
  realtimeChannelEvent: any | null = null
let refreshTimer: number | null = null
const POLL_MS = 10_000
let pollHandle: number | null = null
function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    await Promise.all([fetchEntries(), fetchSpin(), fetchEvent()])
  }, delayMs)
}
function makeRealtimeChannel() {
  if (!eventId) return
  if (realtimeChannel) {
    try { supabase.removeChannel(realtimeChannel) } catch {}
    realtimeChannel = null
  }
  realtimeChannel = supabase
    .channel(`ge-entry-${eventId}`, {
      config: { broadcast: { self: false }, presence: { key: 'games-event' } },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'entry', filter: `event_id=eq.${eventId}` },
      (payload: any) => {
        try {
          const { eventType, new: n, old: o } = payload
          if (eventType === 'INSERT' && n?.status === 'joined')
            pushJoinFeed({ user_id: n.user_id, at: new Date(), type: 'joined' })
          else if (eventType === 'UPDATE') {
            const becameJoined = o?.status !== 'joined' && n?.status === 'joined'
            if (becameJoined) pushJoinFeed({ user_id: n.user_id, at: new Date(), type: 'rejoined' })
          }
        } catch {}
        scheduleRefresh(150)
      },
    )
    .subscribe((s: any) => {
      if (s === 'CLOSED' || s === 'CHANNEL_ERROR') setTimeout(() => makeRealtimeChannel(), 1000)
    })
}
function makeRealtimeChannelSpin() {
  if (!eventId) return
  if (realtimeChannelSpin) {
    try { supabase.removeChannel(realtimeChannelSpin) } catch {}
    realtimeChannelSpin = null
  }
  realtimeChannelSpin = supabase
    .channel(`ge-spin-${eventId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'spin', filter: `event_id=eq.${eventId}` },
      async (payload: any) => {
        const winner_id = payload?.new?.winner_entry_id
        if (!winner_id) return
        if (spinStarted.value || spinning.value) return
        participantsSnapshot = spinEntries.value.slice()
        rpcWinnerId.value = winner_id
        spinStarted.value = true
        revealWinner.value = false
        let forcedIdx = participantsSnapshot.findIndex((e) => e.id === winner_id)
        if (forcedIdx < 0) {
          await fetchEntries()
          participantsSnapshot = spinEntries.value.slice()
          forcedIdx = participantsSnapshot.findIndex((e) => e.id === winner_id)
        }
        if (forcedIdx >= 0) {
          await startSpin(forcedIdx)
        } else {
          await settleEntriesAfterSpin(winner_id)
          await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
          await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
          await insertReceiptsForParticipants(participantsSnapshot)
          await ensureVoucherForWinner()
          await processRefundsAndPayments()
          resolved.value = true
          rpcWinnerId.value = null
          busy.value.commit = false
          spinStarted.value = false
          revealWinner.value = true
        }
        await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
        openOutcomePopupIfMe()
      },
    )
    .subscribe((s: any) => {
      if (s === 'CLOSED' || s === 'CHANNEL_ERROR') setTimeout(() => makeRealtimeChannelSpin(), 1000)
    })
}
function makeRealtimeChannelEvent() {
  if (!eventId) return
  if (realtimeChannelEvent) {
    try { supabase.removeChannel(realtimeChannelEvent) } catch {}
    realtimeChannelEvent = null
  }
  realtimeChannelEvent = supabase
    .channel(`ge-event-${eventId}`)
    .on('postgres_changes', { event: '*', schema: 'games', table: 'event', filter: `id=eq.${eventId}` }, () =>
      scheduleRefresh(50),
    )
    .subscribe((s: any) => {
      if (s === 'CLOSED' || s === 'CHANNEL_ERROR') setTimeout(() => makeRealtimeChannelEvent(), 1000)
    })
}
function startPoll() {
  stopPoll()
  pollHandle = window.setInterval(() => fetchEntries(), POLL_MS)
}
function stopPoll() {
  if (pollHandle) {
    window.clearInterval(pollHandle)
    pollHandle = null
  }
}
function onVisibilityChange() {
  if (document.visibilityState === 'visible') scheduleRefresh(0)
}

/* ===== user meta / avatars ===== */
watch(entries, () => {
  resolved.value = entries.value.some((e) => e.status === 'winner')
})
watch(
  () => [revealWinner.value, displayWinnerEntry.value, myUserId.value] as const,
  async () => {
    await updateEventWinnerUserId(displayWinnerEntry.value?.user_id)
    await ensureVoucherForWinner()
    openOutcomePopupIfMe()
  },
)
/* When everyone is ready: show intro once (10s), then auto-start */
watch(
  () => [allReady.value, eventInfo.value?.player_cap, resolved.value] as const,
  ([gateOk, , isResolved]) => {
    if (isResolved) return
    if (gateOk && !autoSpinStarted.value && !spinning.value && !spinStarted.value) {
      if (!hasSeenIntro.value) openIntro()
      else startCountdownAndSpin()
    }
  },
)

function isHttpUrl(v?: string | null) {
  return !!v && /^(https?:)?\/\//i.test(v)
}
async function signAvatarPath(path: string): Promise<{ url: string; exp: number } | null> {
  try {
    const { data, error } = await supabase.storage
      .from('user_profile')
      .createSignedUrl(path, AVATAR_TTL_SEC)
    if (error || !data?.signedUrl) return null
    return { url: data.signedUrl, exp: Math.floor(Date.now() / 1000) + AVATAR_TTL_SEC }
  } catch {
    return null
  }
}
async function ensureUserMeta(userIds: string[]) {
  const missing = userIds.filter((id) => !userMeta.value[id])
  if (missing.length) {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, profile_url')
      .in('id', missing)
    if (!error && data) {
      for (const row of data as any[]) {
        let url = DEFAULT_AVATAR,
          exp = 0
        if (row?.profile_url) {
          if (isHttpUrl(row.profile_url)) url = row.profile_url
          else {
            const signed = await signAvatarPath(row.profile_url)
            if (signed) {
              url = signed.url
              exp = signed.exp
            }
          }
        }
        userMeta.value[row.id] = {
          id: row.id,
          full_name: row.full_name,
          profile_url: row.profile_url,
          avatar: url,
          signed_exp: exp,
        }
      }
    }
  }
  await refreshExpiringAvatars(userIds)
}
async function refreshExpiringAvatars(userIds?: string[]) {
  const now = Math.floor(Date.now() / 1000)
  const ids = userIds ?? Object.keys(userMeta.value)
  for (const id of ids) {
    const meta = userMeta.value[id]
    if (!meta) continue
    if (!meta.profile_url || isHttpUrl(meta.profile_url)) continue
    if (!meta.signed_exp || meta.signed_exp - now <= REFRESH_AHEAD_SEC) {
      const signed = await signAvatarPath(meta.profile_url)
      if (signed) {
        meta.avatar = signed.url
        meta.signed_exp = signed.exp
      }
    }
  }
}
function displayName(uid: string) {
  return userMeta.value[uid]?.full_name || ''
}
function avatarUrl(uid: string) {
  return userMeta.value[uid]?.avatar || DEFAULT_AVATAR
}
async function onImgError(e: Event, uid: string) {
  const el = e.target as HTMLImageElement
  const meta = userMeta.value[uid]
  if (!meta) {
    el.src = DEFAULT_AVATAR
    return
  }
  if (meta.profile_url && !isHttpUrl(meta.profile_url)) {
    const signed = await signAvatarPath(meta.profile_url)
    if (signed) {
      meta.avatar = signed.url
      meta.signed_exp = signed.exp
      el.src = signed.url
      return
    }
  }
  el.src = DEFAULT_AVATAR
}
const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" y="0" x2="1" y="1"><stop offset="0" stop-color="%2320647c"/><stop offset="1" stop-color="%2352e3b6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="32" cy="26" r="12" fill="%23fff" fill-opacity="0.9"/><rect x="14" y="42" width="36" height="12" rx="6" fill="%23fff" fill-opacity="0.85"/></svg>'
function startAvatarRefreshTimer() {
  stopAvatarRefreshTimer()
  avatarRefreshTimer = window.setInterval(() => refreshExpiringAvatars(), 300000)
}
function stopAvatarRefreshTimer() {
  if (avatarRefreshTimer) {
    clearInterval(avatarRefreshTimer)
    avatarRefreshTimer = null
  }
}

/* ======== Price display ======== */
const discountedPrice = computed(() => {
  const p = Number(productMeta.value?.price ?? 0)
  const d = Number(eventInfo.value?.interest_per_player ?? 0)
  const out = Math.max(0, p - d)
  return out
})
function fmtMoney(n: number) {
  return (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })
}

/* ======== Product rotation ======== */
function startProductRotation() {
  stopProductRotation()
  if ((productSignedUrls.value || []).length <= 1) return
  prodTimer = window.setInterval(() => {
    currentProdIdx.value =
      (currentProdIdx.value + 1) % Math.max(1, productSignedUrls.value.length)
  }, PROD_FADE_MS)
}
function stopProductRotation() {
  if (prodTimer) {
    clearInterval(prodTimer)
    prodTimer = null
  }
}

/* ======== Intro controls (auto, no buttons) ======== */
function openIntro() {
  showIntroModal.value = true
  hasSeenIntro.value = true
  introSeconds.value = 10
  if (introInterval) { clearInterval(introInterval); introInterval = null }
  if (introTimeout) { clearTimeout(introTimeout); introTimeout = null }

  introInterval = window.setInterval(() => {
    if (introSeconds.value > 1) introSeconds.value--
  }, 1000)

  introTimeout = window.setTimeout(() => {
    closeIntro(true)
    // kick off countdown after intro ends
    setTimeout(() => { if (!autoSpinStarted.value) actuallyStartCountdown() }, 120)
  }, 10_000)
}
function closeIntro(markSeen = true) {
  showIntroModal.value = false
  if (markSeen) hasSeenIntro.value = true
  if (introInterval) { clearInterval(introInterval); introInterval = null }
  if (introTimeout) { clearTimeout(introTimeout); introTimeout = null }
}

/* ======== Lifecycle ======== */
onMounted(async () => {
  await fetchMe()
  await Promise.all([fetchEntries(), fetchEvent(), fetchSpin()])
  makeRealtimeChannel()
  makeRealtimeChannelSpin()
  makeRealtimeChannelEvent()
  startPoll()
  startAvatarRefreshTimer()
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (canSpinGate.value && !hasSeenIntro.value) openIntro()
})
onBeforeUnmount(() => {
  if (realtimeChannel) { try { supabase.removeChannel(realtimeChannel) } catch {} ; realtimeChannel = null }
  if (realtimeChannelSpin) { try { supabase.removeChannel(realtimeChannelSpin) } catch {} ; realtimeChannelSpin = null }
  if (realtimeChannelEvent) { try { supabase.removeChannel(realtimeChannelEvent) } catch {} ; realtimeChannelEvent = null }
  if (refreshTimer) { window.clearTimeout(refreshTimer); refreshTimer = null }
  if (countdownHandle) { clearInterval(countdownHandle); countdownHandle = null }
  if (introInterval) { clearInterval(introInterval); introInterval = null }
  if (introTimeout) { clearTimeout(introTimeout); introTimeout = null }
  stopPoll()
  stopAvatarRefreshTimer()
  stopProductRotation()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

function handleOutcomeAction() {
  if (outcomeType.value === 'winner') {
    try { router.push({ name: 'user.winner' }); return } catch {}
    try { router.push('/winner'); return } catch {}
    router.push({ name: 'user.minigames' })
  } else {
    try { router.push({ name: 'user.loser' }); return } catch {}
    try { router.push('/loser'); return } catch {}
    router.push({ name: 'user.minigames' })
  }
}
function goToMinigames() {
  try { router.push({ name: 'user.minigames' }) } catch { router.push('/app/mini-games') }
}
</script>

<style scoped>
/* ===== Global vibe ===== */
.hero-title {
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: clamp(32px, 5.4vw, 64px);
  color: #ffd43b;
  text-shadow:
    0 6px 0 rgba(0, 0, 0, 0.25),
    0 0 30px rgba(255, 230, 0, 0.25);
  margin-bottom: 0.35rem;
}
.promo-pill {
  display: inline-block;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  background: rgba(32, 100, 124, 0.18);
  color: #e7f6ff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

/* ===== Main grid ===== */
.event-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: 280px minmax(340px, 1fr) 320px;
  align-items: start;
}
@media (max-width: 992px) {
  .event-grid { grid-template-columns: 1fr; }
}

/* ===== Left panel ===== */
.players-panel {
  border: 0;
  border-radius: 18px;
  background: #0b2a3a;
  color: #e8fbff;
}
.players-panel .card-body { padding: 16px 16px; }
.panel-head .icon-ring {
  width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center; background: #0fd2a0; color: #083143; font-weight: 900;
}
.players-list { list-style: none; padding: 0; margin: 0; }
.player-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 6px; border-radius: 12px; transition: background 0.15s ease;
}
.player-row:hover { background: rgba(255, 255, 255, 0.04); }
.avatar-wrap { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8); }
.avatar { width: 100%; height: 100%; object-fit: cover; display: block; }
.player-label { display: flex; flex-direction: column; line-height: 1.1; }
.player-label .index { font-size: 0.8rem; color: #9bd2e6; }
.player-label .name { font-weight: 700; font-size: 0.95rem; }

/* ===== Center (wheel) ===== */
.center-stage { display: flex; flex-direction: column; align-items: center; }
.wheel-stage { position: relative; display: grid; place-items: center; margin-bottom: 0.25rem; }
.stage-glow {
  position: absolute; width: 380px; height: 380px; border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 180, 0, 0.22), rgba(255, 105, 180, 0.12) 40%, transparent 70%);
  filter: blur(14px); z-index: 0;
}

/* gold rim + bulbs */
.rim {
  position: absolute; width: 360px; height: 360px; border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, #ffecb3 0 40%, transparent 41%),
    conic-gradient(#f59f00, #ffcc00, #f59f00);
  box-shadow:
    0 16px 40px rgba(0,0,0,.2),
    inset 0 4px 10px rgba(0,0,0,.2);
}
.bulb {
  position: absolute; left: 50%; top: 50%;
  width: 12px; height: 12px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff, #ffd43b 60%, #f08c00);
  transform-origin: 50% 50%;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,.35));
  animation: bulbBlink 2.4s infinite ease-in-out;
}
.bulb:nth-child(odd){ animation-delay: .6s }
@keyframes bulbBlink { 0%,100%{opacity:.9} 50%{opacity:.6} }

.wheel-wrap {
  position: relative;
  width: 340px;
  aspect-ratio: 1/1;
  border-radius: 50%;
  z-index: 1;
  transition: transform 0.25s ease;
  will-change: transform;
}
.wheel-wrap.spinning { transform: translateY(2px); }

.pointer {
  position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 14px solid transparent; border-right: 14px solid transparent; border-bottom: 24px solid #ffbf00;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.25)); z-index: 3;
  animation: pointerIdle 2s ease-in-out infinite;
}
.wheel-wrap.spinning .pointer { animation: pointerWiggle .25s ease-in-out infinite; }
@keyframes pointerIdle { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(1px)} }
@keyframes pointerWiggle { 0%,100%{transform:translateX(-50%) rotate(0)} 50%{transform:translateX(-50%) rotate(-2deg)} }

.wheel {
  width: 100%; height: 100%; border-radius: 50%;
  border: 16px solid #3b2900;
  position: relative; overflow: hidden;
  box-shadow:
    inset 0 0 0 2px rgba(255,255,255,.12),
    0 10px 24px rgba(0,0,0,.25);
  background: conic-gradient(#ff7f7f, #7fff7f);
  transform: rotate(var(--wheel-rot));
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Upright, non-rumbling labels */
.slice-label {
  position: absolute; left: 50%; top: 50%;
  transform-origin: 0 0;
  font-size: 13px; font-weight: 900; letter-spacing: 0.2px;
  white-space: nowrap; pointer-events: none;
  transform: rotate(calc(var(--slice-angle) + var(--wheel-rot))) translate(0, -42%)
             rotate(calc(-1 * (var(--slice-angle) + var(--wheel-rot))));
}
.slice-label .label-text { display: inline-block; max-width: 140px; text-overflow: ellipsis; overflow: hidden; vertical-align: middle; }
@media (max-width: 420px) {
  .slice-label { font-size: 12px; }
  .slice-label .label-text { max-width: 96px; }
}

.spin-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none; font-weight: 700; color: #111; text-shadow: 0 1px 0 rgba(255,255,255,.6);
}
.pulse-dot { width: 14px; height: 14px; border-radius: 50%; background: #198754; animation: pulse 1s infinite ease-in-out; }
@keyframes pulse { 0%{transform:scale(1);opacity:.7} 50%{transform:scale(1.6);opacity:1} 100%{transform:scale(1);opacity:.7} }

.btn-arcade {
  border-radius: 999px; padding: 0.6rem 1.1rem;
  box-shadow: 0 8px 18px rgba(82,227,182,.25), inset 0 1px 0 rgba(255,255,255,.6);
  transform: translateY(0); transition: transform .08s ease, box-shadow .2s ease, filter .2s ease;
}
.btn-arcade:hover { box-shadow: 0 10px 24px rgba(124,156,255,.35), inset 0 1px 0 rgba(255,255,255,.7); filter: saturate(1.08); }
.btn-arcade:active { transform: translateY(1px) scale(.99); }
.countdown-badge { animation: popIn .25s ease, breathe 1.6s ease-in-out infinite .25s; }
@keyframes popIn { from{transform:scale(.9);opacity:.5} to{transform:scale(1);opacity:1} }
@keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }

/* ===== Right panel ===== */
.prize-panel { border: 0; border-radius: 18px; background: #0b2a3a; color: #c9f6ff; }
.prize-panel .card-body { padding: 18px; }
.prize-title { color: #36e3b3; font-weight: 800; letter-spacing: .5px; font-size: clamp(18px, 3vw, 28px); text-transform: uppercase; margin: 10px 0 0; }

.prod-gallery { position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 14px; overflow: hidden; background: #06141f; }
.prod-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0;
  transition: opacity .6s ease;
}
.prod-img.is-active { opacity: 1; }

.price-row { margin-top: 10px; display: flex; align-items: baseline; gap: 10px; }
.price-row .old { color: #9fb8c9; text-decoration: line-through; font-weight: 700; }
.price-row .new { color: #36e3b3; font-weight: 900; font-size: clamp(18px, 3.2vw, 32px); }

/* ===== Confetti + Popups ===== */
.joined-summary .badge { font-weight: 700; letter-spacing: .2px; }

.confetti-wrap { pointer-events: none; position: fixed; inset: 0; overflow: hidden; z-index: 50; }
.confetti-piece {
  position: absolute; top: -10vh; left: 50%; width: 8px; height: 14px; background: #7c9cff; opacity: .9;
  transform: translateX(-50%) rotate(0deg);
  animation: fall 2.8s linear forwards, sway 1s ease-in-out infinite;
  border-radius: 2px;
}
.confetti-piece:nth-child(3n){ background:#52e3b6 }
.confetti-piece:nth-child(5n){ background:#ffc107;width:6px;height:10px }
.confetti-piece:nth-child(7n){ background:#ff7ab6 }
.confetti-piece:nth-child(n){ left:10%; animation-delay:0s }
.confetti-piece:nth-child(2n){ left:25%; animation-delay:.1s }
.confetti-piece:nth-child(3n){ left:40%; animation-delay:.15s }
.confetti-piece:nth-child(4n){ left:55%; animation-delay:.2s }
.confetti-piece:nth-child(5n){ left:70%; animation-delay:.25s }
.confetti-piece:nth-child(6n){ left:85%; animation-delay:.3s }
@keyframes fall { to{ transform: translateY(110vh) rotate(540deg); opacity: 1; } }
@keyframes sway { 0%,100%{ margin-left:-6px } 50%{ margin-left:6px } }

/* Outcome modal */
.outcome-backdrop {
  position: fixed; inset: 0; z-index: 60; background: rgba(6,10,24,.65); backdrop-filter: blur(4px);
  display: grid; place-items: center; animation: fadeIn .18s ease;
}
@keyframes fadeIn { from{opacity:.6} to{opacity:1} }

.outcome-modal {
  width: min(520px, 92vw); border-radius: 20px; border: 1px solid rgba(255,255,255,.12); overflow: hidden; position: relative;
  background:
    radial-gradient(120% 120% at 30% 10%, rgba(124,156,255,.18), transparent 50%),
    radial-gradient(120% 120% at 80% 90%, rgba(82,227,182,.18), transparent 50%),
    #0e1430;
  box-shadow: 0 20px 60px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.04);
  transform: translateY(6px) scale(.98); animation: popInModal .22s ease forwards;
}
@keyframes popInModal { to{ transform: translateY(0) scale(1) } }
.outcome-winner { box-shadow: 0 24px 70px rgba(80,227,182,.35); }
.outcome-loser { box-shadow: 0 24px 70px rgba(124,156,255,.28); }

.pop-title { font-weight: 900; letter-spacing: .4px; font-size: clamp(22px, 4vw, 32px); color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,.35); }
.pop-btn { border-radius: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; box-shadow: 0 12px 26px rgba(0,0,0,.25); }
.btn-winner { background: #0fd2a0; color: #0a2a26; }
.btn-loser { background: #7c9cff; color: #0b1630; }
.pop-close { position: absolute; top: 10px; right: 12px; background: transparent; border: 0; color: #cfe3ff; cursor: pointer; font-size: 18px; }

.sparkle-1, .sparkle-2 {
  position: absolute; inset: auto; width: 160px; height: 160px; filter: blur(28px); opacity: .35; z-index: 0; border-radius: 50%;
}
.sparkle-1 { left: -40px; top: -40px; background: #7c9cff; }
.sparkle-2 { right: -40px; bottom: -40px; background: #52e3b6; }

/* ===== INTRO (no buttons, 10s auto) ===== */
.intro-backdrop {
  position: fixed; inset: 0; z-index: 70; background: rgba(5,10,22,.7); backdrop-filter: blur(6px);
  display: grid; place-items: center; animation: fadeIn .18s ease;
}
.intro-modal {
  position: relative;
  width: min(720px, 94vw);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.12);
  overflow: hidden;
  background:
    radial-gradient(120% 120% at 15% 5%, rgba(124,156,255,.18), transparent 50%),
    radial-gradient(120% 120% at 85% 95%, rgba(82,227,182,.18), transparent 50%),
    #0e1430;
  box-shadow: 0 24px 80px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.04);
  transform: translateY(8px) scale(.98); animation: popInModal .22s ease forwards;
}
.intro-sheen {
  position: absolute; inset: 0; background: linear-gradient(120deg, transparent, rgba(255,255,255,.04), transparent);
  transform: translateX(-100%); animation: sheen 2.8s ease-in-out infinite;
}
@keyframes sheen { 0%{transform:translateX(-100%)} 50%{transform:translateX(100%)} 100%{transform:translateX(100%)} }

.intro-title { font-weight: 900; font-size: clamp(22px, 3.8vw, 30px); color: #fff; }
.intro-sub { color: #cfe3ff; opacity: .8; }

.intro-prize {
  display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: center;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 12px;
}
.intro-prize-media {
  width: 120px; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: #081226; display: grid; place-items: center;
}
.intro-prize-media img { width: 100%; height: 100%; object-fit: contain; }
.intro-prize-placeholder { font-size: 42px; }

.intro-prize-info { display: flex; flex-direction: column; gap: 6px; }
.intro-prize-name { color: #e9f3ff; font-weight: 800; letter-spacing: .2px; }
.intro-prices { display: flex; align-items: baseline; gap: 12px; }

.intro-price-old {
  position: relative; color: #a9bfe2; font-weight: 800;
}
.intro-slash {
  position: absolute; left: -6px; right: -6px; top: 50%; height: 2px; background: linear-gradient(90deg, #ff6a6a, #ffa14a);
  transform-origin: left center; transform: scaleX(0) rotate(-8deg);
  animation: slashIn .6s .15s ease forwards;
}
@keyframes slashIn { to{ transform: scaleX(1) rotate(-8deg); } }

.intro-price-new {
  color: #ffd43b; font-weight: 900; font-size: clamp(18px, 3vw, 28px);
  text-shadow: 0 0 18px rgba(255,212,59,.2);
  animation: pricePop .4s .4s ease both;
}
@keyframes pricePop { from{ transform: scale(.96); opacity:.6 } to{ transform: scale(1); opacity:1 } }

.intro-players { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 12px; }
.intro-players-head { color: #cfe3ff; margin-bottom: 8px; font-weight: 700; }
.intro-players-grid {
  display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
.intro-player-pill {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px;
  background: rgba(0,0,0,.25); border: 1px solid rgba(255,255,255,.08);
}
.intro-player-pill img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 2px rgba(255,255,255,.7); }
.intro-player-pill span { color: #e9f3ff; font-weight: 700; font-size: .95rem; }

.intro-count { color: #e9f3ff; opacity: .9; font-weight: 700; letter-spacing: .3px; }
</style>
