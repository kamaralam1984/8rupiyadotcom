/**
 * Central models registry
 * Import all models here to ensure they are registered with Mongoose
 * This prevents "Schema hasn't been registered" errors during populate operations
 */

import User from './User';
import Shop from './Shop';
import Payment from './Payment';
import Plan from './Plan';
import Commission from './Commission';
import AgentRequest from './AgentRequest';
import Advertisement from './Advertisement';
import AdSettings from './AdSettings';
import CustomPage from './CustomPage';
import HomepageLayout from './HomepageLayout';
import HeroSettings from './HeroSettings';
import OTP from './OTP';
import Category from './Category';
import HomepageBlock from './HomepageBlock';
import Review from './Review';
import Withdrawal from './Withdrawal';

// Export all models for easy importing
export {
  User,
  Shop,
  Payment,
  Plan,
  Commission,
  AgentRequest,
  Advertisement,
  AdSettings,
  CustomPage,
  HomepageLayout,
  HeroSettings,
  OTP,
  Category,
  HomepageBlock,
  Review,
  Withdrawal,
};

/**
 * Function to ensure all models are loaded
 * Call this after connecting to database to register all schemas
 */
export function registerAllModels() {
  // Access modelName to ensure models are registered
  User.modelName;
  Shop.modelName;
  Payment.modelName;
  Plan.modelName;
  Commission.modelName;
  AgentRequest.modelName;
  Advertisement.modelName;
  AdSettings.modelName;
  CustomPage.modelName;
  HomepageLayout.modelName;
  HeroSettings.modelName;
  OTP.modelName;
  Category.modelName;
  HomepageBlock.modelName;
  Review.modelName;
  Withdrawal.modelName;
  
  return {
    User,
    Shop,
    Payment,
    Plan,
    Commission,
    AgentRequest,
    Advertisement,
    AdSettings,
    CustomPage,
    HomepageLayout,
    HeroSettings,
    OTP,
    Category,
    HomepageBlock,
    Review,
    Withdrawal,
  };
}

export default {
  User,
  Shop,
  Payment,
  Plan,
  Commission,
  AgentRequest,
  Advertisement,
  AdSettings,
  CustomPage,
  HomepageLayout,
  HeroSettings,
  OTP,
  Category,
  HomepageBlock,
  Review,
  Withdrawal,
  registerAllModels,
};

