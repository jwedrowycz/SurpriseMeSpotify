import Vue from 'vue';
import App from './App.vue';
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueElementLoading from "vue-element-loading";

import BootstrapVue from 'bootstrap-vue';
import normalize from 'normalize.css';
import querystring from 'querystring';
import debounce from 'debounce';
import lodash from 'lodash';
import vSelect from 'vue-select'


import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './sass/app.scss';
import 'vue-select/dist/vue-select.css';


Vue.config.productionTip = false
Vue.use(normalize);
Vue.use(querystring);
Vue.use(lodash);
Vue.use(debounce);
Vue.component('v-select', vSelect)
Vue.use(BootstrapVue)
Vue.component("VueElementLoading", VueElementLoading);

Vue.use(VueAxios, axios)

new Vue({
  render: (h) => h(App),
}).$mount('#app');
