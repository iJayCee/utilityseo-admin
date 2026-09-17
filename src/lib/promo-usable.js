// A code worth offering: switched on, not past its date, not used up. The
// list used to show every active code, including one that expired in May.
export const usable = (c) => !!c?.is_active
  && !(c.expires_at && new Date(c.expires_at) < new Date())
  && !(c.max_uses != null && Number(c.uses_count ?? 0) >= Number(c.max_uses));
