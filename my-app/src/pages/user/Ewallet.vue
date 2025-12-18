<template>
  <div class="container py-4">
    <!-- ===== Tabs (New) ===== -->
    <ul class="nav nav-pills mb-3" :class="booting ? 'breath-in' : ''">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="activeTab === 'wallet' ? 'active' : ''"
          @click="activeTab = 'wallet'"
        >
          <i class="bi bi-wallet2 me-2" aria-hidden="true"></i>
          <!-- Text hidden on mobile, shown from sm+ -->
          <span class="d-none d-sm-inline">E-Wallet</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="activeTab === 'discount' ? 'active' : ''"
          @click="activeTab = 'discount'"
        >
          <i class="bi bi-percent me-2" aria-hidden="true"></i>
          <!-- Text hidden on mobile, shown from sm+ -->
          <span class="d-none d-sm-inline">Discount Credits</span>
        </button>
      </li>
    </ul>

    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-3" :class="booting ? 'breath-in' : ''">
      <h1 class="h4 m-0">
        <span v-if="activeTab === 'wallet'">
          <i class="bi bi-cash-coin me-2 text-success" aria-hidden="true"></i>E-Wallet
        </span>
        <span v-else>
          <i class="bi bi-ticket-perforated me-2 text-primary" aria-hidden="true"></i>Discount Credits
        </span>
      </h1>
      <button
        v-if="activeTab === 'wallet'"
        class="btn btn-primary topup-btn"
        @click="openTopUp"
      >
        <!-- Mobile: icon-only (just the plus icon) -->
        <i class="bi bi-plus-circle d-inline d-sm-none" aria-hidden="true"></i>
        <!-- Desktop/tablet: icon + text -->
        <span class="d-none d-sm-inline-flex align-items-center">
          <i class="bi bi-plus-circle me-1" aria-hidden="true"></i>
          <span class="ms-1">Top Up</span>
        </span>
      </button>
      <!-- No top up button for Discount Credits -->
    </div>

    <!-- ===== WALLET VIEW ===== -->
    <template v-if="activeTab === 'wallet'">
      <!-- Balance Card -->
      <div class="card shadow-sm mb-4" :class="booting ? 'breath-in' : ''">
        <div class="card-body d-flex align-items-center justify-content-between">
          <!-- ✅ Skeleton for balance -->
          <template v-if="busyInit">
            <div class="flex-grow-1 d-flex align-items-center justify-content-between w-100">
              <div class="w-50 pe-3">
                <div class="skel-line skel-sm w-50 mb-2"></div>
                <div class="skel-line w-75"></div>
              </div>
              <div class="w-50 ps-3 text-end">
                <div class="skel-line skel-sm w-50 ms-auto mb-2"></div>
                <div class="skel-line w-50 ms-auto"></div>
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <div class="text-muted small">
                <i class="bi bi-wallet2 me-1" aria-hidden="true"></i>
                Current Balance
              </div>
              <div class="fs-3 fw-semibold">₱ {{ formattedBalance }}</div>
            </div>
            <div class="text-end">
              <div class="text-muted small">
                <i class="bi bi-clock-history me-1" aria-hidden="true"></i>
                Last Updated (Disbursed)
              </div>
              <div class="fw-medium">{{ lastDisbursedText }}</div>
            </div>
          </template>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card shadow-sm" :class="booting ? 'breath-in' : ''">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <strong>
            <i class="bi bi-receipt-cutoff me-2" aria-hidden="true"></i>
            Recent Transactions
          </strong>

          <!-- 🔹 Filters (Dropdown LIST - vertical) -->
          <div class="filter-shell">
            <div
              ref="filterDropdownEl"
              class="dropdown filter-dropdown"
              :class="{ 'show': showFilters }"
            >
              <button
                class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 dropdown-toggle pretty-toggle"
                type="button"
                @click="toggleFilters"
                :aria-expanded="showFilters"
                aria-controls="filterMenu"
              >
                <i class="bi bi-funnel" aria-hidden="true"></i>
                <!-- Label + chevron hidden on mobile, shown from sm+ -->
                <span class="d-none d-sm-inline-flex align-items-center gap-1">
                  {{ filterLabel }}
                  <i
                    class="bi"
                    :class="showFilters ? 'bi-chevron-up' : 'bi-chevron-down'"
                    aria-hidden="true"
                  ></i>
                </span>
              </button>

              <transition name="fade">
                <div
                  v-show="showFilters"
                  id="filterMenu"
                  class="dropdown-menu dropdown-menu-end p-2 rounded-3 shadow smooth-menu show"
                  role="menu"
                  aria-label="Filter by status"
                >
                  <!-- ✅ Vertical list (not sideways) -->
                  <ul class="list-unstyled m-0 py-1 filter-list" role="menu">
                    <li>
                      <button
                        type="button"
                        class="filter-item"
                        role="menuitemradio"
                        :aria-checked="filter === 'all'"
                        @click="applyFilter('all')"
                      >
                        <span class="left">
                          <i class="bi bi-layers me-2"></i>All
                        </span>
                        <i v-if="filter === 'all'" class="bi bi-check2-circle text-primary"></i>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        class="filter-item"
                        role="menuitemradio"
                        :aria-checked="filter === 'pending'"
                        @click="applyFilter('pending')"
                      >
                        <span class="left">
                          <i class="bi bi-hourglass-split text-warning me-2"></i>Pending
                        </span>
                        <i v-if="filter === 'pending'" class="bi bi-check2-circle text-primary"></i>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        class="filter-item"
                        role="menuitemradio"
                        :aria-checked="filter === 'disbursed'"
                        @click="applyFilter('disbursed')"
                      >
                        <span class="left">
                          <i class="bi bi-check-circle text-success me-2"></i>Disbursed
                        </span>
                        <i v-if="filter === 'disbursed'" class="bi bi-check2-circle text-primary"></i>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        class="filter-item"
                        role="menuitemradio"
                        :aria-checked="filter === 'rejected'"
                        @click="applyFilter('rejected')"
                      >
                        <span class="left">
                          <i class="bi bi-x-circle text-danger me-2"></i>Rejected
                        </span>
                        <i v-if="filter === 'rejected'" class="bi bi-check2-circle text-primary"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          <!-- ✅ Skeleton while loading transactions -->
          <div v-if="busyTx" class="p-2">
            <ul class="list-group list-group-flush">
              <li v-for="n in 6" :key="'skel-tx-'+n" class="list-group-item">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="flex-grow-1 pe-3">
                    <div class="skel-line w-50 mb-2"></div>
                    <div class="skel-line skel-sm w-75"></div>
                  </div>
                  <div class="w-25">
                    <div class="skel-line w-100"></div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div v-else-if="transactions.length === 0" class="p-4 text-center text-muted">
            No transactions yet.
          </div>

          <ul v-else class="list-group list-group-flush">
            <li
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="list-group-item d-flex align-items-center justify-content-between tx-row"
              role="button"
              tabindex="0"
              :aria-label="`Open details for Ref ${tx.reference_number}`"
              @click="openTxDetails(tx)"
              @keydown.enter.prevent="openTxDetails(tx)"
              @keydown.space.prevent="openTxDetails(tx)"
            >
              <div class="d-flex align-items-center gap-3">
                <div>
                  <div class="fw-medium d-flex align-items-center gap-2">
                    <i :class="statusIconClass(tx)" aria-hidden="true"></i>

                    <span>Top Up – {{ prettyBank(tx.bank_name) }}</span>
                    <span
                      class="badge"
                      :class="tx.status === 'pending'
                        ? 'text-bg-warning'
                        : tx.status === 'disbursed'
                          ? 'text-bg-success'
                          : 'text-bg-danger'"
                    >
                      {{ capitalize(tx.status) }}
                    </span>

                    <button
                      v-if="tx.status === 'rejected'"
                      type="button"
                      class="icon-btn"
                      @click.stop="openEditRef(tx)"
                      :title="`Edit reference number for ${tx.reference_number}`"
                      aria-label="Edit reference number"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                  </div>

                  <div class="text-muted small d-flex align-items-center gap-2">
                    <span>
                      <i class="bi bi-hash me-1" aria-hidden="true"></i>
                      Ref: <span class="font-monospace">{{ tx.reference_number }}</span> •
                      <i class="bi bi-calendar-event ms-2 me-1" aria-hidden="true"></i>{{ formatDate(tx.created_at) }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="fw-semibold d-flex align-items-center gap-2"
                :class="amountStyle(tx).cls"
                :title="amountStyle(tx).title"
              >
                <span>{{ amountStyle(tx).text }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <!-- ===== DISCOUNT CREDITS VIEW ===== -->
    <template v-else>
      <!-- Balance Card for Discount Credits -->
      <div class="card shadow-sm mb-4" :class="booting ? 'breath-in' : ''">
        <div class="card-body d-flex align-items-center justify-content-between">
          <template v-if="busyInit">
            <div class="flex-grow-1 d-flex align-items-center justify-content-between w-100">
              <div class="w-50 pe-3">
                <div class="skel-line skel-sm w-50 mb-2"></div>
                <div class="skel-line w-75"></div>
              </div>
              <div class="w-50 ps-3 text-end">
                <div class="skel-line skel-sm w-50 ms-auto mb-2"></div>
                <div class="skel-line w-50 ms-auto"></div>
              </div>
            </div>
          </template>
          <template v-else>
            <div>
              <div class="text-muted small">
                <i class="bi bi-percent me-1" aria-hidden="true"></i>
                Current Discount Credits
              </div>
              <div class="fs-3 fw-semibold"><i class="bi bi-ticket-perforated text-primary" aria-hidden="true"></i> {{ formattedDiscountCredits }}</div>
            </div>
            <div class="text-end">
              <div class="text-muted small">
                <i class="bi bi-clock me-1" aria-hidden="true"></i>
                Last Updated
              </div>
              <div class="fw-medium">{{ lastUpdatedText }}</div>
            </div>
          </template>
        </div>
      </div>

      <!-- Helper card -->
      <div class="card shadow-sm" :class="booting ? 'breath-in' : ''">
        <div class="card-body">
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-info-circle fs-4"></i>
            <div>
              <div class="fw-semibold mb-1">How Discount Credits Work</div>
              <p class="mb-0 text-muted">
                These credits are part of your membership benefits and can be applied to eligible purchases
                at checkout. Your available balance updates automatically when you earn or use credits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Discount Credits Activity -->
      <div class="card shadow-sm mt-4" :class="booting ? 'breath-in' : ''">
        <div class="card-header bg-white d-flex align-items-center justify-content-between">
          <strong>
            <i class="bi bi-list-check me-2" aria-hidden="true"></i>
            Discount Credits Activity
          </strong>
          <button class="btn btn-outline-secondary btn-sm" :disabled="busyDcr" @click="loadMyDiscountReceipts">
            <span v-if="busyDcr" class="spinner-border spinner-border-sm me-2"></span>
            Refresh
          </button>
        </div>
        <div class="card-body p-0">
          <div v-if="dcrError" class="alert alert-danger m-3">{{ dcrError }}</div>

          <div v-else-if="busyDcr" class="p-3">
            <div class="d-flex align-items-center text-muted">
              <div class="spinner-border me-2"></div>
              <div>Loading discount credits…</div>
            </div>
            <ul class="list-group list-group-flush mt-3">
              <li v-for="n in 5" :key="'skel-dcr-'+n" class="list-group-item">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="flex-grow-1 pe-3">
                    <div class="skel-line w-50 mb-2"></div>
                    <div class="skel-line skel-sm w-75"></div>
                  </div>
                  <div class="w-25">
                    <div class="skel-line w-100"></div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div v-else-if="dcrList.length === 0" class="p-4 text-center text-muted">
            No discount credits yet.
          </div>

          <!-- ⬇️ Same list, now also shows Referral Bonus rows (no second list created) -->
          <ul v-else class="list-group list-group-flush">
            <li
              v-for="row in dcrList"
              :key="row.id"
              class="list-group-item d-flex align-items-center justify-content-between tx-row"
              role="button"
              tabindex="0"
              :aria-label="`Open details for Discount Credits Ref ${row.reference_number}`"
              @click="openDcrDetails(row)"
              @keydown.enter.prevent="openDcrDetails(row)"
              @keydown.space.prevent="openDcrDetails(row)"
            >
              <div>
                <!-- Receipt row (existing UI preserved) -->
                <div v-if="row.kind === 'receipt'" class="fw-medium d-flex align-items-center gap-2">
                  <i class="bi bi-ticket-perforated text-primary" aria-hidden="true"></i>
                  <span>Discount Applied</span>
                  <span class="badge text-bg-secondary">Receipt</span>
                </div>
                <!-- ✅ Referral bonus row (added) -->
                <div v-else class="fw-medium d-flex align-items-center gap-2">
                  <i class="bi bi-person-plus text-success" aria-hidden="true"></i>
                  <span>Referral Bonus</span>
                  <span class="badge text-bg-success">Referral</span>
                </div>

                <div class="text-muted small">
                  <i class="bi bi-hash me-1" aria-hidden="true"></i>
                  Ref: <span class="font-monospace">{{ row.reference_number }}</span> •
                  <i class="bi bi-calendar-event ms-2 me-1" aria-hidden="true"></i>{{ formatDate(row.created_at) }}
                </div>
              </div>

              <!-- Right-side amount -->
              <!-- Original receipt amount block kept; referral has its own positive display -->
              <div v-if="row.kind === 'receipt'"
                   class="fw-semibold text-danger"
                   :title="`Applied to purchase ${row.purchase_id}`">
                – <i class="bi bi-ticket-perforated text-danger" aria-hidden="true"></i>
  {{ formatAmount(row.amount_discounted) }}
              </div>
              <div v-else class="fw-semibold text-success" :title="'Referral credited'">
                +₱ {{ formatAmount(row.amount_referral) }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- /Discount Credits Activity -->
    </template>

    <!-- Top Up Modal -->
    <div
      class="modal fade"
      id="topUpModal"
      tabindex="-1"
      aria-labelledby="topUpLabel"
      aria-hidden="true"
      ref="topUpModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="confirmTopUp">
            <div class="modal-header">
              <h5 class="modal-title" id="topUpLabel">Top Up Wallet</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ref="closeBtn"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Bank / Wallet</label>
                <select v-model="topUpBank" class="form-select" required>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="gotyme">GoTyme</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Amount (PHP)</label>
                <input
                  v-model.number="topUpAmount"
                  type="number"
                  min="200"
                  step="1"
                  class="form-control"
                  placeholder="Minimum is 200"
                  required
                />
              </div>

              <div class="mb-1">
                <label class="form-label">Reference Number</label>
                <input
                  v-model.trim="topUpRef"
                  type="text"
                  class="form-control font-monospace"
                  placeholder="e.g. TXN-20250926-0001"
                  required
                />
              </div>

              <div class="form-text mt-2">
                Your top-up will be saved as <strong>pending</strong>. Admins can mark it as
                disbursed after verification.
              </div>
              <div v-if="errorMsg" class="alert alert-danger mt-3 py-2 mb-0">
                {{ errorMsg }}
              </div>
              <div v-if="okMsg" class="alert alert-success mt-3 py-2 mb-0">
                {{ okMsg }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span
                  v-if="submitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                Confirm Top Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 🔹 Edit Reference Modal (for rejected transactions) -->
    <div
      class="modal fade"
      id="editRefModal"
      tabindex="-1"
      aria-labelledby="editRefLabel"
      aria-hidden="true"
      ref="editRefModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <form @submit.prevent="confirmEditRef">
            <div class="modal-header">
              <h5 class="modal-title" id="editRefLabel">Edit Reference Number</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Reference Number</label>
                <input
                  v-model.trim="editRef"
                  type="text"
                  class="form-control font-monospace"
                  :placeholder="currentEdit?.reference_number || 'Enter new reference number'"
                  required
                />
                <div class="form-text">
                  Only the reference number can be changed. Submitting will set status to
                  <strong>pending</strong> again for re-verification.
                </div>
              </div>

              <div v-if="editErrorMsg" class="alert alert-danger py-2 mb-0">
                {{ editErrorMsg }}
              </div>
              <div v-if="editOkMsg" class="alert alert-success py-2 mb-0">
                {{ editOkMsg }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="editSubmitting">
                <span
                  v-if="editSubmitting"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <i v-else class="bi bi-arrow-clockwise me-1"></i>
                Save & Re-submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- /Edit Reference Modal -->

    <!-- ✅ Transaction Details Modal -->
    <div
      class="modal fade"
      id="txDetailsModal"
      tabindex="-1"
      aria-labelledby="txDetailsLabel"
      aria-hidden="true"
      ref="txDetailsModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedTx">
          <div class="modal-header">
            <h5 class="modal-title d-flex align-items-center gap-2" id="txDetailsLabel">
              <i :class="statusIconClass(selectedTx)" aria-hidden="true"></i>
              Transaction Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <dl class="row mb-0">
              <dt class="col-sm-4">Reference</dt>
              <dd class="col-sm-8 font-monospace d-flex align-items-center gap-2">
                {{ selectedTx.reference_number }}
                <button class="btn btn-sm btn-outline-secondary" @click="copyRef">
                  <i class="bi bi-clipboard"></i> Copy
                </button>
              </dd>

              <dt class="col-sm-4">Status</dt>
              <dd class="col-sm-8">
                <span
                  class="badge"
                  :class="selectedTx.status === 'pending'
                    ? 'text-bg-warning'
                    : selectedTx.status === 'disbursed'
                      ? 'text-bg-success'
                      : 'text-bg-danger'"
                >
                  {{ capitalize(selectedTx.status) }}
                </span>
              </dd>

              <dt class="col-sm-4">Bank / Wallet</dt>
              <dd class="col-sm-8">{{ prettyBank(selectedTx.bank_name) }}</dd>

              <dt class="col-sm-4">Amount</dt>
              <dd class="col-sm-8 fw-semibold" :class="amountStyle(selectedTx).cls">
                {{ amountStyle(selectedTx).text }}
              </dd>

              <dt class="col-sm-4">Created</dt>
              <dd class="col-sm-8">{{ formatDate(selectedTx.created_at) }}</dd>

              <dt class="col-sm-4">Last Update</dt>
              <dd class="col-sm-8">{{ formatDate(selectedTx.updated_at) }}</dd>
            </dl>
          </div>

          <div class="modal-footer">
            <button
              v-if="selectedTx.status === 'rejected'"
              type="button"
              class="btn btn-warning text-dark"
              @click="() => { openEditRef(selectedTx!); }"
            >
              <i class="bi bi-pencil-square me-1"></i>
              Edit Reference
            </button>
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Transaction Details Modal -->

    <!-- ✅ Discount Credits Receipt Details Modal -->
    <div
      class="modal fade"
      id="dcrDetailsModal"
      tabindex="-1"
      aria-labelledby="dcrDetailsLabel"
      aria-hidden="true"
      ref="dcrDetailsModalEl"
      data-bs-backdrop="true"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedDcr">
          <div class="modal-header">
            <h5 class="modal-title d-flex align-items-center gap-2" id="dcrDetailsLabel">
              <!-- Title differs by kind -->
              <template v-if="selectedDcr.kind === 'receipt'">
                <i class="bi bi-ticket-perforated text-primary" aria-hidden="true"></i>
                Discount Credits Receipt
              </template>
              <template v-else>
                <i class="bi bi-person-plus text-success" aria-hidden="true"></i>
                Referral Bonus
              </template>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <dl class="row mb-0">
              <dt class="col-sm-4">Reference</dt>
              <dd class="col-sm-8 font-monospace d-flex align-items-center gap-2">
                {{ selectedDcr.reference_number }}
                <button class="btn btn-sm btn-outline-secondary" @click="copyDcrRef">
                  <i class="bi bi-clipboard"></i> Copy
                </button>
              </dd>

              <!-- Receipt details -->
              <template v-if="selectedDcr.kind === 'receipt'">
                <dt class="col-sm-4">Amount Applied</dt>
                <dd class="col-sm-8 fw-semibold text-danger">
                  –₱ {{ formatAmount(selectedDcr.amount_discounted) }}
                </dd>

                <dt class="col-sm-4">Purchase ID</dt>
                <dd class="col-sm-8 font-monospace">{{ selectedDcr.purchase_id }}</dd>
              </template>

              <!-- ✅ Referral details -->
              <template v-else>
                <dt class="col-sm-4">Bonus Amount</dt>
                <dd class="col-sm-8 fw-semibold text-success">
                  +₱ {{ formatAmount(selectedDcr.amount_referral) }}
                </dd>

                <dt class="col-sm-4">Referee</dt>
                <dd class="col-sm-8 font-monospace">
                  {{ maskId(selectedDcr.referee_id) }}
                </dd>
              </template>

              <dt class="col-sm-4">Created</dt>
              <dd class="col-sm-8">{{ formatDate(selectedDcr.created_at) }}</dd>

              <dt class="col-sm-4">Last Update</dt>
              <dd class="col-sm-8">{{ formatDate(selectedDcr.updated_at) }}</dd>
            </dl>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Discount Credits Receipt Details Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useRoute } from 'vue-router' // 🔗 URL ref: import useRoute
import { currentUser } from '@/lib/authState'
import Swal from 'sweetalert2' // ✅ SweetAlert2

/* ===========================================================
   SweetAlert helpers (friendly, consistent messaging)
   =========================================================== */
const swSuccess = (message: string, title = 'Success') =>
  Swal.fire({ icon: 'success', title, text: message })
const swError = (message: string, title = 'Something went wrong') =>
  Swal.fire({ icon: 'error', title, text: message })
const swWarn = (message: string, title = 'Please check') =>
  Swal.fire({ icon: 'warning', title, text: message })
const swToast = async (message: string, icon: 'success'|'error'|'info'|'warning' = 'success') =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 1400,
    timerProgressBar: true
  })

const router = useRouter()
const route = useRoute() // 🔗 URL ref: current route
const user = computed(() => currentUser.value)

/** 🔹 New: one-time boot flag to drive the “breath-in” section animation */
const booting = ref(true)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return router.push({ name: 'login' })
  }
})

