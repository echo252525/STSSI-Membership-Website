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
                v-if="cartTotalItemsDisplay > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
                >{{ cartTotalItemsDisplay }}</span
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
              <button class="btn btn-sm btn-outline-secondary" @click="loadPendingOrders" title="Refresh">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div class="card-body p-0">
              <div v-if="pendingGroups.length === 0" class="p-3 text-muted small">
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
                        <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
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
                      {{ g.itemsCount }} item{{ g.itemsCount>1?'s':'' }}
                    </span>
                  </div>

                  <!-- admin shipping & button -->
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="small">
                      Admin shipping fee:
                      <strong v-if="g.highestShippingFee > 0">₱ {{ number(g.highestShippingFee) }}</strong>
                      <span v-else class="text-warning">awaiting…</span>
                    </div>
                    <button
                      class="btn btn-sm btn-primary"
                      :disabled="placingOrder || g.itemsCount===0"
                      @click="openPlacePending(g.ref)"
                      title="Review & Place"
                    >
                      Review & Place
                    </button>
                  </div>

                  <div class="fw-semibold">
    ₱ {{ number((g.displayTotal ?? (g.itemsTotal + (g.highestShippingFee > 0 ? g.highestShippingFee : 0)))) }}
    <span v-if="g.highestShippingFee === 0" class="text-muted small">(+ shipping)</span>
  </div>

                </li>
              </ul>
            </div>
          </div>
          <!-- /Pending Orders List -->
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
                    <!-- Price display with membership discount & credits check -->
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
                  No payment is deducted at this step. After admin sets the shipping fee, you can place the order.
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
              <div class="small text-muted mt-2">
                Discounts are finalized when you place the order after the shipping fee is set.
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
                We only deduct Discount Credits when you place the order (after the shipping fee is set).
              </div>
              <div
                v-if="discountMode==='credits' && insufficientDiscountCredits"
                class="alert alert-warning mt-3 mb-0 py-2 small"
                role="alert"
              >
                Some items might not get a membership discount if credits are insufficient. This will be finalized when placing the order.
              </div>
            </div>

            <!-- Order Discount (code or select) -->
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

            <!-- Items total -->
            <div class="d-flex align-items-center justify-content-between fs-5">
              <div class="fw-semibold">Items Total</div>
              <div class="fw-bold">
                ₱ {{ number(finalPayableTotal) }}
              </div>
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
              <div v-if="paymentMethod==='ewallet'" class="text-muted small mt-1">
                Balance: ₱ {{ number(userBalance) }}
              </div>
              <div v-if="paymentMethod==='ewallet' && !enoughBalanceForOrder" class="text-danger small mt-1">
                Insufficient E-Wallet balance for order total.
              </div>
            </div>

            <!-- Discount (READ-ONLY) -->
            <div class="border rounded-3 p-3">
              <div class="fw-semibold mb-2"><i class="bi bi-percent me-2"></i>Discount</div>

              <!-- Credits mode summary -->
              <template v-if="discountMode==='credits'">
                <div class="small">
                  Membership discount via Discount Credits
                  <span class="text-muted">
                    (estimated used: ₱ {{ number(totalDiscountCreditsUsedIfCreditsMode) }})
                  </span>
                </div>
              </template>

              <!-- Order-level discount summary -->
              <template v-else-if="discountMode==='discount'">
                <div class="small">
                  <div class="mb-1">
                    <strong>Applied:</strong>
                    <template v-if="resolvedDiscountByCode">
                      {{ resolvedDiscountByCode.title }}
                    </template>
                    <template v-else-if="selectedDiscountId">
                      {{ discounts.find(d => d.id === selectedDiscountId)?.title || '—' }}
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
          <div class="small mt-1">
            Qty: {{ it.qty }}
          </div>
        </div>
      </div>
    </div>
  </div>

            <!-- Shipping Fee (display only) -->
            <div class="border rounded-3 p-3 bg-light-subtle">
              <div class="d-flex align-items-center justify-content-between">
                <div class="fw-semibold"><i class="bi bi-truck-flatbed me-2"></i>Admin Shipping Fee</div>
                <div class="fs-5">
  <strong v-if="pendingHasFreeShipping">Free</strong>
  <strong v-else-if="pendingHighestShippingFee>0">₱ {{ number(pendingHighestShippingFee) }}</strong>
  <span v-else class="text-warning">awaiting…</span>
