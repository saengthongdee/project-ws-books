import React, { useEffect, useState , useRef } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav";
import { BookText, Plus, Search, BookOpen, Filter } from 'lucide-react';
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [debounce, setDebounce] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const [books, setBooks] = useState([]);
  const [allbooks, setAllbooks] = useState([]);
  const [avtiveCreate  , setActiveCreate] = useState(false);

  //state creaet 
  const [title_create , setTitle] = useState('');
  const [author_create , setAuthor] = useState('');
  const [category_create , setcategory] = useState('');
  const [quantity_create , setQuantity] = useState(1);
  const [isbn_create , setIsbn] = useState('');
  const [description_create , setDescription] = useState('');
  const [image_create , setImage] = useState('');

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleCreate = () => {
      
    if( !title_create?.trim() || !author_create?.trim() || 
        !category_create?.trim() || !quantity_create?.trim() ||
        !isbn_create?.trim() || !description_create?.trim() || 
        !image_create?.trim()) 
      return;

    setActiveCreate(false);

    setTitle('');
    setAuthor('');
    setcategory('');
    setQuantity('');
    setIsbn('');
    setDescription('');
    setImage('');
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/books');
        if (response.status === 200) {
          setBooks(response.data.results);
          setAllbooks(response.data.results);
        }
      } catch (error) {
        console.log('fetching error', error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let filtered = allbooks;

    if (debounce) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(debounce.toLowerCase())
      );
    }

    if (category !== 'ทั้งหมด') {
      filtered = filtered.filter(book => book.category_name === category);
    }

    setBooks(filtered);
  }, [debounce, category, allbooks]);

  const handleDelete = (id) => {

      setBooks(prev =>{ return prev.filter(book => book.book_id != id);});
      setAllbooks(prev => prev.filter(book => book.book_id !== id));
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
                  <h1 className="text-2xl font-bold text-[#41826e]">ระบบจัดการหนังสือ</h1>
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
                  placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN..."
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500 pointer-events-none" size={20} />
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

              <button onClick={() => setActiveCreate(true)} className="bg-[#41826e] text-sm  text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg">
                <Plus size={20} /> <span className="font-medium">เพิ่มหนังสือ</span>
              </button>

            {avtiveCreate && (
              <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]">
                <div className="bg-white w-200 max-w-[90%]  rounded-xl shadow-lg p-6 animate-fadeIn">
                  <h1 className="text-2xl font-bold mb-4 text-center text-[#1e293b]">สร้างหนังสือใหม่</h1>
                  
                  <div className="space-y-3 flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อหนังสือ</label>
                      <input required value={title_create} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full border border-black/40 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#41826e] outline-none" />
                    </div>

                    <div  className="flex flex-col">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อผู้แต่ง</label>
                      <input required value={author_create} onChange={(e) => setAuthor(e.target.value)} type="text" className="w-full border border-black/40 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#41826e] outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">หมวดหมู่</label>
                      <select required value={category_create} onChange={(e) => setcategory(e.target.value)} className="w-full border border-black/40 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#41826e] outline-none">
                        <option value="">เลือกหมวดหมู่</option>
                        <option value="1">นิยาย</option>
                        <option value="2">วิทยาศาสตร์</option>
                        <option value="3">ประวัติศาสตร์</option>
                        <option value="4">จิตวิทยา</option>
                        <option value="5">เทคโนโลยี</option>
                        <option value="6">ธุรกิจและการเงิน</option>
                        <option value="7">ศิลปะและวัฒนธรรม</option>
                        <option value="8">การพัฒนาตนเอง</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">จำนวนหนังสือ</label>
                      <input required value={quantity_create} onChange={(e) => setQuantity(e.target.value)} type="number" min={1} className="w-full border border-black/40 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#41826e] outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">ISBN</label>
                      <input required value={isbn_create} onChange={(e) => setIsbn(e.target.value)} type="text" className="w-full border border-black/40 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#41826e] outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">รายละเอียด</label>
                      <input required value={description_create} onChange={(e) => setDescription(e.target.value)} type="text" className="w-full border border-black/40 rounded-md p-2  text-sm focus:ring-1 focus:ring-[#41826e] outline-none" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">รูปภาพ (URL)</label>
                      <input required value={image_create} onChange={(e) => setImage(e.target.value)} type="text" className="w-full border border-black/40 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#41826e] outline-none" />
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-3 pt-6">
                    <button className="w-1/2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition" onClick={() => setActiveCreate(false)}> ยกเลิก </button>
                    <button onClick={handleCreate} className="w-1/2 px-4 py-2 rounded-md bg-[#41826e] text-white hover:bg-[#224e41] transition">ตกลง</button>
                  </div>
                </div>
              </div>
            )}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">รหัสหนังสือ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">ชื่อหนังสือ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">ผู้แต่ง</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">หมวดหมู่</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">คงเหลือ</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {books.length > 0 ? (
                    books.map((book, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-all cursor-pointer ">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-black/60">
                            {book.book_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-black/70">
                              {book.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-black/70">{book.author}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center py-1 text-[#41826e] rounded-full text-sm font-medium ">
                            {book.category_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold `}>
                            {book.available} เล่ม
                          </span>
                        </td>
                        <td  className="px-6 py-4 whitespace-nowrap text-sm  flex justify-center text-center z-99">
                           <div onClick={() => handleDelete(book.book_id)} className="border px-5 p-1 bg-red-400 text-white rounded-md border-transparent">ลบ</div>
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

export default Dashboard;