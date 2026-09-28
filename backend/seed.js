import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './app/config/db.js';
import User from './app/models/User.js';
import Task from './app/models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Task.deleteMany({});

    console.log('Seeding demo users...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedManagerPassword = await bcrypt.hash('manager123', 10);
    const hashedEmployeePassword = await bcrypt.hash('employee123', 10);

    const admin = await User.create({
      name: 'Vikram Sharma',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'Admin',
      phone: '+91 98765 43210',
      isActive: true,
    });

    const manager = await User.create({
      name: 'Sneha Patel',
      email: 'manager@example.com',
      password: hashedManagerPassword,
      role: 'Manager',
      phone: '+91 98111 22334',
      isActive: true,
    });

    const employee1 = await User.create({
      name: 'Rahul Verma',
      email: 'employee@example.com',
      password: hashedEmployeePassword,
      role: 'Employee',
      phone: '+91 97234 56789',
      isActive: true,
    });

    const employee2 = await User.create({
      name: 'Pooja Banerjee',
      email: 'pooja@example.com',
      password: hashedEmployeePassword,
      role: 'Employee',
      phone: '+91 98300 12345',
      isActive: true,
    });

    console.log('Seeding sample MERN tasks...');
    await Task.create([
      {
        title: 'Design MongoDB Schema & Indexing for High-Performance Queries',
        description: 'Create compound indexes on assignedTo and status fields in Task collection to optimize query response times.',
        priority: 'High',
        status: 'In Progress',
        assignedTo: employee1._id,
        assignedBy: manager._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Implement JWT Token Auth & Role Verification Middleware',
        description: 'Verify Bearer token in headers and validate permission matrix against role.json.',
        priority: 'High',
        status: 'Completed',
        assignedTo: employee1._id,
        assignedBy: manager._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Build React UI with Responsive Bootstrap Dashboard',
        description: 'Develop clean task list with real-time status updates and modal actions.',
        priority: 'Medium',
        status: 'Pending',
        assignedTo: employee2._id,
        assignedBy: manager._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Setup Production Deployment Configurations',
        description: 'Prepare serverless handler and cloud MongoDB Atlas connection pooling.',
        priority: 'Low',
        status: 'Pending',
        assignedTo: employee1._id,
        assignedBy: admin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Demo seed completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Admin:    admin@example.com    / admin123');
    console.log('Manager:  manager@example.com  / manager123');
    console.log('Employee: employee@example.com / employee123');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
