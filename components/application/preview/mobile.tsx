import React from "react";

interface MobilePreviewProps {
  profileTitle: string;
  bio: string;
  image: string | null;
  links: string[];
  darkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({
  profileTitle,
  bio,
  image,
  links,
  darkMode = true,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-[320px] h-[620px] rounded-[2.5rem] p-6 flex flex-col items-center space-y-4 shadow-2xl border-4 transition-all duration-300 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-200 border-gray-300"}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800"
          aria-label="Close preview"
        >
          &times;
        </button>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-700 w-24 h-2 rounded-b-xl mt-1"></div>
        <div className="w-24 h-24 rounded-full overflow-hidden mt-6">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center font-bold text-xl">
              A
            </div>
          )}
        </div>
        <h2 className="text-lg font-semibold text-center px-2 break-words">{profileTitle || "Your Name"}</h2>
        <p className="text-sm text-center text-gray-400 px-2 break-words">{bio || "Your bio will appear here."}</p>
        <div className="w-full space-y-3 pt-4 overflow-y-auto max-h-48 px-1">
          {links.map((link, index) => (
            link && (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full bg-purple-600 text-white py-2 px-4 rounded-xl truncate hover:bg-purple-700 hover:scale-105 transition-transform duration-200"
              >
                <span className="material-icons text-white">link</span>
                {link}
              </a>
            )
          ))}
        </div>
        <p className="mt-auto text-xs text-gray-500 pb-2">Powered by Twiggle</p>
      </div>
    </div>
  );
};

export default MobilePreview;
