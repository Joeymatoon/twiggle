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

  const [profileTitle, setProfileTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("user_id", userID);

        if (data && data.length > 0) {
          setBio(data[0].bio || "");
          setProfileTitle(data[0].fullname || "");
          setAvatar(data[0].profile_pic_url || "");
          setAvatarUrl(
            data[0].profile_pic_url
              ? `${process.env.NEXT_PUBLIC_SUPABASE_DB_URL}/storage/v1/object/public/${data[0].profile_pic_url}`
              : ""
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [supabase, userID]);

  const handleProfileTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setProfileTitle(newTitle);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ fullname: newTitle })
        .eq("user_id", userID);
      
      if (error) throw error;
      
      // Dispatch update to Redux store
      dispatch(updateUserInfo({ profileTitle: newTitle }));
    } catch (error: any) {
      console.error("Error updating profile title:", error);
      alert(error.message || "Failed to update profile title. Please try again.");
    }
  };

  const handleBioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBio = e.target.value;
    setBio(newBio);
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ bio: newBio })
        .eq("user_id", userID);
      
      if (error) throw error;
      
      // Dispatch update to Redux store
      dispatch(updateUserInfo({ bio: newBio }));
    } catch (error: any) {
      console.error("Error updating bio:", error);
      alert(error.message || "Failed to update bio. Please try again.");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check file type
      if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
        throw new Error('Please upload a valid image file (JPEG, PNG)');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      // First check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) throw bucketError;

      const bucketExists = buckets.some(bucket => bucket.name === 'avatars');
      if (!bucketExists) {
        throw new Error('Avatars bucket not found. Please create it in your Supabase dashboard.');
      }

      // Delete existing avatar if it exists
      if (avatar) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([avatar]);
        
        if (deleteError) throw deleteError;
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${userID}/avatar.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update user record
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_pic_url: `avatars/${fileName}` })
        .eq("user_id", userID);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setAvatar(`avatars/${fileName}`);
      
      // Dispatch update to Redux store
      dispatch(updateUserInfo({ profilePic: publicUrl }));
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      alert(error.message || "Failed to update avatar. Please try again.");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      if (avatar) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([avatar]);
        
        if (deleteError) throw deleteError;

        const { error: updateError } = await supabase
          .from("users")
          .update({ profile_pic_url: null })
          .eq("user_id", userID);

        if (updateError) throw updateError;

        setAvatar("");
        setAvatarUrl("");
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex w-full justify-between items-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <Avatar
            name={profileTitle[0]?.toUpperCase() || "@"}
            className="w-24 h-24 text-3xl text-white bg-black mb-2"
            src={avatarUrl}
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
          >
            <i className="ri-upload-2-line mr-2"></i>
            Upload New Photo
          </Button>
          <Button
            color="secondary"
            variant="light"
            className="shadow-md"
            radius="full"
            onPress={handleRemoveAvatar}
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
          variant="bordered"
          classNames={{
            input: "text-lg",
            label: "text-default-500"
          }}
        />
      </div>
    </div>
  );
};
