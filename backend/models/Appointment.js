import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  petOwnerName: {
    type: String,
    required: true
  },
  petName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  context: {
    userId: String,
    userName: String,
    source: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Appointment', appointmentSchema);

