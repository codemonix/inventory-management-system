// server/routes/user.routes.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

// Import Models & Utils
import User from '../models/users.model.js';
import generateToken from '../utils/generateToken.js';

describe('Integration: User Management Endpoints', () => {

    let adminToken: string;
    let managerToken: string;
    let userToken: string;
    let targetUserId: string;

    beforeEach(async () => {
        // Create the System Administrator
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@ims.com',
            password: 'hashedpassword',
            role: 'admin',
            isApproved: true
        });
        adminToken = generateToken(admin.id, admin.role);

        // Create the Warehouse Manager
        const manager = await User.create({
            name: 'Warehouse Manager',
            email: 'manager@ims.com',
            password: 'hashedpassword',
            role: 'manager',
            isApproved: true
        });
        managerToken = generateToken(manager.id, manager.role);

        // Create a Standard Worker
        const worker = await User.create({
            name: 'Standard Worker',
            email: 'worker@ims.com',
            password: 'hashedpassword',
            role: 'user',
            isApproved: true
        });
        userToken = generateToken(worker.id, worker.role);

        // Create the "Target" User that our tests will mutate
        const targetUser = await User.create({
            name: 'Target User',
            email: 'target@ims.com',
            password: 'hashedpassword',
            role: 'user',
            isActive: true,    
            isApproved: false  
        });
        targetUserId = targetUser.id;
    });

    describe('GET /api/users', () => {
        
        it('should allow Managers and Admins to fetch the user list', async () => {
            const adminRes = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
            const managerRes = await request(app).get('/api/users').set('Authorization', `Bearer ${managerToken}`);

            expect(adminRes.status).toBe(200);
            expect(managerRes.status).toBe(200);
            
            // Should be 4 users total (Admin, Manager, Worker, Target)
            const usersArray = adminRes.body.users;
            expect(usersArray.length).toBe(4);
        });

        it('should FORBID standard users from fetching the user list', async () => {
            const response = await request(app).get('/api/users').set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
        });
    });

    describe('PATCH /api/users/:id/toggle-active', () => {
        
        it('should allow a Manager to toggle a user active status', async () => {
            const response = await request(app)
                .patch(`/api/users/${targetUserId}/toggle-active`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ isActive: false });


            expect(response.status).toBe(200);

            // Check the DB to ensure it flipped from true to false
            const mutatedUser = await User.findById(targetUserId);
            expect(mutatedUser?.isActive).toBe(false); 
        });

        it('should safely return 404 if the user ID does not exist', async () => {
            // Using our Mongoose fake ID trick!
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .patch(`/api/users/${fakeId}/toggle-active`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false });


            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/users/:id/toggle-approved', () => {
        
        it('should allow an Admin to approve a user', async () => {
            const response = await request(app)
                .patch(`/api/users/${targetUserId}/toggle-approved`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isApproved: true });


            expect(response.status).toBe(200);

            // Check the DB to ensure it flipped from false to true
            const mutatedUser = await User.findById(targetUserId);
            expect(mutatedUser?.isApproved).toBe(true); 
        });
    });

    describe('PUT /api/users/:id', () => {
        
        const updatePayload = {
            name: 'Updated Target Name',
            role: 'manager'
        };

        it('should allow an Admin to fully update a user profile', async () => {
            const response = await request(app)
                .put(`/api/users/${targetUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatePayload);

            expect(response.status).toBe(200);

            // Prove the database actually saved the changes
            const updatedUser = await User.findById(targetUserId);
            expect(updatedUser?.name).toBe('Updated Target Name');
            expect(updatedUser?.role).toBe('manager');
        });

        it('should FORBID a Manager from updating a user profile (Strict Admin Check)', async () => {
            const response = await request(app)
                .put(`/api/users/${targetUserId}`)
                .set('Authorization', `Bearer ${managerToken}`) // Manager trying to use the PUT route!
                .send(updatePayload);

            // Expected to fail because PUT requires strict `isAdmin`
            expect(response.status).toBe(403);

            // Prove the user was NOT updated
            const survivingUser = await User.findById(targetUserId);
            expect(survivingUser?.name).toBe('Target User');
            expect(survivingUser?.role).toBe('user');
        });
    });
});