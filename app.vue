<template>
  <v-app>

    <v-navigation-drawer 
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
    <!-- prepend-avatar="https://dl-eu.cros-nest.com/assets/logo-nest.png" -->
      <v-list-item
          title="Crosnest webapp"
          nav
      >
        <template v-slot:append>
          <v-btn
            v-if="rail == false"
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
          <v-btn
            v-else
            variant="text"
            icon="mdi-chevron-right"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>
      <v-divider></v-divider>
      <v-list  density="compact" nav>
        <v-list-item
          v-for="(item, i) in items"
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
      style="padding-left: 1em; padding-right: 1em;"
      class="bg-pink-lighten-4" 
      :clipped-left="appStore.clipped"
      appStore.fixed
      app
    >
      <v-avatar image="https://dl-eu.cros-nest.com/assets/logo-nest.png"></v-avatar>
      <v-toolbar-title>KYVE restake</v-toolbar-title>
      <v-spacer />
        <v-chip class="balance_chip"
          v-if="appStore.islogged"
          size="large"
          prepend-avatar="https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/kyve/ukyve.png"
          variant="outlined"
        >
        <span>{{ appStore.balance }} </span>
        <template v-slot:append>
          <span class="font-weight-bold text-grey-darken-1"> KYVE</span>
        </template>
        </v-chip>
        
        <v-chip class="address_chip"
          v-if="appStore.islogged"
          size="large"
          variant="outlined"
          @click="onCopy()"
        >
        <span v-if="!copy_tooltip">{{ truncateString(appStore.walletAddress,10,5) }}</span>
        <template v-slot:append>
          <span class="text-grey-darken-1"
          v-if="copy_tooltip"
        >address copied</span>
        <v-icon
          v-else
          class="text-grey-darken-1"
          icon="mdi-content-copy"
        />
        </template>
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
      <v-snackbar
      v-if="appStore.notifText"
      v-model="appStore.notif_event"
      :color="appStore.notifKind"
      multi-line
      location="bottom right"
      rounded="40"
      z-index="10000"
    >
      <strong>{{ appStore.notifText }}</strong>
    </v-snackbar>
    </v-main>
    <v-footer color="pink-lighten-4" class="px-0 py-0" app elevation="0">
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
          target="_blank" rel="noopener noreferrer" 
        ></v-btn>
        <v-btn
          key="mdi-github"
          class="mx-4"
          variant="plain"
          size="small"
          href="https://t.me/crosnest"
          target="_blank" rel="noopener noreferrer" 
        ><img src="~assets/telegram.svg" width="18" height="18"/></v-btn>
        <v-btn
          key="mdi-twitter"
          class="mx-4"
          icon="mdi-twitter"
          variant="plain"
          size="small"
          href="https://twitter.com/Crosnest_com"
          target="_blank" rel="noopener noreferrer" 
        ></v-btn>
      </div>

      <div class="bg-black text-center w-100 py-3">
        {{ new Date().getFullYear() }} — <strong>Crosnest</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { useAppStore } from '@/store/app'
import { useIntervalFn } from '@vueuse/core'

let timeOut

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
    appStore.validatorAddress = import.meta.env['VITE_VALIDATOR_ADDRESS']
    appStore.operatorAddress = import.meta.env['VITE_OPERATOR_ADDRESS']
    appStore.restakeBotAddress = import.meta.env['VITE_RESTAKE_BOT']

    appStore.init_store()
    const { isMobile } = useDevice();
    appStore.isMobile = isMobile

    const update = computed(() => appStore.notif_event)
    return { appStore }
  },
  data: () => ({
    drawer: true,
    rail: true,
    clipped: false,
    copy_tooltip : false,
    items: [
        {
          icon: 'mdi-view-dashboard',
          title: 'Dashboard',
          to: '/'
        },
        {
          icon: 'mdi-inbox-arrow-down',
          title: 'Governance',
          to: '/governance'
        }
      ],
  }),
  computed: {
    balance() {
      return this.appStore.balance
    }
  },
  methods: {
    async refresh() {
      await this.appStore.getBalance()
    },
    truncateString(str,front,back) {
      return `${str.substring(0, front)}...${str.substring(
        str.length - back,
        str.length
      )}`;
    },
    async onCopy() {
          this.copy_tooltip = true
          await navigator.clipboard.writeText(this.appStore.walletAddress)
          if (timeOut) {
            clearTimeout(timeOut);
          }
          timeOut = setTimeout(() => {
            this.copy_tooltip = false;
          }, 1000);
        }
  },
  watch: {
    update(event) {
      if (event) {
        this.refresh()
      }
    }
  },
  onUnmounted() {
    clearTimeout(timeOut);
  },
  beforeMount () {
    window.addEventListener("keplr_keystorechange", updateKeplr);
    useIntervalFn(async () => {
      console.log("refresh infos")
        await this.refresh()
    }, 60000) // call it back every 60s
  },
  beforeDestroy () {
    window.removeEventListener("keplr_keystorechange", updateKeplr);
  }
}
</script>

<style>

.balance_chip{
  justify-content: space-between;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  margin-left: 1em; 
  margin-right: 1em;
  min-width:13em;
}
.address_chip {
  justify-content: space-between;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  margin-left: 1rem; 
  margin-right: 1rem;
  width: 15rem;
}

.balance span,
.address_chip span{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>