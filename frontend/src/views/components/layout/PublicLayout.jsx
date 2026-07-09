import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import PublicBottomNav from './Navbar/PublicBottomNav';

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main className="public-main-content">
        <Outlet />
      </main>
      <Footer />
      <PublicBottomNav />
    </>
  );
};

export default PublicLayout;
