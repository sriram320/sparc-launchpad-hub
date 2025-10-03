# AWS Production Setup for SPARC Launchpad Hub

## 🎯 Complete Step-by-Step AWS Setup

### Prerequisites Checklist
- [ ] AWS Account created
- [ ] AWS CLI installed
- [ ] Credit card added to AWS account (for production services)

## Step 1: AWS Cognito (Authentication) 🔐

### 1.1 Create User Pool
1. Go to **AWS Console → Cognito → User Pools**
2. Click **"Create user pool"**
3. **Step 1 - Configure sign-in experience:**
   - Sign-in options: ✅ Email, ✅ Phone number
   - Cognito user pool sign-in options: ✅ Email, ✅ Phone number
4. **Step 2 - Configure security requirements:**
   - Password policy: Minimum 8 characters, require uppercase, numbers
   - Multi-factor authentication: Optional (recommended: SMS)
5. **Step 3 - Configure sign-up experience:**
   - Self-service sign-up: Enable
   - Required attributes: email, name, phone_number
6. **Step 4 - Configure message delivery:**
   - Email provider: Use Cognito (for now)
   - SMS: Default settings
7. **Step 5 - Integrate your app:**
   - User pool name: `sparc-launchpad-users`
   - App client name: `sparc-web-client`
   - Client secret: ❌ Don't generate (for web apps)
8. **Review and create**
9. **📝 SAVE THESE VALUES:**
   - User Pool ID: `us-east-1_xxxxxxxxx`
   - App Client ID: `xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.2 Configure User Groups
1. In your User Pool → **Groups**
2. Create group: `member` (description: Regular users)
3. Create group: `host` (description: Event organizers)

### 1.3 Set up OAuth Providers
1. **In User Pool → Sign-in experience → Federated identity provider sign-in**
2. Add **Google**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create project → APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Authorized redirect URIs: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - Copy Client ID and Secret to Cognito
3. Add **Microsoft**:
   - Go to [Azure Portal](https://portal.azure.com) → App Registrations
   - Register new application
   - Add redirect URI: `https://your-cognito-domain.auth.region.amazoncognito.com/oauth2/idpresponse`
   - Copy Client ID and Secret to Cognito

## Step 2: AWS S3 (File Storage) 📁

### 2.1 Create S3 Buckets
Create these 3 buckets:

1. **Gallery Bucket**: `sparc-gallery-[your-unique-suffix]`
2. **QR Codes Bucket**: `sparc-qrcodes-[your-unique-suffix]`  
3. **Profile Pictures Bucket**: `sparc-profilepics-[your-unique-suffix]`

### 2.2 Configure Each Bucket
For **each bucket**:
1. **Block public access**: Uncheck "Block all public access" (we'll use specific policies)
2. **CORS Configuration**:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```
3. **Bucket Policy** (for gallery - public read):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::sparc-gallery-[your-suffix]/*"
        }
    ]
}
```

## Step 3: AWS RDS (Database) 🗄️

### 3.1 Create PostgreSQL Database
1. **AWS Console → RDS → Create database**
2. **Engine options**: PostgreSQL
3. **Templates**: Free tier (for testing) / Production (for live)
4. **Settings**:
   - DB instance identifier: `sparc-launchpad-db`
   - Master username: `postgres`
   - Master password: `[create strong password]`
5. **DB instance class**: db.t3.micro (free tier)
6. **Storage**: 20 GB (free tier)
7. **Connectivity**:
   - VPC: Default
   - Public access: Yes (for development)
   - VPC security group: Create new
8. **Database authentication**: Password authentication
9. **Additional configuration**:
   - Initial database name: `sparc_db`
10. **📝 SAVE THESE VALUES:**
    - Endpoint: `sparc-launchpad-db.xxxxx.region.rds.amazonaws.com`
    - Port: `5432`
    - Username: `postgres`
    - Password: `[your-password]`

## Step 4: AWS SES (Email Service) 📧

### 4.1 Set up SES
1. **AWS Console → SES**
2. **Verify email address**:
   - Add your sending email (e.g., `noreply@yourdomain.com`)
   - Check email and click verification link
3. **Request production access** (removes sending limits):
   - SES → Account dashboard → Request production access
   - Fill out the form explaining your use case

### 4.2 Create Email Templates
1. **SES → Configuration → Email templates**
2. Create template: `email-verification`
```html
Subject: Verify your SPARC account
Body: 
<h2>Welcome to SPARC Launchpad!</h2>
<p>Please verify your email by entering this code: <strong>{{code}}</strong></p>
```

## Step 5: AWS SNS (SMS Service) 📱

### 5.1 Set up SNS for SMS
1. **AWS Console → SNS**
2. **SMS messaging → Text messaging preferences**
3. **Request production access** for SMS (removes limits)
4. Set spending limit and default message type

## Step 6: IAM Permissions 🔑

### 6.1 Create IAM Policy
1. **AWS Console → IAM → Policies → Create policy**
2. **Policy name**: `SPARCLaunchpadPolicy`
3. **JSON Policy**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:*",
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "ses:SendEmail",
                "ses:SendTemplatedEmail",
                "sns:Publish",
                "rds:DescribeDBInstances"
            ],
            "Resource": "*"
        }
    ]
}
```

### 6.2 Create IAM User
1. **IAM → Users → Create user**
2. **Username**: `sparc-backend-user`
3. **Attach policy**: `SPARCLaunchpadPolicy`
4. **📝 SAVE THESE VALUES:**
   - Access Key ID: `AKIAXXXXXXXXXXXXXXXXX`
   - Secret Access Key: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 7: Update Environment Files 📝

### 7.1 Update Backend .env
Replace your backend `.env` with real AWS values:

```env
# Database (RDS)
POSTGRES_SERVER=sparc-launchpad-db.xxxxx.us-east-1.rds.amazonaws.com
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[your-rds-password]
POSTGRES_DB=sparc_db

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[your-access-key]
AWS_SECRET_ACCESS_KEY=[your-secret-access-key]

