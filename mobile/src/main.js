import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';

// Vant
import Vant from 'vant';
import 'vant/lib/index.css';

// 样式重置
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Vant);

app.mount('#app');
