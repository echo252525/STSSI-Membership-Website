<template>
  <div class="mini-games-page">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-joystick"></i>
        Admin Mini Games
      </h3>
      <button
        type="button"
        class="btn btn-primary d-flex align-items-center gap-2"
        @click="openForm()"
      >
        <i class="bi bi-plus-lg"></i>
        New Spin & Win
      </button>
    </div>

    <!-- ======================= HERO SECTIONS ======================= -->
    <section class="events-hero mb-4">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <!-- 
          New responsive layout:
          - Left = Draft (narrow) + Open (narrow, below Draft)
          - Center = Happening Now (wide hero)
          - Right = Finished (narrow)
        -->
        <div class="row g-3 align-items-stretch">
          <!-- Draft + Open (LEFT) -->
          <div class="col-12 col-lg-3 order-2 order-lg-1">
            <!-- Draft -->
            <div class="hero-card glass tilt h-100 mb-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-upcoming"></span>
                  <h5 class="mb-0 fw-bold">Draft</h5>
                </div>
                <small class="text-muted">Not live</small>
              </div>

              <div v-if="draftEvents.length === 0" class="empty-state">
                <i class="bi bi-calendar2"></i>
                <div>No draft events</div>
              </div>

              <div v-else class="event-scroll">
                <article
                  v-for="ev in draftEvents"
                  :key="'draft-hero-' + ev.id"
                  class="event-pill upcoming"
                >
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span class="badge rounded-pill text-bg-light text-dark">draft</span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.title }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Players: {{ ev.player_count }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <!-- Open (NEW block below Draft) -->
            <div class="hero-card glass tilt h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-live"></span>
                  <h5 class="mb-0 fw-bold">Open</h5>
                </div>
                <small class="text-muted">Accepting players</small>
              </div>

              <div v-if="openEvents.length === 0" class="empty-state">
                <i class="bi bi-emoji-neutral"></i>
                <div>No open events</div>
              </div>

              <div v-else class="event-scroll">
                <article
                  v-for="ev in openEvents"
                  :key="'open-hero-' + ev.id"
                  class="event-pill live"
                >
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span class="badge rounded-pill text-bg-success">open</span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.title }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Players: {{ ev.player_count }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <!-- Happening Now (CENTER HERO) -->
          <div class="col-12 col-lg-6 order-1 order-lg-2">
            <div class="hero-card glass tilt hero-center h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-live"></span>
                  <h4 class="mb-0 fw-bold">Happening Now</h4>
                </div>
                <small class="text-muted">{{ nowFmt }}</small>
              </div>

              <div v-if="nowEvents.length === 0" class="empty-state py-5">
                <i class="bi bi-emoji-neutral"></i>
                <div>No live events</div>
              </div>

              <div v-else class="event-scroll hero-scroll">
                <article v-for="ev in nowEvents" :key="'now-hero-' + ev.id" class="event-pill live">
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span class="badge rounded-pill text-bg-success">{{ ev.status }}</span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.title }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Players: {{ ev.player_count }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>

                  <div class="price-row">
                    <div class="price-chip">
                      <small>Winner Price</small>
                      <div class="price">₱ {{ number(ev.winner_price) }}</div>
                    </div>
                    <div class="price-chip">
                      <small>Loser Refund</small>
                      <div class="price">₱ {{ number(ev.loser_refund_amount) }}</div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <!-- Finished (RIGHT) -->
          <div class="col-12 col-lg-3 order-3 order-lg-3">
            <div class="hero-card glass tilt h-100">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="dot dot-finished"></span>
                  <h5 class="mb-0 fw-bold">Finished</h5>
                </div>
                <small class="text-muted">Spun / Settled / Cancelled</small>
              </div>

              <div v-if="finishedEvents.length === 0" class="empty-state">
                <i class="bi bi-archive"></i>
                <div>No finished events</div>
              </div>

              <div v-else class="event-scroll">
                <article
                  v-for="ev in finishedEvents"
                  :key="'finished-hero-' + ev.id"
                  class="event-pill finished"
                >
                  <header class="d-flex align-items-center justify-content-between">
                    <strong class="title text-truncate">{{ ev.title }}</strong>
                    <span
                      class="badge rounded-pill"
                      :class="{
                        'text-bg-info': ev.status === 'spun',
                        'text-bg-secondary': ev.status === 'settled',
                        'text-bg-dark': ev.status === 'cancelled',
                      }"
                    >
                      {{ ev.status }}
                    </span>
                  </header>

                  <div class="meta">
                    <div class="pair">
                      <i class="bi bi-box-seam"></i>
                      <span>{{ ev.title }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-people"></i>
                      <span>Players: {{ ev.player_count }}</span>
                    </div>
                    <div class="pair">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry: ₱ {{ number(ev.entry_fee) }}</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- ===================== / HERO SECTIONS ====================== -->

    <!-- Create Event Modal -->
    <div v-if="showForm" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Create Spin & Win Event</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeForm">✕</button>
        </div>
        <div class="card-body">
          <form @submit.prevent="submit">
            <div class="row g-3">
              <!-- ✅ Product Picker -->
              <div class="col-12">
                <label class="form-label">Product</label>
                <div class="d-flex gap-2">
                  <select
                    v-model="selectedProductId"
                    class="form-select"
                    :disabled="productsLoading"
                  >
                    <option value="">— Select a product —</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">
                      {{ p.name }} — ₱ {{ number(p.price) }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    :disabled="productsLoading"
                    @click="loadProducts()"
                    title="Refresh products"
                  >
                    <span v-if="productsLoading" class="spinner-border spinner-border-sm"></span>
                    <span v-else><i class="bi bi-arrow-clockwise"></i></span>
                  </button>
                </div>
                <!-- Product preview -->
                <div
                  v-if="selectedProduct"
                  class="mt-2 border rounded p-2 d-flex align-items-center gap-3"
                >
                  <div class="ratio ratio-4x3" style="width: 120px">
                    <img
                      v-if="productImageUrl(selectedProduct)"
                      :src="productImageUrl(selectedProduct)"
                      :alt="selectedProduct.name"
                      class="w-100 h-100 object-fit-cover rounded"
                    />
                    <div
                      v-else
                      class="bg-light w-100 h-100 d-flex align-items-center justify-content-center rounded text-muted"
                    >
                      <i class="bi bi-image"></i>
                    </div>
                  </div>
                  <div class="small">
                    <div>
                      <strong>{{ selectedProduct.name }}</strong>
                    </div>
                    <div class="text-muted">Price: ₱ {{ number(selectedProduct.price) }}</div>
                  </div>
                </div>
                <div class="form-text mt-1">
                  Picking a product will prefill <strong>Supplier Cost</strong> and
                  <strong>Title</strong>. You can still edit them.
                </div>
              </div>

              <!-- Title (replaces Item Name input behavior) -->
              <div class="col-md-6">
                <label class="form-label">Title</label>
                <input
                  v-model.trim="form.title"
                  type="text"
                  class="form-control"
                  placeholder="USB Drive Raffle"
                  required
                />
              </div>

              <!-- 🔥 Player Count input removed (default to 0 on insert) -->

              <div class="col-md-6">
                <label class="form-label">Supplier Cost (₱)</label>
                <input
                  v-model.number="form.item_supplier_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
                <div class="form-text">Auto-filled from product price; still editable</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Entry Fee (₱)</label>
                <input
                  v-model.number="form.entry_fee"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Interest Pool (₱)</label>
                <input
                  v-model.number="form.interest_pool"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
                <div class="form-text">Split among losers (player_count − 1)</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="draft">draft</option>
                  <option value="open">open</option>
                </select>
              </div>
            </div>

            <!-- Live Pricing Preview -->
            <div class="mt-4 p-3 rounded bg-light">
              <div class="fw-semibold mb-2">Pricing Preview</div>
              <div class="row g-2 small">
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted">Interest per Loser</div>
                    <div class="fs-5">₱ {{ preview.interestPerLoser.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted">Winner Price</div>
                    <div class="fs-5">₱ {{ preview.winnerPrice.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted">Loser Refund</div>
                    <div class="fs-5">₱ {{ preview.loserRefund.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeForm">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- =================== CARDS WITH TABS (STATUS-BASED) =================== -->
    <div class="card shadow-sm border-0 mt-4">
      <div class="card-header bg-white border-0 pt-3 pb-0">
        <ul class="nav nav-tabs nav-fill card-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'draft' }"
              @click="activeTab = 'draft'"
              type="button"
            >
              <i class="bi bi-pencil-square me-2"></i> Draft
              <span class="badge bg-secondary ms-2">{{ draftEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'open' }"
              @click="activeTab = 'open'"
              type="button"
            >
              <i class="bi bi-broadcast me-2"></i> Open
              <span class="badge bg-secondary ms-2">{{ openEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'locked' }"
              @click="activeTab = 'locked'"
              type="button"
            >
              <i class="bi bi-lock me-2"></i> Locked
              <span class="badge bg-secondary ms-2">{{ lockedEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'spun' }"
              @click="activeTab = 'spun'"
              type="button"
            >
              <i class="bi bi-disc me-2"></i> Spun
              <span class="badge bg-secondary ms-2">{{ spunEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'settled' }"
              @click="activeTab = 'settled'"
              type="button"
            >
              <i class="bi bi-check2-circle me-2"></i> Settled
              <span class="badge bg-secondary ms-2">{{ settledEvents.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'cancelled' }"
              @click="activeTab = 'cancelled'"
              type="button"
            >
              <i class="bi bi-x-octagon me-2"></i> Cancelled
              <span class="badge bg-secondary ms-2">{{ cancelledEvents.length }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <div class="row g-3">
          <!-- Draft -->
          <template v-if="activeTab === 'draft'">
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="ev in draftEvents"
              :key="'tab-draft-' + ev.id"
            >
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-light text-dark">draft</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.title }}</div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button
                    class="btn btn-sm btn-success"
                    :disabled="isBusy(ev.id)"
                    @click="openEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Open
                  </button>
                  <button
                    class="btn btn-sm btn-outline-dark"
                    :disabled="isBusy(ev.id)"
                    @click="cancelEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Cancel
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Open -->
          <template v-else-if="activeTab === 'open'">
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="ev in openEvents"
              :key="'tab-open-' + ev.id"
            >
              <div class="event-card border rounded-3 p-3 live-shadow">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-success">open</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.title }}</div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button
                    class="btn btn-sm btn-warning"
                    :disabled="isBusy(ev.id)"
                    @click="lockEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Lock
                  </button>
                  <button
                    class="btn btn-sm btn-outline-dark"
                    :disabled="isBusy(ev.id)"
                    @click="cancelEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Cancel
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Locked -->
          <template v-else-if="activeTab === 'locked'">
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="ev in lockedEvents"
              :key="'tab-locked-' + ev.id"
            >
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-warning text-dark">locked</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.title }}</div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button
                    class="btn btn-sm btn-info"
                    :disabled="isBusy(ev.id)"
                    @click="spinEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Spin
                  </button>
                  <button
                    class="btn btn-sm btn-outline-dark"
                    :disabled="isBusy(ev.id)"
                    @click="cancelEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Cancel
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Spun -->
          <template v-else-if="activeTab === 'spun'">
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="ev in spunEvents"
              :key="'tab-spun-' + ev.id"
            >
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-info">spun</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.title }}</div>
                <div class="d-flex justify-content-between small">
                  <div><i class="bi bi-cash-coin me-1"></i>₱ {{ number(ev.entry_fee) }}</div>
                  <div>
                    <i class="bi bi-cash-stack me-1"></i>Winner: ₱ {{ number(ev.winner_price) }}
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button
                    class="btn btn-sm btn-secondary"
                    :disabled="isBusy(ev.id)"
                    @click="settleEvent(ev)"
                  >
                    <span v-if="isBusy(ev.id)" class="spinner-border spinner-border-sm me-1"></span
                    >Settle
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Settled -->
          <template v-else-if="activeTab === 'settled'">
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="ev in settledEvents"
              :key="'tab-settled-' + ev.id"
            >
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-secondary">settled</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.title }}</div>
              </div>
            </div>
          </template>

          <!-- Cancelled -->
          <template v-else>
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="ev in cancelledEvents"
              :key="'tab-cancel-' + ev.id"
            >
              <div class="event-card border rounded-3 p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong class="text-truncate">{{ ev.title }}</strong>
                  <span class="badge rounded-pill text-bg-dark">cancelled</span>
                </div>
                <div class="small text-muted mb-2">{{ ev.title }}</div>
              </div>
            </div>
          </template>

          <!-- Empty state for selected tab -->
          <div
            v-if="
              (activeTab === 'draft' && draftEvents.length === 0) ||
              (activeTab === 'open' && openEvents.length === 0) ||
              (activeTab === 'locked' && lockedEvents.length === 0) ||
              (activeTab === 'spun' && spunEvents.length === 0) ||
              (activeTab === 'settled' && settledEvents.length === 0) ||
              (activeTab === 'cancelled' && cancelledEvents.length === 0)
            "
            class="col-12"
          >
            <div class="empty-state py-5">
              <i class="bi bi-box"></i>
              <div>No events in this status</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Table (kept but hidden as requested) -->
    <div class="card shadow-sm border-0 d-none">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Item</th>
              <th class="text-center">Cap</th>
              <th class="text-end">Entry Fee</th>
              <th class="text-end">Interest Pool</th>
              <th class="text-end">Winner Price</th>
              <th class="text-end">Loser Refund</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ev, i) in events" :key="ev.id">
              <td>{{ i + 1 }}</td>
              <td class="fw-semibold">{{ ev.title }}</td>
              <td>{{ ev.title }}</td>
              <td class="text-center">{{ ev.player_count }}</td>
              <td class="text-end">₱ {{ number(ev.entry_fee) }}</td>
              <td class="text-end">₱ {{ number(ev.interest_pool) }}</td>
              <td class="text-end">₱ {{ number(ev.winner_price) }}</td>
              <td class="text-end">₱ {{ number(ev.loser_refund_amount) }}</td>
              <td class="text-center">
                <span class="badge" :class="statusBadge(ev.status)">{{ ev.status }}</span>
              </td>
            </tr>
            <tr v-if="events.length === 0">
              <td colspan="9" class="text-center text-muted py-4">No events yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- /Hidden Table -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'

/** Cap that locks the event automatically when reached */
const PLAYER_LOCK_CAP = 10

type EventRow = {
  id: string
  title: string
  product_id: string | null
  item_supplier_cost: number | string
  entry_fee: number | string
  player_count: number | string
  interest_pool: number | string
  winner_price: number | string // generated
  loser_refund_amount: number | string // generated
  status: 'draft' | 'open' | 'locked' | 'spun' | 'settled' | 'cancelled'
}

type ProductRow = {
  id: string
  name: string
  price: number | string
  product_url: string | null
}

const events = ref<EventRow[]>([])
const showForm = ref(false)
const submitting = ref(false)

/* Active tab is status-based */
const activeTab = ref<EventRow['status']>('open')

/* =================== Products state (for product picker) =================== */
const products = ref<ProductRow[]>([])
const productsLoading = ref(false)
const selectedProductId = ref<string>('')

const selectedProduct = computed(
  () => products.value.find((p) => p.id === selectedProductId.value) || null,
)

/* Signed URL helpers for product images (private bucket) */
const signedMap = reactive<Record<string, string>>({})
const imgBusy: Record<string, boolean> = reactive({})
function isStoragePath(u: string | null | undefined) {
  if (!u) return false
  return !/^https?:\/\//i.test(u)
}
function productImageUrl(p: ProductRow | null) {
  if (!p || !p.product_url) return ''
  const key = p.id
  const raw = p.product_url
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
  productsLoading.value = true
  const { data, error } = await supabase
    .schema('games')
    .from('products')
    .select('id,name,price,product_url')
    .order('created_at', { ascending: false })
  if (!error && data) products.value = data as ProductRow[]
  productsLoading.value = false
}

/* When product changes: prefill supplier cost and (if empty) set title (editable) */
const prevAutoTitle = ref('')
watch(selectedProductId, () => {
  const p = selectedProduct.value
  if (!p) return
  form.item_supplier_cost = Number(p.price ?? 0)
  if (!form.title || form.title.trim() === '' || form.title === prevAutoTitle.value) {
    form.title = p.name
    prevAutoTitle.value = p.name
  }
})

/* ========================================================================== */

const form = reactive({
  title: '',
  product_id: '' as string | null,
  item_supplier_cost: 30.0,
  entry_fee: 50.0,
  interest_pool: 15.0,
  status: 'draft' as EventRow['status'], // only 'draft' | 'open' allowed in UI
})

// helpers
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)

// math (aligned with DB generated columns; preview assumes cap 10 for per-loser calc)
function round2(x: number) {
  return Math.round((x + Number.EPSILON) * 100) / 100
}
function calcInterestPerLoser(_entry_fee: number, interest_pool: number, player_count: number) {
  const denom = Math.max(player_count - 1, 1)
  return round2(interest_pool / denom)
}
function calcWinnerPrice(entry_fee: number, interest_pool: number, player_count: number) {
  const ipl = calcInterestPerLoser(entry_fee, interest_pool, player_count)
  return round2(entry_fee - ipl)
}
function calcLoserRefund(entry_fee: number, interest_pool: number, player_count: number) {
  const ipl = calcInterestPerLoser(entry_fee, interest_pool, player_count)
  return round2(entry_fee + ipl)
}

const preview = reactive({
  interestPerLoser: calcInterestPerLoser(
    Number(form.entry_fee),
    Number(form.interest_pool),
    PLAYER_LOCK_CAP,
  ),
  winnerPrice: calcWinnerPrice(Number(form.entry_fee), Number(form.interest_pool), PLAYER_LOCK_CAP),
  loserRefund: calcLoserRefund(Number(form.entry_fee), Number(form.interest_pool), PLAYER_LOCK_CAP),
})

// recompute preview on form changes
watch(
  () => [form.entry_fee, form.interest_pool],
  () => {
    const fee = Number(form.entry_fee)
    const pool = Number(form.interest_pool)
    preview.interestPerLoser = calcInterestPerLoser(fee, pool, PLAYER_LOCK_CAP)
    preview.winnerPrice = calcWinnerPrice(fee, pool, PLAYER_LOCK_CAP)
    preview.loserRefund = calcLoserRefund(fee, pool, PLAYER_LOCK_CAP)
  },
  { deep: true },
)

function statusBadge(status: EventRow['status']) {
  if (status === 'open') return 'text-bg-success'
  if (status === 'locked') return 'text-bg-warning'
  if (status === 'spun') return 'text-bg-info'
  if (status === 'settled') return 'text-bg-secondary'
  if (status === 'cancelled') return 'text-bg-dark'
  return 'text-bg-light'
}

function openForm() {
  showForm.value = true
  if (products.value.length === 0 && !productsLoading.value) loadProducts()
}
function closeForm() {
  showForm.value = false
}

async function loadEvents() {
  const { data, error } = await supabase
    .schema('games')
    .from('event')
    .select(
      `
      id, title, product_id, item_supplier_cost,
      entry_fee, player_count, interest_pool, status,
      winner_price, loser_refund_amount
    `,
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('loadEvents error:', error.message)
    return
  }
  events.value = (data ?? []) as EventRow[]

  // 🔒 Auto-lock: if player_count >= 10 and not locked, set to 'locked'
  // (Run sequentially to avoid spamming requests)
  for (const e of events.value) {
    const count = Number(e.player_count ?? 0)
    if (e.status !== 'locked' && count >= PLAYER_LOCK_CAP) {
      await setStatus(e, 'locked')
    }
  }
}

async function submit() {
  if (!form.title) return
  if (!selectedProductId.value) {
    alert('Please select a product.')
    return
  }

  submitting.value = true
  try {
    // fetch current user to stamp created_by
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      console.warn('getUser error:', userErr.message)
    }

    const payload: any = {
      title: form.title,
      product_id: selectedProductId.value, // ✅ store product_id instead of item_name
      item_supplier_cost: form.item_supplier_cost,
      entry_fee: form.entry_fee,
      player_count: 0, // ✅ default to 0 on insert
      interest_pool: form.interest_pool,
      status: form.status, // only 'draft' | 'open' from UI
      created_by: userData?.user?.id ?? null,
    }

    const { error } = await supabase.schema('games').from('event').insert(payload)

    if (error) {
      console.error('insert event error:', error.message)
      alert(error.message)
      return
    }

    closeForm()
    await loadEvents()
  } finally {
    submitting.value = false
  }
}

/* ----------------------- ADMIN ACTIONS / STATUS TRANSITIONS ----------------------- */
const busyId = ref<string | null>(null)
const isBusy = (id: string) => busyId.value === id

async function setStatus(ev: EventRow, status: EventRow['status']) {
  busyId.value = ev.id
  try {
    const { error } = await supabase
      .schema('games')
      .from('event')
      .update({ status })
      .eq('id', ev.id)
    if (error) {
      console.error('update status error:', error.message)
      alert(error.message)
      return
    }
    await loadEvents()
  } finally {
    busyId.value = null
  }
}

const openEvent = (ev: EventRow) => setStatus(ev, 'open')
const lockEvent = (ev: EventRow) => setStatus(ev, 'locked')
const spinEvent = (ev: EventRow) => setStatus(ev, 'spun')
const settleEvent = (ev: EventRow) => setStatus(ev, 'settled')
const cancelEvent = (ev: EventRow) => setStatus(ev, 'cancelled')

/* ----------------------- HERO LOGIC (status + player count) ----------------------- */
const now = ref(new Date())
let t: number | undefined

/* ======== 🔴 Realtime: subscribe to games.event changes (insert/update/delete) ======== */
/* ======== 🔴 Realtime: subscribe to games.event changes (insert/update/delete) ======== */
let realtimeChannel: any | null = null
let refreshTimer: number | null = null

function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    await loadEvents()
  }, delayMs)
}

onMounted(async () => {
  await loadEvents()

  // Clean any previous channel (hot-reloads etc.)
  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel)
    } catch {}
    realtimeChannel = null
  }

  // Subscribe explicitly to the games schema + event table
  realtimeChannel = supabase
    .channel('games-event-realtime')
    .on('postgres_changes', { event: '*', schema: 'games', table: 'event' }, (payload) => {
      // Debug: see events arrive in the console
      console.log('[realtime] games.event change:', payload.eventType, payload)
      // Coalesce refetches if multiple events come in a burst
      scheduleRefresh(150)
    })
    .subscribe((status) => {
      console.log('[realtime] channel status:', status)
    })

  // live clock (for the "Happening Now" header time only)
  t = window.setInterval(() => (now.value = new Date()), 30_000)
})

onUnmounted(() => {
  if (t) window.clearInterval(t)
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
    refreshTimer = null
  }
  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel)
    } catch {}
    realtimeChannel = null
  }
})

const nowFmt = computed(() => now.value.toLocaleString())

/** Draft: status === 'draft' */
const draftEvents = computed(() => events.value.filter((e) => e.status === 'draft'))

/** Open: status === 'open' */
const openEvents = computed(() => events.value.filter((e) => e.status === 'open'))

/** Happening Now: open OR locked */
const nowEvents = computed(() =>
  events.value.filter((e) => e.status === 'open' || e.status === 'locked'),
)

/** Finished: spun / settled / cancelled */
const finishedEvents = computed(() =>
  events.value.filter(
    (e) => e.status === 'spun' || e.status === 'settled' || e.status === 'cancelled',
  ),
)

/* ----------------------- STATUS TAB DATA ----------------------- */
const lockedEvents = computed(() => events.value.filter((e) => e.status === 'locked'))
const spunEvents = computed(() => events.value.filter((e) => e.status === 'spun'))
const settledEvents = computed(() => events.value.filter((e) => e.status === 'settled'))
const cancelledEvents = computed(() => events.value.filter((e) => e.status === 'cancelled'))
</script>

<style scoped>
.mini-games-page {
  padding: 1rem;
}

/* ===================== HERO SECTION STYLES ===================== */
.events-hero {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}
.events-hero .hero-bg {
  position: absolute;
  inset: 0;
  /* subtle animated gradient */
  background:
    radial-gradient(1200px 400px at -10% -20%, #6ea8fe33, transparent 60%),
    radial-gradient(900px 500px at 110% 120%, #20c99733, transparent 60%),
    linear-gradient(180deg, #f8fafc, #ffffff);
  animation: float-bg 12s ease-in-out infinite alternate;
  filter: saturate(1.05);
}
@keyframes float-bg {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-10px);
  }
}
.events-hero .hero-content {
  position: relative;
  padding: 1rem;
}

.hero-card {
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e9ecef;
  min-height: 280px;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.hero-card.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
}
.tilt:hover {
  transform: translateY(-2px) rotateX(0.5deg) rotateY(-0.5deg);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
}

/* Emphasize center hero */
.hero-center {
  min-height: 320px;
  border-width: 2px;
  box-shadow: 0 16px 50px rgba(32, 201, 151, 0.08);
}
.hero-scroll {
  max-height: 420px;
}

.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 999px;
}
.dot-live {
  background: #20c997;
  box-shadow: 0 0 0 6px rgba(32, 201, 151, 0.15);
}
.dot-upcoming {
  background: #fcc419;
  box-shadow: 0 0 0 6px rgba(252, 196, 25, 0.15);
}
.dot-finished {
  background: #94a3b8;
  box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.15);
}

