import { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  PlusSquare,
  Menu,
  X,
  Home,
  Utensils,
  Heart,
  Settings,
  Bell,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchInput from "./SearchInput";
import axios from "axios";
import socketIOClient from "socket.io-client";
import { useSelector } from "react-redux";

const Header = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Utensils, label: "My Recipes", path: "/profile" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
  ];

  const bottomNavItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Logout moved to Settings page

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };

    updateNavbarHeight();
    window.addEventListener("resize", updateNavbarHeight);

    return () => {
      window.removeEventListener("resize", updateNavbarHeight);
    };
  }, []);

  const ENDPOINT = "http://localhost:5000/api/v1/notification/message";
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${ENDPOINT}`, {
          withCredentials: true,
        });
        setNotifications(response.data);
      } catch (error) {
        console.log(error);
      }

      // {

      // Set up Socket.io client
      // const socket = socketIOClient(ENDPOINT);

      // socket.on("notification", (data) => {
      //   setNotifications((prevNotifications) => [
      //     data,
      //     ...prevNotifications,
      //   ]);
      // });
      // }
    };
    fetchNotifications();
    socketRef.current = socketIOClient(ENDPOINT, {
      withCredentials: true,
      transports: ["websocket", "polling", "flashsocket"],
    });

    socketRef.current.emit("join", currentUser._id);
    socketRef.current.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      console.log(notifications);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  return (
    <>
      <header ref={navbarRef} className="sticky z-50 top-0 bg-white shadow-sm">
        <div className="px-4 py-3 md:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleMobileMenuToggle}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
              <h1
                className="text-xl md:text-2xl font-bold text-gray-800 cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => navigate("/")}
              >
                CookPal
              </h1>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <SearchInput />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/create-recipe")}
                className="flex items-center justify-center gap-2 p-2 md:px-4 md:py-2 rounded-full transition-colors font-medium bg-orange-100 text-orange-500 hover:bg-orange-200"
              >
                <PlusSquare className="h-5 w-5" />
                <span className="hidden md:block">Create Recipe</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <User className="h-6 w-6 text-gray-600" />
              </button>
              <button>
                <Bell width="20px" height="30px" />
                <p className="text-black -[w-4] z-50">
                  {notifications.length}
                  {0}
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <SearchInput />
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute left-0 right-0 bg-white border-b border-gray-200"
            style={{ top: `${navbarHeight}px` }}
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-orange-500 ${
                    isActive(item.path)
                      ? " bg-orange-100"
                      : "hover:bg-orange-200"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}

              <div className="border-t my-2" />

              {bottomNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
