import Appointment from '../models/Appointment.js';
import Conversation from '../models/Conversation.js';

export async function createAppointment(sessionId, appointmentData) {
  try {
    // Get conversation context
    const conversation = await Conversation.findOne({ sessionId });
    const context = conversation?.context || {};

    const appointment = new Appointment({
      sessionId,
      ...appointmentData,
      context: {
        userId: context.userId,
        userName: context.userName,
        source: context.source
      }
    });

    await appointment.save();
    return appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function getAppointmentBySessionId(sessionId) {
  return await Appointment.findOne({ sessionId }).sort({ createdAt: -1 });
}

export function validateAppointmentData(data) {
  const errors = [];

  if (!data.petOwnerName || data.petOwnerName.trim().length < 2) {
    errors.push('Pet owner name must be at least 2 characters');
  }

  if (!data.petName || data.petName.trim().length < 1) {
    errors.push('Pet name is required');
  }

  if (!data.phoneNumber || !/^[\d\s\-\+\(\)]+$/.test(data.phoneNumber)) {
    errors.push('Valid phone number is required');
  }

  if (!data.preferredDate) {
    errors.push('Preferred date is required');
  } else {
    const date = new Date(data.preferredDate);
    if (isNaN(date.getTime()) || date < new Date()) {
      errors.push('Preferred date must be a valid future date');
    }
  }

  if (!data.preferredTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.preferredTime)) {
    errors.push('Preferred time must be in HH:MM format (24-hour)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

