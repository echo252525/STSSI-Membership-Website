<template>
  <div class="admin-dashboard d-flex flex-column min-vh-100">
    <!-- Topbar -->
    <nav>
      <div class="container-fluid d-flex gap-2 align-items-center">
        <h1 class="fw-bold">Welcome, Admin</h1>
        <img src="../../../public/STSSI_mascot.png" class=".img-fluid" alt="icon" width="40" height="40"></img>
      </div>
    </nav>

    <!-- Dashboard body -->
    <main class="flex-grow-1 p-4 bg-white rounded-4 mt-3">
      <h3 class="fw-bold mb-3 d-flex align-items-center gap-2">
        <span class="material-symbols-outlined">grid_view</span>
        Admin Dashboard
      </h3>

      <div class="row g-4">
        <!-- Example stat cards -->
        <div class="col-md-4">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <div class="card-body">
              <span class="material-symbols-outlined fs-1">account_circle</span>
              <h3 class="fw-bold mb-0">{{ totalUsers }}</h3>
              <h6>Total Users</h6>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <div class="card-body">
              <span class="material-symbols-outlined fs-1">shield_person</span>
              <h3 class="fw-bold mb-0">{{ totalAdmins }}</h3>
              <h6>Active Admins</h6>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0 rounded-4 p-4">
            <div class="card-body">
              <span class="material-symbols-outlined fs-1">pending</span>
              <h3 class="fw-bold mb-0">5</h3>
              <h6>Pending Approvals</h6>
            </div>
          </div>
        </div>
      </div>

      <!-- Mini Games happening now quick look -->
      <div class="mt-5">
        <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
          <span class="material-symbols-outlined">sports_esports</span>
          Mini Games Updates
        </h5>

        <!-- Mini games grid with branded/game styling -->
        <div class="row g-4">
          <div class="col-sm-6 col-lg-3" v-for="game in miniGames" :key="game.id">
            <div class="mini-game-card h-100 shadow-sm">
              <div class="mg-accent"></div>
              <!-- subtle glowing bar -->

              <div class="d-flex align-items-start justify-content-between">
                <div class="mg-icon">
                  <i class="bi bi-joystick"></i>
                </div>
                <span :class="['status-pill', statusClass(game.status)]">
                  {{ game.status }}
                </span>
              </div>

              <h6 class="fw-bold mt-3 mb-2">{{ game.title }}</h6>

              <ul class="mg-meta list-unstyled mb-0">
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-people"></i>
                  <span class="text-muted">Players</span>
                  <span class="ms-auto fw-semibold">{{ game.player_count }}</span>
                </li>
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-trophy"></i>
                  <span class="text-muted">Winner Prize</span>
                  <span class="ms-auto fw-semibold">{{ game.winner_prize }}</span>
                </li>
              </ul>

              <!-- ADD: Fill-rate progress (assumes max 50 players) -->
              <div class="mg-progress mt-2" :style="{ '--p': ((game.player_count/10)*100) + '%' }">
                <div class="mg-progress-bar"></div>
                <div class="mg-progress-caption small text-muted">{{ game.player_count }} / 10 players</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-5">
        <div class="activity-card card border-0 rounded-4 overflow-hidden">
          <div class="activity-header px-4 py-3 d-flex align-items-center justify-content-between">
            <h5 class="fw-bold mb-0 d-flex align-items-center gap-2">
              <span class="material-symbols-outlined">timeline</span>
              Recent Activity
            </h5>
            <span class="badge rounded-pill bg-light text-secondary p-2 px-4">Today</span>
          </div>

          <ul class="activity-list list-unstyled mb-0 bg-light">
            <li class="activity-item">
              <div class="icon"><span class="material-symbols-outlined">person_add</span></div>
              <div class="body">
                <div class="title">User <strong>John Doe</strong> registered</div>
                <div class="meta">2 min ago</div>
              </div>
              <span class="tag tag-success">user</span>
            </li>

            <li class="activity-item">
              <div class="icon"><span class="material-symbols-outlined">tune</span></div>
              <div class="body">
                <div class="title">Admin <strong>Jane Smith</strong> updated settings</div>
                <div class="meta">1 hr ago</div>
              </div>
              <span class="tag tag-info">system</span>
            </li>

            <li class="activity-item">
              <div class="icon"><span class="material-symbols-outlined">flag</span></div>
              <div class="body">
                <div class="title">New membership request pending</div>
                <div class="meta">Yesterday</div>
              </div>
              <span class="tag tag-warning">review</span>
            </li>
          </ul>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { computed, onMounted, ref } from 'vue'
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})
const router = useRouter()

