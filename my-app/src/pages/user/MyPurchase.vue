<template>
  <div class="container py-4 purchases-shell">
    <!-- ===== Page Header ===== -->
    <header class="page-header breath-in">
      <div class="page-header__titles">
        <h1 class="h4 m-0">My Purchases</h1>
        <p class="text-muted small mb-0">Track your orders and delivery status.</p>
      </div>

      <div class="page-header__actions">
        
      </div>
    </header>

    <!-- ===== Sticky Tabs (compact, scrollable) ===== -->
    <div class="tabbar sticky-top breath-in">
      <ul class="nav nav-pills tabbar__scroll">
        <li v-for="t in tabs" :key="t.value" class="nav-item">
          <button
            class="nav-link tabbar__pill d-inline-flex align-items-center gap-2"
            :class="{ active: activeTab === t.value }"
            @click="activeTab = t.value"
          >
            <!-- 👇 Added: contextual icon per tab -->
            <i :class="['bi', iconForTab(t.value)]" aria-hidden="true"></i>
            <span class="tabbar__label">{{ t.label }}</span>
            <span class="badge tabbar__count">{{ counts[t.value] || 0 }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ===== Return/Refund Subtabs (kept hidden) ===== -->
    <div v-if="false && activeTab === STATUS.RETURN_REFUND" class="mb-3 breath-in">
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

    <!-- ===== Loading State (Skeletons) ===== -->
    <section v-if="busy.load" class="state state--loading breath-in">
      <!-- Keep original spinner node (not removed), but hide visually -->
      <div class="spinner-border mb-3 visually-hidden"></div>
      <div class="skel skel-header">
        <div class="skel-line skel-w-30"></div>
        <div class="skel-line skel-w-60 skel-sm"></div>
      </div>

      <div class="skel skel-tabs">
        <div class="skel-pill"></div>
        <div class="skel-pill"></div>
        <div class="skel-pill"></div>
        <div class="skel-pill"></div>
      </div>

      <!-- A few order-card skeletons to mimic grouped view -->
      <div class="stack gap-3">
        <div class="order-card skel-card">
          <div class="order-card__header">
            <div>
              <div class="skel-line skel-w-25"></div>
              <div class="skel-line skel-w-40 skel-sm"></div>
            </div>
            <div class="skel-badge"></div>
          </div>

          <div class="tickets-row">
            <div class="skel-ticket"></div>
            <div class="skel-ticket"></div>
          </div>

          <div class="order-card__items">
            <div class="item-row">
              <div class="skel-thumb"></div>
              <div class="item-row__main">
                <div class="skel-line skel-w-60"></div>
                <div class="skel-line skel-w-45 skel-sm"></div>
              </div>
              <div class="item-row__price">
                <div class="skel-line skel-w-40"></div>
                <div class="skel-line skel-w-30 skel-sm"></div>
              </div>
              <div class="item-row__cta">
                <div class="skel-btn"></div>
              </div>
            </div>

            <div class="item-row">
              <div class="skel-thumb"></div>
              <div class="item-row__main">
                <div class="skel-line skel-w-55"></div>
                <div class="skel-line skel-w-35 skel-sm"></div>
              </div>
              <div class="item-row__price">
                <div class="skel-line skel-w-40"></div>
                <div class="skel-line skel-w-30 skel-sm"></div>
              </div>
              <div class="item-row__cta">
                <div class="skel-btn"></div>
              </div>
            </div>
          </div>

          <footer class="order-card__footer">
            <div class="order-card__sum text-end">
              <div class="skel-line skel-w-30"></div>
              <div class="skel-line skel-w-20 skel-sm"></div>
            </div>
            <div class="order-card__actions">
              <div class="skel-btn"></div>
              <div class="skel-btn"></div>
            </div>
          </footer>
        </div>

        <!-- 2nd card -->
        <div class="order-card skel-card">
          <div class="order-card__header">
            <div>
              <div class="skel-line skel-w-20"></div>
              <div class="skel-line skel-w-50 skel-sm"></div>
            </div>
            <div class="skel-badge"></div>
          </div>
          <div class="order-card__items">
            <div class="item-row">
              <div class="skel-thumb"></div>
              <div class="item-row__main">
                <div class="skel-line skel-w-65"></div>
                <div class="skel-line skel-w-40 skel-sm"></div>
              </div>
              <div class="item-row__price">
                <div class="skel-line skel-w-35"></div>
                <div class="skel-line skel-w-25 skel-sm"></div>
              </div>
              <div class="item-row__cta">
                <div class="skel-btn"></div>
              </div>
            </div>
          </div>
          <footer class="order-card__footer">
            <div class="order-card__sum text-end">
              <div class="skel-line skel-w-25"></div>
              <div class="skel-line skel-w-18 skel-sm"></div>
            </div>
          </footer>
        </div>
      </div>
    </section>

    <!-- ===== Empty State ===== -->
    <section v-else-if="groupedFiltered.length === 0" class="state state--empty breath-in">
      <i class="bi bi-bag-x state__icon"></i>
      <div class="mt-2">No purchases found for “{{ tabLabel(activeTab) }}”.</div>
      <RouterLink :to="{ name: 'user.shop' }" class="btn btn-primary btn-sm mt-3">
        <i class="bi bi-shop me-1" aria-hidden="true"></i> Go to Shop
      </RouterLink>
    </section>

    <!-- ===== Grouped View (Primary) — per reference number ===== -->
    <section v-else-if="showGrouped" class="stack gap-3">
      <article
        v-for="g in groupedFiltered"
        :key="g.ref"
        class="order-card clickable-card breath-in"
        :class="{ 'order-card--highlight': g.ref === highlightRef }"
        @click="openGroupDetails(g)"
      >
        <!-- Card header -->
        <header class="order-card__header" @click.stop>
          <div class="order-card__id">
            <span class="text-muted">Ref#</span>
            <span class="fw-semibold ms-1">{{ g.ref }}</span>
            <small class="text-muted d-block">Updated: {{ formatDate(g.updated_at) }}</small>
          </div>
          <div class="order-card__status">
            <span class="badge" :class="statusClass(g.status)">
              <!-- 👇 Added: icon inside status badge -->
              <i :class="['bi', iconForStatus(g.status)]" class="me-1" aria-hidden="true"></i>
              {{ prettyStatusWithRR(g.status, undefined, g) }}
            </span>
          </div>
        </header>

        <!-- Event Winner ticket -->
        <div
          v-if="eventTitleForRef(g.ref)"
          class="tickets-row"
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

        <!-- Discount ticket(s) — ORDER-LEVEL ONLY -->
        <div
          v-if="discountsForRef(g.ref).length"
          class="tickets-row"
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

        <!-- Tracking link (To Receive) -->
        <div
          v-if="activeTab !== STATUS.RETURN_REFUND && groupToReceiveCount(g) > 0 && trackingLinkFor(g.ref)"
          class="order-card__track"
          @click.stop
        >
          <a
            :href="trackingLinkFor(g.ref)"
            target="_blank"
            rel="noopener"
            class="link-underline d-inline-flex align-items-center gap-1"
            title="Open tracking in a new tab"
          >
            <i class="bi bi-truck" aria-hidden="true"></i>
            Track your package
          </a>
        </div>

        <!-- Return tracking (RR tab & Approved) -->
        <div
          v-if="activeTab === STATUS.RETURN_REFUND && returnTrackingLinkForApproved(g.ref)"
          class="order-card__track"
          @click.stop
        >
          <a
            :href="returnTrackingLinkForApproved(g.ref)"
            target="_blank"
            rel="noopener"
            class="link-underline d-inline-flex align-items-center gap-1"
            title="Open return tracking in a new tab"
          >
            <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
            Return tracking
          </a>
        </div>

        <!-- Items -->
        <div class="order-card__items">
          <div
            v-for="it in g.items"
            :key="it.id"
            class="item-row"
            @click.stop="openGroupDetails(g, it.id)"
          >
            <div class="purchase-thumb ratio ratio-1x1 bg-white rounded">
              <img
                v-if="productThumb(it)"
                :src="productThumb(it)"
                :alt="productName(it)"
                class="w-100 h-100 object-fit-cover rounded cursor-pointer"
                :title="productName(it)"
                @click.stop.prevent="goShopFocus(it.product_id)"
              />
              <div
                v-else
                class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                :title="productName(it)"
                @click.stop.prevent="goShopFocus(it.product_id)"
                style="cursor:pointer"
              >
                <i class="bi bi-image"></i>
              </div>
            </div>

            <div class="item-row__main">
              <a
                class="item-row__title fw-semibold title-ellipsis link-ghost"
                :title="productName(it)"
                @click.stop.prevent="goShopFocus(it.product_id)"
                :href="buildFocusUrl(it.product_id)"
              >
                {{ productName(it) }}
              </a>

              <!-- Per-item meta badges are hidden in list view; still visible in modal -->
              <div class="item-row__meta" v-if="SHOW_ITEM_BADGES_IN_LIST">
                <span class="badge" :class="statusClass(it.status)">
                  <i :class="['bi', iconForStatus(it.status)]" class="me-1" aria-hidden="true"></i>
                  {{ prettyStatusWithRR(it.status, it.id) }}
                </span>
                <span class="badge text-bg-secondary-subtle border">
                  {{ prettyModeOfPayment(it.modeofpayment) }}
                </span>
                <span v-if="(Number(it?.qty ?? 1) || 1) > 1" class="badge text-bg-light border"> Qty: {{ Number(it?.qty ?? 1) }} </span>
              </div>

              <!-- Per-item discount tickets (PRODUCT-SCOPED) -->
              <div
                class="tickets-row mt-1"
                v-if="discountsForPurchase(it).length"
                @click.stop
              >
                <div
                  v-for="d in discountsForPurchase(it)"
                  :key="d.id"
                  class="discount-ticket"
                  title="Discount applied to this item"
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

              <!-- Per-item return tracking (RR tab & Approved) -->
              <div class="mt-1" v-if="activeTab === STATUS.RETURN_REFUND && rrTrackingLinkApproved(it.id)">
                <a
                  :href="rrTrackingLinkApproved(it.id)"
                  target="_blank"
                  rel="noopener"
                  class="small link-underline d-inline-flex align-items-center gap-1"
                  title="Open return tracking in a new tab"
                >
                  <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                  Return tracking
                </a>
              </div>
            </div>

            <!-- Price block -->
            <div class="item-row__price text-end">
              <template v-if="purchaseHasRedemption(it)">
                <div class="fw-semibold">₱ {{ number(productPrice(it)) }}</div>
                <div class="small text-danger">− ₱ {{ number(purchaseRedemptionUnitDiscount(it)) }}</div>
              </template>

              <template v-else-if="refHasRedemption(g.ref)">
                <div class="fw-semibold">₱ {{ number(productPrice(it)) }}</div>
                <div class="small text-danger">− ₱ {{ number(redemptionUnitDiscount(it)) }}</div>
              </template>

              <template v-else-if="refHasDiscount(g.ref)">
                <div class="text-muted text-decoration-line-through">₱ {{ number(productPrice(it)) }}</div>
                <div class="fw-semibold text-success">₱ {{ number(discountedUnitPrice(it)) }}</div>
              </template>

              <template v-else>
                <div :class="['fw-semibold', { 'text-danger': !!rrStatus(it.id) }]">₱ {{ number(productPrice(it)) }}</div>
              </template>

              <div class="small text-muted mt-1" v-if="(Number(it?.qty ?? 1) || 1) > 1">
                Subtotal: <span class="fw-semibold">₱ {{ number(subtotalFor(it)) }}</span>
              </div>
            </div>

            <!-- RR shortcut (non-RR tab) -->
            <div class="item-row__cta text-end" v-if="rrStatus(it.id) && activeTab !== STATUS.RETURN_REFUND">
              <button class="btn btn-outline-danger btn-sm" @click.stop="goToReturnTab(g.ref)">
                View return details
              </button>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <footer class="order-card__footer">
          <div class="order-card__sum text-end">
            <!-- Breakdown (hidden per request, kept in code) -->
            <div class="small text-muted price-breakdown" v-if="SHOW_GROUP_PRICE_BREAKDOWN">
              <div>Items: ₱ {{ number(groupItemsBaseTotal(g)) }}</div>
              <div v-if="refHasDiscount(g.ref)">Discount: −₱ {{ number(groupDiscountAmount(g)) }}</div>

              <div v-if="!isFreeShippingRef(g.ref)">Shipping: ₱ {{ number(shippingFor(g.ref)) }}</div>
              <div v-else>
                <!-- 👇 Added truck icon on FREE SHIPPING -->
                <span class="me-1"><i class="bi bi-truck" aria-hidden="true"></i></span>
                Shipping:
                <span class="text-decoration-line-through">₱ {{ number(shippingFor(g.ref)) }}</span>
                <span class="badge text-bg-success-subtle border ms-1"><i class="bi bi-truck me-1" aria-hidden="true"></i>FREE SHIPPING</span>
              </div>
            </div>

            <div class="small text-muted">Subtotal</div>
            <template v-if="refHasDiscount(g.ref)">
              <div class="text-muted text-decoration-line-through">₱ {{ number(groupTotal(g)) }}</div>
              <div class="fs-5 fw-bold text-success">₱ {{ number(groupTotalDiscounted(g)) }}</div>
            </template>
            <template v-else>
              <div class="fs-5 fw-bold">₱ {{ number(groupTotal(g)) }}</div>
            </template>
          </div>

          <!-- Actions (right-aligned) -->
          <div class="order-card__actions" v-if="activeTab !== STATUS.RETURN_REFUND" @click.stop>
            <div class="d-flex gap-2 flex-wrap justify-content-end">
              <button
                v-if="g.status === STATUS.TO_PAY"
                class="btn btn-outline-danger btn-sm"
                :disabled="groupBusy.cancel[g.ref]"
                @click.stop="cancelGroup(g)"
              >
                <span v-if="groupBusy.cancel[g.ref]" class="spinner-border spinner-border-sm me-1"></span>
                Cancel
              </button>

              <template v-else-if="g.status === STATUS.TO_SHIP"></template>

              <template v-else-if="g.items.some((it) => it.status === STATUS.TO_RECEIVE)">
                <button
                  v-if="!groupHasAnyRR(g)"
                  class="btn btn-outline-warning btn-sm"
                  @click.stop="openReturnRefundGroup(g)"
                  title="Return or refund items in this order."
                >
                  Return/Refund
                </button>
                <button
                  class="btn btn-success btn-sm"
                  :disabled="groupBusy.received[g.ref] || groupToReceiveCount(g) === 0"
                  @click.stop="orderReceivedGroup(g)"
                  :title="groupAllToReceive(g) ? 'Mark all as received' : 'Mark remaining To Receive as received'"
                >
                  <span v-if="groupBusy.received[g.ref]" class="spinner-border spinner-border-sm me-1"></span>
                  {{
                    groupAllToReceive(g)
                      ? 'Order Received (All)'
                      : 'Order Received (' + groupToReceiveCount(g) + ')'
                  }}
                </button>
              </template>
            </div>
          </div>
        </footer>
      </article>
    </section>

    <!-- ===== Fallback (single list; kept) ===== -->
    <section v-else class="stack gap-3">
      <article v-for="p in filtered" :key="p.id" class="order-card breath-in">
        <header class="order-card__header">
          <div class="order-card__id">
            <span class="text-muted">Ref#</span>
            <span class="fw-semibold ms-1">{{ p.reference_number || shortId(p.id) }}</span>
            <small class="text-muted d-block">Updated: {{ formatDate(p.updated_at) }}</small>
          </div>
          <div class="order-card__status">
            <span class="badge" :class="statusClass(p.status)">
              <i :class="['bi', iconForStatus(p.status)]" class="me-1" aria-hidden="true"></i>
              {{ prettyStatusWithRR(p.status, p.id) }}
            </span>
          </div>
        </header>

        <div v-if="eventTitleForRef(p.reference_number || p.id)" class="tickets-row">
          <div class="event-ticket" :title="eventTitleForRef(p.reference_number || p.id)">
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

        <!-- ORDER-LEVEL discount tickets -->
        <div v-if="discountsForRef(p.reference_number || p.id).length" class="tickets-row">
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

        <div
          v-if="activeTab !== STATUS.RETURN_REFUND && p.status === STATUS.TO_RECEIVE && (p?.tracking_link || '').toString().trim().length"
          class="order-card__track"
        >
          <a
            :href="p.tracking_link"
            target="_blank"
            rel="noopener"
            class="link-underline d-inline-flex align-items-center gap-1"
            title="Open tracking in a new tab"
          >
            <i class="bi bi-truck" aria-hidden="true"></i>
            Track your package
          </a>
        </div>

        <div class="order-card__items">
          <div class="item-row">
            <div class="purchase-thumb ratio ratio-1x1 bg-light rounded">
              <img
                v-if="productThumb(p)"
                :src="productThumb(p)"
                :alt="productName(p)"
                class="w-100 h-100 object-fit-cover rounded cursor-pointer"
                :title="productName(p)"
                @click.stop.prevent="goShopFocus(p.product_id)"
              />
              <div
                v-else
                class="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                :title="productName(p)"
                @click.stop.prevent="goShopFocus(p.product_id)"
                style="cursor:pointer"
              >
                <i class="bi bi-image"></i>
              </div>
            </div>

            <div class="item-row__main">
              <a
                class="item-row__title fw-semibold title-ellipsis link-ghost"
                :title="productName(p)"
                @click.stop.prevent="goShopFocus(p.product_id)"
                :href="buildFocusUrl(p.product_id)"
              >
                {{ productName(p) }}
              </a>

              <div class="item-row__meta">
                <span class="badge" :class="statusClass(p.status)">
                  <i :class="['bi', iconForStatus(p.status)]" class="me-1" aria-hidden="true"></i>
                  {{ prettyStatusWithRR(p.status, p.id) }}
                </span>
                <span class="badge text-bg-secondary-subtle border">
                  {{ prettyModeOfPayment(p.modeofpayment) }}
                </span>
                <span v-if="(Number(p?.qty ?? 1) || 1) > 1" class="badge text-bg-light border">
                  Qty: {{ Number(p?.qty ?? 1) }}
                </span>
              </div>

              <!-- Per-item tickets in fallback (PRODUCT-SCOPED) -->
              <div
                class="tickets-row mt-1"
                v-if="discountsForPurchase(p).length"
              >
                <div
                  v-for="d in discountsForPurchase(p)"
                  :key="d.id"
                  class="discount-ticket"
                  title="Discount applied to this item"
                >
                  <div class="ticket-left">
                    <i class="bi bi-ticket-perforated me-1)"></i>
                    <span class="ticket-title" :title="d.title">{{ d.title }}</span>
                  </div>
                  <div class="ticket-divider"></div>
                  <div class="ticket-right">
                    <span class="ticket-value">{{ discountLabel(d) }}</span>
                    <span class="ticket-tag">APPLIED</span>
                  </div>
                </div>
              </div>

              <div class="mt-1" v-if="rrStatus(p.id) && activeTab !== STATUS.RETURN_REFUND">
                <button class="btn btn-outline-danger btn-sm" @click="goToReturnTab(p.reference_number || p.id)">
                  View return details
                </button>
              </div>
            </div>

            <div class="item-row__price text-end">
              <template v-if="purchaseHasRedemption(p)">
                <div class="fw-semibold">₱ {{ number(productPrice(p)) }}</div>
                <div class="small text-danger">− ₱ {{ number(purchaseRedemptionUnitDiscount(p)) }}</div>
              </template>

              <template v-else-if="refHasRedemption(p.reference_number || p.id)">
                <div class="fw-semibold">₱ {{ number(productPrice(p)) }}</div>
                <div class="small text-danger">− ₱ {{ number(redemptionUnitDiscount(p)) }}</div>
              </template>

              <template v-else-if="refHasDiscount(p.reference_number || p.id)">
                <div class="text-muted text-decoration-line-through">₱ {{ number(productPrice(p)) }}</div>
                <div class="fw-semibold text-success">₱ {{ number(discountedUnitPrice(p)) }}</div>
              </template>

              <template v-else>
                <div :class="['fw-semibold', { 'text-danger': !!rrStatus(p.id) }]">₱ {{ number(productPrice(p)) }}</div>
              </template>

              <div class="small text-muted mt-1" v-if="(Number(p?.qty ?? 1) || 1) > 1">
                Subtotal: <span class="fw-semibold">₱ {{ number(subtotalFor(p)) }}</span>
              </div>
            </div>
          </div>
        </div>

        <footer class="order-card__footer">
          <div class="order-card__sum text-end">
            <div class="small text-muted price-breakdown">
              <div>Items: ₱ {{ number(groupItemsBaseTotal({ ref: p.reference_number || p.id, items: [p] } as any)) }}</div>
              <div v-if="refHasDiscount(p.reference_number || p.id)">
                Discount: −₱ {{ number(groupDiscountAmount({ ref: p.reference_number || p.id, items: [p] } as any)) }}
              </div>

              <div v-if="!isFreeShippingRef(p.reference_number || p.id)">
                <i class="bi bi-truck me-1" aria-hidden="true"></i>Shipping: ₱ {{ number(shippingFor(p.reference_number || p.id)) }}
              </div>
              <div v-else>
                <i class="bi bi-truck me-1" aria-hidden="true"></i>Shipping:
                <span class="text-decoration-line-through">₱ {{ number(shippingFor(p.reference_number || p.id)) }}</span>
                <span class="badge text-bg-success-subtle border ms-1"><i class="bi bi-truck me-1" aria-hidden="true"></i>FREE SHIPPING</span>
              </div>
            </div>

            <div class="small text-muted">Subtotal</div>
            <template v-if="refHasDiscount(p.reference_number || p.id)">
              <div class="text-muted text-decoration-line-through">
                ₱ {{ number(groupTotal({ ref: p.reference_number || p.id, items: [p] } as any)) }}
              </div>
              <div class="fs-5 fw-bold text-success">
                ₱ {{ number(groupTotalDiscounted({ ref: p.reference_number || p.id, items: [p] } as any)) }}
              </div>
            </template>
            <template v-else>
              <div class="fs-5 fw-bold">₱ {{ number(groupTotal({ ref: p.reference_number || p.id, items: [p] } as any)) }}</div>
            </template>
          </div>

          <div class="order-card__actions" v-if="activeTab !== STATUS.RETURN_REFUND">
            <div class="d-flex gap-2 flex-wrap justify-content-end">
              <button
                v-if="p.status === STATUS.TO_PAY"
                class="btn btn-outline-danger btn-sm"
                :disabled="busy.cancel[p.id]"
                @click="cancelPurchase(p.id)"
              >
                <span v-if="busy.cancel[p.id]" class="spinner-border spinner-border-sm me-1"></span>
                Cancel
              </button>

              <template v-else-if="p.status === STATUS.TO_SHIP"></template>

              <template v-else-if="p.status === STATUS.TO_RECEIVE">
                <button
                  v-if="!refHasAnyRR(p.reference_number || p.id)"
                  class="btn btn-outline-warning btn-sm"
                  @click="openReturnRefund(p)"
                >
                  Return/Refund
                </button>
              </template>
            </div>
          </div>
        </footer>
      </article>
    </section>

    <!-- ===== Return/Refund Modal ===== -->
    <div v-if="showRR" class="modal-backdrop-custom2">
      <div class="modal-card2 card shadow-lg breath-in">
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong><i class="bi bi-arrow-counterclockwise me-2" aria-hidden="true"></i>Return / Refund Request</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeReturnRefund">✕</button>
        </div>

        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between">
            <div class="small text-muted" v-if="rrGroup">Ref# {{ rrGroup.ref }}</div>
          </div>

          <!-- Group preview -->
          <div v-if="rrGroup" class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="fw-semibold">Ref# {{ rrGroup.ref }}</div>
              <div class="small text-muted">Updated: {{ formatDate(rrGroup.updated_at) }}</div>
            </div>

            <div v-if="eventTitleForRef(rrGroup.ref)" class="tickets-row">
              <div class="event-ticket" :title="eventTitleForRef(rrGroup.ref)">
                <div class="ticket-left">
                  <i class="bi bi-trophy me-1"></i>
                  <span class="ticket-title">{{ eventTitleForRef(rrGroup.ref) }}</span>
                </div>
                <div class="ticket-divider"></div>
                <div class="ticket-right">
                  <span class="ticket-tag ticket-tag--event">EVENT WINNER</span>
                </div>
              </div>
            </div>

            <!-- ORDER-LEVEL discount tickets -->
            <div v-if="discountsForRef(rrGroup.ref).length" class="tickets-row">
              <div
                v-for="d in discountsForRef(rrGroup.ref)"
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

            <!-- Select items -->
            <div class="rr-select border rounded p-2">
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

                    <div
                      class="purchase-thumb ratio ratio-1x1 bg-white rounded"
                      @click.stop.prevent="goShopFocus(it.product_id)"
                      :title="productName(it)"
                      style="cursor:pointer"
                    >
                      <img
                        v-if="productThumb(it)"
                        :src="productThumb(it)"
                        :alt="productName(it)"
                        class="w-100 h-100 object-fit-cover rounded"
                      />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                        <i class="bi bi-image"></i>
                      </div>
                    </div>

                    <div class="flex-grow-1">
                      <a
                        class="fw-semibold title-ellipsis link-ghost item-row__title"
                        :title="productName(it)"
                        @click.stop.prevent="goShopFocus(it.product_id)"
                        :href="buildFocusUrl(it.product_id)"
                      >
                        {{ productName(it) }}
                      </a>
                      <div v-if="!!rrStatus(it.id)" class="small text-muted">
                        Already submitted • {{ capitalize(rrStatus(it.id)!) }}
                      </div>

                      <!-- Item-scoped discount tickets in RR modal -->
                      <div
                        class="tickets-row mt-1"
                        v-if="discountsForPurchase(it).length"
                      >
                        <div
                          v-for="d in discountsForPurchase(it)"
                          :key="d.id"
                          class="discount-ticket"
                          title="Discount applied to this item"
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
                    </div>

                    <div class="text-end">
                      <div class="small fw-semibold">₱ {{ number(productPrice(it)) }}</div>
                    </div>
                  </label>

                  <!-- Locked -->
                  <div v-if="!!rrStatus(it.id)" class="mt-2">
                    <div class="row g-2">
                      <div class="col-12 col-md-5">
                        <label class="form-label small mb-1">Reason</label>
                        <input class="form-control form-control-sm" :value="prefillReason(it.id)" disabled />
                      </div>
                      <div class="col-12 col-md-7">
                        <label class="form-label small mb-1">Details</label>
                        <textarea class="form-control form-control-sm" rows="2" :value="prefillDetails(it.id)" disabled></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Editable -->
                  <div v-else-if="rrForm.purchase_ids.includes(it.id)" class="mt-2">
                    <div class="row g-2">
                      <div class="col-12 col-md-5">
                        <label class="form-label small mb-1">Reason</label>
                        <select class="form-select form-select-sm" v-model.trim="rrItemForms[it.id].reason" required>
                          <option value="" disabled>Select a reason</option>
                          <option v-for="r in rrReasons" :key="r" :value="r">{{ r }}</option>
                        </select>
                      </div>
                      <div class="col-12 col-md-7">
                        <label class="form-label small mb-1">Details</label>
                        <textarea class="form-control form-control-sm" rows="2" v-model.trim="rrItemForms[it.id].details" placeholder="Describe the issue…"></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Per-item return tracking (RR tab & Approved) -->
                  <div class="mt-2" v-if="activeTab === STATUS.RETURN_REFUND && rrTrackingLinkApproved(it.id)">
                    <a
                      :href="rrTrackingLinkApproved(it.id)"
                      target="_blank"
                      rel="noopener"
                      class="small link-underline d-inline-flex align-items-center gap-1"
                      title="Open return tracking in a new tab"
                    >
                      <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                      Return tracking
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Single purchase path -->
          <div v-else-if="rrPurchase" class="d-flex align-items-center gap-3 mb-3">
            <div
              class="purchase-thumb ratio ratio-1x1 bg-light rounded"
              @click.stop.prevent="goShopFocus(rrPurchase.product_id)"
              :title="productName(rrPurchase)"
              style="cursor:pointer"
            >
              <img
                v-if="productThumb(rrPurchase)"
                :src="productThumb(rrPurchase)"
                :alt="productName(rrPurchase)"
                class="w-100 h-100 object-fit-cover rounded"
              />
              <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                <i class="bi bi-image"></i>
              </div>
            </div>
            <div class="flex-grow-1">
              <a
                class="fw-semibold title-ellipsis link-ghost item-row__title"
                :title="productName(rrPurchase)"
                @click.stop.prevent="goShopFocus(rrPurchase.product_id)"
                :href="buildFocusUrl(rrPurchase.product_id)"
              >
                {{ productName(rrPurchase) }}
              </a>
              <div class="text-muted small">Ref# {{ rrPurchase.reference_number || shortId(rrPurchase.id) }}</div>

              <!-- Item-scoped tickets -->
              <div
                class="tickets-row mt-1"
                v-if="discountsForPurchase(rrPurchase).length"
              >
                <div
                  v-for="d in discountsForPurchase(rrPurchase)"
                  :key="d.id"
                  class="discount-ticket"
                >
                  <div class="ticket-left">
                    <i class="bi bi-ticket-perforated me-1)"></i>
                    <span class="ticket-title" :title="d.title">{{ d.title }}</span>
                  </div>
                  <div class="ticket-divider"></div>
                  <div class="ticket-right">
                    <span class="ticket-value">{{ discountLabel(d) }}</span>
                    <span class="ticket-tag">APPLIED</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-end">
              <div class="fw-semibold">₱ {{ number(productPrice(rrPurchase)) }}</div>
            </div>
          </div>

          <form @submit.prevent="submitReturnRefund">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Pickup Date</label>
                <div class="d-flex gap-2 flex-wrap">
                  <select v-model="rrQuickDate" class="form-select" style="max-width: 220px" @change="applyQuickDate">
                    <option value="">Choose a quick date…</option>
                    <option :value="quickDates.tomorrow">{{ labelFor(quickDates.tomorrow) }} (Tomorrow)</option>
                    <option :value="quickDates.plus2">{{ labelFor(quickDates.plus2) }} (+2 days)</option>
                    <option :value="quickDates.plus3">{{ labelFor(quickDates.plus3) }} (+3 days)</option>
                  </select>
                  <input v-model="rrForm.pickup_date" type="date" class="form-control" style="max-width: 180px" :min="todayYMD" required />
                </div>
                <div class="form-text">Select a quick option or pick an exact date.</div>
              </div>

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
              <button type="button" class="btn btn-outline-secondary" @click="closeReturnRefund">Cancel</button>
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

    <!-- ===== Group Details Modal ===== -->
    <div
      v-if="showGroupDetails && selectedGroupComputed"
      class="modal-backdrop-custom2"
      @click.self="closeGroupDetails"
    >
      <div class="modal-card2 card shadow-lg breath-in" @click.stop>
        <div class="card-header d-flex align-items-center justify-content-between">
          <strong><i class="bi bi-receipt me-2" aria-hidden="true"></i>Order Details — Ref# {{ selectedGroupComputed!.ref }}</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeGroupDetails">✕</button>
        </div>

        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between">
            <div class="small text-muted">Updated: {{ formatDate(selectedGroupComputed!.updated_at) }}</div>
            <span class="badge" :class="statusClass(selectedGroupComputed!.status)">
              <i :class="['bi', iconForStatus(selectedGroupComputed!.status)]" class="me-1" aria-hidden="true"></i>
              {{ prettyStatusWithRR(selectedGroupComputed!.status, undefined, selectedGroupComputed!) }}
            </span>
          </div>

          <div v-if="eventTitleForRef(selectedGroupComputed!.ref)" class="tickets-row mt-2">
            <div class="event-ticket" :title="eventTitleForRef(selectedGroupComputed!.ref)">
              <div class="ticket-left">
                <i class="bi bi-trophy me-1"></i>
                <span class="ticket-title">{{ eventTitleForRef(selectedGroupComputed!.ref) }}</span>
              </div>
              <div class="ticket-divider"></div>
              <div class="ticket-right">
                <span class="ticket-tag ticket-tag--event">EVENT WINNER</span>
              </div>
            </div>
          </div>

          <!-- ORDER-LEVEL discount tickets -->
          <div v-if="discountsForRef(selectedGroupComputed!.ref).length" class="tickets-row mt-2">
            <div
              v-for="d in discountsForRef(selectedGroupComputed!.ref)"
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

          <div
            v-if="activeTab === STATUS.RETURN_REFUND && returnTrackingLinkForApproved(selectedGroupComputed!.ref)"
            class="order-card__track mt-2"
          >
            <a
              :href="returnTrackingLinkForApproved(selectedGroupComputed!.ref)"
              target="_blank"
              rel="noopener"
              class="small link-underline d-inline-flex align-items-center gap-1"
              title="Open return tracking in a new tab"
            >
              <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              Return tracking
            </a>
          </div>

          <div class="order-card__items mt-3">
            <div
              v-for="it in selectedGroupComputed!.items"
              :key="it.id"
              class="item-row"
              :class="{ 'item-row--highlight': highlightPid === it.id }"
              :id="'pid-' + it.id"
            >
              <div
                class="purchase-thumb ratio ratio-1x1 bg-white rounded"
                @click.stop.prevent="goShopFocus(it.product_id)"
                :title="productName(it)"
                style="cursor:pointer"
              >
                <img
                  v-if="productThumb(it)"
                  :src="productThumb(it)"
                  :alt="productName(it)"
                  class="w-100 h-100 object-fit-cover rounded"
                />
                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                  <i class="bi bi-image"></i>
                </div>
              </div>

              <div class="item-row__main">
                <a
                  class="item-row__title fw-semibold title-ellipsis link-ghost"
                  :title="productName(it)"
                  @click.stop.prevent="goShopFocus(it.product_id)"
                  :href="buildFocusUrl(it.product_id)"
                >
                  {{ productName(it) }}
                </a>

                <div class="item-row__meta">
                  <span class="badge" :class="statusClass(it.status)">
                    <i :class="['bi', iconForStatus(it.status)]" class="me-1" aria-hidden="true"></i>
                    {{ prettyStatusWithRR(it.status, it.id, selectedGroupComputed!) }}
                  </span>
                  <span class="badge text-bg-secondary-subtle border">
                    {{ prettyModeOfPayment(it.modeofpayment) }}
                  </span>
                  <span v-if="(Number(it?.qty ?? 1) || 1) > 1" class="badge text-bg-light border">
                    Qty: {{ Number(it?.qty ?? 1) }}
                  </span>
                </div>

                <!-- Item-scoped tickets also in details modal -->
                <div
                  class="tickets-row mt-1"
                  v-if="discountsForPurchase(it).length"
                >
                  <div
                    v-for="d in discountsForPurchase(it)"
                    :key="d.id"
                    class="discount-ticket"
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

                <div class="mt-1" v-if="activeTab === STATUS.RETURN_REFUND && rrTrackingLinkApproved(it.id)">
                  <a
                    :href="rrTrackingLinkApproved(it.id)"
                    target="_blank"
                    rel="noopener"
                    class="small link-underline d-inline-flex align-items-center gap-1"
                    title="Open return tracking in a new tab"
                  >
                    <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                    Return tracking
                  </a>
                </div>
              </div>

              <div class="item-row__price text-end">
                <template v-if="purchaseHasRedemption(it)">
                  <div>Unit: ₱ {{ number(productPrice(it)) }}</div>
                  <div class="small text-danger">− ₱ {{ number(purchaseRedemptionUnitDiscount(it)) }}</div>
                  <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">Subtotal: ₱ {{ number(subtotalFor(it)) }}</div>
                </template>

                <template v-else-if="refHasRedemption(selectedGroupComputed!.ref)">
                  <div>Unit: ₱ {{ number(productPrice(it)) }}</div>
                  <div class="small text-danger">− ₱ {{ number(redemptionUnitDiscount(it)) }}</div>
                  <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">Subtotal: ₱ {{ number(subtotalFor(it)) }}</div>
                </template>

                <template v-else-if="refHasDiscount(selectedGroupComputed!.ref)">
                  <div class="text-muted text-decoration-line-through">₱ {{ number(productPrice(it)) }}</div>
                  <div class="fw-semibold text-success">₱ {{ number(discountedUnitPrice(it)) }}</div>
                  <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">Subtotal: ₱ {{ number(subtotalFor(it)) }}</div>
                </template>

                <template v-else>
                  <div class="small text-muted">Unit: ₱ {{ number(unitPriceFor(it)) }}</div>
                  <div class="fw-semibold" v-if="(Number(it?.qty ?? 1) || 1) > 1">Subtotal: ₱ {{ number(subtotalFor(it)) }}</div>
                </template>
              </div>

              <div class="item-row__cta text-end" v-if="rrStatus(it.id)">
                <div class="small text-muted">RR • {{ capitalize(rrStatus(it.id)!) }}</div>
              </div>
            </div>
          </div>

          <div class="order-card__footer mt-3">
            <div class="order-card__sum text-end">
              <div class="small text-muted price-breakdown">
                <div>Items: ₱ {{ number(groupItemsBaseTotal(selectedGroupComputed!)) }}</div>
                <div v-if="refHasDiscount(selectedGroupComputed!.ref)">
                  Discount: −₱ {{ number(groupDiscountAmount(selectedGroupComputed!)) }}
                </div>

                <div v-if="!isFreeShippingRef(selectedGroupComputed!.ref)">
                  <i class="bi bi-truck me-1" aria-hidden="true"></i>Shipping: ₱ {{ number(shippingFor(selectedGroupComputed!.ref)) }}</div>
                <div v-else>
                  <i class="bi bi-truck me-1" aria-hidden="true"></i>Shipping:
                  <span class="text-decoration-line-through">₱ {{ number(shippingFor(selectedGroupComputed!.ref)) }}</span>
                  <span class="badge text-bg-success-subtle border ms-1"><i class="bi bi-truck me-1" aria-hidden="true"></i>FREE SHIPPING</span>
                </div>
              </div>

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
            </div>

            <div class="order-card__actions" v-if="activeTab !== STATUS.RETURN_REFUND">
              <div class="d-flex gap-2 flex-wrap justify-content-end">
                <button
                  v-if="selectedGroupComputed!.status === STATUS.TO_PAY"
                  class="btn btn-outline-danger btn-sm"
                  :disabled="groupBusy.cancel[selectedGroupComputed!.ref]"
                  @click.stop="cancelGroup(selectedGroupComputed!)"
                >
                  <span v-if="groupBusy.cancel[selectedGroupComputed!.ref]" class="spinner-border spinner-border-sm me-1"></span>
                  Cancel
                </button>

                <template v-else-if="selectedGroupComputed!.status === STATUS.TO_SHIP"></template>

                <template v-else-if="selectedGroupComputed!.items.some((it) => it.status === STATUS.TO_RECEIVE)">
                  <button
                    class="btn btn-outline-warning btn-sm"
                    v-if="!refHasAnyRR(selectedGroupComputed!.ref)"
                    @click.stop="openReturnRefundGroup(selectedGroupComputed!)"
                    title="Return or refund items in this order."
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
                    :title=" groupAllToReceive(selectedGroupComputed!) ? 'Mark all as received' : 'Mark remaining To Receive as received' "
                  >
                    <span v-if="groupBusy.received[selectedGroupComputed!.ref]" class="spinner-border spinner-border-sm me-1"></span>
                    {{
                      groupAllToReceive(selectedGroupComputed!)
                        ? 'Order Received (All)'
                        : 'Order Received (' + groupToReceiveCount(selectedGroupComputed!) + ')'
                    }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div> <!-- /card-body -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
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
async function swConfirm(message: string, title = 'Are you sure?'): Promise<boolean> {
  const res = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
  })
  return !!res.isConfirmed
}

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

