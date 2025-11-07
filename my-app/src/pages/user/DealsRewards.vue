<template>
  <div class="deals-shell">
    <!-- ===== PAGE SKELETON (initial) ===== -->
    <template v-if="isBooting">
      <!-- Hero skeleton -->
      <header class="deals-hero breath-in-once">
        <div class="w-100">
          <div class="skel-line w-40 mb-2"></div>
          <div class="skel-line w-25 mb-2"></div>
          <div class="skel-line w-60 sm"></div>
        </div>
        <div class="hero-stats">
          <div class="skel-pill"></div>
          <div class="skel-pill"></div>
          <div class="skel-pill"></div>
        </div>
      </header>

      <main class="deals-grid">
        <!-- LEFT skeleton -->
        <section class="deals-left">
          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-30 mb-2"></div>
                <div class="skel-line w-50 sm"></div>
              </div>
              <div class="skel-btn"></div>
            </div>

            <div class="discount-list">
              <div class="discount-card">
                <div class="discount-main">
                  <div class="skel-square"></div>
                  <div>
                    <div class="skel-line w-35 mb-2"></div>
                    <div class="skel-line w-60 sm"></div>
                    <div class="skel-line w-30 xs mt-2"></div>
                  </div>
                </div>
                <div class="discount-side">
                  <div class="skel-chip mb-1"></div>
                  <div class="skel-line w-25 xs"></div>
                </div>
              </div>

              <div class="discount-card">
                <div class="discount-main">
                  <div class="skel-square"></div>
                  <div>
                    <div class="skel-line w-45 mb-2"></div>
                    <div class="skel-line w-50 sm"></div>
                    <div class="skel-line w-20 xs mt-2"></div>
                  </div>
                </div>
                <div class="discount-side">
                  <div class="skel-chip mb-1"></div>
                  <div class="skel-line w-25 xs"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-36 mb-2"></div>
                <div class="skel-line w-56 sm"></div>
              </div>
            </div>
            <div class="product-discount-grid">
              <div class="product-discount-card">
                <div class="pd-top">
                  <div class="skel-chip"></div>
                  <div class="skel-chip"></div>
                </div>
                <div class="skel-line w-60 mb-2"></div>
                <div class="skel-line w-70 sm mb-2"></div>
                <div class="skel-line w-40 xs"></div>
                <div class="pd-footer mt-2">
                  <div class="skel-chip"></div>
                  <div class="skel-btn small"></div>
                </div>
              </div>

              <div class="product-discount-card">
                <div class="pd-top">
                  <div class="skel-chip"></div>
                  <div class="skel-chip"></div>
                </div>
                <div class="skel-line w-50 mb-2"></div>
                <div class="skel-line w-65 sm mb-2"></div>
                <div class="skel-line w-35 xs"></div>
                <div class="pd-footer mt-2">
                  <div class="skel-chip"></div>
                  <div class="skel-btn small"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT skeleton -->
        <section class="deals-right">
          <div class="panel sticky-panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-40 mb-2"></div>
                <div class="skel-line w-55 sm"></div>
              </div>
            </div>

            <div class="affiliate-box">
              <div class="skel-line w-30 sm mb-2"></div>
              <div class="aff-input-wrap">
                <div class="skel-line w-100 sm"></div>
                <div class="skel-btn small"></div>
              </div>
              <div class="skel-line w-50 xs mt-2"></div>
            </div>

            <div class="aff-metrics">
              <div class="metric-card">
                <div class="skel-line w-40 xs mb-2"></div>
                <div class="skel-line w-30"></div>
              </div>
              <div class="metric-card">
                <div class="skel-line w-50 xs mb-2"></div>
                <div class="skel-line w-30"></div>
              </div>
              <div class="metric-card">
                <div class="skel-line w-45 xs mb-2"></div>
                <div class="skel-line w-35"></div>
              </div>
            </div>
          </div>

          <div class="panel breath-in-once">
            <div class="panel-head">
              <div>
                <div class="skel-line w-36 mb-2"></div>
                <div class="skel-line w-45 sm"></div>
              </div>
              <div class="skel-chip"></div>
            </div>

            <ul class="ref-list">
              <li class="ref-item">
                <div class="ref-left">
                  <div class="skel-avatar"></div>
                  <div>
                    <div class="skel-line w-40 mb-1"></div>
                    <div class="skel-line w-25 xs"></div>
                    <div class="ref-progress mt-2">
                      <div class="ref-progress-bar">
                        <div class="ref-progress-fill" style="width: 40%; opacity: .25"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ref-right">
                  <div class="skel-line w-20 mb-1"></div>
                  <div class="skel-line w-30 xs"></div>
                </div>
              </li>

              <li class="ref-item">
                <div class="ref-left">
                  <div class="skel-avatar"></div>
                  <div>
                    <div class="skel-line w-50 mb-1"></div>
                    <div class="skel-line w-30 xs"></div>
                    <div class="ref-progress mt-2">
                      <div class="ref-progress-bar">
                        <div class="ref-progress-fill" style="width: 60%; opacity: .25"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ref-right">
                  <div class="skel-line w-24 mb-1"></div>
                  <div class="skel-line w-34 xs"></div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </template>

    <!-- ===== REAL PAGE ===== -->
    <template v-else>
      <!-- ===== Hero / Top bar ===== -->
      <header class="deals-hero breath-in-once">
        <div>
          <p class="hero-eyebrow">Rewards center</p>
          <h1 class="hero-title">Deals & Rewards</h1>
          <p class="hero-sub">
            Your active vouchers, product-specific promos, and referral earnings — all in one clean
            view.
          </p>
        </div>
        <div class="hero-stats">
          <div class="hero-pill">
            <span class="hero-pill-label">Active discounts</span>
            <span class="hero-pill-value">{{ discounts.length }}</span>
          </div>
          <div class="hero-pill">
            <span class="hero-pill-label">Product-only</span>
            <span class="hero-pill-value">{{ productDiscounts.length }}</span>
          </div>
          <div class="hero-pill">
            <span class="hero-pill-label">Referees</span>
            <span class="hero-pill-value">{{ referees.length }}</span>
          </div>
        </div>
      </header>

      <main class="deals-grid">
        <!-- ================= LEFT: Discounts ================= -->
        <section class="deals-left">
          <!-- ORDER-LEVEL DISCOUNTS -->
          <div class="panel breath-in-once border border-primary-subtle">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Universal Deals</h2>
                <p class="panel-sub">Sitewide offers you can auto-apply or redeem with a code.</p>
              </div>
            </div>

            <div v-if="busy" class="empty-state">
              <div class="spinner-border mb-2"></div>
              <p class="empty-title">Loading discounts…</p>
              <p class="empty-text">Please wait while we pull your available rewards.</p>
            </div>

            <div v-else-if="discounts.length === 0" class="empty-state">
              <i class="bi bi-ticket-perforated empty-icon"></i>
              <p class="empty-title">No active order discounts right now.</p>
              <p class="empty-text">When we drop a store-wide promo, it’ll show up here.</p>
            </div>

            <div v-else class="discount-list">
              <article
                v-for="d in discounts"
                :key="d.id"
                class="discount-card shopeeish"
                :data-type="d.type || 'percent'"
                @click="openDiscount(d)"
              >
                <div class="discount-main">
                  <div class="d-flex justify-content-between">
                    <p v-if="d.code" class="discount-code">{{ d.code }}</p>
                    <button
                      class="cta-btn"
                      @click.stop="goToShop(d)"
                      :disabled="exceededUserLimit(d)"
                      :aria-disabled="exceededUserLimit(d)"
                    >
                      {{ exceededUserLimit(d) ? 'Used' : 'Use' }}
                    </button>          
                  </div>
                  <div>
                    <h3 class="discount-title">{{ d.title }}</h3>
                    <p class="discount-value">{{ headline(d) }}</p>
                    <p class="discount-desc">
                      <template v-if="minSubtotalText(d)">{{ minSubtotalText(d) }}</template>
                      <br></br>
                      <template v-if="capText(d)">{{ capText(d) }}</template>
                    </p>
                    <p class="discount-exp">Expiring: {{ expiryLabel(d) }}</p>
                    <p
                      v-if="typeof d.max_uses_per_user === 'number'"
                      class="discount-usage text-secondary fs-6"
                      :class="{ 'text-danger': exceededUserLimit(d) }"
                    >
                      Used {{ userUseCount(d.id) }}/{{ d.max_uses_per_user }}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- PRODUCT-SPECIFIC DISCOUNTS -->
          <div class="panel breath-in-once pd-panel border border-warning-subtle" v-if="productDiscounts.length > 0">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Product-Only Discounts</h2>
                <p class="panel-sub">
                  Can only be applied to a certain product.
                </p>
              </div>
            </div>

            <div class="product-discount-grid">
              <article
                v-for="d in productDiscounts"
                :key="d.id"
                class="product-discount-card shopeeish"
                :data-type="d.type || 'percent'"
                @click="openDiscount(d)"
              >
                <div class="pd-top">
                  <span class="pd-type" v-if="d.type === 'free_shipping'">Free Shipping</span>
                  <span class="pd-type" v-else-if="d.type === 'fixed_amount'">
                    ₱{{ money(d.amount_off ?? 0) }} OFF
                  </span>
                  <span class="pd-type" v-else-if="d.type === 'percent' && d.max_discount_amount != null">
                    Up to ₱{{ money(d.max_discount_amount) }} OFF
                  </span>
                  <span class="pd-type" v-else>Special discount</span>
                </div>

                <div class="pd-thumb-wrap" v-if="d.product_img_url">
                  <img
                    :src="d.product_img_url"
                    :alt="d.product_name || shortProductId(d.product_id)"
                    class="pd-thumb"
                    referrerpolicy="no-referrer"
                  />
                </div>

                <h3 class="pd-title m-0 mt-2 fw-bold">{{ d.title }}</h3>
                <p class="pd-product-label">
                  <template v-if="minSubtotalText(d)">{{ minSubtotalText(d) }}</template>
                  <br></br>
                  <template v-if="capText(d)">{{ capText(d) }}</template>
                </p>
                <p class="pd-meta" style="font-size: 0.9rem;">Expiring: {{ expiryLabel(d) }}</p>
                <p
                  v-if="typeof d.max_uses_per_user === 'number'"
                  class="pd-usage"
                  style="font-size: 0.9rem;"
                  :class="{ 'text-danger': exceededUserLimit(d) }"
                  >
                    Used {{ userUseCount(d.id) }}/{{ d.max_uses_per_user }}
                </p>

                <div class="pd-footer">
                  <p v-if="d.code" class="pd-code">{{ d.code }}</p>
                  <button
                    class="mini-btn orange"
                    @click.stop="goToShop(d)"
                    :disabled="exceededUserLimit(d)"
                    :aria-disabled="exceededUserLimit(d)"
                  >
                    {{ exceededUserLimit(d) ? 'Used' : 'Use' }}
                  </button>
                </div>
              </article>
            </div>
          </div>

          <!-- UPCOMING DISCOUNTS -->
          <div class="panel breath-in-once border border border-secondary-subtle"
            v-if="upcomingOrderDiscounts.length || upcomingProductDiscounts.length"
          >
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Upcoming Discounts</h2>
                <p class="panel-sub">
                  Scheduled promos that will go live soon.
                </p>
              </div>
            </div>

            <!-- Upcoming Order/Cart -->
            <template v-if="upcomingOrderDiscounts.length">
              <h3
                class="panel-sub mb-2"
                style="font-weight:600;color:#0f172a;font-size:.95rem;"
              >
                Universal Deals
              </h3>
              <div class="discount-list">
                <article
                  v-for="d in upcomingOrderDiscounts"
                  :key="d.id"
                  class="discount-card shopeeish"
                  :data-type="d.type || 'percent'"
                  @click="openDiscount(d)"
                >
                  <div class="discount-main">
                    <div class="discount-badge" :class="d.type">
                      <i v-if="d.type === 'free_shipping'" class="bi bi-truck"></i>
                      <i v-else class="bi bi-ticket-perforated"></i>
                    </div>
                    <div>
                      <h3 class="discount-title">{{ d.title }}</h3>
                      <p class="discount-value">{{ headline(d) }}</p>
                      <p class="discount-desc">
                        <template v-if="minSubtotalText(d)">{{ minSubtotalText(d) }}</template>
                        <template v-if="capText(d)">
                          <span v-if="minSubtotalText(d)"> • </span>{{ capText(d) }}
                        </template>
                      </p>
                      <p class="discount-exp">Starts {{ startLabel(d) }}</p>
                    </div>
                  </div>

                  <div class="discount-side align-items-center">
                    <p v-if="d.code" class="discount-code">{{ d.code }}</p>
                    <button class="cta-btn orange ms-3" disabled aria-disabled="true">Soon</button>
                  </div>
                </article>
              </div>
            </template>

            <!-- Upcoming Product-Specific -->
            <template v-if="upcomingProductDiscounts.length">
              <h3
                class="panel-sub mb-2 mt-4"
                style="font-weight:600;color:#0f172a;font-size:.95rem; margin-top:.75rem;"
              >
                Product-Only Discounts
              </h3>
              <div class="product-discount-grid pd-grid-scroll">
                <article
                  v-for="d in upcomingProductDiscounts"
                  :key="d.id"
                  class="product-discount-card shopeeish"
                  :data-type="d.type || 'percent'"
                  @click="openDiscount(d)"
                >
                  <div class="pd-top">
                    <span class="pd-type" v-if="d.type === 'free_shipping'">Free Shipping</span>
                    <span class="pd-type" v-else-if="d.type === 'fixed_amount'">
                      ₱{{ money(d.amount_off ?? 0) }} OFF
                    </span>
                    <span class="pd-type" v-else-if="d.type === 'percent' && d.max_discount_amount != null">
                      Up to ₱{{ money(d.max_discount_amount) }} OFF
                    </span>
                    <span class="pd-type" v-else>Special discount</span>
                  </div>

                  <div class="pd-thumb-wrap" v-if="d.product_img_url">
                    <img
                      :src="d.product_img_url"
                      :alt="d.product_name || shortProductId(d.product_id)"
                      class="pd-thumb"
                      referrerpolicy="no-referrer"
                    />
                  </div>

                  <h3 class="pd-title mt-2">{{ d.title }}</h3>
                  <p class="pd-product-label">
                    <template v-if="minSubtotalText(d)">{{ minSubtotalText(d) }}</template>
                    <br></br>
                    <template v-if="capText(d)">{{ capText(d) }}</template>
                  </p>
                  <p class="pd-meta">Starts {{ startLabel(d) }}</p>

                  <div class="pd-footer">
                    <p v-if="d.code" class="pd-code">{{ d.code }}</p>
                    <button class="mini-btn orange" disabled aria-disabled="true">Soon</button>
                  </div>
                </article>
              </div>
            </template>
          </div>
        </section>

        <!-- ================= RIGHT: Affiliate & Network ================= -->
        <section class="deals-right">
          <!-- Affiliate -->
          <div class="panel breath-in-once border border-info-subtle">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Affiliate & Referrals</h2>
                <p class="panel-sub">Share your link and earn commission on converted sales.</p>
              </div>
            </div>

            <div class="affiliate-box">
              <label class="aff-label">Your referral link</label>
              <div class="aff-input-wrap">
                <input :value="affiliateUrl || 'Unavailable'" readonly class="aff-input" />
                <button class="mini-btn" @click="copyAffiliate" :disabled="!affiliateUrl">
                  <i class="bi bi-clipboard"></i>
                  Copy
                </button>
              </div>
              <p class="aff-hint">
                New signups through this link will appear in your network list below.
              </p>
            </div>

            <div class="aff-metrics">
              <div class="metric-card">
                <p class="metric-label">Total Referrals</p>
                <p class="metric-value">{{ referralStats.total }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">Converted Sales</p>
                <p class="metric-value">{{ referralStats.converted }}</p>
              </div>
              <div class="metric-card">
                <p class="metric-label">Commission</p>
                <p class="metric-value">₱ {{ money(referralStats.commission) }}</p>
              </div>
            </div>
          </div>

          <!-- Referees list -->
          <div class="panel breath-in-once border border-info-subtle">
            <div class="panel-head">
              <div>
                <h2 class="panel-title">Your Network</h2>
                <p class="panel-sub">People who joined using your link.</p>
              </div>
              <span class="tag">{{ referees.length }} total</span>
            </div>

            <div v-if="busyReferees" class="empty-state">
              <div class="spinner-border mb-2"></div>
              <p class="empty-title">Loading referees…</p>
              <p class="empty-text">Give us a second to fetch your network.</p>
            </div>

            <div v-else-if="referees.length === 0" class="empty-state">
              <i class="bi bi-person-plus empty-icon"></i>
              <p class="empty-title">No referees yet.</p>
              <p class="empty-text">Share your link to start building your downline.</p>
            </div>

            <ul v-else class="ref-list">
              <li v-for="r in referees" :key="r.id" class="ref-item">
                <div class="ref-left">
                  <img
                    :src="r.avatar_url || defaultAvatar"
                    class="ref-avatar"
                    alt=""
                    referrerpolicy="no-referrer"
                  />
                  <div>
                    <p class="ref-name">{{ r.full_name || 'Unnamed User' }}</p>
                    <p class="ref-sub">Joined via your link</p>
                    <div v-if="goalPerRef != null" class="ref-progress">
                      <div class="ref-progress-head">
                        <span>Progress</span>
                        <span class="ref-progress-val">
                          ₱{{ r.purchasesThisMonth.count }} / ₱{{ goalPerRef }}
                        </span>
                      </div>
                      <div class="ref-progress-bar">
                        <div class="ref-progress-fill" :style="{ width: progressPct(r) }"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ref-right">
                  <p class="ref-amount">₱ {{ r.purchasesThisMonth.count }}</p>
                  <p
                    v-if="r.purchasesThisMonth.totalAmount != null"
                    class="ref-amount-sub"
                  >₱ {{ money(r.purchasesThisMonth.totalAmount) }} total</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </template>

    <!-- ===================== DETAILS MODAL ===================== -->
    <div v-if="showDiscountModal" class="dm-overlay" @click.self="closeDiscount">
      <div class="dm-wrap" role="dialog" aria-modal="true" aria-label="Discount details">
        <button class="dm-x" @click="closeDiscount" aria-label="Close">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="dm-header">
          <div class="dm-badge" :class="activeDiscount?.type">
            <i v-if="activeDiscount?.type === 'free_shipping'" class="bi bi-truck"></i>
            <i v-else class="bi bi-ticket-perforated"></i>
          </div>
          <div class="dm-titles">
            <h3 class="dm-title">{{ activeDiscount?.title }}</h3>
          </div>
        </div>

        <div class="dm-body">
          <div class="dm-row highlight">
            <div class="dm-col">
              <p class="dm-label">Deal</p>
              <p class="dm-strong p-0 m-0">{{ headline(activeDiscount!) }}</p>
            </div>
            <div class="dm-col">
              <p class="dm-label">Min. Subtotal</p>
              <p class="dm-strong p-0 m-0">
                <template v-if="activeDiscount?.min_subtotal && Number(activeDiscount.min_subtotal) > 0">
                  ₱{{ money(activeDiscount!.min_subtotal) }}
                </template>
                <template v-else>None</template>
              </p>
            </div>
          </div>

          <!-- Cap + Code -->
          <div class="dm-row">
            <div class="dm-col" v-if="capText(activeDiscount!)">
              <p class="dm-label">Max Cap</p>
              <p class="dm-strong">₱{{ money(activeDiscount!.max_discount_amount) }}</p>
            </div>
            <div class="dm-col">
              <p class="dm-label">Voucher Code</p>
              <div class="dm-code-line" v-if="activeDiscount?.code">
                <code class="dm-code">{{ activeDiscount!.code }}</code>
                <button class="mini-btn orange" @click="copyDiscountCodeLocal">
                  <i class="bi bi-clipboard"></i> Copy
                </button>
              </div>
              <p v-else class="dm-muted">No code required</p>
            </div>
          </div>

          <!-- Scope + Stacking -->
          <div class="dm-row">
            <div class="dm-col">
              <p class="dm-label">Scope</p>
              <p class="dm-strong">
                <template v-if="activeDiscount?.product_id">Product only</template>
                <template v-else>Store-wide</template>
              </p>
              <p class="dm-note" v-if="activeDiscount?.product_name">
                Applies to: <strong>{{ activeDiscount!.product_name }}</strong>
              </p>
            </div>
            <div class="dm-col">
              <p class="dm-label">Stacking</p>
              <p class="dm-strong p-0 m-0">{{ stackText(activeDiscount!) }}</p>
              <p class="dm-note p-0 m-0">Whether this can be combined with other vouchers.</p>
            </div>
          </div>

          <!-- Validity -->
          <div class="dm-row">
            <div class="dm-col">
              <p class="dm-label">Starts</p>
              <p class="dm-strong">{{ prettyDT(activeDiscount?.starts_at) || '—' }}</p>
            </div>
            <div class="dm-col">
              <p class="dm-label">Expires</p>
              <p class="dm-strong">{{ prettyDT(activeDiscount?.expires_at) || 'No expiry' }}</p>
            </div>
          </div>

          <!-- Usage limit (per-user only, friendly) -->
          <div class="dm-row" v-if="typeof activeDiscount?.max_uses_per_user === 'number'">
            <div class="dm-col">
              <p class="dm-label">Per-User Limit</p>
              <p class="dm-strong p-0 m-0">{{ activeDiscount!.max_uses_per_user }} use{{ activeDiscount!.max_uses_per_user === 1 ? '' : 's' }} per user</p>
              <p class="dm-note p-0 m-0">You’ve used this {{ userUseCount(activeDiscount!.id) }} time(s).</p>
            </div>
            <div class="dm-col"></div>
          </div>
        </div>

        <div class="dm-footer">
          <button class="mini-btn light" @click="closeDiscount">Close</button>
          <button
            class="mini-btn orange"
            :disabled="exceededUserLimit(activeDiscount!)"
            @click="goToShop(activeDiscount!); closeDiscount()"
          >
            {{ exceededUserLimit(activeDiscount!) ? 'Limit reached' : 'Use this deal' }}
          </button>
        </div>
      </div>
    </div>
    <!-- =================== /DETAILS MODAL =================== -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useRoute } from 'vue-router' // ← added useRoute
