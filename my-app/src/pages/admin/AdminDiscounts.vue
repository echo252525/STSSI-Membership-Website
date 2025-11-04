<template>
  <div class="container-fluid py-3 discounts-page" :aria-busy="busy.load ? 'true' : 'false'">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
      <div>
        <h1 class="h4 m-0 d-flex align-items-center gap-2">
          <i class="bi bi-ticket-perforated text-primary"></i>
          Discounts
        </h1>
        <p class="text-muted small mb-0">Create, manage, and track discount codes and credits.</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" :disabled="busy.load" @click="load">
          <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
          Refresh
        </button>

        <!-- Unified insert flow -->
        <button class="btn btn-primary btn-sm" @click="openInsertUnified()">
          <i class="bi bi-plus-lg me-1"></i>
          New Discount
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm rounded-4 mb-3 filters-card breath breath-delay-1">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label small mb-1">Search</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model.trim="query.search"
                type="text"
                class="form-control"
                placeholder="Title or code…"
                @keydown.enter="load"
              />
            </div>
          </div>

          <!-- Status filter -->
          <div class="col-6 col-md-3">
            <label class="form-label small mb-1">Status</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light">
                <i class="bi bi-traffic-light"></i>
              </span>
              <select v-model="query.status" class="form-select">
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <!-- Type filter -->
          <div class="col-6 col-md-3">
            <label class="form-label small mb-1">Type</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light">
                <i class="bi bi-percent"></i>
              </span>
              <select v-model="query.type" class="form-select">
                <option value="">All</option>
                <option value="percent">% Percentage</option>
                <option value="fixed_amount">₱ Fixed Amount</option>
              </select>
            </div>
          </div>

          <div class="col-12 col-md-2 d-grid">
            <button class="btn btn-outline-primary btn-sm" @click="load">Apply</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== NEW: Minimalist Tabs + Cards ==================== -->
    <div class="card border-0 shadow-sm rounded-4 list-card breath breath-delay-2">
      <div class="card-body p-3">
        <!-- Loading -->
        <div v-if="busy.load" class="row g-3" role="status" aria-live="polite">
          <div v-for="n in 8" :key="'sk-' + n" class="col-12 col-md-6 col-xl-3">
            <div class="discount-card skeleton breath">
              <div class="skeleton-line w-50 mb-2"></div>
              <div class="skeleton-line w-75 mb-3"></div>
              <div class="skeleton-line w-25 mb-2"></div>
              <div class="skeleton-pill w-50 mb-1"></div>
              <div class="skeleton-pill w-25"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="items.length === 0"
          class="text-center text-muted py-5 breath breath-delay-3"
        >
          <i class="bi bi-percent fs-2 d-block mb-2"></i>
          No discounts found.
        </div>

        <!-- Content -->
        <div v-else class="new-layout">
          <!-- Quick tabs -->
          <div
            class="disc-tabs d-flex flex-wrap align-items-center gap-2 mb-3 breath breath-delay-3"
          >
            <button
              class="pill"
              :class="{ active: activeTab === 'active' }"
              @click="activeTab = 'active'"
            >
              <i class="bi bi-lightning-charge me-1"></i> Active
              <span class="count">{{ activeItems.length }}</span>
            </button>

            <button
              class="pill"
              :class="{ active: activeTab === 'scheduled' }"
              @click="activeTab = 'scheduled'"
            >
              <i class="bi bi-calendar3 me-1"></i> Scheduled
              <span class="count">{{ scheduledItems.length }}</span>
            </button>

            <button
              class="pill"
              :class="{ active: activeTab === 'expired' }"
              @click="activeTab = 'expired'"
            >
              <i class="bi bi-calendar-x me-1"></i> Expired
              <span class="count">{{ expiredItems.length }}</span>
            </button>

            <button
              class="pill"
              :class="{ active: activeTab === 'all' }"
              @click="activeTab = 'all'"
            >
              <i class="bi bi-grid me-1"></i> All
              <span class="count">{{ items.length }}</span>
            </button>
          </div>

          <!-- Grid -->
          <div class="row g-3">
            <div v-for="d in filteredByTab" :key="d.id" class="col-12 col-md-6 col-xl-4">
              <div class="discount-card h-100 d-flex flex-column modern-card">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1">
                    <h6 class="mb-0 d-flex align-items-center gap-2">
                      <span class="title-text" :title="d.title">{{ d.title }}</span>
                      <span class="badge rounded-pill" :class="badgeClass(cardStatus(d))">{{
                        cardStatus(d)
                      }}</span>
                    </h6>
                    <p class="text-muted small mb-1 line-clamp-2" :title="d.description">
                      {{ d.description }}
                    </p>
                    <p class="small mb-0">
                      <span v-if="d.code" class="badge text-bg-light border"
                        ><i class="bi bi-upc me-1"></i>{{ d.code }}</span
                      >
                      <span v-else class="text-muted small">No code</span>
                    </p>
                  </div>

                  <!-- Status-specific actions (compact) -->
                  <div class="d-flex flex-column align-items-end gap-1">
                    <!-- Active: Pause toggle -->
                    <div
                      v-if="cardStatus(d) === 'active'"
                      class="form-check form-switch small m-0 toggle-wrap"
                    >
                      <input
                        class="form-check-input pretty-switch"
                        type="checkbox"
                        role="switch"
                        :id="'sw-' + d.id"
                        :checked="false"
                        :disabled="busy.statusId === d.id"
                        @change="pauseDiscount(d)"
                      />
                      <label class="form-check-label tiny-text" :for="'sw-' + d.id">
                        <span
                          v-if="busy.statusId === d.id"
                          class="spinner-border spinner-border-sm me-1"
                        ></span>
                        Pause
                      </label>
                    </div>

                    <!-- Scheduled: EDIT / DELETE (replaces 'Go live') -->
                    <div v-else-if="cardStatus(d) === 'scheduled'" class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="openEditor(d)"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        :disabled="busy.deleteId === d.id"
                        @click="remove(d)"
                        title="Delete"
                      >
                        <span
                          v-if="busy.deleteId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        <i v-else class="bi bi-trash"></i>
                      </button>
                    </div>

                    <!-- Draft / Paused: quick actions -->
                    <div
                      v-else-if="cardStatus(d) === 'draft' || cardStatus(d) === 'paused'"
                      class="btn-group btn-group-sm"
                    >
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="openEditor(d)"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        @click="activateDiscount(d)"
                        :disabled="busy.statusId === d.id"
                        title="Activate"
                      >
                        <span
                          v-if="busy.statusId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        <i v-else class="bi bi-play-fill"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        @click="remove(d)"
                        :disabled="busy.deleteId === d.id"
                        title="Delete"
                      >
                        <span
                          v-if="busy.deleteId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        <i v-else class="bi bi-trash"></i>
                      </button>
                    </div>

                    <!-- Expired: Renew / Archive / Delete -->
                    <div v-else-if="cardStatus(d) === 'expired'" class="btn-group btn-group-sm">
                      <button
                        class="btn btn-primary"
                        type="button"
                        :disabled="busy.statusId === d.id"
                        @click="renewDiscount(d)"
                        title="Renew (edit details)"
                      >
                        <span
                          v-if="busy.statusId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        Renew
                      </button>
                      <button
                        class="btn btn-outline-dark"
                        type="button"
                        :disabled="busy.statusId === d.id"
                        @click="archiveDiscount(d)"
                        title="Archive"
                      >
                        Archive
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        :disabled="busy.deleteId === d.id"
                        @click="remove(d)"
                        title="Delete"
                      >
                        <span
                          v-if="busy.deleteId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        <i v-else class="bi bi-trash"></i>
                      </button>
                    </div>

                    <!-- Archived: Restore / Delete -->
                    <div v-else-if="cardStatus(d) === 'archived'" class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        :disabled="busy.statusId === d.id"
                        @click="restoreDiscount(d)"
                        title="Restore to Draft"
                      >
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        :disabled="busy.deleteId === d.id"
                        @click="remove(d)"
                        title="Delete"
                      >
                        <span
                          v-if="busy.deleteId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        <i v-else class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Value + type -->
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="value-bubble" :class="d.type === 'percent' ? 'percent' : 'amount'">
                    <span v-if="d.type === 'percent'">{{ formatNumber(d.percent_off) }}%</span>
                    <span v-else>₱{{ formatNumber(d.amount_off) }}</span>
                  </div>
                  <div class="flex-grow-1">
                    <div class="small text-muted">Type</div>
                    <div class="fw-semibold text-capitalize">{{ uiTypeLabel(d.type) }}</div>
                    <div
                      v-if="d.type === 'percent' && d.max_discount_amount"
                      class="text-muted small mt-1 d-flex align-items-center gap-1"
                    >
                      <i class="bi bi-shield-check"></i> Cap ₱{{
                        formatNumber(d.max_discount_amount)
                      }}
                    </div>
                  </div>
                </div>

                <!-- Badges -->
                <div class="mb-3">
                  <div class="d-flex flex-wrap gap-1">
                    <span
                      v-if="d.product_id"
                      class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                    >
                      <i class="bi bi-box-seam me-1"></i>Product-only
                    </span>
                    <span
                      v-if="d.min_subtotal && d.min_subtotal > 0"
                      class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                    >
                      <i class="bi bi-cash-coin me-1"></i>Min ₱{{ formatNumber(d.min_subtotal) }}
                    </span>
                    <span
                      class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                    >
                      <i class="bi bi-layers me-1"></i>Exclusive
                    </span>
                    <span
                      v-if="d.max_uses_global"
                      class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                    >
                      <i class="bi bi-people me-1"></i>{{ d.max_uses_global }} global
                    </span>
                    <span
                      v-if="d.max_uses_per_user"
                      class="badge rounded-pill bg-body-secondary border text-secondary small-badge"
                    >
                      <i class="bi bi-person-check me-1"></i>{{ d.max_uses_per_user }}/user
                    </span>
                  </div>
                </div>

                <!-- Timeline + usage -->
                <div
                  class="d-flex align-items-center justify-content-between mt-auto pt-2 border-top small text-muted gap-2"
                >
                  <div>
                    <i class="bi bi-calendar-event"></i>
                    {{ d.starts_at ? fmtDate(d.starts_at) : '—' }}
                    <span v-if="d.expires_at">→ {{ fmtDate(d.expires_at) }}</span>
                  </div>
                  <div class="text-end">
                    <i class="bi bi-lightning-charge text-warning"></i>
                    {{ d.redemptions_count ?? 0 }} used
                    <div class="text-muted tiny-text">
                      {{
                        (d.redemptions_count ?? 0) === 1
                          ? '1 user has used this discount'
                          : (d.redemptions_count ?? 0) + ' users have used this discount'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state per-tab -->
            <div v-if="filteredByTab.length === 0" class="col-12">
              <div class="empty-soft text-center py-5 breath">
                <i class="bi bi-inboxes fs-3 d-block mb-2"></i>
                <div class="text-muted">No items under this tab.</div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="!busy.load && items.length > 0"
            class="d-flex align-items-center justify-content-between pt-3 mt-2 border-top breath breath-delay-2"
          >
            <div class="small text-muted">
              Showing <strong>{{ items.length }}</strong>
            </div>
            <div class="btn-group">
              <button class="btn btn-outline-secondary btn-sm" :disabled="!canPrev" @click="prev">
                Prev
              </button>
              <button class="btn btn-outline-secondary btn-sm" :disabled="!canNext" @click="next">
                Next
              </button>
            </div>
          </div>

          <!-- Archived toggle -->
          <div class="archived-toggle text-center mt-3 pt-2 border-top breath">
            <button class="btn btn-outline-dark btn-sm" @click="showArchived = !showArchived">
              <i class="bi" :class="showArchived ? 'bi-archive' : 'bi-archive'"></i>
              {{ showArchived ? 'Hide' : 'Show' }} Archived
              <span class="badge text-bg-light border ms-1">{{ archivedItems.length }}</span>
            </button>
          </div>

          <!-- Archived grid -->
          <div v-if="showArchived" class="mt-3 breath breath-delay-3">
            <div v-if="archivedItems.length === 0" class="text-muted small px-2 pb-2 text-center">
              No archived discounts.
            </div>
            <div v-else class="row g-3">
              <div
                v-for="d in archivedItems"
                :key="'arch-' + d.id"
                class="col-12 col-md-6 col-xl-4"
              >
                <div class="discount-card h-100 d-flex flex-column modern-card">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                      <h6 class="mb-0 d-flex align-items-center gap-2">
                        <span class="title-text" :title="d.title">{{ d.title }}</span>
                        <span class="badge rounded-pill" :class="badgeClass('archived')"
                          >archived</span
                        >
                      </h6>
                      <p class="text-muted small mb-1 line-clamp-2" :title="d.description">
                        {{ d.description }}
                      </p>
                      <p class="small mb-0">
                        <span v-if="d.code" class="badge text-bg-light border"
                          ><i class="bi bi-upc me-1"></i>{{ d.code }}</span
                        >
                        <span v-else class="text-muted small">No code</span>
                      </p>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        :disabled="busy.statusId === d.id"
                        @click="restoreDiscount(d)"
                        title="Restore to Draft"
                      >
                        <i class="bi bi-arrow-counterclockwise"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        :disabled="busy.deleteId === d.id"
                        @click="remove(d)"
                        title="Delete"
                      >
                        <span
                          v-if="busy.deleteId === d.id"
                          class="spinner-border spinner-border-sm"
                        ></span>
                        <i v-else class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="value-bubble" :class="d.type === 'percent' ? 'percent' : 'amount'">
                      <span v-if="d.type === 'percent'">{{ formatNumber(d.percent_off) }}%</span>
                      <span v-else>₱{{ formatNumber(d.amount_off) }}</span>
                    </div>
                    <div class="flex-grow-1">
                      <div class="small text-muted">Type</div>
                      <div class="fw-semibold text-capitalize">{{ uiTypeLabel(d.type) }}</div>
                    </div>
                  </div>

                  <div
                    class="d-flex align-items-center justify-content-between mt-auto pt-2 border-top small text-muted gap-2"
                  >
                    <div>
                      <i class="bi bi-calendar-event"></i>
                      {{ d.starts_at ? fmtDate(d.starts_at) : '—' }}
                      <span v-if="d.expires_at">→ {{ fmtDate(d.expires_at) }}</span>
                    </div>
                    <div class="text-end">
                      <i class="bi bi-lightning-charge text-warning"></i>
                      {{ d.redemptions_count ?? 0 }} used
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- /new-layout -->

        <!-- (Kept for reference; hidden) Old grouped sections -->
        <div class="grouped-sections d-none">
          <!-- (intentionally hidden old layout block retained) -->
        </div>
      </div>
    </div>

    <!-- Editor Modal (unchanged container; unified inside) -->
    <!-- NEW: Teleport the modal to body so it’s never blocked by local stacking contexts -->
    <teleport to="body">
      <div class="modal fade" id="discountEditor" tabindex="-1" ref="editorEl">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content editor-modal">
            <div class="modal-header border-0 pb-0">
              <div>
                <h5 class="modal-title fw-semibold d-flex align-items-center gap-2">
                  <i class="bi bi-magic text-primary fs-5"></i>
                  <template v-if="form.id">Edit Discount</template>
                  <template v-else>
                    New Discount
                    <span v-if="form.insert_kind === 'scheduled'">— Scheduled</span>
                    <span v-else>— Draft / Active</span>
                  </template>
                </h5>
                <p class="text-muted small mb-0">
                  Only percent and fixed amount discounts. Description is required.
                </p>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>

            <div class="modal-body pt-3">
              <!-- Section: Basic Info -->
              <p class="text-uppercase small text-muted mb-2 fw-semibold breath">Basic Information</p>
              <div class="row g-3 mb-3 breath">
                <div class="col-12">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-type text-primary"></i>
                    Title <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-megaphone"></i></span>
                    <input
                      v-model.trim="form.title"
                      type="text"
                      class="form-control"
                      placeholder="E.g., Payday Sale 10%"
                      :class="errors.title && 'is-invalid'"
                      :required="true"
                    />
                  </div>
                  <div v-if="errors.title" class="invalid-feedback d-block">{{ errors.title }}</div>
                </div>

                <div class="col-12">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-textarea-t text-primary"></i>
                    Description <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-card-text"></i></span>
                    <textarea
                      v-model.trim="form.description"
                      class="form-control"
                      rows="2"
                      placeholder="Describe what this discount is for…"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Section: Discount Rule -->
              <p class="text-uppercase small text-muted mb-2 fw-semibold mt-2 breath">Discount Rule</p>
              <div class="row g-3 mb-3 breath">
                <!-- Type -->
                <div class="col-12 col-md-4">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-tags text-primary"></i>
                    Type <span v-if="!form.id" class="text-danger">*</span>
                  </label>

                  <!-- insert -->
                  <div class="input-group" v-if="!form.id">
                    <span class="input-group-text bg-light"><i class="bi bi-tags"></i></span>
                    <select v-model="form.type" class="form-select" :class="errors.type && 'is-invalid'" :required="true">
                      <option value="percent">% Percentage</option>
                      <option value="fixed_amount">₱ Fixed Amount</option>
                    </select>
                  </div>

                  <!-- edit: display-only -->
                  <div v-else class="display-field">
                    <i class="bi bi-lock text-muted me-1"></i>
                    <span class="badge rounded-pill bg-soft">{{ uiTypeLabel(form.type || 'percent') }}</span>
                  </div>
                  <div v-if="errors.type" class="invalid-feedback d-block">{{ errors.type }}</div>
                </div>

                <!-- Value -->
                <div class="col-12 col-md-4">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-123 text-primary"></i>
                    Value <span v-if="!form.id" class="text-danger">*</span>
                  </label>

                  <!-- insert -->
                  <div class="input-group" v-if="!form.id">
                    <span class="input-group-text bg-light" v-if="form.type === 'fixed_amount'">₱</span>
                    <span class="input-group-text bg-light" v-else><i class="bi bi-percent"></i></span>
                    <input
                      v-model.number="form.value"
                      :type="'number'"
                      :min="form.type === 'percent' ? 0.01 : 0"
                      :max="form.type === 'percent' ? 100 : undefined"
                      step="0.01"
                      class="form-control no-spinner"
                      :class="errors.value && 'is-invalid'"
                      :placeholder="form.type === 'percent' ? 'e.g. 10 for 10%' : 'e.g. 250.00'"
                      :required="true"
                    />
                  </div>

                  <!-- edit: display-only -->
                  <div v-else class="display-field">
                    <i class="bi bi-lock text-muted me-1"></i>
                    <template v-if="(originalDiscount && originalDiscount.type === 'percent') || form.type === 'percent'">
                      {{ formatNumber(originalDiscount?.percent_off ?? form.value ?? 0) }}%
                    </template>
                    <template v-else>
                      ₱{{ formatNumber(originalDiscount?.amount_off ?? form.value ?? 0) }}
                    </template>
                  </div>
                  <div v-if="form.id" class="form-text text-muted small">
                    Discount value can’t be changed after creation.
                  </div>
                  <div v-if="errors.value" class="invalid-feedback d-block">{{ errors.value }}</div>
                </div>

                <!-- Code -->
                <div class="col-12 col-md-4">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-upc-scan text-primary"></i>
                    Code (optional)
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="bi bi-upc"></i></span>
                    <input v-model.trim="form.code" type="text" class="form-control" placeholder="E.g., PAYDAY10" />
                  </div>
                  <div class="form-text">Unique (case-insensitive) if provided.</div>
                </div>
              </div>

              <!-- Section: Applicability -->
              <p class="text-uppercase small text-muted mb-2 fw-semibold mt-2 breath">Applicability</p>
              <div class="row g-3 mb-3 breath">
                <!-- insert: choose product -->
                <div class="col-12 col-md-6 position-relative" ref="pickerEl" v-if="!form.id">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-box-seam text-primary"></i>
                    Applicable Product
                    <span class="badge bg-body-secondary text-secondary border small">Optional</span>
                  </label>

                  <div class="input-group product-picker-trigger" @click.stop="toggleProductDropdown">
                    <span class="input-group-text bg-light"><i class="bi bi-box2"></i></span>
                    <button type="button" class="form-control d-flex align-items-center justify-content-between gap-2">
                      <div class="d-flex align-items-center gap-2 text-start">
                        <div class="picker-thumb">
                          <img v-if="selectedProduct?.signed_url" :src="selectedProduct.signed_url" alt="product" />
                          <img v-else-if="selectedProduct?.product_url && selectedProduct.product_url.length" :src="selectedProduct.product_url[0]" alt="product" />
                          <div v-else class="empty-thumb"><i class="bi bi-image text-muted"></i></div>
                        </div>
                        <div class="picker-label">
                          <span v-if="selectedProduct">{{ selectedProduct.name }}</span>
                          <span v-else class="text-muted">All products</span>
                        </div>
                      </div>
                      <i class="bi" :class="productDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                    </button>
                    <button v-if="selectedProduct" type="button" class="btn btn-outline-secondary btn-sm" @click.stop="clearProduct">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>

                  <!-- ORIGINAL in-modal dropdown kept; hidden when portal is active -->
                  <div
                    v-if="productDropdownOpen"
                    :class="['product-dropdown','shadow-sm','rounded-3', portalReady ? 'd-none' : '']"
                  >
                    <div class="product-dropdown-item" @click="selectProduct(null)">
                      <div class="picker-thumb"><div class="empty-thumb"><i class="bi bi-grid text-muted"></i></div></div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold">All products</div>
                        <div class="text-muted small">Discount will apply to any product</div>
                      </div>
                    </div>

                    <div v-for="p in products" :key="p.id" class="product-dropdown-item" @click="selectProduct(p)">
                      <div class="picker-thumb">
                        <img v-if="p.signed_url" :src="p.signed_url" alt="p" />
                        <img v-else-if="p.product_url && p.product_url.length" :src="p.product_url[0]" alt="p" />
                        <div v-else class="empty-thumb"><i class="bi bi-image text-muted"></i></div>
                      </div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold">{{ p.name }}</div>
                        <div class="text-muted small">Stock: {{ p.stock }} <span v-if="p.price">· ₱{{ formatNumber(p.price) }}</span></div>
                      </div>
                    </div>
                  </div>

                  <select v-model="form.product_id" class="d-none">
                    <option :value="null">All</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>

                <!-- edit: display-only -->
                <div class="col-12 col-md-6" v-else>
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-box-seam text-primary"></i>
                    Applicable Product
                  </label>
                  <div class="display-field">
                    <i class="bi bi-lock text-muted me-1"></i>
                    <span v-if="selectedProduct">{{ selectedProduct.name }}</span>
                    <span v-else class="text-muted">All products</span>
                  </div>
                  <div class="form-text small text-muted">Product applicability can’t be changed after creation.</div>
                </div>
              </div>

              <!-- Section: Availability & Limits -->
              <p class="text-uppercase small text-muted mb-2 fw-semibold mt-2 breath">Availability & Limits</p>

              <!-- INSERT or EDIT(DRAFT/EXPIRED/SCHEDULED): Launch mode toggle (unified) -->
              <div class="row g-3 breath" v-if="showCreateModeOptions">
                <div class="col-12">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-rocket-takeoff text-primary"></i>
                    Launch Mode
                  </label>
                  <div class="btn-group btn-group-sm" role="group" aria-label="Launch mode">
                    <input class="btn-check" type="radio" id="lm-now" value="draftactive" v-model="form.insert_kind" />
                    <label class="btn btn-outline-secondary" for="lm-now">
                      <i class="bi bi-bolt"></i> Now / Draft
                    </label>

                    <input class="btn-check" type="radio" id="lm-sched" value="scheduled" v-model="form.insert_kind" />
                    <label class="btn btn-outline-secondary" for="lm-sched">
                      <i class="bi bi-calendar-event"></i> Schedule
                    </label>
                  </div>
                </div>
              </div>

              <div class="row g-3">
                <!-- DRAFT/ACTIVE mode (insert OR edit draft/expired/scheduled choosing now) -->
                <template v-if="showCreateModeOptions && form.insert_kind === 'draftactive'">
                  <div class="col-12 col-md-4 breath">
                    <label class="form-label d-flex align-items-center gap-1">
                      <i class="bi bi-toggle-on text-primary"></i>
                      Activate on Save?
                    </label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="activateNow" v-model="form.activate_now" />
                      <label class="form-check-label" for="activateNow">
                        <span v-if="form.activate_now">Will be <strong>Active</strong> immediately</span>
                        <span v-else>Will be <strong>Draft</strong> (you can activate later)</span>
                      </label>
                    </div>
                    <div class="form-text small">Start time will be set to <strong>now</strong>.</div>
                  </div>

                  <div class="col-12 col-md-4 breath">
                    <label class="form-label d-flex align-items-center gap-1">
                      <i class="bi bi-calendar-event text-primary"></i>
                      Starts At
                    </label>
                    <div class="display-field">Will start now on save.</div>
                  </div>
                </template>

                <!-- SCHEDULED mode (insert OR edit choosing schedule) -->
                <template v-if="showCreateModeOptions && form.insert_kind === 'scheduled'">
                  <div class="col-12 col-md-6 breath">
                    <label class="form-label d-flex align-items-center gap-1">
                      <i class="bi bi-calendar-event text-primary"></i>
                      Starts At <span class="text-danger">*</span>
                    </label>
                    <div class="input-group datetime-aesthetic">
                      <span class="input-group-text bg-light"><i class="bi bi-clock"></i></span>
                      <input
                        ref="startInputRef"
                        v-model="form.starts_at"
                        type="datetime-local"
                        class="form-control"
                        :class="errors.starts_at && 'is-invalid'"
                        :min="minStart"
                        :required="true"
                      />
                    </div>
                    <div v-if="errors.starts_at" class="invalid-feedback d-block">{{ errors.starts_at }}</div>
                    <div class="form-text text-warning small">Must be a future date and time.</div>
                  </div>
                </template>

                <!-- EDITING (kept): only when not in create-mode options -->
                <template v-if="form.id && !showCreateModeOptions">
                  <div class="col-12 col-md-6 breath">
                    <label class="form-label d-flex align-items-center gap-1">
                      <i class="bi bi-calendar-event text-primary"></i>
                      Starts At
                    </label>

                    <div v-if="originalStatus === 'scheduled'" class="input-group datetime-aesthetic">
                      <span class="input-group-text bg-light"><i class="bi bi-clock"></i></span>
                      <input
                        ref="startInputRef"
                        v-model="form.starts_at"
                        type="datetime-local"
                        class="form-control"
                        :class="errors.starts_at && 'is-invalid'"
                        :min="minStart"
                        :required="true"
                      />
                    </div>
                    <div v-else class="display-field">
                      <i class="bi bi-lock text-muted me-1"></i>
                      {{ form.starts_at ? fmtDate(form.starts_at) : '—' }}
                    </div>

                    <div v-if="errors.starts_at" class="invalid-feedback d-block">{{ errors.starts_at }}</div>
                    <div class="form-text small" :class="originalStatus === 'scheduled' ? 'text-warning' : 'text-muted'">
                      <template v-if="originalStatus === 'scheduled'">
                        Start time can be changed while the discount is scheduled (must be in the future).
                      </template>
                      <template v-else>
                        Start time can’t be changed for non-scheduled discounts.
                      </template>
                    </div>
                  </div>
                </template>

                <!-- Expires At (INSERT + EDIT) -->
                <div class="col-12 col-md-6 breath">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-calendar2-x text-primary"></i>
                    Expires At <span class="text-danger">*</span>
                  </label>
                  <div class="input-group datetime-aesthetic">
                    <span class="input-group-text bg-light"><i class="bi bi-hourglass-split"></i></span>
                    <input
                      ref="expiresInputRef"
                      v-model="form.expires_at"
                      type="datetime-local"
                      class="form-control"
                      :class="errors.expires_at && 'is-invalid'"
                      :min="expiresMin"
                      :required="true"
                    />
                  </div>
                  <div v-if="errors.expires_at" class="invalid-feedback d-block">{{ errors.expires_at }}</div>
                  <div class="form-text small text-muted">Must be after the start time (or now).</div>
                </div>

                <!-- === Limits === -->

                <!-- INSERT: per-user only (no global display) -->
                <template v-if="!form.id">
                  <div class="col-12 col-md-6 breath">
                    <label class="form-label d-flex align-items-center gap-1">
                      <i class="bi bi-person-check text-primary"></i>
                      Max Uses per User <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-person-badge"></i></span>
                      <input
                        v-model.number="form.max_uses_per_user"
                        type="number"
                        min="1"
                        step="1"
                        class="form-control no-spinner"
                        :class="errors.max_uses_per_user && 'is-invalid'"
                        :required="true"
                      />
                    </div>
                    <div v-if="errors.max_uses_per_user" class="invalid-feedback d-block">{{ errors.max_uses_per_user }}</div>
                    <div class="form-text small text-muted">
                      We’ll auto-calculate Global uses as <b>per-user × total users</b> on the server.
                    </div>
                  </div>
                </template>

                <!-- EDIT: only per-user (no global input) -->
                <template v-else>
                  <div class="col-12 col-md-6 breath">
                    <label class="form-label d-flex align-items-center gap-1">
                      <i class="bi bi-person-check text-primary"></i>
                      Max Uses per User <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-person-badge"></i></span>
                      <input
                        v-model.number="form.max_uses_per_user"
                        type="number"
                        min="1"
                        step="1"
                        class="form-control no-spinner"
                        :class="errors.max_uses_per_user && 'is-invalid'"
                        :required="true"
                      />
                    </div>
                    <div v-if="errors.max_uses_per_user" class="invalid-feedback d-block">{{ errors.max_uses_per_user }}</div>
                    <div class="form-text small text-muted">
                      Global uses stays managed server-side; you can adjust per-user here.
                    </div>
                  </div>
                </template>

                <!-- Min Subtotal + Max Cap -->
                <div class="col-12 col-md-6 breath">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-cash-coin text-primary"></i>
                    Min Subtotal <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">₱</span>
                    <input
                      v-model.number="form.min_subtotal"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-control no-spinner"
                      :class="errors.min_subtotal && 'is-invalid'"
                      :required="true"
                    />
                  </div>
                  <div v-if="errors.min_subtotal" class="invalid-feedback d-block">{{ errors.min_subtotal }}</div>
                </div>

                <div class="col-12 col-md-6 breath" v-if="(form.type === 'percent') || (originalDiscount && originalDiscount.type === 'percent')">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-shield-check text-primary"></i>
                    Max Discount Cap
                    <span class="badge bg-body-secondary text-secondary border small">Optional</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light">₱</span>
                    <input
                      v-model.number="form.max_discount_amount"
                      type="number"
                      :min="0"
                      step="0.01"
                      class="form-control no-spinner"
                      :class="errors.max_discount_amount && 'is-invalid'"
                      placeholder="e.g. 150.00"
                    />
                  </div>
                  <div v-if="errors.max_discount_amount" class="invalid-feedback d-block">{{ errors.max_discount_amount }}</div>
                  <div class="form-text">
                    Optional cap (₱0 or higher). Leave blank for no cap.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer border-0 pt-0">
              <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-primary" :disabled="busy.save || !canSave" @click="save">
                <span v-if="busy.save" class="spinner-border spinner-border-sm me-2"></span>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- NEW: Portalized product dropdown (never underlaps; positioned under trigger) -->
    <teleport to="body">
      <div
        v-if="productDropdownOpen && portalReady"
        ref="portalDropdownEl"
        class="product-dropdown portal-product-dropdown shadow-sm rounded-3"
        :style="portalStyle"
        @click.stop
      >
        <div class="product-dropdown-item" @click="selectProduct(null)">
          <div class="picker-thumb"><div class="empty-thumb"><i class="bi bi-grid text-muted"></i></div></div>
          <div class="flex-grow-1">
            <div class="fw-semibold">All products</div>
            <div class="text-muted small">Discount will apply to any product</div>
          </div>
        </div>

        <div v-for="p in products" :key="p.id" class="product-dropdown-item" @click="selectProduct(p)">
          <div class="picker-thumb">
            <img v-if="p.signed_url" :src="p.signed_url" alt="p" />
            <img v-else-if="p.product_url && p.product_url.length" :src="p.product_url[0]" alt="p" />
            <div v-else class="empty-thumb"><i class="bi bi-image text-muted"></i></div>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold">{{ p.name }}</div>
            <div class="text-muted small">Stock: {{ p.stock }} <span v-if="p.price">· ₱{{ formatNumber(p.price) }}</span></div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type DbDiscount = {
  id: string
  title: string
  description: string
  code?: string | null
  type: 'percent' | 'fixed_amount'
  scope: 'order'
  percent_off?: number | null
  amount_off?: number | null
  currency: string
  min_subtotal: number
  stack: 'exclusive' | 'stackable'
  max_uses_global?: number | null
  max_uses_per_user?: number | null
  redemptions_count: number
  status: 'draft' | 'active' | 'paused' | 'scheduled' | 'expired' | 'archived'
  starts_at: string
  expires_at?: string | null
  created_at?: string
  updated_at?: string
  product_id?: string | null
  max_discount_amount?: number | null
}

type GameProduct = {
  id: string
  name: string
  product_url: string[] | null
  stock: number
  price?: number | null
  signed_url?: string | null
}

const items = ref<DbDiscount[]>([])
const products = ref<GameProduct[]>([])

const busy = ref<{
  load: boolean
  save: boolean
  deleteId: string | null
  statusId: string | null
}>({
  load: false,
  save: false,
  deleteId: null,
  statusId: null,
})

const query = ref<{ search: string; status: string; type: string; page: number; pageSize: number }>(
  {
    search: '',
    status: '',
    type: '',
    page: 1,
    pageSize: 20,
  },
)

const canPrev = ref(false)
const canNext = ref(false)

const editorEl = ref<HTMLDivElement | null>(null)
const pickerEl = ref<HTMLElement | null>(null)

/* NEW: refs for optional Flatpickr enhancement */
const startInputRef = ref<HTMLInputElement | null>(null)
const expiresInputRef = ref<HTMLInputElement | null>(null)

const originalStatus = ref<DbDiscount['status'] | null>(null)
const originalDiscount = ref<DbDiscount | null>(null)
const forcedStatus = ref<DbDiscount['status'] | null>(null)

/** Users count for auto-calculating global uses on insert */
const userCount = ref<number>(0)
async function loadUserCount(): Promise<number> {
  const { error, count } = await supabase.from('users').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('loadUserCount error', error)
    return 0
  }
  userCount.value = count || 0
  return userCount.value
}

const form = ref<
  Partial<DbDiscount> & {
    value?: number
    max_discount_amount?: number | null
    schedule_enabled?: boolean
    insert_kind?: 'draftactive' | 'scheduled'
    activate_now?: boolean
  }
>({
  type: 'percent',
  value: 0,
  status: 'draft',
  scope: 'order',
  currency: 'PHP',
  min_subtotal: 0,
  stack: 'exclusive',
  product_id: null,
  max_discount_amount: null,
  schedule_enabled: false,
  insert_kind: 'draftactive',
  activate_now: false,
})

/** ---------- REALTIME VALIDATION ---------- */
const errors = ref<Record<string, string>>({})
const canSave = computed(() => Object.keys(errors.value).length === 0)

const showCreateModeOptions = computed(() => {
  if (!form.value.id) return true
  const st = originalStatus.value
  return st === 'draft' || st === 'expired' || st === 'scheduled'
})

function validateRealtime() {
  const e: Record<string, string> = {}
  const isInsert = !form.value.id
  const isScheduledInsert = isInsert && form.value.insert_kind === 'scheduled'
  const isCreateModeEdit =
    !!form.value.id &&
    (originalStatus.value === 'draft' ||
      originalStatus.value === 'expired' ||
      originalStatus.value === 'scheduled')
  const type = (form.value.type || 'percent') as 'percent' | 'fixed_amount'

  if (!form.value.title || !form.value.title.trim()) e.title = 'Title is required.'

  if (isInsert) {
    if (!form.value.type) e.type = 'Type is required.'
    if (
      form.value.value === null ||
      form.value.value === undefined ||
      String(form.value.value) === ''
    ) {
      e.value = 'Value is required.'
    } else {
      const v = Number(form.value.value)
      if (type === 'percent') {
        if (!Number.isFinite(v) || v <= 0 || v > 100) e.value = 'Percentage must be > 0 and ≤ 100.'
      } else {
        if (!Number.isFinite(v) || v < 0) e.value = 'Fixed amount must be ≥ 0.'
      }
    }
  }

  const ms = Number(form.value.min_subtotal)
  if (!Number.isFinite(ms) || ms < 0) e.min_subtotal = 'Min subtotal must be ≥ 0.'

  if (
    (isInsert && type === 'percent') ||
    (!isInsert && originalDiscount.value?.type === 'percent')
  ) {
    const cap = form.value.max_discount_amount
    if (cap !== null && cap !== undefined && String(cap) !== '') {
      const capNum = Number(cap)
      if (!Number.isFinite(capNum) || capNum < 0)
        e.max_discount_amount = 'Max discount cap must be ≥ 0.'
    }
  }

  if (isInsert) {
    const u = Number(form.value.max_uses_per_user)
    if (!Number.isInteger(u) || u < 1) e.max_uses_per_user = 'Per-user must be an integer ≥ 1.'
  } else {
    const g = Number(form.value.max_uses_global ?? originalDiscount.value?.max_uses_global)
    const u = Number(form.value.max_uses_per_user ?? originalDiscount.value?.max_uses_per_user)
    if (!Number.isInteger(g) || g < 1) e.max_uses_global = 'Global uses must be an integer ≥ 1.'
    if (!Number.isInteger(u) || u < 1) e.max_uses_per_user = 'Per-user must be an integer ≥ 1.'
    if (!e.max_uses_global && !e.max_uses_per_user) {
      if (u >= g) e.max_uses_per_user = 'Per-user must be < Global uses.'
    }
  }

  const now = new Date()
  const toDate = (v?: string | null) => (v ? new Date(v) : null)
  const startLocal = toDate(form.value.starts_at as string)
  const expLocal = toDate(form.value.expires_at as string)

  const treatAsScheduled =
    isScheduledInsert ||
    (!isInsert &&
      originalStatus.value === 'scheduled' &&
      (!showCreateModeOptions.value || form.value.insert_kind === 'scheduled')) ||
    (isCreateModeEdit && form.value.insert_kind === 'scheduled')

  if (treatAsScheduled) {
    if (!startLocal) e.starts_at = 'Start date/time is required.'
    else if (startLocal.getTime() <= now.getTime()) e.starts_at = 'Start must be in the future.'
  }

  if (!expLocal) {
    e.expires_at = 'Expiry date/time is required.'
  } else {
    const base = treatAsScheduled ? (startLocal ?? now) : now
    if (expLocal.getTime() <= base.getTime()) e.expires_at = 'Expiry must be after the start time.'
  }

  errors.value = e
}

watch(
  () => [
    form.value.title,
    form.value.type,
    form.value.value,
    form.value.min_subtotal,
    form.value.max_discount_amount,
    form.value.max_uses_global,
    form.value.max_uses_per_user,
    form.value.starts_at,
    form.value.expires_at,
    form.value.insert_kind,
    originalStatus.value,
  ],
  () => validateRealtime(),
  { immediate: true },
)
/** ---------- END REALTIME VALIDATION ---------- */

const PRODUCT_BUCKET = 'prize_product'
const PRODUCT_ROOT = 'products'

function isImageByName(name: string | undefined | null) {
  if (!name) return false
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(name)
}

async function signedUrlWithCB(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) return null
  const url = data?.signedUrl ?? null
  return url ? `${url}&cb=${Date.now()}` : null
}

