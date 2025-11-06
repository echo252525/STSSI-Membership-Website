<template>
  <div class="shop-page container-xxl py-0 px-0">
    <!-- Delivery / shipping setup -->
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body d-flex flex-wrap align-items-center gap-3">
        <i class="bi bi-geo-alt fs-4 text-primary"></i>
        <div class="flex-grow-1">
          <div class="fw-semibold">
            Delivery details
            <span v-if="!shippingLoaded" class="text-muted small ms-2">(loading…)</span>
          </div>

          <!-- ADDED: shipping skeleton -->
          <div v-if="!shippingLoaded" class="mt-1">
            <div class="skeleton skeleton-text w-50 mb-1"></div>
            <div class="skeleton skeleton-text w-75"></div>
          </div>

          <div class="text-muted small" v-if="shippingLoaded && hasShipping">
            {{ shippingSummary }}
          </div>
          <div class="text-muted small" v-else-if="shippingLoaded">
            No delivery info yet. Add your contact number and address for faster checkout.
          </div>
        </div>
        <router-link
  class="btn btn-outline-primary"
  :to="{ name: 'user.settings' }"
>
  <i class="bi bi-pencil-square me-1"></i>
  {{ hasShipping ? 'Manage in Settings' : 'Set up in Settings' }}
</router-link>

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
                <input
                  v-model.trim="shipping.phone"
                  type="tel"
                  class="form-control"
                  placeholder="+63 9XX XXX XXXX"
                  required
                />
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
                <input
                  v-model.trim="shipping.address_line1"
                  type="text"
                  class="form-control"
                  placeholder="House/Unit/Street"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Barangay</label>
                <input
                  v-model.trim="shipping.barangay"
                  type="text"
                  class="form-control"
                  placeholder="Barangay"
                  required
                />
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
              <button type="button" class="btn btn-outline-secondary" @click="closeShippingModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="savingShipping">
                <span v-if="savingShipping" class="spinner-border spinner-border-sm me-2"></span>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Top controls -->
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body d-flex flex-wrap align-items-center gap-2">
        <div class="input-group" style="max-width: 360px">
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
        <div class="ms-auto d-flex align-items-center gap-2 flex-wrap">
          <div class="btn-group" role="group" aria-label="Sort group">
            <button
              :class="['btn', sortKey === 'relevance' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('relevance')"
            >
              Relevance
            </button>
            <button
              :class="['btn', sortKey === 'newest' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('newest')"
            >
              Newest
            </button>
            <button
              :class="['btn', sortKey === 'price_asc' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('price_asc')"
              title="Price: Low to High"
            >
              <i class="bi bi-arrow-down-up me-1"></i>Price ↑
            </button>
            <button
              :class="['btn', sortKey === 'price_desc' ? 'btn-primary' : 'btn-outline-secondary']"
              @click="changeSort('price_desc')"
              title="Price: High to Low"
            >
              <i class="bi bi-arrow-down-up me-1 rotate-180"></i>Price ↓
            </button>
          </div>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="inStockSwitch"
              v-model="inStockOnly"
              @change="applyAndFetch"
            />
            <label class="form-check-label" for="inStockSwitch">In Stock</label>
          </div>
          <div class="d-flex align-items-center gap-2">
            <label class="text-muted small">Per page</label>
            <select
              v-model.number="pageSize"
              class="form-select form-select-sm"
              style="width: 84px"
              @change="goToPage(1)"
            >
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
            </select>
          </div>
          <button
            ref="cartBtnRef"
            class="btn btn-outline-dark position-relative"
            @click="openCartModal"
          >
            <i class="bi bi-cart3 me-1"></i>
            View Cart
            <span
  v-if="cartTotalItemsRaw > 0"
  class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
>
  {{ cartTotalItemsDisplay }}
