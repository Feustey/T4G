//! RGB Native Service — module conservé pour compatibilité.
//!
//! Ce module était l'implémentation asynchrone intermédiaire (mockée).
//! Le service principal est désormais `services::rgb::RGBService` qui implémente
//! la validation client-side réelle avec secp256k1 ECDSA + stash persistant.
//!
//! Ce fichier est conservé pour référence mais n'est plus utilisé activement.

pub use crate::services::rgb::{ProofDetails, RGBError, RGBService as RGBNativeService, TransferRecord};
