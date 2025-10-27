<template>
  <div class="container">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h3 class="fw-bold d-flex gap-3 align-items-center mt-2">
          <i class="bi bi-basket"></i>Orders  
        </h3>
        <p class="text-muted small mb-0">Manage customer orders, shipping, and fulfillment.</p>
      </div>
      <div class="d-flex align-items-center gap-2"></div>
    </div>

    <!-- Tabs (statuses) -->
    <ul class="nav nav-pills mb-2 flex-wrap">
      <li v-for="t in tabs" :key="t.value" class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: statusFilter === t.value }"
          @click="setStatus(t.value)"
        >
          <span>{{ t.label }}</span>
        </button>
      </li>
    </ul>

    <!-- SUB-TABS (visible only for Return/Refund) -->
    <ul v-if="statusFilter === STATUS.RETURN_REFUND" class="nav nav-pills mb-3 flex-wrap gap-2">
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'all' }"
          @click="setRRStatus('all')"
        >
          All
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'pending' }"
          @click="setRRStatus('pending')"
        >
          Pending
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'approved' }"
          @click="setRRStatus('approved')"
        >
          Approved
        </button>
      </li>
      <!-- NEW: Completed sub-tab -->
      <li class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: rrStatusFilter === 'completed' }"
          @click="setRRStatus('completed')"
        >
          Completed
        </button>
      </li>
      <!-- /NEW -->
    </ul>

    <!-- Filters -->
    <div class="card shadow-sm mb-3">
      <div class="card-body d-flex flex-wrap g-2 align-items-end gap-2">
        <div class="flex-grow-1" style="min-width: 240px">
          <label class="form-label small text-muted mb-1">Search</label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
            <input
              v-model.trim="search"
              type="search"
              class="form-control"
              placeholder="Search address, phone, order/ref no…"
              @keyup.enter="applyFilters"
            />
            <button class="btn btn-outline-secondary" :disabled="busy.load" @click="applyFilters">
              Search
            </button>
          </div>
        </div>

        <div>
          <label class="form-label small text-muted mb-1">Payment</label>
          <select v-model="payment" class="form-select">
            <option value="">All</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Prepaid">Prepaid</option>
          </select>
        </div>

        <div class="d-flex gap-2 ">
          <div>
            <label class="form-label small text-muted mb-1">From</label>
            <input v-model="dateFrom" type="date" class="form-control" />
          </div>
          <div>
            <label class="form-label small text-muted mb-1">To</label>
            <input v-model="dateTo" type="date" class="form-control" />
          </div>
        </div>

        <div class="ms-auto d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary" @click="clearFilters" :disabled="busy.load">
            Clear
          </button>
          <button class="btn btn-primary" @click="applyFilters" :disabled="busy.load">
            <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="busy.load" class="text-center text-muted py-5">
      <div class="spinner-border mb-3"></div>
      <div>Loading orders…</div>
    </div>

    <!-- Empty -->
    <div v-else-if="orderGroups.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-receipt" style="font-size: 1.6rem"></i>
      <div class="mt-2">No orders found.</div>
    </div>

    <!-- Orders list (GROUPED by reference_number) -->
    <div v-else class="vstack gap-3">
      <div v-for="g in orderGroups" :key="g.groupKey" class="card shadow-sm rounded-4">
        <div class="card-body">
          <!-- Row 1: Group meta -->
          <div class="d-flex flex-wrap align-items-center justify-content-between">
            <div class="d-flex flex-column">
              <div class="fw-semibold">
                <span class="text-muted">Ref#</span>
                <span class="ms-1">{{ g.reference_number || shortId(g.groupKey) }}</span>
              </div>
              <!-- UPDATED: clean date/time + updated_at -->
              <div class="small text-muted">Created: {{ formatClean(g.created_at) }}</div>
              <div class="small text-muted" v-if="g.updated_at">
                Updated: {{ formatClean(g.updated_at) }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 statusInfos">
              <span class="badge" :class="statusClass(g.statusSummaryClassKey)">
                {{ g.statusSummaryLabel }}
              </span>
              <span class="badge text-bg-light border" :title="g.paymentSummaryTitle">
                {{ g.paymentSummaryLabel }}
              </span>

              <!-- NEW: open modal button (per reference) -->
              <button class="btn btn-outline-secondary btn-sm d-flex" @click="openGroupModal(g)">
                <i class="bi bi-eye me-1"></i> View details
              </button>
              <!-- /NEW -->
            </div>
          </div>

          <!-- NEW: Single tracking link shown at top for TO_RECEIVE (per reference) -->
          <div
            v-if="statusFilter === STATUS.TO_RECEIVE && refTrackingLink(g.reference_number)"
            class="mt-2"
          >
            <div class="small">
              <i class="bi bi-truck me-1"></i>
              <a :href="refTrackingLink(g.reference_number)" target="_blank" rel="noopener">Tracking link</a>
            </div>
          </div>
          <!-- /NEW -->

          <!-- NEW: Offer Shipping controls (only show in the Offer Shipping tab) -->
          <div
            v-if="statusFilter === TAB_OFFER_SHIPPING && isGroupPendingShipping(g)"
            class="mt-3 border rounded p-3 bg-body"
          >
            <div class="small text-muted mb-2">Shipping offer (₱)</div>
            <div class="d-flex flex-wrap align-items-end gap-2" style="max-width:600px">
              <div class="flex-grow-1">
                <!-- removed .trim; we coerce safely in code -->
                <input
                  v-model="shippingOfferInputByRef[g.reference_number]"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                  :placeholder="`₱ ${number(0)}`"
                />
              </div>
              <button
                class="btn btn-primary"
                :disabled="isOffering(g) || !canOfferShipping(g)"
                @click="offerShipping(g)"
                title="Save shipping fee for all purchases under this reference"
              >
                <span v-if="isOffering(g)" class="spinner-border spinner-border-sm me-2"></span>
                Offer shipping
              </button>
              <button
                class="btn btn-outline-danger"
                :disabled="isOffering(g)"
                @click="cancelGroup(g)"
                title="Cancel all purchases under this reference"
              >
                Cancel
              </button>
            </div>
            <div class="small mt-2" v-if="shippingForRef(g.reference_number) > 0">
              Current saved shipping fee: <strong>₱ {{ number(shippingForRef(g.reference_number)) }}</strong>
            </div>
          </div>
          <!-- /NEW -->

          <!-- Row 2: Items for the whole group -->
          <div class="mt-3">
            <div
              v-for="it in g.items"
              :key="g.groupKey + ':' + it.product_id + ':' + it.order_id"
              class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle mb-2"
            >
              <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                <img
                  v-if="productThumb(it.product)"
                  :src="productThumb(it.product)"
                  :alt="it.product?.name || 'Product'"
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
                <!-- UPDATED: ellipsis title (no specs/desc) -->
                <div class="fw-semibold" :title="it.product?.name || it.product_id">
                  {{ it.product?.name || it.product_id }}
                </div>

                <!-- HIDDEN but kept (do not remove existing code) -->
                <div
                  class="text-muted small text-truncate order-desc"
                  v-if="it.product?.description"
                >
                  {{ it.product?.description }}
                </div>

                <!-- ORIGINAL (kept) -->
                <div class="text-muted small" v-if="!hasEventDiscount(g.reference_number)">
                  ₱ {{ number(it.price_each) }} × {{ it.qty }}
                </div>

                <!-- NEW: Discounted display when event/per-purchase discount applies (ALL TABS) -->
                <div class="small" v-else>
                  <span class="text-muted text-decoration-line-through me-1">
                    ₱ {{ number(it.price_each) }}
                  </span>
                  <span class="fw-semibold text-danger">
                    ₱ {{ number(discountedPriceEachForItem(it, g.reference_number)) }}
                  </span>
                  <span class="text-muted">× {{ it.qty }}</span>
                </div>

                <!-- NEW: visible badges per item (status + payment) -->
                <div class="mt-1 d-flex flex-wrap gap-2">
                  <span
                    class="badge badge-tight"
                    :class="statusClass(purchaseStatusKey(g, it.order_id))"
                  >
                    {{ prettyStatus(purchaseStatusKey(g, it.order_id)) }}
                  </span>
                  <span class="badge text-bg-light border badge-tight">
                    {{ purchasePayment(g, it.order_id) || '—' }}
                  </span>
                </div>

                <!-- UPDATED: Show per-item tracking link ONLY if no ref-level link -->
                <div
                  class="mt-1 small"
                  v-if="
                    purchaseStatusKey(g, it.order_id) === STATUS.TO_RECEIVE &&
                    !refTrackingLink(g.reference_number) &&
                    purchaseTrackingLink(g, it.order_id)
                  "
                >
                  <a :href="purchaseTrackingLink(g, it.order_id)!" target="_blank" rel="noopener"
                    >Tracking link</a
                  >
                </div>
              </div>

              <!-- ORIGINAL rightmost line total (kept when no event) -->
              <div class="text-end fw-semibold" v-if="!hasEventDiscount(g.reference_number)">
                ₱ {{ number(it.line_total) }}
              </div>

              <!-- NEW: rightmost discounted line total -->
              <div class="text-end fw-semibold" v-else>
                <div class="small text-muted">₱ {{ number(it.line_total) }}</div>
              </div>
            </div>
          </div>

          <!-- Row 3: shipping + totals -->
          <div class="mt-3 row g-3">
            <div class="col-12 col-md-7">
              <div class="small text-muted mb-1">Shipping info</div>
              <div class="border rounded p-2 bg-body small">
                <div class="fw-semibold">{{ g.shipping_name || '—' }}</div>
                <div class="text-muted">{{ g.phone_number || '—' }}</div>
                <div>{{ g.shipping_address || '—' }}</div>
              </div>
            </div>
            <div class="col-12 col-md-5 d-flex align-items-end justify-content-end">
              <div class="text-end ms-auto">
                <div class="text-muted small">Subtotal</div>

                <div class="fw-semibold fs-5" v-if="!hasEventDiscount(g.reference_number)">
                  ₱ {{ number(groupSubtotal(g)) }}
                </div>

                <!-- ★ CHANGE: When discounted, show original vs discounted subtotal clearly (card body) -->
                <div v-else class="text-end">
                  <div class="small text-muted text-decoration-line-through">
                    ₱ {{ number(groupSubtotalOriginal(g)) }}
                  </div>
                   <!-- NEW: explicit item discount line (event/per-purchase) -->
                <div class="small text-muted" v-if="hasEventDiscount(g.reference_number) && groupItemDiscountAmount(g) > 0">
                  Item discount: − ₱ {{ number(groupItemDiscountAmount(g)) }}
                </div>
                  <div class="small text-success fw-semibold">
                    ₱ {{ number(groupSubtotalDiscounted(g)) }}
                  </div>
                </div>
                <!-- /★ CHANGE -->

               

                <!-- show discounts line only if we actually subtracted them (avoid double subtract) -->
                <div class="small text-muted" v-if="(g.discount_total || 0) > 0">
                  Discounts: − ₱ {{ number(g.discount_total) }}
                </div>
                <!-- NEW: show order-level discounts from discount_redemptions even when pending (not subtracted here) -->
                <div class="small text-muted"
                  v-else-if="g.allPending && discountSumForRef(g.reference_number) > 0">
                  Discounts: − ₱ {{ number(discountSumForRef(g.reference_number)) }}
                </div>

                <!-- NEW: show shipping fee in card body (not on Return/Refund tab) -->
                <div
                  class="small text-muted"
                  v-if="statusFilter !== STATUS.RETURN_REFUND && shippingForRef(g.reference_number) > 0"
                >
                  Shipping fee: ₱ {{ number(shippingForRef(g.reference_number)) }}
                </div>

                <!-- Recorded total includes shipping for all tabs except Return/Refund -->
                <div class="fw-semibold fs-5">Recorded total: ₱ {{ number(g.total_amount) }}</div>
              </div>
            </div>
          </div>

          <!-- Row 3.5: Return/Refund info (per product rows) -->
          <div v-if="g.containsRR" class="mt-3">
            <div class="small text-muted mb-1">Return/Refund</div>

            <div
              v-for="rr in groupRRs(g)"
              :key="rr.id"
              class="border rounded p-2 bg-body small mb-2"
            >
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="badge" :class="rrBadgeClass(rr.status)">
                  {{ prettyRRStatus(rr.status) }}
                </span>

                <span class="badge text-bg-light border">
                  {{ purchasePayment(g, rr.purchase_id) || '—' }}
                </span>

                <span class="text-muted">•</span>
                <span class="fw-semibold">Product:</span>
                <span>{{ productsMap[rr.product_id]?.name || rr.product_id }}</span>
                <span class="text-muted">•</span>
                <span class="fw-semibold">Reason:</span>
                <span>{{ rr.reason }}</span>
              </div>

              <div v-if="rr.details" class="mt-1">
                <span class="fw-semibold">Details:</span>
                <span>{{ rr.details }}</span>
              </div>

              <!-- NEW: Return tracking link input (only when PENDING) -->
              <div v-if="isRRPending(rr)" class="mt-2" style="max-width: 560px;">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Return tracking</span>
                  <input
                    v-model.trim="rrTrackById[rr.id]"
                    type="url"
                    class="form-control"
                    placeholder="https://courier.example/track/RETURN123"
                  />
                </div>
                <div class="form-text">Required before approving.</div>
              </div>
              <!-- /NEW -->

              <div class="text-muted mt-1">Created: {{ formatClean(rr.created_at) }}</div>

              <div class="mt-2 d-flex justify-content-end gap-2">
                <template v-if="isRRPending(rr)">
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="busy.action[rr.id] || !rrTrackingLinkFilled(rr.id)"
                    @click="approveRefund(rr)"
                    title="Approve refund request"
                  >
                    <span
                      v-if="busy.action[rr.id]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Approve refund
                  </button>

                  <button
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.action[rr.id]"
                    @click="rejectRefund(rr)"
                    title="Reject refund request"
                  >
                    <span
                      v-if="busy.action[rr.id]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Reject
                  </button>
                </template>

                <button
                  v-else-if="isRRApproved(rr)"
                  class="btn btn-primary btn-sm"
                  :disabled="busy.action[rr.id]"
                  @click="completeRefund(rr)"
                  title="Mark refund as completed"
                >
                  <span
                    v-if="busy.action[rr.id]"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Mark as Completed
                </button>
              </div>
            </div>

            <div class="border rounded p-2 bg-body small" v-if="groupRRs(g).length === 0">
              No return/refund record found for this grouped order (filtered by "{{ rrStatusFilter }}").</div>
          </div>

          <!-- ===== NEW: In 'To Receive' tab, also show siblings (RR + Completed) ===== -->
          <div
            v-if="
              statusFilter === STATUS.TO_RECEIVE &&
              (g.siblingRRItems.length || g.siblingCompletedItems.length)
            "
            class="mt-3"
          >
            <div class="small text-muted mb-1">Other items in this reference</div>

            <!-- RR siblings (RED BORDER + STATUS + BUTTON) -->
            <div
              v-for="s in g.siblingRRItems"
              :key="'rr-' + g.groupKey + ':' + s.product_id + ':' + s.order_id"
              class="d-flex align-items-center justify-content-between border border-danger rounded p-2 bg-body mb-2"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(s.product)"
                    :src="productThumb(s.product)"
                    :alt="s.product?.name || 'Product'"
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
                  <div
                    class="fw-semibold title-ellipsis text-danger"
                    :title="s.product?.name || s.product_id"
                  >
                    {{ s.product?.name || s.product_id }}
                    <span class="small">
                      <template v-if="!hasEventDiscount(g.reference_number)">
                        ({{ s.qty }} × ₱ {{ number(s.price_each) }})
                      </template>
                      <template v-else>
                        ({{ s.qty }} ×
                        <span class="text-muted text-decoration-line-through me-1"
                          >₱ {{ number(s.price_each) }}</span
                        >
                        <span class="fw-semibold text-danger"
                          >₱ {{ number(discountedPriceEachForItem(s, g.reference_number)) }}</span
                        >
                        )
                      </template>
                    </span>
                  </div>
                  <div class="text-danger small">
                    Return/Refund — {{ prettyRRStatus((s as any).rrStatus) }}
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-danger btn-sm" @click="viewReturnDetails()">
                  Refund details
                </button>
              </div>
            </div>

            <!-- Completed siblings (kept) -->
            <div
              v-for="s in g.siblingCompletedItems"
              :key="'done-' + g.groupKey + ':' + s.product_id + ':' + s.order_id"
              class="d-flex align-items-center gap-3 border rounded p-2 bg-body mb-2"
            >
              <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                <img
                  v-if="productThumb(s.product)"
                  :src="productThumb(s.product)"
                  :alt="s.product?.name || 'Product'"
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
                <div class="fw-semibold title-ellipsis" :title="s.product?.name || s.product_id">
                  {{ s.product?.name || s.product_id }}
                  <span class="small">
                    <template v-if="!hasEventDiscount(g.reference_number)">
                      ({{ s.qty }} × ₱ {{ number(s.price_each) }})
                    </template>
                    <template v-else>
                      ({{ s.qty }} ×
                      <span class="text-muted text-decoration-line-through me-1"
                        >₱ {{ number(s.price_each) }}</span
                      >
                      <span class="fw-semibold text-danger"
                        >₱ {{ number(discountedPriceEachForItem(s, g.reference_number)) }}</span
                      >
                      )
                    </template>
                  </span>
                </div>

                <div
                  class="small"
                  :class="hasEventDiscount(g.reference_number) ? '' : 'text-muted'"
                >
                  <template v-if="!hasEventDiscount(g.reference_number)">
                    ₱ {{ number(s.line_total) }}
                  </template>
                  <template v-else>
                    <span class="text-muted text-decoration-line-through me-1">
                      ₱ {{ number(s.line_total) }}
                    </span>
                    <span class="fw-semibold"
                      >₱ {{ number(lineTotalAfterDiscount(s, g.reference_number)) }}</span
                    >
                  </template>
                </div>

                <!-- Keep (but won't show in TO_RECEIVE because ref-level link is displayed above) -->
                <div
                  class="small mt-1"
                  v-if="purchaseStatusKey(g, s.order_id) === STATUS.TO_RECEIVE && purchaseTrackingLink(g, s.order_id) && !refTrackingLink(g.reference_number)"
                >
                  <a :href="purchaseTrackingLink(g, s.order_id)!" target="_blank" rel="noopener"
                    >Tracking link</a
                  >
                </div>
              </div>
              <span class="badge text-bg-success-subtle border">Completed</span>
            </div>
          </div>
          <!-- ===== /NEW ===== -->

          <!-- NEW: In 'Completed' tab, also show RR items that are completed -->
          <div v-if="statusFilter === STATUS.COMPLETED && g.completedRRItems.length" class="mt-3">
            <div class="small text-muted mb-1">Refunded items (completed)</div>

            <div
              v-for="s in g.completedRRItems"
              :key="'rrc-' + g.groupKey + ':' + s.product_id + ':' + s.order_id"
              class="d-flex align-items-center justify-content-between border rounded p-2 bg-body mb-2"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(s.product)"
                    :src="productThumb(s.product)"
                    :alt="s.product?.name || 'Product'"
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
                  <div class="fw-semibold title-ellipsis" :title="s.product?.name || s.product_id">
                    {{ s.product?.name || s.product_id }}
                    <span class="small">
                      <template v-if="!hasEventDiscount(g.reference_number)">
                        ({{ s.qty }} × ₱ {{ number(s.price_each) }})
                      </template>
                      <template v-else>
                        ({{ s.qty }} ×
                        <span class="text-muted text-decoration-line-through me-1"
                          >₱ {{ number(s.price_each) }}</span
                        >
                        <span class="fw-semibold text-danger"
                          >₱ {{ number(discountedPriceEachForItem(s, g.reference_number)) }}</span
                        >
                        )
                      </template>
                    </span>
                  </div>
                  <div class="small text-success">Refund Completed</div>
                </div>
              </div>
              <span class="badge text-bg-success-subtle border">Refunded</span>
            </div>
          </div>
          <!-- /NEW -->

          <!-- Row 4: group actions -->
          <div class="mt-3 d-flex flex-wrap gap-2 justify-content-end">
            <!-- Group Approve (only when ALL are TO_PAY) -->
            <button
              v-if="g.allToPay"
              class="btn btn-primary btn-sm"
              :disabled="busy.anyGroup(g.groupKey)"
              @click="approveGroup(g)"
              title="Approve all purchases in this reference and move to To Ship (no deduction)"
            >
              <span
                v-if="busy.anyGroup(g.groupKey)"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Approve (all)
            </button>

            <!-- Group Mark as Shipped (only when ALL are TO_SHIP) -->
            <button
              v-if="g.allToShip"
              class="btn btn-primary btn-sm"
              :disabled="busy.anyGroup(g.groupKey) || !canGroupMarkAsShipped(g)"
              @click="markGroupAsShipped(g)"
              title="Set a single tracking link in the details, then ship"
            >
              <span
                v-if="busy.anyGroup(g.groupKey)"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Mark as Shipped (all)
            </button>

            <!-- Group Cancel (allowed for TO_PAY and TO_SHIP per your rules; processes per order rules) -->
            <button
              v-if="g.canGroupCancel"
              class="btn btn-outline-danger btn-sm"
              :disabled="busy.anyGroup(g.groupKey)"
              @click="cancelGroup(g)"
            >
              <span
                v-if="busy.anyGroup(g.groupKey)"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Cancel (all)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="total > pageSize"
      class="d-flex align-items-center justify-content-center gap-2 mt-3"
    >
      <button
        class="btn btn-outline-secondary btn-sm"
        :disabled="page === 1 || busy.load"
        @click="goTo(page - 1)"
      >
        <i class="bi bi-chevron-left"></i>
      </button>
      <span class="small text-muted">
        Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong>
      </span>
      <button
        class="btn btn-outline-secondary btn-sm"
        :disabled="page >= totalPages || busy.load"
        @click="goTo(page + 1)"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- ===================================================== -->
    <!-- NEW: ORDER DETAILS MODAL (per reference_number)       -->
    <!-- ===================================================== -->
    <div
      v-if="selectedRef && selectedGroup"
      class="orders-modal-overlay"
      @click.self="closeGroupModal"
    >
      <div class="orders-modal-card">
        <!-- Modal header -->
        <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <div>
            <div class="fw-semibold">
              Order Details — <span class="text-muted">Ref#</span>
              <span class="ms-1">{{ selectedGroup.reference_number }}</span>
            </div>
            <div class="small text-muted">
              Created: {{ formatClean(selectedGroup.created_at) }}
              <span v-if="selectedGroup.updated_at">
                • Updated: {{ formatClean(selectedGroup.updated_at) }}</span
              >
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge" :class="statusClass(selectedGroup.statusSummaryClassKey)">{{
              selectedGroup.statusSummaryLabel
            }}</span>
            <span class="badge text-bg-light border" :title="selectedGroup.paymentSummaryTitle">{{
              selectedGroup.paymentSummaryLabel
            }}</span>
            <button class="btn btn-light btn-sm" @click="closeGroupModal" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Modal body -->
        <div class="orders-modal-body">
          <!-- Buyer & Shipping -->
          <div class="row g-3">
            <div class="col-12 col-lg-6">
              <div class="small text-muted mb-1">Buyer / Shipping to</div>
              <div class="border rounded p-2 bg-body small">
                <div class="fw-semibold">{{ selectedGroup.shipping_name || '—' }}</div>
                <div class="text-muted">{{ selectedGroup.phone_number || '—' }}</div>
                <div>{{ selectedGroup.shipping_address || '—' }}</div>
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="small text-muted mb-1">Reference Summary</div>
              <div class="border rounded p-2 bg-body small">
                <div>
                  <span class="text-muted">Payment: </span>{{ selectedGroup.paymentSummaryLabel }}
                </div>
                <div v-if="hasEventDiscount(selectedGroup.reference_number) && groupItemDiscountAmount(selectedGroup) > 0">
                  <span class="text-muted">Item Discount: </span>− ₱
                  {{ number(groupItemDiscountAmount(selectedGroup)) }}
                </div>
                <div v-if="(selectedGroup.discount_total || 0) > 0">
                  <span class="text-muted">Discounts Applied: </span>− ₱
                  {{ number(selectedGroup.discount_total) }}
                </div>
                <!-- NEW: show order-level discounts from discount_redemptions even when pending (not subtracted here) -->
                <div v-else-if="selectedGroup.allPending && discountSumForRef(selectedGroup.reference_number) > 0">
                  <span class="text-muted">Discounts: </span>− ₱
                  {{ number(discountSumForRef(selectedGroup.reference_number)) }}
                </div>
                <div v-if="statusFilter !== STATUS.RETURN_REFUND">
                  <span class="text-muted">Shipping Fee: </span>₱
                  {{ number(shippingForRef(selectedGroup.reference_number)) }}
                </div>

                <!-- NEW: Single tracking link per reference -->
                <div v-if="selectedGroupHasToShip" class="mt-2">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">Tracking link</span>
                    <input
                      v-model.trim="trackLinkByRef[selectedGroup.reference_number]"
                      type="url"
                      class="form-control"
                      placeholder="https://courier.example/track/ABC123"
                    />
                  </div>
                  <div class="form-text">One link for the whole reference. Required before shipping.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items & per-purchase actions -->
          <div class="mt-3">
            <div class="small text-muted mb-1">Items in this reference</div>
            <div
              v-for="o in selectedGroup.purchases"
              :key="o.id"
              class="border rounded p-2 bg-body mb-2"
            >
              <div class="d-flex align-items-start gap-3">
                <!-- thumb -->
                <div class="order-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(o.items[0]?.product)"
                    :src="productThumb(o.items[0]?.product)"
                    :alt="o.items[0]?.product?.name || 'Product'"
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
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div
                      class="fw-semibold"
                      :title="o.items[0]?.product?.name || o.items[0]?.product_id"
                    >
                      {{ o.items[0]?.product?.name || o.items[0]?.product_id }}
                      <span class="small ms-2">
                        <template v-if="!hasEventDiscount(selectedGroup.reference_number)">
                          ({{ o.items[0]?.qty }} × ₱ {{ number(o.items[0]?.price_each) }})
                        </template>
                        <template v-else>
                          ({{ o.items[0]?.qty }} ×
                          <span class="text-muted text-decoration-line-through me-1"
                            >₱ {{ number(o.items[0]?.price_each) }}</span
                          >
                          <span class="fw-semibold text-danger">
                            ₱
                            {{
                              number(
                                discountedPriceEachForItem(
                                  o.items[0],
                                  selectedGroup.reference_number,
                                ),
                              )
                            }} </span
                          >)
                        </template>
                      </span>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                      <span class="badge badge-tight" :class="statusClass(o.status)">{{
                        prettyStatus(o.status)
                      }}</span>
                      <span class="badge text-bg-light border badge-tight">{{
                        o.payment_method || '—'
                      }}</span>
                    </div>
                  </div>

                  <!-- line totals -->
                  <div class="mt-1">
                    <template v-if="!hasEventDiscount(selectedGroup.reference_number)">
                      <span class="text-muted small">Line total:</span>
                      <span class="fw-semibold"> ₱ {{ number(o.items[0]?.line_total) }}</span>
                    </template>
                    <template v-else>
                      <span class="text-muted small">Line total:</span>
                      <span class="text-muted small text-decoration-line-through me-1"
                        >₱ {{ number(o.items[0]?.line_total) }}</span
                      >
                      <span class="fw-semibold"
                        >₱
                        {{
                          number(lineTotalAfterDiscount(o.items[0], selectedGroup.reference_number))
                        }}</span
                      >
                    </template>
                  </div>

                  <!-- NEW: Return tracking link per RR (modal) -->
                  <div v-if="(rrByPurchase[o.id] || []).length" class="mt-2">
                    <div
                      v-for="rr in rrByPurchase[o.id]"
                      :key="rr.id"
                      class="border rounded p-2 bg-light-subtle small mb-2"
                    >
                      <div class="d-flex flex-wrap align-items-center gap-2">
                        <span class="badge" :class="rrBadgeClass(rr.status)">{{
                          prettyRRStatus(rr.status)
                        }}</span>
                        <span class="text-muted">•</span>
                        <span class="fw-semibold">Reason:</span>
                        <span>{{ rr.reason }}</span>
                      </div>
                      <div v-if="rr.details" class="mt-1">
                        <span class="fw-semibold">Details:</span> <span>{{ rr.details }}</span>
                      </div>

                      <!-- NEW: Return tracking link input (only when PENDING) -->
                      <div v-if="isRRPending(rr)" class="mt-2" style="max-width: 560px;">
                        <div class="input-group input-group-sm">
                          <span class="input-group-text">Return tracking</span>
                          <input
                            v-model.trim="rrTrackById[rr.id]"
                            type="url"
                            class="form-control"
                            placeholder="https://courier.example/track/RETURN123"
                          />
                        </div>
                        <div class="form-text">Required before approving.</div>
                      </div>
                      <!-- /NEW -->

                      <div class="text-muted mt-1">Created: {{ formatClean(rr.created_at) }}</div>

                      <div class="mt-2 d-flex justify-content-end gap-2">
                        <template v-if="isRRPending(rr)">
                          <button
                            class="btn btn-success btn-sm"
                            :disabled="busy.action[rr.id] || !rrTrackingLinkFilled(rr.id)"
                            @click="approveRefund(rr)"
                          >
                            <span
                              v-if="busy.action[rr.id]"
                              class="spinner-border spinner-border-sm me-1"
                            ></span>
                            Approve refund
                          </button>
                          <button
                            class="btn btn-outline-danger btn-sm"
                            :disabled="busy.action[rr.id]"
                            @click="rejectRefund(rr)"
                          >
                            <span
                              v-if="busy.action[rr.id]"
                              class="spinner-border spinner-border-sm me-1"
                            ></span>
                            Reject
                          </button>
                        </template>
                        <button
                          v-else-if="isRRApproved(rr)"
                          class="btn btn-primary btn-sm"
                          :disabled="busy.action[rr.id]"
                          @click="completeRefund(rr)"
                        >
                          <span
                            v-if="busy.action[rr.id]"
                            class="spinner-border spinner-border-sm me-1"
                          ></span>
                          Mark as Completed
                        </button>
                      </div>
                    </div>
                  </div>

                 
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="d-flex flex-column align-items-end mt-3">
              <div class="text-muted small">Subtotal</div>
              <div
                v-if="!hasEventDiscount(selectedGroup.reference_number)"
                class="fw-semibold fs-5"
              >
                ₱ {{ number(groupSubtotal(selectedGroup)) }}
              </div>
              <div v-else class="text-end">
                <div class="small text-muted text-decoration-line-through">
                  ₱ {{ number(groupSubtotalOriginal(selectedGroup)) }}
                </div>
                <div class="small text-success fw-semibold">
                  ₱ {{ number(groupSubtotalDiscounted(selectedGroup)) }}
                </div>
              </div>

              <!-- NEW: explicit item discount line in modal totals -->
              <div class="small text-muted" v-if="hasEventDiscount(selectedGroup.reference_number) && groupItemDiscountAmount(selectedGroup) > 0">
                Item discount: − ₱ {{ number(groupItemDiscountAmount(selectedGroup)) }}
              </div>

              <div class="small text-muted" v-if="(selectedGroup.discount_total || 0) > 0">
                Discounts: − ₱ {{ number(selectedGroup.discount_total) }}
              </div>
              <!-- NEW: show order-level discounts from discount_redemptions even when pending (not subtracted here) -->
              <div class="small text-muted" v-else-if="selectedGroup.allPending && discountSumForRef(selectedGroup.reference_number) > 0">
                Discounts: − ₱ {{ number(discountSumForRef(selectedGroup.reference_number)) }}
              </div>

              <div
                class="small text-muted"
                v-if="statusFilter !== STATUS.RETURN_REFUND && shippingForRef(selectedGroup.reference_number) > 0"
              >
                Shipping fee: ₱ {{ number(shippingForRef(selectedGroup.reference_number)) }}
              </div>
              <div class="fw-semibold fs-5">
                Recorded total: ₱ {{ number(selectedGroup.total_amount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer: group-level actions mirrored -->
        <div class="d-flex flex-wrap gap-2 justify-content-end border-top pt-3 mt-3">
          <button
            v-if="selectedGroup.allToPay"
            class="btn btn-primary btn-sm"
            :disabled="busy.anyGroup(selectedGroup.groupKey)"
            @click="approveGroup(selectedGroup)"
          >
            <span
              v-if="busy.anyGroup(selectedGroup.groupKey)"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Approve (all)
          </button>
          <button
            v-if="selectedGroup.allToShip"
            class="btn btn-primary btn-sm"
            :disabled="busy.anyGroup(selectedGroup.groupKey) || !canGroupMarkAsShipped(selectedGroup)"
            @click="markGroupAsShipped(selectedGroup)"
            title="Provide the single tracking link above first"
          >
            <span
              v-if="busy.anyGroup(selectedGroup.groupKey)"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Mark as Shipped (all)
          </button>
          <button
            v-if="selectedGroup.canGroupCancel"
            class="btn btn-outline-danger btn-sm"
            :disabled="busy.anyGroup(selectedGroup.groupKey)"
            @click="cancelGroup(selectedGroup)"
          >
            <span
              v-if="busy.anyGroup(selectedGroup.groupKey)"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Cancel (all)
          </button>
          <button class="btn btn-light btn-sm" @click="closeGroupModal">Close</button>
        </div>
      </div>
    </div>
    <!-- /MODAL -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { currentUser } from '@/lib/authState'

const router = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
})
/** Status constants (align with your purchase_status enum) */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to receive',
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const

/** NEW: support pretty label/class for 'pending' without changing your schema usage */
function isPending(s?: string | null) {
  return String(s || '').toLowerCase() === 'pending'
}

/** NEW: custom tab id */
const TAB_OFFER_SHIPPING = '_offer_shipping' as const

/** Tabs */
const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Offer Shipping', value: TAB_OFFER_SHIPPING }, // NEW
  { label: 'To Pay', value: STATUS.TO_PAY },
  { label: 'To Ship', value: STATUS.TO_SHIP },
  { label: 'To Receive', value: STATUS.TO_RECEIVE },
  { label: 'Completed', value: STATUS.COMPLETED },
  { label: 'Return/Refund', value: STATUS.RETURN_REFUND },
  { label: 'Cancelled', value: STATUS.CANCELLED },
] as const

