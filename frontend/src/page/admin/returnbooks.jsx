import React, { useEffect, useState, useMemo, useCallback } from "react"; // 1. เพิ่ม useMemo, useCallback
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav";
import { Search, BookOpen } from 'lucide-react'; // 2. ลบ Filter (ไม่ได้ใช้)
import axios from "axios";
// import data from "../../../returnbook.json"; // 3. ลบข้อมูลปลอม

// 4. กำหนด API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 5. เปลี่ยนชื่อ component เป็นตัวพิมพ์ใหญ่
function ReturnBook() { 
  const navigate = useNavigate();
  const [debounce, setDebounce] = useState('');
  const [search, setSearch] = useState('');
  
  // 6. ตั้งค่าเริ่มต้นเป็น Array ว่าง
  const [returned, setReturned] = useState([]);
  const [allReturned, setAllReturned] = useState([]);
  const [loading, setLoading] = useState(true); // 7. เพิ่ม state สำหรับ loading

  // 8. ⬇️ FIX: ใช้ useMemo เพื่อให้ user, token "คงที่"
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const token = useMemo(() => localStorage.getItem('token'), []);

  // 9. ⬇️ FIX: สร้างฟังก์ชันดึงข้อมูล "approved"
  const fetchApprovedRequests = useCallback(async () => {
    setLoading(true);
    try {
      // 10. ⬇️ FIX: เรียก API ใหม่ที่เราเพิ่งสร้าง
      const response = await axios.get(`${API_URL}/borrow-requests/approved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllReturned(response.data);
      setReturned(response.data);
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    } finally {
      setLoading(false);
    }
  }, [token]); // ฟังก์ชันนี้ขึ้นอยู่กับ token

  // 11. ⬇️ FIX: useEffect สำหรับ Auth Guard และดึงข้อมูล
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    } else {
      fetchApprovedRequests(); // ถ้า login แล้ว ให้ดึงข้อมูล
    }
  }, [user, token, navigate, fetchApprovedRequests]); 

  // useEffect สำหรับ Debounce (ดีอยู่แล้ว)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // useEffect สำหรับ Filter (ดีอยู่แล้ว)
  useEffect(() => {
    let filtered = allReturned;
    if (debounce) {
      const searchKeys = ["request_id", "user_id"];
      filtered = filtered.filter(item => searchKeys.some(key =>
          item[key]?.toString().toLowerCase().includes(debounce.toLowerCase())
        )
      );
    }
    setReturned(filtered);
  }, [debounce, allReturned]); // 12. ลบ category ออก

  // 13. ⬇️ FIX: แก้ไข handleReturnBooks ให้ยิง API
  const handleReturnBooks = async (requestItem) => {
    // (requestItem คือ object ของรายการนั้นๆ)
    
    if (!requestItem) return;

    const { request_id, book_id } = requestItem;

    try {
      // 14. ⬇️ FIX: ส่งคำสั่ง "return" ไปที่ Backend
      await axios.patch(
        `${API_URL}/borrow-requests/${request_id}`,
        {
          action: 'return', // บอกว่าเป็นการ "คืน"
          book_id: book_id  // ส่ง book_id ไปด้วย (จำเป็นสำหรับการคืน stock)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 15. ⬇️ FIX: ถ้าสำเร็จ ลบออกจากหน้าจอ (เหมือนเดิม)
      setReturned(prev => prev.filter(item => item.request_id !== request_id));
      setAllReturned(prev => prev.filter(item => item.request_id !== request_id));

    } catch (error) {
      console.error('Failed to return book:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  // 16. ⬇️ FIX: เพิ่มฟังก์ชันจัดรูปแบบวันที่
  const formatDate = (dateString) => {
    if (!dateString) return "NaN";
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
                  <h1 className="text-2xl font-bold text-[#41826e]">ระบบการคืนหนังสือ</h1>
                  <p className="text-sm text-slate-500">ห้องสมุดมหาวิทยาลัยศิลปากร</p>
                </div>
              </div>  
            </div>

            {/* Search and Filter Bar (เหมือนเดิม) */}
            <div className="flex gap-4 pt-4 ">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  className="w-full h-12 pl-12 pr-4 border border-black/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#41826e] focus:border-transparent transition-all"
                  placeholder="ค้นหารหัสนักศึกษา, หมายเลขการยืม"
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
                    {/* (ส่วนหัวตาราง เหมือนเดิม) */}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">หมายเลขการยืม</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสนักศึกษา</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสหนังสือ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">วันที่อนุมัติ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">กำหนดการคืน</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {/* 17. ⬇️ FIX: เพิ่ม Loading check */}
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : returned.length > 0 ? (
                    returned.map((items) => ( // 18. ⬇️ FIX: ใช้ request_id เป็น key
                      <tr key={items.request_id} className="hover:bg-blue-50 transition-all cursor-pointer ">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm  font-semibold text-black/60">
                            {items.request_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm  text-black/70">
                              {items.user_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">{items.book_id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">{formatDate(items.approve_date)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">{formatDate(items.due_date)}</span> 
                          {/* 19. ⬇️ FIX: เปลี่ยนเป็น due_date */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center text-center z-99">
                          {/* 20. ⬇️ FIX: ส่ง object 'items' ทั้งหมด */}
                          <div onClick={() => handleReturnBooks(items)} className="border px-5 p-1 bg-blue-500 hover:bg-blue-700 text-white rounded-md border-transparent cursor-pointer">
                            คืนหนังสือ
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      {/* 21. ⬇️ FIX: แก้ไข colSpan */}
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <BookOpen size={48} className="mb-3 opacity-50" />
                          <p className="text-sm font-medium">ไม่พบข้อมูลหนังสือที่รอการคืน</p>
                          <p className="text-xs mt-1">
                            {allReturned.length > 0 ? "ลองค้นหาด้วยคำค้นอื่น" : "ไม่มีหนังสือที่ถูกยืมอยู่ในขณะนี้"}
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

export default ReturnBook; // 22. ⬇️ FIX: เปลี่ยนชื่อ export