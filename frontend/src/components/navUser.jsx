import React, { useState, useRef, useEffect } from "react";
import { BsBook } from "react-icons/bs";
import { FaUser, FaSignOutAlt, FaHome, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-b from-[#41826e] to-[#2e5f50] p-5 shadow-xl sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <button className="text-2xl font-bold text-white flex items-center gap-2 uppercase" onClick={() => navigate("/home")}>
          <BsBook size={28} /> SU Library
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-white"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <FaHome className="text-[#41826e]" />
              </div>
            <span className="hidden sm:inline text-sm font-medium">หน้าหลัก</span>
          </button>

          <button
            onClick={() => navigate("/historybooks")}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-white"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <FaBook className="text-[#41826e]" />
              </div>
            <span className="hidden sm:inline text-sm font-medium">ประวัติการยืม</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-white"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <FaUser className="text-[#41826e]" />
              </div>
              <span className="font-medium">{user?.fullname || "Guest"}</span>
              <svg
                className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-b from-[#41826e] to-[#2e5f50] p-6 text-center">
                  <div className="relative inline-block mb-3">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-yellow-400">
                      <FaUser className="text-[#41826e] text-4xl" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2 cursor-pointer hover:bg-gray-600 transition">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-white/70 mb-1 pt-2">คลิกที่รูปเพื่อแก้ไขรูปภาพ</p>

                  <h3 className="text-lg font-bold text-white">
                    {user?.fullname || "ไม่มีข้อมูล"}
                  </h3>

                  <p className="text-sm text-white/80 mt-1">
                    @{user?.username || "guest"}
                  </p>

                  <div className="text-center mb-3 pt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                      {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
                    </span>
                  </div>
                </div>


                <div className="p-4 bg-gray-50">
                  <div className="text-center mb-3 bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">อีเมล</p>
                    <p className="text-sm font-medium text-gray-800 break-all">
                      {user?.email || "ไม่มีข้อมูลอีเมล"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/changpassword")}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition text-blue-600">
                      <FaUser className="text-lg" />
                      <span className="text-sm font-medium">เปลี่ยนรหัสผ่าน</span>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition text-red-600"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span className="text-sm font-medium">ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;