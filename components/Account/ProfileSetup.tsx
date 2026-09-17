import React, { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface ProfileSetupFormProps {
  onProfileUpdate: () => void | null;
};

export default function ProfileSetupForm({ onProfileUpdate }: ProfileSetupFormProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // const [inventoryItems, setInventoryItems] = useState<{ item: number }[] | null>(null);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", session?.user?.id)
        .single();

      if (!ignore && data) {
        setUsername(data.username || "");
        setFirstName(data.full_name || "");
        setAvatarPreview(data.avatar_url || null);
      } else if (error) {
        console.warn(error.message);
      }

      setLoading(false);
    }

    if (session?.user?.id) {
      getProfile();
    }

    return () => {
      ignore = true;
    };
  }, [session, supabase]);

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
    if (!username || !session?.user?.email) {
      setError("Username and email are required.");
      return;
    }

    setLoading(true);
    setError(null);

    // Ensure inventory contains items 23 and 24
    // if (inventoryItems) {
    //   const existingItems = inventoryItems.map((item) => item.item);
    //   const itemsToAdd = [23, 24].filter((item) => !existingItems.includes(item)).map((item) => ({
    //     item,
    //     owner: session.user.id,
    //     anomay: activePlanet?.id,
    //     quantity: 1,
    //     time_of_deploy: new Date(),
    //   }));

    //   if (itemsToAdd.length > 0) {
    //     const { error: insertError } = await supabase.from("inventory").insert(itemsToAdd);
    //     if (insertError) {
    //       setError(insertError.message);
    //       setLoading(false);
    //       return;
    //     }
    //   }
    // }

    let avatar_url = avatarPreview;

    if (avatar) {
      const fileName = `${Date.now()}-${session.user.id}-avatar.png`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatar, {
          contentType: avatar.type,
        });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data?.path}`;
    }

    const updates = {
      id: session.user.id,
      username,
      full_name: firstName,
      avatar_url,
      updated_at: new Date(),
    };

    const { error: updateError } = await supabase.from("profiles").upsert(updates);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push("/");
      onProfileUpdate?.();
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D2833] p-4 bg-[url('/game-background.jpg')] bg-cover bg-center">
      <div className="bg-[#2C4F64]/90 p-8 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-sm border border-[#5FCBC3]/30 transform hover:scale-105 transition-all duration-300">
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
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <Image
                    src="/placeholder.svg"
                    alt="Default avatar"
                    layout="fill"
                    objectFit="cover"
                  />
                )}
              </div>
              <input
                type="file"
                id="avatar"
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
            disabled={loading}
            className="w-full py-4 bg-[#FF695D] text-[#FFE3BA] rounded-xl font-bold hover:bg-[#5FCBC3] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {loading ? "Saving..." : "Update your profile"}
          </button>
        </form>
      </div>
    </div>
  );
};