</span>

            >
          </button>
        </div>
      </div>
    </div>
    <div class="row g-3">
      <!-- Sidebar -->
      <aside class="col-12 col-xxl-3">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white"><strong>Filters</strong></div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Price range</label>
              <div class="input-group mb-2">
                <span class="input-group-text">₱</span>
                <input
                  v-model.number="minPrice"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="Min"
                />
              </div>
              <div class="input-group">
                <span class="input-group-text">₱</span>
                <input
                  v-model.number="maxPrice"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="Max"
                />
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
        <!-- Pending Orders List (below Filters) -->
        <div class="card shadow-sm border-0 mt-3">
          <div class="card-header bg-white d-flex align-items-center justify-content-between">
            <strong>Your Pending Orders</strong>
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="loadPendingOrders"
              title="Refresh"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <div class="card-body p-0">
            <!-- ADDED: pending list skeleton -->
            <div v-if="pendingLoading" class="p-3">
              <div v-for="i in 3" :key="'pend-skel-'+i" class="mb-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <div class="pending-thumb skeleton"></div>
                    <div>
                      <div class="skeleton skeleton-text w-50 mb-1"></div>
                      <div class="skeleton skeleton-text w-25"></div>
                    </div>
                  </div>
                  <div class="skeleton skeleton-pill"></div>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                  <div class="skeleton skeleton-text w-25"></div>
                  <div class="skeleton skeleton-btn"></div>
                </div>
              </div>
            </div>

            <div v-else-if="pendingGroups.length === 0" class="p-3 text-muted small">
              No pending orders yet.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li
                v-for="g in pendingGroups"
                :key="g.ref"
                class="list-group-item d-flex flex-column gap-2"
              >
                <!-- header row: tiny pic + name + ref + items badge -->
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-2">
                    <div class="pending-thumb">
                      <img
                        v-if="g.sampleImageUrl"
                        :src="g.sampleImageUrl"
                        alt=""
                        class="w-100 h-100 object-fit-cover rounded"
                      />
                      <div
                        v-else
                        class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                      >
                        <i class="bi bi-image"></i>
                      </div>
                    </div>
                    <div class="d-flex flex-column">
                      <div class="pending-sample-name" :title="g.sampleName || '—'">
                        {{ g.sampleName || '—' }}
                      </div>
                      <div class="small text-muted">
                        Ref: <span class="text-monospace">{{ g.ref }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="badge rounded-pill text-bg-secondary">
                    {{ g.itemsCount }} item{{ g.itemsCount > 1 ? 's' : '' }}
                  </span>
                </div>
                <!-- admin shipping & button -->
                <div class="d-flex align-items-center justify-content-between">
                  <div class="small">
                    Admin shipping fee:
                    <strong v-if="g.highestShippingFee > 0"
                      >₱ {{ number(g.highestShippingFee) }}</strong
                    >
                    <span v-else class="text-warning">awaiting…</span>
                  </div>
                  <button
                    class="btn btn-sm btn-primary"
                    :disabled="placingOrder || g.itemsCount === 0"
                    @click="openPlacePending(g.ref)"
                    title="Review & Place"
                  >
                    Review & Place
                  </button>
                </div>
                <div class="fw-semibold">
                  ₱
                  {{
                    number(
                      g.displayTotal ??
                        g.itemsTotal + (g.highestShippingFee > 0 ? g.highestShippingFee : 0),
                    )
                  }}
                  <span v-if="g.highestShippingFee === 0" class="text-muted small"
                    >(+ shipping)</span
                  >
                </div>
              </li>
            </ul>
          </div>
        </div>
        <!-- /Pending Orders List -->
      </aside>
      <!-- Products -->
      <section class="col-12 col-xxl-9" :class="{ 'is-loading': loading }">

        <div v-if="loading" class="text-center text-muted py-5">
          <span class="spinner-border me-2"></span> Loading products…

          <!-- ADDED: product card skeletons -->
          <div class="row g-3 mt-3 text-start">

            <div class="col-12 col-lg-6 col-xxl-4 products-div" v-for="n in Math.min(pageSize, 12)" :key="'prod-skel-'+n">
              <div class="card h-100 product-card border-0 shadow-sm">
                <div class="ratio product-thumb bg-light">
                  <div class="skeleton skeleton-fill rounded-top"></div>
                </div>
                <div class="card-body">
                  <div class="skeleton skeleton-text w-75 mb-2"></div>
                  <div class="skeleton skeleton-text w-100 mb-1"></div>
                  <div class="skeleton skeleton-text w-50 mb-3"></div>
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="skeleton skeleton-text w-25"></div>
                    <div class="skeleton skeleton-pill"></div>
                  </div>
                </div>
                <div class="card-footer bg-white border-0">
                  <div class="skeleton skeleton-input mb-2"></div>
                  <div class="skeleton skeleton-btn"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="row g-3">
          <div v-if="products.length === 0" class="col-12">
            <div class="text-center text-muted py-5">
              <i class="bi bi-box-seam fs-2 d-block mb-2"></i>
              No products matched your filters.
            </div>
          </div>
          <!-- 2 / 3 / 4 cards per row -->
          <div class="col-12 col-lg-6 col-xxl-4 products-div" v-for="p in products" :key="p.id">
            <div
              class="card h-100 product-card border-0 shadow-sm product-card--clickable"
              @click="openProductModal(p)"
              tabindex="0"
            >
              <div class="ratio product-thumb bg-light">
                <div
                  v-if="hasMultipleImages(p)"
                  class="carousel-thumb"
                  @touchstart.passive="onTouchStart($event, p.id)"
                  @touchend.passive="onTouchEnd($event, p.id)"
                >
                  <div class="slides">
                    <img
                      v-for="(u, i) in productImages(p)"
                      :key="i"
                      :src="u"
                      :alt="p.name"
                      class="slide-img"
                      :class="{ 'slide-img--active': currentSlide(p.id) === i }"
                    />
                  </div>
                  <div class="dots">
                    <span
                      class="dot"
                      v-for="(u, i) in productImages(p)"
                      :key="'d' + i"
                      :class="{ active: currentSlide(p.id) === i }"
                      @click.stop="goToSlide(p.id, i)"
                      aria-label="Go to image"
                    ></span>
                  </div>
                  <button
                    class="nav left"
                    @click.stop="prevSlide(p.id)"
                    aria-label="Previous image"
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <button class="nav right" @click.stop="nextSlide(p.id)" aria-label="Next image">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
                <img
                  v-else-if="imageUrl(p)"
                  :src="imageUrl(p)"
                  :alt="p.name"
                  class="w-100 h-100 object-fit-cover rounded-top product-img"
                />
                <div
                  v-else
                  class="w-100 h-100 d-flex align-items-center justify-content-center text-muted product-img-fallback"
                >
                  <i class="bi bi-image fs-3"></i>
                </div>
              </div>
              <div class="card-body d-flex flex-column">
                <div class="fw-semibold product-title text-truncate" :title="p.name">
                  {{ p.name }}
                </div>
                <div class="text-muted small text-truncate mb-2" v-if="p.description">
                  {{ p.description }}
                </div>
                <div class="mt-auto d-flex align-items-center justify-content-between">
                  <!-- Price display with membership discount & credits check -->
                  <div class="price fw-bold">
                    <template v-if="hasMemberDiscount && canDiscountProduct(p)">
                      <span class="price-original text-muted text-decoration-line-through me-1">
                        ₱ {{ number(p.price) }}
                      </span>
                      <span class="price-discount"> ₱ {{ number(discountedPrice(p.price)) }} </span>
                      <span class="badge ms-1 text-bg-warning small">-{{ discountLabel }}</span>
                    </template>
                    <template v-else> ₱ {{ number(p.price) }} </template>
                  </div>
                  <span
                    class="badge"
                    :class="(p.stock ?? 0) > 0 ? 'text-bg-success' : 'text-bg-secondary'"
                    :title="'Stock: ' + (p.stock ?? 0)"
                    >Stock: {{ p.stock ?? 0 }}</span
                  >
                </div>
              </div>
              <div class="card-footer bg-white border-0 pt-0">
                <div class="d-grid gap-2">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">Qty</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click.stop="decQty(p)"
                      :disabled="cartQty(p.id) <= 1"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input
                      class="form-control text-center qty-field"
                      :value="cartQty(p.id)"
                      readonly
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click.stop="incQty(p)"
                      :disabled="p.stock != null ? cartQty(p.id) >= Number(p.stock) : false"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                  <button
                    class="btn btn-primary"
                    :disabled="(p.stock ?? 0) <= 0 || addToCartBusy[p.id]"
                    @click.stop="onAddToCart($event, p)"
                  >
                    <span
                      v-if="addToCartBusy[p.id]"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Pagination -->
        <div v-if="total > 0" class="d-flex align-items-center justify-content-center gap-2 mt-3">
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="page === 1 || loading"
            @click="goToPage(page - 1)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="small text-muted"
            >Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong></span
          >
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="page >= totalPages || loading"
            @click="goToPage(page + 1)"
          >
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
          <!-- ADDED: cart skeleton -->
          <div v-if="cartLoading" class="vstack gap-3">
            <div v-for="i in 3" :key="'cart-skel-'+i" class="d-flex align-items-center gap-3 border rounded-3 p-2">
              <div class="cart-thumb ratio ratio-1x1 bg-light">
                <div class="skeleton w-100 h-100 rounded"></div>
              </div>
              <div class="flex-grow-1">
                <div class="skeleton skeleton-text w-75 mb-2"></div>
                <div class="skeleton skeleton-text w-25 mb-3"></div>
                <div class="skeleton skeleton-input mb-2" style="max-width: 140px;"></div>
                <div class="skeleton skeleton-text w-50"></div>
              </div>
            </div>
          </div>

          <div v-else-if="cartItems.length === 0" class="text-center text-muted">
            <i class="bi bi-bag-x fs-2 d-block mb-2"></i>
            Your cart is empty.
          </div>
          <div v-else class="vstack gap-3">
            <div
              v-for="it in cartItems"
              :key="it.product.id"
              class="d-flex align-items-center gap-3 border rounded-3 p-2"
            >
              <div class="cart-thumb ratio ratio-1x1 bg-light">
                <img
                  v-if="it.imageUrl"
                  :src="it.imageUrl"
                  :alt="it.product.name"
                  class="w-100 h-100 object-fit-cover rounded"
                />
                <div
                  v-else
                  class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                >
                  <i class="bi bi-image"></i>
                </div>
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold text-wrap" :title="it.product.name">
                  {{ it.product.name }}
                </div>
                <!-- per-item price -->
                <div class="small">
                  <template v-if="hasMemberDiscount && isItemDiscounted(it.product.id)">
                    <strong class="me-2 text-danger">₱{{ number(it.unit) }}</strong>
                    <span class="text-muted text-decoration-line-through"
                      >₱{{ number(it.originalUnit) }}</span>
                    <span class="badge ms-1 text-bg-warning small">-{{ discountLabel }}</span>
                  </template>
                  <template v-else>₱{{ number(it.unit) }}</template>

                  <div class="d-flex align-items-center mt-1 mb-3">
                    <div class="input-group input-group-sm me-2" style="width: 100px">
                      <button
                        class="btn btn-outline-secondary"
                        title="Decrease"
                        @click="decrementCartProduct(it.product.id)"
                      >
                        <i class="bi bi-dash"></i>
                      </button>
                      <input
                        class="form-control text-center"
                        :value="dbCartByProduct[it.product.id] ?? it.qty"
                        readonly
                      />
                      <button
                        class="btn btn-outline-secondary"
                        title="Increase"
                        @click="incrementCartProduct(it.product.id, it.product)"
                      >
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div>
                      <button
                        class="btn btn-outline-danger btn-sm"
                        title="Remove item"
                        @click="removeCartProduct(it.product.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="fw-bold me-2 text-success">
                    Total: ₱{{ number((dbCartByProduct[it.product.id] ?? it.qty) * it.unit) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="d-flex align-items-center justify-content-between fs-5">
              <div class="fw-semibold">Merchandise Subtotal</div>
              <div class="fw-bold text-success">₱{{ number(cartGrandTotal) }}</div>
            </div>
            <div class="d-flex justify-content-between flex-wrap gap-2">
              <button
                class="btn btn-outline-danger"
                :disabled="cartItems.length === 0 || clearingCart"
                @click="clearCart"
              >
                <span v-if="clearingCart" class="spinner-border spinner-border-sm me-2"></span>
                Clear cart
              </button>
              <div class="ms-auto">
                <button
                  class="btn btn-success"
                  :disabled="cartItems.length === 0"
                  @click="openPlaceOrder"
                >
                  Request Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Request Order Modal (shipping is set later by admin, so total here is items only) -->
    <div v-if="showPlace" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg modal-card--aesthetic">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Request Order</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closePlaceOrder">✕</button>
        </div>
        <div class="card-body vstack gap-3">
          <div class="border rounded-3 p-3">
            <div class="fw-semibold mb-2"><i class="bi bi-truck me-2"></i>Delivery details</div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Phone number</label>
                <input
                  v-model.trim="shipping.phone"
                  type="tel"
                  class="form-control"
                  placeholder="+63 9XX XXX XXXX"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Postal code</label>
                <input
                  v-model.trim="shipping.postal_code"
                  type="text"
                  class="form-control"
                  inputmode="numeric"
                  maxlength="4"
                  pattern="\d{4}"
                  placeholder="e.g. 1000"
                  title="Postal code must be exactly 4 digits"
                  required
                />
              </div>
              <div class="col-12">
                <label class="form-label">Address line 1 (House/Unit & Street)</label>
                <input
                  v-model.trim="shipping.address_line1"
                  type="text"
                  class="form-control"
                  placeholder="House/Unit/Street"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Barangay</label>
                <input
                  v-model.trim="shipping.barangay"
                  type="text"
                  class="form-control"
                  placeholder="Barangay"
                  required
                />
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
          </div>
          <!-- Payment method -->
          <div class="border rounded-3 p-3">
            <div class="fw-semibold mb-2"><i class="bi bi-wallet2 me-2"></i>Payment method</div>
            <div class="vstack gap-2">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="pmCOD"
                  value="cod"
                  v-model="paymentMethod"
                  :disabled="placingOrder"
                />
                <label class="form-check-label" for="pmCOD"> Cash on Delivery </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="pmEW"
                  value="ewallet"
                  v-model="paymentMethod"
                  :disabled="placingOrder"
                />
                <label class="form-check-label" for="pmEW">
                  E-Wallet
                  <span class="text-muted"> (Balance: ₱ {{ number(userBalance) }}) </span>
                </label>
              </div>
              <div class="text-muted small">
                No payment is deducted at this step. After admin sets the shipping fee, you can
                place the order.
              </div>
            </div>
          </div>
          <!-- Discount Mode Selector -->
          <div class="border rounded-3 p-3">
            <div class="fw-semibold mb-2"><i class="bi bi-percent me-2"></i>Discount Options</div>
            <div class="d-flex flex-wrap gap-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  id="modeCredits"
                  value="credits"
                  v-model="discountMode"
                />
                <label class="form-check-label" for="modeCredits">Use Discount Credits</label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  id="modeDiscount"
                  value="discount"
                  v-model="discountMode"
                />
                <label class="form-check-label" for="modeDiscount"
                  >Use Discount (Code or Select)</label
                >
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  id="modeNone"
                  value="none"
                  v-model="discountMode"
                />
                <label class="form-check-label" for="modeNone">None</label>
              </div>
            </div>
            <div class="small text-muted mt-2">
              Discounts are finalized when you place the order after the shipping fee is set.
            </div>
          </div>
          <!-- Discount Credits (disabled if mode !== credits) -->
          <div
            class="border rounded-3 p-3"
            :class="discountMode !== 'credits' ? 'opacity-50 pe-none' : ''"
          >
            <div class="fw-semibold mb-2">
              <i class="bi bi-ticket-perforated me-2"></i>Discount Credits
            </div>
            <div class="d-flex flex-wrap gap-3 align-items-center">
              <div>
                <div class="text-muted small">Current Balance</div>
                <div class="fs-5 fw-semibold">₱ {{ number(userDiscountCredits) }}</div>
              </div>
              <div class="vr d-none d-md-block"></div>
              <div>
                <div class="text-muted small">Estimated Deduction</div>
                <div class="fs-5 fw-semibold">
                  ₱ {{ number(totalDiscountCreditsUsedIfCreditsMode) }}
                </div>
              </div>
              <div class="ms-auto">
                <div class="text-muted small">Projected Balance</div>
                <div class="fw-semibold">
                  ₱ {{ number(userDiscountCredits - totalDiscountCreditsUsedIfCreditsMode) }}
                </div>
              </div>
            </div>
            <div class="small text-muted mt-2">
              We only deduct Discount Credits when you place the order (after the shipping fee is
              set).
            </div>
            <div
              v-if="discountMode === 'credits' && insufficientDiscountCredits"
              class="alert alert-warning mt-3 mb-0 py-2 small"
              role="alert"
            >
              Some items might not get a membership discount if credits are insufficient. This will
              be finalized when placing the order.
            </div>
          </div>
          <!-- Order Discount (code or select) -->
          <div class="border rounded-3 p-3" v-if="discountMode === 'discount'">
            <!-- ADDED: discounts skeleton -->
            <template v-if="discountsLoading">
              <div class="fw-semibold mb-2"><i class="bi bi-gift me-2"></i>Order Discount</div>
              <div class="skeleton skeleton-input mb-3"></div>
              <div class="skeleton skeleton-select mb-3"></div>
              <div class="skeleton skeleton-text w-100 mb-1"></div>
              <div class="skeleton skeleton-text w-75 mb-1"></div>
              <div class="skeleton skeleton-text w-50"></div>
            </template>

            <!-- EXISTING CONTENT, now under v-else -->
            <template v-else>
              <div class="fw-semibold mb-2"><i class="bi bi-gift me-2"></i>Order Discount</div>
              <div class="row g-3 align-items-end">
                <div class="col-md-6">
                  <label class="form-label">Discount Code</label>
                  <div class="input-group">
                    <input
                      v-model.trim="discountCodeInput"
                      type="text"
                      class="form-control"
                      placeholder="Enter discount code"
                      @keyup.enter="applyCode()"
                    />
                    <button class="btn btn-outline-secondary" @click="applyCode()">Apply</button>
                  </div>
                  <div class="small mt-1" :class="codeStatusClass">
                    {{ codeStatusText }}
                  </div>
                </div>
                <!-- ===== Discount Ticket Picker (ADD) ===== -->
<div class="discount-picker position-relative mb-3">
  <!-- Trigger -->
  <button
    type="button"
    class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between gap-2"
    @click="openDiscountMenu"
    :disabled="discountsLoading"
  >
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-ticket-perforated"></i>
      <div class="text-start">
        <div class="fw-semibold">
          {{ chosenTicket?.title || 'Pick an active discount' }}
        </div>
        <div class="small text-muted" v-if="chosenTicket">
          <span class="me-2">{{ chosenTicket.valueText }}</span>
          <span class="badge bg-light text-dark border">{{ chosenTicket.scopeText }}</span>
          <template v-if="chosenTicket.minSubtotal && chosenTicket.minSubtotal > 0">
            <span class="ms-2 small">Min ₱ {{ number(chosenTicket.minSubtotal) }}</span>
          </template>
          <template v-if="chosenTicket.maxCap != null">
            <span class="ms-2 small">Cap ₱ {{ number(chosenTicket.maxCap) }}</span>
          </template>
        </div>
        <div class="small text-muted" v-else>
          {{ discountsLoading ? 'Loading discounts…' : 'Tap to see available vouchers' }}
        </div>
      </div>
    </div>
    <i class="bi" :class="showDiscountMenu ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
  </button>

  <!-- Dropdown -->
  <div
    v-if="showDiscountMenu"
    class="ticket-menu card shadow-lg border-0 mt-2"
    style="position:absolute; inset-inline:0; z-index:1100;"
  >
    <div class="card-body p-2">
      <div v-if="discountsLoading" class="p-3 text-center text-muted small">
        Loading…
      </div>

      <template v-else>
        <div
          v-if="pickableDiscounts.length === 0"
          class="p-3 text-center text-muted small"
        >
          No active discounts applicable to your items.
        </div>

        <ul class="list-unstyled m-0 d-flex flex-column gap-2">
          <li
            v-for="d in pickableDiscounts"
            :key="d.id"
            class="ticket d-flex align-items-stretch"
          >
            <button
              type="button"
              class="ticket-btn w-100"
              @click="chooseDiscount(d.id)"
            >
              <!-- Left: product avatar when product-scoped -->
              <div class="ticket-left" v-if="d.productId">
                <div class="ticket-avatar">
                  <img v-if="d.productThumb" :src="d.productThumb" alt="" />
                  <div v-else class="ticket-avatar-fallback">
                    <i class="bi bi-box"></i>
                  </div>
                </div>
              </div>

              <!-- Main -->
              <div class="ticket-main">
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <div class="ticket-title fw-semibold">
                    {{ d.title }}
                  </div>
                  <div class="ticket-value">
                    {{ d.valueText }}
                  </div>
                </div>

                <div class="ticket-sub small text-muted">
                  <span class="badge bg-light text-dark border me-2">{{ d.scopeText }}</span>
                  <template v-if="d.productId && d.productName">
                    <span class="text-truncate">for <strong>{{ d.productName }}</strong></span>
                  </template>
                </div>

                <div class="ticket-foot small text-muted">
                  <template v-if="d.minSubtotal && d.minSubtotal > 0">
                    Min: ₱ {{ number(d.minSubtotal) }}
                  </template>
                  <template v-if="d.maxCap != null">
                    <span class="ms-2">Cap: ₱ {{ number(d.maxCap) }}</span>
                  </template>
                </div>

                <div class="ticket-blurb small mt-1" v-if="d.blurb">
                  {{ d.blurb }}
                </div>
              </div>

              <!-- Perforation & stub -->
              <div class="ticket-stub d-none d-sm-flex flex-column align-items-center justify-content-center">
                <i
                  class="bi"
                  :class="selectedDiscountId === d.id ? 'bi-check2-circle' : 'bi-plus-circle'"
                ></i>
                <div class="small mt-1">
                  {{ selectedDiscountId === d.id ? 'Selected' : 'Use' }}
                </div>
              </div>
            </button>
          </li>

          <!-- Clear selection -->
          <li>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary w-100"
              @click="chooseDiscount(null)"
            >
              Clear selection
            </button>
          </li>
        </ul>
      </template>
    </div>
  </div>
</div>
<!-- ===== End Ticket Picker ===== -->

              </div>
              <div class="mt-3 small">
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-muted">Subtotal (before order discount)</span>
                  <span>₱ {{ number(cartGrandTotalCreditsOff) }}</span>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                  <span class="text-muted">Order Discount</span>
                  <span class="fw-semibold">− ₱ {{ number(orderLevelDiscountAmount) }}</span>
                </div>
                <div class="d-flex align-items-center justify-content-between fs-6 mt-1">
                  <span class="fw-semibold">Total after order discount</span>
                  <span class="fw-bold">₱ {{ number(cartTotalAfterOrderDiscount) }}</span>
                </div>
                <div v-if="orderDiscountIneligibleReason" class="text-danger mt-2">
                  {{ orderDiscountIneligibleReason }}
                </div>
              </div>
            </template>
          </div>
          <!-- Items total -->
          <div class="d-flex align-items-center justify-content-between fs-5">
            <div class="fw-semibold">Items Total</div>
            <div class="fw-bold">₱ {{ number(finalPayableTotal) }}</div>
          </div>
          <div class="d-flex justify-content-end">
            <button class="btn btn-primary" :disabled="placingOrder" @click="placeOrder">
              <span v-if="placingOrder" class="spinner-border spinner-border-sm me-2"></span>
              Request Order
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Place Pending Order Modal (READ-ONLY review) -->
    <div v-if="showPendingPlace" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg modal-card--aesthetic">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Place Pending Order</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closePlacePending">✕</button>
        </div>
        <div class="card-body vstack gap-3">

          <!-- ADDED: place-pending skeleton -->
          <template v-if="pendingPlaceLoading">
            <div class="border rounded-3 p-3">
              <div class="skeleton skeleton-text w-25 mb-2"></div>
              <div class="skeleton skeleton-pill" style="width: 80px;"></div>
            </div>
            <div class="border rounded-3 p-3">
              <div class="skeleton skeleton-text w-50 mb-2"></div>
              <div class="skeleton skeleton-text w-75"></div>
            </div>
            <div class="border rounded-3 p-3">
              <div class="skeleton skeleton-text w-25 mb-2"></div>
              <div class="skeleton skeleton-text w-25"></div>
            </div>
            <div class="border rounded-3 p-3">
              <div class="skeleton skeleton-text w-25 mb-3"></div>
              <div v-for="i in 3" :key="'pp-skel-'+i" class="d-flex align-items-center gap-3 mb-2">
                <div class="pending-item-thumb skeleton"></div>
                <div class="flex-grow-1">
                  <div class="skeleton skeleton-text w-75 mb-1"></div>
                  <div class="skeleton skeleton-text w-50"></div>
                </div>
              </div>
            </div>
            <div class="border rounded-3 p-3">
              <div class="skeleton skeleton-text w-25 mb-2"></div>
              <div class="skeleton skeleton-text w-25"></div>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-text w-25"></div>
              <div class="skeleton skeleton-text w-25"></div>
            </div>
            <hr class="my-1" />
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-text w-25"></div>
              <div class="skeleton skeleton-text w-25"></div>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <div class="skeleton skeleton-btn"></div>
              <div class="skeleton skeleton-btn"></div>
            </div>
          </template>

          <!-- EXISTING content, now under v-else -->
          <template v-else>
            <div class="border rounded-3 p-3">
              <div class="d-flex align-items-center justify-content-between">
                <div class="fw-semibold">
                  <i class="bi bi-receipt me-2"></i>Reference:
                  <span class="text-monospace">{{ pendingRefNumber }}</span>
                </div>
                <span class="badge rounded-pill text-bg-info">Pending</span>
              </div>
            </div>
            <!-- Delivery (READ-ONLY) -->
            <div class="border rounded-3 p-3">
              <div class="fw-semibold mb-2"><i class="bi bi-truck me-2"></i>Delivery details</div>
              <div class="small">
                <div><strong>Phone:</strong> {{ shipping.phone || '—' }}</div>
                <div><strong>Address:</strong> {{ shippingSummary || '—' }}</div>
              </div>
            </div>
            <!-- Payment (READ-ONLY) -->
            <div class="border rounded-3 p-3">
              <div class="fw-semibold mb-2"><i class="bi bi-wallet2 me-2"></i>Payment method</div>
              <span class="badge text-bg-secondary">
                {{ paymentMethod === 'ewallet' ? 'E-Wallet' : 'Cash on Delivery' }}
              </span>
              <div v-if="paymentMethod === 'ewallet'" class="text-muted small mt-1">
                Balance: ₱ {{ number(userBalance) }}
              </div>
              <div
                v-if="paymentMethod === 'ewallet' && !enoughBalanceForOrder"
                class="text-danger small mt-1"
              >
                Insufficient E-Wallet balance for order total.
              </div>
            </div>
            <!-- Discount (READ-ONLY) -->
            <div class="border rounded-3 p-3">
              <div class="fw-semibold mb-2"><i class="bi bi-percent me-2"></i>Discount</div>
              <!-- Credits mode summary -->
              <template v-if="discountMode === 'credits'">
                <div class="small">
                  Membership discount via Discount Credits
                  <span class="text-muted">
                    (estimated used: ₱ {{ number(totalDiscountCreditsUsedIfCreditsMode) }})
                  </span>
                </div>
              </template>
              <!-- Order-level discount summary -->
              <template v-else-if="discountMode === 'discount'">
                <div class="small">
                  <div class="mb-1">
                    <strong>Applied:</strong>
                    <template v-if="resolvedDiscountByCode">
                      {{ resolvedDiscountByCode.title }}
                    </template>
                    <template v-else-if="selectedDiscountId">
                      {{ discounts.find((d) => d.id === selectedDiscountId)?.title || '—' }}
                    </template>
                    <template v-else>—</template>
                  </div>
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted">Subtotal (before order discount)</span>
                    <span>₱ {{ number(cartGrandTotalCreditsOff) }}</span>
                  </div>
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="text-muted">Order Discount</span>
                    <span class="fw-semibold">− ₱ {{ number(orderLevelDiscountAmount) }}</span>
                  </div>
                  <div class="d-flex align-items-center justify-content-between fs-6 mt-1">
                    <span class="fw-semibold">Total after order discount</span>
                    <span class="fw-bold">₱ {{ number(cartTotalAfterOrderDiscount) }}</span>
                  </div>
                  <div v-if="orderDiscountIneligibleReason" class="text-danger mt-2">
                    {{ orderDiscountIneligibleReason }}
                  </div>
                </div>
              </template>
              <!-- None -->
              <template v-else>
                <div class="small text-muted">No discount applied.</div>
              </template>
            </div>
            <!-- Items (READ-ONLY) -->
            <div class="border rounded-3 p-3">
              <div class="fw-semibold mb-2"><i class="bi bi-bag me-2"></i>Items</div>
              <div v-if="cartItems.length === 0" class="text-muted small">
                No items found for this pending order.
              </div>
              <div v-else class="vstack gap-2">
                <div
                  v-for="it in cartItems"
                  :key="it.product.id"
                  class="d-flex align-items-start gap-3"
                >
                  <!-- thumb -->
                  <div class="pending-item-thumb bg-light rounded">
                    <img
                      v-if="it.imageUrl"
                      :src="it.imageUrl"
                      :alt="it.product.name"
                      class="w-100 h-100 object-fit-cover rounded"
                    />
                    <div
                      v-else
                      class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                    >
                      <i class="bi bi-image"></i>
                    </div>
                  </div>
                  <!-- texts -->
                  <div class="flex-grow-1">
                    <div class="fw-semibold line-clamp-1" :title="it.product.name">
                      {{ it.product.name }}
                    </div>
                    <div
                      v-if="it.product.description"
                      class="text-muted small line-clamp-2"
                      :title="it.product.description"
                    >
                      {{ it.product.description }}
                    </div>
                    <div class="small mt-1">Qty: {{ it.qty }}</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Shipping Fee (display only) -->
            <div class="border rounded-3 p-3 bg-light-subtle">
              <div class="d-flex align-items-center justify-content-between">
                <div class="fw-semibold">
                  <i class="bi bi-truck-flatbed me-2"></i>Admin Shipping Fee
                </div>
                <div class="fs-5">
                  <strong v-if="pendingHasFreeShipping">Free</strong>
                  <strong v-else-if="pendingHighestShippingFee > 0"
                    >₱ {{ number(pendingHighestShippingFee) }}</strong
                  >
                  <span v-else class="text-warning">awaiting…</span>
                </div>
              </div>
              <div class="small text-muted mt-1">
                We display the <em>highest</em> shipping fee among items in this reference. This fee
                is now included in your order total.
              </div>
            </div>
            <!-- Totals (Items + Shipping = Order Total) -->
            <div class="d-flex align-items-center justify-content-between">
              <span class="text-muted">Items Total</span>
              <span>₱ {{ number(finalPayableTotal) }}</span>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <span class="text-muted">Shipping Fee</span>
              <span>₱ {{ number(pendingHasFreeShipping ? 0 : pendingHighestShippingFee) }}</span>
            </div>
            <hr class="my-1" />
            <div class="d-flex align-items-center justify-content-between fs-5">
              <div class="fw-semibold">Order Total</div>
              <div class="fw-bold">₱ {{ number(orderTotalPending) }}</div>
            </div>
            <div class="d-flex justify-content-between">
              <!-- NEW: Cancel Request -->
              <button
                class="btn btn-outline-danger"
                :disabled="placingOrder"
                @click="cancelPendingOrder"
                title="Cancel this pending request"
              >
                Cancel Request
              </button>
              <button
                class="btn btn-primary"
                :disabled="
                  placingOrder ||
                  (!pendingHasFreeShipping && pendingHighestShippingFee <= 0) ||
                  (paymentMethod === 'ewallet' && !enoughBalanceForOrder)
                "
                @click="placePendingOrder"
                title="Place Order (enabled when admin has set shipping fee)"
              >
                <span v-if="placingOrder" class="spinner-border spinner-border-sm me-2"></span>
                Place Order
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- /Place Pending Order Modal -->
    <!-- Product Details Modal -->
    <div v-if="showProductModal && productModal" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg product-modal-card">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Product Details</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeProductModal">✕</button>
        </div>
        <div class="card-body">
          <div class="row g-4">

            <!-- ADDED: product-modal skeleton -->
            <template v-if="productModalLoading">
              <div class="col-12 col-lg-6">
                <div class="ratio product-modal-thumb bg-light">
                  <div class="skeleton w-100 h-100 rounded-top"></div>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <div class="skeleton skeleton-text w-50 mb-2"></div>
                <div class="skeleton skeleton-text w-25 mb-3"></div>
                <div class="skeleton skeleton-text w-100 mb-2"></div>
                <div class="skeleton skeleton-text w-100 mb-2"></div>
                <div class="skeleton skeleton-input mb-2" style="max-width: 240px;"></div>
                <div class="skeleton skeleton-btn" style="width: 160px;"></div>
              </div>
            </template>

            <!-- EXISTING content, now under v-else -->
            <template v-else>
              <!-- Gallery -->
              <div class="col-12 col-lg-6">
                <div class="ratio product-modal-thumb bg-light" ref="productModalThumbRef">
                  <div
                    v-if="hasMultipleImages(productModal)"
                    class="carousel-thumb"
                    @touchstart.passive="onTouchStart($event, productModal.id)"
                    @touchend.passive="onTouchEnd($event, productModal.id)"
                  >
                    <div class="slides">
                      <img
                        v-for="(u, i) in productImages(productModal)"
                        :key="i"
                        :src="u"
                        :alt="productModal.name"
                        class="slide-img"
                        :class="{ 'slide-img--active': currentSlide(productModal.id) === i }"
                      />
                    </div>
                    <div class="dots">
                      <span
                        class="dot"
                        v-for="(u, i) in productImages(productModal)"
                        :key="'md' + i"
                        :class="{ active: currentSlide(productModal.id) === i }"
                        @click.stop="goToSlide(productModal.id, i)"
                        aria-label="Go to image"
                      ></span>
                    </div>
                    <button
                      class="nav left"
                      @click.stop="prevSlide(productModal.id)"
                      aria-label="Previous image"
                    >
                      <i class="bi bi-chevron-left"></i>
                    </button>
                    <button
                      class="nav right"
                      @click.stop="nextSlide(productModal.id)"
                      aria-label="Next image"
                    >
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </div>
                  <img
                    v-else-if="imageUrl(productModal)"
                    :src="imageUrl(productModal)"
                    :alt="productModal.name"
                    class="w-100 h-100 object-fit-cover rounded-top product-img"
                  />
                  <div
                    v-else
                    class="w-100 h-100 d-flex align-items-center justify-content-center text-muted product-img-fallback"
                  >
                    <i class="bi bi-image fs-3"></i>
                  </div>
                </div>
              </div>
              <!-- Details -->
              <div class="col-12 col-lg-6">
                <div class="d-flex align-items-start justify-content-between">
                  <h4 class="mb-1">{{ productModal.name }}</h4>
                  <span
                    class="badge ms-2"
                    :class="(productModal.stock ?? 0) > 0 ? 'text-bg-success' : 'text-bg-secondary'"
                  >
                    Stock: {{ productModal.stock ?? 0 }}
                  </span>
                </div>
                <div class="mb-3">
                  <div class="fs-5 fw-semibold">
                    <template v-if="hasMemberDiscount && canDiscountProduct(productModal)">
                      <span class="text-muted text-decoration-line-through me-2">
                        ₱ {{ number(productModal.price) }}
                      </span>
                      <span>₱ {{ number(discountedPrice(productModal.price)) }}</span>
                      <span class="badge ms-2 text-bg-warning">-{{ discountLabel }}</span>
                    </template>
                    <template v-else> ₱ {{ number(productModal.price) }} </template>
                  </div>
                </div>
                <div class="mb-3" v-if="productModal.description">
                  <div class="fw-semibold mb-1">Description</div>
                  <div class="text-muted">{{ productModal.description }}</div>
                </div>
                <!-- Warranty -->
                <div class="mb-3" v-if="productModal.warranty">
                  <div class="fw-semibold mb-1">Warranty</div>
                  <div class="text-muted">{{ productModal.warranty }}</div>
                </div>
                <!-- Specifications (JSON) -->
                <div class="mb-3" v-if="hasSpecs(productModal)">
                  <div class="fw-semibold mb-1">Specifications</div>
                  <table class="table table-sm table-borderless specs-table">
                    <tbody>
                      <tr v-for="(pair, idx) in getSpecs(productModal)" :key="idx">
                        <th class="text-muted small">{{ pair[0] }}</th>
                        <td class="small">{{ pair[1] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="d-grid gap-2">
                  <div class="input-group input-group-sm" style="max-width: 240px">
                    <span class="input-group-text">Qty</span>
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="decQty(productModal)"
                      :disabled="cartQty(productModal.id) <= 1"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input
                      class="form-control text-center qty-field"
                      :value="cartQty(productModal.id)"
                      readonly
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="incQty(productModal)"
                      :disabled="
                        productModal.stock != null
                          ? cartQty(productModal.id) >= Number(productModal.stock)
                          : false
                      "
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                  <button
                    class="btn btn-primary"
                    :disabled="(productModal.stock ?? 0) <= 0 || addToCartBusy[productModal.id]"
                    @click="onAddToCartFromModal($event)"
                  >
                    <span
                      v-if="addToCartBusy[productModal.id]"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    Add to cart
                  </button>
                </div>
               
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- END Product Details Modal -->
  </div>
</template>


<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  reactive,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { currentUser } from '@/lib/authState'
import Swal from 'sweetalert2'

/* ========================================================================
   SWEETALERT HELPERS
   ======================================================================== */
async function swInfo(message: string, title = 'Heads up') {
  await Swal.fire({ icon: 'info', title, text: message })
}
async function swError(message: string, title = 'Something went wrong') {
  await Swal.fire({ icon: 'error', title, text: message })
}
async function swSuccess(message: string, title = 'Success') {
  await Swal.fire({ icon: 'success', title, text: message })
}
async function swWarn(message: string, title = 'Please check') {
  await Swal.fire({ icon: 'warning', title, text: message })
}
async function swConfirm(message: string, title = 'Are you sure?', confirmText = 'Yes', cancelText = 'Cancel') {
  const res = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  })
  return res.isConfirmed
}

const routers = useRouter()
const user = computed(() => currentUser.value)
/* ========================================================================
   DISCOUNT TICKET DROPDOWN (ADD-ON) — NON-DESTRUCTIVE
   ======================================================================== */

const showDiscountMenu = ref(false)

// Build a quick lookup for products currently in the cart/pending view
const productByIdFromCart = computed<Record<string, Product>>(() => {
  const map: Record<string, Product> = {}
  for (const it of cartItems.value) map[it.product.id] = it.product
  return map
})

// Reuse your image helpers to get a product thumbnail if product-scoped
function thumbForProductId(pid: string | null): string {
  if (!pid) return ''
  const p = productByIdFromCart.value[pid]
  if (!p) return ''
  const cartLine = cartItems.value.find((i) => i.product.id === pid)
  if (cartLine?.imageUrl) return cartLine.imageUrl
  const raw = firstUrl(p.product_url)
  return raw || ''
}

function discountValueText(d: Discount): string {
  const pct = Number(d.percent_off || 0)
  const amt = Number(d.amount_off || 0)
  if (d.type === 'percent' && pct > 0) {
    const whole = Math.round(pct)
    return Math.abs(pct - whole) < 1e-6 ? `${whole}% OFF` : `${pct.toFixed(2)}% OFF`
  }
  if (d.type === 'fixed_amount' && amt > 0) return `₱ ${number(amt)} OFF`
  if (d.type === 'free_shipping') return 'FREE SHIPPING'
  return 'DISCOUNT'
}

type PickableTicket = {
  id: string
  title: string
  blurb: string
  valueText: string
  scopeText: string
  minSubtotal?: number
  maxCap?: number | null
  productId?: string | null
  productName?: string
  productThumb?: string
}

const pickableDiscounts = computed<PickableTicket[]>(() => {
  return (discounts.value || []).map((d) => {
    const pid = d.product_id || null
    const productName = pid ? (productByIdFromCart.value[pid]?.name || '') : ''
    const productThumb = pid ? thumbForProductId(pid) : ''
    const scopeText = pid ? 'Product Only' : 'All Products'
    const valueText = discountValueText(d)
    const blurb = d.description || ''
    return {
      id: d.id,
      title: d.title,
      blurb,
      valueText,
      scopeText,
      minSubtotal: Number(d.min_subtotal ?? 0) || 0,
      maxCap: d.max_discount_amount == null ? null : Number(d.max_discount_amount),
      productId: pid,
      productName,
      productThumb,
    }
  })
})

const chosenTicket = computed<PickableTicket | null>(() => {
  if (resolvedDiscountByCode.value) {
    const d = resolvedDiscountByCode.value
    const pid = d.product_id || null
    return {
      id: d.id,
      title: d.title,
      blurb: d.description || '',
      valueText: discountValueText(d),
      scopeText: pid ? 'Product Only' : 'All Products',
      minSubtotal: Number(d.min_subtotal ?? 0) || 0,
      maxCap: d.max_discount_amount == null ? null : Number(d.max_discount_amount),
      productId: pid,
      productName: pid ? (productByIdFromCart.value[pid]?.name || '') : '',
      productThumb: pid ? thumbForProductId(pid) : '',
    }
  }
  const id = selectedDiscountId.value
  if (!id) return null
  return pickableDiscounts.value.find((x) => x.id === id) || null
})

function openDiscountMenu() {
  if (discountsLoading.value) return
  showDiscountMenu.value = true
}

function chooseDiscount(id: string | null) {
  // Choosing a ticket clears manual code flow (keeps your existing behavior aligned)
  discountCodeInput.value = ''
  resolvedDiscountByCode.value = null
  selectedDiscountId.value = id || ''
  showDiscountMenu.value = false
}

/* Own outside-click handler (doesn't touch your existing onDocClick) */
function discountDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.discount-picker')) {
    showDiscountMenu.value = false
  }
}

/* Hook our listener without altering yours */
onMounted(() => {
  document.addEventListener('click', discountDocClick, { capture: true })
})
onUnmounted(() => {
  document.removeEventListener('click', discountDocClick, { capture: true })
})

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})