</div>

              </div>
              <div class="small text-muted mt-1">
                We display the <em>highest</em> shipping fee among items in this reference. This fee is now included in your order total.
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
                :disabled="placingOrder || (!pendingHasFreeShipping && pendingHighestShippingFee <= 0) || (paymentMethod==='ewallet' && !enoughBalanceForOrder)"

                @click="placePendingOrder"
                title="Place Order (enabled when admin has set shipping fee)"
              >
                <span v-if="placingOrder" class="spinner-border spinner-border-sm me-2"></span>
                Place Order
              </button>
            </div>
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
                    <button class="nav right" @click.stop="nextSlide(productModal.id)" aria-label="Next image">
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
      <!-- END Product Details Modal -->
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
  /* Hide the badge while the review & place (pending) modal is open */
  const cartTotalItemsDisplay = computed(() => (showPendingPlace.value ? 0 : cartTotalItems.value))

  const showCart = ref(false)
  const showPlace = ref(false)             // Request Order modal
  const showPendingPlace = ref(false)      // Place Pending Order modal
  const inPendingContext = ref(false)      // prevents polluting cart count while reviewing pending
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
/* ---- E-Wallet atomic charge helper (uses RPC) ---- */
async function chargeEwalletAtomically(amountPeso: number, batchRef: string, uid: string): Promise<number> {
  const total = Number(Math.max(0, amountPeso).toFixed(2))
  if (!(total > 0)) return userBalance.value

  const { data, error } = await supabase
  .schema('ewallet')
  .rpc('apply_tx_pesos', {
    p_user_id: uid,
    p_amount_peso: -total, // debit (negative)
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

  /* payment & balances */
  const paymentMethod = ref<'cod' | 'ewallet'>('cod')
  const userBalance = ref<number>(0)

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
    // free_shipping ignored for items
    return 0
  }

  /** NEW: when reviewing a pending order, use the recorded redeemed_amount (from DB) if present */
  const recordedOrderDiscountAmount = ref<number | null>(null)

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
    // when reviewing pending with recorded amount, just display; don't block
    if (showPendingPlace.value && recordedOrderDiscountAmount.value != null) return ''
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

  /* Wallet gating */
  const enoughBalanceForItems = computed(() => userBalance.value >= finalPayableTotal.value)
  /* NEW: consider shipping fee when in pending placement */
  const enoughBalanceForOrder = computed(() =>
  userBalance.value >= (finalPayableTotal.value + (pendingHasFreeShipping.value ? 0 : pendingHighestShippingFee.value))
)


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

  /* -------------------- Shipping state (address only, no fees at request time) -------------------- */
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

  /* Shipping modal toggles */
  function openShippingModal() {
    showShipping.value = true
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
    } finally {
      savingShipping.value = false
    }
  }

  /* -------------------- Request Order (PENDING creation) -------------------- */
  function genReference(prefix = 'REF'): string {
    const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
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

  /** Place Order: create PENDING purchases; if order-discount picked, record redemption NOW */
  async function placeOrder() {
    const uid = await ensureUser()
    if (!uid) {
      alert('Please log in to request the order.')
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

    // If user chose order-level discount, validate and pre-compute discount amount
    let usedDiscountId: string | null = null
    let orderDiscountAmtAtRequest = 0
    if (discountMode.value === 'discount') {
      const disc = pickedDiscount.value
      if (!disc) {
        alert('Please apply a valid discount code or select a discount.')
        return
      }
      usedDiscountId = disc.id
      const { ok, message } = await assertPerUserEligible(usedDiscountId, uid)
      if (!ok) {
        alert(message || 'You have reached the maximum number of uses for this discount.')
        return
      }
      // Base excludes credits; order-level discount applies on original units
      const base = cartGrandTotalCreditsOff.value
      orderDiscountAmtAtRequest = computeOrderDiscountAmount(base, disc)
      if (orderDiscountAmtAtRequest <= 0) {
        alert('This discount doesn’t apply to your current subtotal.')
        return
      }
    }

    placingOrder.value = true
    const insertedIds: string[] = []
    try {
      await saveShipping()

      // Refresh balances
      const { data: freshUser } = await supabase
        .from('users')
        .select('balance, discount_credits, membership_id')
        .eq('id', uid)
        .maybeSingle()

      userBalance.value = Number(freshUser?.balance ?? 0)
      userDiscountCredits.value = Number(freshUser?.discount_credits ?? 0)

      await loadCartDetails()

      const batchReference = genReference('REQ')

      // Build lines with credits-applied unit pricing right now (if mode === 'credits')
  type RequestLine = {
    p: Product
    quantity: number
    unitOriginal: number
    unitFinal: number
  }

  let remainingCreditsAtRequest =
    (discountMode.value === 'credits' && hasMemberDiscount.value)
      ? Number(userDiscountCredits.value || 0)
      : 0

  const lines: RequestLine[] = []

  for (const it of cartItems.value) {
    const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
    const unitOriginal = Number(it.originalUnit || 0)

    let unitFinal = unitOriginal

    if (discountMode.value === 'credits' && hasMemberDiscount.value) {
      const memberUnit = discountedPrice(unitOriginal) // applies % off
      const needPerUnit = Math.max(0, unitOriginal - memberUnit)
      const needForItem = Number((needPerUnit * qty).toFixed(2))

      // Only apply member discounted unit if credits can fully cover this item's discount need
      if (needPerUnit > 0 && remainingCreditsAtRequest >= needForItem) {
        unitFinal = memberUnit
        remainingCreditsAtRequest = Number((remainingCreditsAtRequest - needForItem).toFixed(2))
      }
    }

    lines.push({ p: it.product, quantity: qty, unitOriginal, unitFinal })
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
        status: 'pending',
        // IMPORTANT: store the credits-adjusted unit NOW if we're in credits mode
        // (otherwise this equals unitOriginal)
        discounted_price: Number(ln.unitFinal.toFixed(2)),
        shipping_fee: 0
      } as any])
      .select('id')
      .single()

    if (insErr) {
      console.error('[requestOrder] purchases insert error:', insErr.message)
      alert('Failed to request order: ' + insErr.message)
      return
    }
    const purchaseId = (inserted as InsertedPurchase).id
    insertedIds.push(purchaseId)
    if (!firstPurchaseId) firstPurchaseId = purchaseId
  }


      // If order-level discount picked, create redemption record now
      if (discountMode.value === 'discount' && usedDiscountId && firstPurchaseId) {
        const { error: redInsErr } = await supabase
          .schema('rewards')
          .from('discount_redemptions')
          .insert([{
            discount_id: usedDiscountId,
            user_id: uid,
            purchase_id: firstPurchaseId,
            redeemed_amount: Number(orderDiscountAmtAtRequest.toFixed(2)),
            currency: 'PHP',
          }])

        if (redInsErr) {
          console.error('[discount_redemptions insert failed at request time]', redInsErr.message)
          // cleanup: remove the just-inserted pending purchases for this batch
          await supabase.schema('games').from('purchases').delete().in('id', insertedIds)
          alert('Failed to apply discount to your request: ' + redInsErr.message)
          return
        }

        // Try to increment redemption counter (best-effort)
        const { data: ok, error: redErr } = await supabase.rpc('inc_discount_redemption', { p_discount_id: usedDiscountId })
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

      // clear cart
      await supabase.schema('games').from('cart').delete().eq('user_id', uid)
      for (const k of Object.keys(dbCartByProduct)) delete dbCartByProduct[k]
      cartItems.value = []

      closePlaceOrder()
      await fetchProducts()
      await loadPendingOrders()

      alert('Order requested! Status is now pending. Once admin sets the shipping fee, you can place the order.')
    } finally {
      placingOrder.value = false
    }
  }

  /* -------------------- Pending Orders list & placement -------------------- */
  const pendingHasFreeShipping = ref(false)

  const pendingGroups = ref<Array<{
    ref: string
    created_at: string
    itemsCount: number
    totalQty: number
    highestShippingFee: number
    itemsTotal: number
    sampleName: string
    sampleImageUrl: string | null
    displayTotal?: number
  }>>([])

  const pendingRefNumber = ref<string | null>(null)
  const pendingHighestShippingFee = ref<number>(0)
  const pendingPurchases = ref<PurchaseRow[]>([])

  /* helper: resolve a single product's first image (signed if needed) */
  async function getAnyPurchaseIdForRef(ref: string, uid: string): Promise<string | null> {
  const { data, error } = await supabase
    .schema('games')
    .from('purchases')
    .select('id')
    .eq('user_id', uid)
    .eq('reference_number', ref)
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as { id: string } | null)?.id ?? null;
}

  async function resolveFirstImageUrl(prod: { id: string, product_url: string[] | string | null }): Promise<string | null> {
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
    const uid = await ensureUser()
    if (!uid) return

    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select('id, product_id, qty, reference_number, created_at, shipping_fee, status, discounted_price, is_free_shipping')

      .eq('user_id', uid)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[loadPendingOrders] error:', error.message)
      pendingGroups.value = []
      return
    }

    const rows = (data || []) as PurchaseRow[]

    // Map by reference and also map purchaseId->ref for redemption lookup
    const rowsByRef = new Map<string, PurchaseRow[]>()
    const purchaseIdToRef = new Map<string, string>()

    const aggregate = new Map<string, {
      created_at: string
      itemsCount: number
      totalQty: number
      highestShippingFee: number
      itemsTotal: number
      firstProductId?: string
    }>()

    for (const r of rows) {
      const g = aggregate.get(r.reference_number) || {
        created_at: r.created_at,
        itemsCount: 0,
        totalQty: 0,
        highestShippingFee: 0,
        itemsTotal: 0,
        firstProductId: undefined
      }
      if (!g.firstProductId) g.firstProductId = r.product_id
      g.created_at = g.created_at || r.created_at
      g.itemsCount += 1
      g.totalQty += Number(r.qty || 0)
      const sf = Number(r.shipping_fee ?? 0)
      if (sf > g.highestShippingFee) g.highestShippingFee = sf
      const unit = Number(r.discounted_price ?? 0) // snapshot original unit at request time
      g.itemsTotal += unit * Number(r.qty || 0)
      aggregate.set(r.reference_number, g)

      const bucket = rowsByRef.get(r.reference_number) ?? []
      bucket.push(r)
      rowsByRef.set(r.reference_number, bucket)

      purchaseIdToRef.set(r.id, r.reference_number)
    }

    // fetch sample products for thumbnails/names
    const sampleIds = Array.from(
      new Set(Array.from(aggregate.values()).map(v => v.firstProductId).filter(Boolean))
    ) as string[]

    const prodMap = new Map<string, { name: string, product_url: string[] | string | null }>()
    if (sampleIds.length > 0) {
      const { data: prods } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,product_url')
        .in('id', sampleIds)
      for (const p of (prods || []) as Array<{ id: string, name: string, product_url: string[] | string | null }>) {
        prodMap.set(p.id, { name: p.name, product_url: p.product_url })
      }
    }

    // Build base groups first
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
          product_url: p.product_url
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
        sampleImageUrl
      })
    }

    // Fetch any recorded redemptions for these purchases, group by ref
    const allPurchaseIds = rows.map(r => r.id)
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

    // Hydrate displayTotal using recorded redemption (if any) + shipping
    for (const grp of groups) {
      const red = redemptionSumByRef.get(grp.ref) ?? 0
      const fee = Number(grp.highestShippingFee || 0)
      const base = grp.itemsTotal
      const itemsAfter = Number(Math.max(0, base - red).toFixed(2))
      grp.displayTotal = Number((itemsAfter + (fee > 0 ? fee : 0)).toFixed(2))
    }

    pendingGroups.value = groups
  }


  async function openPlacePending(refNumber: string) {
    const uid = await ensureUser()
    if (!uid) return

    // Load purchases for this reference
    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select('id, product_id, qty, reference_number, created_at, shipping_fee, status, discounted_price, modeofpayment, is_free_shipping')

      .eq('user_id', uid)
      .eq('reference_number', refNumber)
      .eq('status', 'pending')
    

    inPendingContext.value = true
    pendingPurchases.value = data as PurchaseRow[]
    pendingRefNumber.value = refNumber
    pendingHighestShippingFee.value = pendingPurchases.value.reduce((mx, r) => Math.max(mx, Number(r.shipping_fee || 0)), 0)
pendingHasFreeShipping.value = pendingPurchases.value.some(r => r.is_free_shipping === true)

    // Defaults based on DB
    const dbPayment = (pendingPurchases.value[0]?.modeofpayment as 'cod' | 'ewallet') || 'cod'
    paymentMethod.value = dbPayment

    // Reflect order-level discount choice from DB (discount_redemptions)
    recordedOrderDiscountAmount.value = null
    let foundDiscountId: string | null = null
    if (pendingPurchases.value.length > 0) {
      const ids = pendingPurchases.value.map(p => p.id)
      const { data: reds } = await supabase
        .schema('rewards')
        .from('discount_redemptions')
        .select('purchase_id, discount_id, redeemed_amount')
        .eq('user_id', uid)
        .in('purchase_id', ids)

      if (reds && (reds as any[]).length > 0) {
        // Sum all redeemed_amounts for safety; keep first discount_id
        let sum = 0
        for (const r of reds as Array<{ purchase_id: string; discount_id: string; redeemed_amount: number }>) {
          sum += Number(r.redeemed_amount || 0)
          if (!foundDiscountId) foundDiscountId = r.discount_id
        }
        recordedOrderDiscountAmount.value = Number(sum.toFixed(2))
      }
    }

    // Load discounts list (for title display)
    await loadActiveDiscounts()

    if (recordedOrderDiscountAmount.value != null && foundDiscountId) {
      discountMode.value = 'discount'
      selectedDiscountId.value = foundDiscountId
      discountCodeInput.value = ''
      resolvedDiscountByCode.value = null
    } else {
      // no DB redemption recorded → treat as credits preview by default
      discountMode.value = 'credits'
      selectedDiscountId.value = ''
      discountCodeInput.value = ''
      resolvedDiscountByCode.value = null
    }

    // Build items list from pending + selected discount mode (credits app)
    await buildPendingCartItems()

    showPendingPlace.value = true
  }

  function closePlacePending() {
    showPendingPlace.value = false
    inPendingContext.value = false
    pendingRefNumber.value = null
    pendingPurchases.value = []
    pendingHighestShippingFee.value = 0
    recordedOrderDiscountAmount.value = null
  }

  /** Rebuild pending cart items when discount mode changes (credits app) */
  async function buildPendingCartItems() {
    if (pendingPurchases.value.length === 0) return

    const ids = Array.from(new Set(pendingPurchases.value.map(p => p.product_id)))
    const { data: prodRows } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,description,price,product_url,ispublish,stock,created_at,specifications,warranty')
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

    let remainingCredits = (discountMode.value === 'credits' && hasMemberDiscount.value)
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

      // IMPORTANT: do NOT mutate dbCartByProduct while in pending context
      if (!inPendingContext.value) {
        dbCartByProduct[p.id] = qty
      }
    }

    cartItems.value = list
  }

  /* NEW: Order total including shipping for pending review */
  const orderTotalPending = computed(() =>
  Number((finalPayableTotal.value + (pendingHasFreeShipping.value ? 0 : pendingHighestShippingFee.value)).toFixed(2))
)


  /** Finalize a pending batch */
  async function placePendingOrder() {
    const uid = await ensureUser()
    if (!uid || !pendingRefNumber.value) {
      alert('Please log in.')
      return
    }
    if (cartItems.value.length === 0) {
      alert('No items found for this pending order.')
      return
    }
    if (!hasShipping.value) {
      alert('Please complete your delivery details first.')
      return
    }
    if (pendingHighestShippingFee.value <= 0 && !pendingHasFreeShipping.value) {
  alert('Shipping fee not yet set by admin.')
  return
}


    // When reviewing pending orders, if a redemption was recorded at request time,
    // we respect that recorded amount and DON'T insert another redemption here.
    if (discountMode.value === 'discount' && recordedOrderDiscountAmount.value == null) {
      // In rare case no recorded redemption, fall back to validation before finalize
      const usedId =
        (resolvedDiscountByCode.value?.id?.trim()) ||
        (selectedDiscountId.value?.trim() || '')
      if (!usedId || orderDiscountIneligibleReason.value) {
        alert(orderDiscountIneligibleReason.value || 'Please apply a valid discount code or select a discount.')
        return
      }
      const { ok, message } = await assertPerUserEligible(usedId, uid)
      if (!ok) {
        alert(message || 'You have reached the maximum number of uses for this discount.')
        return
      }
    }

    placingOrder.value = true
    try {
      await saveShipping()

      // Fresh balance/credits + membership %
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

      // Build lines for final pricing
      let finalItemsTotal = 0
      let orderDiscountAmt = 0

      if (discountMode.value === 'discount') {
        // Prefer recorded DB amount if available
        if (recordedOrderDiscountAmount.value != null) {
          const base = cartGrandTotalIgnoringCredits.value
          orderDiscountAmt = Math.min(base, Number(recordedOrderDiscountAmount.value || 0))
        } else {
          const base = cartGrandTotalIgnoringCredits.value
          const d = pickedDiscount.value
          orderDiscountAmt = computeOrderDiscountAmount(base, d)
        }
        finalItemsTotal = Number(Math.max(0, cartGrandTotalIgnoringCredits.value - orderDiscountAmt).toFixed(2))
      } else {
        finalItemsTotal = cartGrandTotal.value
        orderDiscountAmt = 0
      }

      const shippingFee = Number((pendingHasFreeShipping.value ? 0 : pendingHighestShippingFee.value) || 0)

      const itemsTotal = Number(finalItemsTotal.toFixed(2))
      const grandTotalIncludingShipping = Number((itemsTotal + shippingFee).toFixed(2))

      const isEwallet = paymentMethod.value === 'ewallet'
      const purchaseStatus = isEwallet ? 'to ship' : 'to pay'
      const totalToDeduct = isEwallet ? grandTotalIncludingShipping : 0

      if (isEwallet && freshBalance < totalToDeduct) {
        alert('Insufficient balance for E-Wallet. Please choose Cash on Delivery or top up.')
        return
      }
// 🔐 Atomic wallet charge via RPC (BEFORE status updates to avoid partial success)
if (isEwallet && totalToDeduct > 0) {
  try {
    const newBal = await chargeEwalletAtomically(totalToDeduct, pendingRefNumber.value!, uid)
    userBalance.value = newBal
  } catch (e: any) {
    if (e?.message === 'INSUFFICIENT_FUNDS') {
      alert('Insufficient funds. Please choose Cash on Delivery or top up.')
    } else {
      alert('Failed to charge E-Wallet: ' + (e?.message || 'Unknown error'))
    }
    return
  }
}

      // Build line drafts and update purchases rows
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
        let baseSum = 0
        const byProductPurchase = new Map<string, PurchaseRow>()
        pendingPurchases.value.forEach(r => byProductPurchase.set(r.product_id, r))

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
            purchaseId: byProductPurchase.get(it.product.id)?.id || ''
          })
        }
        const useAmt = Math.min(orderDiscountAmt, baseSum)
        if (useAmt > 0 && baseSum > 0) {
          for (const ln of lines) {
            const share = Number(((ln.lineBeforeOrder / baseSum) * useAmt).toFixed(2))
            const perUnitShare = Number((share / ln.quantity).toFixed(2))
            ln.unitFinal = Number(Math.max(0, ln.unitBeforeOrder - perUnitShare).toFixed(2))
          }
        }
      } else {
        // credits or none — unit already computed into cartItems
        const byProductPurchase = new Map<string, PurchaseRow>()
        pendingPurchases.value.forEach(r => byProductPurchase.set(r.product_id, r))

        for (const it of cartItems.value) {
          const qty = Math.max(1, Number(dbCartByProduct[it.product.id] ?? it.qty) || 1)
          lines.push({
            p: it.product,
            quantity: qty,
            unitBeforeOrder: Number(it.originalUnit),
            lineBeforeOrder: Number(it.originalUnit) * qty,
            unitFinal: Number(it.unit),
            purchaseId: byProductPurchase.get(it.product.id)?.id || ''
          })
        }
      }

      // Update purchases rows with final unit + status + payment method
      for (const ln of lines) {
        if (!ln.purchaseId) continue
        const { error: updErr } = await supabase
          .schema('games')
          .from('purchases')
          .update({
            discounted_price: ln.unitFinal,
            status: purchaseStatus,
            modeofpayment: paymentMethod.value
          })
          .eq('id', ln.purchaseId)
        if (updErr) {
          console.error('[update purchase unit/status] failed:', updErr.message)
          alert('Failed to finalize order items: ' + updErr.message)
          return
        }
      }

      

      // AfterShip push (shipping_total now included)
      const discountTotalForAftership =
        (discountMode.value === 'discount' ? orderDiscountAmt : 0) +
        (discountMode.value === 'credits'  ? totalDiscountCreditsUsed.value : 0);

      await pushOrderToAfterShip({
        batchReference: pendingRefNumber.value,
        lines: lines.map(ln => ({
          p: ln.p,
          quantity: ln.quantity,
          unitBeforeOrder: ln.unitBeforeOrder,
          lineBeforeOrder: ln.lineBeforeOrder,
          unitFinal: ln.unitFinal
        })),
        finalSubtotal: itemsTotal,
        shippingFee,
        discountTotal: discountTotalForAftership,
        shipping: shipping.value,
        isPaid: paymentMethod.value === 'ewallet',
        currency: 'PHP',
        customerName: null,
        customerEmail: null,
      }).catch(e => console.warn('[AfterShip push failed]', e))

      // Discount credits deduction (if credits mode)
      if (discountMode.value === 'credits') {
        let totalDiscountCreditsToDeduct = 0
        for (const ln of lines) {
          const perUnitDiff = Math.max(0, ln.unitBeforeOrder - ln.unitFinal)
          totalDiscountCreditsToDeduct += perUnitDiff * ln.quantity
        }
        totalDiscountCreditsToDeduct = Number(totalDiscountCreditsToDeduct.toFixed(2))

        if (totalDiscountCreditsToDeduct > 0) {
          // receipts per purchase
          const receiptsPayload = lines
            .map(ln => {
              const perUnitDiff = Math.max(0, ln.unitBeforeOrder - ln.unitFinal)
              const usedForThis = Number((perUnitDiff * ln.quantity).toFixed(2))
              if (usedForThis <= 0 || !ln.purchaseId) return null
              return {
                purchase_id: ln.purchaseId,
                amount_discounted: usedForThis,
                reference_number: pendingRefNumber.value!
              }
            })
            .filter(Boolean) as Array<{ purchase_id: string; amount_discounted: number; reference_number: string }>

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

          // deduct from user credits
          const { data: reUser } = await supabase.from('users').select('discount_credits').eq('id', uid).maybeSingle()
          const currentCredits = Number(reUser?.discount_credits ?? 0)
          const newDcBalance = Math.max(0, Number((currentCredits - totalDiscountCreditsToDeduct).toFixed(2)))
          const { error: dcErr } = await supabase.from('users').update({ discount_credits: newDcBalance }).eq('id', uid)
          if (dcErr) {
            console.error('[users.discount_credits update failed]', dcErr.message)
            alert('Failed to deduct discount credits: ' + dcErr.message)
            return
          }
          userDiscountCredits.value = newDcBalance
        }
      }

      // (REMOVED) No new redemption insert here – it was already recorded at request time.

      // Deduct stock now
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

