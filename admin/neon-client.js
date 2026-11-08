/* WordPress-only Neon SDK client. No Halal Food Supabase imports or credentials. */
(() => {
  "use strict";
  const AUTH_URL = "https://ep-wild-lab-a1jqqu0p.neonauth.ap-southeast-1.aws.neon.tech/halal_food_db/auth";
  const DATA_API_URL = "https://ep-wild-lab-a1jqqu0p.apirest.ap-southeast-1.aws.neon.tech/halal_food_db/rest/v1";
  const init = import("https://esm.sh/@neondatabase/neon-js").then(({ createClient }) => {
    const client = createClient({
      auth: {
        url: AUTH_URL,
        allowAnonymous: true,
        fetchOptions: { credentials: "include" }
      },
      dataApi: {
        url: DATA_API_URL,
        options: { db: { schema: "builder" } }
      }
    });
    window.WPNeonClient = client;
    return client;
  });
  window.WPNeonClientReady = init;
  window.WPAuthReady = init.then(async client => {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data || null;
  });
})();