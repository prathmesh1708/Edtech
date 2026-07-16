import mongoose from 'mongoose';
import User from './models/User.js';
import Subject from './models/Subject.js';
import Chapter from './models/Chapter.js';
import StudyMaterial from './models/StudyMaterial.js';
import Note from './models/Note.js';
import AITutorChat from './models/AITutorChat.js';
import Todo from './models/Todo.js';
import ActivityLog from './models/ActivityLog.js';
import Subscription from './models/Subscription.js';
import Banner from './models/Banner.js';
import Notification from './models/Notification.js';

console.log('--- Compiling schemas offline ---');
try {
  console.log('✓ User model registered:', mongoose.modelNames().includes('User'));
  console.log('✓ Subject model registered:', mongoose.modelNames().includes('Subject'));
  console.log('✓ Chapter model registered:', mongoose.modelNames().includes('Chapter'));
  console.log('✓ StudyMaterial model registered:', mongoose.modelNames().includes('StudyMaterial'));
  console.log('✓ Note model registered:', mongoose.modelNames().includes('Note'));
  console.log('✓ AITutorChat model registered:', mongoose.modelNames().includes('AITutorChat'));
  console.log('✓ Todo model registered:', mongoose.modelNames().includes('Todo'));
  console.log('✓ ActivityLog model registered:', mongoose.modelNames().includes('ActivityLog'));
  console.log('✓ Subscription model registered:', mongoose.modelNames().includes('Subscription'));
  console.log('✓ Banner model registered:', mongoose.modelNames().includes('Banner'));
  console.log('✓ Notification model registered:', mongoose.modelNames().includes('Notification'));
  console.log('\nSUCCESS: All schemas registered and compiled without errors!');
} catch (error) {
  console.error('ERROR during compilation:', error);
  process.exit(1);
}
