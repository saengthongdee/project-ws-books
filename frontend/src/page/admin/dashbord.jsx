import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/nav";

function Dashboard() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if(!user) {
      navigate("/login");
    }
  });
  
  return (
    <div className="w-screen h-screen bg-amber-200 flex justify-center items-center">
      <Nav />
      <div className="w-[85vw] h-screen bg-red-300 px-8 py-10">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Earum ipsa
        iure iste! Saepe a laboriosam voluptate nam excepturi quas consequuntur
        voluptas? Dicta aperiam optio velit totam quasi, laboriosam natus
        asperiores placeat doloremque, ex cupiditate laborum provident a,
        perspiciatis quos ullam ratione. Corrupti dolores optio, hic a magni
        accusamus totam ut dolor accusantium reprehenderit molestias enim
        laborum eius quidem repellendus porro praesentium recusandae. Non
        commodi magnam sit doloribus, suscipit, dolorum repudiandae nobis illum
        quaerat pariatur quod voluptate, nemo dolores quos amet quasi blanditiis

        quod.
      </div>
    </div>
  );
}

export default Dashboard;
