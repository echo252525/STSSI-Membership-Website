<template>
  <div class="container-fluid py-3 discounts-page">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
      <div>
        <h1 class="h4 m-0 d-flex align-items-center gap-2">
          <i class="bi bi-ticket-perforated text-primary"></i>
          Discounts
        </h1>
        <p class="text-muted small mb-0">Create, manage, and track discount codes and credits.</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="busy.load"
          @click="load"
        >
          <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
        <button class="btn btn-primary btn-sm" @click="openEditor()">
          <i class="bi bi-plus-lg me-1"></i>
          New Discount
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm rounded-4 mb-3 filters-card">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label small mb-1">Search</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model.trim="query.search"
                type="text"
                class="form-control"
                placeholder="Title or code…"
                @keydown.enter="load"
              />
            </div>
          </div>

          <!-- Status filter -->
          <div class="col-6 col-md-3">
            <label class="form-label small mb-1">Status</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light">
                <i class="bi bi-traffic-light"></i>
              </span>
              <select v-model="query.status" class="form-select">
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <!-- Type filter -->
          <div class="col-6 col-md-3">
            <label class="form-label small mb-1">Type</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light">
                <i class="bi bi-percent"></i>
              </span>
              <select v-model="query.type" class="form-select">
                <option value="">All</option>
                <option value="percent">% Percentage</option>
                <option value="fixed_amount">₱ Fixed Amount</option>
              </select>
            </div>
          </div>

          <div class="col-12 col-md-2 d-grid">
            <button class="btn btn-outline-primary btn-sm" @click="load">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="card border-0 shadow-sm rounded-4 list-card">
      <div class="card-body p-3">
        <!-- Loading -->
        <div v-if="busy.load" class="row g-3">
          <div v-for="n in 4" :key="n" class="col-12 col-md-6 col-xl-3">
            <div class="discount-card skeleton">
              <div class="skeleton-line w-50 mb-2"></div>
              <div class="skeleton-line w-75 mb-3"></div>
              <div class="skeleton-line w-25 mb-2"></div>
              <div class="skeleton-pill w-50 mb-1"></div>
              <div class="skeleton-pill w-25"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="items.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-percent fs-2 d-block mb-2"></i>
          No discounts found.
        </div>

        <!-- Grid -->
        <div v-else class="row g-3 discount-grid">
          <div
            v-for="d in items"
            :key="d.id"
            class="col-12 col-md-6 col-xl-4"
          >
            <div class="discount-card h-100 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div class="flex-grow-1">
                  <h6 class="mb-0 d-flex align-items-center gap-2">
                    <span class="title-text" :title="d.title">{{ d.title }}</span>
                    <span
                      class="badge rounded-pill"
                      :class="badgeClass(computedStatus(d, d.expires_at))"
                    >
                      {{ computedStatus(d, d.expires_at) }}
                    </span>
                  </h6>
                  <p class="text-muted small mb-1 line-clamp-2" :title="d.description">{{ d.description }}</p>
                  <p class="small mb-0">
                    <span v-if="d.code" class="badge text-bg-light border">
                      <i class="bi bi-upc me-1"></i>{{ d.code }}
                    </span>
                    <span v-else class="text-muted small">No code</span>
                  </p>
                </div>

                <!-- REPLACED DROPDOWN with inline buttons -->
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="openEditor(d)"
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    type="button"
                    @click="remove(d)"
                    :disabled="busy.deleteId === d.id"
                    title="Delete"
                  >
                    <span
                      v-if="busy.deleteId === d.id"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
                <!-- /inline buttons -->
              </div>

              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="value-bubble" :class="d.type === 'percent' ? 'percent' : 'amount'">
                  <span v-if="d.type === 'percent'">
                    {{ formatNumber(d.percent_off) }}%
                  </span>
                  <span v-else>
                    ₱{{ formatNumber(d.amount_off) }}
                  </span>
                </div>
                <div class="flex-grow-1">
                  <div class="small text-muted">Type</div>
                  <div class="fw-semibold text-capitalize">{{ uiTypeLabel(d.type) }}</div>
                  <div
                    v-if="d.type === 'percent' && d.max_discount_amount"
                    class="text-muted small mt-1 d-flex align-items-center gap-1"
                  >
                    <i class="bi bi-shield-check"></i>
                    Cap ₱{{ formatNumber(d.max_discount_amount) }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex flex-wrap gap-1">
                  <span
                    v-if="d.product_id"
                    class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                  >
                    <i class="bi bi-box-seam me-1"></i>Product-only
                  </span>
                  <span
                    v-if="d.min_subtotal && d.min_subtotal > 0"
                    class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                  >
                    <i class="bi bi-cash-coin me-1"></i>Min ₱{{ formatNumber(d.min_subtotal) }}
                  </span>
                  <span
                    class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                  >
                    <i class="bi bi-layers me-1"></i>Exclusive
                  </span>
                  <span
                    v-if="d.max_uses_global"
                    class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                  >
                    <i class="bi bi-people me-1"></i>{{ d.max_uses_global }} global
                  </span>
                  <span
                    v-if="d.max_uses_per_user"
                    class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                  >
                    <i class="bi bi-person-check me-1"></i>{{ d.max_uses_per_user }}/user
                  </span>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between mt-auto pt-2 border-top small text-muted gap-2">
                <div>
                  <i class="bi bi-calendar-event"></i>
                  {{ d.starts_at ? fmtDate(d.starts_at) : '—' }}
                  <span v-if="d.expires_at">→ {{ fmtDate(d.expires_at) }}</span>
                </div>
                <div class="text-end">
                  <i class="bi bi-lightning-charge text-warning"></i>
                  {{ d.redemptions_count ?? 0 }} used
                  <div class="text-muted tiny-text">
                    {{ (d.redemptions_count ?? 0) === 1 ? '1 user has used this discount' : (d.redemptions_count ?? 0) + ' users have used this discount' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="!busy.load && items.length > 0"
          class="d-flex align-items-center justify-content-between pt-3 mt-2 border-top"
        >
          <div class="small text-muted">
            Showing <strong>{{ items.length }}</strong>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline-secondary btn-sm" :disabled="!canPrev" @click="prev">Prev</button>
            <button class="btn btn-outline-secondary btn-sm" :disabled="!canNext" @click="next">Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <div class="modal fade" id="discountEditor" tabindex="-1" ref="editorEl">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content editor-modal">
          <div class="modal-header border-0 pb-0">
            <div>
              <h5 class="modal-title fw-semibold d-flex align-items-center gap-2">
                <i class="bi bi-magic text-primary fs-5"></i>
                {{ form.id ? 'Edit Discount' : 'New Discount' }}
              </h5>
              <p class="text-muted small mb-0">
                Only percent and fixed amount discounts. Description is required.
              </p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div class="modal-body pt-3">
            <!-- Section: Basic Info -->
            <p class="text-uppercase small text-muted mb-2 fw-semibold">Basic Information</p>
            <div class="row g-3 mb-3">
              <div class="col-12">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-type text-primary"></i>
                  Title
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-megaphone"></i>
                  </span>
                  <input
                    v-model.trim="form.title"
                    type="text"
                    class="form-control"
                    placeholder="E.g., Payday Sale 10%"
                  />
                </div>
              </div>

              <div class="col-12">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-textarea-t text-primary"></i>
                  Description <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-card-text"></i>
                  </span>
                  <textarea
                    v-model.trim="form.description"
                    class="form-control"
                    rows="2"
                    placeholder="Describe what this discount is for…"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Section: Discount Rule -->
            <p class="text-uppercase small text-muted mb-2 fw-semibold mt-2">Discount Rule</p>
            <div class="row g-3 mb-3">
              <!-- Type -->
              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-tags text-primary"></i>
                  Type
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-tags"></i>
                  </span>
                  <select v-model="form.type" class="form-select">
                    <option value="percent">% Percentage</option>
                    <option value="fixed_amount">₱ Fixed Amount</option>
                  </select>
                </div>
              </div>

              <!-- Value -->
              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-123 text-primary"></i>
                  Value
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light" v-if="form.type === 'fixed_amount'">₱</span>
                  <span class="input-group-text bg-light" v-else>
                    <i class="bi bi-percent"></i>
                  </span>
                  <input
                    v-model.number="form.value"
                    :type="'number'"
                    :min="form.type === 'percent' ? 0.01 : 0"
                    :max="form.type === 'percent' ? 100 : undefined"
                    step="0.01"
                    class="form-control no-spinner"
                    :placeholder="form.type === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 250.00'"
                  />
                </div>
              </div>

              <!-- Code -->
              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-upc-scan text-primary"></i>
                  Code (optional)
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-upc"></i>
                  </span>
                  <input v-model.trim="form.code" type="text" class="form-control" placeholder="E.g., PAYDAY10" />
                </div>
                <div class="form-text">Unique (case-insensitive) if provided.</div>
              </div>

              <!-- Max discount cap (optional) -->
              <div class="col-12 col-md-6" v-if="form.type === 'percent'">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-shield-check text-primary"></i>
                  Max Discount Cap
                  <span class="badge bg-body-secondary text-secondary border small">Optional</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">₱</span>
                  <input
                    v-model.number="form.max_discount_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control no-spinner"
                    placeholder="e.g. 150.00"
                  />
                </div>
                <div class="form-text">If set, the percentage discount won’t exceed this amount.</div>
              </div>
            </div>

            <!-- Section: Applicability -->
            <p class="text-uppercase small text-muted mb-2 fw-semibold mt-2">Applicability</p>
            <div class="row g-3 mb-3">
              <!-- product dropdown -->
              <div class="col-12 col-md-6 position-relative" ref="pickerEl">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-box-seam text-primary"></i>
                  Applicable Product
                  <span class="badge bg-body-secondary text-secondary border small">Optional</span>
                </label>

                <div class="input-group product-picker-trigger" @click.stop="toggleProductDropdown">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-box2"></i>
                  </span>
                  <button type="button" class="form-control d-flex align-items-center justify-content-between gap-2">
                    <div class="d-flex align-items-center gap-2 text-start">
                      <div class="picker-thumb">
                        <img
                          v-if="selectedProduct?.signed_url"
                          :src="selectedProduct.signed_url"
                          alt="product"
                        />
                        <img
                          v-else-if="selectedProduct?.product_url && selectedProduct.product_url.length"
                          :src="selectedProduct.product_url[0]"
                          alt="product"
                        />
                        <div v-else class="empty-thumb">
                          <i class="bi bi-image text-muted"></i>
                        </div>
                      </div>
                      <div class="picker-label">
                        <span v-if="selectedProduct">{{ selectedProduct.name }}</span>
                        <span v-else class="text-muted">All products</span>
                      </div>
                    </div>
                    <i class="bi" :class="productDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </button>
                  <button
                    v-if="selectedProduct"
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    @click.stop="clearProduct"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>

                <div
                  v-if="productDropdownOpen"
                  class="product-dropdown shadow-sm rounded-3"
                >
                  <div
                    class="product-dropdown-item"
                    @click="selectProduct(null)"
                  >
                    <div class="picker-thumb">
                      <div class="empty-thumb">
                        <i class="bi bi-grid text-muted"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <div class="fw-semibold">All products</div>
                      <div class="text-muted small">Discount will apply to any product</div>
                    </div>
                  </div>

                  <div
                    v-for="p in products"
                    :key="p.id"
                    class="product-dropdown-item"
                    @click="selectProduct(p)"
                  >
                    <div class="picker-thumb">
                      <img
                        v-if="p.signed_url"
                        :src="p.signed_url"
                        alt="p"
                      />
                      <img
                        v-else-if="p.product_url && p.product_url.length"
                        :src="p.product_url[0]"
                        alt="p"
                      />
                      <div v-else class="empty-thumb">
                        <i class="bi bi-image text-muted"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <div class="fw-semibold">{{ p.name }}</div>
                      <div class="text-muted small">
                        Stock: {{ p.stock }}
                        <span v-if="p.price">· ₱{{ formatNumber(p.price) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- hidden select to keep v-model -->
                <select v-model="form.product_id" class="d-none">
                  <option :value="null">All</option>
                  <option
                    v-for="p in products"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Section: Availability & limits -->
            <p class="text-uppercase small text-muted mb-2 fw-semibold mt-2">Availability & Limits</p>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-calendar-event text-primary"></i>
                  Starts At
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-clock"></i>
                  </span>
                  <input v-model="form.starts_at" type="datetime-local" class="form-control" />
                </div>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-calendar2-x text-primary"></i>
                  Expires At
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-hourglass-split"></i>
                  </span>
                  <input v-model="form.expires_at" type="datetime-local" class="form-control" />
                </div>
              </div>

              <!-- Status -->
              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-broadcast text-primary"></i>
                  Status
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-brightness-high"></i>
                  </span>
                  <select v-model="form.status" class="form-select">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-cash-coin text-primary"></i>
                  Min Subtotal
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">₱</span>
                  <input
                    v-model.number="form.min_subtotal"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control no-spinner"
                  />
                </div>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-people text-primary"></i>
                  Max Uses (Global)
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-people-fill"></i>
                  </span>
                  <input
                    v-model.number="form.max_uses_global"
                    type="number"
                    min="0"
                    step="1"
                    class="form-control no-spinner"
                  />
                </div>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label d-flex align-items-center gap-1">
                  <i class="bi bi-person-check text-primary"></i>
                  Max Uses per User
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light">
                    <i class="bi bi-person-badge"></i>
                  </span>
                  <input
                    v-model.number="form.max_uses_per_user"
                    type="number"
                    min="0"
                    step="1"
                    class="form-control no-spinner"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-0 pt-0">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" :disabled="busy.save" @click="save">
              <span v-if="busy.save" class="spinner-border spinner-border-sm me-2"></span>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type DbDiscount = {
  id: string
  title: string
  description: string
  code?: string | null
  type: 'percent' | 'fixed_amount'
  scope: 'order'
  percent_off?: number | null
  amount_off?: number | null
  currency: string
  min_subtotal: number
  stack: 'exclusive' | 'stackable'
  max_uses_global?: number | null
  max_uses_per_user?: number | null
  redemptions_count: number
  status: 'draft' | 'active' | 'paused' | 'scheduled' | 'expired' | 'archived'
  starts_at: string
  expires_at?: string | null
  created_at?: string
  updated_at?: string
  product_id?: string | null
  max_discount_amount?: number | null
}

type GameProduct = {
  id: string
  name: string
  product_url: string[] | null
  stock: number
  price?: number | null
  signed_url?: string | null
}

const items = ref<DbDiscount[]>([])
const products = ref<GameProduct[]>([])

const busy = ref<{ load: boolean; save: boolean; deleteId: string | null }>({
  load: false,
  save: false,
  deleteId: null,
})

const query = ref<{ search: string; status: string; type: string; page: number; pageSize: number }>({
  search: '',
  status: '',
  type: '',
  page: 1,
  pageSize: 20,
})

const canPrev = ref(false)
const canNext = ref(false)

const editorEl = ref<HTMLDivElement | null>(null)
const pickerEl = ref<HTMLElement | null>(null)

const form = ref<Partial<DbDiscount> & { value?: number; max_discount_amount?: number | null }>({
  type: 'percent',
  value: 0,
  status: 'draft',
  scope: 'order',
  currency: 'PHP',
  min_subtotal: 0,
  stack: 'exclusive',
  product_id: null,
  max_discount_amount: null,
})

const PRODUCT_BUCKET = 'prize_product'
const PRODUCT_ROOT = 'products'

function isImageByName(name: string | undefined | null) {
  if (!name) return false
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(name)
}

async function signedUrlWithCB(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) return null
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}

async function firstImagePathForProduct(productId: string): Promise<string | null> {
  try {
    const dir = `${PRODUCT_ROOT}/${productId}`
    const { data: files, error: listErr } = await supabase
      .storage.from(PRODUCT_BUCKET)
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

async function attachProductSignedUrls(list: GameProduct[]) {
  if (!list || !list.length) return
  await Promise.all(
    list.map(async (p) => {
      if (p.product_url && p.product_url.length && /^https?:\/\//i.test(p.product_url[0] || '')) {
        p.signed_url = p.product_url[0]
        return
      }
      const path = await firstImagePathForProduct(p.id)
      const signed = path ? await signedUrlWithCB(PRODUCT_BUCKET, path) : null
      p.signed_url = signed || null
    }),
  )
}

const selectedProduct = computed(() => {
  if (!form.value.product_id) return null
  return products.value.find((p) => p.id === form.value.product_id) || null
})

const productDropdownOpen = ref(false)
function toggleProductDropdown() {
  productDropdownOpen.value = !productDropdownOpen.value
}

function selectProduct(p: GameProduct | null) {
  form.value.product_id = p ? p.id : null
  productDropdownOpen.value = false
}
function clearProduct() {
  form.value.product_id = null
  productDropdownOpen.value = false
}

function formatNumber(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return '0'
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(n)
}
function fmtDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('en-PH', { hour12: true })
}
function uiTypeLabel(t: DbDiscount['type']) {
  return t === 'percent' ? 'Percent' : 'Fixed amount'
}
function computedStatus(d: DbDiscount, expires_at?: string | null) {
  if (d.status === 'expired') return 'expired'
  const nowIso = new Date().toISOString()
  if (expires_at && expires_at < nowIso) return 'expired'
  return d.status
}
function badgeClass(status: string) {
  switch (status) {
    case 'active':
      return 'text-bg-success'
    case 'draft':
    case 'scheduled':
      return 'text-bg-secondary'
    case 'paused':
      return 'text-bg-warning'
    case 'archived':
      return 'text-bg-dark'
    case 'expired':
      return 'text-bg-danger'
    default:
      return 'text-bg-secondary'
  }
}

/** local datetime to ISO */
function localToISO(dt?: string | null) {
  if (!dt) return null
  const local = new Date(dt)
  return local.toISOString()
}

async function load() {
  busy.value.load = true
  try {
    let q = supabase
      .schema('rewards')
      .from('discounts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (query.value.search) {
      const s = `%${query.value.search}%`
      q = q.or(`title.ilike.${s},code.ilike.${s}`)
    }

    if (query.value.status) {
      q = q.eq('status', query.value.status)
    }

    if (query.value.type) {
      q = q.eq('type', query.value.type)
    }

    const from = (query.value.page - 1) * query.value.pageSize
    const to = from + query.value.pageSize - 1
    q = q.range(from, to)

    const { data, error, count } = await q
    if (error) throw error

    items.value = ((data || []) as DbDiscount[]).filter(
      (d) => d.type === 'percent' || d.type === 'fixed_amount',
    )

    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / query.value.pageSize))
    canPrev.value = query.value.page > 1
    canNext.value = query.value.page < totalPages
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.load = false
  }
}

async function loadProducts() {
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,product_url,stock,price')
      .gt('stock', 0)
      .order('name', { ascending: true })
    if (error) throw error

    const rows = (data || []) as GameProduct[]
    await attachProductSignedUrls(rows)
    products.value = rows
  } catch (e) {
    console.error('loadProducts error', e)
    products.value = []
  }
}

function prev() {
  if (!canPrev.value) return
  query.value.page -= 1
  load()
}
function next() {
  if (!canNext.value) return
  query.value.page += 1
  load()
}

function openEditor(d?: DbDiscount) {
  if (d) {
    form.value = {
      ...d,
      value:
        d.type === 'percent'
          ? d.percent_off ?? undefined
          : d.type === 'fixed_amount'
            ? d.amount_off ?? undefined
            : undefined,
      product_id: d.product_id ?? null,
      max_discount_amount: d.max_discount_amount ?? null,
    }
  } else {
    form.value = {
      type: 'percent',
      value: 0,
      status: 'draft',
      title: '',
      description: '',
      code: '',
      starts_at: '',
      expires_at: '',
      scope: 'order',
      currency: 'PHP',
      min_subtotal: 0,
      stack: 'exclusive',
      max_uses_global: null,
      max_uses_per_user: null,
      product_id: null,
      max_discount_amount: null,
    }
  }
  // @ts-ignore
  const bs = (window as any).bootstrap
  if (bs && editorEl.value) {
    const m = bs.Modal.getOrCreateInstance(editorEl.value)
    m.show()
  }
}

/** Build payload */
function buildPayload(input: Partial<DbDiscount> & { value?: number; max_discount_amount?: number | null }) {
  const t: 'percent' | 'fixed_amount' = input.type || 'percent'
  const v = input.value
  let percent_off: number | null = null
  let amount_off: number | null = null
  let max_discount_amount: number | null = null

  if (!input.description || input.description.trim() === '') {
    throw new Error('Description is required.')
  }

  if (t === 'percent') {
    if (v == null || v <= 0 || v > 100) {
      throw new Error('Percentage must be greater than 0 and at most 100.')
    }
    percent_off = roundTo2(v)
    amount_off = null

    if (input.max_discount_amount != null && !Number.isNaN(input.max_discount_amount)) {
      const cap = Number(input.max_discount_amount)
      if (cap < 0) {
        throw new Error('Max discount cap must be 0 or greater.')
      }
      max_discount_amount = roundTo2(cap)
    } else {
      max_discount_amount = null
    }
  } else {
    if (v == null || v < 0) {
      throw new Error('Fixed amount must be 0 or greater.')
    }
    amount_off = roundTo2(v)
    percent_off = null
    max_discount_amount = null
  }

  const payload: any = {
    title: (input.title ?? '').trim(),
    description: (input.description ?? '').trim(),
    code: input.code ? input.code.trim() : null,
    type: t,
    scope: 'order',
    percent_off,
    amount_off,
    currency: 'PHP',
    min_subtotal: numberOrZero(input.min_subtotal),
    stack: 'exclusive',
    max_uses_global: input.max_uses_global ?? null,
    max_uses_per_user: input.max_uses_per_user ?? null,
    status: input.status ?? 'draft',
    starts_at: input.starts_at ? localToISO(input.starts_at) : new Date().toISOString(),
    expires_at: input.expires_at ? localToISO(input.expires_at) : null,
    product_id: input.product_id ? input.product_id.trim() : null,
    max_discount_amount,
  }

  if (!payload.title) throw new Error('Title is required.')

  return payload
}

function roundTo2(n: number) {
  return Math.round(n * 100) / 100
}
function numberOrZero(n: any) {
  const num = Number(n)
  if (Number.isNaN(num)) return 0
  return Math.max(0, Math.round(num * 100) / 100)
}

function isPgUniqueViolation(err: any) {
  return (
    err &&
    (err.code === '23505' ||
      (err.message && /duplicate key value|uq_rewards_discounts_code_lower/i.test(err.message)))
  )
}

function alertReadableError(e: any) {
  if (isPgUniqueViolation(e)) {
    alert('A discount with the same CODE already exists (case-insensitive). Please choose a different code.')
    return
  }
  if (e?.message) alert(e.message)
  else alert('Something went wrong. Check console for details.')
}

async function save() {
  busy.value.save = true
  try {
    const payload = buildPayload(form.value)

    let res
    if (form.value.id) {
      const id = form.value.id
      res = await supabase
        .schema('rewards')
        .from('discounts')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
    } else {
      res = await supabase
        .schema('rewards')
        .from('discounts')
        .insert(payload)
        .select()
        .single()
    }

    if (res.error) throw res.error

    await load()
    // @ts-ignore
    const bs = (window as any).bootstrap
    if (bs && editorEl.value) {
      const m = bs.Modal.getOrCreateInstance(editorEl.value)
      m.hide()
    }
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.save = false
  }
}

async function remove(d: DbDiscount) {
  if (!confirm(`Delete discount "${d.title}"?`)) return
  busy.value.deleteId = d.id
  try {
    const { error } = await supabase.schema('rewards').from('discounts').delete().eq('id', d.id)
    if (error) throw error
    await load()
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.deleteId = null
  }
}

function onWindowClick(e: Event) {
  const target = e.target as HTMLElement
  const el = pickerEl.value
  if (!el) return
  if (!el.contains(target)) {
    productDropdownOpen.value = false
  }
}

watch(
  () => form.value.product_id,
  async (newVal) => {
    if (!newVal) return
    const p = products.value.find((x) => x.id === newVal)
    if (p && !p.signed_url) {
      const path = await firstImagePathForProduct(p.id)
      p.signed_url = path ? await signedUrlWithCB(PRODUCT_BUCKET, path) : null
    }
  },
)

onMounted(async () => {
  await Promise.all([load(), loadProducts()])
  window.addEventListener('click', onWindowClick, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onWindowClick, true)
})
</script>

<style scoped>
.discounts-page {
  background: radial-gradient(circle at top, rgba(4, 156, 222, 0.05), transparent 50%), #f8fafc;
  min-height: 100vh;
}

.filters-card,
.list-card {
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.discount-grid {
  --gap: 1rem;
}

.discount-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 1.25rem;
  padding: 1rem 1.05rem 0.75rem;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.03);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-height: 12rem;
  position: relative;
}
.discount-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.value-bubble {
  width: 70px;
  height: 70px;
  border-radius: 1.1rem;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  background: #e2e8f0;
}
.value-bubble.percent {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.18), rgba(203, 213, 225, 0));
  border: 1px solid rgba(59, 130, 246, 0.15);
}
.value-bubble.amount {
  background: radial-gradient(circle, rgba(22, 163, 74, 0.16), rgba(203, 213, 225, 0));
  border: 1px solid rgba(22, 163, 74, 0.18);
}

