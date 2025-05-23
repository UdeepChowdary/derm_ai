import { useState, useEffect } from 'react';

export const ConsentModal = ({ onConsent }: { onConsent: (allowed: boolean) => void }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background p-6 rounded-lg max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Data Usage Consent</h2>
        <p className="text-sm text-muted-foreground">
          To provide accurate analysis, we process your image using our AI system. 
          Your data will be anonymized and not stored after analysis.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => {
              onConsent(false);
              setOpen(false);
            }}
            className="px-4 py-2 text-sm hover:bg-accent rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConsent(true);
              setOpen(false);
            }}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};