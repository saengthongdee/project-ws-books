import { useState ,useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./page/login";
import Manager from "./page/admin/manager";
import Home from "./page/user/home";
import Approve from "./page/admin/approve";
import ReturnBooks from "./page/admin/returnbooks";
import Dashboard from "./page/admin/home";
import BookDetail from "./page/user/BookDetail";
function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path='/' element={ <Navigate to='login'/>}/>
          <Route path='login' element={<Login/>}/>
          <Route path='manager' element={<Manager/>}/>
          <Route path='home' element={<Home/>}/>
          <Route path='approve' element={<Approve/>}/>
          <Route path='returnbooks' element={<ReturnBooks/>}/>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
