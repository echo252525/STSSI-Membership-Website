<template>
  <div class="shop-page container-fluid py-3">
    <!-- Delivery / shipping setup (Shopee-like banner) -->
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body d-flex flex-wrap align-items-center gap-3">
        <i class="bi bi-geo-alt fs-4 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">
            Delivery details
            <span v-if="!shippingLoaded" class="text-muted small ms-2">(loading…)</span>
          </div>
          <div class="text-muted small" v-if="shippingLoaded && hasShipping">
            {{ shippingSummary }}
          </div>
          <div class="text-muted small" v-else-if="shippingLoaded">
            No delivery info yet. Add your contact number and address for faster checkout.
          </div>
        </div>
        <button class="btn btn-outline-primary" @click="openShippingModal">
          <i class="bi bi-pencil-square me-1"></i>
          {{ hasShipping ? 'Edit' : 'Set up' }} address
        </button>
      </div>
    </div>

    <!-- Shipping modal -->
    <div v-if="showShipping" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Delivery details</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeShippingModal">✕</button>
        </div>
        <div class="card-body">
          <form @submit.prevent="saveShipping">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Phone number</label>
                <input v-model.trim="shipping.phone" type="tel" class="form-control" placeholder="+63 9XX XXX XXXX" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Postal code</label>
                <input
                  v-model.trim="shipping.postal_code"
                  type="text"
                  class="form-control"
                  placeholder="e.g. 1000"
                  required
                  inputmode="numeric"
                  maxlength="4"
                  pattern="\d{4}"
                  title="Postal code must be exactly 4 digits"
                />
              </div>
              <div class="col-12">
                <label class="form-label">Address line 1 (House/Unit & Street)</label>
                <input v-model.trim="shipping.address_line1" type="text" class="form-control" placeholder="House/Unit/Street" required />
              </div>
              <!-- Address line 2 removed as requested -->

              <!-- NEW: Barangay -->
              <div class="col-md-6">
                <label class="form-label">Barangay</label>
                <input v-model.trim="shipping.barangay" type="text" class="form-control" placeholder="Barangay" required />
              </div>

              <div class="col-md-6">
                <label class="form-label">City / Municipality</label>
                <input v-model.trim="shipping.city" type="text" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Province</label>
                <input v-model.trim="shipping.province" type="text" class="form-control" required />
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeShippingModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="savingShipping">
                <span v-if="savingShipping" class="spinner-border spinner-border-sm me-2"></span>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Top controls (Shopee-like) -->
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body d-flex flex-wrap align-items-center gap-2">
        <!-- Search -->
        <div class="input-group" style="max-width: 360px;">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input
            v-model.trim="search"
            type="search"
            class="form-control"
            placeholder="Search for products"
            @keyup.enter="applyAndFetch"
          />
          <button class="btn btn-outline-secondary" :disabled="loading" @click="applyAndFetch">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Search
          </button>
        </div>

        <!-- Sort -->
        <div class="ms-auto d-flex align-items-center gap-2 flex-wrap">
          <div class="btn-group" role="group" aria-label="Sort group">
            <button
              :class="['btn', sortKey === 'relevance' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('relevance')"
            >Relevance</button>
            <button
              :class="['btn', sortKey === 'newest' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('newest')"
            >Newest</button>
            <button
              :class="['btn', sortKey === 'price_asc' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('price_asc')"
              title="Price: Low to High"
            ><i class="bi bi-arrow-down-up me-1"></i>Price ↑</button>
            <button
              :class="['btn', sortKey === 'price_desc' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('price_desc')"
              title="Price: High to Low"
            ><i class="bi bi-arrow-down-up me-1 rotate-180"></i>Price ↓</button>
          </div>

          <!-- In Stock -->
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="inStockSwitch" v-model="inStockOnly" @change="applyAndFetch">
            <label class="form-check-label" for="inStockSwitch">In Stock</label>
          </div>

          <!-- Page size -->
          <div class="d-flex align-items-center gap-2">
            <label class="text-muted small">Per page</label>
            <select v-model.number="pageSize" class="form-select form-select-sm" style="width: 84px" @change="goToPage(1)">
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
            </select>
          </div>

          <!-- View Cart button with badge (opens modal) -->
          <button ref="cartBtnRef" class="btn btn-outline-dark position-relative" @click="openCartModal">
            <i class="bi bi-cart3 me-1"></i>
            View Cart
            <span v-if="cartTotalItems > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
              {{ cartTotalItems }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- Sidebar Filters -->
      <aside class="col-12 col-lg-3">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white">
            <strong>Filters</strong>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Price range</label>
              <div class="input-group mb-2">
                <span class="input-group-text">₱</span>
                <input v-model.number="minPrice" type="number" min="0" class="form-control" placeholder="Min" />
              </div>
              <div class="input-group">
                <span class="input-group-text">₱</span>
                <input v-model.number="maxPrice" type="number" min="0" class="form-control" placeholder="Max" />
              </div>
              <div class="d-grid mt-2">
                <button class="btn btn-outline-primary btn-sm" @click="applyAndFetch">Apply</button>
              </div>
            </div>

            <div class="small text-muted">
              Showing only <span class="fw-semibold">published</span> products.
            </div>
          </div>
        </div>
      </aside>

      <!-- Product Grid -->
      <section class="col-12 col-lg-9">
        <div v-if="loading" class="text-center text-muted py-5">
          <span class="spinner-border me-2"></span> Loading products…
        </div>

        <div v-else class="row g-3">
          <div v-if="products.length === 0" class="col-12">
            <div class="text-center text-muted py-5">
              <i class="bi bi-box-seam fs-2 d-block mb-2"></i>
              No products matched your filters.
            </div>
          </div>

          <div
            class="col-6 col-md-4 col-xl-3"
            v-for="p in products"
            :key="p.id"
          >
            <div class="card h-100 product-card border-0 shadow-sm">
              <div class="ratio ratio-1x1 product-thumb bg-light">
                <img
                  v-if="imageUrl(p)"
                  :src="imageUrl(p)"
                  :alt="p.name"
                  class="w-100 h-100 object-fit-cover rounded-top product-img"
                />
                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted product-img-fallback">
                  <i class="bi bi-image fs-3"></i>
                </div>

                <!-- New badge (7 days) -->
                <span v-if="isNew(p.created_at)" class="badge position-absolute top-0 start-0 m-2 text-bg-danger">NEW</span>
              </div>
              <div class="card-body d-flex flex-column">
                <div class="fw-semibold product-title text-truncate" :title="p.name">{{ p.name }}</div>
                <div class="text-muted small text-truncate mb-2" v-if="p.description">{{ p.description }}</div>
                <div class="mt-auto d-flex align-items-center justify-content-between">
                  <div class="price fw-bold">₱ {{ number(p.price) }}</div>
                  <span
                    class="badge"
                    :class="(p.stock ?? 0) > 0 ? 'text-bg-success' : 'text-bg-secondary'"
                    :title="'Stock: ' + (p.stock ?? 0)"
                  >Stock: {{ p.stock ?? 0 }}</span>
                </div>
              </div>
              <div class="card-footer bg-white border-0 pt-0">
                <div class="d-grid gap-2">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">Qty</span>
                    <button class="btn btn-outline-secondary" @click="decQty(p)" :disabled="cartQty(p.id) <= 1"><i class="bi bi-dash"></i></button>
                    <input class="form-control text-center" :value="cartQty(p.id)" readonly />
                    <button class="btn btn-outline-secondary" @click="incQty(p)" :disabled="cartQty(p.id) >= (p.stock ?? 0)"><i class="bi bi-plus"></i></button>
                  </div>
                  <button
                    class="btn btn-primary"
                    :disabled="(p.stock ?? 0) <= 0 || addToCartBusy[p.id]"
                    @click="onAddToCart($event, p)"
                  >
                    <span v-if="addToCartBusy[p.id]" class="spinner-border spinner-border-sm me-2"></span>
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="total > 0" class="d-flex align-items-center justify-content-center gap-2 mt-3">
          <button class="btn btn-outline-secondary btn-sm" :disabled="page === 1 || loading" @click="goToPage(page - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="small text-muted">
            Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong>
          </span>
          <button class="btn btn-outline-secondary btn-sm" :disabled="page >= totalPages || loading" @click="goToPage(page + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </section>
    </div>

    <!-- Cart Modal -->
    <div v-if="showCart" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong><i class="bi bi-cart3 me-2"></i>Your Cart</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeCartModal">✕</button>
        </div>

        <div class="card-body">
          <div v-if="cartItems.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-bag-x fs-2 d-block mb-2"></i>
            Your cart is empty.
          </div>

          <div v-else class="vstack gap-3">
            <div v-for="it in cartItems" :key="it.product.id" class="d-flex align-items-center gap-3 border rounded-3 p-2">
              <div class="cart-thumb ratio ratio-1x1 bg-light">
                <img v-if="it.imageUrl" :src="it.imageUrl" :alt="it.product.name" class="w-100 h-100 object-fit-cover rounded" />
                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  <i class="bi bi-image"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold text-truncate" :title="it.product.name">{{ it.product.name }}</div>
                <div class="text-muted small">₱ {{ number(it.product.price) }} × {{ it.qty }}</div>
              </div>
              <div class="fw-semibold">₱ {{ number(it.lineTotal) }}</div>
            </div>

            <hr />

            <div class="d-flex align-items-center justify-content-between">
              <div class="fw-semibold">Payment method</div>
              <div>
                <select class="form-select" style="min-width: 220px" v-model="paymentMethod" disabled>
                  <option value="cod">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between fs-5">
              <div class="fw-semibold">Total</div>
              <div class="fw-bold">₱ {{ number(cartGrandTotal) }}</div>
            </div>

            <div class="d-flex justify-content-end">
              <button class="btn btn-success" :disabled="cartItems.length === 0 || checkingOut" @click="checkout">
                <span v-if="checkingOut" class="spinner-border spinner-border-sm me-2"></span>
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- /Cart Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | string | null
  ispublish: boolean
  stock?: number | null
  created_at: string
}