async function firstImagePathForProduct(productId: string): Promise<string | null> {
  try {
    const dir = `${PRODUCT_ROOT}/${productId}`
    const { data: files, error: listErr } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .list(dir, { limit: 10 })
    if (listErr || !files || files.length === 0) return null
    const candidate =
      files.find((f: any) => (f?.metadata?.mimetype || '').startsWith('image/')) ||
      files.find((f: any) => isImageByName(f?.name)) ||
      files[0]
    if (!candidate?.name) return null
    return `${dir}/${candidate.name}`
  } catch {
    return null
  }
}

async function attachProductSignedUrls(list: GameProduct[]) {
  if (!list || !list.length) return
  await Promise.all(
    list.map(async (p) => {
      if (p.product_url && p.product_url.length && /^https?:\/\//i.test(p.product_url[0] || '')) {
        p.signed_url = p.product_url[0]
        return
      }
      const path = await firstImagePathForProduct(p.id)
      const signed = path ? await signedUrlWithCB(PRODUCT_BUCKET, path) : null
      p.signed_url = signed || null
    }),
  )
}

const selectedProduct = computed(() => {
  if (!form.value.product_id) return null
  return products.value.find((p) => p.id === form.value.product_id) || null
})

const productDropdownOpen = ref(false)

function toggleProductDropdown() {
  productDropdownOpen.value = !productDropdownOpen.value
  if (productDropdownOpen.value) nextTick(() => positionPortalDropdown())
}