/** NEW flags per request (do not remove code, just hide UI) */
const SHOW_ITEM_BADGES_IN_LIST = false
const SHOW_GROUP_PRICE_BREAKDOWN = false

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

/* ====== NAV to /app/shop?focus=product_id (images & titles in modals) ====== */
function buildFocusUrl(productId?: string) {
  const pid = String(productId || '').trim()
  return pid ? `/app/shop?focus=${encodeURIComponent(pid)}` : '/app/shop'
}
function goShopFocus(productId?: string) {
  const pid = String(productId || '').trim()
  if (!pid) {
    // fallback: go to shop without focus
    router.push({ path: '/app/shop' })
    return
  }
  router.push({ path: '/app/shop', query: { focus: pid } })
}

/* ---------------- Return/Refund store (per purchase) ---------------- */
type RRRow = {
  id: string
  purchase_id: string
  status: RRState
  reason?: string | null
  details?: string | null
  /** NEW: return tracking URL from games.return_refunds.return_tracking_link */
  refund_tracking_link?: string | null
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

/* ===== NEW: return tracking helpers ===== */
function rrTrackingLink(purchaseId: string): string {
  return (rrByPurchase[purchaseId]?.refund_tracking_link || '').toString().trim()
}
function rrTrackingLinkApproved(purchaseId: string): string {
  return rrStatus(purchaseId) === 'approved' ? rrTrackingLink(purchaseId) : ''
}
function returnTrackingLinkFor(ref: string): string {
  const row = purchases.value.find(
    (p) => (p.reference_number || p.id) === ref && rrTrackingLink(p.id),
  )
  return row ? rrTrackingLink(row.id) : ''
}
function returnTrackingLinkForApproved(ref: string): string {
  const row = purchases.value.find(
    (p) =>
      (p.reference_number || p.id) === ref &&
      rrStatus(p.id) === 'approved' &&
      rrTrackingLink(p.id),
  )
  return row ? rrTrackingLink(row.id) : ''
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
    await swInfo(
      `We marked ${updatedRows.length} item${updatedRows.length > 1 ? 's' : ''} as Completed because they were delivered over 7 days ago.`,
      'Auto-completed orders'
    )
  }
}

