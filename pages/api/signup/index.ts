import { supabaseAdmin } from "@/utils/supabase/admin";
import createClient from "@/utils/supabase/api";
import { Session, User } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  user: User | null;
  session: Session | null;
};

type ErrorResponse = {
  error: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  const supabase = createClient(req, res);

  try {
    const request = req.body;

    const { data, error } = await supabase.auth.signUp({
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

    if (error) {
      console.error("Error:", error);
      return res.status(400).json({ error: error.message || "Sign up failed" });
    }

    // Insert user data using admin client to bypass RLS
    const signUpData = {
      user_id: data.user?.id,
      email: request.email,
      username: request.username.toLowerCase(),
      fullname: request.fullname,
      profile_pic_url: '', 
      bio: '',
      category: request.category,
      subcategory: request.subcategory,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert([signUpData])
      .select();

    if (userError) {
      console.error("Error inserting user data:", userError);
      await supabaseAdmin.auth.admin.deleteUser(data.user?.id!);
      return res
        .status(500)
        .json({ error: `Error inserting user data: ${userError.message}` });
    }

    return res.status(200).json({ user: data.user, session: data.session });
  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