function selectProduct(p: GameProduct | null) {
  form.value.product_id = p ? p.id : null
  productDropdownOpen.value = false
}
function clearProduct() { form.value.product_id = null; productDropdownOpen.value = false }

function formatNumber(n: number | undefined | null) {
  if (n == null || Number.isNaN(n)) return '0'
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(n)
}
function fmtDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('en-PH', { hour12: true })
}
function uiTypeLabel(t: DbDiscount['type']) {
  return t === 'percent' ? 'Percent' : 'Fixed amount'
}

// FIXED: Respect explicit statuses first so archived/paused/draft don't get overridden by expiry
function computedStatusRaw(d: DbDiscount) {
  // Highest priority: explicit states that should not be remapped
  if (d.status === 'archived') return 'archived'
  if (d.status === 'paused') return 'paused'
  if (d.status === 'draft') return 'draft'
  if (d.status === 'scheduled') return 'scheduled'
  if (d.status === 'expired') return 'expired'
  if (d.status === 'active') {
    const nowIso = new Date().toISOString()
    if (d.expires_at && d.expires_at < nowIso) return 'expired'
    return 'active'
  }
  return d.status
}
function cardStatus(d: DbDiscount) {
  return computedStatusRaw(d)
}
function badgeClass(status: string) {
  switch (status) {
    case 'active':
      return 'text-bg-success'
    case 'draft':
    case 'scheduled':
      return 'text-bg-secondary'
    case 'paused':
      return 'text-bg-warning'
    case 'archived':
      return 'text-bg-dark'
    case 'expired':
      return 'text-bg-danger'
    default:
      return 'text-bg-secondary'
  }
}

