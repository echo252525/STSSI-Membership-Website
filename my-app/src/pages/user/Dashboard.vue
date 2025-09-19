<template>
  <div class="dash container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h2 class="h4 mb-2">Dashboard</h2>
            <p class="text-secondary mb-4" v-if="user">Email: {{ user.email }}</p>

            <div class="d-flex gap-2">
              <button class="btn btn-dark" @click="logout">Logout</button>
              <router-link to="/app/membership" class="btn btn-outline-primary">Go to Membership</router-link>
              <router-link to="/app/minigames" class="btn btn-outline-success">Play Mini Games</router-link>
              <router-link to="/app/settings" class="btn btn-outline-secondary">Settings</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { currentUser } from '@/lib/authState';

const router = useRouter();
const user = computed(() => currentUser.value);

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return router.push({ name: 'login' });
  }
});

const logout = async () => {
  await supabase.auth.signOut().catch(() => {});
  router.push({ name: 'login' });
};
</script>

<style scoped>
.dash { display: block; }
</style>