// Ewallet order transaction record (now includes shipping)
if (isEwallet) {
  let purchaseIdForTxn = pendingPurchases.value[0]?.id || null;

  // Fallback in case array was cleared/rebuilt: re-query 1 purchase id by ref + user
  if (!purchaseIdForTxn && pendingRefNumber.value) {
    purchaseIdForTxn = await getAnyPurchaseIdForRef(pendingRefNumber.value, uid);
  }

  if (!purchaseIdForTxn) {
    console.error('[order_transactions] No purchase_id found for', pendingRefNumber.value);
    alert('Could not tag the payment to a purchase. Please try again.');
    return; // ensure we don’t write a null-linked transaction
  }

  const { error: txnErr } = await supabase
    .schema('ewallet')
    .from('order_transactions')
    .insert([{
      reference_number: pendingRefNumber.value,
      purchase_id: purchaseIdForTxn,            // ✅ always a real id now
      total_amount: Number(totalToDeduct.toFixed(2)),
    } as any]);

  if (txnErr) {
    console.error('[order_transactions insert failed]', txnErr.message);
    alert('Failed to record the wallet payment: ' + txnErr.message);
    return;
  }
}




      closePlacePending()
      await loadPendingOrders()
      await fetchProducts()

      if (isEwallet) {
        alert('Payment successful! Your order is now set to ship. You’ll receive a confirmation shortly.')
      } else {
        alert('Order placed! Status is to pay. Please prepare payment upon delivery or await admin instructions.')
      }
    } finally {
      placingOrder.value = false
    }
  }

  /* NEW: Cancel a pending batch (deletes all its pending purchases) */
  async function cancelPendingOrder() {
    const uid = await ensureUser()
    if (!uid || !pendingRefNumber.value) return
    const ref = pendingRefNumber.value
    if (!confirm(`Cancel request ${ref}? This will remove all pending items for this reference.`)) return

    placingOrder.value = true
    try {
      const { error } = await supabase
        .schema('games')
        .from('purchases')
        .delete()
        .eq('user_id', uid)
        .eq('reference_number', ref)
        .eq('status', 'pending')

      if (error) {
        alert('Failed to cancel: ' + error.message)
        return
      }

      // discount_redemptions referencing purchase_id will be cascade-deleted by FK

      closePlacePending()
      await loadPendingOrders()
      alert('Request cancelled.')
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

  /** Listen to purchases changes (shipping_fee updates / status) */
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

  onMounted(async () => {
    loadStagedFromLocal()
    await Promise.all([fetchProducts(), loadCart(), loadShipping()])
    await loadPendingOrders()
    bindProductsRealtime()
    await bindCartRealtime()
    await bindUsersRealtime()
    await bindPurchasesRealtime()
  })

  onUnmounted(() => {
    if (productChannel) supabase.removeChannel(productChannel)
    if (cartChannel) supabase.removeChannel(cartChannel)
    if (usersChannel) supabase.removeChannel(usersChannel)
    if (purchasesChannel) supabase.removeChannel(purchasesChannel)
  })

  watch(pageSize, () => goToPage(1))

  // Keep previews in sync when user toggles discount mode
  watch(discountMode, async () => {
    if (showPendingPlace.value) {
      await buildPendingCartItems()
    } else if (showCart.value || showPlace.value) {
      await loadCartDetails()
    }
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

  /* ==== AfterShip push helper (now includes shipping_total) ==== */
  async function pushOrderToAfterShip(args: {
    batchReference: string;
    lines: Array<{
      p: Product;
      quantity: number;
      unitBeforeOrder: number; // original unit price
      lineBeforeOrder: number; // original unit * quantity
      unitFinal: number;       // final unit price after per-line/order discounts
    }>;
    finalSubtotal: number;          // items total AFTER discounts
    shippingFee: number;            // now included
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
      shipping_total: { currency: cur, amount: Number(args.shippingFee || 0).toFixed(2) },
      discount_total: { currency: cur, amount: Math.max(0, args.discountTotal).toFixed(2) },
      order_total:    { currency: cur, amount: Number(args.finalSubtotal + (args.shippingFee || 0)).toFixed(2) },
      items,
      shipping_address: {
        name: args.customerName ?? null,
        phone: args.shipping.phone || null,
        address1: args.shipping.address_line1 || null,
        city: args.shipping.city || null,
        region: args.shipping.province || null,
        postal_code: args.shipping.postal_code || null,
        country_region: 'PHL',
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

  /* ===== Product Details Modal State & Methods ===== */
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

  /* ==== Specifications helpers ==== */


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
    transition: transform 0.15s ease, box-shadow 0.15s ease;
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
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .modal-card--aesthetic .card-body .border {
    border-color: rgba(0,0,0,.08)!important;
    background: #fff;
    backdrop-filter: saturate(120%);
    border-radius: 14px;
  }

  /* Cart pulse & add animations */
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
    position: absolute; inset: 0;
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
    position: absolute; top: 8px; left: 0; right: 0;
    display: flex; justify-content: center; gap: 6px;
  }
  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(0,0,0,.2);
    transition: transform .2s ease, background .2s ease;
  }
  .dot.active { background: rgba(0,0,0,.5); transform: scale(1.15); }

  .carousel-thumb .nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 36px; height: 36px; border: 0; border-radius: 50%;
    display: grid; place-items: center;
    background: rgba(255,255,255,.8);
    color: #111; cursor: pointer;
  }
  .carousel-thumb .nav.left { left: 8px; }
  .carousel-thumb .nav.right { right: 8px; }
  .carousel-thumb .nav:hover { background: #fff; }

  /* Qty bump effect */
  .qty-field { transition: transform .15s ease; }
  .qty-bump { transform: scale(1.06); }

  /* Little badge pop when adding to cart */
  .cart-added-badge {
    background: #198754; color: #fff; padding: 2px 8px;
    font-size: 12px; border-radius: 999px;
    opacity: 0; transform: translateY(-6px) scale(.9);
    transition: opacity .2s ease, transform .2s ease;
  }
  .cart-added-badge--show {
    opacity: 1; transform: translateY(-14px) scale(1);
  }

  /* Product modal */
  .product-modal-card { width: min(980px, 96vw); }
  .product-modal-thumb.ratio { --bs-aspect-ratio: 75%; }

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
    .pending-sample-name { max-width: 220px; }
  }

  /* Minor utility */
  .text-monospace { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

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
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* --- Ensure custom modals appear above any sticky/offcanvas sidebars --- */
  .modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
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
    border: 1px solid rgba(0,0,0,.08);
  }

  /* --- Pending Orders: tiny icon pills --- */
  .pending-icon {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,.08);
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
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  /* Small animation for cart qty fields you already use */
  .qty-bump { animation: qtyBump .18s ease; }
  @keyframes qtyBump {
    0% { transform: scale(.98); }
    100% { transform: scale(1); }
  }

  </style>
