import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/navUser";
import { Search, BookOpen, Filter } from "lucide-react";

function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");

  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(20);

  useEffect(() => {
    axios.get("http://localhost:3000/books").then((res) => {
      setBooks(res.data.results);
    });
  }, []);

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search);
    const matchesCategory =
      category === "ทั้งหมด" || b.category_name === category;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center w-full px-4 pt-6">
        {/* Search Box */}
        <div className="w-full max-w-3xl bg-white p-5 rounded-xl shadow-md mb-6">
          <div className="flex gap-3 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ชื่อเรื่อง, ผู้แต่ง, ISBN หรือคำสำคัญ"
                className="w-full border p-3 rounded-lg pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative md:w-64">
              <Filter
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500 pointer-events-none"
                size={20}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 pl-12 pr-10 border border-black/50 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#41826e] appearance-none cursor-pointer w-full font-medium text-slate-700"
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

        <div className="w-7xl flex justify-end p-4">
          <div className="mb-0"> {/* ลบ margin-bottom เพื่อจัดในบรรทัดเดียว */}
            <label className="mr-2 text-sm font-medium">แสดงต่อหน้า : </label>
            <select
              value={booksPerPage}
              onChange={(e) => {
                setBooksPerPage(Number(e.target.value));
                setCurrentPage(1); // reset หน้าแรก
              }}
              className="border rounded p-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>


        {/* Books Grid */}
        <div className="w-full max-w-7xl grid grid-cols-5 gap-3 mb-4">
  {currentBooks.map((book) => (
    <div
      key={book.book_id}
      className="bg-white rounded-xl shadow overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
    >
      <div className="w-full h-80 bg-gray-50 p-4 flex items-center justify-center">
        {book.cover_image ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={book.cover_image}
              alt={book.title}
              className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl rounded-sm"
              style={{
                filter: 'drop-shadow(8px 8px 12px rgba(0, 0, 0, 0.3))'
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex flex-col items-center justify-center text-slate-400">
              <BookOpen size={48} className="mb-3 opacity-50" />
              <p className="text-sm font-medium">
                ไม่พบรูปภาพหนังสือ
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h2 className="font-semibold text-lg truncate">{book.title}</h2>
        <p className="font-semibold text-sm text-gray-600 truncate">ผู้แต่ง : {book.author}</p>
        <p className="mt-1 text-green-600 text-xs">
          {book.available > 0
            ? `พร้อมยืม ${book.available} เล่ม ✅`
            : "ไม่พร้อมยืม ❌"}
        </p>
      </div>
    </div>
  ))}
</div>

        {/* Pagination Buttons */}
        <div className="flex gap-2 mb-6 pt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ย้อนกลับ
          </button>
          <span className="px-4 py-2">{`${currentPage} / ${totalPages}`}</span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
        <div className="pt-5"></div>
      </div>
    </div>
  );
}

export default Home;
