import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

const generateBookingRef = () => {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `JHR-${year}-${num}`;
};

// Create booking (user)
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { hotel_id, room_id, check_in, check_out, guests_count, guest_name, guest_email, guest_phone, special_requests } = req.body;

    // Check room availability
    const { data: room } = await supabase.from('rooms').select('*').eq('id', room_id).single();
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });

    // Check for conflicting bookings
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room_id)
      .in('status', ['pending', 'confirmed'])
      .lt('check_in', check_out)
      .gt('check_out', check_in);

    const bookedCount = conflicts?.length || 0;
    if (bookedCount >= room.total_rooms) {
      return res.status(409).json({ success: false, error: 'No rooms available for selected dates' });
    }

    // Calculate total
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = totalNights * room.price_per_night;

    const booking = {
      booking_ref: generateBookingRef(),
      user_id: req.user!.id,
      hotel_id,
      room_id,
      check_in,
      check_out,
      guests_count,
      price_per_night: room.price_per_night,
      total_amount: totalAmount,
      guest_name,
      guest_email,
      guest_phone,
      special_requests,
      status: 'pending',
      payment_status: 'unpaid',
    };

    const { data, error } = await supabase.from('bookings').insert(booking).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    logger.error('Create booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
};

// Get user's bookings
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, hotels(name, thumbnail, district)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

// Get single booking
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, hotels(name, thumbnail, district, address), rooms(name, room_type)')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: 'Booking not found' });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
};

// Cancel booking (user)
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: 'Cannot cancel this booking' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: req.body.cancellation_reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data, message: 'Booking cancelled' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
};

// Admin: List all bookings
export const adminListBookings = async (req: Request, res: Response) => {
  try {
    const { status, hotel_id } = req.query;
    let query = supabase
      .from('bookings')
      .select('*, hotels(name, district), users(full_name, email)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (hotel_id) query = query.eq('hotel_id', hotel_id);

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

// Admin: Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const updateData: any = { status: req.body.status, updated_at: new Date().toISOString() };
    if (req.body.payment_status) updateData.payment_status = req.body.payment_status;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
};
