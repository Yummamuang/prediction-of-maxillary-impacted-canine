import React, { useRef, useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
}

interface MeasurementCanvasProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  originalImage: string;
  fullSize?: boolean; // Optional prop to indicate if the canvas should be displayed in full size
  activeSide?: string; // Active side to display (left or right)
}

const MeasurementCanvasPanel: React.FC<MeasurementCanvasProps> = ({
  result,
  originalImage,
  fullSize = false, // Default is false (not full size)
  activeSide = "right", // Default side is right
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't do anything if required props are missing or canvas not available
    if (!result || !originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create an image object to load the original X-ray
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS if needed

    // Function to handle image load event
    img.onload = () => {
      setIsLoading(false);

      // Set canvas dimensions based on fullSize mode
      if (fullSize) {
        // For fullscreen mode, maintain aspect ratio but make it larger
        const maxWidth = window.innerWidth * 0.85;
        const maxHeight = window.innerHeight * 0.75;

        const imgRatio = img.width / img.height;
        let canvasWidth, canvasHeight;

        if (img.width / maxWidth > img.height / maxHeight) {
          // Width is the limiting dimension
          canvasWidth = maxWidth;
          canvasHeight = canvasWidth / imgRatio;
        } else {
          // Height is the limiting dimension
          canvasHeight = maxHeight;
          canvasWidth = canvasHeight * imgRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Scale factors for drawing
        const scaleX = canvasWidth / img.width;
        const scaleY = canvasHeight / img.height;

        // Draw the scaled image
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // Draw all measurements with scaled coordinates
        drawAllMeasurements(ctx, result.analysis, canvasWidth, canvasHeight, scaleX, scaleY);
      } else {
        // Regular non-fullscreen mode - use original image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Draw all measurements with original coordinates
        drawAllMeasurements(ctx, result.analysis, img.width, img.height, 1, 1);
      }
    };

    // Set the image source to trigger loading
    img.src = originalImage;

    // Function to draw all measurements and analysis lines
    const drawAllMeasurements = (
      ctx: CanvasRenderingContext2D,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analysis: any,
      width: number,
      height: number,
      scaleX: number,
      scaleY: number
    ) => {
      if (!analysis) return;

      // Determine which analysis to use
      let drawAnalysis = analysis;

      // If we have side-specific analyses
      if (analysis.side_analyses && Object.keys(analysis.side_analyses).length > 0) {
        // If the active side exists
        if (analysis.side_analyses[activeSide]) {
          drawAnalysis = analysis.side_analyses[activeSide];
        }
        // Otherwise use the first available side
        else {
          const firstSide = Object.keys(analysis.side_analyses)[0];
          drawAnalysis = analysis.side_analyses[firstSide];
        }
      }

      // Helper function to scale X coordinate
      const sx = (x: number) => x * scaleX;
      // Helper function to scale Y coordinate
      const sy = (y: number) => y * scaleY;

      // Draw midline - Blue
      if (drawAnalysis.midline) {
        drawLine(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.midline.start.x),
              y: sy(drawAnalysis.midline.start.y)
            },
            end: {
              x: sx(drawAnalysis.midline.end.x),
              y: sy(drawAnalysis.midline.end.y)
            }
          },
          "rgba(0, 0, 255, 0.8)",
          fullSize ? 3 : 2
        );
        drawLabel(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.midline.start.x),
              y: sy(drawAnalysis.midline.start.y)
            },
            end: {
              x: sx(drawAnalysis.midline.end.x),
              y: sy(drawAnalysis.midline.end.y)
            }
          },
          "Midline",
          "rgba(0, 0, 255, 0.8)",
          fullSize
        );
      }

      // Draw sector lines - Different shades of green
      if (drawAnalysis.sector_lines) {
        // Sector 2
        if (drawAnalysis.sector_lines.sector2) {
          drawLine(
            ctx,
            {
              start: {
                x: sx(drawAnalysis.sector_lines.sector2.start.x),
                y: sy(drawAnalysis.sector_lines.sector2.start.y)
              },
              end: {
                x: sx(drawAnalysis.sector_lines.sector2.end.x),
                y: sy(drawAnalysis.sector_lines.sector2.end.y)
              }
            },
            "rgba(255, 0, 0, 0.7)",
            fullSize ? 2 : 1
          );
          drawLabel(
            ctx,
            {
              start: {
                x: sx(drawAnalysis.sector_lines.sector2.start.x),
                y: sy(drawAnalysis.sector_lines.sector2.start.y)
              },
              end: {
                x: sx(drawAnalysis.sector_lines.sector2.end.x),
                y: sy(drawAnalysis.sector_lines.sector2.end.y)
              }
            },
            "Sector 2",
            "rgba(255, 0, 0, 0.8)",
            fullSize
          );
        }

        // Sector 3
        if (drawAnalysis.sector_lines.sector3) {
          drawLine(
            ctx,
            {
              start: {
                x: sx(drawAnalysis.sector_lines.sector3.start.x),
                y: sy(drawAnalysis.sector_lines.sector3.start.y)
              },
              end: {
                x: sx(drawAnalysis.sector_lines.sector3.end.x),
                y: sy(drawAnalysis.sector_lines.sector3.end.y)
              }
            },
            "rgba(0, 176, 80, 0.7)",
            fullSize ? 2 : 1
          );
          drawLabel(
            ctx,
            {
              start: {
                x: sx(drawAnalysis.sector_lines.sector3.start.x),
                y: sy(drawAnalysis.sector_lines.sector3.start.y)
              },
              end: {
                x: sx(drawAnalysis.sector_lines.sector3.end.x),
                y: sy(drawAnalysis.sector_lines.sector3.end.y)
              }
            },
            "Sector 3",
            "rgba(0, 176, 80, 0.8)",
            fullSize
          );
        }

        // Sector 4
        if (drawAnalysis.sector_lines.sector4) {
          drawLine(
            ctx,
            {
              start: {
                x: sx(drawAnalysis.sector_lines.sector4.start.x),
                y: sy(drawAnalysis.sector_lines.sector4.start.y)
              },
              end: {
                x: sx(drawAnalysis.sector_lines.sector4.end.x),
                y: sy(drawAnalysis.sector_lines.sector4.end.y)
              }
            },
            "rgba(255, 153, 0, 0.7)",
            fullSize ? 2 : 1
          );
          drawLabel(
            ctx,
            {
              start: {
                x: sx(drawAnalysis.sector_lines.sector4.start.x),
                y: sy(drawAnalysis.sector_lines.sector4.start.y)
              },
              end: {
                x: sx(drawAnalysis.sector_lines.sector4.end.x),
                y: sy(drawAnalysis.sector_lines.sector4.end.y)
              }
            },
            "Sector 4",
            "rgba(255, 153, 0, 0.8)",
            fullSize
          );
        }
      }

      // Occlusal plane - Purple
      if (drawAnalysis.occlusal_plane) {
        drawLine(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.occlusal_plane.start.x),
              y: sy(drawAnalysis.occlusal_plane.start.y)
            },
            end: {
              x: sx(drawAnalysis.occlusal_plane.end.x),
              y: sy(drawAnalysis.occlusal_plane.end.y)
            }
          },
          "rgba(153, 51, 255, 0.8)",
          fullSize ? 3 : 2
        );
        drawLabel(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.occlusal_plane.start.x),
              y: sy(drawAnalysis.occlusal_plane.start.y)
            },
            end: {
              x: sx(drawAnalysis.occlusal_plane.end.x),
              y: sy(drawAnalysis.occlusal_plane.end.y)
            }
          },
          "Occlusal Plane",
          "rgba(153, 51, 255, 0.8)",
          fullSize
        );
      }

      // Canine axis - Yellow-gold
      if (drawAnalysis.canine_axis) {
        drawLine(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.canine_axis.start.x),
              y: sy(drawAnalysis.canine_axis.start.y)
            },
            end: {
              x: sx(drawAnalysis.canine_axis.end.x),
              y: sy(drawAnalysis.canine_axis.end.y)
            }
          },
          "rgba(255, 204, 0, 0.8)",
          fullSize ? 4 : 3 // Make canine axis thicker to stand out
        );
        drawLabel(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.canine_axis.start.x),
              y: sy(drawAnalysis.canine_axis.start.y)
            },
            end: {
              x: sx(drawAnalysis.canine_axis.end.x),
              y: sy(drawAnalysis.canine_axis.end.y)
            }
          },
          "Canine Axis",
          "rgba(255, 204, 0, 0.9)",
          fullSize
        );
      }

      // Lateral incisor axis - Cyan
      if (drawAnalysis.lateral_axis) {
        drawLine(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.lateral_axis.start.x),
              y: sy(drawAnalysis.lateral_axis.start.y)
            },
            end: {
              x: sx(drawAnalysis.lateral_axis.end.x),
              y: sy(drawAnalysis.lateral_axis.end.y)
            }
          },
          "rgba(0, 204, 255, 0.8)",
          fullSize ? 3 : 2
        );
        drawLabel(
          ctx,
          {
            start: {
              x: sx(drawAnalysis.lateral_axis.start.x),
              y: sy(drawAnalysis.lateral_axis.start.y)
            },
            end: {
              x: sx(drawAnalysis.lateral_axis.end.x),
              y: sy(drawAnalysis.lateral_axis.end.y)
            }
          },
          "Lateral Incisor",
          "rgba(0, 204, 255, 0.9)",
          fullSize
        );
      }

      // Draw keypoints if available
      if (result.keypoints && result.keypoints.length > 0) {
        // Filter keypoints based on side if needed
        let filteredKeypoints = result.keypoints;

        // If we have side-specific analyses, filter keypoints
        if (analysis.side_analyses) {
          // For right side, include points starting with "c1", "r1", "m", "mb16"
          // For left side, include points starting with "c2", "r2", "m", "mb26"
          filteredKeypoints = result.keypoints.filter((kp: any) => {
            if (activeSide === "right") {
              return kp.label.startsWith("c1") ||
                     kp.label.startsWith("r1") ||
                     kp.label.startsWith("m") ||
                     kp.label === "mb16";
            } else {
              return kp.label.startsWith("c2") ||
                     kp.label.startsWith("r2") ||
                     kp.label.startsWith("m") ||
                     kp.label === "mb26";
            }
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filteredKeypoints.forEach((kp: any) => {
          drawKeypoint(
            ctx,
            sx(kp.x),
            sy(kp.y),
            kp.label,
            kp.confidence,
            fullSize
          );
        });
      }

      // Draw angles if available
      if (drawAnalysis.angle_measurements) {
        const angles = drawAnalysis.angle_measurements;

        // Draw angle with midline
        if (
          angles.angle_with_midline &&
          drawAnalysis.canine_axis &&
          drawAnalysis.midline
        ) {
          drawAngle(
            ctx,
            {
              x: sx(drawAnalysis.canine_axis.end.x),
              y: sy(drawAnalysis.canine_axis.end.y)
            },
            {
              x: sx(drawAnalysis.canine_axis.start.x),
              y: sy(drawAnalysis.canine_axis.start.y)
            },
            {
              x: sx(drawAnalysis.midline.end.x),
              y: sy(drawAnalysis.midline.end.y)
            },
            angles.angle_with_midline.value.toFixed(1) + "°",
            "rgba(0, 0, 255, 0.7)",
            fullSize
          );
        }

        // Draw angle with lateral
        if (
          angles.angle_with_lateral &&
          drawAnalysis.canine_axis &&
          drawAnalysis.lateral_axis
        ) {
          drawAngle(
            ctx,
            {
              x: sx(drawAnalysis.canine_axis.end.x),
              y: sy(drawAnalysis.canine_axis.end.y)
            },
            {
              x: sx(drawAnalysis.canine_axis.start.x),
              y: sy(drawAnalysis.canine_axis.start.y)
            },
            {
              x: sx(drawAnalysis.lateral_axis.end.x),
              y: sy(drawAnalysis.lateral_axis.end.y)
            },
            angles.angle_with_lateral.value.toFixed(1) + "°",
            "rgba(255, 165, 0, 0.7)",
            fullSize
          );
        }

        // Draw angle with occlusal
        if (
          angles.angle_with_occlusal &&
          drawAnalysis.canine_axis &&
          drawAnalysis.occlusal_plane
        ) {
          drawAngle(
            ctx,
            {
              x: sx(drawAnalysis.canine_axis.end.x),
              y: sy(drawAnalysis.canine_axis.end.y)
            },
            {
              x: sx(drawAnalysis.canine_axis.start.x),
              y: sy(drawAnalysis.canine_axis.start.y)
            },
            {
              x: sx(drawAnalysis.occlusal_plane.end.x),
              y: sy(drawAnalysis.occlusal_plane.end.y)
            },
            angles.angle_with_occlusal.value.toFixed(1) + "°",
            "rgba(128, 0, 128, 0.7)",
            fullSize
          );
        }
      }

      // Draw a legend if in fullSize mode
      if (fullSize) {
        drawLegend(ctx, width, height);
      }

      // Draw side indicator
      if (fullSize && analysis.side_analyses) {
        // Display which side we're viewing
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(20, 20, 120, 36);

        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.fillText(`${activeSide.toUpperCase()} SIDE`, 30, 44);
      }
    };

    // Clean up function
    return () => {
      img.onload = null;
    };
  }, [result, originalImage, fullSize, activeSide]);

  // Function to draw a line
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    line: Line,
    color: string,
    width: number,
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
  };

  // Function to draw a label
  const drawLabel = (
    ctx: CanvasRenderingContext2D,
    line: Line,
    text: string,
    color: string,
    isFullSize: boolean = false,
  ) => {
    const midX = (line.start.x + line.end.x) / 2;
    const midY = (line.start.y + line.end.y) / 2;

    // Set font size based on display mode
    ctx.font = isFullSize ? "14px Arial" : "12px Arial";

    // Add a background for better readability
    const textMeasure = ctx.measureText(text);
    const padding = 4;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(
      midX - (textMeasure.width / 2) - padding,
      midY - 16,
      textMeasure.width + padding * 2,
      20
    );

    // Draw text
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(text, midX, midY - 2);
  };

  // Function to draw a keypoint
  const drawKeypoint = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    confidence: number,
    isFullSize: boolean = false,
  ) => {
    // Draw the point
    ctx.beginPath();
    const radius = isFullSize ? 5 : 3;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    // Color based on confidence
    if (confidence > 0.7) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.7)";  // Green for high confidence
    } else if (confidence > 0.5) {
      ctx.fillStyle = "rgba(255, 255, 0, 0.7)"; // Yellow for medium confidence
    } else {
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)";   // Red for low confidence
    }

    ctx.fill();

    // Only draw labels in full size mode to avoid clutter
    if (isFullSize) {
      // Draw the label with border for better visibility
      ctx.font = "11px Arial";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 0.5;

      // Add background to text
      const textMeasure = ctx.measureText(label);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(x + 6, y - 10, textMeasure.width + 4, 14);

      // Draw text
      ctx.fillStyle = "white";
      ctx.fillText(label, x + 8, y);
    }
  };

  // Function to draw an angle
  const drawAngle = (
    ctx: CanvasRenderingContext2D,
    point1: Point,
    point2: Point,
    point3: Point,
    angleText: string,
    color: string,
    isFullSize: boolean = false,
  ) => {
    // Draw an arc to represent the angle
    const radius = isFullSize ? 40 : 25;
    const angle1 = Math.atan2(point1.y - point2.y, point1.x - point2.x);
    const angle2 = Math.atan2(point3.y - point2.y, point3.x - point2.x);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isFullSize ? 3 : 2;
    ctx.moveTo(point2.x, point2.y);
    ctx.arc(point2.x, point2.y, radius, angle1, angle2, false);
    ctx.stroke();

    // Draw the angle text
    const textX = point2.x + (radius + 10) * Math.cos((angle1 + angle2) / 2);
    const textY = point2.y + (radius + 10) * Math.sin((angle1 + angle2) / 2);

    ctx.font = isFullSize ? "bold 14px Arial" : "bold 12px Arial";

    // Add background for better readability
    const textMeasure = ctx.measureText(angleText);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(
      textX - (textMeasure.width / 2) - 2,
      textY - 10,
      textMeasure.width + 4,
      16
    );

    // Draw text
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(angleText, textX, textY);
  };

  // Function to draw a legend in full size mode
  const drawLegend = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const legendX = 20;
    const legendY = height - 180;
    const lineLength = 30;
    const padding = 8;
    const lineSpacing = 24;

    // Background for legend
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillRect(legendX, legendY, 230, 170);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 230, 170);

    // Title
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Measurement Legend:", legendX + padding, legendY + 20);
    ctx.font = "12px Arial";

    // Midline
    let y = legendY + 45;
    ctx.strokeStyle = "rgba(0, 0, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + padding, y);
    ctx.lineTo(legendX + padding + lineLength, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(0, 0, 255, 0.9)";
    ctx.fillText("Midline", legendX + padding + lineLength + 8, y + 4);

    // Sector lines
    y += lineSpacing;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX + padding, y);
    ctx.lineTo(legendX + padding + lineLength, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
    ctx.fillText("Sector Lines", legendX + padding + lineLength + 8, y + 4);

    // Occlusal plane
    y += lineSpacing;
    ctx.strokeStyle = "rgba(153, 51, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + padding, y);
    ctx.lineTo(legendX + padding + lineLength, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(153, 51, 255, 0.9)";
    ctx.fillText("Occlusal Plane", legendX + padding + lineLength + 8, y + 4);

    // Canine axis
    y += lineSpacing;
    ctx.strokeStyle = "rgba(255, 204, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(legendX + padding, y);
    ctx.lineTo(legendX + padding + lineLength, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 204, 0, 0.9)";
    ctx.fillText("Canine Axis", legendX + padding + lineLength + 8, y + 4);

    // Lateral incisor
    y += lineSpacing;
    ctx.strokeStyle = "rgba(0, 204, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX + padding, y);
    ctx.lineTo(legendX + padding + lineLength, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(0, 204, 255, 0.9)";
    ctx.fillText("Lateral Incisor", legendX + padding + lineLength + 8, y + 4);

    // Keypoints
    y += lineSpacing;
    ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
    ctx.beginPath();
    ctx.arc(legendX + padding + lineLength/2, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.fillText("Keypoints", legendX + padding + lineLength + 8, y + 4);
  };

  return (
    <div className={`relative ${fullSize ? 'w-full h-full' : ''}`}>
      {/* Show loading indicator while image is loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-600">Loading interactive view...</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`${fullSize ? 'max-w-full max-h-[75vh]' : 'max-h-80 w-full'} object-contain mx-auto`}
      />

      {/* Indicator badge when in interactive mode */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 text-xs px-2 py-1 rounded">
        <i className="fa-solid fa-wand-magic-sparkles mr-1 text-blue-500"></i>
        Interactive View
      </div>
    </div>
  );
};

export default MeasurementCanvasPanel;
