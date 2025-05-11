import { Modal, ModalContent, ModalBody } from "@nextui-org/react";
import { PreviewContent } from "./content";
import { HeaderCardProps } from "../links/links-card";
import { ProfileDataProps } from "@/pages/admin";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/components";
import { socials } from "@/config/social-icons";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { updateUserInfo } from "@/utils/state/actions/userActions";
import { AlertCircle, User } from "lucide-react";
import { RootState } from "@/utils/state/reducers/reducers";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
  userID: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  user_id: string;
}

interface UserData {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  socialLinks: SocialLink[];
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

export const PreviewMobile: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  content,
  profileData,
  userID,
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // Subscribe to real-time updates for user data
  useEffect(() => {
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
        (payload) => {
          const newData = payload.new as { id: string; fullname: string; bio: string; profile_pic_url: string };
          if (newData) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(newData.profile_pic_url?.replace('avatars/', '') || '');
            
            setUserData({
              id: newData.id,
              name: newData.fullname || '',
              bio: newData.bio || '',
              avatarUrl: publicUrl,
              socialLinks: socialLinks
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID, socialLinks]);

  // Subscribe to real-time updates for social links
  useEffect(() => {
    const channel = supabase
      .channel('social_links_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_links',
          filter: `user_id=eq.${userID}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSocialLinks(prev => [...prev, payload.new as SocialLink]);
          } else if (payload.eventType === 'DELETE') {
            setSocialLinks(prev => prev.filter(link => link.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setSocialLinks(prev => prev.map(link => 
              link.id === payload.new.id ? payload.new as SocialLink : link
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID]);

  // Subscribe to real-time updates for headers/links
  useEffect(() => {
    const channel = supabase
      .channel('headers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'headers',
          filter: `user_id=eq.${userID}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newHeader: HeaderCardProps = {
              id: payload.new.id,
              header: payload.new.title || '',
              active: payload.new.active || false,
              link: payload.new.is_link || false,
              position: payload.new.position
            };
            dispatch(updateUserInfo({ header: [...content, newHeader] }));
          } else if (payload.eventType === 'DELETE') {
            dispatch(updateUserInfo({ 
              header: content.filter(item => item.id !== payload.old.id)
            }));
          } else if (payload.eventType === 'UPDATE') {
            dispatch(updateUserInfo({
              header: content.map(item => 
                item.id === payload.new.id 
                  ? { ...item, ...payload.new } 
                  : item
              )
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID, content, dispatch]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select()
          .eq("id", userID)
          .single();

        if (userError) throw userError;

        // Fetch social links
        const { data: linksData, error: linksError } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", userID);

        if (linksError) throw linksError;

        // Get avatar URL
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(userData.profile_pic_url?.replace('avatars/', '') || '');

        setUserData({
          id: userData.id,
          name: userData.fullname || '',
          bio: userData.bio || '',
          avatarUrl: publicUrl,
          socialLinks: linksData || []
        });

        setSocialLinks(linksData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load data");
      } finally {
        setIsLoading(false);
        setIsContentLoading(false);
      }
    };

    fetchData();
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

  // Update userData.socialLinks whenever socialLinks changes
  useEffect(() => {
    if (userData) {
      setUserData(prev => prev ? { ...prev, socialLinks } : null);
    }
  }, [socialLinks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-default-50 to-default-100">
                {/* Profile Section */}
                <div className="w-full flex flex-col items-center pt-8 pb-4 animate-fade-in">
                  {userData?.avatarUrl && (
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300">
                      <Image
                        src={userData.avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <h1 className="text-xl font-bold mb-2 animate-slide-up">{userData?.name || 'Add your name'}</h1>
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
                  <>
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
                        <i className={`${socials[link.platform]?.icon || 'ri-question-line'} text-xl`}></i>
                      </a>
                    ))}
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <pre className="w-full bg-black text-green-400 text-xs p-2 rounded mb-2 overflow-x-auto">
                      {JSON.stringify(socialLinks, null, 2)}
                    </pre>
                  )}
                  </>
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
