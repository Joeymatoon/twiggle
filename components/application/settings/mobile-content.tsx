import React, { useState } from "react";

export default function MobileContent() {
  const [profileTitle, setProfileTitle] = useState<string>("Ahmad");
  const [bio, setBio] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([""]);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const addNewLink = () => {
    setLinks([...links, ""]);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"} flex flex-col items-center p-8 transition-colors duration-500`}>
      <h1 className="text-3xl font-bold mb-8">Profile Appearance</h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-6 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
      >
        Toggle {darkMode ? "Light" : "Dark"} Mode
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
        {/* Left: Form Section */}
        <form className={`p-6 rounded-2xl shadow-xl w-full ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center text-2xl font-bold">
              {image ? (
                <img src={image} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <span>A</span>
              )}
            </div>
            <label className="w-20 h-20 rounded-full bg-purple-600 text-white flex items-center justify-center cursor-pointer hover:bg-purple-700 transition text-sm font-medium">
              Upload
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Profile Title</label>
            <input
              type="text"
              value={profileTitle}
              onChange={(e) => setProfileTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="Write something about yourself..."
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">{bio.length}/160</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Your Links</label>
            {links.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="url"
                  placeholder="https://yourlink.com"
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addNewLink}
              className="mt-2 text-purple-500 hover:underline text-sm"
            >
              + Add another link
            </button>
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition text-white font-semibold px-6 py-2 rounded-xl"
          >
            Save Changes
          </button>
        </form>

        {/* Right: Phone Preview Section */}
        <div className="w-full flex justify-center">
          <div className={`relative w-[300px] h-[600px] rounded-[2.5rem] p-6 flex flex-col items-center space-y-4 shadow-2xl border-4 transition-all duration-300 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-200 border-gray-300"}`}>
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
      </div>
    </div>
  );
} 