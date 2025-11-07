<template>
  <div class="container-fluid">
    <!-- ===== Page Header ===== -->
    <header class="settings-header">
      <div>
        <h2 class="h4 mb-1">Settings</h2>
        <p class="text-secondary m-0">Manage profile, security, and address.</p>
      </div>
    </header>

    <!-- ===== Shell: Sidebar + Content ===== -->
    <div class="settings-shell">
      <!-- ===== Sidebar (Minimalist) ===== -->
      <aside class="settings-sidebar rounded-4 shadow-sm">
        <!-- Avatar (skeleton-aware) -->
        <div class="sidebar-avatar breath-in-500">
          <!-- Skeleton -->
          <div
            v-if="isBooting.profile"
            class="d-flex align-items-center gap-3"
            aria-hidden="true"
          >
            <div class="avatar-wrap">
              <div class="skel skel-avatar"></div>
            </div>
            <div class="flex-grow-1">
              <div class="skel skel-label w-50 mb-2"></div>
              <div class="skel skel-line w-75"></div>
            </div>
          </div>

          <!-- Actual -->
          <div v-else class="d-flex align-items-center gap-3">
            <div class="avatar-wrap">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="Profile"
                class="avatar-img"
              />
              <div v-else class="avatar-fallback">{{ initials }}</div>
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold">{{ form.full_name || 'User' }}</div>
              <div class="text-secondary small">{{ form.email || '—' }}</div>
            </div>
          </div>

          <!-- Quick avatar actions -->
          <div class="d-flex gap-2 mt-3" v-if="!isBooting.profile">
            <label class="btn btn-outline-primary btn-sm mb-0 flex-grow-1">
              Change Photo
              <input type="file" accept="image/*" class="d-none" @change="onPickAvatar" />
            </label>
            <button
              class="btn btn-outline-secondary btn-sm"
              type="button"
              @click="removeAvatar"
              :disabled="busy.remove"
              :title="busy.remove ? 'Removing...' : 'Remove current photo'"
            >
              <span v-if="busy.remove" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Remove
            </button>
          </div>
        </div>

        <!-- Nav -->
        <nav class="sidebar-nav">
          <button
            class="sidebar-link"
            :class="{ active: panel === 'profile' }"
            @click="panel = 'profile'"
          >
            <i class="bi bi-person me-2"></i> Profile
          </button>
          <button
            class="sidebar-link"
            :class="{ active: panel === 'security' }"
            @click="panel = 'security'"
          >
            <i class="bi bi-shield-lock me-2"></i> Security
          </button>
          <button
            class="sidebar-link"
            :class="{ active: panel === 'address' }"
            @click="panel = 'address'"
          >
            <i class="bi bi-geo-alt me-2"></i> Address
          </button>
        </nav>
      </aside>

      <!-- ===== Content Area ===== -->
      <main class="settings-content">
        <!-- ===== Panel: Profile ===== -->
        <section v-show="panel === 'profile'" class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h3 class="h5 fw-semibold mb-3">Profile</h3>

            <!-- Profile Form (skeleton + actual) -->
            <div v-if="isBooting.form" class="row g-3 mb-2 breath-in-500" aria-hidden="true">
              <div class="col-md-6">
                <div class="skel skel-label w-50 mb-2"></div>
                <div class="skel skel-input"></div>
              </div>
              <div class="col-md-6">
                <div class="skel skel-label w-25 mb-2"></div>
                <div class="skel skel-input"></div>
              </div>
              <div class="col-12 d-flex align-items-center gap-2">
                <div class="skel skel-btn"></div>
              </div>
            </div>

            <form v-else class="row g-3 breath-in-500" @submit.prevent="saveProfile">
              <div class="col-md-6">
                <label class="form-label">Full name</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Your name"
                  v-model.trim="form.full_name"
                  :disabled="busy.save"
                  autocomplete="name"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  placeholder="name@example.com"
                  v-model="form.email"
                  readonly
                  :title="'Email cannot be changed'"
                  autocomplete="email"
                />
              </div>

              <div class="col-12 d-flex align-items-center gap-2">
                <button class="btn btn-primary ms-auto" :disabled="busy.save">
                  <span v-if="busy.save" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- ===== Panel: Security ===== -->
        <section v-show="panel === 'security'" class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h3 class="h5 fw-semibold mb-3">Security</h3>

            <!-- Update Password -->
            <div class="rounded-4 border p-3 mb-4">
              <div class="fw-semibold mb-2">Update Password</div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Current password</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model.trim="pw.old"
                    placeholder="Enter current password"
                    autocomplete="current-password"
                    :disabled="busyPw"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">New password</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model.trim="pw.new"
                    placeholder="Enter new password"
                    autocomplete="new-password"
                    :disabled="busyPw"
                  />
                </div>
                <div class="col-12 d-flex">
                  <button
                    type="button"
                    class="btn btn-outline-primary ms-auto"
                    :disabled="busyPw"
                    @click="updatePassword"
                    :title="busyPw ? 'Updating password…' : 'Update password'"
                  >
                    <span v-if="busyPw" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="rounded-4 border border-danger-subtle p-3">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div class="fw-semibold text-danger">Danger Zone</div>
                  <p class="text-secondary small m-0">Permanently delete your account and data.</p>
                </div>
                <button
                  class="btn btn-outline-danger"
                  type="button"
                  @click="confirmDeleteAccount"
                  :disabled="busy.delete"
                  :title="busy.delete ? 'Deleting account…' : 'Delete account'"
                >
                  <span v-if="busy.delete" class="spinner-border spinner-border-sm me-1" role="status"></span>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== Panel: Address ===== -->
        <section v-show="panel === 'address'" class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h3 class="h5 fw-semibold mb-3">Delivery Address</h3>

            <!-- Address summary (skeleton + actual) -->
            <div
              v-if="isBooting.address"
              class="d-flex flex-wrap align-items-center gap-3 breath-in-500"
              aria-hidden="true"
            >
              <div class="flex-grow-1">
                <div class="skel skel-label w-25 mb-2"></div>
                <div class="skel skel-line w-75"></div>
              </div>
              <div class="skel skel-btn btn-sm"></div>
            </div>

            <div v-else class="d-flex flex-wrap align-items-center gap-3 breath-in-500">
              <div class="flex-grow-1">
                <div class="text-secondary small" v-if="addressSummary">
                  {{ addressSummary }}
                </div>
                <div class="text-secondary small" v-else>
                  No address yet. Add your phone and address details.
                </div>
              </div>
              <button type="button" class="btn btn-outline-primary btn-sm" @click="openAddressModal">
                <i class="bi bi-pencil-square me-1"></i>Edit Address
              </button>
            </div>
          </div>
        </section>

        <!-- Global status (SweetAlert still used, but keep this text feedback too) -->
        <p v-if="message.text" class="mt-3" :class="message.ok ? 'text-success' : 'text-danger'">
          {{ message.text }}
        </p>
      </main>
    </div>

    <!-- ===== Edit Address Modal (unchanged logic/fields) ===== -->
    <div v-if="showAddressModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow breath-in-500">
          <div class="modal-header">
            <h5 class="modal-title">Edit Address</h5>
            <button type="button" class="btn-close" @click="closeAddressModal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveAddress">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Phone</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model.trim="addrForm.phone"
                    placeholder="09xxxxxxxxx"
                    :disabled="busyAddressSave"
                  />
                </div>
                <div class="col-12">
                  <label class="form-label">Address line 1</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="addrForm.address_line1"
                    placeholder="House/Unit/Street"
                    :disabled="busyAddressSave"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Barangay</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="addrForm.barangay"
                    placeholder="Barangay"
                    :disabled="busyAddressSave"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">City / Municipality</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="addrForm.city"
                    placeholder="City / Municipality"
                    :disabled="busyAddressSave"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Province / Region</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="addrForm.province"
                    placeholder="Province / Region"
                    :disabled="busyAddressSave"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Postal Code</label>
                  <input
                    type="text"
                    inputmode="numeric"
                    maxlength="4"
                    class="form-control"
                    v-model.trim="addrForm.postal_code"
                    placeholder="4-digit ZIP"
                    @input="onZipInput"
                    :disabled="busyAddressSave"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-link text-secondary" @click="closeAddressModal" :disabled="busyAddressSave">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="busyAddressSave">
                <span v-if="busyAddressSave" class="spinner-border spinner-border-sm me-1" role="status"></span>
                Save Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showAddressModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { createClient, type User } from '@supabase/supabase-js'
