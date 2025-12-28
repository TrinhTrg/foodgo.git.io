# Frontend Tests

Thư mục này chứa các file test cho frontend project.

## Cấu trúc

```
tests/
├── components/       # Test files cho các components và modals
│   ├── LoginModal.test.jsx
│   ├── CollectionModal.test.jsx
│   ├── WriteReviewModal.test.jsx
│   └── ...
└── setup.js         # File cấu hình chung cho tests
```

## Cài đặt dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## Chạy tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm test -- --watch

# Chạy tests với coverage
npm test -- --coverage
```

## Cấu hình Vitest

Thêm vào `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "vitest": {
    "environment": "jsdom",
    "setupFiles": ["./tests/setup.js"],
    "globals": true
  }
}
```

Hoặc tạo file `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
  },
});
```

