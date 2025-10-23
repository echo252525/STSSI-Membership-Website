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
              v-if="cartTotalItems > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
              >{{ cartTotalItems }}</span
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
      </aside>

      <!-- Products -->
      <section class="col-12 col-xxl-9">
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
                  <!-- ==== UPDATED: Price display with membership discount & credits check ==== -->
                  <div class="price fw-bold">
                    <template v-if="hasMemberDiscount && canDiscountProduct(p)">
                      <span class="price-original text-muted text-decoration-line-through me-1">
                        ₱ {{ number(p.price) }}
                      </span>
                      <span class="price-discount">
                        ₱ {{ number(discountedPrice(p.price)) }}
                      </span>
                      <span class="badge ms-1 text-bg-warning small">-{{ discountLabel }}</span>
                    </template>
                    <template v-else>
                      ₱ {{ number(p.price) }}
                    </template>
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
          <div v-if="cartItems.length === 0" class="text-center text-muted">
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
                <div class="fw-semibold text-truncate" :title="it.product.name">
                  {{ it.product.name }}
                </div>
                <!-- per-item price -->
                <div class="small">
                  <template v-if="hasMemberDiscount && isItemDiscounted(it.product.id)">
                    <span class="text-muted text-decoration-line-through me-1"
                      >₱ {{ number(it.originalUnit) }}</span
                    >
                    <strong>₱ {{ number(it.unit) }}</strong>
                    <span class="badge ms-1 text-bg-warning small">-{{ discountLabel }}</span>
                  </template>
                  <template v-else>₱ {{ number(it.unit) }}</template>
                </div>
              </div>

              <div class="d-flex align-items-center">
                <div class="input-group input-group-sm me-2" style="width: 140px">
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

                <div class="fw-semibold me-2">
                  ₱ {{ number((dbCartByProduct[it.product.id] ?? it.qty) * it.unit) }}
                </div>
                <button
                  class="btn btn-outline-danger btn-sm"
                  title="Remove item"
                  @click="removeCartProduct(it.product.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <hr />
            <div class="d-flex align-items-center justify-content-between fs-5">
              <div class="fw-semibold">Total</div>
              <div class="fw-bold">₱ {{ number(cartGrandTotal) }}</div>
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
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Place Order Modal -->
    <div v-if="showPlace" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Place Order</strong>
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

          <!-- NEW: Payment method -->
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
                  :disabled="placingOrder || !enoughBalanceFinal"
                />
                <label class="form-check-label" for="pmEW">
                  E-Wallet
                  <span class="text-muted"> (Balance: ₱ {{ number(userBalance) }}) </span>
                </label>
              </div>

              <div v-if="!enoughBalanceFinal" class="text-danger small">
                Insufficient balance for E-Wallet. Choose Cash on Delivery or top up.
              </div>
            </div>
          </div>

          <!-- NEW: Shipping fee preview -->
          <div class="border rounded-3 p-3">
            <div class="fw-semibold mb-2"><i class="bi bi-truck me-2"></i>Shipping Fee</div>
            <div class="d-flex align-items-center justify-content-between">
              <div class="text-muted">
                <template v-if="hasFreeShipping">Free shipping (discount applied)</template>
                <template v-else-if="quotingShipping">Getting live rate…</template>
                <template v-else>
                  <span v-if="shippingService">Service: {{ shippingService }} • </span>
                  Destination: {{ shipping.address_line1 }}, {{ shipping.barangay }}, {{ shipping.city }},
                  {{ shipping.province }}, {{ shipping.postal_code }}
                </template>
              </div>
              <div class="fw-bold">
                <template v-if="hasFreeShipping">₱ 0.00</template>
                <template v-else>₱ {{ number(effectiveShippingFee) }}</template>
              </div>
            </div>
          </div>

          <!-- ==== NEW: Discount Mode Selector (mutual exclusivity) ==== -->
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
                <label class="form-check-label" for="modeDiscount">Use Discount (Code or Select)</label>
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
          </div>

          <!-- Discount Credits (disabled if mode !== credits) -->
          <div class="border rounded-3 p-3" :class="discountMode !== 'credits' ? 'opacity-50 pe-none' : ''">
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
                <div class="text-muted small">Estimated Deduction This Order</div>
                <div class="fs-5 fw-semibold">
                  ₱ {{ number(totalDiscountCreditsUsedIfCreditsMode) }}
                </div>
              </div>
              <div class="ms-auto">
                <div class="text-muted small">Projected Balance After Order</div>
                <div class="fw-semibold">
                  ₱ {{ number(userDiscountCredits - totalDiscountCreditsUsedIfCreditsMode) }}
                </div>
              </div>
            </div>
            <div class="small text-muted mt-2">
              We deduct your membership discount from your Discount Credits (original price − discounted price per item × quantity).
            </div>

            <div
              v-if="discountMode==='credits' && insufficientDiscountCredits"
              class="alert alert-warning mt-3 mb-0 py-2 small"
              role="alert"
            >
              Some items won’t receive a membership discount because your Discount Credits balance
              is insufficient. We’ll apply discounts item-by-item until your balance is fully used.
            </div>
          </div>

          <!-- ==== NEW: Order Discount (code or select) ==== -->
          <div class="border rounded-3 p-3" v-if="discountMode==='discount'">
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

              <div class="col-md-6">
                <label class="form-label">Or pick an active discount</label>
                <select class="form-select" v-model="selectedDiscountId">
                  <option :value="''">— Select —</option>
                  <option
                    v-for="d in discounts"
                    :key="d.id"
                    :value="d.id"
                  >
                    {{ d.title }} •
                    <template v-if="d.type==='percent'">-{{ Number(d.percent_off).toFixed(2) }}%</template>
                    <template v-else-if="d.type==='fixed_amount'">-₱ {{ number(d.amount_off) }}</template>
                    <template v-else>Free shipping</template>
                    <template v-if="Number(d.min_subtotal)>0">
                      (min ₱ {{ number(d.min_subtotal) }})
                    </template>
                  </option>
                </select>
              </div>
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
          </div>

          <!-- (Voucher coming soon) -->

          <!-- Items total (kept) -->
          <div class="d-flex align-items-center justify-content-between fs-5">
            <div class="fw-semibold">Total</div>
            <div class="fw-bold">
              ₱ {{ number(finalPayableTotal) }}
            </div>
          </div>

          <!-- NEW: Shipping row -->
          <div class="d-flex align-items-center justify-content-between">
            <div class="fw-semibold">Shipping</div>
            <div class="fw-bold">₱ {{ number(effectiveShippingFee) }}</div>
          </div>

          <!-- NEW: Grand total -->
          <div class="d-flex align-items-center justify-content-between fs-5">
            <div class="fw-semibold">Grand Total</div>
            <div class="fw-bold">₱ {{ number(finalPayableGrandTotal) }}</div>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-primary" :disabled="placingOrder" @click="placeOrder">
              <span v-if="placingOrder" class="spinner-border spinner-border-sm me-2"></span>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- === NEW: Product Details Modal === -->
    <div v-if="showProductModal && productModal" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg product-modal-card">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Product Details</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeProductModal">✕</button>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <!-- Gallery -->
            <div class="col-12 col-lg-6">
              <div
                class="ratio product-modal-thumb bg-light"
                ref="productModalThumbRef"
              >
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
                  <template v-else>
                    ₱ {{ number(productModal.price) }}
                  </template>
                </div>
              </div>

              <div class="mb-3" v-if="productModal.description">
                <div class="fw-semibold mb-1">Description</div>
                <div class="text-muted">{{ productModal.description }}</div>
              </div>

              <!-- NEW: Warranty -->
              <div class="mb-3" v-if="productModal.warranty">
                <div class="fw-semibold mb-1">Warranty</div>
                <div class="text-muted">{{ productModal.warranty }}</div>
              </div>

              <!-- NEW: Specifications (JSON) -->
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
                    :disabled="productModal.stock != null ? cartQty(productModal.id) >= Number(productModal.stock) : false"
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

              <div class="mt-3 small text-muted">
                <i class="bi bi-shield-check me-1"></i>Published: {{ productModal.ispublish ? 'Yes' : 'No' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- === END Product Details Modal === -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})