const totalUsers = ref<number>(0)
const totalAdmins = ref<number>(0)

const fetchStats = async () => {
  // Example queries (replace with your own schema/tables)
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
  totalUsers.value = usersCount || 0

  const { count: adminsCount } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true })
  totalAdmins.value = adminsCount || 0
}

// Static mini games data
const miniGames = ref([
  { id: 1, title: 'USB Flash Drive 1TB', status: 'Draft', player_count: 10, winner_prize: '₱50' },
  { id: 2, title: 'Wireless Mouse', status: 'Open', player_count: 7, winner_prize: '₱50' },
  {
    id: 3, title: 'SD Card 1TB', status: 'Locked', player_count: 5, winner_prize: '₱50',},
  { id: 4, title: 'Earbuds', status: 'Spun', player_count: 2, winner_prize: '₱50' },
])

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

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push({ name: 'admin.login' })
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fa;
}
/* ===========================
   Branding & tokens
   =========================== */
:root,
:host {
  --brand-green: #20a44c;
  --brand-azure: #20647c;
  --card-bg: #ffffff;
  --soft-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}
/* welcome admin text */
nav h1{
  color:#20647c;
  font-weight:700;
  letter-spacing:.2px;
  margin:0;
  position:relative;
  padding-left:12px;
}
nav h1::before{
  content:"";
  position:absolute;
  left:0; top:50%;
  transform:translateY(-50%);
  height:1.1em;
  width:3px;
  border-radius:2px;
  background:linear-gradient(180deg,#20647c,#20a44c);
  opacity:.25; /* very light */
}




/* stats card */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1;
}
.row.g-4 > .col-md-4:nth-child(1) .card {
  background-image: linear-gradient(135deg, #F6FFF9 0%, #E7FBF1 45%, #CFF6E3 100%);
  color: #000000;
}
.row.g-4 > .col-md-4:nth-child(2) .card {
  background-image: linear-gradient(135deg, #F9FFFB 0%, #EAFBF3 50%, #E8F4FF 100%);
  color: #000000;
}
.row.g-4 > .col-md-4:nth-child(3) .card {
  background-image: linear-gradient(180deg, #FFFFFF 0%, #F5FFF9 60%, #EAFBF3 100%);
  color: #000000;
}

@media (max-width: 450px) {
  nav h1 {
    font-size: 1.7rem;
  }
  .card-body {
    height: 80px;
    padding: 0px;
  }
  .activity-item {
    padding-left: 1.6rem !important;
  }
}



/* ===========================
   Mini-game card
   =========================== */
.mini-game-card {
  background: var(--card-bg);
  padding: 14px 14px 12px;
  box-shadow: var(--soft-shadow);
  border: 1px solid rgba(32, 100, 124, 0.08);
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbf9 100%);
  border-radius: 18px;
  transition:
    transform .2s ease,
    box-shadow .25s ease,
    border-color .25s ease;
}
.mini-game-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 0;
  background: linear-gradient(135deg, rgba(32,164,76,.08), rgba(32,100,124,.08));
  opacity: 0;
  transition: opacity .35s ease-in-out;
}
/* keep card content above the overlay */
.mini-game-card > * {
  position: relative;
  z-index: 1;
}
/* on hover: reveal the gradient smoothly */
.mini-game-card:hover::before {
  opacity: 1;
}
.mini-game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(32, 100, 124, 0.12);
  border-color: rgba(32, 100, 124, 0.18);
}
/* joystick icon with subtle gradient */
.mg-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-green) 85%, #fff 15%),
    color-mix(in srgb, var(--brand-azure) 85%, #fff 15%)
  );
  box-shadow: 0 6px 14px rgba(32, 100, 124, 0.22);
  font-size: 1.1rem;
}
/* ADD: thin shimmering accent that slides across the card */
.mg-accent{
  position:absolute; top:0; left:-30%;
  height:4px; width:60%;
  background: linear-gradient(90deg, transparent, rgba(32,100,124,.35), transparent);
  filter: blur(0.6px);
  animation: mgSlide 3s ease-in-out infinite;
  z-index:1;
}
@keyframes mgSlide{
  0%{ left:-30%; } 50%{ left:70%; } 100%{ left:-30%; }
}
/* metadata list */
.mg-meta li {
  padding: 0.35rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}