/** local datetime to ISO */
function localToISO(dt?: string | null) {
  if (!dt) return null
  const local = new Date(dt)
  return local.toISOString()
}
/** local input string "YYYY-MM-DDTHH:MM" */
function createLocalInputFromDate(d: Date) {
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}
/** min for scheduled start */
const minStart = ref<string>(createLocalInputFromDate(new Date()))
/** expires min: after starts_at or now */
const expiresMin = computed(() => {
  if (form.value.starts_at) return form.value.starts_at as string
  return createLocalInputFromDate(new Date())
})
/** (kept) old computed; no longer used for :min attr to allow any non-negative cap */
const capMinString = computed(() => {
  const ms = Number(form.value.min_subtotal ?? 0)
  const capMin = (Number.isFinite(ms) ? ms : 0) + 0.01
  return capMin.toFixed(2)
})

/** Sections */
const scheduledItems = computed(() => items.value.filter((d) => cardStatus(d) === 'scheduled'))
const activeItems = computed(() => items.value.filter((d) => cardStatus(d) === 'active'))
const expiredItems = computed(() => items.value.filter((d) => cardStatus(d) === 'expired'))
const pausedItems = computed(() => items.value.filter((d) => cardStatus(d) === 'paused'))
const draftItems = computed(() => items.value.filter((d) => cardStatus(d) === 'draft'))
const archivedItems = computed(() => items.value.filter((d) => cardStatus(d) === 'archived'))