type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | string | null
  ispublish: boolean
  stock?: number | null
  created_at: string
  /** NEW: additional columns */
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

/** Helpers for inserts that return IDs */
type InsertedPurchase = { id: string }

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

/* -------------------- Carousel state & controls -------------------- */
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

/* -------------------- Numbers / dates -------------------- */
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

/* -------------------- Auth helpers -------------------- */
const userId = ref<string | null>(null)
async function ensureUser() {
  const { data } = await supabase.auth.getUser()
  const id = data?.user?.id || null
  userId.value = id
  return id
}

/* -------------------- DISCOUNT: membership % -------------------- */
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

/* -------------------- Cart state -------------------- */
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

/* Cart totals + View Cart modal state */
const cartBtnRef = ref<HTMLElement | null>(null)
const router = useRouter()

const cartTotalItems = computed(() =>
  Object.values(dbCartByProduct).reduce((a, b) => a + (Number(b) || 0), 0),
)

const showCart = ref(false)
const showPlace = ref(false)
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

/* payment & balances */
const paymentMethod = ref<'cod' | 'ewallet'>('cod')
const userBalance = ref<number>(0)
/* enoughBalanceFinal moved below after shipping integration */

/* discount credits balance */
const userDiscountCredits = ref<number>(0)

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

/* ==== Discount Mode & order discount state ==== */
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
}

const discountMode = ref<'credits' | 'discount' | 'none'>('credits')

const discounts = ref<Discount[]>([])
async function loadActiveDiscounts() {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .schema('rewards')
    .from('discounts')
    .select('id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,min_subtotal,max_uses_per_user')
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
  discounts.value = (data || []) as Discount[]
}

const discountCodeInput = ref('')
const selectedDiscountId = ref<string>('')

const pickedDiscount = computed<Discount | null>(() => {
  if (resolvedDiscountByCode.value) return resolvedDiscountByCode.value
  if (selectedDiscountId.value) {
    return discounts.value.find(d => d.id === selectedDiscountId.value) ?? null
  }
  return null
})