.mg-meta li:last-child {
  border-bottom: 0;
}
.mg-meta i {
  color: color-mix(in srgb, var(--brand-azure) 85%, black 15%);
}
/* Fill-rate progress */
.mg-progress{
  position: relative;
  background: rgba(32,100,124,.08);
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,.04);
}
.mg-progress-bar{
  height: 100%;
  width: var(--p, 0%);
  background: linear-gradient(90deg, #20a44c, #20647c);
  border-radius: inherit;
  transition: width .5s ease;
}
.mg-progress-caption{ margin-top: .35rem; }
/* status pills colors DO NOT CHANGE */
.status-pill {
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
}
.pill-draft {
  background: rgba(0,0,0,.06);
  color: #5b6770;
  border: 1px solid rgba(0,0,0,.18);
}
.pill-open {
  background: rgba(32,164,76,.12);    /* green */
  color: #20a44c;
  border: 1px solid rgba(32,164,76,.35);
}
.pill-locked {
  background: rgba(255,165,0,.12);    /* amber */
  color: #b36b00;
  border: 1px solid rgba(255,165,0,.35);
}
.pill-spun {
  background: rgba(79,70,229,.12);    /* indigo */
  color: #4f46e5;
  border: 1px solid rgba(79,70,229,.35);
}
.pill-settled {
  background: rgba(32,100,124,.12);   /* azure */
  color: #20647c;
  border: 1px solid rgba(32,100,124,.35);
}
.pill-cancelled {
  background: rgba(220,53,69,.12);    /* red */
  color: #c02232;
  border: 1px solid rgba(220,53,69,.35);
}




/* Recent Activity — card shell */
.activity-card {
  box-shadow: var(--soft-shadow);
  background: #fff;
}
/* soft pastel header */
.activity-header {
  background-image: linear-gradient(135deg, #F9FFFB 0%, #EAFBF3 50%, #E8F4FF 100%);
  border-bottom: 1px solid rgba(0,0,0,.06);
}
/* each row */
.activity-item{
  position:relative;
  display:flex; align-items:flex-start; gap:.75rem;
  padding: 14px 16px 14px 56px;
  transition: background .25s ease;
}
.activity-item:hover { background: rgba(32,100,124,.06); }
/* small icon tile */
.activity-item .icon{
  width:34px; height:34px; border-radius:10px;
  display:grid; place-items:center; flex:0 0 34px;
  background: linear-gradient(135deg, rgba(32,164,76,.12), rgba(32,100,124,.12));
  color: var(--brand-azure);
}
.activity-item .icon .material-symbols-outlined{
  font-size:20px; line-height:1;
  font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;
}
/* text */
.activity-item .meta{ font-size:.85rem; color:#6c757d; }
/* tags */
.tag{
  margin-left:auto; align-self:center;
  padding:.25rem .6rem; border-radius:999px;
  font-size:.75rem; font-weight:600;
  border:1px solid transparent;
}
.tag-success{ background: rgba(32,164,76,.12); color:#1d7e3b; border-color: rgba(32,164,76,.28); }
.tag-info   { background: rgba(32,100,124,.12); color:#20647c; border-color: rgba(32,100,124,.28); }
.tag-warning{ background: rgba(255,165,0,.12);  color:#9a6b00; border-color: rgba(255,165,0,.32); }



/* ghost brand button */
.btn-brand-ghost {
  border: 1px solid color-mix(in srgb, var(--brand-azure) 70%, #fff 30%);
  color: var(--brand-azure);
  background: transparent;
  padding: 0.25rem 0.6rem;
  border-radius: 10px;
  font-weight: 600;
}
.btn-brand-ghost:hover {
  border-color: var(--brand-azure);
  color: #fff;
  background: linear-gradient(135deg, var(--brand-azure), var(--brand-green));
}

.card h6 {
  font-size: 1rem;
}
.card p {
  font-size: 0.9rem;
}
</style>