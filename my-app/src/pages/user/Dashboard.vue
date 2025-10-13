<template>
  <div class="dash container-fluid">
    <div class="row">
      <h1 class="h1 mb-2">Dashboard</h1>
    </div>

    <!-- ===== Your Membership (compact) ===== -->
    <div class="row mt-3">
      <div class="col-12">
        <div
          :class="[
            'card',
            'border-0',
            'shadow-sm',
            'rounded-4',
            'tier-hero-compact',
            'is-' + currentTier.key,
          ]"
        >
          <div
            class="card-body p-3 p-sm-4 p-md-5 d-flex align-items-center justify-content-between gap-3 flex-wrap"
          >
            <div class="d-flex align-items-center gap-3 gap-md-5">
              <!-- badge icon -->
              <div class="tier-badge">
                <img v-if="badgeIcon" :src="badgeIcon" :alt="currentTier.name + ' badge'" />
              </div>
              <!-- current tier -->
              <div>
                <div class="text-uppercase small text-muted">Your Membership</div>
                <h3 class="mb-0 fw-bold">{{ currentTier.name }}</h3>
              </div>
              <!-- summary chips -->
              <div class="d-flex gap-2 flex-wrap">
                <div class="stat-chip">
                  <span class="label">Total Purchases</span>
                  <span class="value">{{ peso(memberStats.lifetimePurchases) }}</span>
                </div>
                <div class="stat-chip">
                  <span class="label">Referrals</span>
                  <span class="value">{{ memberStats.referrals }}</span>
                </div>
              </div>
            </div>
            <!-- view details -->
            <div>
              <router-link
                to="/app/membership"
                class="button btn btn-outline-secondary btn-sm align-right color-red"
              >
                View details
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Joinable Mini Games ===== -->
    <div class="row mt-3">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <h3 class="h5 mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-joystick"></i> Joinable Mini Games
              </h3>
              <router-link to="/app/minigames" class="btn btn-outline-secondary btn-sm">
                See all games
              </router-link>
            </div>

            <!-- empty -->
            <div v-if="joinableGames.length === 0" class="empty-state">
              <i class="bi bi-emoji-neutral"></i>
              <div>No games open right now.</div>
            </div>

            <!-- arcade wheel cards -->
            <div v-else class="game-list">
              <div v-for="g in joinableGames" :key="g.id" class="game-card">
                <!-- wheel background -->
                <div class="wheel">
                  <div class="wheel-core">
                    <i class="bi bi-controller"></i>
                  </div>
                </div>

                <!-- content -->
                <div class="gc-body">
                  <div class="gc-head">
                    <span class="status-pill" :class="statusClass(g.status)">{{ g.status }}</span>
                  </div>

                  <div class="gc-title text-truncate" :title="g.title">{{ g.title }}</div>

                  <div class="gc-meta">
                    <span class="chip"><i class="bi bi-people me-1"></i>{{ g.player_count }}</span>
                    <span class="chip"
                      ><i class="bi bi-trophy me-1"></i>₱ {{ number(g.winner_price) }}</span
                    >
                  </div>

                  <router-link
                    :to="{ path: '/app/minigames', query: { focus: g.id } }"
                    class="btn btn-join"
                  >
                    Join
                  </router-link>
                </div>
              </div>
            </div>
            <!-- /arcade wheel cards -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
  await Promise.all([ fetchJoinableGames()])
})

/* ===== Membership bits (unchanged) ===== */
type TierKey = 'regular' | 'silver' | 'gold' | 'platinum' | 'diamond'
const tiers = [
  { key: 'regular', name: 'Regular Member' },
  { key: 'silver', name: 'Silver Member' },
  { key: 'gold', name: 'Gold Member' },
  { key: 'platinum', name: 'Platinum Member' },
  { key: 'diamond', name: 'Diamond Member' },
] as const