# S3 Buckets
S3_BUCKET_GALLERY=sparc-gallery-[your-suffix]
S3_BUCKET_QRCODES=sparc-qrcodes-[your-suffix]
S3_BUCKET_PROFILEPICS=sparc-profilepics-[your-suffix]

# Cognito
COGNITO_USER_POOL_ID=[your-user-pool-id]
COGNITO_CLIENT_ID=[your-client-id]

# SES
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# OAuth (from Step 1.3)
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
MICROSOFT_CLIENT_ID=[your-microsoft-client-id]
MICROSOFT_CLIENT_SECRET=[your-microsoft-client-secret]

# Disable dev mode for production
DEV_AUTH=false
```

## Step 8: Test the Setup 🧪

### 8.1 Test Backend Connection
```bash
cd backend
python -m pytest tests/
```

### 8.2 Test Frontend Integration
```bash
cd frontend
npm run dev
```

### 8.3 Test Each Service:
- [ ] User registration with email verification
- [ ] User login with Cognito
- [ ] Google/Microsoft OAuth
- [ ] File upload to S3
- [ ] QR code generation and storage
- [ ] Phone verification (if implemented)

## Step 9: AWS Amplify (Frontend Hosting) 🚀

### 9.1 Set up Amplify Hosting
1. **AWS Console → Amplify → Get Started**
2. **Host your web app** → Get Started
3. **Connect your repository**:
   - Choose **GitHub** (or your git provider)
   - Authorize AWS Amplify to access your repo
   - Select your `sparc-launchpad-hub` repository
   - Branch: `main` or `master`

### 9.2 Configure Build Settings
1. **App name**: `sparc-launchpad-hub`
2. **Environment**: `production`
3. **Build settings** - Amplify should auto-detect, but verify:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 9.3 Environment Variables in Amplify
Add these environment variables in **Amplify Console → App Settings → Environment Variables**:
```
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=[your-user-pool-id]
VITE_COGNITO_CLIENT_ID=[your-client-id]
VITE_GOOGLE_CLIENT_ID=[your-google-client-id]
VITE_MICROSOFT_CLIENT_ID=[your-microsoft-client-id]
```

### 9.4 Custom Domain (Optional)
1. **Domain management → Add domain**
2. Enter your domain (e.g., `sparclaunchpad.com`)
3. Configure DNS (Amplify will provide instructions)
4. SSL certificate will be automatically provisioned

### 9.5 Continuous Deployment
- ✅ **Auto-deploy on push** to main branch
- ✅ **Preview deployments** for pull requests
- ✅ **Branch-based deployments** for staging

## Step 10: AWS Elastic Beanstalk (Backend Deployment) 🖥️

### 10.1 Prepare Backend for Deployment
1. **Create `Dockerrun.aws.json`** in your backend folder:
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "your-account.dkr.ecr.us-east-1.amazonaws.com/sparc-backend",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8000"
    }
  ]
}
```

