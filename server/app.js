import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import { ChatGroq } from "@langchain/groq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CohereEmbeddings } from "@langchain/cohere";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app and middleware
const app = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());

// Configure uploads directory and multer
const uploadsDir = path.join(__dirname, "uploads");
!fs.existsSync(uploadsDir) && fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Init groq.....
const model = new ChatGroq({
  model: "deepseek-r1-distill-llama-70b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.1, //for constant rate of output
});

//cohere for embeedings.
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

// Text spliter from the document...
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Common skills sets....
const COMMON_SKILLS = [
  "javascript",
  "python",
  "java",
  "reactjs",
  "node.js",
  "c++",
  "c",
  "mongodb",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "machine learning",
  "data analysis",
  "agile",
  "project management",
  "leadership",
  "communication",
  "problem solving",
];

//now extract skills from the resume....
const extractSkillsFromText = (text) => {
  const skills = new Set();
  const lowerText = text.toLowerCase();
  COMMON_SKILLS.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });
  return Array.from(skills);
};

//checking the resume structure....

const checkResumeStructure = (text) => {
  const sections = {
    experience: /experience|work history|employment/i,
    education: /education|academic|qualification/i,
    skills: /skills|technical skills|competencies/i,
    contact: /contact|email|phone|address/i,
  };

  return Object.entries(sections).reduce((acc, [section, regex]) => {
    acc[section] = regex.test(text);
    return acc;
  }, {});
};

//similarity checking based on the cosine rlule....
const calculateCosineSimilarity = (vector1, vector2) => {
  const dotProduct = vector1.reduce((acc, val, i) => acc + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(
    vector1.reduce((acc, val) => acc + val * val, 0)
  );
  const magnitude2 = Math.sqrt(
    vector2.reduce((acc, val) => acc + val * val, 0)
  );
  return dotProduct / (magnitude1 * magnitude2);
};

//work experience extract....
const analyzeWorkExperience = async (text) => {
  const promptTemplate = ChatPromptTemplate.fromTemplate(`
    You are a resume analyzer. Analyze this resume text and extract work experience details.

    Resume Text: {resumeText}

    Return a JSON object containing:
    - Total years of experience as a number
    - List of job titles from most recent to oldest
    - List of notable achievements

    Format the response as a JSON object only, no other text.
  `);

  const outputParser = new StringOutputParser();
  const chain = promptTemplate.pipe(model).pipe(outputParser);

  try {
    const response = await chain.invoke({
      resumeText: text,
    });

    try {
      // Extract JSON object from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (parsed) {
        return {
          years: Number(parsed.years) || 0,
          titles: Array.isArray(parsed.titles) ? parsed.titles : [],
          achievements: Array.isArray(parsed.achievements)
            ? parsed.achievements
            : [],
        };
      }
    } catch (parseError) {
      console.error("Error parsing work experience:", parseError);
    }

    return getDefaultExperience();
  } catch (error) {
    console.error("Error analyzing work experience:", error);
    return getDefaultExperience();
  }
};

const getDefaultExperience = () => ({
  years: 0,
  titles: [],
  achievements: [],
});

//comparison btw the resume and the JD....
const analyzeSemanticSimilarity = async (resumeText, jobDescription) => {
  try {
    // Split texts into chunks
    const resumeChunks = await textSplitter.createDocuments([resumeText]);
    const jobChunks = await textSplitter.createDocuments([jobDescription]);

    // Get embeddings for all chunks
    const resumeEmbeddings = await embeddings.embedDocuments(
      resumeChunks.map((chunk) => chunk.pageContent)
    );
    const jobEmbeddings = await embeddings.embedDocuments(
      jobChunks.map((chunk) => chunk.pageContent)
    );

    // Calculate similarity scores
    const similarities = resumeEmbeddings.map((resumeEmb) =>
      jobEmbeddings.map((jobEmb) =>
        calculateCosineSimilarity(resumeEmb, jobEmb)
      )
    );

    // Calculate average similarity
    const averageSimilarity =
      similarities.reduce((acc, simArray) => acc + Math.max(...simArray), 0) /
      similarities.length;

    // Find best and worst matching sections
    const matchScores = resumeChunks.map((chunk, i) => ({
      text: chunk.pageContent,
      score: Math.max(...similarities[i]),
    }));

    matchScores.sort((a, b) => b.score - a.score);

    return {
      overallSimilarity: averageSimilarity,
      bestMatches: matchScores.slice(0, 3),
      weakMatches: matchScores.slice(-3).reverse(),
    };
  } catch (error) {
    console.error("Error in semantic analysis:", error);
    return {
      overallSimilarity: 0,
      bestMatches: [],
      weakMatches: [],
    };
  }
};
const generateEnhancedSuggestions = async (
  analysis,
  resumeText,
  jobDescription
) => {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert resume analyzer. Your task is to provide improvement suggestions based on resume analysis.
     You must respond with ONLY a JSON array of objects. Each object must have exactly these fields:
     - "category": The category of the suggestion (e.g., "Keywords", "Structure", "Experience", "Formatting")
     - "suggestion": A specific, actionable suggestion
     
     Do not include any other text, tags, or formatting in your response. Only the JSON array.`,
    ],
    [
      "human",
      `Please analyze this resume data and provide suggestions:
     
     Semantic Match: {semanticScore}%
     Matching Keywords: {matchingKeywords}
     Missing Keywords: {missingKeywords}
     Structure Issues: {structureIssues}
     Format Issues: {formatIssues}
     Experience: {experience}
     Job Description: {jobDescription}
     
     Weak Areas:
     {weakMatches}`,
    ],
  ]);

  const outputParser = new StringOutputParser();
  const chain = promptTemplate.pipe(model).pipe(outputParser);

  try {
    const response = await chain.invoke({
      jobDescription: jobDescription || "No job description provided",
      semanticScore: analysis.semanticAnalysis?.overallSimilarity
        ? Math.round(analysis.semanticAnalysis.overallSimilarity * 100)
        : 0,
      matchingKeywords: analysis.matchingKeywords?.join(", ") || "None",
      missingKeywords: analysis.missingKeywords?.join(", ") || "None",
      structureIssues: analysis.structure
        ? Object.entries(analysis.structure)
            .filter(([_, exists]) => !exists)
            .map(([section]) => section)
            .join(", ")
        : "None",
      formatIssues: analysis.formatIssues?.join(", ") || "None",
      experience: JSON.stringify(analysis.experience || {}),
      weakMatches: analysis.semanticAnalysis?.weakMatches
        ? analysis.semanticAnalysis.weakMatches
            .map((match) => match.text.substring(0, 100))
            .join("\n")
        : "None",
    });

    // Clean up the response
    let cleanResponse = response
      .trim()
      // Remove any XML-like tags
      .replace(/<[^>]*>/g, "")
      // Remove common text prefixes
      .replace(/^(```json|```|json)\s*/i, "")
      // Remove common text suffixes
      .replace(/```\s*$/, "");

    try {
      // Try to find a JSON array in the cleaned response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log("No JSON array found in response:", cleanResponse);
        return getDefaultSuggestions();
      }

      const suggestions = JSON.parse(jsonMatch[0]);

      // Validate the suggestions format
      if (
        Array.isArray(suggestions) &&
        suggestions.length > 0 &&
        suggestions.every((s) => s.category && s.suggestion)
      ) {
        return suggestions;
      }

      console.log("Invalid suggestions format:", suggestions);
      return getDefaultSuggestions();
    } catch (parseError) {
      console.error("Error parsing suggestions:", parseError);
      return getDefaultSuggestions();
    }
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return getDefaultSuggestions();
  }
};

