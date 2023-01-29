import { createApp } from "vue";
import App from "./App.vue";
import store from "./component/store/main.js";
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app
.use(store)
// .use(ElementPlus)
.mount('#app')
