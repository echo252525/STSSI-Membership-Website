<template>
  <div class="card shadow-sm border-0">
    <div class="card-header d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-bell"></i>
        <strong>Notifications</strong>
        <!-- 🔴 show external override (window event) if provided, else computed unread -->
        <transition name="badge-pop" mode="out-in">
          <span
            v-if="displayUnreadCount > 0"
            :key="displayUnreadCount"
            class="badge text-bg-danger"
            aria-live="polite"
            :title="`${displayUnreadCount} unread notification${displayUnreadCount === 1 ? '' : 's'}`"
          >
            {{ displayUnreadCount }}
          </span>
        </transition>
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
        :class="[
          { 'bg-light-subtle': n.status === 'pending' },
          isClickable(n) ? 'list-group-item-action cursor-pointer' : '',
          isSeen(n) ? 'notif-seen' : 'notif-seens'
        ]"
        :tabindex="isClickable(n) ? 0 : -1"
        :role="isClickable(n) ? 'button' : undefined"
        @click="onClick(n)"
        @keydown.enter.prevent="onClick(n)"
        @keydown.space.prevent="onClick(n)"
        @focus="markViewed(n)"
        v-seen-on-view="() => markViewed(n)"
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
            Ref: {{ n.reference_number }}
            <span v-if="n.bank_name && n.bank_name !== '—'">| Bank: {{ n.bank_name }}</span>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Directive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

/* 🔔 parent sync */
const emit = defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'close'): void
}>()

type TxRow = { id: string; user_id: string; reference_number: string; amount: string | number; created_at: string; updated_at: string; status: string; bank_name: string }
type OrderTxRow = { id: string; purchase_id: string | null; reference_number: string; created_at: string; updated_at: string; total_amount: string | number }
type RefundReceiptRow = { id: string; return_refund_id: string; amount_refunded: string | number; created_at: string; updated_at: string }
type ReturnRefundLight = { id: string; purchase_id: string | null }
type PurchaseLight = { id: string; user_id: string }
type PurchaseRef = { id: string; reference_number: string }
type OrderReceiptRow = { id: string; amount: string | number; created_at: string; updated_at: string; reference_number: string | null; purchase_id: string }
type OrderReceiptGroup = { reference_number: string; total_amount: number; latest_when: string; purchase_id?: string | null }
type GameReceiptRow = { id: string; user_id: string; entry_id: string | null; event_id: string | null; created_at: string; updated_at: string }
type EventLite = { id: string; title: string; entry_fee: string | number; user_id_winner: string | null; winner_refund_amount: string | number | null; loser_refund_amount: string | number | null; created_at: string; updated_at: string }
type DiscountCreditsReceiptRow = { id: string; created_at: string; updated_at: string; purchase_id: string; amount_discounted: string | number; reference_number: string }
type DiscountCreditsGroup = { reference_number: string; total_discount: number; latest_when: string; purchase_id?: string | null }
type CancelledReceiptRow = { id: string; created_at: string; updated_at: string; reference_number: string | null; purchase_id: string | null }
type CancelledGroup = { reference_number: string; latest_when: string; total_amount: number; purchase_id?: string | null }
type CancelledEwalletReceiptRow = { id: string; amount: string | number; created_at: string; updated_at: string; reference_number: string | null; purchase_id: string | null }
type CancelledEwalletGroup = { reference_number: string; latest_when: string; total_amount: number; purchase_id?: string | null }
type PrizePurchase = { id: string; user_id: string; reference_number: string; discounted_price: string | number }

type UiRow = {
  id: string
  reference_number: string
  bank_name: string
  status: string
  when: string
  message: string
  raw: any
  purchase_id?: string | null
  source?: string
}

const PAGE_SIZE = 20
const items = ref<UiRow[]>([])
const hasMore = ref(false)
const busy = ref({ load: false, more: false })
const userId = ref<string | null>(null)
let rtChannel: ReturnType<typeof supabase.channel> | null = null
let cursor: string | null = null

const router = useRouter()

/* ===== Seen tracking (only decrements on click) ===== */
const seenIds = ref<Set<string>>(new Set())
const storageKey = () => (userId.value ? `notif:seen:${userId.value}` : 'notif:seen')
function loadSeen() { try { const raw = localStorage.getItem(storageKey()); if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr)) seenIds.value = new Set(arr as string[]) } } catch {} }
function saveSeen() { try { localStorage.setItem(storageKey(), JSON.stringify(Array.from(seenIds.value))) } catch {} }
function isSeen(n: UiRow) { return seenIds.value.has(n.id) }

// 🆕 view/focus should NOT affect unread count
function markViewed(_n: UiRow) { /* intentionally no-op for unread logic */ }

function markSeen(n: UiRow) {
  if (!isSeen(n)) {
    const next = new Set(seenIds.value)
    next.add(n.id)
    seenIds.value = next
    saveSeen()
    const newCount = unreadCount.value
    externalUnreadOverride.value = newCount
    emit('update:count', newCount)
    window.dispatchEvent(new CustomEvent('notif:count', { detail: newCount }))
  }
}

// Unread = all items not seen (click-only marks as seen)
const unreadCount = computed(() => items.value.filter(n => !isSeen(n)).length)

/* External override + displayed badge */
const externalUnreadOverride = ref<number | null>(null)
const displayUnreadCount = computed(() => externalUnreadOverride.value ?? unreadCount.value)

/* Keep parent and floating badges in sync whenever the list changes */
watch(items, () => {
  const c = unreadCount.value
  emit('update:count', c)
  externalUnreadOverride.value = c
  window.dispatchEvent(new CustomEvent('notif:count', { detail: c }))
}, { deep: true })

function onNotifCountEvent(e: CustomEvent<number> | Event) {
  const evt = e as CustomEvent<number>
  const n = Number(evt.detail)
  if (!Number.isNaN(n) && n >= 0) {
    externalUnreadOverride.value = n
    emit('update:count', n)
  }
}

