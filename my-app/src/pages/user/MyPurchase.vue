<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h4 m-0">My Purchases</h1>
        <p class="text-muted small mb-0">Track your orders and delivery status.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="busy.load"
          @click="loadPurchases"
        >
          <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Tabs (Shopee-like) -->
    <ul class="nav nav-pills mb-3 flex-wrap gap-2">
      <li v-for="t in tabs" :key="t.value" class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: activeTab === t.value }"
          @click="activeTab = t.value"
        >
          <span>{{ t.label }}</span>
          <span class="badge text-bg-light border">{{ counts[t.value] || 0 }}</span>
        </button>
      </li>
    </ul>

    <!-- Return/Refund Subtabs (hidden but kept) -->
    <div v-if="false && activeTab === STATUS.RETURN_REFUND" class="mb-3">
      <ul class="nav nav-pills flex-wrap gap-2">
        <li v-for="st in rrSubtabs" :key="st.value" class="nav-item">
          <button
            class="nav-link d-flex align-items-center gap-2"
            :class="{ active: activeRR === st.value }"
            @click="activeRR = st.value"
          >
            <span>{{ st.label }}</span>
            <span class="badge text-bg-light border">{{ rrCounts[st.value] || 0 }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Loading -->
    <div v-if="busy.load" class="text-center text-muted py-5">
      <div class="spinner-border mb-3"></div>
      <div>Loading your purchases…</div>
    </div>

    <!-- Empty -->
    <div v-else-if="groupedFiltered.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-bag-x" style="font-size: 1.6rem"></i>
      <div class="mt-2">No purchases found for “{{ tabLabel(activeTab) }}”.</div>
      <RouterLink :to="{ name: 'user.shop' }" class="btn btn-primary btn-sm mt-3">
        Go to Shop
      </RouterLink>
    </div>

    <!-- ====== Grouped Purchases list ====== -->
    <div v-else-if="showGrouped" class="row g-3">
      <div v-for="g in groupedFiltered" :key="g.ref" class="col-12">
        <div
          class="card shadow-sm rounded-4 clickable-card"
          :class="{ 'border-warning': g.ref === highlightRef }"
          @click="openGroupDetails(g)"
        >
          <div class="card-body">
            <!-- Group header -->
            <div class="d-flex flex-wrap align-items-center justify-content-between">
              <div class="d-flex flex-column">
                <div class="fw-semibold">
                  <span class="text-muted">Ref#</span>
                  <span class="ms-1">{{ g.ref }}</span>
                </div>
                <div class="small text-muted">Updated: {{ formatDate(g.updated_at) }}</div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="statusClass(g.status)">
                  {{ prettyStatusWithRR(g.status, undefined, g) }}
                </span>
              </div>
            </div>

            <!-- ===== NEW: Event Winner ticket (if ref is an event id) ===== -->
            <div
              v-if="eventTitleForRef(g.ref)"
              class="mt-2 d-flex flex-wrap align-items-center gap-2"
              @click.stop
            >
              <div class="event-ticket" :title="eventTitleForRef(g.ref)">
                <div class="ticket-left">
                  <i class="bi bi-trophy me-1"></i>
                  <span class="ticket-title">{{ eventTitleForRef(g.ref) }}</span>
                </div>
                <div class="ticket-divider" aria-hidden="true"></div>
                <div class="ticket-right">
                  <span class="ticket-tag ticket-tag--event">EVENT WINNER</span>
                </div>
              </div>
            </div>

            <!-- ===== NEW: Discount ticket(s) for this group (if any) ===== -->
            <div
              v-if="discountsForRef(g.ref).length"
              class="mt-2 d-flex flex-wrap align-items-center gap-2"
              @click.stop
            >
              <div
                v-for="d in discountsForRef(g.ref)"
                :key="d.id"
                class="discount-ticket"
                title="Discount applied"
              >
                <div class="ticket-left">
                  <i class="bi bi-ticket-perforated me-1"></i>
                  <span class="ticket-title" :title="d.title">{{ d.title }}</span>
                </div>
                <div class="ticket-divider" aria-hidden="true"></div>
                <div class="ticket-right">
                  <span class="ticket-value">{{ discountLabel(d) }}</span>
                  <span class="ticket-tag">APPLIED</span>
                </div>
              </div>
            </div>

            <!-- ===== NEW: Tracking link if any item is To Receive ===== -->
            <div
              v-if="groupToReceiveCount(g) > 0 && trackingLinkFor(g.ref)"
              class="mt-2"
              @click.stop
            >
              <a
                :href="trackingLinkFor(g.ref)"
                target="_blank"
                rel="noopener"
                class="small text-primary text-decoration-underline"
                title="Open tracking in a new tab"
              >
                Track your package
              </a>
            </div>
            <!-- ========================================================= -->

            <!-- Items inside group -->
            <div class="mt-3 vstack gap-2">
              <div
                v-for="it in g.items"
                :key="it.id"
                class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle"
                @click.stop="openGroupDetails(g, it.id)"
              >
                <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
                  <img
                    v-if="productThumb(it)"
                    :src="productThumb(it)"
                    :alt="productName(it)"
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
                  <div class="d-flex align-items-center justify-content-between gap-2">
                    <div
                      class="fw-semibold title-ellipsis"
                      :title="productName(it)"
                      :class="{ 'text-danger': !!rrStatus(it.id) }"
                    >
                      {{ productName(it) }}
                    </div>

                    <!-- PRICE (special display for discount_redemptions) -->
                    <div class="text-end ms-2">
                      <template v-if="refHasRedemption(g.ref)">
                        <div class="fw-semibold">
                          ₱ {{ number(productPrice(it)) }}
                        </div>
                      </template>

                      <template v-else-if="refHasDiscount(g.ref)">
                        <div class="text-muted text-decoration-line-through">
                          ₱ {{ number(productPrice(it)) }}
                        </div>
                        <div class="fw-semibold text-success">
                          ₱ {{ number(discountedUnitPrice(it)) }}
                        </div>
                      </template>

                      <template v-else>
                        <div :class="['fw-semibold', { 'text-danger': !!rrStatus(it.id) }]">
                          ₱ {{ number(productPrice(it)) }}
                        </div>
                      </template>

                      <!-- NEW: Qty + per-product subtotal (only when qty > 1) -->
                      <div class="small text-muted mt-1" v-if="(Number(it?.qty ?? 1) || 1) > 1">
                        Qty: {{ Number(it?.qty ?? 1) }} • Subtotal:
                        <span class="fw-semibold"> ₱ {{ number(subtotalFor(it)) }} </span>
                      </div>
                    </div>
                  </div>

                  <!-- Two badges: status + mode of payment -->
                  <div class="mt-1 d-flex flex-wrap align-items-center gap-2">
                    <span class="badge" :class="statusClass(it.status)">
                      {{ prettyStatusWithRR(it.status, it.id) }}
                    </span>
                    <span class="badge text-bg-secondary-subtle border">
                      {{ prettyModeOfPayment(it.modeofpayment) }}
                    </span>
                  </div>
                </div>

                <!-- View RR details (disabled on RR tab) -->
                <div class="text-end">
                  <div class="mt-2" v-if="rrStatus(it.id) && activeTab !== STATUS.RETURN_REFUND">
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click.stop="goToReturnTab(g.ref)"
                      title="View return details for this reference"
                    >
                      View return details
                    </button>
                  </div>
                </div>
                <!-- NOTE: per-item Order Received button removed -->
              </div>
            </div>

            <!-- Group totals -->
            <div class="mt-3 d-flex align-items-center justify-content-end">
              <div class="text-end">

                <!-- ================= NEW: Price breakdown ABOVE Subtotal ================= -->
                <div class="small text-muted mb-1">
                  <div>Items: ₱ {{ number(groupItemsBaseTotal(g)) }}</div>
                  <div v-if="refHasDiscount(g.ref)">
                    Discount: −₱ {{ number(groupDiscountAmount(g)) }}
                  </div>
                  <div>Shipping: ₱ {{ number(shippingFor(g.ref)) }}</div>
                </div>
                <!-- ================================================================ -->

                <div class="small text-muted">Subtotal</div>

                <!-- SUBTOTAL (now shows slash + discounted when applicable) -->
                <template v-if="refHasDiscount(g.ref)">
                  <div class="text-muted text-decoration-line-through">
                    ₱ {{ number(groupTotal(g)) }}
                  </div>
                  <div class="fs-5 fw-bold text-success">
                    ₱ {{ number(groupTotalDiscounted(g)) }}
                  </div>
                </template>
                <template v-else>
                  <div class="fs-5 fw-bold">₱ {{ number(groupTotal(g)) }}</div>
                </template>
              </div>
            </div>

            <!-- Group actions -->
            <div class="mt-3 d-flex align-items-center justify-content-end">
              <div class="d-flex gap-2 flex-wrap">
                <!-- to pay: Cancel group -->
                <button
                  v-if="g.status === STATUS.TO_PAY"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="groupBusy.cancel[g.ref]"
                  @click.stop="cancelGroup(g)"
                >
                  <span
                    v-if="groupBusy.cancel[g.ref]"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  Cancel
                </button>

                <!-- to ship: NO BUTTONS -->
                <template v-else-if="g.status === STATUS.TO_SHIP">
                  <!-- intentionally empty -->
                </template>

                <!-- RETURN/REFUND tab: show 'Refund Other Product' only when there are items still TO_RECEIVE -->
                <template
                  v-else-if="
                    activeTab === STATUS.RETURN_REFUND &&
                    g.items.some((it) => it.status === STATUS.TO_RECEIVE)
                  "
                >
                  <button
                    class="btn btn-outline-warning btn-sm"
                    @click.stop="goRefundOtherProducts(g)"
                    title="Go to To Receive tab to refund remaining product(s)"
                  >
                    Refund Other Product
                  </button>
                  <!-- No Order Received button in RR tab -->
                </template>

                <!-- to receive (on any tab EXCEPT RR tab): RR + Order Received group/N -->
                <template v-else-if="g.items.some((it) => it.status === STATUS.TO_RECEIVE)">
                  <button
                    class="btn btn-outline-warning btn-sm"
                    @click.stop="openReturnRefundGroup(g)"
                  >
                    Return/Refund
                  </button>
                  <button
                    class="btn btn-success btn-sm"
                    :disabled="groupBusy.received[g.ref] || groupToReceiveCount(g) === 0"
                    @click.stop="orderReceivedGroup(g)"
                    :title="
                      groupAllToReceive(g)
                        ? 'Mark all as received'
                        : 'Mark remaining To Receive as received'
                    "
                  >
                    <span
                      v-if="groupBusy.received[g.ref]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    {{
                      groupAllToReceive(g)
                        ? 'Order Received (All)'
                        : 'Order Received (' + groupToReceiveCount(g) + ')'
                    }}
                  </button>
                </template>

                <!-- completed / cancelled: no extra buttons -->
              </div>
            </div>

            <!-- Footer (timestamps) -->
            <div class="mt-3 small text-muted d-flex flex-wrap gap-3">
              <span>Updated: {{ formatDate(g.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /group cards -->
    </div>

    <!-- ====== Fallback list (kept); per-item Order Received removed ====== -->
    <div v-else class="row g-3">
      <div v-for="p in filtered" :key="p.id" class="col-12">
        <div class="card shadow-sm rounded-4">
          <div class="card-body">
            <div class="d-flex flex-wrap align-items-center justify-content-between">
              <div class="d-flex flex-column">
                <div class="fw-semibold">
                  <span class="text-muted">Ref#</span>
                  <span class="ms-1">{{ p.reference_number || shortId(p.id) }}</span>
                </div>
                <div class="small text-muted">Updated: {{ formatDate(p.updated_at) }}</div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="statusClass(p.status)">
                  {{ prettyStatusWithRR(p.status, p.id) }}
                </span>
              </div>
            </div>

            <!-- NEW: Event ticket in fallback view -->
            <div
              v-if="eventTitleForRef(p.reference_number || p.id)"
              class="mt-2 d-flex flex-wrap align-items-center gap-2"
            >
              <div
                class="event-ticket"
                :title="eventTitleForRef(p.reference_number || p.id)"
              >
                <div class="ticket-left">
                  <i class="bi bi-trophy me-1"></i>
                  <span class="ticket-title">{{ eventTitleForRef(p.reference_number || p.id) }}</span>
                </div>
                <div class="ticket-divider"></div>
                <div class="ticket-right">
                  <span class="ticket-tag ticket-tag--event">EVENT WINNER</span>
                </div>
              </div>
            </div>

            <!-- (Optional) discount ticket in fallback view -->
            <div
              v-if="discountsForRef(p.reference_number || p.id).length"
              class="mt-2 d-flex flex-wrap align-items-center gap-2"
            >
              <div
                v-for="d in discountsForRef(p.reference_number || p.id)"
                :key="d.id"
                class="discount-ticket"
                title="Discount applied"
              >
                <div class="ticket-left">
                  <i class="bi bi-ticket-perforated me-1"></i>
                  <span class="ticket-title" :title="d.title">{{ d.title }}</span>
                </div>
                <div class="ticket-divider" aria-hidden="true"></div>
                <div class="ticket-right">
                  <span class="ticket-value">{{ discountLabel(d) }}</span>
                  <span class="ticket-tag">APPLIED</span>
                </div>
              </div>
            </div>

            <!-- ===== NEW: Tracking link for single-row view ===== -->
            <div
              v-if="p.status === STATUS.TO_RECEIVE && (p?.tracking_link || '').toString().trim().length"
              class="mt-2"
            >
              <a
                :href="p.tracking_link"
                target="_blank"
                rel="noopener"
                class="small text-primary text-decoration-underline"
                title="Open tracking in a new tab"
              >
                Track your package
              </a>
            </div>

            <div class="mt-3 row g-3">
              <!-- Product tile -->
              <div class="col-12">
                <div class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle">
                  <div class="purchase-thumb ratio ratio-1x1 bg-light rounded">
                    <img
                      v-if="productThumb(p)"
                      :src="productThumb(p)"
                      :alt="productName(p)"
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
                    <div class="d-flex align-items-center justify-content-between gap-2">
                      <div
                        class="fw-semibold title-ellipsis"
                        :title="productName(p)"
                        :class="{ 'text-danger': !!rrStatus(p.id) }"
                      >
                        {{ productName(p) }}
                      </div>

                      <!-- PRICE (special display for discount_redemptions) -->
                      <div class="text-end ms-2">
                        <template v-if="refHasRedemption(p.reference_number || p.id)">
                          <div class="fw-semibold">
                            ₱ {{ number(productPrice(p)) }}
                          </div>
                          <div class="small text-danger">
                            − ₱ {{ number(redemptionUnitDiscount(p)) }}
                          </div>
                        </template>

                        <template v-else-if="refHasDiscount(p.reference_number || p.id)">
                          <div class="text-muted text-decoration-line-through">
                            ₱ {{ number(productPrice(p)) }}
                          </div>
                          <div class="fw-semibold text-success">
                            ₱ {{ number(discountedUnitPrice(p)) }}
                          </div>
                        </template>

                        <template v-else>
                          <div :class="['fw-semibold', { 'text-danger': !!rrStatus(p.id) }]">
                            ₱ {{ number(productPrice(p)) }}
                          </div>
                        </template>

                        <!-- NEW: Qty + per-product subtotal (only when qty > 1) -->
                        <div class="small text-muted mt-1" v-if="(Number(p?.qty ?? 1) || 1) > 1">
                          Qty: {{ Number(p?.qty ?? 1) }} • Subtotal:
                          <span class="fw-semibold"> ₱ {{ number(subtotalFor(p)) }} </span>
                        </div>
                      </div>
                    </div>

                    <!-- Two badges -->
                    <div class="mt-1 d-flex flex-wrap align-items-center gap-2">
                      <span class="badge" :class="statusClass(p.status)">
                        {{ prettyStatusWithRR(p.status, p.id) }}
                      </span>
                      <span class="badge text-bg-secondary-subtle border">
                        {{ prettyModeOfPayment(p.modeofpayment) }}
                      </span>
                    </div>
                  </div>

                  <!-- View return details -->
                  <div class="text-end">
                    <div class="mt-2" v-if="rrStatus(p.id) && activeTab !== STATUS.RETURN_REFUND">
                      <button
                        class="btn btn-outline-danger btn-sm"
                        @click="goToReturnTab(p.reference_number || p.id)"
                      >
                        View return details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="col-12 d-flex align-items-center justify-content-end">
                <div class="d-flex gap-2 flex-wrap">
                  <button
                    v-if="p.status === STATUS.TO_PAY"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="busy.cancel[p.id]"
                    @click="cancelPurchase(p.id)"
                  >
                    <span
                      v-if="busy.cancel[p.id]"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    Cancel
                  </button>

                  <template v-else-if="p.status === STATUS.TO_SHIP"> </template>

                  <template v-else-if="p.status === STATUS.TO_RECEIVE">
                    <button class="btn btn-outline-warning btn-sm" @click="openReturnRefund(p)">
                      Return/Refund
                    </button>
                    <!-- per-item Order Received removed -->
                  </template>

                  <template v-else-if="p.status === STATUS.COMPLETED"> </template>

                  <template v-else-if="p.status === STATUS.RETURN_REFUND"> </template>

                  <template v-else-if="p.status === STATUS.CANCELLED"> </template>
                </div>
              </div>
            </div>

            <div class="mt-3 small text-muted d-flex flex-wrap gap-3">
              <span>Updated: {{ formatDate(p.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- (Optional pagination spot) -->
    </div>

    <!-- Return/Refund Modal -->
    <div v-if="showRR" class="modal-backdrop-custom2">
      <div class="modal-card2 card shadow-lg">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Return / Refund Request</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeReturnRefund">✕</button>
        </div>

        <div class="card-body">
          <!-- Group preview -->
          <div v-if="rrGroup" class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="fw-semibold">Ref# {{ rrGroup.ref }}</div>
              <div class="small text-muted">Updated: {{ formatDate(rrGroup.updated_at) }}</div>
            </div>

            <!-- Event ticket in RR modal -->
            <div
              v-if="eventTitleForRef(rrGroup.ref)"
              class="mt-2 d-flex flex-wrap align-items-center gap-2"
            >
              <div class="event-ticket" :title="eventTitleForRef(rrGroup.ref)">
                <div class="ticket-left">
                  <i class="bi bi-trophy me-1)"></i>
                  <span class="ticket-title">{{ eventTitleForRef(rrGroup.ref) }}</span>
                </div>
                <div class="ticket-divider"></div>
                <div class="ticket-right">
                  <span class="ticket-tag ticket-tag--event">EVENT WINNER</span>
                </div>
              </div>
            </div>

            <!-- Discount ticket(s) in RR modal -->
            <div
              v-if="discountsForRef(rrGroup.ref).length"
              class="mt-2 d-flex flex-wrap align-items-center gap-2"
            >
              <div
                v-for="d in discountsForRef(rrGroup.ref)"
                :key="d.id"
                class="discount-ticket"
                title="Discount applied"
              >
                <div class="ticket-left">
                  <i class="bi bi-ticket-perforated me-1)"></i>
                  <span class="ticket-title" :title="d.title">{{ d.title }}</span>
                </div>
                <div class="ticket-divider" aria-hidden="true"></div>
                <div class="ticket-right">
                  <span class="ticket-value">{{ discountLabel(d) }}</span>
                  <span class="ticket-tag">APPLIED</span>
                </div>
              </div>
            </div>

            <!-- Select items inside this group -->
            <div class="mt-2 border rounded p-2">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="fw-semibold">Select item(s) to return/refund</div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="rrSelAll"
                    v-model="rrSelectAll"
                    @change="toggleRRSelectAll"
                  />
                  <label for="rrSelAll" class="form-check-label small">Select All</label>
                </div>
              </div>

              <div class="vstack gap-2">
                <div
                  v-for="it in rrGroup.items"
                  :key="'rr-' + it.id"
                  class="border rounded p-2 bg-light-subtle"
                >
                  <label class="d-flex align-items-center gap-3">
                    <input
                      v-if="isSelectableForRR(it)"
                      class="form-check-input"
                      type="checkbox"
                      :value="it.id"
                      v-model="rrForm.purchase_ids"
                      @change="onToggleRRItem(it.id)"
                    />
                    <input v-else class="form-check-input" type="checkbox" checked disabled />
                    <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
                      <img
                        v-if="productThumb(it)"
                        :src="productThumb(it)"
                        :alt="productName(it)"
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
                      <div class="fw-semibold title-ellipsis" :title="productName(it)">
                        {{ productName(it) }}
                      </div>
                      <div v-if="!!rrStatus(it.id)" class="small text-muted">
                        Already submitted • {{ capitalize(rrStatus(it.id)!) }}
                      </div>
                    </div>
                    <div class="text-end">
                      <div class="small fw-semibold">₱ {{ number(productPrice(it)) }}</div>
                    </div>
                  </label>

                  <!-- Locked, prefilled -->
                  <div v-if="!!rrStatus(it.id)" class="mt-2">
                    <div class="row g-2">
                      <div class="col-12 col-md-5">
                        <label class="form-label small mb-1">Reason</label>
                        <input
                          class="form-control form-control-sm"
                          :value="prefillReason(it.id)"
                          disabled
                        />
                      </div>
                      <div class="col-12 col-md-7">
                        <label class="form-label small mb-1">Details</label>
                        <textarea
                          class="form-control form-control-sm"
                          rows="2"
                          :value="prefillDetails(it.id)"
                          disabled
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Editable for newly selected -->
                  <div v-else-if="rrForm.purchase_ids.includes(it.id)" class="mt-2">
                    <div class="row g-2">
                      <div class="col-12 col-md-5">
                        <label class="form-label small mb-1">Reason</label>
                        <select
                          class="form-select form-select-sm"
                          v-model.trim="rrItemForms[it.id].reason"
                          required
                        >
                          <option value="" disabled>Select a reason</option>
                          <option v-for="r in rrReasons" :key="r" :value="r">{{ r }}</option>
                        </select>
                      </div>
                      <div class="col-12 col-md-7">
                        <label class="form-label small mb-1">Details</label>
                        <textarea
                          class="form-control form-control-sm"
                          rows="2"
                          v-model.trim="rrItemForms[it.id].details"
                          placeholder="Describe the issue…"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Single purchase RR (kept) -->
          <div v-else-if="rrPurchase" class="d-flex align-items-center gap-3 mb-3">
            <div class="purchase-thumb ratio ratio-1x1 bg-light rounded">
              <img
                v-if="productThumb(rrPurchase)"
                :src="productThumb(rrPurchase)"
                :alt="productName(rrPurchase)"
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
              <div class="fw-semibold title-ellipsis">{{ productName(rrPurchase) }}</div>
              <div class="text-muted small">
                Ref# {{ rrPurchase.reference_number || shortId(rrPurchase.id) }}
              </div>
            </div>
            <div class="text-end">
              <div class="fw-semibold">₱ {{ number(productPrice(rrPurchase)) }}</div>
            </div>
          </div>

          <form @submit.prevent="submitReturnRefund">
            <div class="row g-3">
              <!-- Pickup / Return Date -->
              <div class="col-12">
                <label class="form-label">Pickup Date</label>
                <div class="d-flex gap-2 flex-wrap">
                  <select
                    v-model="rrQuickDate"
                    class="form-select"
                    style="max-width: 220px"
                    @change="applyQuickDate"
                  >
                    <option value="">Choose a quick date…</option>
                    <option :value="quickDates.tomorrow">
                      {{ labelFor(quickDates.tomorrow) }} (Tomorrow)
                    </option>
                    <option :value="quickDates.plus2">
                      {{ labelFor(quickDates.plus2) }} (+2 days)
                    </option>
                    <option :value="quickDates.plus3">
                      {{ labelFor(quickDates.plus3) }} (+3 days)
                    </option>
                  </select>
                  <input
                    v-model="rrForm.pickup_date"
                    type="date"
                    class="form-control"
                    style="max-width: 180px"
                    :min="todayYMD"
                    required
                  />
                </div>
                <div class="form-text">Select a quick option or pick an exact date.</div>
              </div>

              <!-- Single path -->
              <template v-if="rrPurchase">
                <div class="col-12">
                  <label class="form-label">Reason</label>
                  <select v-model.trim="rrForm.reason" class="form-select" required>
                    <option value="" disabled>Select a reason</option>
                    <option v-for="r in rrReasons" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">Details (optional)</label>
                  <textarea
                    v-model.trim="rrForm.details"
                    class="form-control"
                    rows="4"
                    placeholder="Describe the issue (e.g., defective on arrival, wrong color/size, missing parts)."
                  ></textarea>
                </div>
              </template>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeReturnRefund">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-warning"
                :disabled="
                  Boolean(
                    rrBusy ||
                      !rrForm.pickup_date ||
                      (!!rrGroup && (rrForm.purchase_ids.length === 0 || !allSelectedHaveReasons)),
                  )
                "
              >
                <span v-if="rrBusy" class="spinner-border spinner-border-sm me-2"></span>
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- /Return/Refund Modal -->

    <!-- ===== NEW: Group Details Modal (deep-linkable via ?ref=...&pid=...) ===== -->
    <div
      v-if="showGroupDetails && selectedGroupComputed"
      class="modal-backdrop-custom2"
      @click.self="closeGroupDetails"
    >
      <div class="modal-card2 card shadow-lg" @click.stop>
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong>Order Details — Ref# {{ selectedGroupComputed!.ref }}</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeGroupDetails">✕</button>
        </div>

        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between">
            <div class="small text-muted">
              Updated: {{ formatDate(selectedGroupComputed!.updated_at) }}
            </div>
            <span class="badge" :class="statusClass(selectedGroupComputed!.status)">
              {{
                prettyStatusWithRR(selectedGroupComputed!.status, undefined, selectedGroupComputed!)
              }}
            </span>
          </div>

          <!-- Event ticket in details modal -->
          <div
            v-if="eventTitleForRef(selectedGroupComputed!.ref)"
            class="mt-2 d-flex flex-wrap align-items-center gap-2"
          >
            <div
              class="event-ticket"
              :title="eventTitleForRef(selectedGroupComputed!.ref)"
            >
              <div class="ticket-left">
                <i class="bi bi-trophy me-1)"></i>
                <span class="ticket-title">{{ eventTitleForRef(selectedGroupComputed!.ref) }}</span>
              </div>
              <div class="ticket-divider"></div>
              <div class="ticket-right">
                <span class="ticket-tag ticket-tag--event">EVENT WINNER</span>
              </div>
            </div>
          </div>

          <!-- Discount ticket(s) in details modal -->
          <div
            v-if="discountsForRef(selectedGroupComputed!.ref).length"
            class="mt-2 d-flex flex-wrap align-items-center gap-2"
          >
            <div
              v-for="d in discountsForRef(selectedGroupComputed!.ref)"
              :key="d.id"
              class="discount-ticket"
              title="Discount applied"
            >
              <div class="ticket-left">
                <i class="bi bi-ticket-perforated me-1"></i>
                <span class="ticket-title" :title="d.title">{{ d.title }}</span>
              </div>
              <div class="ticket-divider" aria-hidden="true"></div>
              <div class="ticket-right">
                <span class="ticket-value">{{ discountLabel(d) }}</span>
                <span class="ticket-tag">APPLIED</span>
              </div>
            </div>
          </div>

          <!-- ===== NEW: Tracking link in details modal ===== -->
          <div
            v-if="groupToReceiveCount(selectedGroupComputed!) > 0 && trackingLinkFor(selectedGroupComputed!.ref)"
            class="mt-2"
          >
            <a
              :href="trackingLinkFor(selectedGroupComputed!.ref)"
              target="_blank"
              rel="noopener"
              class="small text-primary text-decoration-underline"
              title="Open tracking in a new tab"
            >
              Track your package
            </a>
          </div>
          <!-- ================================================ -->

          <!-- Items -->
          <div class="mt-3 vstack gap-2">
            <div
              v-for="it in selectedGroupComputed!.items"
              :key="it.id"
              class="d-flex align-items-center gap-3 border rounded p-2 bg-light-subtle"
              :class="{ 'border-primary': highlightPid === it.id }"
              :id="'pid-' + it.id"
            >
              <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
                <img
                  v-if="productThumb(it)"
                  :src="productThumb(it)"
                  :alt="productName(it)"
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
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <div class="fw-semibold title-ellipsis" :title="productName(it)">
                    {{ productName(it) }}
                  </div>

                  <!-- Unit + subtotal (special for discount_redemptions) -->
                  <div class="text-end ms-2">
                    <template v-if="refHasRedemption(selectedGroupComputed!.ref)">
                      <div>Unit: ₱ {{ number(productPrice(it)) }}</div>
                      <div class="small text-danger">− ₱ {{ number(redemptionUnitDiscount(it)) }}</div>
                      <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">
                        Subtotal: ₱ {{ number(subtotalFor(it)) }}
                      </div>
                    </template>

                    <template v-else-if="refHasDiscount(selectedGroupComputed!.ref)">
                      <div class="text-muted text-decoration-line-through">
                        ₱ {{ number(productPrice(it)) }}
                      </div>
                      <div class="fw-semibold text-success">
                        ₱ {{ number(discountedUnitPrice(it)) }}
                      </div>
                      <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">
                        Subtotal: ₱ {{ number(subtotalFor(it)) }}
                      </div>
                    </template>

                    <template v-else>
                      <div class="small text-muted">Unit: ₱ {{ number(unitPriceFor(it)) }}</div>
                      <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">
                        Subtotal: ₱ {{ number(subtotalFor(it)) }}
                      </div>
                    </template>
                  </div>
                </div>

                <div class="mt-1 d-flex flex-wrap align-items-center gap-2">
                  <span class="badge" :class="statusClass(it.status)">
                    {{ prettyStatusWithRR(it.status, it.id, selectedGroupComputed!) }}
                  </span>
                  <span class="badge text-bg-secondary-subtle border">
                    {{ prettyModeOfPayment(it.modeofpayment) }}
                  </span>
                  <span v-if="(Number(it?.qty ?? 1) || 1) > 1" class="badge text-bg-light border">
                    Qty: {{ Number(it?.qty ?? 1) }}
                  </span>
                </div>

                <!-- ===== NEW: Product meta (description • warranty • specs) ===== -->
                <div class="item-meta mt-2">
                  <div v-if="productDescription(it)" class="meta-item">
                    <span class="meta-label">Description:</span>
                    <span class="meta-text">{{ truncatedDescription(it) }}</span>
                  </div>
                  <div v-if="productWarranty(it)" class="meta-item">
                    <span class="meta-label">Warranty:</span>
                    <span class="meta-text">{{ productWarranty(it) }}</span>
                  </div>
                  <div v-if="productSpecsSummary(it)" class="meta-item">
                    <span class="meta-label">Specifications:</span>
                    <span class="meta-text">{{ productSpecsSummary(it) }}</span>
                  </div>
                </div>
                <!-- /Product meta -->
              </div>

              <div class="text-end">
                <div v-if="rrStatus(it.id)" class="small text-muted">
                  RR • {{ capitalize(rrStatus(it.id)!) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Totals (now shows slash when discounted) -->
          <div class="mt-3 d-flex align-items-center justify-content-end">
            <div class="text-end">

              <!-- ================= NEW: Price breakdown ABOVE Subtotal (Modal) ================= -->
              <div class="small text-muted mb-1">
                <div>Items: ₱ {{ number(groupItemsBaseTotal(selectedGroupComputed!)) }}</div>
                <div v-if="refHasDiscount(selectedGroupComputed!.ref)">
                  Discount: −₱ {{ number(groupDiscountAmount(selectedGroupComputed!)) }}
                </div>
                <div>Shipping: ₱ {{ number(shippingFor(selectedGroupComputed!.ref)) }}</div>
              </div>
              <!-- ===================================================================== -->

              <div class="small text-muted">Subtotal</div>
              <template v-if="refHasDiscount(selectedGroupComputed!.ref)">
                <div class="text-muted text-decoration-line-through">
                  ₱ {{ number(groupTotal(selectedGroupComputed!)) }}
                </div>
                <div class="fs-5 fw-bold text-success">
                  ₱ {{ number(groupTotalDiscounted(selectedGroupComputed!)) }}
                </div>
              </template>
              <template v-else>
                <div class="fs-5 fw-bold">₱ {{ number(groupTotal(selectedGroupComputed!)) }}</div>
              </template>
              <div v-if="shippingFor(selectedGroupComputed!.ref) > 0" class="small text-muted mt-1">
                (Includes shipping ₱ {{ number(shippingFor(selectedGroupComputed!.ref)) }})
              </div>
            </div>
          </div>

          <!-- ==== NEW: Show the same action buttons inside the modal ==== -->
          <div class="mt-3 d-flex align-items-center justify-content-end">
            <div class="d-flex gap-2 flex-wrap">
              <button
                v-if="selectedGroupComputed!.status === STATUS.TO_PAY"
                class="btn btn-outline-danger btn-sm"
                :disabled="groupBusy.cancel[selectedGroupComputed!.ref]"
                @click.stop="cancelGroup(selectedGroupComputed!)"
              >
                <span
                  v-if="groupBusy.cancel[selectedGroupComputed!.ref]"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Cancel
              </button>

              <template v-else-if="selectedGroupComputed!.status === STATUS.TO_SHIP">
                <!-- intentionally empty -->
              </template>

              <template
                v-else-if="
                  activeTab === STATUS.RETURN_REFUND &&
                  selectedGroupComputed!.items.some((it) => it.status === STATUS.TO_RECEIVE)
                "
              >
                <button
                  class="btn btn-outline-warning btn-sm"
                  @click.stop="goRefundOtherProducts(selectedGroupComputed!)"
                  title="Go to To Receive tab to refund remaining product(s)"
                >
                  Refund Other Product
                </button>
              </template>

              <template
                v-else-if="
                  selectedGroupComputed!.items.some((it) => it.status === STATUS.TO_RECEIVE)
                "
              >
                <button
                  class="btn btn-outline-warning btn-sm"
                  @click.stop="openReturnRefundGroup(selectedGroupComputed!)"
                >
                  Return/Refund
                </button>
                <button
                  class="btn btn-success btn-sm"
                  :disabled="
                    groupBusy.received[selectedGroupComputed!.ref] ||
                    groupToReceiveCount(selectedGroupComputed!) === 0
                  "
                  @click.stop="orderReceivedGroup(selectedGroupComputed!)"
                  :title="
                    groupAllToReceive(selectedGroupComputed!)
                      ? 'Mark all as received'
                      : 'Mark remaining To Receive as received'
                  "
                >
                  <span
                    v-if="groupBusy.received[selectedGroupComputed!.ref]"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  {{
                    groupAllToReceive(selectedGroupComputed!)
                      ? 'Order Received (All)'
                      : 'Order Received (' + groupToReceiveCount(selectedGroupComputed!) + ')'
                  }}
                </button>
              </template>
            </div>
          </div>
          <!-- /modal actions -->
        </div>
      </div>
    </div>
    <!-- /Group Details Modal -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})

type AnyRec = Record<string, any>

const router = useRouter()
const route = useRoute()

/** Enum constants */
const STATUS = {
  TO_PAY: 'to pay',
  TO_SHIP: 'to ship',
  TO_RECEIVE: 'to receive',
  COMPLETED: 'completed',
  RETURN_REFUND: 'return/refund',
  CANCELLED: 'cancelled',
} as const
type Status = (typeof STATUS)[keyof typeof STATUS]

/** Tabs */
const tabs = [
  { label: 'To Pay', value: STATUS.TO_PAY },
  { label: 'To Ship', value: STATUS.TO_SHIP },
  { label: 'To Receive', value: STATUS.TO_RECEIVE },
  { label: 'Completed', value: STATUS.COMPLETED },
  { label: 'Return/Refund', value: STATUS.RETURN_REFUND },
  { label: 'Cancelled', value: STATUS.CANCELLED },
] as const

const activeTab = ref<(typeof tabs)[number]['value']>(STATUS.TO_SHIP)

/** RR states */
type RRState = 'pending' | 'approved' | 'completed' | 'rejected'
const rrSubtabs: Array<{ label: string; value: RRState }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
]
const activeRR = ref<RRState>('pending')

/** Mode flags */
const showGrouped = true

/** UI state */
const busy = ref<{
  load: boolean
  cancel: Record<string, boolean>
  rrCancel: Record<string, boolean>
  received: Record<string, boolean>
}>({
  load: false,
  cancel: {},
  rrCancel: {},
  received: {},
})
const groupBusy = reactive<{
  cancel: Record<string, boolean>
  rrCancel: Record<string, boolean>
  received: Record<string, boolean>
}>({
  cancel: {},
  rrCancel: {},
  received: {},
})
const highlightRef = ref<string>('')

const purchases = ref<Array<AnyRec>>([])

/* ---------- Product lookup + image signing ---------- */
type Product = {
  id: string
  name: string
  description: string | null
  price: number | string
  product_url: string[] | null
  warranty?: string | null
  specifications?: Record<string, any> | null
}
const productsMap = reactive<Record<string, Product>>({})
const signedUrlMap: Record<string, string> = reactive({})
const signingBusy: Record<string, boolean> = reactive({})

function toArray(u: any): string[] {
  return !u ? [] : Array.isArray(u) ? u.filter(Boolean) : [u]
}
function firstUrl(u: string[] | null): string {
  const arr = toArray(u)
  return arr[0] ?? ''
}
function isStoragePath(u: string) {
  return !!u && !/^https?:\/\//i.test(u)
}
function number(n: number | string | null | undefined) {
  return Number(n ?? 0).toFixed(2)
}
function productOf(purchase: AnyRec): Product | undefined {
  return purchase?.product_id ? productsMap[purchase.product_id] : undefined
}
function productName(purchase: AnyRec): string {
  return productOf(purchase)?.name ?? purchase?.product_id ?? '—'
}
function productPrice(purchase: AnyRec): number {
  const raw = productOf(purchase)?.price
  return Number(raw ?? 0)
}

/** NEW: ensure a signed URL exists for the product's first image (bucket: prize_product) */
function ensureSignedUrlForProduct(prod?: Product) {
  if (!prod) return
  const raw = firstUrl(prod.product_url)
  if (!raw) return
  if (!isStoragePath(raw)) return
  if (signedUrlMap[prod.id] || signingBusy[prod.id]) return

  signingBusy[prod.id] = true
  supabase.storage
    .from('prize_product')
    .createSignedUrl(raw, 3600)
    .then(({ data, error }) => {
      if (!error && data?.signedUrl) {
        signedUrlMap[prod.id] = data.signedUrl
      } else if (error) {
        console.warn('Signed URL error for', prod.id, raw, error.message)
      }
    })
    .finally(() => {
      signingBusy[prod.id] = false
    })
}

/** NEW: bulk helper to sign for all current products (idempotent) */
function ensureSignedUrlsForAllProducts() {
  for (const id in productsMap) {
    ensureSignedUrlForProduct(productsMap[id])
  }
}

function productThumb(purchase: AnyRec): string {
  const prod = productOf(purchase)
  if (!prod) return ''
  const raw = firstUrl(prod.product_url)

  if (raw && isStoragePath(raw) && !signedUrlMap[prod.id] && !signingBusy[prod.id]) {
    ensureSignedUrlForProduct(prod)
  }

  return raw && !isStoragePath(raw) ? raw : (signedUrlMap[prod.id] || '')
}

/* ---- NEW: Product meta helpers for modal (desc • warranty • specs) ---- */
function truncateText(s: string, max = 140) {
  if (!s) return ''
  const str = String(s)
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}
function productDescription(purchase: AnyRec): string {
  return (productOf(purchase)?.description || '') as string
}
function truncatedDescription(purchase: AnyRec): string {
  return truncateText(productDescription(purchase), 160)
}
function productWarranty(purchase: AnyRec): string {
  return (productOf(purchase)?.warranty || '') as string
}
function productSpecsSummary(purchase: AnyRec): string {
  const specs = productOf(purchase)?.specifications || null
  if (!specs || typeof specs !== 'object') return ''
  const entries = Object.entries(specs).filter(([k, v]) => String(v ?? '').trim().length > 0)
  if (!entries.length) return ''
  const MAX_PAIRS = 4
  const shown = entries.slice(0, MAX_PAIRS).map(([k, v]) => `${k}: ${v}`)
  let out = shown.join(' • ')
  if (entries.length > MAX_PAIRS) out += ' …'
  return truncateText(out, 180)
}

/* ---------------- Return/Refund store (per purchase) ---------------- */
type RRRow = {
  id: string
  purchase_id: string
  status: RRState
  reason?: string | null
  details?: string | null
  created_at?: string
}
const rrByPurchase = reactive<Record<string, RRRow>>({})

function rrStatus(purchaseId: string): RRState | undefined {
  return rrByPurchase[purchaseId]?.status
}
function prefillReason(purchaseId: string): string {
  return (rrByPurchase[purchaseId]?.reason || '') as string
}
function prefillDetails(purchaseId: string): string {
  return (rrByPurchase[purchaseId]?.details || '') as string
}

/* ---------------- Auto-complete "to receive" after 7 days ---------------- */
async function autocloseOverdue(uid: string) {
  const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: updatedRows, error } = await supabase
    .schema('games')
    .from('purchases')
    .update({ status: STATUS.COMPLETED })
    .eq('user_id', uid)
    .eq('status', STATUS.TO_RECEIVE)
    .lt('created_at', threshold)
    .select('id')
  if (error) return
  if (Array.isArray(updatedRows) && updatedRows.length) {
    const updatedIds = new Set(updatedRows.map((r: AnyRec) => r.id))
    for (const row of purchases.value) if (updatedIds.has(row.id)) row.status = STATUS.COMPLETED
    await createOrderReceiptForIds(Array.from(updatedIds))
  }
}

/** ========= DISCOUNT (refund_lock + event.interest_per_player + discounted_price column + redemptions) ========= */
const refDiscount: Record<string, number> = reactive({})
const refRedeemedTotal: Record<string, number> = reactive({})
const refShippingTotal: Record<string, number> = reactive({}) // kept (unused now) to avoid removing unrelated code

/** ===== NEW: discount metadata (title + %/amount) per ref ===== */
type Discount = {
  id: string
  title: string
  percent_off: number | null
  amount_off: number | null
}
const discountsById = reactive<Record<string, Discount>>({})
const refDiscountIds = reactive<Record<string, string[]>>({})

/** ===== NEW: Event meta (title) per ref ===== */
const refEventTitle: Record<string, string> = reactive({})

/** Simple UUID check to avoid querying invalid refs */
function isUuidLike(s: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s)
}

/** New: helper to detect if an item has its own discounted_price */
function hasItemLevelDiscount(purchase: AnyRec): boolean {
  const dp = Number(purchase?.discounted_price)
  const base = productPrice(purchase)
  return Number.isFinite(dp) && dp >= 0 && dp < base
}

/** NEW: check if a ref is discounted either via per-item dp, redemption total, or event offset */
function refHasDiscount(ref?: string): boolean {
  if (!ref) return false
  if (
    purchases.value.some((p) => (p.reference_number || p.id) === ref && hasItemLevelDiscount(p))
  ) {
    return true
  }
  if ((refRedeemedTotal[ref] || 0) > 0) return true
  return typeof refDiscount[ref] === 'number' && refDiscount[ref] > 0
}

/** NEW (for display): does this ref specifically have discount_redemptions? */
function refHasRedemption(ref?: string): boolean {
  if (!ref) return false
  return (refRedeemedTotal[ref] || 0) > 0
}

/** Base group total WITHOUT shipping; helper for proportional redemption calc */
function baseGroupTotalByRef(ref: string): number {
  const rows = purchases.value.filter((p) => (p.reference_number || p.id) === ref)
  return rows.reduce((sum, it) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * productPrice(it)
  }, 0)
}

/** Unit price when discounted */
function discountedUnitPrice(purchase: AnyRec): number {
  if (hasItemLevelDiscount(purchase)) {
    return Number(purchase.discounted_price)
  }
  const ref = purchase?.reference_number || purchase?.id
  const base = productPrice(purchase)
  const qty = Number(purchase?.qty ?? 1) || 1

  const redeemed = refRedeemedTotal[ref] || 0
  if (redeemed > 0) {
    const groupBase = baseGroupTotalByRef(ref)
    if (groupBase > 0) {
      const myBaseSubtotal = base * qty
      const myDiscountShare = (redeemed * myBaseSubtotal) / groupBase
      const unitLess = myDiscountShare / qty
      const out = base - unitLess
      return out > 0 ? out : 0
    }
  }

  const off = refDiscount[ref] || 0
  const out = base - off
  return out > 0 ? out : 0
}

/** NEW (for display): per-unit discount amount when using discount_redemptions */
function redemptionUnitDiscount(purchase: AnyRec): number {
  const ref = purchase?.reference_number || purchase?.id
  const redeemed = refRedeemedTotal[ref] || 0
  if (redeemed <= 0) return 0
  const base = productPrice(purchase)
  const qty = Number(purchase?.qty ?? 1) || 1
  const groupBase = baseGroupTotalByRef(ref)
  if (groupBase <= 0 || qty <= 0) return 0
  const myBaseSubtotal = base * qty
  const myDiscountShare = (redeemed * myBaseSubtotal) / groupBase
  const perUnit = myDiscountShare / qty
  return perUnit > base ? base : perUnit
}

/** Group discounted total (adds shipping if any) */
function groupTotalDiscounted(g: Group): number {
  const items = g.items.reduce((sum, it) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * discountedUnitPrice(it)
  }, 0)
  return items + shippingFor(g.ref)
}

/** Load all data (+ event title detection) */
async function loadPurchases() {
  busy.value.load = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) {
      purchases.value = []
      Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
      Object.keys(refDiscount).forEach((k) => delete refDiscount[k])
      Object.keys(refRedeemedTotal).forEach((k) => delete refRedeemedTotal[k])
      Object.keys(refShippingTotal).forEach((k) => delete refShippingTotal[k])
      Object.keys(discountsById).forEach((k) => delete discountsById[k])
      Object.keys(refDiscountIds).forEach((k) => delete refDiscountIds[k])
      Object.keys(refEventTitle).forEach((k) => delete refEventTitle[k])
      return
    }

    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select(
        // ⬇️ added shipping_fee and tracking_link here
        'id,user_id,product_id,reference_number,status,qty,modeofpayment,created_at,updated_at,discounted_price,shipping_fee,tracking_link',
      )
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (error) {
      purchases.value = []
      Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
      Object.keys(refDiscount).forEach((k) => delete refDiscount[k])
      Object.keys(refRedeemedTotal).forEach((k) => delete refRedeemedTotal[k])
      Object.keys(refShippingTotal).forEach((k) => delete refShippingTotal[k])
      Object.keys(discountsById).forEach((k) => delete discountsById[k])
      Object.keys(refDiscountIds).forEach((k) => delete refDiscountIds[k])
      Object.keys(refEventTitle).forEach((k) => delete refEventTitle[k])
      return
    }
    purchases.value = Array.isArray(data) ? data : []

    await autocloseOverdue(uid)

    // ----- Products -----
    const ids = Array.from(new Set(purchases.value.map((r) => r.product_id).filter(Boolean)))
    if (ids.length) {
      const { data: prows, error: perr } = await supabase
        .schema('games')
        .from('products')
        .select('id,name,description,price,product_url,warranty,specifications')
        .in('id', ids)
      if (!perr && Array.isArray(prows)) {
        for (const pr of prows as Product[]) {
          productsMap[pr.id] = {
            id: pr.id,
            name: pr.name,
            description: pr.description ?? null,
            price: pr.price,
            product_url: Array.isArray(pr.product_url) ? pr.product_url : null,
            warranty: (pr as any)?.warranty ?? null,
            specifications: (pr as any)?.specifications ?? null,
          }
        }
        ensureSignedUrlsForAllProducts()
      }
    }

    // ----- RR rows -----
    const purchaseIds = purchases.value.map((r) => r.id)
    Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
    if (purchaseIds.length) {
      const { data: rrRows, error: rrErr } = await supabase
        .schema('games')
        .from('return_refunds')
        .select('id,purchase_id,status,reason,details,created_at')
        .eq('user_id', uid)
        .in('purchase_id', purchaseIds)
        .order('created_at', { ascending: false })
      if (!rrErr && Array.isArray(rrRows)) {
        for (const row of rrRows as RRRow[]) {
          if (!rrByPurchase[row.purchase_id]) {
            rrByPurchase[row.purchase_id] = {
              id: row.id,
              purchase_id: row.purchase_id,
              status: (row.status as RRState) || 'pending',
              reason: row.reason ?? null,
              details: row.details ?? null,
              created_at: row.created_at,
            }
          }
        }
      }
    }

    // ----- Discounts: refund_lock + event.interest_per_player (kept for fallback) -----
    const refs = Array.from(
      new Set(
        purchases.value
          .map((r) => r.reference_number || r.id)
          .filter((x): x is string => typeof x === 'string' && x.length > 0),
      ),
    )
    const uuidRefs = refs.filter(isUuidLike)
    Object.keys(refDiscount).forEach((k) => delete refDiscount[k])

    if (uuidRefs.length) {
      const { data: locks, error: lockErr } = await supabase
        .schema('games')
        .from('refund_lock')
        .select('event_id')
        .in('event_id', uuidRefs)

      if (!lockErr && Array.isArray(locks) && locks.length) {
        const eventIds = Array.from(new Set(locks.map((l: AnyRec) => l.event_id).filter(Boolean)))
        if (eventIds.length) {
          const { data: events, error: evErr } = await supabase
            .schema('games')
            .from('event')
            .select('id,interest_per_player')
            .in('id', eventIds)

          if (!evErr && Array.isArray(events)) {
            for (const ev of events as Array<{ id: string; interest_per_player: number }>) {
              const off = Number(ev.interest_per_player ?? 0)
              if (!isNaN(off)) refDiscount[ev.id] = off
            }
          }
        }
      }

      // ===== NEW: Direct event lookup by ref to capture event titles (and fallback discount amount) =====
      const { data: eventsByRef, error: evMetaErr } = await supabase
        .schema('games')
        .from('event')
        .select('id,title,name,interest_per_player')
        .in('id', uuidRefs)

      if (!evMetaErr && Array.isArray(eventsByRef)) {
        for (const ev of eventsByRef as Array<any>) {
          const evId = ev.id as string
          const title = (ev.title || ev.name || 'Event').toString()
          refEventTitle[evId] = title
          const off = Number(ev.interest_per_player ?? NaN)
          if (!isNaN(off) && off > 0) refDiscount[evId] = off
        }
      }
    }

    // ===== NEW: Discount Redemptions (per user, per purchase) -> aggregate by reference_number =====
    Object.keys(refRedeemedTotal).forEach((k) => delete refRedeemedTotal[k])
    Object.keys(refDiscountIds).forEach((k) => delete refDiscountIds[k])
    const allDiscountIds = new Set<string>()

    if (purchaseIds.length) {
      const { data: redRows, error: redErr } = await supabase
        .schema('rewards')
        .from('discount_redemptions')
        .select('purchase_id,redeemed_amount,discount_id')
        .eq('user_id', uid)
        .in('purchase_id', purchaseIds)

      if (!redErr && Array.isArray(redRows)) {
        const pidToRef = new Map<string, string>()
        for (const r of purchases.value) {
          pidToRef.set(r.id, r.reference_number || r.id)
        }
        for (const r of redRows as Array<{ purchase_id: string; redeemed_amount: any; discount_id?: string }>) {
          const ref = pidToRef.get(r.purchase_id)
          if (!ref) continue
          const amt = Number(r.redeemed_amount ?? 0) || 0
          refRedeemedTotal[ref] = (refRedeemedTotal[ref] || 0) + amt

          const did = (r as any).discount_id as string | undefined
          if (did) {
            allDiscountIds.add(did)
            if (!refDiscountIds[ref]) refDiscountIds[ref] = []
            if (!refDiscountIds[ref].includes(did)) refDiscountIds[ref].push(did)
          }
        }
      }

      if (allDiscountIds.size) {
        const { data: drows, error: derr } = await supabase
          .schema('rewards')
          .from('discounts')
          .select('id,title,percent_off,amount_off')
          .in('id', Array.from(allDiscountIds))
        if (!derr && Array.isArray(drows)) {
          for (const d of drows as Array<any>) {
            discountsById[d.id] = {
              id: d.id,
              title: d.title,
              percent_off: d.percent_off ?? null,
              amount_off: d.amount_off ?? null,
            }
          }
        }
      }
    }

    // ===== REMOVED: shipping_charges table fetch =====
    // (Shipping now comes from purchases.shipping_fee; see shippingFor(ref))

    // Try signing any new product images
    ensureSignedUrlsForAllProducts()
  } finally {
    busy.value.load = false
  }
}

