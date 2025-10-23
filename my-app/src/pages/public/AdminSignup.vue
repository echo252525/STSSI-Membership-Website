<template>
  <div class="auth-wrap d-flex align-items-center justify-content-center">
    <div class="auth-card shadow-sm rounded-4 bg-white p-4 p-md-5">
      <div
        class="auth-head d-flex align-items-center justify-content-center gap-4 mb-4 text-center"
      >
        <img src="../../../public/STSSI_logo.png" class="img-fluid login-logo" alt="STSSI logo" />
        <h3 class="fw-bold">Admin Signup</h3>
      </div>

      <form @submit.prevent="handleSignup" novalidate>
        <!-- Names -->
        <div class="mb-3">
          <label class="form-label">First Name *</label>
          <input
            v-model.trim="firstName"
            type="text"
            class="form-control"
            placeholder="Firstname"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Last Name *</label>
          <input
            v-model.trim="lastName"
            type="text"
            class="form-control"
            placeholder="Lastname"
            required
          />
        </div>

        <!-- Email -->
        <div class="mb-3">
          <label for="email" class="form-label">Email *</label>
          <input
            v-model.trim="email"
            type="email"
            class="form-control"
            id="email"
            required
          />
        </div>

        <!-- Passwords -->
        <div class="password-div d-flex justify-content-between gap-2">
          <div class="position-relative flex-fill">
            <label for="password" class="form-label">Password *</label>
            <div class="input-group">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="password"
                required
              />
              <span 
                class="input-group-text bg-white"
                role="button"
                @click="togglePassword"
              >
                <span class="material-symbols-outlined">
                  {{ showPassword ? 'visibility' : 'visibility_off' }}
                </span>
              </span>
            </div>
          </div>

          <div class="flex-fill mb-3">
            <label for="confirmPassword" class="form-label">Confirm Password *</label>
            <div class="input-group">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control"
                id="confirmPassword"
                required
              />
              <span 
                class="input-group-text bg-white"
                role="button"
                @click="toggleConfirmPassword"
              >
                <span class="material-symbols-outlined">
                  {{ showConfirmPassword ? 'visibility' : 'visibility_off' }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Phone & Age -->
        <div class="phonenum-age-div d-flex justify-content-between gap-2">
          <div class="flex-fill">
            <label for="number" class="form-label">Phone Number</label>
            <input
              v-model.trim="number"
              type="tel"
              class="form-control"
              id="number"
              placeholder="e.g., 09XXXXXXXXX or +63 9XXXXXXXXX"
            />
          </div>

          <div class="mb-3 flex-fill">
            <label for="age" class="form-label">Age *</label>
            <input
              v-model.number="age"
              type="number"
              min="18"
              class="form-control"
              id="age"
              required
            />
            <div class="form-text">You must be 18 or older.</div>
          </div>
        </div>

        <!-- Address (Region → City/Muni → Barangay → ZIP → House/Street) -->
        <div class="row g-3">
          <!-- Region -->
          <div class="col-md-6 position-relative">
            <label class="form-label">Region *</label>
            <input
              v-model.trim="addrRegion"
              type="text"
              class="form-control"
              placeholder="Type to search region…"
              required
              @focus="showRegionSuggest = true"
              @input="onRegionInput"
            />
            <div
              v-if="showRegionSuggest && filteredRegions.length"
              class="typeahead-menu list-group shadow position-absolute w-100"
            >
              <button
                v-for="r in filteredRegions"
                :key="r.code"
                type="button"
                class="list-group-item list-group-item-action"
                @mousedown.prevent="pickRegion(r)"
              >
                {{ r.name }}
              </button>
            </div>
           
          </div>

          <!-- City / Municipality -->
          <div class="col-md-6 position-relative">
            <label class="form-label">City / Municipality *</label>
            <input
              v-model.trim="addrCity"
              type="text"
              class="form-control"
              placeholder="Type to search (e.g., Quezon City)"
              required
              @focus="showCitySuggest = true"
              @input="onCityInput"
            />
            <div
              v-if="showCitySuggest && filteredLGUs.length"
              class="typeahead-menu list-group shadow position-absolute w-100"
            >
              <button
                v-for="l in filteredLGUs"
                :key="l.code"
                type="button"
                class="list-group-item list-group-item-action"
                @mousedown.prevent="pickLGU(l)"
              >
                {{ l.name }} <span class="text-muted">• {{ l.isCity ? 'City' : 'Municipality' }}</span>
                <span v-if="regionNameForLGU(l)" class="text-muted"> — {{ regionNameForLGU(l) }}</span>
              </button>
            </div>
           
          </div>

          <!-- Barangay -->
          <div class="col-md-6 position-relative">
            <label class="form-label">Barangay <span class="text-muted">(optional)</span></label>
            <input
              v-model.trim="addrBarangay"
              type="text"
              class="form-control"
              placeholder="Type to search barangay…"
              @focus="showBarangaySuggest = true"
              @input="onBarangayInput"
            />
            <div
              v-if="showBarangaySuggest && filteredBarangays.length"
              class="typeahead-menu list-group shadow position-absolute w-100"
            >
              <button
                v-for="b in filteredBarangays"
                :key="b.code"
                type="button"
                class="list-group-item list-group-item-action"
                @mousedown.prevent="pickBarangay(b)"
              >
                {{ b.name }}
              </button>
            </div>
  
          </div>

          <!-- ZIP -->
          <div class="col-md-3">
            <label class="form-label">ZIP *</label>
            <input
              v-model.trim="addrZip"
              type="text"
              class="form-control"
              placeholder="e.g., 1100"
              required
              pattern="\d{4}"
              title="Enter a valid postal code"
            />
          </div>

          <!-- House/Street -->
          <div class="col-md-9">
            <label class="form-label">House/Unit & Street *</label>
            <input
              v-model.trim="addrLine1"
              type="text"
              class="form-control"
              placeholder="e.g., Unit 2B, 123 Sampaguita St."
              required
            />
          </div>
        </div>

        <div class="d-flex flex-column flex-sm-row gap-2 mt-3">
          <router-link
            class="btn btn-outline-secondary flex-fill"
            :to="{ name: 'home' }"
          >
              Back
          </router-link>
          <button type="submit" class="btn btn-primary flex-fill" :disabled="loading">
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ loading ? 'Creating account…' : 'Sign up' }}
          </button>
        </div>
      </form>

      <p class="text-center small mt-3 mb-0">
        Already have an account?
        <router-link
          class="link-offset-2 link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
          :to="{ name: 'admin.login' }"
          >Log in here</router-link
        >
      </p>

      <p v-if="notice" class="text-center small text-muted mt-3 mb-0">{{ notice }}</p>
      <p v-if="errorMsg" class="text-center small text-danger mt-2 mb-0">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

