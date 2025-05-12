import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db"; 
import { admins } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { userValidationSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import MemoryStore from "memorystore";

// Get IP geolocation information
async function getIpLocationInfo(ip: string): Promise<string> {
  try {
    // Using a free IP API service
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) return "Unknown location";
    
    const data = await response.json();
    return `${data.city || ''}, ${data.region || ''}, ${data.country_name || 'Unknown'}`;
  } catch (error) {
    console.error("Error fetching IP location:", error);
    return "Unable to retrieve location";
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const SessionStore = MemoryStore(session);
  
  // Set up session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'registration-form-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Set up passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const admin = await storage.getAdmin(username);
      if (!admin) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      // In a real application, you would hash the password and compare
      if (admin.password !== password) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user with ID: ${id}`);
      // For simplicity, we only support admin users in the session
      // Find admin by checking each admin's ID
      const allAdmins = await db.select().from(admins);
      console.log(`Found ${allAdmins.length} total admins`, allAdmins);
      const admin = allAdmins.find(a => a.id === id);
      console.log(`Deserialized user from ID ${id}:`, admin || 'No user found');
      done(null, admin);
    } catch (error) {
      console.error(`Error deserializing user ID ${id}:`, error);
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    console.log(`Authentication check for ${req.method} ${req.path}`);
    console.log(`Is authenticated: ${req.isAuthenticated()}`);
    console.log(`Session:`, req.session);
    console.log(`User:`, req.user);
    
    if (req.isAuthenticated()) {
      console.log(`User ${(req.user as any)?.username || 'unknown'} is authenticated, proceeding to ${req.path}`);
      return next();
    }
    
    console.log(`Authentication failed for ${req.path}`);
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Authentication routes
  app.post('/api/login', (req, res, next) => {
    try {
      console.log('Login attempt:', req.body);
      loginSchema.parse(req.body);
      console.log('Credentials validated');
      
      passport.authenticate('local', (err: Error, user: any, info: any) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
          console.log('Authentication failed:', info?.message || 'No user found');
          return res.status(401).json({ message: info?.message || 'Invalid credentials' });
        }
        console.log('User authenticated:', user);
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Login session error:', loginErr);
            return res.status(500).json({ message: 'Login error' });
          }
          console.log('Login successful, session created for user:', user.username);
          return res.json({ 
            message: 'Login successful',
            user: { 
              id: user.id, 
              username: user.username 
            } 
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(400).json({ message: 'Invalid login data' });
    }
  });

  app.get('/api/session', (req, res) => {
    console.log('Session check, authenticated:', req.isAuthenticated());
    if (req.isAuthenticated()) {
      console.log('User in session:', req.user);
      return res.json({ 
        isAuthenticated: true, 
        user: { 
          id: (req.user as any).id, 
          username: (req.user as any).username 
        } 
      });
    }
    res.json({ isAuthenticated: false });
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout error' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // User registration routes
  app.post('/api/users', async (req, res) => {
    try {
      console.log("Received registration request:", req.body);
      
      const userData = userValidationSchema.parse(req.body);
      console.log("Validation passed, userData:", userData);
      
      // Get IP address
      const ipAddress = req.headers['x-forwarded-for'] || 
                        req.socket.remoteAddress || 
                        'Unknown';
      
      // Convert IP to string format
      const ipString = Array.isArray(ipAddress) 
        ? ipAddress[0] 
        : typeof ipAddress === 'string' 
          ? ipAddress 
          : 'Unknown';
      
      console.log("IP Address:", ipString);
      
      // Get location from IP
      const ipLocation = await getIpLocationInfo(ipString);
      console.log("IP Location:", ipLocation);
      
      try {
        const newUser = await storage.createUser({
          ...userData,
          ipAddress: ipString,
          ipLocation
        });
        
        console.log("User created successfully:", newUser);
        res.status(201).json(newUser);
      } catch (error) {
        console.error("Database error creating user:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error creating user in database', error: errorMessage });
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error:", validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(400).json({ message: 'Invalid user data' });
    }
  });

  // Protected user management routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      console.log("GET /api/users - Fetching all users");
      const users = await storage.getAllUsers();
      console.log(`GET /api/users - Retrieved ${users.length} users:`, users);
      res.json(users);
    } catch (error) {
      console.error("GET /api/users - Error:", error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

  app.get('/api/users/search', isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const results = await storage.searchUsers(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error searching users' });
    }
  });

  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user' });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const userData = userValidationSchema.parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(400).json({ message: 'Invalid user data' });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  });

  // Export users as CSV
  app.get('/api/export/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Create CSV content
      const csvHeader = 'ID,Name,Email,Mobile,Address,IP Address,IP Location,Registration Date\n';
      const csvRows = users.map(user => {
        const date = user.createdAt ? new Date(user.createdAt).toISOString() : '';
        return `${user.id},"${user.name}","${user.email}","${user.mobile}","${user.address}","${user.ipAddress || ''}","${user.ipLocation || ''}","${date}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: 'Error exporting users' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
