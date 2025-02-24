import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const Analysis = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [pdfContent, setPdfContent] = useState("");

  useEffect(() => {
    // Get analysis results from localStorage
    const storedResults = localStorage.getItem("analysisResults");
    if (!storedResults) {
      navigate("/");
      return;
    }

    try {
      const results = JSON.parse(storedResults);
      setAnalysisData(results);
    } catch (error) {
      console.error("Error parsing analysis results:", error);
      navigate("/");
    }
  }, [navigate]);

  const GaugeChart = ({ value }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;
    const rotation = -90;
    const strokeWidth = 12;

    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={
              value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444"
            }
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            fill="none"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "96px 96px",
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold">{value}</span>
          <span className="text-sm text-gray-500">ATS Score</span>
        </div>
      </div>
    );
  };

  if (!analysisData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="logo" className="w-40 h-16" />
          </Link>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4"
          >
            <Award className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold">
              Resume Analysis Results
            </span>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Document Preview and Match Details */}
          <div className="col-span-7 space-y-6">
            {/* Best Matching Sections */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Best Matching Sections
              </h2>
              <div className="space-y-3">
                {analysisData.bestMatchingSections?.map((section, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{section.text}</p>
                    <div className="mt-2 text-sm text-green-600">
                      Match Score: {Math.round(section.score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sections Needing Improvement */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </h2>
              <div className="space-y-3">
                {analysisData.sectionsNeedingImprovement?.map(
                  (section, index) => (
                    <div key={index} className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{section.text}</p>
                      <div className="mt-2 text-sm text-orange-600">
                        Match Score: {Math.round(section.score * 100)}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>

          {/* Score and Suggestions */}
          <div className="col-span-5 space-y-6">
            {/* ATS Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-center">
                <GaugeChart value={analysisData.atsScore} />
              </div>

              {/* Keyword Matches */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Keyword Matches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData.keywordMatch?.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold mb-4">
                Improvement Suggestions
              </h2>
              <div className="space-y-4">
                {analysisData.suggestions?.map((suggestion, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-600 mb-1">
                      {suggestion.category || "Suggestion"}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {suggestion.suggestion || suggestion}
                    </p>
                  </div>
                ))}
              </div>

              {/* Missing Keywords */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData.missingKeywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
