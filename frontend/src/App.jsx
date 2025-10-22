import { useState ,useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
 
function App() {

  return (
    <Router>
      <div>
        <Routes>
          {/* <Route path='/' element={ <Navigate to='login'/>}/>
          <Route path='/login' element={ <Login/>}/>
          <Route path='/books' element={ <Books/>}/> */}

        </Routes>
      </div>
    </Router>
  );
}



export default App;
