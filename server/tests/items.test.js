import request from 'supertest';
import app from '../app';

let token;

beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
        name: 'item',
        email: 'item@test.com',
        password: '123456',
        role: 'admin',
    })
    token = res.body.token;
});

describe('Items', () => {
    it('creates a new item', async () => {
        const res = await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Item A', price: '54' });
        expect(res.statusCode).toBe(201);
        expect(res.body.item.name).toBe('Item A');
    });

    it('prevents duplicate items', async () => {
        await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Item A'});

        const res = await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Item A'});

        expect(res.statusCode).toBe(400);
    });

    it('fetches item list', async () => {
        const res = await request(app)
            .get('/api/items')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
    });
});