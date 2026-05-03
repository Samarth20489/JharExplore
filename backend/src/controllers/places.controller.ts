import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { logger } from '../config/logger';

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// List all published places (public)
export const listPlaces = async (req: Request, res: Response) => {
  try {
    const { category, district, search, featured, page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('places')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (category) query = query.eq('category', category);
    if (district) query = query.eq('district', district);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    return res.json({
      success: true,
      data,
      meta: { page: pageNum, limit: limitNum, total: count || 0, total_pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (error: any) {
    logger.error('listPlaces error:', error?.message || error);
    return res.status(500).json({ success: false, error: 'Failed to fetch places' });
  }
};

// Get single place by slug (public)
export const getPlaceBySlug = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: 'Place not found' });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch place' });
  }
};

// Get nearby places (within 50km radius)
export const getNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { data: place } = await supabase.from('places').select('latitude, longitude').eq('id', req.params.id).single();
    if (!place || !place.latitude || !place.longitude) {
      return res.status(404).json({ success: false, error: 'Place not found or no coordinates' });
    }

    // Simple distance filter (approximate)
    const latDiff = 0.45; // ~50km
    const lngDiff = 0.45;
    const { data, error } = await supabase
      .from('places')
      .select('id, name, slug, category, district, thumbnail, short_description, avg_rating')
      .eq('is_published', true)
      .neq('id', req.params.id)
      .gte('latitude', place.latitude - latDiff)
      .lte('latitude', place.latitude + latDiff)
      .gte('longitude', place.longitude - lngDiff)
      .lte('longitude', place.longitude + lngDiff)
      .limit(6);

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch nearby places' });
  }
};

// Admin: Create place
export const createPlace = async (req: Request, res: Response) => {
  try {
    const placeData = { ...req.body, slug: req.body.slug || slugify(req.body.name) };
    const { data, error } = await supabase.from('places').insert(placeData).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create place' });
  }
};

// Admin: Update place
export const updatePlace = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update place' });
  }
};

// Admin: Delete place
export const deletePlace = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('places').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Place deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete place' });
  }
};

// Admin: List all places (including unpublished)
export const adminListPlaces = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('places').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch places' });
  }
};
