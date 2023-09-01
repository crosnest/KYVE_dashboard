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
          Redelegate
        </v-btn>
      </template>

        <v-card title="Redelegate"> 
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
        <v-card-text >
          <div v-if="form">
            <p>Select the number of KYVE to delegate</p>
            <v-text-field
              v-model="amount"
              label="Amount*"
              focused
              required
              prefix="KYVE"
              :placeholder="placeholder"
            >
            <template v-slot:append-inner>
              <v-col style="font-size:smaller;" class=" py-0 my-0">
                <span class="text-grey-darken-1 py-0 my-0" style="font-size:smaller; cursor: pointer;" @click="setHalf"> half</span>
                <span class="text-grey-darken-1 py-0 my-0" style="font-size:smaller; cursor: pointer;" @click="setMax"> max</span>
              </v-col>
            </template>
          </v-text-field>
            <v-text-field
              v-model="from"
              label="From Validator*"
              focused
              required
              prefix=""
            />
            <v-text-field
              v-model="to"
              label="To Validator*"
              focused
              required
              prefix=""
            />
            <v-btn
              class="text-none ma-4"
              prepend-icon="mdi-export-variant" 
              text="Send"
              @click="submit()"
              size="large"
              :disabled="amount === 0 || !amount"  
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
              color="deep-orange-darken-4"
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
      let cmd_ret = {}
      let dialog = false

      return {appStore, cosmosConfig}
  },
  data: () => ({
      help_topics: [
        {
          icon: '',
          title: 'Redelegation',
          text: 'Allow to immediatly change the stake from a validator to another'
        },
      ],
      dialog_help: false,
      dialog: false,
      amount: null,
      from: '',
      to: '',
      memo: '',
      form: true,
      wait: false,
      resultSuccess: false,
      resultFailure: false
  }),
  methods: {
      setHalf() {
        this.amount = (this.appStore.balance / 2).toPrecision(this.appStore.sdk.config.coinDecimals)
      },
      setMax() {
        this.amount = this.appStore.balance - 0.5
      },
      async submit() {
        console.log(this.amount, this.memo)
        try {
          this.form = false
          this.wait = true
          this.cmd_ret = await this.appStore.redelegate(this.amount, this.from, this.to)
          if(this.cmd_ret == undefined) { throw new TypeError("Transaction abort")}
          this.wait = false
          this.resultSuccess = true
          this.appStore.notifText = `Redelegation Success`
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
  computed: {
    placeholder() {
      return 'max ' + this.appStore.balance
    }
  },  
  watch: {
    dialog(visible) {
      if (visible) {
        // Here you would put something to happen when dialog opens up
        // reset dialog state
        this.amount = null,
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