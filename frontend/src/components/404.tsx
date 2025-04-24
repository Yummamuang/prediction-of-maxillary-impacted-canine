import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-5">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
