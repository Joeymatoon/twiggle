import React, { useState, useEffect } from "react";
import { HeaderCardProps } from "../links/links-card";
import { PreviewContent } from "./content";
import { ProfileDataProps } from "@/pages/admin";
import { TemplateSelector } from "./template-selector";
import { createClient } from "@/utils/supabase/components";

interface PreviewProps {
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
  userID: string;
}

export const Preview: React.FC<PreviewProps> = ({
  content,
  profileData,
  userID,
}) => {
  const [scaleFactor, setScaleFactor] = useState(100);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const supabase = createClient();

  useEffect(() => {
    function updateScaleFactor() {
      const screenHeight = window.innerHeight;
      let newScaleFactor = Math.round(screenHeight * 1.033) / 1000;
      setScaleFactor(newScaleFactor);
    }

    updateScaleFactor();
    window.addEventListener("resize", updateScaleFactor);
    return () => {
      window.removeEventListener("resize", updateScaleFactor);
    };
  }, []);

  // Load saved template preference
  useEffect(() => {
    const loadTemplatePreference = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("template")
          .eq("id", userID)
          .single();

        if (!error && data?.template) {
          setSelectedTemplate(data.template);
        }
      } catch (error) {
        console.error("Error loading template preference:", error);
      }
    };

    if (userID) {
      loadTemplatePreference();
    }
  }, [userID, supabase]);

  // Save template preference
  const handleTemplateChange = async (template: string) => {
    setSelectedTemplate(template);
    try {
      const { error } = await supabase
        .from("users")
        .update({ template })
        .eq("id", userID);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving template preference:", error);
    }
  };

  const scaledStyle = {
    transform: `scale(${scaleFactor})`,
  };

  return (
    <div className="flex flex-col w-full items-center">
      <section className="flex w-full justify-center items-start mt-10 mb-8">
        <div
          className="border-[18px] border-slate-800 w-[360px] h-[740px] px-6 pt-20 pb-10 rounded-[56px] flex flex-col items-center overflow-y-scroll shadow-2xl bg-black/80"
          style={scaledStyle}
        >
          <style>
            {`
              ::-webkit-scrollbar-thumb {
                background: transparent;
              }
              ::-webkit-scrollbar {
                width: 1px;
              }
            `}
          </style>
          <PreviewContent 
            content={content} 
            profileData={profileData} 
            template={selectedTemplate}
          />
        </div>
      </section>
      <section className="w-full max-w-5xl">
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
        />
      </section>
    </div>
  );
};
