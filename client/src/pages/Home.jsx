import React, { useRef, useState } from "react";
import logo from "../assets/logo.png";
import VariableProximity from "../components/VariableProximity";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

const Home = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  //handling  the file upload ..
  const handleFileUpload = (event) => {
    // console.log(event);
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }

    if (uploadedFile.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB!");
      return;
    }

    setFile(uploadedFile);
    toast.success("Resume uploaded successfully!");
  };
  //handling the mechanism to sending the data, client to the server...
  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a valid resume!");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Job description is required!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    // console.log(formData);

    //api hit::
    try {
      setIsAnalyzing(true);
      const response = await fetch("http://localhost:8000/analyse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

      // response from server stores  in localStorage.......,
      localStorage.setItem("analysisResults", JSON.stringify(data));

      toast.success("Analysis complete!");
      navigate("/Analysis");
    } catch (err) {
      console.error("Error analyzing resume:", err);
      toast.error(err.message || "Error analyzing resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  //drag-drop functionality::

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    // console.log(e);
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      if (droppedFile.size <= 2 * 1024 * 1024) {
        setFile(droppedFile);
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error("File size must be less than 2MB!");
      }
    } else {
      toast.error("Only PDF files are allowed!");
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center p-2"
      >
        <img src={logo} alt="logo" className="w-40 h-16" />
      </motion.div>

      {/* Main Box */}
      <div className="flex h-[calc(110vh-10rem)] px-4 md:px-12">
        {/* Left Section */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-1/2 relative flex items-center"
        >
          {/* Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                rotate: [0, 360],
                x: [-20, 20, -20],
                y: [-20, 20, -20],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-3xl"
            />
            <motion.div
              animate={{
                rotate: [360, 0],
                x: [20, -20, 20],
                y: [20, -20, 20],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-40 left-40 w-64 h-64 bg-purple-200/20 rounded-3xl"
            />
            <motion.div
              animate={{
                rotate: [0, -360],
                scale: [1, 1.2, 1],
                x: [-10, 10, -10],
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-60 left-20 w-56 h-56 bg-indigo-200/20 rounded-3xl"
            />
          </div>

          {/* Main Quote */}
          <div ref={containerRef} className="relative z-10 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Transform Your Career Journey
            </motion.div>
            <VariableProximity
              label="Get AI-driven, personalized suggestions to make your resume stand out by aligning your experience with job requirements, boosting your chances of landing your dream job."
              className="variable-proximity-demo text-lg text-gray-700"
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef}
              radius={100}
              falloff="linear"
            />
          </div>
        </motion.div>

        {/* Right Section */}
        <ToastContainer position="top-right" />
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-1/2 p-4 flex flex-col justify-center space-y-4"
        >
          {/* Upload Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Upload Your Resume
            </h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p className="text-gray-500 pb-2">
                Drag and drop your resume here or
              </p>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="fileInput"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="fileInput"
                className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
              >
                Browse Files
              </label>
              {file && (
                <p className="text-green-600 mt-2 flex items-center justify-center gap-2">
                  <span>✓</span> {file.name}
                </p>
              )}
            </div>
          </motion.div>

          {/* Job Description Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Job Description
            </h3>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze My Resume"
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