/* ========================================================================
   TYPES
   ======================================================================== */
type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | string | null
  ispublish: boolean
  stock?: number | null
  created_at: string
  specifications?: Record<string, any> | string | null
  warranty?: string | null
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
type InsertedPurchase = { id: string }
type PurchaseRow = {
  id: string
  user_id: string
  product_id: string
  qty: number
  reference_number: string
  shipping_fee: number | null
  status: string
  modeofpayment: 'cod' | 'ewallet' | string
  discounted_price: number | null
  created_at: string
  is_free_shipping?: boolean | null
}
type UsersRow = {
  phone_number: string | null
  address: string | null
  balance: number | null
  membership_id?: string | null
  discount_credits?: number | null
}

/* ========================================================================
   PRODUCTS LIST STATE
   ======================================================================== */
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

/* ========================================================================
   SIGNED URL HELPERS
   ======================================================================== */
const signedUrlMap: Record<string, string> = {}
const signingBusy: Record<string, boolean> = {}
const signedListMap: Record<string, string[]> = reactive({})
const listSigningBusy: Record<string, boolean> = reactive({})

function toArray(u: string[] | string | null): string[] {
  if (!u) return []
  return Array.isArray(u) ? u.filter(Boolean) : [u]
}
function firstUrl(u: string[] | string | null): string {
  const arr = toArray(u)
  return arr[0] ?? ''
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
function productImages(p: Product): string[] {
  const cached = signedListMap[p.id]
  if (cached && cached.length) return cached
  const raws = toArray(p.product_url)
  if (!raws.length) return []
  if (listSigningBusy[p.id]) return []
  listSigningBusy[p.id] = true
  Promise.all(
    raws.map(async (path) => {
      if (!path) return null
      if (!isStoragePath(path)) return path
      const { data, error } = await supabase.storage
        .from('prize_product')
        .createSignedUrl(path, 60 * 60)
      return error ? null : (data?.signedUrl ?? null)
    }),
  )
    .then((urls) => {
      signedListMap[p.id] = urls.filter((u): u is string => !!u)
    })
    .finally(() => {
      listSigningBusy[p.id] = false
    })
  return []
}
function hasMultipleImages(p: Product): boolean {
  const raws = toArray(p.product_url)
  return raws.length > 1
}

/* ========================================================================
   PRODUCT CAROUSEL STATE
   ======================================================================== */
const slideIdx: Record<string, number> = reactive({})
const touchStartX: Record<string, number> = reactive({})

function currentSlide(productId: string): number {
  return slideIdx[productId] ?? 0
}
function goToSlide(productId: string, i: number) {
  slideIdx[productId] = i
}
function nextSlide(productId: string) {
  const imgs = signedListMap[productId] ?? []
  if (!imgs.length) return
  slideIdx[productId] = (currentSlide(productId) + 1) % imgs.length
}
function prevSlide(productId: string) {
  const imgs = signedListMap[productId] ?? []
  if (!imgs.length) return
  slideIdx[productId] = (currentSlide(productId) - 1 + imgs.length) % imgs.length
}
function onTouchStart(e: TouchEvent, productId: string) {
  touchStartX[productId] = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent, productId: string) {
  const start = touchStartX[productId] ?? 0
  const end = e.changedTouches[0]?.clientX ?? 0
  const dx = end - start
  const threshold = 40
  if (dx > threshold) prevSlide(productId)
  else if (dx < -threshold) nextSlide(productId)
}

/* ========================================================================
   NUMBERS / DATES
   ======================================================================== */
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)
const totalPages = computed(() =>
  total.value > 0 ? Math.max(1, Math.ceil(total.value / pageSize.value)) : 1,
)
function isNew(created_at: string) {
  const created = new Date(created_at).getTime()
  const now = Date.now()
  const days = (now - created) / (1000 * 60 * 60 * 24)
  return days <= 7
}
const pendingLoading = ref(false)        // for "Your Pending Orders"
const cartLoading = ref(false)            // for Cart modal items
const discountsLoading = ref(false)       // for discount picker in Request Order modal
const pendingPlaceLoading = ref(false)    // (optional) while building Place Pending view
const productModalLoading = ref(false)  
/* ========================================================================
   AUTH HELPERS
   ======================================================================== */
const userId = ref<string | null>(null)
async function ensureUser() {
  const { data } = await supabase.auth.getUser()
  const id = data?.user?.id || null
  userId.value = id
  return id
}

/* ========================================================================
   MEMBER DISCOUNT (CREDITS)
   ======================================================================== */
const memberDiscountPct = ref<number>(0)
const hasMemberDiscount = computed(() => (memberDiscountPct.value || 0) > 0)
const discountLabel = computed(() => {
  const v = Number(memberDiscountPct.value || 0)
  return v % 1 === 0 ? `${v}%` : `${v.toFixed(2)}%`
})
function discountedPrice(base: number | string): number {
  const price = Number(base || 0)
  const d = Math.min(100, Math.max(0, Number(memberDiscountPct.value || 0)))
  return Number((price * (1 - d / 100)).toFixed(2))
}
function unitDiscountAmount(base: number | string): number {
  const orig = Number(base || 0)
  return Math.max(0, orig - discountedPrice(orig))
}
function canDiscountProduct(p: Product): boolean {
  if (!hasMemberDiscount.value) return false
  const need = unitDiscountAmount(p.price)
  return userDiscountCredits.value >= need && need > 0
}

/* ========================================================================
   CART STATE
   ======================================================================== */
const cartByProduct: Record<string, number> = reactive({})
const dbCartByProduct: Record<string, number> = reactive({})
const STAGED_QTY_KEY = 'shop_pending_qty'

