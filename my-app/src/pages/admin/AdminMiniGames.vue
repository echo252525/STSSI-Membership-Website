<template>
  <div class="mini-games-page p-1">
    <!-- Header -->
    <div class="title d-flex align-items-center justify-content-between mb-3">
      <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-joystick"></i>
        Admin Mini Games
      </h3>
      <button
        type="button"
        class="btn btn-primary d-flex align-items-center gap-1"
        @click="openForm()"
      >
        <i class="bi bi-plus-lg"></i>
        New Spin
      </button>
    </div>

    <!-- ======================= HIERARCHICAL GAME HERO ======================= -->
    <section class="events-hero mb-4 breath-in-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <!-- Top center hero title -->
        <div class="hero-header text-center mb-3">
          <div class="mode-badge mx-auto mb-2">
            <i class="bi bi-controller"></i>
            Mini Game Command Center
          </div>
          <h4 class="fw-bold mb-1">Spin & Win Overview</h4>
          <p class="text-muted small mb-0">
            Open rooms sit at the top, followed by locked & spun games, with drafts and
            finished rounds in the lower tier.
          </p>
        </div>

        <!-- 🔶 Hierarchical layout (treemap style) -->
        <div class="hier-grid">
          <!-- TOP LARGE: OPEN -->
          <div class="hier-card hier-open game-card">
            <div class="hier-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="dot dot-live"></span>
                <span class="fw-semibold text-uppercase small">Open Rooms</span>
              </div>
              <small class="text-muted">{{ nowFmt }}</small>
            </div>

            <div v-if="eventsLoading" class="hier-skeleton">
              <div class="hier-skel-line w-75"></div>
              <div class="hier-skel-line w-50"></div>
              <div class="hier-skel-line w-60"></div>
            </div>

            <div v-else-if="openEvents.length === 0" class="empty-state">
              <i class="bi bi-emoji-neutral"></i>
              <div>No open rooms right now.</div>
              <small class="text-muted">
                Create a new Spin & Win event or open a draft to get players in.
              </small>
            </div>

            <div v-else class="hier-list hier-list-open">
              <article
                v-for="ev in openEvents"
                :key="'open-h-' + ev.id"
                class="hier-item hier-item-open"
                @click="openDetails(ev)"
              >
                <div class="d-flex align-items-start gap-2 open-card-header">
                  <!-- Prize avatar -->
                  <div class="prize-avatar prize-avatar-open">
                    <img
                      v-if="eventImageUrl(ev)"
                      :src="eventImageUrl(ev)"
                      :alt="ev.title"
                    />
                    <div v-else class="prize-avatar-fallback">
                      <i class="bi bi-gift"></i>
                    </div>
                  </div>

                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-1 title-row">
                      <span class="title open-title text-truncate">{{ ev.title }}</span>
                      <span class="badge rounded-pill text-bg-success text-uppercase small">
                        open
                      </span>
                    </div>

                    <div class="small text-muted meta-row">
                      <span>
                        <i class="bi bi-people me-1"></i>
                        {{ ev.player_count }}/{{ ev.player_cap || PLAYER_LOCK_CAP }}
                      </span>
                      <span>
                        <i class="bi bi-cash-coin me-1"></i>
                        ₱ {{ number(ev.entry_fee) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Joined players avatars footer -->
                <div
                  v-if="joinedAvatars(ev).length"
                  class="avatars-row mt-2 d-flex align-items-center justify-content-between"
                >
                  <div class="avatar-stack">
                    <span
                      v-for="(av, idx) in joinedAvatars(ev)"
                      :key="av.user_id + '-' + idx"
                      class="avatar-chip"
                      :title="av.name || 'Player'"
                      :style="{ zIndex: String(20 - idx) }"
                    >
                      <img
                        v-if="av.avatarUrl"
                        :src="av.avatarUrl"
                        :alt="av.name || 'Player avatar'"
                      />
                      <span v-else class="avatar-fallback">
                        {{ av.name ? av.name.charAt(0).toUpperCase() : 'P' }}
                      </span>
                    </span>
                    <span
                      v-if="ev.player_count > joinedAvatars(ev).length"
                      class="avatar-more small text-muted ms-1"
                    >
                      +{{ ev.player_count - joinedAvatars(ev).length }}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- MIDDLE TALL: LOCKED + SPUN -->
          <div class="hier-card hier-spun game-card">
            <div class="hier-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="dot dot-upcoming"></span>
                <span class="fw-semibold text-uppercase small">Locked & Spun</span>
              </div>
            </div>

            <div v-if="eventsLoading" class="hier-skeleton">
              <div class="hier-skel-line w-80"></div>
              <div class="hier-skel-line w-60"></div>
            </div>

            <div
              v-else-if="lockedEvents.length === 0 && spunEvents.length === 0"
              class="empty-state"
            >
              <i class="bi bi-disc"></i>
              <div>No locked or spun events yet.</div>
              <small class="text-muted">
                Once rooms are full or spun, they will appear in this section.
              </small>
            </div>

            <div v-else class="hier-list">
              <!-- Locked first -->
              <template v-for="ev in lockedEvents" :key="'locked-h-' + ev.id">
                <article class="hier-item" @click="openDetails(ev)">
                  <div class="d-flex align-items-center gap-2">
                    <!-- Prize avatar -->
                    <div class="prize-avatar">
                      <img
                        v-if="eventImageUrl(ev)"
                        :src="eventImageUrl(ev)"
                        :alt="ev.title"
                      />
                      <div v-else class="prize-avatar-fallback">
                        <i class="bi bi-gift"></i>
                      </div>
                    </div>

                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="title text-truncate">{{ ev.title }}</span>
                        <span
                          class="badge rounded-pill text-bg-warning text-dark text-uppercase small"
                        >
                          locked
                        </span>
                      </div>
                      <div class="small text-muted d-flex justify-content-between">
                        <span>
                          <i class="bi bi-people me-1"></i>
                          {{ ev.player_count }}/{{ ev.player_cap || PLAYER_LOCK_CAP }}
                        </span>
                        <span>
                          <i class="bi bi-cash-coin me-1"></i>
                          ₱ {{ number(ev.entry_fee) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </template>

              <!-- Spun -->
              <template v-for="ev in spunEvents" :key="'spun-h-' + ev.id">
                <article class="hier-item" @click="openDetails(ev)">
                  <div class="d-flex align-items-center gap-2">
                    <!-- Prize avatar -->
                    <div class="prize-avatar">
                      <img
                        v-if="eventImageUrl(ev)"
                        :src="eventImageUrl(ev)"
                        :alt="ev.title"
                      />
                      <div class="prize-avatar-fallback" v-else>
                        <i class="bi bi-gift"></i>
                      </div>
                    </div>

                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="title text-truncate">{{ ev.title }}</span>
                        <span class="badge rounded-pill text-bg-info text-uppercase small">
                          spun
                        </span>
                      </div>
                      <div class="small text-muted d-flex justify-content-between">
                        <span>
                          <i class="bi bi-cash-stack me-1"></i>
                          Winner refund: ₱ {{ number(ev.winner_refund_amount) }}
                        </span>
                        <span>
                          <i class="bi bi-cash-coin me-1"></i>
                          Entry: ₱ {{ number(ev.entry_fee) }}
                        </span>
                      </div>

                      <!-- Winner info for spun -->
                      <div
                        v-if="winnerInfo(ev)"
                        class="winner-row mt-1 d-flex align-items-center gap-2"
                      >
                        <span class="text-muted small">Winner:</span>
                        <div class="winner-pill d-inline-flex align-items-center gap-1">
                          <span class="winner-avatar">
                            <img
                              v-if="winnerInfo(ev)?.avatarUrl"
                              :src="winnerInfo(ev)?.avatarUrl || ''"
                              :alt="winnerInfo(ev)?.name || 'Winner'"
                            />
                            <span v-else class="winner-avatar-fallback">
                              {{
                                winnerInfo(ev)?.name
                                  ? winnerInfo(ev)!.name!.charAt(0).toUpperCase()
                                  : 'W'
                              }}
                            </span>
                          </span>
                          <span class="winner-name small">
                            {{ winnerInfo(ev)?.name || 'Unknown winner' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </template>
            </div>
          </div>

          <!-- BOTTOM LEFT: DRAFT -->
          <div class="hier-card hier-draft game-card">
            <div class="hier-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="dot dot-upcoming"></span>
                <span class="fw-semibold text-uppercase small">Draft</span>
              </div>
              <small class="text-muted">{{ draftEvents.length }} draft(s)</small>
            </div>

            <div v-if="eventsLoading" class="hier-skeleton">
              <div class="hier-skel-line w-90"></div>
              <div class="hier-skel-line w-60"></div>
            </div>

            <div v-else-if="draftEvents.length === 0" class="empty-state">
              <i class="bi bi-calendar2"></i>
              <div>No draft events yet.</div>
              <small class="text-muted">
                Start a draft when you’re planning the next Spin & Win.
              </small>
            </div>

            <div v-else class="hier-list">
              <article
                v-for="ev in draftEvents"
                :key="'draft-h-' + ev.id"
                class="hier-item"
                @click="openDetails(ev)"
              >
                <div class="d-flex align-items-center gap-2">
                  <!-- Prize avatar -->
                  <div class="prize-avatar">
                    <img
                      v-if="eventImageUrl(ev)"
                      :src="eventImageUrl(ev)"
                      :alt="ev.title"
                    />
                    <div v-else class="prize-avatar-fallback">
                      <i class="bi bi-gift"></i>
                    </div>
                  </div>

                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="title text-truncate">{{ ev.title }}</span>
                      <span class="badge rounded-pill text-bg-light text-dark text-uppercase small">
                        draft
                      </span>
                    </div>
                    <div class="small text-muted d-flex justify-content-between mb-2">
                      <span>
                        <i class="bi bi-cash-coin me-1"></i>
                        ₱ {{ number(ev.entry_fee) }}
                      </span>
                    </div>
                    <!-- Buttons removed here; actions moved to details modal -->
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- BOTTOM MIDDLE: CANCELLED -->
          <div class="hier-card hier-cancelled game-card">
            <div class="hier-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="dot dot-finished"></span>
                <span class="fw-semibold text-uppercase small">Cancelled</span>
              </div>
              <small class="text-muted">{{ cancelledEvents.length }}</small>
            </div>

            <div v-if="eventsLoading" class="hier-skeleton">
              <div class="hier-skel-line w-80"></div>
            </div>

            <div v-else-if="cancelledEvents.length === 0" class="empty-state">
              <i class="bi bi-x-octagon"></i>
              <div>No cancelled events.</div>
              <small class="text-muted">Everything is currently on track.</small>
            </div>

            <div v-else class="hier-list">
              <article
                v-for="ev in cancelledEvents"
                :key="'cancelled-h-' + ev.id"
                class="hier-item"
                @click="openDetails(ev)"
              >
                <div class="d-flex align-items-center gap-2">
                  <!-- Prize avatar -->
                  <div class="prize-avatar">
                    <img
                      v-if="eventImageUrl(ev)"
                      :src="eventImageUrl(ev)"
                      :alt="ev.title"
                    />
                    <div class="prize-avatar-fallback" v-else>
                      <i class="bi bi-gift"></i>
                    </div>
                  </div>

                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="title text-truncate">{{ ev.title }}</span>
                      <span class="badge rounded-pill text-bg-dark text-uppercase small">
                        cancelled
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- BOTTOM RIGHT: SETTLED -->
          <div class="hier-card hier-settled game-card">
            <div class="hier-header d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="dot dot-finished"></span>
                <span class="fw-semibold text-uppercase small">Settled</span>
              </div>
              <small class="text-muted">{{ settledEvents.length }}</small>
            </div>

            <div v-if="eventsLoading" class="hier-skeleton">
              <div class="hier-skel-line w-70"></div>
              <div class="hier-skel-line w-50"></div>
            </div>

            <div v-else-if="settledEvents.length === 0" class="empty-state">
              <i class="bi bi-check2-circle"></i>
              <div>No settled events yet.</div>
              <small class="text-muted">
                Once prizes are completed, they will move into this area.
              </small>
            </div>

            <div v-else class="hier-list">
              <article
                v-for="ev in settledEvents"
                :key="'settled-h-' + ev.id"
                class="hier-item"
                @click="openDetails(ev)"
              >
                <div class="d-flex align-items-center gap-2">
                  <!-- Prize avatar -->
                  <div class="prize-avatar">
                    <img
                      v-if="eventImageUrl(ev)"
                      :src="eventImageUrl(ev)"
                      :alt="ev.title"
                    />
                    <div class="prize-avatar-fallback" v-else>
                      <i class="bi bi-gift"></i>
                    </div>
                  </div>

                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="title text-truncate">{{ ev.title }}</span>
                      <span class="badge rounded-pill text-bg-secondary text-uppercase small">
                        settled
                      </span>
                    </div>
                    <div class="small text-muted d-flex justify-content-between">
                      <span>
                        <i class="bi bi-cash-coin me-1"></i>
                        Entry: ₱ {{ number(ev.entry_fee) }}
                      </span>
                      <span>
                        <i class="bi bi-people me-1"></i>
                        {{ ev.player_count }} player(s)
                      </span>
                    </div>

                    <!-- Winner info for settled -->
                    <div
                      v-if="winnerInfo(ev)"
                      class="winner-row mt-1 d-flex align-items-center gap-2"
                    >
                      <span class="text-muted small">Winner:</span>
                      <div class="winner-pill d-inline-flex align-items-center gap-1">
                        <span class="winner-avatar">
                          <img
                            v-if="winnerInfo(ev)?.avatarUrl"
                            :src="winnerInfo(ev)?.avatarUrl || ''"
                            :alt="winnerInfo(ev)?.name || 'Winner'"
                          />
                          <span v-else class="winner-avatar-fallback">
                            {{
                              winnerInfo(ev)?.name
                                ? winnerInfo(ev)!.name!.charAt(0).toUpperCase()
                                : 'W'
                            }}
                          </span>
                        </span>
                        <span class="winner-name small">
                          {{ winnerInfo(ev)?.name || 'Unknown winner' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        <!-- /hier-grid -->
      </div>
    </section>
    <!-- ===================== / HIERARCHICAL HERO ====================== -->

    <!-- Create / Edit Event Modal -->
    <div v-if="showForm" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg breath-in-section">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>
            <i class="bi bi-magic me-1"></i>{{ editingId ? 'Edit' : 'Create' }} Spin & Win Event
          </strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeForm">✕</button>
        </div>
        <div class="card-body">
          <form @submit.prevent="submit">
            <div class="row g-3">
              <!-- Product Picker -->
              <div class="col-12">
                <label class="form-label">Product</label>
                <div class="d-flex gap-2">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-box-seam"></i>
                    </span>
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
                  </div>
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
                  Selecting a product will prefill <strong>Supplier Cost</strong> and
                  <strong>Title</strong>. You can still adjust them before saving.
                </div>
              </div>

              <!-- Title -->
              <div class="col-md-6">
                <label class="form-label">Title</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-type"></i>
                  </span>
                  <input
                    v-model.trim="form.title"
                    type="text"
                    class="form-control"
                    placeholder="USB Drive Raffle"
                    required
                  />
                </div>
              </div>

              <!-- Supplier Cost -->
              <div class="col-md-6">
                <label class="form-label">Supplier Cost (₱)</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-box-seam"></i>
                  </span>
                  <input
                    v-model.number="form.item_supplier_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-text">Auto-filled from product cost; still editable.</div>
              </div>

              <!-- Entry Fee -->
              <div class="col-md-4">
                <label class="form-label">Entry Fee (₱)</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-cash-coin"></i>
                  </span>
                  <input
                    v-model.number="form.entry_fee"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <!-- Percent -->
              <div class="col-md-4">
                <label class="form-label">Percent</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-percent"></i>
                  </span>
                  <input
                    v-model.number="form.percent"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    class="form-control"
                    required
                  />
                  <span class="input-group-text">%</span>
                </div>
                <div class="form-text">
                  Used in: <code>(Entry Fee − Supplier Cost) × Percent</code>.
                </div>
              </div>

              <!-- Interest Pool -->
              <div class="col-md-4">
                <label class="form-label">Interest Pool (₱)</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-piggy-bank"></i>
                  </span>
                  <input
                    v-model.number="form.interest_pool"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                    :readonly="true"
                    required
                  />
                </div>
                <div class="form-text">Evenly shared across all players (player cap).</div>
              </div>

              <!-- Player Cap -->
              <div class="col-md-4">
                <label class="form-label">Player Cap</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-people"></i>
                  </span>
                  <input
                    v-model.number="form.player_cap"
                    type="number"
                    min="2"
                    step="1"
                    class="form-control"
                    required
                  />
                </div>
                <div class="form-text">Room auto-locks once this number is reached.</div>
              </div>

              <!-- Status -->
              <div class="col-md-4">
                <label class="form-label">Status</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-flag-fill"></i>
                  </span>
                  <select v-model="form.status" class="form-select">
                    <option value="draft">draft</option>
                    <option value="open">open</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Live Pricing Preview -->
            <div class="mt-4 p-3 rounded bg-light">
              <div class="fw-semibold mb-2 d-flex align-items-center gap-2">
                <i class="bi bi-graph-up-arrow text-muted"></i>
                <span>Pricing Preview</span>
              </div>
              <div class="row g-2 small">
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="d-flex align-items-center justify-content-between text-muted mb-1">
                      <span>Interest per Player</span>
                      <i class="bi bi-piggy-bank"></i>
                    </div>
                    <div class="fs-5">₱ {{ preview.interestPerPlayer.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="d-flex align-items-center justify-content-between text-muted mb-1">
                      <span>Winner Refund</span>
                      <i class="bi bi-trophy"></i>
                    </div>
                    <div class="fs-5">₱ {{ preview.winnerPrice.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="border rounded p-2 h-100">
                    <div class="d-flex align-items-center justify-content-between text-muted mb-1">
                      <span>Loser Refund</span>
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </div>
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
                {{ editingId ? 'Save Changes' : 'Create Event' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Event Details Modal -->
    <div v-if="showDetails && activeEvent" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg breath-in-section">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>
            <i class="bi bi-joystick me-1"></i>Spin & Win Details
          </strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeDetails">✕</button>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <!-- Left: Product / Prize -->
            <div class="col-md-4">
              <div class="ratio ratio-4x3 mb-2">
                <img
                  v-if="activeProduct && activeImage"
                  :src="activeImage"
                  :alt="activeProduct?.name"
                  class="w-100 h-100 object-fit-cover rounded"
                />
                <div
                  v-else
                  class="bg-light w-100 h-100 d-flex align-items-center justify-content-center rounded text-muted"
                >
                  <i class="bi bi-image"></i>
                </div>
              </div>
              <div v-if="activeProduct" class="small">
                <div class="fw-semibold d-flex align-items-center gap-1 mb-1">
                  <i class="bi bi-gift"></i>
                  <span>{{ activeProduct.name }}</span>
                </div>
                <div class="text-muted">
                  <i class="bi bi-tag me-1"></i>Price: ₱ {{ number(activeProduct.price) }}
                </div>
                <div class="text-muted">
                  <i class="bi bi-box-seam me-1"></i>Supplier Cost:
                  ₱ {{ number(activeProduct.supplier_price) }}
                </div>
              </div>
            </div>

            <!-- Right: Game info -->
            <div class="col-md-8">
              <h5 class="fw-bold mb-2 d-flex align-items-center gap-2">
                <i class="bi bi-ticket-perforated"></i>
                <span class="detail-title-ellipsis">{{ activeEvent.title }}</span>
                <span class="badge ms-2" :class="statusBadge(activeEvent.status)">
                  {{ activeEvent.status }}
                </span>
              </h5>

              <!-- Small winner hero for spun/settled -->
              <div
                v-if="
                  (activeEvent.status === 'spun' || activeEvent.status === 'settled') &&
                  winnerInfo(activeEvent)
                "
                class="winner-hero mb-3"
              >
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="winner-hero-icon">
                      <i class="bi bi-trophy-fill"></i>
                    </span>
                    <div>
                      <div class="text-uppercase small text-muted">
                        {{ activeEvent.status === 'spun' ? 'Spin completed' : 'Game settled' }}
                      </div>
                      <div class="fw-semibold winner-hero-name-ellipsis">
                        {{ winnerInfo(activeEvent)?.name || 'Unknown winner' }}
                      </div>
                    </div>
                  </div>
                  <div class="text-end small text-muted">
                    <div>
                      <i class="bi bi-people me-1"></i
                      >{{ activeEvent.player_count }} player(s)
                    </div>
                    <div>
                      <i class="bi bi-cash-coin me-1"></i>₱
                      {{ number(activeEvent.winner_refund_amount) }} prize
                    </div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="winner-avatar winner-avatar-lg">
                    <img
                      v-if="winnerInfo(activeEvent)?.avatarUrl"
                      :src="winnerInfo(activeEvent)?.avatarUrl || ''"
                      :alt="winnerInfo(activeEvent)?.name || 'Winner'"
                    />
                    <span v-else class="winner-avatar-fallback">
                      {{
                        winnerInfo(activeEvent)?.name
                          ? winnerInfo(activeEvent)!.name!.charAt(0).toUpperCase()
                          : 'W'
                      }}
                    </span>
                  </span>
                  <span class="small text-muted">
                    Highlighted winner with full refund and interest share.
                  </span>
                </div>
              </div>

              <div class="row g-2 small">
                <div class="col-sm-6">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted d-flex align-items-center gap-1 mb-1">
                      <i class="bi bi-cash-coin"></i>
                      <span>Entry Fee</span>
                    </div>
                    <div class="fs-6">₱ {{ number(activeEvent.entry_fee) }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted d-flex align-items-center gap-1 mb-1">
                      <i class="bi bi-box-seam"></i>
                      <span>Supplier Cost</span>
                    </div>
                    <div class="fs-6">₱ {{ number(activeEvent.item_supplier_cost) }}</div>
                  </div>
                </div>

                <div class="col-sm-6">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted d-flex align-items-center gap-1 mb-1">
                      <i class="bi bi-piggy-bank"></i>
                      <span>Interest Pool</span>
                    </div>
                    <div class="fs-6">₱ {{ number(activeEvent.interest_pool) }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted d-flex align-items-center gap-1 mb-1">
                      <i class="bi bi-people"></i>
                      <span>Players</span>
                    </div>
                    <div class="fs-6">
                      {{ activeEvent.player_count }}/{{ activeEvent.player_cap || PLAYER_LOCK_CAP }}
                    </div>
                  </div>
                </div>

                <div class="col-sm-6">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted d-flex align-items-center gap-1 mb-1">
                      <i class="bi bi-trophy"></i>
                      <span>Winner Refund</span>
                    </div>
                    <div class="fs-6">₱ {{ number(activeEvent.winner_refund_amount) }}</div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="border rounded p-2 h-100">
                    <div class="text-muted d-flex align-items-center gap-1 mb-1">
                      <i class="bi bi-arrow-counterclockwise"></i>
                      <span>Loser Refund</span>
                    </div>
                    <div class="fs-6">₱ {{ number(activeEvent.loser_refund_amount) }}</div>
                  </div>
                </div>
              </div>

              <!-- All joined players -->
              <div v-if="activeParticipants.length" class="mt-3 players-section">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-people-fill text-muted"></i>
                  <span class="fw-semibold small text-uppercase">Joined Players</span>
                  <span class="badge bg-light text-dark small ms-1">
                    {{ activeParticipants.length }} participant(s)
                  </span>
                </div>
                <div class="players-list">
                  <div
                    v-for="p in activeParticipants"
                    :key="p.user_id"
                    class="player-row"
                  >
                    <span class="player-avatar">
                      <img
                        v-if="p.avatarUrl"
                        :src="p.avatarUrl"
                        :alt="p.name || 'Player'"
                      />
                      <span v-else class="player-avatar-fallback">
                        {{ p.name ? p.name.charAt(0).toUpperCase() : 'P' }}
                      </span>
                    </span>
                    <div class="player-meta">
                      <div class="player-name">
                        {{ p.name || 'Unknown player' }}
                      </div>
                      <div class="player-tag small text-muted">
                        Participant
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="mt-3 small text-muted">
                No player avatars to show yet for this game.
              </div>
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-end gap-2 mt-4">
            <!-- Draft actions shown only in modal -->
            <template v-if="activeEvent.status === 'draft'">
              <button
                type="button"
                class="btn btn-outline-primary"
                :disabled="isBusy(activeEvent.id)"
                @click="editFromModal"
              >
                <span
                  v-if="isBusy(activeEvent.id)"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Edit
              </button>
              <button
                type="button"
                class="btn btn-success"
                :disabled="isBusy(activeEvent.id)"
                @click="openFromModal"
              >
                <span
                  v-if="isBusy(activeEvent.id)"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Open
              </button>
              <button
                type="button"
                class="btn btn-outline-danger"
                :disabled="isBusy(activeEvent.id)"
                @click="deleteFromModal"
              >
                <span
                  v-if="isBusy(activeEvent.id)"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Delete
              </button>
            </template>

            <!-- Open status: Cancel button -->
            <button
              v-else-if="activeEvent.status === 'open'"
              type="button"
              class="btn btn-outline-danger"
              :disabled="isBusy(activeEvent.id)"
              @click="cancelFromModal"
            >
              <span
                v-if="isBusy(activeEvent.id)"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Cancel Game
            </button>
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
              <th class="text-end">Winner Refund</th>
              <th class="text-end">Loser Refund</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ev, i) in events" :key="ev.id">
              <td>{{ i + 1 }}</td>
              <td class="fw-semibold">{{ ev.title }}</td>
              <td>{{ ev.title }}</td>
              <td class="text-center">
                {{ ev.player_count }}/{{ ev.player_cap || PLAYER_LOCK_CAP }}
              </td>
              <td class="text-end">₱ {{ number(ev.entry_fee) }}</td>
              <td class="text-end">₱ {{ number(ev.interest_pool) }}</td>
              <td class="text-end">₱ {{ number(ev.winner_refund_amount) }}</td>
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
import { useRouter, useRoute } from 'vue-router'
import { currentUser } from '@/lib/authState'
import Swal from 'sweetalert2'

const router = useRouter()
const user = computed(() => currentUser.value)
const route = useRoute()

/* ======================= SWEETALERT HELPERS ======================= */
async function swInfo(message: string, title = 'Just a heads-up') {
  await Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'Okay',
  })
}
async function swWarn(message: string, title = 'Please check this') {
  await Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'Got it',
  })
}
async function swError(message: string, title = 'Something went wrong') {
  await Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Okay',
  })
}
async function swSuccess(message: string, title = 'All set!') {
  await Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'Nice',
  })
}
async function swConfirm(message: string, title = 'Are you sure?') {
  const res = await Swal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Yes, continue',
    cancelButtonText: 'No, keep it',
  })
  return res.isConfirmed
}

/* Require login */
onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
})

/** Cap that locks the event automatically when reached */
const PLAYER_LOCK_CAP = 10

type EventRow = {
  id: string
  title: string
  product_id: string | null
  item_supplier_cost: number
  entry_fee: number
  player_count: number
  interest_pool: number
  status: 'draft' | 'open' | 'locked' | 'spun' | 'settled' | 'cancelled'
  player_cap?: number
  winner_refund_amount: number
  loser_refund_amount: number
  /** NEW: winner user id */
  user_id_winner: string | null
}

type ProductRow = {
  id: string
  name: string
  price: number | string
  supplier_price: number | string
  product_url: string | string[] | null
}

/* NEW: entry + avatar/winner types */
type EntryRow = {
  id: string
  event_id: string
  user_id: string
  status: string
  joined_at: string
}

type EntryLite = {
  user_id: string
  joined_at: string
}

type AvatarInfo = {
  user_id: string
  name: string | null
  avatarUrl: string | null
}

type WinnerInfo = {
  user_id: string
  name: string | null
  avatarUrl: string | null
}

const events = ref<EventRow[]>([])
const eventsLoading = ref(true)

const showForm = ref(false)
const submitting = ref(false)

/* Details modal state */
const showDetails = ref(false)
const activeEvent = ref<EventRow | null>(null)

/* =================== Products state (for product picker) =================== */
const products = ref<ProductRow[]>([])
const productsLoading = ref(false)
const selectedProductId = ref<string>('')

const selectedProduct = computed(
  () => products.value.find((p) => p.id === selectedProductId.value) || null,
)

const productMap = computed<Record<string, ProductRow>>(() => {
  const m: Record<string, ProductRow> = {}
  for (const p of products.value) m[p.id] = p
  return m
})

const signedMap = reactive<Record<string, string>>({})
const imgBusy: Record<string, boolean> = reactive({})

function isStoragePath(u: string | null | undefined) {
  if (!u) return false
  return !/^https?:\/\//i.test(u)
}

/** Normalize product_url to a single path/url */
function firstUrl(u: string | string[] | null): string | '' {
  if (!u) return ''
  if (Array.isArray(u)) return (u[0] ?? '') as string
  return u as string
}

function productImageUrl(p: ProductRow | null) {
  if (!p || !p.product_url) return ''
  const raw0 = firstUrl(p.product_url)
  if (!raw0) return ''
  const key = p.id
  const raw = raw0
  if (!isStoragePath(raw)) return raw
  if (signedMap[key]) return signedMap[key]
  if (!imgBusy[key]) {
    imgBusy[key] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(raw, 60 * 60)
      .then(({ data, error }) => {
        if (error) {
          console.error('signedUrl error:', error.message)
        } else if (data?.signedUrl) {
          signedMap[key] = data.signedUrl
        }
      })
      .finally(() => (imgBusy[key] = false))
  }
  return ''
}

/* Get image URL for an event via its product_id */
function eventImageUrl(ev: EventRow) {
  const pid = ev.product_id || ''
  const p = productMap.value[pid]
  return productImageUrl(p || null)
}

/* Active product + image for details modal */
const activeProduct = computed<ProductRow | null>(() => {
  const ev = activeEvent.value
  if (!ev || !ev.product_id) return null
  return productMap.value[ev.product_id] || null
})

const activeImage = computed(() =>
  activeProduct.value ? productImageUrl(activeProduct.value) : '',
)

async function loadProducts() {
  productsLoading.value = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,price,supplier_price,product_url')
      .eq('ispublish', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('loadProducts error:', error.message)
      await swError(
        'We couldn’t load the product list. Please refresh the page and try again.',
        'Unable to load products',
      )
      return
    }
    if (data) products.value = data as ProductRow[]
  } finally {
    productsLoading.value = false
  }
}

/* When product changes: prefill supplier cost and entry fee from product */
const prevAutoTitle = ref('')
watch(selectedProductId, () => {
  const p = selectedProduct.value
  if (!p) return
  form.item_supplier_cost = Number(p.supplier_price ?? 0)
  form.entry_fee = Number(p.price ?? 0)
  form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)

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
  percent: 80,
  interest_pool: 15.0,
  player_cap: 10,
  status: 'draft' as EventRow['status'],
})

/* Track editing mode */
const editingId = ref<string | null>(null)

// helpers
const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)