const codeStatusText = computed(() => {
  if (discountMode.value !== 'discount') return ''
  if (resolvingCode.value) return 'Checking code…'
  if (!discountCodeInput.value && !resolvedDiscountByCode.value) return 'Enter a valid code or pick a discount.'
  if (discountCodeInput.value && !resolvedDiscountByCode.value) return 'Code not found or not active.'
  if (resolvedDiscountByCode.value) return `Code applied: ${resolvedDiscountByCode.value.title}`
  return ''
})

const codeStatusClass = computed(() => {
  if (resolvingCode.value) return 'text-muted'
  if (resolvedDiscountByCode.value) return 'text-success'
  if (discountCodeInput.value && !resolvedDiscountByCode.value) return 'text-danger'
  return 'text-muted'
})

const resolvingCode = ref(false)
const resolvedDiscountByCode = ref<Discount | null>(null)

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
      .select('id,title,description,code,type,percent_off,amount_off,starts_at,expires_at,status,is_public,min_subtotal,max_uses_per_user')
      .eq('status', 'active')
      .eq('is_public', true)
      .lte('starts_at', nowIso)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .ilike('code', raw)
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      resolvedDiscountByCode.value = data as Discount
      selectedDiscountId.value = ''
    } else {
      resolvedDiscountByCode.value = null
    }
  } finally {
    resolvingCode.value = false
  }
}

/* ---- Totals and discount math ---- */
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
  discountMode.value === 'discount' ? cartGrandTotalIgnoringCredits.value : cartGrandTotal.value
)

const totalDiscountCreditsUsedIfCreditsMode = computed(() =>
  discountMode.value === 'credits' ? totalDiscountCreditsUsed.value : 0,
)

function computeOrderDiscountAmount(base: number, d: Discount | null): number {
  if (!d) return 0
  if (base <= 0) return 0
  if (Number(d.min_subtotal || 0) > 0 && base < Number(d.min_subtotal)) return 0

  if (d.type === 'percent') {
    const pct = Math.max(0, Math.min(100, Number(d.percent_off || 0)))
    return Number((base * (pct / 100)).toFixed(2))
  }
  if (d.type === 'fixed_amount') {
    const amt = Math.max(0, Number(d.amount_off || 0))
    return Number(Math.min(amt, base).toFixed(2))
  }
  // free_shipping handled in shipping block
  return 0
}

const orderLevelDiscountAmount = computed(() => {
  if (discountMode.value !== 'discount') return 0
  const base = cartGrandTotalCreditsOff.value
  const d = pickedDiscount.value
  const amt = computeOrderDiscountAmount(base, d)
  return Number(amt.toFixed(2))
})

const orderDiscountIneligibleReason = computed(() => {
  if (discountMode.value !== 'discount') return ''
  const base = cartGrandTotalCreditsOff.value
  const d = pickedDiscount.value
  if (!d) return 'Pick a discount or apply a valid code.'
  if (Number(d.min_subtotal || 0) > 0 && base < Number(d.min_subtotal)) {
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

/* ===== SHIPPING INTEGRATION ===== */
// ==== SHIPPING FEE STATE ====
const shippingFee = ref<number>(0)
const shippingCurrency = ref<string>('PHP')
const shippingService = ref<string | undefined>(undefined)
const quotingShipping = ref(false)

const hasFreeShipping = computed(() => {
  if (discountMode.value !== 'discount') return false
  const d = pickedDiscount.value
  return !!d && d.type === 'free_shipping'
})

const effectiveShippingFee = computed(() =>
  hasFreeShipping.value ? 0 : Number(shippingFee.value || 0)
)

const finalPayableGrandTotal = computed(() =>
  Number((finalPayableTotal.value + effectiveShippingFee.value).toFixed(2))
)

// Replace/gate wallet against GRAND total (items + shipping)
const enoughBalanceFinal = computed(() => userBalance.value >= finalPayableGrandTotal.value)

// Quote shipping via Edge Function
async function fetchShippingQuote() {
  if (!shipping.value.postal_code || !shipping.value.city || !shipping.value.province || !shipping.value.address_line1) {
    shippingFee.value = 0
    shippingService.value = undefined
    return
  }
  quotingShipping.value = true
  try {
    const { data, error } = await supabase.functions.invoke('shipping_quote', {
      body: {
        address: {
          postal_code: shipping.value.postal_code,
          city: shipping.value.city,
          province: shipping.value.province,
          address_line1: shipping.value.address_line1,
          country: 'PH',
        },
        items: [
          // Optionally map real weights here
          // { weight_kg: 1, quantity: cartTotalItems.value || 1 }
        ],
        currency: 'PHP',
        fallback_flat_fee: 120,
      },
    })
    if (error) throw new Error(error.message || 'Failed to quote shipping')
    const amt = Number(data?.amount ?? 0)
    shippingFee.value = Number.isFinite(amt) ? amt : 0
    shippingCurrency.value = data?.currency || 'PHP'
    shippingService.value = data?.service_name
  } catch (e) {
    console.warn('[fetchShippingQuote]', (e as Error).message)
    shippingFee.value = 120
    shippingService.value = undefined
  } finally {
    quotingShipping.value = false
  }
}
/* ===== END SHIPPING INTEGRATION ===== */

/* === NEW: Debounced re-quote helper (additive) === */
const quoteDebounceMs = 600
let quoteTimer: number | null = null
function scheduleShippingQuote() {
  if (quoteTimer) {
    clearTimeout(quoteTimer)
    quoteTimer = null
  }
  quoteTimer = window.setTimeout(() => {
    fetchShippingQuote()
  }, quoteDebounceMs)
}

/* Place-order helpers */
const checkingOut = ref(false)
const clearingCart = ref(false)

async function openCartModal() {
  await loadCartDetails()
  showCart.value = true
}
function closeCartModal() {
  showCart.value = false
}

async function assertPerUserEligible(usedDiscountId: string, uid: string): Promise<{
  ok: boolean
  used: number
  max: number | null
  message?: string
}> {
  const d =
    discounts.value.find(x => x.id === usedDiscountId) ??
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
      message: 'We could not verify your discount usage right now. Please try again.'
    }
  }
  const used = Number(count ?? 0)
  if (used >= max) {
    return {
      ok: false,
      used,
      max,
      message: `You’ve already used this discount the maximum of ${max} time(s).`
    }
  }
  return { ok: true, used, max }
}

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
  const ids = (rows as Array<{ product_id: string; qty: number }>).map((r) => r.product_id)
  if (ids.length === 0) return

  const { data: prodRows, error: prodErr } = await supabase
    .schema('games')
    .from('products')
    .select('id,name,description,price,product_url,ispublish,stock,created_at,specifications,warranty')
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

  let remainingCredits = (discountMode.value === 'credits' && hasMemberDiscount.value)
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
    const discountedUnitMember = hasMemberDiscount.value ? discountedPrice(originalUnit) : originalUnit
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
}

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

