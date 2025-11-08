import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

export default function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:3000/books/${id}`)
            .then(res => setBook(res.data.result))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="max-w-6xl mx-auto p-6">กำลังโหลด...</div>;
    if (!book) return <div className="max-w-6xl mx-auto p-6">ไม่พบหนังสือ</div>;

    const available = book.available ?? 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-4">
                    <Link to="/" className="text-sm text-emerald-700 hover:underline">← กลับหน้ารายการ</Link>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-[280px,1fr] gap-10">
                    
                    {/* รูปหนังสือ */}
                    <div className="flex justify-center items-start">
                        <img
                            src={book.cover_image}
                            alt={book.title}
                            className="rounded-xl shadow-lg object-contain max-h-[480px] w-auto"
                        />
                    </div>

                    {/* รายละเอียด */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                        <p className="mt-2 text-gray-700 text-base leading-relaxed">ผู้แต่ง: {book.author}</p>

                        <div className="mt-3 text-gray-600 text-sm leading-relaxed space-y-1">
                            <p>หมวดหมู่: {book.category_name}</p>
                            <p>ISBN: {book.isbn}</p>
                            <p>จำนวนทั้งหมด / คงเหลือ: {book.total_quantity} / {available} เล่ม</p>
                        </div>

                        {/* รายละเอียดหนังสือ */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-2">รายละเอียด</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {book.description || "ยังไม่มีคำอธิบาย"}
                            </p>
                        </div>
                        {/* ปุ่มเว้นระยะเพิ่ม */}
                        <div className="mt-7 flex flex-wrap gap-3">
                            <button
                                className="px-6 py-3 rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300 disabled:text-gray-600"
                                disabled={available <= 0}
                                onClick={() => alert('ยืมหนังสือ (demo)')}
                            >
                                {available > 0 ? "ยืมหนังสือ" : "คิวจอง"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
