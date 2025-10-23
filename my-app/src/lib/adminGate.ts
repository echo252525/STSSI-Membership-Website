// src/lib/adminGate.ts
// Minimal “open only via Alt+Shift+A” gate using sessionStorage.

const KEY = '__ADMIN_GATE__'

// Is gate currently open (this browser tab/session)?
export function isGateOpen(): boolean {
  return sessionStorage.getItem(KEY) === '1'
}

// Open the gate (called by hotkey)
export function openGate(): void {
  sessionStorage.setItem(KEY, '1')
}

// Optional: close helper if you ever want to lock it again
export function closeGate(): void {
  sessionStorage.removeItem(KEY)
}

// Register Alt + Shift + A to open the gate
export function initAdminGateHotkey(): void {
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyA') {
      e.preventDefault()
      openGate()
      // Feedback in console (kept silent in UI)
      // eslint-disable-next-line no-console
      console.info('[ADMIN GATE] ✅ Gate opened — you can now visit /admin/signup')
    }
  })
}