type CartRow = {
  id: string
  user_id: string
  product_id: string
  qty: number
  created_at: string
  updated_at: string
}

type ShippingRow = {
  user_id: string
  phone: string
  address_line1: string
  barangay: string
  city: string
  province: string
  postal_code: string
  updated_at: string
}

/* -------------------- Products state -------------------- */
const products = ref<Product[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(24)

const search = ref<string>('')
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const inStockOnly = ref<boolean>(true)

const sortKey = ref<'relevance' | 'newest' | 'price_asc' | 'price_desc'>('relevance')
const loading = ref(false)

/* -------------------- Signed URL helpers -------------------- */
const signedUrlMap: Record<string, string> = {}
const signingBusy: Record<string, boolean> = {}

function firstUrl(u: string[] | string | null): string {
  if (!u) return ''
  return Array.isArray(u) ? (u[0] ?? '') : u
}
function isStoragePath(u: string) {
  return !!u && !/^https?:\/\//i.test(u)
}
function imageUrl(p: Product) {
  const raw = firstUrl(p.product_url)
  if (!raw) return ''
  if (!isStoragePath(raw)) return raw
  if (signedUrlMap[p.id]) return signedUrlMap[p.id]
  if (!signingBusy[p.id]) {
    signingBusy[p.id] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(raw, 60 * 60)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) signedUrlMap[p.id] = data.signedUrl
      })
      .finally(() => (signingBusy[p.id] = false))
  }
  return ''
}