import { currentUser } from '@/lib/authState'
import { nextTick, watch } from 'vue'

const router = useRouter()
const route = useRoute() // ← added
const user = computed(() => currentUser.value)

/** NEW: initial page skeleton flag */
const isBooting = ref(true)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
  await loadAll()

  // NEW: try open from ?focus=<discountId> after data load
  tryOpenFromQuery()

  // keep skeleton just a beat for nicer perception
  setTimeout(() => (isBooting.value = false), 350)
})

type Discount = {
  id: string
  label?: string | null
  amount_off?: number | null
  percent_off?: number | null
  product_name?: string | null
  product_id?: string | null
  expires_at?: string | null

  title?: string | null
  description?: string | null
  code?: string | null
  type?: 'percent' | 'fixed_amount' | 'free_shipping' | null
  starts_at?: string | null
  status?: 'draft' | 'active' | 'disabled' | 'scheduled' | null
  is_public?: boolean | null
  max_uses_per_user?: number | null

  /* From schema */
  scope?: 'order' | 'product' | null
  stack?: 'exclusive' | 'stackable' | null
  min_subtotal?: number | null
  max_discount_amount?: number | null
  redemptions_count?: number | null /* hidden to users */
  max_uses_global?: number | null   /* hidden to users */

  /* UI-only */
  brand_label?: string | null
  tag?: string | null

  /* NEW: signed product image url */
  product_img_url?: string | null
}

