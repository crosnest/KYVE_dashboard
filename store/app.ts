import { defineStore, acceptHMRUpdate} from 'pinia'

import { calculateFee, GasPrice } from "@kyvejs/sdk/node_modules/@cosmjs/stargate";
import { MyKyveSDK } from "~/signer_util/MyKyveSDK"
import { KyveWebClient } from "@kyvejs/sdk"

// import {} from "@kyvejs/types/client/kyve/stakers/v1beta1/tx"
import { QueryStakerRequest, QueryStakerResponse } from "@kyvejs/types/lcd/kyve/query/v1beta1/stakers"
import { MsgDelegate, MsgUndelegate, MsgWithdrawRewards } from "@kyvejs/types/client/kyve/delegation/v1beta1/tx"
import { MsgClaimCommissionRewards } from "@kyvejs/types/client/kyve/stakers/v1beta1/tx"
import { MsgGrant, MsgRevoke } from "@kyvejs/types/client/cosmos/authz/v1beta1/tx"
import { GenericAuthorization } from "@kyvejs/types/client/cosmos/authz/v1beta1/authz"
import { MsgVote } from "@kyvejs/types/client/cosmos/gov/v1/tx"
import { VoteOption } from "@kyvejs/types/client/cosmos/gov/v1/gov"

import cosmosConfig from '~/chain.config'

