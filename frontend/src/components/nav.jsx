import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardCheck,
  RotateCcw,
  SquareArrowOutUpLeft,
} from "lucide-react";

export default function Nav() {
  const [active, setActive] = useState("manager");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleClick = () => {
    console.log(active);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-[15vw] min-w-[230px] h-screen bg-gradient-to-b from-[#41826e] to-[#2e5f50] shadow-lg flex flex-col">
      <div className="w-full h-24 border-b border-white/30 flex flex-col justify-center items-center">
        <h1 className="text-white font-bold text-3xl tracking-wide uppercase">
          SU Library
        </h1>
        <p className="text-white/70 text-sm mt-1">Admin Panel</p>
      </div>

      <div className="flex flex-col gap-3 p-4 mt-4">
        <button
          onClick={() => setActive("manager")}
          className="flex items-center gap-3 px-4 py-2 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-200"
        >
          <BookOpen className="w-5 h-5" />
          <span>จัดการหนังสือ</span>
        </button>

        <button
          onClick={() => setActive("Approval")}
          className="flex items-center gap-3 px-4 py-2 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-200"
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>อนุมัติการยืม</span>
        </button>

        <button
          onClick={() => setActive("return")}
          className="flex items-center gap-3 px-4 py-2 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5" />
          <span>อนุมัติการคืน</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 mt-4 absolute bottom-10">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-200">
          <SquareArrowOutUpLeft className="w-5 h-5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      <div className="mt-auto mb-6 absolute bottom-5 left-12   text-center text-white/50 text-xs">
        © 2025 SU Library
      </div>
    </nav>
  );
}
