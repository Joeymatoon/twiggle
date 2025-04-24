import React, { useState, useEffect } from "react";
import { HeaderCardProps } from "../links/links-card";
import { PreviewContent } from "./content";
import { ProfileDataProps } from "@/pages/admin";

interface PreviewProps {
  content: HeaderCardProps[];
  profileData: ProfileDataProps;
}

export const Preview: React.FC<PreviewProps> = ({
  content,
  profileData,
}) => {
  const [scaleFactor, setScaleFactor] = useState(100);

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

  const scaledStyle = {
    transform: `scale(${scaleFactor})`,
  };

  return (
    <>
      <section className="hidden md:flex w-1/3 h-[80vh] justify-center items-start mt-20">
        <div
          className="border-[15px] border-slate-800 w-[296px] h-[610px] px-4 pt-16 pb-8 rounded-[50px] flex flex-col items-center overflow-y-scroll"
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
          <PreviewContent content={content} profileData={profileData} />
        </div>
      </section>
    </>
  );
};