export const useAppStore = defineStore('appStore', {
    // arrow function recommended for full type inference
    state: () => ({
        validatorAddress : '',
        operatorAddress: '',
        stakerAddress : '',
        restakeBotAddress: '',
        chainId: '' as "kyve-1" | "kaon-1" | "korellia" | "kyve-beta" | "kyve-alpha" | "kyve-local" | undefined,
        sdk: {} as MyKyveSDK,
        client: {} as KyveWebClient,
        logged: false,
        IsUnavailable: false,
        isMobile: false,
        chainSelected: 0,
        signer: null,
        walletAddress: '',
        walletName: '',
        balance: 0,
        price: 0,
        staker: {} as staker_t,
        delegatorInfo: {} as delegator_info_t,

        notif_event: false,
        notifText: ''

    }),
    getters: {
        islogged(): boolean {
            return this.logged;
        },
        staker_metadata(): staker_metadata_t {
            return this.staker?.metadata
        },
        staker_moniker(): string {
            if (this.staker?.metadata?.moniker === undefined) {
                return ""
            } else {
                return this.staker.metadata.moniker
            }
        },
        staker_details(): string {
            if (this.staker?.metadata?.details === undefined) {
                return ""
            } else {
                return this.staker.metadata.details
            }
        },
        staker_commission(): string {
            if (this.staker?.metadata?.commission === undefined) return ''
            return Number(Number(this.staker.metadata.commission)*100).toLocaleString()
        },
        staker_commission_rewards(): string {
          if (this.staker?.metadata?.commission_rewards === undefined) return ''
          return Number(Number(this.staker.metadata.commission_rewards)/10**this.sdk.config.coinDecimals).toLocaleString()
        },
        staker_total_deleg(): string {
            if (this.staker?.total_delegation === undefined) return ''
            return Number(Number(this.staker.total_delegation)/10**this.sdk.config.coinDecimals).toLocaleString()
        },
        dollar_total_deleg():string {
          if (this.staker?.total_delegation === undefined) return '0'
          const price_value = this.price * Number(Number(this.staker.total_delegation)/10**this.sdk.config.coinDecimals)
          return price_value.toLocaleString()
        },
        staker_self_deleg():string {
            if (this.staker?.self_delegation === undefined) return ''
            return Number(Number(this.staker.self_delegation)/10**this.sdk.config.coinDecimals).toLocaleString()
        },
        staker_deleg_apy():string {
            return '???'
        },
        staker_my_deleg():string {
          if (this.delegatorInfo?.delegation_amount === undefined) return '0'
          return Number(Number(this.delegatorInfo.delegation_amount)/10**this.sdk.config.coinDecimals).toLocaleString()
        },
        dollar_my_deleg():string {
          if (this.delegatorInfo?.delegation_amount === undefined) return '0'
          const price_value = this.price * Number(Number(this.delegatorInfo?.delegation_amount)/10**this.sdk.config.coinDecimals)
          return price_value.toLocaleString()
        },
        staker_my_rewards():string {
          if (this.delegatorInfo?.current_reward === undefined) return '0'
          return Number(Number(this.delegatorInfo.current_reward)/10**this.sdk.config.coinDecimals).toLocaleString()
        },
        dollar_my_rewards():string {
          if (this.delegatorInfo?.current_reward === undefined) return '0'
          const price_value = this.price * Number(Number(this.delegatorInfo?.current_reward)/10**this.sdk.config.coinDecimals) 
          return price_value.toLocaleString()
        },
        menu_items():any {
            const items = [{
                icon: 'mdi-view-dashboard',
                title: 'Dashboard',
                to: '/dashboard'
              },{
                icon: 'mdi-inbox-arrow-down',
                title: 'Governance',
                to: '/governance'
              }]
              return items
        }
    },
    actions: {
        async updateWallet() {
          this.client = await this.sdk.fromKeplr();
          this.walletAddress = this.client.account.address
          this.walletName = this.client.getWalletName()
        },
        async disconnect() {
          this.logged = false
          this.walletAddress = ''
          this.walletName = ''
        },
        async init_store() {
          const index = cosmosConfig.findIndex((chain) => chain.chainId === this.chainId);
          this.chainSelected = index
          this.sdk = new MyKyveSDK(this.chainId, {
              rpc: cosmosConfig[index].rpcURL,
              rest: cosmosConfig[index].apiURL,
              coinDenom: cosmosConfig[index].coinLookup.chainDenom,
              coinDecimals: cosmosConfig[index].coinLookup.denomExponent,
              gasPrice: 0.02,
            })
        },
        async keplrConnect() {
          this.client = await this.sdk.fromKeplr();
          this.walletAddress = this.client.account.address
          this.walletName = this.client.getWalletName()
          this.logged = true
        },
        getExplorerLink(TxHash:string):string {
          return new URL(TxHash, cosmosConfig[this.chainSelected].explorerUrl).href 
        },
        async delegate(amount:number, memo:string) {
            const ukyveAmount = amount * 10**this.sdk.config.coinDecimals
            let delegateReturnMsg = ''

            const delegate = {
                typeUrl: "/kyve.delegation.v1beta1.MsgDelegate",
                value: MsgDelegate.fromPartial({
                    creator: this.walletAddress,
                    staker: this.stakerAddress,
                    amount: ukyveAmount.toString(),
                  }),
              }
            
            const fee = {
                amount: [
                  {
                    denom: "ukyve",
                    amount: "5000",
                  },
                ],
                gas: "200000",
              };
            const gasEstimation = await this.client.nativeClient.simulate(
                this.walletAddress,
                [delegate],
                memo
            );
            const usedFee = calculateFee(
                Math.round(gasEstimation * 1.4),
                GasPrice.fromString( 0.025 + this.sdk.config.coinDenom )
            );
            try {
                const result = await this.client.nativeClient.signAndBroadcast(this.walletAddress, [delegate], fee, memo)  
                if(result.code !== 0) {
                    console.log(result.rawLog)
                }
                console.log("Delegate Result", result)
                return result.transactionHash
            } catch (error) {
                  console.error(error)
            }
        },
        async restake(time:Date, action:string) {
            console.log("KeplrStore Restake for ", time, "with action ", action)
            let delegateReturnMsg = ''

            const usedFee = {
                amount: [
                  {
                    denom: "ukyve",
                    amount: "500",
                  },
                ],
                gas: "200000",
              };
            console.log("client = ", this.client)
            if(action === "Grant") {
                let grantMsg = buildGrantMsg("/cosmos.authz.v1beta1.GenericAuthorization",
                GenericAuthorization.encode(GenericAuthorization.fromPartial({
                  msg: '/kyve.delegation.v1beta1.MsgDelegate'
                })).finish(),
                time
                )
                try {
                    console.log(this.walletAddress)
                    console.log(grantMsg)
                    console.log(usedFee)
                    const result = await this.client.nativeClient.signAndBroadcast(this.walletAddress, [grantMsg], usedFee, '')
                    if(result.code !== 0) {
                        console.log(result.rawLog)
                    }
        
                    return result.transactionHash
                } catch (error) {
                console.error(error)
                }
            } else if(action === "Revoke") {
                let revokeMsg = {
                    typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
                    value: MsgRevoke.fromPartial({
                        granter: this.walletAddress,
                        grantee: this.restakeBotAddress,
                        msg_type_url: '/kyve.delegation.v1beta1.MsgDelegate'
                    })
                }
                try {
                    console.log(this.walletAddress)
                    console.log(revokeMsg)
                    console.log(usedFee)
                    const result = await this.client.nativeClient.signAndBroadcast(this.walletAddress, [revokeMsg], usedFee, '')
                    if(result.code !== 0) {
                        console.log(result.rawLog)
                    }
        
                    return result.transactionHash
                } catch (error) {
                  console.error(error)
                }
            }
            
            // const gasEstimation = await this.client.nativeClient.simulate(
            //     this.walletAddress,
            //     [authzMsg],
            //     ''
            // );
            // const usedFee = calculateFee(
            //     Math.round(gasEstimation * 1.4),
            //     GasPrice.fromString(
            //         0.025 +
            //         cosmosConfig[this.chainSelected].coinLookup.chainDenom
            //     )
            // );
            
        },
        async undelegate(amount:number, memo:string) {
            console.log("KeplrStore Undelegate ", amount)
            const ukyveAmount = amount * 10**this.sdk.config.coinDecimals
            let undelegateReturnMsg = ''
            
            const delegate = {
                typeUrl: "/kyve.delegation.v1beta1.MsgUndelegate",
                value: MsgUndelegate.fromPartial({
                    creator: this.walletAddress,
                    staker: this.stakerAddress,
                    amount: ukyveAmount.toString(),
                  }),
              }
            console.log(delegate)
            
            const fee = {
                amount: [
                  {
                    denom: "ukyve",
                    amount: "5000",
                  },
                ],
                gas: "200000",
              };
            const gasEstimation = await this.client.nativeClient.simulate(
                this.walletAddress,
                [delegate],
                memo
            );
            const usedFee = calculateFee(
                Math.round(gasEstimation * 1.4),
                GasPrice.fromString( 0.025 + this.sdk.config.coinDenom )
            );
            try {
                const result = await this.client.nativeClient.signAndBroadcast(this.walletAddress, [delegate], fee, memo)  
                if(result.code !== 0) {
                    console.log(result.rawLog)
                }
    
                return result.transactionHash
            } catch (error) {
              console.error(error)
            }
        },
        async claim_rewards(commissions:boolean) {
          console.log("KeplrStore claim Commissions")

          let Txs = []
          let RewardsReturnMsg = ''

          if (commissions) {
            const lcdClient = await this.sdk.createLCDClient()
            const staker_resp = await lcdClient.kyve.query.v1beta1.staker(QueryStakerRequest.fromPartial({address: this.stakerAddress}))
            const ukyveCommissions = staker_resp.staker?.metadata?.commission_rewards
            const withdrawCommissions = {
                typeUrl: "/kyve.stakers.v1beta1.MsgClaimCommissionRewards",
                value: MsgClaimCommissionRewards.fromPartial({
                    creator: this.walletAddress,
                    amount: ukyveCommissions,
                  }),
              }
            console.log(withdrawCommissions)
            Txs.push(withdrawCommissions)
          }
          const withdrawRewards = {
            typeUrl: "/kyve.delegation.v1beta1.MsgWithdrawRewards",
            value: MsgWithdrawRewards.fromPartial({
                creator: this.walletAddress,
                staker: this.stakerAddress
              }),
          }
          Txs.push(withdrawRewards)
          
          const gasEstimation = await this.client.nativeClient.simulate(
              this.walletAddress,
              Txs,
              ''
          );
          const usedFee = calculateFee(
              Math.round(gasEstimation * 1.4),
              GasPrice.fromString( this.sdk.config.gasPrice + this.sdk.config.coinDenom )
          );
          try {
              const result = await this.client.nativeClient.signAndBroadcast(this.walletAddress, Txs, usedFee, '')  
              if(result.code !== 0) {
                  console.log(result.rawLog)
              }
  
              return result.transactionHash
          } catch (error) {
            console.error(error)
          }
        },
        async gov_vote (propnum:string, voteOption:string) {
          let finalVote:VoteOption
          switch (voteOption) {
            case '1':
              finalVote = VoteOption.VOTE_OPTION_YES
              break
            case '2':
              finalVote = VoteOption.VOTE_OPTION_ABSTAIN
              break
            case '3':
              finalVote = VoteOption.VOTE_OPTION_NO
              break
            case '4':
              finalVote = VoteOption.VOTE_OPTION_NO_WITH_VETO
              break
            default:
              finalVote = VoteOption.VOTE_OPTION_UNSPECIFIED
          }
          const voteSend = {
            typeUrl: "/cosmos.gov.v1.MsgVote",
            value: MsgVote.fromPartial({
                proposal_id: propnum,
                voter: this.walletAddress,
                option: finalVote,
            }),
          }

          const gasEstimation = await this.client.nativeClient.simulate(
            this.walletAddress,
            [voteSend],
            ''
          );
          const usedFee = calculateFee(
              Math.round(gasEstimation * 1.4),
              GasPrice.fromString( this.sdk.config.gasPrice + this.sdk.config.coinDenom )
          );
          try {
              const result = await this.client.nativeClient.signAndBroadcast(this.walletAddress, [voteSend], usedFee, '')  
              if(result.code !== 0) {
                  console.log(result.rawLog)
              }

              return result.transactionHash
          } catch (error) {
            console.error(error)
          }
        },
    }
})