type GiftCert = {
  id: string
  code: string
  amount: number
  redeemed: boolean
}

const busy = ref(false)
const discounts = ref<Discount[]>([])
const productDiscounts = ref<Discount[]>([])
/* NEW arrays for scheduled */
const upcomingOrderDiscounts = ref<Discount[]>([])
const upcomingProductDiscounts = ref<Discount[]>([])

const gcs = ref<GiftCert[]>([])
const affiliateUrl = ref<string | null>(null)
const referralStats = ref({ total: 0, converted: 0, commission: 0 })
const userRedemptions = ref<Record<string, number>>({})

const goalPerRef = ref<number | null>(null)

/* ===== Shopper-friendly helpers ===== */
function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}
function headline(d: Discount) {
  if (!d) return 'Discount'
  if (d.type === 'fixed_amount') return `₱${money(d.amount_off)} OFF`
  if (d.type === 'percent') {
    if (d.max_discount_amount != null) return `Up to ₱${money(d.max_discount_amount)} OFF`
    return 'Special discount'
  }
  if (d.type === 'free_shipping') return 'Free Shipping'
  return 'Discount'
}
function capText(d: Discount) {
  return d?.type === 'percent' && d?.max_discount_amount != null
    ? `Capped at ₱${money(d.max_discount_amount)}`
    : null
}
function minSubtotalText(d: Discount) {
  const val = Number(d?.min_subtotal ?? 0)
  return val > 0 ? `Min. Spend ₱${money(val)}` : null
}
function stackText(d: Discount) {
  const s = (d?.stack || '').toLowerCase()
  if (s === 'stackable') return 'Stackable'
  if (s === 'exclusive') return 'Exclusive'
  return '—'
}
function prettyDT(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function expiryLabel(d: Discount) {
  if (!d.expires_at) return 'No expiry'
  const end = new Date(d.expires_at).getTime()
  if (!isFinite(end)) return 'No expiry'
  const ms = end - Date.now()
  if (ms <= 0) return 'Expired'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`
  const mins = Math.max(1, Math.floor(ms / (1000 * 60)))
  return `${mins} min left`
}
/* NEW: start label for scheduled discounts */
function startLabel(d: Discount) {
  if (!d.starts_at) return 'soon'
  const start = new Date(d.starts_at).getTime()
  if (!isFinite(start)) return 'soon'
  const ms = start - Date.now()
  if (ms <= 0) return 'now'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
  const mins = Math.max(1, Math.floor(ms / (1000 * 60)))
  return `in ${mins} min`
}

/* === REFERRALS === */
function buildAffiliateUrl(code: string | null | undefined) {
  if (!code) return null
  const origin = window?.location?.origin ?? ''
  return `${origin}/signup?ref=${encodeURIComponent(code)}`
}

async function loadReferralBits(uid: string) {
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', uid)
    .maybeSingle()

  if (meErr) console.warn('users.referral_code load error:', meErr)
  const code = (me?.referral_code as string | null) ?? null
  affiliateUrl.value = buildAffiliateUrl(code)

  let total = 0
  const { data: vData, error: vErr } = await supabase
    .from('referral_stats')
    .select('referrals_count, referral_code')
    .eq('referrer_id', uid)
    .maybeSingle()

  if (!vErr && vData) {
    total = Number(vData.referrals_count ?? 0)
  } else {
    const { count, error: cErr } = await supabase
      .from('referrals')
      .select('referee_id', { count: 'exact', head: true })
      .eq('referrer_id', uid)
    if (cErr) console.warn('referrals count error:', cErr)
    total = Number(count ?? 0)
  }

  referralStats.value = { total, converted: 0, commission: 0 }
}

/* === DISCOUNTS === */
async function loadActiveDiscounts() {
  const nowIso = new Date().toISOString()
  const selectCols =
    'id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,max_uses_per_user,product_id,scope,stack,min_subtotal,max_discount_amount'

  const orderPromise = supabase
    .schema('rewards')
    .from('discounts')
    .select(selectCols)
    .eq('is_public', true)
    .eq('status', 'active')
    .is('product_id', null)
    .lte('starts_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('starts_at', { ascending: false })

  const productPromise = supabase
    .schema('rewards')
    .from('discounts')
    .select(selectCols)
    .eq('is_public', true)
    .eq('status', 'active')
    .not('product_id', 'is', null)
    .lte('starts_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('starts_at', { ascending: false })

  /* NEW: scheduled (upcoming) */
  const upcomingOrderPromise = supabase
    .schema('rewards')
    .from('discounts')
    .select(selectCols)
    .eq('is_public', true)
    .eq('status', 'scheduled')
    .is('product_id', null)
    .order('starts_at', { ascending: true, nullsFirst: false })

  const upcomingProdPromise = supabase
    .schema('rewards')
    .from('discounts')
    .select(selectCols)
    .eq('is_public', true)
    .eq('status', 'scheduled')
    .not('product_id', 'is', null)
    .order('starts_at', { ascending: true, nullsFirst: false })

  const [
    { data: orderData, error: orderErr },
    { data: prodData, error: prodErr },
    { data: upOrder, error: upOrderErr },
    { data: upProd, error: upProdErr },
  ] = await Promise.all([orderPromise, productPromise, upcomingOrderPromise, upcomingProdPromise])

  if (orderErr) {
    console.warn('loadActiveDiscounts (order-level) error:', orderErr)
    discounts.value = []
  } else {
    discounts.value = (orderData || []) as Discount[]
  }

  if (prodErr) {
    console.warn('loadActiveDiscounts (product-level) error:', prodErr)
    productDiscounts.value = []
  } else {
    productDiscounts.value = (prodData || []) as Discount[]
  }

  /* NEW set upcoming arrays */
  if (upOrderErr) {
    console.warn('loadUpcomingDiscounts (order-level) error:', upOrderErr)
    upcomingOrderDiscounts.value = []
  } else {
    upcomingOrderDiscounts.value = (upOrder || []) as Discount[]
  }

  if (upProdErr) {
    console.warn('loadUpcomingDiscounts (product-level) error:', upProdErr)
    upcomingProductDiscounts.value = []
  } else {
    upcomingProductDiscounts.value = (upProd || []) as Discount[]
  }

  // Enrich product-specific discounts with product name + FIRST image (signed)
  const ids = productDiscounts.value
    .map(d => d.product_id)
    .filter((x): x is string => !!x)

  if (ids.length > 0) {
    // Pull name + product_url from games.products
    const { data: products, error: prodLoadErr } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,product_url')
      .in('id', ids)

    if (prodLoadErr) {
      console.warn('games.products load error:', prodLoadErr)
    } else {
      const nameById: Record<string, string> = {}
      const firstPathById: Record<string, string | null> = {}

      for (const p of products || []) {
        const pid = (p as any).id as string
        const pname = (p as any).name as string
        const purl = (p as any).product_url
        nameById[pid] = pname

        const first = firstPathFromProductUrl(purl)
        firstPathById[pid] = first
      }

      // assign names first
      for (const d of productDiscounts.value) {
        if (d.product_id && nameById[d.product_id]) {
          d.product_name = nameById[d.product_id]
        }
      }

      // sign all available first paths
      const tasks: Promise<void>[] = []
      for (const d of productDiscounts.value) {
        const pId = d.product_id
        const first = pId ? firstPathById[pId] : null
        if (first) {
          tasks.push(
            signedUrlWithCB(PRIZE_BUCKET, first).then(url => {
              d.product_img_url = url
            }),
          )
        } else {
          d.product_img_url = null
        }
      }
      await Promise.all(tasks)
    }
  }

  /* NEW: enrich upcoming product-specific in the same way */
  await enrichProductDiscounts(upcomingProductDiscounts.value)
}

/* === helper: coerce first path from product_url (array or string) === */
function firstPathFromProductUrl(val: unknown): string | null {
  if (!val) return null
  if (Array.isArray(val)) {
    const first = (val as any[]).find(v => typeof v === 'string' && v.trim() !== '')
    return (first as string) || null
  }
  if (typeof val === 'string' && val.trim() !== '') return val
  return null
}

/* === USER REDEMPTIONS === */
async function loadUserRedemptions(uid: string) {
  try {
    const { data, error } = await supabase
      .schema('rewards')
      .from('discount_redemptions')
      .select('discount_id')
      .eq('user_id', uid)

    if (error) {
      console.warn('loadUserRedemptions error:', error)
      userRedemptions.value = {}
      return
    }

    const counts: Record<string, number> = {}
    for (const row of data || []) {
      const did = (row as { discount_id: string }).discount_id
      counts[did] = (counts[did] ?? 0) + 1
    }
    userRedemptions.value = counts
  } catch (e) {
    console.warn('loadUserRedemptions exception:', e)
    userRedemptions.value = {}
  }
}

function userUseCount(discountId: string) {
  return userRedemptions.value[discountId] ?? 0
}
function exceededUserLimit(d: Discount) {
  if (!d || d.max_uses_per_user == null) return false
  const used = userUseCount(d.id)
  return used >= d.max_uses_per_user
}
function goToShop(d: Discount) {
  if (d.code) router.push({ name: 'user.shop', query: { code: d.code } })
  else router.push({ name: 'user.shop' })
}
function shortProductId(id?: string | null) {
  if (!id) return 'Unknown Product'
  return id.slice(0, 8) + '…'
}

/* === MODAL STATE === */
const showDiscountModal = ref(false)
const activeDiscount = ref<Discount | null>(null)
function openDiscount(d: Discount) {
  activeDiscount.value = d
  showDiscountModal.value = true
  // lock scroll (shoee vibe)
  document.documentElement.style.overflow = 'hidden'
}
function closeDiscount() {
  showDiscountModal.value = false
  activeDiscount.value = null
  document.documentElement.style.overflow = ''
}
async function copyDiscountCodeLocal() {
  if (!activeDiscount.value?.code) return
  try {
    await navigator.clipboard.writeText(activeDiscount.value.code)
    // subtle toast
    // no external dependency—just a quick native feel:
    alert('Voucher code copied!')
  } catch {}
}

/* ========= NEW: Deep-link focus handling ========= */
const pendingFocusId = ref<string | null>(null)

function findDiscountById(id: string): Discount | null {
  return (
    discounts.value.find(d => d.id === id) ||
    productDiscounts.value.find(d => d.id === id) ||
    upcomingOrderDiscounts.value.find(d => d.id === id) ||
    upcomingProductDiscounts.value.find(d => d.id === id) ||
    null
  )
}

function resolveFocus() {
  if (!pendingFocusId.value || showDiscountModal.value) return
  const hit = findDiscountById(pendingFocusId.value)
  if (hit) {
    openDiscount(hit)
    pendingFocusId.value = null
  }
}

function tryOpenFromQuery() {
  const raw = route.query?.focus
  if (typeof raw === 'string' && raw.trim() !== '') {
    pendingFocusId.value = decodeURIComponent(raw.trim())
    resolveFocus()
  }
}

/* React when lists load/refresh */
watch(
  [discounts, productDiscounts, upcomingOrderDiscounts, upcomingProductDiscounts],
  () => resolveFocus()
)

/* React to URL changes like /app/deals?focus=<id> */
watch(
  () => route.query.focus,
  () => tryOpenFromQuery()
)
/* ===== END new deep-link section ===== */

/* === REFEES === */
type RefereeRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  purchasesThisMonth: { count: number; totalAmount: number | null }
}
const PROFILE_BUCKET = 'user_profile'
const referees = ref<RefereeRow[]>([])
const busyReferees = ref(false)
const defaultAvatar = '/default-avatar.png'

const signedUrlCache = new Map<string, string>()
const SIGNED_URL_EXPIRES_IN = 60 * 60

async function buildProfileSignedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null
  if (signedUrlCache.has(path)) return signedUrlCache.get(path) as string
  try {
    const { data, error } = await supabase.storage
      .from(PROFILE_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN)

    if (error) {
      console.warn('createSignedUrl error:', error)
      const pub = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path)?.data?.publicUrl ?? null
      signedUrlCache.set(path, pub || '')
      return pub
    }
    const url = data?.signedUrl || null
    signedUrlCache.set(path, url || '')
    return url
  } catch (e) {
    console.warn('buildProfileSignedUrl exception:', e)
    const pub = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path)?.data?.publicUrl ?? null
    signedUrlCache.set(path, pub || '')
    return pub
  }
}

async function loadGoalPerRef(uid: string) {
  const { data: u, error: uErr } = await supabase
    .from('users')
    .select('membership_id')
    .eq('id', uid)
    .maybeSingle()

  if (uErr) {
    console.warn('users.membership_id load error:', uErr)
    goalPerRef.value = null
    return
  }

  const membershipId = (u?.membership_id as string | number | null) ?? null
  if (!membershipId) {
    goalPerRef.value = null
    return
  }

  const { data: tier, error: tErr } = await supabase
    .schema('membership')
    .from('tiers')
    .select('id, purchases_per_referrals')
    .eq('id', membershipId)
    .maybeSingle()

  if (tErr) {
    console.warn('membership.tiers load error:', tErr)
    goalPerRef.value = null
    return
  }

  const val = Number(tier?.purchases_per_referrals ?? 0)
  goalPerRef.value = Number.isFinite(val) && val > 0 ? val : 0
}

async function loadReferees(uid: string) {
  busyReferees.value = true
  try {
    const { data: refRows, error: refErr } = await supabase
      .from('referrals')
      .select('referee_id')
      .eq('referrer_id', uid)

    if (refErr) {
      console.warn('loadReferees referrals error:', refErr)
      referees.value = []
      return
    }

    const ids = (refRows || []).map(r => (r as { referee_id: string }).referee_id)
    if (ids.length === 0) {
      referees.value = []
      return
    }

    const { data: usersData, error: usersErr } = await supabase
      .from('users')
      .select('id, full_name, profile_url, purchases_per_month')
      .in('id', ids)

    if (usersErr) {
      console.warn('loadReferees users error:', usersErr)
      referees.value = []
      return
    }

    const rows = (usersData || []) as Array<{
      id: string
      full_name: string | null
      profile_url: string | null
      purchases_per_month: number | null
    }>

    const avatarUrls = await Promise.all(rows.map(u => buildProfileSignedUrl(u.profile_url)))

    referees.value = rows.map((u, i) => {
      const purchases_per_month = Number(u.purchases_per_month ?? 0) || 0
      return {
        id: u.id,
        full_name: u.full_name ?? null,
        avatar_url: avatarUrls[i] || null,
        purchasesThisMonth: {
          count: purchases_per_month,
          totalAmount: null,
        },
      } as RefereeRow
    })
  } finally {
    busyReferees.value = false
  }
}

function pctNumber(r: RefereeRow): number {
  if (goalPerRef.value == null || goalPerRef.value <= 0) return 0
  const pct = (r.purchasesThisMonth.count / goalPerRef.value) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}
function progressPct(r: RefereeRow): string {
  return `${pctNumber(r)}%`
}

async function loadAll() {
  busy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()

    await loadActiveDiscounts()
    gcs.value = []

    const uid = auth?.user?.id
    if (uid) {
      await Promise.all([
        loadReferralBits(uid),
        loadUserRedemptions(uid),
        loadGoalPerRef(uid),
        loadReferees(uid),
      ])
    } else {
      affiliateUrl.value = null
      referralStats.value = { total: 0, converted: 0, commission: 0 }
      userRedemptions.value = {}
      referees.value = []
      goalPerRef.value = null
    }
  } finally {
    busy.value = false
  }
}

async function reload() {
  await loadAll()
}

async function copyAffiliate() {
  if (!affiliateUrl.value) return
  try {
    await navigator.clipboard.writeText(affiliateUrl.value)
    alert('Affiliate link copied!')
  } catch {
    prompt('Copy your affiliate link:', affiliateUrl.value)
  }
}

/* ================= IMAGE FETCHING PIPELINE ================= */
const PRIZE_BUCKET = 'prize_product'
const PRIZE_ROOT = 'products'

function isImageByName(name: string | undefined | null) {
  if (!name) return false
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(name)
}
async function firstImagePathForProduct(productId: string): Promise<string | null> {
  try {
    const dir = `${PRIZE_ROOT}/${productId}`
    const { data: files, error: listErr } = await supabase.storage
      .from(PRIZE_BUCKET)
      .list(dir, { limit: 10 })

    if (listErr || !files || files.length === 0) return null

    const candidate =
      files.find((f: any) => (f?.metadata?.mimetype || '').startsWith('image/')) ||
      files.find((f: any) => isImageByName(f?.name)) ||
      files[0]

    if (!candidate?.name) return null
    return `${dir}/${candidate.name}`
  } catch {
    return null
  }
}
async function signedUrlWithCB(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) return null
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}
async function attachProductImages(list: any[]) {
  if (!list || !list.length) return
  await Promise.all(
    list.map(async (p) => {
      const path = await firstImagePathForProduct(p.id)
      const signed = path ? await signedUrlWithCB(PRIZE_BUCKET, path) : null
      p.thumbnail_url = signed || p.thumbnail_url || null
    }),
  )
}
async function attachPrizeImages(list: any[]) {
  if (!list || list.length === 0) return
  await Promise.all(
    list.map(async (ev) => {
      if (!ev?.product_id) {
        ev.imageUrl = null
        return
      }
      const path = await firstImagePathForProduct(ev.product_id)
      ev.imageUrl = path ? await signedUrlWithCB(PRIZE_BUCKET, path) : null
    }),
  )
}

/* NEW: shared enricher for product-specific discounts (name + signed image) */
async function enrichProductDiscounts(list: Discount[]) {
  const ids = (list || [])
    .map(d => d.product_id)
    .filter((x): x is string => !!x)

  if (!ids.length) return

  const { data: products, error } = await supabase
    .schema('games')
    .from('products')
    .select('id,name,product_url')
    .in('id', ids)

  if (error) {
    console.warn('enrichProductDiscounts error:', error)
    return
  }

  const nameById: Record<string, string> = {}
  const firstPathById: Record<string, string | null> = {}

  for (const p of products || []) {
    const pid = (p as any).id as string
    const pname = (p as any).name as string
    const purl = (p as any).product_url
    nameById[pid] = pname
    firstPathById[pid] = firstPathFromProductUrl(purl)
  }

  const tasks: Promise<void>[] = []
  for (const d of list) {
    if (d.product_id && nameById[d.product_id]) {
      d.product_name = nameById[d.product_id]
    }
    const first = d.product_id ? firstPathById[d.product_id] : null
    if (first) {
      tasks.push(
        signedUrlWithCB(PRIZE_BUCKET, first).then(url => {
          d.product_img_url = url
        }),
      )
    } else {
      d.product_img_url = null
    }
  }
  await Promise.all(tasks)
}

/* ---------------- Existing games/orders/products preview etc. ---------------- */
type GameRow = {
  id: string
  title: string
  player_count: number
  player_cap: number
  status: string
  winner_price: number
  product_id?: string | null
  imageUrl?: string | null
  created_at?: string
}
const allGames = ref<GameRow[]>([])
const gamesLoading = ref(true)
const selectedGameId = ref<string | null>(null)

const openGames = computed(() =>
  allGames.value.filter((g) => (g.status || '').toLowerCase() === 'open'),
)
const featureGame = computed<GameRow | null>(() => {
  const fromSel = selectedGameId.value
    ? openGames.value.find((g) => g.id === selectedGameId.value)
    : null
  return fromSel || openGames.value[0] || null
})
const sideListGames = computed(() => {
  const fid = featureGame.value?.id
  return openGames.value.filter((g) => g.id !== fid)
})
function isSelected(id: string) {
  return (selectedGameId.value ? selectedGameId.value : openGames.value[0]?.id) === id
}

type OrderRow = {
  id: string
  status: string
  total_amount?: number | null
  created_at?: string
  updated_at?: string
  order_no?: string | null
  ref_code?: string | null
}
const orderUpdates = ref<OrderRow[]>([])
const ordersLoading = ref(true)

type ProdRow = {
  id: string
  name: string
  price_now: number
  price_was: number | null
  thumbnail_url?: string | null
  _discount_pct: number
  description?: string | null
}

const bigDiscounts = ref<ProdRow[]>([])
const productsLoading = ref(true)
const publishedPreview = ref<ProdRow[]>([])
const previewIndex = ref(0)
const hoveredDot = ref<number | null>(null)
const previewProducts = computed<ProdRow[]>(() => {
  return (publishedPreview.value.length ? publishedPreview.value : bigDiscounts.value).slice(0, 12)
})
const currentPreview = computed<ProdRow | null>(
  () => previewProducts.value[previewIndex.value] || null,
)

watch(previewProducts, () => {
  previewIndex.value = 0
})

const previewDescItems = computed(() => {
  const raw = currentPreview.value?.description || ''
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 12)
})

const hoverActive = ref(false)
let hoverTimer: number | null = null
function clearHoverTimer() {
  if (hoverTimer) {
    window.clearTimeout(hoverTimer)
    hoverTimer = null
  }
}
function scheduleNext() {
  clearHoverTimer()
  hoverTimer = window.setTimeout(() => {
    nextPreview()
    scheduleNext()
  }, 5000)
}
function onPPHover() {
  hoverActive.value = true
  scheduleNext()
}
function onPPLeave() {
  hoverActive.value = false
  clearHoverTimer()
}
function goToPreview(i: number) {
  previewIndex.value = i
}
function nextPreview() {
  if (previewProducts.value.length === 0) return
  previewIndex.value = (previewIndex.value + 1) % previewProducts.value.length
}
function prevPreview() {
  if (previewProducts.value.length === 0) return
  previewIndex.value =
    (previewIndex.value - 1 + previewProducts.value.length) % previewProducts.value.length
}

const peso = (n: number | null | undefined) =>
  `₱${Number(n ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
const number = (n: number | string | null | undefined) =>
  Number(n ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })
const dateShort = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
const shortId = (o: OrderRow) =>
  o.order_no || o.ref_code || (o.id ? '#' + String(o.id).slice(0, 6) : '#—')

const statusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'open':
      return 'st-open'
    case 'locked':
      return 'st-locked'
    case 'spun':
      return 'st-spun'
    case 'settled':
      return 'st-settled'
    case 'cancelled':
      return 'st-cancelled'
    default:
      return 'st-draft'
  }
}
const orderStatusClass = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'pending':
      return 'dot-pending'
    case 'approved':
    case 'paid':
      return 'dot-paid'
    case 'shipped':
      return 'dot-shipped'
    case 'completed':
    case 'delivered':
      return 'dot-completed'
    case 'cancelled':
    case 'refunded':
      return 'dot-cancelled'
    default:
      return 'dot-default'
  }
}
function joinPct(g: GameRow) {
  const cap = Math.max(1, Number(g.player_cap || 0))
  const cnt = Math.min(cap, Number(g.player_count || 0))
  return (cnt / cap) * 100
}
function hasWas(p?: ProdRow | null) {
  if (!p) return false
  return !!p.price_was && p.price_was > p.price_now
}
function savings(p?: ProdRow | null) {
  if (!p) return 0
  return p.price_was && p.price_was > p.price_now ? p.price_was - p.price_now : 0
}
function isAffordable(p?: ProdRow | null) {
  if (!p) return false
  return p._discount_pct >= 40 || p.price_now <= 500
}
const membershipDiscountPct = ref(0)
function memberPrice(p: ProdRow): number {
  const base = Number(p.price_now ?? 0)
  const pct = Number(membershipDiscountPct.value ?? 0)
  if (!pct || pct <= 0) return base
  const disc = base * (pct / 100)
  return Math.max(0, Math.round((base - disc) * 100) / 100)
}