/** Return/Refund sub-filter (only used when statusFilter === RETURN_REFUND) */
type RRFilter = 'all' | 'pending' | 'approved' | 'completed'
const rrStatusFilter = ref<RRFilter>('all')

/** Purchases & view models */
type PurchaseRow = {
  id: string
  user_id: string
  product_id: string
  reference_number: string
  status: string
  created_at: string
  updated_at: string
  modeofpayment: string | null
  qty: number
  discounted_price: number | string | null // ★ ADDED
  shipping_fee: number | string | null     // ★ ADDED
  tracking_link: string | null             // ★ ADDED
}
type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | null
}
type Buyer = {
  id: string
  full_name: string | null // NEW
  phone_number: string | null
  address: string | null
}
type ReturnRefundRow = {
  id: string
  user_id: string
  purchase_id: string
  product_id: string
  reason: string
  details: string | null
  status: string
  created_at: string
  updated_at: string
  /** NEW: store the return tracking link in DB */
  refund_tracking_link: string | null
}

type OrderItem = {
  order_id: string
  product_id: string
  qty: number
  price_each: number | string
  line_total: number | string
  product?: Product
}

/** View model */
type ViewOrder = {
  id: string
  user_id: string
  reference_number: string
  total_amount: number | string | null
  payment_method: string | null
  shipping_address: string | null
  phone_number: string | null
  status: string | null
  created_at: string
  updated_at: string
  items: Array<OrderItem>
  tracking_link?: string | null // ★ ADDED
}