function peso(n: string | number) {
  const v = typeof n === 'string' ? Number(n) : n
  return `₱${(isNaN(v) ? 0 : v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function toSentence(tx: TxRow): string {
  const amt = peso(tx.amount)
  const date = fmtDate(tx.updated_at ?? tx.created_at)
  switch (tx.status) {
    case 'approved':
    case 'disbursed': return `Your top-up of ${amt} has been disbursed on ${date}. Ref: ${tx.reference_number}.`
    case 'pending': return `Your top-up of ${amt} is pending for approval. Ref: ${tx.reference_number}.`
    case 'rejected': return `Your top-up of ${amt} was rejected on ${date}. Ref: ${tx.reference_number}.`
    case 'failed': return `Your top-up of ${amt} failed to process on ${date}. Ref: ${tx.reference_number}.`
    default: return `Your top-up of ${amt} has a status of ${tx.status} as of ${date}. Ref: ${tx.reference_number}.`
  }
}

function orderTxSentence(o: OrderTxRow): string {
  const amt = peso(o.total_amount)
  const date = fmtDate(o.updated_at ?? o.created_at)
  return `1. Your order payment of ${amt} was recorded on ${date}.`
}

function orderReceiptSentence(total: number, reference_number: string, whenIso: string): string {
  const amt = peso(total)
  const date = fmtDate(whenIso)
  return `2. Your total payment of ${amt} for order #${reference_number} on ${date} was succesfully processed.`
}

function refundReceiptSentence(amount: string | number, purchaseRef: string): string {
  const amt = peso(amount)
  return `3. ${amt} has been refunded to your e-wallet for order #${purchaseRef}.`
}

function discountCreditsSentence(total: number, reference_number: string, whenIso: string): string {
  const amt = peso(total)
  const date = fmtDate(whenIso)
  return `4. ${amt} has been deducted from your discount credit balance for order #${reference_number} on ${date}.`
}

function gameReceiptSentence(e: EventLite, whenIso: string, isWinner: boolean): string {
  const date = fmtDate(whenIso)
  const entry = peso(e.entry_fee)
  const refundBase = isWinner ? e.winner_refund_amount : e.loser_refund_amount
  const refund = peso(typeof refundBase === 'string' ? Number(refundBase) : (refundBase ?? 0))
  const outcome = isWinner ? 'Congratulations, you won!' : 'You lost'
  return `5. You joined the mini game "${e.title}" on ${date} with an entry fee of ${entry}. ${outcome}. ${refund} has been refunded to your e-wallet.`
}

function gamePrizeSnippet(prize: PrizePurchase): string {
  const amt = peso(typeof prize.discounted_price === 'string' ? Number(prize.discounted_price) : prize.discounted_price)
  return ` 6. Prize product: order #${prize.reference_number} (Discounted price ${amt}).`
}

function cancelledReceiptGroupSentence(total: number, ref: string, whenIso: string): string {
  const date = fmtDate(whenIso)
  const amt = peso(total)
  return `7. Your order #${ref} was cancelled on ${date}. The payment method was {payMethod}, with a total amount of ${amt}.`
}

function cancelledEwalletGroupSentence(total: number, ref: string, whenIso: string): string {
  const date = fmtDate(whenIso)
  const amt = peso(total)
  return `8. Your e-wallet payment for order #${ref} was cancelled on ${date}. The total amount of ${amt} will no longer be deducted.`
}

function txIconClass(s: string) {
  switch (s) {
    case 'approved': return 'bi bi-check-circle-fill text-success'
    case 'rejected':
    case 'failed': return 'bi bi-x-circle-fill text-danger'
    case 'pending': return 'bi bi-hourglass-split text-warning'
    case 'order': return 'bi bi-receipt text-primary'
    case 'refund': return 'bi bi-arrow-counterclockwise text-success'
    case 'order_total': return 'bi bi-receipt text-primary'
    case 'game_win': return 'bi bi-trophy-fill text-warning'
    case 'game_lose': return 'bi bi-emoji-frown-fill text-secondary'
    case 'discount_credits': return 'bi bi-percent text-success'
    case 'cancelled_cod': return 'bi bi-bag-x-fill text-danger'
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
    purchase_id: null,
    source: 'ewallet.transactions'
  }
}

function orderTxToUiRow(o: OrderTxRow): UiRow {
  return {
    id: `order_${o.id}`,
    reference_number: o.reference_number,
    bank_name: '—',
    status: 'order',
    when: o.updated_at ?? o.created_at,
    message: orderTxSentence(o),
    raw: o,
    purchase_id: o.purchase_id ?? null,
    source: 'ewallet.order_transactions'
  }
}

function orderReceiptGroupToUiRow(g: OrderReceiptGroup): UiRow {
  return {
    id: `order_total_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'order_total',
    when: g.latest_when,
    message: orderReceiptSentence(g.total_amount, g.reference_number, g.latest_when),
    raw: g,
    purchase_id: g.purchase_id ?? null,
    source: 'ewallet.order_receipt_group'
  }
}

function refundReceiptToUiRow(r: RefundReceiptRow, purchaseRef: string, purchaseId: string): UiRow {
  return {
    id: `refund_${r.id}`,
    reference_number: purchaseRef,
    bank_name: '—',
    status: 'refund',
    when: r.updated_at ?? r.created_at,
    message: refundReceiptSentence(r.amount_refunded, purchaseRef),
    raw: r,
    purchase_id: purchaseId,
    source: 'ewallet.refund_receipt'
  }
}

function discountCreditsGroupToUiRow(g: DiscountCreditsGroup): UiRow {
  return {
    id: `discount_credits_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'discount_credits',
    when: g.latest_when,
    message: discountCreditsSentence(g.total_discount, g.reference_number, g.latest_when),
    raw: g,
    purchase_id: g.purchase_id ?? null,
    source: 'ewallet.discount_credits_group'
  }
}

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
    purchase_id: prize?.id ?? null,
    source: 'ewallet.game_receipt'
  }
}

