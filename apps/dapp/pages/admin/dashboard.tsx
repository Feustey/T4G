import React from 'react';
import { AppLayout } from '@t4g/ui/layouts';
import { DividerElement } from '@t4g/ui/elements';
import { Components } from '@t4g/types';
import useSwr from 'swr';
import moment from 'moment/moment';
import getConfig from 'next/config';
import Link from 'next/link';
import { TableSkeleton } from '../../components';

import Head from 'next/head';
import { ethers } from 'ethers';
import { useAppDispatch, useIndexing } from '../../hooks';
import AdminLayout from '../../layouts/AdminLayout';
import { AuthPageType, SessionType } from 'apps/dapp/types';
import { useSession } from 'next-auth/react';
import useWebSocket from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import { addUserNotificationsState } from 'apps/dapp/store/slices';
import { apiFetch, apiFetcher } from 'apps/dapp/services/config';

interface AdminWalletEntry {
  email: string;
  wallet: string;
  balance: number | null;
  updated: string;
}

interface ContractData {
  address: string;
  abi: ethers.ContractInterface;
}

const Page: React.FC<Components.Wallet.Page.Props> & AuthPageType = ({
  lang,
}: Components.Wallet.Page.Props) => {
  const [minting, setMinting] = React.useState([]);
  const session = useSession().data as SessionType;
  const user = session.user;
  const {
    data,
    mutate,
    error,
  } = useSwr<AdminWalletEntry[]>(`/admin/wallets`, apiFetcher);

  const dispatch = useAppDispatch();

  const POLYGONSCAN_BASEURL = getConfig().publicRuntimeConfig.polygonScanUrl;
  const WS_URL = getConfig().publicRuntimeConfig.updatesUrl;
  useWebSocket(WS_URL + '/wallet/0x', {
    onOpen: () => {
      console.log('connected to broadcast updates');
    },
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('update message on broadcast', data);
      setMinting((prev) => prev.filter((m) => m !== data.wallet));
      dispatch(
        addUserNotificationsState({
          content: `🍺 ` + data.wallet + ` has now ` + data.balance + ` tokens`,
          status: 'success',
          id: uuidv4(),
        })
      );
      mutate();
    },
  });

  function mintWelcome(wallet: string) {
    console.log('minting tokens ' + wallet);
    setMinting((prev) => [...prev, wallet]);
    //setMinting(true)
    apiFetch('/admin/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Mint welcome failed with ${response.status}`);
        }
        console.log('minted tokens for ' + wallet);
        mutate();
        setMinting((prev) => prev.filter((m) => m !== wallet));
      })
      .catch((e) => {
        console.error('error minting tokens for ' + wallet, e);
        setMinting((prev) => prev.filter((m) => m !== wallet));
      });
  }

  async function mint(wallet: string, n: number) {
    console.log(`minting ${n} tokens for ${wallet}`);
    setMinting((prev) => [...prev, wallet]);
    const ethereum = window['ethereum'];
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    apiFetcher<ContractData>(`/contracts/tokens`)
      .then((contractData) => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const walletAddress = accounts[0]; // first account in MetaMask
        const signer = provider.getSigner(walletAddress);
        const tokenContract = new ethers.Contract(
          contractData.address,
          contractData.abi,
          signer
        );
        tokenContract
          .mint(wallet, ethers.utils.parseUnits(n.toString()))
          .then((tx) => {
            console.log(
              'tx submitted...',
              POLYGONSCAN_BASEURL + '/tx/' + tx.hash
            );
            const ts = new Date().getTime();
            tx.wait(1).then((res) => {
              const t = Math.floor((new Date().getTime() - ts) / 1000);
              console.log(
                `... tx ok in ${t}s`,
                POLYGONSCAN_BASEURL + '/tx/' + res.transactionHash
              );
              mutate();
              setMinting((prev) => prev.filter((m) => m !== wallet));
            });
          });
      })
      .catch((e) => {
        console.error('error minting tokens for ' + wallet, e);
        setMinting((prev) => prev.filter((m) => m !== wallet));
      });
  }

  return (
    <>
      <Head>
        <title>{lang.page.admin.dashboard.head.title}</title>
        {useIndexing(false)}
      </Head>
      <AdminLayout lang={lang}>
        <AppLayout user={user}>
          <div className="Services Page flex flex-col items-center">
            <h1 className="text-h1 text-blue-005 w-1/2 font-medium text-center">
              Dashboard
            </h1>
          </div>

          <div className="Services Page flex flex-col items-center">
            <h4 className="text-h4 text-blue-004 w-3/5 mt-6 text-center"></h4>
          </div>

          <div className="Dashboard Page grid grid-cols-12 gap-6">
            <div className="Dashboard__main lg:col-span-8 col-span-12">
              <div className="Dashboard__Notifications">
                <div className="Dashboard__Notifications__title flex justify-between mt-12 mb-4">
                  <div>
                    <ul
                      className="  text-blue-005 p-5 overflow-x-auto bg-white"
                      role="list"
                    >
                      <li className="">
                        <div className="Row flex items-center justify-between font-medium">
                          <div className="min-w-[350px]">User</div>
                          <div className="min-w-[200px]">Last update</div>
                          <div className="min-w-[120px]">Balance</div>
                          <div className="min-w-[200px] text-center" />
                        </div>
                        <DividerElement spacing="pt-10" bleeding />
                      </li>
                      {error && <p>Erreur</p>}
                      {(!data && !error) || data.length <= 0 ? (
                        <TableSkeleton totalCol={4} totalRows={5} />
                      ) : (
                        data.map((user, i) => (
                          <li key={user.email + i} className="text-base">
                            <div className="Row flex items-center justify-between">
                              <div className=" min-w-[350px]">
                                {user.email}
                                <p className="text-blue-003 text-xs">
                                  <Link
                                    className="text-blue-003 text-xs"
                                    href={`${POLYGONSCAN_BASEURL}/address/${user.wallet}#tokentxns`}
                                    target="_blank"
                                  >
                                    {user.wallet}
                                  </Link>
                                </p>
                              </div>
                              <div className=" min-w-[200px]">
                                {moment(user.updated).format('DD/MM/YY HH:MM')}
                              </div>
                              <div className=" min-w-[120px]">
                                {(user.balance && user.balance + '  🟠') ||
                                  (user.wallet &&
                                    ((minting.includes(user.wallet) && (
                                      <span>minting...</span>
                                    )) || (
                                      <button
                                        id={'mint-' + user.wallet}
                                        className="flex  items-center justify-center px-5 font-small transition-colors duration-300 text-white bg-green-001 hover:drop-shadow-md "
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          mintWelcome(user.wallet);
                                        }}
                                      >
                                        Mint
                                      </button>
                                    )))}
                              </div>
                              <div className="min-w-[200px] text-center">
                                {(minting.includes(user.wallet) && (
                                  <span>minting...</span>
                                )) || (
                                  <div className="min-w-[200px] text-center">
                                    <button
                                      className={
                                        'bg-green-001 text-white flex  items-center justify-center py-2 px-2 font-medium transition-colors duration-300'
                                      }
                                      onClick={() => mint(user.wallet, 10)}
                                    >
                                      +10&nbsp;
                                    </button>
                                    <button
                                      className={
                                        'bg-green-001 text-white flex  items-center justify-center py-2 px-2 font-medium transition-colors duration-300'
                                      }
                                      onClick={() => mint(user.wallet, 20)}
                                    >
                                      +20&nbsp;
                                    </button>
                                    <button
                                      className={
                                        'bg-green-001 text-white flex  items-center justify-center py-2 px-2 font-medium transition-colors duration-300'
                                      }
                                      onClick={() => mint(user.wallet, 100)}
                                    >
                                      +100&nbsp;
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {i !== data.length - 1 && (
                              <DividerElement spacing="pt-10" bleeding />
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </AdminLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['SERVICE_PROVIDER'];