/** ================= Grouping ================= */
type Group = {
  ref: string
  items: AnyRec[]
  created_at: string
  updated_at: string
  status: Status
  rrBadge?: RRState
}

const statusPriority: Status[] = [
  STATUS.RETURN_REFUND,
  STATUS.TO_PAY,
  STATUS.TO_SHIP,
  STATUS.TO_RECEIVE,
  STATUS.COMPLETED,
  STATUS.CANCELLED,
]

function buildGroups(rows: AnyRec[]): Group[] {
  const map = new Map<string, Group>()
  for (const r of rows) {
    const ref = r.reference_number || r.id
    if (!map.has(ref)) {
      map.set(ref, {
        ref,
        items: [],
        created_at: r.created_at,
        updated_at: r.updated_at,
        status: r.status as Status,
      })
    }
    const g = map.get(ref)!
    g.items.push(r)
    if (new Date(r.created_at).getTime() < new Date(g.created_at).getTime())
      g.created_at = r.created_at
    if (new Date(r.updated_at).getTime() > new Date(g.updated_at).getTime())
      g.updated_at = r.updated_at
  }

  for (const g of map.values()) {
    const statuses = new Set<Status>(g.items.map((i) => i.status as Status))
    let dom: Status = STATUS.COMPLETED
    for (const s of statusPriority) {
      if (statuses.has(s)) {
        dom = s
        break
      }
    }
    g.status = dom

    if (g.items.some((it) => it.status === STATUS.RETURN_REFUND)) {
      const rrPriority: RRState[] = ['pending', 'approved', 'completed', 'rejected']
      for (const st of rrPriority) {
        if (g.items.some((it) => rrStatus(it.id) === st)) {
          g.rrBadge = st
          break
        }
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

/** Filter groups per tab */
function groupsForTab(tab: Status, groups: Group[]) {
  if (tab === STATUS.TO_RECEIVE)
    return groups.filter((g) => g.items.some((it) => it.status === STATUS.TO_RECEIVE))
  if (tab === STATUS.RETURN_REFUND)
    return groups.filter((g) => g.items.some((it) => it.status === STATUS.RETURN_REFUND))
  if (tab === STATUS.COMPLETED)
    return groups.filter((g) => g.items.some((it) => it.status === STATUS.COMPLETED))
  return groups.filter((g) => g.status === tab)
}

const counts = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  for (const t of tabs) out[t.value] = 0
  const groups = buildGroups(purchases.value)
  for (const t of tabs) out[t.value] = groupsForTab(t.value as Status, groups).length
  return out
})

const rrCounts = computed<Record<RRState, number>>(() => {
  const init: Record<RRState, number> = { pending: 0, approved: 0, completed: 0, rejected: 0 }
  const groups = buildGroups(purchases.value).filter((g) =>
    g.items.some((it) => it.status === STATUS.RETURN_REFUND),
  )
  for (const g of groups) {
    const st = g.rrBadge
    if (st) init[st]++
  }
  return init
})

const filtered = computed(() =>
  purchases.value.filter((r) => (r.status as Status) === activeTab.value),
)
const groupedFiltered = computed<Group[]>(() =>
  groupsForTab(activeTab.value as Status, buildGroups(purchases.value)),
)

/** Helpers */
const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
    ]
    const mon = months[d.getMonth()], day = d.getDate(), year = d.getFullYear()
    let h = d.getHours()
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    return `${mon} ${day}, ${year} • ${h} ${ampm}`
  } catch {
    return iso!
  }
}
const shortId = (s: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—')
function tabLabel(value: string) {
  return tabs.find((t) => t.value === value)?.label ?? value
}
function prettyStatus(s?: string) {
  const k = (s || '') as Status
  if (k === STATUS.TO_PAY) return 'To Pay'
  if (k === STATUS.TO_SHIP) return 'To Ship'
  if (k === STATUS.TO_RECEIVE) return 'To Receive'
  if (k === STATUS.COMPLETED) return 'Completed'
  if (k === STATUS.RETURN_REFUND) return 'Return/Refund'
  if (k === STATUS.CANCELLED) return 'Cancelled'
  return s || '—'
}
function statusClass(s?: string) {
  const k = (s || '') as Status
  if (k === STATUS.CANCELLED) return 'text-bg-danger-subtle border'
  if (k === STATUS.RETURN_REFUND) return 'text-bg-warning-subtle border'
  if (k === STATUS.COMPLETED) return 'text-bg-success-subtle border'
  if (k === STATUS.TO_SHIP || k === STATUS.TO_RECEIVE) return 'text-bg-info-subtle border'
  if (k === STATUS.TO_PAY) return 'text-bg-light border'
  return 'text-bg-light border'
}
function prettyModeOfPayment(m?: string) {
  if (!m) return '—'
  const s = String(m).toLowerCase()
  if (s === 'cod') return 'COD'
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** NEW: show RR state after Return/Refund */
function capitalize(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function prettyStatusWithRR(s?: string, purchaseId?: string, group?: Group): string {
  const base = prettyStatus(s)
  const k = (s || '') as Status
  if (k !== STATUS.RETURN_REFUND) return base
  let rr: RRState | undefined
  if (purchaseId) rr = rrStatus(purchaseId)
  if (!rr && group?.rrBadge) rr = group.rrBadge
  return rr ? `${base} • ${capitalize(rr)}` : base
}

/** ===== NEW: discount & event UI helpers ===== */
function discountsForRef(ref: string): Discount[] {
  const ids = refDiscountIds[ref] || []
  return ids.map((id) => discountsById[id]).filter(Boolean)
}
function discountLabel(d: Discount): string {
  const pct = d.percent_off
  const amt = d.amount_off
  if (typeof pct === 'number' && pct > 0) {
    const whole = Math.round(pct)
    return `${Math.abs(pct - whole) < 1e-6 ? whole : pct.toFixed(2)}% OFF`
  }
  if (typeof amt === 'number' && amt > 0) {
    return `₱ ${number(amt)} OFF`
  }
  return 'Discount Applied'
}
function eventTitleForRef(ref: string): string {
  return refEventTitle[ref] || ''
}

/** Navigation & actions */
function goToShop() {
  router.push({ name: 'user.shop' })
}
async function goToReturnTab(refNo?: string) {
  highlightRef.value = refNo || ''
  activeTab.value = STATUS.RETURN_REFUND
  await nextTick()
  setTimeout(() => {
    if (highlightRef.value === refNo) highlightRef.value = ''
  }, 3000)
}

/** New: from RR tab, send user to To Receive and open the RR modal for this group */
async function goRefundOtherProducts(g: Group) {
  activeTab.value = STATUS.TO_RECEIVE
  await nextTick()
  const groups = buildGroups(purchases.value)
  const found = groups.find((x) => x.ref === g.ref)
  if (found) openReturnRefundGroup(found)
}

/** Shipping helper (per ref) - now from purchases.shipping_fee (highest per ref) */
function shippingFor(ref: string): number {
  const rows = purchases.value.filter((p) => (p.reference_number || p.id) === ref)
  let maxFee = 0
  for (const r of rows) {
    const fee = Number(r?.shipping_fee ?? 0) || 0
    if (fee > maxFee) maxFee = fee
  }
  return maxFee
}

/** Tracking helper (per ref) - show link if any To Receive item has one */
function trackingLinkFor(ref: string): string {
  const toReceiveWithLink = purchases.value.find(
    (p) =>
      (p.reference_number || p.id) === ref &&
      p.status === STATUS.TO_RECEIVE &&
      (p?.tracking_link || '').toString().trim().length > 0,
  )
  if (toReceiveWithLink) return (toReceiveWithLink.tracking_link || '').toString()
  const anyWithLink = purchases.value.find(
    (p) =>
      (p.reference_number || p.id) === ref &&
      (p?.tracking_link || '').toString().trim().length > 0,
  )
  return (anyWithLink?.tracking_link || '').toString()
}

function groupTotal(g: Group): number {
  const items = g.items.reduce((sum, it) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * productPrice(it)
  }, 0)
  return items + shippingFor(g.ref)
}

/** ===================== PRICE BREAKDOWN HELPERS ===================== */
function groupItemsBaseTotal(g: Group): number {
  return g.items.reduce((sum, it) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * productPrice(it)
  }, 0)
}
function groupItemsDiscountedTotal(g: Group): number {
  return g.items.reduce((sum, it) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * discountedUnitPrice(it)
  }, 0)
}
function groupDiscountAmount(g: Group): number {
  if (!refHasDiscount(g.ref)) return 0
  const base = groupItemsBaseTotal(g)
  const disc = groupItemsDiscountedTotal(g)
  const diff = base - disc
  return diff > 0 ? diff : 0
}

