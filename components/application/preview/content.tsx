import { Avatar, Button } from "@nextui-org/react";
import { HeaderCardProps } from "../links/links-card";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import axios from "axios";
import { ProfileDataProps } from "@/pages/admin";
import { createClient } from "@/utils/supabase/components";
import { templates, TemplateType } from "@/config/templates";

// Remove unused createClient import and fetchHeaders function since we're getting content from props

interface PreviewContentProps {
  profileData: ProfileDataProps;
  content: HeaderCardProps[];
  template?: string;
}

export const PreviewContent: React.FC<PreviewContentProps> = ({
  profileData,
  content,
  template = "default"
}) => {
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();
  const currentTemplate = templates[template] || templates.default;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", profileData.userID)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (profileData.userID) {
      fetchUserData();
    }
  }, [profileData.userID, supabase]);

  const validateUrl = (url: string) => {
    const pattern = /^(https?:\/\/)/i;
    return pattern.test(url) ? url : `http://${url}`;
  };

  return (
    <div className={`flex flex-col items-center w-full min-h-screen ${currentTemplate.styles.background}`}>
      {/* Profile Section */}
      <div className="w-full flex flex-col items-center pt-8 pb-4 animate-fade-in">
        {profileData.avatarUrl && (
          <div className={currentTemplate.styles.avatarStyle}>
            <img
              src={profileData.avatarUrl}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <h1 className={currentTemplate.styles.headerStyle}>{profileData.profileTitle || 'Add your name'}</h1>
        <p className={currentTemplate.styles.bioStyle}>
          {userData?.bio || profileData.bio || 'Add your bio'}
        </p>
      </div>

      {/* Links Section */}
      <div className="w-full px-4 space-y-4 mb-8 animate-slide-up delay-300">
        {content.map((item, index) => (
          <div key={item.id}>
            {item.link ? (
              <a
                href={validateUrl(item.header)}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full ${currentTemplate.styles.cardStyle}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={currentTemplate.styles.linkStyle}>
                  <div className="flex items-center gap-3">
                    <i className="ri-link text-default-400" />
                    <span className="font-medium">{item.header || 'Add a link'}</span>
                  </div>
                  <i className="ri-external-link-line text-default-400" />
                </div>
              </a>
            ) : (
              <div className={`w-full flex items-center justify-center p-4 ${currentTemplate.styles.cardStyle}`}>
                <span className="font-medium">{item.header || 'Add a header'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`w-full px-4 py-6 text-center ${currentTemplate.styles.footerStyle} animate-fade-in delay-500`}>
        <p>Powered by Twiggle</p>
      </div>
    </div>
  );
};

// Keep AsyncHeaderTitle component as is, but move validateUrl inside the component
const AsyncHeaderTitle: React.FC<{ link: string }> = ({ link }) => {
  const [title, setTitle] = useState<string>("");

  const validateUrl = (url: string) => {
    const pattern = /^(https?:\/\/)/i;
    return pattern.test(url) ? url : `http://${url}`;
  };

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const response = await axios.get(
          `/api/metadata?url=${encodeURIComponent(validateUrl(link))}`
        );
        if (response.data.title) {
          setTitle(response.data.title);
          return;
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
      setTitle(link);
    };

    fetchTitle();
  }, [link]);

  return <>{title || link}</>;
};
