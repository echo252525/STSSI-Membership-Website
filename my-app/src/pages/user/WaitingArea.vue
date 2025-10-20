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
            You’ve joined <strong>{{ event?.title || 'the event' }}</strong
            >. Settle in—your game starts soon.
          </p>
        </div>

        <!-- Players pill + progress -->
        <div v-if="event" class="wa-lobby-top mt-2 px-0 py-0">
          <div class="wa-lobby-row">
            <span class="badge rounded-pill wa-pill text-light">
              Players&nbsp;·&nbsp;<strong>{{ event.player_count }}</strong
              >/<span class="text-light">{{ event.player_cap }}</span>
            </span>
            <span class="badge rounded-pill wa-pill-soft text-capitalize">{{
              event.status
            }}</span>
          </div>

          <div
            class="wa-progress-wrap mt-1"
            role="progressbar"
            :aria-valuenow="progressPct"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="wa-progress-bar" :style="{ width: progressPct + '%' }"></div>
            <div class="wa-progress-label">{{ progressPct }}%</div>
          </div>
        </div>

        <!-- Players grid (ML-style ready room vibes) -->
        <div v-if="event" class="mt-4">
          <div class="d-flex align-items-center justify-content-between mb-2 px-0">
            <div class="text-start">
              <div class="fw-semibold text-light">Players in lobby</div>
            </div>
            <div class="small text-secondary text-light">{{ joinedUsers.length }} joined</div>
          </div>

          <div class="wa-users-grid ml-flavor">
            <!-- loading skeletons -->
            <template v-if="loadingJoined">
              <div v-for="n in 6" :key="'s' + n" class="wa-user-card">
                <div class="wa-avatar-skeleton"></div>
                <div class="wa-username-skeleton"></div>
              </div>
            </template>

            <!-- users -->
            <template v-else>
              <div
                v-for="u in joinedUsers"
                :key="u.id"
                class="wa-user-card"
                :title="u.full_name || '—'"
              >
                <div class="wa-user-glow"></div>
                <img
                  v-if="u.avatar_url"
                  :src="u.avatar_url"
                  class="wa-avatar"
                  alt="avatar"
                  @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                />
                <div class="wa-avatar wa-avatar-fallback" v-else>
                  {{ initials(u.full_name) }}
                </div>
                <div class="wa-username text-truncate">
                  {{ u.full_name || '—' }}
                </div>
              </div>

              <div v-if="!joinedUsers.length" class="text-secondary small py-2">
                No one has joined yet. Share the lobby to fill it up!
              </div>
            </template>
          </div>
        </div>
        <!-- /Players grid -->

        <!-- Product spotlight (center) with fade slideshow -->
        <div class="wa-product-spot mt-1">
          <div class="wa-image-frame">
            <div class="wa-img-skeleton-circle" v-if="imageLoading"></div>

            <!-- Slideshow stack -->
            <div class="wa-slideshow" v-if="signedImageUrls.length">
              <img
                v-for="(url, i) in signedImageUrls"
                :key="url"
                :src="url"
                alt="Event Prize"
                class="wa-image-circle wa-slide"
                :class="{ active: i === currentImageIdx }"
                @load="onSlideLoaded(i)"
                @error="onSlideError(i)"
              />
            </div>

            <!-- Fallback single image if no list -->
            <img
              v-else-if="imageUrl"
              :src="imageUrl"
              alt="Event Prize"
              class="wa-image-circle"
              @load="imageLoading = false"
              @error="imageLoading = false"
            />

            <div class="wa-ring"></div>
          </div>

          <div class="wa-product-info mt-3">
            <div class="wa-product-title text-truncate" :title="productTitle || '—'">
              {{ productTitle || 'Product Title Here' }}
            </div>
            <div class="wa-price-row">
              <span class="wa-price-old" v-if="productOriginalPriceStr">{{
                productOriginalPriceStr
              }}</span>
              <span class="wa-price-new" v-if="productDiscountedPriceStr">{{
                productDiscountedPriceStr
              }}</span>
            </div>
          </div>
        </div>

        <!-- Minimal spinner + dots -->
        <div class="mb-0 mt-0">
          <div class="wa-dots mt-3" aria-hidden="true"><span></span><span></span><span></span></div>
          <div v-if="isLoading" class="small text-muted mt-3">Loading event…</div>
        </div>

        <!-- Tip marquee -->
        <div class="wa-tips mt-4" aria-live="polite">
          <div class="wa-tips-track">
            <span class="wa-tip">Keep this tab open—your slot stays reserved until the round starts.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Rounds start as the lobby fills. Invite a friend to kick it off sooner.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Prizes reveal when the round begins—watch the top banner.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Names stay bright on darker slices so you can spot yours fast.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">No pointer here—watch the glowing edge; it locks onto the winner.</span>
            
            <span class="wa-dot">•</span>
            <span class="wa-tip">When the countdown hits 0, entries lock for this round.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip"> No need to tap—everyone sees the same synced spin.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Stay on this tab; backgrounding can delay visuals on some devices.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">If the layout looks off, refresh before the countdown ends.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Weak connection? Your entry is still counted—result is server-verified.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Make sure your display name and avatar are correct—they’ll show if you win.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">The wheel may fake out, then snap to the winning slice—don’t be fooled.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">One account per player. Suspicious activity can be disqualified.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Winners go to Purchases to claim. Didn’t win? Back to Games for the next round.</span>

            <span class="wa-dot">•</span>
            <span class="wa-tip">Screenshots are welcome—your winning slice and name will be highlighted.</span>
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
          <div class="text-muted small">Going back will <strong>free your slot</strong>.</div>
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
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