function cancelledGroupToUiRow(g: CancelledGroup): UiRow {
  return {
    id: `cancelled_group_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'cancelled_cod',
    when: g.latest_when,
    message: cancelledReceiptGroupSentence(g.total_amount, g.reference_number, g.latest_when),
    raw: g,
    purchase_id: g.purchase_id ?? null,
    source: 'ewallet.cancelled_group'
  }
}

function cancelledEwalletGroupToUiRow(g: CancelledEwalletGroup): UiRow {
  return {
    id: `cancelled_ewallet_group_${g.reference_number}`,
    reference_number: g.reference_number,
    bank_name: '—',
    status: 'cancelled_ewallet',
    when: g.latest_when,
    message: cancelledEwalletGroupSentence(g.total_amount, g.reference_number, g.latest_when),
    raw: g,
    purchase_id: g.purchase_id ?? null,
    source: 'ewallet.cancelled_ewallet_group'
  }
}

function cancelledReceiptToUiRow(c: CancelledReceiptRow): UiRow {
  const whenIso = c.updated_at ?? c.created_at
  return {
    id: `cancelled_${c.id}`,
    reference_number: c.reference_number ?? '—',
    bank_name: '—',
    status: 'cancelled_cod',
    when: whenIso,
    message: `9. Order #${c.reference_number ?? '—'} was cancelled on ${fmtDate(whenIso)}. Payment method: Cash on Delivery (COD).`,
    raw: c,
    purchase_id: c.purchase_id ?? null,
    source: 'ewallet.cancelled_receipt'
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
        fetchRecentCancelledReceiptTotals(),
        fetchRecentCancelledEwalletReceiptTotals()
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
      ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      items.value = merged
    }

    emit('update:count', unreadCount.value)
  } finally {
    busy.value.load = false
    busy.value.more = false
  }
}

