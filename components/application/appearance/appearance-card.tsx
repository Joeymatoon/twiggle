// components/AppearanceCard.tsx
import { useEffect, useState } from "react";
import { Avatar, Button, Input, Textarea } from "@nextui-org/react";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/utils/state/actions/userActions";
import { createClient } from "@/utils/supabase/components";

interface AppearanceProps {
  userID: string;
}

export const AppearanceCard: React.FC<AppearanceProps> = ({ userID }) => {
  const dispatch = useDispatch();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileTitle, setProfileTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
          setBio(newData.bio || "");
          setProfileTitle(newData.fullname || "");
          setAvatar(newData.profile_pic_url || "");
          
          if (newData.profile_pic_url) {
            const storagePath = newData.profile_pic_url.replace('avatars/', '');
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(storagePath);
            setAvatarUrl(publicUrl);
            dispatch(updateUserInfo({
              bio: newData.bio || "",
              profileTitle: newData.fullname || "",
              profilePic: publicUrl
            }));
          } else {
            setAvatarUrl("");
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
  }, [supabase, userID, dispatch]);

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

      // Check file type
      if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        throw new Error('Please upload a valid image file (JPEG, PNG)');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${userID}/avatar.${fileExt}`;
      
      // Delete existing avatar if it exists
      if (avatar) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([avatar.replace('avatars/', '')]);
        
        if (deleteError) throw deleteError;
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update user record with the full storage path
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-secondary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {error && (
        <div className="w-full p-4 mb-4 text-sm text-danger-500 bg-danger-50 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex w-full justify-between items-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <Avatar
            name={profileTitle[0]?.toUpperCase() || "@"}
            className="w-24 h-24 text-3xl text-white bg-black mb-2"
            src={avatarUrl}
            isBordered
            showFallback
          />
          <input
            id="avatar-upload"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div className="flex flex-col w-full gap-3">
          <Button
            color="secondary"
            radius="full"
            className="w-full"
            onPress={() => {
              const fileInput = document.getElementById("avatar-upload");
              if (fileInput) fileInput.click();
            }}
            isLoading={isUploading}
            isDisabled={isUploading}
          >
            {!isUploading && <i className="ri-upload-2-line mr-2"></i>}
            {isUploading ? "Uploading..." : "Upload New Photo"}
          </Button>
          <Button
            color="danger"
            variant="light"
            className="shadow-md"
            radius="full"
            onPress={handleRemoveAvatar}
            isDisabled={!avatar || isUploading}
          >
            <i className="ri-delete-bin-line mr-2"></i>
            Remove Photo
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 mt-9 mb-3">
        <Input
          label="Profile Title"
          value={profileTitle}
          onChange={handleProfileTitleChange}
          variant="bordered"
          classNames={{
            input: "text-lg",
            label: "text-default-500"
          }}
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
        />
      </div>
    </div>
  );
};
