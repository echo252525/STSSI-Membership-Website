// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap CSS & JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

// If you ever add Pinia:
// import { createPinia } from 'pinia';

const app = createApp(App);

// If using Pinia later
// const pinia = createPinia();
// app.use(pinia);

app.use(router);
app.mount('#app');