function round2(x: number) {
  return Math.round((x + Number.EPSILON) * 100) / 100
}

// Interest pool rule: (Entry Fee − Supplier Cost) × Percent
function computeInterestPool(
  entryFee: number | string,
  supplierCost: number | string,
  percent: number | string,
) {
  const fee = Number(entryFee ?? 0)
  const cost = Number(supplierCost ?? 0)
  const pct = Number(percent ?? 0) / 100
  const val = (fee - cost) * pct
  return round2(Math.max(0, val))
}

// Keep interest_pool auto-updated
watch(
  () => [form.entry_fee, form.item_supplier_cost, form.percent],
  () => {
    form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)
  },
  { immediate: true },
)

function calcInterestPerPlayer(interest_pool: number, player_cap: number) {
  const denom = Math.max(player_cap, 1)
  return round2(interest_pool / denom)
}

// winner refund = IPP
function calcWinnerRefund(entry_fee: number, interest_pool: number, player_cap: number) {
  const ipp = calcInterestPerPlayer(interest_pool, player_cap)
  return ipp
}

// loser refund = entry_fee + IPP
function calcLoserRefund(entry_fee: number, interest_pool: number, player_cap: number) {
  const ipp = calcInterestPerPlayer(interest_pool, player_cap)
  return round2(entry_fee + ipp)
}

