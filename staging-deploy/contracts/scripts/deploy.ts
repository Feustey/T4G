// @ts-ignore
import { ethers } from "hardhat";
import { Forwarder } from "../../typechain-types";
import * as fs from "fs";

/**
 * run at project root dir with `npx hardhat run contracts/scripts/deploy.ts`
 */
async function main() {
  const adminAddress = process.env.ADMIN!;
  let forwarderContract = process.env.FORWARDER_CONTRACT;
  if (!forwarderContract) {
    const Forwarder = await ethers.getContractFactory("Forwarder");
    const forwarder = await Forwarder.deploy();
    const forwarderDeployment = await forwarder.deployed();
    console.log(`deployed Forwarder at ` + forwarderDeployment.address);
    forwarderContract = forwarderDeployment.address;
    fs.appendFileSync(".env", `\nFORWARDER_CONTRACT=${forwarderContract}`);
  } else {
    console.log("Forwarder already deployed at " + forwarderContract);
  }
  console.log(
    `deploying with forwarder/relay at ${forwarderContract} and admin at ${adminAddress}`
  );

  let erc20Contract = process.env.TOKEN_CONTRACT;
  if (!erc20Contract) {
    const ERC20Meta = await ethers.getContractFactory("ERC20Meta");
    const erc20Meta = await ERC20Meta.deploy(
      "Token4Good",
      "T4G",
      forwarderContract
    );
    const erc20MetaDeployment = await erc20Meta.deployed();
    console.log(`deployed T4G token at ` + erc20MetaDeployment.address);
    erc20Contract = erc20MetaDeployment.address;
    fs.appendFileSync(".env", `\nTOKEN_CONTRACT=${erc20Contract}`);
  } else {
    console.log("T4G token already deployed at " + erc20Contract);
  }

  let servicesCatalogContract = process.env.SERVICE_CATALOG_CONTRACT;
  if (!servicesCatalogContract) {
    const ServiceCatalog = await ethers.getContractFactory("ServiceCatalog");
    const serviceCatalog = await ServiceCatalog.deploy(forwarderContract);
    const serviceCatalogDeployment = await serviceCatalog.deployed();
    await serviceCatalog.initialize(adminAddress, erc20Contract);
    console.log(
      `deployed ServiceCatalog at ` + serviceCatalogDeployment.address
    );
    servicesCatalogContract = serviceCatalogDeployment.address;
    fs.appendFileSync(
      ".env",
      `\nSERVICE_CATALOG_CONTRACT=${servicesCatalogContract}`
    );
  } else {
    console.log(
      "Service catalog already deployed at " + servicesCatalogContract
    );
  }

  //grant relayer role to admin account & forwarder contract
  const ServiceCatalog = await ethers.getContractFactory("ServiceCatalog");
  const serviceCatalog = ServiceCatalog.connect(
    await ethers.getSigner()
  ).attach(servicesCatalogContract);
  await serviceCatalog
    .hasRole(serviceCatalog.RELAYER_ROLE(), forwarderContract)
    .then((hasRole) => {
      if (!hasRole) {
        return serviceCatalog
          .grantRole(serviceCatalog.RELAYER_ROLE(), forwarderContract, {
            gasLimit: 300000,
          })
          .then((res) => {
            return res.wait(1).then((receipt) => {
              console.log(
                `granted RELAYER_ROLE for FORWARDER_CONTRACT ${forwarderContract} on serviceCatalog ${servicesCatalogContract}`,
                receipt.transactionHash
              );
              Promise.resolve();
            });
          });
      } else return Promise.resolve();
    });
  await serviceCatalog
    .hasRole(serviceCatalog.RELAYER_ROLE(), process.env.ADMIN)
    .then((hasRole) => {
      if (!hasRole) {
        return serviceCatalog
          .grantRole(serviceCatalog.RELAYER_ROLE(), adminAddress, {
            gasLimit: 300000,
          })
          .then((res) => {
            return res.wait(1).then((receipt) => {
              console.log(
                `granted RELAYER_ROLE for ADMIN ${process.env.ADMIN} on serviceCatalog ${servicesCatalogContract}`,
                receipt.transactionHash
              );
              Promise.resolve();
            });
          });
      } else return Promise.resolve();
    });
  //grant SERVICE_CREATOR_ROLE  to admin account
  await serviceCatalog
    .hasRole(serviceCatalog.SERVICE_CREATOR_ROLE(), process.env.ADMIN)
    .then((hasRole) => {
      if (!hasRole) {
        return serviceCatalog
          .grantRole(serviceCatalog.SERVICE_CREATOR_ROLE(), adminAddress, {
            gasLimit: 300000,
          })
          .then((res) => {
            return res.wait(1).then((receipt) => {
              console.log(
                `granted SERVICE_CREATOR_ROLE for ADMIN ${process.env.ADMIN} on serviceCatalog ${servicesCatalogContract}`,
                receipt.transactionHash
              );
              Promise.resolve();
            });
          });
      } else return Promise.resolve();
    });
  //grant minter role to ServiceCatalog
  const ERC20Meta = await ethers.getContractFactory("ERC20Meta");
  const erc20Meta = await ERC20Meta.connect(await ethers.getSigner()).attach(
    erc20Contract
  );
  await erc20Meta
    .hasRole(erc20Meta.MINTER_ROLE(), servicesCatalogContract)
    .then((hasRole) => {
      if (!hasRole) {
        return erc20Meta
          .grantRole(erc20Meta.MINTER_ROLE(), servicesCatalogContract, {
            gasLimit: 350000,
          })
          .then((res) => {
            return res.wait(1).then((receipt) => {
              console.log(
                `granted MINTER_ROLE for SERVICE_CATALOG_CONTRACT ${servicesCatalogContract} on ERC20 ${erc20Contract}`,
                receipt.transactionHash
              );
              Promise.resolve();
            });
          });
      } else return Promise.resolve();
    });

  console.log("ok");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