async function fetchRecentOrderTransactions(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data: orders, error: oErr } = await supabase
    .schema('ewallet')
    .from('order_transactions')
    .select('id,purchase_id,reference_number,created_at,updated_at,total_amount')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)
  if (oErr) { console.error('order_transactions fetch error:', oErr); return [] }
  const orderRows = (orders ?? []) as OrderTxRow[]
  if (!orderRows.length) return []
  const purchaseIds = Array.from(new Set(orderRows.map(o => o.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', purchaseIds).eq('user_id', userId.value)
    if (pErr) { console.error('games.purchases fetch error:', pErr); return [] }
    for (const p of (purchases ?? []) as PurchaseLight[]) allowedPurchaseIds.add(p.id)
  }
  const filtered = orderRows.filter(o => o.purchase_id && allowedPurchaseIds.has(o.purchase_id))
  return filtered.map(orderTxToUiRow)
}

async function fetchRecentRefundReceipts(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data: refunds, error: rErr } = await supabase
    .schema('ewallet')
    .from('refund_receipt')
    .select('id,return_refund_id,amount_refunded,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(PAGE_SIZE)
  if (rErr) { console.error('refund_receipt fetch error:', rErr); return [] }
  const refundRows = (refunds ?? []) as RefundReceiptRow[]
  if (!refundRows.length) return []
  const rrIds = Array.from(new Set(refundRows.map(r => r.return_refund_id)))
  const { data: rrList, error: rrErr } = await supabase.schema('games').from('return_refunds').select('id,purchase_id').in('id', rrIds)
  if (rrErr) { console.error('games.return_refunds fetch error:', rrErr); return [] }
  const rrById = new Map<string, ReturnRefundLight>()
  for (const rr of (rrList ?? []) as ReturnRefundLight[]) rrById.set(rr.id, rr)
  const purchaseIds = Array.from(new Set((rrList ?? []).map(rr => rr.purchase_id).filter(Boolean) as string[]))
  if (!purchaseIds.length) return []
  const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id,reference_number').in('id', purchaseIds).eq('user_id', userId.value)
  if (pErr) { console.error('games.purchases (for refunds) fetch error:', pErr); return [] }
  const purchaseRefById = new Map<string, string>()
  const allowedPurchaseIds = new Set<string>()
  for (const p of (purchases ?? []) as (PurchaseLight & PurchaseRef)[]) { allowedPurchaseIds.add(p.id); purchaseRefById.set(p.id, p.reference_number) }
  const ui: UiRow[] = []
  for (const r of refundRows) {
    const rr = rrById.get(r.return_refund_id)
    if (!rr || !rr.purchase_id) continue
    if (!allowedPurchaseIds.has(rr.purchase_id)) continue
    const purchaseRef = purchaseRefById.get(rr.purchase_id)
    if (!purchaseRef) continue
    ui.push(refundReceiptToUiRow(r, purchaseRef, rr.purchase_id))
  }
  return ui
}

async function fetchRecentOrderReceiptTotals(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data, error } = await supabase.schema('ewallet').from('order_receipt').select('id,amount,created_at,updated_at,reference_number,purchase_id').order('updated_at', { ascending: false }).limit(PAGE_SIZE * 5)
  if (error) { console.error('order_receipt fetch error:', error); return [] }
  const raw = (data ?? []) as OrderReceiptRow[]
  if (!raw.length) return []
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id)))
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', purchaseIds).eq('user_id', userId.value)
    if (pErr) { console.error('games.purchases (for order_receipt) fetch error:', pErr); return [] }
    for (const p of (purchases ?? []) as PurchaseLight[]) allowedPurchaseIds.add(p.id)
  }
  const filtered = raw.filter(r => allowedPurchaseIds.has(r.purchase_id) && !!r.reference_number) as (OrderReceiptRow & { reference_number: string })[]
  if (!filtered.length) return []
  const groups = new Map<string, OrderReceiptGroup>()
  for (const r of filtered) {
    const key = r.reference_number
    const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
    const when = r.updated_at ?? r.created_at
    if (!groups.has(key)) groups.set(key, { reference_number: key, total_amount: isNaN(amt) ? 0 : amt, latest_when: when, purchase_id: r.purchase_id })
    else {
      const g = groups.get(key)!
      g.total_amount += isNaN(amt) ? 0 : amt
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) g.latest_when = when
      if (!g.purchase_id) g.purchase_id = r.purchase_id
    }
  }
  const ui = Array.from(groups.values()).map(orderReceiptGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function fetchRecentDiscountCreditsTotals(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data, error } = await supabase.schema('ewallet').from('discount_credits_receipt').select('id,created_at,updated_at,purchase_id,amount_discounted,reference_number').order('updated_at', { ascending: false }).limit(PAGE_SIZE * 5)
  if (error) { console.error('discount_credits_receipt fetch error:', error); return [] }
  const raw = (data ?? []) as DiscountCreditsReceiptRow[]
  if (!raw.length) return []
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id)))
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', purchaseIds).eq('user_id', userId.value)
    if (pErr) { console.error('games.purchases (for discount_credits) fetch error:', pErr); return [] }
    for (const p of (purchases ?? []) as PurchaseLight[]) allowedPurchaseIds.add(p.id)
  }
  const filtered = raw.filter(r => allowedPurchaseIds.has(r.purchase_id) && !!r.reference_number)
  if (!filtered.length) return []
  const groups = new Map<string, DiscountCreditsGroup>()
  for (const r of filtered) {
    const key = r.reference_number
    const amt = typeof r.amount_discounted === 'string' ? Number(r.amount_discounted) : r.amount_discounted
    const when = r.updated_at ?? r.created_at
    if (!groups.has(key)) groups.set(key, { reference_number: key, total_discount: isNaN(amt) ? 0 : amt, latest_when: when, purchase_id: r.purchase_id })
    else {
      const g = groups.get(key)!
      g.total_discount += isNaN(amt) ? 0 : amt
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) g.latest_when = when
      if (!g.purchase_id) g.purchase_id = r.purchase_id
    }
  }
  const ui = Array.from(groups.values()).map(discountCreditsGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function fetchRecentGameReceipts(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data: receipts, error: gErr } = await supabase.schema('ewallet').from('game_receipt').select('id,user_id,entry_id,event_id,created_at,updated_at').eq('user_id', userId.value).order('updated_at', { ascending: false }).limit(PAGE_SIZE)
  if (gErr) { console.error('game_receipt fetch error:', gErr); return [] }
  const rows = (receipts ?? []) as GameReceiptRow[]
  if (!rows.length) return []
  const eventIds = Array.from(new Set(rows.map(r => r.event_id).filter(Boolean))) as string[]
  let eventsById = new Map<string, EventLite>()
  if (eventIds.length) {
    const { data: events, error: eErr } = await supabase.schema('games').from('event').select('id,title,entry_fee,user_id_winner,winner_refund_amount,loser_refund_amount,created_at,updated_at').in('id', eventIds)
    if (eErr) console.error('games.event fetch error:', eErr)
    else for (const e of (events ?? []) as EventLite[]) eventsById.set(e.id, e)
  }
  const winnerEventIds = rows.map(r => r.event_id).filter((eid): eid is string => !!eid && eventsById.get(eid)?.user_id_winner === userId.value)
  let prizeByRef = new Map<string, PrizePurchase>()
  if (winnerEventIds.length) {
    const { data: prizes, error: prErr } = await supabase.schema('games').from('purchases').select('id,user_id,reference_number,discounted_price').in('reference_number', winnerEventIds).eq('user_id', userId.value)
    if (prErr) console.error('games.purchases (prize lookup) error:', prErr)
    else for (const p of (prizes ?? []) as PrizePurchase[]) prizeByRef.set(p.reference_number, p)
  }
  const ui: UiRow[] = []
  for (const r of rows) {
    const ev = r.event_id ? eventsById.get(r.event_id) : undefined
    if (!ev) {
      ui.push(gameReceiptToUiRow(r, { id: '—', title: 'Mini Game', entry_fee: 0, user_id_winner: null, winner_refund_amount: 0, loser_refund_amount: 0, created_at: r.created_at, updated_at: r.updated_at }, false))
    } else {
      const isWinner = ev.user_id_winner === userId.value
      const prize = isWinner && r.event_id ? prizeByRef.get(r.event_id) : undefined
      ui.push(gameReceiptToUiRow(r, ev, isWinner, prize))
    }
  }
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function fetchRecentCancelledReceipts(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data, error } = await supabase.schema('ewallet').from('cancelled_receipt').select('id,created_at,updated_at,reference_number,purchase_id').order('updated_at', { ascending: false }).limit(PAGE_SIZE)
  if (error) { console.error('cancelled_receipt fetch error:', error); return [] }
  const raw = (data ?? []) as CancelledReceiptRow[]
  if (!raw.length) return []
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', purchaseIds).eq('user_id', userId.value)
    if (pErr) { console.error('games.purchases (for cancelled_receipt) fetch error:', pErr); return [] }
    for (const p of (purchases ?? []) as PurchaseLight[]) allowedPurchaseIds.add(p.id)
  }
  const filtered = raw.filter(r => r.purchase_id && allowedPurchaseIds.has(r.purchase_id))
  const ui = filtered.map(cancelledReceiptToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function fetchRecentCancelledReceiptTotals(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data, error } = await supabase.schema('ewallet').from('cancelled_receipt').select('id,created_at,updated_at,reference_number,purchase_id').order('updated_at', { ascending: false }).limit(PAGE_SIZE * 5)
  if (error) { console.error('cancelled_receipt fetch error:', error); return [] }
  const raw = (data ?? []) as CancelledReceiptRow[]
  if (!raw.length) return []
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', purchaseIds).eq('user_id', userId.value)
    if (pErr) { console.error('games.purchases (for cancelled grouped) fetch error:', pErr); return [] }
    for (const p of (purchases ?? []) as PurchaseLight[]) allowedPurchaseIds.add(p.id)
  }
  const filtered = raw.filter(r => !!r.reference_number && r.purchase_id && allowedPurchaseIds.has(r.purchase_id)) as (CancelledReceiptRow & { reference_number: string, purchase_id: string })[]
  if (!filtered.length) return []
  const groups = new Map<string, CancelledGroup>()
  for (const c of filtered) {
    const key = c.reference_number
    const when = c.updated_at ?? c.created_at
    if (!groups.has(key)) groups.set(key, { reference_number: key, latest_when: when, total_amount: 0, purchase_id: c.purchase_id })
    else {
      const g = groups.get(key)!
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) g.latest_when = when
      if (!g.purchase_id) g.purchase_id = c.purchase_id
    }
  }
  const refs = Array.from(groups.keys())
  if (refs.length) {
    const { data: receipts, error: rErr } = await supabase.schema('ewallet').from('order_receipt').select('id,amount,reference_number,purchase_id,created_at,updated_at').in('reference_number', refs)
    if (rErr) { console.error('order_receipt fetch (for cancelled totals) error:', rErr) }
    else {
      const orderPurchaseIds = Array.from(new Set((receipts ?? []).map(r => r.purchase_id))) as string[]
      let allowedOrderPurchaseIds = new Set<string>()
      if (orderPurchaseIds.length) {
        const { data: purchase2, error: p2Err } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', orderPurchaseIds).eq('user_id', userId.value)
        if (p2Err) console.error('games.purchases (verify order_receipt ownership) error:', p2Err)
        else for (const p of (purchase2 ?? []) as PurchaseLight[]) allowedOrderPurchaseIds.add(p.id)
      }
      for (const r of (receipts ?? []) as OrderReceiptRow[]) {
        if (!r.reference_number || !allowedOrderPurchaseIds.has(r.purchase_id)) continue
        const g = groups.get(r.reference_number)
        if (!g) continue
        const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
        g.total_amount += isNaN(amt) ? 0 : amt
        const when = r.updated_at ?? r.created_at
        if (new Date(when).getTime() > new Date(g.latest_when).getTime()) g.latest_when = when
        if (!g.purchase_id) g.purchase_id = r.purchase_id
      }
    }
  }
  const ui = Array.from(groups.values()).map(cancelledGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function fetchRecentCancelledEwalletReceiptTotals(): Promise<UiRow[]> {
  if (!userId.value) return []
  const { data, error } = await supabase.schema('ewallet').from('cancelled_ewallet_receipt').select('id,amount,created_at,updated_at,reference_number,purchase_id').order('updated_at', { ascending: false }).limit(PAGE_SIZE * 5)
  if (error) { console.error('cancelled_ewallet_receipt fetch error:', error); return [] }
  const raw = (data ?? []) as CancelledEwalletReceiptRow[]
  if (!raw.length) return []
  const purchaseIds = Array.from(new Set(raw.map(r => r.purchase_id).filter(Boolean))) as string[]
  let allowedPurchaseIds = new Set<string>()
  if (purchaseIds.length) {
    const { data: purchases, error: pErr } = await supabase.schema('games').from('purchases').select('id,user_id').in('id', purchaseIds).eq('user_id', userId.value)
    if (pErr) { console.error('games.purchases (for cancelled_ewallet_receipt) fetch error:', pErr); return [] }
    for (const p of (purchases ?? []) as PurchaseLight[]) allowedPurchaseIds.add(p.id)
  }
  const filtered = raw.filter(r => !!r.reference_number && r.purchase_id && allowedPurchaseIds.has(r.purchase_id)) as (CancelledEwalletReceiptRow & { reference_number: string, purchase_id: string })[]
  if (!filtered.length) return []
  const groups = new Map<string, CancelledEwalletGroup>()
  for (const c of filtered) {
    const key = c.reference_number
    const when = c.updated_at ?? c.created_at
    const amt = typeof c.amount === 'string' ? Number(c.amount) : c.amount
    if (!groups.has(key)) groups.set(key, { reference_number: key, latest_when: when, total_amount: isNaN(amt) ? 0 : amt, purchase_id: c.purchase_id })
    else {
      const g = groups.get(key)!
      g.total_amount += isNaN(amt) ? 0 : amt
      if (new Date(when).getTime() > new Date(g.latest_when).getTime()) g.latest_when = when
      if (!g.purchase_id) g.purchase_id = c.purchase_id
    }
  }
  const ui = Array.from(groups.values()).map(cancelledEwalletGroupToUiRow)
  ui.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
  return ui
}

async function reload() { cursor = null; await fetchPage(true) }
async function loadMore() { await fetchPage(false) }

/* —————————————————————————————————————————————
   🆕 Realtime helpers & caches for multi-table updates
   ————————————————————————————————————————————— */
const purchaseOwnerCache = new Map<string, boolean>()
const purchaseRefCache = new Map<string, string>()
const rrCache = new Map<string, { purchase_id: string | null }>()
const eventCache = new Map<string, EventLite>()
const prizeByRefCache = new Map<string, PrizePurchase>()

async function isUserPurchase(purchaseId: string): Promise<boolean> {
  if (purchaseOwnerCache.has(purchaseId)) return !!purchaseOwnerCache.get(purchaseId)
  const { data, error } = await supabase.schema('games').from('purchases').select('id,user_id,reference_number').eq('id', purchaseId).maybeSingle()
  if (error) { console.error('purchases owner check error', error); purchaseOwnerCache.set(purchaseId, false); return false }
  const ok = !!data && data.user_id === userId.value
  purchaseOwnerCache.set(purchaseId, ok)
  if (ok && data?.reference_number) purchaseRefCache.set(purchaseId, data.reference_number)
  return ok
}
async function getPurchaseRefById(purchaseId: string): Promise<string | null> {
  if (purchaseRefCache.has(purchaseId)) return purchaseRefCache.get(purchaseId)!
  const { data, error } = await supabase.schema('games').from('purchases').select('reference_number').eq('id', purchaseId).maybeSingle()
  if (error || !data) return null
  purchaseRefCache.set(purchaseId, data.reference_number)
  return data.reference_number
}
async function getRR(rrId: string): Promise<{ purchase_id: string | null } | null> {
  if (rrCache.has(rrId)) return rrCache.get(rrId)!
  const { data, error } = await supabase.schema('games').from('return_refunds').select('purchase_id').eq('id', rrId).maybeSingle()
  if (error) return null
  rrCache.set(rrId, { purchase_id: data?.purchase_id ?? null })
  return rrCache.get(rrId)!
}
async function getEvent(eventId: string): Promise<EventLite | null> {
  if (eventCache.has(eventId)) return eventCache.get(eventId)!
  const { data, error } = await supabase.schema('games').from('event').select('id,title,entry_fee,user_id_winner,winner_refund_amount,loser_refund_amount,created_at,updated_at').eq('id', eventId).maybeSingle()
  if (error || !data) return null
  eventCache.set(eventId, data as EventLite)
  return eventCache.get(eventId)!
}
async function getPrizeByEventRef(eventId: string): Promise<PrizePurchase | undefined> {
  if (prizeByRefCache.has(eventId)) return prizeByRefCache.get(eventId)
  const { data, error } = await supabase.schema('games').from('purchases').select('id,user_id,reference_number,discounted_price').eq('reference_number', eventId).eq('user_id', userId.value!).maybeSingle()
  if (!error && data) {
    prizeByRefCache.set(eventId, data as PrizePurchase)
    return data as PrizePurchase
  }
  return undefined
}

function upsertItem(ui: UiRow) {
  const i = items.value.findIndex(n => n.id === ui.id)
  if (i !== -1) items.value[i] = ui
  else items.value.unshift(ui)
  // keep list roughly ordered by time
  items.value.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
}
function removeItemById(id: string) {
  items.value = items.value.filter(n => n.id !== id)
}

/* Group upserts/recomputes */
async function upsertOrderReceiptGroupFromRow(r: OrderReceiptRow) {
  if (!r.reference_number || !r.purchase_id) return
  if (!(await isUserPurchase(r.purchase_id))) return
  const id = `order_total_${r.reference_number}`
  const existing = items.value.find(n => n.id === id)
  if (existing) {
    // safer: recompute full group for this ref
    await recomputeOrderReceiptGroup(r.reference_number, r.purchase_id)
  } else {
    const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
    const g: OrderReceiptGroup = {
      reference_number: r.reference_number,
      total_amount: isNaN(amt) ? 0 : amt,
      latest_when: r.updated_at ?? r.created_at,
      purchase_id: r.purchase_id
    }
    upsertItem(orderReceiptGroupToUiRow(g))
  }
}
async function recomputeOrderReceiptGroup(reference_number: string, purchaseId: string) {
  if (!(await isUserPurchase(purchaseId))) return
  const { data, error } = await supabase.schema('ewallet').from('order_receipt').select('amount,created_at,updated_at,reference_number,purchase_id').eq('reference_number', reference_number).eq('purchase_id', purchaseId)
  if (error) return
  const rows = (data ?? []) as OrderReceiptRow[]
  if (!rows.length) { removeItemById(`order_total_${reference_number}`); return }
  let total = 0; let latest = rows[0].updated_at ?? rows[0].created_at
  for (const r of rows) {
    const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
    total += isNaN(amt) ? 0 : amt
    const when = r.updated_at ?? r.created_at
    if (new Date(when).getTime() > new Date(latest).getTime()) latest = when
  }
  upsertItem(orderReceiptGroupToUiRow({ reference_number, total_amount: total, latest_when: latest, purchase_id: purchaseId }))
}

async function upsertDiscountCreditsGroupFromRow(r: DiscountCreditsReceiptRow) {
  if (!r.reference_number || !r.purchase_id) return
  if (!(await isUserPurchase(r.purchase_id))) return
  const id = `discount_credits_${r.reference_number}`
  // recompute full group for stability
  const { data, error } = await supabase.schema('ewallet').from('discount_credits_receipt').select('amount_discounted,created_at,updated_at,reference_number,purchase_id').eq('reference_number', r.reference_number).eq('purchase_id', r.purchase_id)
  if (error) return
  const rows = (data ?? []) as DiscountCreditsReceiptRow[]
  if (!rows.length) { removeItemById(id); return }
  let total = 0; let latest = rows[0].updated_at ?? rows[0].created_at
  for (const x of rows) {
    const amt = typeof x.amount_discounted === 'string' ? Number(x.amount_discounted) : x.amount_discounted
    total += isNaN(amt) ? 0 : amt
    const when = x.updated_at ?? x.created_at
    if (new Date(when).getTime() > new Date(latest).getTime()) latest = when
  }
  upsertItem(discountCreditsGroupToUiRow({ reference_number: r.reference_number, total_discount: total, latest_when: latest, purchase_id: r.purchase_id }))
}

async function upsertCancelledGroupFromRow(c: CancelledReceiptRow) {
  if (!c.reference_number || !c.purchase_id) return
  if (!(await isUserPurchase(c.purchase_id))) return
  // total amount for this ref = sum(order_receipt.amount) for same purchase/ref
  const { data, error } = await supabase.schema('ewallet').from('order_receipt').select('amount,created_at,updated_at').eq('reference_number', c.reference_number).eq('purchase_id', c.purchase_id)
  if (error) return
  const rows = (data ?? []) as OrderReceiptRow[]
  let total = 0; let latest = c.updated_at ?? c.created_at
  for (const r of rows) {
    const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
    total += isNaN(amt) ? 0 : amt
    const when = r.updated_at ?? r.created_at
    if (new Date(when).getTime() > new Date(latest).getTime()) latest = when
  }
  upsertItem(cancelledGroupToUiRow({ reference_number: c.reference_number, latest_when: latest, total_amount: total, purchase_id: c.purchase_id }))
}

async function upsertCancelledEwalletGroupFromRow(c: CancelledEwalletReceiptRow) {
  if (!c.reference_number || !c.purchase_id) return
  if (!(await isUserPurchase(c.purchase_id))) return
  const id = `cancelled_ewallet_group_${c.reference_number}`
  // recompute sum(amount) for this ref + purchase
  const { data, error } = await supabase.schema('ewallet').from('cancelled_ewallet_receipt').select('amount,created_at,updated_at').eq('reference_number', c.reference_number).eq('purchase_id', c.purchase_id)
  if (error) return
  const rows = (data ?? []) as CancelledEwalletReceiptRow[]
  if (!rows.length) { removeItemById(id); return }
  let total = 0; let latest = rows[0].updated_at ?? rows[0].created_at
  for (const r of rows) {
    const amt = typeof r.amount === 'string' ? Number(r.amount) : r.amount
    total += isNaN(amt) ? 0 : amt
    const when = r.updated_at ?? r.created_at
    if (new Date(when).getTime() > new Date(latest).getTime()) latest = when
  }
  upsertItem(cancelledEwalletGroupToUiRow({ reference_number: c.reference_number, latest_when: latest, total_amount: total, purchase_id: c.purchase_id }))
}

/* ====== Realtime bindings ====== */
function bindRealtime() {
  if (rtChannel || !userId.value) return
  rtChannel = supabase.channel('rt-ewallet-all-' + userId.value)

  /* transactions — already present */
  rtChannel
    .on('postgres_changes', { event: 'INSERT', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` }, payload => {
      const tx = payload.new as TxRow
      upsertItem(toUiRow(tx))
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` }, payload => {
      const tx = payload.new as TxRow
      upsertItem(toUiRow(tx))
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'ewallet', table: 'transactions', filter: `user_id=eq.${userId.value}` }, payload => {
      const oldTx = payload.old as TxRow
      removeItemById(oldTx.id)
    })

  /* 🆕 order_transactions (filter by user via purchase_id lookup) */
  rtChannel
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'order_transactions' }, async payload => {
      const row = (payload.new ?? payload.old) as OrderTxRow
      if (!row?.purchase_id) return
      if (!(await isUserPurchase(row.purchase_id))) return
      if (payload.eventType === 'DELETE') { removeItemById(`order_${row.id}`); return }
      upsertItem(orderTxToUiRow(payload.new as OrderTxRow))
    })

  /* 🆕 refund_receipt -> needs rr -> purchase -> reference_number */
  rtChannel
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'refund_receipt' }, async payload => {
      const row = (payload.new ?? payload.old) as RefundReceiptRow
      if (!row?.return_refund_id) return
      const rr = await getRR(row.return_refund_id); const pid = rr?.purchase_id
      if (!pid || !(await isUserPurchase(pid))) return
      if (payload.eventType === 'DELETE') { removeItemById(`refund_${row.id}`); return }
      const pref = await getPurchaseRefById(pid); if (!pref) return
      upsertItem(refundReceiptToUiRow(payload.new as RefundReceiptRow, pref, pid))
    })

  /* 🆕 order_receipt -> maintain grouped order_total_ */
  rtChannel
    .on('postgres_changes', { event: 'INSERT', schema: 'ewallet', table: 'order_receipt' }, async payload => {
      const r = payload.new as OrderReceiptRow
      await upsertOrderReceiptGroupFromRow(r)
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'ewallet', table: 'order_receipt' }, async payload => {
      const r = payload.new as OrderReceiptRow
      if (!r?.reference_number || !r.purchase_id) return
      await recomputeOrderReceiptGroup(r.reference_number, r.purchase_id)
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'ewallet', table: 'order_receipt' }, async payload => {
      const r = payload.old as OrderReceiptRow
      if (!r?.reference_number || !r.purchase_id) return
      await recomputeOrderReceiptGroup(r.reference_number, r.purchase_id)
    })

  /* 🆕 discount_credits_receipt -> maintain grouped discount_credits_ */
  rtChannel
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'discount_credits_receipt' }, async payload => {
      const r = (payload.new ?? payload.old) as DiscountCreditsReceiptRow
      if (!r?.reference_number || !r.purchase_id) return
      await upsertDiscountCreditsGroupFromRow(r)
    })

  /* 🆕 game_receipt (has user_id) */
  rtChannel
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'game_receipt' }, async payload => {
      const gr = (payload.new ?? payload.old) as GameReceiptRow
      if (!gr?.user_id || gr.user_id !== userId.value) return
      if (payload.eventType === 'DELETE') { removeItemById(`game_${gr.id}`); return }
      let ev: EventLite | null = null; let prize: PrizePurchase | undefined
      if (gr.event_id) {
        ev = await getEvent(gr.event_id)
        if (ev && ev.user_id_winner === userId.value) {
          prize = await getPrizeByEventRef(gr.event_id)
        }
      }
      const evSafe: EventLite = ev ?? { id:'—', title:'Mini Game', entry_fee:0, user_id_winner:null, winner_refund_amount:0, loser_refund_amount:0, created_at:gr.created_at, updated_at:gr.updated_at }
      const isWinner = !!ev && ev.user_id_winner === userId.value
      upsertItem(gameReceiptToUiRow(payload.new as GameReceiptRow, evSafe, isWinner, prize))
    })

  /* 🆕 cancelled_receipt -> grouped cancelled_group_ */
  rtChannel
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'cancelled_receipt' }, async payload => {
      const c = (payload.new ?? payload.old) as CancelledReceiptRow
      if (!c?.reference_number || !c.purchase_id) return
      await upsertCancelledGroupFromRow(c)
    })

  /* 🆕 cancelled_ewallet_receipt -> grouped cancelled_ewallet_group_ */
  rtChannel
    .on('postgres_changes', { event: '*', schema: 'ewallet', table: 'cancelled_ewallet_receipt' }, async payload => {
      const c = (payload.new ?? payload.old) as CancelledEwalletReceiptRow
      if (!c?.reference_number || !c.purchase_id) return
      await upsertCancelledEwalletGroupFromRow(c)
    })

  rtChannel.subscribe()
}