function saveStagedToLocal() {
  try {
    localStorage.setItem(STAGED_QTY_KEY, JSON.stringify(cartByProduct))
  } catch {}
}
function loadStagedFromLocal() {
  try {
    const raw = localStorage.getItem(STAGED_QTY_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, number>
    for (const [k, v] of Object.entries(parsed)) cartByProduct[k] = Math.max(1, Number(v) || 1)
  } catch {}
}

const addToCartBusy: Record<string, boolean> = reactive({})

async function getLatestStock(productId: string): Promise<number> {
  const { data } = await supabase
    .schema('games')
    .from('products')
    .select('stock')
    .eq('id', productId)
    .maybeSingle()
  const stock = data?.stock
  return stock == null ? Infinity : Number(stock)
}
function cartQty(productId: string): number {
  return cartByProduct[productId] ?? 1
}
function setCartQty(productId: string, qty: number) {
  cartByProduct[productId] = Math.max(1, qty)
  saveStagedToLocal()
  nextTick(() => {
    const cards = document.querySelectorAll('.product-card')
    cards.forEach((card) => {
      const field = (card as HTMLElement).querySelector('.qty-field') as HTMLElement | null
      if (field) {
        field.classList.remove('qty-bump')
        void field.offsetWidth
        field.classList.add('qty-bump')
      }
    })
  })
}
async function incQty(p: Product) {
  const current = cartQty(p.id)
  const cap = p.stock != null ? Number(p.stock) : Infinity
  const next = Math.min(current + 1, cap)
  setCartQty(p.id, next)
}
async function decQty(p: Product) {
  const current = cartQty(p.id)
  const next = Math.max(1, current - 1)
  setCartQty(p.id, next)
}
async function loadCart() {
  const uid = await ensureUser()
  for (const k of Object.keys(dbCartByProduct)) delete dbCartByProduct[k]
  if (!uid) return
  const { data, error } = await supabase
    .schema('games')
    .from('cart')
    .select('product_id, qty')
    .eq('user_id', uid)
  if (!error && data) {
    for (const row of data as Pick<CartRow, 'product_id' | 'qty'>[]) {
      dbCartByProduct[row.product_id] = Math.max(0, Number(row.qty || 0))
    }
  }
}

/* ========================================================================
   CART MODAL STATE
   ======================================================================== */
const cartBtnRef = ref<HTMLElement | null>(null)
const router = useRouter()
const cartTotalItems = computed(() =>
  Object.values(dbCartByProduct).reduce((a, b) => a + (Number(b) || 0), 0),
)
const cartTotalItemsRaw = computed(() => (showPendingPlace.value ? 0 : cartTotalItems.value))
const cartTotalItemsDisplay = computed(() => {
  const n = cartTotalItemsRaw.value
  return n > 99 ? '99+' : String(n)
})

const showCart = ref(false)
const showPlace = ref(false)
const showPendingPlace = ref(false)
const inPendingContext = ref(false)
const placingOrder = ref(false)
const cartItems = ref<
  Array<{
    product: Product
    qty: number
    imageUrl: string | null
    lineTotal: number
    unit: number
    originalUnit: number
  }>
>([])
const discountedItemMap: Record<string, boolean> = reactive({})
function isItemDiscounted(productId: string): boolean {
  return !!discountedItemMap[productId]
}

/* ========================================================================
   E-WALLET ATOMIC CHARGE HELPER
   ======================================================================== */
async function chargeEwalletAtomically(
  amountPeso: number,
  batchRef: string,
  uid: string,
): Promise<number> {
  const total = Number(Math.max(0, amountPeso).toFixed(2))
  if (!(total > 0)) return userBalance.value
  const { data, error } = await supabase.schema('ewallet').rpc('apply_tx_pesos', {
    p_user_id: uid,
    p_amount_peso: -total,
    p_kind: 'order.charge',
    p_reference: batchRef,
    p_idempotency: `order:${batchRef}:${uid}`,
  })
  if (error) {
    const msg = String(error.message || '')
    if (/insufficient_funds/i.test(msg)) throw new Error('INSUFFICIENT_FUNDS')
    throw new Error(msg || 'E-Wallet charge failed')
  }
  const row = Array.isArray(data) ? data[0] : (data as any)
  const newBal = Number(row?.new_balance ?? NaN)
  if (!Number.isFinite(newBal)) {
    const { data: u2 } = await supabase.from('users').select('balance').eq('id', uid).maybeSingle()
    return Number(u2?.balance ?? userBalance.value)
  }
  return newBal
}

/* ========================================================================
   PAYMENT & BALANCES
   ======================================================================== */
const paymentMethod = ref<'cod' | 'ewallet'>('cod')
const userBalance = ref<number>(0)
const userDiscountCredits = ref<number>(0)

/* ========================================================================
   DISCOUNT CREDITS (if credits mode) - TALLY
   ======================================================================== */
const totalCreditsNeededIfAll = computed(() => {
  if (!hasMemberDiscount.value) return 0
  let sum = 0
  for (const it of cartItems.value) {
    const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
    const needPerUnit = Math.max(0, Number(it.originalUnit) - discountedPrice(it.originalUnit))
    sum += needPerUnit * qty
  }
  return Number(sum.toFixed(2))
})
const insufficientDiscountCredits = computed(
  () => hasMemberDiscount.value && userDiscountCredits.value < totalCreditsNeededIfAll.value,
)
const totalDiscountCreditsUsed = computed(() => {
  if (!hasMemberDiscount.value) return 0
  let sum = 0
  for (const it of cartItems.value) {
    const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
    const diff = Math.max(0, Number(it.originalUnit) - Number(it.unit))
    sum += diff * qty
  }
  return Number(sum.toFixed(2))
})

/* ========================================================================
   ORDER DISCOUNT STATE
   ======================================================================== */
type DiscountType = 'percent' | 'fixed_amount' | 'free_shipping'
type Discount = {
  id: string
  title: string
  description: string
  code: string | null
  is_public: boolean
  type: DiscountType
  percent_off: number | null
  amount_off: number | null
  min_subtotal: number
  starts_at: string
  expires_at: string | null
  status: string
  max_uses_per_user: number | null
  product_id: string | null
  max_discount_amount: number | null
}
const discountMode = ref<'credits' | 'discount' | 'none'>('credits')
const discounts = ref<Discount[]>([])
const discountCodeInput = ref('')
const selectedDiscountId = ref<string>('')
const resolvingCode = ref(false)
const resolvedDiscountByCode = ref<Discount | null>(null)

/* Load active discounts, but filter out product-specific ones not in cart */
async function loadActiveDiscounts() {
  discountsLoading.value = true
  try {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .schema('rewards')
    .from('discounts')
    .select(
      'id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,min_subtotal,max_uses_per_user,product_id,max_discount_amount',
    )
    .eq('is_public', true)
    .eq('status', 'active')
    .lte('starts_at', nowIso)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('starts_at', { ascending: false })

  if (error) {
    console.warn('loadActiveDiscounts error:', error)
    discounts.value = []
    return
  }

    const cartProductIds = new Set(cartItems.value.map((it) => it.product.id))
    // UPDATED: when in pending context, filter using pending purchase product IDs
  const productIdsForScope = new Set<string>(
    (showPendingPlace.value || inPendingContext.value || pendingPurchases.value.length > 0)
      ? pendingPurchases.value.map(p => p.product_id)
      : cartItems.value.map(it => it.product.id)
  )

  const filtered = (data || []).filter((d: any) => {
    if (!d.product_id) return true
    return productIdsForScope.has(d.product_id)
  })

  discounts.value = filtered as Discount[]


  discounts.value = filtered as Discount[]

   } finally {
    discountsLoading.value = false
  }
}

const pickedDiscount = computed<Discount | null>(() => {
  if (resolvedDiscountByCode.value) return resolvedDiscountByCode.value
  if (selectedDiscountId.value) {
    return discounts.value.find((d) => d.id === selectedDiscountId.value) ?? null
  }
  return null
})

/* === UI helpers for product-scoped discounts (ADDED) === */
// UPDATED: fall back to pendingDiscountProductId when pickedDiscount is not in the list
const scopedDiscountProductId = computed(() => pickedDiscount.value?.product_id ?? pendingDiscountProductId.value ?? null)

const scopedDiscountProductName = computed(() => {
  const pid = scopedDiscountProductId.value
  if (!pid) return ''
  const hit = cartItems.value.find(i => i.product.id === pid)
  return hit?.product.name ?? ''
})

const scopedDiscountSubtotal = computed(() => {
  const pid = scopedDiscountProductId.value
  if (!pid) return 0
  let sum = 0
  for (const it of cartItems.value) {
    if (it.product.id === pid) {
      const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
      sum += Number(it.originalUnit) * qty
    }
  }
  return Number(sum.toFixed(2))
})
const scopedDiscountLabel = computed(() => {
  const name = scopedDiscountProductName.value
  if (!name) return ''
  return `Discount applies only to: ${name} (subtotal ₱ ${number(scopedDiscountSubtotal.value)})`
})

const codeStatusText = computed(() => {
  if (discountMode.value !== 'discount') return ''
  if (resolvingCode.value) return 'Checking code…'
  if (!discountCodeInput.value && !resolvedDiscountByCode.value)
    return 'Enter a valid code or pick a discount.'
  if (discountCodeInput.value && !resolvedDiscountByCode.value)
    return 'Code not found or not active.'
  if (resolvedDiscountByCode.value) return `Code applied: ${resolvedDiscountByCode.value.title}`
  return ''
})
const codeStatusClass = computed(() => {
  if (resolvingCode.value) return 'text-muted'
  if (resolvedDiscountByCode.value) return 'text-success'
  if (discountCodeInput.value && !resolvedDiscountByCode.value) return 'text-danger'
  return 'text-muted'
})

async function applyCode() {
  resolvedDiscountByCode.value = null
  const raw = (discountCodeInput.value || '').trim()
  if (!raw) return
  resolvingCode.value = true
  try {
    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .schema('rewards')
      .from('discounts')
      .select(
        'id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,min_subtotal,max_uses_per_user,product_id,max_discount_amount',
      )
      .eq('status', 'active')
      .eq('is_public', true)
      .lte('starts_at', nowIso)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .ilike('code', raw)
      .limit(1)
      .maybeSingle()
    if (!error && data) {
      const disc = data as Discount
      if (disc.product_id) {
        const has = cartItems.value.some((it) => it.product.id === disc.product_id)
        if (!has) {
          resolvedDiscountByCode.value = null
          return
        }
      }
      resolvedDiscountByCode.value = disc
            // NEW: remember the target product for pending flows too
      pendingDiscountProductId.value = disc.product_id ?? null

      selectedDiscountId.value = ''
    } else {
      resolvedDiscountByCode.value = null
    }
  } finally {
    resolvingCode.value = false
  }
}

/* ========================================================================
   ORDER DISCOUNT COMPUTATION (WITH PRODUCT-SPECIFIC BASE + MAX CAP)
   ======================================================================== */
function computeOrderDiscountAmount(base: number, d: Discount | null): number {
  if (!d) return 0

  let eligibleBase = base

  if (d.product_id) {
    let sum = 0
    for (const it of cartItems.value) {
      if (it.product.id === d.product_id) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        sum += Number(it.originalUnit) * qty
      }
    }
    eligibleBase = Number(sum.toFixed(2))
  }

  if (eligibleBase <= 0) return 0
  if (Number(d.min_subtotal || 0) > 0 && eligibleBase < Number(d.min_subtotal)) return 0

  let amt = 0
  if (d.type === 'percent') {
    const pct = Math.max(0, Math.min(100, Number(d.percent_off || 0)))
    amt = Number((eligibleBase * (pct / 100)).toFixed(2))
  } else if (d.type === 'fixed_amount') {
    const rawAmt = Math.max(0, Number(d.amount_off || 0))
    amt = Number(Math.min(rawAmt, eligibleBase).toFixed(2))
  } else {
    return 0
  }

  if (d.max_discount_amount != null) {
    const cap = Number(d.max_discount_amount || 0)
    if (cap >= 0) {
      amt = Number(Math.min(amt, cap).toFixed(2))
    }
  }

  return amt
}

/* ▶ ADDED: helper to split a total discount amount into per-qty parts that sum exactly */
function splitAmountAcrossQty(total: number, qty: number): number[] {
  if (!(qty > 0) || !(total > 0)) return []
  const per = Math.floor((total / qty) * 100) / 100 // floor to 2dp
  const parts = Array(qty).fill(Number(per.toFixed(2)))
  const used = Number((per * qty).toFixed(2))
  let remainder = Number((total - used).toFixed(2))
  // put remainder (can be up to 0.99) on the last unit
  if (remainder !== 0 && parts.length) {
    parts[parts.length - 1] = Number((parts[parts.length - 1] + remainder).toFixed(2))
  }
  return parts
}

/* If we are re-opening a pending order, we re-use the recorded redeemed_amount */
const recordedOrderDiscountAmount = ref<number | null>(null)
const pendingDiscountProductId = ref<string | null>(null)

const cartGrandTotal = computed(() => cartItems.value.reduce((sum, it) => sum + it.lineTotal, 0))
const cartGrandTotalIgnoringCredits = computed(() => {
  let sum = 0
  for (const it of cartItems.value) {
    const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
    sum += Number(it.originalUnit) * qty
  }
  return Number(sum.toFixed(2))
})
const cartGrandTotalCreditsOff = computed(() =>
  discountMode.value === 'discount' ? cartGrandTotalIgnoringCredits.value : cartGrandTotal.value,
)
const totalDiscountCreditsUsedIfCreditsMode = computed(() =>
  discountMode.value === 'credits' ? totalDiscountCreditsUsed.value : 0,
)

const orderLevelDiscountAmount = computed(() => {
  if (discountMode.value !== 'discount') return 0
  if (showPendingPlace.value && recordedOrderDiscountAmount.value != null) {
    return Number(recordedOrderDiscountAmount.value.toFixed(2))
  }
  const base = cartGrandTotalCreditsOff.value
  const d = pickedDiscount.value
  const amt = computeOrderDiscountAmount(base, d)
  return Number(amt.toFixed(2))
})

const orderDiscountIneligibleReason = computed(() => {
  if (discountMode.value !== 'discount') return ''
  if (showPendingPlace.value && recordedOrderDiscountAmount.value != null) return ''
  const base = cartGrandTotalCreditsOff.value
  const d = pickedDiscount.value
  if (!d) return 'Pick a discount or apply a valid code.'
  let eligibleBase = base
  if (d.product_id) {
    let sum = 0
    for (const it of cartItems.value) {
      if (it.product.id === d.product_id) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        sum += Number(it.originalUnit) * qty
      }
    }
    eligibleBase = Number(sum.toFixed(2))
  }
  if (Number(d.min_subtotal || 0) > 0 && eligibleBase < Number(d.min_subtotal)) {
    return `Minimum subtotal ₱ ${number(d.min_subtotal)} is required.`
  }
  if (d.type === 'percent' && !(Number(d.percent_off) > 0)) return 'Percent is zero.'
  if (d.type === 'fixed_amount' && !(Number(d.amount_off) > 0)) return 'Amount is zero.'
  return ''
})

const cartTotalAfterOrderDiscount = computed(() => {
  if (discountMode.value !== 'discount') return cartGrandTotal.value
  const base = cartGrandTotalCreditsOff.value
  const less = orderLevelDiscountAmount.value
  return Number(Math.max(0, base - less).toFixed(2))
})

const finalPayableTotal = computed(() => {
  if (discountMode.value === 'discount') return cartTotalAfterOrderDiscount.value
  return cartGrandTotal.value
})

const enoughBalanceForItems = computed(() => userBalance.value >= finalPayableTotal.value)

/* ========================================================================
   SHIPPING / DELIVERY STATE
   ======================================================================== */
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

/* Handy string to show the full address inside your Edit modal if you want */
const displayAddressForEdit = computed(() => {
  return buildAddressString(shipping.value)
})

/* ========================================================================
   PH ADDRESS LOOKUP (PSGC) FOR DELIVERY MODAL
   (region / city / barangay with search dropdowns)
   ======================================================================== */
type Region = { code: string; name: string }
type Province = { code: string; name: string; regionCode: string }
type LGU = { code: string; name: string; isCity: boolean; provinceCode: string }
type Barangay = { code: string; name: string }

/* ⚙️ NEW: Toggle to control external address lookups (disabled for editing) */
const addressLookupEnabled = ref(false) // keep external source OFF when editing

const regions = ref<Region[]>([])
const provinces = ref<Province[]>([])
const lguAll = ref<LGU[]>([])
const lguScoped = ref<LGU[]>([])
const barangays = ref<Barangay[]>([])

const regionNameByCode: Record<string, string> = {}
const provinceByCode: Record<string, Province> = {}

/* typed address fields (connected to shipping modal) */
const addrRegion = ref('') // to map -> shipping.value.province
const addrCity = ref('') // -> shipping.value.city
const addrBarangay = ref('') // -> shipping.value.barangay
const addrZip = ref('') // -> shipping.value.postal_code
const addrLine1 = ref('') // -> shipping.value.address_line1

/* 🔧 addressDirty: track changes made in edit modal */
const addressDirty = ref(false) // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

/* typeahead visibility */
const showRegionSuggest = ref(false)
const showCitySuggest = ref(false)
const showBarangaySuggest = ref(false)

/* doc click to close dropdowns */
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.position-relative')) {
    showRegionSuggest.value = false
    showCitySuggest.value = false
    showBarangaySuggest.value = false
  }
}

/* fetch helper */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json() as Promise<T>
}

