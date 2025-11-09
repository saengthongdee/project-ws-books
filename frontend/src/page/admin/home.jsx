import React, { useEffect, useState, useMemo, useCallback } from "react"; // 1. เพิ่ม useMemo, useCallback
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav";
import { BookText, Plus, Search, BookOpen, Filter } from "lucide-react";
import axios from "axios";
// import data from "../../../list.json"; // 2. ลบข้อมูลปลอมทิ้ง

// 3. กำหนด API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard() {
  const navigate = useNavigate();
  const [debounce, setDebounce] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  
  // 4. ตั้งค่าเริ่มต้นเป็น Array ว่าง
  const [list, setList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [loading, setLoading] = useState(true); // 5. เพิ่ม state สำหรับ loading

  // 6. ⬇️ FIX: ใช้ useMemo เพื่อให้ user, token "คงที่"
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const token = useMemo(() => localStorage.getItem('token'), []);

  // 7. ⬇️ FIX: สร้างฟังก์ชันดึงข้อมูลจาก API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 8. ⬇️ FIX: เรียก API /borrow-requests/all
      const response = await axios.get(`${API_URL}/borrow-requests/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllList(response.data);
      setList(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]); // ฟังก์ชันนี้ขึ้นอยู่กับ token

  // 9. ⬇️ FIX: useEffect สำหรับ Auth Guard และดึงข้อมูล
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    } else {
      fetchDashboardData(); // ถ้า login แล้ว ให้ดึงข้อมูล
    }
  }, [user, token, navigate, fetchDashboardData]); // 10. เพิ่ม dependency

  // useEffect สำหรับ Debounce (ดีอยู่แล้ว)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // useEffect สำหรับ Filter (ดีอยู่แล้ว)
  useEffect(() => {
    let filtered = allList;

    if (debounce) {
      const searchKeys = [
        "request_id", // 11. แก้ไข field ที่ใช้ค้นหาให้ตรงกับ API
        "book_id",
        "title",
        "category_name",
        "user_id",
      ];

      filtered = filtered.filter((list) =>
        searchKeys.some((key) =>
          list[key]?.toString().toLowerCase().includes(debounce.toLowerCase())
        )
      );
    }

    if (category !== "ทั้งหมด") {
      filtered = filtered.filter((list) => list.category_name === category);
    }

    setList(filtered);
  }, [debounce, category, allList]);

  // 12. ⬇️ (ลบฟังก์ชัน handleDelete ทิ้ง เพราะหน้านี้เป็น Dashboard ไม่ควรลบข้อมูล)
  
  // 13. ⬇️ FIX: เพิ่มฟังก์ชันจัดรูปแบบวันที่ (เหมือนหน้า approve)
  const formatDate = (dateString) => {
    if (!dateString) return "NaN"; // 14. แก้ไข "NaN" ให้สวยงาม
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <Nav />

      <div className="flex-1 relative flex flex-col h-screen overflow-hidden">
        {/* Header Section (เหมือนเดิม) */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#41826e]">
                    รายการคำร้องทั้งหมด
                  </h1>
                  <p className="text-sm text-slate-500">
                    ห้องสมุดมหาวิทยาลัยศิลปากร
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar (เหมือนเดิม) */}
            <div className="flex gap-4 pt-4 ">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  className="w-full h-12 pl-12 pr-4 border border-black/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#41826e] focus:border-transparent transition-all"
                  placeholder="ค้นหาหมายเลขคำร้อง, รหัสนักศึกษา, รหัสหนังสือ"
                />
              </div>

              <div className="relative">
                <Filter
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500 pointer-events-none"
                  size={20}
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 pl-12 pr-10 border border-black/50 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#41826e] focus:border-transparent appearance-none cursor-pointer min-w-[200px] font-medium text-slate-700"
                >
                  <option value="ทั้งหมด">ทุกหมวดหมู่</option>
                  <option value="นิยาย">นิยาย</option>
                  <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
                  <option value="ประวัติศาสตร์">ประวัติศาสตร์</option>
                  <option value="จิตวิทยา">จิตวิทยา</option>
                  <option value="เทคโนโลยี">เทคโนโลยี</option>
                  <option value="ธุรกิจและการเงิน">ธุรกิจและการเงิน</option>
                  <option value="ศิลปะและวัฒนธรรม">ศิลปะและวัฒนธรรม</option>
                  <option value="การพัฒนาตนเอง">การพัฒนาตนเอง</option>
                </select>
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
                    {/* (ส่วนหัวตาราง เหมือนเดิม) */}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสนักศึกษา</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสหนังสือ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">วันที่ร้องขอ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">วันที่อนุมัติ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">กำหนดคืน</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">หมวดหมู่</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {/* 15. ⬇️ FIX: เพิ่ม Loading check */}
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : list.length > 0 ? (
                    list.map((items) => ( // 16. ⬇️ FIX: ใช้ request_id เป็น key
                      <tr
                        key={items.request_id} 
                        className="hover:bg-blue-50 transition-all cursor-pointer "
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm  text-black/70">
                              {items.user_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">
                            {items.book_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">
                            {formatDate(items.request_date)} {/* 17. ⬇️ FIX: ใช้ formatDate */}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">
                            {formatDate(items.approve_date)} {/* 17. ⬇️ FIX: ใช้ formatDate */}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">
                            {formatDate(items.due_date)} {/* 18. ⬇️ FIX: แก้ไขเป็น due_date */}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center py-1 text-black/70 rounded-full text-sm font-medium ">
                            {items.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                            ${
                              items.status === "pending"
                                ? "text-yellow-500"
                                : items.status === "approved"
                                ? "text-green-600"
                                : items.status === "rejected"
                                ? " text-red-500"
                                : items.status === "returned"
                                ? " text-blue-500"
                                : items.status === "returned_late"
                                ? "text-orange-500"
                                : ""
                            }`}
                          >
                            {/* (ส่วนนี้ดีอยู่แล้ว) */}
                            {items.status === "pending" && "รอดำเนินการ"}
                            {items.status === "approved" && "อนุมัติแล้ว"}
                            {items.status === "rejected" && "ไม่อนุมัติ"}
                            {items.status === "returned" && "คืนแล้ว"}
                            {items.status === "returned_late" && "คืนล่าช้า"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {/* 19. ⬇️ FIX: แก้ไข colSpan ให้ถูกต้อง */}
                      <td colSpan="7" className="px-6 py-12 text-center"> 
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <BookOpen size={48} className="mb-3 opacity-50" />
                          <p className="text-sm font-medium">
                            ไม่พบข้อมูลคำร้อง
                          </p>
                          <p className="text-xs mt-1">
                            ลองค้นหาด้วยคำค้นอื่นหรือเปลี่ยนหมวดหมู่
                          </p>
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
  );
}

export default Dashboard;