type BankName = 'gcash' | 'maya' | 'gotyme'
type Status = 'pending' | 'disbursed' | 'rejected'
type Tx = {
  id: number
  reference_number: string
  user_id: string
  amount: number
  created_at: string
  updated_at: string
  status: Status
  bank_name: BankName
}

/** ✅ Discount Credits Receipt type */
type Dcr = {
  id: string
  created_at: string
  updated_at: string
  purchase_id: string
  amount_discounted: number
  reference_number: string
}

/** ✅ Activity union so we can render receipts and referrals in ONE list */
type DcrReceipt = Dcr & { kind: 'receipt' }
type ReferralActivity = {
  kind: 'referral'
  id: string
  created_at: string
  updated_at: string
  reference_number: string
  amount_referral: number
  referee_id: string
  purchase_id?: undefined
  amount_discounted?: undefined
}
type ActivityRow = DcrReceipt | ReferralActivity

// ===== New: Tab State =====
const activeTab = ref<'wallet' | 'discount'>('wallet')

// State
const balance = ref<number>(0)
const usersBalance = ref<number | null>(null)
const lastUpdated = ref<Date | null>(null)
const transactions = ref<Tx[]>([])
const currentUserId = ref<string | null>(null)

// New: Discount Credits Balance
const discountCredits = ref<number>(0)

