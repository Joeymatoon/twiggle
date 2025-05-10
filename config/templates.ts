export type TemplateType = {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  styles: {
    background: string;
    cardStyle: string;
    linkStyle: string;
    headerStyle: string;
    bioStyle: string;
    socialIconsStyle: string;
    avatarStyle: string;
    footerStyle: string;
  };
};

export const templates: { [key: string]: TemplateType } = {
  default: {
    id: "default",
    name: "Classic",
    description: "Timeless design with elegant animations and subtle shadows",
    previewImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    styles: {
      background: "bg-gradient-to-b from-default-50 via-default-100 to-default-50",
      cardStyle: "bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:scale-[1.02] border border-default-100",
      linkStyle: "flex items-center justify-between p-5",
      headerStyle: "text-2xl font-bold mb-3 bg-gradient-to-r from-default-900 to-default-600 bg-clip-text text-transparent",
      bioStyle: "text-default-600 text-center px-6 mb-6 text-base leading-relaxed",
      socialIconsStyle: "flex items-center gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
      avatarStyle: "w-28 h-28 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-4 ring-white",
      footerStyle: "text-default-500 text-sm font-medium"
    }
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Bold and contemporary design with glassmorphism effects",
    previewImage: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    styles: {
      background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
      cardStyle: "bg-white/70 backdrop-blur-md hover:bg-white/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:scale-[1.02] border border-white/20",
      linkStyle: "flex items-center justify-between p-6",
      headerStyle: "text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent",
      bioStyle: "text-purple-700/80 text-center px-8 mb-8 text-lg leading-relaxed font-medium",
      socialIconsStyle: "flex items-center gap-2 bg-white/70 backdrop-blur-md p-4 rounded-2xl hover:bg-white/80 transition-all duration-300 transform hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
      avatarStyle: "w-32 h-32 rounded-2xl overflow-hidden mb-6 transform hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-4 ring-white/50",
      footerStyle: "text-purple-600/70 text-sm font-medium"
    }
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean and sophisticated design with subtle borders",
    previewImage: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    styles: {
      background: "bg-white",
      cardStyle: "border-2 border-gray-100 hover:border-gray-200 rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.02)]",
      linkStyle: "flex items-center justify-between p-5",
      headerStyle: "text-2xl font-medium mb-3 text-gray-900",
      bioStyle: "text-gray-600 text-center px-6 mb-6 text-base leading-relaxed",
      socialIconsStyle: "flex items-center gap-2 border-2 border-gray-100 p-2.5 rounded-full hover:border-gray-200 transition-all duration-300",
      avatarStyle: "w-28 h-28 rounded-xl overflow-hidden mb-5 transform hover:scale-105 transition-transform duration-300 border-2 border-gray-100",
      footerStyle: "text-gray-400 text-sm font-medium"
    }
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "Sleek dark theme with neon accents and glass effects",
    previewImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
    styles: {
      background: "bg-gradient-to-b from-gray-900 via-gray-800 to-black",
      cardStyle: "bg-gray-800/40 backdrop-blur-md hover:bg-gray-800/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:scale-[1.02] border border-gray-700/50",
      linkStyle: "flex items-center justify-between p-5",
      headerStyle: "text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent",
      bioStyle: "text-gray-300 text-center px-6 mb-6 text-base leading-relaxed",
      socialIconsStyle: "flex items-center gap-2 bg-gray-800/40 backdrop-blur-md p-3 rounded-full hover:bg-gray-800/60 transition-all duration-300 transform hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.2)]",
      avatarStyle: "w-28 h-28 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-4 ring-gray-800",
      footerStyle: "text-gray-500 text-sm font-medium"
    }
  },
  gradient: {
    id: "gradient",
    name: "Gradient",
    description: "Vibrant gradients with modern glass effects",
    previewImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    styles: {
      background: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500",
      cardStyle: "bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-300 transform hover:scale-[1.02] border border-white/20",
      linkStyle: "flex items-center justify-between p-6",
      headerStyle: "text-3xl font-bold mb-4 text-white",
      bioStyle: "text-white/90 text-center px-8 mb-8 text-lg leading-relaxed font-medium",
      socialIconsStyle: "flex items-center gap-2 bg-white/10 backdrop-blur-lg p-4 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.15)]",
      avatarStyle: "w-32 h-32 rounded-2xl overflow-hidden mb-6 transform hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.15)] ring-4 ring-white/20",
      footerStyle: "text-white/70 text-sm font-medium"
    }
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated design with premium aesthetics",
    previewImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
    styles: {
      background: "bg-gradient-to-b from-slate-50 to-slate-100",
      cardStyle: "bg-white hover:bg-slate-50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 transform hover:scale-[1.02] border border-slate-100",
      linkStyle: "flex items-center justify-between p-5",
      headerStyle: "text-2xl font-semibold mb-3 text-slate-800",
      bioStyle: "text-slate-600 text-center px-6 mb-6 text-base leading-relaxed",
      socialIconsStyle: "flex items-center gap-2 bg-white p-3 rounded-full hover:bg-slate-50 transition-all duration-300 transform hover:scale-110 shadow-[0_8px_30px_rgb(0,0,0,0.03)]",
      avatarStyle: "w-28 h-28 rounded-full overflow-hidden mb-4 transform hover:scale-105 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.03)] ring-4 ring-white",
      footerStyle: "text-slate-400 text-sm font-medium"
    }
  }
}; 