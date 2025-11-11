import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/navUser";
import { Search, Filter } from "lucide-react";
import BookCard from "../../components/BookCard"; // ✅ เพิ่มตรงนี้

/*************  ✨ Windsurf Command ⭐  *************/
/*******  419eca73-2d68-4f37-8ce3-03dcccdee689  *******/
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
        <div className="w-full  max-w-3xl bg-white p-5 rounded-xl shadow-md mb-6">
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

        {/* Books Per Page */}
        <div className="w-7xl flex justify-end p-4">
          <div className="mb-0 flex items-center">
            <label className="mr-2 text-sm font-medium">แสดงต่อหน้า : </label>
            <select
              value={booksPerPage}
              onChange={(e) => {
                setBooksPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded p-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* ✅ Books Grid (ใช้ <BookCard />) */}
        <div className="w-full max-w-7xl grid grid-cols-5 gap-3 mb-4">
          {currentBooks.map((book) => (
            <BookCard key={book.book_id} book={book} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex gap-2 mb-6 pt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ย้อsนกลับ
          </button>

          <span className="px-4 py-2">
            {`${currentPage} / ${totalPages}`}
          </span>

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
