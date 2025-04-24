import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../config/axiosConfig";
import { useLoading } from "../../contexts/loadingContext";
import ToggleMenuPanel from "../admin/menu/toggleMenuPanel";
import MeasurementCanvasPanel from "./measurementCanvasPanel";
import { generatePDF } from "../../../utils/reportGenerator";
import ImageModal from "../../common/ImageModal";

// Type definitions for keypoints
type Keypoint = {
  label: string;
  x: number;
  y: number;
  confidence: number;
};

// Type definitions for analysis results
type AnalysisResult = {
  side_analyses?: {
    left?: {
      sector_analysis?: {
        sector: number;
        impaction_type: string;
      };
      canine_assessment?: {
        overlap: string;
        vertical_height: string;
        root_position: string;
        eruption_difficulty: string;
      };
      angle_measurements?: {
        angle_with_midline?: {
          value: number;
          difficulty: string;
        };
        angle_with_lateral?: {
          value: number;
          difficulty: string;
        };
        angle_with_occlusal?: {
          value: number;
          difficulty: string;
        };
        distance_to_occlusal?: number;
        distance_to_midline?: number;
      };
      difficult_factors?: number;
      prediction_result: string;
      side: string;
    };
    right?: {
      sector_analysis?: {
        sector: number;
        impaction_type: string;
      };
      canine_assessment?: {
        overlap: string;
        vertical_height: string;
        root_position: string;
        eruption_difficulty: string;
      };
      angle_measurements?: {
        angle_with_midline?: {
          value: number;
          difficulty: string;
        };
        angle_with_lateral?: {
          value: number;
          difficulty: string;
        };
        angle_with_occlusal?: {
          value: number;
          difficulty: string;
        };
        distance_to_occlusal?: number;
        distance_to_midline?: number;
      };
      difficult_factors?: number;
      prediction_result: string;
      side: string;
    };
  };
  sector_analysis?: {
    sector: number;
    impaction_type: string;
  };
  canine_assessment?: {
    overlap: string;
    vertical_height: string;
    root_position: string;
    eruption_difficulty: string;
  };
  angle_measurements?: {
    angle_with_midline?: {
      value: number;
      difficulty: string;
    };
    angle_with_lateral?: {
      value: number;
      difficulty: string;
    };
    angle_with_occlusal?: {
      value: number;
      difficulty: string;
    };
    distance_to_occlusal?: number;
    distance_to_midline?: number;
  };
  difficult_factors?: number;
  prediction_result: string;
  error?: string;
  warning?: string;
  note?: string;
  midline?: unknown;
  sector_lines?: unknown;
  occlusal_plane?: unknown;
  canine_axis?: unknown;
  lateral_axis?: unknown;
};

// Type definitions for detection results
type DetectionResult = {
  id: string;
  user_id: string;
  image_path: string;
  result_path: string;
  confidence_score: number;
  prediction_result: string;
  keypoints: Keypoint[];
  analysis: AnalysisResult;
  created_at: string;
};