import { useRouter } from 'vue-router' // for redirect
import { currentUser } from '@/lib/authState'
import Swal from 'sweetalert2'

/* ===== NEW: panel state for sidebar navigation (non-breaking) ===== */
type Panel = 'profile' | 'security' | 'address'
const panel = ref<Panel>('profile')

const routers = useRouter()
const users = computed(() => currentUser.value)
function onZipInput(e: Event) {
  const el = e.target as HTMLInputElement
  const cleaned = (el.value || '').replace(/\D/g, '').slice(0, 4)
  if (cleaned !== el.value) {
    console.log('[ZIP sanitize] from:', el.value, '->', cleaned)
  }
  addrForm.value.postal_code = cleaned
}

onMounted(async () => {
  if (!users.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})

// If you already have a centralized client, import and use that instead:
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)

const router = useRouter()

// --- State ---
const user = ref<User | null>(null)
const dbRow = ref<{
  id: string
  full_name: string
  email: string
  profile_url: string | null
  phone_number: string | null
  address: string | null
} | null>(null)

const form = ref({
  full_name: '',
  email: ''
})

const avatarUrl = ref<string | null>(null)   // signed URL for display
const busy = ref({ save: false, remove: false, delete: false })
const message = ref<{ ok: boolean; text: string }>({ ok: true, text: '' })

