<template>
  <div class="container">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3 breath-in-section">
      <div>
        <h3 class="fw-bold mb-1">
          <i class="bi bi-award"></i>
          Membership Tiers
        </h3>
        <p class="text-muted small mb-0">
          <i class="bi bi-sliders2-vertical me-1"></i>
          Manage tier names, order, discounts, and delivery perks.
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <!-- controls removed as requested: Refresh + New Tier -->
        <!-- NEW: Manage Users button -->
        <button
          type="button"
          class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          @click="openManageUsers"
        >
          <i class="bi bi-people-gear"></i>
          Manage Users
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="card-body d-flex flex-column flex-md-row flex-wrap gap-2 align-items-stretch align-items-md-center breath-in-section"
    >
      <div class="flex-grow-1" style="max-width: 1230px">
        <div class="input-group w-100">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input
            v-model.trim="q"
            type="text"
            class="form-control"
            placeholder="Search name…"
            @input="debouncedSearch()"
          />
        </div>
      </div>
      <div class="ms-md-auto small text-muted pt-1 pt-md-0">
        <i class="bi bi-123 me-1"></i>
        Total: {{ total }}
      </div>
    </div>

    <!-- Stair row (5 fixed columns) -->
    <div
      class="row g-2 g-md-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 align-items-end stairs-row mt-2 breath-in-section"
    >
      <!-- Loading -->
      <div v-if="busy.load" class="col">
        <div class="card card-fixed rounded-4 border-0 skeleton-card">
          <div class="card-body">
            <div class="skeleton-header mb-3">
              <div class="skel-badge mb-2"></div>
              <div class="skel-circle mb-2"></div>
              <div class="skel-line skel-line-lg mb-1"></div>
              <div class="skel-line skel-line-sm"></div>
            </div>
            <ul class="skeleton-list">
              <li v-for="n in 5" :key="n" class="skel-row">
                <span class="skel-line skel-line-sm"></span>
                <span class="skel-line skel-line-xs"></span>
              </li>
            </ul>
            <div class="mt-4">
              <div class="skel-btn"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="displayTiers.length === 0" class="col">
        <div class="text-center text-muted py-4">
          <i class="bi bi-stars me-1"></i> No tiers found.
        </div>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="t in displayTiers"
        :key="t.id"
        class="col stair"
        :class="stairClass(t)"
      >
        <div
          class="card card-fixed h-100 rounded-4 border-0 pricing-vert tier-hero-compact tier-clickable"
          :class="[skinClass(t), isDiamond(t) ? 'diamond-glow' : '']"
          @click="openMembers(t)"
        >
          <div class="card-body d-flex flex-column">
            <div v-if="isDiamond(t)" class="ribbon-popular">
              <i class="bi bi-stars me-1"></i>
              Most Popular
            </div>

            <div class="text-center mb-2">
              <div class="pricing-rank">
                <i class="bi bi-hash me-1"></i>#{{ t.membership_tier_order }}
              </div>
              <img
                v-if="t._icon_signed_url"
                :src="t._icon_signed_url"
                class="pricing-icon-vert"
                alt="Tier icon"
              />
              <h3 class="h5 mt-2 mb-1 text-truncate fw-bold">
                <i class="bi bi-gem me-1" v-if="isDiamond(t)"></i>
                {{ t.membership_name }}
              </h3>

              <span
                class="badge rounded-pill"
                :class="t.is_free_delivery ? 'text-bg-success' : 'text-bg-secondary'"
              >
                <i class="bi bi-truck me-1"></i>
                {{ t.is_free_delivery ? 'Free Delivery' : 'No Free Delivery' }}
              </span>

              <div class="text-muted small mt-1">
                <i class="bi bi-clock-history me-1"></i>
                Updated {{ fmtDate(t.updated_at) }}
              </div>
            </div>

            <ul class="pricing-features small mt-3 fs-7">
              <li>
                <strong><i class="bi bi-people me-1"></i>Members</strong>
                <span>{{ memberCounts[t.id] ?? 0 }}</span>
              </li>
              <li>
                <strong>
                  <i class="bi bi-wallet2 me-1"></i>
                  Monthly <br />
                  Credits
                </strong>
                <span>₱{{ toMoney(t.discount_credits) }}</span>
              </li>
              <li>
                <strong><i class="bi bi-tag me-1"></i>Discount</strong>
                <span>{{ toPercent(t.discount_per_purchase) }}</span>
              </li>
              <li>
                <strong><i class="bi bi-cart-check me-1"></i>Purchases</strong>
                <span>{{ t.purchases_count }}</span>
              </li>
              <li>
                <strong><i class="bi bi-person-plus me-1"></i>Referral Req</strong>
                <span>{{ t.referral_count_requirements }}</span>
              </li>
              <li>
                <strong>
                  <i class="bi bi-box-seam me-1"></i>
                  Orders for <br />
                  Free Delivery
                </strong>
                <span>{{ t.purchase_requirements_for_free_delivery }}</span>
              </li>
            </ul>

            <div class="mt-4 d-flex flex-column gap-1">
              <button
                class="btn btn-sm fw-semibold btn-manage"
                :class="isDiamond(t) ? 'btn-diamond' : ''"
                @click.stop="openEdit(t)"
              >
                <i class="bi bi-gear me-1"></i>
                Manage
              </button>
              <!-- delete button removed as requested -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination removed as requested -->

    <!-- Alerts (kept) -->
    <p v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">
      <i class="bi bi-exclamation-triangle me-1"></i>{{ error }}
    </p>
    <p v-if="notice" class="alert alert-success mt-3 mb-0" role="alert">
      <i class="bi bi-check-circle me-1"></i>{{ notice }}
    </p>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="tierModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-1"></i>
              {{ form.id ? 'Edit Tier' : 'New Tier' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form @submit.prevent="save">
            <div class="modal-body row g-3">
              <div class="col-md-6">
                <label class="form-label">
                  <i class="bi bi-type me-1"></i>
                  Tier Name
                </label>
                <input
                  v-model.trim="form.membership_name"
                  type="text"
                  class="form-control"
                  placeholder="e.g., Bronze, Silver, Gold"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">
                  <i class="bi bi-list-ol me-1"></i>
                  Display Order
                </label>
                <input
                  v-model.number="form.membership_tier_order"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="Higher is better (5 highest)"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">
                  <i class="bi bi-cart-check me-1"></i>
                  Total Purchases (All-Time)
                </label>
                <input
                  v-model.number="form.purchases_count"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="0"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">
                  <i class="bi bi-person-plus me-1"></i>
                  Referral Count Requirement
                </label>
                <input
                  v-model.number="form.referral_count_requirements"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="0"
                  required
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">
                  <i class="bi bi-diagram-3 me-1"></i>
                  Purchases per Referral
                </label>
                <input
                  v-model.number="form.purchases_per_referrals"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="0"
                  required
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">
                  <i class="bi bi-truck me-1"></i>
                  Free Delivery?
                </label>
                <select v-model="form.is_free_delivery" class="form-select">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">
                  <i class="bi bi-wallet2 me-1"></i>
                  Discount Credits (₱ / month)
                </label>
                <input
                  v-model="form.discount_credits"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="e.g., 2000.00"
                  required
                />
                <div class="form-text">
                  <i class="bi bi-info-circle me-1"></i>
                  Monthly credits applied to member purchases.
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">
                  <i class="bi bi-percent me-1"></i>
                  Discount per Purchase
                </label>
                <div class="input-group">
                  <input
                    v-model="form.discount_per_purchase"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    placeholder="e.g., 50 or 5"
                    required
                  />
                  <select
                    v-model="form.discount_per_purchase_mode"
                    class="form-select"
                    style="max-width: 120px"
                  >
                    <option value="peso">₱</option>
                    <option value="percent">%</option>
                  </select>
                </div>
                <div class="form-text">
                  <i class="bi bi-info-circle me-1"></i>
                  Enter a fixed peso amount or choose % for a percentage (0–100).
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">
                  <i class="bi bi-box-seam me-1"></i>
                  Orders Required for Free Delivery
                </label>
                <input
                  v-model.number="form.purchase_requirements_for_free_delivery"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="e.g., 3"
                  required
                />
              </div>

              <!-- Icon uploader -->
              <div class="col-12">
                <label class="form-label">
                  <i class="bi bi-image me-1"></i>
                  Tier Icon (PNG/JPG/SVG)
                </label>
                <input
                  ref="iconInput"
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  class="form-control"
                  @change="onIconPicked"
                />
                <div class="form-text">
                  <i class="bi bi-cloud-arrow-up me-1"></i>
                  Stored in <code>tier_icons</code> with a signed URL used for display.
                </div>
                <div v-if="iconPreview" class="mt-2 d-flex align-items-center gap-3">
                  <img
                    :src="iconPreview"
                    alt="Icon preview"
                    class="rounded border"
                    style="width: 56px; height: 56px; object-fit: cover"
                  />
                  <button type="button" class="btn btn-outline-secondary btn-sm" @click="clearIcon">
                    <i class="bi bi-x-circle me-1"></i>
                    Remove Icon
                  </button>
                </div>
                <div v-else-if="form._icon_signed_url" class="mt-2">
                  <img
                    :src="form._icon_signed_url"
                    alt="Current icon"
                    class="rounded border"
                    style="width: 56px; height: 56px; object-fit: cover"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-1"></i>
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="busy.save">
                <span v-if="busy.save" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-save me-1" v-if="!busy.save"></i>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Modal (left intact but unreachable without button) -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-trash3 me-1"></i>
              Delete Tier
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete <strong>{{ selected?.membership_name }}</strong
            >? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i>
              Cancel
            </button>
            <button type="button" class="btn btn-danger" :disabled="busy.del" @click="del">
              <span v-if="busy.del" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-trash3" v-if="!busy.del"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- NEW: Tier Members Modal -->
    <div class="modal fade" id="membersModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content members-modal">
          <div class="modal-header">
            <div>
              <h5 class="modal-title">
                <i class="bi bi-people me-1"></i>
                Tier Members – {{ membersTier?.membership_name || 'Tier' }}
              </h5>
              <p class="small text-muted mb-0">
                <i class="bi bi-info-circle me-1"></i>
                See the people in this tier, their credits, purchases, and referrals.
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body breath-in-section">
            <!-- Loading skeleton -->
            <div v-if="membersBusy" class="members-skeleton">
              <div v-for="n in 4" :key="n" class="member-row member-row-skel">
                <div class="member-avatar-skel shimmer"></div>
                <div class="member-main">
                  <div class="skel-line skel-line-lg shimmer mb-1"></div>
                  <div class="skel-line skel-line-sm shimmer mb-2"></div>
                  <div class="member-stats">
                    <div class="stat-pill skel-pill shimmer"></div>
                    <div class="stat-pill skel-pill shimmer"></div>
                    <div class="stat-pill skel-pill shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="membersError" class="alert alert-danger mb-0" role="alert">
              <i class="bi bi-exclamation-triangle me-1"></i>
              {{ membersError }}
            </div>

            <!-- Empty -->
            <div v-else-if="members.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-people me-1"></i>
              No one is in this tier yet. Once members upgrade here, they’ll appear in this list.
            </div>

            <!-- List -->
            <div v-else class="members-list">
              <div
                v-for="m in members"
                :key="m.id"
                class="member-row"
              >
                <div class="member-avatar-wrap">
                  <div
                    v-if="m.profile_img"
                    class="member-avatar"
                    :style="{ backgroundImage: `url('${m.profile_img}')` }"
                  ></div>
                  <div
                    v-else
                    class="member-avatar member-avatar-fallback"
                    :style="{ backgroundImage: avatarBg(m.full_name || m.email || m.id) }"
                  >
                    <span>{{ initials(m.full_name || m.email) }}</span>
                  </div>
                </div>
                <div class="member-main">
                  <div class="member-name-line">
                    <div class="member-name-email">
                      <div class="member-name">
                        {{ m.full_name || 'No name' }}
                      </div>
                      <div class="member-email">
                        {{ m.email }}
                      </div>
                    </div>
                    <div class="member-joined small text-muted">
                      <i class="bi bi-calendar-event me-1"></i>
                      Joined {{ fmtDate(m.created_at) }}
                    </div>
                  </div>
                  <div class="member-stats">
                    <div class="stat-pill">
                      <span class="stat-label">
                        <i class="bi bi-wallet2 me-1"></i>
                        Credits
                      </span>
                      <span class="stat-value">₱{{ toMoney(m.discount_credits) }}</span>
                    </div>
                    <div class="stat-pill">
                      <span class="stat-label">
                        <i class="bi bi-cart3 me-1"></i>
                        Purchases (month)
                      </span>
                      <span class="stat-value">{{ toMoney(m.purchases_per_month) }}</span>
                    </div>
                    <div class="stat-pill">
                      <span class="stat-label">
                        <i class="bi bi-people-fill me-1"></i>
                        Referrals
                      </span>
                      <span class="stat-value">{{ m.referral_count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-x-circle me-1"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- NEW: Manage ALL Users Modal -->
    <div class="modal fade" id="manageUsersModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content members-modal">
          <div class="modal-header">
            <div>
              <h5 class="modal-title">
                <i class="bi bi-people-gear me-1"></i>
                Manage Users
              </h5>
              <p class="small text-muted mb-0">
                <i class="bi bi-info-circle me-1"></i>
                View all users, their membership tier, and manage promotions or deletions.
              </p>
            </div>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body breath-in-section">
            <!-- Loading skeleton -->
            <div v-if="manageUsersBusy" class="members-skeleton">
              <div v-for="n in 6" :key="n" class="member-row member-row-skel">
                <div class="member-avatar-skel shimmer"></div>
                <div class="member-main">
                  <div class="skel-line skel-line-lg shimmer mb-1"></div>
                  <div class="skel-line skel-line-sm shimmer mb-2"></div>
                  <div class="member-stats">
                    <div class="stat-pill skel-pill shimmer"></div>
                    <div class="stat-pill skel-pill shimmer"></div>
                    <div class="stat-pill skel-pill shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="manageUsersError" class="alert alert-danger mb-0" role="alert">
              <i class="bi bi-exclamation-triangle me-1"></i>
              {{ manageUsersError }}
            </div>

            <!-- Empty -->
            <div v-else-if="allUsers.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-people me-1"></i>
              No users found.
            </div>

            <!-- List -->
            <div v-else class="members-list">
              <div
                v-for="u in allUsers"
                :key="u.id"
                class="member-row"
              >
                <div class="member-avatar-wrap">
                  <div
                    v-if="u.profile_img"
                    class="member-avatar"
                    :style="{ backgroundImage: `url('${u.profile_img}')` }"
                  ></div>
                  <div
                    v-else
                    class="member-avatar member-avatar-fallback"
                    :style="{ backgroundImage: avatarBg(u.full_name || u.email || u.id) }"
                  >
                    <span>{{ initials(u.full_name || u.email) }}</span>
                  </div>
                </div>
                <div class="member-main">
                  <div class="member-name-line">
                    <div class="member-name-email">
                      <div class="member-name">
                        {{ u.full_name || 'No name' }}
                      </div>
                      <div class="member-email">
                        {{ u.email }}
                      </div>
                    </div>
                    <div class="text-end small">
                      <div class="fw-semibold">
                        <i class="bi bi-award me-1"></i>
                        {{ tierLabel(u) }}
                      </div>
                      <div class="text-muted">
                        <i class="bi bi-calendar-event me-1"></i>
                        Joined {{ fmtDate(u.created_at) }}
                      </div>
                    </div>
                  </div>
                  <div class="member-stats mb-2">
                    <div class="stat-pill">
                      <span class="stat-label">
                        <i class="bi bi-wallet2 me-1"></i>
                        Credits
                      </span>
                      <span class="stat-value">₱{{ toMoney(u.discount_credits) }}</span>
                    </div>
                    <div class="stat-pill">
                      <span class="stat-label">
                        <i class="bi bi-cart3 me-1"></i>
                        Purchases (month)
                      </span>
                      <span class="stat-value">{{ toMoney(u.purchases_per_month) }}</span>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      :disabled="busyUserId === u.id"
                      @click="deleteUser(u)"
                    >
                      <span
                        v-if="busyUserId === u.id"
                        class="spinner-border spinner-border-sm me-1"
                      ></span>
                      <i v-else class="bi bi-trash3 me-1"></i>
                      Delete user
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      :disabled="busyUserId === u.id || !canDemote(u)"
                      @click="demoteUser(u)"
                    >
                      <i class="bi bi-arrow-down-circle me-1"></i>
                      Demote
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-primary"
                      :disabled="busyUserId === u.id || !canPromote(u)"
                      @click="promoteUser(u)"
                    >
                      <i class="bi bi-arrow-up-circle me-1"></i>
                      Promote
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <div class="me-auto small text-muted">
              Total users: {{ allUsers.length }}
            </div>
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-x-circle me-1"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router' // NEW: to read query param

const route = useRoute() // NEW

const BUCKET = 'tier_icons'

/* SweetAlert helpers */
const swSuccess = (message: string, title = 'All set!') =>
  Swal.fire({ icon: 'success', title, text: message })
const swError = (message: string, title = 'Something went wrong') =>
  Swal.fire({ icon: 'error', title, text: message })

const page = ref(1)
const pageSize = 10
const q = ref('')
const total = ref(0)
const tiers = ref<any[]>([])

const busy = ref({ load: false, save: false, del: false })
const error = ref('')
const notice = ref('')

let modalTier: any = null
let modalDelete: any = null
let modalMembers: any = null
let modalManageUsers: any = null

const form = ref<any>(resetForm())
const selected = ref<any | null>(null)

const iconFile = ref<File | null>(null)
const iconPreview = ref<string | null>(null)
const iconInput = ref<HTMLInputElement | null>(null)

const memberCounts = reactive<Record<string, number>>({})

/* NEW: members modal state */
type TierMember = {
  id: string
  full_name: string | null
  email: string
  profile_url: string | null
  profile_img: string | null
  discount_credits: number
  purchases_per_month: number
  referral_count: number
  created_at: string
}
const membersTier = ref<any | null>(null)
const members = ref<TierMember[]>([])
const membersBusy = ref(false)
const membersError = ref('')

/* NEW: manage-all-users modal state */
type ManageUser = {
  id: string
  full_name: string | null
  email: string
  profile_url: string | null
  profile_img: string | null
  membership_id: string | null
  discount_credits: number
  purchases_per_month: number
  created_at: string
}
const allUsers = ref<ManageUser[]>([])
const manageUsersBusy = ref(false)
const manageUsersError = ref('')
const busyUserId = ref<string | null>(null)

/* Profile image signed URL helpers */
const PROFILE_BUCKET = 'user_profile'
const signedUrlCache = new Map<string, string>()
const SIGNED_URL_EXPIRES_IN = 60 * 60

async function buildProfileSignedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null
  if (signedUrlCache.has(path)) return signedUrlCache.get(path) || null
  try {
    const { data, error } = await supabase.storage
      .from(PROFILE_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN)
    if (error) {
      const pub = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path)?.data?.publicUrl ?? null
      signedUrlCache.set(path, pub || '')
      return pub
    }
    const url = data?.signedUrl || null
    signedUrlCache.set(path, url || '')
    return url
  } catch {
    const pub = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path)?.data?.publicUrl ?? null
    signedUrlCache.set(path, pub || '')
    return pub
  }
}

/* Initials + avatar background for fallback */
function initials(name: string | null | undefined): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || 'U'
}
function avatarBg(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 75% 55%))`
}

function resetForm() {
  return {
    id: null,
    membership_name: '',
    membership_tier_order: 0,
    purchases_count: 0,
    referral_count_requirements: 0,
    purchases_per_referrals: 0,
    discount_credits: '0.00',
    discount_per_purchase: '0.00',
    discount_per_purchase_mode: 'peso',
    is_free_delivery: false,
    purchase_requirements_for_free_delivery: 0,
    icon_url: null,
    _icon_signed_url: null,
  }
}

function toMoney(n: any) {
  const num = Number(n ?? 0)
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function toPercent(v: any) {
  const num = Number(v ?? 0)
  return `${toMoney(num)} %`
}

function fmtDate(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleString()
}

/* Sort: highest order first (diamond expected 5) */
const displayTiers = computed(() =>
  [...(tiers.value || [])].sort(
    (a, b) => Number(b?.membership_tier_order ?? 0) - Number(a?.membership_tier_order ?? 0),
  ),
)

/* Ascending tiers for promote/demote logic */
const tiersAscending = computed(() =>
  [...(tiers.value || [])].sort(
    (a, b) => Number(a?.membership_tier_order ?? 0) - Number(b?.membership_tier_order ?? 0),
  ),
)

/* Diamond detection */
function isDiamond(t: any) {
  return (
    /diamond/i.test(String(t?.membership_name ?? '')) || Number(t?.membership_tier_order ?? 0) >= 5
  )
}

/* Tier theme class (controls CSS vars) */
function skinClass(t: any) {
  const name = String(t?.membership_name ?? '').toLowerCase()
  if (name.includes('diamond')) return 'is-diamond'
  if (name.includes('platinum')) return 'is-platinum'
  if (name.includes('gold')) return 'is-gold'
  if (name.includes('silver')) return 'is-silver'
  return 'is-regular'
}

/* --- STAIR LOGIC: map order (1..5) -> vertical offset class --- */
function stairClass(t: any) {
  const o = Math.max(1, Math.min(5, Number(t?.membership_tier_order ?? 1)))
  return `stair-${o}`
}

/* Debounced search */
let timer: any = null
function debouncedSearch() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load(true)
  }, 300)
}

async function createSignedUrlOrNull(path: string | null, seconds = 3600) {
  try {
    if (!path) return null
    const { data, error: e } = await supabase.storage.from(BUCKET).createSignedUrl(path, seconds)
    if (e) return null
    return data?.signedUrl ?? null
  } catch {
    return null
  }
}

async function hydrateSignedIcons(rows: any[]) {
  const out = await Promise.all(
    rows.map(async (r) => {
      const url = await createSignedUrlOrNull(r.icon_url, 3600)
      return { ...r, _icon_signed_url: url }
    }),
  )
  return out
}

async function fetchMemberCounts(tierIds: string[]) {
  for (const k of Object.keys(memberCounts)) delete memberCounts[k]
  if (!tierIds.length) return
  for (const id of tierIds) {
    const { count, error: cErr } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('membership_id', id)
    memberCounts[id] = cErr ? 0 : Number(count || 0)
  }
}

async function load(reset = false) {
  error.value = ''
  if (reset) page.value = 1
  busy.value.load = true
  try {
    const from = (page.value - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .schema('membership')
      .from('tiers')
      .select('*', { count: 'exact' })
      .order('membership_tier_order', { ascending: true })
      .range(from, to)

    if (q.value) query = query.ilike('membership_name', `%${q.value}%`)

    const { data, error: err, count } = await query
    if (err) throw err

    tiers.value = await hydrateSignedIcons(data ?? [])
    total.value = count ?? tiers.value.length

    const ids = (tiers.value || []).map((t: any) => t.id).filter(Boolean)
    await fetchMemberCounts(ids)
    for (const id of ids) if (memberCounts[id] == null) memberCounts[id] = 0
  } catch (e: any) {
    error.value = e?.message || 'Failed to load tiers.'
    swError('We couldn’t load your membership tiers right now. Please try again in a moment.')
  } finally {
    busy.value.load = false
  }
}

function openCreate() {
  form.value = resetForm()
  iconFile.value = null
  iconPreview.value = null
  const el = document.getElementById('tierModal')
  if (!el) return
  modalTier = (window as any).bootstrap?.Modal.getOrCreateInstance(el)
  modalTier?.show()
}

function openEdit(row: any) {
  form.value = {
    ...row,
    discount_credits: Number(row.discount_credits ?? 0).toFixed(2),
    discount_per_purchase: Number(row.discount_per_purchase ?? 0).toFixed(2),
    discount_per_purchase_mode: 'peso',
    _icon_signed_url: row._icon_signed_url ?? null,
  }
  iconFile.value = null
  iconPreview.value = null
  const el = document.getElementById('tierModal')
  if (!el) return
  modalTier = (window as any).bootstrap?.Modal.getOrCreateInstance(el)
  modalTier?.show()
}

function onIconPicked(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input?.files?.length) return
  const f = input.files[0]
  iconFile.value = f
  if (iconPreview.value) URL.revokeObjectURL(iconPreview.value)
  iconPreview.value = URL.createObjectURL(f)
}

function clearIcon() {
  iconFile.value = null
  if (iconPreview.value) {
    URL.revokeObjectURL(iconPreview.value)
    iconPreview.value = null
  }
  if (iconInput.value) iconInput.value.value = ''
}

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, '_')
}

async function uploadIconForTier(tierId: string) {
  if (!iconFile.value) return null
  const f = iconFile.value
  const filename = `${Date.now()}_${sanitizeFilename(f.name)}`
  const path = `${tierId}/${filename}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f, {
    upsert: true,
    contentType: f.type || 'application/octet-stream',
  })
  if (upErr) throw upErr
  return path
}