/** ========= DISCOUNT (refund_lock + event.interest_per_player + discounted_price column + redemptions) ========= */
const refDiscount: Record<string, number> = reactive({})
const refRedeemedTotal: Record<string, number> = reactive({})
const refShippingTotal: Record<string, number> = reactive({})

/** NEW (item-scoped): totals & ids per purchase */
const perPurchaseRedeemedTotal: Record<string, number> = reactive({})
const purchaseDiscountIds = reactive<Record<string, string[]>>({})

/** ===== NEW: discount metadata (title + %/amount + product_id) ===== */
type Discount = {
  id: string
  title: string
  percent_off: number | null
  amount_off: number | null
  product_id: string | null
}
const discountsById = reactive<Record<string, Discount>>({})

/** legacy map kept; now unused by discountsForRef (do not remove per request) */
const refDiscountIds = reactive<Record<string, string[]>>({})

/** ===== NEW: Event meta (title) per ref ===== */
const refEventTitle: Record<string, string> = reactive({})

/** Simple UUID check */
function isUuidLike(s: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s)
}

/** Treat discounted_price as discount only if it's actually lower than product price */
function hasItemLevelDiscount(purchase: AnyRec): boolean {
  const dp = Number(purchase?.discounted_price)
  const base = productPrice(purchase)
  return Number.isFinite(dp) && dp >= 0 && dp < base
}

