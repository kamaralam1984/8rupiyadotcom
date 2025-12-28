# Models Directory

This directory contains all Mongoose models for the application.

## 🚨 IMPORTANT: Model Registration

All models are automatically registered when the database connection is established. This prevents "Schema hasn't been registered for model X" errors.

### How It Works

1. **All models are imported in `index.ts`**
   - This file serves as the central registry for all models
   
2. **Models are auto-registered on DB connection**
   - When `connectDB()` is called, it automatically calls `registerAllModels()`
   - This ensures all models are available for populate operations

3. **No manual registration needed in API routes**
   - Just import and use models normally
   - populate() will work automatically

## 📝 Adding New Models

When creating a new model:

1. Create your model file in `src/models/YourModel.ts`
2. **Add it to `src/models/index.ts`**:
   ```typescript
   import YourModel from './YourModel';
   
   export { YourModel };
   
   // In registerAllModels():
   YourModel.modelName;
   ```
3. That's it! The model will be auto-registered.

## 📦 Current Models

- **User** - User accounts (admin, agent, operator, etc.)
- **Shop** - Shop listings
- **Payment** - Payment transactions
- **Plan** - Subscription plans
- **Commission** - Agent/Operator commissions
- **AgentRequest** - Agent registration requests
- **Advertisement** - Paid advertisements
- **AdSettings** - AdSense configuration
- **CustomPage** - Dynamic pages
- **HomepageLayout** - Homepage builder
- **HeroSettings** - Hero section config
- **OTP** - One-time passwords
- **Category** - Shop categories
- **HomepageBlock** - Homepage components
- **Review** - Shop reviews
- **Withdrawal** - Withdrawal requests

## 🔧 Troubleshooting

### "Schema hasn't been registered" Error

If you see this error:
1. Make sure the model is imported in `src/models/index.ts`
2. Make sure it's included in the `registerAllModels()` function
3. Restart the development server

### Model Changes Not Reflecting

1. Clear Next.js cache: `rm -rf .next`
2. Restart development server: `npm run dev`
3. Check MongoDB connection in `.env.local`

## 🔗 Related Files

- `src/lib/mongodb.ts` - Database connection that calls registerAllModels()
- `src/models/index.ts` - Central model registry

