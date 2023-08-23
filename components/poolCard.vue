<template>
        <v-card class="mx-2"
        elevation="5"
        width="20%"
        rounded="20"
        :title="pool.name"> 
        <template v-slot:prepend>
            <v-avatar>
                <v-img
                max-width="32"
                max-height="32"
                :src="poolStore.getPoolLogo"
                ></v-img>
            </v-avatar>
        </template>
        <v-col>
            <p>progress:</p>
            <v-progress-linear
                :height="15"
                rounded
                rounded-bar
                stream
                :buffer-value="progress"
                color="teal"
            >
                {{ progress.toFixed(1) }} %
            </v-progress-linear>
            <div>validators: {{  }}</div>
            <div>Total pool Delegation: {{ total_delegation }}</div>
            <div>Total fund in the pool: {{ pool.total_funds / 10**appStore.sdk.config.coinDecimals}}</div>
            <div>Archived bundle count: {{  }}</div>
            <!-- <div>is active: {{ pool.is_leaving ? 'no' : 'yes'}}</div> -->
            <!-- <div>bundle interval: {{ pool.upload_interval }}seconds</div> -->
            <!-- <div>start Key: {{ poolData.pool.data.start_key }}</div>
            <div>start Key: {{ poolData.pool.data.current_key }}</div>
            <div>funds: {{ poolData.pool.data.total_funds }}</div>
            <div>config: {{ poolData.pool.data.config }}</div> -->
        </v-col>
        </v-card>
  </template>
  
  <script>
  import { useAppStore } from '@/store/app'
  import { createPoolStore } from '@/store/pool'
import { useThrottledRefHistory } from '@vueuse/core';
  export default {
    props: {
      pool: Object, // Prop to pass the messages data
    },
    setup(props) {
        const poolStore = createPoolStore('PoolStore', props.pool)
        console.log("created store => ", poolStore);
        const appStore = useAppStore()
        return {poolStore, appStore}
    },
    data: () => ({
        pool_rpc: null,
        progress: 0
    }),
    computed: {
        logo() {
            return this.poolStore.getPoolLogo
        },
        total_delegation() {
            const v = this.pool.total_delegation / 10**this.appStore.sdk.config.coinDecimals
            return v.toLocaleString()
        },
        total_fund() {
            const v = this.pool.total_fund / 10**this.appStore.sdk.config.coinDecimals
            return v.toLocaleString()
        },
    },
    methods: {
        
    },
    beforeMount() {
        (async () => {this.progress = await this.poolStore.getProgress() * 100})();
    }
    
  };
  </script>