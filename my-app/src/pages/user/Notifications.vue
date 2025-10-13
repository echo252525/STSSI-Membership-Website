<template>
  <div class="card shadow-sm border-0">
    <div class="card-header d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-bell"></i>
        <strong>Notifications</strong>
        <span v-if="unreadCount > 0" class="badge text-bg-danger">{{ unreadCount }}</span>
      </div>
      <button class="btn btn-outline-secondary btn-sm" :disabled="busy.load" @click="reload">
        <span v-if="busy.load" class="spinner-border spinner-border-sm me-2"></span>
        Refresh
      </button>
    </div>

    <div class="list-group list-group-flush">
      <div v-if="items.length === 0 && !busy.load" class="text-center text-muted py-5">
        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
        No notifications yet.
      </div>

      <div
        v-for="n in items"
        :key="n.id"
        class="list-group-item d-flex align-items-start gap-3"
        :class="{ 'bg-light-subtle': n.status === 'pending' }"
      >
        <div class="pt-1">
          <i :class="txIconClass(n.status)"></i>
        </div>

        <div class="flex-grow-1">
          <div class="d-flex align-items-center justify-content-between">
            <div class="fw-semibold">{{ n.message }}</div>
            <small class="text-muted ms-2">{{ timeAgo(n.when) }}</small>
          </div>
          <div class="text-muted small mt-1">
            Ref: {{ n.reference_number }} <span v-if="n.bank_name && n.bank_name !== '—'">| Bank: {{ n.bank_name }}</span>
          </div>
        </div>
      </div>

      <div v-if="hasMore && items.length" class="list-group-item text-center">
        <button class="btn btn-outline-secondary btn-sm" :disabled="busy.more" @click="loadMore">
          <span v-if="busy.more" class="spinner-border spinner-border-sm me-2"></span>
          Load more
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type TxRow = {
  id: string
  user_id: string
  reference_number: string
  amount: string | number
  created_at: string
  updated_at: string
  status: string
  bank_name: string
}

/** NEW: Order transactions rows */
type OrderTxRow = {
  id: string
  purchase_id: string | null
  reference_number: string
  created_at: string
  updated_at: string
  total_amount: string | number
}

/** NEW: Refund receipt rows */
type RefundReceiptRow = {
  id: string
  return_refund_id: string
  amount_refunded: string | number
  created_at: string
  updated_at: string
}

/** NEW: Minimal return_refunds + purchases shapes */
type ReturnRefundLight = {
  id: string
  purchase_id: string | null
}
type PurchaseLight = {
  id: string
  user_id: string
}
type PurchaseRef = {
  id: string
  reference_number: string
}

/** NEW: Order receipt row (raw) */
type OrderReceiptRow = {
  id: string
  amount: string | number
  created_at: string
  updated_at: string
  reference_number: string | null
  purchase_id: string
}

/** NEW: Grouped order receipt summary (by reference_number) */
type OrderReceiptGroup = {
  reference_number: string
  total_amount: number
  latest_when: string
}

/** NEW: Game receipt row */
type GameReceiptRow = {
  id: string
  user_id: string
  entry_id: string | null
  event_id: string | null
  created_at: string
  updated_at: string
}

/** NEW: Event light for computing results */
type EventLite = {
  id: string
  title: string
  entry_fee: string | number
  user_id_winner: string | null
  winner_refund_amount: string | number | null
  loser_refund_amount: string | number | null
  created_at: string
  updated_at: string
}

/** NEW: Discount credits receipt row */
type DiscountCreditsReceiptRow = {
  id: string
  created_at: string
  updated_at: string
  purchase_id: string
  amount_discounted: string | number
  reference_number: string
}

/** NEW: Grouped discount credits summary (by reference_number) */
type DiscountCreditsGroup = {
  reference_number: string
  total_discount: number
  latest_when: string
}

/** NEW: Cancelled receipt row */
type CancelledReceiptRow = {
  id: string
  created_at: string
  updated_at: string
  reference_number: string | null
  purchase_id: string | null
}

/** NEW: Grouped cancelled summary (by reference_number) */
type CancelledGroup = {
  reference_number: string
  latest_when: string
  total_amount: number
}