const ICON_BASE = '/'
const iconFor = (key: TierKey) => {
  switch (key) {
    case 'regular':
      return ICON_BASE + 'regular.png'
    case 'silver':
      return ICON_BASE + 'silver.png'
    case 'gold':
      return ICON_BASE + 'gold.png'
    case 'platinum':
      return ICON_BASE + 'platinum.png'
    case 'diamond':
      return ICON_BASE + 'diamond.png'
    default:
      return ''
  }
}

const memberTier = ref<TierKey>('regular')
const currentTier = computed(() => tiers.find((t) => t.key === memberTier.value) ?? tiers[0])
const badgeIcon = computed(() => iconFor(currentTier.value.key as TierKey))

/* ===== NEW: member stats (dummy for now) ===== */
const memberStats = ref({ lifetimePurchases: 7500, referrals: 6 })
const peso = (n: number) =>
  `₱${Number(n ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

/* ===== Mini games (dummy) ===== */
type GameRow = {
  id: string
  title: string
  player_count: number | string
  winner_price: number | string
  status: string
  player_cap?: number | string | null
}

const games = ref<GameRow[]>([])
// show every game regardless of status
const joinableGames = computed(() => games.value)

const number = (n: number | string | null | undefined) =>
  Number(n ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

// STATUS → CLASS (as you requested)
const statusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'draft':
      return 'pill-draft'
    case 'open':
      return 'pill-open'
    case 'locked':
      return 'pill-locked'
    case 'spun':
      return 'pill-spun'
    case 'settled':
      return 'pill-settled'
    case 'cancelled':
      return 'pill-cancelled'
    default:
      return 'pill-draft'
  }
}

// Dummy dataset (varied statuses so pills show)
const DUMMY_GAMES: GameRow[] = [
  {
    id: 'g-001',
    title: 'USB DRIVE',
    player_count: 0,
    winner_price: 42,
    status: 'draft',
    player_cap: 10,
  },
  {
    id: 'g-002',
    title: 'COFFEE ROULETTE',
    player_count: 6,
    winner_price: 99,
    status: 'open',
    player_cap: 12,
  },
  {
    id: 'g-003',
    title: 'MYSTERY BOX',
    player_count: 11,
    winner_price: 250,
    status: 'locked',
    player_cap: 12,
  },
  {
    id: 'g-004',
    title: 'SNEAKY CASH 1',
    player_count: 3,
    winner_price: 150,
    status: 'spun',
    player_cap: 8,
  },
  {
    id: 'g-005',
    title: 'SNEAKY CASH 2',
    player_count: 3,
    winner_price: 150,
    status: 'settled',
    player_cap: 8,
  },
  {
    id: 'g-006',
    title: 'SNEAKY CASH 3',
    player_count: 3,
    winner_price: 150,
    status: 'cancelled',
    player_cap: 8,
  },
]

async function fetchJoinableGames() {
  await new Promise((r) => setTimeout(r, 150))
  games.value = DUMMY_GAMES
}
</script>

<style scoped>
.dash {
  display: block;
}

/* ===== Compact membership look ===== */
.tier-hero-compact {
  position: relative;
  overflow: hidden;
  background: #fff;
  --fx-a: rgba(32, 164, 76, 0.1);
  --fx-b: rgba(32, 100, 124, 0.12);
  --fx-line: rgba(32, 100, 124, 0.06);
}
.tier-hero-compact .card-body {
  position: relative;
}
.tier-hero-compact::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(140% 120% at 85% 8%, var(--fx-a) 0%, transparent 60%),
    radial-gradient(120% 140% at 10% 90%, var(--fx-b) 0%, transparent 60%),
    repeating-linear-gradient(135deg, transparent 0 10px, var(--fx-line) 10px 11px);
}
.tier-hero-compact.is-regular {
  --fx-a: rgba(0, 128, 0, 0.12);
  --fx-b: rgba(34, 197, 94, 0.14);
  --fx-line: rgba(0, 128, 0, 0.08);
}
.tier-hero-compact.is-silver {
  --fx-a: #f3f6fa;
  --fx-b: #eceff5;
  --fx-line: rgba(130, 140, 160, 0.16);
}
.tier-hero-compact.is-gold {
  --fx-a: #fff4ce;
  --fx-b: #ffe7a6;
  --fx-line: rgba(201, 161, 12, 0.18);
}
.tier-hero-compact.is-platinum {
  --fx-a: #eef3f9;
  --fx-b: #e7eef7;
  --fx-line: rgba(120, 140, 160, 0.18);
}
.tier-hero-compact.is-diamond {
  --fx-a: #e6fbff;
  --fx-b: #dff4ff;
  --fx-line: rgba(48, 172, 228, 0.22);
}
.tier-badge img {
  width: 78px;
  height: 78px;
  object-fit: contain;
}

/* ===== Summary chips (copied style from Membership) ===== */
.stat-chip {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffffa6;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  min-width: 160px;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
}
.stat-chip .label {
  font-size: 0.8rem;
  color: #6c757d;
  display: block;
}
.stat-chip .value {
  font-weight: 700;
}

/* ================== SPIN-THE-WHEEL CARDS ================== */
.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

/* card shell */
.game-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  min-height: 200px;
  display: grid;
  grid-template-rows: 1fr;
}
.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* conic-gradient wheel background */
.wheel {
  position: absolute;
  inset: -20% -30% auto auto;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #f59e0b 0 12.5%,
    #22c55e 0 25%,
    #60a5fa 0 37.5%,
    #f43f5e 0 50%,
    #a78bfa 0 62.5%,
    #f97316 0 75%,
    #10b981 0 87.5%,
    #38bdf8 0 100%
  );
  filter: saturate(1.05);
  animation: wheel-sway 6s ease-in-out infinite alternate;
  opacity: 0.18;
}
@keyframes wheel-sway {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(6deg) scale(1.04);
  }
}
/* center cap */
.wheel-core {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ffffffee;
  display: grid;
  place-items: center;
  box-shadow:
    0 0 0 6px #ffffffaa,
    0 8px 20px rgba(0, 0, 0, 0.08);
}
.wheel-core i {
  font-size: 1.2rem;
  color: #334155;
}

/* readable content area */
.gc-body {
  position: relative;
  z-index: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  box-shadow:
    rgb(204, 219, 232) 3px 3px 6px 0px inset,
    rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
}

/* top row: status */
.gc-head {
  display: flex;
  justify-content: start;
}

/* title + meta */
.gc-title {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.2px;
  color: #0f172a;
}
.gc-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  color: #475569;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  box-shadow:
    rgb(204, 219, 232) 3px 3px 6px 0px inset,
    rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
}

/* join button */
.btn-join {
  align-self: flex-end;
  margin-top: 6px;
  padding: 0.3rem 2rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  color: #fff;
  letter-spacing: 0.2px;
  border: 0;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
}
.btn-join:hover {
  filter: brightness(1.05);
}

/* empty state */
.empty-state {
  display: grid;
  place-items: center;
  row-gap: 0.25rem;
  color: #94a3b8;
  padding: 24px 8px;
}
.empty-state i {
  font-size: 1.4rem;
}

/* ================== STATUS PILLS (DO NOT CHANGE COLORS) ================== */
.status-pill {
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
}
.pill-draft {
  background: rgba(0, 0, 0, 0.06);
  color: #5b6770;
  border: 1px solid rgba(0, 0, 0, 0.18);
}
.pill-open {
  background: rgba(32, 164, 76, 0.12);
  color: #20a44c;
  border: 1px solid rgba(32, 164, 76, 0.35);
}
.pill-locked {
  background: rgba(255, 165, 0, 0.12);
  color: #b36b00;
  border: 1px solid rgba(255, 165, 0, 0.35);
}
.pill-spun {
  background: rgba(79, 70, 229, 0.12);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.35);
}
.pill-settled {
  background: rgba(32, 100, 124, 0.12);
  color: #20647c;
  border: 1px solid rgba(32, 100, 124, 0.35);
}
.pill-cancelled {
  background: rgba(220, 53, 69, 0.12);
  color: #c02232;
  border: 1px solid rgba(220, 53, 69, 0.35);
}
</style>
