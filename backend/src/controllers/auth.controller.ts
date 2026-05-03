import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase';
import { env } from '../config/env';
import { logger } from '../config/logger';

// User Registration
export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone } = req.body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Create profile in users table
    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        full_name,
        phone: phone || null,
      });
    }

    return res.status(201).json({
      success: true,
      data: { user: { id: data.user.id, email: data.user.email, full_name } },
      message: 'Registration successful',
    });
  } catch (error: any) {
    logger.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    return res.json({
      success: true,
      data: {
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
        expires_at: data.session!.expires_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
};

// Get Current User Profile
export const getMe = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data, message: 'Profile updated' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to send reset email' });
  }
};

// Logout
export const logout = async (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
};
