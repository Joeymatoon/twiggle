import createClient from "@/utils/supabase/api";
import { Session, User } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  user: User | null;
  session: Session | null;
  message?: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  const supabase = createClient(req, res);

  try {
    const request = req.body;

    // First, sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          username: request.username,
          fullname: request.fullname,
          category: request.category,
          subcategory: request.subcategory,
        },
      },
    });

    if (authError) {
      console.error("Auth Error:", authError);
      return res.status(400).json({ error: authError.message || "Sign up failed" });
    }

    if (!authData.user) {
      return res.status(400).json({ error: "User creation failed" });
    }

    console.log("Auth response:", authData);

    // Then, insert user data into the users table
    const { error: dbError } = await supabase
      .from("users")
      .insert([
        {
          user_id: authData.user.id,
          email: request.email,
          username: request.username,
          fullname: request.fullname,
          category: request.category,
          subcategory: request.subcategory,
          profile_pic_url: '',
          bio: '',
        },
      ]);

    if (dbError) {
      console.error("Database Error:", dbError);
      // If database insertion fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: "Error creating user profile" });
    }

    // Return success response with appropriate message
    return res.status(200).json({ 
      user: authData.user, 
      session: authData.session,
      message: authData.session ? "Signup successful" : "Please check your email to verify your account"
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