/** NEW: Tab + Archived toggle */
const activeTab = ref<'active' | 'scheduled' | 'expired' | 'all'>('active')
const showArchived = ref(false)

const filteredByTab = computed<DbDiscount[]>(() => {
  switch (activeTab.value) {
    case 'active':
      return activeItems.value
    case 'scheduled':
      return scheduledItems.value
    case 'expired':
      return expiredItems.value
    case 'all':
      return items.value
    default:
      return items.value
  }
})

/** Insert view: show calculated global (internal only, not displayed) */
const calcGlobal = computed(() => {
  const per = Number(form.value.max_uses_per_user || 0)
  const users = Number(userCount.value || 0)
  const g = per * users
  return Number.isFinite(g) && g >= 0 ? g : 0
})

function roundTo2(n: number) {
  return Math.round(n * 100) / 100
}
function numberOrZero(n: any) {
  const num = Number(n)
  if (Number.isNaN(num)) return 0
  return Math.max(0, Math.round(num * 100) / 100)
}
function asNonNegIntOrThrow(v: any, label: string) {
  if (v === null || v === undefined || v === '') throw new Error(`${label} is required.`)
  const num = Number(v)
  if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num))
    throw new Error(`${label} must be a non-negative integer.`)
  return num
}
function ensureNonNegNumberOrThrow(v: any, label: string) {
  if (v === null || v === undefined || v === '') throw new Error(`${label} is required.`)
  const num = Number(v)
  if (!Number.isFinite(num) || num < 0) throw new Error(`${label} must be 0 or greater.`)
  return Math.round(num * 100) / 100
}
function isPgUniqueViolation(err: any) {
  return (
    err &&
    (err.code === '23505' ||
      (err.message && /duplicate key value|uq_rewards_discounts_code_lower/i.test(err.message)))
  )
}
function alertReadableError(e: any) {
  if (isPgUniqueViolation(e)) {
    alert(
      'A discount with the same CODE already exists (case-insensitive). Please choose a different code.',
    )
    return
  }
  if (e?.message) alert(e.message)
  else alert('Something went wrong. Check console for details.')
}

