import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import timeout from "connect-timeout";
import path from "path";
import database from "./config/database.js";
import { apiLimiter } from "./middleware/rateLimiter.js"

import UserRoute from "./routes/UserRoute.js"
import RbacRoute from "./routes/RbacRoute.js";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const frontendOrigin = process.env.FRONTEND_ORIGIN;

const app = express();


//1. HELMET - Security Header
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...(frontendOrigin ? [frontendOrigin] : []), ...allowedOrigins],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isProd,
  })
);



//2. BODYPARSER - PARSE REQUEST BODY Converting the raw incoming data sent by a client
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ enxtended: true }));
app.use(express.json());



//3. TIMEOUT - KILL SLOW REQUEST prevent hanigng on slow Database
app.use(timeout('30s'));
// ⚠️ Also need these error handlers AFTER routes (shown in step 10)
// app.use((req, res, next) => { if (!req.timedout) next(); });



//4. COOKIEPARSER - READ COOKIES THE AUTHMIDDLEWARE READS A COOKIES
app.use(cookieParser());



//5.CORS - ALLOWED FRONTED ORIGIN // Controls which domains can call your API // credentials: true required for cookies to work cross-origin
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);           // allow Postman/curl
    if (allowedOrigins.includes(origin))
      return callback(null, true);                      // allow known origins
    return callback(new Error(`Origin ${origin} not allowed by CORS`)); // block others
  },
  credentials: true,                                   // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));



//6. STATICCORSMIDDLEWARE -
const staticCorsMiddleware = (req, res, next) => {
  // Handle preflight OPTIONS requests (browser sends this before actual request)
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }

  // Add headers to actual GET requests
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
};



//7. EXPRESS STATIC - SERVE LOCATION FOR UPLOADS FILES
app.use("/userimages", staticCorsMiddleware, express.static(path.join(process.cwd(), "uploads/userimages")));


//8. FILEUPLOAD - HANDLE MULTIPART UPLOADS
app.use(fileUpload());



//9. API LIMITER - RATE LIMITING
app.use("/api", apiLimiter);


//10. ROUTES API
app.use("/api/user", UserRoute);
app.use("/api/rbac", RbacRoute);

app.use((req, res, next) => {
  if (!req.timedout) next();
});

app.use((err, req, res, next) => {
  if (req.timedout) {
    return res.status(408).json({
      error: 'Request timeout',
      message: 'The request took too long to process'
    });
  }
  next(err);
});



// 11. CONNECTING TO MYSQL
try {
  await database.authenticate();

  console.log("✅ MySQL connected successfully");
  console.log("█▓▒▒░░░ＴｕｒｋｚｙＤｅｖ░░░▒▒▓█");

  await database.sync();
} catch (err) {
  console.error("❌ Database connection error:", err);
}



//12. LISTEN TO START SERVER
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);