/** ref-level discount presence (any item discounted OR order-level redemption OR event off) */
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

/** order-level redemptions exist? */
function refHasRedemption(ref?: string): boolean {
  if (!ref) return false
  return (refRedeemedTotal[ref] || 0) > 0
}

/** item-level redemption present? */
function purchaseHasRedemption(purchase: AnyRec): boolean {
  return (perPurchaseRedeemedTotal[purchase.id] || 0) > 0
}

function baseGroupTotalByRef(ref: string): number {
  const rows = purchases.value.filter((p) => (p.reference_number || p.id) === ref)
  return rows.reduce((sum, it) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * productPrice(it)
  }, 0)
}

function discountedUnitPrice(purchase: AnyRec): number {
  if (hasItemLevelDiscount(purchase)) {
    return Number(purchase.discounted_price)
  }

  // 1) item-scoped redemption
  const itemRedeemed = perPurchaseRedeemedTotal[purchase.id] || 0
  if (itemRedeemed > 0) {
    const base = productPrice(purchase)
    const qty = Number(purchase?.qty ?? 1) || 1
    const perUnitLess = itemRedeemed / qty
    const out = base - perUnitLess
    return out > 0 ? out : 0
  }

  // 2) order-level redemption (proportional)
  const ref = purchase?.reference_number || purchase?.id
  const redeemed = refRedeemedTotal[ref] || 0
  if (redeemed > 0) {
    const base = productPrice(purchase)
    const qty = Number(purchase?.qty ?? 1) || 1
    const groupBase = baseGroupTotalByRef(ref)
    if (groupBase > 0) {
      const myBaseSubtotal = base * qty
      const myDiscountShare = (redeemed * myBaseSubtotal) / groupBase
      const unitLess = myDiscountShare / qty
      const out = base - unitLess
      return out > 0 ? out : 0
    }
  }

  // 3) event interest per player (flat off per unit)
  const off = refDiscount[ref] || 0
  const base = productPrice(purchase)
  const out = base - off
  return out > 0 ? out : 0
}