function buildPayload(
  input: Partial<DbDiscount> & {
    value?: number
    max_discount_amount?: number | null
    insert_kind?: 'draftactive' | 'scheduled'
    activate_now?: boolean
  },
  prevStatus: DbDiscount['status'] | null,
  computedGlobal?: number,
) {
  const isNew = !input.id

  if (!input.title || input.title.trim() === '') throw new Error('Title is required.')

  if (isNew) {
    const t: 'percent' | 'fixed_amount' = input.type || 'percent'
    if (!t) throw new Error('Type is required.')
    if (input.value === undefined || input.value === null || String(input.value) === '')
      throw new Error('Value is required.')

    let percent_off: number | null = null
    let amount_off: number | null = null
    let max_discount_amount: number | null = null

    if (t === 'percent') {
      const v = Number(input.value)
      if (!Number.isFinite(v) || v <= 0 || v > 100)
        throw new Error('Percentage must be greater than 0 and at most 100.')
      percent_off = roundTo2(v)
      if (input.max_discount_amount != null && !Number.isNaN(input.max_discount_amount)) {
        const cap = Number(input.max_discount_amount)
        if (cap < 0) throw new Error('Max Discount Cap must be ≥ 0.')
        max_discount_amount = roundTo2(cap)
      } else max_discount_amount = null
    } else {
      const v = Number(input.value)
      if (!Number.isFinite(v) || v < 0) throw new Error('Fixed amount must be 0 or greater.')
      amount_off = roundTo2(v)
      max_discount_amount = null
    }

    const min_subtotal = ensureNonNegNumberOrThrow(input.min_subtotal, 'Min Subtotal')

    const perUser = asNonNegIntOrThrow(input.max_uses_per_user, 'Max Uses per User')
    if (perUser < 1) throw new Error('Max Uses per User must be at least 1.')

    const max_uses_global = Math.max(0, Number(computedGlobal ?? 0))
    if (!Number.isFinite(max_uses_global) || max_uses_global < perUser) {
      throw new Error('Calculated Global uses is invalid. Please try again.')
    }

    let nextStatus: DbDiscount['status']
    let startsIso: string | null = null
    const nowIso = new Date().toISOString()

    if (input.insert_kind === 'scheduled') {
      nextStatus = 'scheduled'
      if (!input.starts_at) throw new Error('Start date/time is required for scheduled discounts.')
      startsIso = localToISO(input.starts_at)
      const now = new Date()
      const sdate = startsIso ? new Date(startsIso) : null
      if (!sdate || sdate.getTime() <= now.getTime())
        throw new Error('Scheduled start date/time must be in the future (>= now).')
    } else {
      nextStatus = input.activate_now ? 'active' : 'draft'
      startsIso = nowIso
    }

    const expiresIso = input.expires_at ? localToISO(input.expires_at) : null
    if (!expiresIso) throw new Error('Expiry date/time is required.')
    const baseForExpiry = startsIso ? new Date(startsIso) : new Date()
    if (new Date(expiresIso).getTime() <= baseForExpiry.getTime()) {
      throw new Error('Expiry must be after the start time.')
    }

    const payload: any = {
      title: (input.title ?? '').trim(),
      description: (input.description ?? '').trim(),
      code: input.code ? input.code.trim() : null,
      type: t,
      scope: 'order',
      percent_off,
      amount_off,
      currency: 'PHP',
      min_subtotal,
      stack: 'exclusive',
      max_uses_global,
      max_uses_per_user: perUser,
      status: nextStatus,
      starts_at: startsIso,
      expires_at: expiresIso,
      product_id: input.product_id ? input.product_id.trim() : null,
      max_discount_amount,
    }
    return payload
  }

  const orig = originalDiscount.value
  if (!orig) throw new Error('Original discount not found for editing.')

  const min_subtotal = ensureNonNegNumberOrThrow(
    input.min_subtotal ?? orig.min_subtotal,
    'Min Subtotal',
  )
  const g = asNonNegIntOrThrow(input.max_uses_global ?? orig.max_uses_global, 'Max Uses (Global)')
  const perUser = asNonNegIntOrThrow(
    input.max_uses_per_user ?? orig.max_uses_per_user,
    'Max Uses per User',
  )
  if (perUser < 1) throw new Error('Max Uses per User must be at least 1.')
  if (perUser >= g) throw new Error('Max Uses (Global) must be greater than Max Uses per User.')

  const payload: any = {
    title: (input.title ?? orig.title).trim(),
    description: (input.description ?? orig.description).trim(),
    code: input.code !== undefined ? (input.code ? input.code.trim() : null) : (orig.code ?? null),
    min_subtotal,
    max_uses_global: g,
    max_uses_per_user: perUser,
    type: orig.type,
    scope: 'order',
    percent_off: orig.percent_off ?? null,
    amount_off: orig.amount_off ?? null,
    currency: orig.currency,
    stack: orig.stack,
    status: orig.status,
    starts_at: orig.starts_at,
    product_id: orig.product_id ?? null,
  }

  const now = new Date()

  if (prevStatus === 'scheduled') {
    if (!input.insert_kind || input.insert_kind === undefined) {
      payload.status = 'scheduled'
      if (!input.starts_at)
        throw new Error('Start date/time is required while discount is scheduled.')
      const startsIso = localToISO(input.starts_at)
      const sdate = startsIso ? new Date(startsIso) : null
      if (!sdate || sdate.getTime() <= now.getTime())
        throw new Error('Scheduled start date/time must be in the future (>= now).')
      payload.starts_at = startsIso
    } else if (input.insert_kind === 'scheduled') {
      payload.status = 'scheduled'
      if (!input.starts_at) throw new Error('Start date/time is required for scheduled discounts.')
      const startsIso = localToISO(input.starts_at)
      const sdate = startsIso ? new Date(startsIso) : null
      if (!sdate || sdate.getTime() <= now.getTime())
        throw new Error('Scheduled start date/time must be in the future (>= now).')
      payload.starts_at = startsIso
    } else if (input.insert_kind === 'draftactive') {
      payload.status = input.activate_now ? 'active' : 'draft'
      payload.starts_at = new Date().toISOString()
    }
  }

  if (prevStatus === 'draft' || prevStatus === 'expired') {
    if (input.insert_kind === 'scheduled') {
      payload.status = 'scheduled'
      if (!input.starts_at) throw new Error('Start date/time is required for scheduled discounts.')
      const startsIso = localToISO(input.starts_at)
      const sdate = startsIso ? new Date(startsIso) : null
      if (!sdate || sdate.getTime() <= now.getTime())
        throw new Error('Scheduled start date/time must be in the future (>= now).')
      payload.starts_at = startsIso
    } else {
      if (input.activate_now) {
        payload.status = 'active'
      } else {
        payload.status = 'draft'
      }
      payload.starts_at = new Date().toISOString()
    }
  }

  const expiresIso = input.expires_at ? localToISO(input.expires_at) : null
  if (!expiresIso) throw new Error('Expiry date/time is required.')
  const baseForExpiry =
    prevStatus === 'scheduled' && input.insert_kind !== 'draftactive' && input.starts_at
      ? new Date(localToISO(input.starts_at) as string)
      : (prevStatus === 'draft' || prevStatus === 'expired') &&
          input.insert_kind === 'scheduled' &&
          input.starts_at
        ? new Date(localToISO(input.starts_at) as string)
        : new Date()
  if (new Date(expiresIso).getTime() <= baseForExpiry.getTime()) {
    throw new Error('Expiry must be after the start time.')
  }
  payload.expires_at = expiresIso

  if (orig.type === 'percent') {
    if (input.max_discount_amount != null && !Number.isNaN(input.max_discount_amount)) {
      const cap = Number(input.max_discount_amount)
      if (cap < 0) throw new Error('Max Discount Cap must be ≥ 0.')
      payload.max_discount_amount = roundTo2(cap)
    } else payload.max_discount_amount = null
  } else {
    payload.max_discount_amount = null
  }

  if (!payload.title) throw new Error('Title is required.')
  return payload
}

async function save() {
  validateRealtime()
  if (!canSave.value) return

  busy.value.save = true
  try {
    let computedGlobal: number | undefined = undefined
    const isInsert = !form.value.id
    if (isInsert) {
      const users = await loadUserCount()
      const per = asNonNegIntOrThrow(form.value.max_uses_per_user, 'Max Uses per User')
      computedGlobal = Math.max(0, per * users)
    }

    const payload = buildPayload(form.value, originalStatus.value, computedGlobal)
    let res
    if (form.value.id) {
      const id = form.value.id
      res = await supabase
        .schema('rewards')
        .from('discounts')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
    } else {
      res = await supabase.schema('rewards').from('discounts').insert(payload).select().single()
    }
    if (res.error) throw res.error

    await load()
    // @ts-ignore
    const bs = (window as any).bootstrap
    if (bs && editorEl.value) {
      const m = bs.Modal.getOrCreateInstance(editorEl.value)
      m.hide()
    }
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.save = false
  }
}

async function activateDiscount(d: DbDiscount) {
  if (!d.id) return
  busy.value.statusId = d.id
  try {
    const { error } = await supabase
      .schema('rewards')
      .from('discounts')
      .update({ status: 'active', starts_at: new Date().toISOString() })
      .eq('id', d.id)
    if (error) throw error
    const idx = items.value.findIndex((x) => x.id === d.id)
    if (idx >= 0) {
      items.value[idx] = {
        ...items.value[idx],
        status: 'active',
        starts_at: new Date().toISOString(),
      }
    }
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.statusId = null
  }
}

