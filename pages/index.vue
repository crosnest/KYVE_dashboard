<template>
    <div>
        <v-container >
          <!-- 1st line of widgets -->
          <v-card style="padding: 1em">
            <v-col class="col-12 col-md-9 q-ml-lg-lg">
              <v-row class="row items-center">
                <v-avatar style="align-: center;" image="https://s3.amazonaws.com/keybase_processed_uploads/4e8a6ee78ed698828e6c2baec569d305_360_360.jpg" size="200"/>
                <v-col class="col-6 md-4">
                  <v-skeleton-loader
                    :loading="stakerPending"
                    type="list-item-two-line"
                    width="500px"
                  >
                    <p class="text-h4" >{{ appStore.staker_metadata?.moniker }}</p>
                    <p class="text-h6" >{{ appStore.staker_metadata?.details }} </p>
                  </v-skeleton-loader>
                  <v-divider 
                  style="margin-top: 1em;margin-bottom: 1em;"
                  :thickness="7"
                  />
                  <v-row>
                    <v-col class="col-2 items-center">
                      <dialogDelegate />
                    </v-col>
                    <v-col class="col-2 items-center">
                      <dialogEnableRestake />
                    </v-col>
                    <v-col class="col-2 items-center">
                      <dialogUndelegate />
                    </v-col>
                    <v-col class="col-2 items-center">
                      <dialogWithdrawRewards />
                    </v-col>
                    </v-row>
                </v-col>
                <v-col class="col-6">
                  <!-- <v-row>
                    <v-col class="col-6 row items-center">
                      <v-icon icon="mdi-account"></v-icon> <strong>Identity:</strong> {{appStore.staker_metadata?.identity}}
                    </v-col>
                  </v-row> -->
                  <v-row>
                    <v-col class="col-6 row items-center">
                      <v-icon icon="mdi-web"></v-icon> <strong>Website:</strong> <a :href="appStore.staker_metadata?.website" target="_blank" rel="noopener noreferrer" >{{appStore.staker_metadata?.website}}</a>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="col-6 row items-center">
                      <v-icon icon="mdi-phone"></v-icon> <strong>Security Contact:</strong> <a :href="mailtoLink">{{appStore.staker_metadata?.security_contact}}</a>
                    </v-col>
                  </v-row>
                  <v-row class="row">
                    <v-col class="col-6 row items-center">
                      <v-icon icon="mdi-circle-multiple-outline"/> <strong>Commission:</strong> {{appStore.staker_commission}} %
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="col-6 row items-center">
                      <v-icon icon="mdi-account"></v-icon> <strong>Self Delegation:</strong> {{appStore.staker_self_deleg}}
                    </v-col>
                  </v-row>
                  </v-col>
                  <v-divider 
                  style="margin-top: 1em;margin-bottom: 1em;"
                  />
                  <v-row>
                    <v-col class="col-6 col-sm-3 text-subtitle2">
                      <strong>Total delegation</strong>
                      <p>{{ appStore.staker_total_deleg }} $KYVE</p>
                      <p>{{ appStore.dollar_total_deleg }} $usd</p>
                    </v-col>
                    <!-- <v-col class="col-6 col-sm-3 text-subtitle2">
                      <strong>Self Delegation</strong>
                      <p>{{ appStore.staker_self_deleg }} $KYVE</p>
                    </v-col> -->
                    <v-col class="col-6 col-sm-3 text-subtitle2">
                      <strong>My Delegation</strong>
                      <p>{{ appStore.staker_my_deleg }} $KYVE</p>
                      <p>{{ appStore.dollar_my_deleg }} $usd</p>
                    </v-col>
                    <v-col class="col-6 col-sm-3 text-subtitle2">
                      <strong>My Rewards</strong>
                      <p>{{ appStore.staker_my_rewards }} $KYVE</p>
                      <p>{{ appStore.dollar_my_rewards }} $usd</p>
                    </v-col>
                    <v-col class="col-6 col-sm-3 text-subtitle2">
                      <strong>Delegation APY</strong>
                      <p>{{ appStore.staker_deleg_apy }} %</p>
                    </v-col>
                  </v-row>
              </v-row>
            </v-col>
          </v-card >
        </v-container>
    </div>

</template>

<script>
import { useAppStore } from '@/store/app'
import { server } from 'process'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

export default {
  name: 'DefaultLayout',
  components: {
    VSkeletonLoader
  },
  setup() {
    const appStore = useAppStore()

    const priceQuery = "https://api.coingecko.com/api/v3/simple/price?ids=kyve-network&vs_currencies=usd&precision=4"
    const { data: priceData, pending: pricePending, error: priceError, refresh: priceRefresh } = useFetch(priceQuery, {
          onResponse({request, response, options}) {
            const appStore = useAppStore()
            console.log("PRICE == ", response._data)
            appStore.price = Number(response._data["kyve-network"].usd)
          }
        })


    const stakerInfo = computed(() => {
      return appStore.sdk.config.rest + '/kyve/query/v1beta1/staker/'+ appStore.stakerAddress
    })
    const { data: stakerData, pending: stakerPending, error: stakerError, refresh: stakerRefresh } = useFetch(stakerInfo, {
          onResponse({request, response, options}) {
            const appStore = useAppStore()
            console.log("staker = ", response._data)
            appStore.staker = response._data.staker
          },
          watch: [stakerInfo]
        })

    const delegationInfo = computed(() => {
      if (appStore.islogged) {
        return appStore.sdk.config.rest + '/kyve/query/v1beta1/delegator/' + appStore.stakerAddress + '/' + appStore.walletAddress
      }
      else {return ''}
    })
    const { data: delegationData, pending: delegationPending, error: delegationError, refresh: delegationRefresh } = useFetch(delegationInfo, {
          onResponse({request, response, options}) {
            const appStore = useAppStore()
            console.log("staker = ", response._data)
            appStore.delegatorInfo = response._data.delegator
          },
          watch: [delegationInfo],
          server: false
        })
    
    const balanceAddress = computed(() => '/api/balance/' + appStore.walletAddress)
    const { data: balanceData, pending: balancePending, error: balanceError, refresh: balanceRefresh } = useFetch(balanceAddress, {
          onResponse({request, response, options}) {
            const appStore = useAppStore()
            appStore.balance = Number(response._data.amount) / 10**appStore.sdk.config.coinDecimals
          },
          watch: [balanceAddress],
          lazy: true,
          server: false
        })
      
    const mailtoLink = computed(() => `mailto:${appStore.staker_metadata?.security_contact}`)

    return { appStore, stakerPending, delegationPending, mailtoLink}
  },
}
</script>