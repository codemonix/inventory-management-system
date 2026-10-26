import request from 'supertest';
import app from '../app.js';
import User from '../models/users.model.js'; 
import generateToken from '../utils/generateToken.js';

describe('Integration: Auth Endpoints', () => {

    const mockUser = {
        name: 'Integration Test User',
        email: 'test@ims.com',
        password: 'Password123!',
        role: 'user'
    };

    describe('POST /api/auth/register', () => {
        
        afterEach(() => {
            delete process.env.DEFAULT_USER_APPROVED;
        });

        it('should register a new user without a token until approved', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body.token).toBeUndefined();
            expect(response.body.user.email).toBe(mockUser.email);
            expect(response.body.user.isApproved).toBe(false);
        });

        it('should return a token when new users are auto-approved', async () => {
            process.env.DEFAULT_USER_APPROVED = 'true';
            const response = await request(app)
                .post('/api/auth/register')
                .send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
        });

        it('should ignore a role sent by the client (no self-promotion to admin)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...mockUser, role: 'admin' });

            expect(response.status).toBe(201);
            expect(response.body.user.role).toBe('user');
            const saved = await User.findOne({ email: mockUser.email });
            expect(saved?.role).toBe('user');
        });

        it('should reject a short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...mockUser, password: 'short' });

            expect(response.status).toBe(400);
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

    describe('GET /api/auth/me (token checks)', () => {

        const createUserToken = async (overrides: Record<string, unknown>) => {
            const user = await User.create({
                name: 'Token User', email: 'token@ims.com', password: 'hashedpassword',
                role: 'user', isApproved: true, ...overrides,
            });
            return generateToken(user.id, user.role);
        };

        it('should accept a valid token for an active, approved user', async () => {
            const token = await createUserToken({});
            const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should reject a deactivated user even with a valid token', async () => {
            const token = await createUserToken({ isActive: false });
            const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(401);
        });

        it('should reject an unapproved user even with a valid token', async () => {
            const token = await createUserToken({ isApproved: false });
            const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(401);
        });

        it('should reject a malformed token with a single 401 response', async () => {
            const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt');
            expect(response.status).toBe(401);
            expect(response.body).toEqual({ success: false, message: 'Invalid token provided' });
        });
    });
});
