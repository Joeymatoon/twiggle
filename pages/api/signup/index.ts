import createClient from "@/utils/supabase/api";
import { createServiceClient } from "@/utils/supabase/service";
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
  const supabaseService = createServiceClient();

  try {
    const request = req.body;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseService
      .from("users")
      .select("id")
      .eq("email", request.email)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Check Error:", checkError);
      return res.status(500).json({ error: "Error checking user existence" });
    }

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // First, create the user in auth.users using the admin API
    const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email: request.email,
      password: request.password,
      email_confirm: true,
      user_metadata: {
        username: request.username,
        fullname: request.fullname,
        category: request.category,
        subcategory: request.subcategory,
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

    // Create the user in public.users table
    const { error: userError } = await supabaseService
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email: request.email,
          username: request.username,
          fullname: request.fullname,
          category: request.category,
          subcategory: request.subcategory,
        },
      ]);

    if (userError) {
      console.error("User Creation Error:", userError);
      // If user creation fails, we should clean up the auth user
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: "Error creating user record" });
    }

    // Create the profile
    const { error: profileError } = await supabaseService
      .from("profiles")
      .insert([
        {
          user_id: authData.user.id,
          title: request.fullname,
          bio: '',
          category: request.category,
          subcategory: request.subcategory,
          avatar_url: null,
        },
      ]);

    if (profileError) {
      console.error("Profile Creation Error:", profileError);
      // If profile creation fails, we should clean up both the auth user and the user record
      await supabaseService.from("users").delete().eq("id", authData.user.id);
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: "Error creating user profile" });
    }

    // Return success response with appropriate message
    return res.status(200).json({ 
      user: authData.user, 
      session: null,
      message: "Signup successful"
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
