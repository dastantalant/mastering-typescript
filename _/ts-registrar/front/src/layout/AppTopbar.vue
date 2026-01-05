<script setup>
import {useLayout} from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import {useAuthStore} from '@/stores';
import router from "@/router/index.js";


const {toggleMenu, toggleDarkMode, isDarkTheme, layoutState} = useLayout();

const authStore = useAuthStore();
const route = useRoute();

import {ref, onMounted} from 'vue'
import Menubar from 'primevue/menubar'
import {useRoute} from "vue-router";
import MenuService from '../services/MenuService';

const menuService = new MenuService();

const model = ref();

const findAll = () => {
  menuService.getMenu().then((data) => (model.value = data));
};

onMounted(() => {
  findAll();
});

const logout = () => {
  authStore
      .logout()
      .then(() => {
        router.push(route.query.returnUrl === '/login');
      })
      .catch((error) => {
        //messages.value = [{ severity: 'error', content: i18nT.t('auth.badCredentials') }];
      });
};

const items = ref([
  {label: 'Главная', icon: 'pi pi-home', to: '/'},
  {label: 'О нас', icon: 'pi pi-info-circle', to: "/pages/alga-process"},
  {label: 'Контакты', icon: 'pi pi-phone', to: '/pages/dictionaries/registrar'}
])

function itemClick(event, item) {
  if (route.fullPath === item.to) {
    event.preventDefault() // предотвращаем обычную навигацию
    router.replace({path: '/empty'}) //костыль для перезагрузки страницы
        .then(() => router.replace(item.to))
  }

  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if ((item.to || item.url) && (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)) {
    toggleMenu();
  }

  if (item.command) {
    item.command({originalEvent: event, item: item});
  }


}

function checkActiveRoute(item) {
  return route.path === item.to;
}

</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <router-link to="/" class="layout-topbar-logo">
        <img src="/favicon.svg" class="logo" alt="Hur logo"/>
        <span>Регистратор</span>
      </router-link>
    </div>
    <div class="layout-topbar-actions">
      <Menubar :model="model" class="align-center w-23">
        <template #item="{ item, props, hasSubmenu }">
          <router-link v-if="item.to" @click="itemClick($event, item)"
                       :class="[item.class, { 'active-route': checkActiveRoute(item) }]" class="p-menubar-item-link"
                       tabindex="0" :to="item.to"
                       :key="route.fullPath">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items"></i>
            <Badge v-if="item.badge" class="ml-auto" :value="item.badge"/>
          </router-link>
          <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
            <span :class="item.icon"/>
            <span>{{ item.label }}</span>
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down"/>
          </a>
        </template>
      </Menubar>
    </div>
    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>
        <div class="relative">
          <button
              v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
              type="button"
              class="layout-topbar-action layout-topbar-action-highlight"
          >
            <i class="pi pi-palette"></i>
          </button>
          <AppConfigurator/>
        </div>
      </div>
      <button
          class="layout-topbar-menu-button layout-topbar-action"
          v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu lg:block">
        <div class="layout-topbar-menu-content">
          <span v-text="authStore.user.username"/>
        </div>
      </div>
      <button type="button" class="layout-topbar-action" @click="logout">
        <i class="pi pi-sign-out"></i>
        <span>Profile</span>
      </button>
    </div>
  </div>
</template>
<style scoped>


.layout-topbar {
  height: auto !important;
}

/* Подсветка активного пункта */
.router-link-exact-active {
  color: var(--primary-color);
  border-radius: 6px;
}
</style>