const preview = reactive({
  interestPerPlayer: calcInterestPerPlayer(Number(form.interest_pool), Number(form.player_cap)),
  winnerPrice: calcWinnerRefund(
    Number(form.entry_fee),
    Number(form.interest_pool),
    Number(form.player_cap),
  ),
  loserRefund: calcLoserRefund(
    Number(form.entry_fee),
    Number(form.interest_pool),
    Number(form.player_cap),
  ),
})

watch(
  () => [form.entry_fee, form.interest_pool, form.player_cap],
  () => {
    const fee = Number(form.entry_fee)
    const pool = Number(form.interest_pool)
    const cap = Number(form.player_cap)
    preview.interestPerPlayer = calcInterestPerPlayer(pool, cap)
    preview.winnerPrice = calcWinnerRefund(fee, pool, cap)
    preview.loserRefund = calcLoserRefund(fee, pool, cap)
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
  form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)
}
function closeForm() {
  showForm.value = false
  if (editingId.value) {
    editingId.value = null
    selectedProductId.value = ''
    form.title = ''
    prevAutoTitle.value = ''
    form.item_supplier_cost = 30.0
    form.entry_fee = 50.0
    form.percent = 80
    form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)
    form.player_cap = 10
    form.status = 'draft'
  }
}

/* Details modal open/close */
function openDetails(ev: EventRow) {
  activeEvent.value = ev
  showDetails.value = true
  if (products.value.length === 0 && !productsLoading.value) {
    loadProducts()
  }
  // Ensure we have latest avatars & winner info for this event
  refreshParticipantAvatars(ev.id)
  if (ev.status === 'spun' || ev.status === 'settled' || ev.user_id_winner) {
    refreshWinnerForEvent(ev)
  }
}
function closeDetails() {
  showDetails.value = false
  activeEvent.value = null
}