/** ✅ NEW: Discount Credits Activity list + flags (merged: receipts + referrals in one list) */
const dcrList = ref<ActivityRow[]>([])
const busyDcr = ref(false)
const dcrError = ref<string>('')

/** Track latest disbursed update time */
const lastDisbursedAt = ref<Date | null>(null)

/** Busy flags for skeletons */
const busyInit = ref(true)
const busyTx = ref(false)

// Filter state
const filter = ref<'all' | Status>('all')
const setFilter = (f: 'all' | Status) => { filter.value = f }
const filterLabel = computed(() => {
  if (filter.value === 'all') return 'All'
  return filter.value.charAt(0).toUpperCase() + filter.value.slice(1)
})
const filteredTransactions = computed(() => {
  if (filter.value === 'all') return transactions.value
  return transactions.value.filter(t => t.status === filter.value)
})

/* ====== Dropdown filter toggle + outside click ====== */
const showFilters = ref(false)
const filterDropdownEl = ref<HTMLElement | null>(null)
const toggleFilters = () => { showFilters.value = !showFilters.value }
const applyFilter = (f: 'all' | Status) => { setFilter(f); showFilters.value = false }

const onDocClick = (e: MouseEvent) => {
  if (!showFilters.value) return
  const target = e.target as Node
  if (filterDropdownEl.value && !filterDropdownEl.value.contains(target)) {
    showFilters.value = false
  }
}

