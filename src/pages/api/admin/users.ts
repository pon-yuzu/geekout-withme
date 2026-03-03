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
  const q = url.searchParams.get('q')?.trim() || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('profiles')
    .select('id, display_name, avatar_url, tier, created_at', { count: 'exact' });

  if (q) {
    query = query.or(`display_name.ilike.%${q}%`);
  }

  const { data: profiles, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const userIds = (profiles || []).map((p: any) => p.id);
  let emailMap: Record<string, string> = {};
  let subMap: Record<string, string> = {};

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
      .select('user_id, status')
      .in('user_id', userIds)
      .in('status', ['active', 'trialing']);

    if (subs) {
      for (const s of subs) {
        subMap[s.user_id] = s.status;
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
      effectiveTier,
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
          .select('id, display_name, avatar_url, tier, created_at')
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
            effectiveTier,
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

  const { userId, tier } = await request.json();

  if (!userId || !['free', 'premium', 'personal'].includes(tier)) {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
  }

  const { error } = await supabase
    .from('profiles')
    .update({ tier })
    .eq('id', userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
