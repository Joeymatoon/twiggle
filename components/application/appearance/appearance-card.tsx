// components/AppearanceCard.tsx
import { useEffect, useState } from "react";
import { Avatar, Button, Input, Textarea, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/utils/state/actions/userActions";
import { createClient } from "@/utils/supabase/components";

interface AppearanceProps {
  userID: string;
  profileTitle: string;
  setProfileTitle: React.Dispatch<React.SetStateAction<string>>;
  bio: string;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  avatarUrl: string;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
}

export const AppearanceCard: React.FC<AppearanceProps> = ({
  userID,
  profileTitle,
  setProfileTitle,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
}) => {
  const dispatch = useDispatch();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("id", userID)
          .single();

        if (error) throw error;

        if (data) {
          setBio(data.bio || "");
          setProfileTitle(data.fullname || "");
          setAvatar(data.profile_pic_url || "");
          if (data.profile_pic_url) {
            const storagePath = data.profile_pic_url.replace('avatars/', '');
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(storagePath);
            setAvatarUrl(publicUrl);
            dispatch(updateUserInfo({
              bio: data.bio || "",
              profileTitle: data.fullname || "",
              profilePic: publicUrl
            }));
          } else {
            setAvatarUrl("");
            dispatch(updateUserInfo({
              bio: data.bio || "",
              profileTitle: data.fullname || "",
              profilePic: ""
            }));
          }
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setError(error.message || "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userID}`,
        },
        (payload) => {
          const newData = payload.new;
          // Only update local state if the new data is different
          setBio((prevBio) => {
            if ((newData.bio || "") !== prevBio) { setBio(newData.bio || ""); return newData.bio || ""; }
            return prevBio;
          });
          setProfileTitle((prevTitle) => {
            if ((newData.fullname || "") !== prevTitle) { setProfileTitle(newData.fullname || ""); return newData.fullname || ""; }
            return prevTitle;
          });
          setAvatar((prevAvatar) => {
            if ((newData.profile_pic_url || "") !== prevAvatar) return newData.profile_pic_url || "";
            return prevAvatar;
          });
          if (newData.profile_pic_url) {
            const storagePath = newData.profile_pic_url.replace('avatars/', '');
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(storagePath);
            setAvatarUrl((prevUrl) => {
              if (publicUrl !== prevUrl) { setAvatarUrl(publicUrl); return publicUrl; }
              return prevUrl;
            });
            dispatch(updateUserInfo({
              bio: newData.bio || "",
              profileTitle: newData.fullname || "",
              profilePic: publicUrl
            }));
          } else {
            setAvatarUrl((prevUrl) => {
              if (prevUrl !== "") { setAvatarUrl(""); return ""; }
              return prevUrl;
            });
            dispatch(updateUserInfo({
              bio: newData.bio || "",
              profileTitle: newData.fullname || "",
              profilePic: ""
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userID, dispatch, setBio, setProfileTitle, setAvatarUrl]);

  const handleProfileTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setProfileTitle(newTitle);
    setError(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          fullname: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq("id", userID);
      if (error) throw error;
      dispatch(updateUserInfo({ profileTitle: newTitle }));
    } catch (error: any) {
      console.error("Error updating profile title:", error);
      setError(error.message || "Failed to update profile title");
    }
  };

  const handleBioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBio = e.target.value;
    setBio(newBio);
    setError(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          bio: newBio,
          updated_at: new Date().toISOString()
        })
        .eq("id", userID);
      if (error) throw error;
      dispatch(updateUserInfo({ bio: newBio }));
    } catch (error: any) {
      console.error("Error updating bio:", error);
      setError(error.message || "Failed to update bio");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setError(null);
      if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        throw new Error('Please upload a valid image file (JPEG, PNG)');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }
      const fileExt = file.name.split('.').pop();
      const filePath = `${userID}/avatar.${fileExt}`;
      if (avatar) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([avatar.replace('avatars/', '')]);
        if (deleteError) throw deleteError;
      }
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          profile_pic_url: `avatars/${filePath}`,
          updated_at: new Date().toISOString()
        })
        .eq("id", userID);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      setAvatar(`avatars/${filePath}`);
      dispatch(updateUserInfo({ profilePic: publicUrl }));
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      setError(error.message || "Failed to update avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setError(null);
      if (avatar) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([avatar.replace('avatars/', '')]);
        if (deleteError) throw deleteError;
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            profile_pic_url: null,
            updated_at: new Date().toISOString()
          })
          .eq("id", userID);
        if (updateError) throw updateError;
        setAvatar("");
        setAvatarUrl("");
        dispatch(updateUserInfo({ profilePic: "" }));
      }
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      setError(error.message || "Failed to remove avatar");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full p-6">
        <CardBody className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-secondary rounded-full border-t-transparent"></div>
            <p className="text-default-500">Loading profile data...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-1 px-6 py-4">
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-default-500">Customize how your profile looks to others</p>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        {error && (
          <div className="w-full p-4 mb-6 text-sm text-danger-500 bg-danger-50 rounded-lg border border-danger-200">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line text-lg"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar
                  name={profileTitle[0]?.toUpperCase() || "@"}
                  className="w-32 h-32 text-4xl text-white bg-black"
                  src={avatarUrl}
                  isBordered
                  showFallback
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="ri-camera-line text-2xl text-white"></i>
                </div>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Profile Picture</h3>
                <p className="text-default-500 text-sm">
                  Upload a profile picture to personalize your account. We recommend using a square image.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  color="secondary"
                  radius="full"
                  className="min-w-[200px]"
                  onPress={() => {
                    const fileInput = document.getElementById("avatar-upload");
                    if (fileInput) fileInput.click();
                  }}
                  isLoading={isUploading}
                  isDisabled={isUploading}
                  startContent={!isUploading && <i className="ri-upload-2-line"></i>}
                >
                  {isUploading ? "Uploading..." : "Upload New Photo"}
                </Button>
                <Button
                  color="danger"
                  variant="light"
                  radius="full"
                  onPress={handleRemoveAvatar}
                  isDisabled={!avatar || isUploading}
                  startContent={<i className="ri-delete-bin-line"></i>}
                >
                  Remove Photo
                </Button>
              </div>
            </div>
          </div>

          <Divider />

          {/* Profile Information Section */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <p className="text-default-500 text-sm">
                Update your profile title and bio to let others know more about you.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Profile Title"
                value={profileTitle}
                onChange={handleProfileTitleChange}
                variant="bordered"
                classNames={{
                  input: "text-lg",
                  label: "text-default-500"
                }}
                startContent={<i className="ri-user-line text-default-400"></i>}
              />
              <Textarea 
                label="Bio" 
                value={bio} 
                onChange={handleBioChange}
                minRows={3}
                maxRows={5}
                variant="bordered"
                placeholder="Tell people about yourself..."
                classNames={{
                  input: "text-lg",
                  label: "text-default-500",
                  base: "w-full"
                }}
                startContent={<i className="ri-file-text-line text-default-400"></i>}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
