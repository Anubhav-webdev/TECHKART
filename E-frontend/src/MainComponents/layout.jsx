import { Outlet } from "react-router-dom";
import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";

function Layout() {
     return (
          <div className="flex flex-col min-h-screen justify-between font-orbitron">
               <Header />
               <Outlet />
               <Footer />
          </div>
     );
}

export default Layout;
