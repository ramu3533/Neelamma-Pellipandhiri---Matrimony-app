CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    location VARCHAR(100),
    education VARCHAR(100),
    profession VARCHAR(100),
    height VARCHAR(20),
    marital_status VARCHAR(20),
    religion VARCHAR(50),
    mother_tongue VARCHAR(50),
    about_me TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(user_id),
    name VARCHAR(100) NOT NULL,
    age INT,
    location VARCHAR(100),
    education VARCHAR(100),
    profession VARCHAR(100),
    image VARCHAR(255),
    interests TEXT[]
);

CREATE TABLE success_stories (
    story_id SERIAL PRIMARY KEY,
    names VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    marriage_date VARCHAR(50),
    story TEXT,
    image VARCHAR(255),
    testimonial TEXT
);

CREATE TABLE contact_messages (
    message_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(100),
    message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for profiles
INSERT INTO profiles (name, age, location, education, profession, image, interests) VALUES
('Priya Sharma', 26, 'Hyderabad', 'B.Tech - IT', 'Software Engineer', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', '{"Travel", "Reading", "Music"}'),
('Anitha Reddy', 24, 'Bangalore', 'MBA - Finance', 'Business Analyst', 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400', '{"Cooking", "Dance", "Photography"}'),
('Kavitha Goud', 28, 'Chennai', 'M.Sc - Biotechnology', 'Research Scientist', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400', '{"Research", "Yoga", "Nature"}'),
('Lakshmi Devi', 25, 'Mumbai', 'B.Com - Accounting', 'Chartered Accountant', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400', '{"Finance", "Travel", "Art"}'),
('Sunitha Goud', 27, 'Pune', 'B.E - Civil', 'Civil Engineer', 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400', '{"Architecture", "Fitness", "Movies"}'),
('Madhavi Rao', 29, 'Delhi', 'M.A - English', 'Content Writer', 'https://images.pexels.com/photos/1580273/pexels-photo-1580273.jpeg?auto=compress&cs=tinysrgb&w=400', '{"Writing", "Literature", "Theater"}');

-- Insert sample data for success stories
INSERT INTO success_stories (names, location, marriage_date, story, image, testimonial) VALUES
('Priya & Rajesh', 'Hyderabad', 'December 2024', 'We met through Goud''s Matrimony in early 2024. What started as a simple conversation turned into a beautiful journey of love. The platform made it so easy to connect with someone who truly understood our values and dreams.', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800', 'Goud''s Matrimony didn''t just help us find a life partner, they helped us find our best friend and soulmate.'),
('Anitha & Suresh', 'Bangalore', 'October 2024', 'After meeting several potential matches through other platforms, we were losing hope. Then we found each other on Goud''s Matrimony. The detailed profiles and personalized matching made all the difference.', 'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=800', 'The verification process and genuine profiles on this platform gave us confidence in our search.'),
('Kavitha & Venkat', 'Chennai', 'August 2024', 'Being working professionals, we had limited time for traditional matchmaking. Goud''s Matrimony''s efficient system helped us find each other quickly. We connected over our shared love for travel and adventure.', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800', 'The mobile app made it so convenient to browse profiles and communicate even with our busy schedules.'),
('Lakshmi & Arun', 'Mumbai', 'September 2024', 'We were both a bit skeptical about online matrimony initially. But the personal attention from the Goud''s Matrimony team and their understanding of our family values convinced us. We''re so grateful we gave it a chance!', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=800', 'The customer support team guided us throughout the process and made our journey so smooth.'),
('Sunitha & Krishna', 'Pune', 'November 2024', 'Distance was initially a concern for us as we were in different cities. But love knows no boundaries! The platform''s video chat feature helped us get to know each other better before meeting in person.', 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=800', 'Technology brought us together, but it was our shared values that made us perfect for each other.'),
('Madhavi & Ramesh', 'Delhi', 'July 2024', 'As a single parent, finding someone who would accept both me and my child was challenging. Goud''s Matrimony helped me find not just a husband, but a wonderful father figure for my daughter.', 'https://images.pexels.com/photos/1580273/pexels-photo-1580273.jpeg?auto=compress&cs=tinysrgb&w=800', 'This platform understands that every love story is unique and provides support for all kinds of relationships.');

-- Table to store interest requests between users
CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(user_id),
    receiver_id INT NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_interest UNIQUE (sender_id, receiver_id)
);

-- Table to store chat conversations
CREATE TABLE conversations (
    conversation_id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL REFERENCES users(user_id),
    user2_id INT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Table to store individual chat messages
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES conversations(conversation_id),
    sender_id INT NOT NULL REFERENCES users(user_id),
    receiver_id INT NOT NULL REFERENCES users(user_id),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Table to store profile likes
CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    liker_id INT NOT NULL REFERENCES users(user_id), -- The user who is doing the liking
    liked_id INT NOT NULL REFERENCES users(user_id), -- The user whose profile was liked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_like UNIQUE (liker_id, liked_id)
);
-- First, remove the old 'image' column from the profiles table
ALTER TABLE profiles DROP COLUMN image;

-- Then, create a new table to store multiple images for each user
CREATE TABLE profile_images (
    image_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Add the main profile image column back to the profiles table
ALTER TABLE profiles ADD COLUMN image VARCHAR(255);

-- Add columns to track subscription status and profile views
ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN profile_views_count INT DEFAULT 0;


-- (Keep all existing content in this file and add these lines at the end)

-- Add columns for OTP verification and user activation
ALTER TABLE users ADD COLUMN otp VARCHAR(10);
ALTER TABLE users ADD COLUMN otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;