function redemptionUnitDiscount(purchase: AnyRec): number {
  const ref = purchase?.reference_number || purchase?.id

  // Prefer item-scoped if present
  const itemRedeemed = perPurchaseRedeemedTotal[purchase.id] || 0
  if (itemRedeemed > 0) {
    const qty = Number(purchase?.qty ?? 1) || 1
    const base = productPrice(purchase)
    const perUnit = itemRedeemed / qty
    return perUnit > base ? base : perUnit
  }

  // Otherwise order-level share
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

function groupTotalDiscounted(g: any): number {
  const items = g.items.reduce((sum: number, it: AnyRec) => {
    const q = Number(it?.qty ?? 1) || 1
    return sum + q * discountedUnitPrice(it)
  }, 0)
  const ship = isFreeShippingRef(g.ref) ? 0 : shippingFor(g.ref)
  return items + ship
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
      Object.keys(perPurchaseRedeemedTotal).forEach((k) => delete perPurchaseRedeemedTotal[k])
      Object.keys(purchaseDiscountIds).forEach((k) => delete purchaseDiscountIds[k])
      return
    }

    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .select(
        'id,user_id,product_id,reference_number,status,qty,modeofpayment,created_at,updated_at,discounted_price,shipping_fee,tracking_link,is_free_shipping',
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
      Object.keys(perPurchaseRedeemedTotal).forEach((k) => delete perPurchaseRedeemedTotal[k])
      Object.keys(purchaseDiscountIds).forEach((k) => delete purchaseDiscountIds[k])
      await swError(`We couldn't load your purchases. Please try again.\n(${error.message})`, 'Load failed')
      return
    }
    purchases.value = Array.isArray(data) ? data : []

    await autocloseOverdue(uid)

    // Products
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

    // RR rows
    const purchaseIds = purchases.value.map((r) => r.id)
    Object.keys(rrByPurchase).forEach((k) => delete rrByPurchase[k])
    if (purchaseIds.length) {
      const { data: rrRows, error: rrErr } = await supabase
        .schema('games')
        .from('return_refunds')
        .select('id,purchase_id,status,reason,details,refund_tracking_link,created_at')
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
              refund_tracking_link: row.refund_tracking_link ?? null,
              created_at: row.created_at,
            }
          }
        }
      }
    }

    // ====== Event-linked flat offs (interest_per_player) & titles ======
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

      // Direct event lookup for titles
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

    // ====== Discount redemptions ======
    Object.keys(refRedeemedTotal).forEach((k) => delete refRedeemedTotal[k])
    Object.keys(refDiscountIds).forEach((k) => delete refDiscountIds[k])
    Object.keys(perPurchaseRedeemedTotal).forEach((k) => delete perPurchaseRedeemedTotal[k])
    Object.keys(purchaseDiscountIds).forEach((k) => delete purchaseDiscountIds[k])

    const allDiscountIds = new Set<string>()
    let rawRedRows:
      | Array<{ purchase_id: string; redeemed_amount: any; discount_id?: string }>
      | null = null

    if (purchaseIds.length) {
      const { data: redRows, error: redErr } = await supabase
        .schema('rewards')
        .from('discount_redemptions')
        .select('purchase_id,redeemed_amount,discount_id')
        .eq('user_id', uid)
        .in('purchase_id', purchaseIds)

      if (!redErr && Array.isArray(redRows)) {
        rawRedRows = redRows as Array<{ purchase_id: string; redeemed_amount: any; discount_id?: string }>
        for (const r of rawRedRows) {
          const did = (r as any).discount_id as string | undefined
          if (did) allDiscountIds.add(did)
        }
      }
    }

    if (allDiscountIds.size) {
      const { data: drows, error: derr } = await supabase
        .schema('rewards')
        .from('discounts')
        .select('id,title,percent_off,amount_off,product_id')
        .in('id', Array.from(allDiscountIds))
      if (!derr && Array.isArray(drows)) {
        for (const d of drows as Array<any>) {
          discountsById[d.id] = {
            id: d.id,
            title: d.title,
            percent_off: d.percent_off ?? null,
            amount_off: d.amount_off ?? null,
            product_id: d.product_id ?? null,
          }
        }
      }
    }

    // Now distribute redemption amounts into item-scoped vs order-scoped
    if (rawRedRows) {
      const pidToRef = new Map<string, string>()
      const pidToProd = new Map<string, string>()
      for (const r of purchases.value) {
        pidToRef.set(r.id, r.reference_number || r.id)
        if (r.product_id) pidToProd.set(r.id, r.product_id)
      }

      for (const r of rawRedRows) {
        const pid = r.purchase_id
        const ref = pidToRef.get(pid)
        if (!ref) continue
        const amt = Number(r.redeemed_amount ?? 0) || 0
        const did = (r as any).discount_id as string | undefined

        if (did) {
          // record id for this purchase (used for tickets)
          if (!purchaseDiscountIds[pid]) purchaseDiscountIds[pid] = []
          if (!purchaseDiscountIds[pid].includes(did)) purchaseDiscountIds[pid].push(did)
        }

        const meta = did ? discountsById[did] : undefined
        const prodOfPurchase = pidToProd.get(pid)

        if (meta && meta.product_id) {
          // product-scoped: apply only to this purchase
          perPurchaseRedeemedTotal[pid] = (perPurchaseRedeemedTotal[pid] || 0) + amt
        } else {
          // order-scoped: aggregate at reference level
          refRedeemedTotal[ref] = (refRedeemedTotal[ref] || 0) + amt
          // (optionally track legacy ref->ids if you want the old map filled)
          if (did) {
            if (!refDiscountIds[ref]) refDiscountIds[ref] = []
            if (!refDiscountIds[ref].includes(did)) refDiscountIds[ref].push(did)
          }
        }
      }
    }

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
  // Collect all discount IDs across purchases of this ref, but ONLY order-level (no product_id)
  const idSet = new Set<string>()
  for (const p of purchases.value) {
    if ((p.reference_number || p.id) !== ref) continue
    for (const did of purchaseDiscountIds[p.id] || []) idSet.add(did)
  }
  const out = Array.from(idSet)
    .map((id) => discountsById[id])
    .filter((d): d is Discount => Boolean(d && !d.product_id))
  return out
}
function discountsForPurchase(purchase: AnyRec): Discount[] {
  const ids = purchaseDiscountIds[purchase.id] || []
  return ids
    .map((id) => discountsById[id])
    .filter(
      (d): d is Discount =>
        Boolean(d && d.product_id && d.product_id === purchase.product_id),
    )
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
function isFreeShippingRef(ref: string): boolean {
  return purchases.value.some(
    (p) => (p.reference_number || p.id) === ref && !!p.is_free_shipping
  )
}
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
  const ship = isFreeShippingRef(g.ref) ? 0 : shippingFor(g.ref)
  return items + ship
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
  if (groupHasAnyRR(g)) {
    swWarn('Return/Refund can only be submitted once for this order.', 'Already submitted')
    return
  }
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
  const ref = purchase?.reference_number || purchase?.id
  if (refHasAnyRR(ref)) {
    swWarn('Return/Refund can only be submitted once for this order.', 'Already submitted')
    return
  }
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
      await swInfo('Please log in to submit a return/refund request.')
      return
    }

    const payloads: Record<string, any>[] = []
    const purchaseIdsToMark: string[] = []

    if (rrGroup.value) {
      if (rrForm.purchase_ids.length === 0) {
        await swWarn('Please select at least one item to return or refund.')
        return
      }
      for (const pid of rrForm.purchase_ids) {
        const row = rrGroup.value.items.find((x) => x.id === pid)
        if (!row) continue
        const per = rrItemForms[pid] || { reason: '', details: '' }
        if (!per.reason) {
          await swWarn('Please choose a reason for each selected item.')
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
        await swWarn('Please select a reason.')
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
      await swError(`We couldn't submit your request. Please try again.\n(${insErr.message})`)
      return
    }

    const { error: upErr } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.RETURN_REFUND })
      .in('id', purchaseIdsToMark)
      .eq('user_id', uid)
    if (upErr) {
      await swError(`Your request was saved, but we couldn't update the item status.\n(${upErr.message})`)
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
    await swSuccess('Your return/refund request was submitted. We’ll notify you as soon as there’s an update.')
  } finally {
    rrBusy.value = false
  }
}

