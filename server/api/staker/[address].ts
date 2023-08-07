
import { useAppStore } from "~/store/app";

export default defineEventHandler(async(event) => {
    "https://api-eu-1.kyve.network/kyve/query/v1beta1/staker/kyve199403h5jgfr64r9ewv83zx7q4xphhc4wyv8mhp"
    const address = event.context.params.address
    // const appStore = useAppStore()
    // const client = appStore.sdk.generate()
    // const stakerResponse = await appStore.sdk.createLCDClient().kyve.query.v1beta1.staker(address)
    // console.log("staker response = ", stakerResponse)
    // return stakerResponse
  })