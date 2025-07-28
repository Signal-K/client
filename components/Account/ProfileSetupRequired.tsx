"use client";

interface ProfileSetupRequiredProps {
  onOpenProfileModal: () => void;
}

export default function ProfileSetupRequired({ onOpenProfileModal }: ProfileSetupRequiredProps) {
  return (
    <section className="rounded-2xl p-6 border shadow space-y-4 text-center bg-background/30 backdrop-blur-sm border-[#78cce2]/30 text-card-foreground">
      <h3 className="text-xl font-semibold text-primary">
        ⚠️ Action Required: Complete Your Profile
      </h3>
      <p className="text-sm text-muted-foreground">
        You're missing out on key features! Complete your profile to unlock:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <span className="text-2xl">🏗️</span>
          <p className="text-sm font-medium">Structures</p>
          <p className="text-xs text-muted-foreground">Deploy telescopes & satellites</p>
        </div>
        <div className="text-center">
          <span className="text-2xl">🔬</span>
          <p className="text-sm font-medium">Research Tree</p>
          <p className="text-xs text-muted-foreground">Unlock new capabilities</p>
        </div>
        <div className="text-center">
          <span className="text-2xl">👥</span>
          <p className="text-sm font-medium">Social Features</p>
          <p className="text-xs text-muted-foreground">Referrals & collaboration</p>
        </div>
      </div>
      <button
        onClick={onOpenProfileModal}
        className="mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
      >
        Complete Your Profile Now
      </button>
    </section>
  );
}
