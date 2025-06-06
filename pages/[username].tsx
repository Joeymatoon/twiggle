import { PreviewContent } from "+/application/preview/content";
import { Head } from "@/layouts/head";
import { createClient } from "@/utils/supabase/server-props";
import { createClient as createComponentClient } from "@/utils/supabase/components";
import { Image } from "@nextui-org/react";
import { GetServerSideProps } from "next";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ProfileDataProps } from "./admin";
import { HeaderCardProps } from "+/application/links/links-card";

interface UserPageProps {
  user: {
    id: string;
    username: string;
    fullname: string;
    profile_pic_url: string;
    bio: string;
    email: string;
  };
  error?: string;
}

const UserPage: React.FC<UserPageProps> = ({ user, error }) => {
  const [profileData, setProfileData] = useState<ProfileDataProps>({
    bio: "",
    avatar: "",
    avatarUrl: "",
    profileTitle: "",
    username: "",
    userID: user?.id || "", // Add the userID property
  });
  const [content, setContent] = useState<HeaderCardProps[]>([]);
  const { theme } = useTheme();
  const router = useRouter();
  const supabase = createComponentClient();

  useEffect(() => {
    // Fetch user data when the component mounts
    const fetchHeaderData = async () => {
      try {
        const { data, error } = await supabase
          .from("headers")
          .select()
          .eq("user_id", user.id); // Use user.id
        console.log("header data", data);

        if (error) {
          console.error("Error fetching headers:", error);
        } else if (data) {
          const newContents = data.map((item: any, index: number) => ({
            header: item.title,       // Use 'title' from DB for header text
            id: item.id,              // Use 'id' from DB for unique key
            active: item.active,
            link: item.is_link,       // Use 'is_link' from DB
            position: index,          // Add position property using the array index
          }));
          setContent(newContents); // Replace existing content with new data
        } else {
          setContent([]); // If no data and no error, set to empty array
        }
      } catch (error) {
        console.error("Error fetching headers:", error); // Corrected error message
      }
    };

    fetchHeaderData();
  }, [supabase, user.id]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select()
          .eq("id", user.id);

        if (data && data.length > 0) {
          setProfileData((prevInputs: any) => ({
            ...prevInputs,
            bio: data[0].bio || "",
            profileTitle: data[0].fullname,
            avatar: data[0].profile_pic_url,
            avatarUrl:
              data[0].profile_pic_url === null
                ? ""
                : `https://qjpqmdezsulsnwjblvsl.supabase.co/storage/v1/object/public/${data[0].profile_pic_url}`,
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [supabase, user.id]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <section className="flex flex-col p-5 h-screen">
      <Head icon="logo-alt" title={`${user.username}'s Twiggle`} />
      <div className="flex-grow">
        <PreviewContent profileData={profileData} content={content} />
      </div>
      <footer className="flex justify-center items-center">
        <span>Powered by</span>
        <Image
          alt="twiggle logo in footer"
          width={200}
          height={50}
          src={`/images/twiggle-logo-purple${theme === "dark" ? "-w" : ""}.png`}
        />
      </footer>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient(context);
  const parameters = context.params;
  const username = parameters?.username?.toString().toLowerCase();
  // Fetch user data based on the username
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    return {
      props: {
        user: null,
        error: error.message,
      },
    };
  }

  return {
    props: {
      user: data,
    },
  };
};

export default UserPage;
