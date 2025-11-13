<template>
  <div class="container-fluid">
    <h3 class="fw-bold mb-2 d-flex align-items-center gap-2">
      <i class="bi bi-gear"></i>
      Admin Settings
    </h3>

    <div class="row g-4">
      <!-- Profile -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm border-0 breath-section">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-person-circle text-primary"></i>
              Profile
            </h5>

            <!-- SKELETON WHILE FETCHING -->
            <div v-if="loadingProfile" class="settings-skel">
              <div class="skel-line w-75 mb-3"></div>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="skel-line w-100 mb-2"></div>
                  <div class="skel-box h-36"></div>
                </div>
                <div class="col-md-6">
                  <div class="skel-line w-100 mb-2"></div>
                  <div class="skel-box h-36"></div>
                </div>
                <div class="col-md-6">
                  <div class="skel-line w-100 mb-2"></div>
                  <div class="skel-box h-36"></div>
                </div>
                <div class="col-md-6">
                  <div class="skel-line w-100 mb-2"></div>
                  <div class="skel-box h-36"></div>
                </div>
                <div class="col-12 mt-2">
                  <div class="skel-line w-50 mb-2"></div>
                  <div class="skel-box h-36"></div>
                </div>
                <div class="col-12 mt-3">
                  <div class="skel-line w-25 mb-2"></div>
                  <div class="skel-box h-32 w-32"></div>
                </div>
              </div>
            </div>

            <!-- REAL FORM -->
            <form v-else @submit.prevent="saveProfile" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-person"></i>
                    </span>
                    <input v-model.trim="fullName" type="text" class="form-control" required />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input :value="email" type="email" class="form-control" disabled />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Contact Number</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-telephone"></i>
                    </span>
                    <input
                      v-model.trim="number"
                      type="tel"
                      class="form-control"
                      placeholder="e.g. 0917 123 4567"
                    />
                  </div>
                </div>

                <!-- AGE (READ-ONLY) -->
                <div class="col-md-6">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-person-badge text-muted"></i>
                    Age
                  </label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-calendar-event"></i>
                    </span>
                    <input
                      :value="age ?? ''"
                      type="number"
                      class="form-control"
                      disabled
                    />
                  </div>
                  <small class="text-muted d-block mt-1">
                    Age is recorded and cannot be changed here.
                  </small>
                </div>

                <!-- ADDRESS BREAKDOWN -->
                <div class="col-12">
                  <label class="form-label d-flex align-items-center gap-1">
                    <i class="bi bi-geo-alt text-muted"></i>
                    Address
                  </label>
                  <p class="small text-muted mb-2">
                    Philippine format: <strong>House/Street</strong>, <strong>Barangay</strong>,
                    <strong>City/Municipality</strong>, <strong>Region</strong>, <strong>ZIP</strong>.
                  </p>
                </div>

                <!-- House / Street -->
                <div class="col-md-6">
                  <label class="form-label small">House / Street</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-house-door"></i>
                    </span>
                    <input
                      v-model.trim="addrLine1"
                      type="text"
                      class="form-control"
                      placeholder="House no., building, street"
                    />
                  </div>
                </div>

                <!-- ZIP -->
                <div class="col-md-6">
                  <label class="form-label small">ZIP Code</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-mailbox"></i>
                    </span>
                    <input
                      v-model.trim="addrZip"
                      type="text"
                      class="form-control"
                      placeholder="e.g. 1100"
                    />
                  </div>
                </div>

                <!-- Region with typeahead -->
                <div class="col-md-6">
                  <label class="form-label small">Region</label>
                  <div class="position-relative">
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-globe-asia-australia"></i>
                      </span>
                      <input
                        v-model.trim="addrRegion"
                        type="text"
                        class="form-control"
                        placeholder="Start typing region…"
                        @input="onRegionInput"
                        @focus="showRegionSuggest = true"
                      />
                    </div>
                    <ul
                      v-if="showRegionSuggest && filteredRegions.length"
                      class="typeahead-list"
                    >
                      <li
                        v-for="r in filteredRegions"
                        :key="r.code"
                        class="typeahead-item"
                        @click="pickRegion(r)"
                      >
                        <i class="bi bi-geo-alt me-1"></i>{{ r.name }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- City / Municipality with typeahead -->
                <div class="col-md-6">
                  <label class="form-label small">City / Municipality</label>
                  <div class="position-relative">
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-buildings"></i>
                      </span>
                      <input
                        v-model.trim="addrCity"
                        type="text"
                        class="form-control"
                        placeholder="Start typing city/municipality…"
                        @input="onCityInput"
                        @focus="showCitySuggest = true"
                      />
                    </div>
                    <ul
                      v-if="showCitySuggest && filteredLGUs.length"
                      class="typeahead-list"
                    >
                      <li
                        v-for="l in filteredLGUs"
                        :key="l.code"
                        class="typeahead-item"
                        @click="pickLGU(l)"
                      >
                        <i class="bi bi-geo-alt me-1"></i>{{ l.name }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Barangay with typeahead -->
                <div class="col-md-6">
                  <label class="form-label small">Barangay (optional)</label>
                  <div class="position-relative">
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-geo-fill"></i>
                      </span>
                      <input
                        v-model.trim="addrLine2"
                        type="text"
                        class="form-control"
                        placeholder="Start typing barangay…"
                        @input="onBarangayInput"
                        @focus="showBarangaySuggest = true"
                      />
                    </div>
                    <ul
                      v-if="showBarangaySuggest && filteredBarangays.length"
                      class="typeahead-list"
                    >
                      <li
                        v-for="b in filteredBarangays"
                        :key="b.code"
                        class="typeahead-item"
                        @click="pickBarangay(b)"
                      >
                        <i class="bi bi-geo-alt me-1"></i>{{ b.name }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Hidden single-line backing address (kept for DB) -->
                <div class="col-12 d-none">
                  <input v-model.trim="address" type="text" class="form-control" />
                </div>
              </div>

              <div class="d-flex align-items-center gap-2 mt-4">
                <button class="btn btn-primary d-flex align-items-center gap-2" type="submit" :disabled="savingProfile">
                  <span v-if="savingProfile" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-save"></i>
                  <span>Save changes</span>
                </button>
                <small v-if="profileNotice" class="text-muted">{{ profileNotice }}</small>
                <small v-if="profileError" class="text-danger">{{ profileError }}</small>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Password -->
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm border-0 breath-section">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-shield-lock text-primary"></i>
              Change Password
            </h5>

            <form @submit.prevent="changePassword" novalidate>
              <div class="mb-3">
                <label class="form-label">New Password</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-key"></i>
                  </span>
                  <input v-model="newPassword" type="password" class="form-control" required />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm New Password</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-key-fill"></i>
                  </span>
                  <input v-model="confirmPassword" type="password" class="form-control" required />
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <button
                  class="btn btn-outline-primary d-flex align-items-center gap-2"
                  type="submit"
                  :disabled="changingPassword"
                >
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-arrow-repeat"></i>
                  <span>Update password</span>
                </button>
                <small v-if="passwordNotice" class="text-muted">{{ passwordNotice }}</small>
                <small v-if="passwordError" class="text-danger">{{ passwordError }}</small>
              </div>
            </form>

            <p class="small text-muted mt-3 mb-0 d-flex align-items-center gap-1">
              <i class="bi bi-info-circle"></i>
              Note: For security, some orgs require recent sign-in to change sensitive info.
            </p>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="col-12">
        <div class="card shadow-sm border-0 danger-card breath-section">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-2 text-danger d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill"></i>
              Danger Zone
            </h5>
            <p class="small text-muted mb-3">
              Deleting your account is
              <span class="text-danger fw-semibold">permanent</span> and cannot be undone.
              This will remove your admin profile and revoke access.
            </p>
            <div class="d-flex align-items-center gap-2">
              <button
                class="btn btn-outline-danger d-flex align-items-center gap-2"
                @click="openDeleteModal"
                :disabled="deletingAccount"
              >
                <span v-if="deletingAccount" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-trash3"></i>
                <span>Delete account</span>
              </button>
              <small v-if="deleteNotice" class="text-muted">{{ deleteNotice }}</small>
              <small v-if="deleteError" class="text-danger">{{ deleteError }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop-simple">
      <div class="modal-dialog-simple breath-section">
        <div class="modal-content-simple p-4">
          <h5 class="fw-semibold mb-2 d-flex align-items-center gap-2">
            <i class="bi bi-trash3-fill text-danger"></i>
            Confirm account deletion
          </h5>
          <p class="small text-muted">
            This will permanently delete your account. To confirm, type
            <strong>DELETE</strong> below.
          </p>
          <input
            v-model.trim="deleteConfirmText"
            class="form-control mb-3"
            placeholder="Type DELETE to confirm"
            :disabled="deletingAccount"
          />
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="closeDeleteModal" :disabled="deletingAccount">
              Cancel
            </button>
            <button
              class="btn btn-danger d-flex align-items-center gap-2"
              @click="deleteAccount"
              :disabled="deleteConfirmText !== 'DELETE' || deletingAccount"
            >
              <span v-if="deletingAccount" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-trash3"></i>
              <span>Permanently delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Confirm Delete Modal -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { currentUser } from '@/lib/authState'
import Swal from 'sweetalert2'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})

const router = useRouter()

// profile state
const email = ref('')
const fullName = ref('')
const number = ref('')
const address = ref('')
const age = ref<number | null>(null)

// notices
const savingProfile = ref(false)
const profileNotice = ref('')
const profileError = ref('')

// password state
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)
const passwordNotice = ref('')
const passwordError = ref('')

// delete account state
const deletingAccount = ref(false)
const deleteNotice = ref('')
const deleteError = ref('')
const showDeleteModal = ref(false)
const deleteConfirmText = ref('')

let userId: string | null = null

// Skeleton loading while fetching profile + address data
const loadingProfile = ref(true)

/* =========================
   Address breakdown state (PH)
   ========================= */
const addrRegion = ref('') // Region (required)
const addrCity = ref('') // City/Municipality (required)
const addrLine2 = ref('') // Barangay (optional)
const addrZip = ref('') // ZIP (required)
const addrLine1 = ref('') // House/Street (required)

/* PSGC types */
type Region = { code: string; name: string }
type Province = { code: string; name: string; regionCode: string }
type LGU = { code: string; name: string; isCity: boolean; provinceCode: string }
type Barangay = { code: string; name: string }

/* Datasets */
const regions = ref<Region[]>([])
const provinces = ref<Province[]>([])
const lguAll = ref<LGU[]>([])
const lguScoped = ref<LGU[]>([])
const barangays = ref<Barangay[]>([])

/* Lookups */
const regionNameByCode: Record<string, string> = {}
const provinceByCode: Record<string, Province> = {}

/* Typeahead visibility */
const showRegionSuggest = ref(false)
const showCitySuggest = ref(false)
const showBarangaySuggest = ref(false)

/* Close menus when clicking outside any position-relative wrapper */
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.position-relative')) {
    showRegionSuggest.value = false
    showCitySuggest.value = false
    showBarangaySuggest.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', onDocClick, { capture: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, { capture: true })
})