/** Grouped view model */
type ViewGroup = {
  groupKey: string
  reference_number: string
  created_at: string
  updated_at: string | null
  statusSummaryLabel: string
  statusSummaryClassKey: string
  paymentSummaryLabel: string
  paymentSummaryTitle: string
  total_amount: number
  shipping_name: string | null // NEW
  shipping_address: string | null
  phone_number: string | null
  items: Array<OrderItem>
  purchases: Array<ViewOrder>
  containsRR: boolean
  allToPay: boolean
  allToShip: boolean
  canGroupCancel: boolean
  siblingRRItems: Array<OrderItem & { rrStatus: string | null }>
  siblingCompletedItems: Array<OrderItem>
  completedRRItems: Array<OrderItem & { rrStatus: string | null }>
  discount_total?: number
  /** ★ NEW: true when ALL purchases in the group are status 'pending' */
  allPending: boolean
}

type DiscountRow = {
  purchase_id: string
  redeemed_amount: number | string
  discount_id: string
  created_at: string
}

/* ---------- UI state ---------- */
type BusyState = {
  load: boolean
  action: Record<string, boolean>
  anyGroup: (k: string) => boolean
}

const busy = ref<BusyState>({
  load: false,
  action: {},
  anyGroup: () => false,
})

/**
 * IMPORTANT: Make groupIndex NON-REACTIVE.
 * We fill/clear it inside the `orderGroups` computed. If this were reactive,
 * those mutations would retrigger the computed and cause an infinite loop.
 */
