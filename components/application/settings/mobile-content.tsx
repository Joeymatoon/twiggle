import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/utils/state/reducers/reducers';
import { updateUserInfo } from '@/utils/state/actions/userActions';
import { createClient } from '@/utils/supabase/components';
import { toast } from 'react-hot-toast';
import { User, Camera, Link, Trash } from 'lucide-react';
import { socials } from '@/config/social-icons';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  user_id: string;
}

interface UserState {
  name: string;
  bio: string;
  avatarUrl: string;
  socialLinks: SocialLink[];
}

const MobileContent = () => {
  const user = useSelector((state: RootState) => state.user as unknown as UserState);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || ""
  });

  const dispatch = useDispatch();
  const supabase = createClient();

  const handleSave = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authUser) throw new Error("User not authenticated");

      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          bio: formData.bio,
          avatar_url: formData.avatarUrl
        })
        .eq("id", authUser.id);

      if (updateError) throw updateError;

      dispatch(updateUserInfo({
        name: formData.name,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl
      } as unknown as Partial<UserState>));

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => {/* Handle avatar upload */}}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h3 className="font-medium">{formData.name || "Add your name"}</h3>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Add a bio"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-600">{formData.bio || "Add a bio to tell people about yourself"}</p>
            )}
          </div>

          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Social Links Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Social Links</h2>
        <div className="space-y-4">
          {user.socialLinks?.length > 0 ? (
            user.socialLinks.map((link: SocialLink) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {socials[link.platform]?.icon || <Link className="h-4 w-4 text-gray-600" />}
                  </div>
                  <span className="font-medium">{link.platform}</span>
                </div>
                <button
                  onClick={() => {/* Handle link removal */}}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No social links added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileContent; 