/** Per-row actions */
async function cancelPurchase(purchaseId: string) {
  const ok = await swConfirm('Cancel this item? Stock will be restored if possible.', 'Cancel item?')
  if (!ok) return

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
      await swError(`We couldn't cancel this item.\n(${error.message})`)
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
    await swSuccess('The item was cancelled successfully.')
  } finally {
    busy.value.cancel[purchaseId] = false
  }
}

async function cancelGroup(g: Group) {
  const count = g.items.length
  const ok = await swConfirm(
    `Cancel the entire order? This will cancel ${count} item${count > 1 ? 's' : ''} and restore stock when applicable.`,
    'Cancel order?'
  )
  if (!ok) return

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
      await swError(`We couldn't cancel this order.\n(${error.message})`)
      return
    }

    for (const r of purchases.value) if (ids.includes(r.id)) r.status = STATUS.CANCELLED

    const entries = g.items
      .map((it) => ({ product_id: it.product_id as string, qty: Number(it?.qty ?? 0) || 0 }))
      .filter((e) => e.product_id && e.qty > 0)
    if (entries.length) {
      await restoreStock(entries)
    }
    await swSuccess('The order was cancelled successfully.')
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
    if (recErr) await swWarn(`Order was completed, but creating receipts failed.\n(${recErr.message})`, 'Partial success')

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
    if (recErr) await swWarn(`Order was completed, but creating receipts failed.\n(${recErr.message})`, 'Partial success')

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
    if (recErr) await swWarn(`Auto-complete succeeded, but creating receipts failed.\n(${recErr.message})`, 'Partial success')

    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0)
    await addToUserPurchasesMonthly(total)
  } catch (e) {
    console.error(e)
  }
}

