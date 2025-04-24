import { Avatar, Button } from "@nextui-org/react";
import { HeaderCardProps } from "../links/links-card";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import axios from "axios";
import { ProfileDataProps } from "@/pages/admin";
import { createClient } from "@/utils/supabase/components";

// Remove unused createClient import and fetchHeaders function since we're getting content from props

interface PreviewContentProps {
  profileData: ProfileDataProps;
  content: HeaderCardProps[];
}

export const PreviewContent: React.FC<PreviewContentProps> = ({
  profileData,
  content,
}) => {
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

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
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-default-50 to-default-100">
      {/* Profile Section */}
      <div className="w-full flex flex-col items-center pt-8 pb-4 animate-fade-in">
        {profileData.avatarUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300">
            <img
              src={profileData.avatarUrl}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <h1 className="text-xl font-bold mb-2 animate-slide-up">{profileData.profileTitle || 'Add your name'}</h1>
        <p className="text-default-600 text-center px-4 mb-4 animate-slide-up delay-100 max-w-md">
          {userData?.bio || profileData.bio || 'Add your bio'}
        </p>
      </div>

      {/* Links Section */}
      <div className="w-full px-4 space-y-4 mb-8 animate-slide-up delay-300">
        {content.map((item, index) => (
          <div key={item.id}>
            {item.link ? (
              <a
                href={item.header}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="ri-link text-default-400" />
                    <span className="font-medium">{item.header || 'Add a link'}</span>
                  </div>
                  <i className="ri-external-link-line text-default-400" />
                </div>
              </a>
            ) : (
              <div className="w-full flex items-center justify-center p-4">
                <span className="font-medium">{item.header || 'Add a header'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="w-full px-4 py-6 text-center text-default-500 text-sm animate-fade-in delay-500">
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
