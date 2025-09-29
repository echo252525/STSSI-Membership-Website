<template>
  <div class="admin-products-page">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-box-seam"></i>
        Admin Products
      </h3>

      <div class="d-flex align-items-center gap-2">
        <div class="input-group d-none d-md-flex">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model.trim="q"
            type="search"
            class="form-control border-start-0"
            placeholder="Search products..."
            @keydown.enter.prevent
          />
        </div>

        <button
          type="button"
          class="btn btn-primary d-flex align-items-center gap-2"
          @click="openForm()"
        >
          <i class="bi bi-plus-lg"></i>
          Add Product
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div v-if="loading" class="py-5 text-center text-muted">
          <div class="spinner-border mb-2"></div>
          <div>Loading products…</div>
        </div>

        <template v-else>
          <!-- Empty state -->
          <div
            v-if="filteredProducts.length === 0"
            class="py-5 text-center text-muted"
          >
            <i class="bi bi-box" style="font-size:1.6rem"></i>
            <div class="mt-2">No products found</div>
          </div>

          <!-- Grid -->
          <div class="row g-3">
            <div
              class="col-12 col-sm-6 col-lg-4 col-xl-3"
              v-for="p in filteredProducts"
              :key="p.id"
            >
              <div class="product-card h-100 border rounded-3 overflow-hidden">
                <div class="ratio ratio-4x3 bg-light position-relative">
                  <img
                    v-if="imageUrl(p)"
                    :src="imageUrl(p)"
                    :alt="p.name"
                    class="w-100 h-100 object-fit-cover"
                  />
                  <div
                    v-else
                    class="d-flex flex-column align-items-center justify-content-center text-muted"
                  >
                    <i class="bi bi-image" style="font-size:1.6rem"></i>
                    <small class="mt-1">No image</small>
                  </div>

                  <span
                    v-if="imgBusy[p.id]"
                    class="position-absolute top-0 end-0 m-2 badge text-bg-secondary"
                  >
                    loading…
                  </span>
                </div>

                <div class="p-3">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <strong class="text-truncate">{{ p.name }}</strong>
                    <span class="badge text-bg-primary">₱ {{ number(p.price) }}</span>
                  </div>
                  <div
                    class="text-muted small mt-1"
                    :title="p.description || ''"
                  >
                    {{ p.description || '—' }}
                  </div>

                  <!-- OPTIONAL tiny supplier price readout (kept your original layout) -->
                  <div class="text-muted xsmall mt-1">
                    <i class="bi bi-tag me-1"></i>Supplier: ₱ {{ number(p.supplier_price) }}
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-3 small text-muted">
                    <span><i class="bi bi-calendar-plus me-1"></i>{{ fmt(p.created_at) }}</span>
                    <span><i class="bi bi-clock-history me-1"></i>{{ fmt(p.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Minimal footer -->
          <div class="d-flex justify-content-end mt-3 small text-muted">
            <span>Total: {{ products.length }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Create Product Modal -->
    <div v-if="showForm" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Add Product</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeForm">✕</button>
        </div>

        <div class="card-body">
          <form @submit.prevent="submit">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Name</label>
                <input
                  v-model.trim="form.name"
                  type="text"
                  class="form-control"
                  placeholder="USB Drive"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Price (₱)</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Supplier Price (₱)</label>
                <input
                  v-model.number="form.supplier_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{'is-invalid': !supplierOk}"
                  required
                />
                <div class="invalid-feedback">
                  Supplier price must be &lt; Price and ≥ 0.
                </div>
                <div class="form-text" v-if="supplierOk">
                  Must be strictly lower than the selling price.
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Image Source</label>
                <div class="btn-group w-100">
                  <button
                    type="button"
                    class="btn"
                    :class="formMode === 'upload' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="formMode = 'upload'"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="formMode === 'url' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="formMode = 'url'"
                  >
                    Paste URL
                  </button>
                </div>
              </div>

              <div class="col-12" v-if="formMode === 'upload'">
                <label class="form-label">Upload Picture</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="form-control"
                  @change="onFile"
                />
                <div class="form-text">
                  Stored in <code>prize_product</code> (private). We’ll save the storage path to <code>product_url</code>.
                </div>
              </div>

              <div class="col-12" v-else>
                <label class="form-label">Picture URL</label>
                <input
                  v-model.trim="form.product_url"
                  type="url"
                  class="form-control"
                  placeholder="https://…/image.jpg"
                  required
                />
                <div class="form-text">
                  If this is an external URL, it must be directly viewable.
                </div>
              </div>

              <div class="col-12">
                <label class="form-label">Description (optional)</label>
                <textarea
                  v-model.trim="form.description"
                  rows="3"
                  class="form-control"
                  placeholder="Short description…"
                ></textarea>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeForm" :disabled="submitting">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || !canSubmit">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number | string
  supplier_price: number | string
  product_url: string
  created_at: string
  updated_at: string
}

const products = ref<ProductRow[]>([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const q = ref('')

/** modal state */
type FormMode = 'upload' | 'url'
const formMode = ref<FormMode>('upload')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const form = reactive({
  name: '',
  description: '',
  price: 0,
  supplier_price: 0,
  product_url: '' as string, // will hold either external URL or storage path
})

/** helpers */
function randId() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID()
    }
  } catch { /* noop */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const number = (n: number | string | null | undefined) =>
  Number(n ?? 0).toFixed(2)

const fmt = (x: string | null | undefined) => {
  if (!x) return '—'
  const d = new Date(x.replace(' ', 'T'))
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

/** signed URL cache for storage paths */
const signedMap = reactive<Record<string, string>>({})
const imgBusy: Record<string, boolean> = reactive({})

function isStoragePath(u: string | null | undefined) {
  if (!u) return false
  return !/^https?:\/\//i.test(u)
}

function imageUrl(p: ProductRow) {
  const key = p.id
  const raw = p.product_url
  if (!raw) return ''
  if (!isStoragePath(raw)) return raw
  if (signedMap[key]) return signedMap[key]
  if (!imgBusy[key]) {
    imgBusy[key] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(raw, 60 * 60)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) signedMap[key] = data.signedUrl
      })
      .finally(() => (imgBusy[key] = false))
  }
  return ''
}

async function loadProducts() {
  loading.value = true
  const { data, error } = await supabase
    .schema('games')
    .from('products')
    .select('id, name, description, price, supplier_price, product_url, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (!error) products.value = (data ?? []) as ProductRow[]
  loading.value = false
}

function openForm() {
  resetForm()
  showForm.value = true
}
function closeForm() {
  showForm.value = false
}
function resetForm() {
  form.name = ''
  form.description = ''
  form.price = 0
  form.supplier_price = 0
  form.product_url = ''
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  formMode.value = 'upload'
}
function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

/** validation: supplier_price must be >= 0 AND strictly less than price */
const supplierOk = computed(() => {
  const sp = Number(form.supplier_price)
  const p = Number(form.price)
  if (isNaN(sp) || isNaN(p)) return false
  return sp >= 0 && sp < p
})

const canSubmit = computed(() => {
  if (!form.name || form.price < 0) return false
  if (!supplierOk.value) return false
  if (formMode.value === 'upload') return !!selectedFile.value
  return !!form.product_url
})

async function uploadToStorage(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const rid = randId()
  const path = `products/${rid}.${ext}`

  const { error } = await supabase.storage
    .from('prize_product')
    .upload(path, file, { upsert: false })

  if (error) throw error
  return path
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    let productUrl = form.product_url.trim()
    if (formMode.value === 'upload') {
      if (!selectedFile.value) throw new Error('Please select a file')
      const path = await uploadToStorage(selectedFile.value)
      productUrl = path
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: Number(form.price),
      supplier_price: Number(form.supplier_price),
      product_url: productUrl,
    }

    // Final guard (never trust UI only)
    if (!(payload.supplier_price >= 0 && payload.supplier_price < payload.price)) {
      alert('Supplier price must be lower than Price.')
      return
    }

    const { error } = await supabase
      .schema('games')
      .from('products')
      .insert(payload)

    if (error) {
      console.error('insert product error:', error.message)
      alert(error.message)
      return
    }

    closeForm()
    await loadProducts()
  } finally {
    submitting.value = false
  }
}

const filteredProducts = computed(() => {
  const s = q.value.toLowerCase().trim()
  if (!s) return products.value
  return products.value.filter((p) => {
    return (
      p.name.toLowerCase().includes(s) ||
      (p.description ?? '').toLowerCase().includes(s)
    )
  })
})

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-products-page {
  padding: 1rem;
}

.product-card {
  transition: transform .2s ease, box-shadow .2s ease;
  background: #fff;
  border-color: #e9ecef;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}

.object-fit-cover {
  object-fit: cover;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1055;
}
.modal-card {
  width: min(720px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}
.card-header {
  background: #fff;
}

.input-group .form-control:focus {
  box-shadow: none;
}

.ratio {
  position: relative;
  width: 100%;
}
.ratio-4x3 {
  padding-top: 75%;
}
.ratio > * {
  position: absolute;
  inset: 0;
}

/* tiny helper */
.xsmall { font-size: 0.8rem; }
</style>