async function ensureAuthed() {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      await router.push({ name: 'login' })
      return false
    }
  }
  return true
}

async function fetchOpenGames() {
  gamesLoading.value = true
  try {
    let { data, error } = await supabase
      .schema('games')
      .from('event')
      .select('id,title,player_count,player_cap,status,winner_refund_amount,product_id,created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(60)

    if (error) {
      const fb = await supabase
        .from('event')
        .select(
          'id,title,player_count,player_cap,status,winner_refund_amount,product_id,created_at',
        )
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(60)
      if (!fb.error) data = fb.data
    }

    allGames.value = (data ?? []).map(mapEventRow)
    await attachPrizeImages(allGames.value)

    if (!selectedGameId.value) selectedGameId.value = openGames.value[0]?.id ?? null
  } catch {
    allGames.value = []
  } finally {
    gamesLoading.value = false
  }
}
function mapEventRow(row: any): GameRow {
  return {
    id: row.id,
    title: String(row.title ?? 'Untitled'),
    player_count: Number(row.player_count ?? 0),
    player_cap: Number(row.player_cap ?? 0),
    status: String(row.status ?? 'draft'),
    winner_price: Number(row.winner_refund_amount ?? row.winner_price ?? 0),
    product_id: row.product_id ?? null,
    imageUrl: null,
    created_at: row.created_at,
  }
}

async function fetchOrderUpdates() {
  ordersLoading.value = true
  try {
    const uid = user.value?.id
    if (!uid) {
      orderUpdates.value = []
      return
    }

    let { data, error } = await supabase
      .from('purchases')
      .select('id,status,total_amount,created_at,updated_at,order_no,ref_code,user_id')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      const fb = await supabase
        .from('orders')
        .select('id,status,total_amount,created_at,updated_at,order_no,ref_code,user_id')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(8)
      if (!fb.error) data = fb.data
    }

    orderUpdates.value = (data ?? []) as OrderRow[]
  } catch {
    orderUpdates.value = []
  } finally {
    ordersLoading.value = false
  }
}
function computeDiscountPct(now: number, was?: number | null, pct?: number | null) {
  if (pct != null) return Math.round(Number(pct))
  if (!was || was <= 0) return 0
  return Math.max(0, Math.round(100 - (Number(now) / Number(was)) * 100))
}
async function fetchBigDiscounts() {
  productsLoading.value = true
  try {
    let { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,price,original_price,discount_pct,thumbnail_url,is_active')
      .eq('is_active', true)
      .limit(60)

    if (error) {
      const fb = await supabase
        .schema('games')
        .from('products')
        .select('id,name,price_now,price_was,discount_pct,thumbnail_url,is_active')
        .eq('is_active', true)
        .limit(60)
      if (!fb.error) data = fb.data as any[]
    }

    const rows = (data ?? []).map((r: any) => {
      const price_now = Number(r.price_now ?? r.price ?? 0)
      const price_was = r.price_was ?? r.original_price ?? null
      const pct = computeDiscountPct(price_now, price_was, r.discount_pct)
      return {
        id: r.id,
        name: String(r.name ?? 'Unnamed'),
        price_now,
        price_was: price_was ? Number(price_was) : null,
        thumbnail_url: r.thumbnail_url ?? null,
        _discount_pct: pct,
        description: null,
      } as ProdRow
    })

    await attachProductImages(rows)

    bigDiscounts.value = rows
      .filter((r) => r._discount_pct >= 30)
      .sort((a, b) => b._discount_pct - a._discount_pct)
      .slice(0, 14)
  } catch {
    bigDiscounts.value = []
  } finally {
    productsLoading.value = false
  }
}

async function fetchPublishedProductsForPreview() {
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,description,price,product_url,ispublish,stock,created_at')
      .eq('ispublish', true)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error

    const mapped: ProdRow[] = (data || []).map((r: any) => {
      const priceNum = typeof r.price === 'string' ? parseFloat(r.price) : Number(r.price ?? 0)
      let thumb: string | null = null
      if (Array.isArray(r.product_url)) thumb = r.product_url[0] ?? null
      else if (typeof r.product_url === 'string' && r.product_url.trim() !== '')
        thumb = r.product_url
      return {
        id: r.id,
        name: String(r.name ?? 'Unnamed Product'),
        price_now: Number.isFinite(priceNum) ? priceNum : 0,
        price_was: null,
        thumbnail_url: thumb,
        _discount_pct: 0,
        description: typeof r.description === 'string' ? r.description : null,
      }
    })

    await attachProductImages(mapped)

    publishedPreview.value = mapped
  } catch (err) {
    console.error('[preview products] load failed:', err)
    publishedPreview.value = []
  }
}

