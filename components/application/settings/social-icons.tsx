import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { socials } from "@/config/social-icons";
import { createClient } from "@/utils/supabase/components";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/utils/state/actions/userActions";

interface SocialIcon {
  id: string;
  icon: string;
  name: string;
  placeholder: string;
  example: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  user_id: string;
}

interface SocialIconsProps {
  userID?: string;
}

export const SocialIcons: React.FC<SocialIconsProps> = ({ userID }) => {
  const [activeIconSection, setActiveIconSection] = useState<"first" | "second">("first");
  const [iconContent, setIconContent] = useState<SocialIcon | null>(null);
  const [modalHeader, setModalHeader] = useState<string>("Add icon");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newLink, setNewLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const supabase = createClient();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userID) return;

    const fetchSocialLinks = async () => {
      try {
        const { data, error } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", userID)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setSocialLinks(data || []);
      } catch (error) {
        console.error("Error fetching social links:", error);
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

  const handleIconSectionChange = (
    section: "first" | "second",
    item: SocialIcon | null = null
  ) => {
    if (section === "first") {
      setIconContent(null);
      setModalHeader("Add icon");
      setNewLink("");
    } else if (section === "second" && item) {
      setIconContent(item);
      setModalHeader(`Add ${item.name} icon`);
    }
    setActiveIconSection(section);
  };

  const handleAddLink = async () => {
    if (!iconContent || !newLink.trim() || !userID) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      let validatedUrl = newLink.trim();

      // Special handling for different platforms
      switch (iconContent.id) {
        case 'threads':
          if (!validatedUrl.startsWith('@')) {
            validatedUrl = `@${validatedUrl}`;
          }
          break;
        case 'email':
          if (!validatedUrl.includes('@')) {
            throw new Error("Please enter a valid email address");
          }
          validatedUrl = `mailto:${validatedUrl}`;
          break;
        case 'whatsapp':
          if (!validatedUrl.startsWith('+')) {
            validatedUrl = `+${validatedUrl}`;
          }
          validatedUrl = `https://wa.me/${validatedUrl.replace(/\D/g, '')}`;
          break;
        default:
          if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
            validatedUrl = `https://${validatedUrl}`;
          }
      }

      const { data, error } = await supabase
        .from("social_links")
        .insert([
          {
            platform: iconContent.id,
            url: validatedUrl,
            user_id: userID
          },
        ])
        .select();

      if (error) throw error;

      setSuccess("Social link added successfully!");
      onOpenChange();
      handleIconSectionChange("first");
    } catch (error: any) {
      console.error("Error adding social link:", error);
      setError(error.message || "Failed to add social link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLink = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from("social_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSuccess("Social link removed successfully!");
    } catch (error: any) {
      console.error("Error removing social link:", error);
      setError(error.message || "Failed to remove social link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Display success/error messages */}
      {success && (
        <div className="w-full p-3 bg-success-100 text-success-600 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="w-full p-3 bg-danger-100 text-danger-600 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Display existing social links */}
      <div className="w-full flex flex-wrap gap-4">
        {socialLinks.map((link) => (
          <div key={link.id} className="flex items-center gap-2 bg-default-100 p-2 rounded-full">
            <i className={`${socials[link.platform]?.icon} text-xl`}></i>
            <span className="text-sm">{link.url}</span>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => handleRemoveLink(link.id)}
              isLoading={isLoading}
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
        ))}
      </div>

      <Button 
        color="secondary" 
        radius="full" 
        onPress={onOpen}
        isLoading={isLoading}
      >
        Add icon
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        scrollBehavior="inside"
        onClose={() => handleIconSectionChange("first")}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              {activeIconSection === "first" && modalHeader}
              {activeIconSection === "second" && (
                <div className="w-full flex items-center justify-start">
                  <Button
                    variant="light"
                    onPress={() => handleIconSectionChange("first")}
                    isIconOnly
                    className="px-0 h-7 self-start"
                  >
                    <i className="ri-arrow-left-wide-line"></i>
                  </Button>
                  <span>{modalHeader}</span>
                </div>
              )}
            </ModalHeader>
            <ModalBody>
              {activeIconSection === "first" && (
                <section className="flex flex-col gap-3">
                  <Input
                    classNames={{
                      base: "max-w-full h-10",
                      mainWrapper: "h-full",
                      input: "text-small",
                      inputWrapper:
                        "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                    }}
                    placeholder="Type to search..."
                    size="sm"
                    startContent={<i className="ri-search-line"></i>}
                    type="search"
                    className="w-full"
                  />
                  <div className="overflow-y-scroll h-[60vh] md:h-[35vh] flex flex-col gap-3">
                    {Object.values(socials).map((item: SocialIcon) => (
                      <Button
                        key={item.id}
                        id={item.id}
                        className="h-14 px-4 py-7"
                        variant="light"
                        radius="sm"
                        onPress={() => handleIconSectionChange("second", item)}
                        endContent={
                          <i className="ri-arrow-right-s-line text-xl text-default-500"></i>
                        }
                      >
                        <div className="flex gap-3 items-center justify-start w-full">
                          <i className={`${item.icon} text-2xl`}></i>
                          <span className="text-md font-bold">{item.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </section>
              )}
              {activeIconSection === "second" && iconContent && (
                <section className="flex flex-col">
                  <Input 
                    label={iconContent.placeholder}
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                  />
                  <span className="my-4 text-default-500 pl-4 text-xs">
                    Example: {iconContent.example}
                  </span>
                  <Button 
                    radius="full" 
                    color="secondary" 
                    className="my-4"
                    onPress={handleAddLink}
                    isLoading={isLoading}
                  >
                    Add to Twiggle
                  </Button>
                </section>
              )}
            </ModalBody>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
};
