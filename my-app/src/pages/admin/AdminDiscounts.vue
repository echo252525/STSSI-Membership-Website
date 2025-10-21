<template>
  <div class="container-fluid py-3">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h4 m-0">Discounts</h1>
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
    <div class="card border-0 shadow-sm rounded-4 mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label small mb-1">Search</label>
            <input
              v-model.trim="query.search"
              type="text"
              class="form-control"
              placeholder="Title or code…"
              @keydown.enter="load"
            />
          </div>

          <!-- Status filter: db has draft/active/disabled; we also provide 'expired' as a time-based filter -->
          <div class="col-6 col-md-3">
            <label class="form-label small mb-1">Status</label>
            <select v-model="query.status" class="form-select">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <!-- Type filter mapped to db enum -->
          <div class="col-6 col-md-3">
            <label class="form-label small mb-1">Type</label>
            <select v-model="query.type" class="form-select">
              <option value="">All</option>
              <option value="percent">% Percentage</option>
              <option value="fixed_amount">₱ Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>

          <div class="col-12 col-md-2 d-grid">
            <button class="btn btn-outline-primary" @click="load">Apply</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-0">
        <div v-if="busy.load" class="text-center text-muted py-5">
          <div class="spinner-border mb-2"></div>
          <div>Loading discounts…</div>
        </div>

        <div v-else-if="items.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-percent fs-2 d-block mb-2"></i>
          No discounts found.
        </div>

        <div v-else class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="min-width: 220px">Title</th>
                <th>Code</th>
                <th class="text-end">Value</th>
                <th>Type</th>
                <th>Status</th>
                <th>Starts</th>
                <th>Expires</th>
                <th class="text-end">Redemptions</th>
                <th class="text-end" style="width: 1%"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in items" :key="d.id">
                <td>
                  <div class="fw-semibold text-truncate" :title="d.title">{{ d.title }}</div>
                  <div class="small text-muted text-truncate" :title="d.description">{{ d.description }}</div>
                </td>
                <td><code>{{ d.code || '—' }}</code></td>
                <td class="text-end">
                  <template v-if="d.type === 'percent'">
                    {{ formatNumber(d.percent_off) }}%
                  </template>
                  <template v-else-if="d.type === 'fixed_amount'">
                    ₱{{ formatNumber(d.amount_off) }}
                  </template>
                  <template v-else>
                    Free shipping
                  </template>
                </td>
                <td class="text-capitalize">{{ uiTypeLabel(d.type) }}</td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'text-bg-success': computedStatus(d) === 'active',
                      'text-bg-secondary': computedStatus(d) === 'disabled' || computedStatus(d) === 'draft',
                      'text-bg-danger': computedStatus(d) === 'expired',
                    }"
                  >
                    {{ computedStatus(d) }}
                  </span>
                </td>
                <td>{{ d.starts_at ? fmtDate(d.starts_at) : '—' }}</td>
                <td>{{ d.expires_at ? fmtDate(d.expires_at) : '—' }}</td>
                <td class="text-end">{{ d.redemptions_count ?? 0 }}</td>
                <td class="text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" @click="openEditor(d)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="remove(d)"
                      :disabled="busy.deleteId === d.id"
                    >
                      <span v-if="busy.deleteId === d.id" class="spinner-border spinner-border-sm me-1"></span>
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (simple) -->
        <div v-if="!busy.load && items.length > 0" class="d-flex align-items-center justify-content-between p-3">
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
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ form.id ? 'Edit Discount' : 'New Discount' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Title</label>
                <input v-model.trim="form.title" type="text" class="form-control" placeholder="E.g., Payday Sale 10%" />
              </div>

              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea v-model.trim="form.description" class="form-control" rows="2" placeholder="Optional"></textarea>
              </div>

              <!-- Type (db enum) -->
              <div class="col-12 col-md-4">
                <label class="form-label">Type</label>
                <select v-model="form.type" class="form-select">
                  <option value="percent">% Percentage</option>
                  <option value="fixed_amount">₱ Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <!-- Unified value input; we map to percent_off/amount_off depending on type -->
              <div class="col-12 col-md-4" v-if="form.type !== 'free_shipping'">
                <label class="form-label">Value</label>
                <input
                  v-model.number="form.value"
                  :type="'number'"
                  :min="form.type === 'percent' ? 0.01 : 0"
                  :max="form.type === 'percent' ? 100 : undefined"
                  step="0.01"
                  class="form-control"
                  :placeholder="form.type === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 250.00'"
                />
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Code (optional)</label>
                <input v-model.trim="form.code" type="text" class="form-control" placeholder="E.g., PAYDAY10" />
                <div class="form-text">Unique (case-insensitive) if provided.</div>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">Starts At</label>
                <input v-model="form.starts_at" type="datetime-local" class="form-control" />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">Expires At</label>
                <input v-model="form.expires_at" type="datetime-local" class="form-control" />
              </div>

              <!-- Status from db enum (draft/active/disabled) -->
              <div class="col-12 col-md-4">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Min Subtotal</label>
                <input v-model.number="form.min_subtotal" type="number" min="0" step="0.01" class="form-control" />
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Stack Policy</label>
                <select v-model="form.stack" class="form-select">
                  <option value="exclusive">Exclusive</option>
                  <option value="stackable">Stackable</option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Max Uses (Global)</label>
                <input v-model.number="form.max_uses_global" type="number" min="0" step="1" class="form-control" />
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Max Uses per User</label>
                <input v-model.number="form.max_uses_per_user" type="number" min="0" step="1" class="form-control" />
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Public</label>
                <select v-model="form.is_public" class="form-select">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Scope</label>
                <select v-model="form.scope" class="form-select">
                  <option value="order">Order</option>
                </select>
              </div>

              <div class="col-12 col-md-4">
                <label class="form-label">Currency</label>
                <input v-model.trim="form.currency" type="text" class="form-control" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
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
// Make sure Bootstrap JS is loaded once in main.ts
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

