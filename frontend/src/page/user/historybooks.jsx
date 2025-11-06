import React, { useState } from "react";
import Navbar from "../../components/navUser";

const HistoryBook = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <h1 className="text-7xl">ประวัติการยืมรอทำ</h1>
        </div>
    );
};

export default HistoryBook;