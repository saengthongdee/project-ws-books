import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/navUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false); // กันการกดปุ่มซ้ำ

    useEffect(() => {
        axios.get(`http://localhost:3000/books/${id}`)
            .then(res => setBook(res.data.result))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBorrowRequest = async () => {
        setIsSubmitting(true);
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?.user_id) {
            toast.error(" กำลังพาไปหน้า login เพื่อยืมหนังสือ");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
            setIsSubmitting(false);
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:3000/borrow-requests',
                {
                    book_id: id,
                    user_id: user?.user_id
                }
            );

            if (response.status === 201) {
                toast.success(" ส่งคำขอยืมสำเร็จ! รอดำเนินการ");
                
            }
        } catch (error) {
            console.error('Error creating borrow request:', error);
            const errorText = error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืม';
            toast.error((errorText || "เกิดข้อผิดพลาดในการยืม"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="max-w-6xl mx-auto p-6">กำลังโหลด...</div>;
    if (!book) return <div className="max-w-6xl mx-auto p-6">ไม่พบหนังสือ</div>;

    const available = book.available ?? 0;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-6xl w-full mx-auto p-6">
                    <div className="mb-4">
                        <Link to="/" className="text-sm text-emerald-700 hover:underline">← กลับหน้ารายการ</Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-12">

                        {/* รูปหนังสือ */}
                        <div className="flex justify-center items-start">
                            <img
                                src={book.cover_image}
                                alt={book.title}
                                className="rounded-xl shadow-lg object-contain w-full max-w-[380px] max-h-[520px]"
                            />
                        </div>

                        {/* รายละเอียด */}
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                            <p className="mt-2 text-gray-700 text-base leading-relaxed">ผู้แต่ง: {book.author}</p>

                            <div className="mt-3 text-gray-600 text-sm leading-relaxed space-y-1">
                                <p>หมวดหมู่: {book.category_name}</p>
                                <p>ISBN: {book.isbn}</p>
                                <p>จำนวนทั้งหมด: {book.total_quantity} เล่ม</p>
                                <p>คงเหลือ: {available} เล่ม</p>
                            </div>

                            {/* รายละเอียดหนังสือ */}
                            <div className="mt-8 pt-6">
                                <h2 className="text-xl font-semibold mb-2">รายละเอียด</h2>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                    {book.description || "ยังไม่มีคำอธิบาย"}
                                </p>
                            </div>

                            {/* ปุ่ม */}
                            <div className="mt-8 pt-6">
                                <button
                                    className="px-6 py-3 rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300 disabled:text-gray-600"
                                    disabled={available <= 0}
                                    onClick={handleBorrowRequest}
                                >
                                    {available > 0 ? "ยืมหนังสือ" : "ไม่สามารถยืมได้"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>

    );
}
