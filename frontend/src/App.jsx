import { useState ,useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./page/login";
 
function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path='/' element={ <Navigate to='login'/>}/>
          <Route path='login' element={<Login/>}/>
        </Routes>
      </div>
    </Router>
  );
}



export default App;