// === NEW: password update state ===
const pw = ref({ old: '', new: '' })
const busyPw = ref(false)

// === Boot/Skeleton state (NEW) ===
const isBooting = ref({
  profile: true,
  form: true,
  address: true
})

// === Address state (NEW) ===
const addrCurrent = ref({
  phone: '',
  address_line1: '',
  barangay: '',
  city: '',
  province: '',
  postal_code: ''
})
const addrForm = ref({
  phone: '',
  address_line1: '',
  barangay: '',
  city: '',
  province: '',
  postal_code: ''
})
const showAddressModal = ref(false)
const busyAddressSave = ref(false)

const addressSummary = computed(() => {
  const parts = [
    addrCurrent.value.address_line1,
    addrCurrent.value.barangay,
    addrCurrent.value.city,
    addrCurrent.value.province,
    addrCurrent.value.postal_code
  ].filter(Boolean)
  const phone = addrCurrent.value.phone ? `${addrCurrent.value.phone} • ` : ''
  return parts.length ? `${phone}${parts.join(', ')}` : ''
})

// --- Helpers ---
const initials = computed(() => {
  const name = form.value.full_name || ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U' // default
  const chars = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  return chars.toUpperCase()
})

// SweetAlert-backed status helper (kept your message box too)
function setMessage(ok: boolean, text: string) {
  message.value = { ok, text }
  if (!text) return
  Swal.fire({
    icon: ok ? 'success' : 'error',
    title: ok ? 'Success' : 'Oops…',
    text,
    confirmButtonText: 'OK'
  })
}

async function fetchSignedUrlIfAny() {
  avatarUrl.value = null
  if (dbRow.value?.profile_url) {
    // profile_url stores the OBJECT PATH, not a signed URL
    const { data, error } = await supabase.storage
      .from('user_profile')
      .createSignedUrl(dbRow.value.profile_url, 3600) // 1 hour
    if (!error && data?.signedUrl) {
      avatarUrl.value = data.signedUrl
    }
  }
}

// Parse "address" string into parts (Address Line 1, Brgy, City, Province, ZIP)
function parseAddressToParts(addr: string | null) {
  const out = {
    address_line1: '',
    barangay: '',
    city: '',
    province: '',
    postal_code: ''
  }
  if (!addr) return out
  const parts = addr.split(',').map(s => s.trim()).filter(Boolean)
  if (!parts.length) return out

  // If last part is 4-digit zip
  const last = parts[parts.length - 1] || ''
  if (/^\d{4}$/.test(last)) {
    out.postal_code = last
    parts.pop()
  }

  // Remaining parts from end: province, city, barangay, then rest is line1
  if (parts.length >= 3) {
    out.province = parts.pop() as string
    out.city = parts.pop() as string
    out.barangay = parts.pop() as string
    out.address_line1 = parts.join(', ')
  } else if (parts.length === 2) {
    out.city = parts.pop() as string
    out.address_line1 = parts.join(', ')
  } else {
    out.address_line1 = parts.join(', ')
  }
  return out
}

