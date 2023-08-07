
import { StargateClient, StargateClientOptions, accountFromAny } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";

export default defineEventHandler(async(event) => {
    console.log(event.context.params.address)
    const account = event.context.params.address
    const tmc = await Tendermint37Client.connect('https://rpc.cros-nest.com/kyve')
    const client = await StargateClient.create(tmc)
    
    const balance = await client.getBalance(account, "ukyve")
    return balance
  })