import { usePageData } from "@/hooks/usePageData";

export default function OnboardingTab() {
  const { classifications } = usePageData();

  return (
    <div className="space-y-6 text-center py-12">
      <h2 className="text-2xl font-bold text-white">Welcome to Star Sailors!</h2>
      <p className="text-gray-300 max-w-2xl mx-auto">
        This tab is for onboarding content. Check the <strong>Updates</strong> tab to get started with your first mission, 
        view your progress, and track your achievements!
      </p>
      {classifications.length === 0 && (
        <p className="text-[#78cce2] text-sm">
          👉 Click on the <strong>Updates</strong> tab to begin your journey
        </p>
      )}
    </div>
  );
}