let groupIndex: Record<string, string[]> = Object.create(null)

/* ★ ADDED: per-purchase discounted price cache (final price each) */
const discountedByPurchase: Record<string, number | null> = reactive({})

/* ★ NEW: per-purchase & per-reference discount redemption caches */
const discountByPurchase: Record<string, number> = reactive({ })
const discountByRef: Record<string, number> = reactive({ })

/* ★ NEW: per-reference shipping fee cache (MAX of purchases.shipping_fee) */
const shippingByRef: Record<string, number> = reactive({})

/* ★ NEW: single tracking link per reference */
const trackLinkByRef: Record<string, string> = reactive({})

/* Map purchase -> ref for quick lookup when shipping */
const purchaseRefIndex: Record<string, string> = reactive({})

/* NEW: per-reference shipping offer input can be string OR number (from number input) */
const shippingOfferInputByRef: Record<string, string | number> = reactive({})

/* NEW: per-RR return tracking link input cache */
const rrTrackById: Record<string, string> = reactive({})

function rrTrackingLinkFilled(rrId: string): boolean {
  return !!(rrTrackById[rrId] && rrTrackById[rrId].trim().length)
}

busy.value.anyGroup = (k: string): boolean => {
  const ids = groupIndex[k] || []
  return ids.some((id) => !!busy.value.action[id])
}

const statusFilter = ref<(typeof tabs)[number]['value']>('all')
const search = ref('')
const payment = ref<string>('') // UI-only currently
const dateFrom = ref<string>('')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dateTo = ref<string>('')

/* pagination */
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const orders = ref<ViewOrder[]>([])
const productsMap = reactive<Record<string, Product>>({})
const buyersMap = reactive<Record<string, Buyer>>({})
const rrByPurchase = reactive<Record<string, ReturnRefundRow[]>>({})
const signedUrlMap: Record<string, string> = reactive({})
const signingBusy: Record<string, boolean> = reactive({})

/* NEW: for sibling fetches keyed by reference_number (includes all purchases for that ref) */
const siblingsByRef = reactive<Record<string, PurchaseRow[]>>({})

/* NEW: event discount map by reference_number (event.id) */
type EventRow = { id: string; winner_refund_amount: number | string }
const eventDiscountByRef = reactive<Record<string, number>>({})

/* ---------- Helpers ---------- */

// ★ FIX: detect a *real* per-purchase discount (final each < base each)
function perPurchaseDiscountApplied(purchaseId: string): boolean {
  const per = discountedByPurchase[purchaseId]
  if (per == null) return false
  const ord = orders.value.find(o => o.id === purchaseId)
  const base = Number(ord?.items?.[0]?.price_each ?? NaN)
  const perNum = Number(per)
  return isFinite(base) && isFinite(perNum) && perNum < base - 1e-6
}

const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)

