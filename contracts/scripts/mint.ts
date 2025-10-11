// @ts-ignore
import { ethers } from "hardhat";
import { Forwarder } from "../../typechain-types";
import * as fs from "fs";

/**
 * run at project root dir with `npx hardhat run contracts/scripts/mint.ts`
 */
async function main() {
  const n = 1;
  const to = "0xe8dAed574fc410de0a6085e577f237A9845b35E5";

  const adminAddress = process.env.ADMIN!;
  let erc20Contract = process.env.TOKEN_CONTRACT;

  //grant minter role to Admin
  const ERC20Meta = await ethers.getContractFactory("ERC20Meta");
  const erc20Meta = await ERC20Meta.connect(await ethers.getSigner()).attach(
    erc20Contract
  );
  await erc20Meta
    .hasRole(erc20Meta.MINTER_ROLE(), adminAddress)
    .then((hasRole) => {
      if (!hasRole) {
        return erc20Meta
          .grantRole(erc20Meta.MINTER_ROLE(), adminAddress, {
            gasLimit: 350000,
          })
          .then((res) => {
            return res.wait(1).then((receipt) => {
              console.log(
                `granted MINTER_ROLE for ADMIN ${adminAddress} on ERC20 ${erc20Contract}`,
                process.env.POLYGONSCAN_BASEURL +
                  "/tx/" +
                  receipt.transactionHash
              );
              Promise.resolve();
            });
          });
      } else return Promise.resolve();
    });
  await erc20Meta
    .mint(to, ethers.utils.parseUnits(n.toString()), { gasLimit: 350000 })
    .then((res) => {
      return res.wait(1).then((receipt) => {
        console.log(
          `minted ${n}🟠 for ${to} on ERC20 ${erc20Contract}`,
          process.env.POLYGONSCAN_BASEURL + "/tx/" + receipt.transactionHash
        );
        Promise.resolve();
      });
    });
  console.log("ok");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