/* Fetch helper */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json() as Promise<T>
}

/* Loads */
async function loadRegions() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/regions')
  regions.value = data
    .map((r) => ({ code: r.code, name: r.regionName || r.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
  regions.value.forEach((r) => (regionNameByCode[r.code] = r.name))
}

async function loadProvinces() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/provinces')
  provinces.value = data
    .map((p) => ({
      code: p.code,
      name: p.name,
      regionCode: p.region_code || p.regionCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  provinces.value.forEach((p) => (provinceByCode[p.code] = p))
}

async function loadAllLGUs() {
  const [cities, municipalities] = await Promise.all([
    fetchJSON<any[]>('https://psgc.cloud/api/cities'),
    fetchJSON<any[]>('https://psgc.cloud/api/municipalities'),
  ])

  const cityList: LGU[] = cities.map((c) => ({
    code: c.code,
    name: c.name,
    isCity: true,
    provinceCode: c.province_code || c.provinceCode || '',
  }))
  const muniList: LGU[] = municipalities.map((m) => ({
    code: m.code,
    name: m.name,
    isCity: false,
    provinceCode: m.province_code || m.provinceCode || '',
  }))

  lguAll.value = [...cityList, ...muniList].sort((a, b) => a.name.localeCompare(b.name))
}

/* Load barangays for a selected city/municipality */
async function loadBarangaysForLGU(lguCode: string, isCity: boolean) {
  barangays.value = []
  if (!lguCode) return
  const url = isCity
    ? `https://psgc.cloud/api/barangays?city_code=${encodeURIComponent(lguCode)}`
    : `https://psgc.cloud/api/barangays?municipality_code=${encodeURIComponent(lguCode)}`
  const data = await fetchJSON<any[]>(url)
  barangays.value = data
    .map((b) => ({ code: b.code, name: b.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/* Chaining via watchers (Region -> City -> Barangay) */
watch(addrRegion, (val) => {
  const region = regions.value.find(
    (x) => x.name.toLowerCase() === val.trim().toLowerCase(),
  )
  if (region) {
    const provinceCodesInRegion = new Set(
      provinces.value.filter((p) => p.regionCode === region.code).map((p) => p.code),
    )
    lguScoped.value = lguAll.value.filter((l) => provinceCodesInRegion.has(l.provinceCode))
  } else {
    lguScoped.value = []
  }
  addrCity.value = ''
  addrLine2.value = ''
  barangays.value = []
})

watch(addrCity, async (val) => {
  const list = lguScoped.value.length ? lguScoped.value : lguAll.value
  const l = list.find((x) => x.name.toLowerCase() === val.trim().toLowerCase())
  if (l) {
    const p = provinceByCode[l.provinceCode]
    if (p && regionNameByCode[p.regionCode]) {
      addrRegion.value = regionNameByCode[p.regionCode]
    }
    await loadBarangaysForLGU(l.code, l.isCity)
    addrLine2.value = ''
  } else {
    barangays.value = []
  }
})

/* Typeahead filters */
const filteredRegions = computed(() => {
  const q = addrRegion.value.trim().toLowerCase()
  if (!q) return regions.value.slice(0, 10)
  const starts = regions.value.filter((r) => r.name.toLowerCase().startsWith(q))
  const contains = regions.value.filter(
    (r) =>
      !r.name.toLowerCase().startsWith(q) &&
      r.name.toLowerCase().includes(q),
  )
  return [
    ...starts.slice(0, 10),
    ...contains.slice(0, 10 - Math.min(10, starts.length)),
  ]
})

const filteredLGUs = computed(() => {
  const pool = lguScoped.value.length ? lguScoped.value : lguAll.value
  const q = addrCity.value.trim().toLowerCase()
  if (!q) return pool.slice(0, 10)
  const starts = pool.filter((l) => l.name.toLowerCase().startsWith(q))
  const contains = pool.filter(
    (l) =>
      !l.name.toLowerCase().startsWith(q) &&
      l.name.toLowerCase().includes(q),
  )
  return [
    ...starts.slice(0, 10),
    ...contains.slice(0, 10 - Math.min(10, starts.length)),
  ]
})

const filteredBarangays = computed(() => {
  const q = addrLine2.value.trim().toLowerCase()
  if (!q) return barangays.value.slice(0, 10)
  const starts = barangays.value.filter((b) => b.name.toLowerCase().startsWith(q))
  const contains = barangays.value.filter(
    (b) =>
      !b.name.toLowerCase().startsWith(q) &&
      b.name.toLowerCase().includes(q),
  )
  return [
    ...starts.slice(0, 10),
    ...contains.slice(0, 10 - Math.min(10, starts.length)),
  ]
})

/* Input handlers */
const onRegionInput = () => {
  showRegionSuggest.value = true
}
const onCityInput = () => {
  showCitySuggest.value = true
}
const onBarangayInput = () => {
  showBarangaySuggest.value = true
}

/* Pick handlers */
function pickRegion(r: Region) {
  addrRegion.value = r.name
  showRegionSuggest.value = false
}
async function pickLGU(l: LGU) {
  addrCity.value = l.name
  showCitySuggest.value = false
  const p = provinceByCode[l.provinceCode]
  if (p && regionNameByCode[p.regionCode]) {
    addrRegion.value = regionNameByCode[p.regionCode]
  }
  await loadBarangaysForLGU(l.code, l.isCity)
  addrLine2.value = ''
}
function pickBarangay(b: Barangay) {
  addrLine2.value = b.name
  showBarangaySuggest.value = false
}

/* Single-line full address */
const fullAddress = computed(() => {
  const regionPart =
    addrRegion.value === 'National Capital Region (NCR)'
      ? 'NCR'
      : addrRegion.value
  const parts = [
    addrLine1.value,
    addrLine2.value,
    addrCity.value,
    regionPart,
    addrZip.value,
  ].filter(Boolean)
  return parts.join(', ')
})

watch([addrLine1, addrLine2, addrCity, addrRegion, addrZip], () => {
  address.value = fullAddress.value
})

function isAddressComplete() {
  return !!(addrRegion.value && addrCity.value && addrZip.value && addrLine1.value)
}

/* Hydrate breakdown from existing single-line address */
function hydrateAddress(raw: string | null) {
  if (!raw) return
  address.value = raw
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 5) {
    // Assume: 0=Line1,1=Barangay,2=City,3=Region,4=ZIP(+extra)
    addrLine1.value = parts[0]
    addrLine2.value = parts[1]
    addrCity.value = parts[2]
    addrRegion.value = parts[3]
    addrZip.value = parts.slice(4).join(', ')
  } else if (parts.length === 4) {
    addrLine1.value = parts[0]
    addrCity.value = parts[1]
    addrRegion.value = parts[2]
    addrZip.value = parts[3]
  } else {
    // Fallback: stuff everything into Line1 so user can fix it
    addrLine1.value = raw
  }
}

/* =========================
   Load user profile + PSGC
   ========================= */
onMounted(async () => {
  try {
    const { data } = await supabase.auth.getUser()
    const u = data?.user

    if (!u) {
      await Swal.fire({
        icon: 'warning',
        title: 'Not signed in',
        text: 'Please log in again to manage admin settings.',
        confirmButtonText: 'Go to login',
      })
      router.push({ name: 'admin.login' })
      return
    }

    userId = u.id
    email.value = u.email || ''
    fullName.value = (u.user_metadata?.full_name as string) || ''

    const profilePromise = (async () => {
      const { data: row } = await supabase
        .from('admins')
        .select('full_name, number, address, age')
        .eq('id', userId)
        .single()

      if (row) {
        fullName.value = row.full_name ?? fullName.value
        number.value = row.number ?? ''
        address.value = row.address ?? ''
        age.value = row.age ?? null
        hydrateAddress(row.address ?? null)
      }
    })()

    const psgcPromise = Promise.all([loadRegions(), loadProvinces(), loadAllLGUs()])

    await Promise.all([profilePromise, psgcPromise])
  } catch (e: any) {
    profileError.value = e?.message ?? 'Unable to load profile.'
    await Swal.fire({
      icon: 'error',
      title: 'Load failed',
      text: profileError.value,
      confirmButtonText: 'Dismiss',
    })
  } finally {
    loadingProfile.value = false
  }
})

/* =========================
   SweetAlert helpers
   ========================= */
function toastSuccess(title: string, text?: string) {
  Swal.fire({
    icon: 'success',
    title,
    text,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  })
}
function popupError(title: string, text?: string) {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
  })
}
function popupInfo(title: string, text?: string) {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Got it',
  })
}

/* =========================
   Save Profile
   ========================= */
const saveProfile = async () => {
  profileNotice.value = ''
  profileError.value = ''
  savingProfile.value = true

  try {
    if (!userId) throw new Error('No authenticated user.')

    if (!isAddressComplete()) {
      profileError.value =
        'Please complete your address (Region, City/Municipality, ZIP, House/Street).'
      await Swal.fire({
        icon: 'warning',
        title: 'Address incomplete',
        text: profileError.value,
        confirmButtonText: 'Fill address',
      })
      return
    }

    const payload: any = {
      full_name: fullName.value,
      number: number.value || null,
      address: address.value || null,
      // age is intentionally NOT updated (cannot be changed here)
    }

    const { error: upErr } = await supabase
      .from('admins')
      .update(payload)
      .eq('id', userId)

    if (upErr) throw upErr

    const { error: metaErr } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.value,
        number: number.value || null,
        address: address.value || null,
        age: age.value ?? null,
      },
    })
    if (metaErr) throw metaErr

    profileNotice.value = 'Profile saved.'
    toastSuccess('Profile updated', 'Your admin profile has been saved.')
  } catch (e: any) {
    profileError.value = e?.message ?? 'Unable to save profile.'
    await popupError('Profile update failed', profileError.value)
  } finally {
    savingProfile.value = false
  }
}