/** To Receive logic */
function groupToReceiveCount(g: Group): number {
  return g.items.filter((it) => it.status === STATUS.TO_RECEIVE).length
}
function groupAllToReceive(g: Group): boolean {
  return g.items.length > 0 && g.items.every((it) => it.status === STATUS.TO_RECEIVE)
}

/* =============================== */
/* === NEW: MONTHLY TOTAL HELPER === */
/* =============================== */
async function addToUserPurchasesMonthly(delta: number) {
  try {
    const amt = Number(delta || 0)
    if (!(amt > 0)) return
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) return

    const { data: row, error: readErr } = await supabase
      .from('users')
      .select('purchases_per_month')
      .eq('id', uid)
      .limit(1)
      .maybeSingle()

    if (readErr) {
      console.warn('Could not read users.purchases_per_month:', readErr.message)
      return
    }

    const cur = Number(row?.purchases_per_month ?? 0) || 0
    const next = Number((cur + amt).toFixed(2))

    const { error: updErr } = await supabase
      .from('users')
      .update({ purchases_per_month: next })
      .eq('id', uid)

    if (updErr) {
      console.warn('Could not update users.purchases_per_month:', updErr.message)
    }
  } catch (e) {
    console.error('addToUserPurchasesMonthly failed', e)
  }
}

