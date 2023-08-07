<template>
  <v-app>

    <v-navigation-drawer 
      v-model="appStore.drawer"
      :rail="appStore.rail"
      permanent
      @click="appStore.rail = false"
    >
      <v-list-item
          prepend-avatar="https://dl-eu.cros-nest.com/assets/logo-nest.png"
          title="Crosnest KYVE webapp"
          nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="appStore.rail = !appStore.rail"
          ></v-btn>
        </template>
      </v-list-item>
      <v-divider></v-divider>
      <v-list  density="compact" nav>
        <v-list-item
          v-for="(item, i) in appStore.items"
          :key="i"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          router
          exact
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    
    <v-app-bar
      :clipped-left="appStore.clipped"
      appStore.fixed
      app
    >
      <v-toolbar-title>KYVE restake</v-toolbar-title>
      <v-spacer />
        <v-chip
          v-if="appStore.islogged"
          size="large"
          prepend-avatar="https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/kyve/ukyve.png"
          variant="outlined"
        >
        {{ appStore.balance }}
        </v-chip>
        <v-chip
          v-if="!appStore.islogged && !appStore.isMobile"
          size="large"
          prepend-avatar="https://assets.website-files.com/62dbc9b6b1444851f065c74a/62dbc9b6b14448026c65c7fe_Keplr_256.png"
          @click="appStore.keplrConnect"
        >
          Connect wallet
        </v-chip>
        <v-chip
          v-else-if="appStore.islogged"
          size="large"
          prepend-avatar="https://assets.website-files.com/62dbc9b6b1444851f065c74a/62dbc9b6b14448026c65c7fe_Keplr_256.png"
          @click="appStore.disconnect"
        >
          {{appStore.walletName}}
        </v-chip>
    </v-app-bar>
    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>

    <v-footer
      :absolute="!appStore.fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>


<script>
import { useAppStore } from '@/store/app'
export default {
  name: 'DefaultLayout',
  setup() {
    const appStore = useAppStore()
    appStore.chainId = import.meta.env['VITE_CHAIN_ID']
    appStore.stakerAddress = import.meta.env['VITE_STAKER_ADDRESS']
    appStore.init_store()
    const { isMobile } = useDevice();
    appStore.isMobile = isMobile
    return { appStore }
  },
  methods: {
  }
}
</script>