/* =========================
   Change Password
   ========================= */
const changePassword = async () => {
  passwordNotice.value = ''
  passwordError.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Please fill both password fields.'
    await Swal.fire({
      icon: 'warning',
      title: 'Missing password fields',
      text: passwordError.value,
      confirmButtonText: 'OK',
    })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    await Swal.fire({
      icon: 'warning',
      title: 'Password mismatch',
      text: passwordError.value,
      confirmButtonText: 'OK',
    })
    return
  }

  changingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) throw error

    passwordNotice.value = 'Password updated.'
    newPassword.value = ''
    confirmPassword.value = ''
    toastSuccess('Password updated', 'Your password has been changed.')
  } catch (e: any) {
    passwordError.value = e?.message ?? 'Unable to update password.'
    await popupError('Password update failed', passwordError.value)
  } finally {
    changingPassword.value = false
  }
}

/* =========================
   Delete Account
   ========================= */
const openDeleteModal = () => {
  deleteNotice.value = ''
  deleteError.value = ''
  deleteConfirmText.value = ''
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  if (!deletingAccount.value) showDeleteModal.value = false
}

const deleteAccount = async () => {
  deleteNotice.value = ''
  deleteError.value = ''
  deletingAccount.value = true

  try {
    if (!userId) throw new Error('No authenticated user.')

    const confirmRes = await Swal.fire({
      icon: 'warning',
      title: 'Delete admin account?',
      text: 'This will permanently delete your admin profile and revoke access.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    })
    if (!confirmRes.isConfirmed) {
      deletingAccount.value = false
      return
    }

    const { data, error } = await supabase.functions.invoke('delete-account-user', {
      body: { user_id: userId },
    })
    if (error) throw error

    await supabase.auth.signOut()

    deleteNotice.value = 'Account deleted. Redirecting…'
    showDeleteModal.value = false

    await Swal.fire({
      icon: 'success',
      title: 'Account deleted',
      text: 'Your admin account has been removed.',
      timer: 1500,
      showConfirmButton: false,
    })

    router.push({ name: 'login' }).catch(() => {})
  } catch (e: any) {
    deleteError.value = e?.message ?? 'Unable to delete account.'
    await popupError('Delete failed', deleteError.value)
  } finally {
    deletingAccount.value = false
  }
}
</script>

<style scoped>
.container-fluid {
  max-width: 1100px;
}
.card {
  border-radius: 14px;
}

/* Danger Zone card subtle red border */
.danger-card {
  border: 1px solid rgba(220, 53, 69, 0.2);
}

/* Lightweight modal without Bootstrap JS */
.modal-backdrop-simple {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog-simple {
  width: 100%;
  max-width: 520px;
}
.modal-content-simple {
  background: var(--bs-body-bg);
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.45);
}

/* Breath-in animation per section (250ms) */
.breath-section {
  animation: breath-in-section 0.25s ease-out;
}
@keyframes breath-in-section {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Skeleton */
.settings-skel {
  min-height: 160px;
}
.skel-line,
.skel-box {
  position: relative;
  overflow: hidden;
  background: #e3ebf0;
  border-radius: 999px;
}
.skel-box {
  border-radius: 10px;
}
.skel-line::before,
.skel-box::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.9) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  animation: skeleton-breath 1.3s ease-in-out infinite;
}
.w-32 {
  width: 32%;
}
.h-36 {
  height: 36px;
}
.h-32 {
  height: 32px;
}
@keyframes skeleton-breath {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Typeahead list styling */
.typeahead-list {
  position: absolute;
  z-index: 20;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  margin-top: 2px;
  padding: 0.25rem 0;
  background: #ffffff;
  border-radius: 0 0 10px 10px;
  border: 1px solid #dee2e6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
  list-style: none;
}
.typeahead-item {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.typeahead-item:hover {
  background-color: rgba(32, 100, 124, 0.05);
}

/* Small polish */
.input-group-text i {
  font-size: 0.95rem;
}
</style>
  