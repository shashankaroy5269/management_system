import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Task from '../models/Task.js';
import AssignmentHistory from '../models/AssignmentHistory.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB database...');
    await connectDB();

    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      AssignmentHistory.deleteMany({})
    ]);

    console.log('[Seeder] Creating  Demo Users with  Contact Details...');

    // 1. Super Admin
    const admin = await User.create({
      name: 'Vikram Malhotra',
      email: 'admin@example.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+91 98201 11223',
      status: 'active',
      isVerified: true
    });

    // 2. Engineering Managers
    const managerSneha = await User.create({
      name: 'Sneha Mukherjee',
      email: 'manager.sneha@example.com',
      password: 'Manager@123456',
      role: 'manager',
      phone: '+91 98301 44556',
      status: 'active',
      isVerified: true
    });

    const managerAmit = await User.create({
      name: 'Amit Verma',
      email: 'manager.amit@example.com',
      password: 'Manager@123456',
      role: 'manager',
      phone: '+91 98112 77889',
      status: 'active',
      isVerified: true
    });

    // 3. MERN Stack Employees
    const empRahul = await User.create({
      name: 'Rahul Sharma',
      email: 'employee.rahul@example.com',
      password: 'Employee@123456',
      role: 'employee',
      phone: '+91 98765 43210',
      status: 'active',
      isVerified: true
    });

    const empRohan = await User.create({
      name: 'Rohan Das',
      email: 'employee.rohan@example.com',
      password: 'Employee@123456',
      role: 'employee',
      phone: '+91 97481 23654',
      status: 'active',
      isVerified: true
    });

    const empPriya = await User.create({
      name: 'Priya Patel',
      email: 'employee.priya@example.com',
      password: 'Employee@123456',
      role: 'employee',
      phone: '+91 99033 88776',
      status: 'active',
      isVerified: true
    });

    const empAnanya = await User.create({
      name: 'Ananya Sen',
      email: 'employee.ananya@example.com',
      password: 'Employee@123456',
      role: 'employee',
      phone: '+91 98310 99887',
      status: 'active',
      isVerified: true
    });

    console.log('[Seeder] Users seeded successfully.');

    console.log('[Seeder] Creating Realistic MERN Stack Production Tasks & Audit Logs...');

    const today = new Date();
    const inDays = (days) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    // -------------------------------------------------------------
    // Task 1: JWT & RBAC Auth System (In Progress)
    // -------------------------------------------------------------
    const task1 = await Task.create({
      title: 'Build JWT Dual-Token Authentication & Axios Refresh Interceptor in React',
      description: 'Implement short-lived access tokens (15m) and long-lived refresh tokens (7d) in Express.js. Configure Axios response interceptors in React to catch 401 Unauthorized errors and seamlessly refresh tokens in the background.',
      assignedBy: managerSneha._id,
      assignedTo: empRahul._id,
      status: 'In Progress',
      priority: 'Urgent',
      dueDate: inDays(3),
      comments: [
        {
          user: managerSneha._id,
          text: 'Rahul, please ensure the refresh token endpoint is protected against concurrent request race conditions.',
          createdAt: inDays(-2)
        },
        {
          user: empRahul._id,
          text: 'Sneha, I added a failed request queue in axiosClient.js. Tested with simulated 401s and tokens rotate seamlessly.',
          createdAt: inDays(-1)
        }
      ]
    });

    await AssignmentHistory.create([
      {
        taskId: task1._id,
        changedBy: managerSneha._id,
        action: 'TASK_CREATED',
        newAssignee: empRahul._id,
        newStatus: 'Pending',
        note: 'Task created and assigned to Rahul Sharma for MERN auth pipeline.'
      },
      {
        taskId: task1._id,
        changedBy: empRahul._id,
        action: 'STATUS_UPDATED',
        previousStatus: 'Pending',
        newStatus: 'In Progress',
        note: 'Started implementing JWT token signing and React interceptor queue.'
      }
    ]);

    // -------------------------------------------------------------
    // Task 2: MongoDB Aggregation Pipeline (Completed)
    // -------------------------------------------------------------
    const task2 = await Task.create({
      title: 'Design MongoDB Aggregation Pipelines for Real-Time Workspace Analytics',
      description: 'Build high-performance MongoDB aggregation pipelines using $match, $group, and $lookup to compute task completion rates, role allocations, and employee workload distributions directly inside the database.',
      assignedBy: managerSneha._id,
      assignedTo: empRohan._id,
      status: 'Completed',
      priority: 'High',
      dueDate: inDays(-1),
      comments: [
        {
          user: empRohan._id,
          text: 'Aggregation queries benchmarked on indexed collections. Response latency reduced to ~5ms.',
          createdAt: inDays(-1)
        }
      ]
    });

    await AssignmentHistory.create([
      {
        taskId: task2._id,
        changedBy: managerSneha._id,
        action: 'TASK_CREATED',
        newAssignee: empRohan._id,
        newStatus: 'Pending',
        note: 'Assigned analytics pipeline optimization to Rohan Das.'
      },
      {
        taskId: task2._id,
        changedBy: empRohan._id,
        action: 'STATUS_UPDATED',
        previousStatus: 'Pending',
        newStatus: 'In Progress',
        note: 'Constructed aggregation stages for role and task status metrics.'
      },
      {
        taskId: task2._id,
        changedBy: empRohan._id,
        action: 'STATUS_UPDATED',
        previousStatus: 'In Progress',
        newStatus: 'Completed',
        note: 'Completed aggregation pipeline benchmarks and verified query execution plans.'
      }
    ]);

    // -------------------------------------------------------------
    // Task 3: Tailwind React Component System (Completed)
    // -------------------------------------------------------------
    const task3 = await Task.create({
      title: 'Develop Responsive React Component System with Tailwind CSS & Lucide Icons',
      description: 'Create reusable, modern UI components including TaskCard, StatusBadge, PriorityBadge, ConfirmDialog, and animated Modals tailored for responsive mobile and desktop viewports.',
      assignedBy: managerAmit._id,
      assignedTo: empPriya._id,
      status: 'Completed',
      priority: 'Medium',
      dueDate: inDays(-2),
      comments: [
        {
          user: empPriya._id,
          text: 'All interactive modals, filter bars, and responsive sidebar navigation tested across devices.',
          createdAt: inDays(-2)
        }
      ]
    });

    await AssignmentHistory.create([
      {
        taskId: task3._id,
        changedBy: managerAmit._id,
        action: 'TASK_CREATED',
        newAssignee: empPriya._id,
        newStatus: 'Completed',
        note: 'Task completed and UI components published to the design system.'
      }
    ]);

    // -------------------------------------------------------------
    // Task 4: Integration Testing for RBAC Boundaries (Pending)
    // -------------------------------------------------------------
    const task4 = await Task.create({
      title: 'Write End-to-End API Security Tests for Express RBAC Middleware Boundaries',
      description: 'Write comprehensive integration tests using Supertest to verify that Employee tokens trying to invoke Admin endpoints (User CRUD, deletion) receive 403 Forbidden responses.',
      assignedBy: managerSneha._id,
      assignedTo: empAnanya._id,
      status: 'Pending',
      priority: 'High',
      dueDate: inDays(5)
    });

    await AssignmentHistory.create([
      {
        taskId: task4._id,
        changedBy: managerSneha._id,
        action: 'TASK_CREATED',
        newAssignee: empAnanya._id,
        newStatus: 'Pending',
        note: 'Assigned RBAC security boundary testing to Ananya Sen.'
      }
    ]);

    // -------------------------------------------------------------
    // Task 5: Multer & Cloudinary File Uploads (In Progress)
    // -------------------------------------------------------------
    const task5 = await Task.create({
      title: 'Implement Multer Multipart File Uploads with Cloudinary CDN Integration',
      description: 'Build secure multipart/form-data upload pipeline in Node.js for task attachments, deliverables, and user profile avatars with file type validation and local disk fallback.',
      assignedBy: managerAmit._id,
      assignedTo: empRahul._id,
      status: 'In Progress',
      priority: 'Medium',
      dueDate: inDays(4)
    });

    await AssignmentHistory.create([
      {
        taskId: task5._id,
        changedBy: managerAmit._id,
        action: 'TASK_CREATED',
        newAssignee: empRahul._id,
        newStatus: 'In Progress',
        note: 'Assigned Cloudinary & Multer attachment service to Rahul.'
      }
    ]);

    // -------------------------------------------------------------
    // Task 6: Mongoose Schema Indexing (Pending / Overdue Example)
    // -------------------------------------------------------------
    const task6 = await Task.create({
      title: 'Optimize Mongoose Schema Indexes & Full-Text Search Queries',
      description: 'Apply compound indexes on { assignedTo: 1, status: 1 } and { dueDate: 1 } in Mongoose to accelerate high-frequency task filters and search queries.',
      assignedBy: admin._id,
      assignedTo: empRohan._id,
      status: 'Pending',
      priority: 'Urgent',
      dueDate: inDays(-4) // Overdue milestone for testing UI alert badges
    });

    await AssignmentHistory.create([
      {
        taskId: task6._id,
        changedBy: admin._id,
        action: 'TASK_CREATED',
        newAssignee: empRohan._id,
        newStatus: 'Pending',
        note: 'Urgent database indexing task assigned by Vikram Malhotra.'
      }
    ]);

    console.log('[Seeder] Realistic MERN stack tasks and audit histories seeded successfully.');
    console.log(`
========================================================================
🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!
========================================================================
Demo Credentials for Live Interview Showcase:
------------------------------------------------------------------------
[👑 ADMIN]:
  Name:     Vikram Malhotra
  Email:    admin@example.com
  Password: Admin@123456
  Phone:    +91 98201 11223
  Role:     admin (Manage users, roles, view all tasks, global analytics)

[💼 MANAGER 1]:
  Name:     Sneha Mukherjee (Engineering Lead)
  Email:    manager.sneha@example.com
  Password: Manager@123456
  Phone:    +91 98301 44556
  Role:     manager (Create tasks, assign employees, view team metrics)

[💼 MANAGER 2]:
  Name:     Amit Verma (Product Lead)
  Email:    manager.amit@example.com
  Password: Manager@123456
  Phone:    +91 98112 77889
  Role:     manager

[👨‍💻 EMPLOYEE 1]:
  Name:     Rahul Sharma (MERN Full Stack Developer)
  Email:    employee.rahul@example.com
  Password: Employee@123456
  Phone:    +91 98765 43210
  Role:     employee (View assigned tasks, update status, upload deliverables)

[👨‍💻 EMPLOYEE 2]:
  Name:     Rohan Das (Backend Node.js Developer)
  Email:    employee.rohan@example.com
  Password: Employee@123456
  Phone:    +91 97481 23654
  Role:     employee

[🎨 EMPLOYEE 3]:
  Name:     Priya Patel (Frontend React Developer)
  Email:    employee.priya@example.com
  Password: Employee@123456
  Phone:    +91 99033 88776
  Role:     employee

[🧪 EMPLOYEE 4]:
  Name:     Ananya Sen (QA & Test Automation)
  Email:    employee.ananya@example.com
  Password: Employee@123456
  Phone:    +91 98310 99887
  Role:     employee
========================================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
