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
  selectedTemplate: string; // Added prop
  onTemplateChange: (templateId: string) => void; // Added prop
}

export const Preview: React.FC<PreviewProps> = ({
  content,
  profileData,
  userID, // userID is already a prop, no change needed here for it
  selectedTemplate, // Use prop
  onTemplateChange, // Use prop
}) => {
  const [scaleFactor, setScaleFactor] = useState(100);
  // const supabase = createClient(); // supabase client can be initialized if needed for other logic, or removed if only for template

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

  // Removed internal state management for selectedTemplate
  // Removed useEffect for loading template preference
  // Removed handleTemplateChange as it's now passed as a prop

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
            template={selectedTemplate} // Use prop
          />
        </div>
      </section>
      <section className="w-full max-w-5xl">
        <TemplateSelector
          selectedTemplate={selectedTemplate} // Pass prop
          onTemplateChange={onTemplateChange} // Pass prop
        />
      </section>
    </div>
  );
};