### 10.2 Set up Elastic Beanstalk
1. **AWS Console → Elastic Beanstalk**
2. **Create Application**:
   - Application name: `sparc-launchpad-backend`
   - Platform: Docker
   - Platform version: Latest
3. **Environment**:
   - Environment name: `sparc-backend-prod`
   - Domain: `sparc-backend-prod` (will become sparc-backend-prod.region.elasticbeanstalk.com)

### 10.3 Configure Environment Variables
In **Elastic Beanstalk → Configuration → Software**:
```
POSTGRES_SERVER=[your-rds-endpoint]
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[your-rds-password]
POSTGRES_DB=sparc_db
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[your-access-key]
AWS_SECRET_ACCESS_KEY=[your-secret-key]
S3_BUCKET_GALLERY=[your-gallery-bucket]
S3_BUCKET_QRCODES=[your-qrcodes-bucket]
S3_BUCKET_PROFILEPICS=[your-profilepics-bucket]
COGNITO_USER_POOL_ID=[your-user-pool-id]
COGNITO_CLIENT_ID=[your-client-id]
```

### 10.4 Alternative: AWS ECS/Fargate (Advanced)
If you prefer containerized deployment:
1. **Push Docker image to ECR**
2. **Create ECS Cluster**
3. **Define Task Definition**
4. **Create Service with Load Balancer**

## Step 11: Production Domain Setup 🌐

### 11.1 Domain Configuration
1. **Register domain** or use existing
2. **AWS Route 53** for DNS management
3. **Configure A records**:
   - Frontend: Points to Amplify
   - Backend API: Points to Elastic Beanstalk or ALB

### 11.2 SSL Certificates
- **Frontend**: Amplify auto-provisions SSL
- **Backend**: Elastic Beanstalk can use AWS Certificate Manager

### 11.3 Update CORS and Redirect URLs
Update all redirect URLs to use your production domains:
- **Cognito App Client**: `https://yourdomain.com/auth/callback`
- **Google OAuth**: `https://yourdomain.com/auth/google/callback`
- **Microsoft OAuth**: `https://yourdomain.com/auth/microsoft/callback`
- **Backend CORS**: Add `https://yourdomain.com` to allowed origins

## 📋 Final Checklist

### AWS Services Setup
- [ ] AWS Amplify - Frontend hosting configured
- [ ] AWS Cognito - User pools and app clients created
- [ ] AWS S3 - Three buckets created with proper CORS
- [ ] AWS RDS - PostgreSQL database running
- [ ] AWS SES - Email service verified and configured
- [ ] AWS SNS - SMS service configured (if needed)
- [ ] AWS Elastic Beanstalk - Backend API deployed
- [ ] IAM user created with proper permissions

### Configuration & Testing
- [ ] Environment variables updated with real AWS values
- [ ] Frontend deployed to Amplify with custom domain
- [ ] Backend deployed to Elastic Beanstalk
- [ ] Database migrations applied to RDS
- [ ] CORS and OAuth redirect URLs updated for production
- [ ] Backend tests passing
- [ ] Frontend connecting to real backend API
- [ ] User registration with email verification working
- [ ] Social login (Google/Microsoft) working
- [ ] File uploads to S3 working
- [ ] QR code generation and storage working
- [ ] Event management system working
- [ ] Attendance management system working

## 💰 Cost Estimates (Monthly)

**Development/Testing:**
- AWS Amplify (frontend): Free tier (1000 build minutes)
- Elastic Beanstalk (backend): ~$10-15 (t3.micro)
- RDS (db.t3.micro): ~$15-20
- S3: ~$1-5
- SES: ~$1
- SNS: ~$1
- Cognito: Free tier usually sufficient
- Route 53: ~$0.50 per hosted zone
- **Total**: ~$28-42/month

**Production (depends on usage):**
- AWS Amplify: $1-20+ (traffic-based)
- Elastic Beanstalk: $15-100+ (instance size)
- RDS: $15-100+ (instance size)
- S3: $5-50+ (storage & requests)
- SES: $1-10+ (email volume)
- SNS: $1-10+ (SMS volume)
- Cognito: $0-50+ (MAU-based)
- Route 53: $0.50-2+ (hosted zones)
- **Total**: $38-300+/month

## 🆘 Support

If you encounter any issues:
1. Check AWS service health status
2. Verify IAM permissions
3. Check CloudWatch logs
4. Test with AWS CLI commands
5. Review the original documentation in `/docs/aws-setup-guide.md`