document.addEventListener('click', onDocClick)

// Modal state (Top Up)
const topUpAmount = ref<number | null>(null)
const topUpBank = ref<BankName>('gcash')
const topUpRef = ref<string>('')
const topUpModalEl = ref<HTMLDivElement | null>(null)
let bsModal: any = null
let usersChannel: ReturnType<typeof supabase.channel> | null = null
let txChannel: ReturnType<typeof supabase.channel> | null = null
// ✅ REFERRALS: realtime channel
let referralsChannel: ReturnType<typeof supabase.channel> | null = null

const submitting = ref(false)
const errorMsg = ref<string>('')   // (kept for UI, but SweetAlert is primary)
const okMsg = ref<string>('')       // (kept for UI, but SweetAlert is primary)

// Edit Ref state
const editRefModalEl = ref<HTMLDivElement | null>(null)
let bsEditModal: any = null
const currentEdit = ref<Tx | null>(null)
const editRef = ref<string>('')
const editSubmitting = ref(false)
const editErrorMsg = ref<string>('') // (kept)
const editOkMsg = ref<string>('')    // (kept)

// ✅ Transaction Details modal state
const txDetailsModalEl = ref<HTMLDivElement | null>(null)
let bsTxModal: any = null
const selectedTx = ref<Tx | null>(null)
const copyOk = ref(false)

// ✅ NEW: DCR Details modal state (union)
const dcrDetailsModalEl = ref<HTMLDivElement | null>(null)
let bsDcrModal: any = null
const selectedDcr = ref<ActivityRow | null>(null)
const copyDcrOk = ref(false)

// 🔹 Shared date-time options (no seconds)
const dtOpts: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}

// ===== 🔗 URL helpers (ADDED) =====
const setQueryFlag = (key: 'isCreditsOpen' | 'isTopUpOpen', value: 'yes' | null) => {
  const q: Record<string, any> = { ...route.query }
  if (value) q[key] = value
  else delete q[key]
  router.replace({ query: q })
}