const getDefaultSuggestions = () => [
  {
    category: "Keywords",
    suggestion: "Add missing keywords to improve ATS compatibility",
  },
  {
    category: "Structure",
    suggestion:
      "Ensure all core resume sections are present (Contact, Experience, Education, Skills)",
  },
  {
    category: "Formatting",
    suggestion: "Review formatting for consistency and readability",
  },
  {
    category: "Experience",
    suggestion: "Include quantifiable achievements in experience section",
  },
];
const calculateEnhancedATSScore = (analysis) => {
  const weights = {
    semanticMatch: 0.35,
    keywords: 0.25,
    structure: 0.2,
    experience: 0.2,
  };

  const semanticScore = analysis.semanticAnalysis.overallSimilarity * 100;

  const keywordScore = (() => {
    const totalKeywords =
      (analysis.matchingKeywords?.length || 0) +
      (analysis.missingKeywords?.length || 0);
    return totalKeywords > 0
      ? ((analysis.matchingKeywords?.length || 0) / totalKeywords) * 100
      : 0;
  })();

  const structureScore = (() => {
    const sections = Object.values(analysis.structure || {});
    return sections.length > 0
      ? (sections.filter(Boolean).length / sections.length) * 100
      : 0;
  })();

  const experienceScore = Math.min((analysis.experience?.years || 0) * 10, 100);

  return Math.round(
    semanticScore * weights.semanticMatch +
      keywordScore * weights.keywords +
      structureScore * weights.structure +
      experienceScore * weights.experience
  );
};

// File processing
const extractTextFromFile = async (file) => {
  const filePath = path.join(uploadsDir, file.filename);

  try {
    if (file.mimetype === "application/pdf") {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      return docs.map((doc) => doc.pageContent).join(" ");
    }

    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    return await fs.promises.readFile(filePath, "utf-8");
  } finally {
    // Clean up the uploaded file
    await fs.promises.unlink(filePath).catch(console.error);
  }
};
// Routes
app.post("/analyse", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file || !req.body.jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume and job description are required" });
    }

    const resumeText = await extractTextFromFile(req.file);
    const jobDescription = req.body.jobDescription;

    // Perform semantic analysis
    const semanticAnalysis = await analyzeSemanticSimilarity(
      resumeText,
      jobDescription
    );

    const analysis = {
      resumeSkills: extractSkillsFromText(resumeText),
      jobSkills: extractSkillsFromText(jobDescription),
      structure: checkResumeStructure(resumeText),
      formatIssues: [
        resumeText.includes("�") && "Contains special characters",
        resumeText.length > 10000 && "Resume might be too long",
      ].filter(Boolean),
      experience: await analyzeWorkExperience(resumeText),
      semanticAnalysis,
    };

    const matchingKeywords = analysis.resumeSkills.filter((skill) =>
      analysis.jobSkills.includes(skill.toLowerCase())
    );

    const missingKeywords = analysis.jobSkills.filter(
      (skill) => !analysis.resumeSkills.includes(skill.toLowerCase())
    );

    const fullAnalysis = {
      ...analysis,
      matchingKeywords,
      missingKeywords,
    };

    const atsScore = calculateEnhancedATSScore(fullAnalysis);
    const suggestions = await generateEnhancedSuggestions(
      fullAnalysis,
      resumeText,
      jobDescription
    );
    console.log(atsScore);
    console.log(suggestions);

    res.json({
      atsScore,
      suggestions,
      semanticSimilarity: semanticAnalysis.overallSimilarity,
      bestMatchingSections: semanticAnalysis.bestMatches,
      sectionsNeedingImprovement: semanticAnalysis.weakMatches,
      keywordMatch: matchingKeywords,
      missingKeywords,
      structure: analysis.structure,
      formatIssues: analysis.formatIssues,
      experience: analysis.experience,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Error analyzing resume",
      details: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    version: "1.0.0",
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
