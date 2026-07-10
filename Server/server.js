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
import "./models/index.js"; // registers all model associations (User<->Role, User<->Workgroup, User<->Units, Role<->Permission, ...)
import { apiLimiter } from "./middleware/rateLimiter.js"

import UserRoute from "./routes/UserRoute.js"
import RbacRoute from "./routes/RbacRoute.js";
import WorkgroupRoute from "./routes/WorkgroupRoute.js";
import UnitRoute from "./routes/UnitRoute.js";
import DepartmentRoute from "./routes/DepartmentRoute.js";
import ActivityLogRoute from "./routes/ActivityLogRoute.js";
import ComplianceRoute from "./routes/ComplianceRoute.js";
import PasswordResetRoute from "./routes/PasswordResetRoute.js";
import { testMailConnection } from "./config/mail.js";
import { sanitizeBody } from "./utils/sanitizeInput.js";
import { createCsrfToken, verifyCsrfToken } from "./utils/csrf.js";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const frontendOrigin = process.env.FRONTEND_ORIGIN;

const app = express();

// If your app runs behind a reverse proxy (NGINX, Heroku, AWS ELB),
// enable trust proxy so `req.ip` and `req.protocol` reflect the client.
if (isProd) {
  app.set("trust proxy", 1); // Trust first proxy (e.g., NGINX, Heroku)
}


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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());



//3. TIMEOUT - KILL SLOW REQUEST prevent hanigng on slow Database
app.use(timeout('30s'));
// ⚠️ Also need these error handlers AFTER routes (shown in step 10)
// app.use((req, res, next) => { if (!req.timedout) next(); });



//4. COOKIEPARSER - READ COOKIES THE AUTHMIDDLEWARE READS A COOKIES
app.use(cookieParser());

//4b. INPUT SANITIZATION - prevent stored XSS from names/descriptions
app.use(sanitizeBody);

// CSRF protection disabled (reverted). Ensure other protections are in place in production.



//5.CORS - ALLOWED FRONTEND ORIGIN
// Controls which domains can call your API. `credentials: true` is required
// for cookies to work cross-origin. In development we allow any origin
// to make local testing simpler; in production we enforce the configured list.
console.log("CORS allowedOrigins:", allowedOrigins, "FRONTEND_ORIGIN:", frontendOrigin, "NODE_ENV:", process.env.NODE_ENV);
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl and non-browser requests

    // In development allow all origins to avoid local CORS friction
    if (!isProd) return callback(null, true);

    // Also allow explicit frontend origin env var
    if (frontendOrigin && origin === frontendOrigin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true, // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
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
// express-fileupload doesn't initialize req.body when a multipart request
// has no non-file fields (e.g. avatar-only uploads) — normalize it so
// downstream controllers can safely destructure req.body.
app.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});



//9. API LIMITER - RATE LIMITING
// Apply strict API rate limiting only in production to avoid dev HMR/polling
// causing 429 responses during development.
if (isProd) {
  app.use("/api", apiLimiter);
} else {
  console.log("API rate limiter disabled in development (local). Restart server to enable production limits.");
}


//10. ROUTES API
app.use("/api/users", UserRoute);
app.use("/api/rbac", RbacRoute);
app.use("/api/workgroups", WorkgroupRoute);
app.use("/api/units", UnitRoute);
app.use("/api/departments", DepartmentRoute);
app.use("/api/activity-logs", ActivityLogRoute);
app.use("/api/compliance", ComplianceRoute);
app.use("/api/password-reset", PasswordResetRoute);

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

testMailConnection();

// 11. CONNECTING TO MYSQL
try {
  await database.authenticate();

  console.log("✅ MySQL connected successfully");
  console.log("█▓▒▒░░░ＴｕｒｋｚｙＤｅｖ░░░▒▒▓█");

  await database.sync({ alter: false, force: false });
  console.log("✅ Database synced");

} catch (err) {
  console.error("❌ Database connection error:", err);
}



//12. LISTEN TO START SERVER
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);