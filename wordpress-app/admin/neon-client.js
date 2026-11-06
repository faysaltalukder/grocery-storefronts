/* WordPress-only Neon client. No Halal Food Supabase imports or credentials. */
(() => {
  "use strict";
  const DATABASE_URL = "https://ep-wild-lab-a1jqqu0p.ap-southeast-1.aws.neon.tech/halal_food_db";
  const init = import("https://esm.sh/@neon/neon-js").then(({ createClient }) => {
    const client = createClient(DATABASE_URL, {
      auth: { allowAnonymous: true, fetchOptions: { credentials: "include" } }
    });
    window.WPNeonClient = client;
    return client;
  });
  window.WPNeonClientReady = init;
  window.WPAuthReady = init.then(async client => {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  });
})();