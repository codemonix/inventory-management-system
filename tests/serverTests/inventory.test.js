
import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../server.js';
// import { describe } from 'node:test';

test('Get /api/inventory should return a list of items', async () => {
    const response = await request(app).get('/api/inventory');
    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.body));
})