/** NEW: Cancelled ewallet receipt row */
type CancelledEwalletReceiptRow = {
  id: string
  amount: string | number
  created_at: string
  updated_at: string
  reference_number: string | null
  purchase_id: string | null
}

/** NEW: Grouped cancelled ewallet summary (by reference_number) */
type CancelledEwalletGroup = {
  reference_number: string
  latest_when: string
  total_amount: number
}

/** NEW: Prize purchase light (used when winner) */
type PrizePurchase = {
  id: string
  user_id: string
  reference_number: string
  discounted_price: string | number
}

type UiRow = {
  id: string
  reference_number: string
  bank_name: string
  status: string
  when: string
  message: string
  raw: any
}

const PAGE_SIZE = 20
const items = ref<UiRow[]>([])
const hasMore = ref(false)
const busy = ref({ load: false, more: false })
const userId = ref<string | null>(null)
let rtChannel: ReturnType<typeof supabase.channel> | null = null
let cursor: string | null = null

// unread = pending
const unreadCount = computed(() => items.value.filter(n => n.status === 'pending').length)

function peso(n: string | number) {
  const v = typeof n === 'string' ? Number(n) : n
  return `₱${(isNaN(v) ? 0 : v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function toSentence(tx: TxRow): string {
  const amt = peso(tx.amount)
  const date = fmtDate(tx.updated_at ?? tx.created_at)
  switch (tx.status) {
    case 'approved':
    case 'disbursed':
      return `Your top-up of ${amt} has been disbursed on ${date}. Ref: ${tx.reference_number}.`
    case 'pending':
      return `Your top-up of ${amt} is pending for approval. Ref: ${tx.reference_number}.`
    case 'rejected':
      return `Your top-up of ${amt} was rejected on ${date}. Ref: ${tx.reference_number}.`
    case 'failed':
      return `Your top-up of ${amt} failed to process on ${date}. Ref: ${tx.reference_number}.`
    default:
      return `Your top-up of ${amt} has a status of ${tx.status} as of ${date}. Ref: ${tx.reference_number}.`
  }
}

/** NEW: Order transaction sentence */
function orderTxSentence(o: OrderTxRow): string {
  const amt = peso(o.total_amount)
  const date = fmtDate(o.updated_at ?? o.created_at)
  return `Your order payment of ${amt} was recorded on ${date}. Ref: ${o.reference_number}.`
}

/** NEW: Order receipt grouped sentence */
function orderReceiptSentence(total: number, reference_number: string, whenIso: string): string {
  const amt = peso(total)
  const date = fmtDate(whenIso)
  return `Total payment for Order #${reference_number}: ${amt} (as of ${date}).`
}

/** NEW: Refund receipt sentence */
function refundReceiptSentence(amount: string | number, purchaseRef: string): string {
  const amt = peso(amount)
  return `${amt} has been refunded to your e-wallet for Order #${purchaseRef}.`
}

/** NEW: Discount credits grouped sentence */
function discountCreditsSentence(total: number, reference_number: string, whenIso: string): string {
  const amt = peso(total)
  const date = fmtDate(whenIso)
  return `An amount of ${amt} has been deducted from your discount credit balance for Order #${reference_number} (as of ${date}).`
}

/** NEW: Game receipt sentence */
function gameReceiptSentence(e: EventLite, whenIso: string, isWinner: boolean): string {
  const date = fmtDate(whenIso)
  const entry = peso(e.entry_fee)
  const refundBase = isWinner ? e.winner_refund_amount : e.loser_refund_amount
  const refund = peso(typeof refundBase === 'string' ? Number(refundBase) : (refundBase ?? 0))
  const outcome = isWinner ? 'You won' : 'You lost'
  return `Mini game "${e.title}" on ${date}: ${outcome}. Entry fee ${entry}. Refunded ${refund} to your e-wallet.`
}

/** NEW: Append prize snippet */
function gamePrizeSnippet(prize: PrizePurchase): string {
  const amt = peso(typeof prize.discounted_price === 'string' ? Number(prize.discounted_price) : prize.discounted_price)
  return ` Prize product: Order #${prize.reference_number} (Discounted price ${amt}).`
}

