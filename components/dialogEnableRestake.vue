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
          Enable Restake
        </v-btn>
      </template>
        <v-card title="Grant & Revoke"> 
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
              <p>Select the action</p>
              <v-select
                label="Select"
                v-model="action"
                :items="['Grant', 'Revoke']"
                readonly
              ></v-select>
              <p>Set the period of the grant</p>
              <v-select
                label="Select"
                v-model="duration"
                :items="['1 Week', '1 Month', '1 Year']"
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
      duration: '1 Year',
      action: 'Grant',
      memo: '',
      form: true,
      wait: false,
      resultSuccess: false,
      resultFailure: false
  }),
  methods: {
      async submit() {
        console.log(this.duration, this.action)
        const time = new Date()
        console.log("current time = ", time.toISOString())
        switch (this.duration) {
          case '1 Week':
            time.setDate(new Date().getDate() + 7);
            break;
          case '1 Month':
            time.setDate(new Date().getDate() + 31);
            break;
          case '1 Year':
            time.setDate(new Date().getDate() + 365);
          break;
        
          default:
            break;
        }
        console.log("futur time = ", time.toISOString())
        try {
          this.form = false
          this.wait = true  
          this.cmd_ret = await this.appStore.restake(time, this.action)
          if(this.cmd_ret == undefined) { throw new TypeError("Transaction abort")}
          this.wait = false
          this.resultSuccess = true
        } catch(error) {
          this.wait = false
          this.resultFailure = true
          this.cmd_ret = error.message;
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
        this.duration = '1 Year',
        this.action = 'Grant',
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