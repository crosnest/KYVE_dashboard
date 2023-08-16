<template>
    <tr>
        <td>{{ proposal.id }}</td>
        <td>
            <v-chip v-if="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'" color="gray" class="ma-2" label>VOTING</v-chip>
            <v-chip v-if="proposal.status === 'PROPOSAL_STATUS_PASSED'" color="green" class="ma-2" label>PASSED</v-chip>
            <v-chip v-if="proposal.status === 'PROPOSAL_STATUS_REJECTED'" color="red" class="ma-2" label>REJECTED</v-chip>
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
            <dialogVote v-if="proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'" :proposal_id="proposal.id"></dialogVote>
            <!-- <dialogVote :proposal_id="proposal.id"></dialogVote> -->
        </td>
        <td v-if="appStore.islogged">
            <v-chip v-if="govStore.userVote(proposal.id) === 'VOTE_OPTION_YES'" color="green" class="ma-2" label>YES</v-chip>
            <v-chip v-if="govStore.userVote(proposal.id) === 'VOTE_OPTION_NO'" color="red" class="ma-2" label>NO</v-chip>
            <v-chip v-if="govStore.userVote(proposal.id) === 'VOTE_OPTION_NO_WITH_VETO'" color="orange" class="ma-2" label>NO WITH VETO</v-chip>
            <v-chip v-if="govStore.userVote(proposal.id) === 'VOTE_OPTION_ABSTAIN'" color="teal" class="ma-2" label>ABSTAIN</v-chip>
            <v-chip v-if="govStore.userVote(proposal.id) === 'VOTE_OPTION_NO_VOTE'" color="teal" class="ma-2" label>N/A</v-chip>
        </td>
        <td v-else>
            <v-chip color="grey" class="ma-2" label>loading</v-chip>
        </td>
        <td >
            <v-chip v-if="govStore.valoperVote(proposal.id) === 'VOTE_OPTION_YES'" color="green" class="ma-2" label>Y</v-chip>
            <v-chip v-if="govStore.valoperVote(proposal.id) === 'VOTE_OPTION_NO'" color="red" class="ma-2" label>N</v-chip>
            <v-chip v-if="govStore.valoperVote(proposal.id) === 'VOTE_OPTION_NO_WITH_VETO'" color="orange" class="ma-2" label>NwV</v-chip>
            <v-chip v-if="govStore.valoperVote(proposal.id) === 'VOTE_OPTION_ABSTAIN'" color="teal" class="ma-2" label>A</v-chip>
            <v-chip v-if="govStore.valoperVote(proposal.id) === 'VOTE_OPTION_NO_VOTE'" color="teal" class="ma-2" label>N/A</v-chip>
        </td>
    </tr>
</template>

<script>

import { useGovStore } from '@/store/governance'
import { useAppStore } from '@/store/app'
export default {
    props: {
        proposal: Object, // Prop to pass the individual proposal data
    },
    setup(props) {
        console.log("ROW => ",props.proposal);
        const appStore = useAppStore()
        const govStore = useGovStore()
        return {appStore, govStore}
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
        }
   }
};
</script>