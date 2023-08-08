<template>
    <v-dialog
      v-model="dialog"
      width="30%"
    >
      <template v-slot:activator="{ props }">
        <v-btn prepend-icon="mdi-account-cash"
          variant="tonal"
          density="default"
          size="large"
          block rounded="lg"
          v-bind="props">
          Claim Rewards
        </v-btn>
      </template>
        <v-card title="Undelegate"> 
            <template v-slot:prepend>
              <v-avatar>
                  <v-img
                    max-width="32"
                    max-height="32"
                    :src="cosmosConfig[appStore.chainSelected].coinLookup.icon"
                  ></v-img>
                </v-avatar>
            </template>
            
            <template v-slot:append>
              <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
            </template>

          <v-card-text>     
            <div >
              <p>Claim your rewards</p>
              <p>Claimed rewards are free to use</p>
              <p></p>
            </div>
            <v-checkbox 
              v-if="appStore.walletAddress == appStore.staker.address"
              v-model="checkbox_commission"
              >
              <template v-slot:label>
                Withdraw Commission.
              </template>
            </v-checkbox>
            <v-btn 
              class="text-none ma-6"
              prepend-icon="mdi-export-variant" 
              text="Withdraw"
              @click="submit()"
              size="large"
            />
          </v-card-text>
        </v-card>
      </v-dialog> 
</template>

<script>
import cosmosConfig from '~/chain.config'
import { useAppStore } from '@/store/app'

export default {
  setup() {
      const appStore = useAppStore()
      return {appStore, cosmosConfig}
  },
  data: () => ({
      dialog: false,
      amount: 0,
      checkbox_commission: false,
  }),
  methods: {
      async submit() {
        await this.appStore.claim_rewards(this.checkbox_commission)
      }
  }
}
</script>