async function deleteIconPath(path: string | null) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

async function deleteAllIconsForTier(tierId: string) {
  const limit = 100
  let offset = 0
  while (true) {
    const { data, error: listErr } = await supabase.storage.from(BUCKET).list(tierId, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (listErr) throw listErr
    if (!data || data.length === 0) break
    const paths = data.map((entry) => `${tierId}/${entry.name}`)
    const { error: remErr } = await supabase.storage.from(BUCKET).remove(paths)
    if (remErr) throw remErr
    if (data.length < limit) break
    offset += limit
  }
}

async function save() {
  busy.value.save = true
  error.value = ''
  notice.value = ''
  try {
    const rawDisc = Number(form.value.discount_per_purchase ?? 0)
    let discountPerPurchase = rawDisc
    if (form.value.discount_per_purchase_mode === 'percent') {
      if (rawDisc < 0 || rawDisc > 100) {
        throw new Error('Percentage discount per purchase must be between 0 and 100.')
      }
      discountPerPurchase = rawDisc
    }

    const payload = {
      membership_name: form.value.membership_name,
      membership_tier_order: Number(form.value.membership_tier_order) || 0,
      purchases_count: Number(form.value.purchases_count) || 0,
      referral_count_requirements: Number(form.value.referral_count_requirements) || 0,
      purchases_per_referrals: Number(form.value.purchases_per_referrals) || 0,
      discount_credits: Number(form.value.discount_credits ?? 0),
      discount_per_purchase: Number(discountPerPurchase ?? 0),
      is_free_delivery: !!form.value.is_free_delivery,
      purchase_requirements_for_free_delivery:
        Number(form.value.purchase_requirements_for_free_delivery) || 0,
    }

    if (!form.value.id) {
      const { data: created, error: insErr } = await supabase
        .schema('membership')
        .from('tiers')
        .insert([payload])
        .select('id')
        .single()
      if (insErr) throw insErr
      const newId = created.id as string

      if (iconFile.value) {
        const iconPath = await uploadIconForTier(newId)
        const { error: updIconErr } = await supabase
          .schema('membership')
          .from('tiers')
          .update({ icon_url: iconPath })
          .eq('id', newId)
        if (updIconErr) throw updIconErr
      }

      notice.value = 'Tier created.'
      swSuccess('Your new tier has been created successfully.', 'Tier created')
    } else {
      const { error: updErr } = await supabase
        .schema('membership')
        .from('tiers')
        .update(payload)
        .eq('id', form.value.id)
      if (updErr) throw updErr

      if (iconFile.value) {
        await deleteIconPath(form.value.icon_url || null)
        const iconPath = await uploadIconForTier(form.value.id)
        const { error: updIconErr } = await supabase
          .schema('membership')
          .from('tiers')
          .update({ icon_url: iconPath })
          .eq('id', form.value.id)
        if (updIconErr) throw updErr
      }

      notice.value = 'Tier updated.'
      swSuccess('Your changes have been saved.', 'Tier updated')
    }

    clearIcon()
    modalTier?.hide()
    await load()
  } catch (e: any) {
    error.value = e?.message || 'Save failed.'
    swError('We couldn’t save this tier. Please review the details and try again.')
  } finally {
    busy.value.save = false
  }
}

function openDelete(row: any) {
  selected.value = row
  const el = document.getElementById('deleteModal')
  if (!el) return
  modalDelete = (window as any).bootstrap?.Modal.getOrCreateInstance(el)
  modalDelete?.show()
}

async function del() {
  if (!selected.value?.id) return
  busy.value.del = true
  error.value = ''
  notice.value = ''
  try {
    const tierId = selected.value.id as string
    try {
      await deleteAllIconsForTier(tierId)
    } catch {}
    const { error: delErr } = await supabase
      .schema('membership')
      .from('tiers')
      .delete()
      .eq('id', tierId)
    if (delErr) throw delErr

    notice.value = 'Tier deleted.'
    swSuccess('The tier has been removed successfully.', 'Tier deleted')
    modalDelete?.hide()
    await load()
  } catch (e: any) {
    error.value = e?.message || 'Delete failed.'
    swError('We couldn’t delete this tier. Please try again in a moment.')
  } finally {
    busy.value.del = false
  }
}

/* NEW: open members modal and load users in that tier */
async function openMembers(row: any) {
  membersTier.value = row
  members.value = []
  membersError.value = ''
  membersBusy.value = true

  const el = document.getElementById('membersModal')
  if (!el) {
    membersBusy.value = false
    return
  }
  modalMembers = (window as any).bootstrap?.Modal.getOrCreateInstance(el)
  modalMembers?.show()

  try {
    // 1) Load users in this tier
    const { data: usersData, error: usersErr } = await supabase
      .from('users')
      .select(
        'id,email,full_name,profile_url,discount_credits,purchases_per_month,created_at',
      )
      .eq('membership_id', row.id)
      .order('created_at', { ascending: true })

    if (usersErr) throw usersErr

    const raw = (usersData || []) as Array<{
      id: string
      email: string
      full_name: string | null
      profile_url: string | null
      discount_credits: any
      purchases_per_month: any
      created_at: string
    }>

    if (raw.length === 0) {
      members.value = []
      return
    }

    const ids = raw.map((u) => u.id)

    // 2) Count referrals per user in one go
    const referralCounts: Record<string, number> = {}
    const { data: refData, error: refErr } = await supabase
      .from('referrals')
      .select('referrer_id')
      .in('referrer_id', ids)

    if (!refErr && refData) {
      for (const r of refData as Array<{ referrer_id: string }>) {
        const id = r.referrer_id
        referralCounts[id] = (referralCounts[id] ?? 0) + 1
      }
    }

    // 3) Build profile URLs
    const avatarUrls = await Promise.all(
      raw.map((u) => buildProfileSignedUrl(u.profile_url)),
    )

    members.value = raw.map((u, i) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      profile_url: u.profile_url,
      profile_img: avatarUrls[i] || null,
      discount_credits: Number(u.discount_credits ?? 0),
      purchases_per_month: Number(u.purchases_per_month ?? 0),
      referral_count: referralCounts[u.id] ?? 0,
      created_at: u.created_at,
    }))
  } catch (e: any) {
    membersError.value =
      'We had trouble loading members for this tier. Please try again in a moment.'
    swError(
      'We had trouble loading the members for this tier. Please close the window and try again.',
    )
  } finally {
    membersBusy.value = false
  }
}