/* ===================== FOCUS PARAM FROM URL (OPEN MODALS) ===================== */
/* If URL is /admin/mini-games?focus=openmodal -> open create modal
   If URL is /admin/mini-games?focus=<eventId> -> open that event's details modal */
function handleInitialFocusFromRoute() {
  const raw = route.query.focus
  const focus = typeof raw === 'string' ? raw.trim() : ''
  if (!focus) return

  if (focus === 'openmodal') {
    openForm()
    return
  }

  const ev = events.value.find((e) => e.id === focus)
  if (ev) {
    openDetails(ev)
  }
}

/* ===================== AVATARS & WINNER DATA (NEW) ===================== */

const avatarsByEvent: Record<string, AvatarInfo[]> = reactive({})
const winnerByEvent: Record<string, WinnerInfo | null> = reactive({})
const MAX_AVATAR_DISPLAY = 5

function joinedAvatars(ev: EventRow): AvatarInfo[] {
  return (avatarsByEvent[ev.id] || []).slice(0, MAX_AVATAR_DISPLAY)
}

function winnerInfo(ev: EventRow | null): WinnerInfo | null {
  if (!ev) return null
  return winnerByEvent[ev.id] || null
}

/* NEW: active participants for the open modal */
const activeParticipants = computed<AvatarInfo[]>(() => {
  const ev = activeEvent.value
  if (!ev) return []
  return avatarsByEvent[ev.id] || []
})