.title-text {
  max-width: 13rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.small-badge {
  font-size: 0.6rem;
}

.editor-modal {
  border-radius: 1.5rem;
  overflow: hidden;
  background: #fff;
}
.editor-modal .modal-body {
  background: radial-gradient(circle at top, rgba(4, 156, 222, 0.04), transparent 55%), #fff;
}

/* product dropdown */
.product-picker-trigger {
  cursor: pointer;
}
.product-dropdown {
  position: absolute;
  z-index: 70;
  background: #fff;
  max-height: 230px;
  overflow-y: auto;
  width: 100%;
  margin-top: 4px;
  border: 1px solid rgba(15, 23, 42, 0.07);
}
.product-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
  transition: background 0.15s ease;
}
.product-dropdown-item:hover {
  background: rgba(4, 156, 222, 0.04);
}
.picker-thumb {
  width: 38px;
  height: 38px;
  border-radius: 0.55rem;
  overflow: hidden;
  background: #f1f5f9;
  flex: 0 0 auto;
}
.picker-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.empty-thumb {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 1rem;
}

.skeleton {
  background: linear-gradient(120deg, #edf2f7 25%, #e2e8f0 37%, #edf2f7 63%);
  background-size: 400% 100%;
  animation: shimmer 1.6s ease infinite;
  border-radius: 1.25rem;
  min-height: 10rem;
  padding: 1rem;
}
.skeleton-line {
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
}
.skeleton-pill {
  height: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
}
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

/* remove number input arrows */
input[type='number'].no-spinner::-webkit-outer-spin-button,
input[type='number'].no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'].no-spinner {
  -moz-appearance: textfield;
}

/* line clamp for description */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tiny-text {
  font-size: 0.625rem;
}

@media (max-width: 575.98px) {
  .title-text {
    max-width: 10rem;
  }
}
</style>