/* --------- Dynamic Tier / icons (kept) --------- */
type TierKey = 'regular' | 'silver' | 'gold' | 'platinum' | 'diamond'
function nameToKey(name: string): TierKey {
  const k = (name || '').toLowerCase()
  if (k.includes('silver')) return 'silver'
  if (k.includes('gold')) return 'gold'
  if (k.includes('platinum')) return 'platinum'
  if (k.includes('diamond')) return 'diamond'
  return 'regular'
}
const badgeIconSigned = ref<string | null>(null)
const memberTier = ref<TierKey>('regular')

const TIER_ICON_BUCKET = 'tier_icons'
async function signedUrlOrNullTierIcon(path: string | null | undefined): Promise<string | null> {
  try {
    const p = (path || '').replace(/^\/+/, '')
    if (!p) return null
    const { data, error } = await supabase.storage.from(TIER_ICON_BUCKET).createSignedUrl(p, 3600)
    if (error) return null
    return data?.signedUrl || null
  } catch {
    return null
  }
}

async function loadLiveTiersAndUser() {
  try {
    const { data: tiersData } = await supabase
      .schema('membership')
      .from('tiers')
      .select('id,membership_name,icon_url,discount_per_purchase')

    const byId: Record<string, any> = {}
    for (const r of tiersData ?? []) byId[r.id] = r

    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data: urow } = await supabase
      .from('users')
      .select('membership_id')
      .eq('id', uid)
      .maybeSingle()

    const memId = urow?.membership_id
    if (!memId || !byId[memId]) {
      badgeIconSigned.value = null
      membershipDiscountPct.value = 0
      return
    }

    const tierRow = byId[memId]
    memberTier.value = nameToKey(tierRow.membership_name || 'regular')
    badgeIconSigned.value = await signedUrlOrNullTierIcon(tierRow.icon_url)
    membershipDiscountPct.value = Number(tierRow.discount_per_purchase ?? 0)
  } catch {}
}