const ensureTopUpModal = () => {
  const w = window as any
  if (!w?.bootstrap || !topUpModalEl.value) return null
  return w.bootstrap.Modal.getOrCreateInstance(topUpModalEl.value, {
    backdrop: true,
    keyboard: true,
    focus: true
  })
}

// Formatters
const formatAmount = (n: number) =>
  n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formattedBalance = computed(() => {
  const val = usersBalance.value ?? balance.value
  return formatAmount(val)
})
const formattedDiscountCredits = computed(() => formatAmount(discountCredits.value))
const lastUpdatedText = computed(() =>
  lastUpdated.value ? lastUpdated.value.toLocaleString(undefined, dtOpts) : '—',
)
const lastDisbursedText = computed(() =>
  lastDisbursedAt.value ? lastDisbursedAt.value.toLocaleString(undefined, dtOpts) : '—',
)
const formatDate = (iso: string) => new Date(iso).toLocaleString(undefined, dtOpts)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const prettyBank = (b: BankName) => (b === 'gcash' ? 'GCash' : b === 'maya' ? 'Maya' : 'GoTyme')

// 🔹 Amount style helper based on status (icons removed for amount)
const amountStyle = (tx: Tx) => {
  const amt = `₱ ${formatAmount(Math.abs(tx.amount))}`
  if (tx.status === 'disbursed') {
    return {
      text: `+${amt}`,
      cls: 'text-success',
      icon: null,
      title: 'Disbursed'
    }
  }
  if (tx.status === 'pending') {
    return {
      text: `(${amt})`,
      cls: 'text-secondary',
      icon: null,
      title: 'Pending verification'
    }
  }
  // rejected
  return {
    text: `–${amt}`,
    cls: 'text-danger',
    icon: null,
    title: 'Rejected'
  }
}

// 🔹 status icon class for the label row (left of "Top Up – …")
const statusIconClass = (tx: Tx) => {
  if (tx.status === 'disbursed') return 'bi bi-check-circle text-success'
  if (tx.status === 'pending') return 'bi bi-hourglass-split text-warning'
  return 'bi bi-x-circle text-danger'
}

// 🔹 Helpers to avoid duplicates in the list
const findTxIndex = (id: number) => transactions.value.findIndex(t => t.id === id)
const addTxIfMissingToTop = (tx: Tx) => {
  if (findTxIndex(tx.id) === -1) {
    transactions.value.unshift(tx)
  }
}
const removeTxIfPresent = (id: number) => {
  const idx = findTxIndex(id)
  if (idx !== -1) transactions.value.splice(idx, 1)
}

// 🔹 Local balance fallback recompute
const recalcLocalBalance = () => {
  balance.value = transactions.value.reduce((s, t) => s + (t.amount || 0), 0)
}

// Recompute latest disbursed updated_at
const recomputeLastDisbursed = () => {
  const disbursed = transactions.value.filter(t => t.status === 'disbursed')
  if (disbursed.length === 0) {
    lastDisbursedAt.value = null
    return
  }
  const maxIso = disbursed
    .map(t => t.updated_at)
    .reduce((max, cur) => (new Date(cur).getTime() > new Date(max).getTime() ? cur : max))
  lastDisbursedAt.value = new Date(maxIso)
}

// 🔹 Friendly duplicate-ref detector
const isDuplicateRefError = (err: any) => {
  const msg = (err?.message || '').toLowerCase()
  const code = err?.code || err?.details || ''
  return (
    code === '23505' || // Postgres unique_violation
    msg.includes('duplicate key') ||
    msg.includes('unique constraint') ||
    (msg.includes('unique') && msg.includes('reference')) ||
    msg.includes('reference_number')
  )
}

// Open Top Up (UPDATED: also set URL flag)
const openTopUp = () => {
  errorMsg.value = ''
  okMsg.value = ''
  const w = window as any
  if (w?.bootstrap && topUpModalEl.value) {
    bsModal = w.bootstrap.Modal.getOrCreateInstance(topUpModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    // keep URL in sync when opened
    setQueryFlag('isTopUpOpen', 'yes')
    bsModal.show()
  } else {
    const vAmt = window.prompt('Enter top-up amount (PHP):', '')
    const vRef = vAmt ? window.prompt('Enter reference number:') : null
    const vBank = vRef
      ? window.prompt("Enter bank name ('gcash'|'maya'|'gotyme'):", topUpBank.value)
      : null
    if (vAmt && vRef && vBank) {
      const amt = Number(vAmt)
      const bank = (vBank as string).toLowerCase() as BankName
      if (!isNaN(amt) && amt > 0 && ['gcash', 'maya', 'gotyme'].includes(bank)) {
        // we still reflect intent in the URL for parity
        setQueryFlag('isTopUpOpen', 'yes')
        confirmTopUpFallback(amt, vRef.trim(), bank)
      } else {
        // ✅ SweetAlert warning for invalid inputs
        swWarn('Please enter a valid amount and bank (GCash, Maya, or GoTyme).')
      }
    }
  }
}

const confirmTopUpFallback = async (amount: number, refno: string, bank: BankName) => {
  topUpAmount.value = amount
  topUpRef.value = refno
  topUpBank.value = bank
  await confirmTopUp()
}

// Insert top-up
const confirmTopUp = async () => {
  // Clear inline flags (kept for UI integrity)
  errorMsg.value = ''
  okMsg.value = ''

  // 🔹 Enforce minimum top up (and ensure value exists) — show SweetAlert messages
  if (!topUpAmount.value || topUpAmount.value < 200) {
    errorMsg.value = 'Minimum top-up is ₱200.'
    swWarn('Minimum top-up is ₱200. Please increase the amount and try again.')
    return
  }
  if (!topUpRef.value) {
    errorMsg.value = 'Reference number is required.'
    swWarn('Please enter your payment reference number.')
    return
  }
  if (!['gcash', 'maya', 'gotyme'].includes(topUpBank.value)) {
    errorMsg.value = 'Bank name must be GCash, Maya, or GoTyme.'
    swWarn('Bank/Wallet must be GCash, Maya, or GoTyme.')
    return
  }

  submitting.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      errorMsg.value = 'Not authenticated.'
      swError('You need to sign in to submit a top-up.')
      return
    }

    const insertPayload = {
      reference_number: topUpRef.value,
      user_id: user.id,
      amount: topUpAmount.value,
      bank_name: topUpBank.value,
    }

    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      // 🔹 Show friendly message for duplicate reference number
      if (isDuplicateRefError(error)) {
        errorMsg.value = 'That reference number is already used. Please enter a different one.'
        swError('That reference number has already been used. Please double-check and enter a different one.')
      } else {
        errorMsg.value = 'We couldn’t save your top-up. Please try again.'
        swError('We couldn’t save your top-up right now. Please try again in a moment.')
      }
      return
    }

    if (data) {
      const tx = data as Tx
      // 🔹 Avoid duplicate row if realtime INSERT also fires:
      addTxIfMissingToTop(tx)
      lastUpdated.value = new Date()
      okMsg.value = 'Top-up recorded successfully (pending).'
      // ✅ SweetAlert success (user-friendly)
      swSuccess('Your top-up was submitted and is now pending verification. You’ll see it here once verified.', 'Top-up submitted')

      // Clear form
      topUpAmount.value = null
      topUpRef.value = ''
      if (bsModal) bsModal.hide()
      // Derived UI bits
      recalcLocalBalance()
      recomputeLastDisbursed()
    }
  } catch (e: any) {
    if (isDuplicateRefError(e)) {
      errorMsg.value = 'That reference number is already used. Please enter a different one.'
      swError('That reference number has already been used. Please enter a new one.')
    } else {
      errorMsg.value = 'Something went wrong. Please try again.'
      swError('Unexpected error while saving your top-up. Please try again.')
    }
  } finally {
    submitting.value = false
  }
}

