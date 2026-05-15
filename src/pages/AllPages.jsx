import { Link } from "react-router-dom";

export default function AllPages() {
  const pages = [
    { name: "Landing Page", path: "/" },
    { name: "Login Page", path: "/login" },
    { name: "Signup Page", path: "/signup" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "My Tasks", path: "/tasks" },
    { name: "Categories", path: "/categories" },
    { name: "Calendar", path: "/calendar" },
    { name: "Profile / Account", path: "/account" },
    { name: "Settings", path: "/settings" }
  ];

  return (
    <div className="min-h-screen flex flex-col p-8 lg:p-16" style={{ backgroundColor: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}>
      <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>Developer Menu: All Pages</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map(p => (
          <Link 
            key={p.path} 
            to={p.path} 
            className="rounded-2xl p-6 transition-all duration-200 border hover:border-[#6C63FF]"
            style={{ backgroundColor: "#161616", borderColor: "#2a2a2a" }}
          >
            <p className="text-white font-bold text-lg mb-2">{p.name}</p>
            <p className="text-gray-500 text-sm">{p.path}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
