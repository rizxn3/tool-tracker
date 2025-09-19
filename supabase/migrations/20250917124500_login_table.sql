CREATE TABLE login ( 
  username TEXT PRIMARY KEY, 
  password TEXT NOT NULL 
); 

INSERT INTO login (username, password) 
VALUES ('admin123', '2233');