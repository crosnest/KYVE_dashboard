import { OfflineAminoSigner } from "@cosmjs/amino/build/signer";
import { OfflineSigner, Registry } from "@cosmjs/proto-signing";
import { AminoTypes, GasPrice, SigningStargateClient } from "@cosmjs/stargate";

import { IConfig } from "@kyvejs/sdk/dist/constants";
import * as KyveRegistryTx from "@kyvejs/sdk/dist/registry/tx.registry";
import KyveClient from "@kyvejs/sdk/dist/clients/rpc-client/client";
import KyveWebClient from "@kyvejs/sdk/dist/clients/rpc-client/web.client";

import {
  createBundlesAminoConverters,
  createDelegationAminoConverters,
  createGovV1AminoConverters,
  createStakersAminoConverters,
} from "@kyvejs/sdk/dist/amino";

import {
  createAuthzAminoConverters,
  createAuthzExecAminoConverters,
} from "~/signer_util/amino/authz";
import { createDefaultAminoConverters } from "@cosmjs/stargate";

export async function getSigningKyveClient(
  config: IConfig,
  signer: OfflineSigner,
  aminoSigner: OfflineAminoSigner | null,
  walletName?: undefined,
  defaultTypes?: undefined
): Promise<KyveClient>;

export async function getSigningKyveClient(
  config: IConfig,
  signer: OfflineSigner,
  aminoSigner: OfflineAminoSigner | null,
  walletName?: string,
  defaultTypes?: undefined
): Promise<KyveWebClient>;

export async function getSigningKyveClient(
  config: IConfig,
  signer: OfflineSigner,
  aminoSigner: OfflineAminoSigner | null,
  walletName?: string
): Promise<KyveWebClient | KyveClient> {
  const registry = new Registry([...KyveRegistryTx.registry]);
  const gasPrice = GasPrice.fromString(`${config.gasPrice}${config.coinDenom}`);

  const client: SigningStargateClient =
    await SigningStargateClient.connectWithSigner(config.rpc, signer, {
      registry,
      gasPrice,
      aminoTypes: new AminoTypes({
        ...createDefaultAminoConverters(),
        ...createGovV1AminoConverters(),
        ...createStakersAminoConverters(),
        ...createDelegationAminoConverters(),
        ...createBundlesAminoConverters(),
        ...createAuthzAminoConverters(),
        ...createAuthzExecAminoConverters(),
      }),
    });

  const [account] = await signer.getAccounts();

  if (typeof walletName === "string") {
    return new KyveWebClient(client, account, config, aminoSigner, walletName);
  }

  return new KyveClient(client, account, config, aminoSigner);
}
