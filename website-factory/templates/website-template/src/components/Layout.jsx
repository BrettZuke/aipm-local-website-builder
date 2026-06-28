import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileCtaBar from './MobileCtaBar';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="w-full pb-16 lg:pb-0">
      <header className="sticky top-0 z-50">
        <TopBar />
        <Navbar />
      </header>
      <main>{children}</main>
      <Footer />
      <MobileCtaBar />
    </div>
  );
}
