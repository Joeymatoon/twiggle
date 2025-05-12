import { Button, Divider, useDisclosure, Card, CardBody, CardHeader } from "@nextui-org/react";
import { SocialIcons } from "./social-icons";
import MobilePreview from "../preview/mobile";
import { HeaderCardProps } from "../links/links-card";
import { ProfileDataProps } from "@/pages/admin";

interface SettingsProps {
  userID: string;
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
}

export const SettingSection: React.FC<SettingsProps> = ({
  userID,
  content,
  profileData,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="flex gap-8 w-full md:w-2/3 box-content px-4 h-[93vh] justify-center">
      <div className="flex flex-col w-full box-content px-4 justify-start items-center mt-28">
        <Card className="w-full md:max-w-xl mb-8">
          <CardHeader className="px-6 py-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Social Icons</h2>
              <p className="text-default-500">Customize your social media presence</p>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <SocialIcons userID={userID} />
          </CardBody>
        </Card>
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
          profileTitle={profileData.profileTitle}
          bio={profileData.bio}
          image={profileData.avatarUrl}
          links={content.filter(item => item.link && item.header).map(item => item.header)}
          darkMode={true}
        />
      </div>
    </div>
  );
};
