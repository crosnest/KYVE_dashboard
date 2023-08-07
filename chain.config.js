export default [
    {
      chainId: 'kyve-1',
      name: 'kyve',
      desc: '',
      apiURL: 'https://rest.cros-nest.com/kyve',
      rpcURL: 'https://rpc-eu-1.kyve.network',
      coinLookup: {
        viewDenom: 'KYVE',
        chainDenom: 'ukyve',
        denomExponent: 6,
        addressPrefix: 'kyve',
        icon: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/kyve/chain.png",
      },
      explorerUrl: 'https://www.mintscan.io/kyve/txs/',
      coingeckoId: 'kyve-network'
    },
    {
      chainId: 'kaon-1',
      name: 'kaon',
      desc: '',
      apiURL: 'https://api-eu-1.kaon.kyve.network/',
      rpcURL: 'https://rpc-eu-1.kaon.kyve.network/',
      coinLookup: {
        viewDenom: 'KYVE',
        chainDenom: 'tkyve',
        denomExponent: 6,
        addressPrefix: 'kyve',
        icon: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/kyve/chain.png",
      },
      explorerUrl: 'https://explorer.kyve.network/kaon/tx/',
      coingeckoId: 'kyve-network'
    }
  ]
  