/* ------- Realtime (kept) ------- */
let chGames: any = null
let chOrders: any = null
let chProducts: any = null
let chUser: any = null
let chReferrals: any = null
let chPubProducts: any = null

function startRealtime() {
  try {
    chGames = supabase
      .channel('rt:games.event:open-only')
      .on(
        'postgres_changes',
        { event: '*', schema: 'games', table: 'event', filter: 'status=eq.open' },
        async () => {
          await fetchOpenGames()
        },
      )
      .subscribe()

    chProducts = supabase
      .channel('rt:games.products')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'games', table: 'products' },
        async (payload: any) => {
          const prodId = payload?.new?.id as string | undefined
          if (!prodId) return
          const affectedEvents = allGames.value.filter((e) => e.product_id === prodId)
          await attachPrizeImages(affectedEvents)

          const affectedPreview = publishedPreview.value.filter((p) => p.id === prodId)
          await attachProductImages(affectedPreview)
        },
      )
      .subscribe()

    chPubProducts = supabase
      .channel('rt:games.products')
      .on('postgres_changes', { event: '*', schema: 'games', table: 'products' }, () =>
        fetchPublishedProductsForPreview(),
      )
      .subscribe()
  } catch {}

  try {
    if (user.value?.id) {
      chOrders = supabase
        .channel(`rt:purchases:${user.value.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'games',
            table: 'purchases',
            filter: `user_id=eq.${user.value.id}`,
          },
          () => fetchOrderUpdates(),
        )
        .subscribe()

      chUser = supabase
        .channel(`rt:users:${user.value.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.value.id}` },
          () => fetchUserWalletAndPurchases(),
        )
        .subscribe()

      chReferrals = supabase
        .channel(`rt:referrals:${user.value.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
            filter: `referred_by=eq.${user.value.id}`,
          },
          () => fetchReferralCount(),
        )
        .subscribe()
    }
  } catch {}
}

const gamesPanelEl = ref<HTMLElement | null>(null)
function selectFeature(id: string) {
  selectedGameId.value = id
  gamesPanelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
watch(openGames, () => {
  if (!openGames.value.find((g) => g.id === selectedGameId.value)) {
    selectedGameId.value = openGames.value[0]?.id ?? null
  }
})

const bannerEl = ref<HTMLElement | null>(null)
const sideListH = ref(320)
let roBanner: ResizeObserver | null = null
function syncSideListHeight() {
  const h = bannerEl.value?.offsetHeight || 320
  sideListH.value = Math.max(240, Math.round(h))
  updateSideScrollHint()
}

const sideListEl = ref<HTMLElement | null>(null)
const sideScrollHintVisible = ref(false)
const sideScrollHintUpVisible = ref(false)
function updateSideScrollHint() {
  const el = sideListEl.value
  if (!el) {
    sideScrollHintVisible.value = false
    sideScrollHintUpVisible.value = false
    return
  }
  const canScroll = el.scrollHeight - el.clientHeight > 4
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  const atTop = el.scrollTop <= 4

  sideScrollHintVisible.value = canScroll && !atBottom
  sideScrollHintUpVisible.value = canScroll && atBottom && !atTop
}

onMounted(async () => {
  const ok = await ensureAuthed()
  if (!ok) return

  await Promise.all([
    fetchProfileAndTier(),
    fetchOpenGames(),
    fetchOrderUpdates(),
    fetchBigDiscounts(),
    fetchPublishedProductsForPreview(),
  ])

  await Promise.all([fetchUserWalletAndPurchases(), fetchReferralCount()])

  await loadLiveTiersAndUser()
  startRealtime()

  await nextTick()
  syncSideListHeight()
  if ('ResizeObserver' in window && bannerEl.value) {
    roBanner = new ResizeObserver(syncSideListHeight)
    roBanner.observe(bannerEl.value)
  }
  window.addEventListener('resize', syncSideListHeight)

  if (sideListEl.value) {
    sideListEl.value.addEventListener('scroll', updateSideScrollHint)
    updateSideScrollHint()
  }

  // Close on ESC
  window.addEventListener('keydown', onKeydownEsc)
})
function onKeydownEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && showDiscountModal.value) closeDiscount()
}

