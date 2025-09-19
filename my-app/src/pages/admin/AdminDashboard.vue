<template>
  <div class="admin-dashboard d-flex flex-column min-vh-100">
    <!-- Topbar -->
    <nav class="navbar navbar-light bg-white border-bottom shadow-sm px-3">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Welcome, Admin</h5>
      </div>
    </nav>

    <!-- Dashboard body -->
    <main class="flex-grow-1 p-4 bg-light">
      <h3 class="fw-bold mb-4">Admin Dashboard</h3>

      <div class="row g-4">
        <!-- Example stat cards -->
        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h6 class="text-muted">Total Users</h6>
              <h3 class="fw-bold mb-0">{{ totalUsers }}</h3>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h6 class="text-muted">Active Admins</h6>
              <h3 class="fw-bold mb-0">{{ totalAdmins }}</h3>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h6 class="text-muted">Pending Approvals</h6>
              <h3 class="fw-bold mb-0">5</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder for additional content -->
      <div class="mt-5">
        <h5 class="fw-bold mb-3">Recent Activity</h5>
        <ul class="list-group shadow-sm">
          <li class="list-group-item">User John Doe registered</li>
          <li class="list-group-item">Admin Jane Smith updated settings</li>
          <li class="list-group-item">New membership request pending</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';

const router = useRouter();

const totalUsers = ref<number>(0);
const totalAdmins = ref<number>(0);

const fetchStats = async () => {
  // Example queries (replace with your own schema/tables)
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  totalUsers.value = usersCount || 0;

  const { count: adminsCount } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true });
  totalAdmins.value = adminsCount || 0;
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push({ name: 'admin.login' });
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.admin-dashboard {
  background-color: #f8f9fa;
}
</style>
