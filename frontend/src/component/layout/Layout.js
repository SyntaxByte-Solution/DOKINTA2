import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const RootLayout = ({ children }) => {
  return (
    <div className="">
      <div className="mainAdminGrid">
        <Sidebar />
        <div className={`mainAdmin`}>
          <Navbar />
          <main className="comShow">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;  