/** ===== Form State ===== */
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const number = ref('')

const age = ref<number | null>(null)
const loading = ref(false)
const notice = ref('')
const errorMsg = ref('')

// show password
const showPassword = ref(false)
const togglePassword = () => { showPassword.value = !showPassword.value }
// show confirm password
const showConfirmPassword = ref(false)
const toggleConfirmPassword = () => { showConfirmPassword.value = !showConfirmPassword.value }

/** ===== Address State (No Province) ===== */
const addrRegion = ref('')        // required
const addrCity = ref('')          // required
const addrBarangay = ref('')      // optional
const addrZip = ref('')           // required
const addrLine1 = ref('')         // required

/** ===== PSGC Types ===== */
type Region = { code: string; name: string }
type Province = { code: string; name: string; regionCode: string }
type LGU = { code: string; name: string; isCity: boolean; provinceCode: string }
type Barangay = { code: string; name: string }

/** ===== PSGC Datasets ===== */
const regions = ref<Region[]>([])
const provinces = ref<Province[]>([])          // internal map only (for region lookup)
const lguAll = ref<LGU[]>([])                  // all cities/municipalities
const lguScoped = ref<LGU[]>([])               // by region
const barangays = ref<Barangay[]>([])

/** ===== Lookups ===== */
const regionNameByCode: Record<string, string> = {}
const provinceByCode: Record<string, Province> = {}

/** ===== Typeahead Visibility ===== */
const showRegionSuggest = ref(false)
const showCitySuggest = ref(false)
const showBarangaySuggest = ref(false)

/** ===== Outside Click to Close Menus ===== */
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.position-relative')) {
    showRegionSuggest.value = false
    showCitySuggest.value = false
    showBarangaySuggest.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick, { capture: true }))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, { capture: true }))

/** ===== Fetch Helper ===== */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json() as Promise<T>
}

