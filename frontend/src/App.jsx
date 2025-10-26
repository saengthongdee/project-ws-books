import { useState ,useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./page/login";
import Dashboard from "./page/admin/dashbord";
import Home from "./page/user/home";
import Approve from "./page/admin/approve";
import ReturnBooks from "./page/admin/returnbooks"
 
function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path='/' element={ <Navigate to='login'/>}/>
          <Route path='login' element={<Login/>}/>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path='home' element={<Home/>}/>
          <Route path='approve' element={<Approve/>}/>
          <Route path='returnbooks' element={<ReturnBooks/>}/>
        </Routes>
      </div>
    </Router>
  );
}



export default App;
