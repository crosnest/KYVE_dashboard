import { defineStore, acceptHMRUpdate } from "pinia";

import { ProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";

import KyveSDK from "@kyvejs/sdk";
import { KyveLCDClientType } from "@kyvejs/sdk/dist/clients/lcd-client/client";
import * as pool from "@kyvejs/types/lcd/kyve/pool/v1beta1/pool";
import * as pools from "@kyvejs/types/lcd/kyve/query/v1beta1/pools";
// export factory function
export function createPoolStore(storeId: string, pool: staker_pool_t) {
  console.log("createPoolStore: ", storeId);

  return defineStore(`poolstore-${pool.id}`, {
    // arrow function recommended for full type inference
    state: () => ({
      pool: pool,
      pool_details: {} as pools.PoolResponse,
      sdk: new KyveSDK(import.meta.env["VITE_CHAIN_ID"]),
      rpcClient: {} as ProtobufRpcClient,
      lcdClient: {} as KyveLCDClientType,
    }),
    getters: {
      getPoolLogo(): string {
        console.log("get Pool Logo:", this.pool);

        const transactionId = this.pool?.logo?.split("ar://")[1];
        const arweaveImageUrl = `https://arweave.net/${transactionId}`;
        return arweaveImageUrl;
      },
      validatorcount(): number {
        if (this.pool_details.stakers) {
          return this.pool_details.stakers.length;
        } else {
          return 0;
        }
      },
      total_bundles(): number {
        if (this.pool_details?.data?.total_bundles) {
          return Number(this.pool_details.data.total_bundles);
        } else {
          return 0;
        }
      },
      // pool_APY(): number {
      //   // Check if the pool status is either "POOL_STATUS_ACTIVE" or "POOL_STATUS_NO_FUNDS"
      //   if ("POOL_STATUS_ACTIVE" !== this.pool.status && "POOL_STATUS_NO_FUNDS" !== this.pool.status)
      //     return 0;

      //   // Check if the pool's total delegation is zero
      //   if (Number(this.pool.total_delegation) == 0)
      //     return 0;

      //   // Define a constant secPerYear with the value 31536e3 (seconds in a year)
      //   const secPerYear = 31536e3;

      //   // Calculate the number of bundles per year based on upload_interval
      //   const bundlesPerYear = secPerYear / Number(this.pool.upload_interval)

      //   // Calculate the staker's share of the total delegation
      //   const stakerShare = Number(staker.total_delegation) / Number(this.pool.total_delegation);

      //   // Get the operating cost of the pool
      //   const operatingCost = Number(this.pool.operating_cost);

      // }
    },
    actions: {
      async getProgress() {
        const pool_status = await this.fetchPoolInfo(this.pool?.id);
        const current_index = await this.fetchPoolLastBlock(
          pool_status?.data?.config
        );
        return Math.min(
          Number(
            Number(pool_status?.data?.current_key) / Number(current_index)
          ),
          1
        );
      },
      async fetchPoolInfo(pool_id: string) {
        if (!this.lcdClient?.kyve) {
          this.lcdClient = this.sdk.createLCDClient();
        }
        const result = await this.lcdClient.kyve.query.v1beta1.pool({
          id: pool_id,
        });
        this.pool_details = pools.PoolResponse.fromJSON(result.pool);
        return result.pool;
      },
      async fetchPoolLastBlock(config: string) {
        const config_obj = JSON.parse(config);
        let rpc = null;
        switch (config_obj?.network) {
          case "cosmoshub-4":
            rpc = "https://rpc.cros-nest.com/cosmoshub";
            break;
          case "osmosis-1":
            rpc = "https://rpc.cros-nest.com/osmosis";
            break;
          case "archway-1":
            rpc = "https://rpc.cros-nest.com/archway";
            break;
          case "axelar-dojo-1":
            rpc = "https://rpc.cros-nest.com/axelar";
            break;
          default:
            break;
        }
        if (rpc) {
          const tmclient = await Tendermint37Client.connect(rpc);
          const resp = await tmclient.block();
          return resp.block.header.height;
        } else {
          return Infinity;
        }
      },
    },
  })();
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