/** NEW: Cancelled receipt sentence (grouped, COD) */
function cancelledReceiptGroupSentence(total: number, ref: string, whenIso: string): string {
  const date = fmtDate(whenIso)
  const amt = peso(total)
  return `Order #${ref} was cancelled on ${date}. Payment method: Cash on Delivery (COD). Total amount: ${amt}.`
}

/** NEW: Cancelled ewallet sentence (grouped) */
function cancelledEwalletGroupSentence(total: number, ref: string, whenIso: string): string {
  const date = fmtDate(whenIso)
  const amt = peso(total)
  return `Order #${ref} was cancelled on ${date}. Payment method: E-wallet. Total amount: ${amt}.`
}

function txIconClass(s: string) {
  switch (s) {
    case 'approved': return 'bi bi-check-circle-fill text-success'
    case 'rejected':
    case 'failed': return 'bi bi-x-circle-fill text-danger'
    case 'pending': return 'bi bi-hourglass-split text-warning'
    /** NEW: order icon */
    case 'order': return 'bi bi-receipt text-primary'
    /** NEW: refund icon */
    case 'refund': return 'bi bi-arrow-counterclockwise text-success'
    /** NEW: order receipt total icon */
    case 'order_total': return 'bi bi-receipt text-primary'
    /** NEW: game icons */
    case 'game_win': return 'bi bi-trophy-fill text-warning'
    case 'game_lose': return 'bi bi-emoji-frown-fill text-secondary'
    /** NEW: discount credits icon */
    case 'discount_credits': return 'bi bi-percent text-success'
    /** NEW: cancelled COD icon */
    case 'cancelled_cod': return 'bi bi-bag-x-fill text-danger'
    /** NEW: cancelled ewallet icon */
    case 'cancelled_ewallet': return 'bi bi-wallet2 text-danger'
    default: return 'bi bi-bell'
  }
}

function timeAgo(iso: string) {
  const dt = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - dt)
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function toUiRow(tx: TxRow): UiRow {
  return {
    id: tx.id,
    reference_number: tx.reference_number,
    bank_name: tx.bank_name,
    status: tx.status,
    when: tx.updated_at ?? tx.created_at,
    message: toSentence(tx),
    raw: tx,
  }
}

/** NEW: map order tx to UI */
function orderTxToUiRow(o: OrderTxRow): UiRow {
  return {
    id: `order_${o.id}`,
    reference_number: o.reference_number,
    bank_name: '—',
    status: 'order',
    when: o.updated_at ?? o.created_at,
    message: orderTxSentence(o),
    raw: o,
  }
}

/** NEW: map order receipt group to UI */
function orderReceiptGroupToUiRow(g: OrderReceiptGroup): UiRow {
  return {
    id: `order_total_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'order_total',
    when: g.latest_when,
    message: orderReceiptSentence(g.total_amount, g.reference_number, g.latest_when),
    raw: g,
  }
}

/** NEW: map refund receipt to UI */
function refundReceiptToUiRow(r: RefundReceiptRow, purchaseRef: string): UiRow {
  return {
    id: `refund_${r.id}`,
    reference_number: purchaseRef,
    bank_name: '—',
    status: 'refund',
    when: r.updated_at ?? r.created_at,
    message: refundReceiptSentence(r.amount_refunded, purchaseRef),
    raw: r,
  }
}

/** NEW: map discount credits group to UI */
function discountCreditsGroupToUiRow(g: DiscountCreditsGroup): UiRow {
  return {
    id: `discount_credits_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'discount_credits',
    when: g.latest_when,
    message: discountCreditsSentence(g.total_discount, g.reference_number, g.latest_when),
    raw: g,
  }
}

/** NEW: map game receipt to UI (optionally includes prize purchase when winner) */
function gameReceiptToUiRow(gr: GameReceiptRow, e: EventLite, isWinner: boolean, prize?: PrizePurchase): UiRow {
  const whenIso = gr.updated_at ?? gr.created_at
  const base = gameReceiptSentence(e, whenIso, isWinner)
  const message = isWinner && prize ? `${base}${gamePrizeSnippet(prize)}` : base
  return {
    id: `game_${gr.id}`,
    reference_number: prize?.reference_number ?? '—',
    bank_name: '—',
    status: isWinner ? 'game_win' : 'game_lose',
    when: whenIso,
    message,
    raw: { gr, e, prize },
  }
}