async function loadRegionsPSGC() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/regions')
  regions.value = data
    .map((r) => ({ code: r.code, name: r.regionName || r.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
  regions.value.forEach((r) => (regionNameByCode[r.code] = r.name))
}

async function loadProvincesPSGC() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/provinces')
  provinces.value = data
    .map((p) => ({
      code: p.code,
      name: p.name,
      regionCode: p.region_code || p.regionCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  provinces.value.forEach((p) => (provinceByCode[p.code] = p))
}

async function loadAllLGUsPSGC() {
  const [cities, municipalities] = await Promise.all([
    fetchJSON<any[]>('https://psgc.cloud/api/cities'),
    fetchJSON<any[]>('https://psgc.cloud/api/municipalities'),
  ])
  const cityList: LGU[] = cities.map((c) => ({
    code: c.code,
    name: c.name,
    isCity: true,
    provinceCode: c.province_code || c.provinceCode || '',
  }))
  const muniList: LGU[] = municipalities.map((m) => ({
    code: m.code,
    name: m.name,
    isCity: false,
    provinceCode: m.province_code || m.provinceCode || '',
  }))
  lguAll.value = [...cityList, ...muniList].sort((a, b) => a.name.localeCompare(b.name))
}

async function loadBarangaysForLGU(lguCode: string, isCity: boolean) {
  barangays.value = []
  if (!lguCode) return
  const url = isCity
    ? `https://psgc.cloud/api/barangays?city_code=${encodeURIComponent(lguCode)}`
    : `https://psgc.cloud/api/barangays?municipality_code=${encodeURIComponent(lguCode)}`
  const data = await fetchJSON<any[]>(url)
  barangays.value = data.map((b) => ({ code: b.code, name: b.name }))
  barangays.value.sort((a, b) => a.name.localeCompare(b.name))
}

/* computed options */
const filteredRegions = computed(() => {
  if (!addressLookupEnabled.value) return [] // 🔒 disabled during edit
  const q = addrRegion.value.trim().toLowerCase()
  if (!q) return regions.value.slice(0, 10)
  const starts = regions.value.filter((r) => r.name.toLowerCase().startsWith(q))
  const contains = regions.value.filter(
    (r) => !r.name.toLowerCase().startsWith(q) && r.name.toLowerCase().includes(q),
  )
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})
const filteredLGUs = computed(() => {
  if (!addressLookupEnabled.value) return [] // 🔒 disabled during edit
  const pool = lguScoped.value.length ? lguScoped.value : lguAll.value
  const q = addrCity.value.trim().toLowerCase()
  if (!q) return pool.slice(0, 10)
  const starts = pool.filter((l) => l.name.toLowerCase().startsWith(q))
  const contains = pool.filter(
    (l) => !l.name.toLowerCase().startsWith(q) && l.name.toLowerCase().includes(q),
  )
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})
const filteredBarangays = computed(() => {
  if (!addressLookupEnabled.value) return [] // 🔒 disabled during edit
  const q = addrBarangay.value.trim().toLowerCase()
  if (!q) return barangays.value.slice(0, 10)
  const starts = barangays.value.filter((b) => b.name.toLowerCase().startsWith(q))
  const contains = barangays.value.filter(
    (b) => !b.name.toLowerCase().startsWith(q) && b.name.toLowerCase().includes(q),
  )
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

/* input handlers - to be used in template */
const onRegionInput = () => {
  if (!addressLookupEnabled.value) return // 🔒 no external suggest
  showRegionSuggest.value = true
}
const onCityInput = () => {
  if (!addressLookupEnabled.value) return // 🔒 no external suggest
  showCitySuggest.value = true
}
const onBarangayInput = () => {
  if (!addressLookupEnabled.value) return // 🔒 no external suggest
  showBarangaySuggest.value = true
}

/* watchers for chain Region -> City -> Brgy */
watch(addrRegion, (val) => {
  if (!addressLookupEnabled.value) {
    // When disabled, we don't compute scoped LGUs and don't hit external APIs
    lguScoped.value = []
    addrCity.value = ''
    addrBarangay.value = ''
    barangays.value = []
    return
  }
  const picked = regions.value.find((r) => r.name.toLowerCase() === val.trim().toLowerCase())
  if (picked) {
    const provinceCodesInRegion = new Set(
      provinces.value.filter((p) => p.regionCode === picked.code).map((p) => p.code),
    )
    lguScoped.value = lguAll.value.filter((l) => provinceCodesInRegion.has(l.provinceCode))
  } else {
    lguScoped.value = []
  }
  addrCity.value = ''
  addrBarangay.value = ''
  barangays.value = []
})

watch(addrCity, async (val) => {
  if (!addressLookupEnabled.value) {
    barangays.value = [] // 🔒 don't fetch
    return
  }
  const pool = lguScoped.value.length ? lguScoped.value : lguAll.value
  const l = pool.find((x) => x.name.toLowerCase() === val.trim().toLowerCase())
  if (l) {
    const p = provinceByCode[l.provinceCode]
    if (p && regionNameByCode[p.regionCode]) {
      addrRegion.value = regionNameByCode[p.regionCode]
    }
    await loadBarangaysForLGU(l.code, l.isCity)
    addrBarangay.value = ''
  } else {
    barangays.value = []
  }
})

/* 🔧 addressDirty: mark dirty whenever user edits any address input */
watch([addrLine1, addrBarangay, addrCity, addrRegion, addrZip], () => {
  addressDirty.value = true
})

/* pick handlers */
function pickRegion(r: Region) {
  addrRegion.value = r.name
  showRegionSuggest.value = false
}
async function pickLGU(l: LGU) {
  addrCity.value = l.name
  showCitySuggest.value = false
  const p = provinceByCode[l.provinceCode]
  if (p && regionNameByCode[p.regionCode]) {
    addrRegion.value = regionNameByCode[p.regionCode]
  }
  await loadBarangaysForLGU(l.code, l.isCity)
  addrBarangay.value = ''
}
function pickBarangay(b: Barangay) {
  addrBarangay.value = b.name
  showBarangaySuggest.value = false
}

/* helper to sync shipping -> PSGC form when editing */
function syncShippingToAddressFields() {
  addrLine1.value = shipping.value.address_line1 || ''
  addrBarangay.value = shipping.value.barangay || ''
  addrCity.value = shipping.value.city || ''
  addrRegion.value = shipping.value.province || '' // we store region/province in same field
  addrZip.value = shipping.value.postal_code || ''
  addressDirty.value = false // 🔧 reset dirty after sync
}

/* helper to sync PSGC form -> shipping (kept, but NOT called blindly on save) */
function syncAddressFieldsToShipping() {
  shipping.value.address_line1 = addrLine1.value || ''
  shipping.value.barangay = addrBarangay.value || ''
  shipping.value.city = addrCity.value || ''
  shipping.value.province = addrRegion.value || ''
  shipping.value.postal_code = addrZip.value || ''
}

/* Optional toggles if you ever want to re-enable the lookup elsewhere */
async function enablePSGCLookup() {
  if (!addressLookupEnabled.value) {
    addressLookupEnabled.value = true
    if (!regions.value.length || !provinces.value.length || !lguAll.value.length) {
      await Promise.all([loadRegionsPSGC(), loadProvincesPSGC(), loadAllLGUsPSGC()])
    }
  }
}
function disablePSGCLookup() {
  addressLookupEnabled.value = false
  showRegionSuggest.value = false
  showCitySuggest.value = false
  showBarangaySuggest.value = false
}

/* ========================================================================
   LOAD SHIPPING (FROM DB) + MEMBERSHIP DISCOUNT
   ======================================================================== */
function buildAddressString(s: ShippingRow): string {
  return [s.address_line1, s.barangay, s.city, s.province, s.postal_code]
    .filter(Boolean)
    .join(', ')
}
function parseAddressToParts(addr: string | null): Partial<ShippingRow> {
  if (!addr) return {}
  const rawParts = addr
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  const out: Partial<ShippingRow> = {}
  if (rawParts.length === 0) return out
  let parts = [...rawParts]
  const last = parts[parts.length - 1] || ''
  const zipMatch = last.match(/^\d{4}$/)
  if (zipMatch) {
    out.postal_code = zipMatch[0]
    parts.pop()
  }
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

async function loadShipping() {
  const uid = await ensureUser()
  if (!uid) {
    shippingLoaded.value = true
    return
  }
  const { data: userRow } = await supabase
    .from('users')
    .select('phone_number, address, balance, membership_id, discount_credits')
    .eq('id', uid)
    .maybeSingle()
  const u = (userRow ?? null) as UsersRow | null
  shipping.value.user_id = uid
  shipping.value.phone = u?.phone_number || ''
  userBalance.value = Number(u?.balance ?? 0)
  userDiscountCredits.value = Number(u?.discount_credits ?? 0)

  memberDiscountPct.value = 0
  const tierId = u?.membership_id
  if (tierId) {
    const { data: tierRow } = await supabase
      .schema('membership')
      .from('tiers')
      .select('discount_per_purchase')
      .eq('id', tierId)
      .maybeSingle()
    if (tierRow && typeof tierRow.discount_per_purchase !== 'undefined') {
      memberDiscountPct.value = Number(tierRow.discount_per_purchase || 0)
    }
  }

  const parsed = parseAddressToParts(u?.address ?? null)
  shipping.value.address_line1 = parsed.address_line1 || shipping.value.address_line1
  shipping.value.barangay = parsed.barangay || shipping.value.barangay
  shipping.value.city = parsed.city || shipping.value.city
  shipping.value.province = parsed.province || shipping.value.province
  shipping.value.postal_code = parsed.postal_code || shipping.value.postal_code

  // also sync to typeahead fields so modal shows current data
  syncShippingToAddressFields()

  shippingLoaded.value = true
  if (showCart.value || showPlace.value) await loadCartDetails()
}

function openShippingModal() {
  // ensure current shipping is reflected in PSGC fields
  syncShippingToAddressFields()
  // 🔒 Keep external lookup disabled while editing
  disablePSGCLookup()
  addressDirty.value = false // 🔧 reset on open
  showShipping.value = true
}
function closeShippingModal() {
  showShipping.value = false
}

/* === FIX: SAFE SAVE that never wipes existing address with blanks === */
function coalesceNonEmpty(current: string, incoming: string) {
  const v = (incoming ?? '').trim()
  return v.length ? v : (current ?? '')
}

async function saveShipping() {
  const uid = await ensureUser()
  if (!uid) {
    await swInfo('Please log in to save your delivery details.')
    return
  }

  // ⛑️ Instead of blindly copying possibly-empty typeahead values into shipping,
  //     safely merge: only take addr* when they are non-empty; otherwise keep existing.
  const merged: ShippingRow = {
    ...shipping.value,
    address_line1: coalesceNonEmpty(shipping.value.address_line1, addrLine1.value),
    barangay: coalesceNonEmpty(shipping.value.barangay, addrBarangay.value),
    city: coalesceNonEmpty(shipping.value.city, addrCity.value),
    province: coalesceNonEmpty(shipping.value.province, addrRegion.value),
    postal_code: coalesceNonEmpty(shipping.value.postal_code, addrZip.value),
    phone: coalesceNonEmpty(shipping.value.phone, shipping.value.phone), // phone edited elsewhere
    user_id: shipping.value.user_id,
    updated_at: new Date().toISOString(),
  }

  // If nothing changed and user didn't touch the form, skip DB write
  const before = buildAddressString(shipping.value)
  const after = buildAddressString(merged)
  const samePhone = (shipping.value.phone || '') === (merged.phone || '')

  // 🔧 Only skip if also NOT dirty (prevents false negatives where addr* changed but string looks same)
  if (!addressDirty.value && before === after && samePhone) {
    // keep local form fields in sync with the final persisted data
    syncShippingToAddressFields()
    return
  }

  savingShipping.value = true
  try {
    const payload = {
      phone_number: merged.phone || null,
      address: after || null,
    }
    const { error } = await supabase.from('users').update(payload).eq('id', uid)
    if (error) {
      console.error('saveShipping error', error.message)
      await swError(error.message)
      return
    }
    // reflect merged values locally and sync form fields
    shipping.value = merged
    syncShippingToAddressFields()
    addressDirty.value = false // 🔧 reset after successful save
  } finally {
    savingShipping.value = false
  }
}

/* ========================================================================
   DISABLE ORDER BUTTON IF NEEDED
   ======================================================================== */
const enoughBalanceForOrder = computed(
  () =>
    userBalance.value >=
    finalPayableTotal.value + (pendingHasFreeShipping.value ? 0 : pendingHighestShippingFee.value),
)
const disableRequestOrder = computed(() => {
  return placingOrder.value || (paymentMethod.value === 'ewallet' && !enoughBalanceForItems.value)
})

/* ========================================================================
   CART DETAILS LOADING
   ======================================================================== */
async function openCartModal() {
  await loadCartDetails()
  showCart.value = true
}
function closeCartModal() {
  showCart.value = false
}

async function assertPerUserEligible(
  usedDiscountId: string,
  uid: string,
): Promise<{
  ok: boolean
  used: number
  max: number | null
  message?: string
}> {
  const d =
    discounts.value.find((x) => x.id === usedDiscountId) ??
    (resolvedDiscountByCode.value && resolvedDiscountByCode.value.id === usedDiscountId
      ? resolvedDiscountByCode.value
      : null)
  const max = d?.max_uses_per_user != null ? Number(d.max_uses_per_user) : null
  if (max == null) {
    return { ok: true, used: 0, max: null }
  }
  const { count, error } = await supabase
    .schema('rewards')
    .from('discount_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
    .eq('discount_id', usedDiscountId)
  if (error) {
    console.warn('[assertPerUserEligible] count failed:', error.message)
    return {
      ok: false,
      used: 0,
      max,
      message: 'We could not verify your discount usage right now. Please try again.',
    }
  }
  const used = Number(count ?? 0)
  if (used >= max) {
    return {
      ok: false,
      used,
      max,
      message: `You’ve already used this discount the maximum of ${max} time(s).`,
    }
  }
  return { ok: true, used, max }
}

async function loadCartDetails() {
  cartLoading.value = true
  try {
  const uid = await ensureUser()
  cartItems.value = []
  if (!uid) return
  const { data: rows, error: cartErr } = await supabase
    .schema('games')
    .from('cart')
    .select('product_id, qty')
    .eq('user_id', uid)
  if (cartErr || !rows) return
  const ids = (rows as Array<{ product_id: string; qty: number }>).map((r) => r.product_id)
  if (ids.length === 0) return
  const { data: prodRows, error: prodErr } = await supabase
    .schema('games')
    .from('products')
    .select(
      'id,name,description,price,product_url,ispublish,stock,created_at,specifications,warranty',
    )
    .in('id', ids)
  if (prodErr || !prodRows) return
  const map = new Map<string, Product>()
  for (const p of prodRows as Product[]) map.set(p.id, p)
  const list: Array<{
    product: Product
    qty: number
    imageUrl: string | null
    lineTotal: number
    unit: number
    originalUnit: number
  }> = []
  let remainingCredits =
    discountMode.value === 'credits' && hasMemberDiscount.value
      ? Number(userDiscountCredits.value || 0)
      : 0
  for (const row of rows as Array<{ product_id: string; qty: number }>) {
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
    const originalUnit = Number(p.price || 0)
    const discountedUnitMember = hasMemberDiscount.value
      ? discountedPrice(originalUnit)
      : originalUnit
    const needPerUnit = Math.max(0, originalUnit - discountedUnitMember)
    const needForItem = needPerUnit * qty
    let unitToUse = originalUnit
    let lineTotal = originalUnit * qty
    if (
      discountMode.value === 'credits' &&
      hasMemberDiscount.value &&
      needPerUnit > 0 &&
      remainingCredits >= needForItem
    ) {
      unitToUse = discountedUnitMember
      lineTotal = discountedUnitMember * qty
      remainingCredits = Number((remainingCredits - needForItem).toFixed(2))
      discountedItemMap[p.id] = true
    } else {
      discountedItemMap[p.id] = false
    }
    list.push({ product: p, qty, imageUrl: img, lineTotal, unit: unitToUse, originalUnit })
    dbCartByProduct[p.id] = qty
  }
  cartItems.value = list
  } finally {
    cartLoading.value = false
  }
}

/* ========================================================================
   CART ANIMATIONS
   ======================================================================== */
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
  ghost.style.transition =
    'transform .6s cubic-bezier(.22,.61,.36,1), opacity .6s ease, width .6s ease, height .6s ease'
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

function popCartAddBadge(n: number) {
  const cartEl = cartBtnRef.value
  if (!cartEl || n <= 0) return
  const badge = document.createElement('div')
  badge.className = 'cart-added-badge'
  badge.textContent = `+${n}`
  const rect = cartEl.getBoundingClientRect()
  badge.style.position = 'fixed'
  badge.style.left = rect.left + rect.width - 10 + 'px'
  badge.style.top = rect.top - 8 + 'px'
  document.body.appendChild(badge)
  requestAnimationFrame(() => {
    badge.classList.add('cart-added-badge--show')
  })
  setTimeout(() => badge.remove(), 900)
}

/* ========================================================================
   CART OPERATIONS
   ======================================================================== */
async function onAddToCart(ev: MouseEvent, p: Product) {
  const uid = await ensureUser()
  if (!uid) {
    await swInfo('Please log in to add items to your cart.')
    return
  }
  const latestStock = await getLatestStock(p.id)
  const stockCap = p.stock != null ? Math.min(Number(p.stock), latestStock) : latestStock
  const addQty = Math.max(1, Math.min(cartQty(p.id), stockCap))
  if (addQty <= 0) return
  addToCartBusy[p.id] = true
  try {
    const { data: existing, error: selErr } = await supabase
      .schema('games')
      .from('cart')
      .select('qty')
      .eq('user_id', uid)
      .eq('product_id', p.id)
      .maybeSingle()
    const currentInCart = !selErr && existing?.qty != null ? Number(existing.qty) : 0
    const target = currentInCart + addQty
    if (target > stockCap && stockCap !== Infinity) {
      const allowedToAdd = Math.max(0, stockCap - currentInCart)
      if (allowedToAdd <= 0) {
        await swWarn(`Stock limit reached. Only ${stockCap} item(s) available in total.`)
        return
      }
      await swWarn(`Only ${allowedToAdd} more can be added (stock: ${stockCap}).`)
      const { error: upErr } = await supabase
        .schema('games')
        .from('cart')
        .upsert({ user_id: uid, product_id: p.id, qty: stockCap }, { onConflict: 'user_id,product_id' })
      if (!upErr) {
        dbCartByProduct[p.id] = stockCap
        cartByProduct[p.id] = 1
        saveStagedToLocal()
      }
      return
    }
    const { error } = await supabase
      .schema('games')
      .from('cart')
      .upsert({ user_id: uid, product_id: p.id, qty: target }, { onConflict: 'user_id,product_id' })
    if (error) {
      console.error('addToCart error', error.message)
      await swError(error.message)
      return
    }
    dbCartByProduct[p.id] = target
    const btnEl = ev.currentTarget as HTMLElement | null
    const card = btnEl?.closest('.product-card') as HTMLElement | null
    const thumb = card?.querySelector('.product-thumb') as HTMLElement | null
    flyToCart(thumb || card || null)
    popCartAddBadge(addQty)
    if (card) {
      card.classList.add('added-burst')
      setTimeout(() => card.classList.remove('added-burst'), 450)
    }
    if (btnEl) {
      btnEl.classList.add('btn-added')
      setTimeout(() => btnEl.classList.remove('btn-added'), 350)
    }
    cartByProduct[p.id] = 1
    saveStagedToLocal()
  } finally {
    addToCartBusy[p.id] = false
  }
}

async function updateCartQty(productId: string, newQty: number, product?: Product) {
  const uid = await ensureUser()
  if (!uid) return
  const qty = Math.max(0, Math.floor(newQty || 0))
  if (qty === 0) {
    const { error } = await supabase
      .schema('games')
      .from('cart')
      .delete()
      .eq('user_id', uid)
      .eq('product_id', productId)
    if (error) {
      await swError(error.message)
      return
    }
    delete dbCartByProduct[productId]
  } else {
    let capped = qty
    if (product) {
      const latestStock = await getLatestStock(product.id)
      const stockCap =
        product.stock != null ? Math.min(Number(product.stock), latestStock) : latestStock
      capped = Math.min(qty, stockCap)
    }
    const { error } = await supabase
      .schema('games')
      .from('cart')
      .upsert({ user_id: uid, product_id: productId, qty: capped }, { onConflict: 'user_id,product_id' })
    if (error) {
      await swError(error.message)
      return
    }
    dbCartByProduct[productId] = capped
  }
  await loadCartDetails()
}
async function decrementCartProduct(productId: string) {
  const current = dbCartByProduct[productId] ?? 0
  await updateCartQty(productId, current - 1)
}
async function incrementCartProduct(productId: string, product: Product) {
  const current = dbCartByProduct[productId] ?? 0
  await updateCartQty(productId, current + 1, product)
}

/* Delete / clear cart */
async function removeCartProduct(productId: string) {
  const uid = await ensureUser()
  if (!uid) return
  const { error } = await supabase
    .schema('games')
    .from('cart')
    .delete()
    .eq('user_id', uid)
    .eq('product_id', productId)
  if (error) {
    await swError(error.message)
    return
  }
  delete dbCartByProduct[productId]
  await loadCartDetails()
}
async function clearCart() {
  const uid = await ensureUser()
  if (!uid) return
  const confirmed = await swConfirm('Clear all items from your cart?')
  if (!confirmed) return
  clearingCart.value = true
  try {
    const { error } = await supabase.schema('games').from('cart').delete().eq('user_id', uid)
    if (error) {
      await swError(error.message)
      return
    }
    for (const k of Object.keys(dbCartByProduct)) delete dbCartByProduct[k]
    cartItems.value = []
  } finally {
    clearingCart.value = false
  }
}
const checkingOut = ref(false)
const clearingCart = ref(false)

/* ========================================================================
   PLACE ORDER (PENDING CREATION)
   ======================================================================== */
function genReference(prefix = 'REF'): string {
  const ts = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14)
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${ts}-${rnd}`
}
function openPlaceOrder() {
  closeCartModal()
  loadActiveDiscounts()
  showPlace.value = true
}
function closePlaceOrder() {
  showPlace.value = false
}

async function placeOrder() {
  const uid = await ensureUser()
  if (!uid) {
    await swInfo('Please log in to request the order.')
    return
  }
  if (cartItems.value.length === 0) {
    await swInfo('Your cart is empty.')
    return
  }
  if (!hasShipping.value) {
    await swWarn('Please complete your delivery details first.')
    return
  }
  if (paymentMethod.value === 'ewallet' && !enoughBalanceForItems.value) {
    await swWarn('Insufficient wallet balance.')
    return
  }

  let usedDiscountId: string | null = null
  let orderDiscountAmtAtRequest = 0
  if (discountMode.value === 'discount') {
    const disc = pickedDiscount.value
    if (!disc) {
      await swWarn('Please apply a valid discount code or select a discount.')
      return
    }
    usedDiscountId = disc.id
    const { ok, message } = await assertPerUserEligible(usedDiscountId, uid)
    if (!ok) {
      await swWarn(message || 'You have reached the maximum number of uses for this discount.')
      return
    }
    const base = cartGrandTotalCreditsOff.value
    orderDiscountAmtAtRequest = computeOrderDiscountAmount(base, disc)
    if (orderDiscountAmtAtRequest <= 0) {
      await swWarn('This discount doesn’t apply to your current subtotal.')
      return
    }
  }

  placingOrder.value = true
  const insertedIds: string[] = []
  try {
    // ⛑️ Safe save (will not wipe fields)
    await saveShipping()

    const { data: freshUser } = await supabase
      .from('users')
      .select('balance, discount_credits, membership_id')
      .eq('id', uid)
      .maybeSingle()
    userBalance.value = Number(freshUser?.balance ?? 0)
    userDiscountCredits.value = Number(freshUser?.discount_credits ?? 0)
    await loadCartDetails()

    const batchReference = genReference('REQ')

    type RequestLine = {
      p: Product
      quantity: number
      unitOriginal: number
      unitFinal: number
    }
    let remainingCreditsAtRequest =
      discountMode.value === 'credits' && hasMemberDiscount.value
        ? Number(userDiscountCredits.value || 0)
        : 0
    const lines: RequestLine[] = []
    for (const it of cartItems.value) {
      const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
      const unitOriginal = Number(it.originalUnit || 0)
      let unitFinal = unitOriginal
      if (discountMode.value === 'credits' && hasMemberDiscount.value) {
        const memberUnit = discountedPrice(unitOriginal)
        const needPerUnit = Math.max(0, unitOriginal - memberUnit)
        const needForItem = Number((needPerUnit * qty).toFixed(2))
        if (needPerUnit > 0 && remainingCreditsAtRequest >= needForItem) {
          unitFinal = memberUnit
          remainingCreditsAtRequest = Number((remainingCreditsAtRequest - needForItem).toFixed(2))
        }
      }
      lines.push({ p: it.product, quantity: qty, unitOriginal, unitFinal })
    }

    let firstPurchaseId: string | null = null

    // ▶ ADDED: capture purchaseId per product for precise redemptions
    const purchaseByProductId = new Map<string, { purchaseId: string; qty: number }>()

    for (const ln of lines) {
      const { data: inserted, error: insErr } = await supabase
        .schema('games')
        .from('purchases')
        .insert([
          {
            user_id: uid,
            product_id: ln.p.id,
            reference_number: batchReference,
            qty: ln.quantity,
            modeofpayment: paymentMethod.value,
            status: 'pending',
            discounted_price: Number(ln.unitFinal.toFixed(2)),
            shipping_fee: 0,
          } as any,
        ])
        .select('id')
        .single()
      if (insErr) {
        console.error('[requestOrder] purchases insert error:', insErr.message)
        await swError('Failed to request order: ' + insErr.message)
        return
      }
      const purchaseId = (inserted as InsertedPurchase).id
      insertedIds.push(purchaseId)
      if (!firstPurchaseId) firstPurchaseId = purchaseId

      // ▶ ADDED: remember this purchase for the product
      purchaseByProductId.set(ln.p.id, { purchaseId, qty: ln.quantity })
    }

    // === DISCOUNT REDEMPTION RECORDING (REQUEST TIME) ====================
    if (discountMode.value === 'discount' && usedDiscountId && firstPurchaseId) {
      const d = pickedDiscount.value!
      if (d.product_id) {
        // ▶ ADDED: product-specific discount -> apply ONLY to that product
        const target = purchaseByProductId.get(d.product_id)
        if (!target) {
          console.warn('[discount] product_id not found in request lines; skipping redemptions')
        } else {
          const { purchaseId, qty } = target
          const parts = splitAmountAcrossQty(orderDiscountAmtAtRequest, qty)
          console.log('[discount] product-scoped split', { qty, total: orderDiscountAmtAtRequest, parts })

          const rows = parts.map((amt) => ({
            discount_id: usedDiscountId!,
            user_id: uid,
            purchase_id: purchaseId,
            redeemed_amount: Number(amt.toFixed(2)),
            currency: 'PHP',
          }))
          const { error: redInsErr } = await supabase
            .schema('rewards')
            .from('discount_redemptions')
            .insert(rows as any)
          if (redInsErr) {
            console.error('[discount_redemptions insert failed at request time]', redInsErr.message)
            // rollback purchases just like original logic
            await supabase.schema('games').from('purchases').delete().in('id', insertedIds)
            await swError('Failed to apply discount to your request: ' + redInsErr.message)
            return
          }

          // keep redemptions_count in sync (loop RPC, then fix remainder if needed)
          let rpcOk = 0
          for (let i = 0; i < parts.length; i++) {
            const { data: ok, error: redErr } = await supabase.rpc('inc_discount_redemption', {
              p_discount_id: usedDiscountId,
            })
            if (!redErr && ok !== null) rpcOk++
          }
          const delta = parts.length - rpcOk
          if (delta > 0) {
            const { data: dRow, error: selErr } = await supabase
              .schema('rewards')
              .from('discounts')
              .select('id, redemptions_count')
              .eq('id', usedDiscountId)
              .maybeSingle()
            if (!selErr && dRow?.id) {
              const nextCount = Number(dRow.redemptions_count ?? 0) + delta
              await supabase
                .schema('rewards')
                .from('discounts')
                .update({ redemptions_count: nextCount })
                .eq('id', usedDiscountId)
            }
          }
        }
      } else {
        // (Global) original single-record behavior
        const { error: redInsErr } = await supabase
          .schema('rewards')
          .from('discount_redemptions')
          .insert([
            {
              discount_id: usedDiscountId,
              user_id: uid,
              purchase_id: firstPurchaseId,
              redeemed_amount: Number(orderDiscountAmtAtRequest.toFixed(2)),
              currency: 'PHP',
            },
          ])
        if (redInsErr) {
          console.error('[discount_redemptions insert failed at request time]', redInsErr.message)
          await supabase.schema('games').from('purchases').delete().in('id', insertedIds)
          await swError('Failed to apply discount to your request: ' + redInsErr.message)
          return
        }
        const { data: ok, error: redErr } = await supabase.rpc('inc_discount_redemption', {
          p_discount_id: usedDiscountId,
        })
        if (redErr || ok === null) {
          const { data: dRow, error: selErr } = await supabase
            .schema('rewards')
            .from('discounts')
            .select('id, redemptions_count')
            .eq('id', usedDiscountId)
            .maybeSingle()
          if (!selErr && dRow?.id) {
            const nextCount = Number(dRow.redemptions_count ?? 0) + 1
            await supabase
              .schema('rewards')
              .from('discounts')
              .update({ redemptions_count: nextCount })
              .eq('id', usedDiscountId)
          }
        }
      }
    }
    // =====================================================================

    await supabase.schema('games').from('cart').delete().eq('user_id', uid)
    for (const k of Object.keys(dbCartByProduct)) delete dbCartByProduct[k]
    cartItems.value = []
    closePlaceOrder()
    await fetchProducts()
    await loadPendingOrders()
    await swSuccess(
      'Order requested! Status is now pending. Once admin sets the shipping fee, you can place the order.',
    )
  } finally {
    placingOrder.value = false
  }
}

/* ========================================================================
   PENDING ORDERS
   ======================================================================== */
const pendingHasFreeShipping = ref(false)
const pendingGroups = ref<
  Array<{
    ref: string
    created_at: string
    itemsCount: number
    totalQty: number
    highestShippingFee: number
    itemsTotal: number
    sampleName: string
    sampleImageUrl: string | null
    displayTotal?: number
  }>
>([])
const pendingRefNumber = ref<string | null>(null)
const pendingHighestShippingFee = ref<number>(0)
const pendingPurchases = ref<PurchaseRow[]>([])

async function getAnyPurchaseIdForRef(ref: string, uid: string): Promise<string | null> {
  const { data, error } = await supabase
    .schema('games')
    .from('purchases')
    .select('id')
    .eq('user_id', uid)
    .eq('reference_number', ref)
    .limit(1)
    .maybeSingle()
  if (error) return null
  return (data as { id: string } | null)?.id ?? null
}
async function resolveFirstImageUrl(prod: {
  id: string
  product_url: string[] | string | null
}): Promise<string | null> {
  const raw = firstUrl(prod.product_url)
  if (!raw) return null
  if (!isStoragePath(raw)) return raw
  try {
    const { data } = await supabase.storage.from('prize_product').createSignedUrl(raw, 3600)
    return data?.signedUrl ?? null
  } catch {
    return null
  }
}

async function loadPendingOrders() {
  pendingLoading.value = true
  try {
  const uid = await ensureUser()
  if (!uid) return
  const { data, error } = await supabase
    .schema('games')
    .from('purchases')
    .select(
      'id, product_id, qty, reference_number, created_at, shipping_fee, status, discounted_price, is_free_shipping',
    )
    .eq('user_id', uid)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('[loadPendingOrders] error:', error.message)
    pendingGroups.value = []
    return
  }
  const rows = (data || []) as PurchaseRow[]
  const rowsByRef = new Map<string, PurchaseRow[]>()
  const purchaseIdToRef = new Map<string, string>()
  const aggregate = new Map<
    string,
    {
      created_at: string
      itemsCount: number
      totalQty: number
      highestShippingFee: number
      itemsTotal: number
      firstProductId?: string
    }
  >()
  for (const r of rows) {
    const g = aggregate.get(r.reference_number) || {
      created_at: r.created_at,
      itemsCount: 0,
      totalQty: 0,
      highestShippingFee: 0,
      itemsTotal: 0,
      firstProductId: undefined,
    }
    if (!g.firstProductId) g.firstProductId = r.product_id
    g.created_at = g.created_at || r.created_at
    g.itemsCount += 1
    g.totalQty += Number(r.qty || 0)
    const sf = Number(r.shipping_fee ?? 0)
    if (sf > g.highestShippingFee) g.highestShippingFee = sf
    const unit = Number(r.discounted_price ?? 0)
    g.itemsTotal += unit * Number(r.qty || 0)
    aggregate.set(r.reference_number, g)
    const bucket = rowsByRef.get(r.reference_number) ?? []
    bucket.push(r)
    rowsByRef.set(r.reference_number, bucket)
    purchaseIdToRef.set(r.id, r.reference_number)
  }
  const sampleIds = Array.from(
    new Set(
      Array.from(aggregate.values())
        .map((v) => v.firstProductId)
        .filter(Boolean),
    ),
  ) as string[]
  const prodMap = new Map<string, { name: string; product_url: string[] | string | null }>()
  if (sampleIds.length > 0) {
    const { data: prods } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,product_url')
      .in('id', sampleIds)
    for (const p of (prods || []) as Array<{
      id: string
      name: string
      product_url: string[] | string | null
    }>) {
      prodMap.set(p.id, { name: p.name, product_url: p.product_url })
    }
  }
  const groups: Array<{
    ref: string
    created_at: string
    itemsCount: number
    totalQty: number
    highestShippingFee: number
    itemsTotal: number
    sampleName: string
    sampleImageUrl: string | null
    displayTotal?: number
  }> = []
  for (const [ref, g] of aggregate.entries()) {
    const p = g.firstProductId ? prodMap.get(g.firstProductId) : null
    let sampleImageUrl: string | null = null
    if (p) {
      sampleImageUrl = await resolveFirstImageUrl({
        id: g.firstProductId as string,
        product_url: p.product_url,
      })
    }
    groups.push({
      ref,
      created_at: g.created_at,
      itemsCount: g.itemsCount,
      totalQty: g.totalQty,
      highestShippingFee: g.highestShippingFee,
      itemsTotal: Number(g.itemsTotal.toFixed(2)),
      sampleName: p?.name || '',
      sampleImageUrl,
    })
  }
  const allPurchaseIds = rows.map((r) => r.id)
  const redemptionSumByRef = new Map<string, number>()
  if (allPurchaseIds.length > 0) {
    const { data: reds, error: rErr } = await supabase
      .schema('rewards')
      .from('discount_redemptions')
      .select('purchase_id, redeemed_amount')
      .eq('user_id', uid)
      .in('purchase_id', allPurchaseIds)
    if (!rErr && reds) {
      for (const rec of reds as Array<{ purchase_id: string; redeemed_amount: number }>) {
        const ref = purchaseIdToRef.get(rec.purchase_id)
        if (!ref) continue
        const prev = redemptionSumByRef.get(ref) ?? 0
        redemptionSumByRef.set(ref, Number((prev + Number(rec.redeemed_amount || 0)).toFixed(2)))
      }
    }
  }
  for (const grp of groups) {
    const red = redemptionSumByRef.get(grp.ref) ?? 0
    const fee = Number(grp.highestShippingFee || 0)
    const base = grp.itemsTotal
    const itemsAfter = Number(Math.max(0, base - red).toFixed(2))
    grp.displayTotal = Number((itemsAfter + (fee > 0 ? fee : 0)).toFixed(2))
  }
  pendingGroups.value = groups
  } finally {
    pendingLoading.value = false
  }
}

async function openPlacePending(refNumber: string) {
  pendingPlaceLoading.value = true
  try {
  const uid = await ensureUser()
  if (!uid) return
  const { data } = await supabase
    .schema('games')
    .from('purchases')
    .select(
      'id, product_id, qty, reference_number, created_at, shipping_fee, status, discounted_price, modeofpayment, is_free_shipping',
    )
    .eq('user_id', uid)
    .eq('reference_number', refNumber)
    .eq('status', 'pending')

  inPendingContext.value = true
  pendingPurchases.value = data as PurchaseRow[]
  pendingRefNumber.value = refNumber
  pendingHighestShippingFee.value = pendingPurchases.value.reduce(
    (mx, r) => Math.max(mx, Number(r.shipping_fee || 0)),
    0,
  )
  pendingHasFreeShipping.value = pendingPurchases.value.some((r) => r.is_free_shipping === true)

  const dbPayment = (pendingPurchases.value[0]?.modeofpayment as 'cod' | 'ewallet') || 'cod'
  paymentMethod.value = dbPayment

  recordedOrderDiscountAmount.value = null
  let foundDiscountId: string | null = null
  if (pendingPurchases.value.length > 0) {
    const ids = pendingPurchases.value.map((p) => p.id)
    const { data: reds } = await supabase
      .schema('rewards')
      .from('discount_redemptions')
      .select('purchase_id, discount_id, redeemed_amount')
      .eq('user_id', uid)
      .in('purchase_id', ids)
    if (reds && (reds as any[]).length > 0) {
      let sum = 0
      for (const r of reds as Array<{
        purchase_id: string
        discount_id: string
        redeemed_amount: number
      }>) {
        sum += Number(r.redeemed_amount || 0)
        if (!foundDiscountId) foundDiscountId = r.discount_id
      }
      recordedOrderDiscountAmount.value = Number(sum.toFixed(2))
    }
  }
pendingDiscountProductId.value = null
    if (foundDiscountId) {
      const { data: drow } = await supabase
        .schema('rewards')
        .from('discounts')
        .select('id, product_id')
        .eq('id', foundDiscountId)
        .maybeSingle()
      if (drow) {
        pendingDiscountProductId.value = (drow as any).product_id ?? null
      }
    }
    //
  await loadActiveDiscounts()
  if (recordedOrderDiscountAmount.value != null && foundDiscountId) {
    discountMode.value = 'discount'
    selectedDiscountId.value = foundDiscountId
    discountCodeInput.value = ''
    resolvedDiscountByCode.value = null
  } else {
    discountMode.value = 'credits'
    selectedDiscountId.value = ''
    discountCodeInput.value = ''
    resolvedDiscountByCode.value = null
  }
  await buildPendingCartItems()
  showPendingPlace.value = true
  } finally {
    pendingPlaceLoading.value = false
  }

  
}
function closePlacePending() {
  showPendingPlace.value = false
  inPendingContext.value = false
  pendingRefNumber.value = null
  pendingPurchases.value = []
  pendingHighestShippingFee.value = 0
  recordedOrderDiscountAmount.value = null
}

async function buildPendingCartItems() {
  if (pendingPurchases.value.length === 0) return
  const ids = Array.from(new Set(pendingPurchases.value.map((p) => p.product_id)))
  const { data: prodRows } = await supabase
    .schema('games')
    .from('products')
    .select(
      'id,name,description,price,product_url,ispublish,stock,created_at,specifications,warranty',
    )
    .in('id', ids)
  const map = new Map<string, Product>()
  for (const p of (prodRows || []) as Product[]) map.set(p.id, p)
  const list: Array<{
    product: Product
    qty: number
    imageUrl: string | null
    lineTotal: number
    unit: number
    originalUnit: number
  }> = []
  let remainingCredits =
    discountMode.value === 'credits' && hasMemberDiscount.value
      ? Number(userDiscountCredits.value || 0)
      : 0
  for (const row of pendingPurchases.value) {
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
    const qty = Math.max(1, Number(row.qty || 0))
    const originalUnit = Number(p.price || 0)
    let unitToUse = originalUnit
    let lineTotal = originalUnit * qty
    if (discountMode.value === 'credits' && hasMemberDiscount.value) {
      const discountedUnitMember = discountedPrice(originalUnit)
      const needPerUnit = Math.max(0, originalUnit - discountedUnitMember)
      const needForItem = needPerUnit * qty
      if (needPerUnit > 0 && remainingCredits >= needForItem) {
        unitToUse = discountedUnitMember
        lineTotal = unitToUse * qty
        remainingCredits = Number((remainingCredits - needForItem).toFixed(2))
        discountedItemMap[p.id] = true
      } else {
        discountedItemMap[p.id] = false
      }
    } else {
      discountedItemMap[p.id] = false
    }
    list.push({ product: p, qty, imageUrl: img, lineTotal, unit: unitToUse, originalUnit })
    if (!inPendingContext.value) {
      dbCartByProduct[p.id] = qty
    }
  }
  cartItems.value = list
}

const orderTotalPending = computed(() =>
  Number(
    (
      finalPayableTotal.value + (pendingHasFreeShipping.value ? 0 : pendingHighestShippingFee.value)
    ).toFixed(2),
  ),
)

/* === AfterShip functionality removed: no external push === */
async function placePendingOrder() {
  const uid = await ensureUser()
  if (!uid || !pendingRefNumber.value) {
    await swInfo('Please log in.')
    return
  }
  if (cartItems.value.length === 0) {
    await swInfo('No items found for this pending order.')
    return
  }
  if (!hasShipping.value) {
    await swWarn('Please complete your delivery details first.')
    return
  }
  if (pendingHighestShippingFee.value <= 0 && !pendingHasFreeShipping.value) {
    await swInfo('Shipping fee not yet set by admin.')
    return
  }

  if (discountMode.value === 'discount' && recordedOrderDiscountAmount.value == null) {
    const usedId =
      resolvedDiscountByCode.value?.id?.trim() || selectedDiscountId.value?.trim() || ''
    if (!usedId || orderDiscountIneligibleReason.value) {
      await swWarn(
        orderDiscountIneligibleReason.value ||
          'Please apply a valid discount code or select a discount.',
      )
      return
    }
    const { ok, message } = await assertPerUserEligible(usedId, uid)
    if (!ok) {
      await swWarn(message || 'You have reached the maximum number of uses for this discount.')
      return
    }
  }

  placingOrder.value = true
  try {
    // ⛑️ Safe save (will not wipe fields)
    await saveShipping()
    const { data: freshUser } = await supabase
      .from('users')
      .select('balance, discount_credits, membership_id')
      .eq('id', uid)
      .maybeSingle()
    const freshBalance = Number(freshUser?.balance ?? 0)
    let freshDiscountCredits = Number(freshUser?.discount_credits ?? 0)
    memberDiscountPct.value = 0
    if (freshUser?.membership_id) {
      const { data: tierRow } = await supabase
        .schema('membership')
        .from('tiers')
        .select('discount_per_purchase')
        .eq('id', freshUser.membership_id)
        .maybeSingle()
      if (tierRow && typeof tierRow.discount_per_purchase !== 'undefined') {
        memberDiscountPct.value = Number(tierRow.discount_per_purchase || 0)
      }
    }
    userBalance.value = freshBalance
    userDiscountCredits.value = freshDiscountCredits

    let finalItemsTotal = 0
    let orderDiscountAmt = 0
    if (discountMode.value === 'discount') {
      if (recordedOrderDiscountAmount.value != null) {
        const base = cartGrandTotalIgnoringCredits.value
        orderDiscountAmt = Math.min(base, Number(recordedOrderDiscountAmount.value || 0))
      } else {
        const base = cartGrandTotalIgnoringCredits.value
        const d = pickedDiscount.value
        orderDiscountAmt = computeOrderDiscountAmount(base, d)
      }
      finalItemsTotal = Number(
        Math.max(0, cartGrandTotalIgnoringCredits.value - orderDiscountAmt).toFixed(2),
      )
    } else {
      finalItemsTotal = cartGrandTotal.value
      orderDiscountAmt = 0
    }
    const shippingFee = Number(
      (pendingHasFreeShipping.value ? 0 : pendingHighestShippingFee.value) || 0,
    )
    const itemsTotal = Number(finalItemsTotal.toFixed(2))
    const grandTotalIncludingShipping = Number((itemsTotal + shippingFee).toFixed(2))
    const isEwallet = paymentMethod.value === 'ewallet'
    const purchaseStatus = isEwallet ? 'to ship' : 'to pay'
    const totalToDeduct = isEwallet ? grandTotalIncludingShipping : 0
    if (isEwallet && freshBalance < totalToDeduct) {
      await swWarn('Insufficient balance for E-Wallet. Please choose Cash on Delivery or top up.')
      return
    }

    if (isEwallet && totalToDeduct > 0) {
      try {
        const newBal = await chargeEwalletAtomically(totalToDeduct, pendingRefNumber.value!, uid)
        userBalance.value = newBal
      } catch (e: any) {
        if (e?.message === 'INSUFFICIENT_FUNDS') {
          await swWarn('Insufficient funds. Please choose Cash on Delivery or top up.')
        } else {
          await swError('Failed to charge E-Wallet: ' + (e?.message || 'Unknown error'))
        }
        return
      }
    }

    type LineDraft = {
      p: Product
      quantity: number
      unitBeforeOrder: number
      lineBeforeOrder: number
      unitFinal: number
      purchaseId: string
    }
    const lines: LineDraft[] = []

    if (discountMode.value === 'discount') {
      const byProductPurchase = new Map<string, PurchaseRow>()
      pendingPurchases.value.forEach((r) => byProductPurchase.set(r.product_id, r))

      // Build tmp lines (unchanged default = unitBeforeOrder)
      const d = pickedDiscount.value
      const eligibleProductId = d?.product_id ?? pendingDiscountProductId.value ?? null

      const tmpLines: Array<{
        p: Product
        quantity: number
        unitBeforeOrder: number
        lineBeforeOrder: number
        unitFinal: number
        purchaseId: string
      }> = []

      for (const it of cartItems.value) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        const unitBefore = Number(it.originalUnit || 0)
        const lineBefore = unitBefore * qty
        tmpLines.push({
          p: it.product,
          quantity: qty,
          unitBeforeOrder: unitBefore,
          lineBeforeOrder: lineBefore,
          unitFinal: unitBefore, // default unchanged
          purchaseId: byProductPurchase.get(it.product.id)?.id || '',
        })
      }

      if (eligibleProductId) {
        // ### CHANGED: apply order-level discount ONLY to the target product line
        const target = tmpLines.find((ln) => ln.p.id === eligibleProductId)
        if (target) {
          // decide how much discount to use strictly against this product line
          let useAmt =
            recordedOrderDiscountAmount.value != null
              ? Math.min(Number(recordedOrderDiscountAmount.value), target.lineBeforeOrder)
              : computeOrderDiscountAmount(target.lineBeforeOrder, d!)

          useAmt = Number(Math.max(0, useAmt).toFixed(2))
          if (useAmt > 0 && target.quantity > 0) {
            const perUnitShare = Number((useAmt / target.quantity).toFixed(2))
            target.unitFinal = Number(
              Math.max(0, target.unitBeforeOrder - perUnitShare).toFixed(2),
            )
          }
          // all other tmpLines remain at original price
        }
      } else {
        // Global order discount → keep proportional split across ALL lines (original behavior)
        let eligibleBase = 0
        for (const ln of tmpLines) eligibleBase += ln.lineBeforeOrder
        const useAmt = Math.min(orderDiscountAmt, eligibleBase)
        if (useAmt > 0 && eligibleBase > 0) {
          for (const ln of tmpLines) {
            const weight = ln.lineBeforeOrder / eligibleBase
            const share = Number((weight * useAmt).toFixed(2))
            const perUnitShare = Number((share / ln.quantity).toFixed(2))
            ln.unitFinal = Number(Math.max(0, ln.unitBeforeOrder - perUnitShare).toFixed(2))
          }
        }
      }
      lines.push(...tmpLines)
      // ### END CHANGED
    } else {
      const byProductPurchase = new Map<string, PurchaseRow>()
      pendingPurchases.value.forEach((r) => byProductPurchase.set(r.product_id, r))
      for (const it of cartItems.value) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        lines.push({
          p: it.product,
          quantity: qty,
          unitBeforeOrder: Number(it.originalUnit),
          lineBeforeOrder: Number(it.originalUnit) * qty,
          unitFinal: Number(it.unit),
          purchaseId: byProductPurchase.get(it.product.id)?.id || '',
        })
      }
    }

    for (const ln of lines) {
      if (!ln.purchaseId) continue
      const { error: updErr } = await supabase
        .schema('games')
        .from('purchases')
        .update({
          discounted_price: ln.unitFinal,
          status: purchaseStatus,
          modeofpayment: paymentMethod.value,
        })
        .eq('id', ln.purchaseId)
      if (updErr) {
        console.error('[update purchase unit/status] failed:', updErr.message)
        await swError('Failed to finalize order items: ' + updErr.message)
        return
      }
    }

    // Removed AfterShip push (no-op)

    if (discountMode.value === 'credits') {
      let totalDiscountCreditsToDeduct = 0
      for (const ln of lines) {
        const perUnitDiff = Math.max(0, ln.unitBeforeOrder - ln.unitFinal)
        totalDiscountCreditsToDeduct += perUnitDiff * ln.quantity
      }
      totalDiscountCreditsToDeduct = Number(totalDiscountCreditsToDeduct.toFixed(2))
      if (totalDiscountCreditsToDeduct > 0) {
        const receiptsPayload = lines
          .map((ln) => {
            const perUnitDiff = Math.max(0, ln.unitBeforeOrder - ln.unitFinal)
            const usedForThis = Number((perUnitDiff * ln.quantity).toFixed(2))
            if (usedForThis <= 0 || !ln.purchaseId) return null
            return {
              purchase_id: ln.purchaseId,
              amount_discounted: usedForThis,
              reference_number: pendingRefNumber.value!,
            }
          })
          .filter(Boolean) as Array<{
          purchase_id: string
          amount_discounted: number
          reference_number: string
        }>
        if (receiptsPayload.length > 0) {
          const { error: recErr } = await supabase
            .schema('ewallet')
            .from('discount_credits_receipt')
            .insert(receiptsPayload as any)
          if (recErr) {
            console.error('[discount_credits_receipt insert failed]', recErr.message)
            await swError('Failed to create discount credits receipt: ' + recErr.message)
            return
          }
        }
        const { data: reUser } = await supabase
          .from('users')
          .select('discount_credits')
          .eq('id', uid)
          .maybeSingle()
        const currentCredits = Number(reUser?.discount_credits ?? 0)
        const newDcBalance = Math.max(
          0,
          Number((currentCredits - totalDiscountCreditsToDeduct).toFixed(2)),
        )
        const { error: dcErr } = await supabase
          .from('users')
          .update({ discount_credits: newDcBalance })
          .eq('id', uid)
        if (dcErr) {
          console.error('[users.discount_credits update failed]', dcErr.message)
          await swError('Failed to deduct discount credits: ' + dcErr.message)
          return
        }
        userDiscountCredits.value = newDcBalance
      }
    }

    // ▶ ADDED: Create discount_redemptions at PLACE time if it wasn't recorded at request time
    if (discountMode.value === 'discount' && recordedOrderDiscountAmount.value == null) {
      const usedDiscountId = pickedDiscount.value?.id || ''
      const disc = pickedDiscount.value
      if (usedDiscountId && disc && orderDiscountAmt > 0) {
        if (disc.product_id) {
          // only the specific product gets redemption rows
          const targetLine = lines.find((ln) => ln.p.id === disc.product_id)
          if (targetLine && targetLine.purchaseId) {
            const parts = splitAmountAcrossQty(orderDiscountAmt, targetLine.quantity)
            console.log('[discount][pending] product-scoped split', {
              qty: targetLine.quantity,
              total: orderDiscountAmt,
              parts,
            })
            const rows = parts.map((amt) => ({
              discount_id: usedDiscountId,
              user_id: uid,
              purchase_id: targetLine.purchaseId,
              redeemed_amount: Number(amt.toFixed(2)),
              currency: 'PHP',
            }))
            const { error: redInsErr } = await supabase
              .schema('rewards')
              .from('discount_redemptions')
              .insert(rows as any)
            if (redInsErr) {
              console.error('[discount_redemptions insert failed at placePending]', redInsErr.message)
              await swError('Failed to record discount at placement: ' + redInsErr.message)
              return
            }
            let rpcOk = 0
            for (let i = 0; i < parts.length; i++) {
              const { data: ok, error: redErr } = await supabase.rpc('inc_discount_redemption', {
                p_discount_id: usedDiscountId,
              })
              if (!redErr && ok !== null) rpcOk++
            }
            const delta = parts.length - rpcOk
            if (delta > 0) {
              const { data: dRow, error: selErr } = await supabase
                .schema('rewards')
                .from('discounts')
                .select('id, redemptions_count')
                .eq('id', usedDiscountId)
                .maybeSingle()
              if (!selErr && dRow?.id) {
                const nextCount = Number(dRow.redemptions_count ?? 0) + delta
                await supabase
                  .schema('rewards')
                  .from('discounts')
                  .update({ redemptions_count: nextCount })
                  .eq('id', usedDiscountId)
              }
            }
          }
        } else {
          // global discount -> single redemption record (keep your original pattern)
          const anyPurchaseId = lines[0]?.purchaseId || (await getAnyPurchaseIdForRef(pendingRefNumber.value!, uid))
          if (anyPurchaseId) {
            const { error: redInsErr } = await supabase
              .schema('rewards')
              .from('discount_redemptions')
              .insert([
                {
                  discount_id: usedDiscountId,
                  user_id: uid,
                  purchase_id: anyPurchaseId,
                  redeemed_amount: Number(orderDiscountAmt.toFixed(2)),
                  currency: 'PHP',
                },
              ])
            if (redInsErr) {
              console.error('[discount_redemptions insert failed at placePending]', redInsErr.message)
              await swError('Failed to record discount at placement: ' + redInsErr.message)
              return
            }
            const { data: ok, error: redErr } = await supabase.rpc('inc_discount_redemption', {
              p_discount_id: usedDiscountId,
            })
            if (redErr || ok === null) {
              const { data: dRow, error: selErr } = await supabase
                .schema('rewards')
                .from('discounts')
                .select('id, redemptions_count')
                .eq('id', usedDiscountId)
                .maybeSingle()
              if (!selErr && dRow?.id) {
                const nextCount = Number(dRow.redemptions_count ?? 0) + 1
                await supabase
                  .schema('rewards')
                  .from('discounts')
                  .update({ redemptions_count: nextCount })
                  .eq('id', usedDiscountId)
              }
            }
          }
        }
      }
    }
    // ▶ END ADDED

    for (const ln of lines) {
      try {
        const { data: stockRow, error: stockSelErr } = await supabase
          .schema('games')
          .from('products')
          .select('stock')
          .eq('id', ln.p.id)
          .maybeSingle()
        if (!stockSelErr && stockRow) {
          const currentStock = Number(stockRow.stock ?? 0)
          const newStock = Math.max(0, currentStock - ln.quantity)
          if (newStock !== currentStock) {
            const { error: stockUpdErr } = await supabase
              .schema('games')
              .from('products')
              .update({ stock: newStock })
              .eq('id', ln.p.id)
            if (stockUpdErr) {
              console.error('[stock update failed]', stockUpdErr.message)
            }
          }
        } else if (stockSelErr) {
          console.error('[stock fetch failed]', stockSelErr.message)
        }
      } catch (e) {
        console.error('[stock update exception]', e)
      }
    }

    if (isEwallet) {
      let purchaseIdForTxn = pendingPurchases.value[0]?.id || null
      if (!purchaseIdForTxn && pendingRefNumber.value) {
        purchaseIdForTxn = await getAnyPurchaseIdForRef(pendingRefNumber.value, uid)
      }
      if (!purchaseIdForTxn) {
        console.error('[order_transactions] No purchase_id found for', pendingRefNumber.value)
        await swError('Could not tag the payment to a purchase. Please try again.')
        return
      }
      const { error: txnErr } = await supabase
        .schema('ewallet')
        .from('order_transactions')
        .insert([
          {
            reference_number: pendingRefNumber.value,
            purchase_id: purchaseIdForTxn,
            total_amount: Number(totalToDeduct.toFixed(2)),
          } as any,
        ])
      if (txnErr) {
        console.error('[order_transactions insert failed]', txnErr.message)
        await swError('Failed to record the wallet payment: ' + txnErr.message)
        return
      }
    }

    closePlacePending()
    await loadPendingOrders()
    await fetchProducts()
    if (isEwallet) {
      await swSuccess('Payment successful! Your order is now set to ship.')
    } else {
      await swSuccess('Order placed! Status is to pay. Please prepare payment upon delivery or await admin instructions.')
    }
  } finally {
    placingOrder.value = false
  }
}

async function cancelPendingOrder() {
  const uid = await ensureUser()
  if (!uid || !pendingRefNumber.value) return

  const ref = pendingRefNumber.value

  // ✅ Close review/place overlays first so the confirm isn’t “under” them
  const prior = await preConfirmClosePlaceModals()

  // 🔔 SweetAlert confirm
  const result = await Swal.fire({
    title: 'Cancel request?',
    text: `Cancel request ${ref}? This will remove all pending items for this reference.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel it',
    cancelButtonText: 'No, keep it',
    reverseButtons: true,
    focusCancel: true,
    heightAuto: false, // avoids scroll jump on some setups
  })

  // If user backs out, bring the modal back so they’re not “lost”
  if (!result.isConfirmed) {
    // reopen only what was open before
    try {
      if (prior.pending && prior.ref) {
        await openPlacePending(prior.ref)
      } else if (prior.place) {
        openPlaceOrder()
      }
    } catch (_) {}
    return
  }

  placingOrder.value = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .delete()
      .eq('user_id', uid)
      .eq('reference_number', ref!)
      .eq('status', 'pending')

    if (error) {
      await Swal.fire({
        title: 'Cancel failed',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'OK',
        heightAuto: false,
      })
      return
    }

    await loadPendingOrders()

    await Swal.fire({
      title: 'Request cancelled',
      text: 'Your pending request has been removed.',
      icon: 'success',
      confirmButtonText: 'OK',
      heightAuto: false,
    })
  } finally {
    placingOrder.value = false
  }
}


/* ========================================================================
   FETCH PRODUCTS (LIST VIEW)
   ======================================================================== */
async function fetchProducts() {
  loading.value = true
  const from = (page.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  let query = supabase
    .schema('games')
    .from('products')
    .select(
      'id,name,description,price,product_url,ispublish,stock,created_at,specifications,warranty',
      { count: 'exact' },
    )
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
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'relevance':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }
  query = query.range(from, to)
  const { data, error, count } = await query
  if (!error && data) {
    products.value = data as Product[]
    total.value = count ?? 0
    for (const p of products.value) {
      if (cartByProduct[p.id] == null) cartByProduct[p.id] = 1
    }
    saveStagedToLocal()
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

/* ========================================================================
   REALTIME BINDINGS
   ======================================================================== */
let productChannel: ReturnType<typeof supabase.channel> | null = null
let cartChannel: ReturnType<typeof supabase.channel> | null = null
let usersChannel: ReturnType<typeof supabase.channel> | null = null
let purchasesChannel: ReturnType<typeof supabase.channel> | null = null

function bindProductsRealtime() {
  if (productChannel) return
  productChannel = supabase
    .channel('rt-products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'games', table: 'products' },
      async (_payload) => {
        await fetchProducts()
      },
    )
    .subscribe()
}
async function bindCartRealtime() {
  const uid = await ensureUser()
  if (!uid || cartChannel) return
  cartChannel = supabase
    .channel('rt-cart-' + uid)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'games',
        table: 'cart',
        filter: `user_id=eq.${uid}`,
      },
      async (_payload) => {
        await loadCart()
        if (showCart.value) await loadCartDetails()
        if (showPlace.value) await loadCartDetails()
      },
    )
    .subscribe()
}
async function bindUsersRealtime() {
  const uid = await ensureUser()
  if (!uid || usersChannel) return
  usersChannel = supabase
    .channel('rt-users-' + uid)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${uid}`,
      },
      async (_payload) => {
        await loadShipping()
      },
    )
    .subscribe()
}
async function bindPurchasesRealtime() {
  const uid = await ensureUser()
  if (!uid || purchasesChannel) return
  purchasesChannel = supabase
    .channel('rt-purchases-' + uid)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'games',
        table: 'purchases',
        filter: `user_id=eq.${uid}`,
      },
      async (_payload) => {
        await loadPendingOrders()
        if (showPendingPlace.value && pendingRefNumber.value) {
          await openPlacePending(pendingRefNumber.value)
        }
      },
    )
    .subscribe()
}

/* ========================================================================
   AFTERSHIP PUSH (DISABLED / NO-OP)
   ======================================================================== */
async function pushOrderToAfterShip(_args: any) {
  // AfterShip integration removed; function kept as a safe no-op.
  return { ok: true, disabled: true }
}

/* ========================================================================
   PRODUCT DETAILS MODAL STATE
   ======================================================================== */
const showProductModal = ref(false)
const productModal = ref<Product | null>(null)
const productModalThumbRef = ref<HTMLElement | null>(null)
function openProductModal(p: Product) {
  productModal.value = p
  productImages(p)
  slideIdx[p.id] = 0
  showProductModal.value = true
}
function closeProductModal() {
  showProductModal.value = false
  productModal.value = null
}
async function onAddToCartFromModal(ev: MouseEvent) {
  if (!productModal.value) return
  await onAddToCart(ev, productModal.value)
  const el = productModalThumbRef.value
  if (el) flyToCart(el)
}

/* ========================================================================
   SPECIFICATIONS HELPERS
   ======================================================================== */

   async function preConfirmClosePlaceModals() {
  // remember which UI sheets were open
  const prior = {
    pending: showPendingPlace.value,
    place: showPlace.value,
    ref: pendingRefNumber.value as string | null,
  }

  // close the UI layers that sit above the Swal backdrop
  if (prior.pending) closePlacePending()
  if (prior.place) closePlaceOrder()

  // give the DOM a frame to settle so SweetAlert isn’t underlapped
  await nextTick()
  return prior
}

function parseSpecs(raw: unknown): Record<string, any> {
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try {
      const obj = JSON.parse(raw)
      return obj && typeof obj === 'object' && !Array.isArray(obj)
        ? (obj as Record<string, any>)
        : {}
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, any>
  }
  return {}
}
function getSpecs(p: Product | null | undefined): Array<[string, string]> {
  if (!p) return []
  const spec = parseSpecs(p.specifications as any)
  return Object.entries(spec)
    .map(([k, v]) => [k, String(v ?? '').trim()] as [string, string])
    .filter(([, v]) => v.length > 0)
}
function hasSpecs(p: Product | null | undefined): boolean {
  return getSpecs(p).length > 0
}

/* ========================================================================
   LIFECYCLE
   ======================================================================== */
onMounted(async () => {
  // for dropdown closing
  document.addEventListener('click', onDocClick, { capture: true })

  loadStagedFromLocal()

  // Load products, cart, shipping, pending
  await Promise.all([fetchProducts(), loadCart(), loadShipping()])
  await loadPendingOrders()

  // Load PSGC datasets ONLY if external lookup is enabled (kept OFF for editing)
  if (addressLookupEnabled.value) {
    await Promise.all([loadRegionsPSGC(), loadProvincesPSGC(), loadAllLGUsPSGC()])
  }

  // realtime
  bindProductsRealtime()
  await bindCartRealtime()
  await bindUsersRealtime()
  await bindPurchasesRealtime()
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick, { capture: true })
  if (productChannel) supabase.removeChannel(productChannel)
  if (cartChannel) supabase.removeChannel(cartChannel)
  if (usersChannel) supabase.removeChannel(usersChannel)
  if (purchasesChannel) supabase.removeChannel(purchasesChannel)
})

/* Re-fetch on page size change */
watch(pageSize, () => goToPage(1))

/* Rebuild cart view when discount mode changes (so credits mode re-applies) */
watch(discountMode, async () => {
  if (showPendingPlace.value) {
    await buildPendingCartItems()
  } else if (showCart.value || showPlace.value) {
    await loadCartDetails()
  }
})

watch(selectedDiscountId, (v) => {
  if (v) {
    discountCodeInput.value = ''
    resolvedDiscountByCode.value = null
  }
})
watch(resolvedDiscountByCode, (v) => {
  if (v) selectedDiscountId.value = ''
})
</script>















<style scoped>
/* ================================
   ORIGINAL STYLES (UNCHANGED)
   ================================ */

/* Base ratio for cards */
.product-thumb.ratio {
  --bs-aspect-ratio: 75%;
}
/* make it square on smaller screens */
@media (max-width: 1400px) {
  .product-thumb.ratio {
    --bs-aspect-ratio: 100%;
  }
}
@media (max-width: 1399.98px) {
  .products-div {
    max-height: 480px;
    max-width: 325px;
  }
}
@media (max-width: 431px) {
  .products-div {
    max-width: 210px;
  }
}
.shop-page {
  --card-radius: 12px;
}
.product-card {
  border-radius: var(--card-radius);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  font-size: 0.96rem;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
.product-card--clickable {
  cursor: pointer;
}
.product-thumb {
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
  position: relative;
}
.object-fit-cover {
  object-fit: cover;
}
.product-card .card-body {
  padding: 0.75rem;
}
.product-card .card-footer {
  padding: 0.5rem 0.75rem 0.75rem;
}
.product-title {
  font-size: 1rem;
  line-height: 1.25;
} 
.price {
  font-size: 1.06rem;
  letter-spacing: 0.2px;
}
.rotate-180 {
  transform: rotate(180deg);
}
/* Modal base */
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
/* Clean & aesthetic tweaks for modals */
.modal-card--aesthetic .card-header {
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.modal-card--aesthetic .card-body .border {
  border-color: rgba(0, 0, 0, 0.08) !important;
  background: #fff;
  backdrop-filter: saturate(120%);
  border-radius: 14px;
}
/* Cart pulse & add animations */
.cart-pulse {
  animation: cartPulse 0.25s ease;
}
@keyframes cartPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
.added-burst {
  animation: addedGlow 0.45s ease;
}
@keyframes addedGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
  }
  40% {
    box-shadow: 0 8px 28px rgba(25, 135, 84, 0.28);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
  }
}
/* Cart thumbs */
.cart-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 12px;
  overflow: hidden;
}
.product-img-fallback {
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
}
/* Carousel */
.carousel-thumb {
  position: absolute;
  inset: 0;
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
  overflow: hidden;
  background: #f6f7fb;
}
.carousel-thumb .slides {
  width: 100%;
  height: 100%;
  position: relative;
}
.slide-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.02);
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}
.slide-img--active {
  opacity: 1;
  transform: scale(1);
}
.carousel-thumb .dots {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}
.dot.active {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.15);
}
.carousel-thumb .nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.8);
  color: #111;
  cursor: pointer;
}
.carousel-thumb .nav.left {
  left: 8px;
}
.carousel-thumb .nav.right {
  right: 8px;
}
.carousel-thumb .nav:hover {
  background: #fff;
}
/* Qty bump effect */
.qty-field {
  transition: transform 0.15s ease;
}
.qty-bump {
  transform: scale(1.06);
}
/* Little badge pop when adding to cart */
.cart-added-badge {
  background: #198754;
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 999px;
  opacity: 0;
  transform: translateY(-6px) scale(0.9);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.cart-added-badge--show {
  opacity: 1;
  transform: translateY(-14px) scale(1);
}
/* Product modal */
.product-modal-card {
  width: min(980px, 96vw);
}
.product-modal-thumb.ratio {
  --bs-aspect-ratio: 75%;
}
/* Pending list small thumb + truncated name */
.pending-thumb {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f3f5;
}
.pending-sample-name {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (min-width: 1400px) {
  .pending-sample-name {
    max-width: 220px;
  }
}
/* Minor utility */
.text-monospace {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}
/* --- Pending list compact mode (icon-only) --- */
.pending-thumb {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 6px;
}
.pending-sample-name {
  display: none !important; /* hide name to save space, keep markup intact */
}
/* --- Pending modal item rows --- */
.pending-item-thumb {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 10px;
  overflow: hidden;
}
/* Single-line and two-line clamps for clean ellipsis */
.line-clamp-1 {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/* --- Ensure custom modals appear above any sticky/offcanvas sidebars --- */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(1px);
  z-index: 1200; /* higher than any sidebar/offcanvas */
  display: grid;
  place-items: center;
}
.modal-card {
  position: relative;
  width: min(92vw, 960px);
  max-height: 90vh;
  overflow: auto;
  z-index: 1201;
  border-radius: 16px;
}
/* Optional aesthetic modifier already in your markup */
.modal-card--aesthetic {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
/* --- Pending Orders: tiny icon pills --- */
.pending-icon {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #f8f9fa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  user-select: none;
}
.pending-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pending-icon--more {
  padding: 0 6px;
  min-width: 24px;
}
/* Read-only pending item card thumb in the modal */
.pending-item-thumb {
  width: 56px;
  height: 56px;
}
/* Multiline clamp helpers used in the modal item list */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
/* Small animation for cart qty fields you already use */
.qty-bump {
  animation: qtyBump 0.18s ease;
}
@keyframes qtyBump {
  0% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

/* ================================
   NEW: SKELETON LOADERS + BREATH-IN
   ================================ */

/* Add variables without touching your originals */
.shop-page {
  --skeleton-base: #eef1f5;
  --skeleton-highlight: #f8fafc;
  --skeleton-radius: 12px;
  --breath-duration: 0.5s; /* requested 500ms */
}

/* --- Breath-in animation (apply per section) --- */
@keyframes breathIn {
  0% {
    opacity: 0;
    transform: translateY(6px) scale(0.985);
    filter: saturate(90%);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: saturate(100%);
  }
}

/* Utility you can add to any block/section */
.breath-in {
  animation: breathIn var(--breath-duration) ease both;
}

/* Auto-apply a soft breath-in to common sections */
.shop-page :where(.card, .product-card, .modal-card, .products-div) {
  animation: breathIn var(--breath-duration) ease both;
}

/* Stagger helper (wrap children in .breath-stagger to cascade) */
.breath-stagger > * {
  animation: breathIn var(--breath-duration) ease both;
}
.breath-stagger > *:nth-child(1) { animation-delay: 0ms; }
.breath-stagger > *:nth-child(2) { animation-delay: 60ms; }
.breath-stagger > *:nth-child(3) { animation-delay: 120ms; }
.breath-stagger > *:nth-child(4) { animation-delay: 180ms; }
.breath-stagger > *:nth-child(5) { animation-delay: 240ms; }
.breath-stagger > *:nth-child(6) { animation-delay: 300ms; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .breath-in,
  .shop-page :where(.card, .product-card, .modal-card, .products-div),
  .breath-stagger > * {
    animation: none !important;
  }
}

/* --- Skeleton shimmer core --- */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  position: relative;
  display: block;
  border-radius: var(--skeleton-radius);
  background:
    linear-gradient(90deg,
      var(--skeleton-base) 0%,
      var(--skeleton-highlight) 45%,
      var(--skeleton-base) 80%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

/* Sub-variants */
.skeleton--text { height: 0.9rem; border-radius: 8px; }
.skeleton--title { height: 1.05rem; border-radius: 8px; }
.skeleton--badge { height: 1.1rem; border-radius: 999px; }
.skeleton--btn   { height: 2.25rem; border-radius: 10px; }
.skeleton--thumb { width: 100%; aspect-ratio: 4 / 3; border-radius: var(--card-radius); }
.skeleton--square { aspect-ratio: 1 / 1; }
.skeleton--circle { border-radius: 999px; }

/* Width helpers (avoid Tailwind name collisions) */
.sk-w-25 { width: 25%; }
.sk-w-35 { width: 35%; }
.sk-w-50 { width: 50%; }
.sk-w-65 { width: 65%; }
.sk-w-75 { width: 75%; }
.sk-w-100 { width: 100%; }

/* Height helpers */
.sk-h-8 { height: 8px; }
.sk-h-10 { height: 10px; }
.sk-h-12 { height: 12px; }
.sk-h-16 { height: 16px; }
.sk-h-24 { height: 24px; }

/* Stack helper for spacing groups of skeleton lines */
.sk-stack > * + * { margin-top: 8px; }

/* Show/Hide helpers for loading state:
   Add .is-loading to a container to reveal placeholders */
.show-when-loading { display: none; }
.is-loading .show-when-loading { display: block !important; }
.is-loading .hide-when-loading { visibility: hidden !important; }

/* --- Product card specific skeletons --- */

/* If you add .is-loading to .product-card, these kick in */
.product-card.is-loading .card-body,
.product-card.is-loading .card-footer {
  visibility: hidden; /* keep layout but hide content */
}

.product-card.is-loading .product-thumb::after {
  content: "";
  position: absolute;
  inset: 0;
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
  background:
    linear-gradient(90deg,
      var(--skeleton-base) 0%,
      var(--skeleton-highlight) 45%,
      var(--skeleton-base) 80%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

/* Optional placeholders inside card-body (if you add elements) */
.product-card .sk-title { height: 14px; border-radius: 8px; }
.product-card .sk-price { height: 16px; border-radius: 8px; width: 40%; }

/* --- Modal specific skeletons --- */
.modal-card.is-loading .card-header,
.modal-card.is-loading .card-body,
.modal-card.is-loading .card-footer {
  position: relative;
}
.modal-card.is-loading .card-body > * {
  visibility: hidden;
}
.modal-card.is-loading .card-body::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background:
    linear-gradient(90deg,
      var(--skeleton-base) 0%,
      var(--skeleton-highlight) 45%,
      var(--skeleton-base) 80%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

/* --- Pending list skeletons --- */
.pending-thumb.is-loading::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg,
      var(--skeleton-base) 0%,
      var(--skeleton-highlight) 45%,
      var(--skeleton-base) 80%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

/* --- Carousel thumb skeleton (when images are not ready) --- */
.carousel-thumb.is-loading::after {
  content: "";
  position: absolute;
  inset: 0;
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
  background:
    linear-gradient(90deg,
      var(--skeleton-base) 0%,
      var(--skeleton-highlight) 45%,
      var(--skeleton-base) 80%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

/* --- Quantity / small UI skeletons --- */
.qty-field.is-loading::after,
.pending-icon.is-loading::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg,
      var(--skeleton-base) 0%,
      var(--skeleton-highlight) 45%,
      var(--skeleton-base) 80%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

/* Small helper so you can absolutely position the shimmer on inline blocks */
.is-loading,
.pending-icon,
.qty-field,
.pending-thumb {
  position: relative;
}

/* Optional darker theme tweak if your page is dark */
:where(.dark, [data-theme="dark"]) .skeleton {
  --skeleton-base: #1f2937;
  --skeleton-highlight: #374151;
}

/* End of new additions */
/* === Skeleton / shimmer === */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: #e9ecef;
  border-radius: 8px;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.45), rgba(255,255,255,0));
  animation: shimmer 1.2s infinite;
}

.skeleton-text { height: 0.875rem; border-radius: 6px; }
.skeleton-pill { height: 20px; border-radius: 999px; width: 64px; }
.skeleton-btn { height: 36px; border-radius: 10px; width: 120px; }
.skeleton-input { height: 38px; border-radius: 10px; }
.skeleton-select { height: 38px; border-radius: 10px; }

/* match your existing sizes */
.pending-thumb.skeleton { width: 48px; height: 48px; border-radius: 10px; }
.pending-item-thumb.skeleton { width: 56px; height: 56px; border-radius: 10px; }

/* make big image corners match your cards */
.product-thumb .skeleton,
.product-modal-thumb .skeleton {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
/* --- Skeleton base + shimmer --- */
.skeleton {
  position: relative;
  background-color: #e9ecef;
  overflow: hidden;
  border-radius: 8px;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  animation: sk-shimmer 1.2s infinite;
}
@keyframes sk-shimmer {
  100% { transform: translateX(100%); }
}

/* text/blocks */
.skeleton-text { height: .9rem; border-radius: .25rem; }
.skeleton-pill { width: 72px; height: 1.25rem; border-radius: 999px; }
.skeleton-btn { width: 120px; height: 2.25rem; border-radius: .5rem; }
.skeleton-input { height: 2rem; border-radius: .5rem; }
.skeleton-select { height: 2.5rem; border-radius: .5rem; }

/* --- Important: make skeletons fill Bootstrap .ratio boxes --- */
.ratio > .skeleton,
.ratio .skeleton-fill {
  position: absolute;
  inset: 0;           /* top:0; right:0; bottom:0; left:0 */
}

/* Skeleton base + shimmer */
.skeleton {
  position: relative;
  background-color: #e9ecef;
  overflow: hidden;
  border-radius: 8px;
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
  animation: sk-shimmer 1.2s infinite;
}
@keyframes sk-shimmer {
  100% { transform: translateX(100%); }
}

/* Blocks */
.skeleton-text { height: .9rem; border-radius: .25rem; }
.skeleton-pill { width: 72px; height: 1.25rem; border-radius: 999px; }
.skeleton-btn { width: 120px; height: 2.25rem; border-radius: .5rem; }
.skeleton-input { height: 2rem; border-radius: .5rem; }

/* Fill the Bootstrap .ratio box correctly */
.ratio > .skeleton-fill { position: absolute; inset: 0; }

/* Prevent absolute children (like the image-area skeleton) from bleeding */
.product-card { overflow: hidden; }

/* IMPORTANT: your .products-div sets a max-height at some breakpoints.
   That clips tall skeletons. Loosen it only while loading. */
.is-loading .products-div { max-height: none !important; }

/* ===== Discount Ticket UI ===== */
.discount-picker .ticket-menu {
  max-height: 420px;
  overflow: auto;
  border-radius: 16px;
}

.ticket {
  border-radius: 14px;
  background: #fff;
  border: 1px dashed rgba(0,0,0,.12);
  position: relative;
  overflow: hidden;
}

.ticket-btn {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  width: 100%;
  padding: 12px;
  text-align: left;
  background: transparent;
  border: 0;
}

.ticket-left {
  display: flex; align-items: center;
}

.ticket-avatar {
  width: 48px; height: 48px; border-radius: 12px;
  background: #f3f4f6;
  overflow: hidden; display: grid; place-items: center;
  border: 1px solid rgba(0,0,0,.06);
}
.ticket-avatar img {
  width: 100%; height: 100%; object-fit: cover;
}
.ticket-avatar-fallback { color: #6c757d; font-size: 20px; }

.ticket-main .ticket-title { line-height: 1.2; }
.ticket-main .ticket-value { font-weight: 700; white-space: nowrap; }
.ticket-main .ticket-sub { margin-top: 2px; }
.ticket-main .ticket-foot { margin-top: 2px; opacity: .85; }

.ticket-stub {
  border-left: 1px dashed rgba(0,0,0,.12);
  padding-inline: 10px;
  min-width: 64px;
  color: #0d6efd;
}

.ticket-btn:hover .ticket {
  background: #f8fafc;
}

/* Little perforation effect */
.ticket::before, .ticket::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 12px;
  background:
    radial-gradient(circle at center, #fff 6px, transparent 6px) center/12px 16px repeat-y;
  opacity: .8;
  pointer-events: none;
}
.ticket::before { left: -6px; }
.ticket::after  { right: -6px; }

</style>

