import { Head } from "@/layouts/head";
import { MarketplaceSection } from "+/application/marketplace/marketplace-section";
import { Navbar } from "+/application/navbar";
import { createClient } from "@/utils/supabase/components";
import { useState, useEffect } from "react";
import { ProfileDataProps } from "@/pages/admin";

export default function Marketplace() {
  const [profileData, setProfileData] = useState<ProfileDataProps>({
    bio: "",
    avatar: "",
    avatarUrl: "",
    profileTitle: "",
    username: "",
  } as ProfileDataProps);
  const [userID, setUserID] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }
        setUserID(user.id);

        // Fetch user profile data
        const { data: profileData, error } = await supabase
          .from("users")
          .select()
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          const avatarUrl = profileData.profile_pic_url 
            ? `https://qjpqmdezsulsnwjblvsl.supabase.co/storage/v1/object/public/${profileData.profile_pic_url}`
            : "";
            
          setProfileData({
            bio: profileData.bio ?? "",
            avatar: profileData.profile_pic_url ?? "",
            avatarUrl,
            profileTitle: profileData.fullname ?? "",
            username: profileData.username ?? "",
            userID: user.id // Add the userID from the authenticated user
          });
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoggedIn();
  }, [supabase]);

  return (
    <>
      <Head icon="logo-alt" title="Marketplace | Twiggle" />
      <Navbar option="Marketplace" userID={userID} profileData={profileData} />
      <MarketplaceSection userID={userID} />
    </>
  );
}