// Open edit modal
const openEditRef = (tx: Tx) => {
  if (tx.status !== 'rejected') return
  currentEdit.value = tx
  editRef.value = tx.reference_number || ''
  editErrorMsg.value = ''
  editOkMsg.value = ''
  const w = window as any
  if (w?.bootstrap && editRefModalEl.value) {
    bsEditModal = w.bootstrap.Modal.getOrCreateInstance(editRefModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsEditModal.show()
  } else {
    const newRef = window.prompt('Enter new reference number:', editRef.value)
    if (newRef !== null) {
      editRef.value = newRef.trim()
      confirmEditRef()
    }
  }
}

// Save edit -> set to pending
const confirmEditRef = async () => {
  editErrorMsg.value = ''
  editOkMsg.value = ''

  const row = currentEdit.value
  if (!row) {
    editErrorMsg.value = 'No transaction selected.'
    swError('No transaction selected to update.')
    return
  }
  if (!editRef.value) {
    editErrorMsg.value = 'Reference number is required.'
    swWarn('Please enter a new reference number.')
    return
  }

  editSubmitting.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) {
      editErrorMsg.value = 'Not authenticated.'
      swError('You need to sign in to update this reference number.')
      return
    }

    const { data, error } = await supabase
      .schema('ewallet')
      .from('transactions')
      .update({
        reference_number: editRef.value,
        status: 'pending' as Status,
      })
      .eq('id', row.id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      if (isDuplicateRefError(error)) {
        editErrorMsg.value = 'That reference number is already used. Please enter a different one.'
        swError('That reference number is already in use. Please try a different one.')
      } else {
        editErrorMsg.value = 'We couldn’t update this reference number. Please try again.'
        swError('We couldn’t update the reference number right now. Please try again.')
      }
      return
    }

    if (data) {
      const updated = data as Tx
      const i = transactions.value.findIndex(t => t.id === updated.id)
      if (i !== -1) transactions.value[i] = updated
      lastUpdated.value = new Date()
      editOkMsg.value = 'Reference updated. Status set to pending.'
      // ✅ SweetAlert success
      swSuccess('Reference updated. We’ll re-verify this top-up shortly.', 'Reference updated')

      // 🔗 URL ref: if the details modal is on this tx, refresh URL ref to new value
      if (selectedTx.value && selectedTx.value.id === updated.id) {
        selectedTx.value = updated
        setRefInUrl(updated.reference_number)
      }
      setTimeout(() => {
        if (bsEditModal) bsEditModal.hide()
      }, 250)
      recalcLocalBalance()
      recomputeLastDisbursed()
    }
  } catch (e: any) {
    if (isDuplicateRefError(e)) {
      editErrorMsg.value = 'That reference number is already used. Please enter a different one.'
      swError('That reference number is already in use. Please try a different one.')
    } else {
      editErrorMsg.value = 'Something went wrong. Please try again.'
      swError('Unexpected error while updating the reference number.')
    }
  } finally {
    editSubmitting.value = false
  }
}

// Load balance from public.users
const loadMyUsersBalance = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return
  currentUserId.value = user.id

  const { data, error } = await supabase
    .from('users')
    .select('balance, discount_credits')
    .eq('id', user.id)
    .single()

  if (!error && data) {
    usersBalance.value = Number((data as any).balance ?? 0)
    discountCredits.value = Number((data as any).discount_credits ?? 0)
  }
}

// Load existing rows
const loadMyTransactions = async () => {
  busyTx.value = true
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) { busyTx.value = false; return }

  const { data, error } = await supabase
    .schema('ewallet')
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!error && data) {
    transactions.value = data as Tx[]
    recalcLocalBalance()
    lastUpdated.value = transactions.value[0] ? new Date(transactions.value[0].created_at) : null
    recomputeLastDisbursed()
  }
  busyTx.value = false
}

/** ====== REFERRAL BONUS CONFIG ======
 * Adjust this to your actual per-successful-referral bonus amount (PHP).
 */
const REFERRAL_BONUS_PHP = 200

/** ✅ Helper: build a stable synthetic reference number for a referral row */
const makeReferralRef = (referee_id: string, created_at: string) =>
  `REF-${referee_id.slice(0, 8)}-${created_at.slice(0, 10).replace(/-/g, '')}`

