import request from 'supertest';
import app from '../app.js';
import User from '../models/users.model.js'; 

describe('Integration: Auth Endpoints', () => {

    const mockUser = {
        name: 'Integration Test User',
        email: 'test@ims.com',
        password: 'Password123!',
        role: 'user'
    };

    describe('POST /api/auth/register', () => {
        
        it('should successfully register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(mockUser.email);
        });

        it('should reject registration with an existing email', async () => {
            await request(app).post('/api/auth/register').send(mockUser);

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Different Name',
                    email: mockUser.email,
                    password: 'NewPassword123!',
                    role: 'user'
                });

            expect(response.status).toBe(409); 
            const errorMessage = response.body.error || response.body.message;
            expect(response.body.success).toBe(false);
            expect(errorMessage).toBe('Email already registered'); 
        });
    });

    describe('POST /api/auth/login', () => {
        
        beforeEach(async () => {
            // API register the user
            await request(app).post('/api/auth/register').send(mockUser);

            // Use Mongoose ONLY to find that user and flip the approval switch!
            await User.updateOne({ email: mockUser.email }, { isApproved: true }); 
        });

        it('should successfully log in a registered user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ 
                    email: mockUser.email, 
                    password: mockUser.password 
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(mockUser.email);
        });

        it('should reject login with an invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ 
                    email: mockUser.email, 
                    password: 'WrongPassword!' 
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            const errorMessage = response.body.error || response.body.message;
            expect(errorMessage).toBe('Invalid credentials');
        });
    });
});