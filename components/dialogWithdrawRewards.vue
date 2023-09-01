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
          :disabled="appStore.staker_my_deleg == '0'"
          v-bind="props">
          Claim Rewards
        </v-btn>
      </template>
        <v-card title="Withdraw rewards"> 
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
              <v-btn class="mx-1" icon="mdi-help-circle-outline" @click="dialog_help=true"></v-btn>
              <v-btn class="mx-1" icon="mdi-close" @click="dialog=false"></v-btn>
            </template>

          <v-card-text>     
            <div v-if="form">
              <p>Claim your rewards</p>
              <!-- <p>Claimed rewards are free to use</p> -->
              <p></p>
              <v-checkbox 
                v-model="checkbox_protocol"
                >
                <template v-slot:label>
                  Withdraw Protocol rewards.
                </template>
              </v-checkbox>
              <v-checkbox 
                v-model="checkbox_consensus"
                >
                <template v-slot:label>
                  Withdraw Consensus rewards.
                </template>
              </v-checkbox>
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
              <a :href="appStore.getExplorerLink(cmd_ret)" target="_blank" rel="noopener noreferrer" >View on explorer</a>
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
        <v-dialog
        v-model="dialog_help"
        width="40%"
      >
      <template v-slot:activator="{ props }">
          <v-btn prepend-icon="mdi-cash-plus"
            variant="tonal"
            density="default"
            size="large"
            block rounded="lg"
            :disabled="!this.appStore.islogged"
            v-bind="props">
            Help
          </v-btn>
        </template>

          <v-card title="Help"> 
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
                <v-btn icon="mdi-close" @click="dialog_help=false"></v-btn>
              </template> 
            <v-card-text >
              <v-list-item
                v-for="(item, i) in help_topics"
                :key="i"
                :prepend-icon="item.icon"
                :title="item.title"
                :subtitle="item.text"
                router
                exact
              >
              </v-list-item>
            </v-card-text>
          </v-card>
      </v-dialog>
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
      help_topics: [
        {
          icon: '',
          title: 'Withdraw rewards',
          text: 'Withdraw rewards from delegation to Crosnest. The claimed rewards are immediatly available.'
        },
      ],
      dialog_help: false,
      dialog: false,
      amount: 0,
      checkbox_commission: false,
      checkbox_protocol: false,
      checkbox_consensus: false,
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
          this.cmd_ret = await this.appStore.claim_rewards(this.checkbox_protocol, this.checkbox_consensus, this.checkbox_commission)
          if(this.cmd_ret == undefined) { throw new TypeError("Transaction abort")}
          this.wait = false
          this.resultSuccess = true
          this.appStore.notifText = `Transaction Success`
          this.appStore.notifKind = 'success'
        } catch(error) {
          this.wait = false
          this.resultFailure = true
          this.cmd_ret = error.message;
          this.appStore.notifText = this.cmd_ret
          this.appStore.notifKind = 'error'
        }
        this.appStore.notif_event = true
      }
  },
  watch: {
    dialog(visible) {
      if (visible) {
        // Here you would put something to happen when dialog opens up
        // reset dialog state
        this.amount = 0,
        this.checkbox_commission = false,
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