/** NEW: map grouped cancelled COD receipt to UI */
function cancelledGroupToUiRow(g: CancelledGroup): UiRow {
  return {
    id: `cancelled_group_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'cancelled_cod',
    when: g.latest_when,
    message: cancelledReceiptGroupSentence(g.total_amount, g.reference_number, g.latest_when),
    raw: g,
  }
}

/** NEW: map grouped cancelled E-wallet receipt to UI */
function cancelledEwalletGroupToUiRow(g: CancelledEwalletGroup): UiRow {
  return {
    id: `cancelled_ewallet_group_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'cancelled_ewallet',
    when: g.latest_when,
    message: cancelledEwalletGroupSentence(g.total_amount, g.reference_number, g.latest_when),
    raw: g,
  }
}

/** (kept) map single cancelled receipt to UI (unused in merge, but not removed) */
function cancelledReceiptToUiRow(c: CancelledReceiptRow): UiRow {
  const whenIso = c.updated_at ?? c.created_at
  return {
    id: `cancelled_${c.id}`,
    reference_number: c.reference_number ?? '—',
    bank_name: '—',
    status: 'cancelled_cod',
    when: whenIso,
    message: `Order #${c.reference_number ?? '—'} was cancelled on ${fmtDate(whenIso)}. Payment method: Cash on Delivery (COD).`,
    raw: c,
  }
}