/* =============================== */
/* === NEW: STOCK RESTORATION  === */
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
async function orderReceivedGroup(g: Group) {
  const toReceiveIds = g.items.filter((it) => it.status === STATUS.TO_RECEIVE).map((it) => it.id)
  if (!toReceiveIds.length) return
  const ok = await swConfirm(
    `Mark ${toReceiveIds.length} item${toReceiveIds.length > 1 ? 's' : ''} as received?`,
    'Confirm received'
  )
  if (!ok) return

  groupBusy.received[g.ref] = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('purchases')
      .update({ status: STATUS.COMPLETED })
      .in('id', toReceiveIds)
      .select('id')
    if (error) {
      await swError(`We couldn't update the status.\n(${error.message})`)
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
    await swSuccess(
      `${updatedIds.length} item${updatedIds.length > 1 ? 's' : ''} marked as received.`
    )
  } finally {
    groupBusy.received[g.ref] = false
  }
}

/* =============================== */
/* === NEW: QTY/SUBTOTAL HELPERS === */
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

/* ====== ONE-TIME RETURN/REFUND HELPERS ====== */
function refHasAnyRR(ref: string): boolean {
  return purchases.value.some(
    (p) =>
      (p.reference_number || p.id) === ref &&
      (p.status === STATUS.RETURN_REFUND || !!rrStatus(p.id))
  )
}
function groupHasAnyRR(g: Group): boolean {
  return g.items.some((it) => it.status === STATUS.RETURN_REFUND || !!rrStatus(it.id))
}

onMounted(async () => {
  await loadPurchases()
  ensureSignedUrlsForAllProducts()
})

// Alias to satisfy existing template calls
function purchaseRedemptionUnitDiscount(purchase: AnyRec): number {
  return redemptionUnitDiscount(purchase)
}

/* ===================================================== */
/* === ⬇️ NEW: tiny helpers to pick proper icon names === */
/* ===================================================== */
function iconForTab(v: Status): string {
  const map: Record<Status, string> = {
    [STATUS.TO_PAY]: 'bi-cash-coin',
    [STATUS.TO_SHIP]: 'bi-truck',
    [STATUS.TO_RECEIVE]: 'bi-box-seam',
    [STATUS.COMPLETED]: 'bi-check-circle',
    [STATUS.RETURN_REFUND]: 'bi-arrow-counterclockwise',
    [STATUS.CANCELLED]: 'bi-x-circle'
  } as const
  return map[v] || 'bi-dot'
}
function iconForStatus(s?: string): string {
  const k = (s || '') as Status
  if (k === STATUS.TO_PAY) return 'bi-cash-coin'
  if (k === STATUS.TO_SHIP) return 'bi-truck'
  if (k === STATUS.TO_RECEIVE) return 'bi-box-seam'
  if (k === STATUS.COMPLETED) return 'bi-check-circle'
  if (k === STATUS.RETURN_REFUND) return 'bi-arrow-counterclockwise'
  if (k === STATUS.CANCELLED) return 'bi-x-circle'
  return 'bi-dot'
}
</script>

