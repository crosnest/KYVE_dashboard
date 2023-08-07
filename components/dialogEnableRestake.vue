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
              <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
            </template>
          <v-card-text>     
            <div >
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
                :items="['1 week', '1 month', '1 year']"
              ></v-select>
            </div>
            <v-btn 
              class="text-none ma-4"
              prepend-icon="mdi-export-variant" 
              text="Send"
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
      duration: '1 Year',
      action: 'Grant',
      memo: '',
  }),
  methods: {
      async submit() {
        console.log(this.duration, this.action)
        const time = new Date()
        switch (this.duration) {
          case '1 week':
            time.setDate(time.getDate() + 7);
            break;
          case '1 month':
            time.setDate(time.getDate() + 31);
            break;
          case '1 year':
            time.setDate(time.getDate() + 365);
          break;
        
          default:
            break;
        }
        await this.appStore.restake(time, this.action)
      }
  }
}
</script>