async function onAddToCart(ev: MouseEvent, p: Product) {
  const uid = await ensureUser()
  if (!uid) {
    alert('Please log in to add items to your cart.')
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
        alert(`Stock limit reached. Only ${stockCap} item(s) available in total.`)
        return
      }
      alert(`Only ${allowedToAdd} more can be added (stock: ${stockCap}).`)
      const { error: upErr } = await supabase
        .schema('games')
        .from('cart')
        .upsert(
          { user_id: uid, product_id: p.id, qty: stockCap },
          { onConflict: 'user_id,product_id' },
        )
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
      alert(error.message)
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
      alert(error.message)
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
      .upsert(
        { user_id: uid, product_id: productId, qty: capped },
        { onConflict: 'user_id,product_id' },
      )
    if (error) {
      alert(error.message)
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

/* -------------------- Delete & Clear -------------------- */
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
    alert(error.message)
    return
  }
  delete dbCartByProduct[productId]
  await loadCartDetails()
}

async function clearCart() {
  const uid = await ensureUser()
  if (!uid) return
  if (!confirm('Clear all items from your cart?')) return
  clearingCart.value = true
  try {
    const { error } = await supabase.schema('games').from('cart').delete().eq('user_id', uid)

    if (error) {
      alert(error.message)
      return
    }
    for (const k of Object.keys(dbCartByProduct)) delete dbCartByProduct[k]
    cartItems.value = []
  } finally {
    clearingCart.value = false
  }
}

/* -------------------- Shipping state -------------------- */
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

type UsersRow = {
  phone_number: string | null
  address: string | null
  balance: number | null
  membership_id?: string | null
  discount_credits?: number | null
}

function buildAddressString(s: ShippingRow): string {
  return [s.address_line1, s.barangay, s.city, s.province, s.postal_code].filter(Boolean).join(', ')
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

  shippingLoaded.value = true

  if (showCart.value || showPlace.value) await loadCartDetails()
}
function openShippingModal() {
  showShipping.value = true
  // NEW: quote immediately when the modal opens
  scheduleShippingQuote()
}
function closeShippingModal() {
  showShipping.value = false
}

async function saveShipping() {
  const uid = await ensureUser()
  if (!uid) {
    alert('Please log in to save your delivery details.')
    return
  }
  savingShipping.value = true
  try {
    const payload = {
      phone_number: shipping.value.phone || null,
      address: buildAddressString(shipping.value) || null,
    }
    const { error } = await supabase.from('users').update(payload).eq('id', uid)
    if (error) {
      console.error('saveShipping error', error.message)
      alert(error.message)
      return
    }
    await loadShipping()
    // Re-quote shipping if modal is open
    if (showPlace.value) await fetchShippingQuote()
    // NEW: also schedule a re-quote (debounced) even if only the shipping modal is open
    scheduleShippingQuote()
  } finally {
    savingShipping.value = false
  }
}

/* -------------------- Place Order flow -------------------- */
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
  // NEW: quote shipping on open
  fetchShippingQuote()
}
function closePlaceOrder() {
  showPlace.value = false
}

