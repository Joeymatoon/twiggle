import { HeaderCardProps } from "+/application/links/links-card";
import { LinksSection } from "+/application/links/links-section";
import { Navbar } from "+/application/navbar";
import { Preview } from "+/application/preview";
import { Head } from "@/layouts/head";
import { createClient } from "@/utils/supabase/components";
import axios from "axios";
import router from "next/router";
import { useState, useEffect } from "react";

export interface ProfileDataProps {
  bio: string;
  avatar: string;
  avatarUrl: string;
  profileTitle: string;
  username: string;
  userID: string;
}

export default function AdminPage() {
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [userData, setUserData] = useState();
  const [profileData, setProfileData] = useState<ProfileDataProps>({
    bio: "",
    avatar: "",
    avatarUrl: "",
    profileTitle: "",
    username: "",
    userID: "",
  });
  const [userID, setUserID] = useState("");
  const [content, setContent] = useState<HeaderCardProps[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("default"); // Added state
  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768);
    };
    // Set initial value on component mount
    handleResize();
    // Add event listener to update state when window is resized
    window.addEventListener("resize", handleResize);
    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get("/api/login/check");
        if (response.data.session === null) {
          router.push("/login");
        } else {
          setUserID(response.data.session.id);
          const { data, error } = await supabase
            .from("users")
            .select()
            .eq("id", response.data.session.id);

          if (error) {
            console.error("Error fetching user data in links navbar", error);
          } else {
            setUserData(data?.[0]);
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoggedIn();
  }, [supabase]); // Run once when component mounts

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
    // Fetch user data when the component mounts
    const fetchHeaderData = async () => {
      try {
        const { data, error } = await supabase
          .from("headers")
          .select()
          .eq("user_id", userID)
          .order('position', { ascending: true }); // Add ordering by position

        if (error) {
          console.error("Error fetching user header:", error);
        } else {
          // Clear existing content before adding new
          setContent([]);
          // Add all headers at once instead of one by one
          const formattedContent = data.map(content => ({
            header: content.content,
            id: content.header_id,
            active: content.active,
            link: content.isLink,
          }));
          setContent(formattedContent);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userID) {
      fetchHeaderData();
    }
  }, [supabase, userID]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("id", userID);

        if (data && data.length > 0) {
          setProfileData((prevInputs: any) => ({
            ...prevInputs,
            bio: data[0].bio || "",
            profileTitle: data[0].fullname,
            avatar: data[0].profile_pic_url,
            username: data[0].username,
            avatarUrl:
              data[0].profile_pic_url === null
                ? ""
                : `${process.env.NEXT_PUBLIC_SUPABASE_DB_URL}/storage/v1/object/public/${data[0].profile_pic_url}`,
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [supabase, userID]);

  return (
    <div>
      <Head icon="logo-alt" title="Twiggle Admin" />
      <Navbar option="Links" userID={userID} profileData={profileData} />
      <div className="flex">
        <LinksSection
          userID={userID}
          content={content}
          setContentState={setContent}
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
    </div>
  );
}
