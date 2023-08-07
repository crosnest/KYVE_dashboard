<template>
    <v-dialog
      v-model="dialog"
      width="30%"
    >
      <template v-slot:activator="{ props }">
        <v-btn prepend-icon="mdi-cash-refund"
          variant="tonal"
          density="default"
          size="large"
          block rounded="lg"
          v-bind="props">
          Undelegate
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
              <p>Undelegation will take effect immediatly and cannot be cancelled</p>
              <p>The token will not be available for the 14 days</p>
              <p>You will receive NO rewards during unbonding period</p>
              <p></p>
            </div>
            <v-text-field
                  v-model="amount"
                  label="Amount*"
                  required
                  suffix="$KYVE"
                ></v-text-field>
            <v-checkbox 
              v-model="checkbox" 
              >
              <template v-slot:label>
                I agree to undelegate from {{ appStore.staker.metadata.moniker }}.
              </template>
            </v-checkbox>
            <v-btn 
              class="text-none ma-6"
              prepend-icon="mdi-export-variant" 
              text="Undelegate"
              @click="submit()"
              size="large"
              :disabled="!checkbox"
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
      checkbox: false,
  }),
  methods: {
      async submit() {
        await this.appStore.undelegate(this.amount)
      }
  }
}
</script>