.empty-state {
  display: grid;
  place-items: center;
  color: #94a3b8;
  padding: 24px 8px;
  row-gap: 4px;
}
.empty-state i {
  font-size: 1.6rem;
  opacity: 0.9;
}

.event-scroll {
  display: grid;
  gap: 12px;
  max-height: 360px;
  overflow: auto;
  padding-right: 6px;
}

.event-pill {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  animation: fade-in 0.35s ease both;
}
.event-pill.live {
  border-color: #bff0e3;
  box-shadow: 0 4px 12px rgba(32, 201, 151, 0.08);
}
.event-pill.upcoming {
  border-color: #ffe7a3;
  box-shadow: 0 4px 12px rgba(252, 196, 25, 0.08);
}
.event-pill.finished {
  border-color: #e2e8f0;
}

.event-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-pill .title {
  max-width: 65%;
}

.event-pill .meta {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}
.event-pill .pair {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #475569;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}
.price-chip {
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  padding: 8px;
  background: #f8fafc;
}
.price-chip small {
  display: block;
  color: #6b7280;
  letter-spacing: 0.02em;
}
.price-chip .price {
  font-weight: 700;
  font-size: 1.05rem;
}

/* Timestamp rows removed */
.times {
  display: none;
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
  width: min(760px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}
.card-header {
  background: #fff;
}

.card-tabs .nav-link {
  border: 0;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-weight: 600;
}
.card-tabs .nav-link.active {
  color: #0f172a;
  border-bottom: 2px solid #0ea5e9;
}
.event-card {
  background: #fff;
  border-color: #e9ecef;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
}
.live-shadow {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
}

/* Responsive polish */
@media (max-width: 992px) {
  .event-pill .meta {
    grid-template-columns: 1fr 1fr;
  }
  .price-row {
    grid-template-columns: 1fr;
  }
  .hero-center {
    min-height: 0;
  }
}
</style>
