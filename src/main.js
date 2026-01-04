import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/main.css' // TailwindCSS 연결 (한 번만)

const app = createApp(App)

app.use(createPinia()) // ✅ Pinia 등록
app.use(router)        // ✅ 라우터 등록

app.mount('#app')