/* ====== Helpers for Manage Users modal ====== */

function userTier(u: { membership_id: string | null }) {
  if (!u.membership_id) return null
  return (tiers.value || []).find((t: any) => t.id === u.membership_id) || null
}

function tierLabel(u: ManageUser) {
  const t = userTier(u)
  if (!t) return 'No tier'
  const ord = t.membership_tier_order != null ? `#${t.membership_tier_order} ` : ''
  return `${ord}${t.membership_name ?? ''}`.trim()
}

function canPromote(u: ManageUser) {
  if (!tiersAscending.value.length) return false
  const arr = tiersAscending.value
  const idx = arr.findIndex((t: any) => t.id === u.membership_id)
  if (idx === -1) return arr.length > 0
  return idx < arr.length - 1
}

function canDemote(u: ManageUser) {
  if (!tiersAscending.value.length) return false
  const arr = tiersAscending.value
  const idx = arr.findIndex((t: any) => t.id === u.membership_id)
  return idx > 0
}

async function loadAllUsers() {
  manageUsersBusy.value = true
  manageUsersError.value = ''
  try {
    const { data, error: usersErr } = await supabase
      .from('users')
      .select(
        'id,email,full_name,profile_url,discount_credits,purchases_per_month,membership_id,created_at',
      )
      .order('created_at', { ascending: true })
    if (usersErr) throw usersErr

    const raw =
      (data as Array<{
        id: string
        email: string
        full_name: string | null
        profile_url: string | null
        discount_credits: any
        purchases_per_month: any
        membership_id: string | null
        created_at: string
      }>) || []

    const avatarUrls = await Promise.all(raw.map((u) => buildProfileSignedUrl(u.profile_url)))

    allUsers.value = raw.map((u, i) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      profile_url: u.profile_url,
      profile_img: avatarUrls[i] || null,
      membership_id: u.membership_id,
      discount_credits: Number(u.discount_credits ?? 0),
      purchases_per_month: Number(u.purchases_per_month ?? 0),
      created_at: u.created_at,
    }))
  } catch (e: any) {
    manageUsersError.value = e?.message || 'Failed to load users.'
    swError(
      'We couldn’t load the users list right now. Please close this window and try again later.',
    )
  } finally {
    manageUsersBusy.value = false
  }
}