const eventId = route.query.eventId as string | undefined
const deleting = ref(false)
const err = ref<string>('')

// loading states
const isLoading = ref(true)
const imageLoading = ref(true)

// suppress deletion when navigating to event
const suppressDelete = ref(false)

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
  interest_per_player: number | null
  winner_refund_amount: number | null
  loser_refund_amount: number | null
}
const event = ref<EventRow | null>(null)
const imageUrl = ref<string | null>(null) // fallback single image

// players
type UserProfile = { id: string; full_name: string | null; avatar_url?: string | null }
const joinedUsers = ref<UserProfile[]>([])
const loadingJoined = ref<boolean>(true)

// product info
const productTitle = ref<string | null>(null)
const productOriginalPrice = ref<number | null>(null)
const productOriginalPriceStr = computed(() =>
  productOriginalPrice.value == null ? '' : formatMoney(productOriginalPrice.value),
)
const productDiscountedPrice = computed<number | null>(() => {
  if (productOriginalPrice.value == null) return null
  const interest = Number(event.value?.interest_per_player ?? 0)
  return Math.max(0, Number(productOriginalPrice.value) - interest)
})
const productDiscountedPriceStr = computed(() =>
  productDiscountedPrice.value == null ? '' : formatMoney(productDiscountedPrice.value),
)

// Progress
const progressPct = computed<number>(() => {
  if (!event.value) return 0
  const cap = Number(event.value.player_cap || 0)
  const cnt = Number(event.value.player_count || 0)
  if (!cap) return 0
  return Math.max(0, Math.min(100, Math.round((cnt / cap) * 100)))
})

// ===== CONFIG =====
// Keep bucket as requested
const PRODUCT_BUCKETS = ['prize_product']
const AVATAR_BUCKET = 'user_profile'
const READY_STATUS = 'ready'

// Slideshow config/state
const signedImageUrls = ref<string[]>([])
const currentImageIdx = ref<number>(0)
const SLIDE_MS = 3000
let slideTimer: number | null = null

function isHttpUrl(path?: string | null) {
  return !!path && /^https?:\/\//i.test(path)
}

function isSpunStatus(s?: string | null) {
  return String(s || '').toLowerCase() === 'spun'
}

