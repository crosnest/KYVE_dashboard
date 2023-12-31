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
              <v-btn class="mx-1" icon="mdi-help-circle-outline" @click="dialog_help=true"></v-btn>
              <v-btn class="mx-1" icon="mdi-close" @click="dialog=false"></v-btn>
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
              <v-select
                v-model="select"
                :hint="`${select.kind} (${select.address})`"
                :items="items"
                item-title="kind"
                item-value="address"
                label="Select"
                persistent-hint
                return-object
                single-line
              ></v-select>
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
                router
                exact
              >
              <v-textarea
                class="my-2"
                variant="underlined"
                :label=item.title 
                :model-value=item.text
                rounded="20%"
                auto-grow
                readonly
                />
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
      items: [
        { kind: 'Protocol', address: import.meta.env['VITE_STAKER_ADDRESS'] },
        { kind: 'Consensus', address: import.meta.env['VITE_VALIDATOR_ADDRESS'] },
      ],
      select: { kind: 'Protocol', address: import.meta.env['VITE_STAKER_ADDRESS'] },
      help_topics: [
        {
          icon: '',
          title: 'Undelegate',
          text: 'When a user requests undelegation from a validator, the amount of KYVE that was requested for undelegation will be locked in unbonding state for the next 14 days.'
        },
      ],
      dialog_help: false,
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
          this.cmd_ret = await this.appStore.undelegate(this.amount, this.select)
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