// Build single-line address from parts
function buildAddressString(x: {
  address_line1?: string
  barangay?: string
  city?: string
  province?: string
  postal_code?: string
}) {
  return [
    x.address_line1 || '',
    x.barangay || '',
    x.city || '',
    x.province || '',
    x.postal_code || ''
  ].filter(Boolean).join(', ')
}

function coalesceNonEmpty(current: string, incoming: string) {
  const v = (incoming ?? '').trim()
  return v.length ? v : (current ?? '')
}

async function loadMe() {
  const { data: ures } = await supabase.auth.getUser()
  user.value = ures.user ?? null
  if (!user.value) {
    setMessage(false, 'Not signed in.')
    return
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, profile_url, phone_number, address')
    .eq('id', user.value.id)
    .maybeSingle()

  if (error) {
    setMessage(false, 'Failed to load profile: ' + error.message)
    // Even on error, end skeleton so UI is interactive
    endBootSkeletons()
    return
  }

  dbRow.value = data
  form.value.full_name = data?.full_name ?? ''
  form.value.email = data?.email ?? ''

  // seed current address state
  const parsed = parseAddressToParts(data?.address ?? null)
  addrCurrent.value = {
    phone: data?.phone_number ?? '',
    address_line1: parsed.address_line1,
    barangay: parsed.barangay,
    city: parsed.city,
    province: parsed.province,
    postal_code: parsed.postal_code
  }

  await fetchSignedUrlIfAny()

  // finish skeletons a touch later for a smoother reveal (≈500ms)
  endBootSkeletons()
}

function endBootSkeletons() {
  // slight delay to keep the breath-in animation coherent
  setTimeout(() => {
    isBooting.value.profile = false
    isBooting.value.form = false
    isBooting.value.address = false
  }, 550)
}

async function saveProfile() {
  if (!user.value?.id) return
  busy.value.save = true
  setMessage(true, '')

  try {
    const { error } = await supabase
      .from('users')
      .update({ full_name: form.value.full_name })
      .eq('id', user.value.id)

    if (error) throw error
    setMessage(true, 'Profile saved.')
  } catch (e: any) {
    setMessage(false, e?.message || 'Failed to save profile.')
  } finally {
    busy.value.save = false
  }
}

function safeName(name: string) {
  return name.replace(/[^\w.\-]/g, '_')
}

// Upload avatar, delete old file FIRST, then store PATH in users.profile_url, then refresh signed URL
async function onPickAvatar(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file || !user.value?.id) return

  setMessage(true, '')
  // Keep original filename but sanitize; include a timestamp for cache-busting
  const base = file.name.split('.').slice(0, -1).join('.') || 'profile'
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `${user.value.id}/${safeName(base)}_${Date.now()}.${safeName(ext)}`

  try {
    // 🆕 Delete old profile file first (best-effort)
    const oldPath = dbRow.value?.profile_url
    if (oldPath) {
      try {
        await supabase.storage.from('user_profile').remove([oldPath])
      } catch {
        // ignore deletion errors (e.g., policy or already gone)
      }
    }

    const { error: upErr } = await supabase.storage
      .from('user_profile')
      .upload(path, file, { cacheControl: '3600', upsert: true })
    if (upErr) throw upErr

    const { error: updErr } = await supabase
      .from('users')
      .update({ profile_url: path })
      .eq('id', user.value.id)
    if (updErr) throw updErr

    if (dbRow.value) dbRow.value.profile_url = path
    await fetchSignedUrlIfAny()
    setMessage(true, 'Profile photo updated.')
  } catch (e: any) {
    setMessage(false, e?.message || 'Failed to upload profile photo.')
  } finally {
    if (input) input.value = ''
  }
}