function    buildGrantMsg(type, authValue, expiryDate) {
    const appStore = useAppStore()
    const value = {
      granter: appStore.walletAddress,
      grantee: appStore.restakeBotAddress,
      grant: {
        authorization: {
          typeUrl: type,
          value: authValue
        },
        expiration: expiryDate
      }
    }
    return {
      typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
      value: value
    }
  }

export interface delegator_info_t {
    delegator: string,
    current_reward: string,
    delegation_amount: string,
    staker: string
}

export interface staker_metadata_t {
        commission: string,
        moniker: string,
        website: string,
        identity: string,
        security_contact: string,
        details: string,
        pending_commission_change: string|null,
        commission_rewards: string
}

export interface staker_pools_t {
    pool: {
      id: string,
      name:string,
      runtime: string,
      logo: string,
      operating_cost: string,
      upload_interval: string,
      total_funds: string,
      total_delegation: string,
      status: string
    },
    points:  string,
    is_leaving: string,
    valaddress: string, 
    balance:  string
  }


export interface staker_t {
    address: string,
    metadata: staker_metadata_t,
    self_delegation: string,
    self_delegation_unbonding: string,
    total_delegation: string,
    delegator_count: string,
    pools: staker_pools_t[],
}

export interface notification_t {
  message: string,
  top: boolean,
  bottom: boolean,
  left: boolean,
  right: boolean,
  color: string,
  transition: string,
  timeout: number,
}