/* =============================== */
/* === RR modal + submit ======== */
/* =============================== */
const showRR = ref(false)
const rrBusy = ref(false)
const rrPurchase = ref<AnyRec | null>(null)
const rrGroup = ref<Group | null>(null)

const rrItemForms = reactive<Record<string, { reason: string; details: string }>>({})
const rrForm = reactive<{
  purchase_ids: string[]
  purchase_id: string
  product_id: string
  reason: string
  details: string
  pickup_date: string
}>({
  purchase_ids: [],
  purchase_id: '',
  product_id: '',
  reason: '',
  details: '',
  pickup_date: '',
})

const rrReasons = [
  'Defective / Damaged',
  'Item Not as Described',
  'Wrong Item Received',
  'Missing Parts / Accessories',
  'Arrived Late',
  'Changed Mind',
]

const RR_DATE_COL = 'return/refund date'
const todayYMD = new Date().toISOString().slice(0, 10)
function addDaysYMD(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const quickDates = { tomorrow: addDaysYMD(1), plus2: addDaysYMD(2), plus3: addDaysYMD(3) }
const rrQuickDate = ref<string>('')
function applyQuickDate() {
  if (rrQuickDate.value) rrForm.pickup_date = rrQuickDate.value
}
function labelFor(ymd: string) {
  try {
    return new Date(ymd + 'T00:00:00').toLocaleDateString()
  } catch {
    return ymd
  }
}

function isSelectableForRR(it: AnyRec): boolean {
  return it.status === STATUS.TO_RECEIVE && !rrStatus(it.id)
}

function openReturnRefundGroup(g: Group) {
  rrGroup.value = g
  rrPurchase.value = null
  rrForm.purchase_ids = []
  rrForm.purchase_id = ''
  rrForm.product_id = ''
  rrForm.reason = ''
  rrForm.details = ''
  rrForm.pickup_date = ''
  rrQuickDate.value = ''
  rrSelectAll.value = false

  for (const it of g.items) {
    if (rrStatus(it.id)) {
      rrItemForms[it.id] = { reason: prefillReason(it.id), details: prefillDetails(it.id) }
    } else if (isSelectableForRR(it) && !rrItemForms[it.id]) {
      rrItemForms[it.id] = { reason: '', details: '' }
    }
  }
  showRR.value = true
}

function openReturnRefund(purchase: AnyRec) {
  rrGroup.value = null
  rrPurchase.value = purchase
  rrForm.purchase_ids = []
  rrForm.purchase_id = purchase?.id || ''
  rrForm.product_id = purchase?.product_id || ''
  rrForm.reason = ''
  rrForm.details = ''
  rrForm.pickup_date = ''
  rrQuickDate.value = ''
  rrSelectAll.value = false
  showRR.value = true
}
function closeReturnRefund() {
  showRR.value = false
}

const rrSelectAll = ref(false)
function toggleRRSelectAll() {
  if (!rrGroup.value) return
  if (rrSelectAll.value) {
    rrForm.purchase_ids = rrGroup.value.items.filter(isSelectableForRR).map((it) => it.id)
    for (const it of rrGroup.value.items)
      if (isSelectableForRR(it) && !rrItemForms[it.id])
        rrItemForms[it.id] = { reason: '', details: '' }
  } else {
    rrForm.purchase_ids = []
  }
}
function syncRRSelectAll() {
  if (!rrGroup.value) return
  const selectable = rrGroup.value.items.filter(isSelectableForRR).length
  rrSelectAll.value = selectable > 0 && rrForm.purchase_ids.length === selectable
}
function onToggleRRItem(pid: string) {
  if (rrForm.purchase_ids.includes(pid) && !rrItemForms[pid])
    rrItemForms[pid] = { reason: '', details: '' }
  syncRRSelectAll()
}
const allSelectedHaveReasons = computed(() =>
  rrForm.purchase_ids.every((pid) => (rrItemForms[pid]?.reason || '').trim().length > 0),
)

async function submitReturnRefund() {
  if (!rrForm.pickup_date) return
  rrBusy.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const uid = auth?.user?.id
    if (!uid) {
      alert('Please log in to submit a return/refund request.')
      return
    }

    const payloads: Record<string, any>[] = []
    const purchaseIdsToMark: string[] = []

    if (rrGroup.value) {
      if (rrForm.purchase_ids.length === 0) {
        alert('Please select at least one item to return/refund.')
        return
      }
      for (const pid of rrForm.purchase_ids) {
        const row = rrGroup.value.items.find((x) => x.id === pid)
        if (!row) continue
        const per = rrItemForms[pid] || { reason: '', details: '' }
        if (!per.reason) {
          alert('Please choose a reason for each selected item.')
          return
        }
        const p: Record<string, any> = {
          user_id: uid,
          purchase_id: pid,
          product_id: row.product_id,
          reason: per.reason,
          details: per.details || null,
          status: 'pending' as RRState,
        }
        p[RR_DATE_COL] = rrForm.pickup_date
        payloads.push(p)
        purchaseIdsToMark.push(pid)
      }
    } else if (rrPurchase.value) {
      if (!rrForm.reason) {
        alert('Please select a reason.')
        return
      }
      const basePayload: Record<string, any> = {
        user_id: uid,
        purchase_id: rrForm.purchase_id,
        product_id: rrForm.product_id,
        reason: rrForm.reason,
        details: rrForm.details || null,
        status: 'pending' as RRState,
      }
      basePayload[RR_DATE_COL] = rrForm.pickup_date
      payloads.push(basePayload)
      purchaseIdsToMark.push(rrForm.purchase_id)
    } else return

    const { error: insErr } = await supabase.schema('games').from('return_refunds').insert(payloads)
    if (insErr) {
      alert(insErr.message)
      return
    }

    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.RETURN_REFUND })
      .in('id', purchaseIdsToMark)
      .eq('user_id', uid)
    if (upErr) {
      alert(upErr.message)
      return
    }

    for (const row of purchases.value) {
      if (purchaseIdsToMark.includes(row.id)) {
        row.status = STATUS.RETURN_REFUND
        rrByPurchase[row.id] = {
          id: 'local',
          purchase_id: row.id,
          status: 'pending',
          reason: rrItemForms[row.id]?.reason || '',
          details: rrItemForms[row.id]?.details || '',
        }
      }
    }

    closeReturnRefund()
    alert('Return/Refund request submitted.')
  } finally {
    rrBusy.value = false
  }
}

