const API_URL       = 'http://192.168.1.454';  
const REFRESH_MS    = 15000;

const params  = new URLSearchParams(window.location.search); 
const SALLE_ID = params.get('salle') || '1';

function mettreAJourHorloge() { 
  const maintenant = new Date(); 
  const heures  = maintenant.getHours().toString().padStart(2,'0'); 
  const minutes = maintenant.getMinutes().toString().padStart(2,'0'); 
  document.getElementById('horloge').textContent = `${heures}:${minutes}`; 
  
  const options = { weekday:'long', year:'numeric', month:'long', day:'numeric' 
}; 
  document.getElementById('date-ligne').textContent = 
    maintenant.toLocaleDateString('fr-FR', options); 
} 
setInterval(mettreAJourHorloge, 1000); 
mettreAJourHorloge();

async function actualiser() { 
  try {  const reponse = await fetch( 
      `${API_URL}/api/salles/${SALLE_ID}/reservations` 
    ); 
    const reservations = await reponse.json(); 
  
    // Cacher le message hors-ligne si on est de retour 
    document.getElementById('hors-ligne').classList.remove('visible'); 
  
    // Charger le nom de la salle (une seule fois) 
    if (document.getElementById('nom-salle').textContent === 'Chargement...') { 
      const r2 = await fetch(`${API_URL}/api/salles`); 
      const salles = await r2.json(); 
      const maSalle = salles.find(s => s.id == SALLE_ID); 
      if (maSalle) document.getElementById('nom-salle').textContent = 
maSalle.name; 
    }
     const maintenant = new Date(); 
       const enCours = reservations.find(r => { 
      const debut = new Date(r.start_time); 
      const fin   = new Date(r.end_time); 
      return maintenant >= debut && maintenant < fin; 
    });

     const prochaines = reservations 
      .filter(r => new Date(r.start_time) > maintenant) 
      .sort((a,b) => new Date(a.start_time) - new Date(b.start_time)) 
      .slice(0, 2); 

       if (enCours) { 
      const debut = new Date(enCours.start_time); 
      const fin   = new Date(enCours.end_time); 
      const hDebut = debut.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}); 
      const hFin   = fin.toLocaleTimeString('fr-FR',   {hour:'2-digit',minute:'2-digit'});

  document.getElementById('badge').className      = 'badge-statut badge-occupee'; 
      document.getElementById('badge').textContent    = 'EN COURS'; 
      document.getElementById('titre-reunion').textContent = enCours.title; 
      document.getElementById('horaires').textContent = `${hDebut} → ${hFin}`; 
      document.getElementById('organisateur').textContent = 
        enCours.organizer ? `Organisateur : ${enCours.organizer}` : '';

         const duree    = fin - debut; 
      const ecoule   = maintenant - debut; 
      const pourcent = Math.min(100, (ecoule / duree) * 100); 
      document.getElementById('barre').style.width = pourcent + '%';

        } else if (prochaines.length > 0) { 
      // Prochaine réunion dans moins d'1h → badge BIENTÔT 
      const prochaineDebut = new Date(prochaines[0].start_time);
        const diffMin = (prochaineDebut - maintenant) / 60000;
        
          if (diffMin < 60) { 
        const h = prochaineDebut.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); 
        document.getElementById('badge').className   = 'badge-statut badge-bientot'; 
        document.getElementById('badge').textContent = `RÉUNION À ${h}`; 
      } else { 
        document.getElementById('badge').className   = 'badge-statut badge-libre'; 
        document.getElementById('badge').textContent = 'DISPONIBLE';
         } 
      document.getElementById('titre-reunion').textContent = 'Salle libre'; 
      document.getElementById('horaires').textContent      = ''; 
      document.getElementById('organisateur').textContent  = ''; 
      document.getElementById('barre').style.width = '0%'; 

       } else { 
      document.getElementById('badge').className   = 'badge-statut badge-libre'; 
      document.getElementById('badge').textContent = 'DISPONIBLE'; 
      document.getElementById('titre-reunion').textContent = 'Salle libre'; 
      document.getElementById('horaires').textContent      = ''; 
      document.getElementById('organisateur').textContent  = ''; 
      document.getElementById('barre').style.width = '0%'; 
    }

     const liste = document.getElementById('liste-prochains'); 
    if (prochaines.length === 0) { 
      liste.innerHTML = '<p style="color:#6B7280;font-size:16px;">Aucune réunion prévue</p>'; 
    } else { 
      liste.innerHTML = prochaines.map(r => { 
        const h = new Date(r.start_time).toLocaleTimeString('fr-FR', 
          {hour:'2-digit',minute:'2-digit'}); 
        return `<div class='prochain-item'> 
          <span class='prochain-heure'>${h}</span> 
          <span>${r.title}</span> 
        </div>`; 
      }).join(''); 
    }
     } catch (err) { 
    // ── Mode hors-ligne ────────────────────────────────────────────── 
    console.error('Erreur réseau:', err); 
    document.getElementById('hors-ligne').classList.add('visible'); 
    // La page garde les dernières données affichées jusqu'au prochain refresh 
  } 
}
actualiser(); 
setInterval(actualiser, REFRESH_MS);