/* Clickability + routing */
function isClickable(n: UiRow) { return !!n.reference_number && n.reference_number !== '—' }
function isTransactionRow(n: UiRow) { return n.source === 'ewallet.transactions' || ['approved','disbursed','pending','rejected','failed'].includes(n.status) }
function buildTargetUrl(n: UiRow) {
  if (isTransactionRow(n)) {
    const qs = new URLSearchParams(); qs.set('ref', n.reference_number); return `/app/ewallet?${qs.toString()}`
  }
  if (n.source === 'ewallet.discount_credits_group' || n.status === 'discount_credits') {
    const qs = new URLSearchParams(); qs.set('ref', n.reference_number); return `/app/ewallet?${qs.toString()}`
  }
  // ✅ Purchases should ALWAYS use /app/purchases?ref=<reference_number>
  // (even if purchase_id is present)
  const qs = new URLSearchParams(); qs.set('ref', n.reference_number)
  return `/app/purchases?${qs.toString()}`
}

/* 🆕 add a tiny nav-stamp to force route update & avoid keep-alive/data-race issues
      ⚠️ purchases links: do NOT add _nav and strip any existing one */
function addNavStamp(url: string): string {
  if (/^\/app\/purchases(\?|$)/.test(url)) {
    let out = url.replace(/([?&])_nav=\d+(&|$)/, (m, p1, p2) => {
      if (p1 === '?' && p2 === '&') return '?'
      if (p1 === '?' && p2 === '') return ''
      if (p1 === '&' && p2 === '&') return '&'
      return ''
    })
    out = out.replace(/\?$/, '')
    return out
  }
  const stamp = `_nav=${Date.now()}`
  if (/[?&]_nav=\d+/.test(url)) {
    return url.replace(/([?&]_nav=)\d+/, `$1${Date.now()}`)
    }
  return url + (url.includes('?') ? '&' : '?') + stamp
}