async function placeOrder() {
  const uid = await ensureUser()
  if (!uid) {
    alert('Please log in to place the order.')
    return
  }
  if (cartItems.value.length === 0) {
    alert('Your cart is empty.')
    return
  }
  if (!hasShipping.value) {
    alert('Please complete your delivery details first.')
    return
  }

  if (discountMode.value === 'discount') {
    if (!pickedDiscount.value) {
      alert('Please apply a valid discount code or select a discount.')
      return
    }
    if (orderDiscountIneligibleReason.value) {
      alert(orderDiscountIneligibleReason.value)
      return
    }
    const usedDiscountId =
      (resolvedDiscountByCode.value?.id?.trim()) ||
      (selectedDiscountId.value?.trim() || '')

    if (usedDiscountId) {
      const uidNow = await ensureUser()
      if (!uidNow) return
      const { ok, message } = await assertPerUserEligible(usedDiscountId, uidNow)
      if (!ok) {
        alert(message || 'You have reached the maximum number of uses for this discount.')
        return
      }
    }
  }

  placingOrder.value = true
  try {
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

    await loadCartDetails()

    // --- Figure out totals (items) ---
    let finalTotal = 0
    let orderDiscountAmt = 0

    if (discountMode.value === 'discount') {
      const base = cartGrandTotalIgnoringCredits.value
      let d: Discount | null = null
      if (selectedDiscountId.value) {
        d = discounts.value.find(dd => dd.id === selectedDiscountId.value) ?? null
      } else if (resolvedDiscountByCode.value) {
        d = resolvedDiscountByCode.value
      }
      orderDiscountAmt = computeOrderDiscountAmount(base, d)
      finalTotal = Number(Math.max(0, base - orderDiscountAmt).toFixed(2))
    } else {
      finalTotal = cartGrandTotal.value
      orderDiscountAmt = 0
    }

    // ✅ Include shipping for wallet gating and transactions
    const grandTotal = Number((finalTotal + effectiveShippingFee.value).toFixed(2))

    const isEwallet = paymentMethod.value === 'ewallet'
    const purchaseStatus = isEwallet ? 'to ship' : 'to pay'
    const totalToDeduct = isEwallet ? grandTotal : 0

    if (isEwallet && freshBalance < totalToDeduct) {
      alert('Insufficient balance for E-Wallet. Please choose Cash on Delivery or top up.')
      return
    }

    const batchReference = genReference('PUR')

    if (isEwallet && totalToDeduct > 0) {
      const newBalance = Number((freshBalance - totalToDeduct).toFixed(2))
      const { error: balErr } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', uid)
      if (balErr) {
        alert('Failed to deduct balance: ' + balErr.message)
        return
      }
      userBalance.value = newBalance
    }

    type LineDraft = {
      p: Product
      quantity: number
      unitBeforeOrder: number
      lineBeforeOrder: number
      unitFinal: number
    }

    const lines: LineDraft[] = []
    if (discountMode.value === 'discount') {
      let baseSum = 0
      for (const it of cartItems.value) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        const unitBefore = Number(it.originalUnit || 0)
        const lineBefore = unitBefore * qty
        baseSum += lineBefore
        lines.push({
          p: it.product,
          quantity: qty,
          unitBeforeOrder: unitBefore,
          lineBeforeOrder: lineBefore,
          unitFinal: unitBefore,
        })
      }
      if (orderDiscountAmt > 0 && baseSum > 0) {
        for (const ln of lines) {
          const share = Number(((ln.lineBeforeOrder / baseSum) * orderDiscountAmt).toFixed(2))
          const perUnitShare = Number((share / ln.quantity).toFixed(2))
          ln.unitFinal = Number(Math.max(0, ln.unitBeforeOrder - perUnitShare).toFixed(2))
        }
      }
    } else {
      for (const it of cartItems.value) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        lines.push({
          p: it.product,
          quantity: qty,
          unitBeforeOrder: Number(it.unit),
          lineBeforeOrder: Number(it.unit) * qty,
          unitFinal: Number(it.unit),
        })
      }
    }

    let firstPurchaseId: string | null = null
    for (const ln of lines) {
      const { data: inserted, error: insErr } = await supabase
        .schema('games')
        .from('purchases')
        .insert([{
          user_id: uid,
          product_id: ln.p.id,
          reference_number: batchReference,
          qty: ln.quantity,
          modeofpayment: paymentMethod.value,
          status: purchaseStatus,
          discounted_price: ln.unitFinal,
        } as any])
        .select('id')
        .single()

      if (insErr) {
        console.error('[placeOrder] purchases insert error:', insErr.message)
        alert('Failed to place order: ' + insErr.message)
        return
      }
      const purchaseId = (inserted as InsertedPurchase).id
      if (!firstPurchaseId) firstPurchaseId = purchaseId
    }

    if (isEwallet) {
      const { error: txnErr } = await supabase
        .schema('ewallet')
        .from('order_transactions')
        .insert([{
          reference_number: batchReference,
          purchase_id: firstPurchaseId ?? null,
          total_amount: Number(totalToDeduct.toFixed(2)),
        } as any])

      if (txnErr) {
        console.error('[order_transactions insert failed]', txnErr.message)
        alert('Failed to create transaction record: ' + txnErr.message)
        return
      }
    }

    // increment redemptions_count (RPC preferred)
    try {
      if (discountMode.value === 'discount') {
        const usedDiscountId =
          (resolvedDiscountByCode.value?.id?.trim()) ||
          (selectedDiscountId.value?.trim() || '')
        if (usedDiscountId) {
          const { data: ok, error: redErr } = await supabase
            .rpc('inc_discount_redemption', { p_discount_id: usedDiscountId })
          if (redErr || ok === null) {
            const { data: dRow, error: selErr } = await supabase
              .schema('rewards')
              .from('discounts')
              .select('id, redemptions_count')
              .eq('id', usedDiscountId)
              .maybeSingle()
            if (!selErr && dRow?.id) {
              const nextCount = Number(dRow.redemptions_count ?? 0) + 1
              const { error: updErr } = await supabase
                .schema('rewards')
                .from('discounts')
                .update({ redemptions_count: nextCount })
                .eq('id', usedDiscountId)
              if (updErr) console.warn('[discounts update failed]', updErr.message)
            } else if (selErr) {
              console.warn('[discounts select failed]', selErr.message)
            }
          }
        }
      }
    } catch (e) {
      console.warn('[inc_discount_redemption] exception:', e)
    }

    // create discount_redemptions row
    try {
      if (discountMode.value === 'discount') {
        const usedDiscountId =
          (resolvedDiscountByCode.value?.id?.trim()) ||
          (selectedDiscountId.value?.trim() || '')
        const redeemedAmount = Number(orderDiscountAmt || 0)
        if (usedDiscountId && redeemedAmount > 0 && firstPurchaseId) {
          const { error: redInsErr } = await supabase
            .schema('rewards')
            .from('discount_redemptions')
            .insert([{
              discount_id: usedDiscountId,
              user_id: uid,
              purchase_id: firstPurchaseId,
              redeemed_amount: redeemedAmount,
              currency: 'PHP',
            }])
          if (redInsErr) console.warn('[discount_redemptions insert failed]', redInsErr.message)
        }
      }
    } catch (e) {
      console.warn('[discount_redemptions insert exception]', e)
    }

    // ===== NEW: persist shipping charge =====
    // ===== NEW: persist shipping charge =====
