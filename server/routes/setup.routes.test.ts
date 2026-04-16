import request from 'supertest';
import app from '../app.js';
import User from '../models/users.model.js';

describe('Integration: Setup Endpoints', () => {

    const mockFirstAdmin = {
        name: 'System Setup Admin',
        email: 'superadmin@ims.com',
        password: 'SecurePassword123!',
    };


    describe('GET /api/setup', () => {
        
        it('should indicate setup is available when database is empty', async () => {
            const response = await request(app).get('/api/setup');

            expect(response.status).toBe(200);
            expect(response.body.needSetup).toBe(true); 
        });

        it('should indicate setup is locked when users already exist', async () => {
            // Seed a user to lock the system
            await User.create({ 
                ...mockFirstAdmin, 
                role: 'user', 
                isApproved: true 
            });

            const response = await request(app).get('/api/setup');
            expect(response.body.needSetup).toBe(false); 
        });
    });

    describe('POST /api/setup', () => {
        
        it('should successfully create the first admin user', async () => {
            const response = await request(app)
                .post('/api/setup')
                .send(mockFirstAdmin);

            expect(response.status).toBe(201);
            
            // Verify the database directly
            const users = await User.find();
            expect(users.length).toBe(1);
            expect(users[0].email).toBe(mockFirstAdmin.email);
            
            // It MUST be an admin, and it MUST be auto-approved so they can actually log in!
            expect(users[0].role).toBe('admin');
            expect(users[0].isApproved).toBe(true); 
        });

        it('should BLOCk creation of an admin if the database is not empty (Security Lockout)', async () => {
            // Seed a user to simulate an already-running production system
            await User.create({ 
                name: 'Existing User',
                email: 'existing@ims.com',
                password: 'hashed',
                role: 'user'
            });

            // Try to run the setup route again 
            const response = await request(app)
                .post('/api/setup')
                .send({
                    name: 'Hacker',
                    email: 'hacker@ims.com',
                    password: 'hacked123'
                });

            // Assert the API rejects the payload 
            expect(response.status).toBeGreaterThanOrEqual(400);

            // Verify the database was NOT compromised
            const users = await User.find();
            expect(users.length).toBe(1); // Still only the existing user
            expect(users[0].email).not.toBe('hacker@ims.com');
        });
    });
});