/* -------------------- Numbers / dates -------------------- */
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)
const totalPages = computed(() => total.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1)
function isNew(created_at: string) {
  const created = new Date(created_at).getTime()
  const now = Date.now()
  const days = (now - created) / (1000 * 60 * 60 * 24)
  return days <= 7
}

/* -------------------- Auth helpers -------------------- */
const userId = ref<string | null>(null)
async function ensureUser() {
  const { data } = await supabase.auth.getUser()
  const id = data?.user?.id || null
  userId.value = id
  return id
}

/* -------------------- Cart state -------------------- */
const cartByProduct: Record<string, number> = {}
const addToCartBusy: Record<string, boolean> = {}

function cartQty(productId: string): number {
  return cartByProduct[productId] ?? 1
}
function setCartQty(productId: string, qty: number) {
  cartByProduct[productId] = Math.max(1, qty)
}
function incQty(p: Product) {
  const q = cartQty(p.id)
  const max = (p.stock ?? 0)
  setCartQty(p.id, Math.min(q + 1, Math.max(1, max)))
}
function decQty(p: Product) {
  const q = cartQty(p.id)
  setCartQty(p.id, Math.max(1, q - 1))
}

async function loadCart() {
  const uid = await ensureUser()
  if (!uid) return
  const { data, error } = await supabase
    .schema('games')
    .from('cart')
    .select('product_id, qty')
    .eq('user_id', uid)

  if (!error && data) {
    for (const row of data as Pick<CartRow,'product_id'|'qty'>[]) {
      cartByProduct[row.product_id] = Math.max(1, Number(row.qty || 1))
    }
  }
}

