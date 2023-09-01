import { defineStore, acceptHMRUpdate} from 'pinia'

import { MyKyveSDK } from "~/signer_util/MyKyveSDK"
import { createProtobufRpcClient, ProtobufRpcClient, QueryClient} from "@cosmjs/stargate";

import { Tendermint37Client, HttpClient } from "@cosmjs/stargate/node_modules/@cosmjs/tendermint-rpc"
import { Proposal } from "@kyvejs/types/client/cosmos/gov/v1/gov"
import { KyveSDK } from '@kyvejs/sdk/dist/sdk';
import * as tx from "@kyvejs/types/client/cosmos/tx/v1beta1/service";
import { TxResponse, Attribute } from "@kyvejs/types/client/cosmos/base/abci/v1beta1/abci";

import cosmosConfig from '~/chain.config'
export const useGovStore = defineStore('govtore', {
    // arrow function recommended for full type inference
    state: () => ({
      validatorAddress: '',
      votingPeriodProps: new Map<string, Proposal>(),
      endedProps: new Map<string, Proposal>(),
      userVotes: new Map<string, String>(),
      valoperVotes: new Map<string, String>(),
      rpcClient: {} as ProtobufRpcClient,
      queryTx: {} as tx.ServiceClientImpl,
    }),
    getters: {
        votingPeriodCount(): number {
          if(this.votingPeriodProps != undefined){
            return this.votingPeriodProps.values.length
          }else{
            return 0
          }
        },
        getVotingProps(): Proposal[] {
          return Array.from(this.votingPeriodProps.values()).slice().sort((a, b) => parseInt(a.id) - parseInt(b.id));
        },
        getEndedProps(): Proposal[] {
          return Array.from(this.endedProps.values()).slice().sort((a, b) => parseInt(b.id) - parseInt(a.id));//parseInt(b.id) - parseInt(a.id));
        },
        valoperVote: (state) => (id:string) => {
          console.log("Validator vote for prop ", id, " is ", state.userVotes.get(id))
          if(state.valoperVotes.has(id)) {
            return state.valoperVotes.get(id)
          }
          else { return 'VOTE_OPTION_NO_VOTE' }
        },
        userVote: (state) => (id:string) => {
          console.log("User vote for prop ", id, " is ", state.userVotes.get(id))
          if(state.userVotes.has(id)) {return state.userVotes.get(id)}
          else { return 'VOTE_OPTION_NO_VOTE' }
        },
        getTitle: (state) => (message):string => {
          let message_type = ''
          try {
            if (message['@type'] == "/cosmos.gov.v1.MsgExecLegacyContent") {
              message_type = message.content['@type']
            } else {
              message_type = message['@type']
            }
            switch (message_type) {
              case '/cosmos.params.v1beta1.ParameterChangeProposal':
                return String(message.content['title']).replace('\n\n', '\n')
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
              case '/kyve.pool.v1beta1.MsgUpdateParams':
                return "Update Pools Parameter"
                break;
              default:
                return ""
                break;
            }
          } catch(error) {
            console.log(error)
            return ""
          }
        },
        getDescription: (state) => (message):string => {
          function format_payload(payload:string):string {
            const o = JSON.parse(payload);
            const parameterStrings = Object.entries(o).map(([key, value]) => {
              const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              if(isNaN(value)) {
                return ` - ${formattedKey} = ${value}`;
              } else {
                return ` - ${formattedKey} = ${Number(value).toLocaleString()}`;
              }
            });
            const resultString = `Update parameters:\n${parameterStrings.join('\n')}`;
            return resultString
          }

          let message_type = ''
          try {
            if (message['@type'] == "/cosmos.gov.v1.MsgExecLegacyContent") {
              message_type = message.content['@type']
            } else {
              message_type = message['@type']
            }
            switch (message_type) {
              case '/cosmos.params.v1beta1.ParameterChangeProposal':
                return message.content['description']
                break;
              case '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal':
                return message.content['description']
                break;
              case '/cosmos.gov.v1beta1.TextProposal':
                return message.content['description']
                break;
              case '/kyve.pool.v1beta1.MsgCreatePool':
                const formattedString = `create pool ${message.name}\n` +
                                        `  - config: "${message.config}",\n` +
                                        `  - start_key: ${message.start_key},\n` +
                                        `  - upload_interval: ${message.upload_interval} seconds,\n` +
                                        `  - operating_cost: ${Number(message.operating_cost / 10**6).toLocaleString()} kyve,\n` +
                                        `  - min_delegation: ${Number(message.min_delegation / 10**6).toLocaleString()} kyve,\n` +
                                        `  - max_bundle_size: ${message.max_bundle_size} blocks,`;
                return formattedString
                break;
              case '/kyve.global.v1beta1.MsgUpdateParams':
              case '/kyve.delegation.v1beta1.MsgUpdateParams':
              case '/kyve.bundles.v1beta1.MsgUpdateParams':
              case '/kyve.stakers.v1beta1.MsgUpdateParams':
              case '/kyve.pool.v1beta1.MsgUpdatePool':
              case '/kyve.pool.v1beta1.MsgUpdateParams':
                return format_payload(message['payload'])
                break;
              default:
                return ""
                break;
            }
          } catch(error) {
            console.log(error)
            return ""
          }
        },
        getVote: (state) => (tx:TxResponse) => {
          function extractVoteOption(obj: Attribute): string {
            if (obj.key === "option") {
              const match = obj.value.match(/option:(VOTE_OPTION_\w+)/);
              if (match && match[1]) {
                return match[1];
              }
            }
            return 'VOTE_OPTION_NO_VOTE';
          }
          if (tx) {
            const evtPropVote = tx.logs[0].events.find(
               evt => evt.type === "proposal_vote"
             );
            const voteOption = evtPropVote?.attributes.find(
              attribute => attribute.key === "option"
            )
            const propId = evtPropVote?.attributes.find(
              attribute => attribute.key === "proposal_id"
            )
            var vote = "VOTE_OPTION_NO_VOTE"
            if(voteOption) {
              vote = extractVoteOption(voteOption)
            }
            var id = ''
            if (propId) {
              id = propId.value
            }
            console.log("proposal ", propId?.value, vote)
            return {id, vote} ;
          } else {
            return ; // proposal not found
          }
       }
    },
    actions: {
        async updateProposals() {
        },
        async fetchVotes(address:string) {
          const sdk = new KyveSDK('kyve-1')
          // const sdk = new MyKyveSDK('kyve-1', {
          //   rpc: 'https://rpc-kyve.ecostake.com/',
          //   rest: cosmosConfig[0].apiURL,
          //   coinDenom: cosmosConfig[0].coinLookup.chainDenom,
          //   coinDecimals: cosmosConfig[0].coinLookup.denomExponent,
          //   gasPrice: 0.02,
          // })
          let tmclient;
          if(!this.rpcClient?.request) {
            tmclient = await Tendermint37Client.connect(sdk.config.rpc) 
            const queryClient = new QueryClient(tmclient);
            this.rpcClient = createProtobufRpcClient(queryClient);
            this.queryTx = new tx.ServiceClientImpl(this.rpcClient);
          }
          const query = tx.GetTxsEventRequest.fromPartial({events: [
            'message.sender=\''+address+'\'',
            //'message.action=\'/cosmos.gov.v1beta1.MsgVote\''
            'message.module=\'governance\''
          ], order_by: 1})
          const queryResult = await this.queryTx.GetTxsEvent(query)
          tmclient?.disconnect()
          return queryResult
        }
    }
})