/** Per-row actions */
async function cancelPurchase(purchaseId: string) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  busy.value.cancel[purchaseId] = true
  try {
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.CANCELLED })
      .eq('id', purchaseId)
      .eq('user_id', uid)
    if (error) {
      alert(error.message)
      return
    }

    const row = purchases.value.find((r) => r.id === purchaseId)
    if (row) {
      row.status = STATUS.CANCELLED

      const qty = Number(row?.qty ?? 0) || 0
      const pid = row?.product_id
      if (pid && qty > 0) {
        await restoreStock([{ product_id: pid, qty }])
      }
    }
  } finally {
    busy.value.cancel[purchaseId] = false
  }
}

async function cancelGroup(g: Group) {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth?.user?.id
  if (!uid) return
  groupBusy.cancel[g.ref] = true
  try {
    const ids = g.items.map((it) => it.id)
    const { error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.CANCELLED })
      .in('id', ids)
      .eq('user_id', uid)
    if (error) {
      alert(error.message)
      return
    }

    for (const r of purchases.value) if (ids.includes(r.id)) r.status = STATUS.CANCELLED

    const entries = g.items
      .map((it) => ({ product_id: it.product_id as string, qty: Number(it?.qty ?? 0) || 0 }))
      .filter((e) => e.product_id && e.qty > 0)
    if (entries.length) {
      await restoreStock(entries)
    }
  } finally {
    groupBusy.cancel[g.ref] = false
  }
}

