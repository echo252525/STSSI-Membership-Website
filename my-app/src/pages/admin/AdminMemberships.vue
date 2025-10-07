<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h4 m-0">Membership Tiers</h1>
        <p class="text-muted small mb-0">
          Manage tier names, order, discounts, and delivery perks.
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" :disabled="busy.load" @click="load(true)">
          <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <i class="bi bi-plus-lg me-1"></i> New Tier
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm rounded-4 mb-3">
      <div class="card-body d-flex flex-wrap gap-2 align-items-center">
        <div class="input-group" style="max-width: 360px">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input
            v-model.trim="q"
            type="text"
            class="form-control"
            placeholder="Search name…"
            @input="debouncedSearch()"
          />
        </div>
          <div class="ms-auto small text-muted">Total: {{ total }}</div>
      </div>
    </div>

    <!-- ===== HERO SECTION (Top tier by order) ===== -->
    <div v-if="!busy.load && tiers.length" class="hero-tier card border-0 rounded-4 shadow-sm mb-3 overflow-hidden">
      <div class="hero-bg"></div>
      <div class="card-body position-relative d-flex flex-wrap align-items-center gap-3">
        <div class="hero-rank-badge">
          <i class="bi bi-trophy-fill me-1"></i> #{{ tiers[0].membership_tier_order }}
        </div>
        <img
          v-if="tiers[0]._icon_signed_url"
          :src="tiers[0]._icon_signed_url"
          class="rounded-3 border hero-icon"
          alt="Tier icon"
        />
        <div class="flex-grow-1 minw-0">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h2 class="h4 m-0 hero-name text-truncate">{{ tiers[0].membership_name }}</h2>
            <span class="badge rounded-pill" :class="tiers[0].is_free_delivery ? 'text-bg-success' : 'text-bg-secondary'">
              {{ tiers[0].is_free_delivery ? 'Free Delivery' : 'No Free Delivery' }}
            </span>
          </div>
          <div class="text-muted small mt-1">
            Last updated {{ fmtDate(tiers[0].updated_at) }}
          </div>
          <div class="hero-stats d-flex flex-wrap gap-3 mt-3">
            <div class="stat">
              <div class="stat-label">Monthly Credits</div>
              <div class="stat-value">₱{{ toMoney(tiers[0].discount_credits) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Discount / Purchase</div>
              <div class="stat-value">{{ toPercentOrPeso(tiers[0].discount_per_purchase) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Purchases (All-time)</div>
              <div class="stat-value">{{ tiers[0].purchases_count }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Referral Req</div>
              <div class="stat-value">{{ tiers[0].referral_count_requirements }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Orders for Free Delivery</div>
              <div class="stat-value">{{ tiers[0].purchase_requirements_for_free_delivery }}</div>
            </div>
          </div>
        </div>
        <div class="ms-auto d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" @click="openEdit(tiers[0])">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" @click="openDelete(tiers[0])">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== CARD GRID FOR OTHER TIERS ===== -->
    <div class="row g-3">
      <!-- Loading state -->
      <div v-if="busy.load" class="col-12">
        <div class="text-center text-muted py-4">
          <div class="spinner-border me-2"></div>
          Loading tiers…
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="tiers.length === 0" class="col-12">
        <div class="text-center text-muted py-4">
          <i class="bi bi-stars"></i> No tiers found.
        </div>
      </div>

      <!-- Cards (skip index 0 because it's the hero) -->
      <div
        v-else
        v-for="(t, i) in tiers.slice(1)"
        :key="t.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card h-100 rounded-4 shadow-sm border-0 tier-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-start gap-3">
              <div class="rank-badge">#{{ t.membership_tier_order }}</div>
              <img
                v-if="t._icon_signed_url"
                :src="t._icon_signed_url"
                class="rounded border"
                style="width: 56px; height: 56px; object-fit: cover"
                alt="Tier icon"
              />
              <div class="flex-grow-1 minw-0">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <h3 class="h6 m-0 text-truncate">{{ t.membership_name }}</h3>
                  <span class="badge rounded-pill" :class="t.is_free_delivery ? 'text-bg-success' : 'text-bg-secondary'">
                    {{ t.is_free_delivery ? 'Free Delivery' : 'No Free Delivery' }}
                  </span>
                </div>
                <div class="text-muted small mt-1">Updated {{ fmtDate(t.updated_at) }}</div>
              </div>
            </div>

            <div class="mt-3 small">
              <div class="row g-2">
                <div class="col-6">
                  <div class="kpi">
                    <div class="kpi-label">Monthly Credits</div>
                    <div class="kpi-value">₱{{ toMoney(t.discount_credits) }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="kpi">
                    <div class="kpi-label">Disc/Purchase</div>
                    <div class="kpi-value">{{ toPercentOrPeso(t.discount_per_purchase) }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="kpi">
                    <div class="kpi-label">Purchases</div>
                    <div class="kpi-value">{{ t.purchases_count }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="kpi">
                    <div class="kpi-label">Referral Req</div>
                    <div class="kpi-value">{{ t.referral_count_requirements }}</div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="kpi">
                    <div class="kpi-label">Orders for Free Delivery</div>
                    <div class="kpi-value">{{ t.purchase_requirements_for_free_delivery }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-auto d-flex justify-content-end gap-2">
              <button class="btn btn-outline-secondary btn-sm" @click="openEdit(t)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="openDelete(t)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="card-body d-flex align-items-center justify-content-between px-0">
      <div class="small text-muted">Showing {{ tiers.length }} of {{ total }}</div>
      <div class="btn-group">
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="page === 1"
          @click="page-- && load()"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm" disabled>{{ page }}</button>
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="page * pageSize >= total"
          @click="page++ && load()"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Alerts -->
    <p v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">{{ error }}</p>
    <p v-if="notice" class="alert alert-success mt-3 mb-0" role="alert">{{ notice }}</p>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="tierModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ form.id ? 'Edit Tier' : 'New Tier' }}</h5>
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
                <label class="form-label">Tier Name</label>
                <input
                  v-model.trim="form.membership_name"
                  type="text"
                  class="form-control"
                  placeholder="e.g., Bronze, Silver, Gold"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Display Order</label>
                <input
                  v-model.number="form.membership_tier_order"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="Lower shows first"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Total Purchases (All-Time)</label>
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
                <label class="form-label">Referral Count Requirement</label>
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
                <label class="form-label">Purchases per Referral</label>
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
                <label class="form-label">Free Delivery?</label>
                <select v-model="form.is_free_delivery" class="form-select">
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Discount Credits (₱ / month)</label>
                <input
                  v-model="form.discount_credits"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  placeholder="e.g., 2000.00"
                  required
                />
                <div class="form-text">Monthly credits applied to member purchases.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Discount per Purchase</label>
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
                  <select v-model="form.discount_per_purchase_mode" class="form-select" style="max-width: 120px">
                    <option value="peso">₱</option>
                    <option value="percent">%</option>
                  </select>
                </div>
                <div class="form-text">
                  Enter a fixed peso amount or choose % for a percentage (0–100).
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Orders Required for Free Delivery</label>
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
                <label class="form-label">Tier Icon (PNG/JPG/SVG)</label>
                <input
                  ref="iconInput"
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  class="form-control"
                  @change="onIconPicked"
                />
                <div class="form-text">
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
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="busy.save">
                <span v-if="busy.save" class="spinner-border spinner-border-sm me-2"></span>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Tier</h5>
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
              Cancel
            </button>
            <button type="button" class="btn btn-danger" :disabled="busy.del" @click="del">
              <span v-if="busy.del" class="spinner-border spinner-border-sm me-2"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// CONFIG
const BUCKET = 'tier_icons' // make sure this bucket exists with RLS you set

// pagination + search
const page = ref(1)
const pageSize = 10
const q = ref('')
const total = ref(0)
const tiers = ref<any[]>([])

const busy = ref({ load: false, save: false, del: false })
const error = ref('')
const notice = ref('')

// bootstrap modals (assumes bootstrap bundle loaded once globally)
let modalTier: any = null
let modalDelete: any = null

const form = ref<any>(resetForm())
const selected = ref<any | null>(null)

// icon file handling
const iconFile = ref<File | null>(null)
const iconPreview = ref<string | null>(null)
const iconInput = ref<HTMLInputElement | null>(null)

function resetForm() {
  return {
    id: null,
    membership_name: '',
    membership_tier_order: 0,
    purchases_count: 0,
    referral_count_requirements: 0,
    purchases_per_referrals: 0,
    discount_credits: '0.00', // numeric(12,2) → string input
    discount_per_purchase: '0.00', // stored as peso or percent depending on mode
    discount_per_purchase_mode: 'peso', // 'peso' | 'percent'
    is_free_delivery: false,
    purchase_requirements_for_free_delivery: 0,
    icon_url: null,
    _icon_signed_url: null, // transient for preview in modal
  }
}

function toMoney(n: any) {
  const num = Number(n ?? 0)
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function toPercentOrPeso(v: any) {
  // Table/card display helper: show "₱x.xx" OR "x.xx%"
  // We keep pesos by default since mode isn't stored in DB.
  const num = Number(v ?? 0)
  return `₱${toMoney(num)}`
}

function fmtDate(d?: string) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleString()
}

// debounced search
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
    })
  )
  return out
}

async function load(reset = false) {
  error.value = ''
  if (reset) page.value = 1
  busy.value.load = true
  try {
    const from = (page.value - 1) * pageSize
    const to = from + pageSize - 1

    // Build query
    let query = supabase
      .schema('membership')
      .from('tiers')
      .select('*', { count: 'exact' })
      .order('membership_tier_order', { ascending: true })
      .range(from, to)

    if (q.value) {
      query = query.ilike('membership_name', `%${q.value}%`)
    }

    const { data, error: err, count } = await query
    if (err) throw err

    tiers.value = await hydrateSignedIcons(data ?? [])
    total.value = count ?? tiers.value.length
  } catch (e: any) {
    error.value = e?.message || 'Failed to load tiers.'
  } finally {
    busy.value.load = false
  }
}

function openCreate() {
  form.value = resetForm()
  iconFile.value = null
  iconPreview.value = null
  // @ts-ignore
  modalTier = window.bootstrap?.Modal.getOrCreateInstance(document.getElementById('tierModal'))
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
  // @ts-ignore
  modalTier = window.bootstrap?.Modal.getOrCreateInstance(document.getElementById('tierModal'))
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
        if (updIconErr) throw updIconErr
      }

      notice.value = 'Tier updated.'
    }

    clearIcon()
    modalTier?.hide()
    await load()
  } catch (e: any) {
    error.value = e?.message || 'Save failed.'
  } finally {
    busy.value.save = false
  }
}

function openDelete(row: any) {
  selected.value = row
  // @ts-ignore
  modalDelete = window.bootstrap?.Modal.getOrCreateInstance(document.getElementById('deleteModal'))
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
    } catch (e) {
      // best-effort; continue
    }

    const { error: delErr } = await supabase
      .schema('membership')
      .from('tiers')
      .delete()
      .eq('id', tierId)
    if (delErr) throw delErr

    notice.value = 'Tier deleted.'
    modalDelete?.hide()
    await load()
  } catch (e: any) {
    error.value = e?.message || 'Delete failed.'
  } finally {
    busy.value.del = false
  }
}

onMounted(() => {
  load(true)
})
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

/* ==== HERO SECTION STYLES ==== */
.hero-tier {
  position: relative;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 100% at 0% 0%, rgba(255, 208, 0, 0.18), transparent 60%),
              radial-gradient(120% 100% at 100% 0%, rgba(76, 175, 80, 0.16), transparent 60%),
              linear-gradient(180deg, rgba(0,0,0,0.03), transparent 40%);
  pointer-events: none;
}
.hero-icon {
  width: 72px;
  height: 72px;
  object-fit: cover;
}
.hero-name {
  line-height: 1.2;
}
.hero-rank-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #111827;
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
}
.hero-stats .stat {
  min-width: 140px;
}
.stat-label {
  color: #6c757d;
  font-size: 12px;
}
.stat-value {
  font-weight: 600;
  font-size: 16px;
}

/* ==== CARD STYLES ==== */
.tier-card .rank-badge {
  background: #f1f3f5;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 12px;
  color: #495057;
}
.kpi-label {
  color: #6c757d;
  font-size: 12px;
}
.kpi-value {
  font-weight: 600;
}

/* utilities */
.minw-0 { min-width: 0; }
</style>