const PredictionPanel = () => {
  // Get detection ID from URL parameters
  const { detectionId } = useParams();
  // Access the loading context
  const { setLoading } = useLoading();
  // Navigation hook
  const navigate = useNavigate();

  // State for detection results and images
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");
  const [segmentationImage, setSegmentationImage] = useState<string>("");
  const [activeSide, setActiveSide] = useState<string>("right");

  // State for interactive view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showInteractive, setShowInteractive] = useState<boolean>(false);
  const [isInteractiveModalOpen, setIsInteractiveModalOpen] =
    useState<boolean>(false);

  // State for image modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<string>("");

  // Fetch prediction results when component mounts or detectionId changes
  useEffect(() => {
    const fetchPredictionResult = async () => {
      setLoading(true);
      try {
        if (!detectionId) {
          setError("Detection ID is missing");
          setTimeout(() => setLoading(false), 200);
          return;
        }

        const response = await axiosInstance.get(`/detection/${detectionId}`);

        if (response.data.status === "success") {
          setResult(response.data.detection);

          // Set segmentation data if available
          if (response.data.detection.segmentation) {
            // Set segmentation image if available
            if (response.data.detection.segmentation.result_image) {
              const segFilename =
                response.data.detection.segmentation.result_image;
              setSegmentationImage(
                `${axiosInstance.defaults.baseURL}/results/${segFilename}`,
              );
            }
          }

          // Get the image paths and fetch images
          const imagePath = response.data.detection.image_path;
          const resultPath = response.data.detection.result_path;

          // Get the filename from the path
          const originalFilename = imagePath.split("/").pop();
          const resultFilename = resultPath.split("/").pop();

          // Set image URLs
          setOriginalImage(
            `${axiosInstance.defaults.baseURL}/uploads/${originalFilename}`,
          );
          setResultImage(
            `${axiosInstance.defaults.baseURL}/results/${resultFilename}`,
          );
          setTimeout(() => setLoading(false), 200);
        } else {
          setError(
            response.data.message || "Error retrieving prediction result",
          );
          setTimeout(() => setLoading(false), 200);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching prediction:", err);
        setError("Failed to fetch prediction result");
        setTimeout(() => setLoading(false), 200);
      }
    };

    fetchPredictionResult();
  }, [detectionId, setLoading]);

  // Format date string to localized format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Navigate back to dashboard
  const handleGoBack = () => {
    navigate("/dashboard");
  };

  // Export results to PDF
  const handleExportPDF = () => {
    if (result) {
      generatePDF(result);
    }
  };

  // Open the image modal
  const openImageModal = (imageSrc: string, title: string) => {
    setModalImage(imageSrc);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  // Open interactive view in fullscreen modal
  const openInteractiveModal = () => {
    setShowInteractive(true);
    setIsInteractiveModalOpen(true);
  };

  // Helper function to format prediction result with proper capitalization
  const formatPredictionResult = (result: string) => {
    if (!result) return "Unknown";

    // Split by spaces to format each word
    return result
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to get color based on prediction result
  const getPredictionColor = (result: string) => {
    if (!result) return "text-gray-600";

    if (result.includes("normal")) {
      return "text-green-600";
    } else if (result.includes("severely")) {
      return "text-red-600";
    } else {
      return "text-orange-600";
    }
  };

  // Show error message if there is an error
  if (error) {
    return (
      <div className="poppins p-4 max-w-4xl mx-auto">
        <ToggleMenuPanel />
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-8"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button className="mt-4 btn-primary" onClick={handleGoBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Show loading state if result is not yet loaded
  if (!result) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <ToggleMenuPanel />
        <div className="bg-white rounded-3xl p-8 drop-shadow-xs flex justify-center items-center min-h-[400px] mt-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-blue-200 h-16 w-16 mb-4 flex items-center justify-center">
              <i className="fa-solid fa-spinner text-blue text-2xl"></i>
            </div>
            <div className="poppins text-lg font-medium text-gray-700">
              Loading prediction result...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="p-4 mx-auto">
      {/* Top navigation bar */}
      <ToggleMenuPanel />
      <div className="flex justify-between items-center mt-8 mb-6 max-w-5xl mx-auto">
        <div className="poppins text-xl font-medium ml-2">
          <span className="mr-1">
            <i className="fa-solid fa-tooth text-blue"></i>
          </span>
          <span className="poppins heading-text"> Canine Analysis Results</span>
        </div>
        <div className="flex gap-4">
          <button
            className="rounded-lg btn-primary flex items-center"
            onClick={handleGoBack}
          >
            <span>
              <i className="fa-solid fa-arrow-left mr-2"></i>
            </span>
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Results Panel */}
      <div className="bg-white rounded-3xl p-4 lg:p-8 drop-shadow-xs max-w-5xl mx-auto">
        {/* Warning message if analysis has a warning */}
        {result.analysis?.warning && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-yellow-400"></i>
              </div>
              <div className="ml-3">
                <p className="poppins text-sm text-yellow-700">
                  <strong>Warning:</strong> {result.analysis.warning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Note message if analysis has a note */}
        {result.analysis?.note && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-circle-info text-blue-400"></i>
              </div>
              <div className="ml-3">
                <p className="poppins text-sm text-blue-700">
                  <strong>Note:</strong> {result.analysis.note}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Images Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original image */}
          <div className="border rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="poppins text-lg font-medium">Original X-ray</div>
              <div className="flex gap-2">
                {/* Interactive View button - Opens fullscreen modal with interactive measurements */}
                <button
                  className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInteractiveModal();
                  }}
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                  Interactive View
                </button>

                {/* Full Size button - Opens image in full size modal */}
                <button
                  className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImageModal(originalImage, "Original X-ray");
                  }}
                >
                  <i className="fa-solid fa-expand mr-1"></i> Full Size
                </button>
              </div>
            </div>
            <div className="relative flex justify-center">
              {/* Original image - Clicking opens full size view */}
              <img
                src={originalImage}
                alt="Original X-ray"
                className="max-h-80 object-contain hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => openImageModal(originalImage, "Original X-ray")}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/image-error.png";
                }}
              />

              {/* Small hint overlay */}
              <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-70 hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                Click "Interactive View" for analysis
              </div>
            </div>
          </div>

          {/* Result image with keypoints */}
          <div className="border rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="poppins text-lg font-medium">
                Keypoint Detection
              </div>
              <button
                className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageModal(resultImage, "Keypoint Detection");
                }}
              >
                <i className="fa-solid fa-expand mr-1"></i> Full Size
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={resultImage}
                alt="Analysis with keypoints"
                className="max-h-80 object-contain hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() =>
                  openImageModal(resultImage, "Keypoint Detection")
                }
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/image-error.png";
                }}
              />
            </div>
          </div>
        </div>

        {/* Segmentation Image (if available) */}
        {segmentationImage && (
          <div className="mt-6">
            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="poppins text-lg font-medium">
                  Tooth Segmentation
                </div>
                <button
                  className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImageModal(segmentationImage, "Tooth Segmentation");
                  }}
                >
                  <i className="fa-solid fa-expand mr-1"></i> Full Size
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={segmentationImage}
                  alt="Tooth segmentation"
                  className="max-h-80 object-contain hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() =>
                    openImageModal(segmentationImage, "Tooth Segmentation")
                  }
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/image-error.png";
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Prediction Summary */}
        <div className="mt-8 border rounded-xl p-6">
          <div className="poppins text-lg font-medium mb-4">
            Prediction Summary
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Result */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="poppins text-gray-500 text-sm mb-2">
                Canine Status
              </div>
              <div
                className={`poppins font-medium text-lg ${getPredictionColor(result.prediction_result)}`}
              >
                {formatPredictionResult(result.prediction_result)}
              </div>
              <div className="poppins mt-2">
                {result.prediction_result.includes("impacted") ? (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>{" "}
                    Needs attention
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                    <i className="fa-solid fa-check mr-1"></i> Normal
                  </span>
                )}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="poppins text-gray-500 text-sm mb-2">
                Analysis Confidence
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      result.confidence_score > 0.7
                        ? "bg-green-500"
                        : result.confidence_score > 0.5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.round(result.confidence_score * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="poppins text-sm font-medium">
                  {Math.round(result.confidence_score * 100)}%
                </span>
              </div>
              <div className="poppins mt-2 text-xs text-gray-500">
                Based on keypoint detection quality
              </div>
            </div>

            {/* Analysis Date */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="poppins text-gray-500 text-sm mb-2">
                Analysis Date
              </div>
              <div className="poppins font-medium">
                {formatDate(result.created_at)}
              </div>
              <div className="poppins mt-2 text-xs text-gray-500">
                <i className="fa-solid fa-calendar mr-1"></i> Generated report
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis Section */}
        {result.analysis && (
          <div className="mt-8 border rounded-xl p-6">
            <div className="poppins text-lg font-medium mb-4">
              Detailed Dental Analysis
            </div>

            {/* Sector Analysis */}
            {result.analysis.sector_analysis && (
              <div className="mb-6">
                <div className="poppins font-medium text-base mb-2">
                  Sector Analysis
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="poppins font-medium">Sector:</div>
                    <div className="poppins">
                      Sector {result.analysis.sector_analysis.sector}
                    </div>

                    <div className="poppins font-medium">Impaction Type:</div>
                    <div className="poppins font-medium">
                      {result.analysis.sector_analysis.impaction_type ===
                      "Palatally impact" ? (
                        <span className="poppins text-red-600">
                          {result.analysis.sector_analysis.impaction_type}
                        </span>
                      ) : result.analysis.sector_analysis.impaction_type ===
                        "Mid-alveolar" ? (
                        <span className="poppins text-orange-600">
                          {result.analysis.sector_analysis.impaction_type}
                        </span>
                      ) : (
                        <span>
                          {result.analysis.sector_analysis.impaction_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Canine Assessment */}
            {result.analysis.canine_assessment && (
              <div className="mb-6">
                <h4 className="poppins font-medium text-base mb-2">
                  Canine Assessment
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="poppins font-medium">
                      Overlap with Lateral Incisor:
                    </div>
                    <div
                      className={
                        result.analysis.canine_assessment.overlap === "Yes"
                          ? "poppins text-red-600"
                          : "poppins text-green-600"
                      }
                    >
                      {result.analysis.canine_assessment.overlap}
                    </div>

                    <div className="poppins font-medium">Vertical Height:</div>
                    <div
                      className={
                        result.analysis.canine_assessment.vertical_height.includes(
                          "Beyond",
                        )
                          ? "poppins text-red-600"
                          : "poppins text-green-600"
                      }
                    >
                      {result.analysis.canine_assessment.vertical_height}
                    </div>

                    <div className="poppins font-medium">Root Position:</div>
                    <div
                      className={
                        result.analysis.canine_assessment.root_position.includes(
                          "Above",
                        )
                          ? "poppins text-green-600"
                          : "poppins text-red-600"
                      }
                    >
                      {result.analysis.canine_assessment.root_position}
                    </div>

                    <div className="font-medium">Eruption Assessment:</div>
                    <div
                      className={`font-medium ${
                        result.analysis.canine_assessment
                          .eruption_difficulty === "Unfavorable"
                          ? "poppins text-red-600"
                          : "poppins text-green-600"
                      }`}
                    >
                      {result.analysis.canine_assessment.eruption_difficulty}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Angle Measurements */}
            {result.analysis.angle_measurements &&
              Object.keys(result.analysis.angle_measurements).length > 0 && (
                <div className="mb-6">
                  <h4 className="poppins font-medium text-base mb-2">
                    Angle and Linear Measurements
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      {result.analysis.angle_measurements
                        .angle_with_midline && (
                        <>
                          <div className="poppins font-medium">
                            Angle with Midline:
                          </div>
                          <div className="poppins">
                            {result.analysis.angle_measurements.angle_with_midline.value.toFixed(
                              2,
                            )}
                            °
                          </div>
                          <div
                            className={`poppins font-medium ${
                              result.analysis.angle_measurements
                                .angle_with_midline.difficulty === "Unfavorable"
                                ? "poppins text-red-600"
                                : "poppins text-green-600"
                            }`}
                          >
                            {
                              result.analysis.angle_measurements
                                .angle_with_midline.difficulty
                            }
                            {result.analysis.angle_measurements
                              .angle_with_midline.difficulty === "Unfavorable" &&
                              " (>31°)"}
                          </div>
                        </>
                      )}

                      {result.analysis.angle_measurements
                        .angle_with_lateral && (
                        <>
                          <div className="poppins font-medium">
                            Angle with Lateral Incisor:
                          </div>
                          <div className="poppins">
                            {result.analysis.angle_measurements.angle_with_lateral.value.toFixed(
                              2,
                            )}
                            °
                          </div>
                          <div
                            className={`poppins font-medium ${
                              result.analysis.angle_measurements
                                .angle_with_lateral.difficulty === "Unfavorable"
                                ? "poppins text-red-600"
                                : "poppins text-green-600"
                            }`}
                          >
                            {
                              result.analysis.angle_measurements
                                .angle_with_lateral.difficulty
                            }
                            {result.analysis.angle_measurements
                              .angle_with_lateral.difficulty === "Unfavorable" &&
                              " (>51.47°)"}
                          </div>
                        </>
                      )}

                      {result.analysis.angle_measurements
                        .angle_with_occlusal && (
                        <>
                          <div className="poppins font-medium">
                            Angle with Occlusal Plane:
                          </div>
                          <div className="poppins">
                            {result.analysis.angle_measurements.angle_with_occlusal.value.toFixed(
                              2,
                            )}
                            °
                          </div>
                          <div
                            className={`poppins font-medium ${
                              result.analysis.angle_measurements
                                .angle_with_occlusal.difficulty === "Unfavorable"
                                ? "poppins text-red-600"
                                : "poppins text-green-600"
                            }`}
                          >
                            {
                              result.analysis.angle_measurements
                                .angle_with_occlusal.difficulty
                            }
                            {result.analysis.angle_measurements
                              .angle_with_occlusal.difficulty === "Unfavorable" &&
                              " (>132°)"}
                          </div>
                        </>
                      )}

                      {result.analysis.angle_measurements
                        .distance_to_occlusal !== undefined && (
                        <>
                          <div className="poppins font-medium">
                            Distance to Occlusal Plane:
                          </div>
                          <div className="poppins col-span-2">
                            {result.analysis.angle_measurements.distance_to_occlusal.toFixed(
                              4,
                            ) + " pixel"}
                          </div>
                        </>
                      )}

                      {result.analysis.angle_measurements
                        .distance_to_midline !== undefined && (
                        <>
                          <div className="poppins font-medium">
                            Distance to Midline:
                          </div>
                          <div className="poppins col-span-2">
                            {result.analysis.angle_measurements.distance_to_midline.toFixed(
                              4,
                            ) + " pixel"}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Overall Assessment */}
            <div>
              <h4 className="poppins text-blue font-medium text-xl mb-2">
                Overall Assessment
              </h4>
              <div className="bg-blue-light p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="poppins font-medium">Difficult Factors:</div>
                  <div>
                    <span
                      className={
                        result.analysis.difficult_factors &&
                        result.analysis.difficult_factors >= 3
                          ? "poppins text-red-600 font-medium"
                          : result.analysis.difficult_factors &&
                              result.analysis.difficult_factors >= 1
                            ? "poppins text-orange-600 font-medium"
                            : "poppins text-green-600 font-medium"
                      }
                    >
                      {result.analysis.difficult_factors || 0}
                    </span>{" "}
                    / 6 factors
                  </div>

                  <div className="poppins font-medium">Final Assessment:</div>
                  <div
                    className={`poppins font-medium ${getPredictionColor(result.analysis.prediction_result)}`}
                  >
                    {formatPredictionResult(result.analysis.prediction_result)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keypoints Table */}
        <div className="mt-8 border rounded-xl p-6">
          <div className="poppins text-lg font-medium mb-4">
            Detected Keypoints
          </div>

          {result.keypoints && result.keypoints.length > 0 ? (
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Label</th>
                    <th className="px-4 py-2">Coordinates</th>
                    <th className="px-4 py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.keypoints.map((keypoint, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-medium">
                        {keypoint.label}
                      </td>
                      <td className="px-4 py-2">
                        ({Math.round(keypoint.x)}, {Math.round(keypoint.y)})
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div
                              className={`h-1.5 rounded-full ${
                                keypoint.confidence > 0.7
                                  ? "bg-green-500"
                                  : keypoint.confidence > 0.5
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.round(keypoint.confidence * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {Math.round(keypoint.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="poppins text-center py-4 text-gray-500">
              No keypoints detected
            </div>
          )}
        </div>

        {/* Clinical Recommendations */}
        <div className="mt-8 border rounded-xl p-6">
          <h3 className="poppins text-lg font-medium mb-4">
            Clinical Recommendations
          </h3>

          {result.prediction_result.includes("impacted") ? (
            <div>
              <p className="poppins mb-3">
                The analysis indicates <strong>canine impaction</strong>.
                Clinical recommendations:
              </p>
              <ul className="poppins list-disc pl-5 space-y-2">
                <li>Comprehensive clinical evaluation by an orthodontist</li>
                <li>
                  Consider additional imaging such as CBCT for 3D assessment
                </li>
                <li>Potential early intervention to guide canine eruption</li>
                <li>Possible extraction of deciduous canine if present</li>
                {result.prediction_result.includes("severely") && (
                  <>
                    <li className="text-red-600 font-medium">
                      Higher difficulty level anticipated for treatment
                    </li>
                    <li className="text-red-600 font-medium">
                      May require surgical exposure and orthodontic traction
                    </li>
                  </>
                )}
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> This is an AI-assisted analysis and
                  should be confirmed by a qualified dental professional. Early
                  intervention is key to successful management of impacted
                  canines.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-3">
                The analysis indicates{" "}
                <strong>normal canine positioning</strong>. Recommendations:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Continue routine dental monitoring</li>
                <li>Regular orthodontic check-ups as scheduled</li>
                <li>No immediate intervention needed for the canine</li>
                <li>Maintain good oral hygiene</li>
              </ul>
              <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm text-green-700">
                  <strong>Note:</strong> While the automated analysis shows
                  normal positioning, continue with regular dental check-ups.
                  This is an AI-assisted analysis and should be confirmed by a
                  qualified dental professional.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regular Image Modal for viewing full-size images */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={modalImage}
        title={modalTitle}
      />

      {/* Interactive Analysis Modal - Fullscreen modal for interactive view */}
      {isInteractiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-light bg-opacity-70 backdrop-blur-sm poppins">
          <div className="bg-white rounded-lg overflow-hidden w-[90vw] h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-medium">
                Interactive Dental Analysis
              </h3>

              {/* Add side selection if we have multiple sides */}
              {result.analysis?.side_analyses &&
                Object.keys(result.analysis.side_analyses).length > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Side:</span>
                    <div
                      className="inline-flex rounded-md shadow-sm"
                      role="group"
                    >
                      {Object.keys(result.analysis.side_analyses).map(
                        (side) => (
                          <button
                            key={side}
                            type="button"
                            onClick={() => setActiveSide(side)}
                            className={`px-3 py-1 text-sm font-medium ${
                              activeSide === side
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            } border border-gray-200 rounded-md`}
                          >
                            {side.charAt(0).toUpperCase() + side.slice(1)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

              <button
                onClick={() => setIsInteractiveModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
              >
                <i className="fa-solid fa-times fa-lg"></i>
              </button>
            </div>

            <div className="p-4 flex-grow overflow-auto bg-gray-100">
              <div className="h-full flex items-center justify-center">
                <MeasurementCanvasPanel
                  result={result}
                  originalImage={originalImage}
                  fullSize={true}
                  activeSide={activeSide}
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-between">
              <div className="text-sm text-gray-600">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Interactive view shows all analysis lines, angles, and
                measurements.
              </div>
              <button
                onClick={() => setIsInteractiveModalOpen(false)}
                className="btn-secondary w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export PDF button */}
      <div className="mt-8 flex justify-end max-w-5xl mx-auto">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center cursor-pointer"
        >
          <i className="fa-solid fa-file-pdf mr-2"></i>
          Export Results as PDF
        </button>
      </div>
    </div>
  );
};

export default PredictionPanel;
