import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../../organisms/admin-header/adminHeader';
import AdminSidebar from '../../organisms/admin-sidebar/adminSidebar';
import './admin-layout.scss';

function AdminLayout() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

  const OpenSidebar = () => {
    setOpenSidebarToggle((prev) => !prev);
  };

  return (
    <div className="AdminPage-contain admin-layout">
      <div className="grid-container">
        <AdminHeader OpenSidebar={OpenSidebar} />
        <AdminSidebar
          openSidebarToggle={openSidebarToggle}
          OpenSidebar={OpenSidebar}
        />
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