function normalizeToPath(maybePath: string | null | undefined): string | null {
  if (!maybePath) return null
  if (/^https?:\/\//i.test(maybePath)) return maybePath
  return maybePath.replace(/^\/+/, '')
}

async function signUserProfileUrl(path: string): Promise<string | null> {
  if (/^https?:\/\//i.test(path)) return path
  const { data, error } = await supabase.storage.from('user_profile').createSignedUrl(path, 60 * 60)
  if (error) {
    console.warn('[AVATAR] sign error:', error.message)
    return null
  }
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}

const AVATAR_LIMIT = 12
async function refreshParticipantAvatars(eventId: string) {
  try {
    const { data: entries, error: entryErr } = await supabase
      .schema('games')
      .from('entry')
      .select('user_id, joined_at')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: false })
      .limit(AVATAR_LIMIT)

    if (entryErr) throw entryErr

    const typedEntries = (entries ?? []) as EntryLite[]

    const userIds = Array.from(new Set(typedEntries.map((r) => r.user_id))).filter(
      Boolean,
    )

    if (userIds.length === 0) {
      avatarsByEvent[eventId] = []
      return
    }

    const { data: users, error: usersErr } = await supabase
      .schema('public')
      .from('users')
      .select('id, full_name, profile_url')
      .in('id', userIds)

    if (usersErr) throw usersErr

    const map = new Map<string, { full_name: string | null; profile_url: string | null }>()
    for (const u of (users ?? []) as Array<{
      id: string
      full_name: string | null
      profile_url: string | null
    }>) {
      map.set(u.id, { full_name: u.full_name ?? null, profile_url: u.profile_url ?? null })
    }

    const list: AvatarInfo[] = []
    for (const e of typedEntries) {
      const user = map.get(e.user_id)
      if (!user) continue
      const path = normalizeToPath(user.profile_url)
      let url: string | null = null
      if (path) url = await signUserProfileUrl(path)
      list.push({
        user_id: e.user_id,
        name: user.full_name,
        avatarUrl: url,
      })
    }
    avatarsByEvent[eventId] = list
    console.log('[AVATAR] Updated', eventId, '->', list.length)
  } catch (e: any) {
    console.warn('[AVATAR] refreshParticipantAvatars failed for', eventId, e?.message || e)
  }
}

