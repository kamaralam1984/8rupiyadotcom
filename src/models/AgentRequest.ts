import mongoose, { Schema, Document } from 'mongoose';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IAgentRequest extends Document {
  operatorId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  status: RequestStatus;
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId; // Admin who reviewed
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentRequestSchema = new Schema<IAgentRequest>(
  {
    operatorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    agentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(RequestStatus), 
      default: RequestStatus.PENDING 
    },
    requestedAt: { 
      type: Date, 
      default: Date.now 
    },
    reviewedAt: { 
      type: Date 
    },
    reviewedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rejectionReason: { 
      type: String 
    },
  },
  { timestamps: true }
);

// Index for efficient queries
AgentRequestSchema.index({ operatorId: 1, agentId: 1 });
AgentRequestSchema.index({ status: 1 });
AgentRequestSchema.index({ operatorId: 1, status: 1 });

export default mongoose.models.AgentRequest || mongoose.model<IAgentRequest>('AgentRequest', AgentRequestSchema);

