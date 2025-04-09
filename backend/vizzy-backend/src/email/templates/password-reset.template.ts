export const passwordResetTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Vizzy Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eaeaea;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 15px;
    }
    .content {
      padding: 30px 20px;
    }
    h1 {
      color: #2DCC70;
      margin-top: 0;
      font-size: 24px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eaeaea;
    }
    .button {
      display: inline-block;
      background-color: #2DCC70;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background-color: #25a75c;
      color: #000000;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://pblciirmszmcndmaxcvo.supabase.co/storage/v1/object/public/app//vizzy-logo.png" alt="Vizzy Logo"
        class="logo">
    </div>
    
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>You've requested to reset your password for your Vizzy account. Click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="{{resetLink}}" class="button">Reset Password</a>
      </div>
      
      <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>For security reasons, this link will expire in 24 hours.</p>
      <p>Best regards,<br>The Vizzy Team</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Vizzy. All rights reserved.</p>
      <p>This email was sent to you because a password reset was requested for your account.</p>
    </div>
  </div>
</body>
</html>`;
