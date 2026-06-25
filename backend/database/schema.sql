CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
  worker_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  conversation_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  worker_id INT REFERENCES workers(worker_id),
  status VARCHAR(50) DEFAULT 'open',
  mode VARCHAR(50) DEFAULT 'human',
  needs_handover BOOLEAN DEFAULT false,
  risk_level VARCHAR(50) DEFAULT 'low',
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  message_id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL,
  sender_id INT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS summaries (
  summary_id SERIAL PRIMARY KEY,
  conversation_id INT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  urgency_level VARCHAR(50),
  recommended_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
