import { defineStore, acceptHMRUpdate} from 'pinia'

import { MyKyveSDK } from "~/signer_util/MyKyveSDK"
import { KyveWebClient } from "@kyvejs/sdk"
import { Proposal } from "@kyvejs/types/client/cosmos/gov/v1/gov"
import { MsgExecLegacyContent } from "@kyvejs/types/client/cosmos/gov/v1/tx"
export const useGovStore = defineStore('govtore', {
    // arrow function recommended for full type inference
    state: () => ({
      validatorAddress: '',
      votingPeriodProps: [] as Proposal[],
      endedProps: [] as Proposal[],
      userVotes: [],
      valoperVotes: [],
    }),
    getters: {
        votingPeriodCount(): number {
          if(this.votingPeriodProps != undefined){
            return this.votingPeriodProps.length
          }else{
            return 0
          }
        },
        getVotingProps(): proposal[] {
          if (this.votingPeriodProps === undefined) {return [];}
          
          const sorted = this.votingPeriodProps.slice().sort(function(a, b) { 
            return parseInt(b.id) - parseInt(a.id);
          });
          return sorted
        },
        getEndedProps():Proposal[] {
          return this.endedProps.slice().sort(function(a, b) { 
            return parseInt(a.id) - parseInt(b.id);
          });
        },
    },
    actions: {
        async updateProposals() {
        },
        getTitle(message):string {
          let message_type = ''
          try {
            if (message['@type'] == "/cosmos.gov.v1.MsgExecLegacyContent") {
              message_type = message.content['@type']
            } else {
              message_type = message['@type']
            }
            switch (message_type) {
              case '/cosmos.params.v1beta1.ParameterChangeProposal':
                return message.content['title']
                break;
              case '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal':
                return message.content['title']
                break;
              case '/cosmos.gov.v1beta1.TextProposal':
                return message.content['title']
                break;
              case '/kyve.global.v1beta1.MsgUpdateParams':
                return "Update global parameter"
                break;
              case '/kyve.delegation.v1beta1.MsgUpdateParams':
                return "Update delegation parameter"
                break;
              case '/kyve.bundles.v1beta1.MsgUpdateParams':
                return "Update bundle parameter"
                break;
              case '/kyve.stakers.v1beta1.MsgUpdateParams':
                return "Update stakers parameter"
                break;
              case '/kyve.pool.v1beta1.MsgCreatePool':
                return "Create Pool " + message['name']
                break;
              case '/kyve.pool.v1beta1.MsgUpdatePool':
                return "Update Pool " + message['id']
                break;
              default:
                break;
            }
          } catch(error) {
            console.log(error)
          }
        },
        getValoperVote(proposalId) {
          const tx = this.valoperVotes.find(tx => {
          const msgVote = tx.body.messages.find(
              msg => msg["@type"] === "/cosmos.gov.v1beta1.MsgVote"
            );
            return msgVote && msgVote.proposal_id === proposalId;
          });
 
          if (tx) {
          const msgVote = tx.body.messages.find(
             msg => msg["@type"] === "/cosmos.gov.v1beta1.MsgVote"
          );
          console.log(msgVote.option)
          return msgVote.option;
          } else {
            return "VOTE_OPTION_NO_VOTE"; // Proposal not found
          }
       },
       getUserVote(proposalId) {
          const tx = this.userVotes.find(tx => {
          const msgVote = tx.body.messages.find(
             msg => msg["@type"] === "/cosmos.gov.v1beta1.MsgVote"
          );
          return msgVote && msgVote.proposal_id === proposalId;
          });
 
          if (tx) {
          const msgVote = tx.body.messages.find(
             msg => msg["@type"] === "/cosmos.gov.v1beta1.MsgVote"
          );
          console.log(msgVote.option)
          return msgVote.option;
          } else {
            return "VOTE_OPTION_NO_VOTE"; // Proposal not found
          }
       },
    }
})
