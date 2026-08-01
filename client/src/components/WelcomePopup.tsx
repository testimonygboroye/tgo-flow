import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

const STORAGE_KEY = 'tgo-flow-onboarding-seen';

export function WelcomePopup() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'closed' | 'asking' | 'confirming'>('closed');

  useEffect(() => {
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (!alreadySeen) {
      setStage('asking');
    }
  }, []);

  function markSeen() {
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  function handleWantsHelp() {
    markSeen();
    setStage('closed');
    navigate('/help');
  }

  function handleNoThanks() {
    setStage('confirming');
  }

  function handleFinalOkay() {
    markSeen();
    setStage('closed');
  }

  if (stage === 'closed') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          <Logo className="h-10 w-10" />
        </div>

        {stage === 'asking' && (
          <>
            <h2 className="font-display text-lg font-bold text-text-primary">Welcome to TGO Flow! 👋</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Would you like a quick look at the Help Guide before you get started?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleNoThanks}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-hover"
              >
                No thanks
              </button>
              <button
                onClick={handleWantsHelp}
                className="flex-1 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                Show me
              </button>
            </div>
          </>
        )}

        {stage === 'confirming' && (
          <>
            <h2 className="font-display text-lg font-bold text-text-primary">No problem!</h2>
            <p className="mt-2 text-sm text-text-secondary">
              You can find the Help Guide anytime by clicking the <strong>?</strong> icon at the top of any page.
            </p>
            <button
              onClick={handleFinalOkay}
              className="mt-5 w-full rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Okay, got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
