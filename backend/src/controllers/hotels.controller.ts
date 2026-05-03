import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { logger } from '../config/logger';

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// List hotels (public)
export const listHotels = async (req: Request, res: Response) => {
  try {
    const { district, place_id, min_price, max_price, stars, property_type, search, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('hotels')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('avg_rating', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (district) query = query.eq('district', district);
    if (place_id) query = query.eq('place_id', place_id);
    if (min_price) query = query.gte('price_per_night', min_price);
    if (max_price) query = query.lte('price_per_night', max_price);
    if (stars) query = query.eq('star_rating', stars);
    if (property_type) query = query.eq('property_type', property_type);
    if (search) query = query.or(`name.ilike.%${search}%,district.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    return res.json({
      success: true,
      data,
      meta: { page: pageNum, limit: limitNum, total: count || 0, total_pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch hotels' });
  }
};

// Get hotel by slug with rooms (public)
export const getHotelBySlug = async (req: Request, res: Response) => {
  try {
    const { data: hotel, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('is_published', true)
      .single();

    if (error || !hotel) return res.status(404).json({ success: false, error: 'Hotel not found' });

    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('is_available', true)
      .order('price_per_night', { ascending: true });

    return res.json({ success: true, data: { ...hotel, rooms: rooms || [] } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch hotel' });
  }
};

// Admin: List all hotels (including unpublished)
export const adminListHotels = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch hotels' });
  }
};

// Admin: Create hotel
export const createHotel = async (req: Request, res: Response) => {
  try {
    const hotelData = { ...req.body, slug: req.body.slug || slugify(req.body.name) };
    const { data, error } = await supabase.from('hotels').insert(hotelData).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create hotel' });
  }
};

// Admin: Update hotel
export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update hotel' });
  }
};

// Admin: Delete hotel
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('hotels').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete hotel' });
  }
};

// Admin: Add room to hotel
export const addRoom = async (req: Request, res: Response) => {
  try {
    const roomData = { ...req.body, hotel_id: req.params.id };
    const { data, error } = await supabase.from('rooms').insert(roomData).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to add room' });
  }
};

// Admin: Update room
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(req.body)
      .eq('id', req.params.roomId)
      .eq('hotel_id', req.params.hotelId)
      .select()
      .single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update room' });
  }
};

// Admin: Delete room
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('rooms').delete().eq('id', req.params.roomId).eq('hotel_id', req.params.hotelId);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete room' });
  }
};
