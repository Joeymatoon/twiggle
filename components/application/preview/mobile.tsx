import { Modal, ModalContent, ModalBody } from "@nextui-org/react";
import { PreviewContent } from "./content";
import { HeaderCardProps } from "../links/links-card";
import { ProfileDataProps } from "@/pages/admin";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/components";
import { socials } from "@/config/social-icons";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
  userID: string;
}

const validateUrl = (url: string) => {
  if (!url) return '#';
  const pattern = /^(https?:\/\/)/i;
  return pattern.test(url) ? url : `http://${url}`;
};

const formatSocialUrl = (platform: string, url: string) => {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  
  switch (platform) {
    case 'threads':
      return `https://threads.net/@${url}`;
    case 'email':
      return `mailto:${url}`;
    default:
      return validateUrl(url);
  }
};

interface DatabaseHeader {
  id: string;
  title: string;
  isLink: boolean;
  islink: boolean;
  active: boolean;
  position: number;
}

interface SocialLinkData {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  created_at: string;
}

interface UserData {
  user_id: string;
  email: string;
  username: string;
  fullname: string;
  category: string;
  subcategory: string;
  profile_pic_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export const PreviewMobile: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  content,
  profileData,
  userID,
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) return; // Don't fetch if userID is empty
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", userID)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, [userID, supabase]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!userID) return; // Don't fetch if userID is empty
      
      try {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", userID)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setSocialLinks(data || []);
      } catch (error) {
        console.error("Error fetching social links:", error);
        setError("Failed to load social links. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialLinks();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('social_links_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'social_links',
          filter: `user_id=eq.${userID}`
        },
        (payload: { eventType: string; new: SocialLinkData; old: { id: string } }) => {
          if (payload.eventType === 'INSERT') {
            setSocialLinks(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setSocialLinks(prev => prev.filter(link => link.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setSocialLinks(prev => prev.map(link => 
              link.id === payload.new.id ? payload.new : link
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID]);

  useEffect(() => {
    setIsContentLoading(true);
    if (content && content.length >= 0) {
      setIsContentLoading(false);
    }
  }, [content]);

  // Update the content mapping to handle both isLink and islink
  const mappedContent = (content as unknown as DatabaseHeader[]).map(item => ({
    id: item.id,
    header: item.title || '',
    link: item.isLink || item.islink || false,
    active: item.active || false,
    position: item.position
  }));

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-default-50 to-default-100">
                {/* Profile Section */}
                <div className="w-full flex flex-col items-center pt-8 pb-4 animate-fade-in">
                  {userData?.profile_pic_url && (
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300">
                      <Image
                        src={userData.profile_pic_url}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <h1 className="text-xl font-bold mb-2 animate-slide-up">{userData?.fullname || 'Add your name'}</h1>
                  <p className="text-default-600 text-center px-4 mb-4 animate-slide-up delay-100">{userData?.bio || 'Add your bio'}</p>
                </div>

                {/* Social Links Section */}
                {isLoading ? (
                  <div className="w-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                  </div>
                ) : error ? (
                  <div className="w-full px-4 mb-4">
                    <div className="bg-danger-50 text-danger-600 p-4 rounded-lg">
                      {error}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-wrap gap-4 justify-center px-4 mb-4 animate-slide-up delay-200">
                    {socialLinks.map((link, index) => (
                      <a
                        key={link.id}
                        href={formatSocialUrl(link.platform, link.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white p-3 rounded-full hover:bg-default-100 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <i className={`${socials[link.platform]?.icon} text-xl`}></i>
                      </a>
                    ))}
                  </div>
                )}

                {/* Links Section */}
                {isContentLoading ? (
                  <div className="w-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                  </div>
                ) : (
                  <div className="w-full px-4 space-y-4 mb-8 animate-slide-up delay-300">
                    {mappedContent.map((item, index) => (
                      <div key={item.id}>
                        {item.link ? (
                          <a
                            href={validateUrl(item.header)}
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
                )}

                {/* Footer */}
                <div className="w-full px-4 py-6 text-center text-default-500 text-sm animate-fade-in delay-500">
                  <p>Powered by Twiggle</p>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
