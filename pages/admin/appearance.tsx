import { AppearanceSection } from "+/application/appearance/appearance-section";
import { Navbar } from "+/application/navbar";
import { Preview } from "+/application/preview";
import { Head } from "@/layouts/head";
import axios from "axios";
import router from "next/router";
import { useState, useEffect } from "react";
import { ProfileDataProps } from ".";
import { createClient } from "@/utils/supabase/components";
import { HeaderCardProps } from "+/application/links/links-card";

export default function Appearance() {
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileDataProps>({
    bio: "",
    avatar: "",
    avatarUrl: "",
    profileTitle: "",
    username: "",
    userID: ""
  });
  const [content, setContent] = useState<HeaderCardProps[]>([]);
  const [userID, setUserID] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get("/api/login/check");
        if (response.data.session === null) {
          router.push("/login");
        } else {
          setUserID(response.data.session.id);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        router.push("/login");
      }
    };

    checkLoggedIn();
  }, []);

  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!userID) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("headers")
          .select("*")
          .eq("user_id", userID)
          .order("position", { ascending: true });

        if (error) throw error;

        const formattedHeaders = data.map(header => ({
          id: header.id,
          header: header.title || "",
          active: header.active || false,
          link: header.is_link || false,
          position: header.position || 0
        }));

        setContent(formattedHeaders);
      } catch (error) {
        console.error("Error fetching headers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderData();
  }, [supabase, userID]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("id", userID)
          .single();

        if (error) throw error;

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.profile_pic_url?.replace('avatars/', '') || '');

          setProfileData({
            bio: data.bio || "",
            profileTitle: data.fullname || "",
            avatar: data.profile_pic_url || "",
            username: data.username || "",
            avatarUrl: publicUrl,
            userID: userID
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userID}`,
        },
        (payload: any) => {
          const newData = payload.new;
          const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(newData.profile_pic_url?.replace('avatars/', '') || '');

          setProfileData({
            bio: newData.bio || "",
            profileTitle: newData.fullname || "",
            avatar: newData.profile_pic_url || "",
            username: newData.username || "",
            avatarUrl: publicUrl,
            userID: userID
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-secondary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head icon="logo-alt" title="Twiggle Admin" />
      <Navbar option="Appearance" userID={userID} profileData={profileData} />
      <div className="flex">
        <AppearanceSection
          userID={userID}
          content={content}
          profileData={profileData}
        />
        {isWideScreen && (
          <Preview content={content} profileData={profileData} />
        )}
      </div>
    </>
  );
}