/** ===== PSGC Loads ===== */
async function loadRegions() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/regions')
  regions.value = data.map(r => ({ code: r.code, name: r.regionName || r.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
  regions.value.forEach(r => (regionNameByCode[r.code] = r.name))
}

async function loadProvinces() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/provinces')
  provinces.value = data.map(p => ({
    code: p.code,
    name: p.name,
    regionCode: p.region_code || p.regionCode
  })).sort((a, b) => a.name.localeCompare(b.name))
  provinces.value.forEach(p => (provinceByCode[p.code] = p))
}

async function loadAllLGUs() {
  const [cities, municipalities] = await Promise.all([
    fetchJSON<any[]>('https://psgc.cloud/api/cities'),
    fetchJSON<any[]>('https://psgc.cloud/api/municipalities')
  ])
  const cityList: LGU[] = cities.map(c => ({
    code: c.code,
    name: c.name,
    isCity: true,
    provinceCode: c.province_code || c.provinceCode || ''
  }))
  const muniList: LGU[] = municipalities.map(m => ({
    code: m.code,
    name: m.name,
    isCity: false,
    provinceCode: m.province_code || m.provinceCode || ''
  }))
  lguAll.value = [...cityList, ...muniList].sort((a, b) => a.name.localeCompare(b.name))
}

/** ===== Barangays load for selected LGU ===== */
async function loadBarangaysForLGU(lguCode: string, isCity: boolean) {
  barangays.value = []
  if (!lguCode) return
  const url = isCity
    ? `https://psgc.cloud/api/barangays?city_code=${encodeURIComponent(lguCode)}`
    : `https://psgc.cloud/api/barangays?municipality_code=${encodeURIComponent(lguCode)}`
  const data = await fetchJSON<any[]>(url)
  barangays.value = data.map(b => ({ code: b.code, name: b.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** ===== Helpers ===== */
function regionNameForLGU(l: LGU): string | null {
  const p = provinceByCode[l.provinceCode]
  if (!p) return null
  return regionNameByCode[p.regionCode] || null
}

/** ===== Watchers (Region → City/Muni → Barangay) ===== */
watch(addrRegion, (val) => {
  // scope LGUs by region
  const region = regions.value.find(x => x.name.toLowerCase() === val.trim().toLowerCase())
  if (region) {
    const provinceCodesInRegion = new Set(
      provinces.value.filter(p => p.regionCode === region.code).map(p => p.code)
    )
    lguScoped.value = lguAll.value.filter(l => provinceCodesInRegion.has(l.provinceCode))
  } else {
    lguScoped.value = []
  }
  addrCity.value = ''
  addrBarangay.value = ''
  barangays.value = []
})

watch(addrCity, async (val) => {
  const list = lguScoped.value.length ? lguScoped.value : lguAll.value
  const l = list.find(x => x.name.toLowerCase() === val.trim().toLowerCase())
  if (l) {
    // backfill region using lgu -> province -> region
    const p = provinceByCode[l.provinceCode]
    if (p && regionNameByCode[p.regionCode]) {
      addrRegion.value = regionNameByCode[p.regionCode]
    }
    await loadBarangaysForLGU(l.code, l.isCity)
    addrBarangay.value = ''
  } else {
    barangays.value = []
  }
})

/** ===== Typeahead Filters ===== */
const filteredRegions = computed(() => {
  const q = addrRegion.value.trim().toLowerCase()
  if (!q) return regions.value.slice(0, 10)
  const starts = regions.value.filter(r => r.name.toLowerCase().startsWith(q))
  const contains = regions.value.filter(r => !r.name.toLowerCase().startsWith(q) && r.name.toLowerCase().includes(q))
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

const filteredLGUs = computed(() => {
  const pool = lguScoped.value.length ? lguScoped.value : lguAll.value
  const q = addrCity.value.trim().toLowerCase()
  if (!q) return pool.slice(0, 10)
  const starts = pool.filter(l => l.name.toLowerCase().startsWith(q))
  const contains = pool.filter(l => !l.name.toLowerCase().startsWith(q) && l.name.toLowerCase().includes(q))
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

const filteredBarangays = computed(() => {
  const q = addrBarangay.value.trim().toLowerCase()
  if (!q) return barangays.value.slice(0, 10)
  const starts = barangays.value.filter(b => b.name.toLowerCase().startsWith(q))
  const contains = barangays.value.filter(b => !b.name.toLowerCase().startsWith(q) && b.name.toLowerCase().includes(q))
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

/** ===== Input Handlers (show menus) ===== */
const onRegionInput = () => { showRegionSuggest.value = true }
const onCityInput = () => { showCitySuggest.value = true }
const onBarangayInput = () => { showBarangaySuggest.value = true }

/** ===== Pick Handlers ===== */
function pickRegion(r: Region) {
  addrRegion.value = r.name
  showRegionSuggest.value = false
}
async function pickLGU(l: LGU) {
  addrCity.value = l.name
  showCitySuggest.value = false
  // backfill Region
  const p = provinceByCode[l.provinceCode]
  if (p && regionNameByCode[p.regionCode]) addrRegion.value = regionNameByCode[p.regionCode]
  await loadBarangaysForLGU(l.code, l.isCity)
  addrBarangay.value = ''
}
function pickBarangay(b: Barangay) {
  addrBarangay.value = b.name
  showBarangaySuggest.value = false
}

/** ===== Single-line address for DB (no province) =====
 * Format: House/Street, Barangay, City/Muni, Region(or NCR), ZIP
 */
const fullAddress = computed(() => {
  const regionPart = addrRegion.value === 'National Capital Region (NCR)' ? 'NCR' : addrRegion.value
  return [addrLine1.value, addrBarangay.value, addrCity.value, regionPart, addrZip.value]
    .filter(Boolean)
    .join(', ')
})

/** ===== Validation ===== */
function isAddressComplete() {
  return !!(addrRegion.value && addrCity.value && addrZip.value && addrLine1.value)
}

/** ===== DB Insert Helper ===== */
async function insertAdminRow(userId: string) {
  const payload: any = {
    id: userId, // auth uid as PK
    email: email.value,
    full_name: `${firstName.value} ${lastName.value}`.trim(),
    number: number.value || null,
    address: fullAddress.value || null,
    age: age.value ?? null,
    // If you add separate columns later, you can include:
    // first_name: firstName.value,
    // last_name: lastName.value,
    // region: addrRegion.value,
    // city: addrCity.value,
    // barangay: addrBarangay.value,
    // zip: addrZip.value,
    // address_line1: addrLine1.value,
  }

  const { error } = await supabase.from('admins').insert([payload])
  if (error) {
    if ((error as any).code === '23505') {
      throw new Error('An admin with this email already exists.')
    }
    throw error
  }
}

/** ===== Signup ===== */
const handleSignup = async () => {
  loading.value = true
  notice.value = ''
  errorMsg.value = ''

  try {
    // Age gate
    if (typeof age.value !== 'number' || Number.isNaN(age.value) || age.value < 18) {
      throw new Error('You must be at least 18 years old to sign up.')
    }
    // Address check
    if (!isAddressComplete()) {
      throw new Error('Please complete your address (Region, City/Municipality, Barangay (optional), ZIP, House/Street).')
    }

    // 1) Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: `${firstName.value} ${lastName.value}`.trim(),
          number: number.value,
          address: fullAddress.value,
          age: age.value,
        },
        // emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    })
    if (error) throw error

    const userId = data?.user?.id
    if (!userId) throw new Error('Could not obtain newly created user id.')

    // 2) Insert admins row with the same UID
    await insertAdminRow(userId)

    // 3) Session handling
    const session = data?.session ?? null
    if (session) {
      notice.value = 'Account created! Redirecting…'
      router.push({ name: 'admin.dashboard' })
    } else {
      notice.value =
        'We sent you a confirmation email. Please verify, then log in. Your admin profile has already been created.'
      // router.push({ name: 'admin.login' })
    }
  } catch (err: any) {
    console.error(err)
    errorMsg.value = err?.message ?? 'Something went wrong during signup.'
  } finally {
    loading.value = false
  }
}

/** ===== Initial Loads ===== */
onMounted(async () => {
  await Promise.all([loadRegions(), loadProvinces(), loadAllLGUs()])
})
</script>

<style scoped>
:root,
:host {
  --green: #20a44c;
  --blue: #30ace4;
  --azure: #20647c;
}
.auth-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #afffca, #f7fcff 50%, #a4e7ff);
}
.auth-card {
  max-width: 720px;
  width: 100%;
}
/* logo */
.auth-head {
  flex-wrap: wrap;
}
.login-logo {
  height: 38px;
  width: auto;
}

.typeahead-menu {
  z-index: 1050;
  max-height: 280px;
  overflow: auto;
  top: 100%;
  left: 0;
}

@media only screen and (max-width: 431px) {
  .password-div {
    flex-direction: column;
  }
  .phonenum-age-div {
    flex-direction: column;
  }
  .auth-card {
    max-width: 400px;
  }
  .login-logo {
    height: 38px;
  }
}
</style>
