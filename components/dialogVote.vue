<template>
    <v-dialog
      v-model="dialog"
      width="70%"
    >
      <template v-slot:activator="{ props }">
        <v-btn prepend-icon="mdi-vote"
          variant="tonal"
          :disabled="!this.appStore.islogged"
          v-bind="props">
          Vote Now
        </v-btn>
      </template>

        <v-card title="Vote"> 
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
            <v-row>
              <v-col cols="9"  class="d-none d-lg-block">
                <v-textarea
                  v-for="message,index in govStore.endedProps.get(proposal_id)?.messages" 
                  :key="index"
                  variant="outlined"
                  :label="govStore.getTitle(message)" 
                  :model-value="govStore.getDescription(message)"
                  :readonly='readonly'
                  rounded="20%"
                  auto-grow
                  />
              </v-col>
              <v-col>
                <v-radio-group v-model="vote_option">
                      <v-radio label="ABSTAIN" value="2"></v-radio>
                      <v-radio label="YES" value="1"></v-radio>
                      <v-radio label="NO" value="3"></v-radio>
                      <v-radio label="NO with VETO" value="4"></v-radio>
                </v-radio-group>
                <v-textarea
                  variant="outlined"
                  label="note" 
                  :v-model="memo"
                  rounded="20%"
                  auto-grow
                  :focused=true
                  />
                <v-btn 
                  class="text-none ma-4"
                  prepend-icon="mdi-export-variant" 
                  text="Send Vote"
                  @click="submit()"
                  size="large"
                  :disabled="!vote_option"
                />
              </v-col>
            </v-row>

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
import { useGovStore } from '@/store/governance'

export default {
  props: {
        proposal_id: String, // Prop to pass the individual proposal data
    },
  setup(props) {
      const appStore = useAppStore()
      const govStore = useGovStore()
      const proposal_id = props.proposal_id
      return {appStore, govStore, proposal_id, cosmosConfig}
  },
  data: () => ({
      help_topics: [
        {
          icon: '',
          title: 'Consensus validator',
          text: 'KYVE has two layers to its blockchain, the consensus layer, and the protocol layer. The consensus layer is the backbone of KYVE, relying on validators to secure the chain in Delegated Proof of Stake.'
        },
        {
          icon: '',
          title: 'Protocol validator',
          text: 'KYVE has two layers to its blockchain, the consensus layer, and the protocol layer. The protocol layer is technically KYVE’s data lake. This layer relies on validators called protocol validators. Protocol validators work as both uploaders and validators, and therefore are responsible for fetching data from a data source, validating the data, and storing it.'
        }
      ],
      dialog_help: false,
      readonly: true,
      dialog: false,
      vote_option: undefined,
      memo: '',
      form: true,
      wait: false,
      resultSuccess: false,
      resultFailure: false
  }),
  methods: {
      async submit() {
        console.log(this.vote_option, this.proposal_id, this.memo)
        try {
          this.form = false
          this.wait = true
          this.cmd_ret = await this.appStore.gov_vote(this.proposal_id, this.vote_option, this.memo)
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
        this.vote_option = 0,
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