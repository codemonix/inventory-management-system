import request from 'supertest';
import app from '../app.js';

describe('Auth Endpoints', () => {
    it('should register a new User', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'test4',
            email: 'test@example.com',
            password: 'test123',
            role: 'user'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe('test@example.com');
        expect(res.body.token).toBeDefined();
    });

    it('should not register with existing email', async () => {
            await request(app).post('/api/auth/register').send({
            name: 'test1',
            email: 'test@example.com',
            password: 'test123',
            role: 'manager'
        });

        const res = await request(app).post('/api/auth/register').send({
            name: 'test2',
            email: 'test@example.com',
            password: 'test456',
            role: 'user'
        });
        expect(res.statusCode).toBe(409);
    });

    // required user approved by default
    it('logs in the user', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'login',
            email: 'login@example.com',
            password: 'password123',
            role: 'user',
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@example.com', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});

