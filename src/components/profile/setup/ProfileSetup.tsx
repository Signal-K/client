import React, { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentProfileAction, updateProfileSetupAction } from "./actions";

interface ProfileSetupFormProps {
  onProfileUpdate: () => void | null;
  embedded?: boolean;
  redirectOnSuccess?: boolean;
};

export default function ProfileSetupForm({
  onProfileUpdate,
  embedded = false,
  redirectOnSuccess = true,
}: ProfileSetupFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // const [inventoryItems, setInventoryItems] = useState<{ item: number }[] | null>(null);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const result = await getCurrentProfileAction();

      if (!ignore && result.ok && result.data) {
        setUsername(result.data.username || "");
        setFirstName(result.data.full_name || "");
        setAvatarPreview(result.data.avatar_url || null);
      } else if (!result.ok) {
        console.warn(result.error);
      }

      setLoading(false);
      setInitialLoaded(true);
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, []);

  // useEffect(() => {
  //   async function fetchInventory() {
  //     if (!session?.user?.id) return;

  //     const { data, error } = await supabase
  //       .from("inventory")
  //       .select("item")
  //       .eq("owner", session.user.id)
  //       .in("item", [23, 24]);

  //     if (error) {
  //       console.warn(error);
  //     } else {
  //       setInventoryItems(data);
  //     }
  //   }

  //   fetchInventory();
  // }, [session, supabase]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function updateProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!username) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("username", username);
    formData.set("firstName", firstName);
    // Only send existingAvatarPreview if it's a real storage URL (not a data URL)
    if (avatarPreview && !avatarPreview.startsWith('data:')) {
      formData.set("existingAvatarPreview", avatarPreview);
    }
    if (avatar) {
      formData.set("avatar", avatar);
    }

    const result = await updateProfileSetupAction(formData);

    if (!result.ok) {
      setError(result.error);
    } else {
      if (redirectOnSuccess) {
        router.push("/game");
      } else {
        setSuccess("Profile updated successfully.");
      }
      onProfileUpdate?.();
    }

    setLoading(false);
  }

  if (!initialLoaded) {
    if (embedded) {
      return (
        <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-6">
          <p className="text-cyan-100/85 text-center">Loading profile…</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1D2833] p-4 bg-[url('/game-background.jpg')] bg-cover bg-center">
        <div className="bg-[#2C4F64]/90 p-8 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-sm border border-[#5FCBC3]/30">
          <p className="text-[#FFE3BA] text-center">Loading profile…</p>
        </div>
      </div>
    );
  }

  const formPanel = (
    <div
      className={`p-8 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-sm border border-[#5FCBC3]/30 transition-all duration-300 ${
        embedded
          ? "bg-gradient-to-br from-slate-900/90 via-cyan-950/75 to-indigo-950/75 hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
          : "bg-[#2C4F64]/90 transform hover:scale-105"
      }`}
    >
        <h1 className="text-4xl font-bold text-[#FFE3BA] mb-8 text-center tracking-wide">
          My Profile
        </h1>
        <form onSubmit={updateProfile} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-[#5FCBC3] mb-2 font-semibold">
              Username
            </label>
            <input
              type="text"
              id="username"
              data-testid="profile-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#74859A]/50 text-[#FFE3BA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF695D] placeholder-[#FFE3BA]/50"
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-[#5FCBC3] mb-2 font-semibold">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              data-testid="profile-firstname-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-[#74859A]/50 text-[#FFE3BA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF695D] placeholder-[#FFE3BA]/50"
              required
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-[#5FCBC3] mb-2 font-semibold">
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#74859A]/50 border-4 border-[#5FCBC3] shadow-lg">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Image
                    src="/placeholder.svg"
                    alt="Default avatar"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                )}
              </div>
              <input
                type="file"
                id="avatar"
                name="avatar"
                data-testid="profile-avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar"
                className="px-4 py-2 bg-[#5FCBC3] text-[#1D2833] rounded-xl cursor-pointer hover:bg-[#FF695D] transition-colors duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                Choose Avatar
              </label>
            </div>
          </div>
          <button
            type="submit"
            data-testid="profile-save-button"
            disabled={loading}
            className="w-full py-4 bg-[#FF695D] text-[#FFE3BA] rounded-xl font-bold hover:bg-[#5FCBC3] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {loading ? "Saving..." : "Update your profile"}
          </button>
          {success && <p className="text-emerald-300 text-sm text-center">{success}</p>}
          {error && <p className="text-rose-300 text-sm text-center">{error}</p>}
        </form>
      </div>
  );

  if (embedded) {
    return formPanel;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D2833] p-4 bg-[url('/game-background.jpg')] bg-cover bg-center">
      {formPanel}
    </div>
  );
};
