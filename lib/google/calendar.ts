import { google } from "googleapis";

interface CreateMeetSessionInput {
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendeeEmails?: string[];
}

interface CreateMeetSessionResult {
  eventId: string;
  meetUrl: string | null;
}

// --- Shared calendar event creation logic ---
async function createCalendarEvent(
  calendar: ReturnType<typeof google.calendar>,
  input: CreateMeetSessionInput
): Promise<CreateMeetSessionResult> {
  const requestId = crypto.randomUUID();

  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description: input.description ?? "",
      start: {
        dateTime: input.start,
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: input.end,
        timeZone: "Asia/Tokyo",
      },
      attendees: (input.attendeeEmails ?? []).map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  return {
    eventId: event.data.id ?? "",
    meetUrl: event.data.conferenceData?.entryPoints?.[0]?.uri ?? null,
  };
}

// --- Service account version (legacy / fallback when no user token) ---
export async function createMeetSession(
  input: CreateMeetSessionInput
): Promise<CreateMeetSessionResult> {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
    subject: process.env.GOOGLE_IMPERSONATED_USER_EMAIL,
  });

  const calendar = google.calendar({ version: "v3", auth });
  return createCalendarEvent(calendar, input);
}

// --- User OAuth token version (preferred — creates Meet under the user's own Google account) ---
// Requires the user to have logged in with Google and granted the calendar.events scope.
export async function createMeetSessionWithToken(
  accessToken: string,
  input: CreateMeetSessionInput
): Promise<CreateMeetSessionResult> {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth });
  return createCalendarEvent(calendar, input);
}