async function toSignedUrl(
  path: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null
  if (isHttpUrl(path)) return path
  for (const bucket of PRODUCT_BUCKETS) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn, { download: false })
      if (!error && data?.signedUrl) return data.signedUrl
    } catch {}
  }
  console.error('createSignedUrl failed for product path:', path)
  return null
}

async function toSignedAvatar(
  path: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, expiresIn, { download: false })
  if (error) return null
  return data?.signedUrl || null
}

function toPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (isHttpUrl(path)) return path
  const { data } = supabase.storage.from(PRODUCT_BUCKETS[0]).getPublicUrl(path)
  return data?.publicUrl || null
}

/** List ALL images inside products/<product_id>/ and return signed URLs (sorted) */
async function listProductImages(productId: string): Promise<string[]> {
  const folder = `products/${productId}`
  const exts = /\.(png|jpe?g|webp|gif|bmp)$/i
  const out: string[] = []

  for (const bucket of PRODUCT_BUCKETS) {
    try {
      const { data: page, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })
      if (error) throw error
      if (!page || !page.length) continue

      const imgs = page.filter((f) => f?.name && exts.test(f.name))
      for (const f of imgs) {
        const fullPath = `${folder}/${f.name}`
        const { data: signed, error: signErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fullPath, 3600, { download: false })
        if (!signErr && signed?.signedUrl) out.push(signed.signedUrl)
      }

      if (out.length) return out // prefer first bucket that yields images
    } catch {}
  }
  return out
}

// slideshow helpers
function startSlideshow() {
  stopSlideshow()
  if (signedImageUrls.value.length <= 1) return
  slideTimer = window.setInterval(() => {
    currentImageIdx.value = (currentImageIdx.value + 1) % signedImageUrls.value.length
  }, SLIDE_MS)
}
function stopSlideshow() {
  if (slideTimer) {
    window.clearInterval(slideTimer)
    slideTimer = null
  }
}
function onSlideLoaded(i: number) {
  if (i === 0) imageLoading.value = false
}
function onSlideError(i: number) {
  try {
    const arr = signedImageUrls.value.slice()
    arr.splice(i, 1)
    signedImageUrls.value = arr
    if (currentImageIdx.value >= signedImageUrls.value.length) currentImageIdx.value = 0
    if (!signedImageUrls.value.length) {
      if (imageUrl.value) imageLoading.value = false
    }
  } catch {}
}

// ===== Confirm modal =====
const showConfirm = ref(false)
function openConfirm() {
  showConfirm.value = true
}
function closeConfirm() {
  if (!deleting.value) showConfirm.value = false
}
async function confirmLeave() {
  await goBack()
}

// ===== Redirect when lobby locks or full =====
const redirected = ref(false)
const EVENT_ROUTE_NAMES = ['user.minigames.event', 'user.games.event', 'games.event']
function isGamesEventRoute(to: any) {
  if (!to) return false
  const nameOk = to.name && EVENT_ROUTE_NAMES.includes(String(to.name))
  const pathOk =
    to.path &&
    ['/app/mini-games/event', '/app/minigames/event', '/games/event'].includes(String(to.path))
  const qid = to.query && to.query.eventId ? String(to.query.eventId) : undefined
  const sameEvent = qid && eventId && qid === eventId
  return (nameOk || pathOk) && !!sameEvent
}