<style scoped>
/* ===== Design tokens ===== */
:root {
  --surface: #ffffff;
  --surface-2: #f8f9fb;
  --text: #212529;
  --muted: #6c757d;
  --border: #e9ecef;
  --radius: 14px;
  --radius-sm: 10px;
  --shadow: 0 8px 24px rgba(16, 24, 40, .06);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  :root {
    --surface: #161a1f;
    --surface-2: #0f141a;
    --text: #e9ecef;
    --muted: #adb5bd;
    --border: #343a40;
    --shadow: 0 8px 24px rgba(0,0,0,.45);
  }
}

/* ===== Page layout ===== */
.purchases-shell {
  color: var(--text);
}

/* Header */
.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.page-header__titles > p { color: var(--muted); }

/* Sticky tabbar */
.tabbar {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 8px 0;
  margin-bottom: 8px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.tabbar__scroll {
  display: flex;
  gap: .5rem;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
  
}
.tabbar__pill {
  border-radius: 999px !important;
  padding: .4rem .9rem;
  font-weight: 600;
}
.tabbar__pill:not(.active) {
  background: var(--surface-2) !important;
  color: var(--text) !important;
  border: 1px solid var(--border);
}
.tabbar__pill.active {
  box-shadow: inset 0 0 0 1px var(--border);
}
.tabbar__count {
  border: 1px solid var(--border) !important;
  background: transparent;
  color: var(--muted);
}

/* Stacks */
.stack { display: grid; }
.stack.gap-3 { gap: 1rem; }

/* States */
.state {
  text-align: center;
  color: var(--muted);
  padding: 3.25rem 0;
}
.state__icon {
  font-size: 1.6rem;
}

/* ===== Order card ===== */
.order-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px 14px 10px;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.order-card:hover {
  transform: translateY(-1px);
  border-color: #d7dbe0;
}
.order-card--highlight {
  border-color: #f0ad4e;
}

/* Header area */
.order-card__header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 8px;
}
.order-card__id small { color: var(--muted); }
.order-card__status .badge { color: var(--text); }

/* Tickets row (event/discount) */
.tickets-row {
  margin-top: .5rem;
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

/* Tracking link */
.order-card__track {
  margin-top: .25rem;
}
.link-underline {
  color: #0d6efd;
  text-decoration: underline;
}

/* Items list (segmented) */
.order-card__items {
  margin-top: .75rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  padding: 6px;
}
.item-row {
  display: grid;
  grid-template-columns: 64px 1fr auto auto;
  gap: 12px;
  align-items: start;
  padding: 10px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.item-row + .item-row { margin-top: 6px; }
.item-row--highlight { border-color: #0d6efd; }

.purchase-thumb {
  width: 64px;
  min-width: 64px;
  border-radius: 10px;
  overflow: hidden;
}
.object-fit-cover { object-fit: cover; }

.item-row__main { min-width: 0; }
.item-row__title { max-width: 42ch; }
.item-row__meta { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px; }
.item-row__price { min-width: 140px; }
.item-row__cta { min-width: 160px; }

/* Footer / totals */
.order-card__footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: .75rem;
}
.order-card__actions { margin-top: .25rem; }
.price-breakdown > div + div { margin-top: 2px; }

/* ===== Modal ===== */
.modal-backdrop-custom2 {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1055;
}
.modal-card2 {
  width: min(720px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}

/* ===== Tickets (kept; restyled lightly) ===== */
.discount-ticket,
.event-ticket {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  transform: translateY(-50%);
}
.discount-ticket::before,
.event-ticket::before { left: -7px; }
.discount-ticket::after,
.event-ticket::after { right: -7px; }

.ticket-left { display: inline-flex; align-items: center; gap: 6px; }
.ticket-title {
  max-width: 36ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ticket-divider { height: 20px; width: 0; border-left: 1px dashed var(--border); }
.ticket-right { display: inline-flex; align-items: baseline; gap: 8px; }
.ticket-value { font-weight: 800; letter-spacing: .2px; }
.ticket-tag {
  font-size: .7rem;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
}
.ticket-tag--event {
  border-color: #cfe2ff;
  background: #f8faff;
  color: #0d6efd;
}

/* Dark-mode ticket tweaks */
@media (prefers-color-scheme: dark) {
  .discount-ticket,
  .event-ticket {
    background: var(--surface-2);
    border-color: var(--border);
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.3);
  }
  .discount-ticket::before,
  .discount-ticket::after,
  .event-ticket::before,
  .event-ticket::after {
    background: #0f141a;
    border-color: var(--border);
  }
  .ticket-divider { border-left-color: var(--border); }
  .ticket-tag {
    border-color: var(--border);
    background: #ffffff;
    color: var(--muted);
  }
  .ticket-tag--event {
    border-color: #1d3b64;
    background: #0f1d33;
    color: #9ec5fe;
  }
}

/* Keep Bootstrap harmonies */
.badge { color: var(--text); }
.title-ellipsis {
  max-width: clamp(140px, 48vw, 380px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.text-monospace {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

/* Subtle hover affordance */
.clickable-card { cursor: pointer; }
.clickable-card:hover {
  border-color: #d7dbe0;
  box-shadow: 0 0.5rem 1.25rem rgba(0, 0, 0, 0.06);
}

/* A11y-friendly ghost link for titles */
.link-ghost {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
.link-ghost:hover,
.link-ghost:focus {
  text-decoration: underline;
}

/* Cursor helper */
.cursor-pointer { cursor: pointer; }

/* Responsive refinement */
@media (max-width: 576px) {
  .item-row {
    grid-template-columns: 56px 1fr auto;
    grid-auto-rows: auto;
  }
  .item-row__cta { grid-column: 1 / -1; }
  .item-row__price { min-width: 120px; }
}

/* ===================== */
/* Entrance animations   */
/* ===================== */
.order-card, .state, .page-header, .tabbar {
  animation: fadeUp .5s ease both; /* longer ~500ms */
}
/* Add a gentle “breath-in” scale on top */
.breath-in {
  animation:
    fadeUp .5s ease both,
    breatheIn .6s ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes breatheIn {
  0%   { transform: scale(.985); }
  100% { transform: scale(1); }
}

/* ===================== */
/* Skeleton placeholders */
/* ===================== */
.skel { text-align: left; margin-bottom: 1rem; }
.skel-header { display: grid; gap: .5rem; margin-bottom: .75rem; }
.skel-tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }

.skel-line {
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-sm { height: 10px; }
.skel-w-65 { width: 65%; }
.skel-w-60 { width: 60%; }
.skel-w-55 { width: 55%; }
.skel-w-50 { width: 50%; }
.skel-w-45 { width: 45%; }
.skel-w-40 { width: 40%; }
.skel-w-35 { width: 35%; }
.skel-w-30 { width: 30%; }
.skel-w-25 { width: 25%; }
.skel-w-20 { width: 20%; }
.skel-pill {
  height: 30px; width: 88px; border-radius: 999px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
  border: 1px solid var(--border);
}
.skel-card { position: relative; overflow: hidden; }
.skel-thumb {
  width: 64px; height: 64px; border-radius: 10px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
.skel-badge {
  height: 22px; width: 84px; border-radius: 999px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
  border: 1px solid var(--border);
}
.skel-ticket {
  height: 36px; width: 180px; border-radius: 12px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
  border: 1px dashed var(--border);
}
.skel-btn {
  height: 32px; width: 120px; border-radius: 10px;
  background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
  border: 1px solid var(--border);
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .order-card, .state, .page-header, .tabbar, .breath-in { animation: none !important; }
  .skel-line, .skel-pill, .skel-thumb, .skel-badge, .skel-ticket, .skel-btn { animation: none !important; }
}

/* ====== NEW: Wrap long titles only inside modals ====== */
.modal-card2 .item-row__title {
  /* Override the .title-ellipsis in modal context */
  max-width: 100%;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  word-break: break-word;
}
</style>