/** Receipts (existing) */
async function createOrderReceiptForGroup(g: Group) {
  try {
    const rows = g.items
      .filter((it) => it.status === STATUS.TO_RECEIVE)
      .map((it) => {
        const qty = Number(it?.qty ?? 1) || 1
        const price = productPrice(it) || 0
        const amount = Number((qty * price).toFixed(2))
        return { amount, reference_number: g.ref, purchase_id: it.id }
      })
    if (!rows.length) return
    const { error: recErr } = await supabase.schema('ewallet').from('order_receipt').insert(rows)
    if (recErr) alert(`Order was completed, but creating receipts failed: ${recErr.message}`)

    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0)
    await addToUserPurchasesMonthly(total)
  } catch (e) {
    console.error(e)
  }
}

/** ===================== NEW RECEIPT HELPERS (INSERT-ONLY) ===================== */
async function createOrderReceiptForGroupCompleted(g: Group, ids: string[]) {
  try {
    const idSet = new Set(ids)
    const useDiscount = refHasDiscount(g.ref)
    const rows = g.items
      .filter((it) => idSet.has(it.id))
      .map((it) => {
        const qty = Number(it?.qty ?? 1) || 1
        const unit = useDiscount ? discountedUnitPrice(it) : productPrice(it)
        const amount = Number((qty * unit).toFixed(2))
        return { amount, reference_number: g.ref, purchase_id: it.id }
      })
    if (!rows.length) return
    const { error: recErr } = await supabase.schema('ewallet').from('order_receipt').insert(rows)
    if (recErr) alert(`Order was completed, but creating receipts failed: ${recErr.message}`)

    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0)
    await addToUserPurchasesMonthly(total)
  } catch (e) {
    console.error(e)
  }
}

