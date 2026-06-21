const pool = require("../config/db");

module.exports = {
  // Compiles a timeline of events organized by the specific worker
  getCalendarHubFeed: async (workerId) => {
    const query = `
      SELECT DISTINCT ON (e.id)
        e.id::text                          AS "id",
        'manual'                            AS "origin",
        e.title                             AS "title",
        TO_CHAR(e.event_date, 'YYYY-MM-DD') AS "date",
        TO_CHAR(e.start_time, 'HH24:MI')    AS "startTime",
        TO_CHAR(e.end_time, 'HH24:MI')      AS "endTime",
        eyi.status                          AS "status", 
        yp.full_name                        AS "associatedChild",
        json_build_object('description', e.description)::text AS "extraContext"
      FROM public.events e
      JOIN public.event_youth_invites eyi ON eyi.event_id = e.id
      JOIN public.youth_profiles yp ON yp.id = eyi.youth_id
      WHERE e.organizer_id = $1  -- Only show events created by this worker
      ORDER BY e.id, "date" DESC, "startTime" DESC;
    `;
    const { rows } = await pool.query(query, [workerId]);
    return rows.map((row) => ({
      ...row,
      extraContext: row.extraContext ? JSON.parse(row.extraContext) : null,
    }));
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
};