/* Cart totals + View Cart modal state */
const cartBtnRef = ref<HTMLElement | null>(null)
const router = useRouter()

const cartTotalItems = computed(() =>
  Object.values(cartByProduct).reduce((a, b) => a + (Number(b) || 0), 0)
)

/* Cart modal data */
const showCart = ref(false)
const cartItems = ref<Array<{
  product: Product,
  qty: number,
  imageUrl: string | null,
  lineTotal: number
}>>([])

const paymentMethod = ref<'cod'>('cod')
const checkingOut = ref(false)

const cartGrandTotal = computed(() =>
  cartItems.value.reduce((sum, it) => sum + it.lineTotal, 0)
)

async function openCartModal() {
  await loadCartDetails()
  showCart.value = true
}
function closeCartModal() {
  showCart.value = false
}

/* Build cartItems with product data + signed image per product in cart */
async function loadCartDetails() {
  const uid = await ensureUser()
  cartItems.value = []
  if (!uid) return

  const { data: rows, error: cartErr } = await supabase
    .schema('games')
    .from('cart')
    .select('product_id, qty')
    .eq('user_id', uid)

  if (cartErr || !rows) return
  const ids = (rows as Array<{product_id: string, qty: number}>).map(r => r.product_id)
  if (ids.length === 0) return

  const { data: prodRows, error: prodErr } = await supabase
    .schema('games')
    .from('products')
    .select('id,name,description,price,product_url,ispublish,stock,created_at')
    .in('id', ids)

  if (prodErr || !prodRows) return
  const map = new Map<string, Product>()
  for (const p of prodRows as Product[]) map.set(p.id, p)

  const list: Array<{product: Product, qty: number, imageUrl: string | null, lineTotal: number}> = []
  for (const row of rows as Array<{product_id: string, qty: number}>) {
    const p = map.get(row.product_id)
    if (!p) continue
    let img = imageUrl(p) || null
    if (!img) {
      const raw = firstUrl(p.product_url)
      if (raw && isStoragePath(raw)) {
        const { data } = await supabase.storage.from('prize_product').createSignedUrl(raw, 3600)
        img = data?.signedUrl ?? null
      } else {
        img = raw || null
      }
    }
    const qty = Number(row.qty || 0)
    const lineTotal = qty * Number(p.price || 0)
    list.push({ product: p, qty, imageUrl: img, lineTotal })
  }
  cartItems.value = list
}

