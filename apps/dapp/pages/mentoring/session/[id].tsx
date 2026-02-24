import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import ConnectedLayout from '../../../layouts/ConnectedLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthPageType, LangType } from '../../../types';
import { apiClient, MentoringBooking, MentoringOffer } from '../../../services/apiClient';

// ── Types locaux ────────────────────────────────────────────────────────────

interface IPage {
  lang: LangType;
}

interface SessionData {
  booking: MentoringBooking;
  offer: MentoringOffer;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:            { label: 'En attente de confirmation', color: 'yellow' },
  confirmed:          { label: 'Confirmée',                  color: 'blue'   },
  pending_completion: { label: 'En attente de complétion',   color: 'orange' },
  completed:          { label: 'Complétée',                  color: 'green'  },
  auto_completed:     { label: 'Auto-complétée (48h)',        color: 'green'  },
  disputed:           { label: 'Litige ouvert',              color: 'red'    },
  cancelled:          { label: 'Annulée',                    color: 'gray'   },
};

const LEVEL_LABELS: Record<string, string> = {
  beginner:     'Débutant',
  intermediate: 'Intermédiaire',
  advanced:     'Avancé',
};

const FORMAT_LABELS: Record<string, string> = {
  video: 'Visioconférence',
  text:  'Échange écrit',
  async: 'Asynchrone',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`text-2xl transition-colors ${
            n <= value
              ? 'text-yellow-400'
              : 'text-gray-300 hover:text-yellow-200'
          } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const SessionDetailPage: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulaire de complétion
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [learnedSkills, setLearnedSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Formulaire de litige
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    loadSession(id);
  }, [id]);

  async function loadSession(bookingId: string) {
    setLoading(true);
    setError(null);
    try {
      // On charge le booking + l'offre en parallèle
      const booking = await apiClient.getMentoringBooking(bookingId);
      const offer   = await apiClient.getMentoringOffer(booking.offer_id);
      setSession({ booking, offer });
    } catch {
      setError('Session introuvable ou accès non autorisé.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!session || !id || typeof id !== 'string') return;
    setSubmitting(true);
    try {
      const updated = await apiClient.confirmMentoringBooking(id, {
        rating,
        comment: comment.trim() || undefined,
        learned_skills: learnedSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSession((prev) => prev ? { ...prev, booking: updated } : null);
      setShowCompletionForm(false);
      setConfirmSuccess(true);
    } catch {
      setError('Erreur lors de la confirmation. Réessaie dans quelques instants.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDispute() {
    if (!session || !id || typeof id !== 'string') return;
    if (!disputeReason.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.disputeMentoringBooking(id);
      setSession((prev) =>
        prev ? { ...prev, booking: { ...prev.booking, status: 'disputed' } } : null
      );
      setShowDisputeForm(false);
    } catch {
      setError('Erreur lors de l\'ouverture du litige.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;
  if (loading) return (
    <ConnectedLayout user={user} lang={lang}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    </ConnectedLayout>
  );

  if (error && !session) return (
    <ConnectedLayout user={user} lang={lang}>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-gray-500 underline"
        >
          Retour
        </button>
      </div>
    </ConnectedLayout>
  );

  if (!session) return null;

  const { booking, offer } = session;
  const isMentee  = booking.mentee_id === user.id;
  const isMentor  = offer.mentor_id   === user.id;

  const myConfirmed     = isMentee ? booking.mentee_confirmed : booking.mentor_confirmed;
  const otherConfirmed  = isMentee ? booking.mentor_confirmed : booking.mentee_confirmed;

  const canConfirm =
    !myConfirmed &&
    (booking.status === 'confirmed' ||
     booking.status === 'pending_completion') &&
    (isMentee || isMentor);

  const canDispute =
    isMentee &&
    booking.status !== 'disputed' &&
    booking.status !== 'completed' &&
    booking.status !== 'cancelled';

  const isCompleted =
    booking.status === 'completed' || booking.status === 'auto_completed';

  const statusInfo = STATUS_LABELS[booking.status] ?? {
    label: booking.status,
    color: 'gray',
  };

  const statusColorClass: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue:   'bg-blue-100 text-blue-800 border-blue-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    green:  'bg-green-100 text-green-800 border-green-200',
    red:    'bg-red-100 text-red-800 border-red-200',
    gray:   'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <>
      <Head>
        <title>Session de mentoring — Token4Good</title>
      </Head>
      <ConnectedLayout user={user} lang={lang}>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

          {/* Navigation */}
          <button
            onClick={() => router.push('/mentoring/my-sessions')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            ← Mes sessions
          </button>

          {/* En-tête */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {isMentee ? 'Tu es mentee' : 'Tu es mentor'}
                </p>
                <h1 className="text-xl font-bold text-gray-900">
                  {offer.topic_slug.replace(/-/g, ' ')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {LEVEL_LABELS[offer.target_level] ?? offer.target_level} ·{' '}
                  {offer.duration_minutes} min · {FORMAT_LABELS[offer.format] ?? offer.format}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full border ${
                  statusColorClass[statusInfo.color]
                }`}
              >
                {statusInfo.label}
              </span>
            </div>

            {/* Date */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">📅</span>
              {formatDate(booking.scheduled_at)}
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {booking.notes}
              </div>
            )}
          </div>

          {/* Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-orange-600 font-medium mb-1">Séquestre</p>
              <p className="text-2xl font-bold text-orange-600">
                {booking.tokens_escrowed} <span className="text-sm">T4G</span>
              </p>
            </div>
            {isCompleted && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1">
                  {isMentor ? 'T4G reçus' : 'Bonus reçus'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {isMentor
                    ? (booking.tokens_awarded_mentor ?? 0)
                    : (booking.tokens_awarded_mentee ?? 0)}{' '}
                  <span className="text-sm">T4G</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirmations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Confirmations de complétion
            </h2>
            <div className="flex gap-6">
              {[
                { label: 'Mentor', confirmed: booking.mentor_confirmed },
                { label: 'Mentee', confirmed: booking.mentee_confirmed },
              ].map(({ label, confirmed }) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      confirmed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {confirmed ? '✓' : '–'}
                  </span>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
            {!myConfirmed && (isMentee || isMentor) && !isCompleted && (
              <p className="mt-3 text-xs text-gray-400">
                {otherConfirmed
                  ? 'L\'autre participant a déjà confirmé. Ta confirmation déclenche la libération des tokens.'
                  : 'Les tokens seront libérés dès que les deux parties ont confirmé.'}
              </p>
            )}
          </div>

          {/* Évaluation (si complétée) */}
          {isCompleted && (booking.mentee_rating || booking.mentor_rating) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Évaluations
              </h2>
              {booking.mentee_rating && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Note du mentee</p>
                  <StarRating value={booking.mentee_rating} readonly />
                  {booking.mentee_comment && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      &ldquo;{booking.mentee_comment}&rdquo;
                    </p>
                  )}
                </div>
              )}
              {booking.mentor_rating && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Note du mentor</p>
                  <StarRating value={booking.mentor_rating} readonly />
                  {booking.mentor_comment && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      &ldquo;{booking.mentor_comment}&rdquo;
                    </p>
                  )}
                </div>
              )}
              {booking.learned_skills && booking.learned_skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Compétences acquises</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.learned_skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Proof RGB */}
          {isCompleted && booking.rgb_contract_id && (
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔐</span>
                <h2 className="text-sm font-semibold">Preuve RGB on-chain</h2>
              </div>
              <p className="text-xs text-gray-400 mb-1">Contract ID</p>
              <code className="text-xs text-green-400 break-all block">
                {booking.rgb_contract_id}
              </code>
            </div>
          )}

          {/* Succès confirmation */}
          {confirmSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800 font-medium">
                ✓ Confirmation envoyée !{' '}
                {booking.status === 'completed'
                  ? 'La session est complétée et les tokens ont été libérés.'
                  : 'En attente de la confirmation de l\'autre participant.'}
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* CTA — Confirmer la complétion */}
          {canConfirm && !showCompletionForm && (
            <button
              onClick={() => setShowCompletionForm(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Confirmer la complétion de la session
            </button>
          )}

          {/* Formulaire de complétion */}
          {showCompletionForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">Évaluation de la session</h2>

              {/* Note (uniquement pour le mentee) */}
              {isMentee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note de la session
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
              )}

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire {isMentee ? '(facultatif)' : '(facultatif)'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Décris ton expérience…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              {/* Compétences acquises (uniquement mentee) */}
              {isMentee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compétences acquises{' '}
                    <span className="text-gray-400 font-normal">(séparées par des virgules)</span>
                  </label>
                  <input
                    type="text"
                    value={learnedSkills}
                    onChange={(e) => setLearnedSkills(e.target.value)}
                    placeholder="ex: lightning-channels, bitcoin-fees"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Envoi…' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setShowCompletionForm(false)}
                  className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* CTA — Ouvrir un litige */}
          {canDispute && !showDisputeForm && (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="w-full text-red-500 border border-red-200 hover:bg-red-50 font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              Signaler un problème
            </button>
          )}

          {/* Formulaire de litige */}
          {showDisputeForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Signaler un problème</h2>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
                placeholder="Décris le problème rencontré…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDispute}
                  disabled={!disputeReason.trim() || submitting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {submitting ? 'Envoi…' : 'Soumettre le litige'}
                </button>
                <button
                  onClick={() => setShowDisputeForm(false)}
                  className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

        </div>
      </ConnectedLayout>
    </>
  );
}

SessionDetailPage.role = ['alumni', 'mentee', 'mentor', 'service_provider', 'admin'];

export default SessionDetailPage;
