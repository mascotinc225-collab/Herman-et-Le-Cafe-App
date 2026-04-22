import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { Customer, Transaction, Offer, CustomerSegment } from "./src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  const PORT = Number(process.env.PORT) || 3000;

  // Serve Material folder from public for dev compatibility
  app.use("/Material", express.static(path.join(process.cwd(), "public", "Material")));

  // --- MOCK DATABASE ---
  let customers: Customer[] = [
    {
      id: "HC001",
      name: "Monty Carlo",
      phone: "+225 07070707",
      points: 120,
      stamps: 6,
      tier: "Bronze",
      joinDate: "2024-01-15",
      lastVisit: new Date().toISOString(),
      referralCode: "MONTY-BREW",
      referralCount: 0
    },
    {
      id: "HC002",
      name: "Linda Espresso",
      phone: "+225 01010101",
      points: 450,
      stamps: 8,
      tier: "Silver",
      joinDate: "2023-11-20",
      lastVisit: new Date().toISOString(),
      referralCode: "LINDA-BREW",
      referralCount: 2
    },
    {
      id: "HC003",
      name: "David Brewster",
      phone: "+225 05050505",
      points: 980,
      stamps: 3,
      tier: "Gold",
      joinDate: "2023-08-10",
      lastVisit: new Date().toISOString(),
      referralCode: "DAVID-BREW",
      referralCount: 5
    }
  ];

  let transactions: Transaction[] = [];
  let mailLog: any[] = [];
  let offers: Offer[] = [
    {
      id: "off1",
      title: "Morning Perk",
      description: "Double stamps between 7am-9am",
      type: "global",
      expiry: "2026-12-31",
      icon: "Sun"
    }
  ];

  let activities: any[] = [
    { id: 1, type: 'join', customer: 'Monty Carlo', time: '2 mins ago', detail: 'Joined Signature Club' },
    { id: 2, type: 'purchase', customer: 'Linda Espresso', time: '15 mins ago', detail: 'Purchased Ivorian Latte' },
    { id: 3, type: 'tier', customer: 'David Brewster', time: '1 hour ago', detail: 'Reached Gold Status' }
  ];

  let notifications: any[] = [
    { id: '1', title: 'Welcome to Brew Club', message: 'Enjoy your first signature drink on us!', timestamp: new Date().toISOString(), time: 'Just now', read: false, type: 'info' }
  ];

  const getCustomerSegment = (customer: Customer): CustomerSegment => {
    const today = new Date();
    const lastVisit = new Date(customer.lastVisit);
    const diffDays = Math.ceil(Math.abs(today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

    if (customer.referralCount >= 5) return 'Referral King';
    if (customer.points > 800) return 'Champion';
    if (diffDays > 30) return 'Churn Risk';
    if (customer.points > 200) return 'Active';
    return 'New Member';
  };

  // Helper to emit updates
  const broadcastUpdate = () => {
    const segmentedCustomers = customers.map(c => ({
      ...c,
      segment: getCustomerSegment(c)
    }));
    
    io.emit('data_update', {
      activities,
      stats: generateStats(segmentedCustomers),
      emails: mailLog,
      customers: segmentedCustomers,
      notifications
    });
  };

  const generateStats = (currentCustomers = customers) => {
    const segments = currentCustomers.reduce((acc, c) => {
      const segment = getCustomerSegment(c);
      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      revenueOverTime: [
        { date: "Mon", amount: 45000 },
        { date: "Tue", amount: 52000 },
        { date: "Wed", amount: 48000 },
        { date: "Thu", amount: 61000 },
        { date: "Fri", amount: 75000 },
        { date: "Sat", amount: 89000 },
        { date: "Sun", amount: 42000 }
      ],
      customerGrowth: [
        { date: "Week 1", new: 45, returning: 120 },
        { date: "Week 2", new: 52, returning: 145 },
        { date: "Week 3", new: 38, returning: 168 },
        { date: "Week 4", new: 64, returning: 192 }
      ],
      topCustomers: currentCustomers.map(c => ({ name: c.name, spend: c.points * 100 })),
      popularDrinks: [
        { name: "Espresso", count: 145 },
        { name: "Latte", count: 230 },
        { name: "Cappuccino", count: 180 },
        { name: "Frappuccino", count: 320 },
        { name: "Milkshake", count: 110 }
      ],
      rewardsIssued: [
        { date: "Mon", count: 2 },
        { date: "Tue", count: 5 },
        { date: "Wed", count: 3 },
        { date: "Thu", count: 8 },
        { date: "Fri", count: 12 },
        { date: "Sat", count: 15 },
        { date: "Sun", count: 4 }
      ],
      segmentData: Object.entries(segments).map(([name, value]) => ({ name, value }))
    };
  };

  // --- API ROUTES ---

  app.get("/api/emails", (req, res) => res.json(mailLog));
  app.get("/api/activities", (req, res) => res.json(activities));
  app.get("/api/customers", (req, res) => res.json(customers));
  app.get("/api/customers/:id", (req, res) => {
    const customer = customers.find(c => c.id === req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  });

  app.get("/api/customers/:id/transactions", (req, res) => {
    const customerTransactions = transactions.filter(t => t.customerId === req.params.id);
    res.json(customerTransactions);
  });

  // Create new customer
  app.post("/api/customers", (req, res) => {
    const { name, phone, email, joinDate, lastVisit, referralCode } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });

    const newCustomerId = `HC${(customers.length + 1).toString().padStart(3, '0')}`;
    const newCustomer: Customer = {
      id: newCustomerId,
      name,
      phone,
      email,
      points: 0,
      stamps: 0,
      tier: "Bronze",
      joinDate: joinDate || new Date().toISOString(),
      lastVisit: lastVisit || new Date().toISOString(),
      referralCode: `${name.split(' ')[0].toUpperCase()}-${newCustomerId}`,
      referralCount: 0
    };

    // Process referral
    if (referralCode) {
      const referrer = customers.find(c => c.referralCode === referralCode);
      if (referrer) {
        referrer.points += 50;
        referrer.referralCount += 1;
        newCustomer.referredBy = referrer.id;
        newCustomer.points += 25; // Welcome bonus for being referred

        activities.unshift({
          id: Date.now() + 2,
          type: 'tier',
          customer: referrer.name,
          time: 'Just now',
          detail: `Referral Bonus: +50 PTS from ${newCustomer.name}`
        });

        mailLog.unshift({
          id: Date.now() + 3,
          to: referrer.email || referrer.phone,
          subject: "Referral Reward Unlocked!",
          body: `High five ${referrer.name}! Your referral code was used by ${newCustomer.name}. We've added 50 points to your account.`,
          time: 'Just now'
        });
      }
    }

    customers.push(newCustomer);
    
    // Welcome Email Simulation
    mailLog.unshift({
      id: Date.now(),
      to: email || phone,
      subject: "Welcome to Signature Brew Club",
      body: `Hi ${name}, welcome to Abidjan's most exclusive coffee club. As a new member, you've unlocked a special perk: double stamps on your first signature selection! Enjoy your 100% locally sourced brews!`,
      time: 'Just now'
    });

    activities.unshift({ 
      id: Date.now(), 
      type: 'join', 
      customer: newCustomer.name, 
      time: 'Just now', 
      detail: 'Registered for Signature Club' 
    });

    // Add Welcome Notification
    notifications.unshift({
      id: `welcome-${newCustomerId}`,
      title: 'Welcome to the Club!',
      message: `Bienvenue ${name}! Enjoy a "New Member" perk: Double stamps on your very first signature selection.`,
      timestamp: new Date().toISOString(),
      time: 'Just now',
      read: false,
      type: 'info'
    });
    
    if (activities.length > 20) activities.pop();
    if (notifications.length > 20) notifications.pop();
    broadcastUpdate();
    res.status(201).json(newCustomer);
  });

  // Add visit / stamp
  app.post("/api/customers/:id/visit", (req, res) => {
    const { drinkType, price, staff } = req.body;
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    if (customerIndex === -1) return res.status(404).json({ error: "Customer not found" });

    const customer = customers[customerIndex];
    const prevTier = customer.tier;
    let stampsAdded = 1;
    
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) stampsAdded = 2;

    customer.stamps += stampsAdded;
    
    // Tier-based point multipliers
    let multiplier = 1;
    if (customer.tier === 'Silver') multiplier = 1.5;
    if (customer.tier === 'Gold') multiplier = 2;
    
    const basePoints = Math.floor(price / 100);
    const earnedPoints = Math.floor(basePoints * multiplier);
    
    customer.points += earnedPoints;
    customer.lastVisit = new Date().toISOString();

    // Update tier
    if (customer.points >= 750) customer.tier = "Gold";
    else if (customer.points >= 300) customer.tier = "Silver";

    // Tier Milestone Email
    if (prevTier !== customer.tier) {
      mailLog.unshift({
        id: Date.now() + 5,
        to: customer.email || customer.phone,
        subject: `New Milestone: ${customer.tier} Status!`,
        body: `Congratulations ${customer.name}! You've reached ${customer.tier} status. Unlock your new library of exclusive rewards in the app.`,
        time: 'Just now'
      });
      activities.unshift({
        id: Date.now() + 1,
        type: 'tier',
        customer: customer.name,
        time: 'Just now',
        detail: `Promoted to ${customer.tier} Status`
      });
    }

    const transaction: Transaction = {
      id: `TR${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      drinkType,
      price,
      timestamp: new Date().toISOString(),
      staff,
      action: 'purchase',
      pointsEarned: Math.floor(price / 100)
    };

    transactions.push(transaction);
    activities.unshift({ 
      id: Date.now(), 
      type: 'purchase', 
      customer: customer.name, 
      time: 'Just now', 
      detail: `Purchased ${transaction.drinkType} (+${Math.floor(price / 100)} PTS)` 
    });
    
    if (activities.length > 20) activities.pop();
    broadcastUpdate();
    res.json({ customer, transaction });
  });

  app.get("/api/stats", (req, res) => res.json(generateStats()));

  app.post("/api/notifications", (req, res) => {
    const { title, message, type } = req.body;
    const newNotif = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      time: 'Just now',
      read: false,
      type: type || 'info'
    };
    notifications.unshift(newNotif);
    broadcastUpdate();
    res.json(newNotif);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite could not be loaded", e);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
