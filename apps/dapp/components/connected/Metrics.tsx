import { useAppSelector } from 'apps/dapp/hooks';
import { selectUserBalance } from 'apps/dapp/store/slices';
import { GlobalMetricsType, LangType, UserMetricsType } from 'apps/dapp/types';
import getConfig from 'next/config';
import Image from 'next/image';
import { CustomLink } from '../shared/CustomLink';
import { useRouter } from 'next/router';
import { Icons } from '../shared/Icons';
import Link from 'next/link';
import { useState } from 'react';

export interface IMetrics {
  lang: LangType;
  globalMetrics?: GlobalMetricsType;
  userMetrics?: UserMetricsType;
  boolComm: boolean;
  address?: string;
}

export const Metrics: React.FC<IMetrics> = ({
  lang,
  globalMetrics,
  userMetrics,
  boolComm,
  address,
}) => {
  const userBalance = useAppSelector(selectUserBalance);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const POLYGONSCAN_BASEURL = getConfig().publicRuntimeConfig.polygonScanUrl;
  const FORWARDER_CONTRACT = address;

  const handleCopy = () => {
    if (FORWARDER_CONTRACT) {
      navigator.clipboard.writeText(FORWARDER_CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const totalMembers =
    (globalMetrics?.usersCount?.alumnis ?? 0) +
    (globalMetrics?.usersCount?.students ?? 0);

  return (
    <aside className="c-metrics">
      <Link href="/wallet" passHref>
        <a className="c-metrics__section-link">
          <h2 className="subtitle-1 u-align-self-start">
            My Activity
          </h2>
          <div className="c-metrics__wallet-container">
            <Image
              alt="Balance"
              src="/assets/images/png/token-no-T4G.png"
              width={120}
              height={120}
              className="c-metrics__wallet-container__img"
              priority
            />
            <span className="c-metrics__wallet-container__balance">
              {userBalance}
            </span>
            <p className="c-metrics__wallet-container__token">
              {userBalance > 1 ? lang.utils.tokens : lang.utils.token}
            </p>
          </div>
          <div
            className="o-layout--grid--auto u-width--fill"
            style={{ '--grid-min-size': `300px`, '--grid-gap': '32px' } as React.CSSProperties}
          >
            <div
              className="o-layout--grid--auto u-width--fill"
              style={{ '--grid-min-size': `120px`, '--grid-gap': '32px' } as React.CSSProperties}
            >
              <div className="c-metrics__metric--token">
                <p className="c-metrics__metric__number">
                  {userMetrics?.tokensUsed}
                </p>
                <p>Tokens Used</p>
              </div>
              <div className="c-metrics__metric--token">
                <p className="c-metrics__metric__number">
                  {userMetrics?.tokensEarned}
                </p>
                <p>Earned Tokens</p>
              </div>
            </div>

            <div
              className="o-layout--grid--auto u-width--fill"
              style={{ '--grid-min-size': `120px`, '--grid-gap': '32px' } as React.CSSProperties}
            >
              <div className="c-metrics__metric--benefits">
                <p className="c-metrics__metric__number">
                  {userMetrics?.benefitsEnjoyed}
                </p>
                <p>Benefits Received</p>
              </div>
              <div className="c-metrics__metric--benefits">
                <p className="c-metrics__metric__number">
                  {userMetrics?.servicesProvided}
                </p>
                <p>Services Provided</p>
              </div>
            </div>
          </div>
        </a>
      </Link>
      {boolComm && (
        <Link href="/community" passHref>
          <a className="c-metrics__section-link">
            <h2 className="subtitle-1 u-align-self-start">
              My Community
            </h2>
            <div
              className="o-layout--grid--auto u-width--fill"
              style={{ '--grid-min-size': `120px`, '--grid-gap': '32px' } as React.CSSProperties}
            >
              <div className="c-metrics__metric--community">
                <p className="c-metrics__metric__number">{totalMembers}</p>
                <p>Members</p>
              </div>
              <div className="c-metrics__metric--community">
                <p className="c-metrics__metric__number">
                  {globalMetrics?.interactionsCount}
                </p>
                <p>Transactions</p>
              </div>
            </div>
          </a>
        </Link>
      )}
      {!boolComm && (
        <>
          <div className="o-card">
            <div className="About__Wallet__title flex justify-between">
              <h2 className="subtitle-1">{lang.page.community.main.title3}</h2>
            </div>

            <div className="flex flex-col items-center justify-around pt-4 mx-auto max-w-full">
              <p className="leading-4 mt-8">
                {lang.page.community.main.section2.text1}
              </p>
              <p className="self-start mt-6 u-text--bold">
                {lang.page.community.main.section2.text2} :
              </p>
              <div className="flex w-full mt-2 items-center">
                <div className="overflow-hidden text-ellipsis hover:underline u-text--bold text-blue-005 max-w-max cursor-pointer">
                  {FORWARDER_CONTRACT}
                </div>
                <button
                  onClick={handleCopy}
                  className="grow-0 ml-4 cursor-pointer text-blue-008"
                  aria-label="Copy"
                >
                  {copied ? '✓' : Icons.copy}
                </button>
              </div>
              {copied && <span className="text-sm text-green-600 mt-1">Copied!</span>}
            </div>
          </div>
          <div className="o-card">
            <div className="">
              <h2 className="subtitle-1">
                {lang.page.community.main.section2.text3}
              </h2>
              <p className="mt-8 mb-8 text-base text-blue-007">
                {lang.page.community.main.section2.text4}
              </p>
              <div className="self-start">
                <CustomLink
                  href={POLYGONSCAN_BASEURL + '/address/' + FORWARDER_CONTRACT}
                  label={lang.page.community.main.section2.linktext}
                  iconName={'arrowRight'}
                  external={false}
                  newWindow={true}
                  className="c-link--icon"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

Metrics.displayName = 'Metrics';
