import React, { useState, useEffect, useMemo, useCallback } from 'react'; // 1. เพิ่ม useMemo และ useCallback
import Nav from '../../components/nav';
import { useNavigate } from "react-router-dom";
import { Search, BookOpen } from 'lucide-react';
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Approve() {

    const navigate = useNavigate();
    
    // 2. ⬇️ FIX: ใช้ useMemo และ localStorage.getItem()
    // เพื่อให้ user และ token "stable" (คงที่) ไม่ถูกสร้างใหม่ทุกครั้งที่ render
    const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
    const token = useMemo(() => localStorage.getItem('token'), []);

    const [debounce, setDebounce] = useState('');
    const [search, setSearch] = useState('');
    
    const [request, setRequest] = useState([]);
    const [Allrequest, setAllrequest] = useState([]);
    const [loading, setLoading] = useState(true);

    // 3. ⬇️ FIX: ใช้ useCallback ห่อหุ้มฟังก์ชัน
    // เพื่อให้ฟังก์ชันนี้ "stable" และใส่ token เป็น dependency
    const fetchPendingRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/borrow-requests/pending`, {
                headers: { Authorization: `Bearer ${token}` } 
            });
            setAllrequest(response.data);
            setRequest(response.data);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoading(false);
        }
    }, [token]); // <-- ฟังก์ชันนี้ขึ้นอยู่กับ token

    // (ฟังก์ชัน handleClickRequest ไม่ต้องใช้ useCallback ก็ได้ เพราะไม่ได้ถูกส่งไปที่ไหน)
    const handleClickRequest = async (actionType, requestItem) => {
        
        if (!actionType || !requestItem) return;
        const { request_id, book_id } = requestItem;

        try {
            await axios.patch(
                `${API_URL}/borrow-requests/${request_id}`,
                {
                    action: actionType,
                    book_id: book_id
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setRequest((prev) => prev.filter((item) => item.request_id !== request_id));
            setAllrequest((prev) => prev.filter((item) => item.request_id !== request_id));

        } catch (error) {
            console.error(`Failed to ${actionType} request:`, error);
            alert(error.response?.data?.message || 'An error occurred');
        }
    };

    // useEffect สำหรับ Debounce (อันนี้ดีอยู่แล้ว)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounce(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // useEffect สำหรับการกรอง (อันนี้ดีอยู่แล้ว)
    useEffect(() => {
        let filtered = Allrequest;
        if (debounce) {
            filtered = filtered.filter(req =>
                String(req.user_id).toLowerCase().includes(debounce.toLowerCase())
            );
        }
        setRequest(filtered);
    }, [debounce, Allrequest]);

    // 4. ⬇️ FIX: useEffect สำหรับ Auth Guard และการดึงข้อมูล
    useEffect(() => {
        if (!user || !token) {
            navigate("/login");
        } else {
            fetchPendingRequests();
        }
    }, [user, token, navigate, fetchPendingRequests]); // <-- เพิ่ม fetchPendingRequests เข้าไป


    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // (ส่วน JSX ที่เหลือเหมือนเดิมทั้งหมด)
    return (
        <div>
            <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
                <Nav />
                <div className="flex-1 relative flex flex-col h-screen overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-white border-b border-slate-200 shadow-sm">
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h1 className="text-2xl font-bold text-[#41826e]">ระบบอนุมัติการยืมหนังสือ</h1>
                                        <p className="text-sm text-slate-500">ห้องสมุดมหาวิทยาลัยศิลปากร</p>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Filter Bar */}
                            <div className="flex gap-4 pt-4 ">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        type="text"
                                        className="w-full h-12 pl-12 pr-4 border border-black/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#41826e] focus:border-transparent transition-all"
                                        placeholder="ค้นหารหัสนักศึกษา"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="flex-1 overflow-hidden px-8 py-6">
                        <div className="bg-white rounded-2xl shadow-md h-full overflow-hidden border border-slate-200">
                            <div className="overflow-auto h-full">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">หมายเลขคำร้องขอ</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสนักศึกษา</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสหนังสือ</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">วันที่ร้องขอ</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"></th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                    กำลังโหลดข้อมูล...
                                                </td>
                                            </tr>
                                        ) : request.length > 0 ? (
                                            request.map((items) => (
                                                <tr key={items.request_id} className="hover:bg-blue-50 transition-all cursor-pointer ">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-mono font-semibold text-black/60">
                                                            {items.request_id}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-medium text-black/70">
                                                                {items.user_id}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center text-black/70 py-1 rounded-full text-sm font-medium ">
                                                            {items.book_id}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center py-1 text-[#41826e] rounded-full text-sm font-medium ">
                                                            {formatDate(items.request_date)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            onClick={() => handleClickRequest('approve', items)}
                                                            className="inline-flex items-center py-1  px-3  z-99 bg-amber-500 text-white hover:bg-amber-600 rounded-md border-black/30 text-sm font-medium ">
                                                            อนุมัติ
                                                        </span>
                                                    </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            onClick={() => handleClickRequest('reject', items)}
                                                            className="inline-flex items-center py-1 px-3  z-99 text-sm font-medium  bg-red-400 hover:bg-red-600 text-white rounded-md border-black/30">
                                                            ยกเลิก
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <BookOpen size={48} className="mb-3 opacity-50" />
                                                        <p className="text-sm font-medium">ไม่พบคำร้องขอยืมหนังสือที่รออนุมัติ</p>
                                                        {Allrequest.length > 0 && (
                                                            <p className="text-xs mt-1">ลองค้นหาด้วยรหัสนักศึกษาอื่น</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Approve