try {
  const addrSnap = buildAddressString(shipping.value)
  const { error: shipErr } = await supabase
    .schema('games')
    .from('shipping_charges')
    .insert([{
      reference_number: batchReference,
      amount: Number(effectiveShippingFee.value.toFixed(2)),
      currency: shippingCurrency.value || 'PHP',
      address_snapshot: `${shipping.value.phone} • ${addrSnap}`,
      purchase_id: firstPurchaseId, // ✅ NEW
    }])
  if (shipErr) console.warn('[shipping_charges insert failed]', shipErr.message)
} catch (e) {
  console.warn('[shipping_charges insert exception]', e)
}


    // ==== NEW: Push the order to AfterShip Commerce ====
try {
  const discountTotalForAftership =
    (discountMode.value === 'discount' ? orderDiscountAmt : 0) +
    (discountMode.value === 'credits'  ? totalDiscountCreditsUsed.value : 0);

  await pushOrderToAfterShip({
    batchReference,
    lines,                                  // the LineDraft[] you already built earlier
    finalSubtotal: finalTotal,              // items after discounts, before shipping
    shippingFee: effectiveShippingFee.value,
    discountTotal: discountTotalForAftership,
    shipping: shipping.value,
    isPaid: paymentMethod.value === 'ewallet',
    currency: 'PHP',
    // Optional:
    customerName: null,
    customerEmail: null,
  });
} catch (e) {
  console.warn('[AfterShip push failed]', e);
}


    // Discount credits deduction path
    if (discountMode.value === 'credits') {
      let totalDiscountCreditsToDeduct = 0
      for (const it of cartItems.value) {
        const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
        const diff = Math.max(0, Number(it.originalUnit) - Number(it.unit))
        totalDiscountCreditsToDeduct += diff * qty
      }
      totalDiscountCreditsToDeduct = Number(totalDiscountCreditsToDeduct.toFixed(2))

      if (totalDiscountCreditsToDeduct > 0) {
        const { data: recentPurchases } = await supabase
          .schema('games')
          .from('purchases')
          .select('id,product_id,qty,discounted_price')
          .eq('reference_number', batchReference)

        const receiptsPayload: Array<{ purchase_id: string; amount_discounted: number; reference_number: string }> = []
        if (recentPurchases && Array.isArray(recentPurchases)) {
          const byPid = new Map<string, { unitOriginal: number; qty: number; unitFinal: number }>()
          for (const it of cartItems.value) {
            byPid.set(it.product.id, {
              unitOriginal: Number(it.originalUnit),
              unitFinal: Number(it.unit),
              qty: Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1),
            })
          }
          for (const pr of recentPurchases) {
            const info = byPid.get(pr.product_id)
            if (!info) continue
            const perUnitDiff = Math.max(0, info.unitOriginal - info.unitFinal)
            const usedForThis = Number((perUnitDiff * info.qty).toFixed(2))
            if (usedForThis > 0) {
              receiptsPayload.push({
                purchase_id: pr.id,
                amount_discounted: usedForThis,
                reference_number: batchReference,
              })
            }
          }
        }

        if (receiptsPayload.length > 0) {
          const { error: recErr } = await supabase
            .schema('ewallet')
            .from('discount_credits_receipt')
            .insert(receiptsPayload as any)
          if (recErr) {
            console.error('[discount_credits_receipt insert failed]', recErr.message)
            alert('Failed to create discount credits receipt: ' + recErr.message)
            return
          }
        }

        const { data: recheckUser } = await supabase
          .from('users')
          .select('discount_credits')
          .eq('id', uid)
          .maybeSingle()

        const currentCredits = Number(recheckUser?.discount_credits ?? 0)
        const newDcBalance = Math.max(0, Number((currentCredits - totalDiscountCreditsToDeduct).toFixed(2)))

        const { error: dcErr } = await supabase
          .from('users')
          .update({ discount_credits: newDcBalance })
          .eq('id', uid)
        if (dcErr) {
          console.error('[users.discount_credits update failed]', dcErr.message)
          alert('Failed to deduct discount credits: ' + dcErr.message)
          return
        }
        userDiscountCredits.value = newDcBalance
      }
    }

    // Decrement stock
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

    await supabase.schema('games').from('cart').delete().eq('user_id', uid)
    for (const k of Object.keys(dbCartByProduct)) delete dbCartByProduct[k]
    cartItems.value = []

    closePlaceOrder()
    await fetchProducts()

    if (isEwallet) {
      alert(
        'Payment successful! Your items are now set **to ship**. You’ll receive a confirmation shortly.',
      )
    } else {
      alert(
        'Order placed! Status is **to pay**. Please prepare payment upon delivery or wait for admin approval.',
      )
    }
  } finally {
    placingOrder.value = false
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
    .select('id,name,description,price,product_url,ispublish,stock,created_at,specifications,warranty', { count: 'exact' })
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

/* -------------------- Realtime bindings -------------------- */
let productChannel: ReturnType<typeof supabase.channel> | null = null
let cartChannel: ReturnType<typeof supabase.channel> | null = null
let usersChannel: ReturnType<typeof supabase.channel> | null = null

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

onMounted(async () => {
  loadStagedFromLocal()
  await Promise.all([fetchProducts(), loadCart(), loadShipping()])
  bindProductsRealtime()
  await bindCartRealtime()
  await bindUsersRealtime()
})

onUnmounted(() => {
  if (productChannel) supabase.removeChannel(productChannel)
  if (cartChannel) supabase.removeChannel(cartChannel)
  if (usersChannel) supabase.removeChannel(usersChannel)
})

watch(pageSize, () => goToPage(1))

// Keep previews in sync when user toggles discount mode
watch(discountMode, async () => {
  await loadCartDetails()
  if (showPlace.value) await fetchShippingQuote()
})

// Keep code/dropdown mutually exclusive
watch(selectedDiscountId, (v) => {
  if (v) {
    discountCodeInput.value = ''
    resolvedDiscountByCode.value = null
  }
})
watch(resolvedDiscountByCode, (v) => {
  if (v) selectedDiscountId.value = ''
})

// NEW: re-quote shipping when address or free-shipping context changes (debounced)
// (Triggers if Place Order modal OR Shipping modal is open)
watch(
  () => [shipping.value.postal_code, shipping.value.city, shipping.value.province, shipping.value.address_line1],
  () => {
    if (showPlace.value || showShipping.value) scheduleShippingQuote()
  }
)
// Also re-quote when discount mode or selected discount affects free-shipping logic
watch([discountMode, selectedDiscountId, resolvedDiscountByCode], () => {
  if (showPlace.value || showShipping.value) scheduleShippingQuote()
})

// NEW: when shipping modal toggles on, schedule an immediate quote
watch(showShipping, (isOpen) => {
  if (isOpen) scheduleShippingQuote()
})

/* ==== NEW: AfterShip push helper ==== */
async function pushOrderToAfterShip(args: {
  batchReference: string;
  lines: Array<{
    p: Product;
    quantity: number;
    unitBeforeOrder: number; // original unit price
    lineBeforeOrder: number; // original unit * quantity
    unitFinal: number;       // final unit price after per-line/order discounts
  }>;
  finalSubtotal: number;          // items total AFTER discounts, BEFORE shipping
  shippingFee: number;            // effectiveShippingFee.value
  discountTotal: number;          // full order discount (order-level + credits)
  shipping: ShippingRow;
  isPaid: boolean;                // paymentMethod === 'ewallet'
  currency?: string;              // default 'PHP'
  customerName?: string | null;   // optional
  customerEmail?: string | null;  // optional
}) {
  const cur = args.currency || 'PHP';

  const items = args.lines.map((ln, idx) => {
    const perLineDiscount = Math.max(0, (ln.unitBeforeOrder - ln.unitFinal) * ln.quantity);
    return {
      id: `li_${idx + 1}`,
      product_title: ln.p.name,
      sku: ln.p.id,
      quantity: ln.quantity,
      unit_price: { currency: cur, amount: ln.unitFinal.toFixed(2) },
      discount:   { currency: cur, amount: perLineDiscount.toFixed(2) },
    };
  });

  const order = {
    number: args.batchReference,
    currency: cur,
    status: 'open',
    financial_status: args.isPaid ? 'paid' : 'unpaid',
    fulfillment_status: 'unfulfilled',
    subtotal:       { currency: cur, amount: args.finalSubtotal.toFixed(2) },
    shipping_total: { currency: cur, amount: args.shippingFee.toFixed(2) },
    discount_total: { currency: cur, amount: Math.max(0, args.discountTotal).toFixed(2) },
    order_total:    { currency: cur, amount: (args.finalSubtotal + args.shippingFee).toFixed(2) },
    items,
    shipping_address: {
      name: args.customerName ?? null,
      phone: args.shipping.phone || null,
      address1: args.shipping.address_line1 || null,
      city: args.shipping.city || null,
      region: args.shipping.province || null,
      postal_code: args.shipping.postal_code || null,
      country_region: 'PHL', // Philippines ISO-3166 alpha-3
    },
    customer: {
      name: args.customerName ?? null,
      email: args.customerEmail ?? null,
      phone: args.shipping.phone || null,
    },
  };

  const { data, error } = await supabase.functions.invoke('aftership_create_order', {
    body: { order },
  });

  if (error) {
    console.warn('[aftership_create_order] invoke error:', error.message);
    return null;
  }
  if (!data?.ok) {
    console.warn('[aftership_create_order] non-ok:', data);
  }
  return data;
}

/* ===== NEW: Product Details Modal State & Methods ===== */
const showProductModal = ref(false)
const productModal = ref<Product | null>(null)
const productModalThumbRef = ref<HTMLElement | null>(null)

function openProductModal(p: Product) {
  productModal.value = p
  // ensure images are signed/populated
  productImages(p)
  // reset slide to 0
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
  // If original onAddToCart couldn't find a product-card, animate from the modal image
  const el = productModalThumbRef.value
  if (el) flyToCart(el)
}

/* ==== NEW: Specifications helpers ==== */
function parseSpecs(raw: unknown): Record<string, any> {
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try {
      const obj = JSON.parse(raw)
      return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj as Record<string, any> : {}
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
</script>

<style scoped>
/* Base ratio for cards */
.product-thumb.ratio { 
  --bs-aspect-ratio: 75%; 
}
/* current is square (100%). Make it shorter on smaller screens */
@media (max-width: 1400px) {
  .product-thumb.ratio { 
    --bs-aspect-ratio: 100%; 
  } /* ~4:3 */
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
.product-card--clickable { cursor: pointer; }

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

.cart-pulse {
  animation: cartPulse 0.25s ease;
}
@keyframes cartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

.added-burst {
  animation: addedGlow 0.45s ease;
}
@keyframes addedGlow {
  0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
  40% { box-shadow: 0 8px 28px rgba(25, 135, 84, 0.28); }
  100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
}

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

.carousel-thumb {
  position: absolute;
  inset: 0;
  border-top-left-radius: var(--card-radius);
  border-top-right-radius: var(--card-radius);
  overflow: hidden;
  background: #f6f7fb;
}
.carousel-thumb .slides { width: 100%; height: 100%; position: relative; }
.slide-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  opacity: 0; transform: scale(1.02);
  transition: opacity 0.24s ease, transform 0.24s ease;
}
.slide-img--active { opacity: 1; transform: scale(1); }
.carousel-thumb .dots {
  position: absolute; top: 8px; inset-inline: 0;
  display: flex; justify-content: center; gap: 6px;
}
.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
.dot.active { background: #fff; border-color: rgba(0, 0, 0, 0.35); }
.carousel-thumb .nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border-radius: 50%; border: 0;
  background: rgba(255, 255, 255, 0.85);
  display: grid; place-items: center; line-height: 1; cursor: pointer; z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.carousel-thumb .nav.left { left: 8px; }
.carousel-thumb .nav.right { right: 8px; }
.carousel-thumb .nav:hover { background: #fff; }
@media (hover: none) { .carousel-thumb .nav { display: none; } }

.qty-field.qty-bump { animation: qtyBump 0.22s ease; }
@keyframes qtyBump {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}

.cart-added-badge {
  background: #198754; color: #fff; font-weight: 700;
  padding: 2px 8px; border-radius: 999px;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 2200;
}
.cart-added-badge--show { opacity: 1; transform: translateY(-8px); }

/* === NEW: Product modal visuals === */
.product-modal-card {
  width: min(980px, 96vw);
}
.product-modal-thumb.ratio {
  --bs-aspect-ratio: 100%;
  border-radius: 12px;
  overflow: hidden;
}
.product-modal-card .carousel-thumb {
  border-radius: 12px;
}
.opacity-50 { opacity: 0.5; }
.pe-none { pointer-events: none; }

/* NEW: Specifications table styling */
.specs-table th {
  width: 40%;
  font-weight: 600;
  white-space: nowrap;
  padding-right: 1rem;
}
.specs-table td {
  word-break: break-word;
}
</style>