/**
 * DB shape (subset) aligned to rewards.discounts
 */
type DbDiscount = {
  id: string
  title: string
  description: string
  code?: string | null
  is_public: boolean
  type: 'percent' | 'fixed_amount' | 'free_shipping'
  scope: 'order'
  percent_off?: number | null
  amount_off?: number | null
  currency: string
  min_subtotal: number
  stack: 'exclusive' | 'stackable'
  max_uses_global?: number | null
  max_uses_per_user?: number | null
  redemptions_count: number
  status: 'draft' | 'active' | 'disabled'
  starts_at: string
  expires_at?: string | null
  created_at?: string
  updated_at?: string
}

const items = ref<DbDiscount[]>([])
const busy = ref<{ load: boolean; save: boolean; deleteId: string | null }>({ load: false, save: false, deleteId: null })

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
const form = ref<Partial<DbDiscount> & { value?: number }>({
  // sensible defaults matching db
  type: 'percent',
  value: 0,
  status: 'draft',
  is_public: true,
  scope: 'order',
  currency: 'PHP',
  min_subtotal: 0,
  stack: 'exclusive',
})

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
  if (t === 'percent') return 'Percent'
  if (t === 'fixed_amount') return 'Fixed amount'
  return 'Free shipping'
}
function computedStatus(d: DbDiscount) {
  const nowIso = new Date().toISOString()
  const isExpired = !!d.expires_at && d.expires_at < nowIso
  return isExpired ? 'expired' : d.status
}

/** Convert local datetime input (yyyy-MM-ddTHH:mm) into ISO string with timezone */
function localToISO(dt?: string | null) {
  if (!dt) return null
  // treat input as local time
  const local = new Date(dt)
  return local.toISOString()
}