/* 🆕 client-side navigate everywhere (no hard reload for purchases) */
async function smartNavigate(url: string) {
  try {
    const resolved = router.resolve(url)
    if (resolved && Array.isArray(resolved.matched) && resolved.matched.length > 0) {
      await router.push(resolved)
      return
    }
  } catch {}
  // fallback only if route is unknown to the router
  window.location.assign(url)
}

function closePanel() {
  emit('close')
  window.dispatchEvent(new CustomEvent('notif:close'))
  try {
    const bs: any = (window as any).bootstrap
    const hideWith = (type: 'Offcanvas' | 'Modal', selector: string) => {
      const Ctor = bs?.[type]; if (!Ctor) return
      document.querySelectorAll(selector).forEach((el) => {
        const inst = Ctor.getInstance?.(el) ?? new Ctor(el)
        inst?.hide?.()
      })
    }
    hideWith('Offcanvas', '.offcanvas.show')
    hideWith('Modal', '.modal.show')

    /* 🆕 also close any open Bootstrap dropdowns hosting this notif list */
    try {
      document.querySelectorAll<HTMLElement>('[data-bs-toggle="dropdown"][aria-expanded="true"]').forEach((btn) => {
        const inst = bs?.Dropdown?.getInstance?.(btn) ?? new bs.Dropdown(btn)
        inst?.hide?.()
      })
      document.querySelectorAll<HTMLElement>('.dropdown-menu.show').forEach((menu) => {
        const toggle = document.querySelector<HTMLElement>(`[aria-controls="${menu.id}"], [data-bs-toggle="dropdown"][aria-expanded="true"]`)
        const inst = toggle ? (bs?.Dropdown?.getInstance?.(toggle) ?? new bs.Dropdown(toggle)) : null
        inst?.hide?.()
      })
    } catch {}
  } catch {}
  ;(document.activeElement as HTMLElement | null)?.blur?.()
}

