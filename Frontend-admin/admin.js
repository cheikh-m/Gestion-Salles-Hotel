const API_URL = 'http://192.168.1.454';

let calendrier; 
let salleSelectionnee = null; 
let reservationEnCours = null; 

document.addEventListener('DOMContentLoaded', async () => { 
  await chargerSalles(); 
  initialiserCalendrier(); 
});

async function chargerSalles() {
    try {
        const reponse = await fetch(`${API_URL}/api/salles`);
        const salles = await reponse.json();

        const conteneur = document.getElementById('liste-salles');
        // Optionnel : vider le conteneur avant d'ajouter les boutons
        conteneur.innerHTML = ''; 

        salles.forEach(salle => {
            const btn = document.createElement('button');
            btn.className = 'salle-btn';
            btn.textContent = salle.name;
            btn.onclick = () => selectionnerSalle(salle);
            conteneur.appendChild(btn);
        });

        if (salles.length > 0) {
            selectionnerSalle(salles[0]);
        }
    } catch (err) {
        console.error('Erreur chargement salles :', err);
        alert('Impossible de contacter l\'API. Vérifiez que le serveur est démarré.');
    }
}

async function selectionnerSalle(salle) { 
  salleSelectionnee = salle; 
  document.getElementById('salle-active').textContent = salle.name; 
    document.querySelectorAll('.salle-btn').forEach(b => 
b.classList.remove('active')); 
  event?.target?.classList.add('active');
    await chargerReservations(); 
}

function initialiserCalendrier() { 
  const el = document.getElementById('calendrier'); 
  calendrier = new FullCalendar.Calendar(el, { 
    initialView: 'timeGridWeek', 
    locale: 'fr', 
    headerToolbar: { 
      left:   'prev,next today', 
      center: 'title', 
      right:  'dayGridMonth,timeGridWeek,timeGridDay' 
    }, 
     slotMinTime: '07:00:00', 
    slotMaxTime: '21:00:00', 
    allDaySlot: false, 
    editable: true, 
    selectable: true, 
    eventColor: '#1A3A6B',
     select: (info) => { 
      ouvrirModalCreation(info.startStr, info.endStr); 
    },
      eventClick: (info) => { 
      ouvrirModalEdition(info.event); 
    },
     eventDrop: async (info) => { 
      await modifierReservation(info.event.id, { 
        title:      info.event.title, 
        start_time: info.event.startStr, 
        end_time:   info.event.endStr, 
      }); 
    } 
  }); 
  calendrier.render(); 
}

async function chargerReservations() { 
  if (!salleSelectionnee) return; 
  
  const reponse = await fetch( 
    `${API_URL}/api/salles/${salleSelectionnee.id}/reservations` 
  ); 
  const reservations = await reponse.json(); 
  
  // Convertir les données pour FullCalendar 
  const evenements = reservations.map(r => ({ 
    id:    r.id, 
    title: r.title,
     start: r.start_time, 
    end:   r.end_time, 
    extendedProps: { organizer: r.organizer } 
  })); 
  
  // Supprimer les anciens événements et ajouter les nouveaux 
  calendrier.removeAllEvents(); 
  evenements.forEach(e => calendrier.addEvent(e)); 
}

function ouvrirModalCreation(debut, fin) { 
  reservationEnCours = null; 
  document.getElementById('modal-titre').textContent = 'Nouvelle réservation'; 
  document.getElementById('reservation-id').value = ''; 
  document.getElementById('input-titre').value       = ''; 
  document.getElementById('input-debut').value       = debut.slice(0,16); 
  document.getElementById('input-fin').value         = fin.slice(0,16); 
  document.getElementById('input-organisateur').value = ''; 
  document.getElementById('btn-supprimer').style.display = 'none'; 
  document.getElementById('modal').classList.add('open'); 
}

function ouvrirModalEdition(event) { 
  reservationEnCours = event; 
  document.getElementById('modal-titre').textContent = 'Modifier la réservation'; 
  document.getElementById('reservation-id').value = event.id; 
  document.getElementById('input-titre').value       = event.title; 
  document.getElementById('input-debut').value       = 
event.startStr.slice(0,16); 
  document.getElementById('input-fin').value         = event.endStr.slice(0,16); 
  document.getElementById('input-organisateur').value = 
event.extendedProps.organizer || ''; 
  document.getElementById('btn-supprimer').style.display = 'inline-block'; 
  document.getElementById('modal').classList.add('open'); 
}
function fermerModal() { 
  document.getElementById('modal').classList.remove('open'); 
}

async function sauvegarder() { 
  const id          = document.getElementById('reservation-id').value; 
  const titre       = document.getElementById('input-titre').value.trim(); 
  const debut       = document.getElementById('input-debut').value; 
  const fin         = document.getElementById('input-fin').value; 
  const organisateur = document.getElementById('input-organisateur').value; 
  
  if (!titre || !debut || !fin) { 
    alert('Merci de remplir tous les champs obligatoires (*)'); 
    return; 
  }

   const donnees = { 
    room_id:    salleSelectionnee.id, 
  title:      titre, 
    start_time: debut + ':00', 
    end_time:   fin + ':00', 
    organizer:  organisateur 
  }; 
  
  if (id) { 
    // Modification 
    await modifierReservation(id, donnees); 
  } else { 
    // Création 
    await fetch(`${API_URL}/api/reservations`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(donnees) 
    }); 
  } 
  
  fermerModal(); 
  await chargerReservations(); 
}

async function modifierReservation(id, donnees) { 
  await fetch(`${API_URL}/api/reservations/${id}`, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(donnees) 
  });
  }

  async function supprimer() { 
  const id = document.getElementById('reservation-id').value; 
  if (!id || !confirm('Supprimer cette réservation ?')) return; 
  
  await fetch(`${API_URL}/api/reservations/${id}`, { method: 'DELETE' }); 
  fermerModal(); 
  await chargerReservations();
  } 