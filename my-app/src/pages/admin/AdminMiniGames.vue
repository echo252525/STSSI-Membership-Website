<template>
  <div class="mini-games-page">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-joystick"></i>
        Admin Mini Games
      </h3>
      <button
        type="button"
        class="btn btn-primary d-flex align-items-center gap-2"
        @click="openForm()"
      >
        <i class="bi bi-plus-lg"></i>
        New Spin & Win
      </button>
    </div>

    <!-- ======================= HERO SECTIONS ======================= -->
    <section class="events-hero mb-4">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <!-- 
          New responsive layout:
          - Left = Upcoming (narrow)
          - Center = Happening Now (wide hero)
          - Right = Finished (narrow)
        -->
        <div class="row g-3 align-items-stretch">
          <!-- Upcoming (LEFT) -->
          <div class="col-12 col-lg-3 order-2 order-lg-1">
            <div class="hero-card glass tilt h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-upcoming"></span>
                  <h5 class="mb-0 fw-bold">Upcoming</h5>
                </div>
                <small class="text-muted">Scheduled</small>
              </div>

              <div v-if="upcomingEvents.length === 0" class="empty-state">
                <i class="bi bi-calendar2"></i>
                <div>No upcoming events</div>
              </div>

              <div v-else class="event-scroll">
                <article
                  v-for="ev in upcomingEvents"
                  :key="ev.id"
                  class="event-pill upcoming"
                >
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span class="badge rounded-pill text-bg-warning text-dark">{{ ev.status }}</span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.item_name }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Cap: {{ ev.player_cap }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>

                  <footer class="times">
                    <div v-if="ev.opens_at" class="time">
                      <i class="bi bi-hourglass-split"></i>
                      Opens: {{ fmt(ev.opens_at) }}
                    </div>
                  </footer>
                </article>
              </div>
            </div>
          </div>

          <!-- Happening Now (CENTER HERO) -->
          <div class="col-12 col-lg-6 order-1 order-lg-2">
            <div class="hero-card glass tilt hero-center h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-live"></span>
                  <h4 class="mb-0 fw-bold">Happening Now</h4>
                </div>
                <small class="text-muted">{{ nowFmt }}</small>
              </div>

              <div v-if="nowEvents.length === 0" class="empty-state py-5">
                <i class="bi bi-emoji-neutral"></i>
                <div>No live events</div>
              </div>

              <div v-else class="event-scroll hero-scroll">
                <article
                  v-for="ev in nowEvents"
                  :key="ev.id"
                  class="event-pill live"
                >
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span class="badge rounded-pill text-bg-success">{{ ev.status }}</span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.item_name }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Cap: {{ ev.player_cap }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>

                  <div class="price-row">
                    <div class="price-chip">
                      <small>Winner Price</small>
                      <div class="price">₱ {{ number(ev.winner_price) }}</div>
                    </div>
                    <div class="price-chip">
                      <small>Loser Refund</small>
                      <div class="price">₱ {{ number(ev.loser_refund_amount) }}</div>
                    </div>
                  </div>

                  <footer class="times">
                    <div v-if="ev.opens_at" class="time">
                      <i class="bi bi-play-fill"></i>
                      Opens: {{ fmt(ev.opens_at) }}
                    </div>
                    <div v-if="ev.closes_at" class="time">
                      <i class="bi bi-flag-fill"></i>
                      Closes: {{ fmt(ev.closes_at) }}
                    </div>
                  </footer>
                </article>
              </div>
            </div>
          </div>

          <!-- Finished (RIGHT) -->
          <div class="col-12 col-lg-3 order-3 order-lg-3">
            <div class="hero-card glass tilt h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-finished"></span>
                  <h5 class="mb-0 fw-bold">Finished</h5>
                </div>
                <small class="text-muted">Spun / Settled / Cancelled</small>
              </div>

              <div v-if="finishedEvents.length === 0" class="empty-state">
                <i class="bi bi-archive"></i>
                <div>No finished events</div>
              </div>

              <div v-else class="event-scroll">
                <article
                  v-for="ev in finishedEvents"
                  :key="ev.id"
                  class="event-pill finished"
                >
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span
                      class="badge rounded-pill"
                      :class="{
                        'text-bg-info': ev.status === 'spun',
                        'text-bg-secondary': ev.status === 'settled',
                        'text-bg-dark': ev.status === 'cancelled'
                      }"
                    >
                      {{ ev.status }}
                    </span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.item_name }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Cap: {{ ev.player_cap }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>

                  <footer class="times">
                    <div v-if="ev.closes_at" class="time">
                      <i class="bi bi-flag-fill"></i>
                      Closed: {{ fmt(ev.closes_at) }}
                    </div>
                  </footer>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- ===================== / HERO SECTIONS ====================== -->

    <!-- Create Event Modal -->
    <div v-if="showForm" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Create Spin & Win Event</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeForm">✕</button>
        </div>
        <div class="card-body">
          <form @submit.prevent="submit">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Title</label>
                <input
                  v-model.trim="form.title"
                  type="text"
                  class="form-control"
                  placeholder="USB Drive Raffle – Batch #1"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Name</label>
                <input
                  v-model.trim="form.item_name"
                  type="text"
                  class="form-control"
                  placeholder="USB Drive"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Player Cap</label>
                <input
                  v-model.number="form.player_cap"
                  type="number"
                  min="2"
                  class="form-control"
                />
                <div class="form-text">Usually 10</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Supplier Cost (₱)</label>
                <input
                  v-model.number="form.item_supplier_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Entry Fee (₱)</label>
                <input
                  v-model.number="form.entry_fee"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Interest Pool (₱)</label>
                <input
                  v-model.number="form.interest_pool"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
                <div class="form-text">Split among losers (cap − 1)</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Opens At (optional)</label>
                <input v-model="form.opens_at" type="datetime-local" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Closes At (optional)</label>
                <input v-model="form.closes_at" type="datetime-local" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="draft">draft</option>
                  <option value="open">open</option>
                  <option value="locked">locked</option>
                  <option value="spun">spun</option>
                  <option value="settled">settled</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>

            <!-- Live Pricing Preview (same math / rounding as DB) -->
            <div class="mt-4 p-3 rounded bg-light">
              <div class="fw-semibold mb-2">Pricing Preview</div>
              <div class="row g-2 small">
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted">Interest per Loser</div>
                    <div class="fs-5">₱ {{ preview.interestPerLoser.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted">Winner Price</div>
                    <div class="fs-5">₱ {{ preview.winnerPrice.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted">Loser Refund</div>
                    <div class="fs-5">₱ {{ preview.loserRefund.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeForm">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- =================== CARDS WITH TABS (replaces table visually) =================== -->
    <div class="card shadow-sm border-0 mt-4">
      <div class="card-header bg-white border-0 pt-3 pb-0">
        <ul class="nav nav-tabs nav-fill card-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'upcoming' }"
              @click="activeTab = 'upcoming'"
              type="button"
            >
              <i class="bi bi-calendar2 me-2"></i> Upcoming
              <span class="badge bg-secondary ms-2">{{ upcomingEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'now' }"
              @click="activeTab = 'now'"
              type="button"
            >
              <i class="bi bi-broadcast-pin me-2"></i> Happening Now
              <span class="badge bg-secondary ms-2">{{ nowEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'finished' }"
              @click="activeTab = 'finished'"
              type="button"
            >
              <i class="bi bi-archive me-2"></i> Finished
              <span class="badge bg-secondary ms-2">{{ finishedEvents.length }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <div class="row g-3">
          <!-- Upcoming Tab Cards -->
          <template v-if="activeTab === 'upcoming'">
            <div class="col-12 col-md-6 col-lg-4" v-for="ev in upcomingEvents" :key="'tab-up-' + ev.id">
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-warning text-dark">{{ ev.status }}</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.item_name }}</div>
                <div class="d-flex justify-content-between small">
                  <div><i class="bi bi-people me-1"></i>Cap {{ ev.player_cap }}</div>
                  <div><i class="bi bi-cash-coin me-1"></i>₱ {{ number(ev.entry_fee) }}</div>
                </div>
                <div class="mt-2 small text-muted">
                  <i class="bi bi-hourglass-split me-1"></i>Opens: {{ fmt(ev.opens_at) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Now Tab Cards -->
          <template v-else-if="activeTab === 'now'">
            <div class="col-12 col-md-6 col-lg-4" v-for="ev in nowEvents" :key="'tab-now-' + ev.id">
              <div class="event-card border rounded-3 p-3 live-shadow">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-success">{{ ev.status }}</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.item_name }}</div>
                <div class="d-flex justify-content-between small">
                  <div><i class="bi bi-people me-1"></i>Cap {{ ev.player_cap }}</div>
                  <div><i class="bi bi-cash-coin me-1"></i>₱ {{ number(ev.entry_fee) }}</div>
                </div>
                <div class="mt-2 d-flex gap-3 small">
                  <span><i class="bi bi-cash-stack me-1"></i>Winner: ₱ {{ number(ev.winner_price) }}</span>
                  <span><i class="bi bi-arrow-counterclockwise me-1"></i>Loser: ₱ {{ number(ev.loser_refund_amount) }}</span>
                </div>
                <!-- ✅ show times consistently -->
                <div class="mt-2 small text-muted d-flex gap-3">
                  <span v-if="ev.opens_at"><i class="bi bi-play-fill me-1"></i>{{ fmt(ev.opens_at) }}</span>
                  <span v-if="ev.closes_at"><i class="bi bi-flag-fill me-1"></i>{{ fmt(ev.closes_at) }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Finished Tab Cards -->
          <template v-else>
            <div class="col-12 col-md-6 col-lg-4" v-for="ev in finishedEvents" :key="'tab-fin-' + ev.id">
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span
                    class="badge rounded-pill"
                    :class="{
                      'text-bg-info': ev.status === 'spun',
                      'text-bg-secondary': ev.status === 'settled',
                      'text-bg-dark': ev.status === 'cancelled'
                    }"
                  >
                    {{ ev.status }}
                  </span>
                </div>
                <div class="small text-muted mb-2">{{ ev.item_name }}</div>
                <div class="d-flex justify-content-between small">
                  <div><i class="bi bi-people me-1"></i>Cap {{ ev.player_cap }}</div>
                  <div><i class="bi bi-cash-coin me-1"></i>₱ {{ number(ev.entry_fee) }}</div>
                </div>
                <div class="mt-2 small text-muted">
                  <i class="bi bi-flag-fill me-1"></i>Closed: {{ fmt(ev.closes_at) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Empty state for selected tab -->
          <div
            v-if="(activeTab === 'upcoming' && upcomingEvents.length === 0)
                || (activeTab === 'now' && nowEvents.length === 0)
                || (activeTab === 'finished' && finishedEvents.length === 0)"
            class="col-12"
          >
            <div class="empty-state py-5">
              <i class="bi bi-box"></i>
              <div>No events in this tab</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Table (kept but hidden as requested) -->
    <div class="card shadow-sm border-0 d-none">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Item</th>
              <th class="text-center">Cap</th>
              <th class="text-end">Entry Fee</th>
              <th class="text-end">Interest Pool</th>
              <th class="text-end">Winner Price</th>
              <th class="text-end">Loser Refund</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ev, i) in events" :key="ev.id">
              <td>{{ i + 1 }}</td>
              <td class="fw-semibold">{{ ev.title }}</td>
              <td>{{ ev.item_name }}</td>
              <td class="text-center">{{ ev.player_cap }}</td>
              <td class="text-end">₱ {{ number(ev.entry_fee) }}</td>
              <td class="text-end">₱ {{ number(ev.interest_pool) }}</td>
              <td class="text-end">₱ {{ number(ev.winner_price) }}</td>
              <td class="text-end">₱ {{ number(ev.loser_refund_amount) }}</td>
              <td class="text-center">
                <span class="badge" :class="statusBadge(ev.status)">{{ ev.status }}</span>
              </td>
            </tr>
            <tr v-if="events.length === 0">
              <td colspan="9" class="text-center text-muted py-4">No events yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- /Hidden Table -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type EventRow = {
  id: string
  title: string
  item_name: string
  item_supplier_cost: number | string
  entry_fee: number | string
  player_cap: number | string
  interest_pool: number | string
  winner_price: number | string // generated
  loser_refund_amount: number | string // generated
  status: 'draft' | 'open' | 'locked' | 'spun' | 'settled' | 'cancelled'
  opens_at: string | null
  closes_at: string | null
}

const events = ref<EventRow[]>([])
const showForm = ref(false)
const submitting = ref(false)

/* ✅ NEW: active tab for the cards */
const activeTab = ref<'upcoming' | 'now' | 'finished'>('now')

// form state
const form = reactive({
  title: '',
  item_name: '',
  item_supplier_cost: 30.0,
  entry_fee: 50.0,
  player_cap: 10,
  interest_pool: 15.0,
  opens_at: '' as string | '',
  closes_at: '' as string | '',
  status: 'draft' as EventRow['status'],
})

// helpers
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)

/* ✅ Robust parser for `timestamp without time zone`
   - If ISO with 'Z' or timezone: Date(x) (UTC-safe)
   - If no timezone (e.g., '2025-09-22 10:00:00'): treat as LOCAL time to match intent
*/
function parseTimestampWithoutTZ(x: string): Date | null {
  if (!x) return null
  // ISO or already with timezone info
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(x)) {
    const d = new Date(x)
    return isNaN(d.getTime()) ? null : d
  }
  // Normalize common pg format "YYYY-MM-DD HH:mm:ss"
  const s = x.replace(' ', 'T')
  const d = new Date(s) // treated as local
  if (!isNaN(d.getTime())) return d

  // Fallback: manual split (YYYY-MM-DDTHH:mm:ss)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T?(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return null
  const [ , Y, M, D, h, m2, s2 ] = m
  const dd = new Date(
    Number(Y),
    Number(M) - 1,
    Number(D),
    Number(h),
    Number(m2),
    Number(s2 ?? 0),
    0
  )
  return isNaN(dd.getTime()) ? null : dd
}

/* ✅ Safer date coercion that accepts string | Date | null */
function toDate(x?: string | Date | null): Date | null {
  if (!x) return null
  if (x instanceof Date) return isNaN(x.getTime()) ? null : x
  return parseTimestampWithoutTZ(x)
}

// same rounding as DB generated columns
function calcInterestPerLoser(entry_fee: number, interest_pool: number, player_cap: number) {
  const denom = Math.max(player_cap - 1, 1)
  return round2(interest_pool / denom)
}
function calcWinnerPrice(entry_fee: number, interest_pool: number, player_cap: number) {
  const ipl = calcInterestPerLoser(entry_fee, interest_pool, player_cap)
  return round2(entry_fee - ipl)
}
function calcLoserRefund(entry_fee: number, interest_pool: number, player_cap: number) {
  const ipl = calcInterestPerLoser(entry_fee, interest_pool, player_cap)
  return round2(entry_fee + ipl)
}
function round2(x: number) {
  return Math.round((x + Number.EPSILON) * 100) / 100
}

const preview = reactive({
  interestPerLoser: calcInterestPerLoser(Number(form.entry_fee), Number(form.interest_pool), Number(form.player_cap)),
  winnerPrice: calcWinnerPrice(Number(form.entry_fee), Number(form.interest_pool), Number(form.player_cap)),
  loserRefund: calcLoserRefund(Number(form.entry_fee), Number(form.interest_pool), Number(form.player_cap)),
})

// recompute preview on form changes
watch(
  () => [form.entry_fee, form.interest_pool, form.player_cap],
  () => {
    const fee = Number(form.entry_fee)
    const pool = Number(form.interest_pool)
    const cap = Number(form.player_cap)
    preview.interestPerLoser = calcInterestPerLoser(fee, pool, cap)
    preview.winnerPrice = calcWinnerPrice(fee, pool, cap)
    preview.loserRefund = calcLoserRefund(fee, pool, cap)
  },
  { deep: true },
)

function statusBadge(status: EventRow['status']) {
  if (status === 'open') return 'text-bg-success'
  if (status === 'locked') return 'text-bg-warning'
  if (status === 'spun') return 'text-bg-info'
  if (status === 'settled') return 'text-bg-secondary'
  if (status === 'cancelled') return 'text-bg-dark'
  return 'text-bg-light'
}

function openForm() {
  showForm.value = true
}
function closeForm() {
  showForm.value = false
}

/* ✅ helper to store local wall time into TIMESTAMP WITHOUT TIME ZONE */
function asLocalPgTimestamp(x: string | ''): string | null {
  // input from <input type="datetime-local"> looks like "YYYY-MM-DDTHH:mm"
  if (!x) return null
  const [d, t] = x.split('T') // e.g., d="2025-09-22", t="11:30"
  return `${d} ${t}:00`       // "2025-09-22 11:30:00" (no Z/offset)
}

async function loadEvents() {
  const { data, error } = await supabase
    // IMPORTANT: schema-qualified table
    .schema('games')
    .from('event')
    .select(
      `
      id, title, item_name, item_supplier_cost,
      entry_fee, player_cap, interest_pool, status, opens_at, closes_at,
      winner_price, loser_refund_amount
    `,
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('loadEvents error:', error.message)
    return
  }
  events.value = (data ?? []) as EventRow[]
}

async function submit() {
  if (!form.title || !form.item_name) return

  submitting.value = true
  try {
    const payload: any = {
      title: form.title,
      item_name: form.item_name,
      item_supplier_cost: form.item_supplier_cost,
      entry_fee: form.entry_fee,
      player_cap: form.player_cap,
      interest_pool: form.interest_pool,
      status: form.status,
    }

    // ✅ Store local wall time strings into TIMESTAMP WITHOUT TIME ZONE columns
    const opensLocal = asLocalPgTimestamp(form.opens_at)
    const closesLocal = asLocalPgTimestamp(form.closes_at)
    if (opensLocal)  payload.opens_at  = opensLocal
    if (closesLocal) payload.closes_at = closesLocal

    const { error } = await supabase.schema('games').from('event').insert(payload)

    if (error) {
      console.error('insert event error:', error.message)
      alert(error.message)
      return
    }

    closeForm()
    await loadEvents()
  } finally {
    submitting.value = false
  }
}

/* ----------------------- HERO LOGIC (Non-breaking) ----------------------- */
const now = ref(new Date())
let t: number | undefined

onMounted(() => {
  loadEvents()
  // live clock & recalc grouping every 30s
  t = window.setInterval(() => (now.value = new Date()), 30_000)
})

onUnmounted(() => {
  if (t) window.clearInterval(t)
})

const nowFmt = computed(() => {
  const d = now.value
  return d.toLocaleString()
})

function isHappeningNow(ev: EventRow) {
  const n = now.value.getTime()
  const open = toDate(ev.opens_at)?.getTime()
  const close = toDate(ev.closes_at)?.getTime()
  const statusActive = ev.status === 'open' || ev.status === 'locked'

  if (statusActive) {
    const opened = open == null || open <= n
    const notClosed = close == null || close >= n
    return opened && notClosed
  }
  return false
}

function isUpcoming(ev: EventRow) {
  const n = now.value.getTime()
  const open = toDate(ev.opens_at)?.getTime()
  if (open != null && open > n) return true
  return ev.status === 'draft' && open != null && open > n
}

function isFinished(ev: EventRow) {
  if (ev.status === 'spun' || ev.status === 'settled' || ev.status === 'cancelled') return true
  const close = toDate(ev.closes_at)?.getTime()
  if (close != null && close < now.value.getTime()) return true
  return false
}

// Sorted & grouped lists (keeps original "events" unchanged)
const nowEvents = computed(() =>
  events.value
    .filter(isHappeningNow)
    .sort((a, b) => (toDate(b.opens_at)?.getTime() || 0) - (toDate(a.opens_at)?.getTime() || 0)),
)
const upcomingEvents = computed(() =>
  events.value
    .filter((e) => isUpcoming(e) && !isHappeningNow(e))
    .sort((a, b) => (toDate(a.opens_at)?.getTime() || 0) - (toDate(b.opens_at)?.getTime() || 0)),
)
const finishedEvents = computed(() =>
  events.value
    .filter(isFinished)
    .sort((a, b) => (toDate(b.closes_at)?.getTime() || 0) - (toDate(a.closes_at)?.getTime() || 0)),
)

function fmt(x: string | null) {
  if (!x) return '—'
  const d = toDate(x)
  if (!d) return '—'
  return d.toLocaleString()
}
</script>

<style scoped>
.mini-games-page {
  padding: 1rem;
}

/* ===================== HERO SECTION STYLES ===================== */
.events-hero {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.events-hero .hero-bg {
  position: absolute;
  inset: 0;
  /* subtle animated gradient */
  background: radial-gradient(1200px 400px at -10% -20%, #6ea8fe33, transparent 60%),
              radial-gradient(900px 500px at 110% 120%, #20c99733, transparent 60%),
              linear-gradient(180deg, #f8fafc, #ffffff);
  animation: float-bg 12s ease-in-out infinite alternate;
  filter: saturate(1.05);
}
@keyframes float-bg {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-10px); }
}
.events-hero .hero-content {
  position: relative;
  padding: 1rem;
}

.hero-card {
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e9ecef;
  min-height: 280px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.hero-card.glass {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(6px);
}
.tilt:hover {
  transform: translateY(-2px) rotateX(0.5deg) rotateY(-0.5deg);
  box-shadow: 0 12px 36px rgba(0,0,0,0.08);
}

/* Emphasize center hero */
.hero-center {
  min-height: 320px;
  border-width: 2px;
  box-shadow: 0 16px 50px rgba(32, 201, 151, 0.08);
}
.hero-scroll {
  max-height: 420px;
}

.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 999px;
}
.dot-live { background: #20c997; box-shadow: 0 0 0 6px rgba(32,201,151,0.15); }
.dot-upcoming { background: #fcc419; box-shadow: 0 0 0 6px rgba(252,196,25,0.15); }
.dot-finished { background: #94a3b8; box-shadow: 0 0 0 6px rgba(148,163,184,0.15); }

.empty-state {
  display: grid;
  place-items: center;
  color: #94a3b8;
  padding: 24px 8px;
  row-gap: 4px;
}
.empty-state i {
  font-size: 1.6rem;
  opacity: 0.9;
}

.event-scroll {
  display: grid;
  gap: 12px;
  max-height: 360px;
  overflow: auto;
  padding-right: 6px;
}

.event-pill {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  animation: fade-in 0.35s ease both;
}
.event-pill.live { border-color: #bff0e3; box-shadow: 0 4px 12px rgba(32,201,151,0.08); }
.event-pill.upcoming { border-color: #ffe7a3; box-shadow: 0 4px 12px rgba(252,196,25,0.08); }
.event-pill.finished { border-color: #e2e8f0; }

.event-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.06);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.event-pill .title {
  max-width: 65%;
}

.event-pill .meta {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}
.event-pill .pair {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #475569;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}
.price-chip {
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  padding: 8px;
  background: #f8fafc;
}
.price-chip small {
  display: block;
  color: #6b7280;
  letter-spacing: .02em;
}
.price-chip .price {
  font-weight: 700;
  font-size: 1.05rem;
}

.times {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  color: #64748b;
  font-size: 0.85rem;
}
.time { display: inline-flex; align-items: center; gap: 6px; }

/* =================== LIGHTWEIGHT MODAL STYLES (yours) =================== */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1055;
}
.modal-card {
  width: min(760px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}
.card-header {
  background: #fff;
}

/* =================== Tabs + card grid (new) =================== */
.card-tabs .nav-link {
  border: 0;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-weight: 600;
}
.card-tabs .nav-link.active {
  color: #0f172a;
  border-bottom: 2px solid #0ea5e9;
}
.event-card {
  background: #fff;
  border-color: #e9ecef;
  transition: box-shadow .2s ease, transform .2s ease;
}
.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0,0,0,.06);
}
.live-shadow {
  box-shadow: 0 8px 24px rgba(16,185,129,.12);
}

/* Responsive polish */
@media (max-width: 992px) {
  .event-pill .meta {
    grid-template-columns: 1fr 1fr;
  }
  .price-row {
    grid-template-columns: 1fr;
  }

  /* Stack columns nicely on mobile */
  .hero-center { min-height: 0; }
}
</style>
