import { defineStore, acceptHMRUpdate} from 'pinia'

import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { MyKyveSDK } from "~/signer_util/MyKyveSDK"
import { KyveWebClient } from "@kyvejs/sdk"

// import {} from "@kyvejs/types/client/kyve/stakers/v1beta1/tx"
import { MsgDelegate, MsgUndelegate } from "@kyvejs/types/client/kyve/delegation/v1beta1/tx"
import { MsgGrant, MsgRevoke } from "@kyvejs/types/client/cosmos/authz/v1beta1/tx"
import { GenericAuthorization } from "@kyvejs/types/client/cosmos/authz/v1beta1/authz"

import cosmosConfig from '~/chain.config'

export const useAppStore = defineStore('appStore', {
    // arrow function recommended for full type inference
    state: () => ({
        drawer: true,
        rail: false,
        stakerAddress : '', //'kyve199403h5jgfr64r9ewv83zx7q4xphhc4wyv8mhp',
        chainId: '',
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
        staker: {} as staker_t,
        delegatorInfo: {} as delegator_info_t
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
        staker_total_deleg(): string {
            if (this.staker?.total_delegation === undefined) return ''
            return Number(Number(this.staker.total_delegation)/10**cosmosConfig[this.chainSelected].coinLookup.denomExponent).toLocaleString()
        },
        staker_self_deleg():string {
            if (this.staker?.self_delegation === undefined) return ''
            return Number(Number(this.staker.self_delegation)/10**cosmosConfig[this.chainSelected].coinLookup.denomExponent).toLocaleString()
        },
        staker_deleg_apy():string {
            return '???'
        },
        staker_my_deleg():string {
          if (this.delegatorInfo?.delegation_amount === undefined) return '0'
          return Number(Number(this.delegatorInfo.delegation_amount)/10**cosmosConfig[this.chainSelected].coinLookup.denomExponent).toLocaleString()
        },
        staker_my_rewards():string {
          if (this.delegatorInfo?.current_reward === undefined) return '0'
          return Number(Number(this.delegatorInfo.current_reward)/10**cosmosConfig[this.chainSelected].coinLookup.denomExponent).toLocaleString()
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
        async disconnect() {

        },
        async keplrConnect() {
            this.sdk = new MyKyveSDK(this.chainId, {
                rpc: cosmosConfig[0].rpcURL,
                rest: cosmosConfig[0].apiURL,
                coinDenom: cosmosConfig[0].coinLookup.chainDenom,
                coinDecimals: cosmosConfig[0].coinLookup.denomExponent,
                gasPrice: 0.02,
              }),
            this.client = await this.sdk.fromKeplr();
            this.walletAddress = this.client.account.address
            this.walletName = this.client.getWalletName()
            this.logged = true
        },
        async delegate(amount:number, memo:string) {
            console.log("KeplrStore Delegate ", amount, "with memo ", memo)
            const ukyveAmount = amount * 10**cosmosConfig[this.chainSelected].coinLookup.denomExponent
            let delegateReturnMsg = ''

            console.log("client = ", this.client)
            
            const delegate = {
                typeUrl: "/kyve.delegation.v1beta1.MsgDelegate",
                value: MsgDelegate.fromPartial({
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
                GasPrice.fromString(
                    0.025 +
                    cosmosConfig[this.chainSelected].coinLookup.chainDenom
                )
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
                        grantee: "kyve16aaz698xcnrnpp4jaw90dht4tqumxnen357lws",
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
            console.log("KeplrStore Undelegate ", amount, "with memo ", memo)
            const ukyveAmount = amount * 10**cosmosConfig[this.chainSelected].coinLookup.denomExponent
            let undelegateReturnMsg = ''

            console.log("client = ", this.client)
            
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
                GasPrice.fromString(
                    0.025 +
                    cosmosConfig[this.chainSelected].coinLookup.chainDenom
                )
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
        }
    }
})

function buildExecMessage(grantee, messages) {
    return {
      typeUrl: "/cosmos.authz.v1beta1.MsgExec",
      value: {
        grantee: grantee,
        msgs: messages
      }
    }
  }

function    buildGrantMsg(type, authValue, expiryDate) {
    const appStore = useAppStore()
    const value = {
      granter: appStore.walletAddress,
      grantee: "kyve16aaz698xcnrnpp4jaw90dht4tqumxnen357lws",
      grant: {
        authorization: {
          typeUrl: type,
          value: authValue
        },
        expiration: expiryDate
      }
    }
    if (appStore.walletAddress !== appStore.walletAddress) {
      return buildExecMessage(appStore.walletAddress, [{
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: MsgGrant.encode(MsgGrant.fromPartial(value)).finish()
      }])
    } else {
      return {
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: value
      }
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