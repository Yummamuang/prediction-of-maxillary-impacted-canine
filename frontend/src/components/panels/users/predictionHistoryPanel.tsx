import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axiosConfig";

type HistoryItem = {
  id: string;
  image_path: string;
  result_path: string;
  confidence_score: number;
  prediction_result: string;
  created_at: string;
  analysis?: unknown;
};

const PredictionHistoryPanel = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get('/history');

        if (response.data.status === "success") {
          setHistory(response.data.history || []);
        } else {
          setError("Failed to fetch prediction history");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Error loading history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewResult = (id: string) => {
    navigate(`/prediction/${id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if formatting fails
    }
  };

  // Helper function to get color based on prediction result
  const getPredictionColor = (result: string) => {
    if (!result) return "";

    if (result.includes("normal")) {
      return "bg-green-100 text-green-800";
    } else if (result.includes("severely")) {
      return "bg-red-100 text-red-800";
    } else if (result.includes("impacted")) {
      return "bg-orange-100 text-orange-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  // Format prediction result
  const formatPrediction = (result: string) => {
    if (!result) return "Unknown";
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 drop-shadow-xs">
        <div className="poppins text-xl font-medium mb-4">Your Prediction History</div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 drop-shadow-xs">
        <h2 className="poppins text-xl font-medium mb-4">Your Prediction History</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Debug - log if history is empty
  if (history.length === 0) {
    console.log("History is empty");
  }

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 drop-shadow-xs">
      <div className="poppins text-xl font-medium mb-4">Your Prediction History</div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fa-solid fa-folder-open text-4xl mb-3"></i>
          <p>No prediction history found</p>
          <p className="text-sm mt-2">Upload and analyze your first image to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getPredictionColor(item.prediction_result)}`}>
                      {formatPrediction(item.prediction_result)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2 max-w-[100px]">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.confidence_score > 0.7 ? 'bg-green-500' :
                            item.confidence_score > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.round(item.confidence_score * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{Math.round(item.confidence_score * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewResult(item.id)}
                      className="text-blue hover:text-blue-700 font-medium text-sm cursor-pointer transition-all duration-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PredictionHistoryPanel;
