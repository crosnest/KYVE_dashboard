<template>
    <tr>
        <td>{{ proposal.id }}</td>
        <td>
            <v-chip v-if="proposal.status === 'PROPOSAL_STATUS_PASSED'" color="green" class="ma-2" label>PASS</v-chip>
            <v-chip v-if="proposal.status === 'PROPOSAL_STATUS_REJECTED'" color="red" class="ma-2" label>REJECT</v-chip>
            <v-chip v-if="proposal.status === 'PROPOSAL_STATUS_FAILED'" color="orange" class="ma-2" label>FAILED</v-chip>
        </td>
        <td>
            <div v-for="(message, index) in proposal.messages" :key="govStore.getTitle(message)">
            {{ govStore.getTitle(message) }}
            <v-divider :thickness="2" v-if="index < proposal.messages.length-1"></v-divider>
            </div>
        </td>
        <td>{{ dateString(proposal.voting_end_time) }}</td>
        <td>
            <v-btn @click="appStore.voteToId(item.id)">
                <v-icon>mdi-vote-outline</v-icon>
            </v-btn>
        </td>
        <td v-if="appStore.islogged">
            <v-chip v-if="userOpt === 'VOTE_OPTION_YES'" color="green" class="ma-2" label>
                YES
            </v-chip>
            <v-chip v-if="userOpt === 'VOTE_OPTION_NO'" color="red" class="ma-2" label>
                NO
            </v-chip>
            <v-chip v-if="userOpt === 'VOTE_OPTION_NO_WITH_VETO'" color="orange" class="ma-2" label>
                NO WITH VETO
            </v-chip>
            <v-chip v-if="userOpt === 'VOTE_OPTION_ABSTAIN'" color="teal" class="ma-2" label>
                ABSTAIN
            </v-chip>
            <v-chip v-if="valoperOpt === 'VOTE_OPTION_NO_VOTE'" color="teal" class="ma-2" label>N/A</v-chip>
            {{ userOpt }}
        </td>
        <td v-else>
            <v-chip color="grey" class="ma-2" label>loading</v-chip>
        </td>
        <td >
            <v-chip v-if="valoperOpt === 'VOTE_OPTION_YES'" color="green" class="ma-2" label>Y</v-chip>
            <v-chip v-if="valoperOpt === 'VOTE_OPTION_NO'" color="red" class="ma-2" label>N</v-chip>
            <v-chip v-if="valoperOpt === 'VOTE_OPTION_NO_WITH_VETO'" color="orange" class="ma-2" label>NwV</v-chip>
            <v-chip v-if="valoperOpt === 'VOTE_OPTION_ABSTAIN'" color="teal" class="ma-2" label>A</v-chip>
            <v-chip v-if="valoperOpt === 'VOTE_OPTION_NO_VOTE'" color="teal" class="ma-2" label>N/A</v-chip>
        </td>
    </tr>
</template>

<script>

import { useGovStore } from '@/store/governance'
import { useAppStore } from '@/store/app'
export default {
    props: {
        proposal: Object, // Prop to pass the individual proposal data
        valoperOption: String,
        userOption: String
    },
    setup(props) {
        const appStore = useAppStore()
        const govStore = useGovStore()
        const valoperOpt = props.valoperOption
        const userOpt = props.userOption
        return {appStore, govStore, valoperOpt, userOpt}
    },
    methods: {
        async voteToId(id) {
            this.dialVote = true
            this.voteFor = id
        },
        async validate () {
            await this.appStore.gov_vote(this.voteFor, this.voteOption)
        },
        dateString(date) {
            const d = new Date(Date.parse(date))
            return d.toLocaleDateString() + " " + d.toLocaleTimeString()
        },
        userVotedValue() {
            return this.valoperVoteData.txs[0].body.messages[0].option
        },
        valoperVotedValue() {
            return this.valoperVoteData.txs[0].body.messages[0].option
        }
   }
};
</script>