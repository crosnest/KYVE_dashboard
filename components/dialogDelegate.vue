<template>
    <v-dialog
      v-model="dialog"
      width="30%"
    >
      <template v-slot:activator="{ props }">
        <v-btn style="margin-right: 0.5em;margin-left: 0.5em;" prepend-icon="mdi-reload" variant="tonal"
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
              <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
            </template> 
        <v-card-text>
          <div >
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

                <!-- <v-text-field
                  v-model="memo"
                  label="Memo"
                ></v-text-field> -->
              
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
      validator: 'Crosnest (kyve199403h5jgfr64r9ewv83zx7q4xphhc4wyv8mhp)',
      dialog: false,
      amount: 0,
      memo: '',
  }),
  methods: {
      async submit() {
        console.log(this.amount, this.memo)
        await this.appStore.delegate(this.amount, this.memo)
      }
  }
}
</script>