/** ✅ Helper: mask a UUID-ish id for display */
const maskId = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`

/** ✅ Load discount credits receipts (existing) + merge referral bonuses (ADDED)
 * ✅ FIX: receipts now show ONLY what THIS user used (filter via games.purchases.user_id)
 */
const loadMyDiscountReceipts = async () => {
  dcrError.value = ''
  busyDcr.value = true
  try {
    const { data: auth } = await supabase.auth.getUser()
    const user = auth?.user
    if (!user) throw new Error('Not authenticated.')

    // ✅ 0) Get MY purchase IDs (games.purchases.user_id = current user)
    const { data: myPurchases, error: purErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)

    if (purErr) throw purErr

    const myPurchaseIds: string[] = (myPurchases || []).map((p: any) => p.id)

    // 1) Receipts (existing) — NOW FILTERED BY MY PURCHASE IDS
    let recData: any[] = []
    if (myPurchaseIds.length > 0) {
      const { data, error: recErr } = await supabase
        .schema('ewallet')
        .from('discount_credits_receipt')
        .select('*')
        .in('purchase_id', myPurchaseIds)
        .order('created_at', { ascending: false })

      if (recErr) throw recErr
      recData = data || []
    } else {
      recData = []
    }

    const receipts: DcrReceipt[] = (recData || []).map((r: any) => ({
      ...r,
      amount_discounted: Number(r.amount_discounted ?? 0),
      kind: 'receipt' as const,
    }))

    // 2) ✅ Referrals (added): show positive bonus rows
    const { data: refData, error: refErr } = await supabase
      .from('referrals')
      .select('referee_id, referrer_id, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })

    if (refErr) throw refErr

    const referrals: ReferralActivity[] = (refData || []).map((r: any) => {
      const refno = makeReferralRef(r.referee_id, r.created_at)
      return {
        kind: 'referral',
        id: `referral-${r.referee_id}-${r.created_at}`,
        created_at: r.created_at,
        updated_at: r.created_at, // no explicit updated_at in referrals; mirror created_at
        reference_number: refno,
        amount_referral: REFERRAL_BONUS_PHP,
        referee_id: r.referee_id,
      }
    })

    // 3) Merge into ONE list (no second list created), latest first
    const combined: ActivityRow[] = [...receipts, ...referrals].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    dcrList.value = combined

    if (combined.length > 0) {
      // reflect freshness on "Last Updated"
      lastUpdated.value = new Date(combined[0].created_at)
    }
  } catch (e) {
    dcrError.value = 'Could not load discount credit activity.'
    // ✅ SweetAlert error
    swError('We couldn’t load your Discount Credits right now. Please try again in a moment.')
  } finally {
    busyDcr.value = false
  }
}

/** ✅ Realtime subs */
const subscribeUsersBalance = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return

  usersChannel = supabase
    .channel('users-balance-self')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
      (payload) => {
        const newBal = (payload.new as any)?.balance
        if (typeof newBal === 'number') usersBalance.value = newBal
        const newCredits = (payload.new as any)?.discount_credits
        if (typeof newCredits === 'number') discountCredits.value = newCredits
        lastUpdated.value = new Date()
      }
    )
    .subscribe()
}

const subscribeMyTransactions = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return

  txChannel = supabase
    .channel('my-transactions')
    // 🔹 Listen to ALL changes (INSERT, UPDATE, DELETE) on my rows
    .on(
      'postgres_changes',
      { event: '*', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${user.id}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          addTxIfMissingToTop(payload.new as Tx)
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Tx
          const i = transactions.value.findIndex(t => t.id === updated.id)
          if (i !== -1) transactions.value[i] = updated
          // 🔗 URL ref: keep modal selection fresh if it's the same tx
          if (selectedTx.value && selectedTx.value.id === updated.id) {
            selectedTx.value = updated
          }
        } else if (payload.eventType === 'DELETE') {
          const removed = payload.old as Tx
          removeTxIfPresent(removed.id)
          // 🔗 URL ref: if we were viewing this, clear ref
          if (selectedTx.value && selectedTx.value.id === removed.id) {
            selectedTx.value = null
            setRefInUrl(null)
          }
        }
        // Keep derived UI bits fresh on *every* change
        lastUpdated.value = new Date()
        recalcLocalBalance()
        recomputeLastDisbursed()
      }
    )
    .subscribe()
}

/** ✅ REFERRALS realtime: add new referral bonus rows to the same list */
const subscribeMyReferrals = async () => {
  const { data: auth } = await supabase.auth.getUser()
  const user = auth?.user
  if (!user) return

  referralsChannel = supabase
    .channel('my-referrals')
    .on(
      'postgres_changes', { event: 'INSERT', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${user.id}` },
      (payload) => {
        const r = payload.new as { referee_id: string; created_at: string }
        const refno = makeReferralRef(r.referee_id, r.created_at)
        const row: ReferralActivity = {
          kind: 'referral',
          id: `referral-${r.referee_id}-${r.created_at}`,
          created_at: r.created_at,
          updated_at: r.created_at,
          reference_number: refno,
          amount_referral: REFERRAL_BONUS_PHP,
          referee_id: r.referee_id,
        }
        // Insert on top and keep list sorted by created_at desc
        dcrList.value.unshift(row)
        dcrList.value.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        lastUpdated.value = new Date()
      }
    )
    .subscribe()
}

/* ========= Details: open/close (with dim backdrop) ========= */

// 🔗 URL ref: helper to set/clear ?ref= in the URL (no history spam)
const setRefInUrl = (refno: string | null) => {
  const q: Record<string, any> = { ...route.query }
  if (refno) q.ref = refno
  else delete q.ref
  router.replace({ query: q })
}