/* Charging logic (kept) */
const chargedReady = ref(false)
function normalizedFee(): number {
  const fee = Number(event.value?.entry_fee ?? 0)
  return Math.max(0, Math.round(fee))
}
async function chargeUserForEntry(userId: string): Promise<boolean> {
  try {
    if (isSpunStatus(event.value?.status)) return true
    const fee = normalizedFee()
    if (fee <= 0) return true
    const { data: urow, error: uerr } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()
    if (uerr) {
      err.value = 'Could not read your balance.'
      return false
    }
    const cur = Number(urow?.balance ?? 0)
    if (cur < fee) {
      err.value = 'Insufficient balance to join. Please top up.'
      return false
    }
    const { error: updErr } = await supabase
      .from('users')
      .update({ balance: cur - fee })
      .eq('id', userId)
    if (updErr) {
      err.value = 'Could not deduct entry fee.'
      return false
    }
    return true
  } catch {
    err.value = 'Payment failed unexpectedly.'
    return false
  }
}
async function markEntryReady() {
  try {
    if (!eventId) return
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) return
    const userId = userRes.user?.id
    if (!userId) return

    if (!event.value?.id) {
      await fetchEventAndImage()
      if (!event.value?.id) return
    }

    const { data: entryRow } = await supabase
      .schema('games')
      .from('entry')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()

    const alreadyReady = (entryRow?.status || '').toLowerCase() === READY_STATUS
    if (alreadyReady) {
      chargedReady.value = true
      return
    }

    if (!chargedReady.value) {
      const ok = await chargeUserForEntry(userId)
      if (!ok) return
      chargedReady.value = true
    }

    await supabase
      .schema('games')
      .from('entry')
      .update({ status: READY_STATUS })
      .eq('event_id', eventId)
      .eq('user_id', userId)
  } catch {}
}
async function ensureChargeOnRealtimeReady(payload: any) {
  try {
    const { data: userRes } = await supabase.auth.getUser()
    const uid = userRes.user?.id
    if (!uid) return
    const newStatus = String(payload?.new?.status || '').toLowerCase()
    const newUser = String(payload?.new?.user_id || '')
    if (newStatus === READY_STATUS && newUser === uid && !chargedReady.value) {
      if (!event.value?.id) await fetchEventAndImage()
      const ok = await chargeUserForEntry(uid)
      if (ok) chargedReady.value = true
    }
  } catch {}
}

async function navigateToGamesEvent() {
  if (!eventId) return
  suppressDelete.value = true
  await markEntryReady()
  if (err.value) {
    suppressDelete.value = false
    return
  }

  const candidates = [
    { name: 'user.minigames.event', query: { eventId } },
    { name: 'user.games.event', query: { eventId } },
    { name: 'games.event', query: { eventId } },
  ] as const
  for (const r of candidates) {
    try {
      await router.push(r as any)
      return
    } catch {}
  }

  const pathCandidates = [
    { path: '/app/mini-games/event', query: { eventId } },
    { path: '/app/minigames/event', query: { eventId } },
    { path: '/games/event', query: { eventId } },
  ]
  for (const r of pathCandidates) {
    try {
      await router.push(r as any)
      return
    } catch {}
  }

  try {
    window.location.href = `/app/mini-games/event?eventId=${encodeURIComponent(eventId)}`
  } catch {}
}

function isLockedStatus(s?: string | null) {
  return String(s || '').toLowerCase() === 'locked'
}
function maybeRedirect() {
  if (redirected.value) return
  const locked = isLockedStatus(event.value?.status)
  const cap = Number(event.value?.player_cap || 0)
  const cnt = Number(event.value?.player_count || 0)
  const full = cap > 0 && cnt >= cap
  if (locked || full) {
    redirected.value = true
    void navigateToGamesEvent()
  }
}

