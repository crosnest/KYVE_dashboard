
import { StargateClient, StargateClientOptions, accountFromAny } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";

export default defineEventHandler(async(event) => {
    "https://api-eu-1.kyve.network/kyve/query/v1beta1/staker/kyve199403h5jgfr64r9ewv83zx7q4xphhc4wyv8mhp"
    const account = event.context.params.address
    const tmc = await Tendermint37Client.connect('https://rpc.cros-nest.com/kyve')
    const client = await StargateClient.create(tmc)
    
    const balance = await client.getBalance(account, "ukyve")
    return balance
  })