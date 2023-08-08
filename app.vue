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
      class="bg-pink-lighten-4" 
      :clipped-left="appStore.clipped"
      appStore.fixed
      app
    >
      <v-avatar image="https://dl-eu.cros-nest.com/assets/logo-nest.png"></v-avatar>
      <v-toolbar-title>KYVE restake</v-toolbar-title>
      <v-spacer />
        <v-chip class="head_chip"
          v-if="appStore.islogged"
          size="large"
          prepend-avatar="https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/kyve/ukyve.png"
          variant="outlined"
        >
        <span>{{ appStore.balance }} $KYVE</span>
        </v-chip>
        <v-chip class="head_chip"
          v-if="!appStore.islogged && !appStore.isMobile"
          size="large"
          prepend-avatar="https://assets.website-files.com/62dbc9b6b1444851f065c74a/62dbc9b6b14448026c65c7fe_Keplr_256.png"
          @click="appStore.keplrConnect"
        >
        <span>Connect wallet</span>
        </v-chip>
        <v-chip class="head_chip"
          v-else-if="appStore.islogged" 
          size="large"
          prepend-avatar="https://assets.website-files.com/62dbc9b6b1444851f065c74a/62dbc9b6b14448026c65c7fe_Keplr_256.png"
          @click="appStore.disconnect"
        >
        <span>{{appStore.walletName}}</span>
        </v-chip>
    </v-app-bar>
    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>
    <v-footer>
      <div class="bg-pink-lighten-4 d-flex w-100 align-center px-4">
        <strong>Get connected with us on social networks!</strong>
        <v-spacer></v-spacer>
        <v-btn
          key="mdi-github"
          class="mx-4"
          icon="mdi-github"
          variant="plain"
          size="small"
          href="https://github.com/crosnest/KYVE_dashboard"
        ></v-btn>
        <v-btn
          key="mdi-twitter"
          class="mx-4"
          icon="mdi-twitter"
          variant="plain"
          size="small"
          href="https://twitter.com/Crosnest_com"
        ></v-btn>
      </div>

      <div class="px-4 py-2 bg-black text-center w-100">
        {{ new Date().getFullYear() }} — <strong>Crosnest</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { useAppStore } from '@/store/app'


async function updateKeplr() {
  try {
    const appStore = useAppStore()
    await appStore.updateWallet()
  } catch (error) {
    console.log("ERROR")
  }
}

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
  },
  beforeMount () {
    window.addEventListener("keplr_keystorechange", updateKeplr);
  },
  beforeDestroy () {
    window.removeEventListener("keplr_keystorechange", updateKeplr);
  }
}
</script>

<style>
.head_chip{
  width:12em;
}
.head_chip span{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>