// ===== Load event + product (title/price) + images =====
async function fetchEventAndImage() {
  isLoading.value = true
  imageLoading.value = true
  try {
    if (!eventId) {
      err.value = 'No event specified.'
      return
    }

    // 1) Get event (schema: games)
    const { data: ev, error: evErr } = await supabase
      .schema('games')
      .from('event')
      .select(
        `
        id, title, item_supplier_cost, entry_fee, player_count, interest_pool,
        status, created_by, created_at, updated_at, product_id, player_cap,
        user_id_winner, interest_per_player, winner_refund_amount, loser_refund_amount
      `,
      )
      .eq('id', eventId)
      .single()

    if (evErr) {
      err.value = 'Failed to load event details.'
      return
    }
    event.value = ev as EventRow
    maybeRedirect()

    // Reset product display
    productTitle.value = null
    productOriginalPrice.value = null
    imageUrl.value = null
    signedImageUrls.value = []
    currentImageIdx.value = 0
    stopSlideshow()

    // 2) Product: title/name + price + images
    if (ev?.product_id) {
      // === CHANGED: query the products table from the `prize_product` schema/profile first ===
      let prod: any = null

      const { data: prodPrimary, error: prodPrimaryErr } = await supabase
        .schema('prize_product') // <<< points PostgREST to /rest/v1/prize_product (profile)
        .from('products')
        .select('product_url, title, name, price')
        .eq('id', ev.product_id)
        .maybeSingle()

      if (!prodPrimaryErr && prodPrimary) {
        prod = prodPrimary
      } else {
        // Fallback to your previous schema just in case you still keep data there
        const { data: prodFallback } = await supabase
          .schema('games') // fallback (old path)
          .from('products')
          .select('product_url, title, name, price')
          .eq('id', ev.product_id)
          .maybeSingle()
        if (prodFallback) prod = prodFallback
      }
      // === /CHANGED ===

      if (prod) {
        productTitle.value = prod?.title || prod?.name || null
        const rawPrice = prod?.price
        productOriginalPrice.value = rawPrice != null ? Number(rawPrice) : null
      }

      // Try folder-first listing (per your required structure)
      const allSigned = await listProductImages(ev.product_id)
      if (allSigned.length) {
        signedImageUrls.value = allSigned
        imageLoading.value = false
        startSlideshow()
      } else {
        // Fallback: single product_url
        const path = prod?.product_url as string | null
        const signedFromUrl = await toSignedUrl(path)
        if (signedFromUrl) imageUrl.value = signedFromUrl
        else {
          // last fallback: try to find first image anyway
          const fallback = await listProductImages(ev.product_id)
          if (fallback.length) {
            signedImageUrls.value = fallback
            startSlideshow()
          }
        }
        imageLoading.value = false
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

// joined users
async function fetchJoinedUsers() {
  if (!eventId) return
  loadingJoined.value = true
  try {
    const { data: entries, error: entErr } = await supabase
      .schema('games')
      .from('entry')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('status', 'joined')

    if (entErr) {
      joinedUsers.value = []
      return
    }

    const userIds = [...new Set((entries || []).map((e: any) => e.user_id))] as string[]
    if (userIds.length === 0) {
      joinedUsers.value = []
      return
    }

    const { data: users, error: usrErr } = await supabase
      .from('users')
      .select('id, full_name, profile_url')
      .in('id', userIds)

    if (usrErr) {
      joinedUsers.value = []
      return
    }

    const normalized: UserProfile[] = await Promise.all(
      (users || []).map(async (u: any) => {
        const signed = await toSignedAvatar(u.profile_url ?? null)
        return { id: u.id, full_name: u.full_name ?? null, avatar_url: signed }
      }),
    )

    normalized.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
    joinedUsers.value = normalized
  } catch {
    joinedUsers.value = []
  } finally {
    loadingJoined.value = false
  }
}

// delete logic (kept)
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
      err.value = delErr.message || 'Failed to leave event.'
    }
  } catch (e: any) {
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
    err.value = e?.message || 'Something went wrong.'
  } finally {
    deleting.value = false
    showConfirm.value = false
  }
}

onBeforeRouteLeave((to: any) => {
  if (suppressDelete.value) return
  if (isGamesEventRoute(to)) return
  void deleteEntryIfNeeded()
})

// page unload guard (kept)
function beforeUnload(e: BeforeUnloadEvent) {
  if (!deleteRan) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// format helpers
function formatMoney(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(Number(v))
  } catch {
    return Number(v).toFixed(2)
  }
}
function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(v))
  } catch {
    return v
  }
}
function initials(name?: string | null) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'U'
}

/* Realtime + polling (kept) */
let realtimeChannel: any | null = null
let realtimeEntryChannel: any | null = null
let refreshTimer: number | null = null
const POLL_MS = 10_000
let pollHandle: number | null = null

function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    await Promise.all([fetchEventAndImage(), fetchJoinedUsers()])
  }, delayMs)
}

