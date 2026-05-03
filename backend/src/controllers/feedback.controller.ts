import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Submit feedback (user)
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackData = { ...req.body, user_id: req.user!.id };
    const { data, error } = await supabase.from('feedback').insert(feedbackData).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, error: 'You already reviewed this item' });
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(201).json({ success: true, data, message: 'Feedback submitted for review' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
};

// Get user's own feedback/reviews
export const getMyFeedback = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch your reviews' });
  }
};

// Get approved feedback (public)
export const getApprovedFeedback = async (req: Request, res: Response) => {
  try {
    const { target_type, target_id, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('feedback')
      .select('*, users(full_name, avatar_url)', { count: 'exact' })
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (target_type) query = query.eq('target_type', target_type);
    if (target_id) query = query.eq('target_id', target_id);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });

    return res.json({
      success: true,
      data,
      meta: { page: pageNum, limit: limitNum, total: count || 0, total_pages: Math.ceil((count || 0) / limitNum) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
};

// Delete own feedback (user)
export const deleteOwnFeedback = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('feedback').delete().eq('id', req.params.id).eq('user_id', req.user!.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete feedback' });
  }
};

// Edit own feedback (user) — re-moderation required
export const editOwnFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Fetch existing review to verify ownership and check edit limit
    const { data: existing, error: fetchErr } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'Review not found or not yours' });
    }

    if ((existing.edit_count || 0) >= 3) {
      return res.status(400).json({ success: false, error: 'Maximum edit limit (3) reached. Contact support for further changes.' });
    }

    const { rating, title, comment } = req.body;
    const { data, error } = await supabase
      .from('feedback')
      .update({
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
        is_approved: false,  // re-moderation required
        is_edited: true,
        edit_count: (existing.edit_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data, message: 'Review updated — pending re-moderation' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update review' });
  }
};

// Admin: Get all feedback
export const adminListFeedback = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
};

// Admin: Approve feedback
export const approveFeedback = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to approve feedback' });
  }
};

// Admin: Delete feedback
export const adminDeleteFeedback = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('feedback').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete feedback' });
  }
};

// Submit contact message (public)
export const submitContact = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('contact_messages').insert(req.body).select().single();
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(201).json({ success: true, data, message: 'Message sent successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
