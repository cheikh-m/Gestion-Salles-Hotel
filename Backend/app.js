const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;




app.use(express.json());
app.use(cors()); 


app.get('/api/salles', (req, res) => {
const salles = db.prepare('SELECT * FROM rooms').all();
res.json(salles);
});


app.get('/api/salles/:id/reservations', (req, res) => {
const { id } = req.params;
const reservations = db.prepare(
'SELECT * FROM bookings WHERE room_id = ? ORDER BY start_time ASC'
).all(id);
res.json(reservations);
res.status(201).json(nouvelleReservation);
});


app.get('/api/reservations', (req, res) => {
const reservations = db.prepare(
    'SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id'
).all();
res.json(reservations);
});


app.post('/api/reservations', (req, res) => {
    const { room_id, title, start_time, end_time, organizer } = req.body;
    const stmt = db.prepare('INSERT INTO bookings (room_id, title, start_time, end_time, organizer) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(room_id, title, start_time, end_time, organizer);
    const nouvelleReservation = {id: info.lastInsertRowid,room_id,title,start_time,end_time,organizer}
    res.json({ message: "Réservation réussie !", id: info.lastInsertRowid });
});

app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const { title, start_time, end_time, organizer,  } = req.body;

    db.prepare(
     'UPDATE bookings SET title=?, start_time=?, end_time=?, organizer=? WHERE id=?'
    ).run(title, start_time, end_time, organizer,id);
    res.json({message: 'reservation modifiée'});
});

app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    res.json({ message: 'Reservations supprimée' }); 
});

app.listen(PORT, () => {
    console.log('API démarée sur http://localhost:' + PORT);
});




