// @ts-ignore
import { ethers } from "hardhat";
import * as ethSigUtil from "@metamask/eth-sig-util";
import { Forwarder } from "../../typechain-types";
import { getNetwork } from "@ethersproject/providers";

/**
 * run at project root dir with `npx hardhat run contracts/scripts/sendTx.ts`
 */
async function main() {
  // const adminAddress = process.env.ADMIN!
  // const forwarderContract = process.env.FORWARDER_CONTRACT
  // const Forwarder = await ethers.getContractFactory("Forwarder");
  // const forwarder = await Forwarder.connect(await ethers.getSigner()).attach(forwarderContract)
  const ServiceCatalog = await ethers.getContractFactory("ServiceCatalog");
  const serviceCatalog = ServiceCatalog.connect(
    await ethers.getSigner()
  ).attach(process.env.SERVICE_CATALOG_CONTRACT);
  //
  // const EIP712Domain = [
  //     {name: 'name', type: 'string'},
  //     {name: 'version', type: 'string'},
  //     {name: 'chainId', type: 'uint256'},
  //     {name: 'verifyingContract', type: 'address'},
  // ];
  // const types = {
  //     EIP712Domain,
  //     ForwardRequest: [
  //         {name: 'from', type: 'address'},
  //         {name: 'to', type: 'address'},
  //         {name: 'value', type: 'uint256'},
  //         {name: 'gas', type: 'uint256'},
  //         {name: 'nonce', type: 'uint256'},
  //         {name: 'data', type: 'bytes'},
  //     ],
  // };
  // const domain = {
  //     name: 'MinimalForwarder',
  //     version: '0.0.1',
  //     chainId: parseInt(process.env.CHAIN_ID!),
  //     verifyingContract: process.env.FORWARDER_CONTRACT!
  // }
  // const userAddress = "0xc5458788dd36abadc29d2aa84db1e60f0032d791"
  // return forwarder.getNonce(userAddress).then((userNonce)=>{
  //     const approveData = serviceCatalog.interface.encodeFunctionData(
  //         'validateDealAsProvider',
  //         [5])
  //     const request = {
  //         from: userAddress,
  //         to: process.env.SERVICE_CATALOG_CONTRACT!,
  //         value: 0,
  //         gas: 300000,
  //         nonce: userNonce.toNumber(),
  //         data: approveData,
  //     };
  //     console.log("req", request)
  //     const signature = ethSigUtil.signTypedData({
  //         privateKey: Buffer.from('1514d2bca165dcd343ee24850abdc084f61bb1f900d64312328c21f766a0045a', 'hex'),
  //         data: {
  //             types: types,
  //             domain: domain,
  //             primaryType: 'ForwardRequest',
  //             message: request,
  //         },
  //         version: ethSigUtil.SignTypedDataVersion.V4,
  //     });
  const sc = serviceCatalog.connect(
    new ethers.Wallet(
      "1514d2bca165dcd343ee24850abdc084f61bb1f900d64312328c21f766a0045a",
      new ethers.providers.AlchemyProvider(
        getNetwork(parseInt(process.env.CHAIN_ID!)),
        process.env.ALCHEMY_API_KEY
      )
    )
  );
  sc.validateDealAsProvider(14, { gasLimit: 300000 }).then((tx) => {
    tx.wait(1).then((receipt) => {
      console.log("receipt", receipt.transactionHash);
    });
  });
  // forwarder.execute(request, signature,{gasLimit: 350000}).then((tx)=>{
  //     tx.wait(1).then((receipt) => {
  //         console.log("receipt", receipt.transactionHash)
  //     })
  // })
  // })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
