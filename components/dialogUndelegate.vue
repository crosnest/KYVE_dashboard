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
          :disabled="appStore.staker_my_deleg == '0'"
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
              <v-btn icon="mdi-close" @click="dialog=false"></v-btn>
            </template>

          <v-card-text>     
            <div v-if="form">
              <p>Undelegation will take effect immediatly and cannot be cancelled</p>
              <p>The token will not be available for the 14 days</p>
              <p>You will receive NO rewards during unbonding period</p>
              <p></p>
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
              </div>
              <div v-if="wait" class="ma-8 text-center">
              <v-progress-circular                
                :size="100"
                :width="5"
                color="pink-lighten-4"
                indeterminate 
                justify="center"
              ></v-progress-circular>   
            </div>
            <div v-if="resultSuccess" class="ma-8 text-center">
              <v-icon
                size="150"
                color="teal-darken-4"
              >
              mdi-checkbox-marked-circle-outline
              </v-icon>  
              <br /><br />
                {{ cmd_ret }} 
            </div>
            <div v-if="resultFailure" class="ma-8 text-center">
              <v-icon
                size="150"
                color="deep-orange-accent-4"
              >
                mdi-close-circle-outline
              </v-icon>  
              <br /><br />
                {{ cmd_ret }} 
            </div>

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
      form: true,
      wait: false,
      resultSuccess: false,
      resultFailure: false
  }),
  methods: {
      async submit() {
        try {
          this.form = false
          this.wait = true
          this.cmd_ret = await this.appStore.undelegate(this.amount)
          this.wait = false
          this.resultSuccess = true
        } catch(error) {
          this.wait = false
          this.resultFailure = true
          this.cmd_ret = error;
        }
        this.appStore.notifText = this.cmd_ret
        this.appStore.notif_event = true
      }
  },
  watch: {
    dialog(visible) {
      if (visible) {
        // Here you would put something to happen when dialog opens up
        // reset dialog state
        this.amount = 0,
        this.checkbox = false,
        this.form = true,
        this.wait = false,
        this.resultSuccess = false,
        this.resultFailure = false
        this.cmd_ret = {}
      } else {
        // Here you would put something to happen when dialog close down
      }
    }
  }
}
</script>