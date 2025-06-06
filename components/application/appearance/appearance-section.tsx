import { useState } from "react";
import { Button, Divider, useDisclosure } from "@nextui-org/react";
import { AppearanceCard } from "./appearance-card";
import MobilePreview from "../preview/mobile";
import { HeaderCardProps } from "../links/links-card";
import { ProfileDataProps } from "@/pages/admin";
import { templates } from "@/config/templates"; // Added import

interface AppearanceProps {
  userID: string;
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
  selectedTemplate: string; // Added selectedTemplate prop
}

export const AppearanceSection: React.FC<AppearanceProps> = ({
  userID,
  content,
  profileData,
  selectedTemplate, // Destructure selectedTemplate
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // LIFTED STATE
  const [profileTitle, setProfileTitle] = useState(profileData.profileTitle || "");
  const [bio, setBio] = useState(profileData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profileData.avatarUrl || "");

  const currentTemplateStyles = templates[selectedTemplate]?.styles;
  const headerStyle = currentTemplateStyles?.headerStyle;

  return (
    <div className="flex gap-8 w-full md:w-2/3 box-content px-4 min-h-[93vh] justify-center">
      <div className="flex flex-col w-full box-content px-4 justify-start items-center mt-28">
        <div className="px-0 w-full md:max-w-xl mb-8">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-default-500">
            Customize your profile appearance and information
          </p>
        </div>
        <div className="w-full md:max-w-xl bg-white rounded-xl p-6 shadow-sm">
          <AppearanceCard
            userID={userID}
            profileTitle={profileTitle}
            setProfileTitle={setProfileTitle}
            bio={bio}
            setBio={setBio}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
          />
        </div>
      </div>
      <div className="hidden md:inline">
        <Divider orientation="vertical" />
      </div>
      <div className="fixed bottom-12 md:hidden">
        <Button
          radius="full"
          color="secondary"
          className="p-6"
          variant="shadow"
          startContent={<i className="ri-eye-line"></i>}
          onPress={onOpen}
        >
          <span className="font-bold">Preview</span>
        </Button>
        <MobilePreview
          isOpen={isOpen}
          onClose={onOpenChange}
          profileTitle={profileTitle}
          bio={bio}
          image={avatarUrl}
          links={content.filter(item => item.link && item.header).map(item => item.header)}
          darkMode={true}
          headerStyle={headerStyle} // Pass the dynamic header style
        />
      </div>
    </div>
  );
};
