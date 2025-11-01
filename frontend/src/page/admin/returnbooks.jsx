import React, { useEffect, useState , useRef } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav";
import { Search, BookOpen, Filter } from 'lucide-react';
import axios from "axios";
import data from "../../../returnbook.json";

function returnbook() {
  const navigate = useNavigate();
  const [debounce, setDebounce] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const [returned, setReturned] = useState(data);
  const [allReturned, setAllReturned] = useState(data);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let filtered = allReturned;

    if (debounce) {

      const searchKeys = ["request_id", "user_id"];

      filtered = filtered.filter(returned => searchKeys.some(key =>
          returned[key]?.toString().toLowerCase().includes(debounce.toLowerCase())
        )
      );
    }

    setReturned(filtered);
  }, [debounce, category, allReturned]);


  const handleReturnBooks = (id) => {

      setReturned(prev =>{ return prev.filter(returned => returned.request_id != id);});
      setAllReturned(prev => prev.filter(returned => returned.request_id !== id));
  }



  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <Nav />  
      
      <div className="flex-1 relative flex flex-col h-screen overflow-hidden">
        {/* Header Section */}
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

            {/* Search and Filter Bar */}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">หมายเลขการยิม</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสนักศึกษา</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสหนังสือ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">วันที่อนุมัติ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">กำหนดการคืน</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"></th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {returned.length > 0 ? (
                    returned.map((items, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-all cursor-pointer ">
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
                          <span className="text-sm text-black/70">{items.approve_date}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">{items.return_date}</span>
                        </td>
                        <td  className="px-6 py-4 whitespace-nowrap text-sm  flex justify-center text-center z-99">
                           <div onClick={() => handleReturnBooks(items.request_id)} className="border px-5 p-1 bg-blue-500 hover:bg-blue-700 text-white rounded-md border-transparent">คืนหนังสือ</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <BookOpen size={48} className="mb-3 opacity-50" />
                          <p className="text-sm font-medium">ไม่พบข้อมูลหนังสือ</p>
                          <p className="text-xs mt-1">ลองค้นหาด้วยคำค้นอื่นหรือเปลี่ยนหมวดหมู่</p>
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

export default returnbook;