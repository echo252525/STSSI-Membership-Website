<template>
  <div class="flash-wrap">
    <div class="progress-line" :style="{ '--pct': pct + '%' }"></div>

    <div class="flash-inner">
      <button class="nav-btn left" type="button" @click="prev" aria-label="Previous">
        <i class="bi bi-chevron-left"></i>
      </button>

      <Transition name="fade-slide" mode="out-in">
        <!-- Page shows 3 / 2 / 1 items depending on width -->
        <div class="flash-grid" :key="pageIdx">
          <article
            v-for="item in page"
            :key="item.num"
            class="flash-card"
            :class="'accent-' + item.accent"
          >
            <div class="d-grid gap-2">
              <div class="badge-num fs-2">{{ item.num }}</div>
              <div class="badge-icon fs-2"><i :class="[item.icon]"></i></div>
            </div>
            <div class="content">
              <h3 class="title">{{ item.title }}</h3>
              <p class="text-secondary mb-0">{{ item.text }}</p>
            </div>
          </article>
        </div>
      </Transition>

      <button class="nav-btn right" type="button" @click="next" aria-label="Next">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <div class="step-meta">
      <div class="dots">
        <button
          v-for="i in total"
          :key="i"
          class="dot"
          :class="{ active: i - 1 === pageIdx }"
          @click="go(i - 1)"
          :aria-label="'Go to page ' + i"
        />
      </div>
      <div class="counter small text-muted">Page {{ pageIdx + 1 }} of {{ total }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, withDefaults, defineProps, watch } from 'vue'

type Step = {
  num: string
  title: string
  text: string
  icon: string
  accent: 'red' | 'cyan' | 'orange' | 'purple' | 'violet' | 'mint'
}

const props = withDefaults(
  defineProps<{
    steps: Step[]
    /** Enable arrow keys? turn off for the 2nd stepper on the page */
    keyboard?: boolean
    /** Desktop page size; will responsively drop to 2 and 1 at breakpoints */
    groupSize?: number
    /** Toggle responsive page sizing */
    responsive?: boolean
  }>(),
  {
    keyboard: true,
    groupSize: 3,
    responsive: true,
  },
)

/* ----- responsive page size (3 / 2 / 1) ----- */
const width = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1200)
const effectiveSize = computed(() => {
  if (!props.responsive) return Math.max(1, props.groupSize || 1)
  if (width.value <= 780) return 1
  if (width.value <= 990) return 2
  return Math.max(1, props.groupSize || 3)
})

const handleResize = () => {
  width.value = window.innerWidth
}
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

/* ----- chunk steps into pages of effectiveSize ----- */
const pages = computed(() => {
  const size = effectiveSize.value
  const out: Step[][] = []
  for (let i = 0; i < props.steps.length; i += size) {
    out.push(props.steps.slice(i, i + size))
  }
  return out
})

const pageIdx = ref(0)
const page = computed(() => pages.value[pageIdx.value] ?? [])
const total = computed(() => pages.value.length)
const pct = computed(() => Math.round(((pageIdx.value + 1) / total.value) * 100))

/* keep index valid when breakpoint changes page count */
watch(pages, () => {
  if (pageIdx.value >= pages.value.length) pageIdx.value = Math.max(0, pages.value.length - 1)
})

function next() {
  pageIdx.value = (pageIdx.value + 1) % total.value
}
function prev() {
  pageIdx.value = (pageIdx.value - 1 + total.value) % total.value
}
function go(i: number) {
  pageIdx.value = i
}

const onKey = (e: KeyboardEvent) => {
  if (!props.keyboard) return
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}
onMounted(() => props.keyboard && document.addEventListener('keydown', onKey))
onUnmounted(() => props.keyboard && document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.flash-wrap {
  position: relative;
  border-radius: 16px;
  background:
    radial-gradient(900px 500px at -20% -40%, rgba(99, 102, 241, 0.06), transparent 60%),
    radial-gradient(900px 500px at 120% 140%, rgba(16, 185, 129, 0.06), transparent 60%), #fff;
  border: 1px solid #e9ecef;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
  padding: 18px;
  overflow: hidden;
}
.flash-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}
.progress-line {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: #eef2ff;
}
.progress-line::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--pct);
  background: linear-gradient(90deg, #6366f1, #10b981);
  transition: width 0.25s ease;
}

/* grid columns match the responsive page size */
.flash-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}
/* ≥ 781px → 2 columns */
@media (min-width: 781px) {
  .flash-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
/* ≥ 991px → 3 columns */
@media (min-width: 991px) {
  .flash-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.flash-card {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e9ecef;
  min-height: 350px;
}
.badge-num {
  width: 74px;
  min-width: 74px;
  height: 150px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
}
.badge-icon {
  width: 74px;
  min-width: 74px;
  height: 150px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  box-shadow:
    rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}
.title {
  margin: 2px 0 10px;
  font-size: 1rem;
  font-weight: 800;
}

/* accents */
.accent-red .badge-num {
  background: #ef4444;
}
.accent-cyan .badge-num {
  background: #06b6d4;
}
.accent-orange .badge-num {
  background: #f59e0b;
}
.accent-purple .badge-num {
  background: #a855f7;
}
.accent-violet .badge-num {
  background: #6366f1;
}
.accent-mint .badge-num {
  background: #10b981;
}

/* nav buttons */
.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffffcc;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}
.nav-btn:hover {
  background: #fff;
}
.nav-btn i {
  font-size: 1rem;
}

/* dots + counter */
.step-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.dots {
  display: flex;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #e5e7eb;
  border: 0;
}
.dot.active {
  background: #6366f1;
}

/* transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.22s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