function openManageUsers() {
  manageUsersError.value = ''
  allUsers.value = []
  const el = document.getElementById('manageUsersModal')
  if (!el) return
  modalManageUsers = (window as any).bootstrap?.Modal.getOrCreateInstance(el)
  modalManageUsers?.show()
  void loadAllUsers()
}

async function updateUserTier(u: ManageUser, newTierId: string | null) {
  if (busyUserId.value) return
  busyUserId.value = u.id
  try {
    const { error: updErr } = await supabase
      .from('users')
      .update({ membership_id: newTierId })
      .eq('id', u.id)
    if (updErr) throw updErr
    u.membership_id = newTierId
    swSuccess('User tier has been updated.', 'Tier updated')
  } catch (e: any) {
    swError('We couldn’t update this user’s tier. Please try again.', 'Update failed')
  } finally {
    busyUserId.value = null
  }
}

async function promoteUser(u: ManageUser) {
  if (!tiersAscending.value.length) return
  const arr = tiersAscending.value
  const idx = arr.findIndex((t: any) => t.id === u.membership_id)
  let targetTier: any | null = null

  if (idx === -1) {
    // No tier yet -> move to lowest tier
    targetTier = arr[0]
  } else if (idx < arr.length - 1) {
    targetTier = arr[idx + 1]
  } else {
    swError('This user is already at the highest tier.', 'No higher tier')
    return
  }

  await updateUserTier(u, targetTier.id)
}

