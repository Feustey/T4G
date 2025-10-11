// @ts-ignore
import { ethers } from "hardhat";
import axios from "axios";

/**
 * update DEFAULT ADMIN on ERC20 & Service Catalog contracts
 * run at project root dir with `npx hardhat run contracts/scripts/update-admin.ts`
 * !!! only usable once
 */
async function main() {
  //for staging addresses
  const SERVICECATALOG_ADDRESS = "0x4aa24c4E6E0bf1680eD98E55576437E71cB749Bd";
  const ERC20_ADDRESS = "0x51790D3cF4c7D82C4D774F244Ba2F890A4b77B44";
  const GAS_RELAYER = "0x0Bffc183c316A1B3c90C4dCdb8C6eE75F8393b32";
  const RPC_URL =
    "https://token4good-mumbai-1ccf.settlemint.com?t4g_1410=bpaas-4bEb74E785cf3BFBDBc199c5169f4f0A2A38D52f";

  const ServiceCatalog = await ethers.getContractFactory("ServiceCatalog");
  const serviceCatalog = ServiceCatalog.connect(
    await ethers.getSigner()
  ).attach(SERVICECATALOG_ADDRESS);

  const data = serviceCatalog.interface.encodeFunctionData("grantRole", [
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RELAYER_ROLE")),
    "0xb12fA22426e5B9c6136355Ba50D250e4E17a7542",
  ]);
  const serviceCatalogRequest = axios
    .post(`${RPC_URL}`, {
      jsonrpc: "2.0",
      id: 42,
      method: "eth_sendTransaction",
      params: {
        "0": {
          from: GAS_RELAYER,
          to: SERVICECATALOG_ADDRESS,
          data: data,
          gas: 3000000,
          maxPriorityFeePerGas: 300000000000,
          maxFeePerGas: 350000000000,
        },
      },
    })
    .then((res) => {
      console.log("set admin on ServiceCatalog", res.data);
    });
  return serviceCatalogRequest;
  //
  /*

    const ServiceCatalog = await ethers.getContractFactory("ServiceCatalog");
    const serviceCatalog = ServiceCatalog.connect(await ethers.getSigner()).attach(SERVICECATALOG_ADDRESS)
    const serviceCatalogData = serviceCatalog.interface.encodeFunctionData(
        'grantRole',
        [
            ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes('DEFAULT_ADMIN_ROLE')
            ),
            process.env.ADMIN
        ]
    )
    const serviceCatalogRequest = axios.post(
      `${RPC_URL}`,
      {
        jsonrpc: '2.0',
        id: 42,
        method: 'eth_sendTransaction',
        params: {
          '0': {
            from: GAS_RELAYER,
            to: SERVICECATALOG_ADDRESS,
            data: serviceCatalogData,
            gas: 3000000,
            maxPriorityFeePerGas: 300000000000,
            maxFeePerGas:         350000000000,
          },
        },
      }
    ).then((res)=> {
        console.log("set admin on ServiceCatalog", res.data)
    })

    const serviceCatalogAdminRelayerData = serviceCatalog.interface.encodeFunctionData(
        'grantRole',
        [
            ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes('RELAYER_ROLE')
            ),
            process.env.ADMIN
        ]
    )
    const serviceCatalogAdminRelayerRequest = axios.post(
        `${RPC_URL}`,
        {
            jsonrpc: '2.0',
            id: 42,
            method: 'eth_sendTransaction',
            params: {
                '0': {
                    from: GAS_RELAYER,
                    to: SERVICECATALOG_ADDRESS,
                    data: serviceCatalogAdminRelayerData,
                    gas: 3000000,
                    maxPriorityFeePerGas: 300000000000,
                    maxFeePerGas:         350000000000,
                },
            },
        }
    ).then((res)=> {
        console.log("set relayer on ServiceCatalog", res.data)
    })

    const ERC20Meta = await ethers.getContractFactory("ERC20Meta");
    const erc20Meta = ERC20Meta.connect(await ethers.getSigner()).attach(ERC20_ADDRESS)
    const erc20MetaDataField = erc20Meta.interface.encodeFunctionData(
        'grantRole',
        [
            ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes('DEFAULT_ADMIN_ROLE')
            ),
            process.env.ADMIN
        ]
    )
    const erc20MetaRequest = axios.post(
        `${RPC_URL}`,
        {
            jsonrpc: '2.0',
            id: 42,
            method: 'eth_sendTransaction',
            params: {
                '0': {
                    from: GAS_RELAYER,
                    to: ERC20_ADDRESS,
                    data: erc20MetaDataField,
                    gas: 3000000,
                    maxPriorityFeePerGas: 300000000000,
                    maxFeePerGas:         350000000000,
                },
            },
        }
    ).then((res)=> {
        console.log("set admin on ERC20", res.data)
    })
    return Promise.all([serviceCatalogRequest, serviceCatalogAdminRelayerRequest, erc20MetaRequest])
*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
