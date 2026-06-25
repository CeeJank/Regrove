const pool = require("../config/db");

const mapEventRow = (row) => ({
  id: row.id,
  title: row.title,
  date: row.date,
  startTime: row.startTime,
  endTime: row.endTime,
  organizerId: row.organizerId,
  workerIds: row.workerIds ?? [],
  childIds: row.childIds ?? [],
  status: row.status,
  inviteStatuses: row.inviteStatuses ?? {},
});

module.exports = {
  getCalendarEventsForWorker: async (workerId) => {
    const query = `
      SELECT
        e.id::text AS "id",
        e.title AS "title",
        TO_CHAR(e.event_date, 'YYYY-MM-DD') AS "date",
        TO_CHAR(e.start_time, 'HH24:MI') AS "startTime",
        TO_CHAR(e.end_time, 'HH24:MI') AS "endTime",
        organizer_user.id::text AS "organizerId",
        ARRAY[organizer_user.id::text] AS "workerIds",
        COALESCE(
          ARRAY_AGG(DISTINCT invited_user.id::text)
          FILTER (WHERE invited_user.id IS NOT NULL),
          ARRAY[]::text[]
        ) AS "childIds",
        CASE
          WHEN COUNT(eyi.id) > 0 AND BOOL_OR(eyi.status = 'DECLINED') THEN 'declined'
          WHEN COUNT(eyi.id) > 0 AND BOOL_AND(eyi.status = 'CONFIRMED') THEN 'confirmed'
          ELSE 'pending'
        END AS "status",
        COALESCE(
          jsonb_object_agg(invited_user.id::text, lower(eyi.status))
          FILTER (WHERE invited_user.id IS NOT NULL),
          '{}'::jsonb
        ) AS "inviteStatuses"
      FROM public.events e
      JOIN public.worker_profiles organizer_profile ON organizer_profile.id = e.organizer_id
      JOIN public.users organizer_user ON organizer_user.id = organizer_profile.user_id
      LEFT JOIN public.event_youth_invites eyi ON eyi.event_id = e.id
      LEFT JOIN public.youth_profiles invited_profile ON invited_profile.id = eyi.youth_id
      LEFT JOIN public.users invited_user ON invited_user.id = invited_profile.user_id
      WHERE e.organizer_id = $1
      GROUP BY e.id, organizer_user.id
      ORDER BY e.event_date ASC, e.start_time ASC, e.id ASC;
    `;
    const { rows } = await pool.query(query, [workerId]);
    return rows.map(mapEventRow);
  },

  getCalendarEventsForChild: async (childId) => {
    const query = `
      SELECT
        e.id::text AS "id",
        e.title AS "title",
        TO_CHAR(e.event_date, 'YYYY-MM-DD') AS "date",
        TO_CHAR(e.start_time, 'HH24:MI') AS "startTime",
        TO_CHAR(e.end_time, 'HH24:MI') AS "endTime",
        organizer_user.id::text AS "organizerId",
        ARRAY[organizer_user.id::text] AS "workerIds",
        COALESCE(
          ARRAY_AGG(DISTINCT invited_user.id::text)
          FILTER (WHERE invited_user.id IS NOT NULL),
          ARRAY[]::text[]
        ) AS "childIds",
        CASE
          WHEN COUNT(eyi.id) > 0 AND BOOL_OR(eyi.status = 'DECLINED') THEN 'declined'
          WHEN COUNT(eyi.id) > 0 AND BOOL_AND(eyi.status = 'CONFIRMED') THEN 'confirmed'
          ELSE 'pending'
        END AS "status",
        COALESCE(
          jsonb_object_agg(invited_user.id::text, lower(eyi.status))
          FILTER (WHERE invited_user.id IS NOT NULL),
          '{}'::jsonb
        ) AS "inviteStatuses"
      FROM public.events e
      JOIN public.worker_profiles organizer_profile ON organizer_profile.id = e.organizer_id
      JOIN public.users organizer_user ON organizer_user.id = organizer_profile.user_id
      JOIN public.event_youth_invites eyi ON eyi.event_id = e.id
      JOIN public.youth_profiles invited_profile ON invited_profile.id = eyi.youth_id
      JOIN public.users invited_user ON invited_user.id = invited_profile.user_id
      WHERE e.id IN (
        SELECT event_id
        FROM public.event_youth_invites
        WHERE youth_id = $1
      )
      GROUP BY e.id, organizer_user.id
      ORDER BY e.event_date ASC, e.start_time ASC, e.id ASC;
    `;
    const { rows } = await pool.query(query, [childId]);
    return rows.map(mapEventRow);
  },

  // Looks up active youth profiles assigned to this worker via the junction table
  getAssignedYouthList: async (workerId) => {
    const query = `
      SELECT 
        yp.id::int    AS "id",
        yp.full_name  AS "name"
      FROM public.youth_profiles yp
      JOIN public.worker_youth_assignments wya ON wya.youth_id = yp.id
      WHERE wya.worker_id = $1
      ORDER BY yp.full_name ASC;
    `;
    const { rows } = await pool.query(query, [workerId]);
    return rows;
  },

  // Inserts an event and links the youth invite record
  createManualEvent: async (eventData) => {
    const { title, description, date, startTime, endTime, organizerId, youthId } = eventData;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const eventInsertQuery = `
        INSERT INTO public.events (title, description, event_date, start_time, end_time, organizer_id)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
      `;
      const eventRes = await client.query(eventInsertQuery, [
        title,
        description,
        date,
        startTime,
        endTime,
        organizerId,
      ]);
      const eventId = eventRes.rows[0].id;

      const inviteInsertQuery = `
        INSERT INTO public.event_youth_invites (event_id, youth_id, status)
        VALUES ($1, $2, 'PENDING');
      `;
      await client.query(inviteInsertQuery, [eventId, youthId]);

      await client.query("COMMIT");
      return eventId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Enforces that only the creator can drop the event records
  deleteManualEvent: async (eventId, requesterId) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ownershipCheck = await client.query(
        `SELECT id FROM public.events WHERE id = $1 AND organizer_id = $2;`,
        [eventId, requesterId]
      );

      if (ownershipCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return false;
      }

      // Cascade deletes invites, then drops primary event row
      await client.query(`DELETE FROM public.event_youth_invites WHERE event_id = $1;`, [eventId]);
      await client.query(`DELETE FROM public.events WHERE id = $1;`, [eventId]);

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  updateEventInviteStatus: async (eventId, childId, status) => {
    const normalizedStatus = status === 'accepted' ? 'CONFIRMED' : 'DECLINED';
    const result = await pool.query(
      `UPDATE public.event_youth_invites
       SET status = $1
       WHERE event_id = $2 AND youth_id = $3
       RETURNING event_id`,
      [normalizedStatus, eventId, childId]
    );
    return result.rowCount > 0;
  },
};