async function demoteUser(u: ManageUser) {
  if (!tiersAscending.value.length) return
  const arr = tiersAscending.value
  const idx = arr.findIndex((t: any) => t.id === u.membership_id)

  if (idx <= 0) {
    swError('This user is already at the lowest tier or has no tier.', 'No lower tier')
    return
  }

  const targetTier = arr[idx - 1]
  await updateUserTier(u, targetTier.id)
}

/* UPDATED: deleteUser now calls admin_delete_user edge function */
async function deleteUser(u: ManageUser) {
  const res = await Swal.fire({
    icon: 'warning',
    title: 'Delete user?',
    text: `Are you sure you want to delete ${u.full_name || u.email}? This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc3545',
  })
  if (!res.isConfirmed) return

  busyUserId.value = u.id
  try {
    const { data, error } = await supabase.functions.invoke('admin_delete_user', {
      body: { user_id: u.id },
    })

    if (error || (data as any)?.error) {
      const msg = (error as any)?.message || (data as any)?.error || 'Failed to delete user'
      throw new Error(msg)
    }

    allUsers.value = allUsers.value.filter((x) => x.id !== u.id)
    swSuccess('User has been deleted.', 'User deleted')
  } catch (e: any) {
    swError(
      e?.message || 'We couldn’t delete this user. Please try again in a moment.',
      'Delete failed',
    )
  } finally {
    busyUserId.value = null
  }
}

/* MOUNT: load tiers and auto-open Manage Users when URL has ?focus=openmodal */
onMounted(() => {
  load(true)
  const focusParam = route.query.focus as string | undefined
  if (focusParam === 'openmodal') {
    // small delay to ensure modal DOM is ready
    setTimeout(() => {
      openManageUsers()
    }, 0)
  }
})
</script>

<style scoped>
/* Base height/alignment */
.card-fixed {
  min-height: 520px;
  display: flex;
}

/* Clickable tier card */
.tier-clickable {
  cursor: pointer;
}

/* -------- STAIR OFFSETS -------- */
.stairs-row {
  --st1: 56px;
  --st2: 42px;
  --st3: 28px;
  --st4: 14px;
  --st5: 0px;
}
.stair {
  transition: transform 0.25s ease;
}
.stair-1 {
  transform: translateY(var(--st1));
}
.stair-2 {
  transform: translateY(var(--st2));
}
.stair-3 {
  transform: translateY(var(--st3));
}
.stair-4 {
  transform: translateY(var(--st4));
}
.stair-5 {
  transform: translateY(var(--st5));
}

/* Mobile/tablet: flatten stairs for readability */
@media (max-width: 1199.98px) {
  .stair-1,
  .stair-2,
  .stair-3,
  .stair-4,
  .stair-5 {
    transform: none;
  }
}

/* ========== THEME BINDINGS ========== */
.tier-hero-compact {
  --fx-a: #ffffff;
  --fx-b: #fafbfc;
  --fx-line: rgba(0, 0, 0, 0.08);
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

/* Card styles */
.pricing-vert {
  background: linear-gradient(180deg, var(--fx-a), var(--fx-b));
  border: 1px solid var(--fx-line);
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.pricing-vert:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(16, 24, 40, 0.1);
}

/* Header bits */
.pricing-icon-vert {
  width: 64px;
  height: 64px;
  object-fit: cover;
}
.pricing-rank {
  font-weight: 700;
  color: #64748b;
  font-size: 0.85rem;
}

/* Features list */
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.pricing-features li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid var(--fx-line);
  border-radius: 0.5rem;
}
.pricing-features strong {
  color: #475569;
}

/* Diamond emphasis */
.diamond-glow {
  position: relative;
  box-shadow:
    0 0 0 1px rgba(0, 210, 255, 0.28) inset,
    0 16px 44px rgba(0, 210, 255, 0.18),
    0 8px 18px rgba(0, 0, 0, 0.06);
}
.diamond-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 1rem;
  background: conic-gradient(
    from 0deg,
    rgba(0, 210, 255, 0.25),
    rgba(99, 102, 241, 0.2),
    rgba(0, 210, 255, 0.25)
  );
  filter: blur(16px);
  z-index: 0;
  animation: spin 6s linear infinite;
  opacity: 0.45;
}
.diamond-glow > .card-body {
  position: relative;
  z-index: 1;
}

/* Ribbon */
.ribbon-popular {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #00d2ff, #3b82f6);
  color: #fff;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.35);
  z-index: 2;
}

/* Manage button tinted by theme */
.btn-manage {
  border: 1px solid var(--fx-line);
  color: #0b6070;
  background: rgba(255, 255, 255, 0.6);
}
.btn-manage:hover {
  background: #0b6070;
  color: #fff;
  border-color: #0b6070;
}

/* Stronger CTA for Diamond */
.btn-diamond {
  background: linear-gradient(90deg, #00d2ff, #3b82f6);
  border: none;
  color: #fff;
  box-shadow: 0 8px 22px rgba(59, 130, 246, 0.35);
}
.btn-diamond:hover {
  filter: brightness(1.02);
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.45);
}
.btn-group {
  top: 60px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Tighten gutters on phones (already g-2 via row) */
@media (max-width: 575.98px) {
  .card-fixed {
    min-height: 440px;
  } /* shorter cards on phones */
  .pricing-icon-vert {
    width: 52px;
    height: 52px;
  }
  .pricing-features {
    gap: 0.3rem;
  }
  .pricing-features li {
    padding: 0.4rem 0.5rem;
  }
  .ribbon-popular {
    font-size: 0.7rem;
    padding: 0.25rem 0.7rem;
    top: -8px;
  }
}

/* Tablets */
@media (min-width: 576px) and (max-width: 991.98px) {
  .card-fixed {
    min-height: 480px;
  } /* moderate height */
  .pricing-icon-vert {
    width: 58px;
    height: 58px;
  }
}

/* Flatten stairs on <= lg for readability (you already had this, keep it) */
@media (max-width: 1199.98px) {
  .stair-1,
  .stair-2,
  .stair-3,
  .stair-4,
  .stair-5 {
    transform: none;
  }
}

/* ====== Breath-in animation (per section) ====== */
.breath-in-section {
  opacity: 0;
  transform: translateY(6px) scale(0.99);
  animation: breathIn 0.25s ease-out forwards;
}
@keyframes breathIn {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ====== Skeleton for loading tiers ====== */
.skeleton-card {
  background: #f8fafc;
  overflow: hidden;
}
.skeleton-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.skel-badge {
  width: 72px;
  height: 16px;
  border-radius: 999px;
  background: #e2e8f0;
}
.skel-circle {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: #e2e8f0;
}
.skel-line {
  border-radius: 999px;
  background: #e2e8f0;
}
.skel-line-lg {
  width: 70%;
  height: 14px;
}
.skel-line-sm {
  width: 50%;
  height: 10px;
}
.skel-line-xs {
  width: 32%;
  height: 10px;
}
.skeleton-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.skel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
}
.skel-btn {
  width: 100%;
  max-width: 140px;
  height: 32px;
  border-radius: 999px;
  background: #e2e8f0;
}

/* ====== Members modal layout ====== */
.members-modal {
  border-radius: 1rem;
  overflow: hidden;
}

.members-list {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;
}

.member-row {
  display: flex;
  gap: 0.9rem;
  padding: 0.65rem 0.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}
.member-row:last-child {
  border-bottom: none;
}

.member-avatar-wrap {
  flex: 0 0 48px;
  display: flex;
  align-items: flex-start;
}
.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background-size: cover;
  background-position: center;
  background-color: #cbd5f5;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
}
.member-avatar-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f9fafb;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 3px rgba(15, 23, 42, 0.7);
}

.member-main {
  flex: 1;
  min-width: 0;
}

.member-name-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}
.member-name-email {
  min-width: 0;
}
.member-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.member-email {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.member-joined {
  white-space: nowrap;
}

.member-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: #f1f5f9;
  font-size: 0.75rem;
  white-space: nowrap;
}
.stat-label {
  color: #64748b;
}
.stat-value {
  font-weight: 600;
  color: #0f172a;
}

/* Members skeleton */
.member-row-skel {
  align-items: center;
}
.member-avatar-skel {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #e2e8f0;
}
.skel-pill {
  width: 96px;
  height: 20px;
  border-radius: 999px;
  background: #e2e8f0;
}
.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