async function onClick(n: UiRow) {
  if (!isClickable(n)) return
  // Click marks as read → decrements badge
  markSeen(n)

  const baseUrl = buildTargetUrl(n)
  const stampedUrl = addNavStamp(baseUrl)

  // optional: hint the destination can read immediately if it wants
  try {
    sessionStorage.setItem('purchases:jump', JSON.stringify({ ref: n.reference_number, pid: n.purchase_id ?? null }))
  } catch {}

  // CLOSE the notif UI immediately (offcanvas/modal/dropdown/etc.)
  closePanel()

  // small delay lets transitions finish before route hydration
  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    smartNavigate(stampedUrl)
  }, 120)
}

/* ===== "Seen on View" directive (kept) — now calls markViewed (no-op for count) ===== */
const elCallbacks = new WeakMap<Element, () => void>()
const viewTimers = new WeakMap<Element, number>()
const seenObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const cb = elCallbacks.get(entry.target)
    if (!cb) continue
    if (entry.isIntersecting) {
      const t = window.setTimeout(() => {
        cb()
        seenObserver.unobserve(entry.target)
        elCallbacks.delete(entry.target)
        viewTimers.delete(entry.target)
      }, 800)
      viewTimers.set(entry.target, t)
    } else {
      const t = viewTimers.get(entry.target)
      if (t) { clearTimeout(t); viewTimers.delete(t as any) }
    }
  }
}, { threshold: 0.6 })