function makeRealtimeChannel() {
  if (!eventId) return
  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel)
    } catch {}
    realtimeChannel = null
  }

  realtimeChannel = supabase
    .channel(`wa-event-${eventId}`, {
      config: { broadcast: { self: false }, presence: { key: 'waiting-area' } },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'event', filter: `id=eq.${eventId}` },
      (payload: any) => {
        try {
          if (payload.eventType === 'DELETE') {
            err.value = 'This event was removed.'
          } else if (payload.new) {
            const next = payload.new as Partial<EventRow>
            event.value = { ...(event.value || ({} as any)), ...next } as EventRow

            const cap = Number(next.player_cap ?? event.value.player_cap ?? 0)
            const cnt = Number(next.player_count ?? event.value.player_count ?? 0)
            const locked = isLockedStatus(next.status ?? event.value.status)
            if (!redirected.value && ((cap > 0 && cnt >= cap) || locked)) {
              redirected.value = true
              void navigateToGamesEvent()
              return
            }
            maybeRedirect()
          }
        } catch {}
        scheduleRefresh(250)
      },
    )
    .subscribe((status: any) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeChannel(), 1000)
      }
    })
}

function makeRealtimeEntryChannel() {
  if (!eventId) return
  if (realtimeEntryChannel) {
    try {
      supabase.removeChannel(realtimeEntryChannel)
    } catch {}
    realtimeEntryChannel = null
  }

  realtimeEntryChannel = supabase
    .channel(`wa-entry-${eventId}`, {
      config: { broadcast: { self: false }, presence: { key: 'waiting-area' } },
    })
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'entry', filter: `event_id=eq.${eventId}` },
      async (payload: any) => {
        await ensureChargeOnRealtimeReady(payload)
        await Promise.all([fetchEventAndImage(), fetchJoinedUsers()])
        maybeRedirect()
      },
    )
    .subscribe((status: any) => {
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeRealtimeEntryChannel(), 1000)
      }
    })
}

function startPoll() {
  stopPoll()
  pollHandle = window.setInterval(() => {
    fetchEventAndImage()
    fetchJoinedUsers()
  }, POLL_MS)
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

watch(
  () => event.value?.player_count,
  (nv, ov) => {
    if (ov !== undefined && nv !== ov) maybeRedirect()
  },
)
watch(
  () => event.value?.status,
  (nv, ov) => {
    if (ov !== undefined && nv !== nv) maybeRedirect()
  },
)

onMounted(() => {
  fetchEventAndImage()
  fetchJoinedUsers()
  window.addEventListener('beforeunload', beforeUnload)

  makeRealtimeChannel()
  makeRealtimeEntryChannel()
  startPoll()
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)

  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel)
    } catch {}
    realtimeChannel = null
  }
  if (realtimeEntryChannel) {
    try {
      supabase.removeChannel(realtimeEntryChannel)
    } catch {}
    realtimeEntryChannel = null
  }
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
    refreshTimer = null
  }
  stopPoll()
  stopSlideshow()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
/* (All your styles kept exactly as provided) */
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
    radial-gradient(45% 55% at 20% 10%, rgba(124, 156, 255, 0.25), transparent 60%),
    radial-gradient(60% 55% at 80% 30%, rgba(82, 227, 182, 0.18), transparent 60%),
    radial-gradient(50% 60% at 50% 90%, rgba(143, 119, 255, 0.18), transparent 60%);
  filter: blur(30px);
  z-index: 0;
}
.wa-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(80% 60% at 50% 40%, #000 60%, transparent 100%);
  z-index: 0;
}

.wa-card {
  position: relative;
  background: linear-gradient(180deg, rgba(18, 26, 49, 0.9), rgba(15, 21, 40, 0.95));
  border: 1px solid var(--wa-border);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  z-index: 1;
}
.wa-title {
  color: #f3f6ff;
}
.wa-subtext {
  color: #f3f6ff;
  opacity: 0.8;
}
.wa-title-wrap {
  display: grid;
  gap: 2px;
}

