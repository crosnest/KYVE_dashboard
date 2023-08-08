<template>
    <v-dialog
      v-model="dialog"
      width="30%"
    >
      <template v-slot:activator="{ props }">
        <v-btn prepend-icon="mdi-cash-plus"
          variant="tonal"
          density="default"
          size="large"
          block rounded="lg"
          :disabled="!this.appStore.islogged"
          v-bind="props">
          Delegate
        </v-btn>
      </template>

        <v-card title="Delegate"> 
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
        <v-card-text >
          <div v-if="form">
            <p>Select the number of KYVE to delegate</p>
            <v-text-field
              v-model="amount"
              label="Amount*"
              required
              suffix="$KYVE"
            ></v-text-field>
          
            <v-select
              label="Select"
              v-model="validator"
              :items="[appStore.staker_moniker]"
              readonly
            ></v-select>

            <v-btn 
              class="text-none ma-4"
              prepend-icon="mdi-export-variant" 
              text="Send"
              @click="submit()"
              size="large"  
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
              color="teal-darken-3"
            >
              mdi-checkbox-marked-circle-outline
            </v-icon>  
            <br /><br />
              {{ cmd_ret }} 
          </div>
          <div v-if="resultFailure" class="ma-8 text-center">
            <v-icon
              size="150"
              color="deep-orange-darken-4"
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
      let cmd_ret = {}
      let dialog = false
      return {appStore, cosmosConfig}
  },
  data: () => ({
      validator: 'Crosnest (kyve199403h5jgfr64r9ewv83zx7q4xphhc4wyv8mhp)',
      dialog: false,
      amount: 0,
      memo: '',
      form: true,
      wait: false,
      resultSuccess: false,
      resultFailure: false
  }),
  methods: {
      async submit() {
        console.log(this.amount, this.memo)
        try {
          this.form = false
          this.wait = true
          this.cmd_ret = await this.appStore.delegate(this.amount, this.memo)
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