import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  clearHoverTimer()
  if (chGames) supabase.removeChannel(chGames)
  if (chOrders) supabase.removeChannel(chOrders)
  if (chProducts) supabase.removeChannel(chProducts)
  if (chUser) supabase.removeChannel(chUser)
  if (chReferrals) supabase.removeChannel(chReferrals)
  if (chPubProducts) supabase.removeChannel(chPubProducts)
  roBanner?.disconnect?.()
  window.removeEventListener('resize', syncSideListHeight)
  if (sideListEl.value) sideListEl.value.removeEventListener('scroll', updateSideScrollHint)
  window.removeEventListener('keydown', onKeydownEsc)
})

const ppBgStyle = computed(() => {
  const url = currentPreview.value?.thumbnail_url
  return url ? { backgroundImage: `url('${url}')` } : {}
})

/* Existing helpers used above */
async function fetchProfileAndTier() {
  try {
    const uid = user.value?.id
    if (!uid) return

    let { data, error } = await supabase
      .from('profiles')
      .select('tier_key, ewallet_balance, discount_credit_balance, referrals, lifetime_purchases')
      .eq('id', uid)
      .single()

    if (error) {
      const fb = await supabase
        .from('member')
        .select(
          'tier_key, ewallet_balance, discount_credit_balance, referral_count, lifetime_purchases',
        )
        .eq('user_id', uid)
        .single()
      if (!fb.error) {
        data = {
          tier_key: fb.data?.tier_key,
          ewallet_balance: fb.data?.ewallet_balance,
          discount_credit_balance: fb.data?.discount_credit_balance,
          referrals: fb.data?.referral_count,
          lifetime_purchases: fb.data?.lifetime_purchases,
        } as any
      }
    }

    const tk = (data as any)?.tier_key as TierKey | undefined
    if (tk && ['regular', 'silver', 'gold', 'platinum', 'diamond'].includes(tk)) {
      memberTier.value = tk
    }
  } catch (e) {
    console.warn('[profile/tier] fallback', e)
  }
}
async function fetchUserWalletAndPurchases() {
  try {
    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data, error } = await supabase
      .from('users')
      .select('balance, discount_credits, purchases_per_month')
      .eq('id', uid)
      .maybeSingle()

    if (!error && data) {
      // balances set earlier
    }
  } catch {}
}
async function fetchReferralCount() {
  try {
    let uid = user.value?.id
    if (!uid) {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id
      if (!uid) return
    }

    const { data: refRow, error } = await supabase
      .from('referral_stats')
      .select('referrals_count')
      .eq('referrer_id', uid)
      .maybeSingle()

    if (!error) {
      // set earlier
    }
  } catch {}
}
</script>

<style scoped>
:root {
  --fs-base: 1rem;
  --fs-sm: 0.875rem;
  --fs-xs: 0.75rem;
  --bg: #f5f6f7;
  --surface: #ffffff;
  --muted: #6b7280;
  --line: rgba(15, 23, 42, 0.04);
  --radius-lg: 1.25rem;

  /* Shopee-ish accent */
  --accent: #ff5722;
  --accent-dark: #e64a19;
  --accent-ghost: rgba(255, 87, 34, 0.08);
}

.deals-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(42, 144, 198, 0.08), transparent 35%), #f8fafc;
  padding: 1.6rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-size: var(--fs-base);
}
.deals-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%);
  border: 1px solid rgba(32, 100, 124, 0.03);
  border-radius: 1.5rem;
  padding: 1.5rem 1.6rem;
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.02);
}
.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: var(--fs-xs);
  color: rgba(32, 100, 124, 0.7);
  margin-bottom: 0.4rem;
  font-weight: 600;
}
.hero-title {
  font-size: 1.5rem; /* close to your old h4 */
  font-weight: 700;
  color: #122431;
  margin-bottom: 0.25rem;
}
.hero-sub {
  color: #828a96;
  font-size: var(--fs-sm);
  max-width: 32rem;
}
.hero-stats {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}
.hero-pill {
  background: #ffffff;
  border: 1px solid rgba(12, 26, 36, 0.04);
  border-radius: 999px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 1.1rem;
  min-width: 7rem;
}
.hero-pill-label {
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7a8493;
}
.hero-pill-value {
  font-weight: 700;
  font-size: 1rem;
  color: #122431;
}

/* GRID LAYOUT */
.deals-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.25fr) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: start;
}
.deals-left,
.deals-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.deals-right {
  position: sticky;
  top: 1.5rem;
  align-self: start;
  max-height: calc(100vh - 1.5rem);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

/* PANEL */
.panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.03);
  border-radius: 1.25rem;
  padding: 1.1rem 1.15rem 1.15rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.02);
  font-size: var(--fs-base);
}
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.panel-sub {
  font-size: var(--fs-sm);
  color: #94a3b8;
}
.ghost-btn {
  background: rgba(32, 100, 124, 0.04);
  border: 1px solid rgba(32, 100, 124, 0.08);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  font-size: var(--fs-xs);
  color: #1f3f4d;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 1.4rem 0.5rem 1.1rem;
  font-size: var(--fs-base);
}
.empty-icon {
  font-size: 1.8rem;
  color: rgba(32, 100, 124, 0.35);
  display: block;
  margin-bottom: 0.5rem;
}
.empty-title {
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #0f172a;
  font-size: var(--fs-base);
}
.empty-text {
  font-size: var(--fs-sm);
  color: #94a3b8;
}

/* DISCOUNT LIST */
.discount-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  /* make it scroll */
  max-height: 50vh;        /* or any height you like (e.g., 480px) */
  overflow-y: auto;
  padding-right: 4px;      /* keeps content from touching the scrollbar */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  min-height: 0;           /* important if parent is flex */
}
.discount-card {
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.02);
  border-radius: 1rem;
  padding: 0.75rem 0.8rem;

  font-size: var(--fs-base);
  cursor: pointer;
}
.discount-main {
  display: grid;
  gap: 0.5rem;
  align-items: center;
}
.discount-badge {
  width: 42px;
  height: 42px;
  border-radius: 1rem;
  display: grid;
  place-items: center;
  color: white;
  background: linear-gradient(150deg, #0ea5e9 0%, #4f46e5 100%);
  font-size: 1.05rem;
}
.discount-badge.free_shipping {
  background: linear-gradient(150deg, #059669 0%, #10b981 100%);
}
.discount-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.1rem;
}
.discount-value {
  font-weight: 700;
  color: #0f172a;
  font-size: .95rem;
  margin: .1rem 0 .15rem;
}
.discount-desc {
  font-size: var(--fs-sm);
  color: #6b7280;
}
.discount-exp {
  font-size: var(--fs-xs);
  color: #94a3b8;
  margin-top: 0.1rem;
}

/* ===== Gradient background for discount codes ===== */
.discount-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b, #ff9f43, #feca57);
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  user-select: all;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Optional decorative punch holes (ticket look) */
.discount-code::before,
.discount-code::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  transform: translateY(-50%);
}
.discount-code::before {
  left: -4px;
}
.discount-code::after {
  right: -4px;
}

/* Hover effect */
.discount-code:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.cta-btn {
  background: #0f172a;
  border: none;
  color: #fff;
  border-radius: 999px;
  font-size: var(--fs-xs);
  padding: 0.1rem 0.9rem;
  cursor: pointer;
}
.cta-btn[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}



/* Shopee-ish accent on actionable buttons and cards */
.shopeeish:hover {
  border-color: rgba(255, 87, 34, 0.22);
  box-shadow: 0 0 0 3px var(--accent-ghost);
}
.orange:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* PRODUCT DISCOUNTS */
.discount-card p,
.product-discount-card p,
.metric-card p,
.aff-input-wrap p { margin: 0; }
.product-discount-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.85rem;
}

.product-discount-card {
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.02);
  padding: 0.75rem 0.75rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: var(--fs-base);
  cursor: pointer;
  height: 100%;
}


/* Allow flex/grid descendants to actually shrink & scroll */
.deals-left,
.panel,
.product-discount-grid {
  min-height: 0;
}

/* Scrollable grid for upcoming product-specific discounts */
.pd-grid-scroll {
  max-height: 60vh;          /* adjust as you like */
  overflow-y: auto;
  padding-right: 4px;        /* breathing room near scrollbar */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  min-height: 0;             /* keeps it shrinkable in flex/stack parents */
}

/* Make just the Product-Specific panel a capped, internal-scrolling layout */
.pd-panel {
  display: flex;              /* header stays on top */
  flex-direction: column;
  max-height: 80vh;           /* <= adjust if you want a taller/shorter panel */
  min-height: 0;              /* crucial for scroll to work inside */
}

/* The grid itself becomes the scrolling region */
.pd-panel .product-discount-grid {
  flex: 1 1 auto;
  min-height: 0;              /* mandatory in flex children for overflow */
  overflow-y: auto;           /* this is the scrollbar */
  padding-right: 4px;         /* keeps content from touching the scrollbar */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.pd-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.35rem;
}
.pd-type {
  background: rgba(6, 95, 70, 0.055);
  color: #065f46;
  font-size: var(--fs-xs);
  padding: 0.1rem 0.7rem;
  border-radius: 0.55rem;
  margin-bottom: 5px;
  font-weight: 500;
}
.pd-pill {
  background: white;
  border: 1px solid rgba(12, 26, 36, 0.03);
  border-radius: 999px;
  font-size: var(--fs-xs);
  padding: 0.25rem 0.5rem;
  color: #94a3b8;
}