async function removeAvatar() {
  if (!user.value?.id) return
  if (!dbRow.value?.profile_url) {
    setMessage(false, 'No profile photo to remove.')
    return
  }

  busy.value.remove = true
  setMessage(true, '')
  const toDelete = dbRow.value.profile_url

  try {
    await supabase.storage.from('user_profile').remove([toDelete])

    const { error: updErr } = await supabase
      .from('users')
      .update({ profile_url: null })
      .eq('id', user.value.id)
    if (updErr) throw updErr

    if (dbRow.value) dbRow.value.profile_url = null
    avatarUrl.value = null
    setMessage(true, 'Profile photo removed.')
  } catch (e: any) {
    setMessage(false, e?.message || 'Failed to remove profile photo.')
  } finally {
    busy.value.remove = false
  }
}

/* === NEW: Update password flow === */
async function updatePassword() {
  if (!form.value.email) {
    setMessage(false, 'Missing email in form.')
    return
  }
  if (!pw.value.old || !pw.value.new) {
    setMessage(false, 'Please enter your current and new password.')
    return
  }
  if (pw.value.new.length < 6) {
    setMessage(false, 'New password must be at least 6 characters.')
    return
  }

  busyPw.value = true
  try {
    // Re-authenticate with current password
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: pw.value.old
    })
    if (signErr) throw new Error('Current password is incorrect.')

    // Update to new password
    const { error: updErr } = await supabase.auth.updateUser({
      password: pw.value.new
    })
    if (updErr) throw updErr

    pw.value.old = ''
    pw.value.new = ''
    setMessage(true, 'Password updated.')
  } catch (e: any) {
    setMessage(false, e?.message || 'Failed to update password.')
  } finally {
    busyPw.value = false
  }
}

/* === UPDATED: Delete account — require SweetAlert confirm + password === */
async function confirmDeleteAccount() {
  if (!user.value) return

  // Step 1: Confirm intent
  const confirmRes = await Swal.fire({
    icon: 'warning',
    title: 'Delete account?',
    text: 'This will permanently delete your account, profile photo, and related data. This cannot be undone.',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete my account',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#d33'
  })

  if (!confirmRes.isConfirmed) return

  // Step 2: Ask for password and verify
  const { value: password } = await Swal.fire({
    title: 'Confirm with password',
    input: 'password',
    inputLabel: `Re-enter password for ${form.value.email || 'your account'}`,
    inputPlaceholder: 'Current password',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Verify',
    preConfirm: async (pwd) => {
      if (!pwd) {
        Swal.showValidationMessage('Password is required')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: form.value.email,
        password: pwd
      })
      if (error) {
        Swal.showValidationMessage('Invalid password. Please try again.')
        return
      }
      return true
    }
  })

  if (!password) return

  await deleteAccount()
}

// Calls Edge Function: delete-account-user (via supabase.functions.invoke to avoid CORS issues)
async function deleteAccount() {
  if (!user.value) return
  busy.value.delete = true
  setMessage(true, '')

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated.')

    // Best-effort: delete the current profile file before deleting the account
    try {
      const currentPath = dbRow.value?.profile_url
      if (currentPath) {
        await supabase.storage.from('user_profile').remove([currentPath])
      }
    } catch {
      // ignore storage deletion errors here; server-side cleanup may also run
    }

    const { data, error } = await supabase.functions.invoke('delete-account-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: {},
    })

    if (error) {
      // Supabase v2: error.context is a Response
      let server: any = null
      try {
        const resp = (error as any).context
        server = resp && typeof resp.json === 'function'
          ? await resp.json()
          : (data ?? null)
      } catch {
        server = data ?? null
      }

      const step = server?.step ? ` [step: ${server.step}]` : ''
      const reason = server?.error || (error as any).message || 'Unknown'
      console.error('delete-account-user failed:', { server, error })
      setMessage(false, `Delete failed${step}: ${reason}`)
      busy.value.delete = false
      return
    }

    // success
    setMessage(true, 'Your account has been deleted.')
    await supabase.auth.signOut()
    try {
      await router.replace({ name: 'home' })
    } catch {
      window.location.href = '/'
    }

    await supabase.auth.signOut()

    setMessage(true, 'Your account has been deleted.')

    // Redirect to public Home (route name: 'home' at '/')
    try {
      await router.replace({ name: 'home' })
    } catch {
      window.location.href = '/'
    }
  } catch (e: any) {
    setMessage(false, e?.message || 'Failed to delete account.')
  } finally {
    busy.value.delete = false
  }
}

