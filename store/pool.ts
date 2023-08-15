import { defineStore, acceptHMRUpdate} from 'pinia'

import { createProtobufRpcClient, ProtobufRpcClient, QueryClient} from "@cosmjs/stargate";
import { Tendermint37Client, HttpClient } from "@cosmjs/stargate/node_modules/@cosmjs/tendermint-rpc"

import KyveSDK from '@kyvejs/sdk';
import { KyveLCDClientType } from "@kyvejs/sdk/dist/clients/lcd-client/client"
import * as pool from "@kyvejs/types/lcd/kyve/pool/v1beta1/pool"

// export factory function 
export function createPoolStore(storeId: string, pool: staker_pool_t) {
  console.log("createPoolStore: ", storeId);
  
  return defineStore(`poolstore-${pool.id}`, {
  // arrow function recommended for full type inference
  state: () => ({
    pool: pool,
    sdk: new KyveSDK('kyve-1'),
    rpcClient: {} as ProtobufRpcClient,
    lcdClient: {} as KyveLCDClientType,
  }),
  getters: {
    getPoolLogo():string {
      console.log("get Pool Logo:" , this.pool);
      
      const transactionId = this.pool?.logo?.split("ar://")[1];
      const arweaveImageUrl = `https://arweave.net/${transactionId}`;
      return arweaveImageUrl
    },
  },
  actions: {
    async getProgress() {
        const pool_status = await this.fetchPoolInfo(this.pool?.id)
        console.log('pool_key', pool_status?.data?.current_key)
        const current_index = await this.fetchPoolLastBlock(pool_status?.data?.config)
        console.log('pool_key', pool_status?.data?.current_key)
        console.log('current_index', current_index)
        return Number(Number(pool_status?.data?.current_key) / Number(current_index))
    },
    async fetchPoolInfo(pool_id:string) {
      if(!this.lcdClient?.kyve) {
        this.lcdClient = this.sdk.createLCDClient()
      }
      const queryResult = await this.lcdClient.kyve.query.v1beta1.pool({id: pool_id})
      return queryResult.pool
    },
    async fetchPoolLastBlock(config:string) {
      const config_obj = JSON.parse(config)
      let rpc = null
      switch (config_obj?.network) {
        case 'cosmoshub-4':
          rpc = 'https://rpc.cros-nest.com/cosmoshub'
          break;
        case 'osmosis-1':
          rpc = 'https://rpc.cros-nest.com/osmosis'
          break;
        default:
          break;
      }
      if(rpc) {
        const tmclient = await Tendermint37Client.connect(rpc)
        const resp = await tmclient.block()
        return resp.block.header.height
      } else {
      return Infinity
      }
    }
  }
})()
}

interface staker_pool_t {
    id?: string | undefined;
    name?: string | undefined;
    runtime?: string | undefined;
    logo?: string | undefined;
    operating_cost?: string | undefined;
    upload_interval?: string | undefined;
    total_funds?: string | undefined;
    total_delegation?: string | undefined;
    status?: pool.PoolStatus | undefined;
}