const openTxDetails = (tx: Tx) => {
  selectedTx.value = tx
  selectedDcr.value = null // ensure only one modal type is active
  setRefInUrl(tx.reference_number) // 🔗 URL ref
  const w = window as any
  if (w?.bootstrap && txDetailsModalEl.value) {
    bsTxModal = w.bootstrap.Modal.getOrCreateInstance(txDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsTxModal.show()
  }
}

const closeTxDetails = () => {
  setRefInUrl(null)
  if (bsTxModal) bsTxModal.hide()
}

const copyRef = async () => {
  if (!selectedTx.value) return
  try {
    await navigator.clipboard.writeText(selectedTx.value.reference_number)
    copyOk.value = true
    // ✅ SweetAlert toast for copy
    swToast('Reference copied')
    setTimeout(() => (copyOk.value = false), 1200)
  } catch {
    swToast('Could not copy', 'error')
  }
}

// ✅ NEW: DCR open/close/copy
const openDcrDetails = (row: ActivityRow) => {
  selectedDcr.value = row
  selectedTx.value = null // ensure only one modal type is active
  setRefInUrl(row.reference_number)
  const w = window as any
  if (w?.bootstrap && dcrDetailsModalEl.value) {
    bsDcrModal = w.bootstrap.Modal.getOrCreateInstance(dcrDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    bsDcrModal.show()
  }
}

const closeDcrDetails = () => {
  setRefInUrl(null)
  if (bsDcrModal) bsDcrModal.hide()
}

const copyDcrRef = async () => {
  if (!selectedDcr.value) return
  try {
    await navigator.clipboard.writeText(selectedDcr.value.reference_number)
    copyDcrOk.value = true
    // ✅ SweetAlert toast for copy
    swToast('Reference copied')
    setTimeout(() => (copyDcrOk.value = false), 1200)
  } catch {
    swToast('Could not copy', 'error')
  }
}

// 🔗 URL ref: try open by reference number (will check TX first, then DCR)
const openByRef = (refStr: string) => {
  if (!refStr) return
  const tx = transactions.value.find(t => t.reference_number === refStr)
  if (tx) {
    // open transaction modal
    openTxDetails(tx)
    return
  }
  const dcr = dcrList.value.find(r => r.reference_number === refStr)
  if (dcr) openDcrDetails(dcr)
}

/* ========= MOUNT ========= */
onMounted(async () => {
  const w = window as any
  if (w?.bootstrap && topUpModalEl.value) {
    bsModal = w.bootstrap.Modal.getOrCreateInstance(topUpModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    // when closed, clear ?isTopUpOpen
    topUpModalEl.value.addEventListener('hidden.bs.modal', () => {
      setQueryFlag('isTopUpOpen', null)
    })
  }
  if (w?.bootstrap && editRefModalEl.value) {
    bsEditModal = w.bootstrap.Modal.getOrCreateInstance(editRefModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
  }
  if (w?.bootstrap && txDetailsModalEl.value) {
    bsTxModal = w.bootstrap.Modal.getOrCreateInstance(txDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    txDetailsModalEl.value.addEventListener('hidden.bs.modal', () => {
      selectedTx.value = null
      setRefInUrl(null)
    })
  }
  if (w?.bootstrap && dcrDetailsModalEl.value) {
    bsDcrModal = w.bootstrap.Modal.getOrCreateInstance(dcrDetailsModalEl.value, {
      backdrop: true,
      keyboard: true,
      focus: true
    })
    dcrDetailsModalEl.value.addEventListener('hidden.bs.modal', () => {
      selectedDcr.value = null
      setRefInUrl(null)
    })
  }

  await Promise.all([
    loadMyUsersBalance(),
    loadMyTransactions(),
    loadMyDiscountReceipts(), // ✅ ensure receipts + referrals are available for deep link
  ])
  busyInit.value = false
  await subscribeUsersBalance()
  await subscribeMyTransactions()
  await subscribeMyReferrals() // ✅ realtime referrals

  // 🔗 URL ref: if arriving with ?ref=..., open it (TX first, else merged DCR)
  const initialRef = (route.query?.ref ?? '') as string
  if (initialRef) {
    setTimeout(() => openByRef(initialRef), 0)
  }

  // 🔗 URL flags (ADDED): open tab/modal based on query on first load
  const initialCredits = (route.query?.isCreditsOpen ?? '') as string
  if (initialCredits === 'yes') {
    activeTab.value = 'discount'
  }
  const initialTopUp = (route.query?.isTopUpOpen ?? '') as string
  if (initialTopUp === 'yes') {
    const m = ensureTopUpModal()
    m?.show()
  }

  /** 🔹 Finish the one-time breath-in entrance after ~500ms */
  setTimeout(() => { booting.value = false }, 520)
})

// 🔗 Keep URL in sync with tab (ADDED)
watch(activeTab, (next) => {
  setQueryFlag('isCreditsOpen', next === 'discount' ? 'yes' : null)
})

// 🔗 React to URL changes externally (ADDED)
watch(
  () => route.query.isCreditsOpen,
  (v) => {
    if (v === 'yes') activeTab.value = 'discount'
    // if cleared, we leave user's current tab as-is
  }
)

watch(
  () => route.query.isTopUpOpen,
  (v) => {
    const m = ensureTopUpModal()
    if (v === 'yes') m?.show()
    else m?.hide()
  }
)

onBeforeUnmount(() => {
  if (usersChannel) supabase.removeChannel(usersChannel)
  if (txChannel) supabase.removeChannel(txChannel)
  if (referralsChannel) supabase.removeChannel(referralsChannel) // ✅
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.container {
  max-width: 880px;
}
.card {
  border-radius: 14px;
}
.list-group-item {
  padding: 0.8rem 1rem;
}
.font-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

/* 🔹 Minimalist icon-only button */
.icon-btn {
  border: 1px solid var(--line, #e7edf3);
  background: #fff;
  border-radius: 10px;
  padding: 4px 8px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.icon-btn i {
  font-size: 0.95rem;
}
.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.10);
  border-color: #d5dde6;
}

/* ✅ Clickable rows */
.tx-row { cursor: pointer; }
.tx-row:hover { background: rgba(0,0,0,.02); }

/* ====== Filters: Dropdown LIST (vertical) ====== */
.filter-shell { position: relative; }
.filter-dropdown .pretty-toggle {
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  border-color: #e6edf5;
}
.filter-dropdown .pretty-toggle:hover { border-color: #d7e1ec; }
.smooth-menu {
  min-width: 260px;
  border: 1px solid #e9eef5;
  background: #fff;
}

/* Vertical list items */
.filter-list .filter-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  padding: .6rem .8rem;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 10px;
  font-size: .92rem;
  transition: background .15s ease, border-color .15s ease, transform .06s ease;
}
.filter-list .filter-item .left { display: inline-flex; align-items: center; }
.filter-list .filter-item:hover {
  background: #f7faff;
  border-color: #e5eefc;
}
.filter-list .filter-item[aria-checked="true"] {
  background: #eef5ff;
  border-color: #d6e6ff;
}

/* ====== Skeleton styles ====== */
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}
.skel-line {
  height: 16px;
  border-radius: 8px;
  background: #eef2f7;
  background-image: linear-gradient(90deg, #eef2f7 0px, #f7f9fc 40px, #eef2f7 80px);
  background-size: 600px 100%;
  animation: shimmer 1.1s infinite linear forwards;
}
.skel-sm { height: 12px; }

/* ====== Fade (existing) ====== */
.fade-enter-active, .fade-leave-active { transition: opacity .16s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ====== New: Breath-in entrance (≈500ms) ======
   Slight scale + opacity rise for a soft “breathe” effect. */
@keyframes breathIn {
  0%   { opacity: 0; transform: translateY(6px) scale(.985); filter: saturate(.96); }
  60%  { opacity: 1; transform: translateY(0)  scale(1.005); }
  100% { opacity: 1; transform: translateY(0)  scale(1); filter: saturate(1); }
}
.breath-in {
  animation: breathIn 0.5s cubic-bezier(.2,.7,.2,1) both;
  will-change: transform, opacity, filter;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .breath-in { animation: none !important; }
}

/* ====== Mobile tweaks: icon-only, compact layout ====== */
@media (max-width: 575.98px) {
  /* Tabs: icon-only & compact */
  .nav.nav-pills {
    gap: 0.5rem;
  }
  .nav-pills .nav-link {
    padding: 0.4rem 0.6rem;
    border-radius: 999px;
  }
  .nav-pills .nav-link i {
    margin-right: 0 !important;
  }

  /* Top-up button: icon-only + compact */
  .topup-btn {
    padding-inline: 0.6rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Filter toggle: a bit tighter */
  .filter-dropdown .pretty-toggle {
    padding-inline: 0.45rem;
  }
}
</style>

<!-- 🔸 Global (non-scoped) CSS to guarantee a dim backdrop -->
<style>
/* Make sure the Bootstrap modal backdrop actually dims the page */
.modal-backdrop { background-color: #000; }
.modal-backdrop.show { opacity: 0.5; } /* tweak intensity as you like (0.3–0.7) */
</style>
