<template>
  <section class="container py-4">
    <header class="mb-4">
      <h1 class="h4 fw-bold m-0">About Us</h1>
      <p class="text-muted mt-2 mb-0">Who we are and what we do</p>
    </header>

    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4 p-md-5">
        <h2 class="h5 fw-semibold">Our Mission</h2>
        <p class="text-secondary">
          We help members get the most value from every purchase through rewards, discounts,
          and a delightful shopping experience.
        </p>

        <hr class="my-4" />

        <h2 class="h5 fw-semibold">What We Offer</h2>
        <ul class="text-secondary mb-0">
          <li>Tiered membership with real benefits</li>
          <li>Deals &amp; rewards tailored for you</li>
          <li>Secure e-wallet and smooth checkout</li>
          <li>Fun mini-games with real prizes</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// User-scoped informational page (renders inside UserLayout sidebar)
</script>

<style scoped>
.card-body :is(h2) { color: #0d6efd; }
</style>
