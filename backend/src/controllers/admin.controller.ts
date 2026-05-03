import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';
import { env } from '../config/env';
import { logger } from '../config/logger';

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ═══ Audit Log Helper ═══
export const auditLog = async (ctx: {
  adminId?: string; adminName?: string; action: string;
  entityType?: string; entityId?: string; entityName?: string;
  oldData?: any; newData?: any; req?: Request;
}) => {
  try {
    await supabase.from('audit_logs').insert({
      actor_id: ctx.adminId, actor_name: ctx.adminName, actor_role: 'admin',
      action: ctx.action, entity_type: ctx.entityType, entity_id: ctx.entityId,
      entity_name: ctx.entityName, old_data: ctx.oldData || null, new_data: ctx.newData || null,
      ip_address: ctx.req?.ip, user_agent: ctx.req?.headers['user-agent'],
    });
  } catch (e) { logger.error('Audit log failed:', e); }
};

// ═══ Admin Login ═══
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    logger.info(`Admin login attempt for: ${username}`);

    let admin: any = null;
    const res1 = await supabase.from('admins').select('*').eq('username', username).eq('is_active', true).single();
    if (res1.data) { admin = res1.data; }
    else {
      const res2 = await supabase.from('admins').select('*').eq('email', username).eq('is_active', true).single();
      admin = res2.data;
    }

    if (!admin) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    // @ts-ignore
    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email, role: admin.role },
      env.ADMIN_JWT_SECRET, { expiresIn: env.ADMIN_JWT_EXPIRES_IN }
    );

    await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', admin.id);

    return res.json({
      success: true,
      data: { admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role }, token },
    });
  } catch (error: any) {
    logger.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// ═══ Admin Profile ═══
export const getAdminMe = async (req: Request, res: Response) => {
  return res.json({ success: true, data: req.admin });
};

// ═══ Enhanced Dashboard Stats ═══
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [places, hotels, users, pendingReviews, flaggedReviews, allFeedback] = await Promise.all([
      supabase.from('places').select('id, latitude, longitude, images, how_to_reach', { count: 'exact' }),
      supabase.from('hotels').select('id, latitude, longitude, images', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('is_approved', false).is('deleted_at', null),
      supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('is_flagged', true).is('deleted_at', null),
      supabase.from('feedback').select('id', { count: 'exact', head: true }),
    ]);

    // Content health calculations
    const placesData = places.data || [];
    const hotelsData = hotels.data || [];
    const totalPlaces = placesData.length;
    const totalHotels = hotelsData.length;

    const coordsComplete = placesData.filter((p: any) => p.latitude && p.longitude).length;
    const howToReachComplete = placesData.filter((p: any) => p.how_to_reach && Object.keys(p.how_to_reach).length > 0).length;
    const galleryComplete = placesData.filter((p: any) => p.images && p.images.length > 0).length;
    const hotelCoordsComplete = hotelsData.filter((h: any) => h.latitude && h.longitude).length;
    const hotelGalleryComplete = hotelsData.filter((h: any) => h.images && h.images.length > 0).length;

    return res.json({
      success: true,
      data: {
        total_places: totalPlaces,
        total_hotels: totalHotels,
        total_users: users.count || 0,
        total_feedback: allFeedback.count || 0,
        pending_reviews: pendingReviews.count || 0,
        flagged_reviews: flaggedReviews.count || 0,
        content_health: {
          coords_complete_pct: totalPlaces > 0 ? Math.round((coordsComplete / totalPlaces) * 100) : 0,
          how_to_reach_pct: totalPlaces > 0 ? Math.round((howToReachComplete / totalPlaces) * 100) : 0,
          gallery_complete_pct: totalPlaces > 0 ? Math.round((galleryComplete / totalPlaces) * 100) : 0,
          hotel_coords_pct: totalHotels > 0 ? Math.round((hotelCoordsComplete / totalHotels) * 100) : 0,
          hotel_gallery_pct: totalHotels > 0 ? Math.round((hotelGalleryComplete / totalHotels) * 100) : 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// ═══ Content Health Detail ═══
export const getContentHealth = async (req: Request, res: Response) => {
  try {
    const { data: placesData } = await supabase.from('places').select('id, name, district, thumbnail, images, latitude, longitude, how_to_reach, description').order('name');
    const { data: hotelsData } = await supabase.from('hotels').select('id, name, district, thumbnail, images, latitude, longitude, description').order('name');

    const placeItems = (placesData || []).map((p: any) => {
      const missing: string[] = [];
      if (!p.latitude || !p.longitude) missing.push('coordinates');
      if (!p.images || p.images.length === 0) missing.push('gallery');
      if (!p.how_to_reach || Object.keys(p.how_to_reach).length === 0) missing.push('how_to_reach');
      if (!p.thumbnail) missing.push('cover_image');
      if (!p.description) missing.push('description');
      return { id: p.id, name: p.name, district: p.district, missing_fields: missing };
    });

    const hotelItems = (hotelsData || []).map((h: any) => {
      const missing: string[] = [];
      if (!h.latitude || !h.longitude) missing.push('coordinates');
      if (!h.images || h.images.length === 0) missing.push('gallery');
      if (!h.thumbnail) missing.push('cover_image');
      if (!h.description) missing.push('description');
      return { id: h.id, name: h.name, district: h.district, missing_fields: missing };
    });

    const placesComplete = placeItems.filter((p: any) => p.missing_fields.length === 0).length;
    const hotelsComplete = hotelItems.filter((h: any) => h.missing_fields.length === 0).length;

    return res.json({
      success: true,
      data: {
        places: placeItems, hotels: hotelItems,
        summary: {
          places_complete_pct: placeItems.length > 0 ? Math.round((placesComplete / placeItems.length) * 100) : 0,
          hotels_complete_pct: hotelItems.length > 0 ? Math.round((hotelsComplete / hotelItems.length) * 100) : 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch content health' });
  }
};

// ═══ Review Moderation ═══
export const adminListReviews = async (req: Request, res: Response) => {
  try {
    const { status, target_type, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('feedback').select('*, users(full_name, email, avatar_url)', { count: 'exact' })
      .is('deleted_at', null).order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

    if (status === 'pending') query = query.eq('is_approved', false).eq('is_flagged', false).is('rejection_reason', null);
    else if (status === 'flagged') query = query.eq('is_flagged', true);
    else if (status === 'approved') query = query.eq('is_approved', true);
    else if (status === 'rejected') query = query.not('rejection_reason', 'is', null);
    if (target_type) query = query.eq('target_type', target_type);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data, meta: { page: pageNum, limit: limitNum, total: count || 0, total_pages: Math.ceil((count || 0) / limitNum) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const { data: old } = await supabase.from('feedback').select('*').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('feedback').update({
      is_approved: true, rejection_reason: null, rejection_note: null,
      reviewed_by: req.admin?.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    await auditLog({ adminId: req.admin?.id, adminName: req.admin?.username, action: 'review.approve', entityType: 'feedback', entityId: req.params.id, oldData: old, newData: data, req });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to approve review' });
  }
};

export const rejectReview = async (req: Request, res: Response) => {
  try {
    const { rejection_reason, rejection_note } = req.body;
    const { data: old } = await supabase.from('feedback').select('*').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('feedback').update({
      is_approved: false, rejection_reason, rejection_note: rejection_note || null,
      reviewed_by: req.admin?.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    await auditLog({ adminId: req.admin?.id, adminName: req.admin?.username, action: 'review.reject', entityType: 'feedback', entityId: req.params.id, entityName: rejection_reason, oldData: old, newData: data, req });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to reject review' });
  }
};

export const adminDeleteReview = async (req: Request, res: Response) => {
  try {
    const { data: old } = await supabase.from('feedback').select('*').eq('id', req.params.id).single();
    const { error } = await supabase.from('feedback').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    await auditLog({ adminId: req.admin?.id, adminName: req.admin?.username, action: 'review.delete', entityType: 'feedback', entityId: req.params.id, entityName: old?.title, oldData: old, req });
    return res.json({ success: true, message: 'Review deleted permanently' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
};

export const toggleFlagReview = async (req: Request, res: Response) => {
  try {
    const { data: existing } = await supabase.from('feedback').select('is_flagged').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, error: 'Review not found' });
    const { data, error } = await supabase.from('feedback').update({ is_flagged: !existing.is_flagged, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to toggle flag' });
  }
};

// ═══ Announcements ═══
export const getActiveAnnouncements = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('announcements').select('*').eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
  }
};

export const adminListAnnouncements = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('announcements').insert({ ...req.body, created_by: req.admin?.id }).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create announcement' });
  }
};

export const toggleAnnouncement = async (req: Request, res: Response) => {
  try {
    const { data: existing } = await supabase.from('announcements').select('is_active').eq('id', req.params.id).single();
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    const { data, error } = await supabase.from('announcements').update({ is_active: !existing.is_active }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to toggle announcement' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete announcement' });
  }
};

// ═══ Audit Log ═══
export const getAuditLog = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', action, entity_type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);
    if (action) query = query.eq('action', action);
    if (entity_type) query = query.eq('entity_type', entity_type);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data, meta: { page: pageNum, limit: limitNum, total: count || 0, total_pages: Math.ceil((count || 0) / limitNum) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
  }
};

// ═══ User Management ═══
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const { data, error } = await supabase.from('users').update({ is_suspended: true, suspension_reason: reason || null, suspended_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    await auditLog({ adminId: req.admin?.id, adminName: req.admin?.username, action: 'user.suspend', entityType: 'user', entityId: req.params.id, entityName: data.full_name, newData: { reason }, req });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to suspend user' });
  }
};

export const reactivateUser = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').update({ is_suspended: false, suspension_reason: null, suspended_at: null }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    await auditLog({ adminId: req.admin?.id, adminName: req.admin?.username, action: 'user.reactivate', entityType: 'user', entityId: req.params.id, entityName: data.full_name, req });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to reactivate user' });
  }
};

// ═══ Contact Messages ═══
export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

export const resolveContactMessage = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('contact_messages').update({ is_resolved: true, resolved_by: req.admin!.id }).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to resolve message' });
  }
};

// ═══ Seed Admin (dev only) ═══
export const seedAdmin = async (req: Request, res: Response) => {
  if (env.NODE_ENV === 'production') return res.status(403).json({ success: false, error: 'Not available in production' });
  try {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const { data, error } = await supabase.from('admins').upsert({
      username: 'superadmin', email: 'admin@jharexplore.in', password_hash: passwordHash,
      role: 'super_admin', is_active: true,
    }, { onConflict: 'username' }).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data: { ...data, password_hash: undefined }, message: 'Admin seeded. Password: admin123' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to seed admin' });
  }
};
