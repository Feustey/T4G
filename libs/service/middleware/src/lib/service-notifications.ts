import { Identity, DbService, transactionsDAO } from "@t4g/service/data";
import {
  categoriesDAO,
  identitiesDAO,
  notificationsDAO,
  servicesDAO,
} from "@t4g/service/data";
import { Components } from "@t4g/types";
import { Notification } from "@t4g/service/data";
import { createTransport, SentMessageInfo } from "nodemailer";
import { HTMLEmail } from "./notification-email";
import { logg } from "@t4g/service/middleware";

export const serviceNotifications = {
  getNotifications,
  sendNotificationForAirdrop,
  sendNotificationForServiceBooked,
  sendNotificationForServiceValidated,
  sendNotificationForServiceCancelled,
};

async function sendNotificationForServiceBooked(
  tx: string,
  buyerAddress: string,
  providerAddress: string,
  serviceBlockchainId: string
): Promise<string> {
  return Promise.all([
    identitiesDAO.getByWallet(buyerAddress),
    identitiesDAO.getByWallet(providerAddress),
  ]).then(([buyer, provider]) => {
    if (!buyer)
      return Promise.reject(
        `[serviceBooked] buyer not found with address ${buyerAddress} for service ${serviceBlockchainId}`
      );
    if (!provider)
      return Promise.reject(
        `[serviceBooked] provider not found with address ${providerAddress} for service ${serviceBlockchainId}`
      );
    console.log(
      `[serviceBooked] ${buyerAddress} booked service ${serviceBlockchainId} from ${providerAddress}`
    );
    return servicesDAO
      .getByBlockchainId(serviceBlockchainId)
      .then((service) => {
        if (!service)
          return Promise.reject(
            "[serviceBooked] service not found with blockchainId " +
              serviceBlockchainId
          );
        const notifs = Array<Promise<string>>();
        if (buyer.role == "STUDENT")
          notifs.push(
            sendNotificationForServiceBookedByStudent(
              tx,
              provider,
              buyer,
              service
            )
          );
        if (buyer.role == "ALUMNI")
          notifs.push(
            sendNotificationForServiceBookedByAlumni(
              tx,
              provider,
              buyer,
              service
            )
          );
        return Promise.all(notifs).then(() => Promise.resolve(tx));
      });
  });
}

async function sendNotificationForServiceValidated(
  tx: string,
  buyerAddress: string,
  providerAddress: string,
  serviceBlockchainId: string
): Promise<string> {
  return Promise.all([
    identitiesDAO.getByWallet(buyerAddress),
    identitiesDAO.getByWallet(providerAddress),
  ]).then(([buyer, provider]) => {
    if (!buyer)
      return Promise.reject(
        "[serviceValidated] buyer not found with address " + buyerAddress
      );
    if (!provider)
      return Promise.reject(
        "[serviceValidated] provider not found with address " + providerAddress
      );
    return servicesDAO
      .getByBlockchainId(serviceBlockchainId)
      .then((service) => {
        if (!service)
          return Promise.reject(
            "[serviceValidated] service not found with blockchainId " +
              serviceBlockchainId
          );
        const notifs = Array<Promise<string>>();
        if (buyer.role == "STUDENT")
          notifs.push(
            sendNotificationForServiceValidatedByStudent(
              tx,
              provider,
              buyer,
              service
            )
          );
        if (buyer.role == "ALUMNI")
          notifs.push(
            sendNotificationForServiceValidatedByProvider(
              tx,
              provider,
              buyer,
              service
            )
          );
        return Promise.all(notifs).then(() => Promise.resolve(""));
      });
  });
}

async function sendNotificationForServiceCancelled(
  tx: string,
  buyerAddress: string,
  providerAddress: string,
  serviceBlockchainId: string
): Promise<string> {
  return Promise.all([
    identitiesDAO.getByWallet(buyerAddress),
    identitiesDAO.getByWallet(providerAddress),
  ]).then(([buyer, provider]) => {
    if (!buyer)
      return Promise.reject(
        "[serviceCancelled] buyer not found with address " + buyerAddress
      );
    if (!provider)
      return Promise.reject(
        "[serviceCancelled] provider not found with address " + providerAddress
      );
    console.log(
      `[serviceCancelled] #${serviceBlockchainId} for ${buyerAddress} at tx ${tx}`
    );
    return servicesDAO
      .getByBlockchainId(serviceBlockchainId)
      .then((service) => {
        if (!service)
          return Promise.reject(
            "[serviceCancelled] service not found with blockchainId " +
              serviceBlockchainId
          );
        const notifs = Array<Promise<string>>();
        if (buyer.role == "STUDENT")
          notifs.push(
            sendNotificationForServiceCancelledByStudent(
              tx,
              provider,
              buyer,
              service
            )
          );
        if (buyer.role == "ALUMNI")
          notifs.push(
            sendNotificationForServiceCancelledByProvider(
              tx,
              provider,
              buyer,
              service
            )
          );
        return Promise.all(notifs).then(() => Promise.resolve(""));
      });
  });
}