/* NEW: product image styles */
.pd-thumb-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.04);
  border-radius: 0.75rem;
  overflow: hidden;
}
.pd-thumb {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.pd-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}
.pd-product-label {
  font-size: var(--fs-sm);
  color: #6b7280;
}
.pd-meta {
  font-size: var(--fs-xs);
  color: #94a3b8;
}
.pd-footer {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}
.pd-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b, #ff9f43, #feca57);
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  user-select: all;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pd-usage {
  font-size: var(--fs-xs);
  color: #94a3b8;
}

.mini-btn {
  background: #0f172a;
  border: none;
  color: #fff;
  border-radius: 999px;
  font-size: var(--fs-xs);
  padding: 0.25rem 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  cursor: pointer;
}
.mini-btn.light {
  background: #e2e8f0;
  color: #0f172a;
}
.mini-btn[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
}

/* RIGHT: affiliate */
.sticky-panel {
  position: sticky;
  top: 1.5rem;
  z-index: 10;
}
.affiliate-box {
  background: #f8fafc;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.02);
  padding: 0.7rem 0.75rem 0.6rem;
  margin-bottom: 0.85rem;
}
.aff-label {
  font-size: var(--fs-sm);
  color: #94a3b8;
  display: block;
  margin-bottom: 0.35rem;
}
.aff-input-wrap {
  display: grid;
  gap: 0.4rem;
  align-items: center;

  grid-template-columns: 1fr auto;
}
.aff-input {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.03);
  border-radius: 0.65rem;
  padding: 0.45rem 0.6rem;
  font-size: var(--fs-sm);

  min-width: 0;
  word-break: break-all;
}
.aff-hint {
  font-size: var(--fs-xs);
  margin-top: 0.35rem;
  color: #94a3b8;
}
.aff-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 0.5rem;
}
.metric-card {
  flex: 1;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.02);
  padding: 0.55rem 0.55rem 0.6rem;
}
.metric-label {
  font-size: var(--fs-xs);
  color: #94a3b8;
  margin-bottom: 0.25rem;
}
.metric-value {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

/* REFEES LIST */
.tag {
  background: #fff4e5;
  color: #ad5912;
  font-size: var(--fs-xs);
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
}
.ref-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.ref-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}
.ref-left {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.ref-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid rgba(15, 23, 42, 0.05);
}
.ref-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}
.ref-sub {
  font-size: var(--fs-xs);
  color: #94a3b8;
}
.ref-progress {
  margin-top: 0.35rem;
}
.ref-progress-head {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-xs);
  color: #94a3b8;
  margin-bottom: 0.25rem;
}
.ref-progress-bar {
  height: 5px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.ref-progress-fill {
  height: 5px;
  background: #0f172a;
}
.ref-right {
  text-align: right;
}
.ref-amount {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.9rem;
}
.ref-amount-sub {
  font-size: var(--fs-xs);
  color: #94a3b8;
}

/* ===== Breath-in intro ===== */
@keyframes breathInOnce {
  0% { opacity: 0; transform: scale(0.985); }
  100% { opacity: 1; transform: scale(1); }
}
.breath-in-once {
  animation: breathInOnce 1000ms cubic-bezier(.2,.7,.1,1) both;
}
@media (prefers-reduced-motion: reduce) {
  .breath-in-once { animation: none !important; opacity: 1 !important; transform: none !important; }
}

/* ===== Skeleton styles ===== */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skel-line {
  height: 12px;
  border-radius: 8px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-line.sm { height: 10px; }
.skel-line.xs { height: 8px; }
.w-100 { width: 100%; }
.w-70 { width: 70%; }
.w-65 { width: 65%; }
.w-60 { width: 60%; }
.w-56 { width: 56%; }
.w-55 { width: 55%; }
.w-50 { width: 50%; }
.w-45 { width: 45%; }
.w-40 { width: 40%; }
.w-36 { width: 36%; }
.w-35 { width: 35%; }
.w-34 { width: 34%; }
.w-30 { width: 30%; }
.w-25 { width: 25%; }
.w-24 { width: 24%; }
.mt-2 { margin-top: .5rem; }
.mb-2 { margin-bottom: .5rem; }
.mb-1 { margin-bottom: .25rem; }

.skel-pill, .skel-chip {
  height: 28px;
  min-width: 110px;
  border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-chip { min-width: 70px; height: 22px; }

.skel-btn {
  width: 90px; height: 30px; border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-btn.small { width: 64px; height: 26px; }

.skel-square {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-avatar {
  width: 40px; height: 40px; border-radius: 999px;
  background: linear-gradient(90deg, #eef2f7 0%, #e6ebf3 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}


/* =================== DETAILS MODAL (fully responsive) =================== */
.dm-overlay {
  position: fixed;
  inset: 0;
  /* allow the page behind to stay locked while overlay can scroll if needed */
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(15, 23, 42, 0.32);
  display: grid;
  place-items: center;
  z-index: 9999;

  /* Safe area padding for iOS + small screens */
  padding: max(12px, env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px))
           max(12px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px));
  overscroll-behavior: contain;
}

.dm-wrap {
  /* Centered, capped width + height, and internally scrollable */
  width: min(720px, 96vw);
  max-width: 96vw;
  /* use dvh so mobile browser chrome doesn’t cut us off */
  max-height: min(92dvh, calc(100dvh - 24px));
  background: #fff;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  position: relative;

  /* Make header/footer fixed in place while body scrolls */
  display: flex;
  flex-direction: column;

  /* In case content inside has transforms that could spill */
  contain: layout paint;
}

.dm-x {
  position: absolute;
  top: .6rem;
  right: .6rem;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  width: 34px; height: 34px;
  display: grid; place-items: center;
  cursor: pointer;
  z-index: 2;
}

.dm-header {
  display: flex;
  gap: .8rem;
  padding: 1rem 1rem .25rem 1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  flex: 0 0 auto; /* keep visible */
}

.dm-badge {
  width: 48px; height: 48px; border-radius: 14px;
  display: grid; place-items: center; color: #fff;
  background: linear-gradient(150deg, #0ea5e9 0%, #4f46e5 100%);
  font-size: 1.2rem;
}
.dm-badge.free_shipping {
  background: linear-gradient(150deg, #059669 0%, #10b981 100%);
}

.dm-titles { 
  display: flex;
  justify-content: center;
  flex-direction: column; 
  gap: .2rem; 
}
.dm-title { 
  font-size: 1.05rem; 
  font-weight: 700; 
  color: #0f172a;
}
.dm-headline { 
  font-weight: 800; 
  color: #0f172a; 
  font-size: 1rem; 
}
.dm-sub { 
  color: #6b7280; 
  font-size: 0.875rem; 
}

.dm-body {
  /* The only scrollable area */
  flex: 1 1 auto;
  min-height: 0; /* required so flex item can actually shrink and scroll */
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: .9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
  overscroll-behavior: contain;
}

.dm-row { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: .75rem; 
}
.dm-row.highlight {
  background: #f5fff4; 
  border: 1px solid rgba(115, 255, 34, 0.15);
  border-radius: .75rem; 
  padding: .6rem .7rem;
}
.dm-col { 
  background: #fff; 
  border: 1px solid rgba(15,23,42,.04); 
  border-radius: .65rem; 
  padding: .6rem .7rem; 
}
.dm-label {
  font-size: 0.75rem; 
  color: #94a3b8; 
  margin-bottom: .15rem;
  text-transform: uppercase; 
  letter-spacing: .04em;
}
.dm-strong { 
  font-weight: 700; 
  color: #0f172a; 
}
.dm-note { 
  font-size: 0.75rem; 
  color: #94a3b8; 
  margin-top: .15rem; 
}
.dm-code-line { 
  display: flex; 
  align-items: center; 
  gap: .35rem;
  font-size: 0.75rem;
}
.dm-code {
  background: #0f172a; 
  color: #fff; 
  border-radius: .5rem;
  padding: .2rem .45rem; 
  font-size: .8rem;
  word-break: break-all; /* avoid horizontal overflow for long codes */
}
.dm-muted { 
  color: #94a3b8; 
  font-size: 0.875rem; 
}
.dm-footer {
  flex: 0 0 auto; /* keep visible */
  display: flex; 
  justify-content: flex-end; 
  gap: .5rem;
  padding: .75rem 1rem 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.05);
  background: #fff; /* ensures footer stays readable over scroll */
}

/* RESPONSIVE */
@media (max-width: 1080px) {
  .deals-grid {
    grid-template-columns: 1fr;
  }
  .sticky-panel {
    position: static;
  }
  .hero-stats {
    justify-content: flex-start;
  }
  .deals-right {
    position: static;
    max-height: none;
    overflow: visible;
  }
}
@media (max-width: 640px) {
  .deals-shell {
    padding: 1.25rem 1rem 2.2rem;
  }
  .deals-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-title {
    font-size: 1.35rem;
  }
  .panel {
    border-radius: 1rem;
  }
  .discount-list {
    grid-template-columns: 1fr;
  }
  .discount-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .discount-side {
    flex-direction: row;
    gap: 0.4rem;
  }
  .aff-metrics {
    flex-direction: column;
  }
  .hero-stats {
    gap: 0.4rem;
  }
  .dm-row { 
    grid-template-columns: 1fr; 
  }
  .dm-wrap {
    width: 100%;
    max-width: 100%;
    border-radius: 12px;
  }
  .product-discount-grid {
    grid-template-columns: 1fr 1fr;
  }
}

</style>