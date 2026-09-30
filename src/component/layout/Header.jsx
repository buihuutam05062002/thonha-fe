import React, { useState } from "react";
import logoImg from "../../assets/logo.png";
const NAV_ITEMS = ["Về chúng tôi", "Khách hàng", "Thợ", "Blog"];

function LogoImg({ height = 40 }) {
  return (
    <img
      src={logoImg}
      alt="Thợ Nhà"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-gray-500" />
          <span className="block w-5 h-0.5 bg-gray-500" />
          <span className="block w-5 h-0.5 bg-gray-500" />
        </button>

        <a
          href="#"
          className="flex items-center gap-2.5 md:flex-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <LogoImg height={40} />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-gray-800 hover:text-orange-500 transition-colors duration-150"
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#"
          className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors duration-150 px-4 py-2 rounded-lg"
        >
          Đăng Nhập
        </a>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 shadow-md">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-gray-800 hover:text-orange-500 transition-colors duration-150"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