const vSeenOnView: Directive<HTMLElement, () => void> = {
  mounted(el, binding) { if (typeof binding.value === 'function') { elCallbacks.set(el, binding.value); seenObserver.observe(el) } },
  updated(el, binding) { if (typeof binding.value === 'function') elCallbacks.set(el, binding.value) },
  unmounted(el) {
    const t = viewTimers.get(el); if (t) clearTimeout(t)
    seenObserver.unobserve(el)
    elCallbacks.delete(el)
    viewTimers.delete(el)
  }
}
defineExpose({})

onMounted(async () => {
  window.addEventListener('notif:count', onNotifCountEvent as EventListener)
  const { data: auth } = await supabase.auth.getUser()
  userId.value = auth?.user?.id ?? null
  loadSeen()
  await reload()
  bindRealtime()
})

onUnmounted(() => {
  window.removeEventListener('notif:count', onNotifCountEvent as EventListener)
  if (rtChannel) supabase.removeChannel(rtChannel)
})
</script>

<style scoped>
.bg-light-subtle { background: #f8f9fa; }
.cursor-pointer { cursor: pointer; }
/* 🔽 Seen = clicked → dim to 0.6 opacity (unseen stays 1 by default) */
.notif-seen { opacity: 0.6; }
.notif-seens { opacity: 1; }
.badge-pop-enter-from, .badge-pop-leave-to { transform: scale(.85); opacity: 0; }
.badge-pop-enter-active, .badge-pop-leave-active { transition: transform .12s ease-out, opacity .12s ease-out; }
</style>
