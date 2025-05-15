import { Navbar } from "+/application/navbar";
import { SettingSection } from "+/application/settings/settings-section";
import { Preview } from "+/application/preview";
import { Head } from "@/layouts/head";
import { useState, useEffect } from "react";
import axios from "axios";
import router from "next/router";
import { ProfileDataProps } from ".";
import { createClient } from "@/utils/supabase/components";
import { HeaderCardProps } from "+/application/links/links-card";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/utils/state/actions/userActions";

export default function Settings() {
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileDataProps>({
    bio: "",
    avatar: "",
    avatarUrl: "",
    profileTitle: "",
    username: "",
    userID: "",
  });
  const [content, setContent] = useState<HeaderCardProps[]>([]);
  const [userID, setUserID] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("default"); // Added state
  const supabase = createClient();
  const dispatch = useDispatch();

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

  // Load saved template preference
  useEffect(() => {
    const loadTemplatePreference = async () => {
      if (!userID) return;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("template")
          .eq("id", userID)
          .single();

        if (!error && data?.template) {
          setSelectedTemplate(data.template);
        }
      } catch (error) {
        console.error("Error loading template preference:", error);
      }
    };

    loadTemplatePreference();
  }, [userID, supabase]);

  // Save template preference
  const handleTemplateChange = async (template: string) => {
    setSelectedTemplate(template);
    if (!userID) return;
    try {
      const { error } = await supabase
        .from("users")
        .update({ template })
        .eq("id", userID);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving template preference:", error);
    }
  };

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

    // Subscribe to real-time updates
    const channel = supabase
      .channel('header_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'headers',
          filter: `user_id=eq.${userID}`,
        },
        async () => {
          try {
            const { data, error } = await supabase
              .from("headers")
              .select("*")
              .eq("user_id", userID)
              .order("position", { ascending: true });

            if (error) {
              console.error("Error fetching headers in subscription:", error);
              return;
            }

            if (!data) {
              console.warn("No header data received in subscription");
              return;
            }

            const formattedHeaders = data.map(header => ({
              id: header.id,
              header: header.title || "",
              active: header.active || false,
              link: header.is_link || false,
              position: header.position || 0
            }));

            setContent(formattedHeaders);
          } catch (error) {
            console.error("Error in header subscription handler:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          let publicUrl = '';
          if (data.profile_pic_url) {
            const { data: storageData } = await supabase.storage
              .from("avatars")
              .getPublicUrl(data.profile_pic_url.replace('avatars/', ''));
            publicUrl = storageData?.publicUrl || '';
          }

          const newProfileData: ProfileDataProps = { 
            bio: data.bio || "", 
            profileTitle: data.fullname || "", 
            avatar: data.profile_pic_url || "",
            username: data.username || "",
            avatarUrl: publicUrl,
            userID: userID
          };

          setProfileData(newProfileData);
          dispatch(updateUserInfo({
            bio: newProfileData.bio,
            profileTitle: newProfileData.profileTitle,
            profilePic: publicUrl,
            username: newProfileData.username
          }));
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
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userID}`,
        },
        async (payload) => {
          try {
            if (!payload?.new) {
              console.warn('Received real-time update without new data');
              return;
            }

            const newData = payload.new;
            let publicUrl = '';
            
            if (newData && 'profile_pic_url' in newData && typeof newData.profile_pic_url === 'string') {
              try {
                const { data: storageData } = await supabase.storage
                  .from("avatars")
                  .getPublicUrl(newData.profile_pic_url.replace('avatars/', ''));
                publicUrl = storageData?.publicUrl || '';
              } catch (storageError) {
                console.error("Error getting public URL:", storageError);
              }
            }

            const newProfileData: ProfileDataProps = {
              bio: (newData as { bio?: string })?.bio || "",
              profileTitle: (newData as { fullname?: string })?.fullname || "",
              avatar: (newData as { profile_pic_url?: string })?.profile_pic_url || "",
              username: (newData as { username?: string })?.username || "",
              avatarUrl: publicUrl,
              userID: userID
            };

            setProfileData(newProfileData);
            dispatch(updateUserInfo({
              bio: newProfileData.bio,
              profileTitle: newProfileData.profileTitle,
              profilePic: publicUrl,
              username: newProfileData.username
            }));

            if (newData && 'template' in newData && typeof newData.template === 'string') {
              setSelectedTemplate(newData.template);
            }
          } catch (error) {
            console.error("Error processing real-time update:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-secondary rounded-full border-t-transparent"></div>
          <p className="text-default-500">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head icon="logo-alt" title="Twiggle Admin" />
      <Navbar option="Settings" userID={userID} profileData={profileData} />
      <div className="flex">
        <SettingSection
          userID={userID}
          content={content}
          profileData={profileData}
          selectedTemplate={selectedTemplate} // Pass selectedTemplate
        />
        {isWideScreen && (
          <Preview 
            content={content} 
            profileData={profileData} 
            userID={userID}
            selectedTemplate={selectedTemplate} // Pass selectedTemplate
            onTemplateChange={handleTemplateChange} // Pass handler
          />
        )}
      </div>
    </>
  );
}
