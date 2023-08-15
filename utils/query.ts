import { createProtobufRpcClient, ProtobufRpcClient, QueryClient} from "@cosmjs/stargate";

import { Tendermint37Client, HttpClient } from "@cosmjs/stargate/node_modules/@cosmjs/tendermint-rpc"
import { Proposal } from "@kyvejs/types/client/cosmos/gov/v1/gov"
import { KyveSDK } from '@kyvejs/sdk/dist/sdk';
import * as tx from "@kyvejs/types/client/cosmos/tx/v1beta1/service";
import * as bank from "@kyvejs/types/client/cosmos/bank/v1beta1/bank";
import { TxResponse, Attribute } from "@kyvejs/types/client/cosmos/base/abci/v1beta1/abci";
import { KyveClient, KyveWebClient } from "@kyvejs/sdk";
import * as pool from '@kyvejs/types/client/kyve/pool/v1beta1/query'

export class QueryUtils {

    public static async getInstance() {
        if (!QueryUtils.instance) {
            QueryUtils.instance = new QueryUtils();
            await QueryUtils.instance.init();
        }
        return QueryUtils.instance;
        }
    /**
     * getBalance
walletAddress:string|null     */
    public getBalance(walletAddress:string|undefined) {
        let address = walletAddress
        if (!walletAddress) {
            address = this.walletClient?.account.address
        }
    }

    
    private static instance: QueryUtils | null;
    
    private rpcClient: ProtobufRpcClient | null;
    private walletClient: KyveClient | KyveWebClient | null
    private queryTx: tx.ServiceClientImpl | null;
    private sdk: KyveSDK

    private constructor() {
        this.rpcClient = null;
        this.queryTx = null;
        this.walletClient = null
        this.sdk = new KyveSDK('kyve-1')
        // const sdk = new MyKyveSDK('kyve-1', {
        //   rpc: 'https://rpc-kyve.ecostake.com/',
        //   rest: cosmosConfig[0].apiURL,
        //   coinDenom: cosmosConfig[0].coinLookup.chainDenom,
        //   coinDecimals: cosmosConfig[0].coinLookup.denomExponent,
        //   gasPrice: 0.02,
        // })
    }

    private async init() {
        const tmclient = await Tendermint37Client.connect(this.sdk.config.rpc) 
        const queryClient = new QueryClient(tmclient);
        this.rpcClient = createProtobufRpcClient(queryClient);
        this.queryTx = new tx.ServiceClientImpl(this.rpcClient);
    }
}