async function sendNotificationForAirdrop(
  tx: string,
  walletAddress: string,
  amount: number
): Promise<any> {
  const type = "WELCOME_BONUS_RECEIVED";
  //notification for user
  return identitiesDAO.getByWallet(walletAddress).then((user) => {
    if (!user)
      return Promise.reject(
        "[sendNotificationForAirdrop] no user found for address " +
          walletAddress
      );

    return notificationsDAO.getByUser(user._id).then((notifications) => {
      if (notifications.find((notification) => notification.tx === tx)) {
        console.log(
          `already sent notification to user for this tx`,
          user._id,
          tx
        );
        return Promise.resolve(tx);
      } else {
        return notificationsDAO
          .create({
            tx,
            user: user!._id,
            amount,
            type,
            message: `You received ${amount} tokens in your wallet from Token for Good.`,
          } as Notification)
          .then(() => {
            //email
            const msgData = {
              boldSlot1: "",
              textSlot1: "You received",
              boldSlot2: `${amount} tokens`,
              textSlot2: "in your wallet from Token for Good.",
              linkSlot1: `${process.env.NEXTAUTH_URL}/wallet`,
              linkSlot1Text: "View wallet",
              textSlot3: "",
              linkSlot2: "",
              linkSlot2Text: "",
              linkSlot3Text: "",
              linkSlot3: "",
            };
            const subject = "You received tokens";
            const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}`;
            const htmlMessage = HTMLEmail(msgData);
            return transactionsDAO.getByTxHash(tx).then((tr) => {
              const txTs = tr?.ts?.valueOf() || 0;
              return send(user._id, subject, txtMessage, htmlMessage, txTs);
            });
          });
      }
    });
  });
}

async function sendNotificationForServiceBookedByStudent(
  tx: string,
  provider: Identity,
  buyer: Identity,
  service: DbService
): Promise<string> {
  const type = "SERVICE_BOOKED_BY_STUDENT";
  return notificationsDAO.getByUser(provider._id).then((notifications) => {
    if (notifications.find((notification) => notification.tx === tx)) {
      console.log(`already sent notification to user for this tx`, tx);
      return Promise.resolve(tx);
    } else {
      return Promise.all([
        //notification for provider
        notificationsDAO.create({
          tx,
          user: provider._id,
          amount: service.price,
          type,
          message: `${buyer.firstname} ${buyer.lastname} booked a ${service.name} session.
                  You will receive ${service.price} tokens once the ${service.name} session has taken place. \\n
                  Contact ${buyer.firstname} ${buyer.lastname} to schedule the session by email.`,
          link: `mailto:${buyer.email}?subject=Booking a session with ${buyer.firstname}  ${buyer.lastname}`,
        } as Notification),
        //notification for buyer
        notificationsDAO.create({
          tx,
          user: buyer._id,
          amount: service.price,
          type,
          message: `You successfully booked a ${service.name} session with ${provider.firstname} ${provider.lastname}.
          ${provider.firstname} will contact you to schedule the session.
          You used ${service.price} tokens.`,
        } as Notification),
      ]).then(() => {
        //email for provider
        const msgData = {
          boldSlot1: `${buyer.firstname} ${buyer.lastname}`,
          textSlot1: " booked a mentoring session. <br/><br/> You will receive",
          boldSlot2: `${service.price} tokens`,
          textSlot2:
            " once the mentoring session has taken place. You can send a direct email to ",
          linkSlot1: "",
          linkSlot1Text: "",
          textSlot3: ` and schedule the session together. <br/><br/>All instructions are available in the help menu in the platform.<br/>You can use doodle to easily propose slots to ${buyer.firstname} ${buyer.lastname} with this `,
          linkSlot2: `mailto:${buyer.email}?subject=Booking a session with ${buyer.firstname}  ${buyer.lastname}`,
          linkSlot2Text: `${buyer.email}`,
          linkSlot3Text: `booking tool.`,
          linkSlot3: `https://doodle.com/meeting/organize/groups`,
        };
        const subject = "Services - Booking for a mentoring session";
        const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}  ${msgData.linkSlot2Text}`;
        const htmlMessage = HTMLEmail(msgData);
        return transactionsDAO.getByTxHash(tx).then((tr) => {
          const txTs = (tr?.ts || new Date(0)).valueOf();
          console.log("date2", tr?.ts, tx, txTs);
          return send(provider._id, subject, txtMessage, htmlMessage, txTs);
        });
      });
    }
  });
}

async function sendNotificationForServiceValidatedByStudent(
  tx: string,
  provider: Identity,
  buyer: Identity,
  service: DbService
): Promise<string> {
  const type = "SERVICE_DELIVERY_CONFIRMED_BY_STUDENT";
  return notificationsDAO.getByUser(provider._id).then((notifications) => {
    if (notifications.find((notification) => notification.tx === tx)) {
      console.log(`already sent notification to user for this tx`, tx);
      return Promise.resolve(tx);
    } else {
      return Promise.all([
        //notification for provider
        notificationsDAO.create({
          tx,
          user: provider._id,
          amount: service.price,
          type,
          message: `${buyer.firstname} ${buyer.lastname} confirmed that a ${service.name} session has taken place. You received ${service.price} tokens in your wallet.`,
        } as Notification),
        //notification for buyer
        notificationsDAO.create({
          tx,
          user: buyer._id,
          amount: service.price,
          type,
          message: `You successfully confirmed that a ${service.name} session with ${provider.firstname} has taken place.`,
        } as Notification),
      ]).then(() => {
        const msgData = {
          boldSlot1: `${buyer.firstname} ${buyer.lastname}`,
          textSlot1:
            "confirmed a mentoring session has taken place. You received",
          boldSlot2: `${service.price} tokens in your wallet.`,
          textSlot2: "",
          linkSlot1: `${process.env.NEXTAUTH_URL}/wallet`,
          linkSlot1Text: "View wallet",
          textSlot3: "",
          linkSlot2: "",
          linkSlot2Text: "",
          linkSlot3Text: "",
          linkSlot3: "",
        };
        const subject = "Services - Confirmation of a mentoring session";
        const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}  ${msgData.linkSlot2Text}`;
        const htmlMessage = HTMLEmail(msgData);
        return transactionsDAO.getByTxHash(tx).then((tr) => {
          const txTs = tr?.ts?.valueOf() || 0;
          return send(provider._id, subject, txtMessage, htmlMessage, txTs);
        });
      });
    }
  });
}