async function fetchPage(initial = false) {
  if (!userId.value) return
  if (initial) busy.value.load = true
  else busy.value.more = true
  try {
    let q = supabase
      .schema('ewallet')
      .from('transactions')
      .select('id,user_id,reference_number,amount,created_at,updated_at,status,bank_name')
      .eq('user_id', userId.value)
      .order('updated_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (cursor) q = q.lt('updated_at', cursor)
    const { data, error } = await q
    if (error) throw error

    const rows = (data ?? []) as TxRow[]
    const mapped = rows.map(toUiRow)
    if (initial) items.value = mapped
    else items.value.push(...mapped)

    hasMore.value = rows.length === PAGE_SIZE
    cursor = rows.length ? rows[rows.length - 1].updated_at : cursor

    // Initial: include grouped/extra sources
    if (initial) {
      const [
        orderItems,
        refundItems,
        orderReceiptTotals,
        gameItems,
        discountCreditTotals,
        cancelledGroupedItems,
        cancelledEwalletGroupedItems
      ] = await Promise.all([
        fetchRecentOrderTransactions(),
        fetchRecentRefundReceipts(),
        fetchRecentOrderReceiptTotals(),
        fetchRecentGameReceipts(),
        fetchRecentDiscountCreditsTotals(),
        fetchRecentCancelledReceiptTotals(),       // COD (grouped)
        fetchRecentCancelledEwalletReceiptTotals() // E-wallet (grouped)
      ])
      const merged = [
        ...items.value,
        ...orderItems,
        ...refundItems,
        ...orderReceiptTotals,
        ...gameItems,
        ...discountCreditTotals,
        ...cancelledGroupedItems,
        ...cancelledEwalletGroupedItems
      ].sort((a, b) => {
        return new Date(b.when).getTime() - new Date(a.when).getTime()
      })
      items.value = merged
    }
  } finally {
    busy.value.load = false
    busy.value.more = false
  }
}

/** NEW: Fetch recent order transactions as notifications (filtered to current user via purchases) */
async function fetchRecentOrderTransactions(): Promise<UiRow[]> {
  if (!userId.value) return []

  const { data: orders, error: oErr } = await supabase
    .schema('ewallet')
    .from('order_transactions')
    .select('id,purchase_id,reference_number,created_at,updated_at,total_amount')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (oErr) {
    console.error('order_transactions fetch error:', oErr)
    return []
  }

  const orderRows = (orders ?? []) as OrderTxRow[]
  if (!orderRows.length) return []

  const purchaseIds = Array.from(new Set(orderRows.map(o => o.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id')
      .in('id', purchaseIds)
      .eq('user_id', userId.value)

    if (pErr) {
      console.error('games.purchases fetch error:', pErr)
      return []
    }

    for (const p of (purchases ?? []) as PurchaseLight[]) {
      allowedPurchaseIds.add(p.id)
    }
  }

  const filtered = orderRows.filter(o => o.purchase_id && allowedPurchaseIds.has(o.purchase_id))
  return filtered.map(orderTxToUiRow)
}

/** NEW: Fetch recent refund receipts and map to UI (only user's purchases) */
async function fetchRecentRefundReceipts(): Promise<UiRow[]> {
  if (!userId.value) return []

  const { data: refunds, error: rErr } = await supabase
    .schema('ewallet')
    .from('refund_receipt')
    .select('id,return_refund_id,amount_refunded,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (rErr) {
    console.error('refund_receipt fetch error:', rErr)
    return []
  }

  const refundRows = (refunds ?? []) as RefundReceiptRow[]
  if (!refundRows.length) return []

  const rrIds = Array.from(new Set(refundRows.map(r => r.return_refund_id)))
  const { data: rrList, error: rrErr } = await supabase
    .schema('games')
    .from('return_refunds')
    .select('id,purchase_id')
    .in('id', rrIds)

  if (rrErr) {
    console.error('games.return_refunds fetch error:', rrErr)
    return []
  }

  const rrById = new Map<string, ReturnRefundLight>()
  for (const rr of (rrList ?? []) as ReturnRefundLight[]) {
    rrById.set(rr.id, rr)
  }

  const purchaseIds = Array.from(new Set(
    (rrList ?? []).map(rr => rr.purchase_id).filter(Boolean) as string[]
  ))

  if (!purchaseIds.length) return []

  const { data: purchases, error: pErr } = await supabase
    .schema('games')
    .from('purchases')
    .select('id,user_id,reference_number')
    .in('id', purchaseIds)
    .eq('user_id', userId.value)

  if (pErr) {
    console.error('games.purchases (for refunds) fetch error:', pErr)
    return []
  }

  const purchaseRefById = new Map<string, string>()
  const allowedPurchaseIds = new Set<string>()
  for (const p of (purchases ?? []) as (PurchaseLight & PurchaseRef)[]) {
    allowedPurchaseIds.add(p.id)
    purchaseRefById.set(p.id, p.reference_number)
  }

  const ui: UiRow[] = []
  for (const r of refundRows) {
    const rr = rrById.get(r.return_refund_id)
    if (!rr || !rr.purchase_id) continue
    if (!allowedPurchaseIds.has(rr.purchase_id)) continue
    const purchaseRef = purchaseRefById.get(rr.purchase_id)
    if (!purchaseRef) continue
    ui.push(refundReceiptToUiRow(r, purchaseRef))
  }

  return ui
}

/** NEW: Fetch grouped order_receipt totals (by reference_number) for the current user and map to UI */
async function fetchRecentOrderReceiptTotals(): Promise<UiRow[]> {
  if (!userId.value) return []

  const { data, error } = await supabase
    .schema('ewallet')
    .from('order_receipt')
    .select('id,amount,created_at,updated_at,reference_number,purchase_id')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE * 5)
  if (error) {
    console.error('order_receipt fetch error:', error)
    return []
  }

  const raw = (data ?? []) as OrderReceiptRow[]
  if (!raw.length) return []

  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id)))
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id')
      .in('id', purchaseIds)
      .eq('user_id', userId.value)

    if (pErr) {
      console.error('games.purchases (for order_receipt) fetch error:', pErr)
      return []
    }
    for (const p of (purchases ?? []) as PurchaseLight[]) {
      allowedPurchaseIds.add(p.id)
    }
  }

  const filtered = raw.filter(r => allowedPurchaseIds.has(r.purchase_id) && !!r.reference_number) as (OrderReceiptRow & { reference_number: string })[]

  if (!filtered.length) return []

  const groups = new Map<string, OrderReceiptGroup>()
  for (const r of filtered) {
    const key = r.reference_number
    const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
    const when = r.updated_at ?? r.created_at
    if (!groups.has(key)) {
      groups.set(key, { reference_number: key, total_amount: isNaN(amt) ? 0 : amt, latest_when: when })
    } else {
      const g = groups.get(key)!
      g.total_amount += isNaN(amt) ? 0 : amt
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) {
        g.latest_when = when
      }
    }
  }

  const ui = Array.from(groups.values()).map(orderReceiptGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

/** NEW: Fetch grouped discount_credits_receipt totals (by reference_number) for current user and map to UI */
async function fetchRecentDiscountCreditsTotals(): Promise<UiRow[]> {
  if (!userId.value) return []

  const { data, error } = await supabase
    .schema('ewallet')
    .from('discount_credits_receipt')
    .select('id,created_at,updated_at,purchase_id,amount_discounted,reference_number')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE * 5)
  if (error) {
    console.error('discount_credits_receipt fetch error:', error)
    return []
  }

  const raw = (data ?? []) as DiscountCreditsReceiptRow[]
  if (!raw.length) return []

  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id)))
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id')
      .in('id', purchaseIds)
      .eq('user_id', userId.value)
    if (pErr) {
      console.error('games.purchases (for discount_credits) fetch error:', pErr)
      return []
    }
    for (const p of (purchases ?? []) as PurchaseLight[]) {
      allowedPurchaseIds.add(p.id)
    }
  }

  const filtered = raw.filter(r => allowedPurchaseIds.has(r.purchase_id) && !!r.reference_number)
  if (!filtered.length) return []

  const groups = new Map<string, DiscountCreditsGroup>()
  for (const r of filtered) {
    const key = r.reference_number
    const amt = typeof r.amount_discounted === 'string' ? Number(r.amount_discounted) : r.amount_discounted
    const when = r.updated_at ?? r.created_at
    if (!groups.has(key)) {
      groups.set(key, { reference_number: key, total_discount: isNaN(amt) ? 0 : amt, latest_when: when })
    } else {
      const g = groups.get(key)!
      g.total_discount += isNaN(amt) ? 0 : amt
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) {
        g.latest_when = when
      }
    }
  }

  const ui = Array.from(groups.values()).map(discountCreditsGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

/** NEW: Fetch recent game receipts (winner/loser, entry fee, refunded amount) + prize product when winner */
async function fetchRecentGameReceipts(): Promise<UiRow[]> {
  if (!userId.value) return []

  // 1) Pull the user's game receipts
  const { data: receipts, error: gErr } = await supabase
    .schema('ewallet')
    .from('game_receipt')
    .select('id,user_id,entry_id,event_id,created_at,updated_at')
    .eq('user_id', userId.value)
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)
  if (gErr) {
    console.error('game_receipt fetch error:', gErr)
    return []
  }

  const rows = (receipts ?? []) as GameReceiptRow[]
  if (!rows.length) return []

  // 2) Fetch related events to determine winner/loser and amounts
  const eventIds = Array.from(new Set(rows.map(r => r.event_id).filter(Boolean))) as string[]
  let eventsById = new Map<string, EventLite>()

  if (eventIds.length) {
    const { data: events, error: eErr } = await supabase
      .schema('games')
      .from('event')
      .select('id,title,entry_fee,user_id_winner,winner_refund_amount,loser_refund_amount,created_at,updated_at')
      .in('id', eventIds)

    if (eErr) {
      console.error('games.event fetch error:', eErr)
    } else {
      for (const e of (events ?? []) as EventLite[]) {
        eventsById.set(e.id, e)
      }
    }
  }

  // 3) If user is winner for some events, fetch prize purchases whose reference_number == event_id
  const winnerEventIds = rows
    .map(r => r.event_id)
    .filter((eid): eid is string => !!eid && eventsById.get(eid)?.user_id_winner === userId.value)

  let prizeByRef = new Map<string, PrizePurchase>()
  if (winnerEventIds.length) {
    const { data: prizes, error: prErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id,reference_number,discounted_price')
      .in('reference_number', winnerEventIds)   // event_id matches purchases.reference_number
      .eq('user_id', userId.value)              // only current user's purchases
    if (prErr) {
      console.error('games.purchases (prize lookup) error:', prErr)
    } else {
      for (const p of (prizes ?? []) as PrizePurchase[]) {
        prizeByRef.set(p.reference_number, p)
      }
    }
  }

  // 4) Map each game receipt -> UI row (append prize snippet for winners with a matched purchase)
  const ui: UiRow[] = []
  for (const r of rows) {
    const ev = r.event_id ? eventsById.get(r.event_id) : undefined
    if (!ev) {
      ui.push(
        gameReceiptToUiRow(
          r,
          {
            id: '—', title: 'Mini Game', entry_fee: 0, user_id_winner: null,
            winner_refund_amount: 0, loser_refund_amount: 0,
            created_at: r.created_at, updated_at: r.updated_at
          },
          false
        )
      )
    } else {
      const isWinner = ev.user_id_winner === userId.value
      const prize = isWinner && r.event_id ? prizeByRef.get(r.event_id) : undefined
      ui.push(gameReceiptToUiRow(r, ev, isWinner, prize))
    }
  }

  // Sort by when (desc)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

/** (kept) Ungrouped cancelled receipts (not used in merge; retained to avoid removals) */
async function fetchRecentCancelledReceipts(): Promise<UiRow[]> {
  if (!userId.value) return []

  const { data, error } = await supabase
    .schema('ewallet')
    .from('cancelled_receipt')
    .select('id,created_at,updated_at,reference_number,purchase_id')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (error) {
    console.error('cancelled_receipt fetch error:', error)
    return []
  }

  const raw = (data ?? []) as CancelledReceiptRow[]
  if (!raw.length) return []

  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id')
      .in('id', purchaseIds)
      .eq('user_id', userId.value)
    if (pErr) {
      console.error('games.purchases (for cancelled_receipt) fetch error:', pErr)
      return []
    }
    for (const p of (purchases ?? []) as PurchaseLight[]) {
      allowedPurchaseIds.add(p.id)
    }
  }

  const filtered = raw.filter(r => r.purchase_id && allowedPurchaseIds.has(r.purchase_id))
  const ui = filtered.map(cancelledReceiptToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

/** NEW: Group cancelled_receipt by reference_number and total price from order_receipt */
async function fetchRecentCancelledReceiptTotals(): Promise<UiRow[]> {
  if (!userId.value) return []

  // 1) Pull cancelled receipts
  const { data, error } = await supabase
    .schema('ewallet')
    .from('cancelled_receipt')
    .select('id,created_at,updated_at,reference_number,purchase_id')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE * 5)
  if (error) {
    console.error('cancelled_receipt fetch error:', error)
    return []
  }

  const raw = (data ?? []) as CancelledReceiptRow[]
  if (!raw.length) return []

  // 2) Filter to user's purchases
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id')
      .in('id', purchaseIds)
      .eq('user_id', userId.value)
    if (pErr) {
      console.error('games.purchases (for cancelled grouped) fetch error:', pErr)
      return []
    }
    for (const p of (purchases ?? []) as PurchaseLight[]) {
      allowedPurchaseIds.add(p.id)
    }
  }

  const filtered = raw.filter(r => !!r.reference_number && r.purchase_id && allowedPurchaseIds.has(r.purchase_id)) as (CancelledReceiptRow & { reference_number: string, purchase_id: string })[]
  if (!filtered.length) return []

  // 3) Build groups by reference_number (track latest_when)
  const groups = new Map<string, CancelledGroup>()
  for (const c of filtered) {
    const key = c.reference_number
    const when = c.updated_at ?? c.created_at
    if (!groups.has(key)) {
      groups.set(key, { reference_number: key, latest_when: when, total_amount: 0 })
    } else {
      const g = groups.get(key)!
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) {
        g.latest_when = when
      }
    }
  }

  // 4) For those reference_numbers, total the price from order_receipt (sum of amount for same ref + same user)
  const refs = Array.from(groups.keys())
  if (refs.length) {
    const { data: receipts, error: rErr } = await supabase
      .schema('ewallet')
      .from('order_receipt')
      .select('id,amount,reference_number,purchase_id,created_at,updated_at')
      .in('reference_number', refs)
    if (rErr) {
      console.error('order_receipt fetch (for cancelled totals) error:', rErr)
    } else {
      // filter those order_receipts to user's purchases
      const orderPurchaseIds = Array.from(new Set((receipts ?? []).map(r => r.purchase_id))) as string[]
      let allowedOrderPurchaseIds = new Set<string>()
      if (orderPurchaseIds.length) {
        const { data: purchase2, error: p2Err } = await supabase
          .schema('games')
          .from('purchases')
          .select('id,user_id')
          .in('id', orderPurchaseIds)
          .eq('user_id', userId.value)
        if (p2Err) {
          console.error('games.purchases (verify order_receipt ownership) error:', p2Err)
        } else {
          for (const p of (purchase2 ?? []) as PurchaseLight[]) {
            allowedOrderPurchaseIds.add(p.id)
          }
        }
      }
      for (const r of (receipts ?? []) as OrderReceiptRow[]) {
        if (!r.reference_number || !allowedOrderPurchaseIds.has(r.purchase_id)) continue
        const g = groups.get(r.reference_number)
        if (!g) continue
        const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
        g.total_amount += isNaN(amt) ? 0 : amt
        const when = r.updated_at ?? r.created_at
        if (new Date(when).getTime() > new Date(g.latest_when).getTime()) {
          g.latest_when = when
        }
      }
    }
  }

  // 5) Map to UI
  const ui = Array.from(groups.values()).map(cancelledGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

/** NEW: Group cancelled_ewallet_receipt by reference_number and total its amount */
async function fetchRecentCancelledEwalletReceiptTotals(): Promise<UiRow[]> {
  if (!userId.value) return []

  // 1) Pull cancelled ewallet receipts
  const { data, error } = await supabase
    .schema('ewallet')
    .from('cancelled_ewallet_receipt')
    .select('id,amount,created_at,updated_at,reference_number,purchase_id')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE * 5)
  if (error) {
    console.error('cancelled_ewallet_receipt fetch error:', error)
    return []
  }

  const raw = (data ?? []) as CancelledEwalletReceiptRow[]
  if (!raw.length) return []

  // 2) Filter to user's purchases
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase
      .schema('games')
      .from('purchases')
      .select('id,user_id')
      .in('id', purchaseIds)
      .eq('user_id', userId.value)
    if (pErr) {
      console.error('games.purchases (for cancelled_ewallet_receipt) fetch error:', pErr)
      return []
    }
    for (const p of (purchases ?? []) as PurchaseLight[]) {
      allowedPurchaseIds.add(p.id)
    }
  }

  const filtered = raw.filter(r => !!r.reference_number && r.purchase_id && allowedPurchaseIds.has(r.purchase_id)) as (CancelledEwalletReceiptRow & { reference_number: string, purchase_id: string })[]
  if (!filtered.length) return []

  // 3) Group by reference_number, sum amount, keep latest timestamp
  const groups = new Map<string, CancelledEwalletGroup>()
  for (const c of filtered) {
    const key = c.reference_number
    const when = c.updated_at ?? c.created_at
    const amt = typeof c.amount === 'string' ? Number(c.amount) : c.amount
    if (!groups.has(key)) {
      groups.set(key, { reference_number: key, latest_when: when, total_amount: isNaN(amt) ? 0 : amt })
    } else {
      const g = groups.get(key)!
      g.total_amount += isNaN(amt) ? 0 : amt
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) {
        g.latest_when = when
      }
    }
  }

  // 4) Map to UI rows and sort
  const ui = Array.from(groups.values()).map(cancelledEwalletGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function reload() {
  cursor = null
  await fetchPage(true)
}

async function loadMore() {
  await fetchPage(false)
}

function bindRealtime() {
  if (rtChannel || !userId.value) return
  rtChannel = supabase
    .channel('rt-ewallet-transactions-' + userId.value)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` },
      payload => {
        const tx = payload.new as TxRow
        items.value.unshift(toUiRow(tx))
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` },
      payload => {
        const tx = payload.new as TxRow
        const i = items.value.findIndex(n => n.id === tx.id)
        const ui = toUiRow(tx)
        if (i !== -1) items.value[i] = ui
        else items.value.unshift(ui)
      },
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` },
      payload => {
        const oldTx = payload.old as TxRow
        items.value = items.value.filter(n => n.id !== oldTx.id)
      },
    )
    .subscribe()

  // Realtime for refunds, order_receipt totals, game_receipt, discount_credits, cancelled_receipt, and cancelled_ewallet_receipt not bound.
}

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  userId.value = auth?.user?.id ?? null
  await reload()
  bindRealtime()
})

onUnmounted(() => {
  if (rtChannel) supabase.removeChannel(rtChannel)
})
</script>

<style scoped>
.bg-light-subtle { background: #f8f9fa; }
</style>
