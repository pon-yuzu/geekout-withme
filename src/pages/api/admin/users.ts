import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../lib/admin';

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const url = new URL(request.url);
  const rawQ = url.searchParams.get('q')?.trim() || '';
  // Sanitize search query: allow alphanumeric, spaces, Japanese chars, @, .
  const q = rawQ.replace(/[^\w\s\u3000-\u9FFF\uF900-\uFAFF@.\-]/g, '').slice(0, 100);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('profiles')
    .select('id, display_name, avatar_url, tier, tier_expires_at, created_at', { count: 'exact' });

  if (q) {
    query = query.or(`display_name.ilike.%${q}%`);
  }

  const { data: profiles, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    console.error('Admin users error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  const userIds = (profiles || []).map((p: any) => p.id);
  let emailMap: Record<string, string> = {};
  let subMap: Record<string, string> = {};
  let lineSupportMap: Record<string, boolean> = {};

  if (userIds.length > 0) {
    const { data: authUsers } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authUsers?.users) {
      for (const au of authUsers.users) {
        if (userIds.includes(au.id)) {
          emailMap[au.id] = au.email || '';
        }
      }
    }

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('user_id, status, price_id')
      .in('user_id', userIds)
      .in('status', ['active', 'trialing']);

    if (subs) {
      const runtime = (locals as any).runtime;
      const linePriceId = runtime?.env?.STRIPE_LINE_SUPPORT_PRICE_ID || import.meta.env.STRIPE_LINE_SUPPORT_PRICE_ID;
      for (const s of subs) {
        subMap[s.user_id] = s.status;
        if (linePriceId && s.price_id === linePriceId) {
          lineSupportMap[s.user_id] = true;
        }
      }
    }
  }

  const users = (profiles || []).map((p: any) => {
    let effectiveTier = p.tier || 'free';
    if (effectiveTier === 'free' && subMap[p.id]) {
      effectiveTier = 'premium';
    }
    return {
      id: p.id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      email: emailMap[p.id] || '',
      tier: p.tier || 'free',
      tier_expires_at: p.tier_expires_at || null,
      effectiveTier,
      hasLineSupport: lineSupportMap[p.id] || (p.tier === 'personal'),
      created_at: p.created_at,
    };
  });

  if (q) {
    const emailMatches = Object.entries(emailMap)
      .filter(([_, email]) => email.toLowerCase().includes(q.toLowerCase()))
      .map(([id]) => id);

    const existingIds = new Set(users.map((u: any) => u.id));
    for (const id of emailMatches) {
      if (!existingIds.has(id)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, tier, tier_expires_at, created_at')
          .eq('id', id)
          .single();
        if (profile) {
          let effectiveTier = profile.tier || 'free';
          if (effectiveTier === 'free' && subMap[id]) {
            effectiveTier = 'premium';
          }
          users.push({
            id: profile.id,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            email: emailMap[id] || '',
            tier: profile.tier || 'free',
            tier_expires_at: profile.tier_expires_at || null,
            effectiveTier,
            hasLineSupport: lineSupportMap[id] || (profile.tier === 'personal'),
            created_at: profile.created_at,
          });
        }
      }
    }
  }

  return new Response(JSON.stringify({
    users,
    total: count ?? 0,
    page,
    perPage,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { userId, tier, tier_expires_at } = await request.json();

  if (!userId || !['free', 'premium', 'personal'].includes(tier)) {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
  }

  const update: any = { tier };
  // Set or clear expiration
  if (tier === 'personal' && tier_expires_at) {
    update.tier_expires_at = new Date(tier_expires_at).toISOString();
  } else {
    update.tier_expires_at = null;
  }

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId);

  if (error) {
    console.error('Admin users error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