async function createOrderReceiptForIds(ids: string[]) {
  try {
    if (!ids.length) return
    const idSet = new Set(ids)
    const rows: Array<{ amount: number; reference_number: string; purchase_id: string }> = []

    const byRef = new Map<string, AnyRec[]>()
    for (const p of purchases.value) {
      if (!idSet.has(p.id)) continue
      const ref = p.reference_number || p.id
      if (!byRef.has(ref)) byRef.set(ref, [])
      byRef.get(ref)!.push(p)
    }

    for (const [ref, list] of byRef) {
      const useDiscount = refHasDiscount(ref)
      for (const it of list) {
        const qty = Number(it?.qty ?? 1) || 1
        const unit = useDiscount ? discountedUnitPrice(it) : productPrice(it)
        const amount = Number((qty * unit).toFixed(2))
        rows.push({ amount, reference_number: ref, purchase_id: it.id })
      }
    }

    if (!rows.length) return
    const { error: recErr } = await supabase.schema('ewallet').from('order_receipt').insert(rows)
    if (recErr) alert(`Auto-complete succeeded, but creating receipts failed: ${recErr.message}`)

    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0)
    await addToUserPurchasesMonthly(total)
  } catch (e) {
    console.error(e)
  }
}

/* =============================== */
/* === NEW: STOCK RESTORATION  === */
/* =============================== */
function aggregateByProduct(entries: Array<{ product_id: string; qty: number }>) {
  const map = new Map<string, number>()
  for (const e of entries) {
    if (!e.product_id) continue
    const cur = map.get(e.product_id) || 0
    map.set(e.product_id, cur + (Number(e.qty) || 0))
  }
  return Array.from(map.entries()).map(([product_id, qty]) => ({ product_id, qty }))
}

