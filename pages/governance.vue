<template>
   <div>
      <v-row class="ml-2 mt-4">
         <v-col cols="6">
            <v-card class="outline-border">
               <v-card-title>
                  <h4>
                     <v-avatar rounded="0" class="mr-2">
                        <v-icon>mdi-vote-outline</v-icon>
                     </v-avatar>
                     All props active
                  </h4>
               </v-card-title>
               <v-card-text style="text-align: end;">
                  <v-skeleton-loader
                        :loading="votingGovPending"
                        type="text"
                        width="500px"
                        >
                     <h3>{{ govStore.votingPeriodCount }} props active</h3>
                  </v-skeleton-loader>
               </v-card-text>
            </v-card>
         </v-col>
         <v-col cols="6">
            <v-card class="outline-border">
               <v-card-title>
                  <h4>
                     <v-avatar rounded="0" class="mr-2">
                        <v-icon>mdi-plus-circle-multiple-outline</v-icon>
                     </v-avatar>
                     Can be voted
                  </h4>
               </v-card-title>
               <v-card-text style="text-align: end;">
                  <v-skeleton-loader
                        :loading="votingGovPending"
                        type="text"
                        width="500px"
                        >
                     <h3>{{ govStore.votingPeriodCount }} props can be voted</h3>
                  </v-skeleton-loader>
               </v-card-text>
            </v-card>
         </v-col>
      </v-row>
      <div class="mt-5 ml-5 text-h5">Proposals</div>
      <v-row class="ml-2 mt-4">
         <v-col cols="12">
            <v-card class="outline-border" min-height="364">
               <v-card-text>
                  <v-table>
                     <thead>
                        <tr>
                           <th class="text-left">ID</th>
                           <th class="text-left">Status</th>
                           <th class="text-left">Proposal Titles</th>
                           <th class="text-left">Voting End Time</th>
                           <th class="text-left">Vote now</th>
                           <th class="text-left">Your Vote</th>
                           <th class="text-left">Crosnest Vote</th>
                        </tr>
                     </thead>
                     <tbody>
                        <proposal-table-row
                           v-for="proposal of govStore.getEndedProps"
                           :key="proposal.id"
                           :proposal="proposal"
                        />
                     </tbody>
                  </v-table>
               </v-card-text>
            </v-card>
         </v-col>
      </v-row>
      <v-dialog
         v-model="dialVote"
         max-width="600px"
         >
         <v-card>
            <v-card-title>
               <span class="text-h5">Vote for proposal {{ voteFor }}</span>
            </v-card-title>
            <v-card-text>
               <v-form
                  ref="form"
                  v-model="dislableSend"
                  lazy-validation
                  >
                  <v-item-group
                     v-model="selected"
                     >
                     <v-container>
                        <v-container fluid>
                           <v-row dense>
                              <v-col
                                 class="mx-auto"
                                 v-for="card in cardsVote"
                                 :key="card.title"
                                 :cols="card.flex"
                                 >
                                 <v-item :value="card" v-slot="{ isSelected, toggle }">
                                    <v-card
                                       :color="isSelected ? 'primary' : ''"
                                       class="d-flex align-center"
                                       @click="toggle();"
                                       >
                                       <v-icon class="ml-4">mdi-vote-outline</v-icon>
                                       <v-card-title v-text="card.title"></v-card-title>
                                    </v-card>
                                 </v-item>
                              </v-col>
                           </v-row>
                        </v-container>
                     </v-container>
                  </v-item-group>
               </v-form>
            </v-card-text>
            <v-card-actions>
               <v-spacer></v-spacer>
               <v-btn
                  :disabled="!dislableSend"
                  :loading="loading"
                  color="darken-1"
                  @click="validate"
                  >
                  Send Vote
               </v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
   </div>
</template>

<script>
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { useAppStore } from '@/store/app'
import { useGovStore } from '@/store/governance'

export default {
  components: {
    VSkeletonLoader,
    VDataTable
  },
  setup() {
   const appStore = useAppStore()
   const govStore = useGovStore()

   // get all the proposal in voting period
   const votingGovQuery = appStore.sdk.config.rest + '/cosmos/gov/v1/proposals'
   const { data: votingGovData, pending: votingGovPending, error: votingGovError, refresh: votingGovRefresh } = useFetch(votingGovQuery, {
      onResponse({request, response, options}) {
         const govStore = useGovStore()
         for (const proposal of response._data.proposals) {
            govStore.endedProps.set(proposal.id, proposal)
         }
      },
      lazy: true,
      server: false
   })

   async function fetchUserVotes() {
      (async () => { 
         const appStore = useAppStore()
         const govStore = useGovStore()
         const votes = await govStore.fetchVotes(appStore.walletAddress)
         for (const tx of votes.tx_responses) {
            const {id, vote} = govStore.getVote(tx)
            govStore.userVotes.set(id, vote)
         }
      })();
   }

   watchEffect(() => {
      if (appStore.islogged) {
        fetchUserVotes();
      }
    });
   
   return { appStore, govStore, votingGovData, votingGovPending }
   },
   data: () => ({
   dialVote: false,
   voteFor: undefined,
   cardsVote: [
      { title: 'Yes', flex: 5 },
      { title: 'No', flex: 5 },
      { title: 'NoWithVeto', flex: 5 },
      { title: 'Abstain', flex: 5 },
   ],
   votesHeaders: [
      { title: 'Id', align: 'start', key: 'proposal_id'},
      { title: 'Title', key: "title"},
      { title: 'End voting time', key: 'voting_end_time'},
      { title: 'Your Vote', key: 'votedValue'},
      { title: 'Crosnest Vote', key: 'valoperVotedValue'}
   ],
  }),
  methods: {
      async voteToId(id) {
         this.dialVote = true
         this.voteFor = id
      },
      findOptionOfProposal(proposalId) {
         
      },
      async validate () {
         await this.appStore.gov_vote(this.voteFor, this.voteOption)
      },
      dateString(date) {
         const d = new Date(Date.parse(date))
         return d.toLocaleDateString() + " " + d.toLocaleTimeString()
      },
   },
   beforeMount() {
      (async () => {
         const votes = await this.govStore.fetchVotes(this.appStore.operatorAddress)
         for (const tx of votes.tx_responses) {
            const {id, vote} = this.govStore.getVote(tx)
            console.log("found vote : ", id, vote);
            this.govStore.valoperVotes.set(id, vote)
         }
      })();
   }
}

</script>
