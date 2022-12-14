Inorder to start the app

Do these steps from root
1) npm install
2) npm run start # to start the app in production mode
3) npm run dev # to start the app in development mode

Way to configure .env file
Filed marked with ** are fields that are mandatory in .env

All the information related for JWT authorization should be provided

**JWT_SECRET // any randomized string
**JWT_EXPIRY // time to expire the token
**COOKIE_EXPIRY // time to expire the cookie

Data base is used of MongoDB

**MONGO_URI // uri can be of local installation of Mongodb or hosted via atlas

Media related to this project are stored on the cloudinary
Cloudinary account is needed and the keys should be provided in .env file

**CLOUDINARY_NAME
**CLOUDINARY_API_KEY
**CLOUDINARY_SECRET

Below fields are required for forgot password feature
 
**SMTP_HOST
**SMTP_PORT
**SMTP_USER
**SMTP_PASS