async function pauseDiscount(d: DbDiscount) {
  if (!d.id) return
  busy.value.statusId = d.id
  try {
    const { error } = await supabase
      .schema('rewards')
      .from('discounts')
      .update({ status: 'paused' })
      .eq('id', d.id)
    if (error) throw error
    const idx = items.value.findIndex((x) => x.id === d.id)
    if (idx >= 0) {
      items.value[idx] = { ...items.value[idx], status: 'paused' }
    }
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.statusId = null
  }
}

async function archiveDiscount(d: DbDiscount) {
  if (!d.id) return
  busy.value.statusId = d.id
  try {
    const { error } = await supabase
      .schema('rewards')
      .from('discounts')
      .update({ status: 'archived' })
      .eq('id', d.id)
    if (error) throw error
    const idx = items.value.findIndex((x) => x.id === d.id)
    if (idx >= 0) {
      items.value[idx] = { ...items.value[idx], status: 'archived' }
    }
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.statusId = null
  }
}

async function restoreDiscount(d: DbDiscount) {
  if (!d.id) return
  busy.value.statusId = d.id
  try {
    const { error } = await supabase
      .schema('rewards')
      .from('discounts')
      .update({ status: 'draft' })
      .eq('id', d.id)
    if (error) throw error
    const idx = items.value.findIndex((x) => x.id === d.id)
    if (idx >= 0) {
      items.value[idx] = { ...items.value[idx], status: 'draft' }
    }
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.statusId = null
  }
}

async function renewDiscount(d: DbDiscount) {
  openEditor(d)
}

async function remove(d: DbDiscount) {
  if (computedStatusRaw(d) === 'active') return
  if (!confirm(`Delete discount "${d.title}"?`)) return
  busy.value.deleteId = d.id
  try {
    const { error } = await supabase.schema('rewards').from('discounts').delete().eq('id', d.id)
    if (error) throw error
    await load()
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.deleteId = null
  }
}

// ====== Outside click handler (now respects portal dropdown too) ======
const portalDropdownEl = ref<HTMLElement | null>(null)
function onWindowClick(e: Event) {
  const target = e.target as HTMLElement
  const el = pickerEl.value
  const portal = portalDropdownEl.value
  if (!el) return
  const clickedInsidePicker = el.contains(target)
  const clickedInsidePortal = portal ? portal.contains(target) : false
  if (!clickedInsidePicker && !clickedInsidePortal) productDropdownOpen.value = false
}

/* Optional Flatpickr enhancement — only runs if window.flatpickr exists */
function setupFlatpickr() {
  const w = window as any
  if (!w || !w.flatpickr) return
  const cfg = {
    enableTime: true,
    dateFormat: 'Y-m-d\\TH:i',
    altInput: true,
    altFormat: 'M j, Y — h:i K',
    time_24hr: false,
    allowInput: true,
    clickOpens: true,
  }
  if (startInputRef.value) {
    if ((startInputRef.value as any)._flatpickr) (startInputRef.value as any)._flatpickr.destroy()
    w.flatpickr(startInputRef.value, cfg)
  }
  if (expiresInputRef.value) {
    if ((expiresInputRef.value as any)._flatpickr)
      (expiresInputRef.value as any)._flatpickr.destroy()
    w.flatpickr(expiresInputRef.value, cfg)
  }
}

async function load() {
  busy.value.load = true
  try {
    let q = supabase
      .schema('rewards')
      .from('discounts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    if (query.value.search) {
      const s = `%${query.value.search}%`
      q = q.or(`title.ilike.${s},code.ilike.${s}`)
    }
    if (query.value.status) {
      q = q.eq('status', query.value.status)
    }
    if (query.value.type) {
      q = q.eq('type', query.value.type)
    }
    const from = (query.value.page - 1) * query.value.pageSize
    const to = from + query.value.pageSize - 1
    q = q.range(from, to)

    const { data, error, count } = await q
    if (error) throw error

    items.value = ((data || []) as DbDiscount[]).filter(
      (d) => d.type === 'percent' || d.type === 'fixed_amount',
    )
    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / query.value.pageSize))
    canPrev.value = query.value.page > 1
    canNext.value = query.value.page < totalPages
  } catch (e) {
    console.error(e)
    alertReadableError(e)
  } finally {
    busy.value.load = false
  }
}

async function loadProducts() {
  try {
    const { data, error } = await supabase
      .schema('games')
      .from('products')
      .select('id,name,product_url,stock,price')
      .gt('stock', 0)
      .order('name', { ascending: true })
    if (error) throw error
    const rows = (data || []) as GameProduct[]
    await attachProductSignedUrls(rows)
    products.value = rows
  } catch (e) {
    console.error('loadProducts error', e)
    products.value = []
  }
}

function prev() {
  if (!canPrev.value) return
  query.value.page -= 1
  load()
}
function next() {
  if (!canNext.value) return
  query.value.page += 1
  load()
}

/** New unified insert opener */
function openInsertUnified() {
  originalDiscount.value = null
  originalStatus.value = null
  form.value = {
    type: 'percent',
    value: 0,
    status: 'draft',
    title: '',
    description: '',
    code: '',
    starts_at: '',
    expires_at: '',
    scope: 'order',
    currency: 'PHP',
    min_subtotal: 0,
    stack: 'exclusive',
    max_uses_global: null,
    max_uses_per_user: null,
    product_id: null,
    max_discount_amount: null,
    insert_kind: 'draftactive',
    activate_now: false,
  }
  minStart.value = createLocalInputFromDate(new Date())
  validateRealtime()
  showEditor()
}

/** (kept) original insert helpers in case you still use them elsewhere */
function openInsertDraftActive() {
  originalDiscount.value = null
  originalStatus.value = null
  form.value = {
    type: 'percent',
    value: 0,
    status: 'draft',
    title: '',
    description: '',
    code: '',
    starts_at: '',
    expires_at: '',
    scope: 'order',
    currency: 'PHP',
    min_subtotal: 0,
    stack: 'exclusive',
    max_uses_global: null,
    max_uses_per_user: null,
    product_id: null,
    max_discount_amount: null,
    insert_kind: 'draftactive',
    activate_now: false,
  }
  validateRealtime()
  showEditor()
}

function openInsertScheduled() {
  originalDiscount.value = null
  originalStatus.value = null
  form.value = {
    type: 'percent',
    value: 0,
    status: 'scheduled',
    title: '',
    description: '',
    code: '',
    starts_at: createLocalInputFromDate(new Date(Date.now() + 5 * 60 * 1000)),
    expires_at: '',
    scope: 'order',
    currency: 'PHP',
    min_subtotal: 0,
    stack: 'exclusive',
    max_uses_global: null,
    max_uses_per_user: null,
    product_id: null,
    max_discount_amount: null,
    insert_kind: 'scheduled',
    activate_now: false,
  }
  minStart.value = createLocalInputFromDate(new Date())
  validateRealtime()
  showEditor()
}

function openEditor(d?: DbDiscount) {
  if (d && computedStatusRaw(d) === 'active') {
    alert('Pause this discount first before editing.')
    return
  }
  forcedStatus.value = null

  if (d) {
    originalDiscount.value = d
    form.value = {
      ...d,
      value:
        d.type === 'percent'
          ? (d.percent_off ?? undefined)
          : d.type === 'fixed_amount'
            ? (d.amount_off ?? undefined)
            : undefined,
      product_id: d.product_id ?? null,
      max_discount_amount: d.max_discount_amount ?? null,
      starts_at: d.starts_at ? createLocalInputFromDate(new Date(d.starts_at)) : '',
      expires_at: d.expires_at ? createLocalInputFromDate(new Date(d.expires_at)) : '',
      insert_kind:
        d.status === 'scheduled'
          ? 'scheduled'
          : d.status === 'draft' || d.status === 'expired'
            ? 'draftactive'
            : undefined,
      activate_now: false,
    }
    originalStatus.value = d.status
  } else {
    openInsertUnified()
    return
  }
  minStart.value = createLocalInputFromDate(new Date())
  validateRealtime()
  showEditor()
}

function showEditor() {
  // Ensure any local dropdown isn’t sitting above the modal
  productDropdownOpen.value = false

  // @ts-ignore
  const bs = (window as any).bootstrap
  if (bs && editorEl.value) {
    const m = bs.Modal.getOrCreateInstance(editorEl.value)
    m.show()
  }
  nextTick(() => setupFlatpickr())
}

/* ====== PORTAL DROPDOWN POSITIONING ====== */
const portalReady = ref(true) // enable portalized dropdown
const portalRect = ref<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })
const portalStyle = computed(() => ({
  top: `${portalRect.value.top}px`,
  left: `${portalRect.value.left}px`,
  width: `${portalRect.value.width}px`,
}))

function positionPortalDropdown() {
  try {
    const container = pickerEl.value
    if (!container) return
    const trigger = container.querySelector('.product-picker-trigger') as HTMLElement | null
    if (!trigger) return
    const r = trigger.getBoundingClientRect()
    const scrollX = window.scrollX || window.pageXOffset
    const scrollY = window.scrollY || window.pageYOffset
    const GAP = 4
    portalRect.value = {
      top: r.bottom + scrollY + GAP,
      left: r.left + scrollX,
      width: r.width,
    }
  } catch (e) {
    console.warn('positionPortalDropdown failed', e)
  }
}

function onAnyScrollOrResize() {
  if (productDropdownOpen.value && portalReady.value) positionPortalDropdown()
}

