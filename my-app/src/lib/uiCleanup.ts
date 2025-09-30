// src/lib/uiCleanup.ts
export function cleanupBootstrapArtifacts() {
  const w = window as any

  try {
    if (w?.bootstrap) {
      const { Offcanvas, Modal, Dropdown } = w.bootstrap

      // Close any visible offcanvas/modals
      document.querySelectorAll('.offcanvas.show').forEach((el: Element) => {
        try { Offcanvas.getInstance(el)?.hide() } catch {}
      })
      document.querySelectorAll('.modal.show').forEach((el: Element) => {
        try { Modal.getInstance(el)?.hide() } catch {}
      })

      // Close open dropdowns that can trap focus
      document.querySelectorAll('.dropdown-menu.show').forEach((menu: Element) => {
        const trigger = (menu as HTMLElement).closest('[data-bs-toggle="dropdown"]')
        if (trigger) { try { Dropdown.getInstance(trigger as any)?.hide() } catch {} }
      })
    }
  } catch {}

  // Remove any stray backdrops & body classes/locks
  document.querySelectorAll('.offcanvas-backdrop, .modal-backdrop').forEach((el) => el.remove())
  document.body.classList.remove('offcanvas-open', 'modal-open')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('paddingRight')
}
