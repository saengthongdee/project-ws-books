import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Navbar from "../../components/navUser";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatDate = (dateString) => {
    if (!dateString || dateString === "NaN") {
        return "-";
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "-";
        }
        return date.toLocaleString("th-TH-u-ca-buddhist", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (e) {
        return "-";
    }
};

const getStatusComponent = (status) => {
    let className = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ";
    let text = status;
    switch (status?.toLowerCase()) {
        case "pending":
            className += "bg-yellow-100 text-yellow-800";
            text = "รออนุมัติ";
            break;
        case "returned":
            className += "bg-green-100 text-green-800";
            text = "คืนแล้ว";
            break;
        case "returned_late":
            className += "bg-red-100 text-red-800";
            text = "คืนล่าช้า";
            break;
        case "approved":
            className += "bg-green-100 text-green-800";
            text = "อนุมัติแล้ว";
            break;
        case "rejected":
            className += "bg-red-100 text-red-800";
            text = "ไม่อนุมัติ";
            break;
        default:
            className += "bg-gray-100 text-gray-800";
            text = status || "ไม่ทราบสถานะ";
    }
    return <span className={className}>{text}</span>;
};


const statusOptions = [
    { value: "all", label: "สถานะทั้งหมด" },
    { value: "pending", label: "รออนุมัติ" },
    { value: "approved", label: "อนุมัติแล้ว" },
    { value: "rejected", label: "ไม่อนุมัติ" },
    { value: "returned", label: "คืนแล้ว" },
    { value: "returned_late", label: "คืนล่าช้า" },
];

const HistoryBook = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: 'request_date', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const user = JSON.parse(localStorage.getItem("user"));

                if (!user?.user_id) {
                    toast.error(" กำลังพาไปหน้า login เพื่อยืมหนังสือ");
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                    return;
                }

                const userId = user.user_id;
                const response = await axios.get(`http://localhost:3000/borrow-history/${userId}`);

                if (Array.isArray(response.data)) {
                    setHistory(response.data);
                } else {
                    console.error("API did not return an array:", response.data);
                    toast.error("ข้อมูลที่ได้รับจาก Server ไม่ถูกต้อง");
                    setHistory([]);
                }

            } catch (err) {
                setError(err.message);
                toast.error("ไม่สามารถโหลดประวัติการยืมได้: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const processedData = useMemo(() => {
        let filteredData = [...history];

        if (filterStatus !== "all") {
            filteredData = filteredData.filter(item => item.status === filterStatus);
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.book_title.toLowerCase().includes(lowerSearchTerm) ||
                item.category_name.toLowerCase().includes(lowerSearchTerm)
            );
        }

        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredData;
    }, [history, searchTerm, filterStatus, sortConfig]);

    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = processedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
        setCurrentPage(1);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-10">กำลังโหลดข้อมูล...</div>;
        }

        if (error) {
            return <div className="text-center p-10 text-red-600">เกิดข้อผิดพลาด: {error}</div>;
        }

        if (history.length === 0) {
            return <div className="text-center p-10 text-gray-500">ไม่พบประวัติการยืม-คืน</div>;
        }

        return (
            <div className="bg-white shadow rounded-lg overflow-x-auto">

                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อหนังสือ, หมวดหมู่..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="p-2 border border-gray-300 rounded-md w-full md:w-1/3"
                    />
                    <select
                        value={filterStatus}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('book_title')} className="uppercase font-medium">
                                    ชื่อหนังสือ{getSortIcon('book_title')}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('category_name')} className="uppercase font-medium">
                                    หมวดหมู่{getSortIcon('category_name')}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('request_date')} className="uppercase font-medium">
                                    วันที่ร้องขอ{getSortIcon('request_date')}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('approve_date')} className="uppercase font-medium">
                                    วันที่อนุมัติ{getSortIcon('approve_date')}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('due_date')} className="uppercase font-medium">
                                    กำหนดคืน{getSortIcon('due_date')}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('status')} className="uppercase font-medium">
                                    สถานะ{getSortIcon('status')}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? (
                            <>

                                {paginatedData.map((item) => (
                                    <tr key={item.request_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.book_title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.request_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.approve_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.due_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusComponent(item.status)}</td>
                                    </tr>
                                ))}

                                {Array.from({ length: rowsPerPage - paginatedData.length }).map((_, index) => (
                                    <tr key={`empty-${index}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs text-transparent">.</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs text-transparent">.</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs text-transparent">.</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs text-transparent">.</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs text-transparent">.</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs text-transparent">.</span>
                                        </td>
                                    </tr>
                                ))}

                            </>
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-10 text-gray-500">
                                    ไม่พบรายการที่ตรงกับการค้นหา
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="p-4 flex justify-between items-center border-t border-gray-200">
                        <span className="text-sm text-gray-700">
                            หน้า {currentPage} จาก {totalPages} (ทั้งหมด {processedData.length} รายการ)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ย้อนกลับ
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="p-6 w-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default HistoryBook;