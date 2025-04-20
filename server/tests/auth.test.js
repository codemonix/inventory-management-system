import request from 'supertest';
import app from '../server.js';

describe('Auth Endpoints', () => {
    it('should register a new User', async () => {
        const res = await request(app).post('/api/auth/register').send({
            name: 'test4',
            email: 'test@example.com',
            password: 'test123',
            role: 'manager'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe('test@example.com');
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
        expect(res.statusCode).toBe(400);
    })
});