async function refreshWinnerForEvent(ev: EventRow) {
  try {
    const uid = ev.user_id_winner
    if (!uid) {
      winnerByEvent[ev.id] = null
      return
    }

    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .select('id, full_name, profile_url')
      .eq('id', uid)
      .single()

    if (error) {
      console.warn('[WINNER] load failed:', error.message)
      winnerByEvent[ev.id] = null
      return
    }

    const path = normalizeToPath(data.profile_url)
    let avatarUrl: string | null = null
    if (path) {
      avatarUrl = await signUserProfileUrl(path)
    }

    winnerByEvent[ev.id] = {
      user_id: uid,
      name: data.full_name ?? null,
      avatarUrl,
    }
  } catch (e: any) {
    console.warn('[WINNER] refreshWinnerForEvent failed for', ev.id, e?.message || e)
    winnerByEvent[ev.id] = null
  }
}

async function refreshAllAvatarsAndWinners() {
  try {
    const all = events.value
    if (!all.length) return

    const open = all.filter((e) => e.status === 'open')
    const locked = all.filter((e) => e.status === 'locked')
    const finished = all.filter((e) => e.status === 'spun' || e.status === 'settled')

    await Promise.all([
      ...open.map((e) => refreshParticipantAvatars(e.id)),
      ...locked.map((e) => refreshParticipantAvatars(e.id)),
      ...finished.map(async (e) => {
        await refreshParticipantAvatars(e.id)
        await refreshWinnerForEvent(e)
      }),
    ])
  } catch (e: any) {
    console.warn('[AVATAR/WINNER] bulk refresh failed:', e?.message || e)
  }
}

/* ===================== LOAD EVENTS ===================== */

