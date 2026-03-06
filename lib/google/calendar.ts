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

  const requestId = crypto.randomUUID();

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
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
      attendees: (input.attendeeEmails ?? []).map((email) => ({ email })),
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
