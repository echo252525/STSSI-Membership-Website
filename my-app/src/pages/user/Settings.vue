<template>
  <div class="container-fluid">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <h2 class="h4 mb-3">Settings</h2>
        <p class="text-secondary">Manage profile and security.</p>

        <form class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Full name</label>
            <input type="text" class="form-control" placeholder="Your name" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" placeholder="name@example.com" />
          </div>
          <div class="col-12">
            <button class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
