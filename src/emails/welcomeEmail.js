/**
 * src/emails/welcomeEmail.js
 * HTML for the RollCall Rewards welcome email. Email clients have poor,
 * inconsistent CSS support (many strip <style> blocks entirely), so this
 * intentionally uses a simple table layout with inline styles rather than
 * the site's own stylesheet/classes — that's standard practice for email,
 * not a step backward from the rest of the codebase's approach.
 */
const env = require("../config/env");

function renderWelcomeEmail({ email }) {
  const menuUrl = `${env.SITE_URL}/menu`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to RollCall Rewards</title>
</head>
<body style="margin:0; padding:0; background-color:#FFF6E9; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF6E9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px; background-color:#FFFDF9; border-radius:16px; overflow:hidden; border:1px solid #E7D3AE;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1B120B; padding:28px 32px; text-align:center;">
              <span style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; font-weight:bold; color:#FFFDF9; letter-spacing:0.5px;">
                RollCall<span style="color:#E4432B;">Kitchen</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 8px; text-align:center;">
              <div style="font-size:40px; line-height:1; margin-bottom:12px;">&#127881;</div>
              <h1 style="margin:0 0 12px; font-size:24px; color:#241407;">You're in! 100 points, on us.</h1>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4A3826;">
                Thanks for joining RollCall Rewards. We've credited your account with
                <strong>100 welcome points</strong> — a head start toward free chaat,
                a free roll, or dollars off your next order.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px; text-align:center;">
              <a href="${menuUrl}" style="display:inline-block; background-color:#E4432B; color:#FFFDF9; text-decoration:none; font-weight:bold; font-size:15px; padding:14px 28px; border-radius:999px;">
                View The Menu
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px; text-align:center; border-top:1px dashed #E7D3AE;">
              <p style="margin:0 0 8px; font-size:13px; color:#4A3826;">
                &#128205; 9630 University City Blvd, Charlotte, NC 28213, Unit D
              </p>
              <p style="margin:0; font-size:12px; color:#8A7860;">
                You're receiving this because you signed up for RollCall Rewards with ${email}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { renderWelcomeEmail };