async function loadEvents(opts: { background?: boolean } = {}) {
  const { background = false } = opts
  if (!background) eventsLoading.value = true
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('event')
      .select(
        `
        id, title, product_id, item_supplier_cost,
        entry_fee, player_count, interest_pool, status,
        winner_refund_amount, loser_refund_amount, player_cap,
        user_id_winner
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('loadEvents error:', error.message)
      await swError(
        'We had trouble loading the mini game list. Please check your connection and try again.',
        'Unable to load games',
      )
      return
    }
    events.value = (data ?? []) as EventRow[]

    // NEW: after the latest snapshot, refresh avatars & winners
    await refreshAllAvatarsAndWinners()
  } finally {
    if (!background) eventsLoading.value = false
  }
}

async function submit() {
  if (!form.title || !form.title.trim()) {
    await swInfo(
      'Please add a short, clear title so you can easily recognize this game.',
      'Title needed',
    )
    return
  }
  if (!selectedProductId.value) {
    await swWarn('Please choose a prize product to link to this Spin & Win game.', 'Select a product')
    return
  }

  form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)

  submitting.value = true
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      console.warn('getUser error:', userErr.message)
    }

    const payload: any = {
      title: form.title,
      product_id: selectedProductId.value,
      item_supplier_cost: round2(Number(form.item_supplier_cost)),
      entry_fee: round2(Number(form.entry_fee)),
      interest_pool: round2(Number(form.interest_pool)),
      player_cap: form.player_cap,
      status: form.status,
    }

    let successTitle = ''
    let successMessage = ''

    if (!editingId.value) {
      payload.player_count = 0
      payload.created_by = userData?.user?.id ?? null
      const { error } = await supabase.schema('games').from('event').insert(payload)
      if (error) {
        console.error('insert event error:', error.message)
        await swError(
          'We couldn’t create the game. Please check the details and try again.',
          'Save failed',
        )
        return
      }
      successTitle = 'Game created'
      successMessage = 'Your new Spin & Win game is ready for players.'
    } else {
      const { error } = await supabase
        .schema('games')
        .from('event')
        .update(payload)
        .eq('id', editingId.value)
      if (error) {
        console.error('update event error:', error.message)
        await swError(
          'We couldn’t save your changes. Please try again in a moment.',
          'Update failed',
        )
        return
      }
      successTitle = 'Changes saved'
      successMessage = 'Your game details have been updated successfully.'
    }

    selectedProductId.value = ''
    form.title = ''
    prevAutoTitle.value = ''
    form.item_supplier_cost = 30.0
    form.entry_fee = 50.0
    form.percent = 80
    form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)
    form.player_cap = 10
    form.status = 'draft'
    editingId.value = null

    closeForm()
    await loadEvents({ background: true })
    if (successTitle) {
      await swSuccess(successMessage, successTitle)
    }
  } finally {
    submitting.value = false
  }
}

/* ----------------------- ADMIN ACTIONS / STATUS TRANSITIONS ----------------------- */
const busyId = ref<string | null>(null)
const isBusy = (id: string) => busyId.value === id

async function setStatus(
  ev: EventRow,
  status: EventRow['status'],
  successMessage?: string,
) {
  busyId.value = ev.id
  try {
    const { error } = await supabase
      .schema('games')
      .from('event')
      .update({ status })
      .eq('id', ev.id)
    if (error) {
      console.error('update status error:', error.message)
      await swError(
        'We couldn’t update the game status. Please try again shortly.',
        'Update failed',
      )
      return
    }
    await loadEvents({ background: true })
    if (successMessage) {
      await swSuccess(successMessage)
    }
  } finally {
    busyId.value = null
  }
}

const openEvent = (ev: EventRow) =>
  setStatus(ev, 'open', 'The game is now open. Players can start joining.')
const spinEvent = (ev: EventRow) =>
  setStatus(ev, 'spun', 'The wheel has been spun for this game.')
const settleEvent = (ev: EventRow) =>
  setStatus(ev, 'settled', 'The game has been marked as settled.')
const cancelEvent = (ev: EventRow) =>
  setStatus(ev, 'cancelled', 'This game has been cancelled. No further actions will be taken.')

/* Cancel from details modal (only for open events) */
async function cancelFromModal() {
  if (!activeEvent.value) return
  const confirmed = await swConfirm(
    'This open game will be cancelled. Players will no longer be able to join or continue.',
    'Cancel this game?',
  )
  if (!confirmed) return
  await cancelEvent(activeEvent.value)
  closeDetails()
}

/* Draft-specific actions */
function editDraft(ev: EventRow) {
  if (ev.status !== 'draft') return
  editingId.value = ev.id
  form.title = ev.title
  form.item_supplier_cost = Number(ev.item_supplier_cost)
  form.entry_fee = Number(ev.entry_fee)

  const fee = Number(ev.entry_fee)
  const cost = Number(ev.item_supplier_cost)
  const pool = Number(ev.interest_pool)
  if (fee > cost && pool >= 0) {
    const inferred = (pool / (fee - cost)) * 100
    form.percent = Number.isFinite(inferred) ? Math.min(100, Math.max(0, round2(inferred))) : 80
  } else {
    form.percent = 80
  }

  form.interest_pool = computeInterestPool(form.entry_fee, form.item_supplier_cost, form.percent)
  form.player_cap = Number(ev.player_cap || PLAYER_LOCK_CAP)
  form.status = ev.status
  selectedProductId.value = ev.product_id || ''
  openForm()
}

async function deleteDraft(ev: EventRow) {
  if (ev.status !== 'draft') return
  const confirmed = await swConfirm(
    'This draft game will be permanently removed. Players will not see or use it anymore.',
    'Delete draft game?',
  )
  if (!confirmed) return
  busyId.value = ev.id
  try {
    const { error } = await supabase.schema('games').from('event').delete().eq('id', ev.id)
    if (error) {
      console.error('delete draft error:', error.message)
      await swError(
        'We couldn’t delete the draft. Please refresh the page and try again.',
        'Delete failed',
      )
      return
    }
    await loadEvents({ background: true })
    await swSuccess('The draft game has been deleted.', 'Draft deleted')
  } finally {
    busyId.value = null
  }
}

/* Draft actions from modal */
function editFromModal() {
  if (!activeEvent.value) return
  const ev = activeEvent.value
  closeDetails()
  editDraft(ev)
}
async function openFromModal() {
  if (!activeEvent.value) return
  const ev = activeEvent.value
  await openEvent(ev)
  closeDetails()
}
async function deleteFromModal() {
  if (!activeEvent.value) return
  const ev = activeEvent.value
  await deleteDraft(ev)
  closeDetails()
}

/* ----------------------- HERO CLOCK + REALTIME ----------------------- */
const now = ref(new Date())
let t: number | undefined

let realtimeChannel: any | null = null
let refreshTimer: number | null = null

function scheduleRefresh(delayMs = 250) {
  if (refreshTimer) {
    window.clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(async () => {
    refreshTimer = null
    await loadEvents({ background: true })
  }, delayMs)
}

function applyRealtimeChange(payload: any) {
  const type = String(payload.eventType || payload.type || '').toUpperCase()
  const newRow = payload.new as EventRow | undefined
  const oldRow = payload.old as EventRow | undefined
  const current = events.value.slice()

  if (type === 'INSERT' && newRow) {
    const exists = current.findIndex((e) => e.id === newRow.id)
    if (exists === -1) current.unshift(newRow)
    else current[exists] = { ...current[exists], ...newRow }
  } else if (type === 'UPDATE' && newRow) {
    const idx = current.findIndex((e) => e.id === newRow.id)
    if (idx !== -1) current[idx] = { ...current[idx], ...newRow }
    else current.unshift(newRow)
  } else if (type === 'DELETE' && oldRow) {
    const idx = current.findIndex((e) => e.id === oldRow.id)
    if (idx !== -1) current.splice(idx, 1)
  }

  events.value = current

  // NEW: refresh avatars / winner for affected event
  if (newRow) {
    if (
      newRow.status === 'open' ||
      newRow.status === 'locked' ||
      newRow.status === 'spun' ||
      newRow.status === 'settled'
    ) {
      refreshParticipantAvatars(newRow.id)
    }
    if (newRow.status === 'spun' || newRow.status === 'settled' || newRow.user_id_winner) {
      refreshWinnerForEvent(newRow)
    }
  }
}

const POLL_MS = 10_000

function makeChannel() {
  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel)
    } catch {}
    realtimeChannel = null
  }

  realtimeChannel = supabase
    .channel('games-event-realtime', {
      config: {
        broadcast: { self: false },
        presence: { key: 'admin-mini-games' },
      },
    })
    .on('postgres_changes', { event: '*', schema: 'games', table: 'event' }, (payload) => {
      console.log('[realtime] games.event change:', payload.eventType, payload)
      try {
        applyRealtimeChange(payload)
      } catch (e) {
        console.warn('applyRealtimeChange failed, fallback refetch', e)
        scheduleRefresh(150)
      }
      scheduleRefresh(300)
    })
    .subscribe((status: any, err?: any) => {
      console.log('[realtime] channel status:', status, err || '')
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setTimeout(() => makeChannel(), 1000)
      }
    })
}

let pollHandle: number | null = null
function startPoll() {
  stopPoll()
  pollHandle = window.setInterval(() => loadEvents({ background: true }), POLL_MS)
}
function stopPoll() {
  if (pollHandle) {
    window.clearInterval(pollHandle)
    pollHandle = null
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    loadEvents({ background: true })
  }
}

onMounted(async () => {
  await Promise.all([loadEvents(), loadProducts()])
  makeChannel()

  t = window.setInterval(() => (now.value = new Date()), 1000)

  startPoll()
  document.addEventListener('visibilitychange', onVisibilityChange)

  // NEW: open modal based on ?focus= query param
  handleInitialFocusFromRoute()
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
  stopPoll()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

const nowFmt = computed(() => now.value.toLocaleString())

/* ----------------------- STATUS FILTERS ----------------------- */
const draftEvents = computed(() => events.value.filter((e) => e.status === 'draft'))
const openEvents = computed(() => events.value.filter((e) => e.status === 'open'))
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
  background:
    radial-gradient(1100px 400px at -10% -20%, #38bdf833, transparent 60%),
    radial-gradient(900px 500px at 120% 130%, #22c55e33, transparent 60%),
    linear-gradient(180deg, #020617, #020617);
  animation: float-bg 12s ease-in-out infinite alternate;
  filter: saturate(1.08);
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
  color: #e5e7eb;
}

/* Breath-in entrance animation */
.breath-in-section {
  animation: breathIn 0.25s ease-out;
  animation-fill-mode: both;
}
@keyframes breathIn {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Game vibe badge */
.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(94, 234, 212, 0.5);
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.mode-badge i {
  font-size: 0.9rem;
}

/* ====== HIERARCHICAL GRID (treemap style) ====== */
.hier-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: minmax(140px, auto) minmax(140px, auto) minmax(140px, auto);
  grid-template-areas:
    'open open open spun'
    'open open open spun'
    'draft cancelled settled settled';
  gap: 0.75rem;
}

.hier-open {
  grid-area: open;
}
.hier-spun {
  grid-area: spun;
}
.hier-draft {
  grid-area: draft;
}
.hier-cancelled {
  grid-area: cancelled;
}
.hier-settled {
  grid-area: settled;
}

.hier-card {
  position: relative;
  border-radius: 14px;
  padding: 10px 10px 8px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Dark, arcadey cards */
.game-card {
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.28), transparent 55%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.24), transparent 55%),
    rgba(15, 23, 42, 0.96);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.6);
  animation: breathIn 0.25s ease-out;
}
.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.75);
}

.hier-header {
  margin-bottom: 4px;
}

/* List inside each cell */
.hier-list {
  margin-top: 4px;
  overflow-y: auto;
  padding-right: 2px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 230px; /* scroll instead of stretching whole screen */

  /* minimalist scrollbar (Firefox) */
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

/* open section can be a bit taller */
.hier-list-open {
  max-height: 280px;
}

/* Minimalist scrollbar (WebKit) */
.hier-list::-webkit-scrollbar,
.players-list::-webkit-scrollbar {
  width: 6px;
}
.hier-list::-webkit-scrollbar-track,
.players-list::-webkit-scrollbar-track {
  background: transparent;
}
.hier-list::-webkit-scrollbar-thumb,
.players-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 999px;
}
.hier-list:hover::-webkit-scrollbar-thumb,
.players-list:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
}

/* Shared item styles */
.hier-item {
  border-radius: 8px;
  padding: 6px 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.55);
  font-size: 0.8rem;
  color: #e5e7eb;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.hier-item:hover,
.hier-item:focus-within {
  background: rgba(15, 23, 42, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.8);
}

/* Title truncation for all items */
.hier-item .title {
  display: inline-block;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hier-item-open .open-title {
  max-width: 200px;
}

/* Emphasize OPEN rows visually as game cards */
.hier-item-open {
  padding: 10px 12px;
  border-width: 2px;
  border-color: rgba(52, 211, 153, 0.9);
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.45),
    0 12px 35px rgba(15, 23, 42, 0.9);
  font-size: 0.9rem;
  border-radius: 12px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 55%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.18), transparent 55%),
    rgba(15, 23, 42, 0.98);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hier-item-open .title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}
.hier-item-open .meta-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.hier-item-open .small,
.hier-item-open .text-muted {
  color: #e5e7eb !important;
}

/* Skeleton */
.hier-skeleton {
  margin-top: 6px;
}
.hier-skel-line {
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(110deg, #1e293b 8%, #334155 18%, #1e293b 33%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
  margin-bottom: 4px;
}
@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* Dots reused */
.dot {
  width: 10px;
  height: 10px;
  display: inline-block;
  border-radius: 999px;
}
.dot-live {
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.25);
}
.dot-upcoming {
  background: #facc15;
  box-shadow: 0 0 0 6px rgba(250, 204, 21, 0.32);
}
.dot-finished {
  background: #94a3b8;
  box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.28);
}

.empty-state {
  display: grid;
  place-items: center;
  color: #9ca3af;
  padding: 24px 8px;
  row-gap: 4px;
  text-align: center;
}
.empty-state i {
  font-size: 1.6rem;
  opacity: 0.9;
}

/* Prize avatar (profile-like icon with prize image) */
.prize-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.prize-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prize-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e5e7eb;
  font-size: 0.9rem;
}

/* Slightly bigger avatar for OPEN section */
.prize-avatar-open {
  width: 40px;
  height: 40px;
  border-color: rgba(52, 211, 153, 0.95);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.35);
}

/* Hide any legacy timestamp rows */
.times-are {
  display: none;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
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

  /* subtle scrollbar for modal */
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}
.modal-card::-webkit-scrollbar {
  width: 6px;
}
.modal-card::-webkit-scrollbar-track {
  background: transparent;
}
.modal-card::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 999px;
}
.modal-card:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
}

.card-header {
  background: #fff;
}

/* Kept for hidden table / legacy styles */
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

/* NEW: avatar stack for joined players */
.avatar-stack {
  display: inline-flex;
  align-items: center;
  position: relative;
}
.avatar-chip {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.8);
  background: rgba(15, 23, 42, 0.96);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
}
.avatar-chip:first-child {
  margin-left: 0;
}
.avatar-chip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  font-size: 0.65rem;
  font-weight: 600;
  color: #e5e7eb;
}
.avatar-more {
  font-size: 0.7rem;
}

/* NEW: winner pill styles */
.winner-row {
  color: #cbd5f5;
}
.winner-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(96, 165, 250, 0.7);
}
.winner-avatar {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(30, 64, 175, 0.9);
  background: rgba(15, 23, 42, 0.96);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.winner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.winner-avatar-fallback {
  font-size: 0.7rem;
  font-weight: 600;
  color: #e5e7eb;
}
.winner-name {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Winner hero in modal */
.winner-hero {
  padding: 10px 12px;
  border-radius: 12px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 55%),
    radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.22), transparent 55%),
    rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(96, 165, 250, 0.7);
  color: #e5e7eb;
}
.winner-hero-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 64, 175, 0.9);
}
.winner-hero-icon i {
  font-size: 1rem;
  color: #facc15;
}
.winner-avatar-lg {
  width: 32px;
  height: 32px;
}

/* Truncation for long titles in details modal */
.detail-title-ellipsis {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Joined players list in modal */
.players-section {
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 10px 12px;
}
.players-list {
  max-height: 180px;
  overflow-y: auto;
  margin-top: 4px;

  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}
.players-list::-webkit-scrollbar {
  width: 6px;
}
.players-list::-webkit-scrollbar-track {
  background: transparent;
}
.players-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 999px;
}
.players-list:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
}
.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.player-avatar {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(30, 64, 175, 0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.96);
}
.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.player-avatar-fallback {
  font-size: 0.7rem;
  font-weight: 600;
  color: #e5e7eb;
}
.player-meta .player-name {
  font-size: 0.82rem;
  font-weight: 500;
}

/* Responsive polish */
@media (max-width: 992px) {
  .hier-grid {
    grid-template-areas: none;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .hier-card {
    grid-area: auto !important;
  }
  .hier-list,
  .hier-list-open {
    max-height: 260px;
  }
}

@media (max-width: 450px) {
  .events-hero .hero-content {
    padding: 0.75rem !important;
    margin-top: 0.5rem;
  }
  .title {
    margin: 0.1rem !important;
  }
}
</style>