async function load() {
  busy.value.load = true
  try {
    // NOTE: reference fully-qualified table `rewards.discounts`
    let q = supabase
      .schema('rewards')
      .from('discounts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (query.value.search) {
      const s = `%${query.value.search}%`
      // title ilike OR code ilike
      q = q.or(`title.ilike.${s},code.ilike.${s}`)
    }

    // Status handling: 'expired' is derived (expires_at < now)
    if (query.value.status) {
      if (query.value.status === 'expired') {
        q = q.lt('expires_at', new Date().toISOString())
      } else {
        q = q.eq('status', query.value.status)
      }
    }

    if (query.value.type) {
      q = q.eq('type', query.value.type)
    }

    const from = (query.value.page - 1) * query.value.pageSize
    const to = from + query.value.pageSize - 1
    q = q.range(from, to)

    const { data, error, count } = await q
    if (error) throw error

    items.value = (data || []) as DbDiscount[]
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
      // fold db fields into a unified value for the input
      value: d.type === 'percent' ? d.percent_off ?? undefined : d.type === 'fixed_amount' ? d.amount_off ?? undefined : undefined,
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
      is_public: true,
      scope: 'order',
      currency: 'PHP',
      min_subtotal: 0,
      stack: 'exclusive',
      max_uses_global: null,
      max_uses_per_user: null,
    }
  }
  // @ts-ignore
  const bs = (window as any).bootstrap
  if (bs && editorEl.value) {
    const m = bs.Modal.getOrCreateInstance(editorEl.value)
    m.show()
  }
}

/**
 * Build payload matching the db constraints:
 * - exactly one of (percent_off, amount_off) set depending on type
 * - other set to null
 * - enforce bounds: percent (0, 100], amount >= 0
 * - dates in ISO
 */
function buildPayload(input: Partial<DbDiscount> & { value?: number }) {
  const t = input.type || 'percent'
  const v = input.value

  let percent_off: number | null = null
  let amount_off: number | null = null

  if (t === 'percent') {
    if (v == null || v <= 0 || v > 100) {
      throw new Error('Percentage must be greater than 0 and at most 100.')
    }
    percent_off = roundTo2(v)
    amount_off = null
  } else if (t === 'fixed_amount') {
    if (v == null || v < 0) {
      throw new Error('Fixed amount must be 0 or greater.')
    }
    amount_off = roundTo2(v)
    percent_off = null
  } else if (t === 'free_shipping') {
    percent_off = null
    amount_off = null
  }

  const payload: any = {
    title: (input.title ?? '').trim(),
    description: (input.description ?? '').trim(),
    code: input.code ? input.code.trim() : null,
    is_public: input.is_public ?? true,
    type: t,
    scope: input.scope ?? 'order',
    percent_off,
    amount_off,
    currency: (input.currency ?? 'PHP').trim() || 'PHP',
    min_subtotal: numberOrZero(input.min_subtotal),
    stack: input.stack ?? 'exclusive',
    max_uses_global: input.max_uses_global ?? null,
    max_uses_per_user: input.max_uses_per_user ?? null,
    status: input.status ?? 'draft',
    starts_at: input.starts_at ? localToISO(input.starts_at) : new Date().toISOString(),
    expires_at: input.expires_at ? localToISO(input.expires_at) : null,
  }

  if (!payload.title) throw new Error('Title is required.')
  // chk_dates in db ensures expires_at > starts_at when set

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
  // Supabase/PostgREST forwards Postgres error (code '23505') for unique constraint
  return err && (err.code === '23505' || (err.message && /duplicate key value|uq_rewards_discounts_code_lower/i.test(err.message)))
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

onMounted(load)
</script>

<style scoped>
.table td, .table th { white-space: nowrap; }
.table td:first-child, .table th:first-child { white-space: normal; max-width: 340px; }
@media (max-width: 991.98px) {
  .table td:first-child, .table th:first-child { max-width: 260px; }
}
</style>
