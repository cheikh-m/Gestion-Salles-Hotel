const Database = require('better-sqlite3');
const db = new Database('hotel.db');
db.pragma('foreign_keys = ON');
db.exec(`
    CREATE TABLE IF NOT EXISTS rooms(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT       NOT NULL,
    capacity     INTEGER DEFAULT 10
    );
    
    CREATE TABLE IF NOT EXISTS bookings(
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     room_id      INTEGER     NOT NULL,
     title        TEXT        NOT NULL,
     start_time   TEXT       NOT NULL,
    end_time      TEXT        NOT NULL,
    organizer     TEXT        DEFAULT 'Reception',
    FOREIGN KEY (room_id)     REFERENCES rooms(id)
    );
    
    `);

const count = db.prepare('SELECT COUNT(*) as n FROM rooms').get();
if (count.n === 0) {
    const insert = db.prepare(`INSERT INTO rooms (name, capacity) VALUES (?, ?)`);
    insert.run('salle Dakar', 10);
    insert.run('salle Conakry', 8);
    insert.run('salle Libreville', 15);
    insert.run('salle Delta', 6);
    insert.run('salle Echo', 20);
    console.log('5 salles créées avec succes');
}

module.exports = db;