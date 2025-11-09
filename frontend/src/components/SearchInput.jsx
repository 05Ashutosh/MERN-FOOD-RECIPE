import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SearchInput() {
  const [placeholderText, setPlaceholderText] = useState(
    "What do you want to cook today?"
  );

  const [text, setText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchValue = params.get("search") || "";

  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 768) {
        setPlaceholderText("Search Recipe");
      } else {
        setPlaceholderText("What do you want to cook today?");
      }
    };

    updatePlaceholder();

    window.addEventListener("resize", updatePlaceholder);

    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  return (
    <>
      <input
        type="text"
        placeholder={placeholderText}
        value={text == null ? "" : text}
        onChange={(e) => setText(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </>
  );
}

export default SearchInput;
