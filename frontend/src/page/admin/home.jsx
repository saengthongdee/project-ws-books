import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav";
import { BookText, Plus, Search, BookOpen, Filter } from "lucide-react";
import axios from "axios";
import data from "../../../list.json";

function Dashboard() {
  const navigate = useNavigate();
  const [debounce, setDebounce] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [list, setList] = useState(data);
  const [allList, setAllList] = useState(data);

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
    let filtered = allList;

    if (debounce) {
      const searchKeys = [
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

  const handleDelete = (id) => {
    setList((prev) => {
      return prev.filter((list) => list.book_id != id);
    });
    setAllList((prev) => prev.filter((list) => list.book_id !== id));
  };

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
                  <h1 className="text-2xl font-bold text-[#41826e]">
                    รายการคำร้องทั้งหมด
                  </h1>
                  <p className="text-sm text-slate-500">
                    ห้องสมุดมหาวิทยาลัยศิลปากร
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
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
                  {list.length > 0 ? (
                    list.map((items, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition-all cursor-pointer "
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm  text-black/70">
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
                            {items.request_date}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">
                            {items.approve_date ?? "NaN"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">
                            {items.return_date ?? "NaN"}
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
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <BookOpen size={48} className="mb-3 opacity-50" />
                          <p className="text-sm font-medium">
                            ไม่พบข้อมูลหนังสือ
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
