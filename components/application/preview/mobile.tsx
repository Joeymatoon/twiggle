import React, { useState } from "react";
import Image from "next/image";

interface MobilePreviewProps {
  profileTitle: string;
  bio: string;
  image: string | null;
  links: string[];
  darkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const gradientBg =
  "bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-400 animate-gradient-x";

const MobilePreview: React.FC<MobilePreviewProps> = ({
  profileTitle,
  bio,
  image,
  links,
  darkMode = true,
  isOpen,
  onClose,
}) => {
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative w-[340px] h-[700px] rounded-[2.5rem] flex flex-col items-center shadow-2xl border-8 transition-all duration-300 overflow-hidden ${
          localDarkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-gray-100 border-gray-300"
        }`}
        style={{ boxShadow: "0 8px 40px 0 rgba(80, 63, 205, 0.25)" }}
      >
        {/* Phone details */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-700 rounded-b-xl opacity-70" />
        <div className="absolute right-4 top-4 flex gap-2 z-20">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close preview"
          >
            &times;
          </button>
          <button
            onClick={() => setLocalDarkMode((d) => !d)}
            className={`rounded-full w-8 h-8 flex items-center justify-center border transition ${
              localDarkMode
                ? "bg-gray-800 text-yellow-300 border-gray-700"
                : "bg-white text-purple-600 border-gray-300"
            }`}
            aria-label="Toggle dark mode"
          >
            {localDarkMode ? (
              <span className="material-icons">light_mode</span>
            ) : (
              <span className="material-icons">dark_mode</span>
            )}
          </button>
        </div>
        {/* Animated/Glass background */}
        <div
          className={`absolute inset-0 z-0 ${gradientBg} opacity-30 blur-2xl pointer-events-none`}
        />
        {/* Avatar with glassy background */}
        <div className="relative flex flex-col items-center mt-12 z-10">
          {/* Glassy/blurred background behind avatar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10 backdrop-blur-md shadow-xl" style={{ filter: 'blur(4px)' }} />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-purple-400/50 shadow-lg bg-gray-700 flex items-center justify-center">
            {image ? (
              <img
                src={image}
                alt="Profile avatar"
                className="w-full h-full object-cover"
                loading="eager"
                draggable={false}
              />
            ) : (
              <span className="text-4xl font-bold text-white/90">
                {profileTitle?.[0]?.toUpperCase() || "A"}
              </span>
            )}
          </div>
        </div>
        {/* Profile Title */}
        <h2 className="text-xl font-bold text-center px-4 mt-4 z-10 text-white/90 dark:text-white">
          {profileTitle || "Your Name"}
        </h2>
        {/* Bio */}
        <p className="text-sm text-center text-gray-300 px-6 mt-1 z-10">
          {bio || "Your bio will appear here."}
        </p>
        {/* Links */}
        <div className="w-full flex-1 flex flex-col items-center justify-start space-y-3 pt-6 px-4 overflow-y-auto z-10">
          {links && links.length > 0 && links.some((l) => l) ? (
            links.map((link, index) =>
              link ? (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full bg-white/10 dark:bg-white/10 backdrop-blur-md text-purple-100 dark:text-purple-200 py-3 px-5 rounded-xl shadow-md hover:bg-purple-600/80 hover:text-white hover:scale-[1.03] transition-all duration-200 border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{ minHeight: 48 }}
                >
                  <span className="material-icons text-purple-300">link</span>
                  <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
                </a>
              ) : null
            )
          ) : (
            <div className="w-full flex flex-col items-center justify-center mt-8">
              <span className="material-icons text-4xl text-purple-400 mb-2">link_off</span>
              <span className="text-purple-200 text-sm">No links added yet</span>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="w-full flex flex-col items-center justify-end mt-auto pb-4 z-10">
          <div className="flex items-center gap-2 opacity-80">
            <Image
              src="/images/twiggle-logo-purple-w.png"
              alt="Twiggle logo"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-xs text-gray-300">Powered by Twiggle</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
