import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicineSchedule {
  name: string;
  dosage: string;
  frequency: string; // 'daily', 'twice-daily', 'weekly'
  timings: string[]; // ['09:00', '21:00']
  withFood: boolean;
  startDate: Date;
  endDate?: Date;
  reminderEnabled: boolean;
}

export interface IDoctorAppointment {
  doctorName: string;
  specialization: string;
  appointmentDate: Date;
  location: string;
  phone?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface IHealthCheck {
  type: 'sugar' | 'bp' | 'weight' | 'other';
  value: string;
  date: Date;
  notes?: string;
}

export interface IMedicalRecord extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Active Medicines
  medicines: IMedicineSchedule[];
  
  // Doctor Appointments
  appointments: IDoctorAppointment[];
  
  // Health Checkups
  healthChecks: IHealthCheck[];
  
  // Diet Reminders
  dietReminders?: Array<{
    name: string;
    time: string;
    description: string;
    enabled: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    
    medicines: [{
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      timings: [{ type: String }],
      withFood: { type: Boolean, default: false },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      reminderEnabled: { type: Boolean, default: true },
    }],
    
    appointments: [{
      doctorName: { type: String, required: true },
      specialization: { type: String },
      appointmentDate: { type: Date, required: true },
      location: { type: String },
      phone: { type: String },
      notes: { type: String },
      status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled' 
      },
    }],
    
    healthChecks: [{
      type: { 
        type: String, 
        enum: ['sugar', 'bp', 'weight', 'other'],
        required: true 
      },
      value: { type: String, required: true },
      date: { type: Date, default: Date.now },
      notes: { type: String },
    }],
    
    dietReminders: [{
      name: { type: String },
      time: { type: String },
      description: { type: String },
      enabled: { type: Boolean, default: true },
    }],
  },
  { timestamps: true }
);

// Indexes
MedicalRecordSchema.index({ userId: 1 });
MedicalRecordSchema.index({ 'appointments.appointmentDate': 1 });
MedicalRecordSchema.index({ 'medicines.timings': 1 });

export default mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