/* Lobby top row */
.wa-lobby-top {
  display: grid;
  gap: 10px;
}
.wa-lobby-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

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
  box-shadow: 0 0 12px rgba(124, 156, 255, 0.5);
  transition: width 420ms ease;
}
.wa-progress-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #c7d3ff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}

/* Users grid – ML style */
.wa-users-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  text-align: left;
}
@media (max-width: 1200px) {
  .wa-users-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
@media (max-width: 992px) {
  .wa-users-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 768px) {
  .wa-users-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 576px) {
  .wa-users-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.wa-user-card {
  position: relative;
  background: var(--wa-chip);
  border: 1px solid var(--wa-chip-border);
  border-radius: 14px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 40px 1fr;
  grid-template-rows: 40px auto;
  align-items: center;
  column-gap: 10px;
  overflow: hidden;
}
.wa-user-glow {
  content: '';
  position: absolute;
  inset: -60%;
  background: radial-gradient(120px 80px at 10% 10%, rgba(124, 156, 255, 0.08), transparent 60%);
  pointer-events: none;
}
.wa-avatar {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--wa-border);
  background: #0e1530;
}
.wa-avatar-fallback {
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #dbe5ff;
}
.wa-username {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  font-size: 13px;
  color: #eaf1ff;
}
.wa-avatar-skeleton {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--wa-border);
  background: linear-gradient(90deg, #141c36 25%, #0f1a33 37%, #141c36 63%);
  background-size: 400% 100%;
  animation: wa-shimmer 1.4s ease-in-out infinite;
}
.wa-username-skeleton {
  height: 10px;
  width: 70%;
  border-radius: 6px;
  background: linear-gradient(90deg, #141c36 25%, #0f1a33 37%, #141c36 63%);
  background-size: 400% 100%;
  animation: wa-shimmer 1.4s ease-in-out infinite;
}

/* Product spotlight */
.wa-product-spot {
  display: grid;
  place-items: center;
}
.wa-product-info {
  display: grid;
  gap: 4px;
}
.wa-product-title {
  font-weight: 700;
  font-size: 16px;
  color: #f3f6ff;
  max-width: 520px;
  margin: 0 auto;
}
.wa-price-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
  justify-content: center;
}
.wa-price-old {
  color: #9fb0d9;
  text-decoration: line-through;
  opacity: 0.75;
  font-size: 14px;
}
.wa-price-new {
  font-size: 20px;
  font-weight: 800;
  color: #52e3b6;
  text-shadow: 0 0 16px rgba(82, 227, 182, 0.25);
}

/* Circular prize image + slideshow */
.wa-image-frame {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 180px;
}
.wa-slideshow {
  position: relative;
  width: 164px;
  height: 164px;
}
.wa-image-circle {
  width: 164px;
  height: 164px;
  border-radius: 50%;
  border: 1px solid var(--wa-border);
  object-fit: cover;
  box-shadow: 0 10px 28px rgba(36, 62, 160, 0.25);
}
.wa-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 600ms ease;
}
.wa-slide.active {
  opacity: 1;
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
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1px dashed rgba(124, 156, 255, 0.35);
  animation: wa-spin 10s linear infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes wa-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes wa-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* Dots */
.wa-dots {
  display: inline-flex;
  gap: 6px;
}
.wa-dots span {
  width: 6px;
  height: 6px;
  background: #7e8cc2;
  border-radius: 999px;
  display: inline-block;
  animation: wa-bounce 1.4s infinite;
}
.wa-dots span:nth-child(2) {
  animation-delay: 0.12s;
}
.wa-dots span:nth-child(3) {
  animation-delay: 0.24s;
}
@keyframes wa-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.85;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* Tip marquee, buttons, modal (kept) */
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
  animation: wa-marquee 60s linear infinite; /* slower */
}
.wa-dot {
  opacity: 0.5;
  padding: 0 8px;
}
@keyframes wa-marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

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

.wa-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(11, 16, 32, 0.65);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
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
  position: absolute;
  top: 8px;
  right: 10px;
  border: 0;
  background: transparent;
  color: #9aa6b2;
  cursor: pointer;
}
</style>