onMounted(async () => {
  await Promise.all([load(), loadProducts(), loadUserCount()])
  minStart.value = createLocalInputFromDate(new Date())
  validateRealtime()
  window.addEventListener('click', onWindowClick, true)
  window.addEventListener('scroll', onAnyScrollOrResize, true)
  window.addEventListener('resize', onAnyScrollOrResize, { passive: true })
  nextTick(() => setupFlatpickr())
})
onBeforeUnmount(() => {
  window.removeEventListener('click', onWindowClick, true)
  window.removeEventListener('scroll', onAnyScrollOrResize, true)
  window.removeEventListener('resize', onAnyScrollOrResize as any)
})
</script>

<style scoped>
.discounts-page {
  background: radial-gradient(circle at top, rgba(4, 156, 222, 0.05), transparent 50%), #f8fafc;
  min-height: 100vh;

  /* UPDATED: subtle "breath-in" on first paint (1000ms) */
  animation: breath-in 500ms ease-out both;
  will-change: transform, opacity;
}
@keyframes breath-in {
  0% {
    opacity: 0;
    transform: translateY(4px) scale(0.985);
    filter: blur(0.3px);
  }
  60% {
    opacity: 1;
    transform: translateY(0) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .discounts-page,
  .breath,
  .modern-card,
  .skeleton {
    animation: none !important;
  }
}

.breath { animation: breath-in 500ms ease-out both; }
.breath-delay-1 { animation-delay: .05s; }
.breath-delay-2 { animation-delay: .1s; }
.breath-delay-3 { animation-delay: .15s; }

.filters-card,
.list-card {
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

/* ================== NEW minimalist nav pills ================== */
.disc-tabs .pill {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  color: #0f172a;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    transform 0.05s ease,
    background 0.2s ease;
}
.disc-tabs .pill .count {
  background: #f1f5f9;
  border: 1px solid rgba(15, 23, 42, 0.06);
  padding: 0.05rem 0.35rem;
  border-radius: 0.6rem;
  font-size: 0.75rem;
}
.disc-tabs .pill.active {
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  border-color: rgba(59, 130, 246, 0.35);
}
.disc-tabs .pill:active {
  transform: translateY(1px);
}

/* Stagger the card entrances per row (1000ms) */
.row.g-3 > [class*='col-'] .modern-card {
  animation: breath-in 500ms ease-out both;
}
.row.g-3 > [class*='col-']:nth-child(1) .modern-card {
  animation-delay: 0.02s;
}
.row.g-3 > [class*='col-']:nth-child(2) .modern-card {
  animation-delay: 0.04s;
}
.row.g-3 > [class*='col-']:nth-child(3) .modern-card {
  animation-delay: 0.06s;
}
.row.g-3 > [class*='col-']:nth-child(4) .modern-card {
  animation-delay: 0.08s;
}
.row.g-3 > [class*='col-']:nth-child(5) .modern-card {
  animation-delay: 0.1s;
}
.row.g-3 > [class*='col-']:nth-child(6) .modern-card {
  animation-delay: 0.12s;
}
.row.g-3 > [class*='col-']:nth-child(7) .modern-card {
  animation-delay: 0.14s;
}
.row.g-3 > [class*='col-']:nth-child(8) .modern-card {
  animation-delay: 0.16s;
}
.row.g-3 > [class*='col-']:nth-child(9) .modern-card {
  animation-delay: 0.18s;
}
.row.g-3 > [class*='col-']:nth-child(10) .modern-card {
  animation-delay: 0.2s;
}
.row.g-3 > [class*='col-']:nth-child(11) .modern-card {
  animation-delay: 0.22s;
}
.row.g-3 > [class*='col-']:nth-child(12) .modern-card {
  animation-delay: 0.24s;
}

.discount-grid {
  --gap: 1rem;
}
.discount-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 1.25rem;
  padding: 1rem 1.05rem 0.75rem;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.03);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  min-height: 12rem;
  position: relative;
}
.discount-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.modern-card{ border-radius: 1.1rem; animation: breath-in 500ms ease-out both; }
.modern-card .badge{ text-transform: lowercase; }

.value-bubble {
  width: 70px;
  height: 70px;
  border-radius: 1.1rem;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  background: #e2e8f0;
}
.value-bubble.percent {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.18), rgba(203, 213, 225, 0));
  border: 1px solid rgba(59, 130, 246, 0.15);
}
.value-bubble.amount {
  background: radial-gradient(circle, rgba(22, 163, 74, 0.16), rgba(203, 213, 225, 0));
  border: 1px solid rgba(22, 163, 74, 0.18);
}

.title-text {
  max-width: 13rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.small-badge {
  font-size: 0.6rem;
}

/* Modal */
.editor-modal {
  border-radius: 1.5rem;
  overflow: hidden;
  background: #fff;
}
.editor-modal .modal-body {
  background: radial-gradient(circle at top, rgba(4, 156, 222, 0.04), transparent 55%), #fff;
}

.display-field {
  padding: 0.5rem 0.75rem;
  border: 1px dashed rgba(15, 23, 42, 0.12);
  background: #f8fafc;
  border-radius: 0.75rem;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.bg-soft {
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

/* Product dropdown */
.product-picker-trigger {
  cursor: pointer;
}
.product-dropdown {
  position: absolute;
  z-index: 70;
  background: #fff;
  max-height: 230px;
  overflow-y: auto;
  width: 100%;
  margin-top: 4px;
  border: 1px solid rgba(15, 23, 42, 0.07);
}
.product-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
  transition: background 0.15s ease;
}
.product-dropdown-item:hover {
  background: rgba(4, 156, 222, 0.04);
}
.picker-thumb {
  width: 38px;
  height: 38px;
  border-radius: 0.55rem;
  overflow: hidden;
  background: #f1f5f9;
  flex: 0 0 auto;
}
.picker-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.empty-thumb {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 1rem;
}

/* Skeleton */
.skeleton { 
  background: linear-gradient(120deg, #edf2f7 25%, #e2e8f0 37%, #edf2f7 63%); 
  background-size: 400% 100%; 
  animation: shimmer 1.6s ease infinite, breath-in 500ms ease-out both;
  border-radius: 1.25rem; 
  min-height: 10rem; 
  padding: 1rem; 
}
.skeleton-line {
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
}
.skeleton-pill {
  height: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 9999px;
}
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

input[type='number'].no-spinner::-webkit-outer-spin-button,
input[type='number'].no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'].no-spinner {
  appearance: textfield;
}

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.tiny-text {
  font-size: 0.625rem;
}

/* Toggle */
.toggle-wrap .pretty-switch {
  width: 44px;
  height: 24px;
  background-color: #e2e8f0;
  border: none;
  position: relative;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.toggle-wrap .pretty-switch:focus {
  box-shadow: none;
  outline: 0;
}
.toggle-wrap .pretty-switch::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  left: 3px;
  top: 3px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}
.toggle-wrap .pretty-switch:checked {
  background: linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(14, 165, 233, 1) 100%);
}
.toggle-wrap .pretty-switch:checked::before {
  transform: translateX(20px);
}

/* hide native picker in general (kept) */
input[type='date']::-webkit-calendar-picker-indicator,
input[type='datetime-local']::-webkit-calendar-picker-indicator,
input[type='time']::-webkit-calendar-picker-indicator {
  display: none !important;
}

/* Minimalist datetime styling */
.datetime-aesthetic input[type='datetime-local'] {
  appearance: none;
  height: 38px;
  border-radius: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  padding: 0.375rem 0.75rem;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.datetime-aesthetic input[type='datetime-local']:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.15);
  background: #ffffff;
}

/* Re-show indicator inside the aesthetic wrapper */
.datetime-aesthetic input[type='date']::-webkit-calendar-picker-indicator,
.datetime-aesthetic input[type='datetime-local']::-webkit-calendar-picker-indicator,
.datetime-aesthetic input[type='time']::-webkit-calendar-picker-indicator {
  display: inline-block !important;
  opacity: 0.65;
  cursor: pointer;
  margin-left: 0.25rem;
  filter: grayscale(1);
  transition:
    opacity 0.15s ease,
    filter 0.2s ease,
    transform 0.2s ease;
}
.datetime-aesthetic input[type='datetime-local']:hover::-webkit-calendar-picker-indicator {
  opacity: 0.95;
  filter: none;
  transform: scale(1.05);
}

/* consistent datetime text layout */
.datetime-aesthetic input[type='datetime-local']::-webkit-datetime-edit {
  padding: 0 0.1rem;
}
.datetime-aesthetic input[type='datetime-local']::-webkit-datetime-edit-fields-wrapper {
  letter-spacing: 0.02em;
}
.datetime-aesthetic input[type='datetime-local']::-webkit-datetime-edit-text {
  opacity: 0.6;
}

/* soft empty */
.empty-soft {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.6), rgba(255, 255, 255, 0.6));
  border: 1px dashed rgba(15, 23, 42, 0.1);
  border-radius: 1rem;
}

/* responsive tweak */
@media (max-width: 575.98px) { .title-text { max-width: 10rem; } }
</style>

<!-- EXTRA: global (non-scoped) z-index guard so modal/backdrop always sit above sticky/blurred parents -->
<style>
.modal-backdrop { z-index: 1080 !important; }
.modal { z-index: 1090 !important; }

/* NEW: Portal dropdown must sit above the modal and not be clipped */
.portal-product-dropdown {
  position: fixed !important;
  z-index: 1200 !important;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid rgba(15, 23, 42, 0.07);
  background: #fff;
  margin-top: 0; /* already spaced via JS */
}
</style>
