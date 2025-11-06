import React, { useState } from "react";
import axios from "axios";
import Navbar from "../../components/navUser";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangPassword = () => {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ ตรวจสอบว่ารหัสใหม่กับยืนยันตรงกันไหม
        if (newPassword !== confirmPassword) {
            toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }

        // ✅ ดึง username จาก localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.username) {
            toast.error("ไม่พบข้อมูลผู้ใช้");
            return;
        }

        try {
            const res = await axios.post("http://localhost:3000/changepassword", {
                username: user.username,
                oldPassword,
                newPassword,
            });

            toast.success(res.data.message);
            setTimeout(() => {
                navigate("/home");
            }, 3000);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err);
            toast.error((err.response?.data?.message || "เกิดข้อผิดพลาด"));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* ส่วนนี้จัดให้อยู่กลางจอ */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-center mb-6">
                        เปลี่ยนรหัสผ่าน
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                รหัสผ่านเก่า
                            </label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black-500"
                                placeholder="กรอกรหัสผ่านเก่า"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 pt-2">
                                รหัสผ่านใหม่
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black-500"
                                placeholder="กรอกรหัสผ่านใหม่"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 pt-2">
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black-500"
                                placeholder="ยืนยันรหัสผ่านใหม่"
                            />
                        </div>
                        <div className="pt-4"></div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-b from-[#41826e] to-[#2e5f50] hover:from-green-600 hover:to-green-600 text-white py-2 rounded-lg transition-all duration-300"
                        >
                            ยืนยันการเปลี่ยนรหัสผ่าน
                        </button>
                    </form>

                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
};

export default ChangPassword;