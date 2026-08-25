/**
 * src/emails/loginLinkEmail.js
 * HTML for the RollCall Rewards magic-link sign-in email. Same table-based,
 * inline-styled approach as welcomeEmail.js — see that file's comment for why.
 */
function renderLoginLinkEmail({ loginUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to RollCall Rewards</title>
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
              <div style="font-size:40px; line-height:1; margin-bottom:12px;">&#128274;</div>
              <h1 style="margin:0 0 12px; font-size:24px; color:#241407;">Sign in to RollCall Rewards</h1>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4A3826;">
                Tap the button below to sign in and see your points balance.
                This link works once and expires in 15 minutes.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 16px; text-align:center;">
              <a href="${loginUrl}" style="display:inline-block; background-color:#E4432B; color:#FFFDF9; text-decoration:none; font-weight:bold; font-size:15px; padding:14px 28px; border-radius:999px;">
                Sign In &amp; Check My Points
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#8A7860;">
                Didn't request this? You can safely ignore this email.
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

module.exports = { renderLoginLinkEmail };