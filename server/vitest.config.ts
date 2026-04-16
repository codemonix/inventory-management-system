import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true, 
        
        environment: 'node', 
        setupFiles: ['./tests/setup.ts'], 
        
        // Tells Vitest where to find the test files
        include: ['./**/*.test.ts'], 
        
        // Prevents tests from running indefinitely if a database connection hangs
        testTimeout: 10000, 

        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            // Exclude things that shouldn't be tested (like types or config files)
            exclude: [
                'node_modules/', 
                'server/types/', 
                'server/config/db.config.ts',
                'server/server.ts'
            ]
        },
    },
});