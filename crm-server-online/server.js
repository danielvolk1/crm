require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const {
  User, Client, TimelineEvent, ChangeRequest, Activity,
  CalendarEvent, Task, ClientFile, SalesPitch, Notification
} = require('./models');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

const io = new Server(server, { cors: corsOptions });
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    await initializeData();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n⚠️  Please make sure you have set up your MongoDB Atlas database.');
    console.log('   Get your free database at: https://www.mongodb.com/cloud/atlas');
    process.exit(1);
  }
}

// Initialize default data
async function initializeData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      username: 'Volk',
      password: '13012',
      name: 'Administrator',
      email: 'admin@crm.com',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Created default admin user: Volk / 13012');
  }
}

// Broadcast data update to all connected clients
function broadcastUpdate(fileKey, action, data) {
  io.emit('dataUpdate', { fileKey, action, data });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);
  
  socket.on('requestSync', async () => {
    try {
      const allData = {
        users: await User.find().select('-password').lean(),
        clients: await Client.find().lean(),
        timeline: await TimelineEvent.find().lean(),
        changeRequests: await ChangeRequest.find().lean(),
        activities: await Activity.find().lean(),
        calendarEvents: await CalendarEvent.find().lean(),
        tasks: await Task.find().lean(),
        clientFiles: await ClientFile.find().lean(),
        salesPitches: await SalesPitch.find().lean(),
        notifications: await Notification.find().lean()
      };
      socket.emit('syncData', allData);
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('📡 Client disconnected:', socket.id);
  });
});

// ==================== AUTH ROUTES ====================

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    
    if (user) {
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ success: true, user: userObj });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const userObj = newUser.toObject();
    delete userObj.password;
    broadcastUpdate('users', 'create', userObj);
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password').lean();
    if (user) {
      broadcastUpdate('users', 'update', user);
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    broadcastUpdate('users', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CLIENT ROUTES ====================

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().lean();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).lean();
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    broadcastUpdate('clients', 'create', newClient);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true }).lean();
    if (client) {
      broadcastUpdate('clients', 'update', client);
      res.json(client);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    broadcastUpdate('clients', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TIMELINE ROUTES ====================

app.get('/api/timeline', async (req, res) => {
  try {
    const events = await TimelineEvent.find().sort({ createdAt: -1 }).lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/timeline', async (req, res) => {
  try {
    const newEvent = await TimelineEvent.create(req.body);
    broadcastUpdate('timeline', 'create', newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/timeline/:id', async (req, res) => {
  try {
    const event = await TimelineEvent.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (event) {
      broadcastUpdate('timeline', 'update', event);
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/timeline/:id', async (req, res) => {
  try {
    await TimelineEvent.findByIdAndDelete(req.params.id);
    broadcastUpdate('timeline', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHANGE REQUEST ROUTES ====================

app.get('/api/changeRequests', async (req, res) => {
  try {
    const requests = await ChangeRequest.find().sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/changeRequests', async (req, res) => {
  try {
    const newRequest = await ChangeRequest.create(req.body);
    broadcastUpdate('changeRequests', 'create', newRequest);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/changeRequests/:id', async (req, res) => {
  try {
    const request = await ChangeRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (request) {
      broadcastUpdate('changeRequests', 'update', request);
      res.json(request);
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/changeRequests/:id', async (req, res) => {
  try {
    await ChangeRequest.findByIdAndDelete(req.params.id);
    broadcastUpdate('changeRequests', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACTIVITY ROUTES ====================

app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).lean();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const newActivity = await Activity.create(req.body);
    broadcastUpdate('activities', 'create', newActivity);
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CALENDAR EVENT ROUTES ====================

app.get('/api/calendarEvents', async (req, res) => {
  try {
    const events = await CalendarEvent.find().lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/calendarEvents', async (req, res) => {
  try {
    const newEvent = await CalendarEvent.create(req.body);
    broadcastUpdate('calendarEvents', 'create', newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/calendarEvents/:id', async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (event) {
      broadcastUpdate('calendarEvents', 'update', event);
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/calendarEvents/:id', async (req, res) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    broadcastUpdate('calendarEvents', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK ROUTES ====================

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().lean();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    broadcastUpdate('tasks', 'create', newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (task) {
      broadcastUpdate('tasks', 'update', task);
      res.json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    broadcastUpdate('tasks', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CLIENT FILE ROUTES ====================

app.get('/api/clientFiles', async (req, res) => {
  try {
    const files = await ClientFile.find().lean();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clientFiles', async (req, res) => {
  try {
    const newFile = await ClientFile.create(req.body);
    broadcastUpdate('clientFiles', 'create', newFile);
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clientFiles/:id', async (req, res) => {
  try {
    const file = await ClientFile.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (file) {
      broadcastUpdate('clientFiles', 'update', file);
      res.json(file);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clientFiles/:id', async (req, res) => {
  try {
    await ClientFile.findByIdAndDelete(req.params.id);
    broadcastUpdate('clientFiles', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SALES PITCH ROUTES ====================

app.get('/api/salesPitches', async (req, res) => {
  try {
    const pitches = await SalesPitch.find().lean();
    res.json(pitches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/salesPitches', async (req, res) => {
  try {
    const newPitch = await SalesPitch.create(req.body);
    broadcastUpdate('salesPitches', 'create', newPitch);
    res.status(201).json(newPitch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/salesPitches/:id', async (req, res) => {
  try {
    const pitch = await SalesPitch.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true }).lean();
    if (pitch) {
      broadcastUpdate('salesPitches', 'update', pitch);
      res.json(pitch);
    } else {
      res.status(404).json({ error: 'Pitch not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/salesPitches/:id', async (req, res) => {
  try {
    await SalesPitch.findByIdAndDelete(req.params.id);
    broadcastUpdate('salesPitches', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTIFICATION ROUTES ====================

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const newNotification = await Notification.create(req.body);
    broadcastUpdate('notifications', 'create', newNotification);
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (notification) {
      broadcastUpdate('notifications', 'update', notification);
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    broadcastUpdate('notifications', 'delete', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYNC ROUTE ====================

app.get('/api/sync', async (req, res) => {
  try {
    const allData = {
      users: await User.find().select('-password').lean(),
      clients: await Client.find().lean(),
      timeline: await TimelineEvent.find().lean(),
      changeRequests: await ChangeRequest.find().lean(),
      activities: await Activity.find().lean(),
      calendarEvents: await CalendarEvent.find().lean(),
      tasks: await Task.find().lean(),
      clientFiles: await ClientFile.find().lean(),
      salesPitches: await SalesPitch.find().lean(),
      notifications: await Notification.find().lean()
    };
    res.json(allData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
async function startServer() {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 CRM Server Running - Online Version');
    console.log('='.repeat(60));
    console.log(`Port: ${PORT}`);
    console.log(`Database: MongoDB Atlas`);
    console.log('');
    console.log('API Endpoints:');
    console.log('  POST /api/login          - User login');
    console.log('  GET  /api/users          - List users');
    console.log('  GET  /api/clients        - List clients');
    console.log('  GET  /api/timeline       - List timeline events');
    console.log('  GET  /api/changeRequests - List change requests');
    console.log('  GET  /api/sync           - Full data sync');
    console.log('');
    console.log('Default Login:');
    console.log('  Username: Volk');
    console.log('  Password: 13012');
    console.log('='.repeat(60));
  });
}

startServer().catch(console.error);