/* Fly-to-cart animation */
function flyToCart(fromContainerEl: HTMLElement | null) {
  const cartEl = cartBtnRef.value
  if (!fromContainerEl || !cartEl) return

  const srcImg = fromContainerEl.matches('img')
    ? (fromContainerEl as HTMLImageElement)
    : (fromContainerEl.querySelector('img') as HTMLImageElement | null)

  let ghost: HTMLElement
  if (srcImg) {
    ghost = srcImg.cloneNode(true) as HTMLElement
    ghost.style.borderRadius = '12px'
  } else {
    ghost = document.createElement('div')
    ghost.style.background = '#e9ecef'
    ghost.style.border = '1px solid rgba(0,0,0,.08)'
    ghost.style.borderRadius = '50%'
    ghost.style.width = fromContainerEl.clientWidth + 'px'
    ghost.style.height = fromContainerEl.clientHeight + 'px'
  }

  const srcRect = fromContainerEl.getBoundingClientRect()
  const cartRect = cartEl.getBoundingClientRect()

  ghost.style.position = 'fixed'
  ghost.style.left = srcRect.left + 'px'
  ghost.style.top = srcRect.top + 'px'
  ghost.style.width = srcRect.width + 'px'
  ghost.style.height = srcRect.height + 'px'
  ghost.style.objectFit = 'cover'
  ghost.style.zIndex = '2000'
  ghost.style.pointerEvents = 'none'
  ghost.style.boxShadow = '0 8px 20px rgba(0,0,0,.15)'
  ghost.style.transition = 'transform .6s cubic-bezier(.22,.61,.36,1), opacity .6s ease, width .6s ease, height .6s ease'
  document.body.appendChild(ghost)

  const dx = cartRect.left + cartRect.width / 2 - (srcRect.left + srcRect.width / 2)
  const dy = cartRect.top + cartRect.height / 2 - (srcRect.top + srcRect.height / 2)

  void ghost.getBoundingClientRect()
  requestAnimationFrame(() => {
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(.2)`
    ghost.style.opacity = '0.15'
    ghost.style.width = srcRect.width * 0.2 + 'px'
    ghost.style.height = srcRect.height * 0.2 + 'px'
    ghost.style.boxShadow = '0 4px 12px rgba(0,0,0,.12)'
  })

  setTimeout(() => {
    ghost.remove()
    cartEl.classList.add('cart-pulse')
    setTimeout(() => cartEl.classList.remove('cart-pulse'), 300)
  }, 650)
}

/* Add-to-cart uses displayed qty as increment, capped by stock, with animation */
async function onAddToCart(ev: MouseEvent, p: Product) {
  const uid = await ensureUser()
  if (!uid) {
    alert('Please log in to add items to your cart.')
    return
  }

  const addAmount = Math.max(1, Math.min(cartQty(p.id), (p.stock ?? 0)))
  if (addAmount <= 0) return

  addToCartBusy[p.id] = true
  try {
    let current = cartByProduct[p.id] ?? 0
    if (current === 0) {
      const { data } = await supabase
        .schema('games')
        .from('cart')
        .select('qty')
        .eq('user_id', uid)
        .eq('product_id', p.id)
        .maybeSingle()
      current = Number(data?.qty ?? 0)
    }

    const newQty = Math.max(1, Math.min(current + addAmount, (p.stock ?? Infinity)))
    const { error } = await supabase
      .schema('games')
      .from('cart')
      .upsert(
        { user_id: uid, product_id: p.id, qty: newQty },
        { onConflict: 'user_id,product_id' },
      )
    if (error) {
      console.error('addToCart error', error.message)
      alert(error.message)
      return
    }

    cartByProduct[p.id] = newQty

    const card = (ev.currentTarget as HTMLElement)?.closest('.product-card') as HTMLElement | null
    const img = card?.querySelector('.product-img') as HTMLElement | null
    const placeholder = card?.querySelector('.product-img-fallback') as HTMLElement | null
    flyToCart(img || placeholder || card || null)
  } finally {
    addToCartBusy[p.id] = false
  }
}

/* -------------------- Shipping state (users.address & users.phone_number only) -------------------- */
const showShipping = ref(false)
const savingShipping = ref(false)
const shippingLoaded = ref(false)
const shipping = ref<ShippingRow>({
  user_id: '',
  phone: '',
  address_line1: '',
  barangay: '',
  city: '',
  province: '',
  postal_code: '',
  updated_at: '',
})

const hasShipping = computed(() => {
  const s = shipping.value
  return !!(s.phone && s.address_line1 && s.barangay && s.city && s.province && s.postal_code)
})
const shippingSummary = computed(() => {
  const s = shipping.value
  const parts = [s.address_line1, s.barangay, s.city, s.province, s.postal_code].filter(Boolean)
  return `${s.phone} • ${parts.join(', ')}`
})

type UsersRow = { phone_number: string | null; address: string | null }

function buildAddressString(s: ShippingRow): string {
  return [s.address_line1, s.barangay, s.city, s.province, s.postal_code].filter(Boolean).join(', ')
}
function parseAddressToParts(addr: string | null): Partial<ShippingRow> {
  if (!addr) return {}
  const rawParts = addr.split(',').map(x => x.trim()).filter(Boolean)
  const out: Partial<ShippingRow> = {}
  if (rawParts.length === 0) return out
  let parts = [...rawParts]
  const last = parts[parts.length - 1] || ''
  const zipMatch = last.match(/^\d{4}$/)
  if (zipMatch) { out.postal_code = zipMatch[0]; parts.pop() }
  if (parts.length >= 4) {
    out.province = parts.pop() as string
    out.city = parts.pop() as string
    out.barangay = parts.pop() as string
    out.address_line1 = parts.join(', ')
  } else if (parts.length === 3) {
    out.province = parts.pop() as string
    out.city = parts.pop() as string
    out.address_line1 = parts.join(', ')
  } else if (parts.length === 2) {
    out.city = parts.pop() as string
    out.address_line1 = parts.join(', ')
  } else if (parts.length === 1) {
    out.address_line1 = parts[0]
  }
  return out
}

/* Load shipping from public.users */
async function loadShipping() {
  const uid = await ensureUser()
  if (!uid) { shippingLoaded.value = true; return }

  const { data: userRow } = await supabase
    .from('users')
    .select('phone_number, address')
    .eq('id', uid)
    .maybeSingle()

  const u = (userRow ?? null) as UsersRow | null
  shipping.value.user_id = uid
  shipping.value.phone = u?.phone_number || ''

  const parsed = parseAddressToParts(u?.address ?? null)
  shipping.value.address_line1 = parsed.address_line1 || shipping.value.address_line1
  shipping.value.barangay = parsed.barangay || shipping.value.barangay
  shipping.value.city = parsed.city || shipping.value.city
  shipping.value.province = parsed.province || shipping.value.province
  shipping.value.postal_code = parsed.postal_code || shipping.value.postal_code

  shippingLoaded.value = true
}
function openShippingModal() { showShipping.value = true }
function closeShippingModal() { showShipping.value = false }

async function saveShipping() {
  const uid = await ensureUser()
  if (!uid) { alert('Please log in to save your delivery details.'); return }
  savingShipping.value = true
  try {
    const payload = { phone_number: shipping.value.phone || null, address: buildAddressString(shipping.value) || null }
    const { error } = await supabase.from('users').update(payload).eq('id', uid)
    if (error) { console.error('saveShipping error', error.message); alert(error.message); return }
    await loadShipping()
    closeShippingModal()
  } finally {
    savingShipping.value = false
  }
}

/* -------------------- Checkout (COD only) -------------------- */
async function checkout() {
  const uid = await ensureUser()
  if (!uid) { alert('Please log in to checkout.'); return }
  if (cartItems.value.length === 0) { alert('Your cart is empty.'); return }
  if (!hasShipping.value) {
    alert('Please complete your delivery details first.')
    openShippingModal()
    return
  }

  checkingOut.value = true
  try {
    const totalAmount = cartGrandTotal.value
    const address = buildAddressString(shipping.value)
    const phone = shipping.value.phone

    // Optional: try create order and items (will silently skip on schema mismatch)
    try {
      const { data: orderIns, error: orderErr } = await supabase
        .schema('games')
        .from('orders')
        .insert([{
          user_id: uid,
          total_amount: totalAmount,
          payment_method: 'COD',
          shipping_address: address,
          phone_number: phone,
          status: 'pending',
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single()

      const orderId: string | undefined = orderIns?.id
      if (orderId) {
        const items = cartItems.value.map(it => ({
          order_id: orderId,
          product_id: it.product.id,
          qty: it.qty,
          price_each: Number(it.product.price || 0),
          line_total: it.lineTotal,
        }))
        if (items.length > 0) {
          await supabase.schema('games').from('order_items').insert(items)
        }
      }
    } catch (e) {
      // Swallow if the orders table isn't present; still proceed to clear cart
      console.warn('[checkout] order persistence skipped:', (e as any)?.message || e)
    }

    // Clear cart in DB
    await supabase.schema('games').from('cart').delete().eq('user_id', uid)

    // Clear local state
    for (const k of Object.keys(cartByProduct)) delete cartByProduct[k]
    cartItems.value = []

    closeCartModal()
    alert('Order placed! Payment method: Cash on Delivery. You will receive a confirmation shortly.')
  } finally {
    checkingOut.value = false
  }
}

/* -------------------- Fetch products -------------------- */
async function fetchProducts() {
  loading.value = true

  const from = (page.value - 1) * pageSize.value
  const to = from + pageSize.value - 1

  let query = supabase
    .schema('games')
    .from('products')
    .select('id,name,description,price,product_url,ispublish,stock,created_at', { count: 'exact' })
    .eq('ispublish', true)

  if (inStockOnly.value) query = query.gt('stock', 0)
  if (minPrice.value != null) query = query.gte('price', minPrice.value)
  if (maxPrice.value != null && (minPrice.value == null || maxPrice.value >= minPrice.value)) {
    query = query.lte('price', maxPrice.value)
  }

  const term = search.value.trim()
  if (term) {
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
  }

  switch (sortKey.value) {
    case 'newest':      query = query.order('created_at', { ascending: false }); break
    case 'price_asc':   query = query.order('price', { ascending: true }); break
    case 'price_desc':  query = query.order('price', { ascending: false }); break
    case 'relevance':
    default:            query = query.order('created_at', { ascending: false }); break
  }

  query = query.range(from, to)

  const { data, error, count } = await query

  if (!error && data) {
    products.value = data as Product[]
    total.value = count ?? 0
  } else {
    products.value = []
    total.value = 0
  }

  loading.value = false
}

function goToPage(p: number) {
  const clamped = Math.min(Math.max(p, 1), totalPages.value)
  if (clamped !== page.value) {
    page.value = clamped
    fetchProducts()
  }
}
function applyAndFetch() {
  page.value = 1
  fetchProducts()
}
function changeSort(key: 'relevance' | 'newest' | 'price_asc' | 'price_desc') {
  if (sortKey.value !== key) {
    sortKey.value = key
    applyAndFetch()
  }
}

/* Reactivity */
watch(pageSize, () => goToPage(1))
Promise.all([fetchProducts(), loadCart(), loadShipping()])
</script>

<style scoped>
.shop-page {
  --card-radius: 14px;
}
.product-card {
  border-radius: var(--card-radius);
  transition: transform .15s ease, box-shadow .15s ease;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0,0,0,.08);
}
.product-thumb {
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
}
.object-fit-cover { object-fit: cover; }
.product-title { line-height: 1.2; min-height: 1.2em; }
.price { letter-spacing: .2px; }
.rotate-180 { transform: rotate(180deg); }

/* Modal styles */
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

/* Cart pulse after animation */
.cart-pulse { animation: cartPulse .25s ease; }
@keyframes cartPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(25,135,84,0); }
  50% { transform: scale(1.06); box-shadow: 0 0 20px rgba(25,135,84,.25); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(25,135,84,0); }
}

/* Cart modal item image */
.cart-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 12px;
  overflow: hidden;
}
.product-img-fallback { border-top-left-radius: var(--card-radius); border-top-right-radius: var(--card-radius); }
</style>
