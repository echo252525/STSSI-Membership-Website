<template>
  <div class="container-fluid">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <h2 class="h4 mb-1">Settings</h2>
        <p class="text-secondary mb-4">Manage profile and security.</p>

        <!-- Profile section -->
        <div class="d-flex align-items-center gap-3 mb-4">
          <!-- Avatar -->
          <div class="avatar-wrap">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              alt="Profile"
              class="avatar-img"
            />
            <div v-else class="avatar-fallback">{{ initials }}</div>
          </div>

          <div class="d-flex gap-2">
            <label class="btn btn-outline-primary btn-sm mb-0">
              Change Photo
              <input
                type="file"
                accept="image/*"
                class="d-none"
                @change="onPickAvatar"
              />
            </label>
            <button
              class="btn btn-outline-secondary btn-sm"
              type="button"
              @click="removeAvatar"
              :disabled="busy.remove"
              :title="busy.remove ? 'Removing...' : 'Remove current photo'"
            >
              <span v-if="busy.remove" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Remove Photo
            </button>
          </div>
        </div>

        <!-- Your existing form (unchanged structure; only bound to data) -->
        <form class="row g-3" @submit.prevent="saveProfile">
          <div class="col-md-6">
            <label class="form-label">Full name</label>
            <input
              type="text"
              class="form-control"
              placeholder="Your name"
              v-model.trim="form.full_name"
              :disabled="busy.save"
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
            />
          </div>
          <div class="col-12 d-flex align-items-center gap-2">
            <button class="btn btn-primary" :disabled="busy.save">
              <span v-if="busy.save" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Save Changes
            </button>

            <button
              class="btn btn-outline-danger ms-auto"
              type="button"
              @click="confirmDeleteAccount"
              :disabled="busy.delete"
              :title="busy.delete ? 'Deleting account…' : 'Delete account'"
            >
              <span v-if="busy.delete" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Delete Account
            </button>
          </div>
        </form>

        <!-- Status / errors -->
        <p v-if="message.text" class="mt-3" :class="message.ok ? 'text-success' : 'text-danger'">
          {{ message.text }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { createClient, type User } from '@supabase/supabase-js'
import { useRouter } from 'vue-router' // for redirect
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const users = computed(() => currentUser.value)

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
const dbRow = ref<{ id: string; full_name: string; email: string; profile_url: string | null } | null>(null)

const form = ref({
  full_name: '',
  email: ''
})

const avatarUrl = ref<string | null>(null)   // signed URL for display
const busy = ref({ save: false, remove: false, delete: false })
const message = ref<{ ok: boolean; text: string }>({ ok: true, text: '' })

// --- Helpers ---
const initials = computed(() => {
  const name = form.value.full_name || ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U' // default
  const chars = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  return chars.toUpperCase()
})

function setMessage(ok: boolean, text: string) {
  message.value = { ok, text }
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

async function loadMe() {
  const { data: ures } = await supabase.auth.getUser()
  user.value = ures.user ?? null
  if (!user.value) {
    setMessage(false, 'Not signed in.')
    return
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, profile_url')
    .eq('id', user.value.id)
    .maybeSingle()

  if (error) {
    setMessage(false, 'Failed to load profile: ' + error.message)
    return
  }

  dbRow.value = data
  form.value.full_name = data?.full_name ?? ''
  form.value.email = data?.email ?? ''

  await fetchSignedUrlIfAny()
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

async function confirmDeleteAccount() {
  if (!user.value) return
  const yes = window.confirm(
    'This will permanently delete your account, your profile photo, and all related data. This cannot be undone. Continue?'
  )
  if (!yes) return
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
      body: {}, // optional
    })

    if (error) throw error

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

onMounted(loadMe)
</script>

<style scoped>
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
</style>
