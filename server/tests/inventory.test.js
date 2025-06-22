import request from 'supertest';
import app from '../app';


let token, itemId, locationId;

beforeAll(async () => {
    const res = await request(app).post('/api/auth/register')
        .send({
            name: 'inventory',
            email: 'inventory@test.com',
            password: '123456',
            role: 'admin',
        });
    console.log("inventory admin user:", res.body)
    token = res.body.token;

    const location = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Main' });
    locationId = location.body.location._id;

    const itemRes = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'StockItem' });
    itemId = itemRes.body.item._id;
});

describe('Inventory In/Out', () => {
    it('adds stock', async () => {
        const res = await request(app)
            .post(`/api/inventory/${itemId}/in`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                locationId,
                quantity: 10,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('removes stock', async () => {
        await request(app)
            .post(`/api/inventory/${itemId}/in`)
            .set('Authorization', `Bearer ${token}`)
            .send({ locationId, quantity: 10 });
        
        const res = await request(app)
            .post(`/api/inventory/${itemId}/out`)
            .set('Authorization', `Bearer ${token}`)
            .send({ locationId, quantity: 5 });

        expect(res.statusCode).toBe(200);
    });
});