async function sendNotificationForServiceCancelledByStudent(
  tx: string,
  provider: Identity,
  buyer: Identity,
  service: DbService
): Promise<string> {
  const type = "SERVICE_DELIVERY_CANCELED_BY_STUDENT";
  return notificationsDAO.getByUser(provider._id).then((notifications) => {
    if (notifications.find((notification) => notification.tx === tx)) {
      console.log(`already sent notification to user for this tx`, tx);
      return Promise.resolve(tx);
    } else {
      return Promise.all([
        //notification for provider
        notificationsDAO.create({
          tx,
          user: provider._id,
          amount: service.price,
          type,
          message: `${buyer.firstname} ${buyer.lastname} canceled the booking for a ${service.name} session.
          Contact ${buyer.firstname} ${buyer.lastname} for more info.`,
          link: `mailto:${buyer.email}`,
        } as Notification),
        //notification for buyer
        notificationsDAO.create({
          tx,
          user: buyer._id,
          amount: service.price,
          type,
          message: `You successfully canceled a ${service.name} session with ${provider.firstname} ${provider.lastname}.
            The ${service.price} tokens you used for the booking are refunded in your wallet.`,
        } as Notification),
      ]).then(() => {
        const msgData = {
          boldSlot1: `${buyer.firstname} ${buyer.lastname}`,
          textSlot1: "canceled the booking for a mentoring session.",
          boldSlot2: "",
          textSlot2: "",
          linkSlot1: "",
          linkSlot1Text: "",
          textSlot3: "",
          linkSlot2: `mailto:${buyer.email}`,
          linkSlot2Text: `Contact ${buyer.firstname} ${buyer.lastname} for more info.`,
          linkSlot3Text: "",
          linkSlot3: "",
        };
        const subject = "Services - Cancellation of a mentoring session";

        const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}  ${msgData.linkSlot2Text}`;
        const htmlMessage = HTMLEmail(msgData);
        return transactionsDAO.getByTxHash(tx).then((tr) => {
          const txTs = tr?.ts?.valueOf() || 0;
          console.log("date1", tr?.ts, tx, txTs);
          return send(provider._id, subject, txtMessage, htmlMessage, txTs);
        });
      });
    }
  });
}

async function sendNotificationForServiceBookedByAlumni(
  tx: string,
  provider: Identity,
  buyer: Identity,
  service: DbService
): Promise<any> {
  return categoriesDAO.getById(service.category).then((category) => {
    if (!category)
      return Promise.reject("category not found for id " + service.category);
    const type = "SERVICE_REDEEMED_BY_ALUMNI";
    return Promise.all([
      //for provider
      notificationsDAO.getByUser(provider._id).then((notifications) => {
        if (notifications.find((notification) => notification.tx === tx)) {
          console.log(
            `already sent notification to user for this tx`,
            provider._id,
            tx
          );
          return Promise.resolve(tx);
        } else {
          return notificationsDAO
            .create({
              tx,
              user: provider._id,
              amount: service.price,
              type,
              message: `${buyer.firstname} ${buyer.lastname} reserved a benefit ${category.name} - ${service.name}.`,
            } as Notification)
            .then(() => {
              //also send to admin(s)
              return identitiesDAO
                .getAllUsers({ role: "SERVICE_PROVIDER" })
                .then((admins) => {
                  const msgData = {
                    boldSlot1: "",
                    textSlot1: "An Alumni redeemed a benefit.",
                    boldSlot2: "",
                    textSlot2: `Please follow up on the service delivery, and confirm when the service delivery has taken place.`,
                    linkSlot1: `${process.env.NEXTAUTH_URL}/admin/service-delivery`,
                    linkSlot1Text: "View Details",
                    textSlot3: "",
                    linkSlot2: "",
                    linkSlot2Text: "",
                    linkSlot3Text: "",
                    linkSlot3: "",
                  };
                  const subject = "Benefits - Successfully redeemed";
                  const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}  ${msgData.linkSlot2Text}`;
                  const htmlMessage = HTMLEmail(msgData);
                  return transactionsDAO.getByTxHash(tx).then((tr) => {
                    const txTs = tr?.ts?.valueOf() || 0;
                    send(provider._id, subject, txtMessage, htmlMessage, txTs);
                    admins.forEach((admin) => {
                      send(admin.id, subject, txtMessage, htmlMessage, txTs);
                    });
                    return Promise.resolve(tx);
                  });
                });
            });
        }
      }),
      //for buyer
      notificationsDAO.getByUser(buyer._id).then((notifications) => {
        if (notifications.find((notification) => notification.tx === tx)) {
          console.log(
            `already sent notification to user for this tx`,
            buyer._id,
            tx
          );
          return Promise.resolve(tx);
        } else {
          return notificationsDAO
            .create({
              tx,
              user: buyer._id,
              amount: service.price,
              type,
              message: `You reserved a benefit ${category.name} - ${service.name}.`,
              ts: new Date(),
            } as Notification)
            .then(() => {
              const msgData = {
                boldSlot1: "",
                textSlot1: "You reserved a benefit:",
                boldSlot2: `${category.name} - ${service.name}`,
                textSlot2: `You spent  ${service.price} tokens.`,
                linkSlot1: `${process.env.NEXTAUTH_URL}/wallet`,
                linkSlot1Text: "View Wallet",
                textSlot3: "",
                linkSlot2: "",
                linkSlot2Text: "",
                linkSlot3Text: "",
                linkSlot3: "",
              };
              const subject = "Benefits - successfully reserved";
              const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}  ${msgData.linkSlot2Text}`;
              const htmlMessage = HTMLEmail(msgData);
              return transactionsDAO.getByTxHash(tx).then((tr) => {
                const txTs = tr?.ts?.valueOf() || 0;
                return send(buyer._id, subject, txtMessage, htmlMessage, txTs);
              });
            });
        }
      }),
    ]);
  });
}

async function sendNotificationForServiceValidatedByProvider(
  tx: string,
  provider: Identity,
  buyer: Identity,
  service: DbService
): Promise<any> {
  return categoriesDAO.getById(service.category).then((category) => {
    if (!category)
      return Promise.reject("category not found for id " + service.category);
    const type = "SERVICE_DELIVERY_CONFIRMED_BY_SERVICE_PROVIDER";
    //notification for buyer
    return notificationsDAO.getByUser(provider._id).then((notifications) => {
      if (notifications.find((notification) => notification.tx === tx)) {
        console.log(
          `already sent notification to user for this tx`,
          provider._id,
          tx
        );
        return Promise.resolve(tx);
      } else {
        return notificationsDAO
          .create({
            tx,
            user: buyer._id,
            amount: service.price,
            type,
            message: `Token for Good confirmed your benefit ${category.name} - ${service.name}.`,
          } as Notification)
          .then(() => Promise.resolve(tx));
      }
    });
  });
}

async function sendNotificationForServiceCancelledByProvider(
  tx: string,
  provider: Identity,
  buyer: Identity,
  service: DbService
): Promise<any> {
  return categoriesDAO.getById(service.category).then((category) => {
    if (!category)
      return Promise.reject("category not found for id " + service.category);
    const type = "SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER";
    return notificationsDAO.getByUser(buyer._id).then((notifications) => {
      if (notifications.find((notification) => notification.tx === tx)) {
        console.log(
          `already sent notification to user for this tx`,
          provider._id,
          tx
        );
        return Promise.resolve(tx);
      } else {
        //notification for buyer
        return notificationsDAO
          .create({
            tx,
            user: buyer._id,
            amount: service.price,
            type,
            message: `Token for Good canceled your benefit ${category.name} - ${service.name}. The ${service.price} tokens you used are refunded in your wallet.`,
          } as Notification)
          .then(() => {
            const msgData = {
              boldSlot1: "",
              textSlot1: "Token for Good canceled your benefit:",
              boldSlot2: `${category.name} - ${service.name}`,
              textSlot2: `The ${service.price} tokens you used are refunded in your wallet.`,
              linkSlot1: `${process.env.NEXTAUTH_URL}/wallet`,
              linkSlot1Text: "View Wallet",
              textSlot3: "",
              linkSlot2: "",
              linkSlot2Text: "",
              linkSlot3Text: "",
              linkSlot3: "",
            };
            const subject = "Benefits - Canceled";
            const txtMessage = `${msgData.boldSlot1} ${msgData.textSlot1} ${msgData.boldSlot2} ${msgData.textSlot2}`;
            const htmlMessage = HTMLEmail(msgData);
            return transactionsDAO.getByTxHash(tx).then((tr) => {
              const txTs = tr?.ts?.valueOf() || 0;
              return send(buyer._id, subject, txtMessage, htmlMessage, txTs);
            });
          });
      }
    });
  });
}

async function send(
  userId: string,
  subject: string,
  txtMessage: string,
  htmlMessage: string,
  txTs = 0
): Promise<any> {
  if (new Date().valueOf() - txTs > 30 * 60 * 1000) {
    console.log(
      `[createNotificationAndSend] sending message to user ${userId} : tx too old, ${txTs} is >30 min before ${Date.now()}`
    );
    return Promise.resolve();
  } //don't send if ts > 30 min
  console.log(`[createNotificationAndSend] sending message to user ${userId}`);
  return identitiesDAO.getById(userId).then((user) => {
    if (!user)
      Promise.reject(
        "[createNotificationAndSend] user not found for " + userId
      );
    return sendNotificationByEmail(
      user?.email,
      subject,
      txtMessage,
      htmlMessage
    );
  });
}

async function sendNotificationByEmail(
  to: string | undefined,
  subject: string,
  msgTxt: string,
  msgHtml: string
): Promise<Date> {
  const SUBJECT_PREFIX =
    process.env.NODE_ENV == "production"
      ? ""
      : `[${process.env.NODE_ENV?.toUpperCase()}] `;
  const sendMailConfig = {
    to: process.env.EMAIL_TO || to || process.env.EMAIL_ADMIN,
    bcc:
      "support@token-for-good.com" &&
      (process.env.EMAIL_ADMIN || "stephane.courant@token-for-good.com"),
    from: process.env.EMAIL_FROM,
    subject: SUBJECT_PREFIX + subject,
    text: msgTxt,
    html: msgHtml,
  };
  console.log(`send mail to ${to} : ${subject}`);
  return createTransport(process.env.EMAIL_SERVER)
    .sendMail(sendMailConfig)
    .then((res: SentMessageInfo) => {
      console.log("sent message", res);
      return res.accepted[0]?.ts || new Date();
    })
    .catch((e) => {
      console.error("error sending message", e);
      return Promise.reject(e);
    });
}

async function getNotifications(userAddress: string): Promise<Notification[]> {
  return identitiesDAO.getByWallet(userAddress).then((user) => {
    if (!user) {
      logg.warn("no user found for address " + userAddress);
      return Promise.resolve([]);
    }
    return notificationsDAO.getByUser(user._id);
  });
}

// async function getNotifications(userAddress: string): Promise<Notification[]> {
//     const user = await identitiesDAO.getUserByWallet(userAddress)
//     if (!user) return Promise.reject("no user")
//     let notifications = await notificationsDAO.getByUser(user.id)
//
//     const lastEventTs = (await serviceEventsRepo.getLastForAddress(userAddress))?.ts
//     // const lastTx = deals.sort(sortTxsDesc)[0]
//     const lastNotificationTs = notifications.sort(sortNotifsDesc)[0]?.ts?.valueOf() || 0
//     if (lastEventTs && lastNotificationTs < lastEventTs.valueOf()) {
//         //add welcome bonus
//         if (user.welcomeBonusTx) {
//             const welcomeBonus = formatWelcomeBonus(
//                 user.id,
//                 user.welcomeBonusTx,
//                 user.welcomeBonusDate,
//                 user.welcomeBonusAmount
//             )
//             await notificationsDAO.create(welcomeBonus)
//         }
//         //add deals
//         await getDeals(userAddress).then((deals) => {
//             return deals.map((tx) => {
//                 return {
//                     tx: tx.txHash,
//                     user: user.id,
//                     amount: tx.txAmount,
//                     type: tx.txType as Components.TransactionCode,
//                     message: tx.notification?.message || '',
//                     link: tx.notification?.link?.href || '',
//                     ts: new Date(tx.txTimestamp)
//                 } as Notification
//             })
//                 .filter((n) => n.ts.valueOf() > lastNotificationTs)
//                 .forEach((n) => notificationsDAO.create(n))
//         })
//         notifications = await notificationsDAO.getByUser(user.id)
//     }
//     return notifications
// }

function sortTxsDesc(
  a: Components.ITransaction | null,
  b: Components.ITransaction | null
) {
  return (b?.txTimestamp || 0) - (a?.txTimestamp || 0);
}

function sortNotifsDesc(a: Notification, b: Notification) {
  return b.ts.valueOf() - a.ts.valueOf();
}

// async function getDeals(userAddress: string): Promise<Components.ITransaction[]> {
//     return serviceMiddleware.getDeals(userAddress).then((events) => {
//         return Promise.all(events.map((e) => formatDeal(e, userAddress))).then((deals) => {
//             const lasts = Array<Components.ITransaction>()
//             deals.filter(async (d) => d != null)
//                 .sort(sortTxsDesc).forEach((d) => {
//                 if (d && !lasts.find((l) => l.txId == d.txId)) {
//                     lasts.push(d)
//                 }
//             })
//             return lasts
//         })
//     })
//     // const transactions = await Promise.all((await serviceMiddleware.getDeals(userAddress)).map((e) => formatDeal(e, userAddress)));
//     // return transactions
//     //     .filter((e) => e != null)
//     //     .sort((a, b) => b.txTimestamp - a.txTimestamp)
// }

// /**
//  * format a welcomeBonus as ITransaction interface
//  * @param welcomeBonus
//  */
// function formatWelcomeBonus(userId: string, tx: string, ts: Date, amount: number): Notification {
//     return {
//         tx: tx,
//         user: userId,
//         amount: amount,
//         type: "WELCOME_BONUS_RECEIVED",
//         message: "You received " + amount + " tokens in your wallet from Token for Good.",
//         link: '/wallet',
//         ts: ts
//     } as Notification
// }

// /**
//  * format a DB deal as ITransaction interface
//  * @param deal
//  * @param userAddress
//  */
// async function formatDeal(deal: Event, userAddress: string): Promise<Components.ITransaction | null> {
//     const service = await servicesDAO.getByBlockchainId(deal.serviceId.toString())
//     let serviceCategory = null
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     if (service && service?.category?.id) serviceCategory = await serviceCategoriesRepo.get(service.category)
//     const provider = (await formatUser(deal.provider)) || (await formatUser(service?.serviceProvider || '')) || {name: "The service provider"} as Components.ITxUser
//     const buyer = (await formatUser(deal.buyer)) || {name: "The buyer"} as Components.ITxUser
//     const code = getTransactionCode(
//         deal,
//         provider,
//         buyer,
//         userAddress)
//     if (!service) return null
//     const message = await getMessage(code, deal, userAddress, service, buyer, provider)
//     return {
//         txId: deal.dealId,
//         txTimestamp: deal.ts?.valueOf(),
//         txHash: deal.txHash,
//         txStatus: "SUCCESS",
//         txCode: code,
//         txAmount: deal.qty,
//         from: provider,
//         to: buyer,
//         service: {
//             id: service?._id || '',
//             kind: 'Service',
//             name: service?.name || '',
//             audience: service?.audience || '',
//             serviceCategory: {
//                 id: serviceCategory?.id || '',
//                 kind: 'ServiceCategory',
//                 name: serviceCategory?.name || '',
//                 audience: serviceCategory?.audience || '',
//             },
//             // serviceProviderName: service?.serviceProviderName || '',
//         },
//         polygonScanUrl: process.env.POLYGONSCAN_BASEURL + "/tx/" + deal.txHash,
//         notification: {
//             timestamp: deal.ts?.valueOf(),
//             status: "SUCCESS",
//             message: message,
//             link: {
//                 href: "/wallet",
//                 text: "View wallet"
//             }
//         } as Components.INotification
//     } as unknown as Components.ITransaction
// }

// /**
//  * format a DB user as ITxUser interface
//  * @param userAddress
//  */
// async function formatUser(user: string | ObjectId | Identity): Promise<Components.ITxUser | null> {
//     if (typeof user === 'string') {
//         return identitiesDAO.getUserByWallet(user).then((u) => {
//             if (!u) {
//                 console.warn("user not found for wallet " + user)
//                 return null
//             }
//             return formatUser(u)
//         })
//     } else if (user instanceof ObjectId) {
//         return identitiesDAO.getById(user.toHexString()).then((u) => {
//             if (!u) {
//                 console.warn("user not found for ObjectID " + user.toString())
//                 return null
//             }
//             return formatUser(u)
//         })
//     } else if (typeof user === 'object') {
//         return Promise.resolve({
//             id: user.id,
//             role: user.role,
//             name: user.firstname + " " + user.lastname,
//             email: user.email,
//             firstName: user.firstname,
//             lastName: user.lastname,
//             address: user.wallet.address,
//         } as Components.ITxUser)
//     } else {
//         return Promise.resolve(null)
//     }
// }

// /**
//  * get transaction type from blockchain Event
//  * @param event
//  * @param from
//  * @param to
//  * @param userAddress
//  */
// function getTransactionCode(event: Event, from: Components.ITxUser, to: Components.ITxUser, userAddress: string): Components.TransactionCode {
//     if (from.role == 'ALUMNI') {
//         if (event.validated) {
//             if (from.address.toLowerCase() == userAddress) {
//                 return 'SERVICE_PROVIDED';
//             } else {
//                 return 'SERVICE_DELIVERY_CONFIRMED_BY_STUDENT';
//             }
//         } else if (event.cancelled) {
//             return 'SERVICE_DELIVERY_CANCELED_BY_STUDENT';
//         } else {//not validated nor cancelled = pending
//             return 'SERVICE_BOOKED_BY_STUDENT';
//         }
//         // eslint-disable-next-line no-empty
//         // } else if (from.role == 'STUDENT') {
//         //     console.log("ignored", event)
//     } else { //SERVICE_PROVIDER
//         //TODO if (tx.newServiceRegistered) txObject.txreturn 'SERVICE_CREATED_BY_SERVICE_PROVIDER';
//         if (event.validated) {
//             return 'SERVICE_DELIVERY_CONFIRMED_BY_SERVICE_PROVIDER';
//         } else if (event.cancelled) {
//             return 'SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER';
//         } else {
//             // if (to?.address?.toLowerCase() === userAddress) {
//             //     return 'SERVICE_REDEEMED_BY_ALUMNI';
//             // } else {
//             return 'SERVICE_BOOKED_BY_ALUMNI';
//             // }
//         }
//     }
// }

// /**
//  * format string as 'You' if same adress, user's name otherwise
//  * @param userAddress
//  * @param youAddress
//  */
// async function userOrYou(userAddress: string, youAddress: string): Promise<string> {
//     if (userAddress.toLowerCase() === youAddress.toLowerCase()) {
//         return Promise.resolve('You')
//     } else {
//         const b = (await identitiesDAO.getUserByWallet(userAddress)) as Identity
//         return Promise.resolve(b.firstname + " " + b.lastname)
//     }
// }

// /**
//  * get message associated to transaction type
//  * @param code transaction type
//  * @param deal Blockchain event
//  * @param userAddress loggedin user blockchain address
//  * @param service service associated to transaction
//  */
// async function getMessage(code: Components.TransactionCode, deal: Event, userAddress: string, service: DbService, buyer: Components.ITxUser | null, provider: Components.ITxUser | null): Promise<string> {
//     let serviceCategoryName = service?.category
//     if (serviceCategoryName?.length == 24) {//ObjectId
//         serviceCategoryName = (await serviceCategoriesRepo.getById(serviceCategoryName))?.name?.toLowerCase() || ''
//     }
//     const serviceName = service?.name?.toLowerCase()
//     let serviceFullName = ''
//     if (serviceName) {
//         if (serviceCategoryName) {
//             serviceFullName = `: ${serviceCategoryName} - ${serviceName}`
//         } else {
//             serviceFullName = `: ${serviceName}`
//         }
//     }
//     switch (code) {
//         case 'SERVICE_REDEEMED_BY_ALUMNI':
//             return `${await userOrYou(userAddress, deal.buyer)} successfully redeemed a benefit${serviceFullName}. You spent ${deal.qty || '?'} tokens.`;
//         case 'SERVICE_BOOKED_BY_ALUMNI':
//             return `${await userOrYou(userAddress, deal.buyer)} reserved a benefit${serviceFullName}.`;
//             break;
//         case 'SERVICE_BOOKED_BY_STUDENT':
//             if (deal.buyer == userAddress) {
//                 return `You successfully booked a ${serviceName} session with ${provider?.name || ''}.
//           ${provider?.firstName || ''} will contact you to schedule the session.
//           You used ${deal.qty || '?'} tokens.`;
//             } else {
//                 return `${buyer?.name || ''} booked a ${serviceName} session.
//                   You will receive ${deal.qty || '?'} tokens once the ${serviceName} session has taken place. \n
//                   Contact ${buyer?.name || ''} to schedule the session by email.`;
//             }
//         case 'SERVICE_DELIVERY_CANCELED_BY_STUDENT':
//             if (deal.buyer == userAddress) {
//                 return `You successfully canceled a ${serviceName} session with ${provider?.name || ''}.
//             The ${deal.qty || ''} tokens you used for the booking are refunded in your wallet.`;
//             } else {
//                 return `${buyer?.name || ''} canceled the booking for a ${serviceName} session.
//           Contact ${buyer?.firstName || ''} for more info.`;
//             }
//         case 'SERVICE_DELIVERY_CONFIRMED_BY_STUDENT':
//         case 'SERVICE_PROVIDED':
//             if (deal.buyer == userAddress) {
//                 return `You successfully confirmed that a ${serviceName} session with ${provider?.firstName || ''} has taken place.`;
//             } else {
//                 return `${buyer?.name || ''} confirmed that a ${serviceName} session has taken place. You received ${deal.qty || '?'} tokens in your wallet.`;
//             }
//         case 'SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER':
//             if (deal.buyer == userAddress) {
//                 return `Token for Good canceled your benefit${serviceFullName}. The ${deal.qty || '?'} tokens you used are refunded in your wallet.`;
//             } else {
//                 return `Token for Good canceled the benefit${serviceFullName}. The ${deal.qty || '?'} tokens used are refunded in the user's wallet.`;
//             }
//         case 'SERVICE_DELIVERY_CONFIRMED_BY_SERVICE_PROVIDER':
//             if (deal.buyer == userAddress) {
//                 return `Token for Good confirmed your benefit${serviceFullName}.`;
//             } else {
//                 return `Benefit validated${serviceFullName}. Tokens in: ${deal.qty || '?'}.`;
//             }
//         case 'WELCOME_BONUS_RECEIVED':
//             return `${await userOrYou(deal.buyer, userAddress)} received ${deal.qty || '?'} tokens in your wallet from Token for Good.`;
//         case 'SERVICE_CREATED_BY_SERVICE_PROVIDER':
//             return `${await userOrYou(userAddress, deal.provider)} created a new benefit${serviceFullName}.`;
//         default:
//             return ''
//     }
// }