/* Clean formatter: "Dec 18, 2025 • 3 PM" */
function formatClean(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  let hours = d.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${month} ${day}, ${year} • ${hours} ${ampm}`
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso as string
  }
}
const shortId = (s: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—')

/* Kept utility */
function genReference(prefix = 'TXN'): string {
  const ts = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14)
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `${prefix}-${ts}-${rnd}`
}

function prettyStatus(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'Pending' // NEW: so badges look nice if you have pending status
  if (k === STATUS.TO_PAY) return 'To Pay'
  if (k === STATUS.TO_SHIP) return 'To Ship'
  if (k === STATUS.TO_RECEIVE) return 'To Receive'
  if (k === STATUS.COMPLETED) return 'Completed'
  if (k === STATUS.RETURN_REFUND) return 'Return/Refund'
  if (k === STATUS.CANCELLED) return 'Cancelled'
  return s || '—'
}
function statusClass(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'text-bg-light border' // NEW
  if (k === STATUS.CANCELLED) return 'text-bg-danger-subtle border'
  if (k === STATUS.RETURN_REFUND) return 'text-bg-warning-subtle border'
  if (k === STATUS.COMPLETED) return 'text-bg-success-subtle border'
  if (k === STATUS.TO_SHIP || k === STATUS.TO_RECEIVE) return 'text-bg-info-subtle border'
  if (k === STATUS.TO_PAY) return 'text-bg-light border'
  return 'text-bg-light border'
}
/* Return/refund helpers */
function prettyRRStatus(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'pending') return 'Pending'
  if (k === 'approved') return 'Approved'
  if (k === 'completed') return 'Completed'
  if (k === 'rejected') return 'Rejected'
  return s || '—'
}
function rrBadgeClass(s?: string | null) {
  const k = String(s || '').toLowerCase()
  if (k === 'approved' || k === 'completed') return 'text-bg-success-subtle border'
  if (k === 'pending') return 'text-bg-warning-subtle border'
  if (k === 'rejected') return 'text-bg-danger-subtle border'
  return 'text-bg-light border'
}
function isRRPending(rr?: ReturnRefundRow) {
  if (!rr) return false
  return String(rr.status || '').toLowerCase() === 'pending'
}
function isRRApproved(rr?: ReturnRefundRow) {
  if (!rr) return false
  return String(rr.status || '').toLowerCase() === 'approved'
}
/** NEW: latest RR status for a purchase (used for To Receive sibling RR badges) */
function rrStatusForPurchase(purchaseId: string): string | null {
  const list = rrByPurchase[purchaseId] || []
  if (!list.length) return null
  const sorted = list.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return String(sorted[0].status || '').toLowerCase()
}

function toArray(u: any): string[] {
  if (!u) return []
  return Array.isArray(u) ? u.filter(Boolean) : [u]
}
function firstUrl(arr: string[] | null): string {
  const a = toArray(arr)
  return a[0] ?? ''
}
function isStoragePath(u: string) {
  return !!u && !/^https?:\/\//i.test(u)
}
function productThumb(prod?: Product): string {
  if (!prod) return ''
  const raw = firstUrl(prod.product_url)
  if (!raw) return ''
  if (!isStoragePath(raw)) return raw
  if (signedUrlMap[prod.id]) return signedUrlMap[prod.id]
  if (!signingBusy[prod.id]) {
    signingBusy[prod.id] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(raw, 3600)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) signedUrlMap[prod.id] = data.signedUrl
      })
      .finally(() => (signingBusy[prod.id] = false))
  }
  return ''
}

/* ---------- NEW: Event/per-purchase discount helpers ---------- */
function winnerRefundForRef(ref?: string | null): number {
  if (!ref) return 0
  return Number(eventDiscountByRef[ref] ?? 0) || 0
}

/* CHANGED: treat group as “discounted” if either event refund > 0 OR any purchase under ref has discounted_price */
// ★ FIX: only treat as discounted if price actually changed
function hasPerPurchaseDiscount(ref?: string | null): boolean {
  if (!ref) return false
  const ids = groupIndex[ref] || []
  return ids.some(perPurchaseDiscountApplied)
}

// ★ FIX: event OR real per-purchase discount
function hasEventDiscount(ref?: string | null): boolean {
  return winnerRefundForRef(ref) > 0 || hasPerPurchaseDiscount(ref)
}


/* use per-purchase discounted_price (final each) when present; else fallback to event-based computation */
// ★ FIX: only use discounted_price if it's < base; otherwise fall back
function discountedPriceEachForItem(it: OrderItem, ref?: string | null): number {
  if (perPurchaseDiscountApplied(it.order_id)) {
    return Number(discountedByPurchase[it.order_id])
  }
  const base = Number(it.price_each || 0)
  const less = winnerRefundForRef(ref)
  return Math.max(0, base - less)
}

function lineTotalAfterDiscount(it: OrderItem, ref?: string | null): number {
  const each = discountedPriceEachForItem(it, ref)
  const qty = Number(it.qty || 1)
  return Number((each * qty).toFixed(2))
}

/* ---------- SHIPPING & DISCOUNT helpers ---------- */
function shippingForRef(ref?: string | null): number {
  if (!ref) return 0
  return Number(shippingByRef[ref] ?? 0) || 0
}
function discountSumForRef(ref?: string | null): number {
  if (!ref) return 0
  return Number(discountByRef[ref] ?? 0) || 0
}

/* FIX: subtract redemptions ONLY for purchases under this ref that DO NOT already have a per-purchase discounted_price.
   This prevents double-subtracting when discounted_price is already the final net price. */
// ★ FIX: exclude vouchers only when a real per-purchase discount was applied
function effectiveDiscountForRef(ref?: string | null): number {
  if (!ref) return 0
  const ids = groupIndex[ref] || []
  let sum = 0
  for (const pid of ids) {
    const redemption = Number(discountByPurchase[pid] || 0) || 0
    if (redemption > 0 && !perPurchaseDiscountApplied(pid)) {
      sum += redemption
    }
  }
  return Number(sum.toFixed(2))
}


/* ---------- Subtotals (original vs discounted) ---------- */
function groupItemsTotalOriginal(g: ViewGroup) {
  return g.items.reduce((sum, it) => sum + Number(it.line_total || 0), 0)
}
function groupItemsTotalDiscounted(g: ViewGroup) {
  if (!hasEventDiscount(g.reference_number)) return groupItemsTotalOriginal(g)
  return g.items.reduce((sum, it) => sum + lineTotalAfterDiscount(it, g.reference_number), 0)
}

/* Subtotal display (ITEMS ONLY — no shipping) */
function groupSubtotalOriginal(g: ViewGroup) {
  return groupItemsTotalOriginal(g)
}
function groupSubtotalDiscounted(g: ViewGroup) {
  return groupItemsTotalDiscounted(g)
}
/* kept legacy name used in template */
function groupSubtotal(g: ViewGroup) {
  return groupSubtotalOriginal(g)
}

/* NEW: net items after discounts (event/per-purchase + rewards) */
function groupItemsNet(g: ViewGroup): number {
  const base = hasEventDiscount(g.reference_number)
    ? groupSubtotalDiscounted(g)
    : groupSubtotalOriginal(g)
  const less = Number(g.discount_total || 0)
  const net = Math.max(0, Number((base - less).toFixed(2)))
  return net
}

/* NEW: explicit item discount amount (original - discounted) */
function groupItemDiscountAmount(g: ViewGroup): number {
  if (!hasEventDiscount(g.reference_number)) return 0
  const orig = groupSubtotalOriginal(g)
  const disc = groupSubtotalDiscounted(g)
  return Math.max(0, Number((orig - disc).toFixed(2)))
}

/* Helper: pull purchase info for badges & links */
function purchaseFromGroup(g: ViewGroup, purchaseId: string): ViewOrder | undefined {
  return g.purchases.find((p) => p.id === purchaseId)
}
function purchaseStatusKey(g: ViewGroup, purchaseId: string): string {
  return String(purchaseFromGroup(g, purchaseId)?.status || '')
}
function purchasePayment(g: ViewGroup, purchaseId: string): string | null {
  return purchaseFromGroup(g, purchaseId)?.payment_method || null
}
function purchaseTrackingLink(g: ViewGroup, purchaseId: string): string | null | undefined {
  return purchaseFromGroup(g, purchaseId)?.tracking_link
}

/* NEW: read the single tracking link per reference (fallback to any purchase link) */
function refTrackingLink(ref?: string | null): string {
  if (!ref) return ''
  const fromMap = (trackLinkByRef[ref] || '').trim()
  if (fromMap) return fromMap
  const found = orders.value.find(
    (o) => o.reference_number === ref && String(o.tracking_link || '').trim()
  )
  return (found?.tracking_link || '').trim()
}

/* ---------- GROUPING (by reference_number) ---------- */
const orderGroups = computed<ViewGroup[]>(() => {
  const byRef: Record<string, ViewOrder[]> = {}
  for (const o of orders.value) {
    const key = o.reference_number || o.id
    if (!byRef[key]) byRef[key] = []
    byRef[key].push(o)
  }

  // Clear & rebuild NON-REACTIVE cache safely inside computed
  for (const k of Object.keys(groupIndex)) delete groupIndex[k]

  const groups: ViewGroup[] = []
  for (const [ref, arr] of Object.entries(byRef)) {
    groupIndex[ref] = arr.map((a) => a.id)

    const created_at = arr
      .map((a) => a.created_at)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]

    const updated_at =
      arr
        .map((a) => a.updated_at)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null

    const statuses = Array.from(new Set(arr.map((a) => String(a.status || '').toLowerCase())))
    const allToPay = statuses.length === 1 && statuses[0] === STATUS.TO_PAY
    const allToShip = statuses.length === 1 && statuses[0] === STATUS.TO_SHIP
    const allPending = statuses.length === 1 && statuses[0] === 'pending' // ★ NEW
    const canGroupCancel = statuses.every((s) => s === STATUS.TO_PAY || s === STATUS.TO_SHIP)

    let statusSummaryLabel = 'Mixed'
    let statusSummaryClassKey = 'mixed'
    if (statuses.length === 1) {
      statusSummaryLabel = prettyStatus(statuses[0])
      statusSummaryClassKey = statuses[0]
    }

    const pays = Array.from(new Set(arr.map((a) => (a.payment_method || '—').toString())))
    const paymentSummaryLabel = pays.length === 1 ? pays[0] || '—' : 'Mixed'
    const paymentSummaryTitle = pays.join(', ')

    const shipping_address = arr[0]?.shipping_address ?? null
    const phone_number = arr[0]?.phone_number ?? null
    const shipping_name = (() => {
      const uid = arr[0]?.user_id
      if (!uid) return null
      return buyersMap[uid]?.full_name ?? null
    })()

    const items = arr.flatMap((a) => a.items)

    // Items totals (respect event/per-purchase discount)
    const itemsTotal = hasEventDiscount(ref)
      ? items.reduce((s, it) => s + lineTotalAfterDiscount(it, ref), 0)
      : items.reduce((s, it) => s + Number(it.line_total || 0), 0)

    // ★ CHANGE: In Offer Shipping, also subtract redemption discounts when no per-purchase discounted price
    // (prevents double-subtract if discounted_price is already applied at item level)
    // ★ FIX: always use the same “effective” logic on every tab
const discount_total_effective = effectiveDiscountForRef(ref)


    const shipFee = shippingForRef(ref)

    // Recorded total includes shipping on all tabs EXCEPT Return/Refund
    const netAfterDiscounts = Math.max(0, Number((itemsTotal - discount_total_effective).toFixed(2)))
    const includeShipping = statusFilter.value !== STATUS.RETURN_REFUND
    const total_amount = Math.max(
      0,
      Number(((netAfterDiscounts + (includeShipping ? shipFee : 0))).toFixed(2)),
    )

    const containsRR = arr.some((a) => (rrByPurchase[a.id] || []).length > 0)

    const siblingRRItems: Array<OrderItem & { rrStatus: string | null }> = []
    const siblingCompletedItems: Array<OrderItem> = []

    const completedRRItems: Array<OrderItem & { rrStatus: string | null }> = []
    if (statusFilter.value === STATUS.COMPLETED) {
      const allForRef: any[] = (siblingsByRef[ref] || []).length
        ? siblingsByRef[ref]
        : arr.map(
            (a) =>
              ({
                id: a.id,
                user_id: a.user_id,
                product_id: a.items[0]?.product_id || '',
                reference_number: ref,
                status: String(a.status || ''),
                created_at: a.created_at,
                updated_at: a.updated_at,
                modeofpayment: a.payment_method,
                qty: a.items[0]?.qty || 1,
                discounted_price: null,
                shipping_fee: null,
                tracking_link: a.tracking_link ?? null,
              }) as PurchaseRow,
          )

      for (const pr of allForRef) {
        const st = String(pr.status || '').toLowerCase()
        if (st === STATUS.RETURN_REFUND) {
          const rrList = rrByPurchase[pr.id] || []
          const hasCompletedRR = rrList.some((r) => String(r.status).toLowerCase() === 'completed')
          if (hasCompletedRR) {
            const prod = productsMap[pr.product_id]
            const qty = Number(pr.qty ?? 1) || 1
            const price = Number(prod?.price ?? 0)
            completedRRItems.push({
              order_id: pr.id,
              product_id: pr.product_id,
              qty,
              price_each: price,
              line_total: Number((price * qty).toFixed(2)),
              product: prod,
              rrStatus: 'completed',
            })
          }
        }
      }
    }

    /* ===== NEW: populate RR + Completed siblings for TO_RECEIVE tab ===== */
    if (statusFilter.value === STATUS.TO_RECEIVE) {
      const allForRef: PurchaseRow[] = (siblingsByRef[ref] && siblingsByRef[ref].length)
        ? siblingsByRef[ref]
        : arr.map(
            (a) =>
              ({
                id: a.id,
                user_id: a.user_id,
                product_id: a.items[0]?.product_id || '',
                reference_number: ref,
                status: String(a.status || ''),
                created_at: a.created_at,
                updated_at: a.updated_at,
                modeofpayment: a.payment_method,
                qty: a.items[0]?.qty || 1,
                discounted_price: discountedByPurchase[a.id] ?? null,
                shipping_fee: null,
                tracking_link: a.tracking_link ?? null,
              }) as PurchaseRow,
          )

      for (const pr of allForRef) {
        const st = String(pr.status || '').toLowerCase()
        const prod = productsMap[pr.product_id]
        const qty = Number(pr.qty ?? 1) || 1
        const price = Number(prod?.price ?? 0)

        if (st === STATUS.RETURN_REFUND) {
          const rrStatus = rrStatusForPurchase(pr.id)
          siblingRRItems.push({
            order_id: pr.id,
            product_id: pr.product_id,
            qty,
            price_each: price,
            line_total: Number((price * qty).toFixed(2)),
            product: prod,
            rrStatus,
          })
        } else if (st === STATUS.COMPLETED) {
          siblingCompletedItems.push({
            order_id: pr.id,
            product_id: pr.product_id,
            qty,
            price_each: price,
            line_total: Number((price * qty).toFixed(2)),
            product: prod,
          })
        }
      }
    }
    /* ===== /NEW ===== */

    groups.push({
      groupKey: ref,
      reference_number: ref,
      created_at,
      updated_at,
      statusSummaryLabel,
      statusSummaryClassKey,
      paymentSummaryLabel,
      paymentSummaryTitle,
      total_amount,
      shipping_name,
      shipping_address,
      phone_number,
      items,
      purchases: arr,
      containsRR,
      allToPay,
      allToShip,
      canGroupCancel,
      siblingRRItems,
      siblingCompletedItems,
      completedRRItems,
      discount_total: discount_total_effective, // expose only the effective discount we subtracted
      allPending, // ★ NEW
    })
  }

  let out = groups.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  if (statusFilter.value === STATUS.COMPLETED) {
    out = out.filter((g) => {
      const allPurchasesForRef = (siblingsByRef[g.reference_number] || [])
        .concat(
          g.purchases.map(
            (p) =>
              ({
                id: p.id,
                user_id: p.user_id,
                product_id: p.items[0]?.product_id || '',
                reference_number: g.reference_number,
                status: String(p.status || ''),
                created_at: p.created_at,
                updated_at: p.updated_at,
                modeofpayment: p.payment_method,
                qty: p.items[0]?.qty || 1,
                discounted_price: discountedByPurchase[p.id] ?? null,
                shipping_fee: null,
                tracking_link: p.tracking_link ?? null,
              }) as PurchaseRow,
          ),
        )

      for (const pr of allPurchasesForRef) {
        const st = String(pr.status).toLowerCase()
        if (st === STATUS.COMPLETED) continue
        if (st === STATUS.RETURN_REFUND) {
          const list = rrByPurchase[pr.id] || []
          const hasPending = list.some((r) => String(r.status).toLowerCase() === 'pending')
          const okNonPending =
            list.length > 0 &&
            list.every((r) => {
              const rs = String(r.status).toLowerCase()
              return rs === 'approved' || rs === 'completed'
            })
          if (hasPending) return false
          if (!okNonPending) return false
          continue
        }
        return false
      }
      return true
    })
  }

  /* NEW: Offer Shipping tab filter:
     show refs with shipping_fee == 0 AND ALL purchases are 'pending' */
  if (statusFilter.value === TAB_OFFER_SHIPPING) {
    out = out.filter((g) => isGroupPendingShipping(g))
  }

  return out
})

function groupRRs(g: ViewGroup): ReturnRefundRow[] {
  const out: ReturnRefundRow[] = []
  for (const p of g.purchases) {
    const list = rrByPurchase[p.id] || []
    if (rrStatusFilter.value === 'all') {
      out.push(...list)
    } else {
      out.push(...list.filter((r) => String(r.status).toLowerCase() === rrStatusFilter.value))
    }
  }
  return out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/* ---------- NEW helpers for Offer Shipping tab ---------- */
function getShippingInputRaw(ref: string): string {
  const v = (shippingOfferInputByRef as Record<string, any>)[ref]
  if (v === null || v === undefined) return ''
  return typeof v === 'string' ? v.trim() : String(v) // ← SAFE COERCION to fix .trim issue
}
function isGroupPendingShipping(g: ViewGroup): boolean {
  const feePending = shippingForRef(g.reference_number) <= 0
  const allPending =
    g.purchases.length > 0 && g.purchases.every((p) => isPending(p.status))
  return feePending && allPending
}
function isOffering(g: ViewGroup): boolean {
  return !!busy.value.action[`offer:${g.reference_number}`]
}
function canOfferShipping(g: ViewGroup): boolean {
  const raw = getShippingInputRaw(g.reference_number)
  const n = Number(raw)
  return raw !== '' && isFinite(n) && n >= 0
}

/* ---------- Fetch & build ---------- */
async function loadOrders(resetPage = false) {
  if (resetPage) page.value = 1
  busy.value.load = true
  try {
    const from = (page.value - 1) * pageSize.value
    const to = from + pageSize.value - 1

    let q = supabase
      .schema('games')
      .from('purchases')
      .select(
        'id,user_id,product_id,reference_number,status,created_at,updated_at,modeofpayment,qty,discounted_price,shipping_fee,tracking_link',
        { count: 'exact' },
      )

    /* CHANGED: avoid filtering by a non-existent status for the custom tab */
    if (statusFilter.value !== 'all' && statusFilter.value !== TAB_OFFER_SHIPPING) q = q.eq('status', statusFilter.value)

    if (dateFrom.value) q = q.gte('created_at', new Date(dateFrom.value).toISOString())
    if (dateTo.value) {
      const end = new Date(dateTo.value)
      end.setDate(end.getDate() + 1)
      q = q.lt('created_at', end.toISOString())
    }

    if (search.value) {
      const term = search.value.trim()
      q = q.or(`reference_number.ilike.%${term}%,id.ilike.%${term}%`)
    }

    q = q.order('created_at', { ascending: false }).range(from, to)

    const { data: rows, error, count } = await q
    if (error) {
      orders.value = []
      total.value = 0
      return
    }

    total.value = count ?? 0
    const purchaseRows = (rows || []) as PurchaseRow[]

    const productIds = new Set<string>()
    const userIds = new Set<string>()
    const purchaseIds = new Set<string>()
    const refSet = new Set<string>()

    for (const p of purchaseRows) {
      if (p.product_id) productIds.add(p.product_id)
      if (p.user_id) userIds.add(p.user_id)
      purchaseIds.add(p.id)
      if (p.reference_number) {
        refSet.add(p.reference_number)
        purchaseRefIndex[p.id] = p.reference_number
      }
      discountedByPurchase[p.id] = p.discounted_price != null ? Number(p.discounted_price) : null
      // seed reference tracking link from any existing purchase link if not set yet
      if (p.reference_number && !trackLinkByRef[p.reference_number] && p.tracking_link) {
        trackLinkByRef[p.reference_number] = p.tracking_link
      }
    }

    let siblingRows: PurchaseRow[] = []
    if (
      refSet.size &&
      (statusFilter.value === STATUS.TO_RECEIVE || statusFilter.value === STATUS.COMPLETED)
    ) {
      const refs = Array.from(refSet)
      const { data: sib } = await supabase
        .schema('games')
        .from('purchases')
        .select(
          'id,user_id,product_id,reference_number,status,created_at,updated_at,modeofpayment,qty,discounted_price,shipping_fee,tracking_link',
        )
        .in('reference_number', refs)

      siblingRows = Array.isArray(sib) ? (sib as PurchaseRow[]) : []
      for (const s of siblingRows) {
        if (s.product_id) productIds.add(s.product_id)
        if (s.user_id) userIds.add(s.user_id)
        purchaseIds.add(s.id)
        discountedByPurchase[s.id] =
          s.discounted_price != null
            ? Number(s.discounted_price)
            : (discountedByPurchase[s.id] ?? null)
        purchaseRefIndex[s.id] = s.reference_number
        if (!trackLinkByRef[s.reference_number] && s.tracking_link) {
          trackLinkByRef[s.reference_number] = s.tracking_link
        }
      }
      for (const r of refs) siblingsByRef[r] = siblingRows.filter((s) => s.reference_number === r)
    } else {
      for (const k of Object.keys(siblingsByRef)) delete siblingsByRef[k]
    }

    if (productIds.size > 0) {
      const { data: prows } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,description,price,product_url')
        .in('id', Array.from(productIds))
      if (Array.isArray(prows)) {
        for (const p of prows as Product[]) productsMap[p.id] = p
      }
    }

    if (userIds.size > 0) {
      const { data: urows } = await supabase
        .from('users')
        .select('id, full_name, phone_number, address')
        .in('id', Array.from(userIds))
      if (Array.isArray(urows)) {
        for (const u of urows as Buyer[]) buyersMap[u.id] = u
      }
    }

    for (const k of Object.keys(rrByPurchase)) delete rrByPurchase[k]

    const needRR =
      (statusFilter.value === STATUS.RETURN_REFUND ||
        statusFilter.value === 'all' ||
        statusFilter.value === STATUS.TO_RECEIVE ||
        statusFilter.value === STATUS.COMPLETED ||
        statusFilter.value === TAB_OFFER_SHIPPING) &&
      purchaseIds.size > 0

    if (needRR) {
      let rrQ = supabase
        .schema('games')
        .from('return_refunds')
        .select('id,user_id,purchase_id,product_id,reason,details,status,created_at,updated_at,refund_tracking_link')
        .in('purchase_id', Array.from(purchaseIds))

      if (statusFilter.value === STATUS.RETURN_REFUND && rrStatusFilter.value !== 'all') {
        rrQ = rrQ.eq('status', rrStatusFilter.value)
      }

      const { data: rrRows } = await rrQ
      if (Array.isArray(rrRows)) {
        for (const r of rrRows as ReturnRefundRow[]) {
          const arr = rrByPurchase[r.purchase_id] || []
          arr.push(r)
          rrByPurchase[r.purchase_id] = arr
          // prime input cache with existing DB value if present
          if (r.refund_tracking_link && !rrTrackById[r.id]) {
            rrTrackById[r.id] = r.refund_tracking_link
          }
        }
      }
    }

    for (const k of Object.keys(eventDiscountByRef)) delete eventDiscountByRef[k]
    if (refSet.size > 0) {
      const { data: evRows } = await supabase
        .schema('games')
        .from('event')
        .select('id,winner_refund_amount')
        .in('id', Array.from(refSet))
      if (Array.isArray(evRows)) {
        for (const e of evRows as EventRow[]) {
          eventDiscountByRef[e.id] = Number(e.winner_refund_amount || 0) || 0
        }
      }
    }

    for (const k of Object.keys(discountByPurchase)) delete discountByPurchase[k]
    for (const k of Object.keys(discountByRef)) delete discountByRef[k]

    if (purchaseIds.size > 0) {
      const { data: drows } = await supabase
        .schema('rewards')
        .from('discount_redemptions')
        .select('purchase_id,redeemed_amount,discount_id,created_at')
        .in('purchase_id', Array.from(purchaseIds))
      if (Array.isArray(drows)) {
        for (const d of drows as DiscountRow[]) {
          const pid = d.purchase_id
          const amt = Number(d.redeemed_amount || 0) || 0
          discountByPurchase[pid] = (discountByPurchase[pid] || 0) + amt
        }
      }
    }

    for (const ref of Array.from(refSet)) {
      let pids = purchaseRows.filter((p) => p.reference_number === ref).map((p) => p.id)
      if ((siblingsByRef[ref] || []).length) {
        pids = siblingsByRef[ref].map((s) => s.id)
      }
      const sum = pids.reduce((acc, pid) => acc + Number(discountByPurchase[pid] || 0), 0)
      if (sum > 0) discountByRef[ref] = Number(sum.toFixed(2))
    }

    for (const k of Object.keys(shippingByRef)) delete shippingByRef[k]
    function maxShippingFrom(list: PurchaseRow[]) {
      let max = 0
      for (const p of list) {
        const v = Number(p.shipping_fee ?? 0) || 0
        if (v > max) max = v
      }
      return max
    }
    for (const ref of Array.from(refSet)) {
      const list =
        (siblingsByRef[ref] && siblingsByRef[ref].length
          ? siblingsByRef[ref]
          : purchaseRows.filter((p) => p.reference_number === ref)) || []
      shippingByRef[ref] = maxShippingFrom(list)

      // prime the input with current shipping (if any)
      if (shippingByRef[ref] > 0 && !shippingOfferInputByRef[ref]) {
        shippingOfferInputByRef[ref] = String(shippingByRef[ref])
      }
    }

    let view: ViewOrder[] = purchaseRows.map((pr) => {
      const prod = productsMap[pr.product_id]
      const buyer = buyersMap[pr.user_id]
      const price = Number(prod?.price ?? 0)
      const qty = Number(pr.qty ?? 1) || 1

      const item: OrderItem = {
        order_id: pr.id,
        product_id: pr.product_id,
        qty,
        price_each: price,
        line_total: Number((price * qty).toFixed(2)),
        product: prod,
      }

      return {
        id: pr.id,
        user_id: pr.user_id,
        reference_number: pr.reference_number,
        total_amount: item.line_total,
        payment_method: pr.modeofpayment || null,
        shipping_address: buyer?.address ?? null,
        phone_number: buyer?.phone_number ?? null,
        status: pr.status,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        items: [item],
        tracking_link: pr.tracking_link ?? null,
      }
    })

    if (statusFilter.value === STATUS.RETURN_REFUND && rrStatusFilter.value !== 'all') {
      const keep = new Set<string>()
      for (const [pid, list] of Object.entries(rrByPurchase)) {
        if (list.some((r) => String(r.status).toLowerCase() === rrStatusFilter.value)) keep.add(pid)
      }
      view = view.filter((v) => keep.has(v.id))
      total.value = view.length
    }

    if (search.value) {
      const term = search.value.trim().toLowerCase()
      view = view.filter(
        (v) =>
          (v.reference_number || '').toLowerCase().includes(term) ||
          (v.id || '').toLowerCase().includes(term) ||
          (v.shipping_address || '').toLowerCase().includes(term) ||
          (v.phone_number || '').toLowerCase().includes(term) ||
          v.items.some(
            (it) =>
              (it.product?.name || '').toLowerCase().includes(term) ||
              (it.product?.description || '').toLowerCase().includes(term),
          ),
      )
      total.value = view.length
    }

    orders.value = view
  } finally {
    busy.value.load = false
  }
}

/* ---------- Actions ---------- */
async function updateStatus(purchaseId: string, status: string) {
  busy.value.action[purchaseId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status })
      .eq('id', purchaseId)

    if (error) {
      alert(error.message)
      return
    }
    const row = orders.value.find((o) => o.id === purchaseId)
    if (row) row.status = status
  } finally {
    busy.value.action[purchaseId] = false
  }
}

/* STOCK RESTORE */
async function restoreStock(productId?: string | null, qty?: number | null) {
  try {
    const pid = String(productId || '')
    const addQty = Number(qty ?? 0)
    if (!pid || !isFinite(addQty) || addQty <= 0) return

    const { data: prod, error: getErr } = await supabase
      .schema('games')
      .from('products')
      .select('stock')
      .eq('id', pid)
      .single()

    if (getErr || !prod) {
      console.error('[restoreStock] fetch stock failed', getErr?.message)
      return
    }

    const newStock = Number(prod.stock || 0) + addQty

    const { error: upErr } = await supabase
      .schema('games')
      .from('products')
      .update({ stock: newStock })
      .eq('id', pid)

    if (upErr) {
      console.error('[restoreStock] update stock failed', upErr.message)
    }
  } catch (e: any) {
    console.error('[restoreStock] exception', e?.message || e)
  }
}

/* Single source of truth: tracking link is per reference */
function trackingFilledRef(ref?: string | null): boolean {
  if (!ref) return false
  return !!(trackLinkByRef[ref]?.trim().length)
}

async function markAsShipped(purchaseId: string) {
  const ref = purchaseRefIndex[purchaseId] || orders.value.find(o => o.id === purchaseId)?.reference_number
  const link = (ref && trackLinkByRef[ref]) ? trackLinkByRef[ref].trim() : ''
  if (!link) {
    alert('Please enter the reference tracking link before marking as shipped.')
    return
  }
  busy.value.action[purchaseId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.TO_RECEIVE, tracking_link: link })
      .eq('id', purchaseId)

    if (error) {
      alert(error.message)
      return
    }

    const row = orders.value.find((o) => o.id === purchaseId)
    if (row) {
      row.status = STATUS.TO_RECEIVE
      row.tracking_link = link
    }
  } finally {
    busy.value.action[purchaseId] = false
  }
}
async function markAsCompleted(purchaseId: string) {
  await updateStatus(purchaseId, STATUS.COMPLETED)
}

/* helper: detect e-wallet */
function isEwalletPayment(method?: string | null) {
  const k = String(method || '').trim().toLowerCase()
  return k === 'ewallet' || k === 'e-wallet' || k === 'e wallet'
}
/* NEW helper: detect COD */
function isCODPayment(method?: string | null) {
  return String(method || '').trim().toLowerCase() === 'cod'
}

/* ---------- helpers to decide shipping refund conditions ---------- */
async function allPurchasesCancelledForRef(ref: string): Promise<boolean> {
  const { data: rows } = await supabase
    .schema('games')
    .from('purchases')
    .select('status')
    .eq('reference_number', ref)
  if (!Array.isArray(rows)) return false
  return rows.every((r) => String(r.status || '').toLowerCase() === STATUS.CANCELLED)
}
async function countCompletedRefundsForRef(ref: string): Promise<number> {
  const { data: pRows } = await supabase
    .schema('games')
    .from('purchases')
    .select('id')
    .eq('reference_number', ref)
  if (!Array.isArray(pRows) || pRows.length === 0) return 0
  const pids = pRows.map((r) => r.id)
  const { data: rrRows } = await supabase
    .schema('games')
    .from('return_refunds')
    .select('id,status')
    .in('purchase_id', pids)
  if (!Array.isArray(rrRows)) return 0
  return rrRows.filter((r) => String(r.status).toLowerCase() === 'completed').length
}

/* ---------- NEW: helper to read redeemed discount amount for a purchase ---------- */
async function redeemedDiscountAmount(purchaseId: string): Promise<number> {
  if (purchaseId in discountByPurchase) {
    return Number(discountByPurchase[purchaseId] || 0) || 0
  }
  try {
    const { data, error } = await supabase
      .schema('rewards')
      .from('discount_redemptions')
      .select('redeemed_amount')
      .eq('purchase_id', purchaseId)

    if (error || !Array.isArray(data)) return 0
    return data.reduce((s, r: any) => s + (Number(r?.redeemed_amount || 0) || 0), 0)
  } catch {
    return 0
  }
}

/* CANCEL ORDER (kept from previous) */
async function cancelOrder(purchaseId: string, skipConfirm = false) {
  if (!skipConfirm && !confirm('Cancel this order?')) return
  const order = orders.value.find((o) => o.id === purchaseId)
  if (order) {
    // continue with existing branch logic
  }
  const statusKey = String(order?.status || '').toLowerCase()
  const isToShip = statusKey === STATUS.TO_SHIP
  const isToPay = statusKey === STATUS.TO_PAY

  const isEwallet = isEwalletPayment(order?.payment_method)
  const isCOD = isCODPayment(order?.payment_method)

  const shouldRefundEwallet = isEwallet && isToShip
  const shouldInsertCODReceipt = isCOD && (isToPay || isToShip)

  const item = order?.items?.[0]
  const productIdForStock = item?.product_id || null
  const qtyForStock = item?.qty ?? 1

  busy.value.action[purchaseId] = true
  try {
    if (shouldRefundEwallet) {
      const { error: upErr } = await supabase
        .schema('games')
        .from('purchases')
        .update({ status: STATUS.CANCELLED })
        .eq('id', purchaseId)
        .eq('status', STATUS.TO_SHIP)

      if (upErr) {
        alert(upErr.message); return
      }

      const itemsSubtotal = order!.items.reduce((s, it) => s + Number(it.line_total || 0), 0)
      const redeemed = await redeemedDiscountAmount(purchaseId)
      const netRefundItems = Math.max(0, Number((itemsSubtotal - redeemed).toFixed(2)))

      const userId = order!.user_id
      const { data: urow, error: uErr } = await supabase
        .from('users')
        .select('id,balance')
        .eq('id', userId)
        .single()

      if (!uErr && urow) {
        const newBal = Number(Number(urow.balance || 0) + Number(netRefundItems)).toFixed(2)
        await supabase.from('users').update({ balance: Number(newBal) }).eq('id', userId)
      }

      try {
        await supabase
          .schema('ewallet')
          .from('cancelled_ewallet_receipt')
          .insert({
            amount: Number(netRefundItems.toFixed(2)),
            reference_number: order!.reference_number || null,
            purchase_id: purchaseId,
          })
      } catch {}

      await restoreStock(productIdForStock, qtyForStock)

      try {
        if (order!.reference_number && (await allPurchasesCancelledForRef(order!.reference_number))) {
          const ship = shippingForRef(order!.reference_number)
          if (ship > 0) {
            const { data: urow2 } = await supabase
              .from('users')
              .select('id,balance')
              .eq('id', order!.user_id)
              .single()
            if (urow2) {
              const newBal2 = Number(Number(urow2.balance || 0) + ship).toFixed(2)
              await supabase.from('users').update({ balance: Number(newBal2) }).eq('id', order!.user_id)
              try {
                await supabase
                  .schema('ewallet')
                  .from('cancelled_ewallet_receipt')
                  .insert({
                    amount: Number(ship.toFixed(2)),
                    reference_number: order!.reference_number || null,
                    purchase_id: purchaseId,
                  })
              } catch {}
            }
          }
        }
      } catch {}

      if (order) order.status = STATUS.CANCELLED
      return
    }

    if (shouldInsertCODReceipt) {
      const { error: upErr } = await supabase
        .schema('games')
        .from('purchases')
        .update({ status: STATUS.CANCELLED })
        .eq('id', purchaseId)
        .eq('status', order!.status as string)

      if (upErr) { alert(upErr.message); return }

      try {
        await supabase
          .schema('ewallet')
          .from('cancelled_receipt')
          .insert({
            purchase_id: purchaseId,
            reference_number: order!.reference_number || null,
          })
      } catch {}

      await restoreStock(productIdForStock, qtyForStock)
      if (order) order.status = STATUS.CANCELLED
      return
    }

    await updateStatus(purchaseId, STATUS.CANCELLED)
    await restoreStock(productIdForStock, qtyForStock)
  } finally {
    busy.value.action[purchaseId] = false
  }
}

/* Approve order (unchanged) */
async function approveOrder(order: ViewOrder) {
  const purchaseId = order.id
  busy.value.action[purchaseId] = true
  try {
    if (order.status !== STATUS.TO_PAY) {
      alert('Only "To Pay" orders can be approved.')
      return
    }

    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.TO_SHIP })
      .eq('id', purchaseId)

    if (upErr) { alert(upErr.message); return }

    const row = orders.value.find((o) => o.id === purchaseId)
    if (row) row.status = STATUS.TO_SHIP

    const isCOD = String(order.payment_method || '').toLowerCase() === 'cod'
    if (isCOD) {
      const item = order.items[0]
      if (item) {
        const amount = Number(item.price_each || 0) * Number(item.qty || 1)
        try {
          await supabase
            .schema('ewallet')
            .from('order_receipt')
            .insert({
              amount: Number(amount.toFixed(2)),
              reference_number: order.reference_number || null,
            })
        } catch {}
      }
    }
  } finally {
    busy.value.action[purchaseId] = false
  }
}

/* === NEW: helper to increment users.purchases_per_month === */
async function addToPurchasesPerMonth(userId: string, amount: number) {
  const safe = Number(amount || 0)
  if (!userId || !isFinite(safe) || safe <= 0) return
  const { data: urow, error: uErr } = await supabase
    .from('users')
    .select('id,purchases_per_month')
    .eq('id', userId)
    .single()
  if (uErr || !urow) return
  const current = Number(urow.purchases_per_month || 0)
  const next = Number((current + safe).toFixed(2))
  await supabase.from('users').update({ purchases_per_month: next }).eq('id', userId)
}

/* Approve/Reject/Complete Refund */
async function approveRefund(rr: ReturnRefundRow) {
  if (!rr) return
  const rrId = rr.id
  const link = (rrTrackById[rrId] || '').trim()
  if (!link) {
    alert('Please enter the return tracking link before approval.')
    return
  }
  busy.value.action[rrId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'approved', refund_tracking_link: link })
      .eq('id', rrId)
    if (error) { alert(error.message); return }
    rr.status = 'approved'
    rr.refund_tracking_link = link
  } finally {
    busy.value.action[rrId] = false
  }
}
async function rejectRefund(rr: ReturnRefundRow) {
  if (!rr) return
  if (!confirm('Reject this refund request?')) return
  const rrId = rr.id
  busy.value.action[rrId] = true
  try {
    // 1) Update RR status to rejected
    const { error } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'rejected' })
      .eq('id', rrId)
    if (error) { alert(error.message); return }
    rr.status = 'rejected'

    // 2) Add item price * qty to users.purchases_per_month
    const { data: purchase, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id,product_id,qty,reference_number')
      .eq('id', rr.purchase_id)
      .single()
    if (!pErr && purchase) {
      const { data: product, error: prodErr } = await supabase
        .schema('games')
        .from('products')
        .select('id,price')
        .eq('id', rr.product_id || purchase.product_id)
        .single()
      if (!prodErr && product) {
        const qty = Number(purchase.qty ?? 1) || 1
const baseEach = Number(product.price || 0)

// Prefer per-purchase discounted price if truly applied; else use event discount; else base
let effectiveEach =
  discountedByPurchase[purchase.id] != null ? Number(discountedByPurchase[purchase.id]) : NaN

if (!(isFinite(effectiveEach) && effectiveEach >= 0)) {
  const ref = purchase.reference_number || purchaseRefIndex[purchase.id]
  const eventLess = winnerRefundForRef(ref)
  effectiveEach = Math.max(0, baseEach - Number(eventLess || 0))
}

if (!(isFinite(effectiveEach) && effectiveEach >= 0)) {
  effectiveEach = baseEach
}

const amount = Math.max(0, Number((effectiveEach * qty).toFixed(2)))
await addToPurchasesPerMonth(purchase.user_id, amount)

      }
    }
  } finally {
    busy.value.action[rrId] = false
  }
}
async function completeRefund(rr: ReturnRefundRow) {
  if (!rr) return
  if (!isRRApproved(rr)) { alert('Only "Approved" refunds can be completed.'); return }

  const rrId = rr.id
  busy.value.action[rrId] = true
  try {
    const { data: purchase, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id,product_id,qty,reference_number,modeofpayment')
      .eq('id', rr.purchase_id)
      .single()
    if (pErr || !purchase) { alert(pErr?.message || 'Purchase not found for this refund.'); return }

    const ref = purchase.reference_number

    /* === CHANGED: Never refund shipping for completed refunds === */
    let includeShipping = false
    // (previous logic disabled by request)

    const { data: product, error: prodErr } = await supabase
      .schema('games')
      .from('products')
      .select('id,price')
      .eq('id', rr.product_id || purchase.product_id)
      .single()
    if (prodErr || !product) { alert(prodErr?.message || 'Product not found for this refund.'); return }

    const qty = Number(purchase.qty ?? 1) || 1
    const baseEach = Number(product.price || 0)
    let effectiveEach =
      discountedByPurchase[purchase.id] != null ? Number(discountedByPurchase[purchase.id]) : NaN
    if (!(isFinite(effectiveEach) && effectiveEach >= 0)) {
      const eventLess = winnerRefundForRef(purchase.reference_number)
      effectiveEach = Math.max(0, baseEach - Number(eventLess || 0))
    }
    if (!(isFinite(effectiveEach) && effectiveEach >= 0)) {
      effectiveEach = baseEach
    }
    const productRefund = Number((effectiveEach * qty).toFixed(2))
    if (!isFinite(productRefund) || productRefund <= 0) { alert('Invalid refund amount computed.'); return }

    const { error: rrUpdateErr } = await supabase
      .schema('games')
      .from('return_refunds')
      .update({ status: 'completed' })
      .eq('id', rrId)
      .eq('status', 'approved')
      .select('id')
      .single()
    if (rrUpdateErr) { alert(rrUpdateErr.message); return }

    const { data: urow, error: uErr } = await supabase
      .from('users')
      .select('id,balance')
      .eq('id', purchase.user_id)
      .single()
    if (uErr || !urow) { alert(uErr?.message || 'User not found for refund credit.'); return }

    let newBal = Number(urow.balance || 0) + productRefund
    try {
      await supabase.schema('ewallet').from('refund_receipt').insert({
        return_refund_id: rrId,
        amount_refunded: productRefund,
      })
    } catch {}

    // NOTE: Shipping refund is intentionally disabled
    if (includeShipping && ref) {
      /* no-op by design */
    }

    const { error: balErr } = await supabase
      .from('users')
      .update({ balance: newBal })
      .eq('id', purchase.user_id)
    if (balErr) { alert(balErr.message); return }

    await restoreStock(rr.product_id || purchase.product_id, qty)
    rr.status = 'completed'
  } finally {
    busy.value.action[rrId] = false
  }
}

/* GROUP ACTIONS */
async function approveGroup(g: ViewGroup) {
  for (const o of g.purchases) {
    if (o.status === STATUS.TO_PAY) {
      await approveOrder(o)
    }
  }
}
function canGroupMarkAsShipped(g: ViewGroup): boolean {
  if (!g.allToShip) return false
  return trackingFilledRef(g.reference_number)
}
async function markGroupAsShipped(g: ViewGroup) {
  if (!canGroupMarkAsShipped(g)) {
    alert('Please provide the reference tracking link before marking as shipped.')
    return
  }
  for (const o of g.purchases) {
    if (o.status === STATUS.TO_SHIP) {
      await markAsShipped(o.id)
    }
  }
}
async function cancelGroup(g: ViewGroup) {
  if (!confirm('Cancel all purchases under this reference?')) return
  for (const o of g.purchases) {
    await cancelOrder(o.id, true /* skipConfirm */)
  }
}

/* Filters & pagination */
function setStatus(v: (typeof tabs)[number]['value']) {
  if (statusFilter.value !== v) {
    statusFilter.value = v
    if (statusFilter.value !== STATUS.RETURN_REFUND) rrStatusFilter.value = 'all'
    loadOrders(true)
  }
}
function setRRStatus(v: RRFilter) {
  if (rrStatusFilter.value !== v) {
    rrStatusFilter.value = v
    if (statusFilter.value === STATUS.RETURN_REFUND) {
      loadOrders(true)
    }
  }
}
function applyFilters() { loadOrders(true) }
function clearFilters() {
  search.value = ''
  payment.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  loadOrders(true)
}
function goTo(p: number) {
  const max = totalPages.value
  const next = Math.min(Math.max(1, p), max)
  if (next !== page.value) {
    page.value = next
    loadOrders()
  }
}

/* NEW: jump to Return/Refund tab */
function viewReturnDetails() {
  statusFilter.value = STATUS.RETURN_REFUND
  rrStatusFilter.value = 'all'
  loadOrders(true)
}

/* ===== Modal state & helpers ===== */
const selectedRef = ref<string | null>(null)
const selectedGroup = computed(
  () => orderGroups.value.find((g) => g.reference_number === selectedRef.value) || null,
)
const selectedGroupHasToShip = computed(() =>
  !!selectedGroup.value?.purchases.some(p => String(p.status).toLowerCase() === STATUS.TO_SHIP),
)
function openGroupModal(g: ViewGroup) {
  selectedRef.value = g.reference_number
  // Initialize ref link if missing from any purchase that has it
  if (!trackLinkByRef[g.reference_number]) {
    const found = g.purchases.find(p => (p.tracking_link || '').trim())
    if (found?.tracking_link) trackLinkByRef[g.reference_number] = found.tracking_link
  }
}
function closeGroupModal() { selectedRef.value = null }
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedRef.value) closeGroupModal()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
/* ===== /Modal ===== */

/* ===== NEW: Offer Shipping action ===== */
async function offerShipping(g: ViewGroup) {
  const ref = g.reference_number
  const raw = getShippingInputRaw(ref) // SAFE
  const amount = Number(raw)
  if (!isFinite(amount) || amount < 0) {
    alert('Please enter a valid shipping fee (₱).')
    return
  }
  busy.value.action[`offer:${ref}`] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ shipping_fee: amount })
      .eq('reference_number', ref)

    if (error) {
      alert(error.message)
      return
    }
    // Update local cache & refresh
    shippingByRef[ref] = Number(amount.toFixed(2))
    await loadOrders() // refresh totals and hide from the tab if not pending anymore
    alert('Shipping fee saved for this reference.')
  } finally {
    busy.value.action[`offer:${ref}`] = false
  }
}
 /* ===== /NEW ===== */

 /* Init */
onMounted(() => { loadOrders(true) })
</script>

<style scoped>
/* Subtle card styling */
.card { border: 1px solid #edf0f3; }
.bg-light-subtle { background: #f8f9fa; }

/* Pills look */
.nav-pills .nav-link { border-radius: 999px; }
.nav-pills .nav-link:not(.active) { background: #f8f9fa; color: #212529; }

/* Thumbs */
.order-thumb { width: 64px; min-width: 64px; border-radius: 10px; overflow: hidden; }
.object-fit-cover { object-fit: cover; }

/* Hide messy descriptions but keep original node intact */
.order-desc { display: none !important; }

/* Ellipsis for long titles in card body */
.title-ellipsis {
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tight badges for item metadata */
.badge { color: #212529; }
.badge-tight {
  font-weight: 500;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  line-height: 1;
}

/* Modal styling */
.orders-modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 1050;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.orders-modal-card {
  width: 100%; max-width: 980px; background: var(--bs-body-bg, #fff);
  color: var(--bs-body-color, #212529); border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 1rem 1rem 1.25rem; max-height: 90vh; overflow: hidden;
  display: flex; flex-direction: column;
}
.orders-modal-body { overflow: auto; padding-right: 0.25rem; }
</style>
