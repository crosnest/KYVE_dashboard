<template>
    <v-dialog
      v-model="dialog"
      width="30%"
    >
      <template v-slot:activator="{ props }">
        <v-btn prepend-icon="mdi-reload"
          variant="tonal"
          density="default"
          size="large"
          block rounded="lg"
          :disabled="appStore.staker_my_deleg == '0'"
          v-bind="props">
          <div v-if="appStore.grantAction === 'Grant'">Enable Restake</div>
          <div v-else >Disable restake</div>
        </v-btn>
      </template>
        <v-card :title="appStore.grantAction"> 
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
              <p>Action to execute</p>
              <v-select
                label="Select"
                v-model="appStore.grantAction"
                :items="['Grant', 'Revoke']"
                readonly
              ></v-select>
              <div v-if="appStore.grantAction === 'Grant'">
                <p>Set the period of the grant</p>
                <v-select
                  label="Select"
                  v-model="duration"
                  :items="['1 Week', '1 Month', '1 Year']"
                ></v-select>
              </div>
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
import moment from 'moment'

export default {
  setup() {
      const appStore = useAppStore()
      return {appStore, cosmosConfig}
  },
  data: () => ({
      help_topics: [
        {
          icon: '',
          title: 'How Restake works',
          text: 'Restake makes use of a feature in Cosmos blockchains called Authz.\n\n'+
          'When granted you authorize the wallet owned by Crosnest to send Delegate messages on your behalf.\n'+
          'We cannot spent your funds only delegate. Authorisation expires automatically after your selected period and you can revoke at any time'
        },
      ],
      dialog_help: false,
      dialog: false,
      duration: '1 Year',
      memo: '',
      form: true,
      wait: false,
      resultSuccess: false,
      resultFailure: false
  }),
  methods: {
      async submit() {
        console.log(this.duration, appStore.grantAction)
        const time = moment()
        console.log("current time = ", time.toISOString())
        switch (this.duration) {
          case '1 Week':
            time.add(1, 'week');
            break;
          case '1 Month':
            time.add(1, 'month');
            break;
          case '1 Year':
            time.add(1, 'year');
          break;
        
          default:
            break;
        }
        console.log("futur time = ", time.toISOString())
        try {
          this.form = false
          this.wait = true  
          this.cmd_ret = await this.appStore.restake(time, appStore.grantAction)
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
        this.duration = '1 Year',
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