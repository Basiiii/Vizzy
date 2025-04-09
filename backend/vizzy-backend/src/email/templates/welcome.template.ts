/**
 * Email template for welcoming new users to Vizzy.
 *
 * Template variables:
 * - {{username}}: The user's name or username to personalize the greeting
 */
export const welcomeTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Vizzy</title>
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
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #2DCC70;
      text-decoration: none;
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
      <h1>Welcome to Vizzy, {{username}}!</h1>
      <p>We're excited to have you on board. Vizzy is designed to help you visualize and manage your data effectively.
      </p>
      <p>Here are a few things you can do to get started:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore the dashboard</li>
        <li>Create your first visualization</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="#" class="button">Get Started</a>
      </div>
      
      <p>If you have any questions or need assistance, our support team is always ready to help!</p>
      <p>Best regards,<br>The Vizzy Team</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Vizzy. All rights reserved.</p>
      <div class="social-links">
        <a href="#">Twitter</a> |
        <a href="#">LinkedIn</a> |
        <a href="#">Facebook</a>
      </div>
      <p>You received this email because you signed up for Vizzy.</p>
    </div>
  </div>
</body>
</html>`;