/* === Address modal handlers (NEW) === */
function openAddressModal() {
  // prefill form from current state
  addrForm.value = { ...addrCurrent.value }
  showAddressModal.value = true
}
function closeAddressModal() {
  showAddressModal.value = false
}

async function saveAddress() {
  if (!user.value?.id) return
  busyAddressSave.value = true
  setMessage(true, '')

  try {
    // Merge only non-empty fields to avoid wiping existing details by accident
    const merged = {
      phone: coalesceNonEmpty(addrCurrent.value.phone, addrForm.value.phone),
      address_line1: coalesceNonEmpty(addrCurrent.value.address_line1, addrForm.value.address_line1),
      barangay: coalesceNonEmpty(addrCurrent.value.barangay, addrForm.value.barangay),
      city: coalesceNonEmpty(addrCurrent.value.city, addrForm.value.city),
      province: coalesceNonEmpty(addrCurrent.value.province, addrForm.value.province),
      postal_code: coalesceNonEmpty(addrCurrent.value.postal_code, addrForm.value.postal_code)
    }

    const addressString = buildAddressString(merged)

    const { error } = await supabase
      .from('users')
      .update({
        phone_number: merged.phone || null,
        address: addressString || null
      })
      .eq('id', user.value.id)

    if (error) throw error

    // reflect locally
    addrCurrent.value = { ...merged }
    if (dbRow.value) {
      dbRow.value.phone_number = merged.phone
      dbRow.value.address = addressString
    }

    setMessage(true, 'Address saved.')
    closeAddressModal()
  } catch (e: any) {
    setMessage(false, e?.message || 'Failed to save address.')
  } finally {
    busyAddressSave.value = false
  }
}

onMounted(loadMe)
</script>

<style scoped>
/* ===== Page Header ===== */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

/* ===== Shell Layout ===== */
.settings-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

@media (max-width: 991px) {
  .settings-shell {
    grid-template-columns: 1fr;
  }
}

/* ===== Sidebar ===== */
.settings-sidebar {
  background: var(--bs-body-bg);
  padding: 16px;
  border: 1px solid var(--bs-border-color);
}

.sidebar-avatar { }

.sidebar-nav {
  margin-top: 12px;
  display: grid;
  gap: 6px;
}

.sidebar-link {
  width: 100%;
  text-align: left;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  padding: 10px 12px;
  border-radius: 12px;
  transition: transform .12s ease, background-color .12s ease, border-color .12s ease;
}
.sidebar-link:hover {
  transform: translateY(-1px);
  background: var(--bs-tertiary-bg);
}
.sidebar-link.active {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 2px rgba(13,110,253,.08);
}

/* ===== Content ===== */
.settings-content {
  display: grid;
  gap: 16px;
}

/* ================= Avatar base (existing) ================= */
.avatar-wrap {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  background: #f0f4f8;
  display: grid;
  place-items: center;
  user-select: none;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #1c2430;
}

/* ================= Modal helpers (existing) ================= */
.modal.d-block {
  background: transparent;
}
.modal-backdrop {
  z-index: 1040;
}
.modal {
  z-index: 1050;
}

/* ================= Skeleton styles (existing) ================= */
.skel {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  background: linear-gradient(90deg, #e9eef3 25%, #f3f6fa 37%, #e9eef3 63%);
  background-size: 400% 100%;
  animation: skel-shimmer 1.2s ease-in-out infinite;
}
@keyframes skel-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

.skel-avatar {
  width: 64px;
  height: 64px;
  border-radius: 999px;
}

.skel-label { height: 12px; }
.skel-line { height: 14px; }

.skel-input {
  height: 38px;
  border-radius: 10px;
}

.skel-btn {
  height: 32px;
  width: 140px;
  border-radius: 999px;
}
.skel-btn.btn-sm {
  width: 120px;
  height: 30px;
}
.skel-btn-danger {
  width: 150px;
}

/* ================= Breath-in animation (existing) ================= */
.breath-in-500 { animation: breath-in 0.5s ease-out both; }
@keyframes breath-in {
  0% {
    opacity: 0;
    transform: translateY(6px) scale(0.996);
    filter: saturate(0.9);
  }
  60% {
    opacity: 1;
    transform: translateY(0) scale(1.002);
    filter: saturate(1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .breath-in-500 { animation: none !important; }
  .skel { animation-duration: 2s; }
}
</style>