async function adjustProductStock(productId: string, delta: number) {
  if (!productId || !Number.isFinite(delta) || delta === 0) return

  const { data: row, error: selErr } = await supabase
    .schema('games')
    .from('products')
    .select('stock')
    .eq('id', productId)
    .limit(1)
    .maybeSingle()

  if (selErr) {
    console.error('Failed to read stock for product', productId, selErr)
    return
  }

  const current = Number(row?.stock ?? 0) || 0
  const next = current + delta
  if (next < 0) {
    console.warn(`Stock update would go negative for ${productId}. Skipping.`)
    return
  }

  const { error: updErr } = await supabase
    .schema('games')
    .from('products')
    .update({ stock: next })
    .eq('id', productId)

  if (updErr) {
    console.error('Failed to update stock for product', productId, updErr)
  }
}

async function restoreStock(entries: Array<{ product_id: string; qty: number }>) {
  if (!Array.isArray(entries) || entries.length === 0) return
  const reduced = aggregateByProduct(entries)
  for (const e of reduced) {
    const inc = Number(e.qty) || 0
    if (inc > 0) {
      await adjustProductStock(e.product_id, inc)
    }
  }
}

/* =============================== */
/* === NEW: ORDER RECEIVED BTN === */
/* =============================== */
async function orderReceivedGroup(g: Group) {
  const toReceiveIds = g.items.filter((it) => it.status === STATUS.TO_RECEIVE).map((it) => it.id)
  if (!toReceiveIds.length) return
  groupBusy.received[g.ref] = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.COMPLETED })
      .in('id', toReceiveIds)
      .select('id')
    if (error) {
      alert(error.message)
      return
    }
    const updatedIds: string[] = Array.isArray(data) ? data.map((r: AnyRec) => r.id) : toReceiveIds

    const idSet = new Set(updatedIds)
    for (const row of purchases.value) {
      if (idSet.has(row.id)) {
        row.status = STATUS.COMPLETED
        row.updated_at = new Date().toISOString()
      }
    }

    await createOrderReceiptForGroupCompleted(g, updatedIds)
  } finally {
    groupBusy.received[g.ref] = false
  }
}

/* =============================== */
/* === NEW: QTY/SUBTOTAL HELPERS === */
/* =============================== */
function unitPriceFor(purchase: AnyRec): number {
  const ref = purchase?.reference_number || purchase?.id
  return refHasDiscount(ref) ? discountedUnitPrice(purchase) : productPrice(purchase)
}
function subtotalFor(purchase: AnyRec): number {
  const qty = Number(purchase?.qty ?? 1) || 1
  return qty * unitPriceFor(purchase)
}

/* =============================== */
/* === GROUP DETAILS MODAL NAV  === */
/* =============================== */
const showGroupDetails = ref(false)
const selectedRef = ref<string>('')
const highlightPid = ref<string>('')

const selectedGroupComputed = computed<Group | null>(() => {
  if (!selectedRef.value) return null
  const g = buildGroups(purchases.value).find((x) => x.ref === selectedRef.value) || null
  return g
})

function openGroupDetails(g: Group, pid?: string) {
  selectedRef.value = g.ref
  highlightPid.value = pid || ''
  showGroupDetails.value = true

  const nextQuery: Record<string, any> = { ...route.query, ref: g.ref }
  router.replace({ query: nextQuery })

  nextTick(() => {
    if (pid) {
      const el = document.getElementById('pid-' + pid)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function closeGroupDetails() {
  showGroupDetails.value = false
  selectedRef.value = ''
  highlightPid.value = ''
  const nextQuery: Record<string, any> = { ...route.query }
  delete nextQuery.ref
  delete nextQuery.pid
  router.replace({ query: nextQuery })
}

/** Deep-link handling */
watch(
  () => route.query.ref,
  (newRef) => {
    const refStr = typeof newRef === 'string' ? newRef : ''
    if (!refStr) {
      if (showGroupDetails.value) closeGroupDetails()
      return
    }
    const g = buildGroups(purchases.value).find((x) => x.ref === refStr)
    if (g) {
      const pid = typeof route.query.pid === 'string' ? route.query.pid : ''
      selectedRef.value = g.ref
      highlightPid.value = pid
      showGroupDetails.value = true
      nextTick(() => {
        if (pid) {
          const el = document.getElementById('pid-' + pid)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }
  },
  { immediate: true },
)

/** NEW: if purchases or products change dynamically, try signing missing ones */
watch(
  () => Object.keys(productsMap).length,
  () => ensureSignedUrlsForAllProducts(),
)

onMounted(async () => {
  await loadPurchases()
  ensureSignedUrlsForAllProducts()
})
</script>

<style scoped>
.card {
  border: 1px solid #edf0f3;
}
.bg-light-subtle {
  background: #f8f9fa;
}

.nav-pills .nav-link {
  border-radius: 999px;
}
.nav-pills .nav-link:not(.active) {
  background: #f8f9fa;
  color: #212529;
}
.badge {
  color: #212529;
}
.nav-pills .nav-link .badge.border {
  border-color: #e9ecef !important;
}

.text-monospace {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

.purchase-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 10px;
  overflow: hidden;
}
.object-fit-cover {
  object-fit: cover;
}

.title-ellipsis {
  max-width: clamp(140px, 48vw, 380px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-backdrop-custom2 {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1055;
}
.modal-card2 {
  width: min(640px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}

/* NEW: make group cards feel clickable */
.clickable-card {
  cursor: pointer;
}
.clickable-card:hover {
  border-color: #d7dbe0;
  box-shadow: 0 0.5rem 1.25rem rgba(0, 0, 0, 0.06);
}

/* ===== NEW: Meta grid inside modal items ===== */
.item-meta {
  display: grid;
  gap: 0.25rem 0.75rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .item-meta {
    grid-template-columns: repeat(3, 1fr);
  }
}
.meta-item {
  min-width: 0;
}
.meta-label {
  font-weight: 600;
  font-size: 0.85rem;
  margin-right: 0.25rem;
}
.meta-text {
  font-size: 0.85rem;
  color: #6c757d;
  word-break: break-word;
}

/* ===== TICKET SHAPES (blended with Bootstrap) ===== */
.discount-ticket,
.event-ticket {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px dashed #e9ecef;
  border-radius: 12px;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.04);
  color: #212529;
}

.discount-ticket::before,
.discount-ticket::after,
.event-ticket::before,
.event-ticket::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  transform: translateY(-50%);
}
.discount-ticket::before,
.event-ticket::before { left: -7px; }
.discount-ticket::after,
.event-ticket::after { right: -7px; }

.ticket-left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ticket-title {
  max-width: 36ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ticket-divider {
  height: 20px;
  width: 0;
  border-left: 1px dashed #e9ecef;
}
.ticket-right {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.ticket-value {
  font-weight: 800;
  letter-spacing: 0.2px;
}

/* Subtle tags tuned to Bootstrap palette */
.ticket-tag {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid #e9ecef;
  background: #ffffff;
  color: #6c757d;
}
.ticket-tag--event {
  border-color: #cfe2ff;
  background: #f8faff;
  color: #0d6efd;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .discount-ticket,
  .event-ticket {
    background: #212529;
    color: #e9ecef;
    border-color: #343a40;
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.3);
  }
  .discount-ticket::before,
  .discount-ticket::after,
  .event-ticket::before,
  .event-ticket::after {
    background: #0f141a;
    border-color: #343a40;
  }
  .ticket-divider {
    border-left-color: #343a40;
  }
  .ticket-tag {
    border-color: #343a40;
    background: #0f141a;
    color: #adb5bd;
  }
  .ticket-tag--event {
    border-color: #1d3b64;
    background: #0f1d33;
    color: #9ec5fe;
  }
}
</style>
  