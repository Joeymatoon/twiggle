import { Modal, ModalContent, ModalBody } from "@nextui-org/react";
import { PreviewContent } from "./content";
import { HeaderCardProps } from "../links/links-card";
import { ProfileDataProps } from "@/pages/admin";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/components";
import { SocialLink } from "@/types/social-link";
import { socials } from "@/config/social-icons";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
}

export const PreviewMobile: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  content,
  profileData,
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("social_links")
          .select("*")
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
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_links',
        },
        (payload: { eventType: string; new: SocialLink; old: { id: string } }) => {
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
  }, [supabase]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-default-50 to-default-100">
                {/* Profile Section */}
                <div className="w-full flex flex-col items-center pt-8 pb-4 animate-fade-in">
                  {profileData.avatarUrl && (
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300">
                      <Image
                        src={profileData.avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <h1 className="text-xl font-bold mb-2 animate-slide-up">{profileData.profileTitle}</h1>
                  <p className="text-default-600 text-center px-4 mb-4 animate-slide-up delay-100">{profileData.bio}</p>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="w-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="w-full px-4 mb-4">
                    <div className="bg-danger-50 text-danger-600 p-4 rounded-lg">
                      {error}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {!isLoading && !error && (
                  <div className="w-full flex flex-wrap gap-4 justify-center px-4 mb-4 animate-slide-up delay-200">
                    {socialLinks.map((link, index) => (
                      <a
                        key={link.id}
                        href={link.url}
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
                {!isLoading && !error && (
                  <div className="w-full px-4 space-y-4 mb-8 animate-slide-up delay-300">
                    {content.map((item, index) => (
                      <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.icon && <i className={`${item.icon} text-xl`}></i>}
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <i className="ri-external-link-line text-default-400"></i>
                        </div>
                      </a>
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
